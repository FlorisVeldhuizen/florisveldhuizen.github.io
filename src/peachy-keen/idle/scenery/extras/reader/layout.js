export const W = 320;
export const H = 512;
export const SERIF = "Fraunces, Georgia, serif";
export const GOLD = "#f4cf8e";
export const GOLD_DIM = "rgba(244, 207, 142, 0.5)";

export function textFit(c, text, x, y, max) {
  const w = c.measureText(text).width;
  if (w <= max) c.fillText(text, x, y);
  else {
    c.save();
    c.translate(x, y);
    c.scale(max / w, 1);
    c.fillText(text, 0, 0);
    c.restore();
  }
}

const even = (P, pose, size) =>
  size * Math.sqrt(P.info("back").area / P.info(pose).area);

export function figure(P, c, card, x, y, size, opts) {
  const { pair, gap } = opts;
  if (card.id !== "lovers") {
    P.draw(c, card.pose, x, y, even(P, card.pose, size), opts);
    return;
  }
  P.draw(c, "threeq", x - size * gap, y, even(P, "threeq", size * pair), opts);
  P.draw(
    c,
    "threeqL",
    x + size * gap,
    y,
    even(P, "threeqL", size * pair),
    opts,
  );
}
