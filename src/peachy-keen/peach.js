import {
  SphereGeometry,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshDepthMaterial,
  RGBADepthPacking,
  Mesh,
  CanvasTexture,
  Vector3,
  Vector4,
  Matrix4,
  Box3,
  Color,
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  FloatType,
  RedFormat,
  NearestFilter,
  Float32BufferAttribute,
  DoubleSide,
  BackSide,
  FrontSide,
  Group,
  PlaneGeometry,
  SRGBColorSpace,
  AlwaysStencilFunc,
  NotEqualStencilFunc,
  IncrementWrapStencilOp,
  DecrementWrapStencilOp,
  ReplaceStencilOp,
  RepeatWrapping,
  Vector2,
  Quaternion,
  Texture,
  FileLoader,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PEACH_CONFIG, FABRIC } from "./config";
import { RING } from "./scene";
import { RibbonBows } from "./ribbon";
import { Waistband } from "./band";
import { boxesFor, raycastNearest } from "./raycast";
import peachyModel from "./assets/peachy.glb?url";
import peachySkin from "./assets/peachy-skin.jpg?url";
import SKIN_PREVIEW from "./skin-preview";

const HIT_LIFE = 3.0;
const MARKER_FRAGMENT = `#include <colorspace_fragment>
  float marker = markerAmount();
  gl_FragColor = mix(gl_FragColor, vec4(uMarkerColor, 1.0), marker);`;
const CURVE_SLOTS = 16;
const BRIDGE_BINS = 25;
const BRIDGE_SPAN = "0.25";

const SKIN_FADE_SECONDS = 2.4;
// Fractions of the peach height.
const STRETCH_REACH = 0.043;
const STRETCH_SOFT = 0.0185;
const CREASE_STRIP = { width: 0.07, top: 0.62 };
const LEAF_BEND = Math.cos((32 * Math.PI) / 180);
const RISE_SECONDS = 0.4;
// Tuned to give the lingerie mesh about 19,000 vertices, enough for the waistband's pull.
const EDGE_SPLIT = 0.006088;
const LEAF = {
  HZ: 1.8,
  DAMPING: 0.16,
  PUSH: 1.4,
  LAG: 0.2,
  DRAG: 3.5,
  FLING: 0.15,
  MAX_TORQUE: 400,
  MAX_BEND: 0.6,
  BREEZE: 0.03,
  FLUTTER_AT: 6,
};
const SKIN_UNIFORMS = ["uSkinLook", "uSkinGlint", "uSkinPattern", "uSkinDeep"];
const SKIN_PROPS = [
  "metalness",
  "roughness",
  "envMapIntensity",
  "sheen",
  "clearcoat",
  "clearcoatRoughness",
];
const NOIR = [0x0d0508, 0x3a1a24];
const FABRIC_SPRINGS = [
  ["bulge", "bulgeVelocity"],
  ["depth", "depthVelocity"],
];

const LINGERIE_COMMON = `
  uniform vec4 uBounds;
  uniform vec4 uLingerie;
  uniform vec4 uFabric;
  uniform float uFabricWobble;
  uniform float uFabricDepth;
  uniform float uCreaseCurve[${CURVE_SLOTS}];
  uniform vec3 uCreaseSide;

  float heightOf(vec3 p) {
    return (p.y - uBounds.y) / uBounds.w + 0.5;
  }

  float backness(vec3 p) {
    vec2 r = p.xz - uBounds.xz;
    return dot(r, uCreaseSide.xz) / max(length(r), 1e-4);
  }

  float acrossOf(vec3 p, vec4 plane, float h, float back) {
    float f = clamp(h, 0.0, 1.0) * ${CURVE_SLOTS - 1}.0;
    int i = int(floor(f));
    int j = min(i + 1, ${CURVE_SLOTS - 1});
    float offset = mix(uCreaseCurve[i], uCreaseCurve[j], fract(f));
    offset *= (1.0 - smoothstep(0.35, 0.6, h)) * smoothstep(-0.2, 0.3, back);
    return (dot(p, plane.xyz) - plane.w) / uBounds.w - offset;
  }

  float softMin(float a, float b, float k) {
    float m = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, m) - k * m * (1.0 - m);
  }

  float softMax(float a, float b, float k) {
    return -softMin(-a, -b, k);
  }

  float softAbs(float x) {
    return sqrt(x * x + 0.00004);
  }

  float waistLine() {
    return min(uLingerie.w - uLingerie.y * 0.36 - 0.05, uLingerie.w + 0.01);
  }

  float fabricShape(float across, float h, float back, float waist, float soft) {
    float k = smoothstep(0.1, max(waist, 0.11), h);
    float frontWidth = 0.3 * (0.3 + 0.7 * pow(k, 1.3));
    float rearWidth = 0.012 + 0.27 * pow(k, 1.6);
    float edge = softAbs(across) - mix(frontWidth, rearWidth, smoothstep(-0.3, 0.3, back));
    float bounds = max(0.02 - h, h - waist);
    return soft > 0.0 ? softMax(edge, softMax(0.02 - h, h - waist, soft), soft) : max(edge, bounds);
  }

  vec2 fabricDistance(float across, float h, float back) {
    float eps = 0.004;
    float waist = waistLine();
    float s0 = fabricShape(across, h, back, waist, 0.0);
    float sx = fabricShape(across + eps, h, back, waist, 0.0);
    float sh = fabricShape(across, h + eps, back, waist, 0.0);
    float edge = s0 / max(length(vec2(sx - s0, sh - s0) / eps), 0.35);
    return vec2(edge, abs(h - waist));
  }

  float fabricShadow(vec3 p, vec4 plane) {
    float h = heightOf(p);
    float back = backness(p);
    vec2 shape = fabricDistance(acrossOf(p, plane, h, back), h, back);
    float edge = shape.x / 0.01;
    float contact = step(0.0, shape.x) * exp(-edge * edge);
    float strap = shape.y / 0.02;
    float shade = max(max(contact * 0.24, exp(-strap * strap) * 0.26), (1.0 - smoothstep(-0.01, 0.0, shape.x)) * 0.035);
    return shade * smoothstep(0.04, 0.16, h);
  }

  uniform sampler2D uBridgeMap;

  float bridgeLift(vec3 p, vec4 plane, float h, float back) {
    float waist = waistLine();
    float upper = pow(smoothstep(0.1, waist - 0.03, h), 1.6) * (1.0 - smoothstep(waist + 0.02, waist + 0.05, h));
    float raw = (dot(p, plane.xyz) - plane.w) / uBounds.w;
    vec2 size = vec2(${BRIDGE_BINS}.0, ${CURVE_SLOTS}.0);
    vec2 g = vec2((raw / ${BRIDGE_SPAN} * 0.5 + 0.5) * size.x - 0.5, clamp(h, 0.0, 1.0) * (size.y - 1.0));
    g = clamp(g, vec2(0.0), size - 1.0);
    vec2 i0 = floor(g);
    vec2 f = g - i0;
    vec2 i1 = min(i0 + 1.0, size - 1.0);
    float a = texture2D(uBridgeMap, (vec2(i0.x, i0.y) + 0.5) / size).r;
    float b = texture2D(uBridgeMap, (vec2(i1.x, i0.y) + 0.5) / size).r;
    float c = texture2D(uBridgeMap, (vec2(i0.x, i1.y) + 0.5) / size).r;
    float d = texture2D(uBridgeMap, (vec2(i1.x, i1.y) + 0.5) / size).r;
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y) * upper * smoothstep(0.0, 0.4, back);
  }

  float bridgeLift(vec3 p, vec4 plane) {
    return bridgeLift(p, plane, heightOf(p), backness(p));
  }

  vec2 fabricRegion(float across, float h, float back) {
    float waist = waistLine();
    float panel = fabricShape(across, h, back, waist, 0.02);
    float band = softAbs(h - waist) - 0.008;
    return vec2(softMin(panel, band, 0.025), band);
  }

  float fleshRoll(float d, float rise, float tail) {
    float x = max(d + 0.012, 0.0);
    return (1.0 - exp(-x * x / (rise * rise))) * exp(-x / tail);
  }

  float fabricPush(vec3 p, vec4 plane) {
    float h = heightOf(p);
    float back = backness(p);
    float across = acrossOf(p, plane, h, back);
    float r = 0.016;
    vec2 c = fabricRegion(across, h, back);
    float xp = fabricRegion(across + r, h, back).x;
    float xn = fabricRegion(across - r, h, back).x;
    float hp = fabricRegion(across, h + r, back).x;
    float hn = fabricRegion(across, h - r, back).x;
    vec2 gradient = vec2(xp - xn, hp - hn) / (2.0 * r);
    float d = (c.x * 2.0 + xp + xn + hp + hn) / 6.0;
    d /= sqrt(dot(gradient, gradient) * 0.7 + 0.3);
    float pull = clamp(uLingerie.y, 0.0, 1.0);
    float hike = clamp(-uLingerie.y / 0.45, 0.0, 1.0);
    float spread = sqrt(max(1.0, uFabricDepth / ${FABRIC.depth.toFixed(4)}));
    float reach = 0.07 * uFabric.w;
    float covered = 1.0 - smoothstep(-0.06 * spread, 0.05 * spread, d);
    float banded = 1.0 - smoothstep(-0.02, 0.06, c.y);
    float spanned = smoothstep(0.0, 0.008, bridgeLift(p, plane, h, back));
    float press = covered * (1.0 - 0.7 * pull + 0.6 * hike) * (1.0 - 0.9 * spanned) + banded * (0.5 + 1.1 * pull + 1.2 * hike);
    float waist = waistLine();
    float over = smoothstep(-0.03, 0.03, h - waist);
    float roll = mix(
      fleshRoll(d, reach * spread * (0.9 + 0.6 * hike), reach * (1.3 + 1.2 * hike)) * (1.7 + 1.8 * hike),
      fleshRoll(d, reach * spread * (1.3 + 0.6 * pull), reach * (1.6 + 1.0 * pull)) * (2.2 + 0.6 * pull) * (1.0 - 0.4 * hike),
      over);
    roll *= 1.0 + uFabricWobble * (0.6 + over);
    float push = roll * uFabric.z - press * uFabric.y;
    float tuck = (1.0 - smoothstep(0.14, max(waist - 0.12, 0.141), h)) * smoothstep(0.06, 0.14, h)
      * exp(-(across * across) / 0.0009) * smoothstep(0.0, 0.4, back);
    return (push - tuck * (0.8 + 2.0 * hike) * uFabric.y) * smoothstep(0.04, 0.2, h);
  }
`;

const VERTEX_HEADER = `
  uniform float uTime;
  uniform float uJiggleActive;
  uniform vec4 uFirmness;
  uniform vec3 uBounce;
  uniform vec4 uHits[${PEACH_CONFIG.MAX_HITS}];
  uniform vec4 uHitDirs[${PEACH_CONFIG.MAX_HITS}];
  uniform vec4 uCrease;
  uniform vec4 uGrab;
  uniform vec4 uGrabPull;
  uniform vec4 uGrabDent;
  attribute float stiffness;
  attribute float plant;
  attribute float stretch;
  attribute vec3 riseFrom;
  attribute vec3 riseNormal;
  uniform float uRise;
  varying float vStretch;
  varying float vPlant;
  uniform vec3 uStemBase;
  uniform vec3 uLeafBend;
  uniform vec4 uLeafAxis;
  vec3 turnBy(vec3 v, vec3 th) {
    float a = length(th);
    if (a < 1e-5) return v;
    vec3 k = th / a;
    return v * cos(a) + cross(k, v) * sin(a) + k * dot(k, v) * (1.0 - cos(a));
  }
  varying vec3 vRestPosition;
  varying vec4 vRubTilt;
  ${LINGERIE_COMMON}
  varying float vFabricPush;
  float lastFabricPush;

  // jiggleSlope() below holds the hand-worked slopes of this function for the normals; change both together.
  vec3 jiggle(vec3 p, vec3 n) {
    vec3 d = vec3(0.0);
    lastFabricPush = 0.0;
    if (uLingerie.x > 0.5 && uLingerie.z > 0.0) {
      float tension = (uFabric.x + clamp(abs(uLingerie.y), 0.0, 1.0) * 0.6) * uLingerie.z;
      lastFabricPush = fabricPush(p, uCrease);
      d += n * uBounds.w * uFabricDepth * tension * lastFabricPush;
    }
    if (uGrabPull.w > 0.0) {
      float g = length(p - uGrab.xyz) / uGrab.w;
      d += uGrabPull.xyz * uGrabPull.w * exp(-g * g * 1.2);
      float k = length(p - uGrab.xyz) / uGrabDent.w;
      d += uGrabDent.xyz * uGrabPull.w * exp(-k * k * 2.0);
    }
    vec3 hits = vec3(0.0);
    for (int i = 0; i < ${PEACH_CONFIG.MAX_HITS}; i++) {
      float t = uTime - uHits[i].w;
      if (t < 0.0 || t > ${HIT_LIFE.toFixed(1)}) continue;
      float r = uHitDirs[i].w;
      vec3 q = p - uHits[i].xyz;
      float dist = length(q) / r;
      float onset = 1.0 - exp(-t * 45.0);
      float hitSide = sign(dot(uHits[i].xyz, uCrease.xyz) - uCrease.w);
      float fromCrease = (dot(p, uCrease.xyz) - uCrease.w) * hitSide / r;
      float sameCheek = smoothstep(-0.05, 0.2, fromCrease);
      float cheekBody = sameCheek * smoothstep(0.0, 0.9, fromCrease);
      float pad = exp(-dist * dist * dist * 0.6);
      float spring = exp(-t * uFirmness.y) * cos(t * uFirmness.x - dist * 0.35);
      spring = max(spring, 0.0) + min(spring, 0.0) * uBounce.z;
      float rim = max(dist - 0.8, 0.0);
      float ripple = (1.0 - pad) * exp(-rim * rim * 1.4) * exp(-t * uFirmness.y * 1.2) * cos(t * uFirmness.x - rim * 2.6) * 0.22;
      float dent = pad * spring + ripple;
      float wobble = exp(-dist * dist * 0.2) * exp(-t * uFirmness.y * 0.75) * sin(t * uFirmness.x * 0.5 * uBounce.y) * uFirmness.z;
      float front = dist - t * 3.0;
      float splash = exp(-front * front * 2.5) * exp(-t * uFirmness.y * 0.8) * sin(t * uFirmness.x - dist * 2.0) * uBounce.x / (1.0 + t * 3.0);
      float cheek = cheekBody * exp(-dist * dist * 0.08) * exp(-t * uFirmness.y * 0.38) * sin(t * uFirmness.x * 0.42 * uBounce.y) * uFirmness.z * 3.2;
      vec3 stretch = -(q - n * dot(q, n)) / r * dent * length(uHitDirs[i].xyz) * 0.3;
      hits += (uHitDirs[i].xyz * ((dent + wobble + splash) * mix(0.15, 1.0, sameCheek) + cheek) + stretch * sameCheek) * onset;
    }
    float hold = 1.0;
    if (uLingerie.x > 0.5 && uLingerie.z > 0.0) {
      float gap = (heightOf(p) - waistLine()) / 0.07;
      hold = 1.0 - 0.4 * exp(-gap * gap) * uLingerie.z;
    }
    float limit = uBounds.w * 0.07 * uFirmness.w;
    float amount = length(hits);
    if (amount > 0.0) d += hits * (limit * tanh(amount / limit) / amount) * hold;
    return d;
  }

  float dSmooth(float a, float b, float x) {
    float t = clamp((x - a) / (b - a), 0.0, 1.0);
    return 6.0 * t * (1.0 - t) / (b - a);
  }

  // Returns jiggle() and its slopes along ta and tb, so the normal needs one call; keep in step with jiggle().
  vec3 jiggleSlope(vec3 p, vec3 n, vec3 ta, vec3 tb, out vec3 dA, out vec3 dB) {
    vec3 d = vec3(0.0);
    dA = vec3(0.0);
    dB = vec3(0.0);
    lastFabricPush = 0.0;
    float hold = 1.0;
    vec2 holdD = vec2(0.0);
    if (uLingerie.x > 0.5 && uLingerie.z > 0.0) {
      float e = 0.004;
      float tension = (uFabric.x + clamp(abs(uLingerie.y), 0.0, 1.0) * 0.6) * uLingerie.z;
      vec3 k = n * uBounds.w * uFabricDepth * tension;
      lastFabricPush = fabricPush(p, uCrease);
      d += k * lastFabricPush;
      dA += k * (fabricPush(p + ta * e, uCrease) - lastFabricPush) / e;
      dB += k * (fabricPush(p + tb * e, uCrease) - lastFabricPush) / e;
      float gap = (heightOf(p) - waistLine()) / 0.07;
      float g = exp(-gap * gap);
      hold = 1.0 - 0.4 * g * uLingerie.z;
      holdD = vec2(ta.y, tb.y) * 0.8 * uLingerie.z * g * gap / (uBounds.w * 0.07);
    }
    if (uGrabPull.w > 0.0) {
      vec3 r1 = p - uGrab.xyz;
      float g = length(r1) / uGrab.w;
      float G = exp(-g * g * 1.2);
      vec3 gG = -2.4 * G * r1 / (uGrab.w * uGrab.w);
      vec3 P = uGrabPull.xyz * uGrabPull.w;
      float k = length(r1) / uGrabDent.w;
      float K = exp(-k * k * 2.0);
      vec3 gK = -4.0 * K * r1 / (uGrabDent.w * uGrabDent.w);
      vec3 Q = uGrabDent.xyz * uGrabPull.w;
      d += P * G + Q * K;
      dA += P * dot(gG, ta) + Q * dot(gK, ta);
      dB += P * dot(gG, tb) + Q * dot(gK, tb);
    }
    vec3 hits = vec3(0.0);
    vec3 hA = vec3(0.0);
    vec3 hB = vec3(0.0);
    vec2 tn = vec2(dot(ta, n), dot(tb, n));
    for (int i = 0; i < ${PEACH_CONFIG.MAX_HITS}; i++) {
      float t = uTime - uHits[i].w;
      if (t < 0.0 || t > ${HIT_LIFE.toFixed(1)}) continue;
      float r = uHitDirs[i].w;
      vec3 dir = uHitDirs[i].xyz;
      vec3 q = p - uHits[i].xyz;
      float ql = max(length(q), 1e-6);
      float dist = ql / r;
      vec3 gd = q / (ql * r);
      vec2 dd = vec2(dot(gd, ta), dot(gd, tb));
      float onset = 1.0 - exp(-t * 45.0);
      float hitSide = sign(dot(uHits[i].xyz, uCrease.xyz) - uCrease.w);
      float fromCrease = (dot(p, uCrease.xyz) - uCrease.w) * hitSide / r;
      vec2 df = vec2(dot(uCrease.xyz, ta), dot(uCrease.xyz, tb)) * hitSide / r;
      float sameCheek = smoothstep(-0.05, 0.2, fromCrease);
      vec2 sameD = dSmooth(-0.05, 0.2, fromCrease) * df;
      float body = smoothstep(0.0, 0.9, fromCrease);
      float cheekBody = sameCheek * body;
      vec2 cheekBodyD = sameD * body + sameCheek * dSmooth(0.0, 0.9, fromCrease) * df;
      float pad = exp(-dist * dist * dist * 0.6);
      vec2 padD = -1.8 * dist * dist * pad * dd;
      float decay = exp(-t * uFirmness.y);
      float phase = t * uFirmness.x - dist * 0.35;
      float s = decay * cos(phase);
      float sf = s > 0.0 ? 1.0 : uBounce.z;
      float spring = s * sf;
      vec2 springD = decay * sin(phase) * 0.35 * sf * dd;
      float rim = max(dist - 0.8, 0.0);
      vec2 rimD = dist > 0.8 ? dd : vec2(0.0);
      float R = exp(-rim * rim * 1.4);
      vec2 RD = -2.8 * rim * R * rimD;
      float C2 = exp(-t * uFirmness.y * 1.2) * 0.22;
      float phase2 = t * uFirmness.x - rim * 2.6;
      float cos2 = cos(phase2);
      vec2 cos2D = sin(phase2) * 2.6 * rimD;
      float ripple = (1.0 - pad) * R * C2 * cos2;
      vec2 rippleD = C2 * (-padD * R * cos2 + (1.0 - pad) * (RD * cos2 + R * cos2D));
      float dent = pad * spring + ripple;
      vec2 dentD = padD * spring + pad * springD + rippleD;
      float wobbleT = exp(-t * uFirmness.y * 0.75) * sin(t * uFirmness.x * 0.5 * uBounce.y) * uFirmness.z;
      float wobbleX = exp(-dist * dist * 0.2);
      float wobble = wobbleX * wobbleT;
      vec2 wobbleD = -0.4 * dist * wobbleX * wobbleT * dd;
      float front = dist - t * 3.0;
      float Fe = exp(-front * front * 2.5);
      float splashK = exp(-t * uFirmness.y * 0.8) * uBounce.x / (1.0 + t * 3.0);
      float phase3 = t * uFirmness.x - dist * 2.0;
      float splash = Fe * sin(phase3) * splashK;
      vec2 splashD = splashK * Fe * (-5.0 * front * sin(phase3) - 2.0 * cos(phase3)) * dd;
      float cheekT = exp(-t * uFirmness.y * 0.38) * sin(t * uFirmness.x * 0.42 * uBounce.y) * uFirmness.z * 3.2;
      float cheekX = exp(-dist * dist * 0.08);
      float cheek = cheekBody * cheekX * cheekT;
      vec2 cheekD = cheekT * cheekX * (cheekBodyD - cheekBody * 0.16 * dist * dd);
      float m = mix(0.15, 1.0, sameCheek);
      vec2 mD = 0.85 * sameD;
      float sum = dent + wobble + splash;
      float amp = sum * m + cheek;
      vec2 ampD = (dentD + wobbleD + splashD) * m + sum * mD + cheekD;
      float L = length(dir) * 0.3 / r;
      vec3 qt = q - n * dot(q, n);
      vec3 st = -qt * dent * L;
      vec3 stA = -((ta - n * tn.x) * dent + qt * dentD.x) * L;
      vec3 stB = -((tb - n * tn.y) * dent + qt * dentD.y) * L;
      hits += (dir * amp + st * sameCheek) * onset;
      hA += (dir * ampD.x + stA * sameCheek + st * sameD.x) * onset;
      hB += (dir * ampD.y + stB * sameCheek + st * sameD.y) * onset;
    }
    float limit = uBounds.w * 0.07 * uFirmness.w;
    float amount = length(hits);
    if (amount > 0.0) {
      float th = tanh(amount / limit);
      float f = limit * th / amount;
      float fd = ((1.0 - th * th) - f) / amount;
      vec3 u = hits / amount;
      vec3 hfA = hA * f + hits * fd * dot(u, hA);
      vec3 hfB = hB * f + hits * fd * dot(u, hB);
      d += hits * f * hold;
      dA += hfA * hold + hits * f * holdD.x;
      dB += hfB * hold + hits * f * holdD.y;
    }
    return d;
  }
`;

