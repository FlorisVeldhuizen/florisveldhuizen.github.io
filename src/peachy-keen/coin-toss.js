import {
  AdditiveBlending,
  InstancedMesh,
  Matrix4,
  Mesh,
  PlaneGeometry,
  Quaternion,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";
import {
  audioContext,
  audioMaster,
  noiseBuffer,
  playCoinClink,
  playCoinSkin,
  playPat,
} from "./audio";
import {
  COIN_R,
  COIN_TH,
  coinGeometry,
  coinMaterials,
  coinSounds,
} from "./coin";
import { ringMaterial, showRing } from "./rings";
import { twinkleTexture } from "./idle/scenery/shapes";
import { clamp, reducedMotion, viewHeight } from "./util";

const MAX = 32;
const SPARKS = 24;
const RINGS = 5;
const SIZE = 0.8;
const R = COIN_R * SIZE;
const TH = COIN_TH * SIZE;
const GRAVITY = -16;
const BOUNCE = 0.5;
const SLIDE = 0.8;
const POP = 3.6;
const FLIGHT = 0.4;
const STICK = 0.04;
const SINK = 0.035;
const FACE = 0.9;
const VARY = 0.9;
const RIM = 0.8;
const GLOW = 0.25;
const TRAIL = 0.2;
const TRAIL_GAP = 0.035;
const SIDE_FROM = 0.6;
const SIDE_TO = 1.3;
const RAIN_VARY = 1.8;

const smooth = (t) => t * t * (3 - 2 * t);
const TOUCH = R * 1.7;
const CLASH = 0.6;
const CLINK_GAP = 35;
const RAIN_AFTER = 0.24;
const SWIPE_MS = 90;
const SWIPE_PX = 30;
const SWIPE_SPEED = 700;
const TAP_PX = 14;
const RAIN_GAP = 0.085;
const LIFE = 4;
const Y = new Vector3(0, 1, 0);
const Z = new Vector3(0, 0, 1);

function launch(c, rain) {
  Object.assign(c, { on: true, rain, age: 0, hits: 0, stick: 0, glow: 0 });
  c.prev.copy(c.pos);
}

export class CoinToss {
  constructor({ scene, camera, renderer, interaction }) {
    Object.assign(this, { scene, camera, renderer, i: interaction });
    this.active = false;
    this.built = false;
    this.held = 0;
    this.rainIn = 0;
    this.clinkAt = 0;
    this.v = new Vector3();
    this.w = new Vector3();
    this.n = new Vector3();
    this.q = new Quaternion();
    this.m = new Matrix4();
    this.s = new Vector3();
    this.target = new Vector3();
    this.aimN = new Vector3();
    this.ndc = new Vector3();
    this.audio = coinSounds({
      audio: audioContext,
      audioOut: audioMaster,
      noiseBuffer,
    });
    window.addEventListener("pointerdown", (e) => this.down(e));
    window.addEventListener("pointerup", (e) => this.up(e));
    interaction.on("burst", () => this.scatter());
  }

  build() {
    this.built = true;
    this.mesh = new InstancedMesh(
      coinGeometry(SIZE),
      coinMaterials(this.i.peach, this.renderer),
      MAX,
    );
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    this.scene.add(this.mesh);
    this.coins = Array.from({ length: MAX }, () => ({
      on: false,
      pos: new Vector3(),
      prev: new Vector3(),
      vel: new Vector3(),
      spin: new Vector3(),
      quat: new Quaternion(),
      age: 0,
      hits: 0,
      rain: false,
      at: new Vector3(),
      n: new Vector3(),
      glow: 0,
      trailIn: 0,
    }));
    const twinkle = twinkleTexture();
    this.sparks = Array.from({ length: SPARKS }, () => {
      const s = new Sprite(
        new SpriteMaterial({
          map: twinkle,
          color: 0xffe0a0,
          blending: AdditiveBlending,
          depthWrite: false,
          transparent: true,
          opacity: 0,
        }),
      );
      s.visible = false;
      s.renderOrder = 6;
      this.scene.add(s);
      return { s, age: 9, life: 0.5, size: 0.2, peak: 1, vel: new Vector3() };
    });
    this.rings = Array.from({ length: RINGS }, () => {
      const ring = new Mesh(new PlaneGeometry(1, 1), ringMaterial(0xffe2a8));
      ring.visible = false;
      ring.renderOrder = 7;
      this.scene.add(ring);
      return { ring, age: 9, size: 0.5 };
    });
  }

  live() {
    const { i } = this;
    return this.active && i.phase === "live" && !i.carrying;
  }

  down(e) {
    const p = this.i.pointer;
    if (!this.live() || !p.pressed || e.timeStamp !== p.downAt) return;
    if (p.onWaistband && this.i.canStrip()) return;
    this.held = 0;
    this.rainIn = 0;
    this.armed = true;
  }

  up(e) {
    const p = this.i.pointer;
    if (!this.armed || !this.live()) return;
    this.armed = false;
    const recent = p.samples.filter((s) => e.timeStamp - s.t < SWIPE_MS);
    const first = recent[0];
    const span = first ? (e.timeStamp - first.t) / 1000 : 0;
    const vx = span > 0.01 ? (e.clientX - first.x) / span : 0;
    const vy = span > 0.01 ? (e.clientY - first.y) / span : 0;
    if (p.travel > SWIPE_PX && Math.hypot(vx, vy) > SWIPE_SPEED)
      this.flick(e.clientX, e.clientY, vx, vy);
    else if (p.travel < TAP_PX && this.held < RAIN_AFTER)
      this.toss(e.clientX, e.clientY);
  }

  flick(x, y, vx, vy) {
    const { i } = this;
    const c = this.take();
    const len = Math.hypot(vx, vy);
    let sx = x;
    let sy = y;
    for (let n = 0; n < 12 && i.raycastAt(sx, sy); n += 1) {
      sx -= (vx / len) * 20;
      sy -= (vy / len) * 20;
    }
    this.toWorld(sx, sy, i.group.position.z + 0.5, c.pos);
    const scale = 1 / i.pixelsPerUnit(i.group.position);
    c.vel.set(vx * scale, -vy * scale, 0).multiplyScalar(0.8);
    c.vel.setLength(clamp(c.vel.length(), 5, 16));
    c.vel.z = -1;
    this.aimN.set(-c.vel.y, c.vel.x, 0).normalize();
    this.edgeOut(c, c.vel, (vx > 0 ? -1 : 1) * (18 + Math.random() * 8));
    launch(c, false);
    this.audio.tink();
  }

  take() {
    if (!this.built) this.build();
    return (
      this.coins.find((c) => !c.on) ??
      this.coins.reduce((a, b) => (b.age > a.age ? b : a))
    );
  }

  toWorld(x, y, z, target) {
    this.ndc
      .set((x / window.innerWidth) * 2 - 1, -(y / viewHeight()) * 2 + 1, 0.5)
      .unproject(this.camera)
      .sub(this.camera.position);
    return target
      .copy(this.camera.position)
      .addScaledVector(this.ndc, (z - this.camera.position.z) / this.ndc.z);
  }

  aim(x, y, spread) {
    const { i, target } = this;
    const hit = i.raycastAt(x, y);
    if (hit) {
      target.copy(hit.point);
      this.aimN
        .copy(hit.face.normal)
        .transformDirection(i.peach.mesh.matrixWorld);
    } else {
      this.toWorld(x, y, i.group.position.z, target);
      this.aimN.set(0, 0, 1);
    }
    target.x += (Math.random() - 0.5) * spread;
    target.y += (Math.random() - 0.5) * spread;
    return target;
  }

  toss(x, y) {
    const c = this.take();
    const to = this.aim(x, y, 0.06);
    const mid = this.i.toScreen(this.i.group.position).x;
    const near = Math.abs(x - mid) < 20;
    const side = (near ? Math.random() < 0.5 : x > mid) ? 1 : -1;
    const edge =
      side > 0 ? window.innerWidth * 1.06 : -window.innerWidth * 0.06;
    const from = viewHeight() * (0.04 + Math.random() * 0.14);
    this.toWorld(edge, from, to.z + 0.8, c.pos);
    this.offscreen(c.pos, to);
    const t = FLIGHT + c.pos.distanceTo(to) * 0.04;
    c.vel
      .copy(to)
      .sub(c.pos)
      .divideScalar(t)
      .addScaledVector(Y, -0.5 * GRAVITY * t);
    const facing = Math.abs(this.aimN.z) > 0.97;
    const lead = facing
      ? this.n.copy(c.vel).addScaledVector(Y, GRAVITY * t)
      : this.aimN;
    this.edgeOut(c, lead, side * (16 + Math.random() * 8));
    launch(c, false);
    this.audio.tink();
  }

  onPeach(x, y, centre) {
    const len = Math.hypot(centre.x - x, centre.y - y);
    const steps = Math.ceil(len / 12);
    for (let n = 0; n <= steps; n += 1) {
      const sx = x + ((centre.x - x) * n) / Math.max(1, steps);
      const sy = y + ((centre.y - y) * n) / Math.max(1, steps);
      if (this.i.raycastAt(sx, sy)) return [sx, sy];
    }
    return [centre.x, centre.y];
  }

  rain(x, y) {
    const { i } = this;
    const c = this.take();
    const centre = i.toScreen(i.group.position);
    const dx = x - centre.x;
    const around = Math.atan2(Math.abs(dx), centre.y - y);
    const mix = (around - SIDE_FROM) / (SIDE_TO - SIDE_FROM);
    const b = smooth(clamp(mix + (Math.random() - 0.5) * 0.4, 0, 1));
    const [hx, hy] = this.onPeach(x, y, centre);
    const to = this.aim(hx, hy, 0.5 - 0.35 * b);
    const side = dx > 0 ? 1 : -1;
    const edge =
      side > 0 ? window.innerWidth * 1.06 : -window.innerWidth * 0.06;
    this.toWorld(
      edge,
      viewHeight() * (0.02 + Math.random() * 0.26),
      to.z + 0.4 + Math.random() * 1.2,
      c.pos,
    );
    const sideTime =
      (FLIGHT + c.pos.distanceTo(to) * 0.04) * (0.85 + Math.random() * 0.3);
    const top = this.toWorld(x, -viewHeight() * 0.08, to.z, this.w).y;
    this.w.set(
      to.x + (Math.random() - 0.5) * 1.1,
      Math.max(top, to.y + 1.5) + Math.random() * 0.8,
      to.z + (Math.random() - 0.5) * 0.8,
    );
    const fall = -0.8 - Math.random() * 2.4;
    const drop = this.w.y - to.y;
    const topTime =
      (-fall - Math.sqrt(fall * fall - 2 * GRAVITY * drop)) / GRAVITY;
    c.pos.lerp(this.w, 1 - b);
    const near = c.pos.distanceTo(to);
    this.offscreen(c.pos, to);
    const t =
      (topTime + (sideTime - topTime) * b) *
      Math.sqrt(c.pos.distanceTo(to) / near);
    c.vel
      .copy(to)
      .sub(c.pos)
      .divideScalar(t)
      .addScaledVector(Y, -0.5 * GRAVITY * t);
    const roll = (12 + Math.random() * 12) * (Math.random() < 0.5 ? 1 : -1);
    if (Math.random() < b) {
      const facing = Math.abs(this.aimN.z) > 0.97;
      const lead = facing
        ? this.n.copy(c.vel).addScaledVector(Y, GRAVITY * t)
        : this.aimN;
      this.edgeOut(c, lead, side * Math.abs(roll), RAIN_VARY);
    } else {
      this.edgeOn(c, t, roll);
      c.quat.premultiply(
        this.q.setFromAxisAngle(
          this.aimN,
          (Math.random() - 0.5) * Math.PI * (0.4 + VARY),
        ),
      );
      c.spin.applyQuaternion(this.q);
    }
    launch(c, true);
  }

  edgeOn(c, t, roll) {
    const axis = this.v
      .copy(c.vel)
      .addScaledVector(Y, GRAVITY * t)
      .cross(this.aimN);
    if (axis.lengthSq() < 1e-6) axis.set(1, 0, 0).cross(this.aimN);
    axis.normalize();
    c.quat.setFromUnitVectors(Y, axis);
    c.spin.copy(axis).multiplyScalar(roll);
  }

  edgeOut(c, dir, roll, spread = 1) {
    const axis = this.v.crossVectors(dir, Z);
    if (axis.lengthSq() < 1e-6) axis.copy(Y);
    const lean =
      (Math.PI / 2) *
      clamp(FACE + (Math.random() - 0.5) * VARY * 0.5 * spread, 0, 0.95);
    axis
      .normalize()
      .multiplyScalar(Math.cos(lean))
      .addScaledVector(Z, Math.sin(lean));
    c.quat.setFromUnitVectors(Y, axis);
    c.spin.copy(axis).multiplyScalar(roll);
    this.s
      .set(Math.random() - 0.5, Math.random() - 0.5, 0)
      .multiplyScalar(VARY * 6);
    c.spin.add(this.s);
  }

  edgeTo(c, n) {
    const axis = this.w.copy(Y).applyQuaternion(c.quat);
    const along = axis.dot(n);
    if (Math.abs(along) <= RIM) return;
    const level = this.s.copy(axis).addScaledVector(n, -along);
    if (level.lengthSq() < 1e-6) return;
    level
      .normalize()
      .multiplyScalar(Math.sqrt(1 - RIM * RIM))
      .addScaledVector(n, Math.sign(along) * RIM);
    c.quat.premultiply(this.q.setFromUnitVectors(axis, level));
  }

  support(c, n) {
    const axis = this.w.copy(Y).applyQuaternion(c.quat);
    const along = axis.dot(n);
    const flat = Math.sqrt(Math.max(0, 1 - along * along));
    return R * flat + (TH / 2) * Math.abs(along);
  }

  cast(origin, dir, far) {
    const { i } = this;
    i.raycaster.set(origin, dir);
    i.raycaster.far = far;
    const h = i.raycaster.intersectObject(i.peach.mesh, false)[0] || null;
    i.raycaster.far = Infinity;
    return h;
  }

  collide(c) {
    const { i, v, n } = this;
    v.subVectors(c.pos, c.prev);
    const len = v.length();
    let h = len > 1e-5 ? this.cast(c.prev, v.divideScalar(len), len + R) : null;
    if (!h) {
      v.copy(i.group.position).sub(c.pos).normalize();
      h = this.cast(c.pos, v, R + 0.1);
    }
    if (!h) return;
    n.copy(h.face.normal).transformDirection(i.peach.mesh.matrixWorld);
    if (c.hits === 0) this.edgeTo(c, n);
    const gap = v.copy(c.pos).sub(h.point).dot(n) - this.support(c, n);
    if (gap > 0.002) return;
    c.pos.addScaledVector(n, -gap);
    const into = v.copy(c.vel).addScaledVector(i.velocity, -0.6).dot(n);
    if (into < 0) this.impact(c, h, n, -into);
  }

  impact(c, h, n, speed) {
    const { i, v } = this;
    const dir = this.w.copy(c.vel).normalize();
    const first = c.hits === 0;
    v.copy(c.pos).sub(i.group.position);
    v.y = 0;
    v.normalize();
    if (first) {
      c.vel
        .copy(n)
        .multiplyScalar(1.2 + Math.random() * 0.8)
        .addScaledVector(v, 1.4 + Math.random())
        .add(this.s.set(0, POP + Math.random() * 1.4, 0.8));
    } else {
      c.vel.addScaledVector(n, (1 + BOUNCE) * speed);
      const normal = c.vel.dot(n);
      this.s.copy(c.vel).addScaledVector(n, -normal).multiplyScalar(SLIDE);
      c.vel.copy(n).multiplyScalar(normal).add(this.s);
      c.vel.addScaledVector(v, 0.5 + Math.random() * 0.5);
    }
    c.vel.addScaledVector(i.velocity, 0.6);
    v.crossVectors(n, dir);
    c.spin
      .copy(v)
      .multiplyScalar(first ? 26 + Math.random() * 14 : speed * 3)
      .add(
        this.s
          .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
          .multiplyScalar(8),
      );
    if (first) {
      c.pos.addScaledVector(n, -SINK);
      c.at.copy(h.point);
      c.n.copy(n);
      // eslint-disable-next-line no-param-reassign
      c.stick = STICK;
    }
    // eslint-disable-next-line no-param-reassign
    c.hits += 1;
    const k = clamp(speed / 12, 0, 1);
    if (!first && speed < 1.5) {
      if (speed > 0.6) this.audio.tink();
      return;
    }
    const at = i.toScreen(h.point);
    const strength = (c.rain ? 0.45 : 0.9) * (first ? 1 : 0.5) * (0.5 + k);
    if (first && i.phase === "live")
      i.smack(h, 0, 0, strength, "coins", {
        dir: dir.addScaledVector(n, -0.4).normalize(),
        x: at.x,
        y: at.y,
        quiet: c.rain,
      });
    else i.peach.addJiggle(h.point, dir, 0.02 * k, 0.4);
    this.hitSound(first, k, at.x);
    this.ring(h.point, n, (first ? 0.35 : 0.2) + 0.35 * k);
    if (first) this.spark(h.point, n, 0.5 + 0.4 * k, 0, 0.22);
    const count = first ? 4 + Math.round(4 * k) : 1;
    for (let s = 0; s < count; s += 1)
      this.spark(h.point, n, 0.1 + Math.random() * 0.14, 1.2 + 1.8 * k);
  }

  hitSound(first, k, x) {
    const pan = clamp((x / window.innerWidth) * 2 - 1, -1, 1) * 0.5;
    const loud = (first ? 1 : 0.5) * (0.7 + 0.3 * k);
    const spread = (amount) => 1 + (Math.random() * 2 - 1) * amount;
    playCoinSkin(
      1.3 * loud * spread(0.3),
      pan,
      (7000 + 5000 * k) * spread(0.3),
      Math.random() * 0.012,
    );
    playPat(
      clamp(0.4 + 0.45 * k + (Math.random() - 0.5) * 0.3, 0, 1),
      pan,
      this.i.oil,
      { gain: 1.4 * loud * spread(0.4), flam: Math.random() < 0.2 },
    );
  }

  release(c) {
    /* eslint-disable no-param-reassign */
    const { i } = this;
    c.glow = GLOW;
    c.trailIn = 0;
    i.peach.addJiggle(c.at, this.v.copy(c.n), 0.025, 0.45);
    for (let s = 0; s < 3; s += 1)
      this.spark(c.pos, c.n, 0.14 + Math.random() * 0.1, 1.6 + Math.random());
    /* eslint-enable no-param-reassign */
  }

  trail(c, dt) {
    /* eslint-disable no-param-reassign */
    c.glow -= dt;
    c.trailIn -= dt;
    if (c.trailIn > 0) return;
    c.trailIn = TRAIL_GAP;
    /* eslint-enable no-param-reassign */
    const fade = Math.max(0, (c.glow - GLOW + TRAIL) / TRAIL);
    if (fade > 0)
      this.spark(c.prev, Z, 0.03 + 0.04 * fade, 0, 0.18, 0.45 * fade);
  }

  scatter() {
    /* eslint-disable no-param-reassign */
    this.coins?.forEach((c) => {
      if (!c.on) return;
      c.stick = 0;
      c.hits = 99;
      this.v.copy(c.pos).sub(this.i.group.position).normalize();
      c.vel
        .addScaledVector(this.v, 5 + Math.random() * 3)
        .add(this.s.set(0, 3, 1));
      c.spin.multiplyScalar(2);
    });
    /* eslint-enable no-param-reassign */
  }

  offscreen(pos, to) {
    const away = this.v.subVectors(pos, to).normalize();
    for (let n = 0; n < 80; n += 1) {
      this.ndc.copy(pos).project(this.camera);
      if (Math.abs(this.ndc.x) > 1.12 || this.ndc.y > 1.12) return;
      pos.addScaledVector(away, 0.12);
    }
  }

  ring(point, n, size) {
    const slot = this.rings.reduce((a, b) => (b.age > a.age ? b : a));
    slot.ring.position.copy(point).addScaledVector(n, 0.01);
    slot.ring.quaternion.setFromUnitVectors(Z, n);
    slot.age = 0;
    slot.size = size;
  }

  spark(point, n, size, burst, life = 0.35 + Math.random() * 0.3, peak = 1) {
    const t = this.sparks.reduce((a, b) =>
      b.age / b.life > a.age / a.life ? b : a,
    );
    t.s.position.copy(point).addScaledVector(n, 0.05);
    t.age = 0;
    t.life = life;
    t.size = size;
    t.peak = peak;
    t.vel
      .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      .add(n)
      .normalize()
      .multiplyScalar(burst * (0.6 + Math.random()));
    t.s.material.rotation = Math.random();
    t.s.visible = true;
  }

  gone(c) {
    this.ndc.copy(c.pos).project(this.camera);
    const out = this.ndc.y < -1.3 || Math.abs(this.ndc.x) > 1.2;
    return c.age > LIFE || (c.vel.y < 0 && out);
  }

  fly(c, dt) {
    const { q, v } = this;
    c.prev.copy(c.pos);
    // eslint-disable-next-line no-param-reassign
    c.vel.y += GRAVITY * dt;
    c.pos.addScaledVector(c.vel, dt);
    v.copy(c.spin).multiplyScalar(dt);
    const a = v.length();
    if (a > 0) c.quat.premultiply(q.setFromAxisAngle(v.divideScalar(a), a));
    if (c.hits < 5 && this.i.peach.mesh) this.collide(c);
  }

  clash(now) {
    const { v } = this;
    const live = this.coins.filter((c) => c.on && c.stick <= 0);
    for (let a = 0; a < live.length; a += 1)
      for (let b = a + 1; b < live.length; b += 1) {
        const p = live[a];
        const o = live[b];
        v.subVectors(o.pos, p.pos);
        const d = v.length();
        if (d > 0 && d < TOUCH) {
          v.divideScalar(d);
          p.pos.addScaledVector(v, -(TOUCH - d) / 2);
          o.pos.addScaledVector(v, (TOUCH - d) / 2);
          const closing = this.w.subVectors(o.vel, p.vel).dot(v);
          if (closing < 0) {
            const j = (-(1 + CLASH) * closing) / 2;
            p.vel.addScaledVector(v, -j);
            o.vel.addScaledVector(v, j);
            this.s
              .set(
                Math.random() - 0.5,
                Math.random() - 0.5,
                Math.random() - 0.5,
              )
              .multiplyScalar(-closing * 6);
            p.spin.add(this.s);
            o.spin.sub(this.s);
            if (-closing > 0.6 && now - this.clinkAt > CLINK_GAP) {
              this.clinkAt = now;
              playCoinClink(
                0.7 * clamp(-closing / 6, 0.25, 1),
                clamp(
                  this.i.toScreen(p.pos).x / window.innerWidth - 0.5,
                  -0.5,
                  0.5,
                ),
              );
              this.spark(
                this.w.addVectors(p.pos, o.pos).multiplyScalar(0.5),
                v,
                0.12,
                0.8,
              );
            }
          }
        }
      }
  }

  update(delta, active) {
    this.active = active;
    const p = this.i.pointer;
    if (this.live() && p.pressed && !this.i.garment.stripping) {
      this.held += delta;
      if (this.held > RAIN_AFTER) {
        this.rainIn -= delta;
        while (this.rainIn <= 0) {
          this.rain(p.x, p.y);
          this.rainIn += RAIN_GAP * (0.7 + Math.random() * 0.6);
        }
      }
    } else this.held = 0;
    if (!this.built) return;
    const dt = Math.min(delta, 1 / 30);
    const { m, s } = this;
    this.i.peach.mesh?.updateWorldMatrix(true, false);
    this.clash(performance.now());
    let shown = 0;
    this.coins.forEach((c) => {
      if (!c.on) return;
      /* eslint-disable no-param-reassign */
      c.age += dt;
      if (c.stick > 0) {
        c.stick -= dt;
        if (c.stick <= 0) this.release(c);
      } else this.fly(c, dt);
      if (c.glow > 0) this.trail(c, dt);
      if (this.gone(c)) {
        c.on = false;
        return;
      }
      const fade = Math.min(1, (LIFE - c.age) / 0.3);
      const punch =
        c.stick > 0 ? 0.88 : 1 + 0.2 * Math.max(0, c.glow / GLOW) ** 2;
      m.compose(c.pos, c.quat, s.setScalar(fade * punch));
      this.mesh.setMatrixAt(shown, m);
      shown += 1;
      /* eslint-enable no-param-reassign */
    });
    this.mesh.count = shown;
    this.mesh.instanceMatrix.needsUpdate = true;
    this.rings.forEach((r) => {
      // eslint-disable-next-line no-param-reassign
      r.age += delta;
      showRing(r.ring, Math.min(1, r.age / 0.3), 0.08, r.size, 0.8);
    });
    const calm = reducedMotion.matches ? 0.3 : 1;
    this.sparks.forEach((t) => {
      /* eslint-disable no-param-reassign */
      t.age += delta;
      const f = t.age / t.life;
      const glow = t.age < 0.05 ? t.age / 0.05 : Math.max(0, 1 - f) ** 1.5;
      t.vel.y += GRAVITY * 0.3 * delta;
      t.s.position.addScaledVector(t.vel, delta * calm);
      t.s.material.opacity = glow * t.peak;
      t.s.scale.setScalar(t.size * (0.35 + glow));
      t.s.visible = f < 1;
      /* eslint-enable no-param-reassign */
    });
  }
}
