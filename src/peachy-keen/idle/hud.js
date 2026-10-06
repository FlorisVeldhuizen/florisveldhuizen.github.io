import { BUFFS } from "./economy";
import { HELPER_BY_ID } from "./data/helpers";
import { DARE_BY_ID } from "./data/dares";
import { el, setText } from "./dom";
import { format } from "./numbers";
import { reducedMotion } from "../util";
import { playNotes } from "../audio";
import { SyrupDrop, pitWobble, pitIcon } from "./syrup";
import { RollingNumber } from "./rolling-number";

const ROLL_RATE = 10;
const PIT_FLIERS = 5;
const PIT_STAGGER = 0.035;
const PIT_DELAY_MS = 220;
const PIT_GRAVITY = 1700;
const PIT_POP_SPEED = 620;
const PIT_FAN = 0.9;
const PIT_SIZE = 1.35;
const PIT_DOCK = 14 / 22;
const PIT_NOTES = [784, 880, 988, 1047, 1175];
const HOLD_LIMIT_MS = 8000;

export class Hud {
  constructor(game) {
    this.game = game;
    this.count = new RollingNumber(document.getElementById("count"), 120, 17);
    this.drop = new SyrupDrop(document.getElementById("count-unit"));
    this.rate = document.getElementById("rate");
    this.pits = document.getElementById("pits");
    this.pits.innerHTML = `<span></span>${pitIcon()}`;
    this.pitCount = new RollingNumber(this.pits.firstElementChild, 150, 18);
    this.pitIcon = this.pits.querySelector(".pit-icon");
    this.pitWobble = pitWobble(this.pitIcon);
    this.buffs = document.getElementById("buffs");
    this.dare = document.getElementById("dare");
    this.buffRows = new Map();
    this.shownPits = -1;
    this.shownJuice = game.state.juice;
    this.steppedAt = performance.now();
    this.held = { juice: 0, pits: 0 };
    this.heldAt = 0;
    this.fliers = [];
    this.layer = el("div", "gain-layer", document.body);
    this.layer.setAttribute("aria-hidden", "true");
    game.on("buffs", () => this.buildBuffs());
    game.on("replace", () => this.buildBuffs());
    this.buildBuffs();
  }

  buildBuffs() {
    this.buffs.replaceChildren();
    this.buffRows.clear();
    this.game.state.buffs.forEach((b) => {
      const info = BUFFS[b.id];
      const row = el("p", `buff buff-${b.id}`, this.buffs);
      const name =
        b.id === "showcase"
          ? `${HELPER_BY_ID[b.helper].plural} ×${format(b.power)}`
          : info.name;
      row.innerHTML = `<span>${name}</span><i><b></b></i>`;
      this.buffRows.set(b, row.querySelector("b"));
    });
    document.body.classList.toggle(
      "is-frenzy",
      this.game.state.buffs.some((b) => b.id === "frenzy"),
    );
    document.body.classList.toggle(
      "is-storm",
      this.game.state.buffs.some((b) => b.id === "storm"),
    );
  }

  hold(kind, amount) {
    this.held[kind] += amount;
    this.heldAt = performance.now();
  }

  release(kind, amount, size = 1) {
    this.held[kind] = Math.max(0, this.held[kind] - amount);
    if (kind === "pits") this.pitWobble.land(size);
    else this.drop.hit(size);
  }

  drip(amount, size) {
    if (reducedMotion.matches) return;
    this.hold("juice", amount);
    this.drop.drip(size, () => {
      this.held.juice = Math.max(0, this.held.juice - amount);
    });
  }

  splash(amount) {
    this.held.juice = Math.max(0, this.held.juice - amount);
    if (reducedMotion.matches) return;
    this.drop.crown();
    playNotes([880, 1320], { gap: 0.05, length: 0.14, volume: 0.035 });
  }

  flyPits(from, pits) {
    if (reducedMotion.matches) {
      this.release("pits", pits);
      return;
    }
    const count = Math.min(pits, PIT_FLIERS);
    const toward = Math.sign(this.pitTarget().x - from.x) || 1;
    const trip = { count, landed: 0 };
    setTimeout(() => {
      for (let n = 0; n < count; n += 1) {
        const fan = count === 1 ? 0 : (n / (count - 1) - 0.5) * 2 * PIT_FAN;
        const a =
          -Math.PI / 2 + toward * 0.25 + fan + (Math.random() - 0.5) * 0.2;
        const speed = PIT_POP_SPEED * (0.85 + Math.random() * 0.3);
        const node = el("div", "pit-flier", this.layer, pitIcon());
        node.style.visibility = "hidden";
        this.fliers.push({
          node,
          trip,
          carry: Math.floor(pits / count) + (n < pits % count ? 1 : 0),
          x: from.x + (Math.random() - 0.5) * 30,
          y: from.y + (Math.random() - 0.5) * 20,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          age: -n * PIT_STAGGER,
          popFor: 0.36 + Math.random() * 0.12,
          angle: Math.random() * 360,
          spin: (Math.random() < 0.5 ? -1 : 1) * (500 + Math.random() * 400),
        });
      }
    }, PIT_DELAY_MS);
  }