const VERTEX_NORMAL = `
  vec3 restPosition = position + riseFrom * (1.0 - uRise);
  vec3 restNormal = normalize(mix(riseNormal, normal, uRise));
  vec3 objectNormal = restNormal;
  vec3 jiggled = restPosition;
  vRestPosition = restPosition;
  vStretch = stretch;
  vPlant = plant;
  vFabricPush = 0.0;
  if (uJiggleActive > 0.5) {
    float give = 1.0 - stiffness;
    vec3 helper = abs(objectNormal.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 tangentA = normalize(cross(objectNormal, helper));
    vec3 tangentB = cross(objectNormal, tangentA);
    vec3 slopeA;
    vec3 slopeB;
    jiggled = restPosition + jiggleSlope(restPosition, restNormal, tangentA, tangentB, slopeA, slopeB) * give;
    vFabricPush = lastFabricPush * uLingerie.z;
    objectNormal = normalize(cross(tangentA + slopeA * give, tangentB + slopeB * give));
  }
  if (plant > 0.5) {
    vec3 rel = restPosition - uStemBase;
    float reach = length(rel) / uBounds.w;
    float w = pow(smoothstep(0.1, 0.62, reach), 1.4);
    vec3 th = uLeafBend * w + uLeafAxis.xyz * sin(uTime * 9.0 + reach * 14.0) * 0.05 * uLeafAxis.w * w;
    vec3 follow = uJiggleActive > 0.5 ? jiggle(uStemBase, vec3(0.0, 1.0, 0.0)) : vec3(0.0);
    jiggled = uStemBase + turnBy(rel, th) + follow;
    objectNormal = turnBy(restNormal, th);
  }
  vRubTilt = vec4(0.0);
  if (uGrabPull.w > 0.0) {
    float k = length(restPosition - uGrab.xyz) / uGrabDent.w;
    float soften = smoothstep(0.0, uBounds.w * 0.004, length(uGrabDent.xyz)) * exp(-k * k * 1.2);
    vRubTilt = vec4(normalMatrix * (objectNormal - restNormal) * soften * 0.9, soften);
  }
  #ifdef USE_TANGENT
    vec3 objectTangent = vec3(tangent.xyz);
  #endif
`;

const MARKER_HEADER = `
  uniform vec4 uMarker;
  uniform vec3 uMarkerAxisX;
  uniform vec3 uMarkerAxisY;
  uniform vec3 uMarkerColor;
  uniform float uMarkerShown;
  uniform float uMarkerShape;
  uniform vec2 uMarkerStyle;

  float markerShape(vec2 p, float r) {
    if (uMarkerShape > 1.5) {
      float w = r * 0.7;
      float reach = r - w;
      return length(vec2(p.x, p.y - clamp(p.y, -reach, reach))) - w;
    }
    if (uMarkerShape > 0.5) {
      float ry = p.y > 0.0 ? r * 1.1 : r * 0.9;
      return (length(vec2(p.x / r, p.y / ry)) - 1.0) * r;
    }
    return length(p) - r;
  }

  // fwidth needs every pixel on the same path, so nothing may return early before it.
  float markerAmount() {
    vec3 q = vRestPosition - uMarker.xyz;
    vec3 normal = cross(uMarkerAxisX, uMarkerAxisY);
    float d = markerShape(vec2(dot(q, uMarkerAxisX), dot(q, uMarkerAxisY)), uMarker.w);
    float pixels = d / max(fwidth(d), 1e-6);
    float ring = 1.0 - smoothstep(uMarkerStyle.x - 0.5, uMarkerStyle.x + 0.5, abs(pixels));
    float inside = (1.0 - smoothstep(-0.5, 0.5, pixels)) * uMarkerStyle.y;
    float near = step(abs(dot(q, normal)), uMarker.w);
    return max(ring, inside) * near * uMarkerShown;
  }
`;

const OIL_BLOBS = 64;

