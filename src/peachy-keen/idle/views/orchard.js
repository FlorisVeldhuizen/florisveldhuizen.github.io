import { SEEDS, SEED_BY_ID, RIPE, ROTTEN } from "../data/orchard";
import { plantFx } from "./plant";
import { renders } from "../renders";

const VARIANTS = 5;
import { el, setDetail, toggle } from "../dom";
import { format, formatTime } from "../numbers";
import { iconSvg } from "../icons";
import { pitIcon, dropIcon } from "../syrup";

const pitCount = (n) =>
  `${format(n, { whole: true })} ${n === 1 ? "pit" : "pits"}`;

const morePits = (n) =>
  `${format(n, { whole: true })} more ${n === 1 ? "pit" : "pits"}`;

const pitTag = (text) => `<span class="pit-tag">${text}${pitIcon()}</span>`;

const canHover = window.matchMedia("(hover: hover)");
const press = () => (canHover.matches ? "Click" : "Tap");

const REWARD_ICONS = {
  juice: dropIcon(),
  pits: pitIcon(),
  nectar: iconSvg("nectar"),
};

function rewardLine(reward) {
  const icon = REWARD_ICONS[reward.kind];
  if (!icon) return `${reward.text}.`;
  const text = reward.value ? `${format(reward.value)} juice` : reward.text;
  return el("span", "reward-tag", null, `+${text}${icon}`);
}

const LAYER_ANIMATIONS = [
  "is-sprouting",
  "is-growing",
  "is-outgrown",
  "is-cleared",
];

function animate(layer, name, hideAfter = false) {
  layer.classList.remove(...LAYER_ANIMATIONS);
  layer.classList.add(name);
  Promise.all(layer.getAnimations().map((a) => a.finished))
    .then(() => {
      layer.classList.remove(name);
      // eslint-disable-next-line no-param-reassign
      if (hideAfter) layer.hidden = true;
    })
    .catch(() => {});
}

function showPlant(layer, shot) {
  const [base, top] = layer.querySelectorAll("img");
  layer.style.setProperty("--pivot", shot.origin);
  layer.style.setProperty("--root", shot.root);
  base.src = shot.base;
  base.classList.toggle("is-whole", !shot.top);
  top.hidden = !shot.top;
  if (shot.top) top.src = shot.top;
  const images = shot.top ? [base, top] : [base];
  return Promise.all(images.map((img) => img.decode().catch(() => {})));
}

export class OrchardView {
  constructor(game, orchard, root) {
    Object.assign(this, { game, orchard, root });
    this.selected = "cling";
    this.focus = -1;
    el(
      "p",
      "shop-intro",
      root,
      "Plant pits. Harvest the trees when they are ripe, before they rot.",
    );
    this.balance = el("p", "seed-balance", root);
    this.balance.setAttribute("role", "img");
    this.seeds = el("div", "seeds", root);
    this.seeds.setAttribute("role", "group");
    this.seeds.setAttribute("aria-label", "Seed to plant");
    this.grid = el("div", "plots", root);
    this.info = el("p", "shop-detail", root);
    this.info.setAttribute("aria-live", "polite");
    setDetail(this.info, "", [
      canHover.matches
        ? "Hover over a plot or a seed to see the details."
        : "Tap a seed to see the details.",
    ]);
    this.plots = [];
    this.seedButtons = new Map();
    this.shownSize = 0;
    this.shownSeeds = "";
    this.shownPits = -1;
  }

  buildSeeds() {
    const { discovered } = this.game.state.orchard;
    this.shownSeeds = discovered.join();
    this.shownPits = -1;
    this.seeds.replaceChildren();
    this.seedButtons.clear();
    SEEDS.filter((seed) => discovered.includes(seed.id)).forEach((seed) => {
      const b = el("button", "seed", this.seeds);
      b.type = "button";
      b.innerHTML = `<i style="background:${seed.color}"></i><span>${seed.name}</span><small></small>`;
      b.addEventListener("click", () => {
        this.selected = seed.id;
        this.describeSeed(seed);
        this.update();
      });
      b.addEventListener("pointerenter", () => this.describeSeed(seed));
      b.addEventListener("focus", () => this.describeSeed(seed));
      b.addEventListener("pointerdown", (e) => this.drag(e, seed, b));
      renders.seedIcon(seed, (url) => {
        const icon = b.querySelector("i");
        icon.style.background = `center / contain no-repeat url(${url})`;
        icon.classList.add("is-3d");
      });
      this.seedButtons.set(seed.id, b);
    });
    const hidden = SEEDS.length - discovered.length;
    if (hidden > 0)
      el(
        "p",
        "seed seed-unknown",
        this.seeds,
        `<span>${hidden} more to discover</span><small>Plant trees side by side</small>`,
      );
  }

