import { animate } from "./dom";

const GROW = "cubic-bezier(0.33, 0, 0.2, 1)";
const START = 150;
// The top coin is filled with the thumb colour so it hides the coin under it.
const THUMB = "#fad1c3";
const UPPER_COIN =
  "M4 8.5c0-2 3.6-3.6 8-3.6s8 1.6 8 3.6v3c0 2-3.6 3.6-8 3.6s-8-1.6-8-3.6z";
const LOWER_FACE =
  "M4 11.5c0 2 3.6 3.6 8 3.6s8-1.6 8-3.6-3.6-3.6-8-3.6S4 9.5 4 11.5z";

const PARTS = new WeakMap();

function strokes(icon) {
  if (!PARTS.has(icon)) {
    const d = icon.querySelector("path").getAttribute("d");
    // eslint-disable-next-line no-param-reassign
    icon.innerHTML = d
      .split(/(?=M)/)
      .map((part) => `<path d="${part}"/>`)
      .join("");
    PARTS.set(icon, [...icon.querySelectorAll("path")]);
  }
  return PARTS.get(icon);
}

function draw(path, duration, delay = 0) {
  path.setAttribute("pathLength", "1");
  return animate(
    path,
    [
      { strokeDasharray: "1 1", strokeDashoffset: 1 },
      { strokeDasharray: "1 1", strokeDashoffset: 0 },
    ],
    { duration, delay: START + delay, easing: GROW, fill: "backwards" },
  );
}

const FALL = 260;
const FALL_SHARE = 0.42;
const ABOVE = -32;

const fall = (bottom) =>
  [
    {
      transform: `translateY(${ABOVE}px)`,
      easing: "cubic-bezier(0.55, 0, 1, 0.45)",
    },
    {
      transform: "translateY(0) scale(1.03, 0.94)",
      offset: FALL_SHARE,
      easing: "ease-out",
    },
    {
      transform: "translateY(-1.4px) rotate(-3deg)",
      offset: 0.6,
      easing: "ease-in",
    },
    {
      transform: "translateY(0) rotate(2deg)",
      offset: 0.74,
      easing: "ease-out",
    },
    {
      transform: "translateY(-0.3px) rotate(-1deg)",
      offset: 0.87,
      easing: "ease-in-out",
    },
    { transform: "none" },
  ].map((f) => ({ ...f, transformOrigin: `12px ${bottom}px` }));

const give = (bottom) =>
  [
    { transform: "none", easing: "ease-out" },
    { transform: "scale(1.02, 0.95)", offset: 0.3, easing: "ease-in-out" },
    { transform: "none" },
  ].map((f) => ({ ...f, transformOrigin: `12px ${bottom}px` }));

const MOTIONS = {
  hand(icon) {
    animate(
      icon,
      [0, -14, 12, -9, 6, -2, 0].map((deg) => ({
        transform: `rotate(${deg}deg)`,
        transformOrigin: "12px 21px",
        easing: "ease-in-out",
      })),
      { duration: 820, delay: START },
    );
  },
  lips(icon) {
    const [outline, line] = strokes(icon);
    draw(outline, 360);
    draw(line, 220, 200);
    const kiss = [
      { transform: "none", easing: "cubic-bezier(0.45, 0, 0.55, 1)" },
      {
        transform: "scale(1.03, 0.97)",
        offset: 0.12,
        easing: "cubic-bezier(0.45, 0, 0.25, 1)",
      },
      {
        transform: "scale(0.8, 1.12)",
        offset: 0.48,
        easing: "cubic-bezier(0.45, 0, 0.55, 1)",
      },
      {
        transform: "scale(1.03, 0.98)",
        offset: 0.78,
        easing: "cubic-bezier(0.45, 0, 0.55, 1)",
      },
      { transform: "none" },
    ].map((f) => ({ ...f, transformOrigin: "12px 12.4px" }));
    [outline, line].forEach((path) => {
      path.setAttribute("vector-effect", "non-scaling-stroke");
      animate(path, kiss, { duration: 760, delay: START + 300 });
    });
  },
  buzz(icon) {
    const [, , , left, right] = strokes(icon);
    animate(
      icon,
      [0, 5, -5, 4, -4, 2, 0].map((deg) => ({
        transform: `rotate(${deg}deg)`,
        transformOrigin: "12px 13px",
      })),
      { duration: 360, delay: START, easing: "linear" },
    );
    [left, right].forEach((arc) =>
      animate(
        arc,
        [
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0, transform: "scale(1.35)", offset: 0.35 },
          { opacity: 0, transform: "scale(0.6)", offset: 0.36 },
          { opacity: 1, transform: "scale(1.15)", offset: 0.7 },
          { opacity: 1, transform: "scale(1)" },
        ].map((f) => ({ ...f, transformOrigin: "12px 10.5px" })),
        { duration: 720, delay: START, easing: "ease-out" },
      ),
    );
  },
  coins(icon) {
    const [top, upper, lower] = strokes(icon);
    icon.insertAdjacentHTML(
      "beforeend",
      `<path class="face" d="${LOWER_FACE}"/><path class="face" d="${UPPER_COIN}" fill="${THUMB}" stroke="none"/>`,
    );
    const [face, cover] = icon.querySelectorAll(".face");
    icon.prepend(lower);
    icon.append(top, upper);
    const length = FALL / FALL_SHARE;
    const second = START + length * 0.7;
    const landed = second + FALL;
    const once = { duration: length, fill: "backwards" };
    [lower, face].forEach((part) => {
      animate(part, fall(18.1), { ...once, delay: START });
      animate(part, give(18.1), {
        duration: 220,
        delay: landed,
      });
    });
    [cover, top].forEach((part) =>
      animate(part, fall(15.1), { ...once, delay: second }),
    );
    animate(upper, fall(15.1), { ...once, delay: second }).finished.then(
      () => [face, cover].forEach((p) => p.remove()),
      () => {},
    );
  },
};

export default function playToolMotion(icon, id) {
  if (!icon || !MOTIONS[id]) return;
  icon.getAnimations({ subtree: true }).forEach((a) => a.cancel());
  icon.querySelectorAll(".face").forEach((p) => p.remove());
  MOTIONS[id](icon);
}
