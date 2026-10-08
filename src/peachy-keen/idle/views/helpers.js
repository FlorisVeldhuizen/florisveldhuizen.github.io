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
import { dropIcon } from "../syrup";

const AMOUNTS = [1, 10, 100, "max"];
const ARM_MS = 3000;
const touch = window.matchMedia("(pointer: coarse)");

function heldAmount(e) {
  if (e.ctrlKey || e.metaKey) return 100;
  return e.shiftKey ? 10 : null;
}

export class HelpersView {
  constructor(game, root) {
    this.game = game;
    this.root = root;
    this.rows = new Map();
    this.signature = "";
    const head = el("div", "shop-head", root);
    this.mode = el("span", "joined shop-mode", head);
    this.mode.setAttribute("role", "group");
    this.mode.setAttribute("aria-label", "Buy or sell");
    el("i", "shop-thumb", this.mode);
    ["Buy", "Sell"].forEach((label) => {
      const b = el("button", "", this.mode);
      b.type = "button";
      b.textContent = label;
      b.dataset.sell = String(label === "Sell");
      b.addEventListener("click", () => this.setSelling(label === "Sell"));
    });
    this.amounts = el("span", "joined shop-amounts", head);
    this.amounts.setAttribute("role", "group");
    this.amounts.setAttribute("aria-label", "Amount");
    this.amountThumb = el("i", "shop-thumb", this.amounts);
    AMOUNTS.forEach((amount) => {
      const b = el("button", "", this.amounts);
      b.type = "button";
      if (amount === "max")
        b.innerHTML = `<span class="amount-swap" aria-hidden="true"><span>Max</span><span>All</span></span>`;
      else b.textContent = `×${amount}`;
      b.addEventListener("click", () => {
        this.disarm();
        game.setOption("buy", amount);
        this.syncAmounts();
        this.update();
      });
      b.dataset.amount = amount;
    });
    this.titleTool = el("span", "shop-title-tool");
    this.butler = el("button", "switch shop-auto", this.titleTool);
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
    const hold = (e) => {
      const held = heldAmount(e);
      if (held === this.game.held) return;
      this.game.held = held;
      this.syncAmounts();
      this.update();
    };
    window.addEventListener("keydown", hold);
    window.addEventListener("keyup", hold);
    window.addEventListener("blur", () => hold({}));
    this.armed = null;
    this.syncAmounts();
    new ResizeObserver(() => this.placeAmountThumb(false)).observe(
      this.amounts,
    );
  }

  placeAmountThumb(animate) {
    const on = this.amounts.querySelector('button[aria-pressed="true"]');
    if (!on || !on.offsetWidth) return;
    const thumb = this.amountThumb;
    if (!animate) thumb.style.transition = "none";
    thumb.style.setProperty("--x", `${on.offsetLeft - 2}px`);
    thumb.style.setProperty("--w", `${on.offsetWidth}px`);
    if (!animate) {
      thumb.offsetWidth;
      thumb.style.transition = "";
    }
  }

  setSelling(on) {
    this.disarm();
    this.game.setOption("sell", on);
    this.syncAmounts();
    this.update();
  }

  leave() {
    if (this.game.state.options.sell) this.setSelling(false);
  }

  arm(id) {
    this.disarm();
    this.armed = id;
    this.armTimer = setTimeout(() => {
      this.armed = null;
      this.update();
    }, ARM_MS);
    this.update();
  }

