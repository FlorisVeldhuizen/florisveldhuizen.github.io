import {
  AdditiveBlending,
  Color,
  Mesh,
  PlaneGeometry,
  Quaternion,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";
import { twinkleTexture } from "./idle/scenery/shapes";
import { reducedMotion } from "./util";

const ringGrow = (t) => 1 - (1 - t) ** 3;
const ringFade = (t) => (1 - t) ** 1.5;

export const RING_GLSL = `
  float ringCrest(float off, float width) {
    float k = off / (off > 0.0 ? width * 0.45 : width * 1.4);
    return exp(-k * k);
  }
`;

const VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv * 2.0 - 1.0;
    #ifdef BILLBOARD
      vec4 view = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
      view.xy += position.xy * vec2(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz));
      gl_Position = projectionMatrix * view;
    #else
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    #endif
  }
`;

const FRAGMENT = `
  uniform vec3 uColor;
  uniform float uProgress;
  uniform float uOpacity;
  varying vec2 vUv;
  ${RING_GLSL}
  void main() {
    float r = length(vUv);
    float t = uProgress;
    float front = ringCrest(r - 0.88, mix(0.18, 0.07, t));
    float core = exp(-r * r * 6.0) * 0.4 * (1.0 - t) * (1.0 - t);
    float glow = (front + core) * uOpacity;
    vec3 col = mix(uColor, vec3(1.0), pow(front, 4.0) * 0.45);
    gl_FragColor = vec4(col, glow);
  }
`;

export function ringMaterial(color, { billboard = false, onTop = false } = {}) {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color(color) },
      uProgress: { value: 0 },
      uOpacity: { value: 0 },
    },
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    defines: billboard ? { BILLBOARD: "" } : {},
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false,
    depthTest: !onTop,
  });
}

export function showRing(mesh, t, from, to, opacity) {
  const u = mesh.material.uniforms;
  // eslint-disable-next-line no-param-reassign
  mesh.visible = t < 1;
  mesh.scale.setScalar(from + ringGrow(t) * (to - from));
  u.uProgress.value = t;
  u.uOpacity.value = ringFade(t) * opacity;
}

const POOL = 3;
const Z = new Vector3(0, 0, 1);
const MIN_FACING = 0.7;

const SPARKS = 3;
const SPARK_LIFE = 0.3;

const glow = (map, color) =>
  new SpriteMaterial({
    map,
    color,
    blending: AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    transparent: true,
    opacity: 0,
  });

export class SkinRings {
  constructor(scene, interaction) {
    this.peach = interaction.peach;
    this.camera = interaction.camera;
    this.view = new Vector3();
    this.turn = new Quaternion();
    this.n = new Vector3();
    this.out = new Vector3();
    this.side = new Vector3();
    const twinkle = twinkleTexture();
    this.slots = Array.from({ length: POOL }, () => {
      const ring = new Mesh(
        new PlaneGeometry(1, 1),
        ringMaterial(0xffb8c8, { onTop: true }),
      );
      const flash = new Sprite(glow(twinkle, 0xffc8d0));
      const sparks = Array.from({ length: SPARKS }, () => {
        const spark = new Sprite(glow(twinkle, 0xffe0d0));
        spark.userData.v = new Vector3();
        return spark;
      });
      [ring, flash, ...sparks].forEach((o) => {
        /* eslint-disable no-param-reassign */
        o.renderOrder = 3;
        o.visible = false;
        /* eslint-enable no-param-reassign */
        scene.add(o);
      });
      return {
        ring,
        flash,
        sparks,
        at: new Vector3(),
        centre: new Vector3(),
        age: 1,
        life: 1,
        size: 1,
        power: 0,
      };
    });
    interaction.on("snapback", (e) => this.add(e));
  }

  add({ local, normal, direction, amount }) {
    if (reducedMotion.matches) return;
    const slot = this.slots.reduce((a, b) =>
      a.age / a.life >= b.age / b.life ? a : b,
    );
    const { matrixWorld } = this.peach.mesh;
    const n = this.n.copy(normal).transformDirection(matrixWorld);
    const centre = this.peach.mesh.getWorldPosition(slot.centre);
    const at = slot.at.copy(local).applyMatrix4(matrixWorld);
    this.faceCamera(at, n, centre);
    at.addScaledVector(n, 0.03);
    slot.ring.position.copy(at);
    slot.ring.quaternion.setFromUnitVectors(Z, n);
    slot.flash.position.copy(at).addScaledVector(n, 0.15);
    const out = this.out.copy(direction).addScaledVector(n, -direction.dot(n));
    if (out.lengthSq() < 1e-6) out.set(1, 0, 0).addScaledVector(n, -n.x);
    out.normalize();
    this.side.crossVectors(n, out);
    slot.sparks.forEach((spark, k) => {
      const a = ((k + Math.random() * 0.6 - 0.3) / SPARKS - 0.5) * 2.2;
      spark.userData.v
        .copy(out)
        .multiplyScalar(Math.cos(a))
        .addScaledVector(this.side, Math.sin(a))
        .multiplyScalar((1.5 + Math.random()) * (0.6 + amount))
        .addScaledVector(n, 0.8);
      spark.position.copy(at).addScaledVector(n, 0.08);
      // eslint-disable-next-line no-param-reassign
      spark.visible = amount > 0.7;
    });
    Object.assign(slot, {
      age: 0,
      life: 0.4 + amount * 0.2,
      size: 0.5 + amount * 1.1,
      power: 0.35 + amount * 0.35,
    });
  }

  // Edge spots face up or down, so slide the ring toward the front like a paddle hit.
  faceCamera(at, n, centre) {
    const view = this.view.copy(this.camera.position).sub(at).normalize();
    const facing = n.dot(view);
    if (facing >= MIN_FACING) return;
    const target = this.side.copy(n).addScaledVector(view, -facing).normalize();
    target
      .multiplyScalar(Math.sqrt(1 - MIN_FACING ** 2))
      .addScaledVector(view, MIN_FACING);
    this.turn.setFromUnitVectors(n, target);
    at.sub(centre).applyQuaternion(this.turn).add(centre);
    n.copy(target);
  }

  update(delta) {
    const now = this.peach.mesh?.getWorldPosition(this.view);
    this.slots.forEach((slot) => {
      if (slot.age >= slot.life) return;
      slot.ring.position.copy(slot.at).add(now).sub(slot.centre);
      /* eslint-disable no-param-reassign */
      slot.age = Math.min(slot.life, slot.age + delta);
      const { age, flash } = slot;
      showRing(
        slot.ring,
        age / slot.life,
        slot.size * 0.25,
        slot.size,
        slot.power,
      );
      flash.scale.setScalar((0.2 + Math.min(1, age / 0.05) * 0.35) * slot.size);
      flash.material.opacity = (1 - Math.min(1, age / 0.14)) * 0.4;
      flash.visible = age < 0.14;
      const k = Math.min(1, age / SPARK_LIFE);
      slot.sparks.forEach((spark) => {
        if (!spark.visible) return;
        spark.userData.v.multiplyScalar(Math.exp(-delta * 7));
        spark.position.addScaledVector(spark.userData.v, delta);
        spark.scale.setScalar(0.12 * (1 - k * 0.6));
        spark.material.opacity = (1 - k) * 0.7;
        spark.visible = k < 1;
      });
      /* eslint-enable no-param-reassign */
    });
  }
}