const FRAGMENT_HEADER = `
  uniform sampler2D uSkinLow;
  uniform float uSkinSharp;
  uniform float uRipe;
  uniform vec3 uRipeFrame;
  uniform float uRipeTime;
  uniform float uRipeModes[8];
  uniform vec2 uRipeSpan;
  uniform float uLeafRipe;
  uniform float uLeafReach;
  varying float vPlant;
  uniform vec3 uRingCenter;
  uniform vec3 uRingAxisX;
  uniform vec3 uRingAxisY;
  uniform vec3 uRingAxisZ;
  uniform vec3 uRingColor;
  uniform float uRingShine;
  uniform float uRingIgnite;
  uniform float uTime;
  uniform vec4 uCutPlane;
  uniform float uCutSide;
  uniform float uStemY;
  uniform float uEnvSpecular;
  uniform vec3 uStemBase;
  uniform mat3 normalMatrix;
  varying float vStretch;
  varying vec4 vRubTilt;

  vec3 ringSparkle(vec3 viewPosition, vec3 n, float rough) {
    vec3 r = reflect(normalize(viewPosition), n);
    float facing = dot(r, uRingAxisZ);
    if (facing <= 0.0) return vec3(0.0);
    float t = dot(uRingCenter - viewPosition, uRingAxisZ) / facing;
    if (t <= 0.0) return vec3(0.0);
    vec3 d = viewPosition + r * t - uRingCenter;
    vec2 p = vec2(dot(d, uRingAxisX), dot(d, uRingAxisY));
    float radius = length(p);
    float slot = 6.28318530718 / ${RING.POINTS}.0;
    float angle = atan(p.y, p.x) + slot * 0.5;
    float along = (mod(angle, slot) - slot * 0.5) * ${RING.RADIUS.toFixed(2)};
    float across = radius - ${RING.RADIUS.toFixed(2)};
    float index = mod(floor(angle / slot), ${RING.POINTS}.0);
    float fromTop = abs(index - ${RING.POINTS / 4}.0);
    float order = min(fromTop, ${RING.POINTS}.0 - fromTop) / ${RING.POINTS / 2}.0;
    float lit = smoothstep(order * 0.65, order * 0.65 + 0.35, uRingIgnite);
    float spread = (0.2 + rough * 0.8) * (1.0 + (1.0 - lit) * 1.5);
    float point = exp(-(along * along + across * across) / (spread * spread)) * lit;
    float band = exp(-(across * across) / (spread * spread * 2.0)) * rough * 0.6 * smoothstep(0.0, 0.5, uRingIgnite);
    return uRingColor * (point + band) * uRingShine * pow(0.2 / spread, 1.2);
  }

  uniform float uHeat;
  uniform vec4 uPrints[${PEACH_CONFIG.MAX_PRINTS}];
  uniform vec4 uPrintNormals[${PEACH_CONFIG.MAX_PRINTS}];
  uniform vec4 uPrintUps[${PEACH_CONFIG.MAX_PRINTS}];
  uniform float uPrintDefinitions[${PEACH_CONFIG.MAX_PRINTS}];
  uniform sampler2D uPrintTexture;
  uniform sampler2D uPaddleTexture;
  uniform sampler2D uKissTexture;
  uniform float uPrintKind[${PEACH_CONFIG.MAX_PRINTS}];
  uniform float uPrintInk;
  varying vec3 vRestPosition;
  varying float vFabricPush;
  ${MARKER_HEADER}
  uniform vec4 uOilBlobs[${OIL_BLOBS}];
  uniform float uOilCount;
  uniform float uOilDepth;

  float oilFalloff(float x) {
    float f = x * 5.0;
    if (f < 1.0) return mix(0.5, 0.444, f);
    if (f < 2.0) return mix(0.444, 0.311, f - 1.0);
    if (f < 3.0) return mix(0.311, 0.172, f - 2.0);
    if (f < 4.0) return mix(0.172, 0.075, f - 3.0);
    return mix(0.075, 0.0, f - 4.0);
  }

  // A blob with a negative radius joins the one before it, so a drip's trail reads as one line however thin it gets.
  float oilField() {
    float f = 0.0;
    float chain = 0.0;
    vec4 prev = vec4(0.0);
    for (int i = 0; i < ${OIL_BLOBS}; i++) {
      if (float(i) >= uOilCount) break;
      vec4 blob = uOilBlobs[i];
      float r = abs(blob.w);
      vec3 q = vRestPosition - blob.xyz;
      if (blob.w < 0.0) {
        vec3 ab = blob.xyz - prev.xyz;
        float t = clamp(dot(vRestPosition - prev.xyz, ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0);
        q = vRestPosition - (prev.xyz + ab * t);
        r = mix(abs(prev.w), r, t);
      } else {
        f += chain;
        chain = 0.0;
      }
      prev = blob;
      float reach = r * 1.8;
      float d2 = dot(q, q);
      if (d2 < reach * reach) chain = max(chain, oilFalloff(sqrt(d2) / reach));
    }
    return min(f + chain, 1.0);
  }

  vec3 oilBump(vec3 position, vec3 n, float height, float face) {
    vec3 sx = dFdx(position);
    vec3 sy = dFdy(position);
    vec3 r1 = cross(sy, n);
    vec3 r2 = cross(n, sx);
    float det = dot(sx, r1) * face;
    vec2 dh = vec2(dFdx(height), dFdy(height));
    vec3 grad = sign(det) * (dh.x * r1 + dh.y * r2);
    return normalize(abs(det) * n - grad);
  }

  vec2 handprintMask() {
    vec2 m = vec2(0.0);
    for (int i = 0; i < ${PEACH_CONFIG.MAX_PRINTS}; i++) {
      float age = uTime - uPrints[i].w;
      if (age < 0.0 || age > ${PEACH_CONFIG.PRINT_LIFE.toFixed(1)}) continue;
      vec3 q = vRestPosition - uPrints[i].xyz;
      vec3 n = uPrintNormals[i].xyz;
      vec3 up = uPrintUps[i].xyz;
      float size = uPrintUps[i].w;
      vec2 uv = vec2(dot(q, cross(n, up)) / size, dot(q, up) / abs(size)) + 0.5;
      if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) continue;
      float wrap = 1.0 - smoothstep(0.15, 0.45, abs(dot(q, n)) / abs(size));
      float rise = smoothstep(0.0, 0.15, age);
      float fade = 1.0 - smoothstep(${(PEACH_CONFIG.PRINT_LIFE * 0.3).toFixed(1)}, ${PEACH_CONFIG.PRINT_LIFE.toFixed(1)}, age);
      float kind = uPrintKind[i];
      vec3 print = kind > 1.5 ? texture2D(uKissTexture, uv).rgb : kind > 0.5 ? texture2D(uPaddleTexture, uv).rgb : texture2D(uPrintTexture, uv).rgb;
      float lips = kind > 1.5 ? 1.0 : kind > 0.5 ? 0.0 : uPrintInk;
      float definition = uPrintDefinitions[i] * smoothstep(0.15, 1.8, age);
      float shape = mix(print.b * 0.8, print.r, definition);
      float mark = shape * wrap * rise * fade * uPrintNormals[i].w;
      m += vec2(mark, mark * lips);
    }
    return vec2(min(m.x, 1.0), m.x > 0.0 ? m.y / m.x : 0.0);
  }

  ${LINGERIE_COMMON}

  uniform vec3 uFabricColor;

  float surfaceArc(vec3 p) {
    vec2 r = p.xz - uBounds.xz;
    vec2 side = normalize(uCreaseSide.xz);
    float angle = atan(dot(r, vec2(-side.y, side.x)), abs(dot(r, side)));
    return angle * length(r) / uBounds.w;
  }

  float tulle(vec2 q) {
    vec2 net = q * 170.0;
    net.x += 0.5 * mod(floor(net.y), 2.0);
    float thread = smoothstep(0.33, 0.47, length(fract(net) - 0.5));
    return mix(thread, 0.3, smoothstep(0.25, 0.6, fwidth(net.x)));
  }

  float rosette(vec2 f, float size, float aa) {
    float r = length(f) / size;
    float a = atan(f.y, f.x) + 1.5708;
    float outline = 0.62 + 0.38 * abs(cos(a * 2.5));
    float w = aa / size + 0.04;
    float petals = 1.0 - smoothstep(outline - w, outline, r);
    float eye = smoothstep(0.16, 0.16 + w, r);
    float veins = 1.0 - 0.7 * smoothstep(0.9, 1.0, cos(a * 5.0)) * step(0.3, r);
    float cord = 1.0 - smoothstep(0.0, 0.08 + w, abs(r - outline));
    return max(petals * eye * veins * 0.85, cord);
  }

  float roseMotif(vec2 f, float size, float aa) {
    float r = length(f) / size;
    if (r > 1.3) return 0.0;
    float a = atan(f.y, f.x);
    float w = aa / size + 0.05;
    float petals = 0.0;
    for (int k = 1; k <= 3; k++) {
      float fk = float(k);
      float ring = fk / 3.0 * (0.88 + 0.12 * cos(a * (2.0 + fk * 2.0) + fk * 1.9));
      petals = max(petals, 1.0 - smoothstep(0.0, 0.07 + w, abs(r - ring)));
    }
    float fill = (1.0 - smoothstep(0.96, 1.0 + w, r)) * 0.4;
    float heart = 1.0 - smoothstep(0.14, 0.14 + w, r);
    return max(max(petals, fill), heart);
  }

  float romance(vec2 q, float aa) {
    float scale = 6.5;
    vec2 g = vec2(q.x + q.y, q.y - q.x) * scale;
    vec2 f = fract(g) - 0.5;
    float s = aa * scale * 1.4;
    vec2 stem = f - vec2(0.0, 0.06);
    float m = roseMotif(stem, 0.22, s);
    m = max(m, rosette(stem - vec2(0.21, -0.2), 0.075, s));
    m = max(m, rosette(stem - vec2(-0.21, -0.2), 0.075, s));
    m = max(m, 1.0 - smoothstep(0.018, 0.018 + s, length(stem - vec2(0.0, -0.3))));
    float waveX = 0.035 * sin(f.y * 12.566);
    float waveY = 0.035 * sin(f.x * 12.566);
    float vine = max(
      1.0 - smoothstep(0.006, 0.016 + s, abs(abs(f.x) - 0.5 + waveX)),
      1.0 - smoothstep(0.006, 0.016 + s, abs(abs(f.y) - 0.5 + waveY))
    );
    float knot = 1.0 - smoothstep(0.03, 0.03 + s, length(abs(f) - vec2(0.5)));
    return max(max(m, vine * 0.55), knot * 0.85);
  }

  vec4 lingerie() {
    if (uLingerie.x < 0.5 || uLingerie.z <= 0.0) return vec4(0.0);
    vec3 p = vRestPosition;
    float h = heightOf(p);
    float back = backness(p);
    float across = acrossOf(p, uCutPlane, h, back);
    float waist = waistLine();
    float aa = max(fwidth(h), fwidth(across)) * 0.8 + 1e-4;
    vec2 shape = fabricDistance(across, h, back);
    if (shape.x > 0.03 && (h < waist - 0.05 || h > waist + 0.01)) return vec4(0.0);
    vec2 q = vec2(surfaceArc(p), h - waist);

    float scallopOn = 1.0 - smoothstep(waist - 0.07, waist - 0.035, h);
    float count = 24.0;
    float period = 1.0 / count;
    float radius = period * 0.5;
    vec2 c = vec2((fract((q.y + abs(q.x)) * count) - 0.5) * period, shape.x + radius * 0.25);
    float outline = mix(shape.x, min(length(c) - radius, shape.x), scallopOn);
    float panel = 1.0 - smoothstep(-aa, aa, outline);
    float cord = (1.0 - smoothstep(0.0015 - aa, 0.0015 + aa, abs(outline + 0.0019))) * scallopOn;
    float header = (1.0 - smoothstep(0.0008 - aa, 0.0008 + aa, abs(shape.x + 0.0075))) * scallopOn;
    float picot = 0.0;
    for (int k = 1; k <= 3; k++) {
      float angle = 3.14159 * float(k) / 4.0;
      vec2 spot = vec2(cos(angle), sin(angle)) * (radius + 0.003);
      picot = max(picot, 1.0 - smoothstep(0.0014, 0.0014 + aa, length(c - spot)));
    }
    picot *= scallopOn;
    float edgeFlower = rosette(vec2(c.x, shape.x + 0.014), 0.0068, aa) * scallopOn;

    float body = romance(q, aa) * (1.0 - smoothstep(-0.028, -0.025, shape.x));
    float net = tulle(q);
    float alpha = panel * max(0.18 + net * 0.3, max(body * 0.92, edgeFlower));

    float panelTop = mix(0.3, 0.282, smoothstep(-0.3, 0.3, back));
    float sweep = 1.0 - smoothstep(panelTop - 0.01, panelTop + 0.06, softAbs(across));
    float trimCount = 60.0;
    float trimU = fract(q.x * trimCount) - 0.5;
    float trimBump = sqrt(max(0.0, 1.0 - 4.0 * trimU * trimU));
    float trimBottom = waist - (0.03 + trimBump * 0.008) * sweep;
    float trim = (1.0 - smoothstep(-aa, aa, trimBottom - h))
      * (1.0 - smoothstep(-aa, aa, h - waist))
      * step(0.02, sweep);
    float trimCord = (1.0 - smoothstep(0.0012 - aa, 0.0012 + aa, abs(h - trimBottom - 0.0016))) * trim;
    float trimFlower = rosette(vec2(trimU / trimCount, h - waist + 0.016 * sweep), 0.0062 * max(sweep, 0.05), aa) * trim;
    vec2 corner = vec2(softAbs(across) - panelTop, h - waist + 0.022);
    float medallion = rosette(corner, 0.013, aa) * smoothstep(-0.2, 0.2, back);
    float medallionRing = (1.0 - smoothstep(0.0012 - aa, 0.0012 + aa, abs(length(corner) - 0.016))) * smoothstep(-0.2, 0.2, back);
    alpha = max(alpha, trim * max(max(trimFlower, net * 0.45), trimCord));
    alpha = max(alpha, max(medallion, medallionRing) * step(h, waist));
    alpha = max(alpha, max(max(cord, picot) * 0.9, header * 0.9 * panel));
    return vec4(uFabricColor, alpha * uLingerie.z);
  }

  uniform vec4 uSkinLook;
  uniform vec3 uSkinGlint;
  uniform vec4 uSkinPattern;
  uniform vec3 uSkinDeep;
  #ifdef SKIN_FADE
    uniform float uSkinFade;
    uniform vec3 uSkinFadeGlow;
  #endif

  float skinHash(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }

  float skinNoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    vec2 e = vec2(1.0, 0.0);
    return mix(
      mix(mix(skinHash(i), skinHash(i + e.xyy), f.x), mix(skinHash(i + e.yxy), skinHash(i + e.xxy), f.x), f.y),
      mix(mix(skinHash(i + e.yyx), skinHash(i + e.xyx), f.x), mix(skinHash(i + e.yxx), skinHash(i + e.xxx), f.x), f.y),
      f.z);
  }

  float skinFbm(vec3 p) {
    return skinNoise(p) * 0.55 + skinNoise(p * 2.1 + 3.1) * 0.3 + skinNoise(p * 4.3 + 7.7) * 0.15;
  }


  float skinGlitter(vec3 p, vec3 n, vec3 toEye) {
    vec3 q = p / uBounds.w * 70.0;
    vec3 cell = floor(q);
    float h = skinHash(cell);
    if (h < 0.55) return 0.0;
    vec3 jitter = vec3(skinHash(cell + 1.7), skinHash(cell + 4.3), skinHash(cell + 9.1)) - 0.5;
    float spot = smoothstep(0.3, 0.0, length(fract(q) - 0.5 - jitter * 0.5));
    float glint = pow(max(dot(normalize(n + jitter * 1.6), toEye), 0.0), 40.0);
    float twinkle = 0.6 + 0.4 * sin(uTime * (1.5 + h * 4.0) + h * 60.0);
    return spot * glint * twinkle * 3.0;
  }

  float skinDrips(vec3 p) {
    float y = (p.y - uBounds.y) / uBounds.w + 0.5;
    vec2 around = p.xz - uBounds.xz;
    float a = atan(around.y, around.x) / 6.28318530718 + 0.5;
    vec2 ring = vec2(cos(a * 6.28318530718), sin(a * 6.28318530718));
    float rim = 0.68 + (skinFbm(vec3(ring * 2.2, 0.0)) - 0.5) * 0.14 + (skinNoise(vec3(ring * 7.0, 1.0)) - 0.5) * 0.03;
    float coat = y - rim;
    float slot = floor(a * 14.0);
    float h = skinHash(vec3(slot, 3.7, 1.3));
    if (h < 0.2) return coat;
    float dx = (fract(a * 14.0) - 0.5 - (h - 0.5) * 0.3) / 14.0 * 6.28318530718 * length(around) / uBounds.w;
    dx += sin(y * 30.0 + h * 17.0) * 0.004;
    float width = 0.014 + fract(h * 3.7) * 0.02;
    float bulbY = rim - (0.05 + fract(h * 7.31) * 0.3) * (0.92 + 0.08 * sin(uTime * 0.4 + h * 20.0));
    float t = clamp((rim - y) / max(rim - bulbY, 0.001), 0.0, 1.0);
    float stream = length(vec2(dx, y - mix(rim, bulbY, t))) - width * mix(0.85, 0.55, t);
    float bulb = length(vec2(dx, (y - bulbY - width * 0.3) * 0.6)) - width * 0.72;
    float join = clamp(0.5 + 0.5 * (bulb - stream) / 0.02, 0.0, 1.0);
    float drip = -(mix(bulb, stream, join) - 0.02 * join * (1.0 - join));
    float k = 0.03;
    float blend = clamp(0.5 + 0.5 * (drip - coat) / k, 0.0, 1.0);
    return mix(coat, drip, blend) + k * blend * (1.0 - blend);
  }

  vec3 skinFinish(vec3 n, float leaf, float honey) {
    vec3 light = vec3(0.0);
    vec3 toEye = normalize(vViewPosition);
    light += uSkinDeep * honey * pow(1.0 - clamp(dot(n, toEye), 0.0, 1.0), 3.0) * 0.4;
    if (uSkinLook.y > 0.0)
      light += uSkinGlint * skinGlitter(vRestPosition, n, toEye) * uSkinLook.y;
    return light * (1.0 - leaf);
  }
`;

const FABRIC_FRAGMENT = `
  if (uCutSide != 0.0 && (dot(vRestPosition, uCutPlane.xyz) - uCutPlane.w) * uCutSide < 0.0) discard;
  vec4 garment = lingerie();
  if (garment.a < 0.02) discard;
  diffuseColor = vec4(garment.rgb, garment.a);
`;

const MAP_SAMPLE = `
  #include <map_fragment>
  #ifndef USE_MAP
    vec4 sampledDiffuseColor = vec4(1.0);
  #endif
`;

const SKIN_SAMPLE = `
  #ifdef USE_MAP
    vec4 sampledDiffuseColor = texture2D(map, vMapUv);
    if (uSkinSharp < 1.0) sampledDiffuseColor = mix(texture2D(uSkinLow, vMapUv), sampledDiffuseColor, uSkinSharp);
    diffuseColor *= sampledDiffuseColor;
  #else
    vec4 sampledDiffuseColor = vec4(1.0);
  #endif
`;

const CUT_RULE = `
  float leaf = smoothstep(0.02, 0.12, sampledDiffuseColor.g - sampledDiffuseColor.r);
  #ifdef PEACH_CUT
  if (uCutSide != 0.0) {
    float stem = step(max(sampledDiffuseColor.r, max(sampledDiffuseColor.g, sampledDiffuseColor.b)), 0.5);
    bool attached = leaf > 0.5 || stem > 0.5 || vRestPosition.y > uStemY;
    float cutSide = (dot(vRestPosition, uCutPlane.xyz) - uCutPlane.w) * uCutSide;
    if (attached ? uCutSide < 0.0 : cutSide < 0.0) discard;
  }
  #endif
`;

const CUT_TEST = MAP_SAMPLE + CUT_RULE;

// Where the UVs stretch (stem hole, filled side crease) the fuzz comes from the rest position instead.
const HOLE_FUZZ = `
  float holeFuzz = max(1.0 - smoothstep(0.1, 0.14, length(vRestPosition - uStemBase) / uBounds.w), vStretch);
  if (holeFuzz > 0.0) {
    vec3 objectNormal = normalize(oilBase * normalMatrix);
    vec3 facing = pow(abs(objectNormal), vec3(4.0));
    facing /= facing.x + facing.y + facing.z;
    vec3 q = vRestPosition / uBounds.w * 0.42;
    vec2 tx = texture2D(normalMap, q.zy).xy * 2.0 - 1.0;
    vec2 ty = texture2D(normalMap, q.xz).xy * 2.0 - 1.0;
    vec2 tz = texture2D(normalMap, q.xy).xy * 2.0 - 1.0;
    vec3 tilt = vec3(0.0, tx.y, tx.x) * facing.x + vec3(ty.x, 0.0, ty.y) * facing.y + vec3(tz, 0.0) * facing.z;
    vec3 holeNormal = normalize(oilBase + normalMatrix * tilt * normalScale.x);
    normal = normalize(mix(normal, holeNormal, holeFuzz));
  }
`;

const FRAGMENT_COLOR = `
  ${SKIN_SAMPLE}
  ${CUT_RULE}
  #ifdef SKIN_FADE
    float fadeFacing = clamp(dot(normalize(vNormal), normalize(vViewPosition)), 0.0, 1.0);
    float fadeAt = mix(skinFbm(vRestPosition / uBounds.w * 5.0), 1.0 - fadeFacing, 0.55);
    if (fadeAt < uSkinFade) discard;
    float fadeLine = 1.0 - smoothstep(0.0, 0.012, fadeAt - uSkinFade);
    float fadeTint = 1.0 - smoothstep(0.0, 0.06, fadeAt - uSkinFade);
  #endif
  float skinLum = dot(sampledDiffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  diffuseColor.rgb = mix(diffuseColor.rgb, diffuse * (0.55 + skinLum * 1.2), uSkinLook.x * (1.0 - leaf));
  diffuseColor.rgb = mix(diffuseColor.rgb, sampledDiffuseColor.rgb, leaf);
  float skinHoney = 0.0;
  float skinHoneyHeight = 0.0;
  if (uSkinPattern.x > 1.5) {
    float field = skinDrips(vRestPosition);
    float keep = uSkinPattern.y * (1.0 - leaf);
    float thick = smoothstep(0.0, 0.07, field);
    skinHoney = smoothstep(-0.003, 0.003, field) * keep;
    skinHoneyHeight = skinHoney * (0.35 + 0.65 * thick);
    vec3 glaze = diffuseColor.rgb * mix(vec3(1.0, 0.8, 0.45), uSkinDeep * 1.5, thick) + uSkinDeep * 0.06 * thick;
    diffuseColor.rgb = mix(diffuseColor.rgb, glaze, skinHoney);
  }
  vec2 marks = handprintMask();
  float welt = marks.x * (1.0 - leaf);
  vec3 ink = mix(diffuseColor.rgb * vec3(1.02, 0.42, 0.46), vec3(0.62, 0.0, 0.08), marks.y);
  diffuseColor.rgb = mix(diffuseColor.rgb, ink, welt * mix(0.55, 0.95, marks.y));
  diffuseColor.rgb *= mix(vec3(1.0), vec3(1.08, 0.7, 0.72), uHeat * 0.6);
  if (uLingerie.x > 0.5 && uLingerie.z > 0.0) {
    diffuseColor.rgb *= 1.0 - fabricShadow(vRestPosition, uCutPlane) * uLingerie.z * (1.0 - leaf);
    float squeeze = smoothstep(0.0, 0.6, -vFabricPush) * (1.0 - leaf);
    float swell = smoothstep(0.2, 1.4, vFabricPush) * (1.0 - leaf);
    diffuseColor.rgb *= mix(vec3(1.0), vec3(1.03, 0.72, 0.75), squeeze * 0.8) * mix(vec3(1.0), vec3(1.05, 0.95, 0.94), swell * 0.5);
  }
  if (uRipe < 1.15 || uLeafRipe < 1.0) {
    // Measured on screen like the intro still: x and y projected to the depth of the peach centre.
    vec2 ripeScreen = -vViewPosition.xy / vViewPosition.z * uRipeFrame.x;
    float ripeAcross = ripeScreen.x / uRipeFrame.y;
    float ripeHeight = (ripeScreen.y - uRipeFrame.z) / uRipeFrame.y + 0.5;
    float spanT = clamp((ripeAcross - uRipeSpan.x) / (uRipeSpan.y - uRipeSpan.x), 0.0, 1.0);
    float slosh = 0.0;
    for (int i = 0; i < 8; i++) slosh += uRipeModes[i] * cos(float(i + 1) * PI * spanT);
    float ripeLine = uRipe * 1.02 - 0.02 + sin(uRipeTime * 1.4) * 0.02 * ripeAcross + slosh;
    float below = ripeLine - ripeHeight;
    float unripe = smoothstep(-0.0005, 0.0096, -below);
    float leafPart = max(leaf, step(0.5, vPlant));
    vec3 fromStem = vRestPosition - uStemBase;
    float leafWave = sin(atan(fromStem.z, fromStem.x) * 5.0 + uRipeTime * 3.0) * 0.03;
    float leafFront = uLeafRipe * 1.08 - 0.04;
    float leafUnripe = uLeafRipe >= 1.0 ? 0.0 : smoothstep(leafFront - 0.02, leafFront + 0.02, length(fromStem) / uLeafReach + leafWave);
    unripe = mix(unripe, leafUnripe, leafPart);
    float juice = (1.0 - unripe) * (1.0 - leafPart) * (1.0 - smoothstep(1.0, 1.15, uRipe));
    vec3 ripeColour = mix(diffuseColor.rgb, vec3(0.47, 0.078, 0.196), juice * 0.16 * (1.0 - smoothstep(0.0, 0.45, ripeHeight)));
    float unripeGray = dot(diffuseColor.rgb, vec3(0.3, 0.59, 0.11));
    diffuseColor.rgb = mix(ripeColour, vec3(unripeGray) * vec3(0.5, 0.42, 0.58) * 0.55, unripe);
  }
`;

