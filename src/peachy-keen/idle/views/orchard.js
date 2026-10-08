import { Color } from "three";
import { SEEDS, SEED_BY_ID, RIPE, ROTTEN } from "../data/orchard";
import { plantFx, petalShower } from "./plant";
import { renders, PICKED, blossomColor } from "../renders";

const VARIANTS = 5;
import { el, setDetail, setText, toggle } from "../dom";
import { format, formatTime } from "../numbers";
import { iconSvg } from "../icons";
import { pitIcon, dropIcon } from "../syrup";

const pitCount = (n) =>
  `${format(n, { whole: true })} ${n === 1 ? "pit" : "pits"}`;

const morePits = (n) =>
  `${format(n, { whole: true })} more ${n === 1 ? "pit" : "pits"}`;

const pitTag = (text) => `<span class="pit-tag">${text}${pitIcon()}</span>`;

const canHover = window.matchMedia("(hover: hover)");
const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
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
  "is-harvested",
  "is-uprooted",
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

const STAGE_SIZE = [
  [0.6, 1.4],
  [0.55, 1],
  [0.95, 1.25],
  [0.88, 0.96],
  [0.96, 1],
];

function plantSize(info) {
  const range = STAGE_SIZE[info.stage];
  if (!range) return 1;
  return range[0] + (range[1] - range[0]) * Math.min(1, info.within);
}

function burst(button, html, life) {
  if (calm.matches) return null;
  const node = el("span", "plot-burst", button, html);
  setTimeout(() => node.remove(), life);
  return node;
}

const shade = (hex, by) =>
  `#${new Color(hex).multiplyScalar(by).getHexString()}`;

function dropPit(button, seed) {
  const node = burst(
    button,
    '<img class="drop-pit" alt=""><span class="dust"></span>',
    1200,
  );
  if (node)
    renders.seedIcon(seed, (url) => {
      node.querySelector("img").src = url;
    });
}

function kickDust(button) {
  burst(button, '<span class="dust is-early"></span>', 1200);
}

function shedPetals(button, seed) {
  const petal = `#${blossomColor(seed).getHexString()}`;
  burst(button, petalShower([petal, shade(petal, 0.92)]), 2600);
}

function shedLeaves(button, seed) {
  burst(
    button,
    petalShower([seed.leaf, shade(seed.leaf, 0.78)], {
      count: 6,
      start: 0.9,
      gap: 0.14,
      dur: 2.2,
    }),
    4200,
  );
}

const resting = new Map();

function rest(button, seed, harvested) {
  clearTimeout(resting.get(button));
  toggle(button, "is-resting", true);
  toggle(button, "was-ripe", harvested);
  if (harvested) {
    shedLeaves(button, seed);
    burst(button, '<span class="dust is-late"></span>', 2800);
  }
  resting.set(
    button,
    setTimeout(() => {
      toggle(button, "is-resting", false);
      toggle(button, "was-ripe", false);
    }, 2600),
  );
}

function plotLabel(info) {
  if (!info) return "";
  if (info.stage < RIPE) return formatTime(info.left);
  return info.stage === RIPE ? "Harvest" : "";
}

