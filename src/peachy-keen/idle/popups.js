import { el, animate } from "./dom";
import { format } from "./numbers";
import { reducedMotion } from "../util";

const POP_GAP_MS = 70;
const TOAST_MS = 3600;

export class Popups {
  constructor() {
    this.layer = document.getElementById("combos");
    this.toasts = el("div", "toasts", document.body);
    this.toasts.setAttribute("role", "status");
    this.lastPop = 0;
    this.held = 0;
  }

  juice(x, y, value, kind = "smack") {
    const now = performance.now();
    if (kind === "smack" && now - this.lastPop < POP_GAP_MS) {
      this.held += value;
      return;
    }
    const total = value + (kind === "smack" ? this.held : 0);
    if (kind === "smack") this.held = 0;
    this.lastPop = now;
    const label = el("span", `juice-pop is-${kind}`, this.layer);
    label.textContent =
      kind === "crit" ? `Crit! +${format(total)}` : `+${format(total)}`;
    const dx = (Math.random() - 0.5) * 40;
    label.style.left = `${x + dx}px`;
    label.style.top = `${y - 28}px`;
    const rise = reducedMotion.matches ? 0 : -60;
    animate(
      label,
      [
        { opacity: 0, transform: "translate(-50%, 0) scale(0.8)" },
        {
          opacity: 1,
          transform: "translate(-50%, -12px) scale(1)",
          offset: 0.15,
        },
        { opacity: 0, transform: `translate(-50%, ${rise}px) scale(1)` },
      ],
      { duration: kind === "crit" ? 1200 : 900, easing: "ease-out" },
    ).finished.then(() => label.remove());
  }

  big(x, y, title, text) {
    const box = el("div", "big-pop", this.layer);
    el("strong", "", box).textContent = title;
    if (text) el("span", "", box).textContent = text;
    box.style.left = `${x}px`;
    box.style.top = `${y}px`;
    animate(
      box,
      [
        { opacity: 0, transform: "translate(-50%, -50%) scale(0.5)" },
        {
          opacity: 1,
          transform: "translate(-50%, -60%) scale(1.08)",
          offset: 0.18,
        },
        {
          opacity: 1,
          transform: "translate(-50%, -64%) scale(1)",
          offset: 0.7,
        },
        { opacity: 0, transform: "translate(-50%, -90%) scale(1)" },
      ],
      { duration: 2000, easing: "cubic-bezier(.2,.8,.3,1)" },
    ).finished.then(() => box.remove());
  }

  toast(kicker, title, text, kind = "trophy") {
    const box = el("div", `toast-card is-${kind}`, this.toasts);
    el("small", "", box).textContent = kicker;
    el("strong", "", box).textContent = title;
    if (text) el("span", "", box).textContent = text;
    while (this.toasts.children.length > 2)
      this.toasts.firstElementChild.remove();
    animate(
      box,
      [
        { opacity: 0, transform: "translateY(16px)" },
        { opacity: 1, transform: "none", offset: 0.08 },
        { opacity: 1, transform: "none", offset: 0.88 },
        { opacity: 0, transform: "translateY(-6px)" },
      ],
      { duration: TOAST_MS, easing: "ease-out" },
    ).finished.then(() => box.remove());
  }
}
