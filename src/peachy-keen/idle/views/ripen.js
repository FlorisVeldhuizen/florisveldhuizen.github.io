import { TREE, TREE_BY_ID } from "../data/tree";
import { DARES } from "../data/dares";
import {
  el,
  setText,
  toggle,
  animate,
  setDetail,
  clearOnLeave,
  floatBeside,
} from "../dom";
import { iconSvg } from "../icons";
import { format, formatTime } from "../numbers";

const COLS = 7;
const ROWS = 7;
const STRETCH = 1.2;
const HEIGHT = ROWS * STRETCH;
const STARS = 46;
const canHover = window.matchMedia("(hover: hover)");

const hash = (text) =>
  [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 9973, 7) / 9973;

const PLACE = Object.fromEntries(
  TREE.map((n) => {
    const [x, y] = n.at;
    const dx = n.parent ? (hash(n.id) - 0.5) * 0.32 : 0;
    const dy = n.parent ? (hash(`${n.id}y`) - 0.5) * 0.26 : 0;
    return [n.id, [x + 0.5 + dx, (ROWS - 0.5 - y) * STRETCH + dy]];
  }),
);

const MAJOR = new Set(
  TREE.filter((n) =>
    n.effects.some((e) => e.kind === "unlock" || e.kind === "skin"),
  ).map((n) => n.id),
);

function thread(n) {
  const [x1, y1] = PLACE[n.parent];
  const [x2, y2] = PLACE[n.id];
  const bend = (hash(`${n.id}b`) - 0.5) * 0.5;
  const cx = (x1 + x2) / 2 - (y2 - y1) * bend * 0.3;
  const cy = (y1 + y2) / 2 + (x2 - x1) * bend * 0.3;
  return `<path class="thread" data-id="${n.id}" pathLength="1" d="M${x1.toFixed(3)} ${y1.toFixed(3)}Q${cx.toFixed(3)} ${cy.toFixed(3)} ${x2.toFixed(3)} ${y2.toFixed(3)}"/>`;
}

function sky() {
  let seed = 7;
  const next = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  return Array.from({ length: STARS }, (_, n) => {
    const r = 0.012 + next() * 0.02;
    return `<circle class="sky-star${n % 5 ? "" : " is-twinkle"}" cx="${(next() * COLS).toFixed(2)}" cy="${(next() * HEIGHT).toFixed(2)}" r="${r.toFixed(3)}" style="--delay:${(-next() * 4).toFixed(2)}s"/>`;
  }).join("");
}

export class RipenView {
  constructor(game, root, confirm) {
    Object.assign(this, { game, root, confirm });
    const top = el("div", "ripen-top", root);
    this.summary = el("p", "ripen-summary", top);
    this.button = el("button", "ripen-button", top);
    this.button.type = "button";
    this.button.addEventListener("click", () => this.askRipen());
    this.next = el("p", "ripen-next", top);

    el("h3", "shop-title", root, "The Peachy Way");
    this.balance = el("p", "shop-note", root);
    this.tree = el("div", "tree", root);
    this.tree.style.setProperty("--cols", COLS);
    this.tree.style.setProperty("--height", HEIGHT);
    const threads = TREE.filter((n) => n.parent)
      .map(thread)
      .join("");
    this.tree.innerHTML = `<svg class="tree-sky" viewBox="0 0 ${COLS} ${HEIGHT}" aria-hidden="true">${sky()}${threads}</svg>`;
    this.branches = new Map(
      [...this.tree.querySelectorAll(".thread")].map((b) => [b.dataset.id, b]),
    );
    this.nodes = new Map();
    let press = null;
    TREE.forEach((node) => {
      const b = el(
        "button",
        `node${node.parent ? "" : " is-root"}${MAJOR.has(node.id) ? " is-major" : ""}`,
        this.tree,
        `${iconSvg(node.icon)}<span class="node-cost" aria-hidden="true">${node.cost}</span>`,
      );
      b.type = "button";
      const [x, y] = PLACE[node.id];
      b.style.left = `${(x / COLS) * 100}%`;
      b.style.top = `${(y / HEIGHT) * 100}%`;
      b.style.setProperty("--delay", `${-(x * 1.3 + y * 0.7)}s`);
      b.addEventListener("pointerdown", (e) => {
        press = { type: e.pointerType, armed: this.selected === node.id };
      });
      b.addEventListener("click", () => {
        this.select(node.id);
        if (!press || press.type === "mouse" || press.armed) this.buy(node.id);
        press = null;
      });
      b.addEventListener("pointerenter", (e) => {
        if (e.pointerType === "mouse") this.select(node.id);
      });
      b.addEventListener("focus", () => this.select(node.id));
      this.nodes.set(node.id, b);
    });
    this.card = el("p", "shop-detail is-floating", root);
    this.card.setAttribute("aria-live", "polite");
    clearOnLeave(this.tree, this.card, () => this.select(null));

    this.daresTitle = el("h3", "shop-title", root, "Dares");
    this.daresNote = el(
      "p",
      "shop-note",
      root,
      "A dare ripens the peach and starts a new run with a rule. Reach the goal to earn its reward forever.",
    );
    this.dares = el("ol", "rows dares", root);
    this.dareRows = DARES.map((dare) => {
      const li = el("li", "", this.dares);
      const b = el("button", "row dare-row", li);
      b.type = "button";
      b.innerHTML = `
        <span class="row-icon">${iconSvg("heat")}</span>
        <span class="row-main">
          <span class="row-name">${dare.name}</span>
          <span class="row-about">${dare.rule} Goal: ${format(dare.goal)} juice${dare.limit ? ` within ${formatTime(dare.limit)}` : ""}. Reward: ${dare.reward}</span>
        </span>
        <span class="row-price"></span>`;
      b.addEventListener("click", () => this.askDare(dare));
      return { dare, button: b, price: b.querySelector(".row-price") };
    });
    this.abandon = el("button", "switch", root);
    this.abandon.type = "button";
    this.abandon.textContent = "Give up on this dare";
    this.abandon.addEventListener("click", () =>
      confirm({
        title: "Give up on this dare?",
        text: "The run goes on without the rule, but you do not get the reward.",
        yes: "Give up",
        danger: true,
        onYes: () => game.abandonDare(),
      }),
    );
  }

