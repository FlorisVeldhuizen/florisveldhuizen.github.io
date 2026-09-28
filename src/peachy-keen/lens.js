import {
  CanvasTexture,
  FramebufferTexture,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import { JUICE_LAYER, juiceMaterial, dropletPositionAt } from "./juice";

const LIFE = 4.2;
const CANVAS_WIDTH = 720;
const SURFACE = 0.2;
const FALLOFF = [0.5, 0.444, 0.311, 0.172, 0.075, 0];
const project = new Vector3();
const SPRITE_SIZE = 256;

function drawBlobSprite() {
  const sprite = document.createElement("canvas");
  sprite.width = SPRITE_SIZE;
  sprite.height = SPRITE_SIZE;
  const ctx = sprite.getContext("2d");
  const half = SPRITE_SIZE / 2;
  const g = ctx.createRadialGradient(half, half, 0, half, half, half);
  FALLOFF.forEach((v, i) => {
    g.addColorStop(i / (FALLOFF.length - 1), `rgb(${Math.round(v * 255)},0,0)`);
  });
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  return sprite;
}

const LensShader = {
  uniforms: {
    tDiffuse: { value: null },
    tDrops: { value: null },
    uTexel: { value: new Vector2() },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D tDrops;
    uniform vec2 uTexel;
    varying vec2 vUv;

    float heightAt(vec2 uv) {
      float f = texture2D(tDrops, uv).r;
      return sqrt(clamp((f - ${SURFACE.toFixed(2)}) / 0.3, 0.0, 1.0));
    }

    void main() {
      float f = texture2D(tDrops, vUv).r;
      if (f < ${(SURFACE - 0.01).toFixed(2)}) discard;
      vec4 base = texture2D(tDiffuse, vUv);
      float h = heightAt(vUv);
      float hx = heightAt(vUv + vec2(uTexel.x, 0.0)) - heightAt(vUv - vec2(uTexel.x, 0.0));
      float hy = heightAt(vUv + vec2(0.0, uTexel.y)) - heightAt(vUv - vec2(0.0, uTexel.y));
      vec3 n = normalize(vec3(-hx, -hy, 0.35));

      float body = smoothstep(${(SURFACE - 0.01).toFixed(2)}, ${(SURFACE + 0.02).toFixed(2)}, f);
      vec3 juice = vec3(1.0, 0.66, 0.46);
      vec3 refracted = texture2D(tDiffuse, vUv - n.xy * 0.035).rgb;
      vec3 col = refracted * mix(vec3(1.0), juice, 0.38 + h * 0.25) + juice * 0.025 * h;

      float edge = 1.0 - smoothstep(0.0, 0.35, h);
      col *= 1.0 - edge * 0.18;

      vec3 light = normalize(vec3(-0.45, 0.6, 0.66));
      float spec = pow(max(dot(n, light), 0.0), 120.0);
      float caustic = pow(max(dot(n, normalize(vec3(0.35, -0.7, 0.6))), 0.0), 8.0);
      col += spec * 1.2 + caustic * 0.1 * juice;

      gl_FragColor = vec4(mix(base.rgb, col, body), base.a);
    }
  `,
};

export class Lens {
  constructor(renderer, scene, camera) {
    Object.assign(this, { renderer, scene, camera });
    this.enabled = true;
    this.drops = [];
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.sprite = drawBlobSprite();
    this.texture = new CanvasTexture(this.canvas);

    this.material = new ShaderMaterial({
      uniforms: LensShader.uniforms,
      vertexShader: LensShader.vertexShader,
      fragmentShader: LensShader.fragmentShader,
      depthTest: false,
      depthWrite: false,
    });
    this.pass = this.material;
    this.overlay = new Scene();
    const quad = new Mesh(new PlaneGeometry(2, 2), this.material);
    quad.frustumCulled = false;
    this.overlay.add(quad);
    this.overlayCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.frame = null;
    this.size = new Vector2();
    this.origin = new Vector2();
    this.resize();
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = Math.round((CANVAS_WIDTH * h) / w);
    this.pass.uniforms.uTexel.value.set(
      1.5 / this.canvas.width,
      1.5 / this.canvas.height,
    );
    this.texture.dispose();
    this.texture = new CanvasTexture(this.canvas);
    this.pass.uniforms.tDrops.value = this.texture;
  }

  addDrop(x, y, r, delay = 0) {
    this.drops.push({
      x,
      y,
      r,
      age: -delay,
      vy: 0,
      seed: Math.random() * 10,
      trail: [],
      slides: r > 9 && Math.random() < 0.85,
      wait: 0.25 + Math.random() * 0.8,
    });
  }

  splat(worldPosition, worldVelocity, size = 1) {
    if (!this.enabled) return;
    project.copy(worldPosition).project(this.camera);
    const x = (project.x * 0.5 + 0.5) * this.canvas.width;
    const y = (0.5 - project.y * 0.5) * this.canvas.height;
    const r = Math.min(90, (5 + Math.random() ** 1.8 * 34) * size);
    this.addDrop(x, y, r);

    const dx = worldVelocity.x;
    const dy = -worldVelocity.y;
    const len = Math.hypot(dx, dy) || 1;
    const count = 2 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i += 1) {
      const along = r * (1.1 + i * 0.55 + Math.random() * 0.5);
      const spread = (Math.random() - 0.5) * r * 0.8;
      this.addDrop(
        x + (dx / len) * along - (dy / len) * spread,
        y + (dy / len) * along + (dx / len) * spread,
        Math.max(1.2, r * (0.28 - i * 0.03) * (0.5 + Math.random())),
      );
    }
  }

  splash(droplets, amount) {
    if (!this.enabled || droplets.length === 0) return;
    const count = 1 + Math.floor(amount * 4);
    for (let i = 0; i < count; i += 1) {
      const drop = droplets[Math.floor(Math.random() * droplets.length)];
      const delay = 0.18 + Math.random() * 0.27;
      dropletPositionAt(drop, delay, project).project(this.camera);
      this.addDrop(
        (project.x * 0.5 + 0.5) * this.canvas.width +
          (Math.random() - 0.5) * 30,
        (0.5 - project.y * 0.5) * this.canvas.height +
          (Math.random() - 0.5) * 30,
        1.5 + Math.random() ** 2 * 9 * amount,
        delay,
      );
    }
  }

  isActive() {
    return this.drops.length > 0;
  }

  update(delta) {
    if (this.drops.length === 0) return;
    const { ctx, canvas } = this;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";

    this.drops = this.drops.filter((d) => d.age < LIFE);
    this.drops.forEach((d) => {
      d.age += delta;
      if (d.age < 0) return;
      if (d.slides && d.age > d.wait) {
        d.vy = Math.min(18 + d.r * 2.2, d.vy + (20 + d.r) * delta);
        d.y += d.vy * delta;
        d.x += Math.sin(d.age * 2.3 + d.seed) * 6 * delta;
        d.r = Math.max(5, d.r - delta * 1.4);
        const last = d.trail[d.trail.length - 1];
        if (!last || d.y - last.y > 2) {
          d.trail.push({ x: d.x, y: d.y, r: d.r * 0.42 });
        }
      }
      d.trail.forEach((t) => {
        t.r -= delta * 1.6;
      });
      d.trail = d.trail.filter((t) => t.r > 0.8);

      const evaporate = Math.min(1, (LIFE - d.age) / 1.4);
      const grow = Math.min(1, 0.35 + d.age * 14);
      d.trail.forEach((t) => this.blob(t.x, t.y, t.r * evaporate));
      this.blob(d.x, d.y, d.r * grow * evaporate);
    });
    this.texture.needsUpdate = true;
  }

  blob(x, y, r) {
    if (r < 0.6) return;
    const reach = r * 1.8;
    this.ctx.drawImage(this.sprite, x - reach, y - reach, reach * 2, reach * 2);
  }

  captureFrame() {
    this.renderer.getDrawingBufferSize(this.size);
    if (
      !this.frame ||
      this.frame.image.width !== this.size.x ||
      this.frame.image.height !== this.size.y
    ) {
      this.frame?.dispose();
      this.frame = new FramebufferTexture(this.size.x, this.size.y);
      this.frame.minFilter = LinearFilter;
      this.frame.magFilter = LinearFilter;
      this.pass.uniforms.tDiffuse.value = this.frame;
    }
    this.renderer.copyFramebufferToTexture(this.origin, this.frame);
    return this.frame;
  }

  render(liquids) {
    this.renderer.render(this.scene, this.camera);
    const { autoClear } = this.renderer;
    this.renderer.autoClear = false;
    if (liquids.some((liquid) => liquid.isActive())) {
      const u = juiceMaterial.uniforms;
      u.tBehind.value = this.captureFrame();
      u.uResolution.value.copy(this.size);
      this.camera.layers.set(JUICE_LAYER);
      this.renderer.render(this.scene, this.camera);
      this.camera.layers.set(0);
    }
    if (this.drops.length > 0) {
      this.captureFrame();
      this.renderer.render(this.overlay, this.overlayCamera);
    }
    this.renderer.autoClear = autoClear;
  }
}
