import {
  AdditiveBlending,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import { STAMP_GLSL, peachStamp, rand, smoother, tone } from "./fractal-kit";

const GLASS_VERTEX = `
  varying vec2 vP;
  void main() {
    vP = position.xy;
    vec3 p = position;
    p.z -= dot(p.xy, p.xy) * 0.045;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const GLASS_FRAGMENT = `
  uniform float uTime;
  uniform float uFade;
  uniform float uLevel;
  uniform float uWave;
  uniform float uSpin;
  uniform float uGlow;
  uniform sampler2D uBehind;
  uniform vec2 uResolution;
  varying vec2 vP;
  const float TAU = 6.2831853;
  const vec3 H = vec3(-0.24, 0.37, 0.9);
  ${STAMP_GLSL}

  float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }
  float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  vec3 jewel(float h) {
    if (h < 0.3) return vec3(0.82, 0.16, 0.4);
    if (h < 0.5) return vec3(0.98, 0.5, 0.2);
    if (h < 0.68) return vec3(0.62, 0.1, 0.24);
    if (h < 0.86) return vec3(0.48, 0.15, 0.62);
    if (h < 0.97) return vec3(1.0, 0.72, 0.38);
    return vec3(0.38, 0.26, 0.8);
  }

  float seeds(vec2 s) {
    vec2 c = floor(s * 9.0);
    vec2 f = fract(s * 9.0) - 0.5;
    float h = hash2(c);
    vec2 o = (vec2(hash2(c + 3.1), hash2(c + 7.7)) - 0.5) * 0.6;
    float r = 0.06 + 0.08 * h;
    float ring = abs(length(f - o) - r);
    return step(0.55, h) * (smoothstep(0.035, 0.0, ring) * 0.6 + smoothstep(r, 0.0, length(f - o)) * 0.15);
  }

  vec3 ring(vec2 p, float segs, float turn, float at, float size, float depth, float sweep, inout vec3 spec) {
    float r = length(p);
    float phi = atan(p.y, p.x);
    float seg = TAU / segs;
    float id = floor((phi + turn) / seg);
    float a = mod(phi + turn, seg) - seg * 0.5;
    vec2 q = vec2(cos(a), sin(a)) * r;
    vec2 rel = (q - vec2(at, 0.0)) / size;
    vec2 s = vec2(rel.y, rel.x);
    vec3 c = peachAt(s);
    float e = 0.03;
    vec2 gq = normalize(vec2(peachAt(s + vec2(0.0, e)).x - c.x, peachAt(s + vec2(e, 0.0)).x - c.x) + 1e-6);
    float back = phi - a;
    vec2 g = vec2(cos(back) * gq.x - sin(back) * gq.y, sin(back) * gq.x + cos(back) * gq.y);

    float d = c.x * size;
    float lw = 0.01 + size * 0.028;
    float lead = 1.0 - smoothstep(lw - 0.003, lw + 0.003, abs(d));
    float inside = smoothstep(-lw + 0.003, -lw - 0.004, d);
    float t = clamp(d / lw, -1.0, 1.0);
    vec3 nl = normalize(vec3(g * t, sqrt(1.0 - t * t) + 0.1));
    float bevel = 1.0 - smoothstep(0.0, 0.05 + size * 0.06, -d - lw);
    vec3 ng = normalize(vec3(g * bevel * 0.8 + (c.y - 0.5) * vec2(-0.2, 0.25), 1.0));

    float h = hash(id * 7.3 + segs);
    vec3 tintA = jewel(h);
    vec3 tintB = mix(tintA, jewel(fract(h + 0.37)), 0.35);
    vec3 tint = mix(tintB, tintA, c.y) * (0.85 + 0.3 * hash(id + 1.7));
    float streak = 0.95 + 0.05 * sin(s.y * 17.0 + sin(s.x * 5.0 + id) * 2.5);
    float bubbles = seeds(s + id * 1.37);
    vec2 uv = gl_FragCoord.xy / uResolution + ng.xy * 0.018;
    float lum = dot(texture2D(uBehind, uv).rgb, vec3(0.3, 0.59, 0.11));
    float body = (0.32 + 0.68 * c.y) * (1.0 - smoothstep(0.35, 0.85, c.z) * 0.6);
    float leak = 0.75 + 0.25 * smoothstep(-0.9, 0.9, s.y);
    vec3 lit = tint * body * streak * leak * (0.5 + 1.7 * lum) * (1.0 + sweep * 0.9);
    lit += vec3(1.0, 0.92, 0.82) * bubbles * body * 0.35;

    float metal = pow(max(dot(nl, H), 0.0), 24.0);
    vec3 came = vec3(0.07, 0.05, 0.045) + vec3(0.85, 0.72, 0.55) * metal * (0.35 + sweep * 0.9);
    spec += vec3(1.0, 0.95, 0.88) * pow(max(dot(ng, H), 0.0), 70.0) * inside * (0.45 + sweep * 0.6) * depth;
    float spill = exp(-max(d - lw, 0.0) / (0.1 + size * 0.25)) * (1.0 - inside) * (1.0 - lead);
    return (lit * inside + tint * spill * 0.1) * depth + came * lead * mix(1.0, depth, 0.5);
  }

  void main() {
    vec2 p = vP;
    float r = length(p);
    float wave = uWave < 0.0 ? 0.0 : exp(-pow((r - uWave) * 1.1, 2.0));
    float travel = mod(uTime * 0.22, 9.0) - 4.5;
    float sweep = exp(-pow((dot(p, vec2(0.8, 0.6)) - travel * 2.2) / 0.9, 2.0));
    vec3 spec = vec3(0.0);
    vec3 col = ring(p, 10.0, uSpin, 2.65, 0.56, 1.0, sweep, spec);
    col += ring(p, 20.0, -uSpin * 0.7 + 0.157, 3.75, 0.33, 0.68, sweep, spec);
    col += ring(p, 40.0, uSpin * 0.5, 4.45, 0.19, 0.42, sweep, spec);
    float haze = smoothstep(3.0, 5.0, r);
    col = mix(col, col * vec3(0.8, 0.75, 1.0), haze * 0.5);
    float reach = smoothstep(1.6, 2.2, r) * (1.0 - smoothstep(4.5, 5.1, r));
    col = (col * (0.24 + 0.08 * uLevel + wave * 0.2) * uGlow + spec * (0.32 + wave * 0.25)) * reach * uFade;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const RIM_VERTEX =
  "varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";

const RIM_FRAGMENT = `
  uniform float uGlow;
  varying vec2 vP;
  ${STAMP_GLSL}
  void main() {
    float d = peachAt(vP).x;
    float rim = exp(-max(d, 0.0) / 0.05) * smoothstep(-0.12, 0.0, d);
    float lift = 0.6 + 0.4 * smoothstep(-0.6, 0.9, vP.y);
    gl_FragColor = vec4(vec3(1.0, 0.45, 0.66) * rim * lift * uGlow, 1.0);
  }
`;

function glass(ctx) {
  const stamp = { value: null };
  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uFade: { value: 0 },
      uLevel: { value: 0 },
      uWave: { value: -1 },
      uSpin: { value: 0 },
      uGlow: { value: 1 },
      uStamp: stamp,
      uBehind: { value: ctx.backdrop?.texture ?? null },
      uResolution: { value: new Vector2(1, 1) },
    },
    vertexShader: GLASS_VERTEX,
    fragmentShader: GLASS_FRAGMENT,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const pane = new Mesh(new PlaneGeometry(11, 11, 24, 24), material);
  pane.renderOrder = -1;
  pane.position.set(0, 0, -3);
  const rim = new Mesh(
    new PlaneGeometry(2.6, 2.6),
    new ShaderMaterial({
      uniforms: { uGlow: { value: 0 }, uStamp: stamp },
      vertexShader: RIM_VERTEX,
      fragmentShader: RIM_FRAGMENT,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  rim.renderOrder = -1;
  rim.scale.setScalar(1.8);
  pane.visible = false;
  rim.visible = false;
  ctx.group.add(pane, rim);
  let baking = false;
  const bake = () => {
    if (baking || !ctx.peach.mesh) return;
    baking = true;
    peachStamp(ctx)
      .then((texture) => {
        stamp.value = texture;
        pane.visible = true;
        rim.visible = true;
        ctx.warm();
      })
      .catch(() => {
        baking = false;
      });
  };
  bake();

  const rimAt = new Vector3().copy(ctx.center());
  const u = material.uniforms;
  let fade = 0;
  let timer = 2.5;
  let wave = -1;
  let spin = 0;
  let spinV = 0;
  let flash = 0;
  const pulse = () => {
    wave = 0;
    spinV += 0.1;
    const hit = ctx.randomHit();
    if (hit && ctx.live)
      ctx.touch(hit, { jiggle: 0.05, radius: 0.9, wobble: 0.08 });
    [392, 587.33, 784].forEach((hz, n) =>
      tone(ctx, { hz, length: 1.4, volume: 0.009, attack: 0.15, at: n * 0.09 }),
    );
  };
  return {
    update(dt, t) {
      if (!stamp.value) {
        bake();
        return;
      }
      const level = ctx.level();
      const { still } = ctx;
      fade = Math.min(1, fade + dt / 3.5);
      timer -= dt;
      if (timer <= 0) {
        timer = rand(5.5, 8) / (1 + level * 1.4);
        pulse();
      }
      if (wave >= 0) {
        wave += dt * 1.8;
        flash = Math.sin(Math.PI * Math.min(1, wave / 2.5));
        if (wave > 5) wave = -1;
      } else flash = 0;
      spinV *= Math.exp(-dt * 1.2);
      spin += (0.025 + spinV) * dt * still;
      ctx.renderer.getDrawingBufferSize(u.uResolution.value);
      u.uTime.value = t * still;
      u.uFade.value = smoother(fade);
      u.uLevel.value = level;
      u.uWave.value = wave < 0 ? -1 : 1.4 + wave;
      u.uSpin.value = spin;
      u.uGlow.value = 0.92 + 0.08 * Math.sin(t * 0.5 * still) + flash * 0.25;
      rimAt.lerp(ctx.center(), 1 - Math.exp(-dt * 6));
      rim.position.set(rimAt.x, rimAt.y, rimAt.z - 0.8);
      rim.material.uniforms.uGlow.value =
        smoother(fade) * (0.12 + level * 0.05 + flash * 0.15);
    },
    dispose() {},
  };
}

export default {
  id: "fractal",
  create: glass,
};
