import { Euler, Quaternion, Vector3 } from "three";

const MARGIN = 10;

export default function createFrame(ctx) {
  const cam = ctx.camera;
  const canvas = ctx.renderer.domElement;
  const ray = new Vector3();
  const fwd = new Vector3();
  const euler = new Euler(0, 0, 0, "ZYX");
  const turn = new Quaternion();
  const safe = { l: 0, t: 0, r: 1, b: 1, w: 1, h: 1, stageBottom: 1, cx: 0.5 };
  const goal = { ...safe };
  let first = true;

  const cache = { width: 1, height: 1, scoreBottom: 0, side: 0, bottom: 0 };
  const root = document.documentElement;
  const readBox = () => {
    const box = canvas.getBoundingClientRect();
    cache.width = box.width;
    cache.height = box.height;
    const score = document.querySelector(".score");
    const s = score?.getBoundingClientRect();
    cache.scoreBottom = s && s.height > 0 ? s.bottom - box.top : 0;
  };
  const readPanel = () => {
    cache.side = parseFloat(root.style.getPropertyValue("--panel-side")) || 0;
    cache.bottom =
      parseFloat(root.style.getPropertyValue("--panel-bottom")) || 0;
  };
  readBox();
  readPanel();
  const sizes = new ResizeObserver(readBox);
  sizes.observe(canvas);
  const score = document.querySelector(".score");
  if (score) sizes.observe(score);
  const panel = new MutationObserver(readPanel);
  panel.observe(root, { attributes: true, attributeFilter: ["style"] });
  window.addEventListener("resize", readBox);
  ctx.onDispose(() => {
    sizes.disconnect();
    panel.disconnect();
    window.removeEventListener("resize", readBox);
  });

  function measure() {
    let r = cache.width;
    let b = cache.height;
    const t = Math.max(MARGIN, cache.scoreBottom ? cache.scoreBottom + 6 : 0);
    let stageBottom = b;
    if (cache.bottom > 0 && cache.bottom < b * 0.7)
      stageBottom = b - cache.bottom;
    else if (cache.side > 0) r = Math.min(r, cache.width - cache.side);
    b = stageBottom - MARGIN;
    r -= MARGIN;
    Object.assign(goal, {
      l: MARGIN,
      t,
      r,
      b,
      w: r - MARGIN,
      h: b - t,
      stageBottom,
      cx: (MARGIN + r) / 2,
    });
  }

  return {
    safe,
    get width() {
      return cache.width;
    },
    update(dt) {
      measure();
      const k = first ? 1 : 1 - Math.exp(-dt * 7);
      first = false;
      Object.keys(goal).forEach((key) => {
        safe[key] += (goal[key] - safe[key]) * k;
      });
      cam.updateMatrixWorld();
    },
    unit(depth) {
      return cache.height / (2 * Math.tan((cam.fov * Math.PI) / 360) * depth);
    },
    screenOf(v, out) {
      ray.copy(v).project(cam);
      return out.set(
        ((ray.x + 1) / 2) * cache.width,
        ((1 - ray.y) / 2) * cache.height,
        0,
      );
    },

    place(out, sx, sy, depth) {
      const w = cache.width;
      const h = cache.height;
      ray
        .set((sx / w) * 2 - 1, -(sy / h) * 2 + 1, 0.5)
        .unproject(cam)
        .sub(cam.position)
        .normalize();
      fwd.set(0, 0, -1).applyQuaternion(cam.quaternion);
      return out
        .copy(cam.position)
        .addScaledVector(ray, depth / Math.max(0.2, ray.dot(fwd)));
    },
    orient(object, x, y, z) {
      euler.set(x, y, z);
      turn.setFromEuler(euler);
      object.quaternion.copy(cam.quaternion).multiply(turn);
    },
  };
}
