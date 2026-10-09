export const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const ease = (rate, delta) => 1 - Math.exp(-delta * rate);

const SPRING_STEP = 1 / 120;

export class Spring {
  constructor(value, frequency, damping) {
    this.value = value;
    this.velocity = 0;
    this.stiffness = frequency * frequency;
    this.friction = 2 * damping * frequency;
  }

  snap(value) {
    this.value = value;
    this.velocity = 0;
    return value;
  }

  step(target, delta) {
    for (let left = delta; left > 0; left -= SPRING_STEP) {
      const h = Math.min(left, SPRING_STEP);
      this.velocity +=
        ((target - this.value) * this.stiffness -
          this.velocity * this.friction) *
        h;
      this.value += this.velocity * h;
    }
    return this.value;
  }
}

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
let viewportWidth = window.innerWidth;
// Installed iOS reports innerHeight short of the screen; the root box is 100vh there.
const measureViewport = () => {
  const next = installed.matches
    ? Math.max(window.innerHeight, document.documentElement.offsetHeight)
    : window.innerHeight;
  const width = window.innerWidth;
  if (next === viewportHeight && width === viewportWidth) return false;
  viewportHeight = next;
  viewportWidth = width;
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
// Reading innerWidth forces a layout, so frame code reads this copy.
export const viewWidth = () => viewportWidth;

export const sheet = { top: null, side: 0, moved: 0 };

// Light combinations whose shaders are built: 1 = mood lights, 2 = disco lights, summed.
export const warmedLights = new Set();
