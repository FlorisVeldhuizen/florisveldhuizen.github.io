export const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const ease = (rate, delta) => 1 - Math.exp(-delta * rate);

const bezier = (s, a, b) =>
  3 * (1 - s) ** 2 * s * a + 3 * (1 - s) * s * s * b + s ** 3;

export const cubicBezier = (x1, y1, x2, y2) => (t) => {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 20; i += 1) {
    const mid = (lo + hi) / 2;
    if (bezier(mid, x1, x2) < t) lo = mid;
    else hi = mid;
  }
  return bezier((lo + hi) / 2, y1, y2);
};

const installed = window.matchMedia(
  "(display-mode: standalone), (display-mode: fullscreen)",
);
let viewportHeight = window.innerHeight;
// Installed iOS reports innerHeight short of the screen; the root box is 100vh there.
const measureViewport = () => {
  const next = installed.matches
    ? Math.max(window.innerHeight, document.documentElement.offsetHeight)
    : window.innerHeight;
  if (next === viewportHeight) return false;
  viewportHeight = next;
  return true;
};
window.addEventListener("resize", measureViewport);
measureViewport();
[100, 400, 1000, 2500].forEach((at) =>
  setTimeout(() => {
    if (measureViewport()) window.dispatchEvent(new Event("resize"));
  }, at),
);

export const viewHeight = () => viewportHeight;
