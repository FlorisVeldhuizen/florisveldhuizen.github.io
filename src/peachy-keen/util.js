export const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const ease = (rate, delta) => 1 - Math.exp(-delta * rate);

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
