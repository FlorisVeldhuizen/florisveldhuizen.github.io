import { el } from "./dom";
import { format, rollParts } from "./numbers";
import { reducedMotion } from "../util";

const EASE_RATE = 10;
const STRIP = Array.from(
  { length: 11 },
  (_, i) => `<span>${i % 10}</span>`,
).join("");
const BLUR_FROM = 8;
const BLUR_FULL = 80;
const BLUR_MAX = 0.06;

export class RollingNumber {
  constructor(root, { whole = false } = {}) {
    this.root = root;
    this.whole = whole;
    this.shown = null;
    this.shape = null;
    this.label = null;
    this.slots = [];
    root.setAttribute("role", "img");
  }

  build(text, suffix) {
    this.root.replaceChildren();
    this.slots = [];
    [...text].forEach((ch) => {
      if (!/\d/.test(ch)) {
        el("span", "roll-char", this.root, ch);
        return;
      }
      const node = el("span", "roll-slot", this.root);
      const strip = el("span", "roll-strip", node, STRIP);
      this.slots.unshift({ strip, at: null, blur: 0 });
    });
    [...suffix].forEach((ch) => el("span", "roll-char", this.root, ch));
  }

  ease(value, dt) {
    const { units } = rollParts(value, { whole: this.whole });
    const rest = units > 0 ? (value * Math.floor(units + 1e-9)) / units : value;
    const gap = rest - this.shown;
    if (gap < 0 && gap > -1e-6 * rest) return;
    if (this.shown === null || reducedMotion.matches || gap < rest * 1e-5)
      this.shown = rest;
    else this.shown += gap * (1 - Math.exp(-dt * EASE_RATE));
  }

  update(value, dt) {
    this.ease(value, dt);
    const label = format(value, { whole: this.whole });
    if (label !== this.label) {
      this.label = label;
      this.root.setAttribute("aria-label", label);
    }
    const { text, suffix, units } = rollParts(this.shown, {
      whole: this.whole,
    });
    const shape = text.replace(/\d/g, "0") + suffix;
    if (shape !== this.shape) {
      this.shape = shape;
      this.build(text, suffix);
    }
    this.slots.forEach((slot, i) => {
      const place = 10 ** i;
      const carry = Math.max(0, (units % place) - (place - 1));
      const at = (Math.floor(units / place) % 10) + carry;
      let moved = slot.at === null ? 0 : Math.abs(at - slot.at);
      moved = Math.min(moved, 10 - moved);
      /* eslint-disable no-param-reassign */
      if (at !== slot.at) slot.strip.style.transform = `translateY(${-at}em)`;
      slot.at = at;
      const speed = dt > 0 ? moved / dt : 0;
      const fast = (speed - BLUR_FROM) / (BLUR_FULL - BLUR_FROM);
      const blur =
        Math.round(Math.min(1, Math.max(0, fast)) * BLUR_MAX * 100) / 100;
      if (blur !== slot.blur) {
        slot.blur = blur;
        slot.strip.style.filter = blur ? `blur(${blur}em)` : "";
      }
      /* eslint-enable no-param-reassign */
    });
  }
}
