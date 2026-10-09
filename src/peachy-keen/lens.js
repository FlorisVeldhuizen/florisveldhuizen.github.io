import {
  Box2,
  CanvasTexture,
  Color,
  CustomBlending,
  FramebufferTexture,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  LinearFilter,
  Mesh,
  OneFactor,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderTarget,
} from "three";
import { JUICE_LAYER, juiceMaterial, dropletPositionAt } from "./juice";
import { viewHeight, viewWidth } from "./util";

const LIFE = 4.2;
const OIL_LIFE = 6;
const CANVAS_WIDTH = 720;
const SURFACE = 0.2;
const FALLOFF = [0.5, 0.444, 0.311, 0.172, 0.075, 0];
const project = new Vector3();
const corner = new Vector2();
const clearColor = new Color();
const area = new Vector4();
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

// Blobs add up in a render target on the GPU: juice in red, oil in green.
const BlobShader = {
  uniforms: {
    tSprite: { value: null },
    uSize: { value: new Vector2(1, 1) },
  },
  vertexShader: `
    attribute vec4 blob;
    uniform vec2 uSize;
    varying vec2 vUv;
    varying float vOil;
    void main() {
      vUv = uv;
      vOil = blob.w;
      vec2 at = blob.xy + vec2(position.x, -position.y) * blob.z;
      gl_Position = vec4(at.x / uSize.x * 2.0 - 1.0, 1.0 - at.y / uSize.y * 2.0, 0.0, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tSprite;
    varying vec2 vUv;
    varying float vOil;
    void main() {
      float v = texture2D(tSprite, vUv).r;
      gl_FragColor = vec4(v * (1.0 - vOil), v * vOil, 0.0, 1.0);
    }
  `,
};

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
      vec4 d = texture2D(tDrops, uv);
      float f = d.r + d.g;
      return sqrt(clamp((f - ${SURFACE.toFixed(2)}) / 0.3, 0.0, 1.0));
    }

    void main() {
      vec4 drops = texture2D(tDrops, vUv);
      float f = drops.r + drops.g;
      if (f < ${(SURFACE - 0.01).toFixed(2)}) discard;
      vec4 base = texture2D(tDiffuse, vUv);
      float h = heightAt(vUv);
      float hx = heightAt(vUv + vec2(uTexel.x, 0.0)) - heightAt(vUv - vec2(uTexel.x, 0.0));
      float hy = heightAt(vUv + vec2(0.0, uTexel.y)) - heightAt(vUv - vec2(0.0, uTexel.y));
      vec3 n = normalize(vec3(-hx, -hy, 0.35));

      float body = smoothstep(${(SURFACE - 0.01).toFixed(2)}, ${(SURFACE + 0.02).toFixed(2)}, f);
      float oil = clamp(drops.g / f, 0.0, 1.0);
      vec3 juice = mix(vec3(1.0, 0.66, 0.46), vec3(1.0, 0.74, 0.22), oil);
      vec3 refracted = texture2D(tDiffuse, vUv - n.xy * mix(0.035, 0.06, oil)).rgb;
      vec3 col = refracted * mix(vec3(1.0), juice, 0.38 + h * 0.25 + oil * 0.2) + juice * mix(0.025, 0.08, oil) * h;

      float edge = 1.0 - smoothstep(0.0, 0.35, h);
      col *= 1.0 - edge * 0.18;

      vec3 light = normalize(vec3(-0.45, 0.6, 0.66));
      float spec = pow(max(dot(n, light), 0.0), mix(120.0, 60.0, oil));
      float caustic = pow(max(dot(n, normalize(vec3(0.35, -0.7, 0.6))), 0.0), 8.0);
      col += spec * mix(1.2, 1.6, oil) + caustic * mix(0.1, 0.25, oil) * juice;

      gl_FragColor = vec4(mix(base.rgb, col, body), base.a);
    }
  `,
};

export class Lens {
  constructor(renderer, scene, camera) {
    Object.assign(this, { renderer, scene, camera });
    this.enabled = true;
    this.onHit = null;
    this.drops = [];
    this.width = CANVAS_WIDTH;
    this.height = CANVAS_WIDTH;
    this.target = new WebGLRenderTarget(1, 1, { depthBuffer: false });
    const square = new PlaneGeometry(2, 2);
    this.blobGeometry = new InstancedBufferGeometry();
    this.blobGeometry.index = square.index;
    this.blobGeometry.setAttribute("position", square.attributes.position);
    this.blobGeometry.setAttribute("uv", square.attributes.uv);
    this.growBlobs(256);
    this.blobMaterial = new ShaderMaterial({
      uniforms: BlobShader.uniforms,
      vertexShader: BlobShader.vertexShader,
      fragmentShader: BlobShader.fragmentShader,
      blending: CustomBlending,
      blendSrc: OneFactor,
      blendDst: OneFactor,
      depthTest: false,
      depthWrite: false,
    });
    this.blobMaterial.uniforms.tSprite.value = new CanvasTexture(
      drawBlobSprite(),
    );
    this.blobScene = new Scene();
    const blobs = new Mesh(this.blobGeometry, this.blobMaterial);
    blobs.frustumCulled = false;
    this.blobScene.add(blobs);
    this.blobCount = 0;

    this.material = new ShaderMaterial({
      uniforms: LensShader.uniforms,
      vertexShader: LensShader.vertexShader,
      fragmentShader: LensShader.fragmentShader,
      depthTest: false,
      depthWrite: false,
    });
    this.overlay = new Scene();
    const quad = new Mesh(new PlaneGeometry(2, 2), this.material);
    quad.frustumCulled = false;
    this.overlay.add(quad);
    this.overlayCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.frame = null;
    this.size = new Vector2();
    this.origin = new Vector2();
    this.reach = new Box2();
    this.resize();
  }

  resize() {
    this.width = CANVAS_WIDTH;
    this.height = Math.round((CANVAS_WIDTH * viewHeight()) / viewWidth());
    this.material.uniforms.uTexel.value.set(
      1.5 / this.width,
      1.5 / this.height,
    );
    this.blobMaterial.uniforms.uSize.value.set(this.width, this.height);
    this.target.setSize(this.width, this.height);
    this.material.uniforms.tDrops.value = this.target.texture;
  }

  growBlobs(capacity) {
    this.blobData = new Float32Array(capacity * 4);
    this.blobAttribute = new InstancedBufferAttribute(this.blobData, 4);
    this.blobGeometry.setAttribute("blob", this.blobAttribute);
  }

  addDrop(x, y, r, delay = 0, oil = false) {
    this.drops.push({
      x,
      y,
      r,
      oil,
      age: -delay,
      life: oil ? OIL_LIFE : LIFE,
      vy: 0,
      seed: Math.random() * 10,
      trail: [],
      slides: r > (oil ? 6 : 9) && Math.random() < 0.85,
      wait: (oil ? 0.8 : 0.25) + Math.random() * 0.8,
    });
  }

  oilSplat(x, y, r) {
    if (!this.enabled) return;
    const scale = this.width / viewWidth();
    const size = r * scale;
    this.addDrop(x * scale, y * scale, size, 0, true);
    const count = Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const along = size * (1.2 + Math.random() * 0.8);
      this.addDrop(
        x * scale + Math.cos(angle) * along,
        y * scale + Math.sin(angle) * along,
        Math.max(1.2, size * (0.15 + Math.random() * 0.2)),
        0,
        true,
      );
    }
  }

  splat(worldPosition, worldVelocity, size = 1) {
    if (!this.enabled) return;
    project.copy(worldPosition).project(this.camera);
    const x = (project.x * 0.5 + 0.5) * this.width;
    const y = (0.5 - project.y * 0.5) * this.height;
    const r = Math.min(90, (5 + Math.random() ** 1.8 * 34) * size);
    this.addDrop(x, y, r);
    this.onHit?.();

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
        (project.x * 0.5 + 0.5) * this.width + (Math.random() - 0.5) * 30,
        (0.5 - project.y * 0.5) * this.height + (Math.random() - 0.5) * 30,
        1.5 + Math.random() ** 2 * 9 * amount,
        delay,
      );
    }
  }

  update(delta) {
    if (this.drops.length === 0) return;
    this.blobCount = 0;
    this.reach.makeEmpty();

    this.drops = this.drops.filter((d) => d.age < d.life);
    this.drops.forEach((d) => {
      d.age += delta;
      if (d.age < 0) return;
      if (d.slides && d.age > d.wait) {
        const drag = d.oil ? 0.4 : 1;
        d.vy = Math.min(
          (18 + d.r * 2.2) * drag,
          d.vy + (20 + d.r) * drag * delta,
        );
        d.y += d.vy * delta;
        d.x += Math.sin(d.age * 2.3 + d.seed) * 6 * delta;
        d.r = Math.max(5, d.r - delta * (d.oil ? 0.5 : 1.4));
        const last = d.trail[d.trail.length - 1];
        if (!last || d.y - last.y > 2) {
          d.trail.push({ x: d.x, y: d.y, r: d.r * (d.oil ? 0.6 : 0.42) });
        }
      }
      d.trail.forEach((t) => {
        t.r -= delta * (d.oil ? 0.7 : 1.6);
      });
      d.trail = d.trail.filter((t) => t.r > 0.8);

      const evaporate = Math.min(1, (d.life - d.age) / 1.4);
      const grow = Math.min(1, 0.35 + d.age * 14);
      const oil = d.oil ? 1 : 0;
      d.trail.forEach((t) => this.blob(oil, t.x, t.y, t.r * evaporate));
      this.blob(oil, d.x, d.y, d.r * grow * evaporate);
    });
    this.blobsDirty = true;
  }

  blob(oil, x, y, r) {
    if (r < 0.6) return;
    const reach = r * 1.8;
    if (this.blobCount * 4 >= this.blobData.length) {
      const old = this.blobData;
      this.growBlobs(this.blobCount * 2);
      this.blobData.set(old);
    }
    const at = this.blobCount * 4;
    this.blobData[at] = x;
    this.blobData[at + 1] = y;
    this.blobData[at + 2] = reach;
    this.blobData[at + 3] = oil;
    this.blobCount += 1;
    this.reach.expandByPoint(corner.set(x - reach, y - reach));
    this.reach.expandByPoint(corner.set(x + reach, y + reach));
  }

  drawBlobs() {
    const r = this.renderer;
    this.blobsDirty = false;
    this.blobGeometry.instanceCount = this.blobCount;
    this.blobAttribute.needsUpdate = true;
    const previous = r.getRenderTarget();
    r.getClearColor(clearColor);
    const clearAlpha = r.getClearAlpha();
    r.setRenderTarget(this.target);
    r.setClearColor(0x000000, 1);
    r.clear();
    r.render(this.blobScene, this.overlayCamera);
    r.setRenderTarget(previous);
    r.setClearColor(clearColor, clearAlpha);
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
      this.material.uniforms.tDiffuse.value = this.frame;
    }
    this.renderer.copyFramebufferToTexture(this.origin, this.frame);
    return this.frame;
  }

  render(liquids, clip = null) {
    if (this.blobsDirty) this.drawBlobs();
    if (clip) {
      this.renderer.setScissor(clip);
      this.renderer.setScissorTest(true);
    }
    this.renderer.render(this.scene, this.camera);
    const { autoClear } = this.renderer;
    this.renderer.autoClear = false;
    const juicy = liquids.some((liquid) => liquid.isActive());
    if (juicy) {
      const u = juiceMaterial.uniforms;
      u.tBehind.value = this.captureFrame();
      u.uResolution.value.copy(this.size);
      this.camera.layers.set(JUICE_LAYER);
      this.renderer.render(this.scene, this.camera);
      this.camera.layers.set(0);
    }
    if (this.drops.length > 0 && !this.reach.isEmpty()) {
      // Reuse the juice copy to skip a second full-frame copy; drops then miss flying juice.
      if (!juicy) this.captureFrame();
      const scale = viewWidth() / this.width;
      const { min, max } = this.reach;
      area.set(
        min.x * scale - 2,
        viewHeight() - max.y * scale - 2,
        (max.x - min.x) * scale + 4,
        (max.y - min.y) * scale + 4,
      );
      if (clip) {
        const x = Math.max(area.x, clip.x);
        const y = Math.max(area.y, clip.y);
        area.z = Math.min(area.x + area.z, clip.x + clip.z) - x;
        area.w = Math.min(area.y + area.w, clip.y + clip.w) - y;
        area.x = x;
        area.y = y;
      }
      if (area.z > 0 && area.w > 0) {
        this.renderer.setScissor(area);
        this.renderer.setScissorTest(true);
        this.renderer.render(this.overlay, this.overlayCamera);
      }
      if (clip) this.renderer.setScissor(clip);
      else this.renderer.setScissorTest(false);
    }
    this.renderer.autoClear = autoClear;
  }
}
