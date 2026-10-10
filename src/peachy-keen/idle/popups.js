import { el, animate } from "./dom";
import { iconSvg } from "./icons";
import { format } from "./numbers";
import { clamp, reducedMotion } from "../util";
import { calmIn, whenCalm } from "../calm";

const POP_GAP_MS = 70;
const TOAST_MS = 4000;
const TOAST_RUSH_MS = 2500;
const TOAST_QUEUE = 4;
const SWIPE_AWAY = 56;
const AXIS_LOCK = 6;
const TRAIL_MS = 80;
const PROJECT_S = 0.12;
const BAND_PX = 24;
const FLY_MIN_PX = 32;
const EXIT_MS = 240;
const EXIT_EASE = "cubic-bezier(0.25, 0.75, 0.5, 1)";
const EXIT_SLOPE = 3;
const SPRING_MS = 520;
const SPRING_PERIOD_S = 0.42;
const SPRING_DAMPING = 0.78;
const SPRING_KICK = 500;

function upBand(y) {
  if (y >= 0) return y;
  const pull = -y;
  return -(1 - 1 / ((pull * 0.55) / BAND_PX + 1)) * BAND_PX;
}

function springEase(v0) {
  const w = (2 * Math.PI) / SPRING_PERIOD_S;
  const z = SPRING_DAMPING;
  const wd = w * Math.sqrt(1 - z * z);
  const b = (z * w - v0) / wd;
  const t = SPRING_MS / 1000;
  const steps = 40;
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const s = (t * i) / steps;
    const rest =
      Math.exp(-z * w * s) * (Math.cos(wd * s) + b * Math.sin(wd * s));
    points.push((1 - rest).toFixed(4));
  }
  points[steps] = "1";
  return `linear(${points.join(", ")})`;
}

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

  toast(
    kicker,
    title,
    text,
    kind = "trophy",
    { sound, since = performance.now() } = {},
  ) {
    this.waiting.push({ kicker, title, text, kind, sound, since });
    if (this.waiting.length > TOAST_QUEUE) this.waiting.shift();
    this.next();
  }

  next() {
    if (this.showing || this.calming || this.modal.open || !this.waiting.length)
      return;
    const { since } = this.waiting[0];
    if (calmIn(since) > 0) {
      this.calming = true;
      whenCalm(since, () => {
        this.calming = false;
        this.next();
      });
      return;
    }
    const { kicker, title, text, kind, sound } = this.waiting.shift();
    sound?.();
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
    let settle = null;
    let running = false;
    let hovered = false;
    let focused = false;
    const done = () => {
      box.remove();
      this.showing = false;
      this.next();
    };
    const leave = (frames, duration, easing = "ease-in") => {
      if (gone) return;
      gone = true;
      clearTimeout(timer);
      settle?.cancel();
      animate(box, frames, {
        duration,
        easing,
        fill: "forwards",
      }).finished.then(done);
    };
    const fade = (dy) =>
      leave(
        [
          { opacity: 1, transform: "none" },
          { opacity: 0, transform: `translateY(${dy}px)` },
        ],
        dy > 0 ? 220 : 400,
      );
    const run = () => {
      if (running) return;
      running = true;
      since = performance.now();
      timer = setTimeout(() => fade(-6), left);
    };
    const pause = () => {
      if (!running) return;
      running = false;
      clearTimeout(timer);
      left = Math.max(600, left - (performance.now() - since));
    };
    settle = animate(
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
    close.addEventListener("click", () => fade(8));

    const place = (x, y) => {
      const reach = box.offsetWidth * 0.9;
      style.transform = `translate(${x}px, ${y}px)`;
      style.opacity = String(1 - Math.min(1, Math.hypot(x, y) / reach) * 0.5);
    };
    box.addEventListener("pointerdown", (e) => {
      if (gone || drag || e.target.closest(".toast-close")) return;
      box.setPointerCapture(e.pointerId);
      const at = new DOMMatrix(getComputedStyle(box).transform);
      settle?.cancel();
      settle = null;
      drag = {
        start: { x: e.clientX, y: e.clientY },
        from: at,
        axis: null,
        x: at.m41,
        y: at.m42,
        trail: [{ t: e.timeStamp, x: at.m41, y: at.m42 }],
      };
      if (at.m41 || at.m42) place(at.m41, at.m42);
    });
    box.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const { start, from, trail } = drag;
      const rawX = e.clientX - start.x + from.m41;
      const rawY = e.clientY - start.y + from.m42;
      if (!drag.axis) {
        if (Math.hypot(rawX - from.m41, rawY - from.m42) < AXIS_LOCK) return;
        drag.axis =
          Math.abs(rawX - from.m41) >= Math.abs(rawY - from.m42) ? "x" : "y";
      }
      drag.x = drag.axis === "x" ? rawX : from.m41;
      drag.y = drag.axis === "y" ? upBand(rawY) : from.m42;
      place(drag.x, drag.y);
      trail.push({ t: e.timeStamp, x: drag.x, y: drag.y });
      while (trail.length > 2 && e.timeStamp - trail[0].t > TRAIL_MS)
        trail.shift();
    });
    const release = (e) => {
      if (!drag) return;
      const { axis, x, y, trail } = drag;
      drag = null;
      const last = trail[trail.length - 1];
      const first = trail[0];
      const fresh = e.timeStamp - last.t < TRAIL_MS && last.t > first.t;
      const dt = fresh ? (last.t - first.t) / 1000 : 1;
      const vx = fresh ? (last.x - first.x) / dt : 0;
      const vy = fresh ? (last.y - first.y) / dt : 0;
      const d = axis === "x" ? x : y;
      const v = axis === "x" ? vx : vy;
      const aim = d + v * PROJECT_S;
      if (axis && Math.abs(aim) > SWIPE_AWAY && (axis === "x" || aim > 0)) {
        const sign = Math.sign(aim);
        const travel = Math.max(
          FLY_MIN_PX,
          (Math.max(0, v * sign) * EXIT_MS) / 1000 / EXIT_SLOPE,
        );
        const end =
          axis === "x"
            ? `${x + sign * travel}px, ${y}px`
            : `${x}px, ${y + travel}px`;
        leave(
          [
            { transform: style.transform, opacity: style.opacity },
            { transform: `translate(${end})`, opacity: 0 },
          ],
          EXIT_MS,
          EXIT_EASE,
        );
        return;
      }
      resume();
      if (x || y) {
        const distance = Math.hypot(x, y);
        const toward = clamp(
          -(x * vx + y * vy) / distance,
          -SPRING_KICK,
          SPRING_KICK,
        );
        settle = animate(
          box,
          [
            { transform: style.transform, opacity: style.opacity },
            { transform: "none", opacity: 1 },
          ],
          { duration: SPRING_MS, easing: springEase(toward / distance) },
        );
      }
      style.transform = "";
      style.opacity = "";
    };
    box.addEventListener("pointerup", release);
    box.addEventListener("pointercancel", release);
  }
}