  drag(down, seed, button) {
    if (down.button !== 0 || this.game.state.pits < seed.pits) return;
    const { pointerId } = down;
    let ghost = null;
    let target = -1;
    const plotAt = (e) => {
      const node = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest(".plot");
      const index = this.plots.findIndex((p) => p.button === node);
      return index >= 0 && !this.game.state.orchard.plots[index] ? index : -1;
    };
    const mark = (index) => {
      if (index === target) return;
      if (target >= 0)
        toggle(this.plots[target].button, "is-drop-target", false);
      target = index;
      if (target >= 0)
        toggle(this.plots[target].button, "is-drop-target", true);
    };
    const move = (e) => {
      if (e.pointerId !== pointerId) return;
      if (!ghost) {
        if (Math.hypot(e.clientX - down.clientX, e.clientY - down.clientY) < 6)
          return;
        this.selected = seed.id;
        this.describeSeed(seed);
        this.update();
        ghost = el("div", "seed-ghost", document.body);
        ghost.style.setProperty("--seed", seed.color);
        renders.seedIcon(seed, (url) => {
          ghost.style.background = `center / contain no-repeat url(${url})`;
          ghost.classList.add("is-3d");
        });
        document.body.classList.add("is-dragging-seed");
      }
      ghost.style.translate = `${e.clientX}px ${e.clientY}px`;
      mark(plotAt(e));
    };
    const end = (e) => {
      if (e.pointerId !== pointerId) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      if (!ghost) return;
      const drop = e.type === "pointerup" ? target : -1;
      mark(-1);
      ghost.remove();
      document.body.classList.remove("is-dragging-seed");
      const swallow = (c) => c.stopImmediatePropagation();
      button.addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => button.removeEventListener("click", swallow, true), 0);
      if (drop >= 0) this.use(drop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
  }

  describeSeed(seed) {
    const recipe = seed.parents
      ? ` Cross-breeds from ${SEED_BY_ID[seed.parents[0]].name} and ${SEED_BY_ID[seed.parents[1]].name}.`
      : "";
    const rot = seed.fromRot ? " Sprouts on rotten plots." : "";
    const short = seed.pits - this.game.state.pits;
    const need = short > 0 ? ` You need ${morePits(short)}.` : "";
    setDetail(this.info, seed.name, [
      seed.about,
      `Costs ${pitCount(seed.pits)} to plant. While growing: ${seed.passive.text}. Harvest: ${seed.harvest.text}. Ripens in ${formatTime(seed.grow / this.game.model.growth)}.${recipe}${rot}${need}`,
    ]);
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
      const growth =
        '<span class="growth" hidden><img class="plant" alt="" draggable="false"><img class="plant plant-top" alt="" draggable="false"></span>';
      b.innerHTML = `<img class="bed" alt="" draggable="false">${growth}${growth}<svg viewBox="0 0 60 60" aria-hidden="true"></svg><span class="plot-ring"></span>`;
      const bed = b.querySelector(".bed");
      renders.bed(index % VARIANTS, (url) => {
        bed.src = url;
      });
      b.style.setProperty("--delay", `${-index * 0.83}s`);
      b.addEventListener("click", () => this.use(index));
      const show = () => {
        this.focus = index;
        this.describePlot(index);
      };
      b.addEventListener("pointerenter", show);
      b.addEventListener("focus", show);
      this.plots.push({
        button: b,
        layers: [...b.querySelectorAll(".growth")],
        shown: null,
        svg: b.querySelector("svg"),
        key: "",
      });
    }
  }

