import { Vector2, Vector3, Plane, Raycaster, Quaternion, Matrix4 } from "three";
import { playCork } from "./audio";
import { BottleModel } from "./bottle3d";

const HEIGHT_PX = 116;
const DEPTH = 2.4;
const POUR_ANGLE = 118;
const LEAN_ANGLE = 12;
const STREAM_PX = 58;
const NORMAL_LEAN = 0.75;
const AXIS = new Vector3(0, 1, 0);
const SVG_UNITS = 80;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const ease = (rate, delta) => 1 - Math.exp(-delta * rate);
const wrap = (degrees) => ((((degrees + 180) % 360) + 360) % 360) - 180;

class ModelView {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.model = new BottleModel("apothecary");
    this.group = this.model.group;
    scene.add(this.group);
    this.spout = this.model.spec.spout;
    this.stopper = this.model.stopper;
    this.stopperY = this.stopper.position.y;
    this.stopper.material.transparent = true;
    this.raycaster = new Raycaster();
    this.plane = new Plane(new Vector3(0, 0, 1), -DEPTH);
    this.ndc = new Vector2();
    this.point = new Vector3();
    this.up = new Vector3();
    this.yaw = new Quaternion();
    this.front = new Vector3();
    this.side = new Vector3();
    this.basis = new Matrix4();
    this.cork = {
      popped: false,
      age: 0,
      velocity: new Vector3(),
      spin: new Vector3(),
      scale: 1,
      scaleVelocity: 0,
    };
  }

  setVisible(visible) {
    this.group.visible = visible;
  }

  spoutScreen() {
    this.group.updateMatrixWorld();
    const point = this.model.spoutWorld(this.point).project(this.camera);
    return {
      x: (point.x + 1) * 0.5 * window.innerWidth,
      y: (1 - point.y) * 0.5 * window.innerHeight,
    };
  }

  pixelSize() {
    const distance = this.camera.position.z - DEPTH;
    const height = 2 * distance * Math.tan((this.camera.fov * Math.PI) / 360);
    return height / window.innerHeight;
  }

  place(b, delta) {
    const scale = HEIGHT_PX * this.pixelSize() * b.size();
    const radians = (b.screen.angle * Math.PI) / 180;
    const up = this.up.set(Math.sin(radians), Math.cos(radians), 0);
    if (b.carried)
      up.addScaledVector(b.normal, -NORMAL_LEAN * b.flow).normalize();
    const front = this.front.set(0, 0, 1).addScaledVector(up, -up.z);
    if (front.lengthSq() < 0.01) front.set(0, -Math.sign(up.z), 0);
    front.normalize();
    const side = this.side.crossVectors(up, front);
    this.basis.makeBasis(side, up, front);
    this.group.quaternion
      .setFromRotationMatrix(this.basis)
      .multiply(this.yaw.setFromAxisAngle(AXIS, b.yaw));
    this.group.scale.setScalar(scale);
    if (b.carried) {
      this.toWorld(b.spoutPoint.x, b.spoutPoint.y, this.group.position);
      this.group.position.addScaledVector(up, -this.spout * scale);
    } else {
      this.toWorld(b.screen.x, b.screen.y - b.raise, this.group.position);
    }
    this.model.fill = b.fill;
    this.updateCork(delta);
    this.model.updateLiquid(clamp(b.slosh, -0.6, 0.6));
  }

  toWorld(x, y, target) {
    this.ndc.set(
      (x / window.innerWidth) * 2 - 1,
      -(y / window.innerHeight) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.ndc, this.camera);
    return this.raycaster.ray.intersectPlane(this.plane, target);
  }

  popCork() {
    const c = this.cork;
    c.popped = true;
    c.age = 0;
    this.group.updateMatrixWorld();
    this.scene.attach(this.stopper);
    const up = new Vector3(0, 1, 0).transformDirection(this.group.matrixWorld);
    c.velocity
      .copy(up)
      .multiplyScalar(2.6)
      .add(new Vector3((Math.random() - 0.5) * 0.8, 1.2, 0.6));
    c.spin.set(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 14,
    );
  }

  closeCork() {
    const c = this.cork;
    const s = this.stopper;
    c.popped = false;
    this.group.add(s);
    s.position.set(0, this.stopperY, 0);
    s.rotation.set(0, 0, 0);
    s.material.opacity = 1;
    s.visible = true;
    c.scale = 0;
    c.scaleVelocity = 0;
  }

  updateCork(delta) {
    const c = this.cork;
    const s = this.stopper;
    if (c.popped) {
      c.age += delta;
      c.velocity.y -= 9 * delta;
      s.position.addScaledVector(c.velocity, delta);
      s.rotation.x += c.spin.x * delta;
      s.rotation.y += c.spin.y * delta;
      s.rotation.z += c.spin.z * delta;
      s.material.opacity = clamp(1 - (c.age - 0.35) / 0.3, 0, 1);
      s.visible = s.material.opacity > 0;
      return;
    }
    c.scaleVelocity += ((1 - c.scale) * 420 - c.scaleVelocity * 16) * delta;
    c.scale += c.scaleVelocity * delta;
    const squash = 1 + (1 - c.scale) * 0.4;
    s.scale.set(squash, Math.max(0.01, c.scale), squash);
    s.position.y = this.stopperY + (1 - c.scale) * 0.12;
  }
}

