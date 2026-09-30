import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Object3D,
  PlaneGeometry,
  Points,
  PointsMaterial,
  ShaderMaterial,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";
import {
  featherGeometry,
  featherMaterial,
  petalGeometry,
  softTexture,
  flameTexture,
  dropGeometry,
  candleGeometry,
  twinkleTexture,
  glyphTexture,
  heartTexture,
  fogTexture,
  makeProp,
} from "./shapes";
import { Toucher } from "./touches";
import { OilDrips } from "./oil";
import { moonMesh, setMoonPhase, ShootingStars } from "./sky";
import {
  setChoir,
  setChant,
  playThump,
  playWhoosh,
  playKiss,
  discoBeat,
} from "../../audio";
import { reducedMotion } from "../../util";

const level = (owned, full = 100) =>
  owned > 0 ? Math.min(1, Math.log10(1 + owned) / Math.log10(1 + full)) : 0;
const rand = (lo, hi) => lo + Math.random() * (hi - lo);

const TRAIL = 26;
const STREAKS = 6;

const STREAK_VERTEX = `
attribute float aSize;
attribute float aAlpha;
varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * (600.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
  vAlpha = aAlpha;
}`;

const STREAK_FRAGMENT = `
uniform vec3 uColor;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float glow = smoothstep(1.0, 0.0, d);
  gl_FragColor = vec4(uColor * glow * vAlpha, glow * vAlpha);
}`;