  pitTarget() {
    const box = this.pitIcon.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  }

  stepFliers(dt) {
    if (!this.fliers.length) return;
    const to = this.pitTarget();
    this.fliers = this.fliers.filter((f) => {
      /* eslint-disable no-param-reassign */
      f.age += dt;
      if (f.age < 0) return true;
      const pull = f.age - f.popFor;
      let dx = to.x - f.x;
      let dy = to.y - f.y;
      let dist = Math.hypot(dx, dy);
      if (pull < 0) f.vy += PIT_GRAVITY * dt;
      else {
        const rush = Math.min(2400, 250 + 3000 * pull);
        const steer = 1 - Math.exp(-(4 + 40 * pull) * dt);
        f.vx += ((dx / dist) * rush - f.vx) * steer;
        f.vy += ((dy / dist) * rush - f.vy) * steer;
        f.vy += PIT_GRAVITY * Math.max(0, 1 - pull * 4) * dt;
      }
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      dx = to.x - f.x;
      dy = to.y - f.y;
      dist = Math.hypot(dx, dy);
      const passed = dist < 60 && f.vx * dx + f.vy * dy < 0;
      if (pull > 0 && (dist < 12 || passed || f.age > 3)) {
        f.node.remove();
        this.landPit(f);
        return false;
      }
      f.spin *= Math.exp(-1.2 * dt);
      f.angle = (f.angle + f.spin * dt) % 360;
      const near = pull > 0 ? Math.min(1, dist / 180) : 1;
      const tilt = (((f.angle + 540) % 360) - 180) * near;
      const grow = Math.min(1, f.age / 0.14);
      const pop =
        0.5 +
        (PIT_SIZE - 0.5) *
          grow *
          (2 - grow) *
          (1 + 0.25 * (1 - grow) * grow * 4);
      const size = PIT_DOCK + (pop - PIT_DOCK) * near;
      const speed = Math.hypot(f.vx, f.vy);
      const stretch = 1 + Math.min(0.4, speed / 3000);
      const heading = (Math.atan2(f.vy, f.vx) * 180) / Math.PI;
      f.node.style.visibility = "";
      f.node.style.transform = `translate(${f.x}px, ${f.y}px) rotate(${heading}deg) scale(${size * stretch}, ${size / stretch}) rotate(${tilt - heading}deg)`;
      return true;
      /* eslint-enable no-param-reassign */
    });
  }

  landPit(f) {
    const { trip } = f;
    trip.landed += 1;
    const last = trip.landed === trip.count;
    const note = PIT_NOTES[trip.landed - 1];
    this.held.pits = Math.max(0, this.held.pits - f.carry);
    this.pitWobble.thump(trip.landed / trip.count);
    playNotes(last ? [note, note / 2] : [note], {
      gap: 0.07,
      length: 0.16,
      volume: 0.04,
    });
  }

  rollJuice(juice, dt) {
    const gap = juice - this.shownJuice;
    if (gap < 0 && gap > -1e-6 * juice) return this.shownJuice;
    if (reducedMotion.matches || gap <= 0 || gap < juice * 1e-4)
      this.shownJuice = juice;
    else this.shownJuice += gap * (1 - Math.exp(-dt * ROLL_RATE));
    return this.shownJuice;
  }

  update() {
    const { state } = this.game;
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.steppedAt) / 1000);
    this.steppedAt = now;
    if (now - this.heldAt > HOLD_LIMIT_MS) this.held = { juice: 0, pits: 0 };
    const juice = Math.max(0, state.juice - this.held.juice);
    this.count.set(format(this.rollJuice(juice, dt)));
    this.count.step(dt);
    this.drop.step(dt);
    setText(this.rate, `${format(this.game.rate)} juice per second`);
    const pits = Math.max(0, state.pits - this.held.pits);
    if (pits !== this.shownPits) {
      this.shownPits = pits;
      this.pits.hidden = state.pitsTotal === 0;
      this.pitCount.set(format(pits, { whole: true }));
      this.pits.setAttribute(
        "aria-label",
        `${format(pits, { whole: true })} ${pits === 1 ? "pit" : "pits"}`,
      );
    }
    this.pitCount.step(dt);
    this.stepFliers(dt);
    this.pitWobble.step(dt);
    const clock = Date.now();
    this.buffRows.forEach((bar, b) => {
      const left = Math.max(0, (b.until - clock) / (b.seconds * 1000));
      // eslint-disable-next-line no-param-reassign
      bar.style.transform = `scaleX(${left})`;
    });
    const dare = DARE_BY_ID[state.dares.active];
    this.dare.hidden = !dare;
    if (dare)
      setText(
        this.dare,
        `Dare: ${dare.name} · ${format(state.juiceRun)} / ${format(dare.goal)}`,
      );
  }
}
