// The peach model's height range projected onto the intro renders, as a share of the image height.
export const RENDER_TOP = 0.2655;
export const RENDER_BOTTOM = 0.7345;
const RIPEN_MIN_SECONDS = 1.5;

// The same wave as the live peach's shader, so the still and the peach line up.
export function waveOffset(across, time, motion) {
  return (
    (Math.sin(across * 15 + time * 3) * 0.015 +
      Math.sin(across * 12 - time * 2.2) * 0.01) *
      (1 + motion * 1.5) +
    Math.sin(time * 1.4) * 0.03 * across
  );
}

// Follows the loading at an even pace: it eases toward each new step and never jumps.
export function stepFill(state, target, delta, instant) {
  const before = state.shown;
  const speed = Math.min(
    1 / RIPEN_MIN_SECONDS,
    Math.max(0.25, (target - state.shown) * 2.5),
  );
  if (state.shown < target)
    // eslint-disable-next-line no-param-reassign
    state.shown = instant
      ? target
      : Math.min(target, state.shown + delta * speed);
  const step = delta ? (state.shown - before) / delta : 0;
  // eslint-disable-next-line no-param-reassign
  state.motion +=
    (Math.min(1, step * 1.5) - state.motion) * Math.min(1, delta * 4);
}

export function drawFill(context, image, size, level, time, motion) {
  const top = RENDER_TOP * size;
  const height = (RENDER_BOTTOM - RENDER_TOP) * size;
  const surface = (x) =>
    top +
    height *
      (1 -
        (level * 1.2 -
          0.1 +
          waveOffset((x - size / 2) / height, time, motion)));
  context.clearRect(0, 0, size, size);
  context.save();
  context.beginPath();
  context.moveTo(0, size);
  for (let x = 0; x <= size; x += size / 64) context.lineTo(x, surface(x));
  context.lineTo(size, size);
  context.clip();
  context.drawImage(image, 0, 0, size, size);
  context.restore();
}