export class OrchardView {
  constructor(game, orchard, root) {
    Object.assign(this, { game, orchard, root });
    this.selected = "cling";
    this.focus = -1;
    this.balance = el("p", "seed-balance", root);
    this.balance.setAttribute("role", "img");
    this.seeds = el("div", "seeds", root);
    this.seeds.setAttribute("role", "group");
    this.seeds.setAttribute("aria-label", "Seed to plant");
    this.step = el("p", "orchard-step", root);
    this.step.setAttribute("aria-live", "polite");
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
      b.innerHTML = `<img class="bed" alt="" draggable="false"><span class="plot-x" aria-hidden="true"><span class="plus-face is-cross"><svg viewBox="0 0 24 24"><rect x="9.6" y="3" width="4.8" height="18" rx="2.4"/><rect x="3" y="9.6" width="18" height="4.8" rx="2.4"/></svg></span></span><span class="plot-marker" aria-hidden="true"><span class="plus-face"><svg class="plus-mark" viewBox="0 0 24 24"><rect x="9.6" y="3" width="4.8" height="18" rx="2.4"/><rect x="3" y="9.6" width="18" height="4.8" rx="2.4"/></svg></span></span>${growth}${growth}<svg viewBox="0 0 60 60" aria-hidden="true"></svg><span class="plot-ring"></span><span class="plot-label" aria-hidden="true"></span>`;
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
        svg: b.querySelector(":scope > svg"),
        label: b.querySelector(".plot-label"),
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
        if (!calm.matches)
          this.plots[index].shown?.animate(
            [
              { rotate: "0deg" },
              { rotate: "-3deg" },
              { rotate: "2.5deg" },
              { rotate: "-1deg" },
              { rotate: "0deg" },
            ],
            { duration: 420, easing: "ease-in-out" },
          );
        setDetail(this.info, info.seed.name, [
          `It isn't ripe yet. ${press()} again to dig it up.`,
        ]);
        this.update();
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

  badge() {
    const { orchard, pits } = this.game.state;
    const now = Date.now();
    const ripe = orchard.plots.filter(
      (plot, index) => plot && this.orchard.describe(index, now).stage === RIPE,
    ).length;
    if (ripe) return ripe;
    const cheapest = Math.min(
      ...orchard.discovered.map((id) => SEED_BY_ID[id].pits),
    );
    return orchard.plots.some(Boolean) || pits < cheapest ? 0 : "!";
  }

  showStep(now) {
    const { state } = this.game;
    const infos = state.orchard.plots.map((plot, index) =>
      plot ? this.orchard.describe(index, now) : null,
    );
    const seed = SEED_BY_ID[this.selected];
    let kind;
    let text;
    if (infos.some((info) => info?.stage === RIPE)) {
      kind = "ripe";
      text = `A tree is ripe. ${press()} it to harvest before it rots.`;
    } else if (infos.includes(null) && state.pits >= seed.pits) {
      kind = "plant";
      text = `${press()} an empty plot to plant a ${seed.name}.`;
    } else if (infos.some((info) => info?.stage === ROTTEN)) {
      kind = "rotten";
      text = `${press()} a rotten tree to clear the plot.`;
    } else if (infos.includes(null)) {
      kind = "short";
      text = `You need ${morePits(seed.pits - state.pits)} for a ${seed.name}. Burst the peach to get pits.`;
    } else {
      kind = "wait";
      const next = Math.min(...infos.map((info) => info.left));
      text = `The next tree is ripe in ${formatTime(next)}.`;
    }
    if (this.step.dataset.kind !== kind) {
      this.step.dataset.kind = kind;
      if (!calm.matches)
        this.step.animate(
          [
            { opacity: 0, translate: "0 4px" },
            { opacity: 1, translate: "0 0" },
          ],
          { duration: 280, easing: "ease-out" },
        );
    }
    setText(this.step, text);
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
    const seed = SEED_BY_ID[this.selected];
    toggle(this.grid, "can-plant", state.pits >= seed.pits);
    this.plots.forEach((p, index) => {
      const plot = state.orchard.plots[index];
      const info = plot ? this.orchard.describe(index, now) : null;
      const key = info ? `${plot.seed}${info.stage}` : "empty";
      if (key !== p.key) {
        const first = !p.key;
        // eslint-disable-next-line no-param-reassign
        p.key = key;
        p.svg.innerHTML = info ? plantFx(info.stage) : "";
        if (!first && p.button.dataset.stage === "3" && info?.stage === 4)
          shedPetals(p.button, info.seed);
        if (!first && !p.button.dataset.stage && info?.stage === 0)
          dropPit(p.button, info.seed);
        // eslint-disable-next-line no-param-reassign
        if (info) p.seed = info.seed;
        if (!info) {
          const harvested = p.button.dataset.stage === "5";
          if (harvested && p.shown && p.picked) showPlant(p.shown, p.picked);
          const dug = !harvested && p.button.dataset.stage !== "6";
          let exit = "is-cleared";
          if (harvested) exit = "is-harvested";
          else if (dug) exit = "is-uprooted";
          if (p.shown) animate(p.shown, exit, true);
          if (dug && !first) kickDust(p.button);
          if (!first) rest(p.button, p.seed, harvested);
          // eslint-disable-next-line no-param-reassign
          p.shown = null;
        } else
          renders.plant(info.stage, info.seed, index % VARIANTS, (shot) => {
            if (p.key !== key) return;
            const old = p.shown;
            const next = p.layers.find((layer) => layer !== old);
            next.dataset.key = key;
            next.style.setProperty(
              "--size",
              plantSize(this.orchard.describe(index)),
            );
            // eslint-disable-next-line no-param-reassign
            p.shown = next;
            if (info.stage === RIPE)
              renders.plant(PICKED, info.seed, index % VARIANTS, (picked) => {
                // eslint-disable-next-line no-param-reassign
                p.picked = picked;
              });
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
      setText(p.label, plotLabel(info));
      if (info && p.shown?.dataset.key === key)
        p.shown.style.setProperty("--size", plantSize(info));
      p.button.style.setProperty(
        "--grow",
        info ? Math.min(1, info.progress) : 0,
      );
    });
    this.showStep(now);
    if (this.focus >= 0 && document.activeElement?.closest?.(".plots"))
      this.describePlot(this.focus);
  }
}
