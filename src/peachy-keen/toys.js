import { Vector3 } from "three";
import { setBuzz } from "./audio";
import { reducedMotion } from "./util";

const buzz = (ms) => navigator.vibrate?.(ms);
const MODES = ["Steady", "Pulse", "Wave"];
const TAP_MS = 220;
const TAP_PX = 14;

export class Buzzer {
  constructor(interaction) {
    this.i = interaction;
    this.mode = 0;
    this.level = 0;
    this.time = 0;
    this.timer = 0;
    this.clench = 0;
    this.dented = false;
    this.active = false;
    this.buzzing = false;
    this.local = new Vector3();
    this.pull = new Vector3();
    this.dent = new Vector3();
    this.dir = new Vector3();
    this.layer = document.getElementById("combos");
    window.addEventListener("pointerup", (e) => {
      if (!this.active || interaction.phase !== "live") return;
      if (e.target instanceof Element && e.target.closest(".ui")) return;
      const p = interaction.pointer;
      const tapped =
        e.timeStamp - p.downAt < TAP_MS &&
        Math.hypot(e.clientX - p.downX, e.clientY - p.downY) < TAP_PX;
      if (!tapped) return;
      this.mode = (this.mode + 1) % MODES.length;
      this.time = 0;
      this.label(e.clientX, e.clientY);
      interaction.discover("buzzmode");
    });
  }

  label(x, y) {
    const el = document.createElement("span");
    el.className = "pop buzz-mode";
    el.textContent = MODES[this.mode];
    el.style.left = `${x}px`;
    el.style.top = `${y - 36}px`;
    this.layer.appendChild(el);
    const lift = reducedMotion.matches ? 0 : -36;
    el.animate(
      [
        { opacity: 0, transform: "translate(-50%, -50%) scale(0.7)" },
        {
          opacity: 1,
          transform: "translate(-50%, -80%) scale(1)",
          offset: 0.2,
        },
        {
          opacity: 0,
          transform: `translate(-50%, calc(-80% + ${lift}px)) scale(1)`,
        },
      ],
      { duration: 900, easing: "ease-out" },
    ).finished.then(() => el.remove());
  }

  power() {
    const t = this.time;
    if (this.mode === 1)
      return 0.15 + 0.85 * (Math.sin(t * Math.PI * 6) > -0.2);
    if (this.mode === 2)
      return (
        0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * Math.PI * 1.4 - Math.PI / 2))
      );
    return 1;
  }

  setBuzzing(on) {
    if (on === this.buzzing) return;
    this.buzzing = on;
    this.i.ui.cursor.dataset.buzzing = on ? "true" : "";
  }

  release() {
    if (this.dented) this.i.peach.releaseGrab();
    this.dented = false;
  }

  update(delta, active) {
    const { i } = this;
    this.active = active;
    const p = i.pointer;
    const on = active && p.pressed && i.phase === "live" && !i.carrying;
    this.time += delta;
    this.level = on
      ? Math.min(1, this.level + delta / 1.5)
      : Math.max(0, this.level - delta * 3);
    this.setBuzzing(on);
    const hit = on && i.raycastAt(p.x, p.y);
    const power = on ? this.power() : 0;
    setBuzz(on ? power * (0.5 + 0.5 * this.level) : 0, hit ? 1 : 0);
    if (!hit) {
      this.release();
      return;
    }
    const k = this.level * power;
    const shake = reducedMotion.matches ? 0.2 : 1;
    const scale = i.peach.worldScale();
    i.peach.toLocal(hit.point, this.local);
    this.pull
      .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      .multiplyScalar(((0.015 + 0.035 * k) * shake) / scale);
    this.dent
      .copy(hit.face.normal)
      .normalize()
      .multiplyScalar(-(0.05 + 0.03 * k) / scale);
    i.peach.setGrab(this.local, this.pull, 0.55, this.dent, 0.3);
    this.dented = true;
    this.timer -= delta;
    if (this.timer <= 0) {
      this.timer = 0.045;
      this.dir.set(Math.random() - 0.5, Math.random() - 0.5, -0.5).normalize();
      i.peach.addJiggle(hit.point, this.dir, (0.01 + 0.025 * k) * shake, 0.55);
      if (power > 0.5) buzz(40);
    }
    const heat = i.heat / 100;
    if (!reducedMotion.matches) {
      const squirm = (0.6 + heat * 2.2) * this.level;
      i.spin.z += Math.sin(this.time * 7.5) * squirm * delta * 3;
      i.spin.y += Math.cos(this.time * 4.9) * squirm * delta * 2;
      // Random kicks add up like a random walk, so they scale with the square root of time.
      const kick = 0.25 * k * Math.sqrt(delta * 60);
      i.velocity.x += (Math.random() - 0.5) * kick;
      i.velocity.y += (Math.random() - 0.5) * kick;
    }
    this.clench -= delta;
    if (heat > 0.5 && this.clench <= 0) {
      this.clench = 1.6 - heat;
      i.squashVelocity.x += 0.5 + heat * 0.8;
      i.squashAxis.set(1, 0.3);
      i.wobbleAll(0.03);
    }
    i.addHeat(delta * (6 + 16 * k));
    i.ui.meters.classList.add("is-visible");
    i.wake();
    i.talk.say("buzz", delta * 0.6);
    if (i.heat >= 100) i.charge();
  }
}
