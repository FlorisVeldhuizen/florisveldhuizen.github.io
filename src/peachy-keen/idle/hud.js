import { BUFFS } from "./economy";
import { HELPER_BY_ID } from "./data/helpers";
import { DARE_BY_ID } from "./data/dares";
import { el, setText } from "./dom";
import { format } from "./numbers";
import { reducedMotion } from "../util";
import { playNotes } from "../audio";
import { SyrupDrop, pitWobble, pitIcon } from "./syrup";
import { RollingNumber } from "./rolling-number";

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

function landFlier(f) {
  const { trip } = f;
  trip.landed += 1;
  const last = trip.landed === trip.count;
  const note = PIT_NOTES[trip.landed - 1];
  trip.land(f, trip.landed / trip.count);
  playNotes(last ? [note, note / 2] : [note], {
    gap: 0.07,
    length: 0.16,
    volume: 0.04,
  });
}

export class Hud {
  constructor(game) {
    this.game = game;
    this.count = new RollingNumber(document.getElementById("count"));
    this.drop = new SyrupDrop(document.getElementById("count-unit"));
    this.rate = document.getElementById("rate");
    this.pits = document.getElementById("pits");
    this.pits.innerHTML = `<span></span>${pitIcon()}`;
    this.pitCount = new RollingNumber(this.pits.firstElementChild, {
      whole: true,
    });
    this.pitIcon = this.pits.querySelector(".pit-icon");
    this.pitWobble = pitWobble(this.pitIcon);
    // Fliers home in every frame, and reading the rect forces a layout, so it is kept until the score moves.
    this.pitBox = null;
    const moved = () => {
      this.pitBox = null;
    };
    const watch = new ResizeObserver(moved);
    watch.observe(this.pits);
    watch.observe(this.pits.parentElement);
    window.addEventListener("resize", moved);
    this.buffs = document.getElementById("buffs");
    this.dare = document.getElementById("dare");
    this.buffRows = new Map();
    this.shownPits = -1;
    this.steppedAt = performance.now();
    this.held = { juice: 0, pits: 0 };
    this.heldAt = 0;
    this.fliers = [];
    this.flierFrame = 0;
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
      "is-satisfied",
      this.game.state.buffs.some((b) => b.id === "crave"),
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
    const carries = Array.from(
      { length: count },
      (_, n) => Math.floor(pits / count) + (n < pits % count ? 1 : 0),
    );
    this.launch(from, carries, {
      make: () => pitIcon(),
      target: () => this.pitTarget(),
      pop: PIT_SIZE,
      dock: PIT_DOCK,
      land: (f, progress) => {
        this.held.pits = Math.max(0, this.held.pits - f.carry);
        this.pitWobble.thump(progress);
      },
    });
  }

  launch(
    from,
    carries,
    {
      make,
      target,
      pop,
      dock,
      land,
      stagger = PIT_STAGGER,
      spread = PIT_FAN,
      hang = 0,
      lift = 1,
    },
  ) {
    const count = carries.length;
    const start = target();
    const toward = Math.sign((start ? start.x : from.x) - from.x) || 1;
    const trip = { count, landed: 0, target, land, frame: -1, to: null };
    setTimeout(() => {
      carries.forEach((carry, n) => {
        const fan = count === 1 ? 0 : (n / (count - 1) - 0.5) * 2 * spread;
        const a =
          -Math.PI / 2 + toward * 0.25 + fan + (Math.random() - 0.5) * 0.2;
        const speed = PIT_POP_SPEED * lift * (0.85 + Math.random() * 0.3);
        const node = el("div", "pit-flier", this.layer, make());
        node.style.visibility = "hidden";
        this.fliers.push({
          node,
          trip,
          carry,
          pop,
          dock,
          x: from.x + (Math.random() - 0.5) * 30,
          y: from.y + (Math.random() - 0.5) * 20,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed,
          hang,
          age: -n * stagger,
          popFor: 0.36 + Math.random() * 0.12,
          angle: Math.random() * 360,
          spin: (Math.random() < 0.5 ? -1 : 1) * (500 + Math.random() * 400),
        });
      });
    }, PIT_DELAY_MS);
  }

