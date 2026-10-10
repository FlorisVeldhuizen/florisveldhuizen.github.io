import { stepFill, drawFill } from "./fill-wave";

// Runs off the main thread, so the still keeps filling while the game compiles its graphics.
const state = { shown: 0, motion: 0, velocity: 0 };
let context = null;
let image = null;
// Without the ripe image the level still rises, so loading can finish.
let noImage = false;
let size = 0;
let epoch = 0;
let target = 0;
let drawing = true;
let last = 0;

const nextFrame = (run) =>
  globalThis.requestAnimationFrame
    ? globalThis.requestAnimationFrame(run)
    : setTimeout(run, 16);

function frame() {
  const now = performance.timeOrigin + performance.now();
  const delta = Math.min(0.05, (now - last) / 1000);
  last = now;
  // Holds at the bottom until the ripe image can be drawn, so the first part rises instead of popping in.
  if (image || noImage) stepFill(state, target, delta);
  const time = (now - epoch) / 1000;
  if (drawing && image) {
    drawFill(context, image, size, state.shown, time, state.motion);
  }
  globalThis.postMessage({
    ...state,
    at: performance.timeOrigin + performance.now(),
  });
  nextFrame(frame);
}

globalThis.onmessage = async ({ data }) => {
  if (data.canvas) {
    ({ size, epoch } = data);
    const { canvas } = data;
    context = canvas.getContext("2d");
    canvas.width = size;
    canvas.height = size;
    last = performance.timeOrigin + performance.now();
    nextFrame(frame);
  }
  if (data.image) {
    try {
      image = await createImageBitmap(data.image);
    } catch {
      noImage = true;
    }
  }
  if (data.noImage) noImage = true;
  if (data.target !== undefined) ({ target } = data);
  if (data.size) {
    ({ size } = data);
    context.canvas.width = size;
    context.canvas.height = size;
  }
  if (data.stop) drawing = false;
};
