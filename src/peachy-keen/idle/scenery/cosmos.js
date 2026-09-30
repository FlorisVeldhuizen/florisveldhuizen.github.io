import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  PlaneGeometry,
  Points,
  ShaderMaterial,
} from "three";

const rand = (lo, hi) => lo + Math.random() * (hi - lo);

const NOISE = `
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int k = 0; k < 4; k++) {
    v += a * noise(p);
    p = p * 2.03 + 11.7;
    a *= 0.5;
  }
  return v;
}
vec2 spin(vec2 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}`;

const UV_VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const HOLE_FRAGMENT = `
uniform float uTime;
uniform float uGlow;
varying vec2 vUv;
${NOISE}
vec3 heat(float k) {
  vec3 hot = vec3(1.0, 0.95, 0.85);
  vec3 gold = vec3(1.0, 0.62, 0.3);
  vec3 rose = vec3(0.95, 0.32, 0.55);
  return k < 0.5 ? mix(hot, gold, k * 2.0) : mix(gold, rose, k * 2.0 - 1.0);
}
float gas(vec2 d, float r) {
  float a = atan(d.y, d.x) - uTime * 0.9 / pow(r, 1.5);
  vec2 around = vec2(cos(a), sin(a));
  float arcs = fbm(around * 2.2 + vec2(r * 5.0, r * 1.3));
  float lanes = 0.9 + 0.1 * sin(r * 17.0 + fbm(around * 1.4 + r * 0.7) * 9.0);
  return (0.5 + 0.6 * arcs) * lanes;
}
void main() {
  vec2 p = (vUv - 0.5) * 12.0;
  float r = length(p);
  vec2 d = vec2(p.x, p.y / 0.18);
  float dr = length(d);
  float lean = 1.0 - 0.65 * d.x / max(dr, 0.001);

  float disk = smoothstep(1.35, 1.75, dr) * (1.0 - smoothstep(3.2, 5.6, dr));
  disk *= gas(d, dr) * (0.55 + 0.9 * exp(-(dr - 1.6) * 0.9));
  vec3 col = heat(clamp((dr - 1.6) / 3.8, 0.0, 1.0)) * disk * lean * 1.6;
  bool hidden = r < 1.0 && p.y > 0.0;
  if (hidden) col = vec3(0.0);

  float bend = exp(-pow((r - 1.42) / 0.22, 2.0)) * pow(abs(p.y) / max(r, 0.001), 1.5);
  float bendLean = 1.0 - 0.45 * p.x / max(r, 0.001);
  col += heat(0.25) * bend * bendLean * gas(p, max(r * 1.6, 1.4)) * 1.1;

  col += vec3(1.0, 0.88, 0.74) * exp(-pow((r - 1.03) / 0.018, 2.0)) * 0.9;
  col += vec3(0.9, 0.4, 0.6) * exp(-r * 0.55) * 0.12 * uGlow;

  float shadow = 1.0 - smoothstep(0.97, 1.02, r);
  float front = r < 1.0 && p.y <= 0.0 ? clamp(disk * 2.0, 0.0, 1.0) : 0.0;
  float edge = 1.0 - smoothstep(4.5, 6.0, r);
  gl_FragColor = vec4(col * edge, shadow * (1.0 - front));
}`;

export function blackHole() {
  const mesh = new Mesh(
    new PlaneGeometry(1, 1),
    new ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uGlow: { value: 0 } },
      vertexShader: UV_VERTEX,
      fragmentShader: HOLE_FRAGMENT,
      transparent: true,
      premultipliedAlpha: true,
      depthWrite: false,
    }),
  );
  mesh.renderOrder = 1;
  return {
    mesh,
    update(t, level, camera) {
      mesh.quaternion.copy(camera.quaternion);
      mesh.rotateZ(-0.18);
      const { uniforms } = mesh.material;
      uniforms.uTime.value = t;
      uniforms.uGlow.value = level;
    },
  };
}

