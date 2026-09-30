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
  SphereGeometry,
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
  candleGeometry,
  twinkleTexture,
  glyphTexture,
  heartTexture,
  fogTexture,
  makeProp,
} from "./shapes";
import { Toucher } from "./touches";
import { JUICE_LAYER, glowingJuiceMaterial } from "../../juice";
import { OilDrips } from "./oil";
import { moonMesh, setMoonPhase, ShootingStars, usePeachShape } from "./sky";
import { Wind } from "./wind";
import { blackHole, constellation, galaxy, starField } from "./cosmos";
import {
  setChoir,
  setChant,
  playThump,
  playWhoosh,
  playKiss,
  discoBeat,
} from "../../audio";
import { reducedMotion, ease } from "../../util";

const level = (owned, full = 100) =>
  owned > 0 ? Math.min(1, Math.log10(1 + owned) / Math.log10(1 + full)) : 0;
const rand = (lo, hi) => lo + Math.random() * (hi - lo);

const TRAIL = 26;
const STREAKS = 6;
const HEARTS = 20;
const NEAREST_DRIFT = 0.8;
const STEADY = 0.85;
const RING_TILT = 0.32;
const MOON_CROSSING = 300;
const RING_ROLL = 0.18;
const HEART_FAR = new Color(0.62, 0.5, 0.9);
const HEART_NEAR = new Color(1.12, 1.02, 1);
const WHITE = new Color(1, 1, 1);

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
    this.group.matrixAutoUpdate = false;
    this.time = 0;
    this.dummy = new Object3D();
    this.drifter = new Object3D();
    this.drifter.rotation.order = "YZX";
    this.bounds = new Vector3(1.7, 1.5, 1.5);
    this.measureTimer = 0;
    this.tmp = new Vector3();
    this.air = new Vector3();
    this.wind = new Wind(camera, interaction);
    this.halfHeightAt = (z) => this.halfHeight(z);
    interaction.on("smack", ({ strength }) => {
      if (this.group.visible)
        this.wind.blast(
          interaction.group.position,
          Math.min(0.6, 0.2 + strength * 0.25),
        );
    });
    interaction.on("burst", () => {
      if (this.group.visible) this.wind.blast(interaction.group.position, 1.5);
    });
    const soft = softTexture();

    this.feathers = new InstancedMesh(
      featherGeometry(0.6)
        .translate(0, -0.3, 0)
        .rotateZ(-Math.PI / 2),
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
      new SphereGeometry(1, 20, 14),
      glowingJuiceMaterial,
      16,
    );
    this.droplets.layers.set(JUICE_LAYER);
    this.ahead = new Vector3();
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
    this.flames = points(12, flameTexture(), 0xffffff, 1.3, false);
    this.flames.geometry.setAttribute(
      "aSize",
      new BufferAttribute(new Float32Array(12), 1),
    );
    this.flames.material.onBeforeCompile = (shader) => {
      // eslint-disable-next-line no-param-reassign
      shader.vertexShader = shader.vertexShader
        .replace("void main() {", "attribute float aSize;\nvoid main() {")
        .replace("gl_PointSize = size;", "gl_PointSize = size * aSize;");
    };
    this.candleData = Array.from({ length: 12 }, (_, n) => ({
      seed: n * 1.7 + Math.random(),
      rate: rand(0.45, 0.7),
      born: -1,
      pos: new Vector3(),
      tilt: new Vector3(),
      sway: new Vector3(),
      lean: new Vector3(),
    }));
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
    this.hearts = sprites(HEARTS, heartTexture(), 0xffffff);
    this.diveTimer = 2;
    this.heartGate = 0;
    const tilt = new Object3D();
    tilt.rotation.set(RING_TILT, 0, RING_ROLL);
    tilt.updateMatrix();
    this.ringU = new Vector3();
    this.ringN = new Vector3();
    this.ringW = new Vector3();
    tilt.matrix.extractBasis(this.ringU, this.ringN, this.ringW);
    this.ringDir = new Vector3();
    this.align = new Vector3();
    this.steer = new Vector3();
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
    this.stars = starField(1400);
    this.galaxy = galaxy();
    this.galaxy.mesh.position.set(-12, 0.5, -34);
    this.galaxy.mesh.scale.setScalar(30);
    this.constellation = constellation();
    this.constellation.group.position.set(-1, 9.5, -36);
    this.constellation.group.scale.setScalar(4.2);
    this.moon = moonMesh();
    this.moon.position.set(-9, 5.5, -22);
    this.moonHalo = new Sprite(
      new SpriteMaterial({
        map: soft,
        color: 0xffc9a0,
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
    this.hole = blackHole();
    this.hole.mesh.position.set(7.5, 7.5, -34);
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
      this.stars.points,
      this.galaxy.mesh,
      this.constellation.group,
      this.moon,
      this.moonHalo,
      this.hole.mesh,
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

  isActive() {
    return this.group.visible && this.droplets.count > 0;
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
    /* eslint-disable no-param-reassign */
    const z = rand(-4, NEAREST_DRIFT);
    const edge = this.halfHeight(z) + 0.6;
    d.at ??= new Vector3();
    d.spin ??= new Vector3();
    d.rot ??= new Vector3();
    d.v ??= new Vector3();
    d.at.set(rand(-6, 6), top ? edge : rand(-edge, edge), z);
    d.spin.set(
      rand(1.5, 3) * (Math.random() < 0.5 ? -1 : 1),
      rand(-0.3, 0.3),
      rand(-1, 1),
    );
    d.rot.set(rand(0, 6), rand(0, 6), rand(0, 6));
    d.v.set(0, -0.2, 0);
    Object.assign(d, {
      born: top ? -1 : this.time,
      fall: rand(0.15, 0.35),
      flutter: rand(1.3, 1.9),
      drag: rand(0.6, 1.4),
      seed: Math.random() * 10,
    });
    /* eslint-enable no-param-reassign */
    return d;
  }

  drift(mesh, data, count, delta, scale) {
    const still = reducedMotion.matches ? 0.15 : 1;
    const d = this.drifter;
    const petal = mesh === this.petals;
    for (let n = 0; n < count; n += 1) {
      const p = data[n];
      if (p.land) this.land(p, delta);
      else this.fallStep(p, delta, still, petal);
      d.position.copy(p.at);
      if (petal) d.rotation.set(p.rot.x, p.rot.y, 0.4 * Math.sin(p.rot.z));
      else
        d.rotation.set(
          p.rot.x * 0.6,
          0.5 * Math.sin(p.seed + this.time * 0.1),
          Math.sin(this.time * p.flutter + p.seed) * 0.45,
        );
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
    const air = this.wind.sample(p.at, this.air);
    this.aroundPeach(p.at, air);
    air.y = Math.min(air.y - p.fall, -p.fall * 0.7);
    p.v.lerp(air, ease((petal ? 1.4 : 2.4) * p.drag, delta));
    this.wind.kick(p.at, p.v, delta);
    if (p.at.z > NEAREST_DRIFT) {
      p.at.z += (NEAREST_DRIFT - p.at.z) * ease(6, delta);
      p.v.z = Math.min(p.v.z, 0);
    }
    p.at.addScaledVector(p.v, delta * still);
    const phase = this.time * p.flutter + p.seed;
    const swing = Math.cos(phase);
    const glide = Math.sin(phase);
    if (petal) {
      p.at.x += swing * 0.12 * delta * still;
    } else {
      p.at.x += swing * 0.9 * delta * still;
      p.at.y +=
        (-p.fall * (1.4 * swing * swing - 0.7) + 0.12 * glide * glide) *
        delta *
        still;
    }
    p.rot.addScaledVector(p.spin, delta * still * (0.5 + p.v.length() * 0.8));
    const cam = this.camera.position;
    const high = this.halfHeight(p.at.z);
    const wide = high * this.camera.aspect + 0.8;
    if (p.at.x - cam.x > wide) p.at.x -= 2 * wide;
    else if (p.at.x - cam.x < -wide) p.at.x += 2 * wide;
    if (p.at.y > cam.y + high + 1) {
      p.at.y = cam.y + high + 1;
      p.v.y = Math.min(p.v.y, 0);
    }
    if (p.at.y < cam.y - high - 0.8) {
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
      const len = Math.max(Math.hypot(dx, dy), 1e-3);
      const into = -(p.v.x * dx + p.v.y * dy) / len;
      if (into > 0) {
        p.v.x += (dx / len) * into * 1.3;
        p.v.y += (dy / len) * into * 1.3;
      }
      const nx = dx / len;
      const ny = dy / len;
      const lean = Math.sign(dx) || (p.seed > 5 ? 1 : -1);
      p.v.x += (nx * ny + lean * 0.4 * Math.max(ny, 0)) * delta * 3;
      p.v.y += (ny * ny - 1) * delta * 3;
      if (!petal && this.time - (p.bumped ?? -9) > 3) {
        const hit = this.toucher.hitFrom(p.at);
        if (hit && hit.distance < 0.35) {
          p.bumped = this.time;
          this.i.peach.addJiggle(hit.point, this.toucher.dir, 0.012, 0.35);
          p.spin.multiplyScalar(-1.4).clampLength(0, 4);
        }
      }
    }
    /* eslint-enable no-param-reassign */
  }

  steady() {
    const k = STEADY / this.camera.userData.baseZ;
    const { parallax } = this.i;
    this.group.matrix.makeShear(0, 0, 0, 0, parallax.x * k, parallax.y * k);
    this.group.matrixWorldNeedsUpdate = true;
  }

  floatCandles(delta, count, rest, still) {
    /* eslint-disable no-param-reassign */
    const t = this.time;
    const d = this.dummy;
    const { gust, breeze } = this.wind;
    const flames = this.flames.geometry.attributes;
    this.candleData.forEach((c, n) => {
      if (n >= count) {
        c.born = -1;
        return;
      }
      const a = (n / 12) * Math.PI * 2 + t * 0.1 * still;
      const bob =
        (Math.sin(t * c.rate + c.seed) * 0.09 +
          Math.sin(t * c.rate * 2.3 + c.seed * 2) * 0.025) *
        still;
      this.tmp.set(
        rest.x + Math.cos(a) * 3.8,
        -1.3 + bob,
        -3.4 + Math.sin(a) * 0.7,
      );
      if (c.born < 0) {
        c.born = t;
        c.pos.copy(this.tmp);
      }
      c.pos.lerp(this.tmp, ease(3, delta));
      c.lean.set(
        Math.sin(t * 0.37 + c.seed * 1.3) * 0.04 * still,
        0,
        -breeze.x * 0.12 + Math.sin(t * 0.5 + c.seed) * 0.04 * still,
      );
      c.sway.addScaledVector(
        this.from.copy(c.lean).sub(c.tilt).multiplyScalar(6),
        delta,
      );
      c.sway.multiplyScalar(Math.exp(-2.2 * delta));
      c.tilt.addScaledVector(c.sway, delta);
      const g = Math.min(1, (t - c.born) / 1.1) - 1;
      const grow = 1 + 2.7 * g * g * g + 1.7 * g * g;
      d.position.copy(c.pos);
      d.position.y -= g * g * 0.6;
      d.rotation.set(c.tilt.x, 0, c.tilt.z);
      d.scale.setScalar(grow);
      d.updateMatrix();
      this.candles.setMatrixAt(n, d.matrix);
      this.from
        .set(0, 0.22 * grow, 0)
        .applyEuler(d.rotation)
        .add(d.position);
      flames.position.setXYZ(
        n,
        this.from.x + breeze.x * 0.03,
        this.from.y,
        this.from.z,
      );
      const flicker =
        Math.sin(t * (11 + (c.seed % 3)) + c.seed) * 0.05 +
        Math.sin(t * (23 + c.seed) + c.seed * 3) * 0.025 +
        Math.sin(t * (19 + gust * 9) + c.seed) * gust * 0.08;
      flames.aSize.setX(n, grow * (1 + flicker));
    });
    this.candles.count = count;
    this.candles.instanceMatrix.needsUpdate = true;
    flames.position.needsUpdate = true;
    flames.aSize.needsUpdate = true;
    this.flames.geometry.setDrawRange(0, count);
    /* eslint-enable no-param-reassign */
  }

  aroundPeach(at, air) {
    /* eslint-disable no-param-reassign */
    const center = this.i.group.position;
    const rx = this.bounds.x + 0.25;
    const ry = this.bounds.y + 0.25;
    const ex = (at.x - center.x) / rx;
    const ey = (at.y - center.y) / ry;
    const s = Math.hypot(ex, ey);
    if (s > 2.2 || s < 1e-3 || Math.abs(at.z - center.z) > 2) return;
    const len = Math.hypot(ex / rx, ey / ry);
    const nx = ex / rx / len;
    const ny = ey / ry / len;
    const inward = -(air.x * nx + air.y * ny);
    if (inward <= 0) return;
    const k = Math.min(1, (2.2 - s) / 1.2) * inward;
    const side = air.y * nx - air.x * ny >= 0 ? 1 : -1;
    air.x += (1.6 * nx - side * ny) * k;
    air.y += (1.6 * ny + side * nx) * k;
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

  puff(count) {
    const { gustDir } = this.wind;
    const cam = this.camera.position;
    const y = rand(-1.5, 2);
    const z = rand(-2, 1);
    const wide = this.halfHeight(z) * this.camera.aspect + 0.6;
    this.petalData
      .slice(0, count)
      .filter((p) => !p.land)
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .forEach((p) => {
        p.at.set(
          cam.x - gustDir * (wide + rand(0, 3)),
          y + rand(-1.2, 1.2),
          z + rand(-0.9, 0.9),
        );
        p.v.set(gustDir * 0.4, 0, 0);
        // eslint-disable-next-line no-param-reassign
        p.born = this.time;
      });
  }

  spawnHeart(h, center, radius) {
    /* eslint-disable no-param-reassign */
    const front = this.from.copy(this.ringW).multiplyScalar(radius);
    const z = center.z + front.z;
    const wide = this.halfHeight(z) * this.camera.aspect + 0.6;
    h.at ??= new Vector3();
    h.v ??= new Vector3();
    h.at.set(
      this.camera.position.x - wide,
      center.y + front.y + rand(-0.2, 0.2),
      z + rand(-0.2, 0.2),
    );
    h.v.set(1.8, rand(-0.1, 0.1), 0);
    Object.assign(h, {
      live: true,
      flocking: true,
      joining: true,
      dive: -1,
      born: this.time,
      pop: -1,
    });
    /* eslint-enable no-param-reassign */
  }

  kiss(h) {
    /* eslint-disable no-param-reassign */
    h.pop = 0;
    const hit = this.toucher.hitFrom(h.at);
    if (hit) this.i.peach.addJiggle(hit.point, this.toucher.dir, 0.03, 0.5);
    if (this.game.state.options.castSound && this.toucher.soundTimer <= 0) {
      this.toucher.soundTimer = 0.3;
      playKiss();
    }
    /* eslint-enable no-param-reassign */
  }

  ringCoords(at, center, radius) {
    const rel = this.from.copy(at).sub(center);
    return {
      a: rel.dot(this.ringU) / radius,
      b: rel.dot(this.ringW) / radius,
      off: rel.dot(this.ringN),
    };
  }

  heartFlock(delta, count, still) {
    /* eslint-disable no-param-reassign */
    const center = this.i.group.position;
    const radius = this.bounds.x + 1;
    const surface = this.bounds.x / radius + 0.04;
    const t = this.time;
    this.heartGate -= delta;
    this.hearts.forEach((h, n) => {
      if (n >= count) {
        h.live = false;
        h.flocking = false;
      } else if (!h.live && this.heartGate <= 0) {
        this.spawnHeart(h, center, radius);
        this.heartGate = rand(0.22, 0.34);
      }
      h.sprite.visible = n < count && h.live;
    });
    this.diveTimer -= delta;
    if (this.diveTimer <= 0 && count) {
      this.diveTimer = rand(1.2, 3) / (1 + level(count, HEARTS));
      const ready = this.hearts.filter((h) => {
        if (!h.live || !h.flocking || h.joining || t - h.born < 4) return false;
        const { a, b } = this.ringCoords(h.at, center, radius);
        return a < 0 && b > 0 && Math.hypot(a, b) < 1.3;
      });
      const h = ready[Math.floor(Math.random() * ready.length)];
      if (h) {
        h.flocking = false;
        h.dive = 0;
      }
    }
    for (let n = 0; n < count; n += 1) {
      const h = this.hearts[n];
      const { sprite } = h;
      const { steer, ringDir } = this;
      if (!h.live) continue; // eslint-disable-line no-continue
      if (h.pop >= 0) {
        h.pop += delta;
        const k = h.pop / 0.25;
        sprite.scale.setScalar(0.22 + k * 0.3);
        sprite.material.opacity = (1 - Math.min(1, k)) * 0.9;
        if (k >= 1) {
          h.live = false;
          h.flocking = false;
        }
        continue; // eslint-disable-line no-continue
      }
      const { a, b, off } = this.ringCoords(h.at, center, radius);
      const r = Math.max(Math.hypot(a, b), 0.05);
      let ring = 1;
      let pace = 1.6;
      if (h.dive >= 0) {
        h.dive += delta;
        const k = Math.min(1, h.dive / 1.1);
        ring = 1 - (1.1 - surface) * k * k * (3 - 2 * k);
        pace = 1.6 - k * 0.5;
        if (r <= surface + 0.03 || h.dive > 3) {
          this.kiss(h);
          continue; // eslint-disable-line no-continue
        }
      }
      const reel = h.dive >= 0 ? 3 : 1.2;
      const merge = h.joining ? Math.min(1, Math.max(0, (1.7 - r) / 0.6)) : 1;
      if (merge >= 1) h.joining = false;
      ringDir
        .copy(this.ringU)
        .multiplyScalar(a / r)
        .addScaledVector(this.ringW, b / r);
      steer
        .copy(this.ringU)
        .multiplyScalar(b)
        .addScaledVector(this.ringW, -a)
        .normalize()
        .multiplyScalar(pace * merge)
        .addScaledVector(
          ringDir,
          Math.max(-reel, Math.min(reel, (ring - r) * 6)) * merge,
        )
        .addScaledVector(
          this.ringN,
          (Math.sin(t * 0.7 + h.seed) * 0.15 - off * 2) * merge,
        );
      steer.x += 1.8 * (1 - merge);
      steer.sub(h.v).multiplyScalar(h.dive >= 0 ? 2.4 : 1.2);
      if (h.flocking)
        steer.addScaledVector(
          this.wind.align(this.hearts, n, count, this.align),
          1.6,
        );
      steer.addScaledVector(this.wind.sample(h.at, this.air), 0.4);
      h.v.addScaledVector(steer, delta);
      this.wind.kick(h.at, h.v, delta);
      const speed = h.v.length();
      if (speed > 3.2) h.v.multiplyScalar(3.2 / speed);
      else if (speed < 0.7) h.v.multiplyScalar(0.7 / Math.max(speed, 1e-3));
      h.at.addScaledVector(h.v, delta * still);
      sprite.position.copy(h.at);
      const g = Math.min(1, (t - h.born) / 0.8) - 1;
      const grow = 1 + 2.7 * g * g * g + 1.7 * g * g;
      const depth = Math.max(-1, Math.min(1, (h.at.z - center.z) / radius));
      const near = (depth + 1) / 2;
      sprite.scale.setScalar(
        (0.22 + Math.max(0, Math.sin(t * 6 + h.seed)) * 0.03) *
          grow *
          (0.8 + 0.35 * near),
      );
      sprite.material.color
        .copy(depth < 0 ? HEART_FAR : WHITE)
        .lerp(depth < 0 ? WHITE : HEART_NEAR, depth < 0 ? depth + 1 : depth);
      sprite.material.opacity =
        Math.min(1, (t - h.born) / 0.5) * (0.5 + 0.45 * near);
      sprite.material.rotation = Math.max(-0.4, Math.min(0.4, -h.v.x * 0.12));
    }
    /* eslint-enable no-param-reassign */
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
    this.steady();
    if (!this.anchor) this.anchor = center.clone();
    this.anchor.lerp(center, ease(0.5, delta));
    const rest = this.anchor;
    this.wind.update(delta, this.halfHeightAt);

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
        const air = this.wind.sample(p.sprite.position, this.air);
        if (k === 0)
          Object.assign(p, { x: rand(-3.2, 3.2), z: rand(-1.5, 0.5), push: 0 });
        // eslint-disable-next-line no-param-reassign
        else p.push += air.x * delta * 0.6;
        p.sprite.position.set(
          rest.x + p.x + p.push + Math.sin(t * 1.5 + p.seed) * 0.25,
          -2.2 + k * 4.4,
          p.z,
        );
        p.sprite.scale.setScalar(0.34);
        p.sprite.material.rotation = Math.sin(t * 2 + p.seed) * 0.3;
        return Math.sin(Math.PI * k) * 0.9;
      },
    );

    this.heartFlock(delta, Math.round(HEARTS * level(own("admirer"))), still);
    if (this.wind.gustStarted)
      this.puff(Math.round(40 * level(own("admirer"))));

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
            push: 0,
          });
        // eslint-disable-next-line no-param-reassign
        else p.push += this.wind.breeze.x * delta * 0.8;
        p.sprite.position.set(p.x + k * 10 + p.push, p.y, p.z);
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
      ray.rotation.z =
        (n - 1.5) * 0.12 +
        (Math.sin(t * 0.2 + n) * 0.04 + this.wind.breeze.x * 0.04) * still;
    });

    const drops = Math.round(16 * level(own("press"), 50));
    const d = this.dummy;
    for (let n = 0; n < drops; n += 1) {
      const p = this.dropData[n];
      d.position.copy(p.at);
      d.position.y += Math.sin(t * 0.8 + p.seed) * 0.15 * still;
      d.rotation.set(p.seed, t * 0.3 * still + p.seed, 0);
      if (p.born === undefined) p.born = this.time;
      const grow = Math.min(1, (this.time - p.born) / 1.2);
      const size = 0.07 * grow * grow * (3 - 2 * grow);
      const wobble =
        (Math.sin(t * 2.6 + p.seed) * 0.12 +
          Math.sin(t * 4.4 + p.seed * 2) * 0.05) *
        still;
      d.scale.set(
        size * (1 + wobble),
        size * (1 - wobble),
        size * (1 + wobble * 0.5),
      );
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
      d.lookAt(this.ahead.copy(f.at).add(f.velocity));
      const size = 0.07 + (f.at.z > 3 ? (f.at.z - 3) * 0.02 : 0);
      d.scale.set(
        size,
        size,
        size * (1 + Math.min(2, f.velocity.length() * 0.12)),
      );
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
    this.floatCandles(delta, candles, rest, still);

    const moon = level(own("moon"), 50);
    this.moon.visible = own("moon") > 0;
    if (this.moon.visible && !this.moonShaped && i.peach.mesh) {
      usePeachShape(this.moon, i.peach);
      this.moonShaped = true;
    }
    this.moonHalo.visible = this.moon.visible;
    this.moon.scale.setScalar(1.8 + moon * 0.8);
    const drift = Math.sin((t / MOON_CROSSING) * Math.PI * 2);
    this.moon.position.set(
      -7.5 + drift * 2,
      5.5 + (1 - drift * drift) * 0.5,
      -22,
    );
    this.moonHalo.position.copy(this.moon.position).z -= 1;
    this.moon.rotation.set(
      Math.sin(t * 0.09) * 0.08,
      Math.sin(t * 0.06 + 1) * 0.16,
      0.1,
    );
    setMoonPhase(this.moon, 0.15 + moon * 0.85, this.camera);
    this.moonHalo.scale.setScalar(5.5 + moon * 3);
    this.moonHalo.material.opacity = 0.2 + moon * 0.3;

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

    const hole = this.hole.mesh;
    hole.visible = own("singularity") > 0;
    hole.scale.setScalar(9 + level(own("singularity"), 50) * 5);
    if (hole.visible) {
      this.hole.update(t * still, level(own("singularity"), 50), this.camera);
      this.holeScreen.copy(hole.position).project(this.camera);
      this.backdrop.setLens(
        this.holeScreen.x * 0.5 + 0.5,
        this.holeScreen.y * 0.5 + 0.5,
        0.35 + level(own("singularity"), 50) * 0.65,
      );
    } else {
      this.backdrop.setLens(0.5, 0.5, 0);
    }

    const cosmos = level(own("peachverse"), 50);
    const sky = cosmos > 0;
    this.stars.points.visible = sky;
    this.galaxy.mesh.visible = sky;
    this.constellation.group.visible = sky;
    this.shooting.update(delta, sky ? cosmos : 0);
    if (sky) {
      this.stars.update(t * still, cosmos);
      this.galaxy.update(t * still, cosmos);
      this.constellation.update(t * still, cosmos);
    }
  }
}
