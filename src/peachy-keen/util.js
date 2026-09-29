export const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export const ease = (rate, delta) => 1 - Math.exp(-delta * rate);
