import { Vector2, Vector3, Plane, Raycaster, Quaternion, Matrix4 } from "three";
import { playCork } from "./audio";
import { BottleModel } from "./bottle3d";
import OilStream from "./stream";
import OilShadow from "./oilshadow";
import { clamp, ease, reducedMotion, viewHeight } from "./util";

const PEACH_BASE = 1.6;
const PEACH_HEIGHT = 3.2;
const HEIGHT_TO_PEACH = 0.28;
const WIDTH_TO_HEIGHT = 0.52;
const HINT_GAP_PX = 12;
const DEPTH = 2.4;
const POUR_ANGLE = 118;
const LEAN_ANGLE = 12;
const STREAM_PX = 58;
const NORMAL_LEAN = 0.75;
const AXIS = new Vector3(0, 1, 0);
const FLING_SPEED = 2.8;
const FLING_COOLDOWN = 1.2;

const wrap = (degrees) => ((((degrees + 180) % 360) + 360) % 360) - 180;

class ModelView {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.model = new BottleModel();
    this.group = this.model.group;
    scene.add(this.group);
    this.spout = this.model.spout;
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

  spoutScreen() {
    this.group.updateMatrixWorld();
    const point = this.model.spoutWorld(this.point).project(this.camera);
    return {
      x: (point.x + 1) * 0.5 * window.innerWidth,
      y: (1 - point.y) * 0.5 * viewHeight(),
    };
  }

  floorScreenY() {
    const distance = this.camera.userData.baseZ - DEPTH;
    const halfHeight = distance * Math.tan((this.camera.fov * Math.PI) / 360);
    return viewHeight() * 0.5 * (1 + PEACH_BASE / halfHeight);
  }

  heightPx() {
    const halfFov = (this.camera.fov * Math.PI) / 360;
    const peachPx =
      (PEACH_HEIGHT * viewHeight()) /
      (2 * this.camera.userData.baseZ * Math.tan(halfFov));
    return peachPx * HEIGHT_TO_PEACH;
  }

  pixelSize() {
    const distance = this.camera.position.z - DEPTH;
    const height = 2 * distance * Math.tan((this.camera.fov * Math.PI) / 360);
    return height / viewHeight();
  }

  place(b, delta) {
    this.camera.updateMatrixWorld();
    const scale = b.heightPx * this.pixelSize() * b.size();
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
      .premultiply(this.camera.quaternion)
      .multiply(this.yaw.setFromAxisAngle(AXIS, b.yaw));
    this.group.scale.setScalar(scale);
    if (b.carried) {
      this.toWorld(b.spoutPoint.x, b.spoutPoint.y, this.group.position);
      this.group.position.addScaledVector(
        up.applyQuaternion(this.camera.quaternion),
        -this.spout * scale,
      );
    } else {
      this.toWorld(b.screen.x, b.screen.y - b.raise, this.group.position);
    }
    this.model.fill = b.fill;
    this.updateCork(delta);
    this.model.updateLiquid(clamp(b.slosh, -0.6, 0.6));
  }

  toWorld(x, y, target) {
    this.ndc.set((x / window.innerWidth) * 2 - 1, -(y / viewHeight()) * 2 + 1);
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

export class Bottle {
  constructor(scene, camera) {
    this.el = document.getElementById("bottle");
    this.stream = new OilStream(document.getElementById("bottle-stream"));
    this.view = new ModelView(scene, camera);
    this.oilShadow = new OilShadow(scene, camera);

    this.screen = { x: 0, y: 0, angle: 0 };
    this.velocity = { x: 0, y: 0, angle: 0 };
    this.hover = { value: 0, velocity: 0 };
    this.flow = 0;
    this.fill = 1;
    this.side = 0;
    this.swing = 1;
    this.normal = new Vector3(0, 0, 1);
    this.surface = new Vector3();
    this.spoutWorld = new Vector3();
    this.spoutPoint = { x: 0, y: 0 };
    this.slosh = 0;
    this.sloshVelocity = 0;
    this.lift = 0;
    this.raise = 0;
    this.yaw = 0;
    this.hovered = false;
    this.time = 0;
    this.calling = false;
    this.carried = false;
    this.peak = { speed: 0, vx: 0, vy: 0 };
    this.flingWait = 0;

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

  resize() {
    this.hintsTop = document.querySelector(".hints").offsetTop;
    this.updateHome();
  }

  updateHome() {
    const height = this.view.heightPx();
    const bottom = Math.min(
      this.view.floorScreenY(),
      this.hintsTop - HINT_GAP_PX,
    );
    const homeY = bottom - height / 2;
    if (homeY === this.homeY && height === this.heightPx) return;
    this.heightPx = height;
    this.homeY = homeY;
    const width = height * WIDTH_TO_HEIGHT;
    Object.assign(this.el.style, {
      top: `${bottom - height}px`,
      width: `${width}px`,
      height: `${height}px`,
    });
    this.homeX = this.el.offsetLeft + width / 2;
  }

  size() {
    return 1 + this.lift * 0.1 + this.hover.value * 0.07;
  }

  pick() {
    this.carried = true;
    this.el.classList.add("is-carried");
  }

  carry(x, y, vx, hit, landing, peach, delta) {
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
    const spout = this.view.spout * this.heightPx * this.size();
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
    this.yaw = Math.sin(this.time * 0.6) * 0.25 + clamp(vx * 0.6, -0.5, 0.5);
    this.place(delta);
    const start = this.view.spoutScreen();
    this.stream.update(start, this.screen.angle, landing, pour, delta);
    if (hit) {
      const spoutZ = this.view.model.spoutWorld(this.spoutWorld).z;
      this.oilShadow.anchor(start.y, spoutZ, landing.y, hit.point.z);
    }
    this.oilShadow.update(this.stream);
    return pour;
  }

  fling(motion, delta) {
    const { peak } = this;
    peak.speed *= 1 - ease(6, delta);
    if (motion.speed > peak.speed) Object.assign(peak, motion);
    this.flingWait -= delta;
    if (
      motion.speed > peak.speed * 0.5 ||
      peak.speed < FLING_SPEED ||
      this.flingWait > 0 ||
      !this.view.cork.popped ||
      reducedMotion.matches
    ) {
      return;
    }
    const amount = clamp(peak.speed / (FLING_SPEED * 2), 0.5, 1) * this.fill;
    this.flingWait = FLING_COOLDOWN;
    this.fill = Math.max(0.3, this.fill - amount * 0.03);
    this.sloshVelocity += 4;
    const unit = Math.min(window.innerWidth, viewHeight());
    const spout = this.view.spoutScreen();
    this.stream.fling(spout, peak.vx * unit, peak.vy * unit, amount);
    peak.speed = 0;
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

  splash(x, y) {
    this.stream.splash(x, y);
  }

  drop() {
    this.carried = false;
    this.screen.angle = wrap(this.screen.angle);
    this.flow = 0;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.el.classList.remove("is-carried");
    if (this.view.cork.popped) {
      this.view.closeCork();
      playCork(false);
    }
    this.sloshVelocity += 3;
  }

  update(delta) {
    if (this.carried) return;
    if (this.stream.active) this.stream.update(null, 0, undefined, 0, delta);
    this.oilShadow.update(this.stream);
    this.time += delta;
    this.updateHome();
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