export const PRINT_KIND = { tool: 0, paddle: 1, kiss: 2 };

const PRINT_SHAPES = {
  hand: {
    blur(ctx, x) {
      ctx.beginPath();
      ctx.ellipse(126 + x, 150, 62, 80, 0, 0, Math.PI * 2);
      ctx.fill();
    },
    sharp(ctx, x) {
      ctx.beginPath();
      ctx.ellipse(128 + x, 172, 48, 54, 0, 0, Math.PI * 2);
      ctx.fill();
      const fingers = [
        [96, 128, -0.2, 78, 22],
        [121, 122, -0.06, 92, 23],
        [146, 124, 0.08, 84, 22],
        [163, 141, 0.3, 70, 18],
        [86, 180, -0.95, 62, 25],
      ];
      fingers.forEach(([fx, fy, angle, length, width]) => {
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(fx + x, fy);
        ctx.lineTo(
          fx + x + Math.sin(angle) * length,
          fy - Math.cos(angle) * length,
        );
        ctx.stroke();
      });
      // Fills the notch where the pinky's outer edge meets the palm.
      ctx.beginPath();
      ctx.moveTo(128 + x, 150);
      ctx.lineTo(163 + x, 141);
      ctx.lineTo(175 + x, 132);
      ctx.bezierCurveTo(178 + x, 148, 179 + x, 160, 176 + x, 174);
      ctx.closePath();
      ctx.fill();
    },
  },
  lips: {
    blur(ctx, x) {
      ctx.beginPath();
      ctx.ellipse(128 + x, 136, 70, 34, 0, 0, Math.PI * 2);
      ctx.fill();
    },
    sharp(ctx, x) {
      ctx.beginPath();
      ctx.moveTo(43 + x, 130);
      ctx.bezierCurveTo(70 + x, 100, 100 + x, 86, 118 + x, 100);
      ctx.quadraticCurveTo(128 + x, 108, 138 + x, 100);
      ctx.bezierCurveTo(156 + x, 86, 186 + x, 100, 213 + x, 130);
      ctx.bezierCurveTo(170 + x, 122, 86 + x, 122, 43 + x, 130);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(48 + x, 137);
      ctx.bezierCurveTo(90 + x, 133, 166 + x, 133, 208 + x, 137);
      ctx.bezierCurveTo(184 + x, 188, 72 + x, 188, 48 + x, 137);
      ctx.fill();
    },
  },
};

function drawPrint(shape) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, size, size);

  // Only the offset shadow lands on the canvas, which gives a clean blur.
  const off = size * 4;
  ctx.globalCompositeOperation = "lighter";
  ctx.shadowOffsetX = off;
  ctx.lineCap = "round";
  [
    ["#00f", 34, shape.blur],
    ["#f00", 9, shape.sharp],
  ].forEach(([color, blur, draw]) => {
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    draw(ctx, -off);
  });

  return new CanvasTexture(canvas);
}

function generateFuzzNormalMap() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(size, size);
  const noise = (x, y) => {
    const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
    return v - Math.floor(v);
  };
  const fbm = (x, y) => {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    for (let i = 0; i < 4; i += 1) {
      value += amplitude * noise(x * frequency, y * frequency);
      amplitude *= 0.5;
      frequency *= 2;
    }
    return value * 0.3;
  };
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const h0 = fbm(x / size, y / size);
      const nx = h0 - fbm((x + 1) / size, y / size);
      const ny = h0 - fbm(x / size, (y + 1) / size);
      const len = Math.sqrt(nx * nx + ny * ny + 1);
      const i = (y * size + x) * 4;
      image.data[i] = (nx / len / 2 + 0.5) * 255;
      image.data[i + 1] = (ny / len / 2 + 0.5) * 255;
      image.data[i + 2] = (1 / len / 2 + 0.5) * 255;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return texture;
}

function computeSmoothNormals(geometry) {
  const pos = geometry.attributes.position.array;
  const vertexCount = pos.length / 3;
  const index = geometry.index
    ? geometry.index.array
    : Array.from({ length: vertexCount }, (_, i) => i);

  const slots = new Map();
  const slotOf = new Uint32Array(vertexCount);
  for (let i = 0; i < vertexCount; i += 1) {
    const key = `${Math.round(pos[i * 3] * 1e4)},${Math.round(
      pos[i * 3 + 1] * 1e4,
    )},${Math.round(pos[i * 3 + 2] * 1e4)}`;
    if (!slots.has(key)) slots.set(key, slots.size);
    slotOf[i] = slots.get(key);
  }

  const sums = new Float32Array(slots.size * 3);
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  for (let i = 0; i < index.length; i += 3) {
    a.fromArray(pos, index[i] * 3);
    b.fromArray(pos, index[i + 1] * 3);
    c.fromArray(pos, index[i + 2] * 3);
    c.sub(b);
    a.sub(b);
    c.cross(a);
    for (let k = 0; k < 3; k += 1) {
      const s = slotOf[index[i + k]] * 3;
      sums[s] += c.x;
      sums[s + 1] += c.y;
      sums[s + 2] += c.z;
    }
  }

  const normals = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount; i += 1) {
    const s = slotOf[i] * 3;
    a.set(sums[s], sums[s + 1], sums[s + 2]).normalize();
    a.toArray(normals, i * 3);
  }
  geometry.setAttribute("normal", new BufferAttribute(normals, 3));
}

const positionSlots = (pos) => {
  const slots = new Map();
  const slotOf = new Uint32Array(pos.count);
  for (let i = 0; i < pos.count; i += 1) {
    const key = `${Math.round(pos.getX(i) * 1e4)},${Math.round(
      pos.getY(i) * 1e4,
    )},${Math.round(pos.getZ(i) * 1e4)}`;
    if (!slots.has(key)) slots.set(key, slots.size);
    slotOf[i] = slots.get(key);
  }
  return { slotOf, count: slots.size };
};

// Neighbouring edges split too so no cracks open; midpoints bend 3/4 of the way onto the curved surface.
function refine(geometry, split) {
  const { position: pos, normal: nor, uv } = geometry.attributes;
  const index = geometry.index.array;
  const { slotOf, count } = positionSlots(pos);
  const edge = (i, j) => {
    const a = slotOf[i];
    const b = slotOf[j];
    return a < b ? a * count + b : b * count + a;
  };
  const keys = new Float64Array(index.length);
  const marked = new Set();
  for (let t = 0; t < index.length; t += 3) {
    for (let k = 0; k < 3; k += 1) {
      const i = index[t + k];
      const j = index[t + ((k + 1) % 3)];
      keys[t + k] = edge(i, j);
      if (split(i, j)) marked.add(keys[t + k]);
    }
  }
  let changed = true;
  while (changed) {
    changed = false;
    for (let t = 0; t < index.length; t += 3) {
      const cuts =
        marked.has(keys[t]) + marked.has(keys[t + 1]) + marked.has(keys[t + 2]);
      if (cuts === 2) {
        marked.add(keys[t]);
        marked.add(keys[t + 1]);
        marked.add(keys[t + 2]);
        changed = true;
      }
    }
  }

  const positions = Array.from(pos.array);
  const normals = Array.from(nor.array);
  const uvs = uv ? Array.from(uv.array) : null;
  const parents = [];
  const midpoints = new Map();
  const a = new Vector3();
  const b = new Vector3();
  const na = new Vector3();
  const nb = new Vector3();
  const m = new Vector3();
  const project = (q, p, n) =>
    q.clone().addScaledVector(n, -q.clone().sub(p).dot(n));
  const midpoint = (i, j) => {
    const key = Math.min(i, j) * pos.count + Math.max(i, j);
    if (midpoints.has(key)) return midpoints.get(key);
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, j);
    na.fromBufferAttribute(nor, i);
    nb.fromBufferAttribute(nor, j);
    m.copy(a).add(b).multiplyScalar(0.5);
    const curved = project(m, a, na)
      .add(project(m, b, nb))
      .multiplyScalar(0.5);
    m.lerp(curved, 0.75);
    const k = positions.length / 3;
    positions.push(m.x, m.y, m.z);
    const n = na.add(nb).normalize();
    normals.push(n.x, n.y, n.z);
    if (uvs) {
      uvs.push((uv.getX(i) + uv.getX(j)) / 2, (uv.getY(i) + uv.getY(j)) / 2);
    }
    parents.push(i, j);
    midpoints.set(key, k);
    return k;
  };

  const faces = [];
  for (let t = 0; t < index.length; t += 3) {
    const v = [index[t], index[t + 1], index[t + 2]];
    const cut = [0, 1, 2].map((k) => marked.has(keys[t + k]));
    const cuts = cut.filter(Boolean).length;
    if (cuts === 0) faces.push(...v);
    else if (cuts === 3) {
      const [i, j, k] = v;
      const ij = midpoint(i, j);
      const jk = midpoint(j, k);
      const ki = midpoint(k, i);
      faces.push(i, ij, ki, ij, j, jk, ki, jk, k, ij, jk, ki);
    } else {
      const s = cut.indexOf(true);
      const i = v[s];
      const j = v[(s + 1) % 3];
      const k = v[(s + 2) % 3];
      const ij = midpoint(i, j);
      faces.push(i, ij, k, ij, j, k);
    }
  }

  const result = new BufferGeometry();
  result.setAttribute("position", new Float32BufferAttribute(positions, 3));
  result.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  if (uvs) result.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  result.setIndex(faces);
  computeSmoothNormals(result);
  return { geometry: result, parents: Uint32Array.from(parents) };
}

function carry(values, parents) {
  const out = new Float32Array(values.length + parents.length / 2);
  out.set(values);
  for (let k = 0; k < parents.length; k += 2) {
    out[values.length + k / 2] =
      (values[parents[k]] + values[parents[k + 1]]) / 2;
  }
  return out;
}

async function loadImage(url) {
  const image = new Image();
  image.src = url;
  await image.decode();
  return image;
}

function skinTexture(image) {
  const map = new Texture(image);
  map.flipY = false;
  map.colorSpace = SRGBColorSpace;
  map.wrapS = RepeatWrapping;
  map.wrapT = RepeatWrapping;
  map.needsUpdate = true;
  return map;
}

export function sampleTexture(map) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(map.image, 0, 0, size, size);
  const pixels = context.getImageData(0, 0, size, size).data;
  const linear = (c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return (u, v) => {
    const x = Math.min(size - 1, Math.max(0, Math.floor(u * size)));
    const row = map.flipY ? 1 - v : v;
    const y = Math.min(size - 1, Math.max(0, Math.floor(row * size)));
    const i = (y * size + x) * 4;
    return [linear(pixels[i]), linear(pixels[i + 1]), linear(pixels[i + 2])];
  };
}

// Spreads by distance on the skin, so the soft-fuzz area is the same on any mesh.
function computeStretch(geometry, plant) {
  const pos = geometry.attributes.position;
  const { uv } = geometry.attributes;
  const stretch = new Float32Array(pos.count);
  if (!uv) return stretch;
  const index = geometry.index.array;
  const slots = new Map();
  const slotOf = new Uint32Array(pos.count);
  for (let i = 0; i < pos.count; i += 1) {
    const key = `${pos.getX(i).toFixed(5)},${pos.getY(i).toFixed(5)},${pos.getZ(i).toFixed(5)}`;
    if (!slots.has(key)) slots.set(key, slots.size);
    slotOf[i] = slots.get(key);
  }
  const worst = new Float32Array(slots.size);
  const a = new Vector3();
  const e1 = new Vector3();
  const e2 = new Vector3();
  const tu = new Vector3();
  const tv = new Vector3();
  for (let t = 0; t < index.length; t += 3) {
    const [i, j, k] = [index[t], index[t + 1], index[t + 2]];
    a.fromBufferAttribute(pos, i);
    e1.fromBufferAttribute(pos, j).sub(a);
    e2.fromBufferAttribute(pos, k).sub(a);
    const du1 = uv.getX(j) - uv.getX(i);
    const dv1 = uv.getY(j) - uv.getY(i);
    const du2 = uv.getX(k) - uv.getX(i);
    const dv2 = uv.getY(k) - uv.getY(i);
    const det = du1 * dv2 - du2 * dv1;
    if (Math.abs(det) > 1e-12) {
      tu.copy(e1)
        .multiplyScalar(dv2)
        .addScaledVector(e2, -dv1)
        .divideScalar(det);
      tv.copy(e2)
        .multiplyScalar(du1)
        .addScaledVector(e1, -du2)
        .divideScalar(det);
      const p = tu.lengthSq();
      const q = tu.dot(tv);
      const r = tv.lengthSq();
      const spread = Math.sqrt(((p - r) / 2) ** 2 + q * q);
      const ratio = Math.sqrt(
        ((p + r) / 2 + spread) / Math.max(1e-12, (p + r) / 2 - spread),
      );
      [i, j, k].forEach((v) => {
        worst[slotOf[v]] = Math.max(worst[slotOf[v]], ratio);
      });
    }
  }
  const n = slots.size;
  const base = worst.map((w) => Math.min(1, Math.max(0, (w - 1.08) / 0.2)));
  const at = new Float32Array(n * 3);
  let low = Infinity;
  let high = -Infinity;
  for (let i = 0; i < pos.count; i += 1) {
    at[slotOf[i] * 3] = pos.getX(i);
    at[slotOf[i] * 3 + 1] = pos.getY(i);
    at[slotOf[i] * 3 + 2] = pos.getZ(i);
    low = Math.min(low, pos.getY(i));
    high = Math.max(high, pos.getY(i));
  }
  const reach = STRETCH_REACH * (high - low);
  const soft = STRETCH_SOFT * (high - low);
  const limit = Math.max(reach, soft * 2.5);
  const degree = new Uint32Array(n + 1);
  for (let f = 0; f < index.length; f += 1) degree[slotOf[index[f]] + 1] += 2;
  for (let s = 0; s < n; s += 1) degree[s + 1] += degree[s];
  const fill = degree.slice(0, n);
  const links = new Uint32Array(degree[n]);
  for (let f = 0; f < index.length; f += 3) {
    for (let k = 0; k < 3; k += 1) {
      const p = slotOf[index[f + k]];
      const q = slotOf[index[f + ((k + 1) % 3)]];
      links[fill[p]] = q;
      fill[p] += 1;
      links[fill[q]] = p;
      fill[q] += 1;
    }
  }
  const lengths = new Float32Array(links.length);
  for (let u = 0; u < n; u += 1) {
    for (let l = degree[u]; l < degree[u + 1]; l += 1) {
      const v = links[l];
      lengths[l] = Math.sqrt(
        (at[u * 3] - at[v * 3]) ** 2 +
          (at[u * 3 + 1] - at[v * 3 + 1]) ** 2 +
          (at[u * 3 + 2] - at[v * 3 + 2]) ** 2,
      );
    }
  }
  const dist = new Float32Array(n).fill(Infinity);
  const queue = new Uint32Array(n);
  const seen = new Uint32Array(n);
  const ringStart = new Uint32Array(n + 1);
  let ringNodes = new Uint32Array(n * 32);
  let ringDist = new Float32Array(n * 32);
  let filled = 0;
  for (let s = 0; s < n; s += 1) {
    let seenCount = 1;
    let queued = 1;
    seen[0] = s;
    queue[0] = s;
    dist[s] = 0;
    while (queued) {
      let best = 0;
      for (let q = 1; q < queued; q += 1) {
        if (dist[queue[q]] < dist[queue[best]]) best = q;
      }
      const u = queue[best];
      queued -= 1;
      queue[best] = queue[queued];
      for (let l = degree[u]; l < degree[u + 1]; l += 1) {
        const v = links[l];
        const d = dist[u] + lengths[l];
        if (d <= limit && d < dist[v]) {
          if (dist[v] === Infinity) {
            seen[seenCount] = v;
            seenCount += 1;
            queue[queued] = v;
            queued += 1;
          }
          dist[v] = d;
        }
      }
    }
    if (filled + seenCount > ringNodes.length) {
      const grownNodes = new Uint32Array(ringNodes.length * 2);
      const grownDist = new Float32Array(ringDist.length * 2);
      grownNodes.set(ringNodes);
      grownDist.set(ringDist);
      ringNodes = grownNodes;
      ringDist = grownDist;
    }
    for (let k = 0; k < seenCount; k += 1) {
      ringNodes[filled] = seen[k];
      ringDist[filled] = dist[seen[k]];
      dist[seen[k]] = Infinity;
      filled += 1;
    }
    ringStart[s + 1] = filled;
  }
  const peak = new Float32Array(n);
  for (let s = 0; s < n; s += 1) {
    for (let k = ringStart[s]; k < ringStart[s + 1]; k += 1) {
      if (ringDist[k] <= reach) peak[s] = Math.max(peak[s], base[ringNodes[k]]);
    }
  }
  const mask = new Float32Array(n);
  const spreadWidth = 2 * soft * soft;
  for (let s = 0; s < n; s += 1) {
    let sum = 0;
    let weight = 0;
    for (let k = ringStart[s]; k < ringStart[s + 1]; k += 1) {
      const w = Math.exp(-(ringDist[k] * ringDist[k]) / spreadWidth);
      sum += peak[ringNodes[k]] * w;
      weight += w;
    }
    mask[s] = sum / weight;
  }
  for (let i = 0; i < pos.count; i += 1) {
    stretch[i] = plant?.[i] > 0.5 ? 0 : mask[slotOf[i]];
  }
  return stretch;
}