class SvgView {
  constructor(el) {
    this.el = el;
    this.body = el.querySelector(".bottle-body");
    this.liquid = el.querySelector(".bottle-liquid");
    this.corkEl = el.querySelector(".bottle-cork");
    this.svg = el.querySelector(".bottle-body svg");
    this.lip = this.svg.createSVGPoint();
    this.spout = 0.375;
    this.cork = {
      popped: false,
      age: 0,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      spin: 0,
      turn: 0,
      scale: 1,
      scaleVelocity: 0,
    };
  }

  setVisible(visible) {
    this.el.classList.toggle("is-drawn", visible);
  }

  spoutScreen() {
    const matrix = this.svg.getScreenCTM();
    if (!matrix) return null;
    this.lip.x = 22;
    this.lip.y = 10;
    return this.lip.matrixTransform(matrix);
  }

  place(b, delta) {
    this.unit = (HEIGHT_PX * b.size()) / SVG_UNITS;
    this.angle = b.screen.angle;
    this.body.style.translate = `${b.screen.x - b.homeX}px ${b.screen.y - b.raise - b.homeY}px`;
    this.body.style.rotate = `${b.screen.angle}deg`;
    this.body.style.scale = `${b.size()}`;
    const surface = 36 + (1 - b.fill) * 30;
    const tilt = reducedMotion.matches ? 0 : b.slosh * 12;
    this.liquid.setAttribute(
      "transform",
      `rotate(${-b.screen.angle + tilt} 22 40) translate(0 ${surface - 40})`,
    );
    this.updateCork(delta);
  }

  popCork() {
    const c = this.cork;
    const radians = (this.angle * Math.PI) / 180;
    c.popped = true;
    c.age = 0;
    c.x = 0;
    c.y = 0;
    c.vx = Math.sin(radians) * 260 + (Math.random() - 0.5) * 80;
    c.vy = -Math.cos(radians) * 260 - 120;
    c.turn = 0;
    c.spin = (Math.random() - 0.5) * 900;
  }

  closeCork() {
    const c = this.cork;
    c.popped = false;
    c.scale = 0;
    c.scaleVelocity = 0;
  }

  updateCork(delta) {
    const c = this.cork;
    const el = this.corkEl;
    if (c.popped) {
      c.age += delta;
      c.vy += 900 * delta;
      c.x += c.vx * delta;
      c.y += c.vy * delta;
      c.turn += c.spin * delta;
      const radians = (-this.angle * Math.PI) / 180;
      const lx =
        (c.x * Math.cos(radians) - c.y * Math.sin(radians)) / this.unit;
      const ly =
        (c.x * Math.sin(radians) + c.y * Math.cos(radians)) / this.unit;
      el.setAttribute(
        "transform",
        `translate(${lx} ${ly}) rotate(${c.turn} 22 6)`,
      );
      el.style.opacity = clamp(1 - (c.age - 0.35) / 0.3, 0, 1);
      return;
    }
    c.scaleVelocity += ((1 - c.scale) * 420 - c.scaleVelocity * 16) * delta;
    c.scale += c.scaleVelocity * delta;
    const squash = 1 + (1 - c.scale) * 0.4;
    el.setAttribute(
      "transform",
      `translate(22 10) scale(${squash} ${Math.max(0.01, c.scale)}) translate(-22 -10)`,
    );
    el.style.opacity = 1;
  }
}

