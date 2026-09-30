import { ease } from "../util";

const FRAME_HEIGHT = 6.4;
const FRAME_WIDTH = 5.2;
const WIDE = window.matchMedia("(min-width: 900px)");

export class Layout {
  constructor(camera, panel) {
    Object.assign(this, { camera, panel });
    this.side = 0;
    this.bottom = 0;
    this.shownSide = 0;
    this.shownBottom = 0;
    this.shownZ = camera.userData.baseZ;
    this.cssKey = "";
    new ResizeObserver(() => this.measure()).observe(panel.root);
    window.addEventListener("resize", () => this.measure());
    this.measure();
    this.shownSide = this.side;
    this.shownBottom = this.bottom;
  }

  measure() {
    const rect = this.panel.root.getBoundingClientRect();
    const wide = WIDE.matches;
    this.side = wide ? Math.max(0, window.innerWidth - rect.left) : 0;
    this.bottom = wide ? 0 : Math.max(0, window.innerHeight - rect.top);
  }

  stageRect() {
    return {
      x: 0,
      y: 0,
      w: window.innerWidth - this.side,
      h: window.innerHeight - this.bottom,
    };
  }

  update(delta) {
    const k = ease(6, delta);
    this.shownSide += (this.side - this.shownSide) * k;
    this.shownBottom += (this.bottom - this.shownBottom) * k;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const stageW = Math.max(1, w - this.shownSide);
    const stageH = Math.max(1, h - this.shownBottom * 0.85);
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
    const y = Math.round(this.shownBottom / 2);
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