  askRipen() {
    const game = this.game;
    const gain = game.pendingNectar();
    this.confirm({
      title: "Ripen the peach?",
      text: `Your juice, helpers and upgrades reset. You keep pits, the Orchard, trophies and every star you lit in the Peachy Way. You earn ${format(gain, { whole: true })} nectar, and every nectar you have ever earned adds ${Math.round(game.model.nectarPower * 100)}% juice.`,
      yes: `Ripen for ${format(gain, { whole: true })} nectar`,
      onYes: () => game.ripen(),
    });
  }

  askDare(dare) {
    const game = this.game;
    if (game.state.dares.active) return;
    this.confirm({
      title: `Dare: ${dare.name}`,
      text: `${dare.rule} This ripens the peach now (you earn ${format(game.pendingNectar(), { whole: true })} nectar) and starts a new run under this rule. Goal: ${format(dare.goal)} juice${dare.limit ? ` within ${formatTime(dare.limit)}` : ""}.`,
      yes: "Accept the dare",
      onYes: () => game.startDare(dare.id),
    });
  }

  select(id) {
    const changed = this.selected !== id;
    this.selected = id;
    this.nodes.forEach((b, key) => toggle(b, "is-selected", key === id));
    const trail = new Set();
    for (let n = TREE_BY_ID[id]; n?.parent; n = TREE_BY_ID[n.parent])
      trail.add(n.id);
    this.branches.forEach((thread, key) =>
      toggle(thread, "is-trail", trail.has(key)),
    );
    this.describe();
    if (changed && id) floatBeside(this.card, this.nodes.get(id));
  }

  buy(id) {
    if (!this.game.buyTree(id)) return;
    const node = this.nodes.get(id);
    animate(
      node,
      [
        { transform: "scale(0.8)" },
        { transform: "scale(1.18)", offset: 0.45 },
        { transform: "scale(1)" },
      ],
      { duration: 420, easing: "cubic-bezier(.2,.9,.3,1.3)" },
    );
    const branch = this.branches.get(id);
    if (branch)
      animate(
        branch,
        [
          { strokeDasharray: "1 1", strokeDashoffset: 1 },
          { strokeDasharray: "1 1", strokeDashoffset: 0 },
        ],
        { duration: 520, easing: "ease-out" },
      );
    this.update();
  }

  describe() {
    const node = TREE_BY_ID[this.selected];
    if (!node) return;
    const state = this.game.treeState(node.id);
    const status = {
      owned: "This star is lit.",
      locked: `Light ${TREE_BY_ID[node.parent]?.name} first.`,
      ready: `${canHover.matches ? "Click" : "Tap again"} to light it for ${node.cost} nectar.`,
      open: `You need ${node.cost - this.game.state.nectar} more nectar.`,
    }[state];
    setDetail(this.card, node.name, [node.about, status]);
  }

  update() {
    const game = this.game;
    const s = game.state;
    const m = game.model;
    const gain = game.pendingNectar();
    const bonus = Math.round((m.nectarMult - 1) * 100);
    setText(
      this.summary,
      `You have earned ${format(s.nectarTotal, { whole: true })} nectar in total, for +${format(bonus, { whole: true })}% juice. Ripening now earns ${format(gain, { whole: true })} more.`,
    );
    setText(
      this.button,
      gain > 0
        ? `Ripen for ${format(gain, { whole: true })} nectar`
        : "Not ripe yet",
    );
    this.button.disabled = gain <= 0;
    setText(
      this.next,
      `Next nectar at ${format(game.nextNectarAt())} juice earned in total (you have ${format(s.juiceTotal)}).`,
    );
    setText(
      this.balance,
      `${format(s.nectar, { whole: true })} nectar to light stars with.`,
    );
    this.nodes.forEach((b, id) => {
      const state = game.treeState(id);
      if (b.dataset.state === state) return;
      const node = TREE_BY_ID[id];
      // eslint-disable-next-line no-param-reassign
      b.dataset.state = state;
      const label = {
        owned: "lit",
        locked: "locked",
        open: `costs ${node.cost} nectar`,
        ready: `costs ${node.cost} nectar, you can light it`,
      }[state];
      b.setAttribute("aria-label", `${node.name}, ${label}`);
    });
    this.branches.forEach((branch, id) => {
      const owned = s.tree.includes(id);
      const reachable = s.tree.includes(TREE_BY_ID[id].parent);
      toggle(branch, "is-owned", owned);
      toggle(branch, "is-open", !owned && reachable);
    });
    const open = m.unlocks.has("dares");
    [this.daresTitle, this.daresNote, this.dares].forEach((n) => {
      // eslint-disable-next-line no-param-reassign
      n.hidden = !open;
    });
    const active = s.dares.active;
    this.abandon.hidden = !active;
    this.dareRows.forEach(({ dare, button, price }) => {
      const done = s.dares.done.includes(dare.id);
      let label = done ? "Done" : "Start";
      if (active === dare.id)
        label = `${format(s.juiceRun)} / ${format(dare.goal)}`;
      setText(price, label);
      button.classList.toggle("is-affordable", !active && !done);
      button.setAttribute("aria-disabled", String(Boolean(active)));
    });
    this.describe();
  }
}
