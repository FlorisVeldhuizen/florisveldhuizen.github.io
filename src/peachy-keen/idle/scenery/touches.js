import { Vector3 } from "three";
import {
  playSlap,
  playSquish,
  playKiss,
  playGlug,
  playSnap,
} from "../../audio";

export const TOUCH = {
  feather: { every: 1.6, jiggle: 0.025, radius: 0.5 },
  admirer: { every: 2.6, jiggle: 0.05, radius: 0.7 },
  paddle: {
    every: 3,
    jiggle: 0.1,
    radius: 0.85,
    sound: "slap",
    knock: 0.35,
  },
  masseuse: { every: 3.2, jiggle: 0.06, radius: 0.9 },
  baron: { every: 3.6, jiggle: 0.03, radius: 0.6, sound: "glug", oil: 0.04 },
  coach: { every: 3.4, jiggle: 0.09, radius: 1, lift: 0.9 },
  choir: { every: 3.8, jiggle: 0.12, radius: 1, sound: "slap", clap: true },
  spa: { every: 4, jiggle: 0.035, radius: 1, wobble: 0.03 },
  press: { every: 4, jiggle: 0.07, radius: 1, sound: "squish", squash: 1.1 },
  cult: { every: 4.4, jiggle: 0.05, radius: 1, spin: 0.35 },
  moon: { every: 4.6, jiggle: 0.08, radius: 1.1, sway: 0.8 },
  collider: {
    every: 4.6,
    jiggle: 0.12,
    radius: 0.8,
    sound: "snap",
    knock: 0.5,
  },
  singularity: { every: 5, jiggle: 0.1, radius: 1.2, squash: 1.6 },
  peachverse: { every: 5, jiggle: 0.14, radius: 1.3, wobble: 0.06 },
};

const MAX_PER_SECOND = 3;
const SOUND_GAP = 0.22;
const UP = new Vector3(0, 1, 0.3).normalize();

export class Toucher {
  constructor(game, interaction, popups) {
    Object.assign(this, { game, i: interaction, popups });
    this.timers = {};
    this.last = {};
    this.budget = MAX_PER_SECOND;
    this.soundTimer = 0;
    this.time = 0;
    this.dir = new Vector3();
    this.from = new Vector3();
    Object.keys(TOUCH).forEach((id) => {
      this.timers[id] = 1 + Math.random() * 3;
      this.last[id] = 0;
    });
  }

  due(delta) {
    this.time += delta;
    this.soundTimer -= delta;
    this.budget = Math.min(
      MAX_PER_SECOND,
      this.budget + delta * MAX_PER_SECOND,
    );
    if (this.i.phase !== "live") return [];
    const ready = [];
    const { helpers } = this.game.state;
    Object.keys(TOUCH).forEach((id) => {
      const owned = helpers[id] || 0;
      if (!owned) return;
      this.timers[id] -= delta;
      if (this.timers[id] > 0 || this.budget < 1) return;
      this.budget -= 1;
      this.timers[id] =
        (TOUCH[id].every * (0.8 + Math.random() * 0.4)) /
        (1 + Math.log10(owned) * 0.6);
      ready.push(id);
    });
    return ready;
  }

  hitFrom(position) {
    const i = this.i;
    this.dir.copy(i.group.position).sub(position).normalize();
    i.raycaster.set(position, this.dir);
    return i.raycaster.intersectObject(i.peach.mesh, false)[0] || null;
  }

  randomHit() {
    const i = this.i;
    const a = Math.random() * Math.PI * 2;
    this.from
      .set(Math.cos(a) * 4, Math.sin(a) * 3.5, 3 + Math.random() * 2)
      .add(i.group.position);
    return this.hitFrom(this.from);
  }

  blush(hit, size, strength = 0.5) {
    const i = this.i;
    if (!hit || !i.settings.handprints) return;
    i.peach.addHandprint(
      hit.point,
      hit.face.normal,
      (Math.random() - 0.5) * 1.2,
      Math.random() < 0.5,
      strength,
      0.04,
      size,
    );
  }

  touch(id, hit, seen = false) {
    const i = this.i;
    const t = TOUCH[id];
    const push = this.dir.setZ(Math.min(this.dir.z, -0.4)).normalize();
    if (hit) i.peach.addJiggle(hit.point, push, t.jiggle, t.radius);
    if (t.knock) i.velocity.addScaledVector(push, t.knock);
    if (t.lift) {
      i.velocity.y += t.lift;
      i.squashVelocity.x += 0.8;
      i.squashAxis.set(0, 1);
    }
    if (t.clap)
      [1, -1].forEach((side) => {
        const cheek = i.cheekPoint(side, -0.3);
        if (cheek) i.peach.addJiggle(cheek.point, UP, t.jiggle, t.radius);
      });
    if (t.squash) {
      i.squashVelocity.x += t.squash;
      i.squashAxis.set(Math.abs(push.x), Math.abs(push.y));
    }
    if (t.wobble) i.wobbleAll(t.wobble);
    if (t.blush) this.blush(hit, t.blush);
    if (t.spin) i.spin.y += t.spin * (Math.random() < 0.5 ? -1 : 1);
    if (t.sway) i.velocity.x += t.sway * (Math.random() < 0.5 ? -1 : 1);
    if (t.oil && this.game.model.dare !== "dry")
      i.oil = Math.min(1, i.oil + t.oil);

    if (
      t.sound &&
      (seen || this.soundTimer <= 0) &&
      this.game.state.options.castSound
    ) {
      this.soundTimer = SOUND_GAP;
      if (t.sound === "slap") playSlap(0.25, i.heat / 100, i.oil, 1.15);
      else if (t.sound === "squish") playSquish(0.15);
      else if (t.sound === "kiss") playKiss();
      else if (t.sound === "glug") playGlug(0.3);
      else if (t.sound === "snap") playSnap(0.25);
    }

    const earned = this.game.model.totals[id] * (this.time - this.last[id]);
    this.last[id] = this.time;
    if (earned > 0 && hit) {
      const at = i.toScreen(hit.point);
      this.popups.juice(at.x, at.y, earned, "helper");
    }
  }
}