export class Bottle {
  constructor(scene, camera) {
    this.el = document.getElementById("bottle");
    this.stream = document.getElementById("bottle-stream");
    this.streamPath = this.stream.querySelector(".stream-oil");
    this.streamShine = this.stream.querySelector(".stream-shine");
    this.views = {
      model: new ModelView(scene, camera),
      drawn: new SvgView(this.el),
    };
    this.setStyle("model");

    this.screen = { x: 0, y: 0, angle: 0 };
    this.velocity = { x: 0, y: 0, angle: 0 };
    this.hover = { value: 0, velocity: 0 };
    this.flow = 0;
    this.fill = 1;
    this.side = 0;
    this.swing = 1;
    this.normal = new Vector3(0, 0, 1);
    this.surface = new Vector3();
    this.spoutPoint = { x: 0, y: 0 };
    this.slosh = 0;
    this.sloshVelocity = 0;
    this.lift = 0;
    this.raise = 0;
    this.yaw = 0;
    this.hovered = false;
    this.bend = 0;
    this.time = 0;
    this.calling = false;
    this.carried = false;

    this.el.addEventListener("pointerenter", () => {
      this.hovered = true;
      if (!this.carried && !reducedMotion.matches) this.velocity.angle += 160;
    });
    this.el.addEventListener("pointerleave", () => {
      this.hovered = false;
    });
    this.resize();
    this.screen.x = this.homeX;
    this.screen.y = this.homeY;
    window.addEventListener("resize", () => this.resize());
  }

  setStyle(style) {
    const next = this.views[style] ? style : "model";
    Object.entries(this.views).forEach(([name, view]) =>
      view.setVisible(name === next),
    );
    if (this.view?.cork.popped) this.view.closeCork();
    this.view = this.views[next];
  }

  resize() {
    const rect = this.el.getBoundingClientRect();
    this.homeX = rect.left + rect.width / 2;
    this.homeY = rect.top + rect.height / 2;
  }

  size() {
    return 1 + this.lift * 0.1 + this.hover.value * 0.07;
  }

  pick() {
    this.carried = true;
    this.el.classList.add("is-carried");
    this.stream.classList.add("is-visible");
  }

  carry(x, y, vx, hit, peach, delta) {
    this.time += delta;
    this.flow += ((hit ? 1 : 0) - this.flow) * ease(9, delta);
    const across = clamp((x - peach.x) / peach.radius, -1, 1);
    this.side += (across - this.side) * ease(8, delta);
    const lean = -LEAN_ANGLE * this.side;
    if (this.flow < 0.05) this.swing = this.side < 0 ? 1 : -1;
    const pourAngle = this.swing * 180 + (180 - POUR_ANGLE) * this.side;
    const target = lean + (pourAngle - lean) * this.flow;
    const angle = this.screen.angle + wrap(target - this.screen.angle);
    const radians = (angle * Math.PI) / 180;
    const spout = this.view.spout * HEIGHT_PX * this.size();
    const spoutY = y - STREAM_PX * this.flow;
    this.spoutPoint.x = x;
    this.spoutPoint.y = spoutY;
    if (hit) {
      const n = this.surface.copy(hit.point).sub(peach.center);
      const r = peach.worldRadius;
      n.z = Math.sqrt(Math.max(r * r - n.x * n.x - n.y * n.y, 0.25 * r * r));
      this.normal.lerp(n.normalize(), ease(8, delta)).normalize();
    }
    this.screen.x = x - spout * Math.sin(radians);
    this.screen.y = spoutY + spout * Math.cos(radians);
    const turn = (angle - this.screen.angle) / Math.max(delta, 1 / 240);
    this.screen.angle = angle;

    const pour = hit ? clamp((this.flow - 0.45) / 0.55, 0, 1) : 0;
    if (!this.view.cork.popped && this.flow > 0.35) {
      this.view.popCork();
      playCork(true);
    }
    this.fill = Math.max(0.3, this.fill - pour * delta * 0.06);
    this.sloshVelocity +=
      (-this.slosh * 70 - this.sloshVelocity * 5 - vx * 30 - turn * 0.004) *
      delta;
    this.slosh += this.sloshVelocity * delta;
    this.bend += (clamp(-vx * 40, -26, 26) - this.bend) * ease(12, delta);
    this.yaw = Math.sin(this.time * 0.6) * 0.25 + clamp(vx * 0.6, -0.5, 0.5);
    this.place(delta);
    const start = this.view.spoutScreen() ?? { x, y: spoutY };
    this.drawStream(start, { x, y }, pour);
    return pour;
  }

