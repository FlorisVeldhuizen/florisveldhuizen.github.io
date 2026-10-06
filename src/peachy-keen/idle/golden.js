import {
  AdditiveBlending,
  Color,
  Group,
  Matrix3,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  Plane,
  PlaneGeometry,
  PointLight,
  Raycaster,
  Sprite,
  SpriteMaterial,
  Vector2,
  Vector3,
} from "three";
import { el } from "./dom";
import { softTexture, twinkleTexture } from "./scenery/shapes";
import { ringMaterial, showRing } from "../rings";
import { format } from "./numbers";
import { playNotes } from "../audio";
import { reducedMotion, viewHeight } from "../util";

const LIFE = 13;
const DEPTH = 2.2;
const PEACH_RADIUS = 1.7;
const SIZE = 0.2;
const FIRST = [45, 90];
const EVERY = [90, 240];
const FLASH = 0.6;
const SPARKS = 6;
const SPIN = 2;
const KICK = 5;
const ROCK = 0.5;
const TAU = Math.PI * 2;
const GOLD = new Color(0xffc94a);
const LIGHT_GOLD = new Color(0xffe08c);
const SHINE = 2;

const rand = ([lo, hi]) => lo + Math.random() * (hi - lo);
const wrap = (a) => a - TAU * Math.round(a / TAU);
const additive = (map, extra) =>
  new SpriteMaterial({
    map,
    blending: AdditiveBlending,
    depthWrite: false,
    transparent: true,
    ...extra,
  });

export class GoldenPeach {
  constructor(game, layout, popups, scene, camera, interaction) {
    Object.assign(this, { game, layout, popups, camera, i: interaction });
    this.timer = rand(FIRST);
    this.live = null;
    this.holder = new Group();
    this.holder.visible = false;
    scene.add(this.holder);
    this.spin = new Group();
    this.holder.add(this.spin);
    this.glow = new Sprite(
      additive(softTexture(), { color: 0xffc050, opacity: 0.45 }),
    );
    this.glow.scale.setScalar(1.3);
    this.holder.add(this.glow);
    // In the scene, not the holder: hiding a light recompiles every lit material.
    this.shine = new PointLight(0xfff0c8, 0, 1.5);
    scene.add(this.shine);
    this.ring = new Mesh(
      new PlaneGeometry(1, 1),
      ringMaterial(0xffd27a, { billboard: true }),
    );
    this.ring.visible = false;
    this.holder.add(this.ring);
    const twinkle = twinkleTexture();
    this.spots = [];
    this.glints = Array.from({ length: 2 }, (_, n) => {
      const s = new Sprite(additive(twinkle, { depthTest: false, opacity: 0 }));
      s.renderOrder = 2;
      s.userData = { age: -n * 0.5, life: 0 };
      this.spin.add(s);
      return s;
    });
    this.dust = Array.from({ length: 12 + SPARKS }, () => {
      const s = new Sprite(additive(twinkle, { color: 0xffe0a0, opacity: 0 }));
      s.userData = { age: 9, life: 1, size: 0.12, drag: 0, fall: 0 };
      s.userData.v = new Vector3();
      scene.add(s);
      return s;
    });
    this.trailTimer = 0;
    this.chimeTimer = 2;
    this.ray = new Raycaster();
    this.plane = new Plane(new Vector3(0, 0, 1), -DEPTH);
    this.ndc = new Vector2();
    this.at = new Vector3();
    this.el = el("button", "ui golden", document.body);
    this.el.type = "button";
    this.el.setAttribute("aria-label", "Golden peach. Click it!");
    this.el.hidden = true;
    this.el.addEventListener("click", (e) => {
      e.stopPropagation();
      this.claim();
    });
    this.hovered = false;
    this.hover = 0;
    this.press = 0;
    this.flash = -1;
    this.bounce = 9;
    this.turn = 0;
    this.turnSpeed = 0;
    const setHover = (on) => {
      if (on && !this.hovered && this.live) {
        playNotes([1568, 2093], { gap: 0.05, length: 0.3, volume: 0.03 });
        this.bounce = 0;
        this.turnSpeed += KICK;
      }
      this.hovered = on;
    };
    this.el.addEventListener("pointerenter", () => setHover(true));
    this.el.addEventListener("pointerleave", () => setHover(false));
    this.el.addEventListener("focus", () => setHover(true));
    this.el.addEventListener("blur", () => setHover(false));
    this.el.addEventListener("pointerdown", () => {
      this.press = 1;
    });
    game.on("summon", () => this.spawn());
  }