  pitTarget() {
    if (!this.pitBox) {
      const box = this.pitIcon.getBoundingClientRect();
      this.pitBox = {
        x: box.left + box.width / 2,
        y: box.top + box.height / 2,
      };
    }
    return this.pitBox;
  }

  stepFliers(dt) {
    if (!this.fliers.length) return;
    this.flierFrame += 1;
    this.fliers = this.fliers.filter((f) => {
      /* eslint-disable no-param-reassign */
      f.age += dt;
      if (f.age < 0) return true;
      const { trip } = f;
      if (trip.frame !== this.flierFrame) {
        trip.frame = this.flierFrame;
        trip.to = trip.target();
      }
      const { to } = trip;
      const pull = to ? f.age - f.popFor : -1;
      let dx = to ? to.x - f.x : 0;
      let dy = to ? to.y - f.y : 0;
      let dist = Math.hypot(dx, dy);
      if (pull < 0)
        f.vy +=
          PIT_GRAVITY * (1 - f.hang * Math.exp(-Math.abs(f.vy) / 220)) * dt;
      else {
        const rush = Math.min(2400, 250 + 3000 * pull);
        const steer = 1 - Math.exp(-(4 + 40 * pull) * dt);
        f.vx += ((dx / dist) * rush - f.vx) * steer;
        f.vy += ((dy / dist) * rush - f.vy) * steer;
        f.vy += PIT_GRAVITY * Math.max(0, 1 - pull * 4) * dt;
      }
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      if (to) {
        dx = to.x - f.x;
        dy = to.y - f.y;
        dist = Math.hypot(dx, dy);
      }
      const passed = dist < 60 && f.vx * dx + f.vy * dy < 0;
      if ((pull > 0 && (dist < 12 || passed)) || f.age > 3) {
        f.node.remove();
        landFlier(f);
        return false;
      }
      f.spin *= Math.exp(-1.2 * dt);
      f.angle = (f.angle + f.spin * dt) % 360;
      const near = pull > 0 ? Math.min(1, dist / 180) : 1;
      const tilt = (((f.angle + 540) % 360) - 180) * near;
      const grow = Math.min(1, f.age / 0.14);
      const pop =
        0.5 +
        (f.pop - 0.5) * grow * (2 - grow) * (1 + 0.25 * (1 - grow) * grow * 4);
      const size = f.dock + (pop - f.dock) * near;
      const speed = Math.hypot(f.vx, f.vy);
      const stretch = 1 + Math.min(0.4, speed / 3000);
      const heading = (Math.atan2(f.vy, f.vx) * 180) / Math.PI;
      f.node.style.visibility = "";
      f.node.style.transform = `translate(${f.x}px, ${f.y}px) rotate(${heading}deg) scale(${size * stretch}, ${size / stretch}) rotate(${tilt - heading}deg)`;
      return true;
      /* eslint-enable no-param-reassign */
    });
  }

  update() {
    const { state } = this.game;
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.steppedAt) / 1000);
    this.steppedAt = now;
    if (now - this.heldAt > HOLD_LIMIT_MS) this.held = { juice: 0, pits: 0 };
    this.count.update(Math.max(0, state.juice - this.held.juice), dt);
    this.drop.step(dt);
    setText(this.rate, `${format(this.game.rate)} juice per second`);
    const pits = Math.max(0, state.pits - this.held.pits);
    if (pits !== this.shownPits) {
      this.shownPits = pits;
      this.pits.hidden = state.pitsTotal === 0;
      this.pits.setAttribute(
        "aria-label",
        `${format(pits, { whole: true })} ${pits === 1 ? "pit" : "pits"}`,
      );
    }
    this.pitCount.update(pits, dt);
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
