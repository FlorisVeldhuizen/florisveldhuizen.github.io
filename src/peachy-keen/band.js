import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Mesh,
  MeshPhysicalMaterial,
} from "three";

const SLICES = 28;
const AROUND = 160;
const LOW = 0.05;
const HIGH = 0.85;

function convexHull(points) {
  const sorted = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  sorted.forEach((p) => {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    )
      lower.pop();
    lower.push(p);
  });
  const upper = [];
  sorted
    .slice()
    .reverse()
    .forEach((p) => {
      while (
        upper.length >= 2 &&
        cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
      )
        upper.pop();
      upper.push(p);
    });
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

function rayToHull(hull, dx, dz) {
  let best = 0;
  for (let i = 0; i < hull.length; i += 1) {
    const [ax, az] = hull[i];
    const [bx, bz] = hull[(i + 1) % hull.length];
    const ex = bx - ax;
    const ez = bz - az;
    const denominator = dx * ez - dz * ex;
    if (Math.abs(denominator) > 1e-9) {
      const t = (ax * ez - az * ex) / denominator;
      const u = (ax * dz - az * dx) / denominator;
      if (t > 0 && u >= 0 && u <= 1) best = Math.max(best, t);
    }
  }
  return best;
}

const smooth = (x) => {
  const t = Math.min(1, Math.max(0, x / 0.35));
  return t * t * (3 - 2 * t);
};

function tieDrop(sag, across) {
  return sag.x * smooth(across) + sag.y * smooth(-across);
}

export function satinMaterial() {
  return new MeshPhysicalMaterial({
    color: 0xd9557f,
    roughness: 0.42,
    sheen: 0.9,
    sheenRoughness: 0.35,
    sheenColor: new Color(0xffc0d6),
    envMapIntensity: 0.35,
    side: DoubleSide,
  });
}

function elasticMaterial() {
  return new MeshPhysicalMaterial({
    color: 0x0b0508,
    roughness: 0.72,
    sheen: 0.6,
    sheenRoughness: 0.55,
    sheenColor: new Color(0x2b2026),
    envMapIntensity: 0.25,
    side: DoubleSide,
    alphaTest: 0.5,
  });
}

const ELASTIC_FRAGMENT = `
  #include <map_fragment>
  float bandY = abs(vBand.y);
  float stitch = fract(vBand.x * 70.0) - 0.5;
  float fringe = smoothstep(1.0, 1.02, bandY);
  float loop = length(vec2(stitch * 0.9, (bandY - 1.17) * 3.2));
  float picot = 1.0 - smoothstep(0.34, 0.4, loop);
  if (fringe > 0.5 && picot < 0.5) discard;
  float rib = 0.86 + 0.14 * smoothstep(-0.4, 0.4, sin(vBand.y * 9.0));
  float knit = 0.94 + 0.06 * sin(vBand.x * 900.0);
  diffuseColor.rgb *= rib * knit * mix(1.0, 0.8, fringe);
`;

export class Waistband {
  constructor(peach, followSkin) {
    this.peach = peach;
    this.material = elasticMaterial();
    followSkin(this.material);
    const follow = this.material.onBeforeCompile;
    this.material.onBeforeCompile = (shader) => {
      follow(shader);
      /* eslint-disable no-param-reassign */
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nattribute vec2 aBand;\nvarying vec2 vBand;",
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvBand = aBand;",
        );
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying vec2 vBand;")
        .replace("#include <map_fragment>", ELASTIC_FRAGMENT);
      /* eslint-enable no-param-reassign */
    };
    const count = (AROUND + 1) * 2;
    this.positions = new BufferAttribute(new Float32Array(count * 3), 3);
    this.normals = new BufferAttribute(new Float32Array(count * 3), 3);
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", this.positions);
    geometry.setAttribute("normal", this.normals);
    this.coords = new BufferAttribute(new Float32Array(count * 2), 2);
    geometry.setAttribute("aBand", this.coords);
    const index = [];
    for (let i = 0; i < AROUND; i += 1) {
      const k = i * 2;
      index.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
    geometry.setIndex(index);
    this.mesh = new Mesh(geometry, this.material);
    this.mesh.visible = false;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 2;
    this.radii = null;
    this.key = "";
  }

