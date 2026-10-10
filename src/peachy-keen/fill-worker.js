import Gulp from "./fill-wave";

// Runs off the main thread, so the still keeps filling while the game compiles its graphics.
let gulp = null;
let context = null;
let size = 0;
let epoch = 0;
let target = 0;
let drawing = true;
let painted = false;
let last = 0;

const nextFrame = (run) =>
  globalThis.requestAnimationFrame
    ? globalThis.requestAnimationFrame(run)
    : setTimeout(run, 16);

function frame() {
  const now = performance.timeOrigin + performance.now();
  const delta = Math.min(0.05, (now - last) / 1000);
  last = now;
  gulp.step(delta, target);
  if (drawing && gulp.ready) {
    gulp.draw(context, size, (now - epoch) / 1000);
    if (!painted && gulp.grey) {
      painted = true;
      globalThis.postMessage({ painted: true });
    }
  }
  globalThis.postMessage({
    ...gulp.snapshot(),
    at: performance.timeOrigin + performance.now(),
  });
  nextFrame(frame);
}

globalThis.onmessage = ({ data }) => {
  if (data.canvas) {
    ({ size, epoch } = data);
    const { canvas } = data;
    gulp = new Gulp({
      makeCanvas: (w, h) => new OffscreenCanvas(w, h),
      calm: data.calm,
    });
    context = canvas.getContext("2d");
    canvas.width = size;
    canvas.height = size;
    last = performance.timeOrigin + performance.now();
    nextFrame(frame);
  }
  if (data.images) gulp.setImages(...data.images);
  if (data.target !== undefined) ({ target } = data);
  if (data.size) {
    ({ size } = data);
    context.canvas.width = size;
    context.canvas.height = size;
  }
  if (data.quiet) gulp.holdGulps(data.quiet);
  if (data.stop) drawing = false;
};