  disarm() {
    clearTimeout(this.armTimer);
    this.armed = null;
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
    this.mode.querySelectorAll("button").forEach((b) => {
      b.setAttribute(
        "aria-pressed",
        String(b.dataset.sell === String(options.sell)),
      );
    });
    toggle(this.mode, "is-selling", options.sell);
    toggle(this.list, "is-selling", options.sell);
    const amount = this.game.held || options.buy;
    this.amounts.querySelectorAll("button").forEach((b) => {
      const value =
        b.dataset.amount === "max" ? "max" : Number(b.dataset.amount);
      b.setAttribute("aria-pressed", String(value === amount));
      if (value === "max") {
        toggle(b, "is-all", options.sell);
        b.setAttribute("aria-label", options.sell ? "All" : "Max");
      }
    });
    this.placeAmountThumb(true);
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
          <span class="row-name">${known ? helper.name : "???"}<span class="row-qty"></span><span class="row-skip" hidden>Butler skips</span></span>
          <span class="row-meta"><span class="row-cost"><span></span>${dropIcon()}</span><span class="row-each"></span></span>
        </span>
        <span class="row-count"></span>
        <span class="row-bar" aria-hidden="true"><i></i></span>`;
      const parts = {
        button: b,
        qty: b.querySelector(".row-qty"),
        cost: b.querySelector(".row-cost"),
        costText: b.querySelector(".row-cost > span"),
        each: b.querySelector(".row-each"),
        count: b.querySelector(".row-count"),
        skip: b.querySelector(".row-skip"),
        bar: b.querySelector(".row-bar i"),
        helper,
        known,
      };
      if (known) {
        b.addEventListener("click", () => {
          const { game } = this;
          const { sell, buy } = game.state.options;
          const all = sell && !game.held && buy === "max";
          if (all && this.armed !== helper.id && game.buyCount(helper.id) > 1) {
            this.arm(helper.id);
            return;
          }
          this.disarm();
          const done = sell
            ? game.sellHelper(helper.id)
            : game.buyHelper(helper.id);
          if (done) this.flash(b);
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
    if (this.butlerSkips(id))
      lines.push(
        `The Butler stopped buying ${helper.plural} because you sold some. Buy one yourself to let the Butler buy them again.`,
      );
    setDetail(this.detail, helper.name, lines);
    const after = sidePanel.matches ? this.list : parts.info;
    if (after.nextElementSibling !== this.detail) after.after(this.detail);
    floatBeside(this.detail, parts.button);
    this.syncInfo();
  }

  butlerSkips(id) {
    const game = this.game;
    return (
      game.model.unlocks.has("butler") && game.state.butlerSkip.includes(id)
    );
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
        toggle(parts.cost, "no-drop", true);
        setText(
          parts.costText,
          `Earn ${format(parts.helper.cost)} juice in total`,
        );
        return;
      }
      const { count, cost } = game.helperPrice(id);
      const selling = s.options.sell;
      const capped = !selling && owned >= game.model.maxOwned;
      const rate = format(game.model.rates[id] * count);
      setText(parts.count, owned ? format(owned, { whole: true }) : "");
      setText(parts.qty, count > 1 && !capped ? `×${count}` : "");
      parts.skip.toggleAttribute("hidden", !this.butlerSkips(id));
      const armed = selling && this.armed === id;
      toggle(parts.button, "is-armed", armed);
      toggle(parts.cost, "no-drop", armed || capped || (selling && !count));
      if (armed) {
        setText(
          parts.costText,
          `${touch.matches ? "Tap" : "Click"} again to sell all ${count}`,
        );
        setText(parts.each, "");
      } else if (selling) {
        setText(parts.costText, count ? `+${format(cost)}` : "None to sell");
        setText(parts.each, count ? `−${rate}/s` : "");
      } else {
        setText(parts.costText, capped ? "Full" : format(cost));
        setText(parts.each, `+${rate}/s`);
      }
      const affordable = selling ? count > 0 : !capped && cost <= s.juice;
      toggle(parts.button, "is-affordable", affordable);
      parts.button.setAttribute("aria-disabled", String(!affordable));
      const reached = Math.max(owned, s.peak[id] || 0);
      const next = TIER_AT.find((n) => n > reached);
      const prev = [...TIER_AT].reverse().find((n) => n <= reached) || 0;
      const fill = next ? (reached - prev) / (next - prev) : 1;
      parts.bar.style.transform = `scaleX(${fill})`;
    });
    if (this.focused) this.showDetail();
  }
}
