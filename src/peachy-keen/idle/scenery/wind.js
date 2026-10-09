import { Vector3 } from "three";
import { viewHeight, viewWidth } from "../../util";

const rand = (lo, hi) => lo + Math.random() * (hi - lo);
const WAKE_RADIUS = 0.8;
const WAKE_MAX = 1.2;
const RING_SPEED = 5;
const RING_REACH = 3;
const FRONT_SPEED = 3.2;

export class Wind {
  constructor(camera, interaction) {
    this.camera = camera;
    this.i = interaction;
    this.time = 0;
    this.gust = 0;
    this.gustPower = 0;
    this.gustTimer = rand(3, 5);
    this.gustDir = 1;
    this.front = -99;
    this.gustStarted = false;
    this.breeze = new Vector3();
    this.wake = {
      on: false,
      origin: new Vector3(),
      dir: new Vector3(),
      vx: 0,
      vy: 0,
    };
    this.rings = [];
    this.tmp = new Vector3();
  }

  blast(at, power) {
    this.rings.push({ at: at.clone(), age: 0, power });
    if (this.rings.length > 6) this.rings.shift();
  }

  gustAt(x, y = 0) {
    if (this.gustPower <= 0) return 0;
    const behind = (this.front - x) * this.gustDir;
    const shape =
      behind < 0 ? Math.exp(-((behind / 3) ** 2)) : Math.exp(-behind / 5);
    const patchy = 0.6 + 0.4 * Math.sin(y * 0.9 + x * 0.3 + this.time * 0.5);
    return this.gustPower * shape * patchy;
  }

  update(delta, halfHeight) {
    this.time += delta;
    this.gustTimer -= delta;
    this.gustStarted = false;
    const cam = this.camera.position;
    const wide = halfHeight(0) * this.camera.aspect;
    if (this.gustTimer <= 0) {
      this.gustTimer = rand(6, 11);
      if (Math.random() < 0.35) this.gustDir *= -1;
      this.gustPower = rand(0.6, 1.1);
      this.front = cam.x - this.gustDir * (wide + 2);
      this.gustStarted = true;
    }
    this.front += this.gustDir * FRONT_SPEED * delta;
    if ((this.front - cam.x) * this.gustDir > wide + 30) this.gustPower = 0;
    this.gust = this.gustAt(cam.x);
    this.breezeAt(cam.x, this.breeze);

    this.rings = this.rings.filter((r) => {
      // eslint-disable-next-line no-param-reassign
      r.age += delta;
      return r.age < 2.5;
    });

    const { pointer } = this.i;
    const motion = this.i.pointerSpeed(performance.now());
    const w = this.wake;
    w.on = pointer.present && motion.speed > 0;
    if (!w.on) return;
    const unit = Math.min(viewWidth(), viewHeight());
    w.vx = motion.vx * unit;
    w.vy = motion.vy * unit;
    w.origin.copy(this.camera.position);
    w.dir
      .set(
        (pointer.x / viewWidth()) * 2 - 1,
        -(pointer.y / viewHeight()) * 2 + 1,
        0.5,
      )
      .unproject(this.camera)
      .sub(w.origin)
      .normalize();
    w.halfHeight = halfHeight;
  }

  breezeAt(x, out, y = 0) {
    const lull = Math.sin(this.time * 0.13) * 0.5 + 0.5;
    const g = this.gustAt(x, y);
    return out.set(
      (0.08 + 0.1 * lull + g * 0.9) * this.gustDir,
      g * 0.12 * Math.sin(x * 0.7 + this.time * 0.9),
      0,
    );
  }

  sample(at, out) {
    const t = this.time;
    const swirl = 0.45 + this.gustAt(at.x, at.y) * 0.7;
    const a = at.x * 0.45 + t * 0.21;
    const b = at.y * 0.55 - t * 0.15;
    const c = at.x * 0.9 - at.y * 0.7 + at.z * 0.5 + t * 0.37;
    const dx = 0.45 * Math.cos(a) * Math.cos(b) + 0.45 * Math.cos(c);
    const dy = -0.55 * Math.sin(a) * Math.sin(b) - 0.35 * Math.cos(c);
    this.breezeAt(at.x, this.tmp, at.y);
    out.set(dy * swirl, -dx * swirl, Math.sin(c * 0.7) * 0.08).add(this.tmp);

    const w = this.wake;
    if (w.on) {
      const along = this.tmp.copy(at).sub(w.origin).dot(w.dir);
      const off = this.tmp.copy(w.origin).addScaledVector(w.dir, along).sub(at);
      const d = off.length();
      const core = Math.exp(-((d / WAKE_RADIUS) ** 2));
      const edge = Math.exp(-(((d - WAKE_RADIUS) / (WAKE_RADIUS * 0.5)) ** 2));
      const push = core - edge * 0.35;
      if (Math.abs(push) > 0.01) {
        const perPx = (2 * w.halfHeight(at.z)) / viewHeight();
        const vx = w.vx * perPx;
        const vy = -w.vy * perPx;
        const cap = Math.min(1, WAKE_MAX / Math.max(Math.hypot(vx, vy), 1e-3));
        out.add(this.tmp.set(vx, vy, 0).multiplyScalar(cap * push));
      }
    }
    return out;
  }

  kick(at, velocity, delta) {
    this.rings.forEach((r) => {
      const off = this.tmp.copy(at).sub(r.at);
      off.z *= 0.5;
      const dist = Math.max(off.length(), 0.05);
      const front = (dist - r.age * RING_SPEED) / 1.4;
      const k =
        Math.exp(-front * front - (dist / RING_REACH) ** 2 - r.age * 1.2) *
        r.power;
      if (k > 0.01) velocity.addScaledVector(off, (k * delta * 6) / dist);
    });
  }
}