  warmup(peach) {
    const source = peach.mesh;
    source.updateWorldMatrix(true, false);
    this.i.group.updateWorldMatrix(true, false);
    const mesh = new Mesh(
      source.geometry,
      new MeshPhysicalMaterial({
        color: GOLD,
        metalness: 1,
        roughness: 0.2,
        clearcoat: 0.6,
        envMapIntensity: 1.6,
        emissive: new Color(0x6b3a1c),
      }),
    );
    mesh.matrixAutoUpdate = false;
    mesh.matrix
      .copy(new Matrix4().copy(this.i.group.matrixWorld).invert())
      .multiply(source.matrixWorld);
    this.gold = mesh;
    this.spin.add(mesh);
    const { position, normal } = source.geometry.attributes;
    const turn = new Matrix3().getNormalMatrix(mesh.matrix);
    const facing = new Vector3();
    for (let n = 0; n < 4000 && this.spots.length < 300; n += 1) {
      const at = Math.floor(Math.random() * position.count);
      facing.fromBufferAttribute(normal, at).applyMatrix3(turn).normalize();
      if (facing.z > 0.6)
        this.spots.push(
          new Vector3()
            .fromBufferAttribute(position, at)
            .applyMatrix4(mesh.matrix),
        );
    }
  }

  spawn() {
    const rect = this.layout.stageRect();
    const i = this.i;
    const center = i.toScreen(i.group.position);
    const clear = PEACH_RADIUS * i.pixelsPerUnit(i.group.position) + 90;
    let x = 0;
    let y = 0;
    for (let tries = 0; tries < 30; tries += 1) {
      x = rect.x + rect.w * (0.1 + Math.random() * 0.8);
      y = rect.y + rect.h * (0.18 + Math.random() * 0.6);
      if (Math.hypot(x - center.x, y - center.y) > clear) break;
    }
    this.live = { age: 0, x, y, phase: Math.random() * Math.PI * 2 };
    this.el.hidden = false;
    playNotes([1318, 1760, 2637], { gap: 0.07, length: 0.4, volume: 0.035 });
  }

  claim() {
    if (!this.live) return;
    const { x, y } = this.position();
    this.claimedAt = { x, y };
    this.burst();
    this.despawn();
    this.flash = 0;
    this.holder.visible = true;
    this.glints.forEach((s) => {
      // eslint-disable-next-line no-param-reassign
      s.visible = false;
    });
    const result = this.game.golden();
    let text = "";
    if (result.effect === "lucky") text = `+${format(result.value)} juice`;
    else if (result.effect === "pits") text = `+${result.pits} pits`;
    else if (result.effect === "frenzy") text = "All juice ×7";
    else if (result.effect === "storm") text = "Smacks ×777. Go go go!";
    else if (result.effect === "spill") text = "Fully oiled. Oil ×3";
    else if (result.effect === "wave") text = "The heat won't go down";
    else if (result.effect === "showcase") text = "One helper goes wild";
    this.popups.big(x, y, result.title, text);
    playNotes([784, 988, 1175, 1568], { gap: 0.06, length: 0.5, volume: 0.07 });
  }

