import { TIER_AT } from "../data/helpers";
import {
  el,
  setText,
  setDetail,
  floatBeside,
  clearOnLeave,
  inspectOn,
  onHold,
  sidePanel,
  toggle,
  keepFocus,
  nudge,
} from "../dom";
import { iconSvg } from "../icons";
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
    this.detail = el("p", "shop-detail is-floating", root);
    this.detail.setAttribute("aria-live", "polite");
    this.focused = null;
    this.pinned = false;
    clearOnLeave(this.list, this.detail, () => this.close());
    document.addEventListener(
      "pointerdown",
      () => {
        this.swallowClick = false;
      },
      true,
    );
    document.addEventListener(
      "click",
      (e) => {
        if (!this.swallowClick) return;
        this.swallowClick = false;
        if (!this.list.contains(e.target)) return;
        e.stopPropagation();
        e.preventDefault();
      },
      true,
    );
    document.addEventListener("click", (e) => {
      if (!this.pinned || e.target.closest(".row-info")) return;
      if (!this.detail.contains(e.target)) this.close();
    });
    this.syncAmounts();
  }

  close() {
    this.focused = null;
    this.pinned = false;
    toggle(this.detail, "is-hidden", true);
    this.syncInfo();
  }

  syncInfo() {
    const open = !this.detail.classList.contains("is-hidden");
    this.rows.forEach(({ info }, id) => {
      const value = String(open && this.focused === id);
      if (info && info.getAttribute("aria-expanded") !== value)
        info.setAttribute("aria-expanded", value);
    });
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
    this.list.after(this.detail);
    this.list.replaceChildren();
    this.rows.clear();
    shown.forEach(({ helper, known }) => {
      const li = el("li", "helper-item", this.list);
      const b = el("button", `row helper-row${known ? "" : " is-mystery"}`, li);
      b.type = "button";
      b.disabled = !known;
      b.innerHTML = `
        <span class="row-icon">${iconSvg(known ? helper.id : "lock")}<svg class="hold-ring" viewBox="0 0 42 42" aria-hidden="true"><circle cx="21" cy="21" r="20.5"/></svg></span>
        <span class="row-main">
          <span class="row-name">${known ? helper.name : "???"}<span class="row-qty"></span></span>
          <span class="row-meta"><span class="row-cost"></span><span class="row-each"></span></span>
        </span>
        <span class="row-count"></span>
        <span class="row-bar" aria-hidden="true"><i></i></span>`;
      const parts = {
        button: b,
        qty: b.querySelector(".row-qty"),
        cost: b.querySelector(".row-cost"),
        each: b.querySelector(".row-each"),
        count: b.querySelector(".row-count"),
        bar: b.querySelector(".row-bar i"),
        helper,
        known,
      };
      if (known) {
        b.addEventListener("click", () => {
          if (this.game.buyHelper(helper.id)) this.flash(b);
          else nudge(b.querySelector(".row-meta"));
        });
        inspectOn(b, () => {
          this.focused = helper.id;
          this.showDetail();
        });
        onHold(b, () => {
          this.swallowClick = true;
          navigator.vibrate?.(10);
          this.pin(helper.id);
        });
        const info = el("button", "row-info", li, iconSvg("info"));
        info.type = "button";
        info.setAttribute("aria-label", `About ${helper.name}`);
        info.setAttribute("aria-expanded", "false");
        info.addEventListener("click", () => this.inspect(helper.id));
        parts.info = info;
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

  inspect(id) {
    const open = !this.detail.classList.contains("is-hidden");
    if (open && this.focused === id) this.close();
    else this.pin(id);
  }

  pin(id) {
    this.focused = id;
    this.pinned = true;
    this.showDetail();
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
    setDetail(this.detail, helper.name, lines);
    const after = sidePanel.matches ? this.list : parts.info;
    if (after.nextElementSibling !== this.detail) after.after(this.detail);
    floatBeside(this.detail, parts.button);
    this.syncInfo();
  }

  update() {
    const game = this.game;
    const shown = game.visibleHelpers();
    const signature = shown
      .map((s) => `${s.helper.id}${s.known ? 1 : 0}`)
      .join();
    if (signature !== this.signature) {
      this.signature = signature;
      keepFocus(this.list, () => this.build(shown));
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
      setText(parts.qty, count > 1 && !capped ? `×${count}` : "");
      setText(parts.cost, capped ? "Full" : format(cost));
      setText(parts.each, `+${format(game.model.rates[id] * count)}/s`);
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
