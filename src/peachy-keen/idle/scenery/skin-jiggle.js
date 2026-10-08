import { Triangle, Vector3 } from "three";

// CPU copy of jiggle() in src/peachy-keen/peach.js; keep in step. The lingerie fabric push is not ported.
const HIT_LIFE = 3.0;
const EPS = 0.004;

const q = new Vector3();
const side = new Vector3();
const hits = new Vector3();
const tA = new Vector3();
const tB = new Vector3();
const pa = new Vector3();
const pb = new Vector3();
const da = new Vector3();
const db = new Vector3();
const base = new Vector3();
const tri = new Triangle();
const bary = new Vector3();
const va = new Vector3();
const vb = new Vector3();
const vc = new Vector3();

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function lingerieHold(u, p) {
  const l = u.uLingerie?.value;
  if (!l || !(l.x > 0.5 && l.z > 0)) return 1;
  const b = u.uBounds.value;
  const height = (p.y - b.y) / b.w + 0.5;
  const waist = Math.min(l.w - l.y * 0.36 - 0.05, l.w + 0.01);
  const gap = (height - waist) / 0.07;
  return 1 - 0.4 * Math.exp(-gap * gap) * l.z;
}

const slots = [];
const key = {
  time: NaN,
  fx: NaN,
  fy: NaN,
  fz: NaN,
  bx: NaN,
  by: NaN,
  cx: NaN,
  cy: NaN,
  cz: NaN,
  cw: NaN,
  gen: 0,
};

// Per-hit terms that depend only on time, cached until any input changes.
function slotFor(i, h, dir, t, crease, firm, bounce) {
  slots[i] ??= { gen: -1 };
  const c = slots[i];
  if (
    c.gen === key.gen &&
    c.hw === h.w &&
    c.hx === h.x &&
    c.hy === h.y &&
    c.hz === h.z &&
    c.dx === dir.x &&
    c.dy === dir.y &&
    c.dz === dir.z
  )
    return c;
  c.gen = key.gen;
  c.hw = h.w;
  c.hx = h.x;
  c.hy = h.y;
  c.hz = h.z;
  c.dx = dir.x;
  c.dy = dir.y;
  c.dz = dir.z;
  c.onset = 1 - Math.exp(-t * 45);
  c.hitSide = Math.sign(
    h.x * crease.x + h.y * crease.y + h.z * crease.z - crease.w,
  );
  c.decay = Math.exp(-t * firm.y);
  c.rippleDecay = Math.exp(-t * firm.y * 1.2);
  c.wobbleDecay = Math.exp(-t * firm.y * 0.75);
  c.wobbleWave = Math.sin(t * firm.x * 0.5 * bounce.y);
  c.splashDecay = Math.exp(-t * firm.y * 0.8);
  c.cheekDecay = Math.exp(-t * firm.y * 0.38);
  c.cheekWave = Math.sin(t * firm.x * 0.42 * bounce.y);
  c.dirLength = Math.hypot(dir.x, dir.y, dir.z);
  return c;
}

