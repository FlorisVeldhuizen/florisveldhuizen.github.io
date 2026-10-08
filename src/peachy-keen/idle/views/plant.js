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

export function soilPuff() {
  const crumbs = Array.from({ length: 12 }, (_, n) => {
    const angle = Math.PI * (1.05 + (n / 11) * 0.9);
    const reach = 10 + Math.random() * 8;
    const dx = Math.cos(angle) * reach;
    const dy = Math.sin(angle) * reach * 0.7;
    const fill = n % 2 ? "#b07a4e" : "#8a5634";
    return `<circle class="crumb" cx="30" cy="47" r="${(0.8 + Math.random() * 0.7).toFixed(2)}" style="fill:${fill};--dx:${dx.toFixed(1)}px;--dy:${dy.toFixed(1)}px"/>`;
  });
  return `<svg viewBox="0 0 60 60" aria-hidden="true">${crumbs.join("")}</svg>`;
}
