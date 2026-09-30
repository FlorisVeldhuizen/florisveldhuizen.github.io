import { SEEDS, SEED_BY_ID, RIPE, ROTTEN } from "../data/orchard";
import { plantSvg } from "./plant";
import { el, setText, toggle } from "../dom";
import { format, formatTime } from "../numbers";

export class OrchardView {
  constructor(game, orchard, root) {
    Object.assign(this, { game, orchard, root });
    this.selected = "cling";
    this.focus = -1;
    el(
      "p",
      "shop-intro",
      root,
      "Plant pits and wait. Ripe trees can be harvested. Leave them too long and they rot. Trees that grow next to each other sometimes cross-breed in empty plots.",
    );
    this.seeds = el("div", "seeds", root);
    this.seeds.setAttribute("role", "group");
    this.seeds.setAttribute("aria-label", "Seed to plant");
    this.grid = el("div", "plots", root);
    this.info = el("p", "shop-detail", root);
    this.info.setAttribute("aria-live", "polite");
    this.info.textContent = "Point at a plot or a seed to see the details.";
    this.plots = [];
    this.seedButtons = new Map();
    this.shownSize = 0;
    this.shownSeeds = "";
  }

  buildSeeds() {
    const { discovered } = this.game.state.orchard;
    this.shownSeeds = discovered.join();
    this.seeds.replaceChildren();
    this.seedButtons.clear();
    SEEDS.filter((seed) => discovered.includes(seed.id)).forEach((seed) => {
      const b = el("button", "seed", this.seeds);
      b.type = "button";
      b.innerHTML = `<i style="background:${seed.color}"></i><span>${seed.name}</span><small>${seed.pits} pit${seed.pits > 1 ? "s" : ""}</small>`;
      b.addEventListener("click", () => {
        this.selected = seed.id;
        this.describeSeed(seed);
        this.update();
      });
      b.addEventListener("pointerenter", () => this.describeSeed(seed));
      this.seedButtons.set(seed.id, b);
    });
    const hidden = SEEDS.length - discovered.length;
    if (hidden > 0)
      el(
        "p",
        "seed seed-unknown",
        this.seeds,
        `<span>${hidden} more to discover</span><small>Cross-breed neighbours</small>`,
      );
  }

  describeSeed(seed) {
    const recipe = seed.parents
      ? ` Cross-breeds from ${SEED_BY_ID[seed.parents[0]].name} and ${SEED_BY_ID[seed.parents[1]].name}.`
      : "";
    const rot = seed.fromRot ? " Sprouts on rotten plots." : "";
    setText(
      this.info,
      `${seed.name}: ${seed.about} While growing: ${seed.passive.text}. Harvest: ${seed.harvest.text}. Ripens in ${formatTime(seed.grow / this.game.model.growth)}.${recipe}${rot}`,
    );
  }

  buildGrid() {
    const size = this.orchard.size;
    this.shownSize = size;
    this.orchard.fit();
    this.grid.style.setProperty("--size", size);
    this.grid.replaceChildren();
    this.plots = [];
    for (let index = 0; index < size * size; index += 1) {
      const b = el("button", "plot", this.grid);
      b.type = "button";
      b.innerHTML =
        '<svg viewBox="0 0 60 60" aria-hidden="true"></svg><span class="plot-ring"></span>';
      b.addEventListener("click", () => this.use(index));
      b.addEventListener("pointerenter", () => {
        this.focus = index;
        this.describePlot(index);
      });
      this.plots.push({ button: b, svg: b.firstElementChild, key: "" });
    }
  }

  use(index) {
    this.focus = index;
    const plot = this.game.state.orchard.plots[index];
    if (!plot) {
      if (!this.orchard.plant(index, this.selected)) {
        const seed = SEED_BY_ID[this.selected];
        setText(
          this.info,
          `You need ${seed.pits} pits to plant a ${seed.name}. Bursts drop pits.`,
        );
      }
    } else {
      const info = this.orchard.describe(index);
      if (info.stage < RIPE && !this.plots[index].confirm) {
        this.plots[index].confirm = true;
        setText(
          this.info,
          `That ${info.seed.name} isn't ripe yet. Tap again to dig it up.`,
        );
        return;
      }
      const reward = this.orchard.harvest(index);
      if (reward) {
        const amount = reward.value
          ? `${format(reward.value)} juice`
          : reward.text;
        setText(this.info, `Harvested a ${info.seed.name}: ${amount}.`);
        this.game.emit("harvest", {
          seed: info.seed,
          reward,
          button: this.plots[index].button,
        });
      }
    }
    this.plots[index].confirm = false;
    this.update();
  }

  describePlot(index) {
    const info = this.orchard.describe(index);
    if (!info) {
      const seed = SEED_BY_ID[this.selected];
      setText(
        this.info,
        `Empty plot. Tap to plant a ${seed.name} for ${seed.pits} pit${seed.pits > 1 ? "s" : ""}.`,
      );
      return;
    }
    const { seed, stage, name, left } = info;
    let when = "";
    if (stage < RIPE) when = ` Ripe in ${formatTime(left)}.`;
    else if (stage === RIPE)
      when = ` Rots in ${formatTime(left)}. Tap to harvest: ${seed.harvest.text}.`;
    else
      when = " Tap to clear it. Rotten plots sometimes grow something strange.";
    const perk = stage < ROTTEN ? ` Giving ${seed.passive.text}.` : "";
    setText(this.info, `${seed.name}, ${name.toLowerCase()}.${perk}${when}`);
  }

  update() {
    const { state } = this.game;
    if (this.shownSeeds !== state.orchard.discovered.join()) this.buildSeeds();
    if (this.shownSize !== this.orchard.size) this.buildGrid();
    this.seedButtons.forEach((b, id) => {
      b.setAttribute("aria-pressed", String(id === this.selected));
      toggle(b, "is-short", state.pits < SEED_BY_ID[id].pits);
    });
    const now = Date.now();
    this.plots.forEach((p, index) => {
      const plot = state.orchard.plots[index];
      const info = plot ? this.orchard.describe(index, now) : null;
      const key = info ? `${plot.seed}${info.stage}` : "empty";
      if (key !== p.key) {
        // eslint-disable-next-line no-param-reassign
        p.key = key;
        p.svg.innerHTML = info ? plantSvg(info.stage, info.seed) : "";
        p.button.dataset.stage = info ? info.stage : "";
        p.button.setAttribute(
          "aria-label",
          info ? `${info.seed.name}, ${info.name}` : "Empty plot",
        );
      }
      p.button.style.setProperty(
        "--grow",
        info ? Math.min(1, info.progress) : 0,
      );
    });
    if (this.focus >= 0 && document.activeElement?.closest?.(".plots"))
      this.describePlot(this.focus);
  }
}