const STAR_VERTEX = `
attribute float aSize;
attribute float aPhase;
attribute vec3 aColor;
uniform float uTime;
uniform float uScale;
varying vec3 vColor;
varying float vSize;
void main() {
  float twinkle = 0.72 + 0.28 * sin(uTime * (0.8 + fract(aPhase * 7.3) * 2.2) + aPhase * 6.283);
  vColor = aColor * twinkle;
  vSize = aSize;
  gl_PointSize = aSize * uScale * (0.85 + 0.15 * twinkle);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const STAR_FRAGMENT = `
uniform float uOpacity;
varying vec3 vColor;
varying float vSize;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float core = exp(-dot(c, c) * 28.0);
  float spikes = (exp(-abs(c.x) * 70.0) * exp(-abs(c.y) * 7.0) + exp(-abs(c.y) * 70.0) * exp(-abs(c.x) * 7.0));
  float glow = core + spikes * smoothstep(4.0, 8.0, vSize) * 0.7;
  gl_FragColor = vec4(vColor * glow * uOpacity, 1.0);
}`;

const STAR_COLORS = [
  new Color(1, 0.86, 0.72),
  new Color(1, 0.95, 0.9),
  new Color(0.8, 0.86, 1),
  new Color(1, 0.72, 0.78),
];

export function starField(count) {
  const geometry = new BufferGeometry();
  const position = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const phase = new Float32Array(count);
  const color = new Float32Array(count * 3);
  for (let n = 0; n < count; n += 1) {
    position.set([rand(-42, 42), rand(-22, 24), rand(-40, -18)], n * 3);
    const bright = Math.random() ** 6;
    size[n] = 1.5 + bright * 9;
    phase[n] = Math.random();
    const tint = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
    const glow = 0.45 + bright * 0.9;
    color.set([tint.r * glow, tint.g * glow, tint.b * glow], n * 3);
  }
  geometry.setAttribute("position", new BufferAttribute(position, 3));
  geometry.setAttribute("aSize", new BufferAttribute(size, 1));
  geometry.setAttribute("aPhase", new BufferAttribute(phase, 1));
  geometry.setAttribute("aColor", new BufferAttribute(color, 3));
  const points = new Points(
    geometry,
    new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScale: { value: 1 },
        uOpacity: { value: 0 },
      },
      vertexShader: STAR_VERTEX,
      fragmentShader: STAR_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = -1;
  return {
    points,
    update(t, level) {
      const { uniforms } = points.material;
      uniforms.uTime.value = t;
      uniforms.uScale.value = Math.min(window.devicePixelRatio, 2);
      uniforms.uOpacity.value = level;
      points.geometry.setDrawRange(
        0,
        Math.round(count * (0.25 + 0.75 * level)),
      );
    },
  };
}

const GALAXY_FRAGMENT = `
uniform float uTime;
uniform float uOpacity;
varying vec2 vUv;
${NOISE}
void main() {
  vec2 p = (vUv - 0.5) * 2.0;
  float r = length(p);
  float a = atan(p.y, p.x) + uTime;
  float arm = 0.5 + 0.5 * cos(2.0 * (a - log(max(r, 0.02)) * 2.6));
  float clumps = fbm(spin(p, uTime) * 7.0);
  float arms = pow(arm, 3.0) * (0.45 + 0.9 * clumps);
  float dust = pow(0.5 + 0.5 * cos(2.0 * (a - log(max(r, 0.02)) * 2.6) + 0.9), 6.0);
  arms *= 1.0 - 0.6 * dust * smoothstep(0.08, 0.3, r);
  float fade = exp(-r * 3.6) * (1.0 - smoothstep(0.7, 1.0, r));
  float core = exp(-r * r * 90.0) * 1.3 + exp(-r * 12.0) * 0.35;
  vec3 inner = vec3(1.0, 0.86, 0.62);
  vec3 middle = vec3(1.0, 0.5, 0.62);
  vec3 outer = vec3(0.55, 0.52, 1.0);
  vec3 tone = mix(mix(inner, middle, smoothstep(0.05, 0.3, r)), outer, smoothstep(0.3, 0.8, r));
  vec3 col = tone * arms * fade * 1.8 + inner * core;
  col += vec3(1.0, 0.95, 0.9) * step(0.985, hash(floor(spin(p, uTime) * 180.0))) * arm * fade * 2.0;
  gl_FragColor = vec4(col * uOpacity, 1.0);
}`;

export function galaxy() {
  const mesh = new Mesh(
    new PlaneGeometry(1, 1),
    new ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
      vertexShader: UV_VERTEX,
      fragmentShader: GALAXY_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  mesh.rotation.set(-1.05, 0.25, 0.5);
  mesh.renderOrder = -1;
  return {
    mesh,
    update(t, level) {
      const { uniforms } = mesh.material;
      uniforms.uTime.value = t * 0.015;
      uniforms.uOpacity.value = level;
    },
  };
}

const PEACH_OUTLINE = [
  [0, 0.5],
  [-0.36, 0.8],
  [-0.78, 0.58],
  [-0.92, 0.08],
  [-0.66, -0.48],
  [0, -0.82],
  [0.66, -0.48],
  [0.92, 0.08],
  [0.78, 0.58],
  [0.36, 0.8],
];
const PEACH_EXTRA = [
  [0, 0.5, 0, -0.25],
  [0, 0.5, 0.45, 1],
  [0.45, 1, 0.12, 0.95],
  [0.12, 0.95, 0, 0.5],
];

export function constellation() {
  const group = new Group();
  const spots = [...PEACH_OUTLINE, [0, -0.25], [0.45, 1], [0.12, 0.95]];
  const starGeometry = new BufferGeometry();
  starGeometry.setAttribute(
    "position",
    new BufferAttribute(
      new Float32Array(spots.flatMap(([x, y]) => [x, y, 0])),
      3,
    ),
  );
  starGeometry.setAttribute(
    "aSize",
    new BufferAttribute(
      Float32Array.from(spots, (_, n) => (n % 3 === 0 ? 8 : 5)),
      1,
    ),
  );
  starGeometry.setAttribute(
    "aPhase",
    new BufferAttribute(
      Float32Array.from(spots, () => Math.random()),
      1,
    ),
  );
  starGeometry.setAttribute(
    "aColor",
    new BufferAttribute(
      new Float32Array(spots.flatMap(() => [1.25, 1.05, 0.95])),
      3,
    ),
  );
  const stars = new Points(
    starGeometry,
    new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScale: { value: 1 },
        uOpacity: { value: 0 },
      },
      vertexShader: STAR_VERTEX,
      fragmentShader: STAR_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  const ends = [];
  PEACH_OUTLINE.forEach(([x, y], n) => {
    const [nx, ny] = PEACH_OUTLINE[(n + 1) % PEACH_OUTLINE.length];
    ends.push(x, y, 0, nx, ny, 0);
  });
  PEACH_EXTRA.forEach(([x, y, nx, ny]) => ends.push(x, y, 0, nx, ny, 0));
  const lineGeometry = new BufferGeometry();
  lineGeometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(ends), 3),
  );
  const lines = new LineSegments(
    lineGeometry,
    new LineBasicMaterial({
      color: 0xffc8b0,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  group.add(lines, stars);
  group.renderOrder = -1;
  return {
    group,
    update(t, level) {
      const { uniforms } = stars.material;
      uniforms.uTime.value = t;
      uniforms.uScale.value = Math.min(window.devicePixelRatio, 2);
      const show = Math.max(0, Math.min(1, (level - 0.2) / 0.4));
      uniforms.uOpacity.value = show;
      lines.material.opacity = show * (0.22 + 0.08 * Math.sin(t * 0.6));
    },
  };
}
