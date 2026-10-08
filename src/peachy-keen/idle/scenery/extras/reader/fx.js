import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Points,
  ShaderMaterial,
  Vector2,
} from "three";

const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const smooth = (x) => {
  const t = clamp01(x);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
export const easeOut = (x) => 1 - (1 - clamp01(x)) ** 3;
export const easeInOut = (x) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
};
export const rand = (a, b) => a + Math.random() * (b - a);
export const damp = (rate, dt) => 1 - Math.exp(-rate * dt);

const POINT_VERTEX = `
  attribute float aSize;
  attribute vec4 aColor;
  uniform float uScale;
  varying vec4 vColor;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uScale / -mv.z;
    vColor = aColor;
    gl_Position = projectionMatrix * mv;
  }
`;
const POINT_FRAGMENT = `
  varying vec4 vColor;
  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float d = dot(p, p);
    if (d > 1.0) discard;
    float g = exp(-d * 4.5) * (1.0 - d) + exp(-d * 40.0) * 0.8;
    gl_FragColor = vec4(vColor.rgb * g * vColor.a, 1.0);
  }
`;

const SIZE = new Vector2();

export class GlowPoints extends Points {
  constructor(capacity, { depthTest = true, order = 2 } = {}) {
    const geometry = new BufferGeometry();
    const pos = new BufferAttribute(new Float32Array(capacity * 3), 3);
    const size = new BufferAttribute(new Float32Array(capacity), 1);
    const color = new BufferAttribute(new Float32Array(capacity * 4), 4);
    [pos, size, color].forEach((a) => a.setUsage(35048));
    geometry.setAttribute("position", pos);
    geometry.setAttribute("aSize", size);
    geometry.setAttribute("aColor", color);
    geometry.setDrawRange(0, 0);
    super(
      geometry,
      new ShaderMaterial({
        uniforms: { uScale: { value: 800 } },
        vertexShader: POINT_VERTEX,
        fragmentShader: POINT_FRAGMENT,
        blending: AdditiveBlending,
        transparent: true,
        depthWrite: false,
        depthTest,
      }),
    );
    this.frustumCulled = false;
    this.renderOrder = order;
    this.n = 0;
    this.capacity = capacity;
  }

  begin() {
    this.n = 0;
  }

  push(p, size, color, alpha) {
    if (this.n >= this.capacity || alpha <= 0.002) return;
    const k = this.n;
    const g = this.geometry.attributes;
    g.position.array[k * 3] = p.x;
    g.position.array[k * 3 + 1] = p.y;
    g.position.array[k * 3 + 2] = p.z;
    g.aSize.array[k] = size;
    g.aColor.array[k * 4] = color.r;
    g.aColor.array[k * 4 + 1] = color.g;
    g.aColor.array[k * 4 + 2] = color.b;
    g.aColor.array[k * 4 + 3] = alpha;
    this.n += 1;
  }

  end(renderer, camera) {
    const g = this.geometry.attributes;
    g.position.needsUpdate = true;
    g.aSize.needsUpdate = true;
    g.aColor.needsUpdate = true;
    this.geometry.setDrawRange(0, this.n);
    const h = renderer.getDrawingBufferSize(SIZE).y;
    this.material.uniforms.uScale.value =
      h / (2 * Math.tan((camera.fov * Math.PI) / 360));
  }
}

export function chime(ctx, hz, { volume = 0.04, decay = 2.4, delay = 0 } = {}) {
  const ac = ctx.audio();
  if (ac.state !== "running") return;
  const t = ac.currentTime + delay;
  const out = ac.createGain();
  out.gain.value = volume;
  out.connect(ctx.audioOut());
  [
    [1, 1, 1],
    [2.76, 0.32, 0.6],
    [5.4, 0.12, 0.35],
    [8.93, 0.05, 0.2],
  ].forEach(([ratio, gain, len]) => {
    [-3, 3].forEach((cents) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.frequency.value = hz * ratio;
      o.detune.value = cents;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gain * 0.5, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay * len);
      o.connect(g).connect(out);
      o.start(t);
      o.stop(t + decay * len + 0.05);
    });
  });
}

export function sayLater(ctx, gap) {
  let last = -1e9;
  return (line, chance = 1) => {
    if (ctx.time - last < gap || Math.random() > chance) return false;
    last = ctx.time;
    ctx.say(line);
    return true;
  };
}
