import { Vector3 } from "three";
import { playSquish } from "../../audio";
import { reducedMotion } from "../../util";

const DRIPS = 3;
const PX = 1 / 72;
const HEAD = 9 * PX;
const TRAIL_EVERY = 5 * PX;
const TRAIL_SIZE = 0.6;
const TRAIL_SHRINK = 0.5 * PX;
const HEAD_SHRINK = 0.25 * PX;
const MIN_HEAD = 5 * PX;
const MAX_TRAIL = 20;
// Thinner than this the oil would only light scattered pixels, so it ends there.
const MIN_DRAW = 1.2 * PX;
const DRAG = 0.4;
const LIFE = 14;
const FADE = 1.4;
const MIN_HIT = 0.05;
const FULL_HIT = 0.14;
const HIT_REACH = 0.9;
const SURGE = 70 * PX;
const SURGE_DECAY = 5;
const FLING_AT = 0.6;
const FLING_SHRINK = 0.55;
const FLING_TRAIL = 0.7;

function nudge(d, k) {
  /* eslint-disable no-param-reassign */
  d.surge = (d.surge || 0) + SURGE * k;
  d.wait = Math.min(d.wait, d.age);
  d.trail.push({ at: d.head.clone(), r: d.r * TRAIL_SIZE * 1.15 });
  if (d.trail.length > MAX_TRAIL) d.trail.shift();
  /* eslint-enable no-param-reassign */
}

export class OilDrips {
  constructor(interaction, soundOn) {
    Object.assign(this, { i: interaction, soundOn });
    this.drips = Array.from({ length: DRIPS }, (_, n) => ({
      state: "idle",
      wait: 1 + Math.random() * 4 + n * 1.5,
      head: new Vector3(),
      trail: [],
      drop: null,
    }));
    this.from = new Vector3();
    this.ray = new Vector3();
    this.world = new Vector3();
    this.normal = new Vector3();
    this.slope = new Vector3();
    this.side = new Vector3();
    this.away = new Vector3();
    this.i.peach.onJiggle = (point, amount, radius) =>
      this.hit(point, amount, radius);
  }

  hit(point, amount, radius) {
    if (amount < MIN_HIT || this.i.phase !== "live") return;
    const reach = radius * HIT_REACH;
    this.drips.forEach((d) => {
      if (d.state !== "smear" || !d.attached) return;
      const head = this.worldOf(d.head);
      const dist = head.distanceTo(point);
      if (dist > reach) return;
      const k = Math.min(1, (amount / FULL_HIT) * (1 - dist / reach) ** 1.5);
      if (k > FLING_AT && d.r > MIN_HEAD * 1.2)
        this.fling(d, head.clone(), point, k);
      else nudge(d, k);
    });
  }

  fling(d, head, point, k) {
    const n = d.normal;
    const away = this.away.copy(head).sub(point);
    away.addScaledVector(n, -away.dot(n));
    if (away.lengthSq() < 1e-6) away.set(Math.random() - 0.5, 0.3, 0);
    away.normalize();
    head.addScaledVector(n, 0.03);
    const count = 4 + Math.round(k * 3);
    for (let m = 0; m < count; m += 1) {
      const main = m === 0;
      const velocity = n
        .clone()
        .multiplyScalar(
          (1.6 + 1.6 * k) * (main ? 1 : 0.6 + Math.random() * 0.6),
        )
        .addScaledVector(
          away,
          (1.2 + 1.5 * k) * (main ? 1 : 0.5 + Math.random()),
        );
      if (!main)
        velocity.add(
          new Vector3(
            Math.random() - 0.5,
            Math.random() - 0.3,
            Math.random() - 0.5,
          ).multiplyScalar(1.4),
        );
      const size = main ? 0.045 : 0.014 + Math.random() * 0.016;
      this.emit(head.clone(), velocity, size, 0.3 + Math.random() * 0.2);
    }
    /* eslint-disable no-param-reassign */
    d.r = Math.max(MIN_HEAD, d.r * FLING_SHRINK);
    d.trail.forEach((t) => {
      t.r *= FLING_TRAIL;
    });
    Object.assign(d, { surge: 0, vy: 0, wait: d.age + 0.5 });
    /* eslint-enable no-param-reassign */
  }

  cast(origin, direction) {
    const i = this.i;
    i.raycaster.set(origin, direction);
    const hit = i.raycaster.intersectObject(i.peach.mesh, false)[0] || null;
    if (hit)
      this.normal
        .copy(hit.face.normal)
        .transformDirection(i.peach.mesh.matrixWorld);
    return hit;
  }

  surfaceAt(x, y) {
    const i = this.i;
    return this.cast(
      this.from.set(x, y, i.group.position.z + 6),
      this.ray.set(0, 0, -1),
    );
  }

  worldOf(local) {
    return this.world.copy(local).applyMatrix4(this.i.peach.mesh.matrixWorld);
  }

  clearOf(x) {
    return !this.drips.some((d) => {
      if (d.state === "idle") return false;
      const point =
        d.state === "falling" ? d.drop.position : this.worldOf(d.head);
      return Math.abs(point.x - x) < 0.45;
    });
  }

