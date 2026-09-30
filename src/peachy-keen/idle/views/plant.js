import { RIPE, ROTTEN } from "../data/orchard";

const SPOTS = [
  [21, 24],
  [39, 22],
  [30, 31],
];
const BLOOMS = [
  [22, 23],
  [37, 19],
  [30, 29],
  [41, 28],
  [19, 31],
];
const CANOPY_SMALL = [
  [30, 28, 7],
  [24, 31, 5.5],
  [36, 31, 5.5],
];
const CANOPY_FULL = [
  [30, 20, 10],
  [20, 25, 8],
  [40, 24, 8],
  [26, 31, 8],
  [36, 31, 8],
  [30, 13, 7],
];

const ground =
  '<ellipse class="soil" cx="30" cy="54" rx="17" ry="4.5"/><ellipse class="soil-top" cx="30" cy="52.5" rx="11" ry="2.4"/>';

function trunk(height) {
  const top = 54 - height;
  return `<path class="trunk" d="M30 54C31 ${54 - height * 0.4} 29 ${54 - height * 0.7} 30 ${top}"/><path class="branch" d="M30 ${top + height * 0.35}l-6 -5M30 ${top + height * 0.25}l6 -6"/>`;
}

function canopy(blobs, leaf, dead = false) {
  const cls = dead ? "canopy is-dead" : "canopy";
  const base = blobs
    .map(
      ([x, y, r]) =>
        `<circle class="${cls}" cx="${x}" cy="${y}" r="${r}" fill="${leaf}"/>`,
    )
    .join("");
  if (dead) return base;
  const light = blobs
    .map(
      ([x, y, r]) =>
        `<circle class="canopy-light" cx="${x - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.55}"/>`,
    )
    .join("");
  return base + light;
}

function blossom(x, y) {
  const petals = [0, 72, 144, 216, 288]
    .map((a) => {
      const r = (a * Math.PI) / 180;
      return `<circle cx="${x + Math.cos(r) * 1.6}" cy="${y + Math.sin(r) * 1.6}" r="1.4"/>`;
    })
    .join("");
  return `<g class="blossom">${petals}<circle class="blossom-heart" cx="${x}" cy="${y}" r="0.9"/></g>`;
}

function fruit(x, y, r, seed, ripe) {
  const { color, shape } = seed;
  const fill = ripe ? color : "#a8c870";
  const rx = shape === "donut" ? r * 1.2 : r;
  const ry = shape === "donut" ? r * 0.8 : r;
  const ghost = ripe && shape === "ghost" ? ' opacity="0.7"' : "";
  let extra = "";
  if (ripe && shape === "glow")
    extra = `<circle class="glow" cx="${x}" cy="${y}" r="${r * 1.6}"/>`;
  if (ripe && shape === "cosmic")
    extra = `<circle class="star" cx="${x + r * 0.35}" cy="${y + r * 0.25}" r="0.5"/><circle class="star" cx="${x - r * 0.1}" cy="${y + r * 0.5}" r="0.35"/>`;
  const ring =
    ripe && shape === "ring"
      ? `<ellipse class="ring" cx="${x}" cy="${y + r * 0.1}" rx="${r * 1.45}" ry="${r * 0.32}"/>`
      : "";
  return `<g class="fruit"${ghost}>${extra}<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/><path class="crease" d="M${x + r * 0.1} ${y - ry * 0.9}q${-r * 0.35} ${ry * 0.9} 0 ${ry * 1.8}"/><ellipse class="shine" cx="${x - rx * 0.42}" cy="${y - ry * 0.38}" rx="${r * 0.26}" ry="${r * 0.16}"/><path class="fruit-leaf" d="M${x + r * 0.1} ${y - ry}q${r * 0.5} ${-r * 0.6} ${r * 1} ${-r * 0.2}q${-r * 0.5} ${r * 0.4} ${-r} ${r * 0.2}z"/>${ring}</g>`;
}

function sparkles() {
  return '<path class="sparkle-star" d="M12 14l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/><path class="sparkle-star is-late" d="M47 8l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>';
}

export function plantSvg(stage, seed) {
  const leaf = seed.leaf || "#5f9a45";
  if (stage === 0)
    return `${ground}<g class="sway"><path class="stem" d="M30 53c0-3 1-5 0-8"/><ellipse class="sprout" cx="26.5" cy="44.5" rx="3.6" ry="2" transform="rotate(-25 26.5 44.5)" fill="${leaf}"/><ellipse class="sprout" cx="33.5" cy="44" rx="3.6" ry="2" transform="rotate(25 33.5 44)" fill="${leaf}"/></g>`;
  if (stage === 1)
    return `${ground}<g class="sway"><path class="stem" d="M30 53C31 46 29 40 30 33"/>${[
      [26, 44, -35],
      [34, 41, 35],
      [26.5, 37, -30],
      [33.5, 34.5, 30],
    ]
      .map(
        ([x, y, a]) =>
          `<ellipse class="sprout" cx="${x}" cy="${y}" rx="4" ry="1.8" transform="rotate(${a} ${x} ${y})" fill="${leaf}"/>`,
      )
      .join("")}</g>`;
  if (stage === 2)
    return `${ground}<g class="sway">${trunk(18)}${canopy(CANOPY_SMALL, leaf)}</g>`;
  if (stage === ROTTEN)
    return `${ground}${trunk(26)}${canopy(CANOPY_FULL.slice(0, 3), "#6a5a3a", true)}<ellipse class="rot" cx="19" cy="52" rx="3.4" ry="2"/><ellipse class="rot" cx="41" cy="53" rx="2.8" ry="1.7"/><circle class="fly" cx="22" cy="44" r="0.8"/><circle class="fly is-late" cx="38" cy="46" r="0.8"/>`;
  const ripe = stage === RIPE;
  let top = "";
  if (stage === 3) top = BLOOMS.map(([x, y]) => blossom(x, y)).join("");
  else
    top = SPOTS.map(([x, y]) => fruit(x, y, ripe ? 5 : 3, seed, ripe)).join("");
  return `${ground}<g class="sway">${trunk(26)}${canopy(CANOPY_FULL, leaf)}${top}</g>${ripe ? sparkles() : ""}`;
}
