// Subtle dithered cloud texture background
// GPU-accelerated for zero performance impact

const CONFIG = {
  opacity: 0.15,
  speed: 0.0015,
  cloudScale: 0.002,
  ditherScale: 4.0,
};

class SubtleTexture {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
      opacity: ${CONFIG.opacity};
    `;
    document.body.insertBefore(this.canvas, document.body.firstChild);

    this.time = 0;
    this.setupWebGL();
    window.addEventListener("resize", () => this.resize());
    this.resize();
    this.animate();
  }

  setupWebGL() {
    const gl = this.canvas.getContext("webgl", { alpha: false });
    if (!gl) {
      this.gl = null;
      return;
    }

    this.gl = gl;

    // Simple vertex shader
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(
      vs,
      `
      attribute vec2 pos;
      void main() { gl_Position = vec4(pos, 0.0, 1.0); }
    `,
    );
    gl.compileShader(vs);

    // Fragment shader with cloud noise + dithering
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(
      fs,
      `
      precision mediump float;
      uniform float time;
      uniform float scale;
      uniform float dither;
      
      // Bayer dithering matrix
      float bayer(vec2 p) {
        vec2 m = floor(mod(p / dither, 4.0));
        float x = m.x, y = m.y;
        if (y < 0.5) {
          if (x < 0.5) return 0.0;
          if (x < 1.5) return 0.5;
          if (x < 2.5) return 0.125;
          return 0.625;
        }
        if (y < 1.5) {
          if (x < 0.5) return 0.75;
          if (x < 1.5) return 0.25;
          if (x < 2.5) return 0.875;
          return 0.375;
        }
        if (y < 2.5) {
          if (x < 0.5) return 0.1875;
          if (x < 1.5) return 0.6875;
          if (x < 2.5) return 0.0625;
          return 0.5625;
        }
        if (x < 0.5) return 0.9375;
        if (x < 1.5) return 0.4375;
        if (x < 2.5) return 0.8125;
        return 0.3125;
      }
      
      // Simple cloud noise
      float noise(vec2 p, float t) {
        return sin(p.x * scale + cos(p.y * scale * 0.7 + t) * 8.0) *
               cos(p.y * scale + sin(p.x * scale * 0.7 - t) * 8.0);
      }
      
      void main() {
        vec2 p = gl_FragCoord.xy;
        float t = time + sin(time * 0.06) * 8.0;
        
        // Drifting position
        vec2 drift = p + vec2(t * 8.0, t * 4.0);
        
        // Multi-layer clouds
        float c = noise(drift, t * 0.8) * 0.4 +
                  noise(drift * 1.5, t) * 0.3 +
                  noise(drift * 0.7, t * 0.6) * 0.3;
        
        // Normalize and apply dithering
        c = (c + 1.0) * 0.5;
        float d = step(bayer(p), c);
        
        // Binary output: background or cloud
        gl_FragColor = vec4(d > 0.5 ? vec3(0.65) : vec3(0.933), 1.0);
      }
    `,
    );
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      this.gl = null;
      return;
    }

    // Link program
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Setup quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const posLoc = gl.getAttribLocation(prog, "pos");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Store uniforms
    this.u = {
      time: gl.getUniformLocation(prog, "time"),
      scale: gl.getUniformLocation(prog, "scale"),
      dither: gl.getUniformLocation(prog, "dither"),
    };
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    if (this.gl) this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  draw() {
    if (!this.gl || !this.u) return;
    const { gl, u } = this;
    gl.uniform1f(u.time, this.time);
    gl.uniform1f(u.scale, CONFIG.cloudScale);
    gl.uniform1f(u.dither, CONFIG.ditherScale);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  animate() {
    this.time += CONFIG.speed;
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// Init
const init = () => new SubtleTexture();
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