  emit(size, life, drag, fall) {
    const s = this.dust.find((item) => item.userData.age > item.userData.life);
    if (s) Object.assign(s.userData, { age: 0, size, life, drag, fall });
    return s;
  }

  burst() {
    if (reducedMotion.matches) return;
    const h = this.holder;
    for (let n = 0; n < SPARKS; n += 1) {
      const s = this.emit(0.16, 0.6 + Math.random() * 0.2, 3, 0.5);
      if (!s) return;
      const a = ((n + Math.random() * 0.6) / SPARKS) * Math.PI * 2;
      const speed = 0.8 + Math.random() * 0.5;
      s.userData.v.set(Math.cos(a) * speed, Math.sin(a) * speed, 0);
      s.position
        .copy(s.userData.v)
        .multiplyScalar(0.12)
        .add(h.position)
        .setZ(h.position.z + h.scale.x * PEACH_RADIUS);
    }
  }

  despawn() {
    this.live = null;
    this.el.hidden = true;
    this.holder.visible = false;
    this.hovered = false;
    this.hover = 0;
    this.shine.intensity = 0;
    this.press = 0;
    this.turn = 0;
    this.turnSpeed = 0;
    const m = this.game.model;
    this.timer = rand(EVERY) / m.goldenRate;
  }

  position() {
    const g = this.live;
    const still = reducedMotion.matches ? 0 : 1;
    return {
      x: g.x + Math.sin(g.age * 0.7 + g.phase) * 30 * still,
      y: g.y + Math.sin(g.age * 1.1 + g.phase * 2) * 18 * still,
    };
  }

  fadeDust(delta) {
    this.dust.forEach((s) => {
      const d = s.userData;
      d.age += delta;
      const k = Math.min(1, d.age / d.life);
      // eslint-disable-next-line no-param-reassign
      s.material.opacity = (1 - k) * 0.6;
      s.scale.setScalar(d.size * (1 - k * 0.5));
      d.v.multiplyScalar(Math.exp(-delta * d.drag));
      d.v.y -= delta * d.fall;
      s.position.addScaledVector(d.v, delta);
    });
  }

  updateGlints(delta) {
    this.glints.forEach((s) => {
      const d = s.userData;
      d.age += delta;
      if (d.age >= d.life) {
        d.age = 0;
        d.life = 0.9 + Math.random() * 0.5;
        s.position.copy(
          this.spots[Math.floor(Math.random() * this.spots.length)],
        );
      }
      const k = d.age > 0 ? Math.sin((d.age / d.life) * Math.PI) : 0;
      s.scale.setScalar(0.3 + k * 0.8);
      // eslint-disable-next-line no-param-reassign
      s.material.opacity = k * this.hover;
    });
  }

  updateFlash(delta) {
    this.flash += delta;
    const t = this.flash;
    if (t >= FLASH) {
      this.flash = -1;
      this.holder.visible = false;
      this.ring.visible = false;
      this.spin.scale.setScalar(1);
      this.glints.forEach((s) => {
        // eslint-disable-next-line no-param-reassign
        s.visible = true;
      });
      this.glow.scale.setScalar(1.3);
      return;
    }
    const pop = t < 0.08 ? 1 + (t / 0.08) * 0.3 : 1.3 * (1 - (t - 0.08) / 0.18);
    this.spin.scale.setScalar(Math.max(0.001, pop));
    this.gold.material.emissiveIntensity = 6;
    const out = 1 - (1 - t / FLASH) ** 3;
    this.glow.scale.setScalar(2 + out * 4);
    this.glow.material.opacity = Math.max(0, 1 - t / 0.3) ** 2;
    showRing(this.ring, t / FLASH, 2, 10, 0.6);
  }

