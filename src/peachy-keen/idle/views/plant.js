import { RIPE, ROTTEN } from "../data/orchard";

export function plantFx(stage) {
  if (stage === RIPE)
    return '<path class="sparkle-star" d="M12 14l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/><path class="sparkle-star is-late" d="M47 8l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>';
  if (stage === ROTTEN)
    return '<circle class="fly" cx="22" cy="44" r="0.8"/><circle class="fly is-late" cx="38" cy="46" r="0.8"/>';
  return "";
}