function computeStiffness(geometry, map, stemY) {
  const pos = geometry.attributes.position;
  const { uv } = geometry.attributes;
  const slots = new Map();
  const slotOf = new Uint32Array(pos.count);
  for (let i = 0; i < pos.count; i += 1) {
    const key = `${Math.round(pos.getX(i) * 1e4)},${Math.round(
      pos.getY(i) * 1e4,
    )},${Math.round(pos.getZ(i) * 1e4)}`;
    if (!slots.has(key)) slots.set(key, slots.size);
    slotOf[i] = slots.get(key);
  }

  const index = geometry.index.array;
  const base = new Float32Array(slots.size);
  if (map?.image && uv) {
    const sample = sampleTexture(map);
    const island = new Uint32Array(pos.count).map((_, i) => i);
    const root = (i) => {
      let r = i;
      while (island[r] !== r) {
        island[r] = island[island[r]];
        r = island[r];
      }
      return r;
    };
    for (let t = 0; t < index.length; t += 3) {
      const a = root(index[t]);
      island[root(index[t + 1])] = a;
      island[root(index[t + 2])] = a;
    }
    const plant = new Map();
    for (let i = 0; i < pos.count; i += 1) {
      const [r, g, b] = sample(uv.getX(i), uv.getY(i));
      const dark = Math.max(r, g, b) < 0.5;
      const leaf = g - r > 0.07 || (dark && g >= 0.6 * r);
      const stem = dark && pos.getY(i) > stemY;
      const tally = plant.get(root(i)) || [0, 0];
      tally[0] += leaf || stem ? 1 : 0;
      tally[1] += 1;
      plant.set(root(i), tally);
    }
    // The leaf underside is dark red like the crease, so rigidity follows the leaf's UV island.
    for (let i = 0; i < pos.count; i += 1) {
      const [hits, total] = plant.get(root(i));
      if (hits >= total * 0.3) base[slotOf[i]] = 1;
    }
  }

  const heightOf = new Float32Array(slots.size);
  for (let i = 0; i < pos.count; i += 1) heightOf[slotOf[i]] = pos.getY(i);
  let rim = -Infinity;
  let floor = Infinity;
  for (let s = 0; s < slots.size; s += 1) {
    if (base[s]) floor = Math.min(floor, heightOf[s]);
    else rim = Math.max(rim, heightOf[s]);
  }
  const rigid = base.map((isRigid, s) => {
    if (!isRigid) return 0;
    const t = Math.min(1, Math.max(0, (heightOf[s] - floor) / (rim - floor)));
    return t * t * (3 - 2 * t);
  });

  let current = rigid;
  for (let pass = 0; pass < 6; pass += 1) {
    const sums = new Float32Array(slots.size);
    const counts = new Uint16Array(slots.size);
    for (let t = 0; t < index.length; t += 3) {
      for (let k = 0; k < 3; k += 1) {
        const a = slotOf[index[t + k]];
        const b = slotOf[index[t + ((k + 1) % 3)]];
        sums[a] += current[b];
        sums[b] += current[a];
        counts[a] += 1;
        counts[b] += 1;
      }
    }
    const next = new Float32Array(slots.size);
    for (let s = 0; s < slots.size; s += 1) {
      next[s] = Math.max(rigid[s], counts[s] ? sums[s] / counts[s] : 0);
    }
    current = next;
  }

  const stiffness = new Float32Array(pos.count);
  const plant = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i += 1) {
    stiffness[i] = current[slotOf[i]];
    plant[i] = base[slotOf[i]];
  }
  const fit = { stiffness, plant, stemBase: null, leafAxis: null };
  const stemBase = new Vector3();
  let count = 0;
  for (let i = 0; i < pos.count; i += 1) {
    if (plant[i] && pos.getY(i) < floor + 0.01 * (rim - floor)) {
      stemBase.x += pos.getX(i);
      stemBase.y += pos.getY(i);
      stemBase.z += pos.getZ(i);
      count += 1;
    }
  }
  if (!count) return fit;
  stemBase.divideScalar(count);
  const reach = 0.3 * (rim - floor);
  const leafCenter = new Vector3();
  let leafCount = 0;
  for (let i = 0; i < pos.count; i += 1) {
    if (plant[i]) {
      const dx = pos.getX(i) - stemBase.x;
      const dy = pos.getY(i) - stemBase.y;
      const dz = pos.getZ(i) - stemBase.z;
      if (Math.hypot(dx, dy, dz) > reach) {
        leafCenter.x += dx;
        leafCenter.y += dy;
        leafCenter.z += dz;
        leafCount += 1;
      }
    }
  }
  fit.stemBase = stemBase;
  fit.leafAxis = leafCount ? leafCenter.normalize() : null;
  return fit;
}

export class Peach {
  constructor(group) {
    this.group = group;
    this.mesh = null;
    this.material = null;
    this.hitSlot = 0;
    this.printSlot = 0;
    this.lastHitTime = -Infinity;
    this.oil = 0;
    this.shine = 0;
    this.ringIgnite = 0;
    this.skinTint = new Color(PEACH_CONFIG.SKIN_TINT);
    this.wetTint = new Color(0xe07f86);
    this.skinRoughness = 1;
    this.skinCoat = 0;
    this.skinGloss = false;
    this.uniforms = {
      uRingCenter: { value: new Vector3() },
      uRingAxisX: { value: new Vector3() },
      uRingAxisY: { value: new Vector3() },
      uRingAxisZ: { value: new Vector3() },
      uRingColor: { value: new Color(RING.COLOR).multiplyScalar(2.2) },
      uRingShine: { value: 0 },
      uMarker: { value: new Vector4() },
      uMarkerAxisX: { value: new Vector3(1, 0, 0) },
      uMarkerAxisY: { value: new Vector3(0, 1, 0) },
      uMarkerColor: { value: new Color() },
      uMarkerShape: { value: 0 },
      uMarkerStyle: { value: new Vector2(0.75, 0) },
      uMarkerShown: { value: 0 },
      uRingIgnite: { value: 0 },
      uRise: { value: 1 },
      uEnvSpecular: { value: 1 },
      uTime: { value: 0 },
      uJiggleActive: { value: 0 },
      uFirmness: { value: new Vector4(19, 3.2, 0.45, 1) },
      uBounce: { value: new Vector3(0, 1, 0.75) },
      uCrease: { value: new Vector4(1, 0, 0, 0) },
      uHeat: { value: 0 },
      uHits: { value: this.emptySlots(PEACH_CONFIG.MAX_HITS) },
      uHitDirs: { value: this.emptySlots(PEACH_CONFIG.MAX_HITS) },
      uPrints: { value: this.emptySlots(PEACH_CONFIG.MAX_PRINTS) },
      uPrintNormals: { value: this.emptySlots(PEACH_CONFIG.MAX_PRINTS) },
      uPrintUps: { value: this.emptySlots(PEACH_CONFIG.MAX_PRINTS) },
      uPrintDefinitions: { value: new Array(PEACH_CONFIG.MAX_PRINTS).fill(0) },
      uPrintTexture: { value: null },
      uPaddleTexture: { value: null },
      uKissTexture: { value: null },
      uPrintKind: { value: new Array(PEACH_CONFIG.MAX_PRINTS).fill(0) },
      uPrintInk: { value: 0 },
      uGrab: { value: new Vector4(0, 0, 0, 1) },
      uGrabPull: { value: new Vector4() },
      uGrabDent: { value: new Vector4(0, 0, 0, 1) },
      uBounds: { value: new Vector4(0, 0, 0, 1) },
      uLingerie: { value: new Vector4(0, 0, 0, 0.7) },
      uCreaseCurve: { value: new Array(CURVE_SLOTS).fill(0) },
      uBridgeMap: { value: null },
      uFabric: {
        value: new Vector4(
          FABRIC.rest,
          FABRIC.press,
          FABRIC.bulge,
          FABRIC.width,
        ),
      },
      uFabricWobble: { value: 0 },
      uFabricDepth: { value: FABRIC.depth },
      uFabricColor: { value: new Color(NOIR[0]) },
      uCreaseSide: { value: new Vector3(1, 0, 0) },
      uOilBlobs: {
        value: Array.from({ length: OIL_BLOBS }, () => new Vector4()),
      },
      uOilCount: { value: 0 },
      uOilDepth: { value: 0.045 },
      uSkinLook: { value: new Vector4() },
      uSkinLow: { value: null },
      uSkinSharp: { value: 1 },
      uRipe: { value: 1 },
      uRipeFrame: { value: new Vector3(1, 1, 0) },
      uRipeTime: { value: 0 },
      uRipeModes: { value: new Array(8).fill(0) },
      uRipeSpan: { value: new Vector2(-0.6, 0.6) },
      uLeafRipe: { value: 1 },
      uLeafReach: { value: 1 },
      uSkinGlint: { value: new Color() },
      uSkinPattern: { value: new Vector4() },
      uSkinDeep: { value: new Color() },
    };
    this.printTextures = {};
    this.setTool("hand");
    this.uniforms.uKissTexture.value = drawPrint(PRINT_SHAPES.lips);
    this.uniforms.uCutPlane = { value: this.uniforms.uCrease.value };
    this.uniforms.uCutSide = { value: 0 };
    this.uniforms.uStemY = { value: 1e4 };
    this.uniforms.uStemBase = { value: new Vector3(0, 1e4, 0) };
    this.uniforms.uLeafBend = { value: new Vector3() };
    this.uniforms.uLeafAxis = { value: new Vector4(1, 0, 0, 0) };
    this.inverseWorld = new Matrix4();
    this.tempA = new Vector3();
    this.tempB = new Vector3();
  }

  setOilBlobs(blobs) {
    const scale = this.worldScale();
    const slots = this.uniforms.uOilBlobs.value;
    const count = Math.min(OIL_BLOBS, blobs.length);
    for (let n = 0; n < count; n += 1) {
      const { at, r, link } = blobs[n];
      slots[n].set(at.x, at.y, at.z, ((link ? -1 : 1) * r) / scale);
    }
    this.uniforms.uOilCount.value = count;
  }

  // eslint-disable-next-line class-methods-use-this
  emptySlots(count) {
    return Array.from({ length: count }, () => new Vector4(0, 0, 0, -1e4));
  }

  async load(onProgress) {
    const previewImage = await loadImage(SKIN_PREVIEW);
    // The skin texture is filled in place later, so materials copied from it pick up the full skin too.
    const skin = skinTexture(previewImage);
    this.uniforms.uSkinLow.value = skinTexture(previewImage);
    this.uniforms.uSkinSharp.value = 0;
    return new Promise((resolve) => {
      new GLTFLoader().load(
        peachyModel,
        (gltf) => {
          let found = null;
          gltf.scene.traverse((child) => {
            if (child.isMesh && !found) found = child;
          });
          this.install(gltf.scene, found, skin);
          resolve(this.mesh);
        },
        (event) => {
          if (event.total) onProgress(event.loaded / event.total);
        },
        (error) => {
          // eslint-disable-next-line no-console
          console.error("Peach model failed to load, using a sphere:", error);
          const mesh = new Mesh(new SphereGeometry(0.5, 96, 64));
          this.install(mesh, mesh, null);
          resolve(this.mesh);
        },
      );
    });
  }

  // Resolves with the full skin image, or null when it fails and the preview has to do.
  static fetchSkin(onProgress) {
    const loader = new FileLoader().setResponseType("blob");
    return new Promise((resolve) => {
      loader.load(
        peachySkin,
        async (blob) => {
          const url = URL.createObjectURL(blob);
          try {
            resolve(await loadImage(url));
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Peach skin did not decode:", error);
            resolve(null);
          }
          URL.revokeObjectURL(url);
        },
        (event) => {
          if (event.total) onProgress(event.loaded / event.total);
        },
        (error) => {
          // eslint-disable-next-line no-console
          console.error("Peach skin failed to load:", error);
          resolve(null);
        },
      );
    });
  }

  applySkin(image) {
    if (!image) {
      this.uniforms.uSkinSharp.value = 1;
      return;
    }
    const { map } = this.material;
    // The GPU storage is sized for the preview, so it has to be freed before the bigger image goes in.
    map.dispose();
    map.image = image;
    map.needsUpdate = true;
    this.sharpenTime = 0;
  }

  applyPlant({ stiffness, plant, stemBase, leafAxis }) {
    [this.body, this.dressed].forEach(({ geometry, parents }) => {
      [
        ["stiffness", stiffness],
        ["plant", plant],
      ].forEach(([name, values]) => {
        const carried = carry(values, parents);
        const attribute = geometry.attributes[name];
        if (!attribute) {
          geometry.setAttribute(name, new BufferAttribute(carried, 1));
          return;
        }
        attribute.array.set(carried);
        attribute.needsUpdate = true;
      });
    });
    if (!stemBase) return;
    this.uniforms.uStemBase.value.copy(stemBase);
    const { position } = this.base.attributes;
    let reach = 0;
    for (let i = 0; i < position.count; i += 1) {
      if (plant[i] > 0.5)
        reach = Math.max(
          reach,
          Math.hypot(
            position.getX(i) - stemBase.x,
            position.getY(i) - stemBase.y,
            position.getZ(i) - stemBase.z,
          ),
        );
    }
    if (reach) this.uniforms.uLeafReach.value = reach;
    if (leafAxis) this.uniforms.uLeafAxis.value.set(...leafAxis.toArray(), 0);
  }

  // Swapping leaf stiffness moves the leaf, so it is worked out while loading and applied in the squash at game start.
  planPlant() {
    const { map } = this.material;
    if (!map || map.image === this.plantImage) return;
    if (this.plantPlan?.image === map.image) return;
    this.plantPlan = {
      image: map.image,
      fit: computeStiffness(this.base, map, this.uniforms.uStemY.value),
    };
  }

  fitPlant() {
    this.planPlant();
    const plan = this.plantPlan;
    if (!plan) return;
    this.plantPlan = null;
    this.plantImage = plan.image;
    this.applyPlant(plan.fit);
  }

