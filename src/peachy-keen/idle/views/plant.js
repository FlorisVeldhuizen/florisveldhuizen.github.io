import { RIPE, ROTTEN } from "../data/orchard";

export function plantFx(stage) {
  if (stage === RIPE)
    return '<path class="sparkle-star" d="M12 14l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/><path class="sparkle-star is-late" d="M47 8l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>';
  if (stage === ROTTEN)
    return '<circle class="fly" cx="22" cy="44" r="0.8"/><circle class="fly is-late" cx="38" cy="46" r="0.8"/>';
  return "";
}

const PETAL = "M0 0c1.2-1 2.6-.4 2.2.8C1.8 2 .4 1.4 0 0z";

export function petalShower(colors) {
  const petals = Array.from({ length: 12 }, (_, n) => {
    const x = 16 + Math.random() * 28;
    const y = 10 + Math.random() * 16;
    const drift = (Math.random() - 0.5) * 16;
    const delay = n * 0.06 + Math.random() * 0.2;
    return `<path class="petal" d="${PETAL}" style="fill:${colors[n % colors.length]};--x:${x.toFixed(1)}px;--y:${y.toFixed(1)}px;--dx:${drift.toFixed(1)}px;--d:${delay.toFixed(2)}s"/>`;
  });
  return `<svg viewBox="0 0 60 60" aria-hidden="true">${petals.join("")}</svg>`;
}
