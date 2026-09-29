import {
  FramebufferTexture,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
} from "three";
import { clamp, reducedMotion } from "./util";

const RING_TIME = 0.9;
const RING_END = 1.6;

const material = new ShaderMaterial({
  uniforms: {
    tFrame: { value: null },
    uCenter: { value: new Vector2(0.5, 0.5) },
    uAspect: { value: 1 },
    uRing: { value: 0 },
    uRingPower: { value: 0 },
    uSplit: { value: 0 },
    uHaze: { value: 0 },
    uFlash: { value: 0 },
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tFrame;
    uniform vec2 uCenter;
    uniform float uAspect;
    uniform float uRing;
    uniform float uRingPower;
    uniform float uSplit;
    uniform float uHaze;
    uniform float uFlash;
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vec2 d = (vUv - uCenter) * vec2(uAspect, 1.0);
      float r = length(d);
      vec2 dir = r > 1e-4 ? d / r : vec2(0.0);
      float w = 0.05 + uRing * 0.08;
      float ringOffset = (r - uRing) / w;
      float band = exp(-ringOffset * ringOffset) * uRingPower;
      vec2 uv = vUv - dir / vec2(uAspect, 1.0) * band * 0.045;
      float near = 1.0 - smoothstep(0.1, 0.75, r);
      uv += vec2(sin(vUv.y * 38.0 + uTime * 7.0), cos(vUv.x * 31.0 + uTime * 6.0)) * 0.003 * uHaze * near;
      vec2 split = dir / vec2(uAspect, 1.0) * (uSplit * (0.002 + 0.012 * r) + band * 0.008);
      vec3 col = vec3(
        texture2D(tFrame, uv + split).r,
        texture2D(tFrame, uv).g,
        texture2D(tFrame, uv - split).b
      );
      col += vec3(1.0, 0.72, 0.82) * band * 0.2;
      col *= 1.0 - uHaze * 0.3 * smoothstep(0.35, 1.1, r);
      col = mix(col, vec3(1.0, 0.95, 0.97), uFlash);
      gl_FragColor = vec4(col, 1.0);
    }
  `,
  depthTest: false,
  depthWrite: false,
});

export class Shock {
  constructor(renderer, interaction) {
    Object.assign(this, { renderer, i: interaction });
    this.scene = new Scene();
    const quad = new Mesh(new PlaneGeometry(2, 2), material);
    quad.frustumCulled = false;
    this.scene.add(quad);
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.ring = RING_END;
    this.power = 0;
    this.flash = 0;
    this.split = 0;
    this.haze = 0;
    this.time = 0;
    this.frame = null;
    this.size = new Vector2();
    this.origin = new Vector2();
    interaction.on("snap", () =>
      this.blast(1, interaction.toScreen(interaction.sliceCenter)),
    );
  }

  blast(power, at = null) {
    if (reducedMotion.matches) {
      this.flash = Math.max(this.flash, 0.35 * power);
      return;
    }
    const u = material.uniforms;
    const screen = at || this.i.toScreen(this.i.group.position);
    u.uCenter.value.set(
      screen.x / window.innerWidth,
      1 - screen.y / window.innerHeight,
    );
    this.ring = 0;
    this.power = power;
    this.flash = Math.max(this.flash, 0.55 * power);
    this.split = Math.max(this.split, 0.9 * power);
  }

  update(delta) {
    this.time += delta;
    const { i } = this;
    const heat = i.heat / 100;
    let charge = 0;
    if (i.phase === "charging")
      charge = Math.min(1, i.phaseTime / i.chargeTime);
    const still = reducedMotion.matches ? 0 : 1;
    const haze = Math.max(0, (heat - 0.65) / 0.35) * 0.6 + charge;
    this.haze += (haze * still - this.haze) * (1 - Math.exp(-delta * 4));
    const tearing = i.slicing && !i.snapped;
    if (tearing) charge = 1;
    const tear = tearing ? clamp(i.halvesAge / 0.42, 0, 1) : 0;
    const split = charge * 1.2 + tear * 0.6 + Math.max(0, heat - 0.8) * 2;
    this.split = Math.max(split * still, this.split - delta * 2.5);
    this.flash = Math.max(0, this.flash - delta * 3.5);
    this.ring = Math.min(RING_END, this.ring + delta / RING_TIME);
    if (i.phase === "charging" && this.ring >= RING_END) {
      const at = i.toScreen(i.group.position);
      material.uniforms.uCenter.value.set(
        at.x / window.innerWidth,
        1 - at.y / window.innerHeight,
      );
    }
  }

  get active() {
    return (
      this.haze > 0.01 ||
      this.split > 0.01 ||
      this.flash > 0.01 ||
      this.ring < RING_END
    );
  }

  capture() {
    this.renderer.getDrawingBufferSize(this.size);
    const { frame, size } = this;
    if (
      !frame ||
      frame.image.width !== size.x ||
      frame.image.height !== size.y
    ) {
      frame?.dispose();
      this.frame = new FramebufferTexture(size.x, size.y);
      this.frame.minFilter = LinearFilter;
      this.frame.magFilter = LinearFilter;
    }
    this.renderer.copyFramebufferToTexture(this.origin, this.frame);
    return this.frame;
  }

  render() {
    if (!this.active) return;
    const u = material.uniforms;
    u.tFrame.value = this.capture();
    u.uAspect.value = window.innerWidth / window.innerHeight;
    u.uRing.value = this.ring * 1.2;
    u.uRingPower.value =
      this.ring < RING_END ? this.power * (1 - this.ring / RING_END) : 0;
    u.uSplit.value = this.split;
    u.uHaze.value = this.haze;
    u.uFlash.value = this.flash;
    u.uTime.value = this.time;
    const { autoClear } = this.renderer;
    this.renderer.autoClear = false;
    this.renderer.render(this.scene, this.camera);
    this.renderer.autoClear = autoClear;
  }
}
