import {
  AdditiveBlending,
  BufferAttribute,
  CanvasTexture,
  Color,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  PointLight,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";
import {
  startDisco,
  stopDisco,
  discoBeat,
  DISCO_BPM,
  DISCO_FADE,
} from "./audio";
import { Buzzer } from "./toys";
import { reducedMotion } from "./util";

const smooth = (t) => t * t * (3 - 2 * t);
const UP = new Vector3(0, 1, 0.3).normalize();

function choreography(beat, pose) {
  const b = beat % 16;
  const f = beat % 1;
  const hop = Math.sin(Math.PI * f) ** 2;
  Object.assign(pose, { x: 0, lift: 0, yaw: 0, roll: 0 });
  if (b < 4) {
    const sway = Math.sin(Math.PI * beat);
    pose.lift = 0.14 * hop;
    pose.roll = 0.14 * sway;
    pose.x = 0.1 * sway;
  } else if (b < 8) {
    const a = Math.PI * (b - 4);
    pose.x = 0.22 * Math.sin(a);
    pose.lift = 0.09 * (1 - Math.cos(a));
    pose.roll = -0.12 * Math.sin(a);
    pose.yaw = 0.2 * Math.sin(a);
  } else if (b < 12) {
    const d = b - 8;
    let down = 1;
    if (d < 1) down = smooth(d);
    else if (d > 3) down = 1 - smooth(d - 3);
    pose.lift = -0.32 * down + 0.05 * down * hop;
    pose.roll = 0.08 * down * Math.sin(2 * Math.PI * beat);
  } else if (b < 15) {
    pose.x = 0.1 * Math.sin(4 * Math.PI * beat);
    pose.roll = 0.06 * Math.sin(4 * Math.PI * beat);
  } else {
    pose.yaw = 2 * Math.PI * smooth(f);
    pose.lift = 0.18 * Math.sin(Math.PI * f);
  }
  return pose;
}

const BALL_RADIUS = 0.42;
const BALL_DEPTH = -1.5;
const TINTS = [0xff4fd8, 0x3fe0ff, 0xffc94a, 0xb46bff];

function glintTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const c = size / 2;
  const glow = ctx.createRadialGradient(c, c, 0, c, c, c);
  glow.addColorStop(0, "rgba(255,255,255,1)");
  glow.addColorStop(0.12, "rgba(255,240,255,0.6)");
  glow.addColorStop(1, "rgba(255,200,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "lighter";
  [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4].forEach((a, n) => {
    const reach = n < 2 ? c : c * 0.5;
    const ray = ctx.createLinearGradient(
      c - Math.cos(a) * reach,
      c - Math.sin(a) * reach,
      c + Math.cos(a) * reach,
      c + Math.sin(a) * reach,
    );
    ray.addColorStop(0, "rgba(255,255,255,0)");
    ray.addColorStop(0.5, "rgba(255,255,255,0.9)");
    ray.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = ray;
    ctx.lineWidth = n < 2 ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(c - Math.cos(a) * reach, c - Math.sin(a) * reach);
    ctx.lineTo(c + Math.cos(a) * reach, c + Math.sin(a) * reach);
    ctx.stroke();
  });
  return new CanvasTexture(canvas);
}

function mirrorBall() {
  const holder = new Group();
  const geometry = new SphereGeometry(BALL_RADIUS, 30, 18).toNonIndexed();
  const count = geometry.attributes.position.count;
  const colors = new Float32Array(count * 3);
  const c = new Color();
  for (let tri = 0; tri < count / 3; tri += 1) {
    if (tri % 2 === 0) {
      const roll = Math.random();
      if (roll < 0.22) c.set(TINTS[Math.floor(Math.random() * TINTS.length)]);
      else c.setScalar(0.72 + Math.random() * 0.28);
    }
    for (let v = 0; v < 3; v += 1) c.toArray(colors, (tri * 3 + v) * 3);
  }
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  const ball = new Mesh(
    geometry,
    new MeshStandardMaterial({
      vertexColors: true,
      metalness: 1,
      roughness: 0.14,
      flatShading: true,
      envMapIntensity: 1.8,
    }),
  );
  holder.add(ball);
  const metal = new MeshStandardMaterial({
    color: 0x9a8fa8,
    metalness: 1,
    roughness: 0.3,
  });
  const cap = new Mesh(new CylinderGeometry(0.07, 0.09, 0.08, 16), metal);
  cap.position.y = BALL_RADIUS + 0.02;
  [ball, cap].forEach((mesh) => {
    Object.assign(mesh, { castShadow: true, receiveShadow: true });
  });
  holder.add(cap);
  const cord = new Mesh(new CylinderGeometry(0.008, 0.008, 8, 6), metal);
  cord.position.y = BALL_RADIUS + 4;
  holder.add(cord);
  const map = glintTexture();
  const glints = Array.from({ length: 6 }, () => {
    const sprite = new Sprite(
      new SpriteMaterial({
        map,
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0,
      }),
    );
    holder.add(sprite);
    return sprite;
  });
  holder.visible = false;
  return { holder, ball, glints };
}

class Disco {
  constructor(scene, camera, interaction, talk, backdrop) {
    Object.assign(this, { camera, i: interaction, talk, backdrop });
    this.mirror = mirrorBall();
    scene.add(this.mirror.holder);
    this.drop = 1;
    this.dropVelocity = 0;
    this.lastGlintBeat = -1;
    this.screen = new Vector3();
    this.lights = [
      [0xff2bd6, -3.5, -2.5],
      [0x2be4ff, 3.5, -2.5],
      [0xffc27a, 0, 5],
    ].map(([color, x, z]) => {
      const light = new PointLight(color, 0, 20);
      light.position.set(x, 1, z);
      scene.add(light);
      return light;
    });
    this.on = false;
    this.fade = 0;
    this.amount = 0;
    this.weight = 0;
    this.clock = 0;
    this.lastBeat = -1;
    this.spinning = false;
    this.move = { x: 0, lift: 0, yaw: 0, roll: 0 };
  }

  set(on) {
    this.on = on;
    if (on) startDisco();
    else stopDisco();
  }

  update(dt) {
    const { i } = this;
    if (this.on) this.fade += (1 - this.fade) * (1 - Math.exp(-dt * 2));
    else this.fade = Math.max(0, this.fade - dt / DISCO_FADE);
    this.amount = this.fade * this.fade * (3 - 2 * this.fade);
    if (!this.on && !this.fade) {
      if (this.mirror.holder.visible) {
        this.lights.forEach((l) => {
          // eslint-disable-next-line no-param-reassign
          l.intensity = 0;
        });
        Object.assign(i.pose, { x: 0, lift: 0, yaw: 0, roll: 0 });
        this.backdrop.setDisco(0, 0, 0);
        this.mirror.holder.visible = false;
        this.drop = 1;
        this.dropVelocity = 0;
      }
      return;
    }
    this.clock += dt;
    const beat = discoBeat() ?? (this.clock * DISCO_BPM) / 60;
    const kick = Math.exp(-(beat % 1) * 6);
    const sweep = Math.sin((beat * Math.PI) / 8);
    const [pink, cyan, spot] = this.lights;
    pink.position.set(-3.5 + sweep, 1 + sweep * 1.5, -2.5);
    cyan.position.set(3.5 + sweep, 1 - sweep * 1.5, -2.5);
    pink.intensity = this.amount * (22 + kick * 40);
    cyan.intensity = this.amount * (22 + (1 - kick) * 30);
    spot.intensity = this.amount * kick * 10;
    this.updateBall(dt, beat, kick);

    const free =
      i.phase === "live" &&
      !i.grab &&
      !i.carrying &&
      !i.pointer.pressed &&
      !reducedMotion.matches;
    this.weight += ((free ? 1 : 0) - this.weight) * (1 - Math.exp(-dt * 3));
    const index = Math.floor(beat);
    if (index !== this.lastBeat && index >= 0) {
      this.lastBeat = index;
      if (index % 16 === 15) this.spinning = this.on && this.weight > 0.95;
      if (free && this.on) this.hit(index);
    }
    const move = choreography(beat, this.move);
    const w = this.weight * this.amount;
    i.pose.x = move.x * w;
    i.pose.lift = move.lift * w;
    i.pose.roll = move.roll * w;
    i.pose.yaw = this.spinning && beat % 16 >= 15 ? move.yaw : move.yaw * w;
  }

  updateBall(dt, beat, kick) {
    const { holder, ball, glints } = this.mirror;
    const cam = this.camera;
    holder.visible = true;
    this.dropVelocity +=
      (((this.on ? 0 : 1 - this.amount) - this.drop) * 60 -
        this.dropVelocity * 7) *
      dt;
    this.drop += this.dropVelocity * dt;
    const depth = cam.userData.baseZ - BALL_DEPTH;
    const half = Math.tan((cam.fov * Math.PI) / 360) * depth;
    const still = reducedMotion.matches ? 0 : 1;
    const swing = Math.sin((beat * Math.PI) / 2) * 0.12 * still;
    holder.position.set(
      Math.sin(swing) * 0.6,
      half * 0.7 + this.drop * half * 0.8 - kick * 0.04 * still,
      BALL_DEPTH,
    );
    holder.rotation.z = swing;
    ball.rotation.y += dt * (0.9 + kick * 2.5) * (still || 0.2);
    ball.rotation.x = 0.25;
    const pulse = 1 + kick * 0.05 * still;
    ball.scale.setScalar(pulse);

    const index = Math.floor(beat * 2);
    if (index !== this.lastGlintBeat) {
      this.lastGlintBeat = index;
      glints.forEach((g) => {
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * BALL_RADIUS * 0.85;
        g.position.set(Math.cos(a) * r, Math.sin(a) * r, BALL_RADIUS * 0.9);
        // eslint-disable-next-line no-param-reassign
        g.userData.power = Math.random() < 0.6 ? Math.random() : 0;
        g.material.rotation = Math.random() * 0.8;
      });
    }
    glints.forEach((g) => {
      const size = 0.25 + g.userData.power * 0.5 * (0.4 + kick);
      g.scale.setScalar(size);
      // eslint-disable-next-line no-param-reassign
      g.material.opacity = this.amount * g.userData.power * (0.3 + kick * 0.7);
    });

    this.screen.copy(holder.position).project(cam);
    this.backdrop.setDisco(
      this.amount,
      kick,
      beat,
      this.screen.x * 0.5 * cam.aspect,
      this.screen.y * 0.5,
    );
  }

  hit(n) {
    const { i } = this;
    const b = n % 16;
    i.wake();
    i.kickVelocity.y -= 0.12;
    if (b < 4 || b >= 12) {
      const side = n % 2 ? 1 : -1;
      const cheek = i.cheekPoint(side, -0.35);
      if (cheek) i.peach.addJiggle(cheek.point, UP, b < 4 ? 0.1 : 0.05, 1);
    } else if (b >= 9 && b < 11) {
      i.squashVelocity.x += 1.2;
      i.squashAxis.set(0, 1);
      i.wobbleAll(0.04);
    } else if (b === 11) {
      i.squashVelocity.x -= 1;
      i.squashAxis.set(0, 1);
    }
    if (n % 32 === 0) this.talk.say("disco", 0.5);
  }
}

export class Wild {
  constructor({ scene, camera, interaction, talk, backdrop }) {
    Object.assign(this, { i: interaction, talk });
    this.buzzer = new Buzzer(interaction);
    this.disco = new Disco(scene, camera, interaction, talk, backdrop);
    this.tool = "hand";
  }

  warmups() {
    return [this.disco.mirror.holder];
  }

  set(key, value) {
    if (key === "disco") this.disco.set(value);
    if (key === "tool") {
      this.tool = value;
      if (this.i.phase === "live") this.talk.say(value);
    }
  }

  update(delta, realDelta) {
    this.buzzer.update(delta, this.tool === "buzz");
    this.disco.update(realDelta);
  }
}
