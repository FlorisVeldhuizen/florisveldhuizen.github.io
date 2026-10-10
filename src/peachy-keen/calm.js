const QUIET_MS = 1500;
const MAX_WAIT_MS = 6000;
const POLL_MS = 100;

const pointers = new Set();
let lastTouch = -Infinity;

window.addEventListener(
  "pointerdown",
  (e) => {
    pointers.add(e.pointerId);
    lastTouch = performance.now();
  },
  true,
);
const lift = (e) => {
  if (pointers.delete(e.pointerId)) lastTouch = performance.now();
};
window.addEventListener("pointerup", lift, true);
window.addEventListener("pointercancel", lift, true);
window.addEventListener("blur", () => pointers.clear());

export function calmIn(since) {
  const now = performance.now();
  const capped = since + MAX_WAIT_MS - now;
  if (capped <= 0) return 0;
  if (pointers.size) return Math.min(capped, POLL_MS);
  return Math.max(0, Math.min(capped, lastTouch + QUIET_MS - now));
}

export function whenCalm(since, fn) {
  const wait = calmIn(since);
  if (wait <= 0) fn();
  else setTimeout(() => whenCalm(since, fn), wait);
}
