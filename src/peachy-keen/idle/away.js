import { el } from "./dom";
import { iconSvg } from "./icons";
import { format, formatTime } from "./numbers";
import { HELPERS } from "./data/helpers";
import { reducedMotion } from "../util";

const LINES = [
  "Your peach missed you. The helpers didn't stop.",
  "While you were gone, the helpers kept their hands busy.",
  "The peach waited by the window. The Feathers kept tickling.",
  "Everyone kept working. Mostly.",
];
const CREW = 6;
const COUNT_MS = 1100;

function countUp(node, value) {
  if (reducedMotion.matches) {
    // eslint-disable-next-line no-param-reassign
    node.textContent = `+${format(value)}`;
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - start) / COUNT_MS);
    const eased = 1 - (1 - k) ** 3;
    // eslint-disable-next-line no-param-reassign
    node.textContent = `+${format(value * eased)}`;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function awayMessage(away, helpers) {
  const body = el("div", "away");
  el("p", "away-time", body, `Away for ${formatTime(away.seconds)}`);
  const earned = el("div", "away-earned", body);
  const amount = el("strong", "away-amount", earned, "+0");
  el("span", "away-unit", earned, "juice");
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
    onShow: () => countUp(amount, away.value),
  };
}
