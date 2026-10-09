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

const GLIDE_SECONDS = 0.45;

// A damped glide toward the loaded amount: it eases in and out, never overshoots, and stays under a top speed.
export function stepFill(state, target, delta) {
  /* eslint-disable no-param-reassign */
  if (delta > 0) {
    const omega = 2 / GLIDE_SECONDS;
    const x = omega * delta;
    const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    const reach = 1 / RIPEN_MIN_SECONDS;
    const gap = Math.max(
      -reach * GLIDE_SECONDS,
      Math.min(reach * GLIDE_SECONDS, state.shown - target),
    );
    const temp = (state.velocity + omega * gap) * delta;
    state.velocity = (state.velocity - omega * temp) * decay;
    state.shown = Math.min(target, state.shown - gap + (gap + temp) * decay);
    if (target - state.shown < 0.002 && target >= 1) state.shown = 1;
  }
  state.motion +=
    (Math.min(1, Math.max(0, state.velocity) * 1.5) - state.motion) *
    Math.min(1, delta * 3);
  /* eslint-enable no-param-reassign */
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
