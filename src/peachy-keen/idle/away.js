import { el } from "./dom";
import { iconSvg } from "./icons";
import { format, formatTime } from "./numbers";
import { HELPERS } from "./data/helpers";
import { reducedMotion } from "../util";
import { SyrupDrop } from "./syrup";
import { playBloop, playNotes } from "../audio";

const LINES = [
  "Your peach missed you. The helpers didn't stop.",
  "While you were gone, the helpers kept their hands busy.",
  "The peach waited by the window. The Feathers kept tickling.",
  "Everyone kept working. Mostly.",
];
const CREW = 6;
const SPLASH_MS = 1100;
const SETTLE_MS = 2400;
const SPLASH_POWER = 1.6;
const SPLASH_BEAD = 4.8;
const COUNT_DRIPS = [
  { ms: 0, bead: 1.9, hz: 494 },
  { ms: 330, bead: 2.3, hz: 554 },
  { ms: 600, bead: 2.7, hz: 659 },
  { ms: 800, bead: 3.1, hz: 740 },
];
const DRIP_SHARE = 0.14;
const COUNT_EASE = 9;
const WIDTH_SAMPLES = 200;

function countUp(node, value, drop) {
  if (reducedMotion.matches) {
    // eslint-disable-next-line no-param-reassign
    node.textContent = `+${format(value)}`;
    return;
  }
  let widest = 0;
  for (let i = WIDTH_SAMPLES; i >= 0; i -= 1) {
    // eslint-disable-next-line no-param-reassign
    node.textContent = `+${format((value * i) / WIDTH_SAMPLES)}`;
    widest = Math.max(widest, node.getBoundingClientRect().width);
  }
  // eslint-disable-next-line no-param-reassign
  node.style.minWidth = `${widest}px`;
  const start = performance.now();
  let last = start;
  let drips = 0;
  let splashed = false;
  let landed = 0;
  let shown = 0;
  let end = Infinity;
  const land = (hz) => () => {
    landed = Math.min(1, landed + DRIP_SHARE);
    playBloop(hz);
  };
  const step = (now) => {
    while (drips < COUNT_DRIPS.length && now - start >= COUNT_DRIPS[drips].ms) {
      drop.drip(COUNT_DRIPS[drips].bead, land(COUNT_DRIPS[drips].hz));
      drips += 1;
    }
    if (!splashed && now - start >= SPLASH_MS) {
      splashed = true;
      landed = 1;
      drop.drip(SPLASH_BEAD, () => {
        shown = 1;
        end = performance.now() + SETTLE_MS;
        drop.crown(SPLASH_POWER);
        playNotes([659, 880, 1320], { gap: 0.06, length: 0.22, volume: 0.05 });
        node.animate(
          [{ scale: 1 }, { scale: 1.12, offset: 0.3 }, { scale: 1 }],
          { duration: 420, easing: "cubic-bezier(.34,1.56,.64,1)" },
        );
      });
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    drop.step(dt);
    shown += (landed - shown) * (1 - Math.exp(-dt * COUNT_EASE));
    // eslint-disable-next-line no-param-reassign
    node.textContent = `+${format(shown === 1 ? value : value * shown)}`;
    if (now < end) requestAnimationFrame(step);
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