  // Extra vertices go where the light model shows it: the crease and the leaf curl, and the waistband while lingerie is on.
  buildShapes(base, plant) {
    const c = this.uniforms.uCrease.value;
    const b = this.uniforms.uBounds.value;
    const pos = base.attributes.position;
    const nor = base.attributes.normal.array;
    const bend = (i, j) =>
      nor[i * 3] * nor[j * 3] +
      nor[i * 3 + 1] * nor[j * 3 + 1] +
      nor[i * 3 + 2] * nor[j * 3 + 2];
    const mid = this.tempA;
    const detailed = (i, j) => {
      if ((plant[i] > 0.5 || plant[j] > 0.5) && bend(i, j) <= LEAF_BEND)
        return true;
      mid
        .fromBufferAttribute(pos, i)
        .add(this.tempB.fromBufferAttribute(pos, j))
        .multiplyScalar(0.5);
      const across = Math.abs(mid.dot(c) - c.w) / b.w;
      return (
        across < CREASE_STRIP.width &&
        (mid.y - b.y) / b.w + 0.5 < CREASE_STRIP.top
      );
    };
    this.body = refine(base, detailed);

    const { slotOf, count } = positionSlots(pos);
    const edgeOf = (i, j) =>
      Math.min(slotOf[i], slotOf[j]) * count + Math.max(slotOf[i], slotOf[j]);
    const edges = new Map();
    let lengths = 0;
    let angles = 0;
    const index = base.index.array;
    for (let t = 0; t < index.length; t += 3) {
      for (let k = 0; k < 3; k += 1) {
        const i = index[t + k];
        const j = index[t + ((k + 1) % 3)];
        const key = edgeOf(i, j);
        if (!edges.has(key)) {
          const length = mid
            .fromBufferAttribute(pos, i)
            .distanceTo(this.tempB.fromBufferAttribute(pos, j));
          const angle = Math.acos(Math.min(1, Math.max(-1, bend(i, j))));
          edges.set(key, [length, angle]);
          lengths += length;
          angles += angle;
        }
      }
    }
    const weight = angles / lengths;
    this.dressed = refine(base, (i, j) => {
      const [length, angle] = edges.get(edgeOf(i, j));
      return detailed(i, j) || length * (angle + weight * length) > EDGE_SPLIT;
    });
    this.riseAttributes(base.attributes.position.count);
  }

  // The lingerie mesh can sit exactly on the body mesh's surface and light, so the swap between them blends instead of jumping.
  riseAttributes(baseCount) {
    const bodyNormals = this.body.geometry.attributes.normal.array;
    const bodyMid = new Map();
    for (let k = 0; k < this.body.parents.length; k += 2) {
      const i = this.body.parents[k];
      const j = this.body.parents[k + 1];
      bodyMid.set(
        Math.min(i, j) * baseCount + Math.max(i, j),
        baseCount + k / 2,
      );
    }
    const { geometry, parents } = this.dressed;
    const pos = geometry.attributes.position.array;
    const from = new Float32Array(pos.length);
    const normal = new Float32Array(pos.length);
    normal.set(bodyNormals.subarray(0, baseCount * 3));
    for (let k = 0; k < parents.length; k += 2) {
      const i = parents[k];
      const j = parents[k + 1];
      const v = (baseCount + k / 2) * 3;
      const twin = bodyMid.get(Math.min(i, j) * baseCount + Math.max(i, j));
      for (let c = 0; c < 3; c += 1) {
        if (twin === undefined) {
          from[v + c] = (pos[i * 3 + c] + pos[j * 3 + c]) / 2 - pos[v + c];
          normal[v + c] = bodyNormals[i * 3 + c] + bodyNormals[j * 3 + c];
        } else normal[v + c] = bodyNormals[twin * 3 + c];
      }
    }
    geometry.setAttribute("riseFrom", new BufferAttribute(from, 3));
    geometry.setAttribute("riseNormal", new BufferAttribute(normal, 3));
    this.body.geometry.setAttribute(
      "riseFrom",
      new BufferAttribute(new Float32Array(bodyNormals.length), 3),
    );
    this.body.geometry.setAttribute(
      "riseNormal",
      new BufferAttribute(Float32Array.from(bodyNormals), 3),
    );
  }

  useShape({ geometry }) {
    const old = this.mesh.geometry;
    if (old === geometry) return;
    let root = this.group;
    while (root.parent) root = root.parent;
    root.traverse((node) => {
      // eslint-disable-next-line no-param-reassign
      if (node.geometry === old) node.geometry = geometry;
    });
  }

