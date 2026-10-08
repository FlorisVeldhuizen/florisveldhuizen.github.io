/* eslint-disable no-param-reassign */
import {
  AdditiveBlending,
  NormalBlending,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";
import { softTexture, twinkleTexture } from "../shapes";
import { canvas } from "./parts";

const MAX = 90;

function featherTexture() {
  return canvas(64, 128, (g) => {
    g.translate(32, 64);
    g.rotate(0.15);
    const grad = g.createLinearGradient(0, 56, 0, -56);
    grad.addColorStop(0, "rgba(255,255,255,0.6)");
    grad.addColorStop(1, "rgba(255,255,255,1)");
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(0, 58);
    g.bezierCurveTo(16, 30, 18, -30, 2, -60);
    g.bezierCurveTo(-14, -30, -16, 30, 0, 58);
    g.fill();
    g.strokeStyle = "rgba(120,120,120,0.6)";
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(0, 60);
    g.quadraticCurveTo(3, 0, 1, -58);
    g.stroke();
  });
}

export default class Sparks {
  constructor(group) {
    this.maps = {
      twinkle: twinkleTexture(),
      glow: softTexture("rgba(255,230,180,1)", "rgba(255,160,80,0)"),
      feather: featherTexture(),
    };
    this.items = Array.from({ length: MAX }, () => {
      const sprite = new Sprite(
        new SpriteMaterial({ transparent: true, depthWrite: false }),
      );
      sprite.visible = false;
      group.add(sprite);
      return {
        sprite,
        vel: new Vector3(),
        age: 1,
        life: 1,
        size: 1,
        grow: 0,
        gravity: 0,
        drag: 1,
        spin: 0,
        swirl: 0,
        center: null,
        opacity: 1,
      };
    });
    this.next = 0;
  }

  emit(kind, pos, vel, o = {}) {
    const it = this.items[this.next];
    this.next = (this.next + 1) % MAX;
    const m = it.sprite.material;
    m.map = this.maps[kind];
    const additive = kind === "twinkle" || kind === "glow";
    const blending = additive ? AdditiveBlending : NormalBlending;
    if (m.blending !== blending) {
      m.blending = blending;
      m.needsUpdate = true;
    }
    m.color.set(o.color ?? 0xffffff);
    m.rotation = o.rotation ?? Math.random() * 6.28;
    it.sprite.position.copy(pos);
    it.vel.copy(vel);
    it.age = 0;
    it.life = o.life ?? 1;
    it.size = o.size ?? 0.1;
    it.grow = o.grow ?? 0;
    it.gravity = o.gravity ?? 0;
    it.drag = o.drag ?? 1.5;
    it.spin = o.spin ?? 0;
    it.opacity = o.opacity ?? 1;
    it.swirl = o.swirl ?? 0;
    it.center = o.center ?? null;
    it.sprite.visible = true;
  }

  update(dt) {
    this.items.forEach((it) => {
      if (it.age >= it.life) return;
      it.age += dt;
      const u = it.age / it.life;
      if (u >= 1) {
        it.sprite.visible = false;
        return;
      }
      if (it.swirl && it.center) {
        const dx = it.sprite.position.x - it.center.x;
        const dz = it.sprite.position.z - it.center.z;
        it.vel.x += -dz * it.swirl * dt;
        it.vel.z += dx * it.swirl * dt;
      }
      it.vel.y -= it.gravity * dt;
      it.vel.multiplyScalar(Math.exp(-it.drag * dt));
      it.sprite.position.addScaledVector(it.vel, dt);
      it.sprite.material.rotation += it.spin * dt;
      const pop = Math.min(1, u * 8);
      it.sprite.scale.setScalar(
        it.size * (1 + it.grow * u) * (0.4 + 0.6 * pop),
      );
      it.sprite.material.opacity =
        it.opacity * pop * (1 - Math.max(0, (u - 0.55) / 0.45));
    });
  }

  dispose() {
    Object.values(this.maps).forEach((t) => t.dispose());
  }
}