  launch(d, bounds) {
    const center = this.i.group.position;
    let hit = null;
    for (let tries = 0; tries < 10 && !hit; tries += 1) {
      const x = center.x + (Math.random() - 0.5) * bounds.x * 1.1;
      const found = this.cast(
        this.from.set(x, center.y + 4, center.z + 0.45),
        this.ray.set(0, -1, 0),
      );
      if (found && this.normal.z > 0.15 && this.clearOf(found.point.x))
        hit = found;
    }
    if (!hit) return;
    const cam = this.i.camera;
    const top =
      Math.tan((cam.fov * Math.PI) / 360) * (cam.position.z - hit.point.z) +
      cam.position.y +
      0.4;
    this.i.peach.toLocal(hit.point, d.head);
    Object.assign(d, {
      normal: this.normal.clone(),
      drop: this.emit(
        new Vector3(hit.point.x, top, hit.point.z),
        new Vector3(0, -1.5, 0),
        0.034,
        6,
      ),
      state: "falling",
    });
  }

  land(d) {
    this.i.peach.addJiggle(
      this.worldOf(d.head),
      this.ray.set(0, -1, -0.3).normalize(),
      0.025,
      0.45,
    );
    if (this.soundOn()) playSquish(0.05);
    Object.assign(d, {
      state: "smear",
      age: 0,
      r: HEAD * (0.85 + Math.random() * 0.4),
      vy: 0,
      seed: Math.random() * 10,
      wait: 0.8 + Math.random() * 0.8,
      trail: [],
      gap: 0,
      attached: true,
    });
  }

  slide(d, delta, motion) {
    /* eslint-disable no-param-reassign */
    const i = this.i;
    const maxSpeed = (18 * PX + d.r * 2.2) * DRAG;
    d.vy = Math.min(maxSpeed, d.vy + (20 * PX + d.r) * DRAG * delta);
    d.surge = (d.surge || 0) * Math.exp(-SURGE_DECAY * delta);
    const move = (d.vy + d.surge) * delta * motion;
    const n = d.normal;
    this.slope.set(0, -1, 0).addScaledVector(n, n.y);
    const steep = this.slope.length();
    if (steep > 1e-3) this.slope.divideScalar(steep);
    this.side.crossVectors(n, this.slope);
    const before = this.worldOf(d.head).clone();
    const world = this.world
      .addScaledVector(this.slope, move * (0.35 + 0.65 * steep))
      .addScaledVector(
        this.side,
        Math.sin(d.age * 2.3 + d.seed) * 6 * PX * delta * motion,
      );
    const hit = this.cast(
      this.from.copy(world).addScaledVector(n, 0.35),
      this.ray.copy(n).negate(),
    );
    if (!hit || this.normal.y < -0.4 || this.normal.z < -0.1) {
      if (!hit || this.normal.y < -0.2)
        this.emit(before, new Vector3(0, -0.6, 0.3), 0.03, 0);
      d.attached = false;
      return;
    }
    d.normal.copy(this.normal);
    i.peach.toLocal(hit.point, d.head);
    d.gap += before.distanceTo(hit.point);
    d.r = Math.max(MIN_HEAD, d.r - delta * HEAD_SHRINK);
    if (d.gap > TRAIL_EVERY) {
      d.gap = 0;
      d.trail.push({ at: d.head.clone(), r: d.r * TRAIL_SIZE });
      if (d.trail.length > MAX_TRAIL) d.trail.shift();
    }
    /* eslint-enable no-param-reassign */
  }

  update(delta, count, bounds) {
    const i = this.i;
    const mesh = i.peach.mesh;
    if (!mesh) return;
    const live = i.phase === "live";
    const motion = reducedMotion.matches ? 0.3 : 1;
    const blobs = [];
    this.drips.forEach((d, n) => {
      /* eslint-disable no-param-reassign */
      if (d.state === "idle") {
        d.wait -= delta;
        if (n < count && live && d.wait <= 0) this.launch(d, bounds);
        return;
      }
      if (d.state === "falling") {
        const drops = i.droplets.drops;
        if (!drops.includes(d.drop) || !live) {
          d.state = "idle";
          d.wait = 2;
        } else if (d.drop.position.y <= this.worldOf(d.head).y) {
          drops.splice(drops.indexOf(d.drop), 1);
          d.drop = null;
          this.land(d);
        }
        return;
      }
      d.age += delta;
      if (d.attached && d.age > d.wait && live) this.slide(d, delta, motion);
      d.trail.forEach((t) => {
        t.r -= delta * TRAIL_SHRINK;
      });
      d.trail = d.trail.filter((t) => t.r > 0.8 * PX);
      const evaporate = Math.max(0, Math.min(1, (LIFE - d.age) / FADE));
      const grow = Math.min(1, 0.35 + d.age * 14);
      let joined = false;
      const add = (at, r) => {
        if (r < MIN_DRAW) {
          joined = false;
          return;
        }
        blobs.push({ at, r, link: joined });
        joined = true;
      };
      d.trail.forEach((t) => add(t.at, t.r * evaporate));
      // The drop stays a loose blob, so it blends into the end of the line as a teardrop.
      joined = false;
      if (d.attached) add(d.head, d.r * grow * evaporate);
      if (evaporate <= 0 || (!d.attached && d.trail.length === 0)) {
        Object.assign(d, {
          state: "idle",
          wait: 2 + Math.random() * 4,
          trail: [],
        });
      }
      /* eslint-enable no-param-reassign */
    });
    i.peach.setOilBlobs(blobs);
  }

  emit(position, velocity, size, life) {
    const drop = { position, velocity, size, age: -life };
    this.i.droplets.drops.push(drop);
    return drop;
  }
}
