import {
  AdditiveBlending,
  CanvasTexture,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Vector3,
} from "three";
import { moonTexture } from "./shapes";

const MOON_VERTEX = `
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const MOON_FRAGMENT = `
uniform sampler2D uMap;
uniform vec3 uLight;
varying vec2 vUv;
varying vec3 vNormal;
void main() {
  vec3 n = normalize(vNormal);
  float lit = smoothstep(-0.06, 0.14, dot(n, uLight));
  vec3 tex = texture2D(uMap, vUv).rgb;
  float rim = pow(1.0 - max(0.0, n.z), 3.0) * lit;
  vec3 col = tex * (0.05 + 0.95 * lit) + vec3(1.0, 0.75, 0.6) * rim * 0.35;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;

export function moonMesh() {
  const material = new ShaderMaterial({
    uniforms: {
      uMap: { value: moonTexture() },
      uLight: { value: new Vector3(0, 0, 1) },
    },
    vertexShader: MOON_VERTEX,
    fragmentShader: MOON_FRAGMENT,
  });
  return new Mesh(new SphereGeometry(1, 48, 32), material);
}

const lightWorld = new Vector3();

export function setMoonPhase(moon, phase, camera) {
  const angle = Math.PI * (1 - phase);
  lightWorld.set(-Math.sin(angle), 0.15, Math.cos(angle)).normalize();
  moon.material.uniforms.uLight.value
    .copy(lightWorld)
    .transformDirection(camera.matrixWorldInverse);
}

function streakTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, "rgba(255,240,255,0)");
  g.addColorStop(0.85, "rgba(255,230,250,0.8)");
  g.addColorStop(1, "rgba(255,255,255,1)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(250, 3);
  ctx.arc(250, 8, 5, -Math.PI / 2, Math.PI / 2);
  ctx.closePath();
  ctx.fill();
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export class ShootingStars {
  constructor(group) {
    const map = streakTexture();
    this.stars = Array.from({ length: 3 }, () => {
      const mesh = new Mesh(
        new PlaneGeometry(6, 0.2),
        new MeshBasicMaterial({
          map,
          transparent: true,
          opacity: 0,
          blending: AdditiveBlending,
          depthWrite: false,
          side: DoubleSide,
        }),
      );
      group.add(mesh);
      return { mesh, age: 9, from: new Vector3(), velocity: new Vector3() };
    });
    this.timer = 3;
  }

  update(delta, level) {
    if (level > 0) {
      this.timer -= delta;
      if (this.timer <= 0) {
        this.timer = (4 + Math.random() * 8) / (0.5 + level);
        const s = this.stars.find((x) => x.age > 1.2);
        if (s) {
          s.age = 0;
          s.from.set(-20 + Math.random() * 30, 6 + Math.random() * 10, -26);
          s.velocity.set(18 + Math.random() * 10, -(5 + Math.random() * 6), 0);
          s.mesh.rotation.z = Math.atan2(s.velocity.y, s.velocity.x);
        }
      }
    }
    this.stars.forEach((s) => {
      // eslint-disable-next-line no-param-reassign
      s.age += delta;
      const k = s.age / 1.2;
      s.mesh.visible = k < 1;
      if (k >= 1) return;
      s.mesh.position.copy(s.from).addScaledVector(s.velocity, s.age);
      // eslint-disable-next-line no-param-reassign
      s.mesh.material.opacity = Math.sin(Math.PI * k);
    });
  }
}
