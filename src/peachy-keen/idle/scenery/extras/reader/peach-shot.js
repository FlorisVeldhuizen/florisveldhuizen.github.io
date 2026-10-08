import {
  Color,
  Group,
  DoubleSide,
  Matrix4,
  Mesh,
  OrthographicCamera,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  WebGLRenderTarget,
} from "three";

const SIZE = 512;
const OUT = 256;

const POSES = {
  back: [0, 0, 0],
  threeq: [0.05, 0.62, 0.04],
  threeqL: [0.05, -0.62, -0.04],
  side: [0.05, 1.3, 0],
  tilt: [0, 0.22, 0.24],
  above: [0.55, 0.15, 0],
};

const VERTEX = `
  varying vec3 vN;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const FRAGMENT = `
  uniform sampler2D map;
  uniform vec3 uTint;
  uniform float uRaw;
  varying vec3 vN;
  varying vec2 vUv;
  void main() {
    vec4 t = texture2D(map, vUv);
    vec3 base = mix(t.rgb, pow(t.rgb, vec3(2.2)), uRaw);
    float leaf = smoothstep(0.02, 0.12, base.g - base.r);
    vec3 n = normalize(vN) * (gl_FrontFacing ? 1.0 : -1.0);
    vec3 L = normalize(vec3(-0.5, 0.62, 0.62));
    float wrap = clamp((dot(n, L) + 0.45) / 1.45, 0.0, 1.0);
    vec3 skin = base * mix(uTint, vec3(1.0), leaf);
    skin = mix(skin, mix(vec3(1.0, 0.5, 0.36), skin, 0.5), 1.0 - leaf);
    vec3 col = skin * (0.22 + 1.0 * wrap * wrap);
    float facing = max(n.z, 0.0);
    col *= mix(vec3(0.55, 0.22, 0.28), vec3(1.0), mix(0.35 + 0.65 * sqrt(facing), 1.0, leaf));
    col = mix(col, col * vec3(1.0, 0.82, 0.78), (1.0 - wrap) * 0.5 * (1.0 - leaf));
    vec3 h = normalize(L + vec3(0.0, 0.0, 1.0));
    col += pow(max(dot(n, h), 0.0), 36.0) * 0.18 * (1.0 - leaf * 0.7);
    gl_FragColor = vec4(pow(max(col, 0.0), vec3(1.0 / 2.2)), 1.0);
  }
`;

function poseRenderer(renderer, geometry, map, tint, rel) {
  const material = new ShaderMaterial({
    uniforms: {
      map: { value: map },
      uTint: { value: new Color().copy(tint ?? new Color(1, 1, 1)) },
      uRaw: { value: map && map.colorSpace === SRGBColorSpace ? 0 : 1 },
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    side: DoubleSide,
  });
  const model = new Mesh(geometry, material);
  const scene = new Scene();
  const holder = new Group();
  holder.add(model);
  scene.add(holder);
  rel.decompose(model.position, model.quaternion, model.scale);
  const camera = new OrthographicCamera(-2.05, 2.05, 2.3, -1.8, 0.1, 50);
  camera.position.set(0, 0, 10);
  const target = new WebGLRenderTarget(SIZE, SIZE);
  const pixels = new Uint8Array(SIZE * SIZE * 4);
  const prevColor = new Color();
  let pbo = null;
  let sync = null;
  return {
    draw(name) {
      const [x, y, z] = POSES[name];
      const prevTarget = renderer.getRenderTarget();
      renderer.getClearColor(prevColor);
      const prevAlpha = renderer.getClearAlpha();
      try {
        renderer.setRenderTarget(target);
        renderer.setClearColor(0x000000, 0);
        holder.rotation.set(x, y, z);
        renderer.clear();
        renderer.render(scene, camera);
      } finally {
        renderer.setRenderTarget(prevTarget);
        renderer.setClearColor(prevColor, prevAlpha);
      }
    },
    fetch() {
      const gl = renderer.getContext();
      if (!gl.fenceSync) {
        renderer.readRenderTargetPixels(target, 0, 0, SIZE, SIZE, pixels);
        return;
      }
      if (pbo) gl.deleteBuffer(pbo);
      pbo = gl.createBuffer();
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
      gl.bufferData(gl.PIXEL_PACK_BUFFER, pixels.byteLength, gl.STREAM_READ);
      const prevTarget = renderer.getRenderTarget();
      renderer.setRenderTarget(target);
      gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, 0);
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
      renderer.setRenderTarget(prevTarget);
      sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
    },
    ready() {
      if (!sync) return true;
      const gl = renderer.getContext();
      const status = gl.clientWaitSync(sync, 0, 0);
      return status !== gl.TIMEOUT_EXPIRED;
    },
    collect() {
      if (!sync) return;
      const gl = renderer.getContext();
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
      gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, pixels);
      gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
      gl.deleteBuffer(pbo);
      gl.deleteSync(sync);
      sync = null;
      pbo = null;
    },
    read() {
      this.collect();
      const k = SIZE / OUT;
      const img = new ImageData(OUT, OUT);
      const d = img.data;
      for (let y = 0; y < OUT; y += 1)
        for (let x = 0; x < OUT; x += 1) {
          let r = 0;
          let g = 0;
          let b = 0;
          let a = 0;
          for (let dy = 0; dy < k; dy += 1) {
            const row = (SIZE - 1 - (y * k + dy)) * SIZE;
            for (let dx = 0; dx < k; dx += 1) {
              const i = (row + x * k + dx) * 4;
              const w = pixels[i + 3];
              r += pixels[i] * w;
              g += pixels[i + 1] * w;
              b += pixels[i + 2] * w;
              a += w;
            }
          }
          const o = (y * OUT + x) * 4;
          if (a > 0) {
            d[o] = r / a;
            d[o + 1] = g / a;
            d[o + 2] = b / a;
          }
          d[o + 3] = a / (k * k);
        }
      const out = document.createElement("canvas");
      out.width = OUT;
      out.height = OUT;
      out.getContext("2d").putImageData(img, 0, 0);
      out.pixels = img;
      return out;
    },
    dispose() {
      const gl = renderer.getContext();
      if (sync) gl.deleteSync(sync);
      if (pbo) gl.deleteBuffer(pbo);
      sync = null;
      pbo = null;
      target.dispose();
      material.dispose();
    },
  };
}

function relOf(ctx) {
  const source = ctx.peach.mesh;
  source.updateWorldMatrix(true, false);
  return new Matrix4()
    .copy(ctx.interaction.group.matrixWorld)
    .invert()
    .multiply(source.matrixWorld);
}

export default function peachRenderer(ctx) {
  const source = ctx.peach.mesh;
  return poseRenderer(
    ctx.renderer,
    source.geometry,
    source.material.map,
    source.material.color,
    relOf(ctx),
  );
}
