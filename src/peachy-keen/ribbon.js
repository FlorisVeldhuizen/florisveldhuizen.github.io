import {
  BufferGeometry,
  CatmullRomCurve3,
  Float32BufferAttribute,
  Group,
  Matrix3,
  Quaternion,
  Matrix4,
  Mesh,
  Vector3,
} from "three";
import { satinMaterial } from "./band";

const SAMPLES = 24;

function strip(
  points,
  { width, across = null, segments = 48, notch = 0, twist = () => 0 },
) {
  const curve = new CatmullRomCurve3(points);
  const positions = [];
  const up = new Vector3(0, 1, 0);
  const side = new Vector3();
  const turn = new Quaternion();
  let point = null;
  let tangent = null;
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    point = curve.getPointAt(t);
    tangent = curve.getTangentAt(t);
    if (across) side.copy(across);
    else side.copy(up).addScaledVector(tangent, -tangent.dot(up)).normalize();
    side.applyQuaternion(turn.setFromAxisAngle(tangent, twist(t)));
    const half = width(t) / 2;
    const a = point.clone().addScaledVector(side, half);
    const b = point.clone().addScaledVector(side, -half);
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }
  const index = [];
  for (let i = 0; i < segments; i += 1) {
    const k = i * 2;
    index.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
  }
  if (notch) {
    const tip = point.clone().addScaledVector(tangent, -notch);
    const last = segments * 2;
    positions.push(tip.x, tip.y, tip.z);
    const centre = positions.length / 3 - 1;
    index.push(last, centre, last + 1);
    const cut = [last, last + 1];
    cut.forEach((k) => {
      positions[k * 3] += tangent.x * notch * 0.35;
      positions[k * 3 + 1] += tangent.y * notch * 0.35;
      positions[k * 3 + 2] += tangent.z * notch * 0.35;
    });
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

function bowGeometries(size) {
  const w = size * 0.42;
  const v = (x, y, z) => new Vector3(x * size, y * size, z * size);
  const loop = (dir) =>
    strip(
      [
        v(0, 0.02, 0.12),
        v(0.35 * dir, 0.22, 0.3),
        v(0.85 * dir, 0.42, 0.28),
        v(1.25 * dir, 0.36, 0.15),
        v(1.3 * dir, 0.1, 0.07),
        v(0.95 * dir, -0.08, 0.06),
        v(0.45 * dir, -0.06, 0.1),
        v(0, -0.02, 0.12),
      ],
      {
        width: (t) => w * (0.7 + 0.9 * Math.sin(Math.PI * t)),
        twist: (t) => 0.35 * Math.sin(Math.PI * t) * dir,
      },
    );
  const tail = (dir, length) =>
    strip(
      [
        v(0, -0.05, 0.12),
        v(0.18 * dir, -0.5 * length, 0.16),
        v(0.12 * dir, -1.0 * length, 0.1),
        v(0.3 * dir, -1.55 * length, 0.06),
        v(0.46 * dir, -2.1 * length, 0.04),
      ],
      {
        width: (t) => w * (0.85 + 0.25 * t),
        across: new Vector3(1, 0, 0),
        twist: (t) => 0.25 * Math.sin(Math.PI * 2 * t) * dir,
        notch: w * 0.5,
      },
    );
  const knot = strip(
    [v(0, -0.3, 0.06), v(0, -0.14, 0.27), v(0, 0.14, 0.27), v(0, 0.3, 0.06)],
    {
      width: (t) => w * (0.8 + 0.25 * Math.sin(Math.PI * t)),
      across: new Vector3(1, 0, 0),
      segments: 20,
    },
  );
  return [loop(1), loop(-1), tail(1, 1), tail(-1, 0.88), knot];
}

export class RibbonBows {
  constructor(peach, followSkin) {
    this.peach = peach;
    this.group = new Group();
    this.group.visible = false;
    this.bows = [0].map(() => {
      const bow = new Group();
      bow.matrixAutoUpdate = false;
      this.group.add(bow);
      const skin = {
        uAnchor: { value: new Vector3() },
        uAnchorNormal: { value: new Vector3(0, 0, 1) },
        uBowInverse: { value: new Matrix3() },
        uBowMatrix: { value: new Matrix4() },
      };
      const material = satinMaterial();
      followSkin(material, skin);
      return { bow, anchors: [], material, skin };
    });
    this.pull = null;
    this.basis = new Matrix4();
    this.scale = new Vector3(1, 1, 1);
  }

  prepare() {
    const { geometry } = this.peach.mesh;
    const u = this.peach.uniforms;
    const bounds = u.uBounds.value;
    const plane = u.uCrease.value;
    const curve = u.uCreaseCurve.value;
    const creaseSide = u.uCreaseSide.value;
    const height = bounds.w;
    const pos = geometry.attributes.position;
    const nor = geometry.attributes.normal;
    const offsetAt = (h) => {
      const f = Math.min(1, Math.max(0, h)) * (curve.length - 1);
      const i = Math.floor(f);
      const j = Math.min(i + 1, curve.length - 1);
      return curve[i] + (curve[j] - curve[i]) * (f - i);
    };
    const samples = [];
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const rx = x - bounds.x;
      const rz = z - bounds.z;
      const back =
        (rx * creaseSide.x + rz * creaseSide.z) / (Math.hypot(rx, rz) || 1);
      const h = (y - bounds.y) / height + 0.5;
      const across =
        (x * plane.x + y * plane.y + z * plane.z - plane.w) / height -
        offsetAt(h);
      const azimuth = Math.atan2(
        rz * creaseSide.x - rx * creaseSide.z,
        rx * creaseSide.x + rz * creaseSide.z,
      );
      samples.push({ i, h, across, back, azimuth });
    }
    const bowSize = height * 0.05;
    this.bows.forEach((entry) => {
      bowGeometries(bowSize).forEach((g) =>
        entry.bow.add(new Mesh(g, entry.material)),
      );
      const rest = u.uLingerie.value.w - 0.05;
      let spot = null;
      let spotScore = Infinity;
      samples.forEach((sample) => {
        if (sample.back < 0.8) return;
        const score = 10 * sample.across ** 2 + (sample.h - rest) ** 2;
        if (score < spotScore) {
          spotScore = score;
          spot = sample;
        }
      });
      entry.angle = Math.atan2(
        pos.getZ(spot.i) - bounds.z,
        pos.getX(spot.i) - bounds.x,
      );
      entry.anchors = Array.from({ length: SAMPLES }, (_, k) => {
        const target = 0.15 + (k / (SAMPLES - 1)) * 0.7;
        let best = spot;
        let bestScore = Infinity;
        samples.forEach((sample) => {
          if (Math.abs(sample.h - target) > 0.02) return;
          const score =
            Math.abs(sample.azimuth - spot.azimuth) +
            Math.abs(sample.h - target);
          if (score < bestScore) {
            bestScore = score;
            best = sample;
          }
        });
        return {
          h: target,
          position: new Vector3().fromBufferAttribute(pos, best.i),
          normal: new Vector3().fromBufferAttribute(nor, best.i).normalize(),
        };
      });
    });
  }

  update(visible, pull, fade = 1) {
    this.group.visible = visible;
    if (!visible || !this.peach.mesh) return;
    if (this.bows[0].anchors.length === 0) this.prepare();
    if (pull === this.pull && fade === this.fade) return;
    this.pull = pull;
    this.fade = fade;
    const b = this.peach.uniforms.uBounds.value;
    const { band } = this.peach;
    const rest = this.peach.uniforms.uLingerie.value.w;
    const waist = Math.min(rest - 0.05 - pull * 0.36, rest + 0.01);
    const onPeach = Math.max(waist, 0.06);
    const below = Math.max(0, 0.06 - waist);
    const up = new Vector3(0, 1, 0);
    this.bows.forEach(({ bow, skin, angle }) => {
      const normal = new Vector3(Math.cos(angle), 0, Math.sin(angle));
      const radius = band.ringRadius(angle, onPeach);
      const position = new Vector3(
        b.x + normal.x * radius,
        b.y + (onPeach - 0.5) * b.w,
        b.z + normal.z * radius,
      );
      const drop = 0.08;
      const bulge =
        band.ringRadius(angle, Math.max(0.06, onPeach - drop)) - radius;
      const x = up.clone().cross(normal).normalize();
      const y = normal
        .clone()
        .multiplyScalar(-bulge)
        .addScaledVector(up, drop * b.w)
        .normalize();
      const z = x.clone().cross(y).normalize();
      this.basis.makeBasis(x, y, z);
      skin.uAnchor.value.copy(position);
      skin.uAnchorNormal.value.copy(z);
      position
        .addScaledVector(z, b.w * 0.0035)
        .addScaledVector(normal, below * b.w * 0.6)
        .addScaledVector(up, -below * b.w);
      this.basis.scale(this.scale.setScalar(Math.max(0.001, fade)));
      this.basis.setPosition(position);
      bow.matrix.copy(this.basis);
      skin.uBowMatrix.value.copy(this.basis);
      skin.uBowInverse.value.setFromMatrix4(this.basis).invert();
      bow.matrixWorldNeedsUpdate = true;
    });
  }
}