  install(root, mesh, map) {
    const model = root;
    const box = new Box3().setFromObject(model);
    const scale = PEACH_CONFIG.TARGET_MODEL_HEIGHT / box.getSize(this.tempA).y;
    model.scale.multiplyScalar(scale);
    box.setFromObject(model);
    model.position.sub(box.getCenter(this.tempA));
    model.rotation.y = (PEACH_CONFIG.MODEL_ROTATION_DEGREES * Math.PI) / 180;

    this.base = mesh.geometry;
    computeSmoothNormals(this.base);
    this.findCrease(this.base);
    this.plantImage = map?.image;
    const plant = computeStiffness(this.base, map, this.uniforms.uStemY.value);
    this.buildShapes(this.base, plant.plant);
    this.applyPlant(plant);
    const stretch = computeStretch(this.base, plant.plant);
    [this.body, this.dressed].forEach(({ geometry, parents }) => {
      geometry.setAttribute(
        "stretch",
        new BufferAttribute(carry(stretch, parents), 1),
      );
      boxesFor(geometry);
    });
    // eslint-disable-next-line no-param-reassign
    mesh.geometry = this.body.geometry;
    this.findCrease(mesh.geometry);
    const fuzz = generateFuzzNormalMap();
    this.material = new MeshPhysicalMaterial({
      map,
      color: new Color(PEACH_CONFIG.SKIN_TINT),
      roughness: 1,
      metalness: 0,
      normalMap: fuzz,
      normalScale: new Vector2(0.5, 0.5),
      clearcoatNormalMap: fuzz,
      clearcoatNormalScale: new Vector2(0.04, 0.04),
      sheen: 0.45,
      iridescence: 0.001,
      iridescenceIOR: 1.45,
      iridescenceThicknessRange: [200, 420],
      sheenRoughness: 0.8,
      sheenColor: new Color(0xffd6d0),
      clearcoat: 0.001,
      clearcoatRoughness: 1,
      envMapIntensity: 0.3,
      side: DoubleSide,
    });
    this.material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms);
      /* eslint-disable no-param-reassign */
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\n${VERTEX_HEADER}`)
        .replace("#include <beginnormal_vertex>", VERTEX_NORMAL)
        .replace("#include <begin_vertex>", "vec3 transformed = jiggled;");
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", `#include <common>\n${FRAGMENT_HEADER}`)
        .replace("#include <map_fragment>", FRAGMENT_COLOR)
        .replace(
          "#include <roughnessmap_fragment>",
          "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.6 * roughnessFactor, leaf);\nroughnessFactor = mix(roughnessFactor, 0.08, skinHoney);\nfloat oilF = oilField();\nfloat oilSpot = smoothstep(0.19, 0.22, oilF);\nfloat oilHeight = sqrt(clamp((oilF - 0.2) / 0.3, 0.0, 1.0));\nroughnessFactor = mix(roughnessFactor, 0.12, oilSpot);\nvec3 oilWet = pow(max(diffuseColor.rgb, vec3(0.0)), vec3(1.15)) * 0.88;\noilWet *= 1.0 - (1.0 - smoothstep(0.0, 0.35, oilHeight)) * 0.14;\ndiffuseColor.rgb = mix(diffuseColor.rgb, oilWet, oilSpot * 0.65 * (1.0 - metalness));",
        )
        .replace(
          "#include <metalnessmap_fragment>",
          "#include <metalnessmap_fragment>\nmetalnessFactor *= 1.0 - leaf * uSkinPattern.z;",
        )
        .replace(
          "#include <lights_physical_fragment>",
          "#include <lights_physical_fragment>\n#ifdef USE_SHEEN\nmaterial.sheenColor *= 1.0 - leaf;\n#endif\n#ifdef USE_CLEARCOAT\nmaterial.clearcoat = max(material.clearcoat, oilSpot * (1.0 - uSkinPattern.w));\nmaterial.clearcoatRoughness = mix(material.clearcoatRoughness, 0.1, oilSpot);\nmaterial.clearcoat = max(material.clearcoat, skinHoney);\nmaterial.clearcoatRoughness = mix(material.clearcoatRoughness, 0.04, skinHoney);\n#endif\n#ifdef USE_IRIDESCENCE\nmaterial.iridescence = max(oilSpot * 0.7 * (1.0 - uSkinPattern.w), uSkinLook.z);\n#endif",
        )
        .replace(
          "#include <lights_fragment_maps>",
          "#include <lights_fragment_maps>\nradiance *= mix(uEnvSpecular, 2.2, max(oilSpot, skinHoney * 0.4));\n#ifdef USE_CLEARCOAT\nclearcoatRadiance *= mix(uEnvSpecular, 3.0, max(oilSpot, skinHoney * 0.4));\n#endif",
        )
        .replace(
          "#include <normal_fragment_maps>",
          `vec3 oilBase = normal;\n#include <normal_fragment_maps>\n${HOLE_FUZZ}\nif (uSkinPattern.x > 0.5 && uSkinPattern.x < 1.5) {\n  float facing = clamp(dot(oilBase, normalize(vViewPosition)), 0.0, 1.0);\n  diffuseColor.rgb = mix(diffuseColor.rgb, uSkinDeep, smoothstep(0.05, 1.0, facing) * uSkinPattern.y * (1.0 - leaf));\n}\nif (uSkinPattern.x > 1.5) {\n  vec3 honeyNormal = oilBump(-vViewPosition, oilBase, skinHoneyHeight * uOilDepth * 0.6, faceDirection);\n  normal = normalize(mix(normal, honeyNormal, skinHoney));\n}\nif (oilSpot > 0.0) {\n  vec3 oilNormal = oilBump(-vViewPosition, oilBase, oilHeight * uOilDepth, faceDirection);\n  normal = normalize(mix(normal, oilNormal, oilSpot));\n}`,
        )
        .replace(
          "#include <opaque_fragment>",
          `outgoingLight += skinFinish(normal, leaf, skinHoney);
          #ifdef SKIN_FADE
            outgoingLight = mix(outgoingLight, outgoingLight * 0.4 + uSkinFadeGlow * 0.5, fadeTint * 0.7) + uSkinFadeGlow * fadeLine * 0.9;
          #endif
          if (uRingShine > 0.001) {
            vec3 ringNormal = normalize(normal - vRubTilt.xyz * faceDirection);
            outgoingLight += ringSparkle(-vViewPosition, ringNormal, 0.15 + vRubTilt.w * 0.2);
          }
          #include <opaque_fragment>`,
        )
        .replace("#include <colorspace_fragment>", MARKER_FRAGMENT);
      /* eslint-enable no-param-reassign */
    };
    mesh.material = this.material;
    mesh.raycast = raycastNearest;
    Object.assign(mesh, {
      castShadow: true,
      receiveShadow: true,
      customDepthMaterial: this.depthMaterial(this.uniforms),
    });
    this.mesh = mesh;
    // Front faces draw first, so back faces behind them fail the depth test before the skin shader runs.
    this.material.side = FrontSide;
    this.material.shadowSide = DoubleSide;
    const back = new Mesh(mesh.geometry, new MeshPhysicalMaterial());
    back.renderOrder = 0.25;
    back.receiveShadow = true;
    back.raycast = () => {};
    back.onBeforeRender = () => this.syncBack();
    mesh.add(back);
    this.back = back;
    this.fabric = new Mesh(mesh.geometry, this.fabricMaterial());
    this.fabric.visible = false;
    this.fabric.receiveShadow = true;
    this.fabric.renderOrder = 1;
    mesh.add(this.fabric);
    this.bows = new RibbonBows(this, (material, skin) =>
      this.followSkin(material, skin),
    );
    mesh.add(this.bows.group);
    this.band = new Waistband(this, (material) => this.followSurface(material));
    this.band.mesh.receiveShadow = true;
    mesh.add(this.band.mesh);
    this.group.add(model);
  }

  syncBack() {
    const front = this.material;
    const back = this.back.material;
    const changed =
      this.backVersion !== front.version ||
      back.onBeforeCompile !== front.onBeforeCompile;
    back.copy(front);
    back.side = BackSide;
    back.onBeforeCompile = front.onBeforeCompile;
    if (changed) {
      this.backVersion = front.version;
      back.needsUpdate = true;
    }
  }

  followSurface(material) {
    // eslint-disable-next-line no-param-reassign
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms);
      // eslint-disable-next-line no-param-reassign
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\n${VERTEX_HEADER}`)
        .replace(
          "#include <begin_vertex>",
          "vec3 transformed = position;\nvRestPosition = position;\nif (uJiggleActive > 0.5) transformed += jiggle(position, normal);",
        );
      // eslint-disable-next-line no-param-reassign
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>\nvarying vec3 vRestPosition;\n${MARKER_HEADER}`,
        )
        .replace("#include <colorspace_fragment>", MARKER_FRAGMENT);
    };
  }

  followSkin(material, skin) {
    // eslint-disable-next-line no-param-reassign
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, this.uniforms, skin);
      // eslint-disable-next-line no-param-reassign
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>\nuniform vec3 uAnchorNormal;\nuniform mat3 uBowInverse;\nuniform mat4 uBowMatrix;\n${VERTEX_HEADER}`,
        )
        .replace(
          "#include <begin_vertex>",
          "vec3 transformed = position;\nif (uJiggleActive > 0.5) transformed += uBowInverse * jiggle((uBowMatrix * vec4(position, 1.0)).xyz, uAnchorNormal);",
        );
    };
  }

  depthMaterial(uniforms) {
    const material = new MeshDepthMaterial({
      depthPacking: RGBADepthPacking,
      map: this.material.map,
    });
    if (uniforms !== this.uniforms) material.defines = { PEACH_CUT: "" };
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      /* eslint-disable no-param-reassign */
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\n${VERTEX_HEADER}`)
        .replace(
          "#include <begin_vertex>",
          `${VERTEX_NORMAL}\nvec3 transformed = jiggled;`,
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform float uCutSide;\nuniform vec4 uCutPlane;\nuniform float uStemY;\nvarying vec3 vRestPosition;",
        )
        .replace("#include <map_fragment>", CUT_TEST);
      /* eslint-enable no-param-reassign */
    };
    return material;
  }

  fabricMaterial(uniforms = this.uniforms) {
    const material = new MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.75,
      metalness: 0,
      sheen: 1,
      sheenRoughness: 0.45,
      sheenColor: new Color(NOIR[1]),
      envMapIntensity: 0.6,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -4,
    });
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      /* eslint-disable no-param-reassign */
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>\n${VERTEX_HEADER}`)
        .replace("#include <beginnormal_vertex>", VERTEX_NORMAL)
        .replace(
          "#include <begin_vertex>",
          "vec2 radial = normalize(position.xz - uBounds.xz + 1e-5);\nvec3 transformed = jiggled + objectNormal * uBounds.w * 0.0025 + vec3(radial.x, 0.0, radial.y) * uBounds.w * bridgeLift(position, uCrease) * uLingerie.z;",
        );
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", `#include <common>\n${FRAGMENT_HEADER}`)
        .replace("#include <map_fragment>", FABRIC_FRAGMENT)
        .replace("#include <colorspace_fragment>", MARKER_FRAGMENT);
      /* eslint-enable no-param-reassign */
    };
    return material;
  }

  findCrease(geometry) {
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    const center = box.getCenter(new Vector3());
    const height = box.max.y - box.min.y;
    const pos = geometry.attributes.position;
    const bins = 72;
    const sums = new Float32Array(bins);
    const counts = new Uint32Array(bins);
    for (let i = 0; i < pos.count; i += 1) {
      const y = pos.getY(i) - center.y;
      if (Math.abs(y) < height * 0.12) {
        const x = pos.getX(i) - center.x;
        const z = pos.getZ(i) - center.z;
        const bin =
          Math.floor(((Math.atan2(z, x) + Math.PI) / (Math.PI * 2)) * bins) %
          bins;
        sums[bin] += Math.hypot(x, z);
        counts[bin] += 1;
      }
    }
    let best = 0;
    let bestRadius = Infinity;
    for (let b = 0; b < bins; b += 1) {
      const radius = counts[b] ? sums[b] / counts[b] : Infinity;
      if (radius < bestRadius) {
        bestRadius = radius;
        best = b;
      }
    }
    const angle = ((best + 0.5) / bins) * Math.PI * 2 - Math.PI;
    const normal = new Vector3(-Math.sin(angle), 0, Math.cos(angle));
    this.uniforms.uCrease.value.set(normal.x, 0, normal.z, normal.dot(center));
    this.uniforms.uBounds.value.set(center.x, center.y, center.z, height);
    this.fitCreaseCurve(geometry, center, height, box.min.y, angle, normal);
    const seamDir = new Vector3(Math.cos(angle), 0, Math.sin(angle));
    this.seamDirection = seamDir;
    this.fleshCenter = center.clone();
    this.fleshHeight = height;

    const slices = 48;
    const reach = new Float32Array(slices);
    for (let i = 0; i < pos.count; i += 1) {
      const s = Math.min(
        slices - 1,
        Math.floor(((pos.getY(i) - box.min.y) / height) * slices),
      );
      reach[s] = Math.max(
        reach[s],
        Math.hypot(pos.getX(i) - center.x, pos.getZ(i) - center.z),
      );
    }
    const widest = Math.max(...reach);
    let top = slices - 1;
    while (top > 0 && reach[top] < widest * 0.55) top -= 1;
    this.uniforms.uStemY.value =
      box.min.y + ((top + 1) / slices) * height - height * 0.1;
  }

  fitCreaseCurve(geometry, center, height, bottom, angle, normal) {
    const side = new Vector3(Math.cos(angle), 0, Math.sin(angle));
    this.uniforms.uCreaseSide.value.copy(side);
    const bins = 25;
    const span = 0.25 * height;
    const plane = normal.dot(center);
    const sums = Array.from(
      { length: CURVE_SLOTS },
      () => new Float32Array(bins),
    );
    const counts = Array.from(
      { length: CURVE_SLOTS },
      () => new Uint32Array(bins),
    );
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const dx = x - center.x;
      const dz = z - center.z;
      const r = Math.hypot(dx, dz);
      const across = x * normal.x + z * normal.z - plane;
      if (
        r > 0 &&
        (dx * side.x + dz * side.z) / r > 0.3 &&
        Math.abs(across) < span
      ) {
        const slot = Math.round(
          ((pos.getY(i) - bottom) / height) * (CURVE_SLOTS - 1),
        );
        const bin = Math.min(
          bins - 1,
          Math.floor(((across + span) / (2 * span)) * bins),
        );
        if (slot >= 0 && slot < CURVE_SLOTS) {
          sums[slot][bin] += r;
          counts[slot][bin] += 1;
        }
      }
    }
    const raw = sums.map((row, slot) => {
      let best = -1;
      let bestRadius = Infinity;
      row.forEach((sum, bin) => {
        const n = counts[slot][bin];
        if (n > 0 && sum / n < bestRadius) {
          bestRadius = sum / n;
          best = bin;
        }
      });
      return best < 0 ? 0 : (((best + 0.5) / bins) * 2 - 1) * (span / height);
    });
    const lifts = new Float32Array(bins * CURVE_SLOTS);
    sums.forEach((row, slot) => {
      const radius = Array.from(row, (sum, bin) =>
        counts[slot][bin] ? sum / counts[slot][bin] : 0,
      );
      for (let pass = 0; pass < bins; pass += 1) {
        let missing = false;
        radius.forEach((r, bin) => {
          if (r > 0) return;
          const near = [radius[bin - 1], radius[bin + 1]].filter((v) => v > 0);
          if (near.length)
            radius[bin] = near.reduce((x, y) => x + y) / near.length;
          else missing = true;
        });
        if (!missing) break;
      }
      for (let pass = 0; pass < 2; pass += 1) {
        const copy = radius.slice();
        radius.forEach((_, bin) => {
          const l = copy[Math.max(0, bin - 1)];
          const r = copy[Math.min(bins - 1, bin + 1)];
          radius[bin] = (l + copy[bin] * 2 + r) / 4;
        });
      }
      const reachBins = 4;
      radius.forEach((r, bin) => {
        if (r <= 0) return;
        let support = r;
        for (let d = 1; d <= reachBins; d += 1) {
          const l = radius[bin - d];
          const rr = radius[bin + d];
          if (l > 0 && rr > 0) support = Math.max(support, Math.min(l, rr));
        }
        lifts[slot * bins + bin] = (support - r) / height;
      });
    });
    for (let pass = 0; pass < 2; pass += 1) {
      const copy = lifts.slice();
      for (let slot = 0; slot < CURVE_SLOTS; slot += 1) {
        for (let bin = 0; bin < bins; bin += 1) {
          let sum = 0;
          let weight = 0;
          for (let ds = -1; ds <= 1; ds += 1) {
            for (let db = -1; db <= 1; db += 1) {
              const ss = slot + ds;
              const bb = bin + db;
              if (ss >= 0 && ss < CURVE_SLOTS && bb >= 0 && bb < bins) {
                const w = (ds === 0 ? 2 : 1) * (db === 0 ? 2 : 1);
                sum += copy[ss * bins + bb] * w;
                weight += w;
              }
            }
          }
          lifts[slot * bins + bin] = sum / weight;
        }
      }
    }
    const bridge = new DataTexture(
      lifts,
      bins,
      CURVE_SLOTS,
      RedFormat,
      FloatType,
    );
    bridge.minFilter = NearestFilter;
    bridge.magFilter = NearestFilter;
    bridge.needsUpdate = true;
    this.uniforms.uBridgeMap.value = bridge;

    const curve = this.uniforms.uCreaseCurve.value;
    raw.forEach((_, i) => {
      const a = raw[Math.max(0, i - 1)];
      const c = raw[Math.min(CURVE_SLOTS - 1, i + 1)];
      curve[i] = (a + raw[i] * 2 + c) / 4;
    });
  }

  refreshHalves() {
    this.cutMaterials?.forEach((material) => this.matchSkin(material));
    (this.frozenSets || []).forEach((frozen) => {
      Object.entries(this.uniforms).forEach(([key, u]) => {
        if (key === "uCutSide" || key === "uJiggleActive") return;
        const target = frozen[key];
        if (u.value?.isTexture) target.value = u.value;
        else if (u.value?.copy && target.value?.copy)
          target.value.copy(u.value);
        else if (Array.isArray(u.value))
          target.value = u.value.map((v) => v.clone?.() ?? v);
        else target.value = u.value;
      });
    });
  }

  freezeUniforms(side) {
    const frozen = {};
    Object.entries(this.uniforms).forEach(([key, u]) => {
      const cloned = u.value?.clone && !u.value.isTexture;
      frozen[key] = { value: cloned ? u.value.clone() : u.value };
    });
    frozen.uCutSide.value = side;
    frozen.uJiggleActive.value = 0;
    frozen.uMarkerShown.value = 0;
    this.frozenSets = this.frozenSets || [];
    this.frozenSets.push(frozen);
    return frozen;
  }

  fadeHalfLingerie(visible) {
    this.frozenSets?.forEach((frozen) => frozen.uLingerie.value.setZ(visible));
  }

  matchSkin(material) {
    const m = this.material;
    SKIN_PROPS.forEach((key) => {
      // eslint-disable-next-line no-param-reassign
      material[key] = m[key];
    });
    material.color.copy(m.color);
    material.sheenColor.copy(m.sheenColor);
    // eslint-disable-next-line no-param-reassign
    material.userData.moodBase = m.userData.moodBase;
  }

  cutMaterial(frozen, extra) {
    const material = this.material.clone();
    this.cutMaterials = [...(this.cutMaterials || []), material];
    Object.assign(material, extra);
    material.defines = { ...material.defines, PEACH_CUT: "" };
    material.onBeforeCompile = (shader) => {
      this.material.onBeforeCompile(shader);
      Object.assign(shader.uniforms, frozen);
    };
    return material;
  }

  stencilMaterial(frozen, extra) {
    const material = new MeshBasicMaterial({
      map: this.material.map,
      ...extra,
    });
    material.defines = { PEACH_CUT: "" };
    material.onBeforeCompile = (shader) => {
      const { uCutSide, uCutPlane, uStemY } = frozen;
      Object.assign(shader.uniforms, { uCutSide, uCutPlane, uStemY });
      /* eslint-disable no-param-reassign */
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vRestPosition;",
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvRestPosition = position;",
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform float uCutSide;\nuniform vec4 uCutPlane;\nuniform float uStemY;\nvarying vec3 vRestPosition;",
        )
        .replace("#include <map_fragment>", CUT_TEST);
      /* eslint-enable no-param-reassign */
    };
    return material;
  }

  makeHalf(side, order) {
    const half = new Group();
    half.matrixAutoUpdate = false;
    const frozen = this.freezeUniforms(side);
    const stencil = {
      colorWrite: false,
      depthWrite: false,
      depthTest: false,
      stencilWrite: true,
      stencilFunc: AlwaysStencilFunc,
    };
    const passes = [
      this.stencilMaterial(frozen, {
        ...stencil,
        side: BackSide,
        stencilZPass: IncrementWrapStencilOp,
        stencilZFail: IncrementWrapStencilOp,
        stencilFail: IncrementWrapStencilOp,
      }),
      this.stencilMaterial(frozen, {
        ...stencil,
        side: FrontSide,
        stencilZPass: DecrementWrapStencilOp,
        stencilZFail: DecrementWrapStencilOp,
        stencilFail: DecrementWrapStencilOp,
      }),
    ];
    passes.forEach((material) => {
      const mesh = new Mesh(this.mesh.geometry, material);
      mesh.renderOrder = order;
      half.add(mesh);
    });

    const plane = this.uniforms.uCrease.value;
    const normal = new Vector3(plane.x, plane.y, plane.z);
    const cap = new Mesh(
      new PlaneGeometry(2.4, this.uniforms.uStemY.value + 1.2).translate(
        0,
        (this.uniforms.uStemY.value - 1.2) / 2,
        0,
      ),
      new MeshPhysicalMaterial({
        map: this.fleshTexture(side > 0),
        roughness: 0.35,
        clearcoat: 0.9,
        sheen: 0.3,
        sheenColor: new Color(0xffe2b0),
        emissive: new Color(0xffd6a8),
        emissiveIntensity: 0,
        clearcoatRoughness: 0.1,
        stencilWrite: true,
        stencilRef: 0,
        stencilFunc: NotEqualStencilFunc,
        stencilFail: ReplaceStencilOp,
        stencilZFail: ReplaceStencilOp,
        stencilZPass: ReplaceStencilOp,
        side: DoubleSide,
      }),
    );
    cap.quaternion.setFromUnitVectors(
      new Vector3(0, 0, 1),
      normal.clone().multiplyScalar(-side),
    );
    cap.position.copy(normal).multiplyScalar(plane.w);
    cap.updateMatrix();
    const capPos = cap.geometry.attributes.position;
    const capUv = cap.geometry.attributes.uv;
    const local = new Vector3();
    const span = this.fleshHeight * 1.1;
    for (let k = 0; k < capPos.count; k += 1) {
      local
        .fromBufferAttribute(capPos, k)
        .applyMatrix4(cap.matrix)
        .sub(this.fleshCenter);
      capUv.setXY(
        k,
        0.5 + local.dot(this.seamDirection) / span,
        0.5 + local.y / span,
      );
    }
    capUv.needsUpdate = true;
    cap.renderOrder = order + 1;
    cap.receiveShadow = true;
    half.add(cap);
    half.userData.cap = cap.material;
    if (side > 0) half.add(this.makeStone(plane, normal, side, order));

    const skin = new Mesh(
      this.mesh.geometry,
      this.cutMaterial(frozen, { side: FrontSide }),
    );
    skin.renderOrder = order + 2;
    skin.castShadow = true;
    skin.receiveShadow = true;
    skin.customDepthMaterial = this.depthMaterial(frozen);
    half.add(skin);
    const fabric = new Mesh(this.mesh.geometry, this.fabricMaterial(frozen));
    fabric.receiveShadow = true;
    fabric.renderOrder = order + 3;
    half.add(fabric);
    half.userData.fabric = fabric;
    return half;
  }

  fleshTexture(withStone) {
    this.flesh = this.flesh || {};
    const key = withStone ? "stone" : "cavity";
    if (this.flesh[key]) return this.flesh[key];
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const c = size / 2;
    const pitX = c + size * 0.03;
    const pitY = c - size * 0.02;
    const pitW = size * 0.13;
    const pitH = size * 0.18;

    const base = ctx.createRadialGradient(pitX, pitY, pitW, c, c, size * 0.55);
    base.addColorStop(0, "#f0880f");
    base.addColorStop(0.5, "#f59e1c");
    base.addColorStop(1, "#f9b43a");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);

    const soft = (radiusX, radiusY, inner, outer, blur, hold = 0.6) => {
      ctx.save();
      ctx.filter = `blur(${blur}px)`;
      ctx.translate(pitX, pitY);
      ctx.scale(1, radiusY / radiusX);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, radiusX);
      g.addColorStop(0, inner);
      g.addColorStop(hold, inner);
      g.addColorStop(1, outer);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, radiusX, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    soft(
      pitW * 2.4,
      pitH * 2,
      "rgba(220, 60, 30, 0.7)",
      "rgba(255, 150, 60, 0)",
      26,
      0.3,
    );

    ctx.save();
    ctx.filter = "blur(9px)";
    ctx.translate(pitX, pitY);
    const rays = 16;
    for (let i = 0; i < rays; i += 1) {
      const angle = (i / rays) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const reach = 1.7 + Math.random() * 0.9;
      const spread = 0.1 + Math.random() * 0.08;
      const ray = ctx.createLinearGradient(
        0,
        0,
        Math.cos(angle) * pitW * reach,
        Math.sin(angle) * pitH * reach,
      );
      ray.addColorStop(0, "rgba(185, 10, 30, 1)");
      ray.addColorStop(0.55, "rgba(200, 25, 35, 0.75)");
      ray.addColorStop(1, "rgba(235, 80, 50, 0)");
      ctx.fillStyle = ray;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(
        Math.cos(angle - spread) * pitW * reach,
        Math.sin(angle - spread) * pitH * reach,
      );
      ctx.lineTo(
        Math.cos(angle + spread) * pitW * reach,
        Math.sin(angle + spread) * pitH * reach,
      );
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    soft(
      pitW * 1.3,
      pitH * 1.22,
      "rgba(120, 6, 24, 1)",
      "rgba(185, 25, 40, 0)",
      7,
      0.7,
    );
    if (!withStone) {
      soft(
        pitW * 1.03,
        pitH,
        "rgba(90, 4, 18, 1)",
        "rgba(140, 16, 32, 0)",
        6,
        0.75,
      );
      soft(
        pitW * 0.7,
        pitH * 0.72,
        "rgba(55, 2, 12, 0.95)",
        "rgba(95, 8, 22, 0)",
        10,
        0.3,
      );
      ctx.save();
      ctx.filter = "blur(10px)";
      ctx.fillStyle = "rgba(230, 80, 70, 0.4)";
      ctx.beginPath();
      ctx.ellipse(
        pitX + pitW * 0.35,
        pitY + pitH * 0.4,
        pitW * 0.4,
        pitH * 0.35,
        0.3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    }

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    this.flesh[key] = texture;
    return texture;
  }

  makeStone(plane, normal, side, order) {
    const span = this.fleshHeight * 1.1;
    const halfW = 0.13 * span;
    const halfH = 0.18 * span;
    const geometry = new SphereGeometry(1, 96, 64);
    const pos = geometry.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const v = new Vector3();
    const dimples = Array.from({ length: 70 }, () =>
      new Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5,
      ).normalize(),
    );
    const tan = new Color(0x6a3a22);
    const stain = new Color(0x5c0e1a);
    const col = new Color();
    for (let i = 0; i < pos.count; i += 1) {
      v.fromBufferAttribute(pos, i);
      const dir = v.clone().normalize();
      let dent = 0;
      dimples.forEach((d) => {
        dent = Math.max(dent, Math.max(0, 1 - dir.distanceTo(d) / 0.16) ** 2);
      });
      const furrow =
        Math.max(0, Math.sin(v.y * 9 + Math.sin(v.x * 4) * 2)) ** 3;
      const ridge = Math.exp(-(v.x * v.x) / 0.004) * (v.z > 0 ? 0 : 1);
      const taper = v.y < 0 ? 1 - v.y * v.y * 0.25 : 1 - v.y * v.y * 0.4;
      v.x *= taper;
      v.z *= taper;
      v.multiplyScalar(1 - dent * 0.09 - furrow * 0.03 + ridge * 0.06);
      if (v.y > 0.9) v.y += (v.y - 0.9) * 1.6;
      pos.setXYZ(i, v.x, v.y, v.z);
      col
        .copy(tan)
        .lerp(stain, Math.min(1, Math.max(0, -v.y * 0.6 + 0.35) + dent * 0.3))
        .multiplyScalar(1 - dent * 0.35);
      col.toArray(colors, i * 3);
    }
    geometry.setAttribute("color", new BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    const stone = new Mesh(
      geometry,
      new MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        envMapIntensity: 1.2,
        sheen: 0.5,
        sheenRoughness: 0.35,
        sheenColor: new Color(0xff5a48),
      }),
    );
    const face = normal.clone().multiplyScalar(-side);
    const along = this.seamDirection.clone();
    const up = new Vector3(0, 1, 0);
    stone.matrixAutoUpdate = false;
    stone.matrix.makeBasis(
      along.multiplyScalar(halfW),
      up.multiplyScalar(halfH),
      face.clone().multiplyScalar(halfW * 0.75),
    );
    const at = this.fleshCenter
      .clone()
      .addScaledVector(this.seamDirection, 0.03 * span)
      .add(new Vector3(0, 0.02 * span, 0));
    at.addScaledVector(normal, plane.w - at.dot(normal));
    stone.matrix.setPosition(at);
    stone.renderOrder = order + 3;
    stone.castShadow = true;
    stone.receiveShadow = true;
    return stone;
  }

  creaseNormal(target) {
    const c = this.uniforms.uCrease.value;
    return target.set(c.x, c.y, c.z).transformDirection(this.mesh.matrixWorld);
  }

  toLocal(worldPoint, target) {
    this.inverseWorld.copy(this.mesh.matrixWorld).invert();
    return target.copy(worldPoint).applyMatrix4(this.inverseWorld);
  }

  worldScale() {
    return this.mesh.matrixWorld.getMaxScaleOnAxis();
  }

  updateRing(camera) {
    const u = this.uniforms;
    u.uRingShine.value = this.shine * this.shine;
    u.uRingIgnite.value = this.ringIgnite;
    if (this.shine <= 0.001) return;
    const view = camera.matrixWorldInverse;
    u.uRingCenter.value.set(0, 0, RING.Z).applyMatrix4(view);
    u.uRingAxisX.value.set(1, 0, 0).transformDirection(view);
    u.uRingAxisY.value.set(0, 1, 0).transformDirection(view);
    u.uRingAxisZ.value.set(0, 0, 1).transformDirection(view);
  }

  setFirmness(tier) {
    this.firmness = tier;
    this.uniforms.uFirmness.value.set(
      tier.dentFrequency,
      tier.dentDecay,
      tier.wobble,
      tier.jiggle,
    );
    this.uniforms.uBounce.value.set(tier.splash, tier.sway, tier.rebound);
    const target = {
      bulge: FABRIC.bulge * tier.bulge,
      depth: FABRIC.depth * tier.depth,
    };
    const s = this.fabricSpring;
    if (s) {
      s.bulgeVelocity += (target.bulge - s.bulge) * 9;
      s.depthVelocity += (target.depth - s.depth) * 9;
      s.target = target;
    } else {
      this.fabricSpring = {
        ...target,
        target,
        bulgeVelocity: 0,
        depthVelocity: 0,
      };
    }
    this.applyFabricSpring();
  }

  updateFabricSpring(delta) {
    const s = this.fabricSpring;
    if (!s) return;
    FABRIC_SPRINGS.forEach(([key, velocity]) => {
      s[velocity] +=
        ((s.target[key] - s[key]) * 130 - s[velocity] * 3.5) * delta;
      s[key] += s[velocity] * delta;
    });
    this.applyFabricSpring();
  }

  applyFabricSpring() {
    this.uniforms.uFabric.value.z = this.fabricSpring.bulge;
    this.uniforms.uFabricDepth.value = this.fabricSpring.depth;
  }

  addJiggle(worldPoint, worldDirection, baseAmplitude, baseRadius) {
    const amplitude = baseAmplitude * (this.firmness?.jiggle ?? 1);
    const radius = baseRadius * (this.firmness?.reach ?? 1);
    if (!this.mesh) return;
    const slot = this.hitSlot;
    this.hitSlot = (slot + 1) % PEACH_CONFIG.MAX_HITS;
    const scale = this.worldScale();
    const point = this.toLocal(worldPoint, this.tempA);
    const dir = this.tempB
      .copy(worldDirection)
      .transformDirection(this.inverseWorld);
    const now = this.uniforms.uTime.value;
    this.uniforms.uHits.value[slot].set(point.x, point.y, point.z, now);
    this.uniforms.uHitDirs.value[slot].set(
      (dir.x * amplitude) / scale,
      (dir.y * amplitude) / scale,
      (dir.z * amplitude) / scale,
      radius / scale,
    );
    this.lastHitTime = now;
    this.onJiggle?.(worldPoint, baseAmplitude, baseRadius);
  }

  setTool(name) {
    const shape = PRINT_SHAPES[name];
    if (!shape) return;
    this.printTextures[name] = this.printTextures[name] || drawPrint(shape);
    this.uniforms.uPrintTexture.value = this.printTextures[name];
    this.uniforms.uPrintInk.value = name === "lips" ? 1 : 0;
    this.uniforms.uPrints.value.forEach((v) => v.setW(-1e4));
  }

  setPaddlePrint(key, shape) {
    this.printTextures[key] = this.printTextures[key] || drawPrint(shape);
    this.uniforms.uPaddleTexture.value = this.printTextures[key];
  }

  setGrab(localPoint, localPull, radius, localDent, dentRadius) {
    const scale = this.worldScale();
    this.uniforms.uGrab.value.set(
      localPoint.x,
      localPoint.y,
      localPoint.z,
      radius / scale,
    );
    this.uniforms.uGrabPull.value.set(localPull.x, localPull.y, localPull.z, 1);
    this.uniforms.uGrabDent.value.set(
      localDent.x,
      localDent.y,
      localDent.z,
      dentRadius / scale,
    );
  }

  releaseGrab() {
    this.uniforms.uGrabPull.value.w = 0;
  }

  addHandprint(
    worldPoint,
    localNormal,
    tilt,
    mirrored,
    strength,
    definition,
    printSize,
    kind = 0,
  ) {
    if (!this.mesh) return;
    const slot = this.printSlot;
    this.printSlot = (slot + 1) % PEACH_CONFIG.MAX_PRINTS;
    const point = this.toLocal(worldPoint, this.tempA);
    const n = localNormal.clone().normalize();
    const up = this.tempB.set(0, 1, 0).transformDirection(this.inverseWorld);
    up.addScaledVector(n, -up.dot(n));
    if (up.lengthSq() < 1e-6) up.set(1, 0, 0).addScaledVector(n, -n.x);
    up.normalize();
    const side = n.clone().cross(up);
    up.multiplyScalar(Math.cos(tilt)).addScaledVector(side, Math.sin(tilt));

    const size = (printSize / this.worldScale()) * (mirrored ? -1 : 1);
    this.uniforms.uPrints.value[slot].set(
      point.x,
      point.y,
      point.z,
      this.uniforms.uTime.value,
    );
    this.uniforms.uPrintNormals.value[slot].set(n.x, n.y, n.z, strength);
    this.uniforms.uPrintDefinitions.value[slot] = definition;
    this.uniforms.uPrintKind.value[slot] = kind;
    this.uniforms.uPrintUps.value[slot].set(up.x, up.y, up.z, size);
  }

  clearMarks() {
    const u = this.uniforms;
    [u.uHits, u.uPrints].forEach((slots) =>
      slots.value.forEach((v) => v.setW(-1e4)),
    );
    u.uOilCount.value = 0;
  }

  setLingerie(on, pull, visible) {
    const shown = on && visible > 0;
    if (this.body) {
      this.dressedWanted = shown;
      if (shown && this.mesh.geometry !== this.dressed.geometry) {
        this.useShape(this.dressed);
        this.rise = 0;
        this.uniforms.uRise.value = 0;
      }
    }
    this.bows?.update(shown, pull, Math.min(1, visible));
    this.band?.update(shown, pull, Math.min(1, visible));
    if (this.fabric) this.fabric.visible = shown;
    this.uniforms.uLingerie.value.set(on ? 1 : 0, pull, visible, 0.7);
  }

  heightAt(worldPoint) {
    const b = this.uniforms.uBounds.value;
    const local = this.mesh.worldToLocal(worldPoint.clone());
    return (local.y - b.y) / b.w + 0.5;
  }

  setOil(oil, immediate = false) {
    this.oilTarget = oil;
    if (immediate && this.material) {
      this.oil = oil;
      this.ringIgnite = oil;
      this.writeOil();
    }
  }

  applyOil(delta) {
    const target = this.oilTarget ?? 0;
    this.ringIgnite +=
      (this.shine - this.ringIgnite) * (1 - Math.exp(-delta * 1.4));
    if (!this.material || Math.abs(target - this.oil) < 0.001) return;
    this.oil += (target - this.oil) * (1 - Math.exp(-delta * 2.5));
    this.writeOil();
  }

  writeOil() {
    const { oil } = this;
    const m = this.material;
    const shine = oil * oil * (3 - 2 * oil);
    this.shine = shine;
    const gloss = this.skinGloss;
    m.roughness = (1 - (gloss ? 0.2 : 0.55) * shine) * this.skinRoughness;
    m.clearcoat = Math.max(this.skinCoat, 0.001 + (gloss ? 0 : shine * 0.6));
    m.clearcoatRoughness = this.skinCoat
      ? Math.min(0.2, 1 - 0.85 * shine)
      : 1 - 0.85 * shine;
    m.clearcoatNormalScale.setScalar(0.04 + (gloss ? 0 : 0.4) * shine);
    this.uniforms.uEnvSpecular.value = gloss
      ? 1 + 0.8 * shine
      : 1 - 0.7 * shine;
    m.color.copy(this.skinTint).lerp(this.wetTint, gloss ? 0 : shine * 0.12);
  }

  // Built before the warm-up so the first skin switch does not compile the fade shader.
  prepareSkinFade() {
    if (!this.mesh || this.fade) return;
    const uniforms = { ...this.uniforms };
    SKIN_UNIFORMS.forEach((key) => {
      uniforms[key] = { value: this.uniforms[key].value.clone() };
    });
    uniforms.uSkinFade = { value: 0 };
    uniforms.uSkinFadeGlow = { value: new Color() };
    const material = this.material.clone();
    material.side = DoubleSide;
    material.defines = { ...material.defines, SKIN_FADE: "" };
    material.onBeforeCompile = (shader) => {
      this.material.onBeforeCompile(shader);
      Object.assign(shader.uniforms, uniforms);
    };
    const mesh = new Mesh(this.mesh.geometry, material);
    mesh.renderOrder = 0.5;
    mesh.raycast = () => {};
    mesh.visible = false;
    this.mesh.add(mesh);
    this.fade = { mesh, uniforms, time: 0 };
  }

  fadeSkin(glow, beats) {
    if (!this.mesh) return;
    this.prepareSkinFade();
    const { fade } = this;
    this.matchSkin(fade.mesh.material);
    SKIN_UNIFORMS.forEach((key) =>
      fade.uniforms[key].value.copy(this.uniforms[key].value),
    );
    fade.uniforms.uSkinFadeGlow.value.set(glow);
    fade.uniforms.uSkinFade.value = 0;
    fade.mesh.visible = true;
    fade.time = 0;
    fade.beats = [...beats];
  }

  kickLeaf(strength) {
    if (!this.leaf) return;
    const { uLeafAxis } = this.uniforms;
    const lift = new Vector3(
      uLeafAxis.value.x,
      uLeafAxis.value.y,
      uLeafAxis.value.z,
    ).cross(new Vector3(0, 1, 0));
    if (lift.lengthSq() < 1e-6) return;
    this.leaf.bendVel.addScaledVector(lift.normalize(), strength);
  }

  updateLeaf(delta) {
    if (!this.mesh || delta <= 0) return;
    // The intro stills show the leaf without breeze, so it follows the sway hold.
    this.breeze ??= 1;
    const dt = Math.min(delta, 1 / 30);
    if (!this.leaf) {
      this.leaf = {
        at: null,
        vel: new Vector3(),
        quat: null,
        spin: new Vector3(),
        bend: new Vector3(),
        bendVel: new Vector3(),
        a: new Vector3(),
        b: new Vector3(),
        q: new Quaternion(),
        dq: new Quaternion(),
        calm: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? 0.3
          : 1,
      };
    }
    const L = this.leaf;
    const { uStemBase, uLeafBend, uLeafAxis, uBounds } = this.uniforms;
    this.mesh.updateWorldMatrix(true, false);
    const anchor = L.a
      .copy(uStemBase.value)
      .applyMatrix4(this.mesh.matrixWorld);
    this.mesh.getWorldQuaternion(L.q);
    if (!L.at) {
      L.at = anchor.clone();
      L.quat = L.q.clone();
    }
    const unit = uBounds.value.w * this.mesh.matrixWorld.getMaxScaleOnAxis();
    const vel = L.b
      .copy(anchor)
      .sub(L.at)
      .divideScalar(dt * unit);
    L.at.copy(anchor);
    const acc = vel.clone().sub(L.vel).divideScalar(dt);
    L.vel.copy(vel);
    L.dq.copy(L.q).multiply(L.quat.invert());
    L.quat.copy(L.q);
    const angle = 2 * Math.acos(Math.min(1, Math.abs(L.dq.w)));
    const spin = new Vector3(L.dq.x, L.dq.y, L.dq.z);
    if (spin.lengthSq() > 1e-12)
      spin.normalize().multiplyScalar((Math.sign(L.dq.w || 1) * angle) / dt);
    const spinAcc = spin.clone().sub(L.spin).divideScalar(dt);
    L.spin.copy(spin);
    const toLocal = L.q.clone().invert();
    acc.applyQuaternion(toLocal);
    spinAcc.applyQuaternion(toLocal);
    const turn = spin.applyQuaternion(toLocal);
    const axis = L.b.set(
      uLeafAxis.value.x,
      uLeafAxis.value.y,
      uLeafAxis.value.z,
    );
    const torque = axis
      .clone()
      .cross(acc)
      .multiplyScalar(-LEAF.PUSH)
      .addScaledVector(spinAcc, -LEAF.LAG);
    const sweep = turn.clone().cross(axis);
    torque.addScaledVector(axis.clone().cross(sweep), -LEAF.DRAG);
    torque.addScaledVector(
      axis.clone().cross(turn.clone().cross(sweep)),
      -LEAF.FLING,
    );
    torque.clampLength(0, LEAF.MAX_TORQUE);
    const k = (2 * Math.PI * LEAF.HZ) ** 2;
    // Held still, the leaf settles fast so the intro still can take over without a second leaf.
    const c = 2 * LEAF.DAMPING * Math.sqrt(k) * (1 + (1 - this.breeze) * 6);
    L.bendVel
      .addScaledVector(torque, dt)
      .addScaledVector(L.bend, -k * dt)
      .multiplyScalar(1 - c * dt);
    L.bend.addScaledVector(L.bendVel, dt);
    const size = L.bend.length();
    if (size > LEAF.MAX_BEND) L.bend.multiplyScalar(LEAF.MAX_BEND / size);
    const t = this.uniforms.uTime.value;
    const breeze = L.a
      .set(
        Math.sin(t * 1.3) * 0.6 + Math.sin(t * 2.1 + 1.7) * 0.4,
        0,
        Math.sin(t * 0.9 + 0.5) * 0.7 + Math.sin(t * 1.7 + 2.3) * 0.3,
      )
      .multiplyScalar(LEAF.BREEZE * this.breeze);
    uLeafBend.value.copy(L.bend).add(breeze).multiplyScalar(L.calm);
    uLeafAxis.value.w =
      Math.min(1, L.bendVel.length() / LEAF.FLUTTER_AT) * L.calm;
  }

  updateFade(delta) {
    const { fade } = this;
    if (!fade?.mesh.visible) return;
    fade.time += delta / SKIN_FADE_SECONDS;
    while (fade.beats.length && fade.time >= fade.beats[0].at)
      fade.beats.shift().run();
    const t = Math.min(1, fade.time);
    fade.uniforms.uSkinFade.value = 1 - (1 - t) ** 2;
    if (fade.time >= 1) fade.mesh.visible = false;
  }

  update(delta, heat) {
    if (this.sharpenTime !== undefined && this.sharpenTime < 1) {
      this.sharpenTime = Math.min(1, this.sharpenTime + delta / 0.9);
      const t = this.sharpenTime;
      this.uniforms.uSkinSharp.value = t * t * (3 - 2 * t);
    }
    this.applyOil(delta);
    this.updateFade(delta);
    this.uniforms.uTime.value += delta;
    this.uniforms.uHeat.value = heat;
    this.uniforms.uJiggleActive.value =
      this.uniforms.uTime.value - this.lastHitTime < HIT_LIFE ||
      this.uniforms.uGrabPull.value.w > 0 ||
      (this.uniforms.uLingerie.value.x > 0.5 &&
        this.uniforms.uLingerie.value.z > 0)
        ? 1
        : 0;
    this.updateFabricWobble(delta);
    this.updateFabricSpring(delta);
    this.updateLeaf(delta);
    this.updateRise(delta);
  }

  updateRise(delta) {
    if (!this.body || this.mesh.geometry !== this.dressed.geometry) return;
    const step = delta / RISE_SECONDS;
    this.rise = Math.min(
      1,
      Math.max(0, this.rise + (this.dressedWanted ? step : -step)),
    );
    this.uniforms.uRise.value = this.rise * this.rise * (3 - 2 * this.rise);
    if (!this.dressedWanted && this.rise === 0) {
      this.useShape(this.body);
      this.uniforms.uRise.value = 1;
    }
  }

  updateFabricWobble(delta) {
    if (delta <= 0) return;
    const pull = this.uniforms.uLingerie.value.y;
    const speed = (pull - (this.lastPull ?? pull)) / delta;
    this.lastPull = pull;
    this.wobble = this.wobble || { x: 0, v: 0 };
    const w = this.wobble;
    w.v += (speed * 6 - w.x * 260 - w.v * 9) * delta;
    w.x += w.v * delta;
    this.uniforms.uFabricWobble.value = Math.max(-0.6, Math.min(0.8, w.x));
  }
}
