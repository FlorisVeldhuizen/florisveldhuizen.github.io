import {
  Box3,
  DirectionalLight,
  Sphere,
  HemisphereLight,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Color,
  Vector3,
  WebGLRenderTarget,
} from "three";
import { HELPERS } from "../data/helpers";
import { makeProp } from "./shapes";
import { Toucher } from "./touches";
import { reducedMotion } from "../../util";

const LUNGE = 0.18;
const RETURN = 0.5;
const SIZE = 0.62;
const THUMB = 128;
const GAP = 0.08;

const smooth = (t) => t * t * (3 - 2 * t);

export class Props {
  constructor(game, interaction, popups, scene) {
    Object.assign(this, { game, i: interaction, scene });
    this.toucher = new Toucher(game, interaction, popups);
    this.members = new Map();
    this.time = 0;
    this.target = new Vector3();
  }

  warmups() {
    return HELPERS.map((h) => {
      const prop = makeProp(h.id);
      prop.visible = false;
      this.scene.add(prop);
      const radius = new Box3()
        .setFromObject(prop)
        .getBoundingSphere(new Sphere()).radius;
      this.members.set(h.id, {
        prop,
        radius,
        tap: new Vector3(),
        hit: null,
        lunge: -1,
        seed: Math.random() * 10,
        born: -1,
      });
      return prop;
    });
  }

  setActive(on) {
    this.active = on;
    this.members.forEach((m) => {
      // eslint-disable-next-line no-param-reassign
      m.prop.visible = false;
    });
  }

  update(delta) {
    if (!this.active) return;
    const i = this.i;
    const show = this.game.state.options.cast;
    this.time += delta;
    const motion = reducedMotion.matches ? 0 : 1;
    const owned = HELPERS.filter(
      (h) => (this.game.state.helpers[h.id] || 0) > 0,
    );
    const due = show ? this.toucher.due(delta) : [];
    due.forEach((id) => {
      const m = this.members.get(id);
      if (!m || m.lunge >= 0 || !m.prop.visible) return;
      const hit = this.toucher.hitFrom(m.prop.position);
      if (!hit) return;
      m.hit = hit;
      m.tap
        .copy(m.prop.position)
        .sub(hit.point)
        .setLength(m.radius * m.prop.scale.x + GAP)
        .add(hit.point);
      m.lunge = 0;
      m.acted = false;
    });
    const center = i.group.position;
    this.members.forEach((m, id) => {
      const k = owned.findIndex((h) => h.id === id);
      const { prop } = m;
      prop.visible = show && k >= 0;
      if (!prop.visible) {
        m.born = -1;
        return;
      }
      if (m.born < 0) m.born = this.time;
      const a =
        Math.PI / 2 +
        ((k + 0.5) / owned.length) * Math.PI * 2 +
        this.time * 0.05 * motion;
      const home = this.target.set(
        center.x + Math.cos(a) * 2.9,
        center.y +
          Math.sin(a) * 2.45 +
          Math.sin(this.time * 1.2 + m.seed) * 0.08 * motion,
        0.3 + Math.sin(a + 0.6) * 0.9,
      );
      let reach = 0;
      if (m.lunge >= 0) {
        m.lunge += delta;
        const t = m.lunge;
        reach =
          t < LUNGE
            ? smooth(t / LUNGE)
            : 1 - smooth(Math.min(1, (t - LUNGE) / RETURN));
        if (!m.acted && t >= LUNGE) {
          m.acted = true;
          this.toucher.touch(id, m.hit);
        }
        if (t >= LUNGE + RETURN) m.lunge = -1;
      }
      prop.position.copy(home);
      if (reach > 0 && motion) prop.position.lerp(m.tap, reach);
      const grow = smooth(Math.min(1, (this.time - m.born) / 0.6));
      prop.scale.setScalar(SIZE * grow * (1 + reach * 0.15));
      prop.rotation.set(
        Math.sin(this.time * 0.8 + m.seed) * 0.25 * motion,
        Math.sin(this.time * 0.5 + m.seed) * 0.7 * motion,
        Math.sin(this.time * 0.6 + m.seed) * 0.2 * motion,
      );
    });
  }
}

export function renderThumbnails(renderer, environment) {
  const scene = new Scene();
  scene.environment = environment;
  scene.add(new HemisphereLight(0xffe4ea, 0x7a3060, 1.1));
  const key = new DirectionalLight(0xffd6b8, 2.2);
  key.position.set(2, 3, 4);
  scene.add(key);
  const rim = new DirectionalLight(0xff4f9a, 1.6);
  rim.position.set(-3, 1, -2);
  scene.add(rim);
  const camera = new PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.set(0, 0.15, 3);
  camera.lookAt(0, 0, 0);
  const target = new WebGLRenderTarget(THUMB, THUMB, { samples: 4 });
  target.texture.colorSpace = SRGBColorSpace;
  const previous = renderer.getRenderTarget();
  const clear = renderer.getClearColor(new Color());
  const alpha = renderer.getClearAlpha();
  const shadows = renderer.shadowMap.enabled;
  renderer.shadowMap.enabled = false;
  renderer.setClearColor(0x000000, 0);
  const pixels = new Uint8Array(THUMB * THUMB * 4);
  const canvas = document.createElement("canvas");
  canvas.width = THUMB;
  canvas.height = THUMB;
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(THUMB, THUMB);
  const thumbs = {};
  HELPERS.forEach((h) => {
    const prop = makeProp(h.id);
    prop.rotation.set(0.25, 0.6, 0.1);
    scene.add(prop);
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.readRenderTargetPixels(target, 0, 0, THUMB, THUMB, pixels);
    for (let y = 0; y < THUMB; y += 1) {
      const row = (THUMB - 1 - y) * THUMB * 4;
      image.data.set(pixels.subarray(row, row + THUMB * 4), y * THUMB * 4);
    }
    ctx.putImageData(image, 0, 0);
    thumbs[h.id] = canvas.toDataURL();
    scene.remove(prop);
  });
  renderer.setRenderTarget(previous);
  renderer.setClearColor(clear, alpha);
  renderer.shadowMap.enabled = shadows;
  target.dispose();
  return thumbs;
}
