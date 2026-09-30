import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
} from "three";

const MOON_VERTEX = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vEast;
varying vec3 vNorth;
varying vec3 vLocal;
varying vec3 vView;
void main() {
  vUv = uv;
  vLocal = position;
  vec3 dir = normalize(position);
  vec3 east = normalize(cross(vec3(0.0, 1.0, 0.0), dir) + vec3(1e-4, 0.0, 0.0));
  vNormal = normalize(normalMatrix * normal);
  vEast = normalize(normalMatrix * east);
  vNorth = normalize(normalMatrix * cross(dir, east));
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = mv.xyz;
  gl_Position = projectionMatrix * mv;
}`;

const MOON_FRAGMENT = `
uniform sampler2D uPeach;
uniform float uHasPeach;
uniform vec3 uTint;
uniform vec3 uLight;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vEast;
varying vec3 vNorth;
varying vec3 vLocal;
varying vec3 vView;

vec3 hash3(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
  return fract(sin(p) * 43758.5453);
}
float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash3(i).x, hash3(i + vec3(1, 0, 0)).x, f.x), mix(hash3(i + vec3(0, 1, 0)).x, hash3(i + vec3(1, 1, 0)).x, f.x), f.y),
    mix(mix(hash3(i + vec3(0, 0, 1)).x, hash3(i + vec3(1, 0, 1)).x, f.x), mix(hash3(i + vec3(0, 1, 1)).x, hash3(i + vec3(1, 1, 1)).x, f.x), f.y),
    f.z
  );
}
float fbm3(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int k = 0; k < 4; k++) {
    v += a * noise3(p);
    p = p * 2.07 + 5.3;
    a *= 0.5;
  }
  return v;
}
vec2 craterLayer(vec3 p, float scale, float keep) {
  vec3 q = p * scale;
  vec3 i = floor(q);
  vec3 f = fract(q);
  float h = 0.0;
  float fresh = 0.0;
  for (int x = -1; x <= 1; x++)
  for (int y = -1; y <= 1; y++)
  for (int z = -1; z <= 1; z++) {
    vec3 g = vec3(float(x), float(y), float(z));
    vec3 o = hash3(i + g);
    vec3 pick = hash3(i + g + 19.7);
    if (pick.x > keep) continue;
    float r = 0.16 + 0.26 * pick.y;
    float k = length(g + o - f) / r;
    h += (k < 1.0 ? (k * k - 1.0) * 0.55 : 0.0) + exp(-pow((k - 1.0) / 0.22, 2.0)) * 0.22;
    fresh += pick.z > 0.86 ? exp(-k * 0.9) : 0.0;
  }
  return vec2(h / scale, fresh);
}
float surface(vec3 d) {
  return craterLayer(d, 4.0, 0.3).x + craterLayer(d, 9.0, 0.32).x * 0.7 + craterLayer(d, 19.0, 0.35).x * 0.5;
}

