import {
  AdditiveBlending,
  Color,
  Group,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  Plane,
  Raycaster,
  Sprite,
  SpriteMaterial,
  Vector2,
  Vector3,
} from "three";
import { el, animate } from "./dom";
import { softTexture, twinkleTexture } from "./scenery/shapes";
import { format } from "./numbers";
import { playNotes } from "../audio";
import { reducedMotion } from "../util";

const LIFE = 13;
const DEPTH = 2.2;
const PEACH_RADIUS = 1.7;
const SIZE = 0.2;
const FIRST = [45, 90];
const EVERY = [90, 240];

const rand = ([lo, hi]) => lo + Math.random() * (hi - lo);

export class GoldenPeach {
  constructor(game, layout, popups, scene, camera, interaction) {
    Object.assign(this, { game, layout, popups, camera, i: interaction });
    this.timer = rand(FIRST);
    this.live = null;
    this.holder = new Group();
    this.holder.visible = false;
    scene.add(this.holder);
    this.glow = new Sprite(
      new SpriteMaterial({
        map: softTexture(),
        color: 0xffc050,
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0.45,
      }),
    );
    this.glow.scale.setScalar(1.3);
    this.holder.add(this.glow);
    const twinkle = twinkleTexture();
    this.twinkles = Array.from({ length: 3 }, () => {
      const s = new Sprite(
        new SpriteMaterial({
          map: twinkle,
          blending: AdditiveBlending,
          depthWrite: false,
          transparent: true,
        }),
      );
      this.holder.add(s);
      return s;
    });
    this.trail = Array.from({ length: 12 }, () => {
      const s = new Sprite(
        new SpriteMaterial({
          map: twinkle,
          color: 0xffe0a0,
          blending: AdditiveBlending,
          depthWrite: false,
          transparent: true,
          opacity: 0,
        }),
      );
      s.userData.age = 9;
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
    const setHover = (on) => {
      if (on && !this.hovered && this.live) {
        playNotes([1568, 2093], { gap: 0.05, length: 0.3, volume: 0.03 });
        this.bounce = 0;
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
        color: 0xffc94a,
        metalness: 1,
        roughness: 0.2,
        clearcoat: 0.6,
        envMapIntensity: 1.6,
        emissive: new Color(0x5a3000),
      }),
    );
    mesh.matrixAutoUpdate = false;
    mesh.matrix
      .copy(new Matrix4().copy(this.i.group.matrixWorld).invert())
      .multiply(source.matrixWorld);
    this.gold = mesh;
    this.holder.add(mesh);
    return this.holder;
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
    this.despawn();
    this.flash = 0;
    this.holder.visible = true;
    this.gold.visible = false;
    this.twinkles.forEach((s) => {
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
    this.sparkle(x, y);
  }

  sparkle(x, y) {
    if (reducedMotion.matches) return;
    for (let n = 0; n < 14; n += 1) {
      const dot = el("i", "sparkle", this.popups.layer);
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      const a = (n / 14) * Math.PI * 2;
      const d = 50 + Math.random() * 60;
      animate(
        dot,
        [
          { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
          {
            opacity: 0,
            transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(0.3)`,
          },
        ],
        {
          duration: 700 + Math.random() * 300,
          easing: "cubic-bezier(.1,.7,.3,1)",
        },
      ).finished.then(() => dot.remove());
    }
  }

  despawn() {
    this.live = null;
    this.el.hidden = true;
    this.holder.visible = false;
    this.hovered = false;
    this.hover = 0;
    this.press = 0;
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

  fadeTrail(delta) {
    this.trail.forEach((s) => {
      // eslint-disable-next-line no-param-reassign
      s.userData.age += delta;
      const k = s.userData.age / 0.9;
      // eslint-disable-next-line no-param-reassign
      s.material.opacity = k < 1 ? (1 - k) * 0.8 : 0;
      s.scale.setScalar(0.12 + (1 - Math.min(1, k)) * 0.12);
      s.position.y -= delta * 0.15;
    });
  }

  updateFlash(delta) {
    this.flash += delta;
    const k = this.flash / 0.5;
    if (k >= 1) {
      this.flash = -1;
      this.holder.visible = false;
      this.gold.visible = true;
      this.twinkles.forEach((s) => {
        // eslint-disable-next-line no-param-reassign
        s.visible = true;
      });
      this.glow.scale.setScalar(1.3);
      return;
    }
    this.glow.scale.setScalar(3 + k * 9);
    this.glow.material.opacity = 1 - k;
  }

  update(delta) {
    this.fadeTrail(delta);
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
    this.ndc.set(
      (x / window.innerWidth) * 2 - 1,
      -(y / window.innerHeight) * 2 + 1,
    );
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
    h.rotation.set(
      Math.sin(g.age * 0.8) * 0.2 * motion,
      (Math.sin(g.age * 0.9) * 0.45 + Math.sin(g.age * 7) * 0.2 * this.hover) *
        motion,
      Math.sin(g.age * 1.6) * 0.15 * motion,
    );
    this.gold.material.emissiveIntensity =
      1 + this.hover * 3.5 + this.press * 3;
    this.glow.material.opacity = 0.35 + Math.sin(g.age * 4) * 0.1;
    this.trailTimer -= delta;
    if (this.trailTimer <= 0 && fade > 0.5) {
      this.trailTimer = 0.09;
      const s = this.trail.find((item) => item.userData.age > 0.9);
      if (s) {
        s.userData.age = 0;
        s.position
          .copy(h.position)
          .add(
            this.at.set(
              (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5) * 0.3,
              -0.1,
            ),
          );
      }
    }
    this.chimeTimer -= delta;
    if (this.chimeTimer <= 0) {
      this.chimeTimer = 3.5;
      playNotes([2093, 2637], { gap: 0.09, length: 0.5, volume: 0.018 });
    }
    this.twinkles.forEach((s, n) => {
      const a = g.age * (1.2 + n * 0.4) + (n * Math.PI * 2) / 3;
      s.position.set(
        Math.cos(a) * 2.4,
        Math.sin(a * 1.3) * 2.2,
        Math.sin(a) * 2.4,
      );
      const k = Math.abs(Math.sin(g.age * 2.2 + n * 1.7));
      s.scale.setScalar(0.4 + k * 0.9);
      // eslint-disable-next-line no-param-reassign
      s.material.opacity = k;
    });
  }
}
