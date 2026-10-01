import { ease } from "../util";
import { sidePanel } from "./dom";

const FRAME_HEIGHT = 6.4;
const FRAME_WIDTH = 5.2;
const OPEN_SHARE = 0.6;

export class Layout {
  constructor(camera, panel) {
    Object.assign(this, { camera, panel });
    this.rate = document.getElementById("rate");
    this.side = 0;
    this.bottom = 0;
    this.top = 0;
    this.shownSide = 0;
    this.shownBottom = 0;
    this.shownTop = 0;
    this.shownZ = camera.userData.baseZ;
    this.cssKey = "";
    new ResizeObserver(() => this.measure()).observe(panel.root);
    window.addEventListener("resize", () => this.measure());
    this.measure();
    this.shownSide = this.side;
    this.shownBottom = this.frameBottom();
    this.shownTop = this.top;
  }

  measure() {
    const rect = this.panel.root.getBoundingClientRect();
    const wide = sidePanel.matches;
    this.side = wide ? Math.max(0, window.innerWidth - rect.left) : 0;
    this.bottom = wide ? 0 : Math.max(0, window.innerHeight - rect.top);
    const opened = this.bottom > window.innerHeight * 0.3;
    this.top = opened ? this.rate.getBoundingClientRect().bottom : 0;
  }

  // A sheet pulled past its open height covers the peach, so the peach stays framed for the open sheet.
  frameBottom() {
    return Math.min(this.bottom, window.innerHeight * OPEN_SHARE);
  }

  stageRect() {
    return {
      x: 0,
      y: this.top,
      w: window.innerWidth - this.side,
      h: window.innerHeight - this.bottom - this.top,
    };
  }

  update(delta) {
    const k = ease(6, delta);
    this.shownSide += (this.side - this.shownSide) * k;
    this.shownBottom += (this.frameBottom() - this.shownBottom) * k;
    this.shownTop += (this.top - this.shownTop) * k;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const stageW = Math.max(1, w - this.shownSide);
    const stageH = Math.max(1, h - this.shownBottom * 0.85 - this.shownTop);
    const cam = this.camera;
    const halfFov = (cam.fov * Math.PI) / 360;
    const worldH = Math.max(
      (FRAME_HEIGHT * h) / stageH,
      (FRAME_WIDTH * h) / stageW,
    );
    const z = worldH / 2 / Math.tan(halfFov);
    this.shownZ += (z - this.shownZ) * k;
    cam.userData.baseZ = this.shownZ;
    const x = Math.round(this.shownSide / 2);
    const y = Math.round((this.shownBottom - this.shownTop) / 2);
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
