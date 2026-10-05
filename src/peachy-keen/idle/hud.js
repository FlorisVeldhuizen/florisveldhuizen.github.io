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
const PIT_STAGGER_MS = 90;
const PIT_DELAY_MS = 280;
const PIT_FLIGHT_MS = 950;
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
    const fliers = Math.min(pits, PIT_FLIERS);
    const box = this.pitIcon.getBoundingClientRect();
    const to = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
    for (let n = 0; n < fliers; n += 1) {
      const carry = Math.floor(pits / fliers) + (n < pits % fliers ? 1 : 0);
      const last = n === fliers - 1;
      setTimeout(
        () =>
          this.flyPit(from, to, () => {
            this.release("pits", carry, last ? 1 : 0);
            playNotes(
              last ? [PIT_NOTES[n], PIT_NOTES[n] / 2] : [PIT_NOTES[n]],
              { gap: 0.07, length: 0.16, volume: 0.04 },
            );
          }),
        PIT_DELAY_MS + n * PIT_STAGGER_MS,
      );
    }
  }

  flyPit(from, to, land) {
    const x0 = from.x + (Math.random() - 0.5) * 70;
    const lift = 90 + Math.random() * 50;
    const hang = { x: x0 + (to.x - x0) * 0.12, y: from.y - lift };
    const spin = (Math.random() < 0.5 ? -1 : 1) * 320;
    const across = [
      { translate: `${x0}px 0` },
      { translate: `${hang.x}px 0`, offset: 0.4 },
      { translate: `${hang.x + 6}px 0`, offset: 0.55 },
      { translate: `${to.x}px 0` },
    ];
    const rise = [
      { translate: `0 ${from.y}px`, scale: 0.6, rotate: "0deg" },
      {
        translate: `0 ${hang.y}px`,
        scale: 1.5,
        rotate: `${spin * 0.3}deg`,
        offset: 0.4,
        easing: "cubic-bezier(.3,0,.7,1)",
      },
      {
        translate: `0 ${hang.y - 6}px`,
        scale: 1.45,
        rotate: `${spin * 0.4}deg`,
        offset: 0.55,
        easing: "cubic-bezier(.6,0,1,.6)",
      },
      { translate: `0 ${to.y}px`, scale: 1, rotate: `${spin}deg` },
    ];
    [0.18, 0.4, 1].forEach((opacity, n, all) => {
      const outer = el("div", "pit-flier", this.layer);
      const inner = el("div", "", outer, pitIcon());
      outer.style.opacity = opacity;
      const delay = (all.length - 1 - n) * 45;
      const options = { duration: PIT_FLIGHT_MS, delay, fill: "both" };
      outer.animate(across, { ...options, easing: "linear" });
      inner
        .animate(rise, { ...options, easing: "cubic-bezier(.2,.6,.4,1)" })
        .finished.then(() => {
          outer.remove();
          if (opacity === 1) land();
        });
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