void main() {
  vec3 dir = normalize(vLocal);
  vec3 eastO = normalize(cross(vec3(0.0, 1.0, 0.0), dir) + vec3(1e-4, 0.0, 0.0));
  vec3 northO = cross(dir, eastO);
  float e = 0.006;
  float he = surface(normalize(dir + eastO * e)) - surface(normalize(dir - eastO * e));
  float hn = surface(normalize(dir + northO * e)) - surface(normalize(dir - northO * e));
  vec3 base = normalize(vNormal);
  vec3 n = normalize(base - (he * normalize(vEast) + hn * normalize(vNorth)) / (2.0 * e) * 0.35);
  vec3 view = normalize(-vView);
  float sun = max(dot(n, uLight), 0.0);
  float lunar = 2.0 * sun / (sun + max(dot(n, view), 0.0) + 1e-3);
  float day = smoothstep(-0.03, 0.1, dot(base, uLight));
  float lit = min(lunar, 1.25) * day;

  vec2 big = craterLayer(dir, 4.0, 0.3);
  vec2 mid = craterLayer(dir, 9.0, 0.32);
  float fresh = big.y + mid.y + craterLayer(dir, 19.0, 0.35).y;
  float mare = smoothstep(0.46, 0.62, fbm3(dir * 1.8 + vec3(3.1, 1.7, 0.4))) * smoothstep(-0.5, 0.3, dir.z);
  float grain = fbm3(dir * 22.0);
  vec3 highland = vec3(0.88, 0.8, 0.73);
  vec3 sea = vec3(0.44, 0.39, 0.4);
  vec3 albedo = mix(highland, sea, mare * 0.85) * (0.86 + 0.26 * grain);
  albedo *= 1.0 + (big.x + mid.x) * 0.9;
  albedo += vec3(1.0, 0.95, 0.9) * min(fresh, 1.0) * 0.22 * (1.0 - mare * 0.5);

  vec3 peach = uHasPeach > 0.5 ? texture2D(uPeach, vUv).rgb * uTint : vec3(1.0, 0.7, 0.55);
  vec3 blush = peach / max(max(peach.r, peach.g), max(peach.b, 1e-3));
  vec3 col = albedo * mix(vec3(1.0), blush, 0.55) * lit * 1.05;
  col += vec3(1.0, 0.8, 0.7) * pow(1.0 - max(0.0, base.z), 3.0) * day * 0.1;
  col += albedo * vec3(0.016, 0.018, 0.03) * (1.0 - day);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

export function moonMesh() {
  return new Mesh(
    new SphereGeometry(1, 96, 64),
    new ShaderMaterial({
      uniforms: {
        uPeach: { value: null },
        uHasPeach: { value: 0 },
        uTint: { value: new Color(1, 1, 1) },
        uLight: { value: new Vector3(0, 0, 1) },
      },
      vertexShader: MOON_VERTEX,
      fragmentShader: MOON_FRAGMENT,
    }),
  );
}

function plantTriangles(geometry, map, stemY) {
  const { index } = geometry;
  const pos = geometry.attributes.position;
  const { uv } = geometry.attributes;
  if (!index || !uv || !map?.image) return new Set();
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(map.image, 0, 0, size, size);
  const pixels = ctx.getImageData(0, 0, size, size).data;
  const colorAt = (u, v) => {
    const x = Math.min(size - 1, Math.max(0, Math.floor(u * size)));
    const y = Math.min(
      size - 1,
      Math.max(0, Math.floor((map.flipY ? 1 - v : v) * size)),
    );
    const i = (y * size + x) * 4;
    return [pixels[i] / 255, pixels[i + 1] / 255, pixels[i + 2] / 255];
  };
  const island = Uint32Array.from({ length: pos.count }, (_, i) => i);
  const root = (i) => {
    let r = i;
    while (island[r] !== r) {
      island[r] = island[island[r]];
      r = island[r];
    }
    return r;
  };
  const tri = index.array;
  for (let t = 0; t < tri.length; t += 3) {
    const a = root(tri[t]);
    island[root(tri[t + 1])] = a;
    island[root(tri[t + 2])] = a;
  }
  const tally = new Map();
  for (let i = 0; i < pos.count; i += 1) {
    const [r, g, b] = colorAt(uv.getX(i), uv.getY(i));
    const dark = Math.max(r, g, b) < 0.5;
    const plant =
      g - r > 0.07 || (dark && g >= 0.6 * r) || (dark && pos.getY(i) > stemY);
    const count = tally.get(root(i)) || [0, 0];
    count[0] += plant ? 1 : 0;
    count[1] += 1;
    tally.set(root(i), count);
  }
  const drop = new Set();
  for (let t = 0; t < tri.length; t += 3) {
    const [hits, total] = tally.get(root(tri[t]));
    if (hits >= total * 0.3) drop.add(t);
  }
  return drop;
}

export function usePeachShape(moon, peach) {
  const source = peach.mesh;
  const { map } = source.material;
  const toGroup = new Matrix4();
  for (let node = source; node && node !== peach.group; node = node.parent) {
    node.updateMatrix();
    toGroup.premultiply(node.matrix);
  }
  const geometry = new BufferGeometry();
  ["position", "normal", "uv"].forEach((name) =>
    geometry.setAttribute(name, source.geometry.attributes[name].clone()),
  );
  if (source.geometry.index) {
    const drop = plantTriangles(
      source.geometry,
      map,
      peach.uniforms.uStemY.value,
    );
    const kept = [];
    const all = source.geometry.index.array;
    for (let t = 0; t < all.length; t += 3)
      if (!drop.has(t)) kept.push(all[t], all[t + 1], all[t + 2]);
    geometry.setIndex(kept);
  }
  geometry.applyMatrix4(toGroup);
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const size = box.getSize(new Vector3());
  geometry.translate(...box.getCenter(new Vector3()).negate().toArray());
  geometry.scale(...Array(3).fill(2 / Math.max(size.x, size.y)));
  moon.geometry.dispose();
  // eslint-disable-next-line no-param-reassign
  moon.geometry = geometry;
  const { uniforms } = moon.material;
  uniforms.uPeach.value = map;
  uniforms.uHasPeach.value = map ? 1 : 0;
  uniforms.uTint.value.copy(source.material.color);
}

const lightWorld = new Vector3();

export function setMoonPhase(moon, phase, camera) {
  const angle = Math.PI * (1 - phase);
  lightWorld.set(-Math.sin(angle), 0.15, Math.cos(angle)).normalize();
  moon.material.uniforms.uLight.value
    .copy(lightWorld)
    .transformDirection(camera.matrixWorldInverse);
}

function streakTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, "rgba(255,240,255,0)");
  g.addColorStop(0.85, "rgba(255,230,250,0.8)");
  g.addColorStop(1, "rgba(255,255,255,1)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(250, 3);
  ctx.arc(250, 8, 5, -Math.PI / 2, Math.PI / 2);
  ctx.closePath();
  ctx.fill();
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export class ShootingStars {
  constructor(group) {
    const map = streakTexture();
    this.stars = Array.from({ length: 3 }, () => {
      const mesh = new Mesh(
        new PlaneGeometry(6, 0.2),
        new MeshBasicMaterial({
          map,
          transparent: true,
          opacity: 0,
          blending: AdditiveBlending,
          depthWrite: false,
          side: DoubleSide,
        }),
      );
      group.add(mesh);
      return { mesh, age: 9, from: new Vector3(), velocity: new Vector3() };
    });
    this.timer = 3;
  }

  update(delta, level) {
    if (level > 0) {
      this.timer -= delta;
      if (this.timer <= 0) {
        this.timer = (4 + Math.random() * 8) / (0.5 + level);
        const s = this.stars.find((x) => x.age > 1.2);
        if (s) {
          s.age = 0;
          s.from.set(-20 + Math.random() * 30, 6 + Math.random() * 10, -26);
          s.velocity.set(18 + Math.random() * 10, -(5 + Math.random() * 6), 0);
          s.mesh.rotation.z = Math.atan2(s.velocity.y, s.velocity.x);
        }
      }
    }
    this.stars.forEach((s) => {
      // eslint-disable-next-line no-param-reassign
      s.age += delta;
      const k = s.age / 1.2;
      s.mesh.visible = k < 1;
      if (k >= 1) return;
      s.mesh.position.copy(s.from).addScaledVector(s.velocity, s.age);
      // eslint-disable-next-line no-param-reassign
      s.mesh.material.opacity = Math.sin(Math.PI * k);
    });
  }
}
