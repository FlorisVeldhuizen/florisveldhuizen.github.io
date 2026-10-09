import { el, animate } from "./dom";
import { iconSvg } from "./icons";
import { format } from "./numbers";
import { reducedMotion } from "../util";

const POP_GAP_MS = 70;
const TOAST_MS = 4000;
const TOAST_RUSH_MS = 2500;
const TOAST_QUEUE = 4;
const SWIPE_AWAY = 50;
const AGAINST = 0.25;
const FLING = 500;
const FLY = 420;

export class Popups {
  constructor(modal) {
    this.modal = modal;
    this.waiting = [];
    this.showing = false;
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
    this.waiting.push([kicker, title, text, kind]);
    if (this.waiting.length > TOAST_QUEUE) this.waiting.shift();
    this.next();
  }

  next() {
    if (this.showing || this.modal.open || !this.waiting.length) return;
    const [kicker, title, text, kind] = this.waiting.shift();
    this.showing = true;
    const box = el("div", `ui toast-card is-${kind}`, this.toasts);
    el("small", "", box).textContent = kicker;
    el("strong", "", box).textContent = title;
    if (text) el("span", "", box).textContent = text;
    const close = el("button", "toast-close", box, iconSvg("close"));
    close.type = "button";
    close.setAttribute("aria-label", "Dismiss");
    this.life(box, close, this.waiting.length ? TOAST_RUSH_MS : TOAST_MS);
  }

  // A toast leaves on its own, or sooner when swiped or closed; the pointer or keyboard focus on it holds it.
  life(box, close, hold) {
    const { style } = box;
    let left = hold;
    let since = 0;
    let timer = 0;
    let gone = false;
    let drag = null;
    let running = false;
    let hovered = false;
    let focused = false;
    const leave = (dx = 0, dy = -6) => {
      if (gone) return;
      gone = true;
      clearTimeout(timer);
      animate(
        box,
        [
          {
            transform: style.transform || "none",
            opacity: style.opacity || 1,
          },
          { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 },
        ],
        {
          duration: dx || dy > 0 ? 220 : 400,
          easing: "ease-in",
          fill: "forwards",
        },
      ).finished.then(() => {
        box.remove();
        this.showing = false;
        this.next();
      });
    };
    const run = () => {
      if (running) return;
      running = true;
      since = performance.now();
      timer = setTimeout(() => leave(), left);
    };
    const pause = () => {
      if (!running) return;
      running = false;
      clearTimeout(timer);
      left = Math.max(600, left - (performance.now() - since));
    };
    animate(
      box,
      [
        { opacity: 0, transform: "translateY(16px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 300, easing: "ease-out" },
    );
    run();
    const resume = () => {
      if (!gone && !drag && !hovered && !focused) run();
    };
    box.addEventListener("pointerenter", () => {
      hovered = true;
      pause();
    });
    box.addEventListener("pointerleave", () => {
      hovered = false;
      resume();
    });
    box.addEventListener("focusin", () => {
      focused = true;
      pause();
    });
    box.addEventListener("focusout", () => {
      focused = false;
      resume();
    });
    close.addEventListener("click", () => leave(0, 8));
    box.addEventListener("pointerdown", (e) => {
      if (gone || e.target.closest(".toast-close")) return;
      box.setPointerCapture(e.pointerId);
      drag = {
        x: e.clientX,
        y: e.clientY,
        t: e.timeStamp,
        dx: 0,
        dy: 0,
        vx: 0,
        vy: 0,
      };
    });
    box.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const dt = Math.max(8, e.timeStamp - drag.t) / 1000;
      const dx = e.clientX - drag.x;
      // Upward is toward the play area, so the toast only gives a little that way.
      const pull = e.clientY - drag.y;
      const dy = pull > 0 ? pull : pull * AGAINST;
      drag.vx = (dx - drag.dx) / dt;
      drag.vy = (dy - drag.dy) / dt;
      Object.assign(drag, { dx, dy, t: e.timeStamp });
      const far = Math.min(1, Math.hypot(dx, dy) / (SWIPE_AWAY * 2.5));
      style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.04}deg)`;
      style.opacity = String(1 - far * 0.7);
    });
    const release = () => {
      if (!drag) return;
      const { dx, dy, vx, vy } = drag;
      drag = null;
      const sideways = Math.abs(dx) >= dy;
      const out = sideways
        ? Math.abs(dx) > SWIPE_AWAY || Math.abs(vx) > FLING
        : dy > SWIPE_AWAY || vy > FLING;
      if (out) {
        leave(
          sideways ? Math.sign(dx || vx) * FLY : 0,
          sideways ? dy : FLY * 0.5,
        );
        return;
      }
      animate(
        box,
        [
          { transform: style.transform, opacity: style.opacity },
          { transform: "none", opacity: 1 },
        ],
        { duration: 260, easing: "cubic-bezier(0.2, 0.9, 0.3, 1.2)" },
      );
      style.transform = "";
      style.opacity = "";
    };
    box.addEventListener("pointerup", release);
    box.addEventListener("pointercancel", release);
  }
}