function jiggleAt(peach, p, n, target) {
  const u = peach.uniforms;
  target.set(0, 0, 0);
  const grab = u.uGrab.value;
  const pull = u.uGrabPull.value;
  if (pull.w > 0) {
    const g = p.distanceTo(q.set(grab.x, grab.y, grab.z)) / grab.w;
    target.addScaledVector(
      q.set(pull.x, pull.y, pull.z),
      pull.w * Math.exp(-g * g * 1.2),
    );
    const dent = u.uGrabDent.value;
    const k = p.distanceTo(q.set(grab.x, grab.y, grab.z)) / dent.w;
    target.addScaledVector(
      q.set(dent.x, dent.y, dent.z),
      pull.w * Math.exp(-k * k * 2.0),
    );
  }
  const time = u.uTime.value;
  const crease = u.uCrease.value;
  const firm = u.uFirmness.value;
  const bounce = u.uBounce.value;
  const list = u.uHits.value;
  const dirs = u.uHitDirs.value;
  if (
    key.time !== time ||
    key.fx !== firm.x ||
    key.fy !== firm.y ||
    key.fz !== firm.z ||
    key.bx !== bounce.x ||
    key.by !== bounce.y ||
    key.cx !== crease.x ||
    key.cy !== crease.y ||
    key.cz !== crease.z ||
    key.cw !== crease.w
  ) {
    Object.assign(key, {
      time,
      fx: firm.x,
      fy: firm.y,
      fz: firm.z,
      bx: bounce.x,
      by: bounce.y,
      cx: crease.x,
      cy: crease.y,
      cz: crease.z,
      cw: crease.w,
    });
    key.gen += 1;
  }
  hits.set(0, 0, 0);
  for (let i = 0; i < list.length; i += 1) {
    const h = list[i];
    const t = time - h.w;
    // eslint-disable-next-line no-continue
    if (t < 0 || t > HIT_LIFE) continue;
    const dir = dirs[i];
    const r = dir.w;
    const c = slotFor(i, h, dir, t, crease, firm, bounce);
    q.set(p.x - h.x, p.y - h.y, p.z - h.z);
    const dist = q.length() / r;
    const { onset, hitSide } = c;
    const fromCrease =
      ((p.x * crease.x + p.y * crease.y + p.z * crease.z - crease.w) *
        hitSide) /
      r;
    const sameCheek = smoothstep(-0.05, 0.2, fromCrease);
    const cheekBody = sameCheek * smoothstep(0, 0.9, fromCrease);
    const pad = Math.exp(-dist * dist * dist * 0.6);
    let spring = c.decay * Math.cos(t * firm.x - dist * 0.35);
    spring = Math.max(spring, 0) + Math.min(spring, 0) * bounce.z;
    const rim = Math.max(dist - 0.8, 0);
    const ripple =
      (1 - pad) *
      Math.exp(-rim * rim * 1.4) *
      c.rippleDecay *
      Math.cos(t * firm.x - rim * 2.6) *
      0.22;
    const dent = pad * spring + ripple;
    const wobble =
      Math.exp(-dist * dist * 0.2) * c.wobbleDecay * c.wobbleWave * firm.z;
    const front = dist - t * 3;
    const splash =
      (Math.exp(-front * front * 2.5) *
        c.splashDecay *
        Math.sin(t * firm.x - dist * 2) *
        bounce.x) /
      (1 + t * 3);
    const cheek =
      cheekBody *
      Math.exp(-dist * dist * 0.08) *
      c.cheekDecay *
      c.cheekWave *
      firm.z *
      3.2;
    const along = (dent + wobble + splash) * (0.15 + 0.85 * sameCheek) + cheek;
    const { dirLength } = c;
    side
      .copy(q)
      .addScaledVector(n, -q.dot(n))
      .multiplyScalar((-dent * dirLength * 0.3 * sameCheek) / r);
    hits.x += (dir.x * along + side.x) * onset;
    hits.y += (dir.y * along + side.y) * onset;
    hits.z += (dir.z * along + side.z) * onset;
  }
  const limit = u.uBounds.value.w * 0.07 * firm.w;
  const amount = hits.length();
  if (amount > 0)
    target.addScaledVector(
      hits,
      ((limit * Math.tanh(amount / limit)) / amount) * lingerieHold(u, p),
    );
  return target;
}

export function skinSpot(peach, hit, spot = {}) {
  const out = spot;
  const geo = peach.mesh.geometry;
  const pos = geo.attributes.position;
  const nor = geo.attributes.normal;
  const stiff = geo.attributes.stiffness;
  const { a, b, c } = hit.face;
  out.local ??= new Vector3();
  const { local } = out;
  peach.toLocal(hit.point, local);
  tri.set(
    va.fromBufferAttribute(pos, a),
    vb.fromBufferAttribute(pos, b),
    vc.fromBufferAttribute(pos, c),
  );
  tri.getBarycoord(local, bary);
  out.normal ??= new Vector3();
  const { normal } = out;
  normal
    .copy(va.fromBufferAttribute(nor, a))
    .multiplyScalar(bary.x)
    .addScaledVector(vb.fromBufferAttribute(nor, b), bary.y)
    .addScaledVector(vc.fromBufferAttribute(nor, c), bary.z)
    .normalize();
  out.give = stiff
    ? 1 -
      (stiff.getX(a) * bary.x + stiff.getX(b) * bary.y + stiff.getX(c) * bary.z)
    : 1;
  return out;
}

export function skinPose(peach, spot, outPoint, outNormal) {
  const { local, normal, give } = spot;
  if (peach.uniforms.uJiggleActive.value < 0.5) {
    outPoint.copy(local);
    outNormal?.copy(normal);
    return outPoint;
  }
  jiggleAt(peach, local, normal, base).multiplyScalar(give).add(local);
  if (outNormal) {
    tA.set(0, 1, 0);
    if (Math.abs(normal.y) >= 0.99) tA.set(1, 0, 0);
    tA.crossVectors(normal, tA).normalize();
    tB.crossVectors(normal, tA);
    pa.copy(local).addScaledVector(tA, EPS);
    pb.copy(local).addScaledVector(tB, EPS);
    jiggleAt(peach, pa, normal, da).multiplyScalar(give).add(pa).sub(base);
    jiggleAt(peach, pb, normal, db).multiplyScalar(give).add(pb).sub(base);
    outNormal.crossVectors(da, db).normalize();
  }
  return outPoint.copy(base);
}
