import { Spring, clamp, viewHeight } from "../util";
import { sidePanel } from "./dom";

const FRAME_HEIGHT = 6.4;
const FRAME_WIDTH = 5.2;
const OPEN_SHARE = 0.6;
const TOP_FROM = 0.15;
const TOP_RAMP = 0.2;
const SETTLE_FREQUENCY = 17;
const SETTLE_DAMPING = 0.55;

export class Layout {
  constructor(camera, panel) {
    Object.assign(this, { camera, panel });
    this.rate = document.getElementById("rate");
    this.side = 0;
    this.bottom = 0;
    this.top = 0;
    this.cssKey = "";
    this.growth = 0;
    this.measure();
    this.shown = Array.from(
      { length: 3 },
      () => new Spring(0, SETTLE_FREQUENCY, SETTLE_DAMPING),
    );
    this.targetZ = null;
  }

  measure() {
    const rect = this.panel.root.getBoundingClientRect();
    const wide = sidePanel.matches;
    this.side = wide ? Math.max(0, window.innerWidth - rect.left) : 0;
    this.bottom = wide ? 0 : Math.max(0, viewHeight() - rect.top);
    const h = viewHeight();
    const opened = clamp((this.bottom - h * TOP_FROM) / (h * TOP_RAMP), 0, 1);
    this.top = opened * this.rate.getBoundingClientRect().bottom;
  }

  // A sheet pulled past its open height covers the peach, so the peach stays framed for the open sheet.
  frameBottom() {
    return Math.min(this.bottom, viewHeight() * OPEN_SHARE);
  }

  stageRect() {
    return {
      x: 0,
      y: this.top,
      w: window.innerWidth - this.side,
      h: viewHeight() - this.bottom - this.top,
    };
  }

  update(delta) {
    this.measure();
    const bottom = this.frameBottom();
    const w = window.innerWidth;
    const h = viewHeight();
    const stageW = Math.max(1, w - this.side);
    const stageH = Math.max(1, h - bottom * 0.85 - this.top);
    const cam = this.camera;
    const halfFov = (cam.fov * Math.PI) / 360;
    const worldH = Math.max(
      (FRAME_HEIGHT * h) / stageH,
      (FRAME_WIDTH * h) / stageW,
    );
    const z = worldH / 2 / Math.tan(halfFov);
    const targets = [z, this.side / 2, (bottom - this.top) / 2];
    const snap = this.targetZ === null || !delta;
    const [shownZ, shownX, shownY] = targets.map((t, i) =>
      snap ? this.shown[i].snap(t) : this.shown[i].step(t, delta),
    );
    this.growth = snap ? 0 : (this.targetZ - z) / (z * delta);
    this.targetZ = z;
    cam.userData.baseZ = shownZ;
    const x = Math.round(shownX);
    const y = Math.round(shownY);
    const view = cam.view;
    if (
      !view ||
      view.offsetX !== x ||
      view.offsetY !== y ||
      view.fullWidth !== w ||
      view.fullHeight !== h
    )
      cam.setViewOffset(w, h, x, y, w, h);
    const key = `${Math.round(this.side)}|${Math.round(this.bottom)}`;
    if (key !== this.cssKey) {
      this.cssKey = key;
      const root = document.documentElement.style;
      root.setProperty("--panel-side", `${this.side}px`);
      root.setProperty("--panel-bottom", `${this.bottom}px`);
    }
  }
}
