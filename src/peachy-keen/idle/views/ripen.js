import { TREE, TREE_BY_ID } from "../data/tree";
import { DARES } from "../data/dares";
import { el, setText } from "../dom";
import { iconSvg } from "../icons";
import { format, formatTime } from "../numbers";

const COLS = 7;
const ROWS = 7;

export class RipenView {
  constructor(game, root, confirm) {
    Object.assign(this, { game, root, confirm });
    const top = el("div", "ripen-top", root);
    this.summary = el("p", "ripen-summary", top);
    this.button = el("button", "ripen-button", top);
    this.button.type = "button";
    this.button.addEventListener("click", () => this.askRipen());
    this.next = el("p", "ripen-next", top);

    el("h3", "shop-title", root, "Nectar tree");
    this.balance = el("p", "shop-note", root);
    this.tree = el("div", "tree", root);
    this.tree.style.setProperty("--cols", COLS);
    this.tree.style.setProperty("--rows", ROWS);
    const lines = TREE.filter((n) => n.parent)
      .map((n) => {
        const [x1, y1] = TREE_BY_ID[n.parent].at;
        const [x2, y2] = n.at;
        return `<line data-id="${n.id}" x1="${x1 + 0.5}" y1="${y1 + 0.5}" x2="${x2 + 0.5}" y2="${y2 + 0.5}"/>`;
      })
      .join("");
    this.tree.innerHTML = `<svg viewBox="0 0 ${COLS} ${ROWS}" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>`;
    this.nodes = new Map();
    TREE.forEach((node) => {
      const b = el("button", "node", this.tree, iconSvg("nectar"));
      b.type = "button";
      b.style.left = `${((node.at[0] + 0.5) / COLS) * 100}%`;
      b.style.top = `${((node.at[1] + 0.5) / ROWS) * 100}%`;
      b.setAttribute("aria-label", node.name);
      b.addEventListener("click", () => {
        this.selected = node.id;
        if (game.treeState(node.id) === "ready") game.buyTree(node.id);
        this.describe();
      });
      b.addEventListener("pointerenter", () => {
        this.selected = node.id;
        this.describe();
      });
      this.nodes.set(node.id, b);
    });
    this.detail = el("p", "shop-detail", root);
    this.detail.setAttribute("aria-live", "polite");

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
    this.abandon.addEventListener("click", () => game.abandonDare());
  }

  askRipen() {
    const game = this.game;
    const gain = game.pendingNectar();
    this.confirm({
      title: "Ripen the peach?",
      text: `Your juice, helpers and upgrades reset. You keep pits, the Orchard, trophies and the Nectar tree. You earn ${format(gain, { whole: true })} nectar, and every nectar you have ever earned adds ${Math.round(game.model.nectarPower * 100)}% juice.`,
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

  describe() {
    const node = TREE_BY_ID[this.selected];
    if (!node) return;
    const status = {
      owned: "Owned.",
      locked: `Needs ${TREE_BY_ID[node.parent]?.name}.`,
      ready: `Tap to buy for ${node.cost} nectar.`,
      open: `Costs ${node.cost} nectar.`,
    }[this.game.treeState(node.id)];
    setText(this.detail, `${node.name}: ${node.about} ${status}`);
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
      `${format(s.nectar, { whole: true })} nectar to spend.`,
    );
    this.nodes.forEach((b, id) => {
      // eslint-disable-next-line no-param-reassign
      b.dataset.state = game.treeState(id);
    });
    this.tree.querySelectorAll("line").forEach((line) => {
      line.classList.toggle("is-owned", s.tree.includes(line.dataset.id));
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
    if (this.selected) this.describe();
  }
}
