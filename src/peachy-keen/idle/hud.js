import { BUFFS } from "./economy";
import { HELPER_BY_ID } from "./data/helpers";
import { DARE_BY_ID } from "./data/dares";
import { el, setText, animate } from "./dom";
import { format } from "./numbers";

export class Hud {
  constructor(game) {
    this.game = game;
    this.count = document.getElementById("count");
    this.rate = document.getElementById("rate");
    this.pits = document.getElementById("pits");
    this.buffs = document.getElementById("buffs");
    this.dare = document.getElementById("dare");
    this.buffRows = new Map();
    this.shownPits = -1;
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

  bump() {
    animate(
      this.count,
      [{ transform: "scale(1.08)" }, { transform: "scale(1)" }],
      {
        duration: 220,
        easing: "cubic-bezier(.2,.9,.3,1.4)",
      },
    );
  }

  update() {
    const { state } = this.game;
    setText(this.count, format(state.juice));
    setText(this.rate, `${format(this.game.rate)} per second`);
    if (state.pits !== this.shownPits) {
      this.shownPits = state.pits;
      this.pits.hidden = state.pitsTotal === 0;
      setText(
        this.pits,
        `${format(state.pits, { whole: true })} ${state.pits === 1 ? "pit" : "pits"}`,
      );
    }
    const now = Date.now();
    this.buffRows.forEach((bar, b) => {
      const left = Math.max(0, (b.until - now) / (b.seconds * 1000));
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