  updateTurn(delta, age) {
    if (this.hovered) {
      this.turnSpeed += (SPIN - this.turnSpeed) * (1 - Math.exp(-delta * 3));
    } else {
      // The spring grips only after friction slows the spin, so it coasts before it settles.
      const grip = Math.max(0, 1 - Math.abs(this.turnSpeed) / 5);
      const off = wrap(this.turn - Math.sin(age * 1.3) * ROCK);
      this.turnSpeed +=
        (-off * 14 * grip - this.turnSpeed * (1.6 + 3.4 * grip)) * delta;
    }
    this.turn = wrap(this.turn + this.turnSpeed * delta);
  }

  update(delta) {
    this.fadeDust(delta);
    if (this.flash >= 0) this.updateFlash(delta);
    if (!this.live) {
      if (this.game.model.noGolden) return;
      this.timer -= delta;
      if (this.timer <= 0) this.spawn();
      return;
    }
    const g = this.live;
    g.age += delta;
    if (g.age >= LIFE) {
      this.despawn();
      return;
    }
    const { x, y } = this.position();
    const fade = Math.min(1, g.age / 0.6, (LIFE - g.age) / 1.5);
    this.el.style.translate = `${x}px ${y}px`;
    this.ndc.set((x / window.innerWidth) * 2 - 1, -(y / viewHeight()) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.camera);
    if (!this.ray.ray.intersectPlane(this.plane, this.at)) return;
    const h = this.holder;
    h.visible = Boolean(this.gold);
    h.position.copy(this.at);
    const motion = reducedMotion.matches ? 0 : 1;
    this.hover +=
      ((this.hovered ? 1 : 0) - this.hover) * (1 - Math.exp(-delta * 12));
    this.press *= Math.exp(-delta * 9);
    this.bounce += delta;
    const wobble =
      Math.sin(this.bounce * 22) * Math.exp(-this.bounce * 5) * 0.14;
    const pop =
      fade *
      (1 + Math.sin(g.age * 3) * 0.03) *
      (1 + (this.hover * 0.15 + wobble - this.press * 0.2) * motion);
    h.scale.setScalar(SIZE * Math.max(0.001, pop));
    this.updateTurn(delta, g.age);
    const fast = Math.min(1, Math.abs(this.turnSpeed) / SPIN);
    this.spin.rotation.set(
      (Math.sin(g.age * 0.8) * 0.2 * (1 - fast) - fast * 0.25) * motion,
      this.turn * motion,
      Math.sin(g.age * 1.6) * 0.15 * motion,
    );
    const { material } = this.gold;
    material.emissiveIntensity = 0.6 + this.hover * 0.4 + this.press * 0.6;
    material.envMapIntensity = 1.6 + this.hover * 0.8;
    material.roughness = 0.2 - this.hover * 0.08;
    material.color.lerpColors(GOLD, LIGHT_GOLD, this.hover);
    this.shine.intensity = this.hover * SHINE;
    const orbit = g.age * 1.4;
    this.shine.position
      .set(Math.cos(orbit) * 2, Math.sin(orbit) * 1.5, 2.5)
      .multiplyScalar(h.scale.x)
      .add(h.position);
    this.glow.material.opacity = 0.35 + Math.sin(g.age * 4) * 0.1;
    this.trailTimer -= delta;
    const s = this.trailTimer <= 0 && fade > 0.5 && this.emit(0.12, 0.9, 0, 0);
    if (s) {
      this.trailTimer = 0.16;
      const a = Math.random() * Math.PI * 2;
      const r = h.scale.x * PEACH_RADIUS * (0.6 + Math.random() * 0.4);
      s.userData.v.set(0, -0.15, 0);
      s.position.set(
        h.position.x + Math.cos(a) * r,
        h.position.y + Math.sin(a) * r,
        h.position.z + h.scale.x * PEACH_RADIUS,
      );
    }
    this.chimeTimer -= delta;
    if (this.chimeTimer <= 0) {
      this.chimeTimer = 3.5;
      playNotes([2093, 2637], { gap: 0.09, length: 0.5, volume: 0.018 });
    }
    this.updateGlints(delta);
  }
}
