import { clamp, viewHeight } from "../util";
import { sidePanel } from "./dom";

const FRAME_HEIGHT = 6.4;
const FRAME_WIDTH = 5.2;
const OPEN_SHARE = 0.6;
const TOP_FROM = 0.15;
const TOP_RAMP = 0.2;

export class Layout {
  constructor(camera, panel) {
    Object.assign(this, { camera, panel });
    this.rate = document.getElementById("rate");
    this.side = 0;
    this.bottom = 0;
    this.top = 0;
    this.cssKey = "";
    this.measure();
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

  // The sheet already eases in CSS, so framing follows its measured size each frame.
  update() {
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
    cam.userData.baseZ = z;
    const x = Math.round(this.side / 2);
    const y = Math.round((bottom - this.top) / 2);
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