function streakPoints() {
  const count = STREAKS * TRAIL;
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(count * 3), 3),
  );
  geometry.setAttribute(
    "aSize",
    new BufferAttribute(new Float32Array(count), 1),
  );
  geometry.setAttribute(
    "aAlpha",
    new BufferAttribute(new Float32Array(count), 1),
  );
  const p = new Points(
    geometry,
    new ShaderMaterial({
      uniforms: { uColor: { value: new Color(0xffb0e0) } },
      vertexShader: STREAK_VERTEX,
      fragmentShader: STREAK_FRAGMENT,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  p.frustumCulled = false;
  return p;
}

function rayTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  const across = ctx.createLinearGradient(0, 0, 64, 0);
  across.addColorStop(0, "rgba(255,230,200,0)");
  across.addColorStop(0.5, "rgba(255,230,200,1)");
  across.addColorStop(1, "rgba(255,230,200,0)");
  ctx.fillStyle = across;
  ctx.fillRect(0, 0, 64, 256);
  ctx.globalCompositeOperation = "destination-in";
  const down = ctx.createLinearGradient(0, 0, 0, 256);
  down.addColorStop(0, "rgba(0,0,0,1)");
  down.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = down;
  ctx.fillRect(0, 0, 64, 256);
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function blackHoleTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const c = size / 2;
  const glow = ctx.createRadialGradient(c, c, c * 0.18, c, c, c);
  glow.addColorStop(0, "rgba(255,150,120,0.5)");
  glow.addColorStop(0.35, "rgba(200,70,140,0.18)");
  glow.addColorStop(1, "rgba(120,40,120,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);
  const disc = (from, to) => {
    ctx.save();
    ctx.translate(c, c);
    ctx.scale(1, 0.26);
    for (let r = c * 0.92; r > c * 0.3; r -= 2) {
      const k = (r - c * 0.3) / (c * 0.62);
      ctx.strokeStyle = `hsla(${20 + k * 310}, 95%, ${78 - k * 30}%, ${(1 - k) * 0.5})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, r, from, to);
      ctx.stroke();
    }
    ctx.restore();
  };
  disc(Math.PI, Math.PI * 2);
  ctx.save();
  ctx.translate(c, c);
  ctx.scale(1, 0.9);
  ctx.strokeStyle = "rgba(255,210,170,0.55)";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(0, 0, c * 0.36, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#050104";
  ctx.beginPath();
  ctx.arc(c, c, c * 0.27, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,236,210,0.9)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(c, c, c * 0.275, 0, Math.PI * 2);
  ctx.stroke();
  disc(0, Math.PI);
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function galaxyTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const c = size / 2;
  const core = ctx.createRadialGradient(c, c, 0, c, c, c * 0.35);
  core.addColorStop(0, "rgba(255,230,210,0.9)");
  core.addColorStop(1, "rgba(255,150,180,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, size, size);
  for (let n = 0; n < 2600; n += 1) {
    const arm = n % 3;
    const t = Math.random() ** 0.6;
    const a = t * 4.2 + (arm / 3) * Math.PI * 2 + rand(-0.3, 0.3);
    const r = t * c * 0.92;
    const x = c + Math.cos(a) * r;
    const y = c + Math.sin(a) * r * 0.6;
    ctx.fillStyle = `hsla(${arm ? 320 : 280}, 90%, ${70 + Math.random() * 25}%, ${0.25 + Math.random() * 0.5})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.6 + Math.random() * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function sprites(count, map, color, additive = false) {
  return Array.from({ length: count }, () => ({
    sprite: new Sprite(
      new SpriteMaterial({
        map,
        color,
        transparent: true,
        depthWrite: false,
        opacity: 0,
        blending: additive ? AdditiveBlending : undefined,
      }),
    ),
    age: Math.random(),
    seed: Math.random() * 10,
    fresh: true,
  }));
}

function points(count, map, color, size, additive = true, opacity = 1) {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(count * 3), 3),
  );
  const material = new PointsMaterial({
    map,
    color,
    size,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: additive ? AdditiveBlending : undefined,
  });
  const p = new Points(geometry, material);
  p.frustumCulled = false;
  return p;
}

export class Room {
  constructor(game, interaction, popups, scene, camera, backdrop, mood) {
    Object.assign(this, {
      game,
      i: interaction,
      scene,
      camera,
      backdrop,
      mood,
    });
    this.toucher = new Toucher(game, interaction, popups);
    this.group = new Group();
    scene.add(this.group);
    this.time = 0;
    this.dummy = new Object3D();
    this.bounds = new Vector3(1.7, 1.5, 1.5);
    this.measureTimer = 0;
    this.tmp = new Vector3();
    const soft = softTexture();

    this.feathers = new InstancedMesh(
      featherGeometry(0.6),
      featherMaterial(),
      36,
    );
    this.featherData = Array.from({ length: 36 }, () => this.spawnDrift({}));
    this.petals = new InstancedMesh(
      petalGeometry(),
      new MeshPhysicalMaterial({
        color: 0xd8244a,
        roughness: 0.55,
        sheen: 1,
        sheenColor: new Color(0xff90a8),
        side: DoubleSide,
      }),
      40,
    );
    this.petalData = Array.from({ length: 40 }, () => this.spawnDrift({}));
    this.droplets = new InstancedMesh(
      dropGeometry(),
      new MeshPhysicalMaterial({
        color: 0xff9a3a,
        roughness: 0.04,
        clearcoat: 1,
        transparent: true,
        opacity: 0.82,
        emissive: 0x5a1a00,
        emissiveIntensity: 0.4,
      }),
      16,
    );
    this.dropData = Array.from({ length: 16 }, () => {
      const at = new Vector3();
      do at.set(rand(-4.5, 4.5), rand(-2.8, 2.8), rand(-2.5, 1.2));
      while (Math.hypot(at.x, at.y) < 2.4);
      return { at, seed: Math.random() * 10 };
    });
    this.candles = new InstancedMesh(
      candleGeometry(0.4, 0.075),
      new MeshPhysicalMaterial({
        color: 0xfff0dc,
        roughness: 0.7,
        sheen: 0.6,
        emissive: 0x3a1a08,
      }),
      12,
    );
    this.flames = points(12, flameTexture(), 0xffffff, 1.1);
    this.knead = null;
    this.kneadTimer = 3;
    this.kneadLocal = new Vector3();
    this.kneadNormal = new Vector3();
    this.kneadPull = new Vector3();
    this.kneadDent = new Vector3();
    this.kneadSide = new Vector3();
    this.kneadUp = new Vector3();
    this.fog = sprites(6, fogTexture(), 0xd8c8f0);
    this.normal = new Vector3();
    this.notes = sprites(10, null, 0xffffff);
    const glyphs = [glyphTexture("♪", "#ffd27a"), glyphTexture("♫", "#ffd27a")];
    this.notes.forEach((n, k) => {
      // eslint-disable-next-line no-param-reassign
      n.sprite.material.map = glyphs[k % 2];
    });
    this.hearts = sprites(8, heartTexture(), 0xffffff);
    [...this.notes, ...this.hearts].forEach((p) => {
      // eslint-disable-next-line no-param-reassign
      p.sprite.material.toneMapped = false;
    });
    this.sparks = streakPoints();
    this.flash = new Sprite(
      new SpriteMaterial({
        map: twinkleTexture(),
        color: 0xffd0f0,
        blending: AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        transparent: true,
        opacity: 0,
      }),
    );
    this.flash.renderOrder = 10;
    this.flashAge = 9;
    this.flashTimer = 2;
    this.stars = points(1400, soft, 0xfff4ff, 0.35, true, 0.85);
    const starPos = this.stars.geometry.attributes.position;
    for (let n = 0; n < 1400; n += 1)
      starPos.setXYZ(n, rand(-40, 40), rand(-22, 22), rand(-40, -18));
    this.galaxy = new Sprite(
      new SpriteMaterial({
        map: galaxyTexture(),
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
      }),
    );
    this.galaxy.position.set(6, 5, -30);
    this.galaxy.scale.set(34, 34, 1);
    this.moon = moonMesh();
    this.moon.position.set(-9, 5.5, -22);
    this.moonHalo = new Sprite(
      new SpriteMaterial({
        map: soft,
        color: 0xffb890,
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0,
      }),
    );
    this.moonHalo.position.set(-9, 5.5, -23);
    this.oil = new OilDrips(
      interaction,
      () => this.game.state.options.castSound,
    );
    this.shooting = new ShootingStars(this.group);
    this.lotuses = Array.from({ length: 3 }, (_, n) => {
      const prop = makeProp("spa");
      prop.visible = false;
      this.group.add(prop);
      return { prop, seed: n * 2.1 };
    });
    this.beat = { timer: 0, count: 0, last: -1 };
    this.fallTimer = 4;
    this.falling = null;
    this.burstCooldown = 0;
    this.streakAngles = [];
    this.holeScreen = new Vector3();
    this.from = new Vector3();
    this.hole = new Sprite(
      new SpriteMaterial({
        map: blackHoleTexture(),
        transparent: true,
        depthWrite: false,
      }),
    );
    this.hole.position.set(11, 6.5, -34);
    const rays = rayTexture();
    this.rays = Array.from({ length: 4 }, (_, n) => {
      const ray = new Mesh(
        new PlaneGeometry(1.4, 9),
        new MeshBasicMaterial({
          map: rays,
          color: 0xffe2c8,
          transparent: true,
          opacity: 0,
          blending: AdditiveBlending,
          depthWrite: false,
          side: DoubleSide,
        }),
      );
      ray.position.set(-1.5 + n, 5, -1.5);
      ray.rotation.z = (n - 1.5) * 0.12;
      return ray;
    });
    this.group.add(
      this.feathers,
      this.petals,
      this.droplets,
      this.candles,
      this.flames,
      ...[this.fog, this.notes, this.hearts].flatMap((list) =>
        list.map((p) => p.sprite),
      ),
      this.sparks,
      this.flash,
      this.stars,
      this.galaxy,
      this.moon,
      this.moonHalo,
      this.hole,
      ...this.rays,
    );
    [this.feathers, this.petals, this.droplets, this.candles].forEach((m) => {
      // eslint-disable-next-line no-param-reassign
      m.frustumCulled = false;
      // eslint-disable-next-line no-param-reassign
      m.count = 0;
    });
    this.group.visible = false;
  }

  warmups() {
    return [this.group];
  }

  setActive(on) {
    this.active = on;
    this.group.visible = false;
    if (!on) this.silence();
  }

  silence() {
    setChoir(0);
    setChant(0);
    this.backdrop.setLens(0.5, 0.5, 0);
    if (this.mood.amount === 0) this.mood.candle.intensity = 0;
    if (this.knead) {
      this.i.peach.releaseGrab();
      this.knead = null;
    }
  }

  surfacePoint(upper = false) {
    const center = this.i.group.position;
    const { x, y } = this.bounds;
    return this.oil.surfaceAt(
      center.x + (Math.random() - 0.5) * x * 1.3,
      center.y + (upper ? Math.random() * 0.7 : Math.random() * 1.4 - 0.7) * y,
    );
  }

  land(p, delta) {
    const l = p.land;
    const mesh = this.i.peach.mesh;
    this.tmp.copy(l.local).applyMatrix4(mesh.matrixWorld);
    if (l.stick > 0) {
      l.stick -= delta;
      p.at.copy(this.tmp).z += 0.03;
      if (l.stick <= 0) {
        // eslint-disable-next-line no-param-reassign
        p.land = null;
        // eslint-disable-next-line no-param-reassign
        p.fall = 0.25;
      }
      return;
    }
    const to = this.from.copy(this.tmp).sub(p.at);
    const dist = to.length();
    if (dist < 0.06) {
      l.stick = 2.5 + Math.random() * 2;
      return;
    }
    p.at.addScaledVector(to, Math.min(1, (0.9 * delta) / dist));
  }

  // eslint-disable-next-line class-methods-use-this
  halfHeight(z) {
    const cam = this.camera;
    return Math.tan((cam.fov * Math.PI) / 360) * (cam.userData.baseZ - z);
  }

  spawnDrift(d, top = false) {
    const z = rand(-4, 2.5);
    const edge = this.halfHeight(z) + 0.6;
    Object.assign(d, {
      at: new Vector3(rand(-6, 6), top ? edge : rand(-edge, edge), z),
      born: top ? -1 : this.time,
      spin: new Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)),
      rot: new Vector3(rand(0, 6), rand(0, 6), rand(0, 6)),
      fall: rand(0.15, 0.35),
      seed: Math.random() * 10,
    });
    return d;
  }

  drift(mesh, data, count, delta, scale) {
    const still = reducedMotion.matches ? 0.15 : 1;
    const d = this.dummy;
    for (let n = 0; n < count; n += 1) {
      const p = data[n];
      if (p.land) this.land(p, delta);
      else this.fallStep(p, delta, still, mesh === this.petals);
      d.position.copy(p.at);
      d.rotation.set(p.rot.x, p.rot.y, p.rot.z);
      if (p.born === undefined || p.born < 0) p.born = this.time; // eslint-disable-line no-param-reassign
      const grow = Math.min(1, (this.time - p.born) / 0.8);
      d.scale.setScalar(scale * grow * grow * (3 - 2 * grow));
      d.updateMatrix();
      mesh.setMatrixAt(n, d.matrix);
    }
    // eslint-disable-next-line no-param-reassign
    mesh.count = count;
    // eslint-disable-next-line no-param-reassign
    mesh.instanceMatrix.needsUpdate = true;
  }

  fallStep(p, delta, still, petal) {
    /* eslint-disable no-param-reassign */
    p.at.y -= p.fall * delta * still;
    p.at.x += Math.sin(this.time * 0.6 + p.seed) * 0.25 * delta * still;
    p.rot.addScaledVector(p.spin, delta * still);
    if (p.at.y < this.camera.position.y - this.halfHeight(p.at.z) - 0.8) {
      this.spawnDrift(p, true);
      if (petal && Math.random() < 0.3) {
        const hit = this.surfacePoint(true);
        if (hit)
          p.land = {
            local: this.i.peach.toLocal(hit.point, new Vector3()),
            stick: 0,
          };
      }
    }
    const center = this.i.group.position;
    const dx = p.at.x - center.x;
    const dy = p.at.y - center.y;
    const ex = dx / (this.bounds.x + 0.25);
    const ey = dy / (this.bounds.y + 0.25);
    const inside = ex * ex + ey * ey;
    if (inside < 1 && Math.abs(p.at.z - center.z) < 1.6) {
      const push =
        ((1 - Math.sqrt(inside)) * Math.min(1, delta * 1.5)) /
        Math.max(Math.sqrt(inside), 0.05);
      p.at.x += dx * push;
      p.at.y += dy * push;
      if (!petal && this.time - (p.bumped ?? -9) > 3) {
        const hit = this.toucher.hitFrom(p.at);
        if (hit && hit.distance < 0.35) {
          p.bumped = this.time;
          this.i.peach.addJiggle(hit.point, this.toucher.dir, 0.012, 0.35);
          p.spin.multiplyScalar(-1.4);
        }
      }
    }
    /* eslint-enable no-param-reassign */
  }

  coachBeat(delta, owned) {
    const i = this.i;
    if (!owned || i.phase !== "live") return;
    const disco = i.settings.disco ? discoBeat() : null;
    let hit = false;
    if (disco !== null && disco !== undefined) {
      const index = Math.floor(disco);
      hit = index !== this.beat.last;
      this.beat.last = index;
    } else {
      this.beat.timer -= delta;
      if (this.beat.timer <= 0) {
        this.beat.timer += 60 / 96;
        hit = true;
      }
    }
    if (!hit) return;
    this.beat.count += 1;
    if (this.beat.count % 2 || i.pointer.pressed || i.grab) return;
    const lvl = level(owned);
    i.velocity.y += 0.25 + 0.35 * lvl;
    i.squashVelocity.x += 0.5 + 0.6 * lvl;
    i.squashAxis.set(0, 1);
    if (this.game.state.options.castSound) playThump(0.35 + 0.65 * lvl);
  }

  measure(delta) {
    this.measureTimer -= delta;
    if (this.measureTimer > 0 || !this.i.peach.mesh) return;
    this.measureTimer = 0.25;
    const { mesh } = this.i.peach;
    const pos = mesh.geometry.attributes.position;
    const center = this.i.group.position;
    const step = Math.max(1, Math.floor(pos.count / 400));
    this.bounds.set(0, 0, 0);
    for (let n = 0; n < pos.count; n += step) {
      this.tmp
        .fromBufferAttribute(pos, n)
        .applyMatrix4(mesh.matrixWorld)
        .sub(center);
      this.bounds.x = Math.max(this.bounds.x, Math.abs(this.tmp.x));
      this.bounds.y = Math.max(this.bounds.y, Math.abs(this.tmp.y));
    }
  }

  kneadPeach(delta, owned) {
    const i = this.i;
    const { peach } = i;
    const busy =
      i.grab ||
      i.recoil ||
      i.massage.active ||
      i.pointer.pressed ||
      i.phase !== "live";
    if (this.knead && busy) {
      peach.releaseGrab();
      this.knead = null;
    }
    if (!owned || busy) return;
    if (!this.knead) {
      this.kneadTimer -= delta;
      if (this.kneadTimer > 0) return;
      this.kneadTimer = (4 + Math.random() * 4) / (1 + Math.log10(owned) * 0.5);
      const hit = this.toucher.randomHit();
      if (!hit) return;
      this.kneadHit = hit;
      peach.toLocal(hit.point, this.kneadLocal);
      this.kneadNormal.copy(hit.face.normal).normalize();
      this.kneadSide.set(0, 1, 0).cross(this.kneadNormal);
      if (this.kneadSide.lengthSq() < 1e-4) this.kneadSide.set(1, 0, 0);
      this.kneadSide.normalize();
      this.kneadUp.copy(this.kneadNormal).cross(this.kneadSide).normalize();
      this.knead = {
        age: 0,
        length: 2.2 + Math.random(),
        spin: Math.random() < 0.5 ? -1 : 1,
      };
    }
    const k = this.knead;
    k.age += delta;
    const p = k.age / k.length;
    if (p >= 1) {
      peach.releaseGrab();
      this.toucher.blush(this.kneadHit, 2.4, 0.32);
      this.knead = null;
      return;
    }
    const scale = peach.worldScale();
    const amount = Math.sin(Math.PI * p);
    const press = 1 + Math.sin(k.age * 7) * 0.2;
    const a = k.age * 4 * k.spin;
    this.kneadPull
      .copy(this.kneadSide)
      .multiplyScalar(Math.cos(a))
      .addScaledVector(this.kneadUp, Math.sin(a))
      .multiplyScalar((0.09 * amount) / scale);
    this.kneadDent
      .copy(this.kneadNormal)
      .multiplyScalar((-0.15 * amount * press) / scale);
    peach.setGrab(this.kneadLocal, this.kneadPull, 0.9, this.kneadDent, 0.6);
    k.pulse = (k.pulse ?? 0) - delta;
    if (k.pulse <= 0) {
      k.pulse = 0.35;
      this.tmp.copy(this.kneadLocal).applyMatrix4(peach.mesh.matrixWorld);
      peach.addJiggle(
        this.tmp,
        this.kneadPull.clone().transformDirection(peach.mesh.matrixWorld),
        0.025 * amount,
        0.6,
      );
    }
  }

  lifecycle(list, count, delta, speed, place) {
    const still = reducedMotion.matches ? 0.3 : 1;
    list.forEach((p, n) => {
      const { sprite } = p;
      if (n >= count) {
        sprite.visible = false;
        return;
      }
      sprite.visible = true;
      // eslint-disable-next-line no-param-reassign
      p.age += delta * speed * still;
      if (p.age >= 1 || p.fresh) {
        // eslint-disable-next-line no-param-reassign
        p.age %= 1;
        // eslint-disable-next-line no-param-reassign
        p.fresh = false;
        place(p, 0);
      }
      sprite.material.opacity = place(p, p.age);
    });
  }

  update(delta) {
    if (!this.active) return;
    const { helpers, options } = this.game.state;
    this.group.visible = options.cast;
    if (!options.cast) {
      this.silence();
      return;
    }
    this.time += delta;
    const t = this.time;
    const i = this.i;
    const still = reducedMotion.matches ? 0.15 : 1;
    const own = (id) => helpers[id] || 0;
    const center = i.group.position;
    this.measure(delta);

    this.toucher
      .due(delta)
      .filter((id) => id !== "coach")
      .forEach((id) => {
        const hit = this.toucher.randomHit();
        this.toucher.touch(id, hit);
      });

    this.drift(
      this.feathers,
      this.featherData,
      Math.round(36 * level(own("feather"))),
      delta,
      1,
    );
    this.drift(
      this.petals,
      this.petalData,
      Math.round(40 * level(own("admirer"))),
      delta,
      0.22,
    );

    this.kneadPeach(delta, own("masseuse"));
    this.coachBeat(delta, own("coach"));
    this.oil.update(
      delta,
      own("baron") > 0 ? Math.max(1, Math.round(3 * level(own("baron")))) : 0,
      this.bounds,
    );
    this.lifecycle(
      this.notes,
      Math.round(10 * level(own("choir"), 50)),
      delta,
      0.18,
      (p, k) => {
        if (k === 0)
          Object.assign(p, { x: rand(-3.2, 3.2), z: rand(-1.5, 0.5) });
        p.sprite.position.set(
          center.x + p.x + Math.sin(t * 1.5 + p.seed) * 0.25,
          -2.2 + k * 4.4,
          p.z,
        );
        p.sprite.scale.setScalar(0.34);
        p.sprite.material.rotation = Math.sin(t * 2 + p.seed) * 0.3;
        return Math.sin(Math.PI * k) * 0.9;
      },
    );

    this.lifecycle(
      this.hearts,
      Math.round(8 * level(own("admirer"))),
      delta,
      0.22,
      (p, k) => {
        /* eslint-disable no-param-reassign */
        if (k === 0) {
          const side = Math.random() < 0.5 ? -1 : 1;
          p.start = new Vector3(
            center.x + side * rand(3.5, 5),
            rand(-2.5, 2.5),
            rand(0.5, 1.5),
          );
          const a = Math.atan2(p.start.y - center.y, p.start.x - center.x);
          p.end = new Vector3(
            center.x + Math.cos(a) * (this.bounds.x + 0.05),
            center.y + Math.sin(a) * (this.bounds.y + 0.05),
            center.z + 0.6,
          );
          p.popped = false;
        }
        const fly = Math.min(1, k / 0.8);
        p.sprite.position.lerpVectors(
          p.start,
          p.end,
          fly * fly * (3 - 2 * fly),
        );
        p.sprite.position.y += Math.sin(t * 3 + p.seed) * 0.08 * (1 - fly);
        if (k < 0.8) {
          p.sprite.scale.setScalar(0.24 + Math.sin(t * 6 + p.seed) * 0.02);
          return Math.min(1, k * 5) * 0.9;
        }
        if (!p.popped) {
          p.popped = true;
          const hit = this.toucher.hitFrom(p.sprite.position);
          if (hit)
            this.i.peach.addJiggle(hit.point, this.toucher.dir, 0.03, 0.5);
          if (
            this.game.state.options.castSound &&
            this.toucher.soundTimer <= 0
          ) {
            this.toucher.soundTimer = 0.3;
            playKiss();
          }
        }
        const pop = (k - 0.8) / 0.2;
        p.sprite.scale.setScalar(0.24 + pop * 0.3);
        return (1 - pop) * 0.9;
        /* eslint-enable no-param-reassign */
      },
    );

    this.lifecycle(
      this.fog,
      Math.round(6 * level(own("spa"), 50)),
      delta,
      0.05,
      (p, k) => {
        if (k === 0)
          Object.assign(p, {
            x: rand(-8, -2),
            z: rand(-3, 0.5),
            y: rand(-3.2, -2.6),
          });
        p.sprite.position.set(p.x + k * 10, p.y, p.z);
        p.sprite.scale.set(9, 2.2, 1);
        return Math.sin(Math.PI * k) * 0.22;
      },
    );

    const spa = own("spa") > 0;
    this.lotuses.forEach((l, n) => {
      l.prop.visible = spa && n < 1 + Math.round(level(own("spa"), 50) * 2);
      if (!l.prop.visible) return;
      l.prop.position.set(
        -3 + n * 3 + Math.sin(t * 0.2 + l.seed) * 0.3,
        -2.75 + Math.sin(t * 0.8 + l.seed) * 0.05,
        -0.6 - n * 0.4,
      );
      l.prop.rotation.set(0.35, t * 0.1 + l.seed, 0);
      l.prop.scale.setScalar(0.42);
    });

    const choir = level(own("choir"), 50);
    const sound = this.game.state.options.castSound;
    setChoir(sound ? choir : 0);
    const cult = level(own("cult"), 50);
    setChant(sound ? cult : 0);
    if (this.mood.amount === 0)
      this.mood.candle.intensity =
        cult * (12 + Math.sin(t * 9) * 1.5 + Math.sin(t * 23) * 1);
    this.rays.forEach((ray, n) => {
      // eslint-disable-next-line no-param-reassign
      ray.material.opacity =
        choir * (0.14 + 0.08 * Math.sin(t * 0.7 + n * 1.7));
      // eslint-disable-next-line no-param-reassign
      ray.rotation.z = (n - 1.5) * 0.12 + Math.sin(t * 0.2 + n) * 0.04 * still;
    });

    const drops = Math.round(16 * level(own("press"), 50));
    const d = this.dummy;
    for (let n = 0; n < drops; n += 1) {
      const p = this.dropData[n];
      d.position.copy(p.at);
      d.position.y += Math.sin(t * 0.8 + p.seed) * 0.15 * still;
      d.rotation.set(
        Math.sin(t * 0.5 + p.seed) * 0.3,
        t * 0.4 + p.seed,
        Math.sin(t * 0.7 + p.seed) * 0.25,
      );
      if (p.born === undefined) p.born = this.time;
      const grow = Math.min(1, (this.time - p.born) / 1.2);
      d.scale.setScalar(0.07 * grow * grow * (3 - 2 * grow));
      d.updateMatrix();
      this.droplets.setMatrixAt(n, d.matrix);
    }
    this.fallTimer -= delta;
    if (drops && !this.falling && this.fallTimer <= 0) {
      this.fallTimer = (5 + Math.random() * 6) / (1 + level(own("press"), 50));
      const n = Math.floor(Math.random() * drops);
      this.falling = {
        n,
        at: this.dropData[n].at.clone(),
        velocity: new Vector3(rand(-0.4, 0.4), -0.2, 4),
      };
    }
    if (this.falling) {
      const f = this.falling;
      f.velocity.z += delta * 10;
      f.velocity.y -= delta * 2;
      f.at.addScaledVector(f.velocity, delta);
      d.position.copy(f.at);
      d.rotation.set(0, 0, 0);
      d.scale.setScalar(0.07 + (f.at.z > 3 ? (f.at.z - 3) * 0.02 : 0));
      d.updateMatrix();
      this.droplets.setMatrixAt(f.n, d.matrix);
      if (f.at.z > this.camera.position.z - 2.6) {
        if (this.i.lens.enabled) this.i.lens.splat(f.at, f.velocity, 1.4);
        const drop = this.dropData[f.n];
        do drop.at.set(rand(-4.5, 4.5), rand(-2.8, 2.8), rand(-2.5, 1.2));
        while (Math.hypot(drop.at.x, drop.at.y) < 2.4);
        drop.born = this.time;
        this.falling = null;
      }
    }
    this.droplets.count = drops;
    this.droplets.instanceMatrix.needsUpdate = true;

    const candles = Math.round(12 * level(own("cult"), 50));
    const fp = this.flames.geometry.attributes.position;
    for (let n = 0; n < candles; n += 1) {
      const a = (n / 12) * Math.PI * 2 + t * 0.1 * still;
      d.position.set(
        center.x + Math.cos(a) * 3.8,
        -1.3 + Math.sin(a * 2 + t) * 0.12 * still,
        -3.4 + Math.sin(a) * 0.7,
      );
      d.rotation.set(0, 0, 0);
      d.scale.setScalar(1);
      d.updateMatrix();
      this.candles.setMatrixAt(n, d.matrix);
      fp.setXYZ(n, d.position.x, d.position.y + 0.27, d.position.z);
    }
    this.candles.count = candles;
    this.candles.instanceMatrix.needsUpdate = true;
    fp.needsUpdate = true;
    this.flames.geometry.setDrawRange(0, candles);
    this.flames.material.size = 1.05 + Math.sin(t * 13) * 0.06;

    const moon = level(own("moon"), 50);
    this.moon.visible = own("moon") > 0;
    this.moonHalo.visible = this.moon.visible;
    this.moon.scale.setScalar(1.8 + moon * 0.8);
    this.moon.rotation.y = t * 0.03;
    setMoonPhase(this.moon, 0.15 + moon * 0.85, this.camera);
    this.moonHalo.scale.setScalar(6 + moon * 3);
    this.moonHalo.material.opacity = moon * 0.35;

    const streaks =
      own("collider") > 0
        ? Math.max(1, Math.round(STREAKS * level(own("collider"), 50)))
        : 0;
    const trail = this.sparks.geometry.attributes;
    const heads = [];
    for (let n = 0; n < streaks; n += 1) {
      const ring = n % 3;
      const speed =
        (2 + ring * 0.6) *
        (1 + level(own("collider"), 50)) *
        (ring === 1 ? -1 : 1) *
        still;
      this.streakAngles[n] = (this.streakAngles[n] ?? n * 2.1) + speed * delta;
      const head = this.streakAngles[n];
      heads.push({ a: head, ring });
      const rx = this.bounds.x + 0.4 + ring * 0.2;
      const ry = this.bounds.y + 0.35 + ring * 0.2;
      for (let k = 0; k < TRAIL; k += 1) {
        const a = head - k * 0.024 * Math.sign(speed || 1);
        const index = n * TRAIL + k;
        const fade = 1 - k / TRAIL;
        trail.position.setXYZ(
          index,
          center.x + Math.cos(a) * rx,
          center.y + Math.sin(a) * ry,
          center.z,
        );
        trail.aSize.setX(index, 0.05 + fade * fade * 0.22);
        trail.aAlpha.setX(index, fade * fade);
      }
    }
    trail.position.needsUpdate = true;
    trail.aSize.needsUpdate = true;
    trail.aAlpha.needsUpdate = true;
    this.sparks.geometry.setDrawRange(0, streaks * TRAIL);
    this.burstCooldown -= delta;
    if (this.burstCooldown <= 0) {
      for (let x = 0; x < heads.length && this.burstCooldown <= 0; x += 1) {
        for (let y = x + 1; y < heads.length; y += 1) {
          const ax = heads[x].a;
          const bx = heads[y].a;
          const gap = Math.abs(
            Math.atan2(Math.sin(ax - bx), Math.cos(ax - bx)),
          );
          if (heads[x].ring !== heads[y].ring && gap < 0.05) {
            this.burstCooldown = 1.2;
            this.flashAge = 0;
            const ring = (heads[x].ring + heads[y].ring) / 2;
            this.flash.position.set(
              center.x + Math.cos(ax) * (this.bounds.x + 0.4 + ring * 0.2),
              center.y + Math.sin(ax) * (this.bounds.y + 0.35 + ring * 0.2),
              center.z,
            );
            if (this.game.state.options.castSound) playWhoosh(0.8);
            break;
          }
        }
      }
    }
    this.flashAge += delta;
    const f = this.flashAge / 0.45;
    this.flash.material.opacity = f < 1 ? (1 - f) * 0.9 : 0;
    this.flash.scale.setScalar(0.2 + Math.min(1, f) * 0.9);

    this.hole.visible = own("singularity") > 0;
    this.hole.scale.setScalar(7 + level(own("singularity"), 50) * 4);
    if (this.hole.visible) {
      this.holeScreen.copy(this.hole.position).project(this.camera);
      this.backdrop.setLens(
        this.holeScreen.x * 0.5 + 0.5,
        this.holeScreen.y * 0.5 + 0.5,
        0.35 + level(own("singularity"), 50) * 0.65,
      );
    } else {
      this.backdrop.setLens(0.5, 0.5, 0);
    }

    const cosmos = level(own("peachverse"), 50);
    this.stars.visible = cosmos > 0;
    this.stars.geometry.setDrawRange(0, Math.round(300 + 1100 * cosmos));
    this.shooting.update(delta, own("peachverse") > 0 ? cosmos : 0);
    this.stars.material.opacity = cosmos;
    this.galaxy.visible = cosmos > 0;
    this.galaxy.material.opacity = cosmos * 0.9;
    this.galaxy.material.rotation = t * 0.02 * still;
  }
}
