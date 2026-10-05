import { el } from "./dom";
import { iconSvg } from "./icons";
import { format, formatTime } from "./numbers";
import { HELPERS } from "./data/helpers";
import { reducedMotion } from "../util";
import { SyrupDrop } from "./syrup";
import { playNotes } from "../audio";

const LINES = [
  "Your peach missed you. The helpers didn't stop.",
  "While you were gone, the helpers kept their hands busy.",
  "The peach waited by the window. The Feathers kept tickling.",
  "Everyone kept working. Mostly.",
];
const CREW = 6;
const COUNT_MS = 1100;
const SETTLE_MS = 2400;
const SPLASH_POWER = 1.6;
const SPLASH_BEAD = 4.8;

function countUp(node, value, drop) {
  // eslint-disable-next-line no-param-reassign
  node.textContent = `+${format(value)}`;
  if (reducedMotion.matches) return;
  // eslint-disable-next-line no-param-reassign
  node.style.minWidth = `${node.getBoundingClientRect().width}px`;
  const start = performance.now();
  let last = start;
  let splashed = false;
  const step = (now) => {
    const k = Math.min(1, (now - start) / COUNT_MS);
    const eased = 1 - (1 - k) ** 3;
    // eslint-disable-next-line no-param-reassign
    node.textContent = `+${format(value * eased)}`;
    if (k === 1 && !splashed) {
      splashed = true;
      drop.drip(SPLASH_BEAD, () => {
        drop.crown(SPLASH_POWER);
        playNotes([659, 880, 1320], { gap: 0.06, length: 0.22, volume: 0.05 });
        node.animate(
          [{ scale: 1 }, { scale: 1.12, offset: 0.3 }, { scale: 1 }],
          { duration: 420, easing: "cubic-bezier(.34,1.56,.64,1)" },
        );
      });
    }
    drop.step(Math.min(0.05, (now - last) / 1000));
    last = now;
    if (now - start < COUNT_MS + SETTLE_MS) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function awayMessage(away, helpers) {
  const body = el("div", "away");
  el("p", "away-time", body, `Away for ${formatTime(away.seconds)}`);
  const earned = el("div", "away-earned", body);
  const amount = el("strong", "away-amount", earned, "+0");
  const drop = new SyrupDrop(earned);
  const crew = HELPERS.filter((h) => (helpers[h.id] || 0) > 0).slice(-CREW);
  if (crew.length) {
    const row = el("div", "away-crew", body);
    crew.forEach((h, n) => {
      const icon = el("span", "away-helper", row, iconSvg(h.id));
      icon.title = h.plural;
      icon.style.animationDelay = `${n * 0.12}s`;
    });
  }
  el("p", "away-line", body, LINES[Math.floor(Math.random() * LINES.length)]);
  const facts = el("div", "away-facts", body);
  el("span", "away-fact", facts, `${Math.round(away.rate * 100)}% speed`);
  if (away.capped < away.seconds)
    el("span", "away-fact", facts, `capped at ${formatTime(away.capped)}`);
  return {
    title: "Welcome back",
    body,
    variant: "away",
    onShow: () => countUp(amount, away.value, drop),
  };
}
