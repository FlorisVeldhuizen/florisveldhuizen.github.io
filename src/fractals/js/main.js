// Mandelbrot Fractal Explorer
// High-performance WebGL renderer with adaptive quality and progressive refinement

// ========== PERFORMANCE CONFIGURATION ==========
const PERFORMANCE_CONFIG = {
  progressiveSteps: 6,
  progressiveStepDelay: 20,

  activeInteraction: {
    iterationScale: 0.4,
    iterationMin: 200,
    dprByZoom: {
      deep: { threshold: 20, dpr: 0.5 },
      medium: { threshold: 10, dpr: 0.7 },
      shallow: { dpr: 0.9 },
    },
  },

  settlingInteraction: {
    dprByZoom: {
      veryDeep: { threshold: 30, dpr: 0.6 },
      deep: { threshold: 20, dpr: 0.8 },
      medium: { threshold: 10, dpr: 1.0 },
      shallow: { dpr: 1.3 },
    },
  },
};

class FractalRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl", { antialias: false });

    if (!this.gl) {
      throw new Error("WebGL not supported");
    }

    this.centerX = -0.5;
    this.centerY = 0.0;
    this.zoom = 4.0;
    this.maxIterations = 300;

    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.needsRender = true;
    this.isInteracting = false;
    this.isDraggingActive = false;
    this.isZoomingActive = false;
    this.interactionEndTimeout = null;
    this.progressiveQualityStep = 0;
    this.progressiveQualityTimeout = null;
    this.finalDPR = Math.min(window.devicePixelRatio || 1, 2.5);

    this.uiVisible = false;
    this.zoomDisplay = document.getElementById("zoom");
    this.iterationsDisplay = document.getElementById("iterations");
    this.statusDisplay = document.getElementById("status");
    this.infoPanel = document.getElementById("info");
    this.lastUIUpdate = 0;
    this.uiUpdateThrottle = 50;

    this.initWebGL();
    this.initEventListeners();
    this.resize();
    this.render();
    this.updateUI();
    this.startRenderLoop();
  }

  initWebGL() {
    const { gl } = this;

    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision highp float;
      
      uniform vec2 resolution;
      uniform vec2 center;
      uniform float zoom;
      uniform float maxIterations;
      uniform float colorNormalization;
      uniform float isInteracting;
      
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }
      
      void main() {
        vec2 uv = (gl_FragCoord.xy - resolution * 0.5) / min(resolution.x, resolution.y);
        vec2 c = center + uv * zoom;
        vec2 z = vec2(0.0);
        float iterations = 0.0;
        
        for (float i = 0.0; i < 50000.0; i++) {
          if (i >= maxIterations) break;
          
          float zx2 = z.x * z.x;
          float zy2 = z.y * z.y;
          float zxy = z.x * z.y;
          
          if (zx2 + zy2 > 4.0) {
            iterations = i - log2(log2(zx2 + zy2)) + 4.0;
            break;
          }
          
          z = vec2(zx2 - zy2 + c.x, zxy + zxy + c.y);
          iterations = i + 1.0;
        }
        
        if (iterations >= maxIterations) {
          if (isInteracting > 0.5) {
            float mag2 = dot(z, z);
            if (mag2 > 4.0) {
              float t = (maxIterations + log2(sqrt(mag2) * 0.5) * 10.0) / colorNormalization;
              float hue = mod(t * 360.0 + 200.0, 360.0) / 360.0;
              gl_FragColor = vec4(hsv2rgb(vec3(hue, 0.6, 0.5 + 0.35 * t)) * 0.5, 1.0);
            } else {
              gl_FragColor = vec4(vec3(sqrt(mag2) * 0.025), 1.0);
            }
          } else {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
          }
        } else {
          float t = iterations / colorNormalization;
          float hue = mod(t * 360.0 + 200.0, 360.0) / 360.0;
          float sat = 0.6 + 0.4 * sin(t * 3.14159 * 4.0);
          float val = 0.3 + 0.7 * t;
          gl_FragColor = vec4(hsv2rgb(vec3(hue, sat, val)), 1.0);
        }
      }
    `;

    const vertexShader = this.compileShader(
      gl.VERTEX_SHADER,
      vertexShaderSource,
    );
    const fragmentShader = this.compileShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );

    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw new Error(
        `Program link error: ${gl.getProgramInfoLog(this.program)}`,
      );
    }

    gl.useProgram(this.program);

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(this.program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    this.uniforms = {
      resolution: gl.getUniformLocation(this.program, "resolution"),
      center: gl.getUniformLocation(this.program, "center"),
      zoom: gl.getUniformLocation(this.program, "zoom"),
      maxIterations: gl.getUniformLocation(this.program, "maxIterations"),
      colorNormalization: gl.getUniformLocation(
        this.program,
        "colorNormalization",
      ),
      isInteracting: gl.getUniformLocation(this.program, "isInteracting"),
    };
  }

  compileShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader);
      this.gl.deleteShader(shader);
      throw new Error(`Shader compile error: ${error}`);
    }

    return shader;
  }

  getZoomLevel() {
    return Math.log2(3.5 / this.zoom);
  }

  getAdaptiveInteractionDPR() {
    const zoomLevel = this.getZoomLevel();

    if (this.isDraggingActive || this.isZoomingActive) {
      const cfg = PERFORMANCE_CONFIG.activeInteraction.dprByZoom;
      if (zoomLevel > cfg.deep.threshold) return cfg.deep.dpr;
      if (zoomLevel > cfg.medium.threshold) return cfg.medium.dpr;
      return cfg.shallow.dpr;
    }

    const cfg = PERFORMANCE_CONFIG.settlingInteraction.dprByZoom;
    if (zoomLevel > cfg.veryDeep.threshold) return cfg.veryDeep.dpr;
    if (zoomLevel > cfg.deep.threshold) return cfg.deep.dpr;
    if (zoomLevel > cfg.medium.threshold) return cfg.medium.dpr;
    return cfg.shallow.dpr;
  }

  getProgressiveDPR() {
    if (this.progressiveQualityStep === 0) {
      return this.finalDPR;
    }

    const lowDPR = this.getAdaptiveInteractionDPR();
    const highDPR = this.finalDPR;
    const progress =
      this.progressiveQualityStep / PERFORMANCE_CONFIG.progressiveSteps;

    return lowDPR + (highDPR - lowDPR) * progress;
  }

  static calculateIterations(zoomLevel) {
    const base = 300;
    let iterations = base + zoomLevel * 300;

    if (zoomLevel > 40) {
      iterations += (zoomLevel - 40) * 2000 + 1800 + 9000;
    } else if (zoomLevel > 25) {
      iterations += (zoomLevel - 25) * 1200 + 9000;
    } else if (zoomLevel > 10) {
      iterations += (zoomLevel - 10) * 600;
    }

    return Math.min(50000, Math.max(base, Math.floor(iterations)));
  }

  static getInteractionIterations(zoomLevel, maxIterations) {
    const exponent = 1 + zoomLevel * 0.02;
    const scale = Math.max(0.1, 0.9 ** exponent);
    const scaled = Math.floor(maxIterations * scale);
    return Math.max(300, Math.min(5000, scaled));
  }

  toggleUI() {
    this.uiVisible = !this.uiVisible;
    if (!this.infoPanel) return;

    this.infoPanel.classList.toggle("visible", this.uiVisible);
    if (this.uiVisible) {
      this.updateUI();
    }
  }

  static formatZoomText(zoomMultiplier) {
    if (zoomMultiplier < 10) return `${zoomMultiplier.toFixed(1)}x`;
    if (zoomMultiplier < 1000) return `${Math.floor(zoomMultiplier)}x`;
    if (zoomMultiplier < 1000000) {
      return `${(zoomMultiplier / 1000).toFixed(1)}Kx`;
    }
    return `${(zoomMultiplier / 1000000).toFixed(2)}Mx`;
  }

  updateStatus() {
    if (!this.statusDisplay) return;

    let status;
    let opacity;
    let color;

    if (this.progressiveQualityStep > 0) {
      const percent = Math.round(
        (this.progressiveQualityStep / PERFORMANCE_CONFIG.progressiveSteps) *
          100,
      );
      status = `Refining ${percent}%`;
      opacity = "1";
      color = "#4CAF50";
    } else if (this.isDraggingActive || this.isZoomingActive) {
      status = "Interactive";
      opacity = "0.8";
      color = "#FF9800";
    } else {
      status = "Full Quality";
      opacity = "0.6";
      color = "#2196F3";
    }

    this.statusDisplay.textContent = status;
    this.statusDisplay.style.opacity = opacity;
    this.statusDisplay.style.color = color;
  }

  updateUI() {
    if (!this.uiVisible || !this.zoomDisplay || !this.iterationsDisplay) return;

    const now = Date.now();
    if (now - this.lastUIUpdate < this.uiUpdateThrottle) return;
    this.lastUIUpdate = now;

    const zoomMultiplier = 2 ** this.getZoomLevel();
    this.zoomDisplay.textContent =
      FractalRenderer.formatZoomText(zoomMultiplier);
    this.iterationsDisplay.textContent = this.maxIterations.toLocaleString();
    this.updateStatus();
  }

  requestRender() {
    this.needsRender = true;
  }

  startInteraction() {
    const wasIdle = !this.isInteracting;

    clearTimeout(this.progressiveQualityTimeout);
    this.progressiveQualityTimeout = null;

    if (wasIdle) {
      this.isInteracting = true;
      this.progressiveQualityStep = 0;
      this.resize();
      this.requestRender();
    }

    clearTimeout(this.interactionEndTimeout);
  }

  endInteraction() {
    clearTimeout(this.interactionEndTimeout);
    this.interactionEndTimeout = setTimeout(() => {
      this.isInteracting = false;
      this.isDraggingActive = false;
      this.isZoomingActive = false;

      if (document.hasFocus()) {
        this.startProgressiveQuality();
      }
    }, 100);
  }

  startProgressiveQuality() {
    clearTimeout(this.progressiveQualityTimeout);
    this.progressiveQualityStep = 1;
    this.renderProgressiveQuality();
  }

  renderProgressiveQuality() {
    if (this.isInteracting) {
      this.progressiveQualityStep = 0;
      this.progressiveQualityTimeout = null;
      return;
    }

    if (this.progressiveQualityStep > PERFORMANCE_CONFIG.progressiveSteps) {
      this.progressiveQualityStep = 0;
      this.progressiveQualityTimeout = null;
      this.updateUI();
      return;
    }

    const isLastStep =
      this.progressiveQualityStep === PERFORMANCE_CONFIG.progressiveSteps;
    this.resize(isLastStep);
    this.requestRender();
    this.updateUI();

    if (!isLastStep) {
      this.progressiveQualityTimeout = setTimeout(() => {
        this.progressiveQualityStep += 1;
        this.renderProgressiveQuality();
      }, PERFORMANCE_CONFIG.progressiveStepDelay);
    } else {
      this.progressiveQualityStep = 0;
      this.progressiveQualityTimeout = null;
    }
  }

  handlePan(dx, dy, rect) {
    const aspect = rect.width / rect.height;
    this.centerX -= dx * this.zoom * aspect;
    this.centerY += dy * this.zoom;
    this.requestRender();
  }

  handleZoom(e, rect) {
    this.isZoomingActive = true;
    this.startInteraction();

    const mouseX = (e.clientX - rect.left) / rect.width;
    const mouseY = (e.clientY - rect.top) / rect.height;
    const aspect = rect.width / rect.height;

    const offsetX = (mouseX - 0.5) * this.zoom * aspect;
    const offsetY = (mouseY - 0.5) * this.zoom;
    const beforeX = this.centerX + offsetX;
    const beforeY = this.centerY - offsetY;

    const adaptiveScale = Math.max(0.3, Math.min(1.0, this.zoom / 3.5));
    const zoomDelta = e.deltaY > 0 ? 0.1 : -0.1;
    const adjustedZoomFactor = 1.0 + zoomDelta * adaptiveScale;

    this.zoom *= adjustedZoomFactor;

    this.centerX = beforeX - (mouseX - 0.5) * this.zoom * aspect;
    this.centerY = beforeY + (mouseY - 0.5) * this.zoom;

    this.maxIterations = FractalRenderer.calculateIterations(
      this.getZoomLevel(),
    );

    this.updateUI();
    this.requestRender();
    this.endInteraction();
  }

  initEventListeners() {
    const startDrag = (x, y) => {
      this.isDragging = true;
      this.isDraggingActive = true;
      this.lastMouseX = x;
      this.lastMouseY = y;
      this.startInteraction();
    };

    const moveDrag = (x, y) => {
      if (!this.isDragging) return;

      const rect = this.canvas.getBoundingClientRect();
      const dx = (x - this.lastMouseX) / rect.width;
      const dy = (y - this.lastMouseY) / rect.height;
      this.handlePan(dx, dy, rect);
      this.lastMouseX = x;
      this.lastMouseY = y;
    };

    const endDrag = () => {
      const wasInteracting = this.isDragging || this.isDraggingActive;
      this.isDragging = false;
      this.isDraggingActive = false;
      if (wasInteracting) {
        this.endInteraction();
      }
    };

    this.canvas.addEventListener("mousedown", (e) =>
      startDrag(e.clientX, e.clientY),
    );
    this.canvas.addEventListener("mousemove", (e) =>
      moveDrag(e.clientX, e.clientY),
    );
    this.canvas.addEventListener("mouseup", endDrag);
    this.canvas.addEventListener("mouseleave", endDrag);

    this.canvas.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
      },
      { passive: false },
    );

    this.canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
        moveDrag(e.touches[0].clientX, e.touches[0].clientY);
      },
      { passive: false },
    );

    this.canvas.addEventListener("touchend", endDrag);

    this.canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        this.handleZoom(e, this.canvas.getBoundingClientRect());
      },
      { passive: false },
    );

    const closeBtn = document.getElementById("close-info");
    const toggleBtn = document.getElementById("toggle-info");

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.toggleUI());
    }

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => this.toggleUI());
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "i" || e.key === "I") {
        this.toggleUI();
      }
    });

    window.addEventListener("resize", () => {
      this.resize();
      this.requestRender();
    });
  }

  resize(forceHighRes = false) {
    let dpr;

    if (this.progressiveQualityStep > 0) {
      dpr = this.getProgressiveDPR();
    } else if (this.isInteracting && !forceHighRes) {
      dpr = this.getAdaptiveInteractionDPR();
    } else {
      dpr = this.finalDPR;
    }

    const newWidth = Math.floor(window.innerWidth * dpr);
    const newHeight = Math.floor(window.innerHeight * dpr);

    if (this.canvas.width !== newWidth || this.canvas.height !== newHeight) {
      this.canvas.width = newWidth;
      this.canvas.height = newHeight;
      this.canvas.style.width = `${window.innerWidth}px`;
      this.canvas.style.height = `${window.innerHeight}px`;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.requestRender();
    }
  }

  startRenderLoop() {
    const renderFrame = () => {
      if (this.needsRender) {
        this.needsRender = false;
        this.render();
      }
      requestAnimationFrame(renderFrame);
    };
    requestAnimationFrame(renderFrame);
  }

  getEffectiveIterations() {
    const zoomLevel = this.getZoomLevel();

    if (this.isInteracting) {
      let iterations = FractalRenderer.getInteractionIterations(
        zoomLevel,
        this.maxIterations,
      );

      if (this.isDraggingActive || this.isZoomingActive) {
        const cfg = PERFORMANCE_CONFIG.activeInteraction;
        iterations = Math.min(
          iterations,
          Math.max(
            cfg.iterationMin,
            Math.floor(iterations * cfg.iterationScale),
          ),
        );
      }

      return iterations;
    }

    if (this.progressiveQualityStep > 0) {
      const lowIterations = FractalRenderer.getInteractionIterations(
        zoomLevel,
        this.maxIterations,
      );
      const progress =
        this.progressiveQualityStep / PERFORMANCE_CONFIG.progressiveSteps;
      return Math.floor(
        lowIterations + (this.maxIterations - lowIterations) * progress,
      );
    }

    return this.maxIterations;
  }

  render() {
    const { gl, uniforms } = this;
    const effectiveIterations = this.getEffectiveIterations();
    const isInteracting = this.isInteracting || this.progressiveQualityStep > 0;

    gl.uniform2f(uniforms.resolution, this.canvas.width, this.canvas.height);
    gl.uniform2f(uniforms.center, this.centerX, this.centerY);
    gl.uniform1f(uniforms.zoom, this.zoom);
    gl.uniform1f(uniforms.maxIterations, effectiveIterations);
    gl.uniform1f(uniforms.colorNormalization, this.maxIterations);
    gl.uniform1f(uniforms.isInteracting, isInteracting ? 1.0 : 0.0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");

  if (!canvas) {
    throw new Error("Canvas element not found!");
  }

  const renderer = new FractalRenderer(canvas);
  window.fractalRenderer = renderer;
});
