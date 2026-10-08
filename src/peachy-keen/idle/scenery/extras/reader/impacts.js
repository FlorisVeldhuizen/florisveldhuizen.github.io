/* eslint-disable no-param-reassign -- ring slot objects are updated in place each frame */
import { Mesh, PlaneGeometry } from "three";
import { ringMaterial, showRing } from "../../../../rings";

export default class Impacts {
  constructor(group, color, count = 3) {
    this.slots = Array.from({ length: count }, () => {
      const ring = new Mesh(
        new PlaneGeometry(1, 1),
        ringMaterial(color, { billboard: true, onTop: true }),
      );
      ring.renderOrder = 4;
      ring.visible = false;
      group.add(ring);
      return { ring, age: 1, life: 0.5, size: 1, power: 0.5 };
    });
  }

  add(point, size = 1, power = 0.6) {
    const slot = this.slots.reduce((a, b) =>
      a.age / a.life >= b.age / b.life ? a : b,
    );
    slot.ring.position.copy(point);
    Object.assign(slot, { age: 0, life: 0.45 + size * 0.15, size, power });
  }

  update(dt) {
    this.slots.forEach((s) => {
      if (s.age >= s.life) {
        s.ring.visible = false;
        return;
      }
      s.age = Math.min(s.life, s.age + dt);
      showRing(s.ring, s.age / s.life, s.size * 0.2, s.size, s.power);
    });
  }
}
