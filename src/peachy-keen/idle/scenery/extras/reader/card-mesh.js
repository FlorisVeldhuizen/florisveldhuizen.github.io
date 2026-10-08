import {
  Color,
  ExtrudeGeometry,
  SRGBColorSpace,
  Shape,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";

const srgb = ([r, g, b]) => new Color().setRGB(r, g, b, SRGBColorSpace);

export const CARD_W = 0.62;
export const CARD_H = 0.992;

export function cardGeometry() {
  const w = CARD_W / 2;
  const h = CARD_H / 2;
  const r = 0.045;
  const s = new Shape();
  s.moveTo(-w + r, -h);
  s.lineTo(w - r, -h);
  s.quadraticCurveTo(w, -h, w, -h + r);
  s.lineTo(w, h - r);
  s.quadraticCurveTo(w, h, w - r, h);
  s.lineTo(-w + r, h);
  s.quadraticCurveTo(-w, h, -w, h - r);
  s.lineTo(-w, -h + r);
  s.quadraticCurveTo(-w, -h, -w + r, -h);
  const g = new ExtrudeGeometry(s, {
    depth: 0.004,
    bevelEnabled: true,
    bevelThickness: 0.001,
    bevelSize: 0.001,
    bevelSegments: 2,
    curveSegments: 5,
  });
  g.translate(0, 0, -0.002);
  return g;
}

const VERTEX = `
  uniform vec2 uSize;
  varying vec2 vUv;
  varying float vFace;
  varying vec3 vN;
  varying vec3 vW;
  void main() {
    vUv = position.xy / uSize + 0.5;
    vFace = normal.z;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const FRAGMENT = `
  uniform sampler2D tFront;
  uniform sampler2D tBack;
  uniform vec3 uFoil;
  uniform vec3 uEdge;
  uniform float uFoilSat;
  uniform float uDissolve;
  uniform float uGlow;
  uniform float uFlash;
  uniform float uAppear;
  uniform float uTime;
  uniform vec3 uGlare;
  uniform float uDim;
  varying vec2 vUv;
  varying float vFace;
  varying vec3 vN;
  varying vec3 vW;
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  void main() {
    float n = noise(vUv * vec2(3.5, 5.5)) * 0.32 + noise(vUv * vec2(11.0, 17.0)) * 0.12 + noise(vUv * vec2(30.0, 46.0)) * 0.04 + (1.0 - vUv.y) * 0.5;
    float cut = uDissolve * 1.1 - 0.04;
    if (n < cut) discard;
    float lit = step(0.001, uDissolve);
    float burn = (1.0 - smoothstep(cut, cut + 0.035, n)) * lit;
    float char = (1.0 - smoothstep(cut + 0.02, cut + 0.16, n)) * lit;
    float ember = noise(vUv * vec2(40.0, 60.0) + uTime * 1.5);

    vec4 c;
    float cap = 1.0;
    if (vFace > 0.5) c = texture2D(tFront, vUv);
    else if (vFace < -0.5) c = texture2D(tBack, vec2(1.0 - vUv.x, vUv.y));
    else {
      c = vec4(uEdge, 1.0);
      cap = 0.0;
    }
    float lum = max(c.r, max(c.g, c.b));
    float sat = (lum - min(c.r, min(c.g, c.b))) / max(lum, 1e-3);
    float hue = dot(normalize(c.rgb + 1e-4), normalize(uFoil));
    float foil = smoothstep(0.965, 0.99, hue) * smoothstep(0.18, 0.4, lum) * smoothstep(uFoilSat, uFoilSat + 0.15, sat);
    foil = max(foil, 1.0 - cap);

    vec3 nn = normalize(vN);
    vec3 v = normalize(cameraPosition - vW);
    vec3 L = normalize(vec3(-0.45, 0.65, 0.62));
    vec3 h = normalize(L + v);
    float ndl = max(dot(nn, L), 0.0);
    float nh = max(dot(nn, h), 0.0);
    float spec = pow(nh, 36.0);
    float coat = pow(nh, 240.0);
    float fres = pow(1.0 - max(dot(nn, v), 0.0), 4.0);
    float phase = nn.x * 1.8 - nn.y * 1.2 + uTime * 0.1;
    float sweep = exp(-pow(vUv.x * 0.7 + vUv.y * 0.5 - (fract(phase * 0.35) * 2.6 - 0.8), 2.0) * 26.0);
    vec3 irid = 0.6 + 0.4 * cos(6.2831 * (vec3(0.0, 0.33, 0.67) + vUv.x * 0.6 + vUv.y * 0.4 + phase));

    vec3 col = c.rgb * (0.8 + 0.3 * ndl);
    col += foil * (spec * 0.8 + sweep * 0.7) * mix(uFoil, irid * uFoil * 1.6, 0.35);
    col += vec3(1.0, 0.96, 0.92) * (coat * 0.4 + fres * 0.06) * cap;
    vec2 d = abs(vUv - 0.5) * 2.0;
    float rim = smoothstep(0.8, 1.0, max(d.x, d.y));
    col += uFoil * rim * uGlow * 0.22 + c.rgb * uGlow * 0.1;
    col += vec3(1.0, 0.92, 0.85) * uFlash * 0.22;
    col *= 1.0 - char * 0.75;
    col += vec3(0.9, 0.3, 0.25) * char * (1.0 - burn) * 0.35;
    vec3 hot = mix(vec3(1.0, 0.86, 0.55), vec3(1.0, 0.45, 0.6), ember);
    if (uGlare.z > 0.001 && vFace > 0.5) {
      float band = vUv.x * 0.62 + (1.0 - vUv.y) * 0.78 + 0.07 * sin(vUv.y * 3.14159) - uGlare.x;
      float main = exp(-band * band * 16.0);
      float thin = exp(-(band - 0.2) * (band - 0.2) * 160.0) * 0.45;
      float gold = mix(0.35, 1.0, foil);
      float g = (main * 0.75 + thin) * gold * uGlare.z;
      col += (vec3(1.0, 0.95, 0.86) - col * 0.55) * g;
    }
    col *= 1.0 - uDim;
    col = mix(col, hot * (1.6 + ember * 1.2), burn);
    gl_FragColor = vec4(col, uAppear);
    #include <colorspace_fragment>
  }
`;

export function cardMaterial(style, back) {
  return new ShaderMaterial({
    uniforms: {
      uSize: { value: new Vector2(CARD_W, CARD_H) },
      tFront: { value: back },
      tBack: { value: back },
      uFoil: { value: srgb(style.foil) },
      uEdge: { value: srgb(style.edge) },
      uFoilSat: { value: style.foilSat },
      uDissolve: { value: 0 },
      uGlow: { value: 0 },
      uFlash: { value: 0 },
      uAppear: { value: 0 },
      uTime: { value: 0 },
      uGlare: { value: new Vector3() },
      uDim: { value: 0 },
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
  });
}