  place(delta) {
    this.lift += ((this.carried ? 1 : 0) - this.lift) * ease(12, delta);
    const h = this.hover;
    const wanted = this.hovered && !this.carried ? 1 : 0;
    h.velocity += ((wanted - h.value) * 260 - h.velocity * 15) * delta;
    h.value += h.velocity * delta;
    this.raise = h.value * 8 * (1 - this.lift);
    this.view.place(this, delta);
  }

  drawStream(start, end, pour) {
    this.stream.style.translate = `${start.x}px ${start.y}px`;
    const b = this.bend * pour;
    const ex = (end.x - start.x) * pour + b;
    const ey = (end.y - start.y) * pour;
    const cx = (ex - b) * 0.6 + b * 0.2;
    const cy = ey * 0.6;
    const wobble = reducedMotion.matches ? 0 : Math.sin(this.time * 38) * 0.4;
    const top = 2.8 * pour + wobble;
    const tip = 1.3 * pour;
    this.streamPath.setAttribute(
      "d",
      `M ${-top} -2 Q ${cx - top} ${cy} ${ex - tip} ${ey}` +
        ` L ${ex + tip} ${ey} Q ${cx + top} ${cy} ${top} -2 Z`,
    );
    this.streamShine.setAttribute(
      "d",
      `M ${-top * 0.35} 0 Q ${cx - top * 0.35} ${cy} ${ex} ${ey * 0.92}`,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  splash(x, y) {
    if (reducedMotion.matches) return;
    const ring = document.createElement("span");
    ring.className = "oil-splash";
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    document.body.appendChild(ring);
    ring
      .animate(
        [
          { opacity: 0.9, transform: "translate(-50%, -50%) scale(0.3)" },
          { opacity: 0, transform: "translate(-50%, -50%) scale(1.5)" },
        ],
        { duration: 480, easing: "cubic-bezier(.2,.7,.3,1)" },
      )
      .finished.then(() => ring.remove());
  }

  drop() {
    this.carried = false;
    this.screen.angle = wrap(this.screen.angle);
    this.flow = 0;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.el.classList.remove("is-carried");
    this.stream.classList.remove("is-visible");
    if (this.view.cork.popped) {
      this.view.closeCork();
      playCork(false);
    }
    this.sloshVelocity += 3;
  }

  update(delta) {
    if (this.carried) return;
    this.time += delta;
    const v = this.velocity;
    v.x += ((this.homeX - this.screen.x) * 170 - v.x * 20) * delta;
    v.y += ((this.homeY - this.screen.y) * 170 - v.y * 20) * delta;
    this.screen.x += v.x * delta;
    this.screen.y += v.y * delta;
    const nudge = Math.max(0, Math.sin(this.time * 1.4)) ** 8;
    const sway =
      this.calling && !reducedMotion.matches
        ? Math.sin(this.time * 9) * nudge * 9
        : 0;
    v.angle += ((sway - this.screen.angle) * 260 - v.angle * 12) * delta;
    this.screen.angle += v.angle * delta;
    this.fill = Math.min(1, this.fill + delta * 0.12);
    this.sloshVelocity += (-this.slosh * 70 - this.sloshVelocity * 5) * delta;
    this.slosh += this.sloshVelocity * delta;
    this.yaw = Math.sin(this.time * 0.6) * 0.25;
    this.place(delta);
  }

  setCalling(calling) {
    this.calling = calling;
  }
}
