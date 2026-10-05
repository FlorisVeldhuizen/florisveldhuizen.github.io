import {
  AdditiveBlending,
  Color,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
} from "three";
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

export class SkinRings {
  constructor(interaction) {
    this.peach = interaction.peach;
    this.rings = Array.from({ length: POOL }, () => {
      const ring = new Mesh(
        new PlaneGeometry(1, 1),
        ringMaterial(0xffb8c8, { onTop: true }),
      );
      ring.renderOrder = 3;
      ring.visible = false;
      ring.userData = { age: 1, life: 1, size: 1, power: 0 };
      return ring;
    });
    interaction.on("snapback", (e) => this.add(e));
  }

  add({ local, normal, amount }) {
    if (reducedMotion.matches) return;
    const ring = this.rings.reduce((a, b) =>
      a.userData.age / a.userData.life >= b.userData.age / b.userData.life
        ? a
        : b,
    );
    const scale = this.peach.worldScale();
    this.peach.mesh.add(ring);
    ring.position.copy(local).addScaledVector(normal, 0.03 / scale);
    ring.quaternion.setFromUnitVectors(Z, normal);
    Object.assign(ring.userData, {
      age: 0,
      life: 0.4 + amount * 0.2,
      size: (0.5 + amount * 1.1) / scale,
      power: 0.35 + amount * 0.35,
    });
  }

  update(delta) {
    this.rings.forEach((ring) => {
      const d = ring.userData;
      if (d.age >= d.life) return;
      d.age = Math.min(d.life, d.age + delta);
      showRing(ring, d.age / d.life, d.size * 0.25, d.size, d.power);
    });
  }
}
