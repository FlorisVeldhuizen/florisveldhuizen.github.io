import { TIER_AT } from "../data/helpers";
import { el, setText, toggle } from "../dom";
import { iconSvg, rowIcon, iconKey } from "../icons";
import { format } from "../numbers";

const AMOUNTS = [1, 10, 100, "max"];

export class HelpersView {
  constructor(game, root) {
    this.game = game;
    this.root = root;
    this.rows = new Map();
    this.signature = "";
    const head = el("div", "shop-head", root);
    this.amounts = el("span", "segmented", head);
    this.amounts.setAttribute("role", "group");
    this.amounts.setAttribute("aria-label", "Buy amount");
    AMOUNTS.forEach((amount) => {
      const b = el("button", "", this.amounts);
      b.type = "button";
      b.textContent = amount === "max" ? "Max" : `×${amount}`;
      b.addEventListener("click", () => {
        game.setOption("buy", amount);
        this.syncAmounts();
      });
      b.dataset.amount = amount;
    });
    this.butler = el("button", "switch shop-auto", head);
    this.butler.type = "button";
    this.butler.addEventListener("click", () => {
      game.setOption("butler", !game.state.options.butler);
      this.syncAmounts();
    });
    this.list = el("ol", "rows", root);
    this.detail = el("p", "shop-detail", root);
    this.detail.setAttribute("aria-live", "polite");
    this.focused = null;
    this.syncAmounts();
  }

  syncAmounts() {
    const { options } = this.game.state;
    [...this.amounts.children].forEach((b) => {
      const value =
        b.dataset.amount === "max" ? "max" : Number(b.dataset.amount);
      b.setAttribute("aria-pressed", String(value === options.buy));
    });
    const unlocked = this.game.model.unlocks.has("butler");
    this.butler.hidden = !unlocked;
    this.butler.textContent = `Butler ${options.butler ? "on" : "off"}`;
    this.butler.setAttribute("aria-pressed", String(options.butler));
  }

  build(shown) {
    this.list.replaceChildren();
    this.rows.clear();
    shown.forEach(({ helper, known }) => {
      const li = el("li", "", this.list);
      const b = el("button", `row helper-row${known ? "" : " is-mystery"}`, li);
      b.type = "button";
      b.innerHTML = `
        <span class="row-icon">${known ? rowIcon(helper.id) : iconSvg("lock")}</span>
        <span class="row-main">
          <span class="row-name">${known ? helper.name : "???"}</span>
          <span class="row-meta"><span class="row-cost"></span><span class="row-each"></span></span>
        </span>
        <span class="row-count"></span>
        <span class="row-bar" aria-hidden="true"><i></i></span>`;
      const parts = {
        button: b,
        cost: b.querySelector(".row-cost"),
        each: b.querySelector(".row-each"),
        count: b.querySelector(".row-count"),
        bar: b.querySelector(".row-bar i"),
        helper,
        known,
      };
      if (known) {
        b.addEventListener("click", () => {
          this.focused = helper.id;
          if (this.game.buyHelper(helper.id)) this.flash(b);
        });
        const show = () => {
          this.focused = helper.id;
          this.showDetail();
        };
        b.addEventListener("pointerenter", show);
        b.addEventListener("focus", show);
      }
      this.rows.set(helper.id, parts);
    });
  }

  flash(button) {
    button.animate(
      [
        { backgroundColor: "rgba(255, 168, 119, 0.28)" },
        { backgroundColor: "transparent" },
      ],
      { duration: 380, easing: "ease-out" },
    );
    this.update();
  }

  showDetail() {
    const game = this.game;
    const id = this.focused;
    const parts = this.rows.get(id);
    if (!parts?.known) return;
    const { helper } = parts;
    const owned = game.state.helpers[id] || 0;
    const each = game.model.rates[id];
    const share = Math.round(game.helperShare(id) * 1000) / 10;
    const lines = [helper.about];
    if (game.state.options.helperStyle === "room")
      lines.push(`In the room: ${helper.room}`);
    if (owned > 0)
      lines.push(
        `${owned} ${owned === 1 ? helper.name : helper.plural} make ${format(each * owned)} juice per second (${share}% of your helpers).`,
      );
    else lines.push(`Each one makes ${format(each)} juice per second.`);
    setText(this.detail, lines.join(" "));
  }

  update() {
    const game = this.game;
    const shown = game.visibleHelpers();
    const signature =
      iconKey() + shown.map((s) => `${s.helper.id}${s.known ? 1 : 0}`).join();
    if (signature !== this.signature) {
      this.signature = signature;
      this.build(shown);
      this.syncAmounts();
    }
    const s = game.state;
    this.rows.forEach((parts, id) => {
      const owned = s.helpers[id] || 0;
      if (!parts.known) {
        setText(parts.cost, `Earn ${format(parts.helper.cost)} juice in total`);
        return;
      }
      const { count, cost } = game.helperPrice(id);
      const capped = owned >= game.model.maxOwned;
      setText(parts.count, owned ? format(owned, { whole: true }) : "");
      const label = count > 1 ? `×${count} ` : "";
      setText(parts.cost, capped ? "Full" : `${label}${format(cost)}`);
      setText(parts.each, ` · +${format(game.model.rates[id] * count)}/s`);
      const affordable = !capped && cost <= s.juice;
      toggle(parts.button, "is-affordable", affordable);
      parts.button.setAttribute("aria-disabled", String(!affordable));
      const next = TIER_AT.find((n) => n > owned);
      const prev = [...TIER_AT].reverse().find((n) => n <= owned) || 0;
      const fill = next ? (owned - prev) / (next - prev) : 1;
      parts.bar.style.transform = `scaleX(${fill})`;
    });
    if (this.focused) this.showDetail();
  }
}