  prepare() {
    const pos = this.peach.mesh.geometry.attributes.position;
    const b = this.peach.uniforms.uBounds.value;
    const slices = Array.from({ length: SLICES }, () => []);
    for (let i = 0; i < pos.count; i += 1) {
      const h = (pos.getY(i) - b.y) / b.w + 0.5;
      const f = ((h - LOW) / (HIGH - LOW)) * (SLICES - 1);
      const k = Math.round(f);
      if (k >= 0 && k < SLICES && Math.abs(f - k) < 0.6)
        slices[k].push([pos.getX(i) - b.x, pos.getZ(i) - b.z]);
    }
    this.radii = slices.map((points) => {
      const hull = points.length > 2 ? convexHull(points) : [];
      return Float32Array.from({ length: AROUND }, (_, n) => {
        const angle = (n / AROUND) * Math.PI * 2;
        return hull.length
          ? rayToHull(hull, Math.cos(angle), Math.sin(angle))
          : 0;
      });
    });
  }

  ringRadius(angle, waist) {
    if (!this.radii) this.prepare();
    const f = Math.min(
      SLICES - 1,
      Math.max(0, ((waist - LOW) / (HIGH - LOW)) * (SLICES - 1)),
    );
    const k = Math.floor(f);
    const t = f - k;
    const next = Math.min(SLICES - 1, k + 1);
    const a = ((((angle / (Math.PI * 2)) % 1) + 1) % 1) * AROUND;
    const i = Math.floor(a) % AROUND;
    const j = (i + 1) % AROUND;
    const u = a - Math.floor(a);
    const at = (slice) =>
      this.radii[slice][i] * (1 - u) + this.radii[slice][j] * u;
    return (
      at(k) * (1 - t) +
      at(next) * t +
      this.peach.uniforms.uBounds.value.w * 0.003
    );
  }

  sliceRadius(i, h) {
    const f = Math.min(
      SLICES - 1,
      Math.max(0, ((h - LOW) / (HIGH - LOW)) * (SLICES - 1)),
    );
    const k = Math.floor(f);
    const next = Math.min(SLICES - 1, k + 1);
    return this.radii[k][i] * (1 - (f - k)) + this.radii[next][i] * (f - k);
  }

  update(visible, pull, fade) {
    this.mesh.visible = visible;
    if (!visible || !this.peach.mesh) return;
    if (!this.radii) this.prepare();
    const u = this.peach.uniforms;
    const sag = u.uTieSag.value;
    const key = `${pull.toFixed(4)}:${fade.toFixed(3)}:${sag.x.toFixed(4)}:${sag.y.toFixed(4)}`;
    if (key === this.key) return;
    this.key = key;
    const b = u.uBounds.value;
    const plane = u.uCrease.value;
    const rest = u.uLingerie.value.w;
    const waist = Math.min(rest - 0.05 - pull * 0.36, rest + 0.01);
    const half =
      b.w * 0.011 * (1 - 0.3 * Math.min(1, Math.max(0, pull))) * fade;
    const reach = half * 1.35;
    const lift = b.w * 0.003;
    const p = this.positions.array;
    const nrm = this.normals.array;
    const uv = this.coords.array;
    let travelled = 0;
    let previous = null;
    for (let n = 0; n <= AROUND; n += 1) {
      const i = n % AROUND;
      const angle = (i / AROUND) * Math.PI * 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const flat = this.sliceRadius(i, waist);
      const across =
        (cos * flat * plane.x + sin * flat * plane.z) / b.w +
        (b.x * plane.x + b.z * plane.z - plane.w) / b.w;
      const w = waist - tieDrop(sag, across);
      const y = b.y + (w - 0.5) * b.w;
      const r = this.sliceRadius(i, w) + lift;
      const top = this.sliceRadius(i, w + reach / b.w) + lift;
      const bottom = this.sliceRadius(i, w - reach / b.w) + lift;
      const x = b.x + cos * r;
      const z = b.z + sin * r;
      if (previous) travelled += Math.hypot(x - previous[0], z - previous[1]);
      previous = [x, z];
      const slope = Math.hypot(2 * reach, top - bottom);
      const nx = (2 * reach) / slope;
      const ny = -(top - bottom) / slope;
      [
        [y + reach, n * 2, 1.35, top],
        [y - reach, n * 2 + 1, -1.35, bottom],
      ].forEach(([vy, v, side, radius]) => {
        p[v * 3] = b.x + cos * radius;
        p[v * 3 + 1] = vy;
        p[v * 3 + 2] = b.z + sin * radius;
        nrm[v * 3] = cos * nx;
        nrm[v * 3 + 1] = ny;
        nrm[v * 3 + 2] = sin * nx;
        uv[v * 2] = travelled / b.w;
        uv[v * 2 + 1] = side;
      });
    }
    this.positions.needsUpdate = true;
    this.normals.needsUpdate = true;
    this.coords.needsUpdate = true;
  }
}