  use(index) {
    this.focus = index;
    this.plots.forEach((p, i) => {
      if (i !== index) this.arm(i, false);
    });
    const plot = this.game.state.orchard.plots[index];
    if (!plot) {
      if (!this.orchard.plant(index, this.selected)) {
        const seed = SEED_BY_ID[this.selected];
        setDetail(this.info, seed.name, [
          `You need ${morePits(seed.pits - this.game.state.pits)}. Bursts drop pits.`,
        ]);
      }
    } else {
      const info = this.orchard.describe(index);
      if (info.stage < RIPE && !this.plots[index].confirm) {
        this.arm(index, true);
        setDetail(this.info, info.seed.name, [
          `It isn't ripe yet. ${press()} again to dig it up.`,
        ]);
        return;
      }
      const reward = this.orchard.harvest(index);
      if (reward) {
        setDetail(
          this.info,
          `Harvested ${info.seed.name.replace(/ tree$/, " peaches")}`,
          [rewardLine(reward)],
        );
        this.game.emit("harvest", {
          seed: info.seed,
          reward,
          button: this.plots[index].button,
        });
      }
    }
    this.arm(index, false);
    this.update();
  }

  arm(index, on) {
    const p = this.plots[index];
    p.confirm = on;
    toggle(p.button, "is-armed", on);
  }

  describePlot(index) {
    const info = this.orchard.describe(index);
    if (!info) {
      const seed = SEED_BY_ID[this.selected];
      setDetail(this.info, "Empty plot", [
        `${press()} to plant a ${seed.name} for ${pitCount(seed.pits)}.`,
      ]);
      return;
    }
    const { seed, stage, name, left } = info;
    let when = "";
    if (stage < RIPE) when = `Ripe in ${formatTime(left)}.`;
    else if (stage === RIPE)
      when = `Rots in ${formatTime(left)}. ${press()} to harvest: ${seed.harvest.text}.`;
    else
      when = `${press()} to clear it. Rotten plots sometimes grow something strange.`;
    const perk = stage < ROTTEN ? `While growing: ${seed.passive.text}.` : "";
    setDetail(this.info, `${seed.name}, ${name.toLowerCase()}`, [
      `${perk} ${when}`.trim(),
    ]);
  }

  update() {
    const { state } = this.game;
    if (this.shownSeeds !== state.orchard.discovered.join()) this.buildSeeds();
    if (this.shownSize !== this.orchard.size) this.buildGrid();
    if (this.shownPits !== state.pits) {
      this.shownPits = state.pits;
      this.balance.innerHTML = pitTag(format(state.pits, { whole: true }));
      this.balance.setAttribute(
        "aria-label",
        `You have ${pitCount(state.pits)}`,
      );
      this.seedButtons.forEach((b, id) => {
        const seed = SEED_BY_ID[id];
        const short = seed.pits - state.pits;
        toggle(b, "is-short", short > 0);
        const cost = b.querySelector("small");
        cost.innerHTML = pitTag(`Costs ${format(seed.pits, { whole: true })}`);
        b.setAttribute(
          "aria-label",
          short > 0
            ? `${seed.name}, needs ${morePits(short)}`
            : `${seed.name}, costs ${pitCount(seed.pits)}`,
        );
      });
    }
    this.seedButtons.forEach((b, id) =>
      b.setAttribute("aria-pressed", String(id === this.selected)),
    );
    const now = Date.now();
    this.plots.forEach((p, index) => {
      const plot = state.orchard.plots[index];
      const info = plot ? this.orchard.describe(index, now) : null;
      const key = info ? `${plot.seed}${info.stage}` : "empty";
      if (key !== p.key) {
        const first = !p.key;
        // eslint-disable-next-line no-param-reassign
        p.key = key;
        p.svg.innerHTML = info ? plantFx(info.stage) : "";
        if (!info) {
          if (p.shown) animate(p.shown, "is-cleared", true);
          // eslint-disable-next-line no-param-reassign
          p.shown = null;
        } else
          renders.plant(info.stage, info.seed, index % VARIANTS, (shot) => {
            if (p.key !== key) return;
            const old = p.shown;
            const next = p.layers.find((layer) => layer !== old);
            // eslint-disable-next-line no-param-reassign
            p.shown = next;
            showPlant(next, shot).then(() => {
              if (p.shown !== next) return;
              next.hidden = false;
              if (first) return;
              animate(next, old ? "is-growing" : "is-sprouting");
              if (old) animate(old, "is-outgrown", true);
            });
          });
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
