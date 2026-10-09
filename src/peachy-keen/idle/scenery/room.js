import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Euler,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  NormalBlending,
  Object3D,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Quaternion,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";
import {
  FEATHER_LOOKS,
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
  makeLotus,
} from "./shapes";
import { Toucher } from "./touches";
import { Paddles } from "./paddle";
import Extras from "./extras";
import Sippers from "./sippers";
import { glowingJuiceMaterial } from "../../juice";
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
  playKnead,
  discoBeat,
  playNotes,
} from "../../audio";
import { reducedMotion, ease } from "../../util";
import { PRINT_KIND } from "../../peach";
import { ringMaterial, showRing } from "../../rings";

const level = (owned, full = 100) =>
  owned > 0 ? Math.min(1, Math.log10(1 + owned) / Math.log10(1 + full)) : 0;
const crowd = (owned, most, full) =>
  Math.min(owned, Math.round(most * level(owned, full)));
const rand = (lo, hi) => lo + Math.random() * (hi - lo);

const ARRIVAL_GAP = 0.15;
const SWEEP = 0.7;
const TRAIL = 26;
const STREAKS = 6;
const HEARTS = 20;
const LINE_GAP = 0.28;
const LINE_UP = new Vector3(0, 1, 0);
const LINE_TILT = new Vector3(1, 0, 0);
const LINE_ROLL = new Vector3(0, 0, 1);
const JOIN_LAG = 0.9;
const PRESS_TIME = 0.16;
const POP_TIME = 0.22;
const KISS_RINGS = 3;
const Z_AXIS = new Vector3(0, 0, 1);
const KISS_SPARKS = 12;
const NEAREST_DRIFT = 0.8;
const FACING = new Vector3(0, 0, 1);
const LIE_FLAT = new Quaternion().setFromAxisAngle(
  new Vector3(1, 0, 0),
  -Math.PI / 2,
);
const FACE_CAMERA = 0.6;
const SLIDE_PULL = 1.2;
const GRIP = 0.6;
const STEADY = 0.85;
const MOON_CROSSING = 300;
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
        blending: additive ? AdditiveBlending : NormalBlending,
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
    blending: additive ? AdditiveBlending : NormalBlending,
  });
  const p = new Points(geometry, material);
  p.frustumCulled = false;
  return p;
}

export class Room {
  constructor(
    game,
    interaction,
    popups,
    scene,
    camera,
    backdrop,
    mood,
    renderer,
    world,
  ) {
    Object.assign(this, {
      game,
      i: interaction,
      scene,
      camera,
      backdrop,
      mood,
      renderer,
    });
    this.toucher = new Toucher(game, interaction, popups);
    this.group = new Group();
    scene.add(this.group);
    this.group.matrixAutoUpdate = false;
    this.paddles = new Paddles(game, interaction, this.toucher, this.group);
    this.extras = new Extras({
      ...world,
      game,
      interaction,
      room: this,
      scene,
      camera,
      renderer,
      backdrop,
      mood,
    });
    this.sippers = new Sippers(this.extras.world);
    this.time = 0;
    this.shown = {};
    this.presence = () => 1;
    this.lensFade = 1;
    this.dummy = new Object3D();
    this.drifter = new Object3D();
    this.middle = new Vector3();
    this.drifter.rotation.order = "YZX";
    this.bounds = new Vector3(1.7, 1.5, 1.5);
    this.home = interaction.group.position.clone();
    this.homeBlend = 1;
    this.measureTimer = 0;
    this.tmp = new Vector3();
    this.probe = new Vector3();
    this.normal = new Vector3();
    this.slope = new Vector3();
    this.turn = new Euler();
    this.spinQ = new Quaternion();
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
    ["aLook", "aFrom", "aFade"].forEach((name) =>
      this.feathers.geometry.setAttribute(
        name,
        new InstancedBufferAttribute(new Float32Array(36), 1),
      ),
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
    // Refracting the smoke instead of the frame spares a full-screen copy every frame.
    glowingJuiceMaterial.uniforms.tBehind.value = backdrop.texture;
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
    this.kissSparks = sprites(KISS_SPARKS, softTexture(), 0xffc8dc, true);
    this.kissSparks.forEach((s) => {
      Object.assign(s, { age: 1, v: new Vector3() });
    });
    this.kissRings = Array.from({ length: KISS_RINGS }, () => {
      const ring = new Mesh(
        new PlaneGeometry(1, 1),
        ringMaterial(0xffb8c8, { onTop: true }),
      );
      const flash = new Sprite(
        new SpriteMaterial({
          map: softTexture(),
          color: 0xffd6e2,
          blending: AdditiveBlending,
          transparent: true,
          depthWrite: false,
          opacity: 0,
        }),
      );
      [ring, flash].forEach((o) => {
        /* eslint-disable no-param-reassign */
        o.renderOrder = 3;
        o.visible = false;
        /* eslint-enable no-param-reassign */
        this.group.add(o);
      });
      return { ring, flash, age: 1 };
    });
    this.diveTimer = 2;
    this.heartGate = 0;
    this.heartOrder = 0;
    this.lineClock = 0;
    this.lineTrail = [];
    this.lead = { a: Math.PI * 0.3, at: new Vector3() };
    this.lineSpot = new Vector3();
    this.lineVel = new Vector3();
    this.lineBack = new Vector3();
    this.lineBase = new Vector3();
    this.lineAnchor = null;
    this.anchorV = new Vector3();
    this.lineRadius = 0;
    [...this.notes, ...this.hearts, ...this.kissSparks].forEach((p) => {
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
    this.moon = moonMesh(renderer);
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
      const prop = makeLotus();
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
          // Additive blending ignores draw order, and two passes would rebuild the shader state every frame.
          forceSinglePass: true,
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
      ...[this.fog, this.notes, this.hearts, this.kissSparks].flatMap((list) =>
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

  setActive(on) {
    this.active = on;
    this.group.visible = false;
    if (!on) this.silence();
  }

  silence() {
    this.extras.clear();
    this.sippers.clear();
    setChoir(0);
    setChant(0);
    this.backdrop.setLens(0.5, 0.5, 0);
    if (this.mood.amount === 0) this.mood.candle.intensity = 0;
    if (this.knead) {
      this.i.peach.releaseGrab();
      this.knead = null;
    }
  }

  land(p, delta, still) {
    /* eslint-disable no-param-reassign */
    if (!this.peachHere()) {
      p.land = null;
      p.shell = undefined;
      p.bumped = this.time;
      return;
    }
    const l = p.land;
    const center = this.i.group.position;
    const at = this.tmp
      .copy(l.local)
      .applyMatrix4(this.i.peach.mesh.matrixWorld);
    const carried = at.distanceTo(l.last) / Math.max(delta, 1e-3);
    const off = this.from.copy(at).sub(center);
    const n = this.surfaceNormal(off);
    const down = this.slope.set(n.x * n.y, n.y * n.y - 1, n.z * n.y);
    p.v.addScaledVector(down, SLIDE_PULL * delta);
    p.v.addScaledVector(n, -p.v.dot(n));
    const speed = p.v.length();
    const brake = GRIP * SLIDE_PULL * Math.max(n.y, 0) * delta;
    if (speed <= brake) {
      p.v.set(0, 0, 0);
      l.rest += delta;
    } else p.v.multiplyScalar((1 - brake / speed) * Math.exp(-2 * delta));
    at.addScaledVector(p.v, delta * still);
    off.copy(at).sub(center);
    const s = this.ellipse(off);
    if (speed > brake && this.time - p.shellAt > 0.15)
      this.measureShell(p, off, s);
    at.copy(center).addScaledVector(off, p.shell / s);
    this.i.peach.toLocal(at, l.local);
    l.last.copy(at);
    p.flatQ
      .setFromUnitVectors(FACING, n)
      .multiply(this.spinQ.setFromAxisAngle(FACING, p.seed));
    p.at.copy(at).addScaledVector(n, 0.03 + 0.08 * (1 - (p.flat ?? 0)));
    const tired = l.rest > l.stay;
    if (n.y > 0.1 && !tired && carried < 2.5) return;
    if (tired) {
      p.v.copy(n).multiplyScalar(0.25).x += (Math.sign(off.x) || 1) * 0.4;
    }
    p.land = null;
    p.shell = undefined;
    p.bumped = this.time;
    /* eslint-enable no-param-reassign */
  }

  ellipse(off) {
    const { x, y, z } = this.bounds;
    return Math.hypot(off.x / x, off.y / y, off.z / z);
  }

  surfaceNormal(off) {
    const { x, y, z } = this.bounds;
    return this.normal
      .set(off.x / x / x, off.y / y / y, off.z / z / z)
      .normalize();
  }

  measureShell(p, off, s) {
    /* eslint-disable no-param-reassign */
    const out = 1.5;
    this.probe.copy(this.i.group.position).addScaledVector(off, out / s);
    const hit = this.toucher.hitFrom(this.probe);
    p.shell = hit ? out - (hit.distance * s) / off.length() : 1;
    p.shellAt = this.time;
    /* eslint-enable no-param-reassign */
  }

  // eslint-disable-next-line class-methods-use-this
  halfHeight(z) {
    const cam = this.camera;
    return Math.tan((cam.fov * Math.PI) / 360) * (cam.userData.baseZ - z);
  }

  viewMiddle(z) {
    const { position, view } = this.camera;
    const px = view ? (2 * this.halfHeight(z)) / view.fullHeight : 0;
    return this.middle.set(
      position.x + (view?.offsetX ?? 0) * px,
      position.y - (view?.offsetY ?? 0) * px,
      z,
    );
  }

  spawnDrift(d, top = false) {
    /* eslint-disable no-param-reassign */
    const z = rand(-4, NEAREST_DRIFT);
    const edge = this.halfHeight(z) + 0.6;
    d.at ??= new Vector3();
    d.spin ??= new Vector3();
    d.rot ??= new Vector3();
    d.v ??= new Vector3();
    d.flyQ ??= new Quaternion();
    d.flatQ ??= new Quaternion();
    const y = top ? this.viewMiddle(z).y + edge : rand(-edge, edge);
    d.at.set(rand(-6, 6), y, z);
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
      heading: rand(0, Math.PI * 2),
      shell: undefined,
      look: undefined,
      sweepAt: undefined,
    });
    /* eslint-enable no-param-reassign */
    return d;
  }

  arrive(key, target, delta) {
    if (!(key in this.shown)) this.shown[key] = { count: target, wait: 0 };
    const s = this.shown[key];
    s.wait -= delta;
    if (this.snap) s.count = target;
    if (target < s.count && s.wait <= 0) {
      s.count = Math.max(target, s.count - 1);
      s.wait = ARRIVAL_GAP * 0.6;
    } else if (target > s.count && s.wait <= 0) {
      s.count = Math.min(target, s.count + 1);
      s.wait = ARRIVAL_GAP;
    }
    return s.count;
  }

  drift(mesh, data, count, delta, scale) {
    const still = reducedMotion.matches ? 0.15 : 1;
    const d = this.drifter;
    const petal = mesh === this.petals;
    for (let n = 0; n < count; n += 1) {
      const p = data[n];
      if (n >= mesh.count) p.born = this.time; // eslint-disable-line no-param-reassign
      if (p.land) this.land(p, delta, still);
      else this.fallStep(p, delta, still, petal);
      d.position.copy(p.at);
      if (petal) {
        // eslint-disable-next-line no-param-reassign
        p.flat = Math.min(
          1,
          Math.max(0, (p.flat ?? 0) + (p.land ? delta : -delta) / 0.15),
        );
        d.quaternion.copy(p.flyQ);
        if (p.flat > 0)
          d.quaternion.slerp(p.flatQ, p.flat * p.flat * (3 - 2 * p.flat));
      } else
        d.rotation.set(
          p.rot.x * 0.6,
          0.5 * Math.sin(p.seed + this.time * 0.1),
          Math.sin(this.time * p.flutter + p.seed) * 0.45,
        );
      if (p.born === undefined || p.born < 0) p.born = this.time; // eslint-disable-line no-param-reassign
      const grow = Math.min(1, (this.time - p.born) / 0.8);
      const size = scale * grow * grow * (3 - 2 * grow);
      if (petal) d.scale.setScalar(size);
      else {
        if (p.look === undefined) p.look = this.featherLook(); // eslint-disable-line no-param-reassign
        const fade =
          p.sweepAt === undefined
            ? 0
            : Math.min(1, Math.max(0, 1 - (this.time - p.sweepAt) / SWEEP));
        const from = FEATHER_LOOKS[p.from ?? p.look].size;
        const to = FEATHER_LOOKS[p.look].size;
        const length = to[0] + (from[0] - to[0]) * fade;
        const width = to[1] + (from[1] - to[1]) * fade;
        d.scale.set(size * length, size * width, size);
        const { aLook, aFrom, aFade } = mesh.geometry.attributes;
        aLook.setX(n, p.look);
        aFrom.setX(n, p.from ?? p.look);
        aFade.setX(n, fade);
      }
      d.updateMatrix();
      mesh.setMatrixAt(n, d.matrix);
    }
    // eslint-disable-next-line no-param-reassign
    mesh.count = count;
    // eslint-disable-next-line no-param-reassign
    mesh.instanceMatrix.needsUpdate = true;
    if (!petal)
      ["aLook", "aFrom", "aFade"].forEach((name) => {
        // eslint-disable-next-line no-param-reassign
        mesh.geometry.attributes[name].needsUpdate = true;
      });
  }

  featherTier() {
    const { upgrades } = this.game.state;
    let tier = 0;
    for (let n = 0; n < FEATHER_LOOKS.length; n += 1)
      if (upgrades.includes(`feather-${n}`)) tier = n + 1;
    return tier;
  }

  featherLook() {
    const tier = this.featherTier();
    if (tier === 7) return 1 + Math.floor(Math.random() * 6);
    return Math.min(tier, FEATHER_LOOKS.length - 1);
  }

  sweepFeathers() {
    const tier = this.featherTier();
    const changed = this.shownTier !== undefined && tier > this.shownTier;
    this.shownTier = tier;
    if (!changed) return;
    this.featherData.forEach((p) => {
      if (p.look === undefined) return;
      /* eslint-disable no-param-reassign */
      p.from = p.look;
      p.look = this.featherLook();
      p.sweepAt = this.time + ((p.at.x + 6) / 12) * 0.9 + Math.random() * 0.15;
      /* eslint-enable no-param-reassign */
    });
    if (this.game.state.options.castSound)
      playNotes([784, 1047, 1319], { gap: 0.06, volume: 0.05 });
  }

  fallStep(p, delta, still, petal) {
    /* eslint-disable no-param-reassign */
    const air = this.wind.sample(p.at, this.air);
    if (!petal) this.aroundPeach(p.at, air);
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
      const turn = this.time * p.flutter * 2 + p.seed;
      const across = Math.cos(turn);
      p.heading +=
        Math.sin(this.time * 0.23 + p.seed * 3) * 0.5 * delta * still;
      const step = 0.45 * across * delta * still;
      p.at.x += Math.cos(p.heading) * step;
      p.at.z -= Math.sin(p.heading) * step * 0.5;
      p.at.y -= p.fall * (2.2 * across * across - 1.1) * delta * still;
      p.flyQ
        .setFromEuler(
          this.turn.set(FACE_CAMERA, p.heading, 0.55 * Math.sin(turn)),
        )
        .multiply(LIE_FLAT)
        .multiply(this.spinQ.setFromAxisAngle(FACING, p.rot.z));
    } else {
      p.at.x += swing * 0.9 * delta * still;
      p.at.y +=
        (-p.fall * (1.4 * swing * swing - 0.7) + 0.12 * glide * glide) *
        delta *
        still;
    }
    p.rot.addScaledVector(p.spin, delta * still * (0.5 + p.v.length() * 0.8));
    const cam = this.viewMiddle(p.at.z);
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
    }
    if (petal) {
      this.touchPeach(p);
      return;
    }
    const center = this.home;
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
      if (this.time - (p.bumped ?? -9) > 3) {
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

  touchPeach(p) {
    /* eslint-disable no-param-reassign */
    if (!this.peachHere()) {
      p.shell = undefined;
      return;
    }
    const center = this.i.group.position;
    const off = this.from.copy(p.at).sub(center);
    const s = this.ellipse(off);
    if (s >= 1 || s < 1e-3) {
      p.shell = undefined;
      return;
    }
    if (p.shell === undefined || this.time - p.shellAt > 0.15)
      this.measureShell(p, off, s);
    if (s > p.shell) return;
    p.at.copy(center).addScaledVector(off, p.shell / s);
    const n = this.surfaceNormal(off);
    p.v.addScaledVector(n, -Math.min(0, p.v.dot(n)));
    const seen = this.slope.copy(this.camera.position).sub(p.at).normalize();
    if (n.y < 0.2 || n.dot(seen) < 0.35) return;
    if (this.time - (p.bumped ?? -9) < 1) return;
    p.v.multiplyScalar(0.3);
    p.land = {
      local: this.i.peach.toLocal(p.at, new Vector3()),
      last: p.at.clone(),
      rest: 0,
      stay: rand(1.5, 4),
    };
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
    const center = this.home;
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
    const { i } = this;
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

  peachHere() {
    const { phase } = this.i;
    return phase === "live" || phase === "charging";
  }

  // Holds still while the peach is gone or flying back in, so helpers do not chase it.
  followPeach(delta) {
    const at = this.i.group.position;
    if (!this.peachHere()) {
      this.homeBlend = 0;
      return this.home;
    }
    this.homeBlend = Math.min(1, this.homeBlend + delta / 0.6);
    if (this.homeBlend < 1) this.home.lerp(at, Math.min(1, delta * 6));
    else this.home.copy(at);
    return this.home;
  }

  measure(delta) {
    this.measureTimer -= delta;
    if (this.measureTimer > 0 || !this.i.peach.mesh || !this.peachHere())
      return;
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
      this.bounds.z = Math.max(this.bounds.z, Math.abs(this.tmp.z));
    }
  }

  kneadPeach(delta, owned) {
    const { i } = this;
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
        length: 1.4 + Math.random() * 0.6,
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
    const press = 1 + Math.sin(k.age * 5.25) * 0.2;
    const a = k.age * 3 * k.spin;
    this.kneadPull
      .copy(this.kneadSide)
      .multiplyScalar(Math.cos(a))
      .addScaledVector(this.kneadUp, Math.sin(a))
      .multiplyScalar((0.09 * amount) / scale);
    this.kneadDent
      .copy(this.kneadNormal)
      .multiplyScalar((-0.15 * amount * press) / scale);
    peach.setGrab(this.kneadLocal, this.kneadPull, 0.9, this.kneadDent, 0.6);
    const stroke = Math.floor(Math.abs(a) / Math.PI);
    if (stroke !== k.stroke) {
      k.stroke = stroke;
      if (this.game.state.options.castSound)
        playKnead(i.oil, Math.max(0.4, amount));
    }
    k.pulse = (k.pulse ?? 0) - delta;
    if (k.pulse <= 0) {
      k.pulse = 0.47;
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
    const y = rand(-1.5, 2);
    const z = rand(-2, 1);
    const wide = this.halfHeight(z) * this.camera.aspect + 0.6;
    this.petalData
      .slice(0, count)
      .filter((p) => {
        if (p.land) return false;
        const high = this.halfHeight(p.at.z);
        const view = this.viewMiddle(p.at.z);
        return (
          Math.abs(p.at.x - view.x) > high * this.camera.aspect + 0.2 ||
          Math.abs(p.at.y - view.y) > high + 0.2
        );
      })
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .forEach((p) => {
        p.at.set(
          this.viewMiddle(z).x - gustDir * (wide + rand(0, 3)),
          y + rand(-1.2, 1.2),
          z + rand(-0.9, 0.9),
        );
        p.v.set(gustDir * 0.4, 0, 0);
        // eslint-disable-next-line no-param-reassign
        p.born = this.time;
      });
  }

  stepLead(delta, radius) {
    const L = this.lead;
    L.a += delta * 0.7 * (1 + 0.4 * Math.sin(L.a));
    const t = this.lineClock;
    L.at
      .set(Math.cos(L.a) * radius, 0, Math.sin(L.a) * radius * 0.9)
      .applyAxisAngle(LINE_TILT, 0.42 + 0.18 * Math.sin(t * 0.09))
      .applyAxisAngle(LINE_ROLL, 0.28 * Math.sin(t * 0.061 + 1))
      .applyAxisAngle(LINE_UP, t * 0.05);
    L.at.y += 0.4;
    this.lineTrail.unshift({ t: this.lineClock, at: L.at.clone() });
    const tr = this.lineTrail;
    while (tr.length > 2 && this.lineClock - tr[tr.length - 1].t > 10) tr.pop();
  }

  // Sampled between recorded points so hearts never step from frame to frame.
  lineAt(delay, out) {
    const tr = this.lineTrail;
    const want = this.lineClock - delay;
    if (want <= tr[tr.length - 1].t) return out.copy(tr[tr.length - 1].at);
    for (let n = 0; n < tr.length - 1; n += 1) {
      const a = tr[n];
      const b = tr[n + 1];
      if (b.t <= want)
        return out
          .copy(b.at)
          .lerp(a.at, (want - b.t) / Math.max(a.t - b.t, 1e-6));
    }
    return out.copy(tr[0].at);
  }

  lineVelAt(delay, out) {
    this.lineAt(Math.max(0, delay - 0.03), out);
    return out.sub(this.lineAt(delay + 0.03, this.lineBack)).divideScalar(0.06);
  }

  spawnHeart(h, center, tail) {
    /* eslint-disable no-param-reassign */
    const spot = this.lineAt(tail + JOIN_LAG, this.lineSpot);
    const z = center.z + Math.max(-0.5, Math.min(1.4, spot.z));
    const wide = this.halfHeight(z) * this.camera.aspect + 0.5;
    const side = Math.sign(spot.x) || -1;
    h.off ??= new Vector3();
    h.v ??= new Vector3();
    h.vs ??= new Vector3();
    h.at ??= new Vector3();
    h.from ??= new Vector3();
    h.fromV ??= new Vector3();
    h.to ??= new Vector3();
    h.push ??= new Vector3();
    h.pushV ??= new Vector3();
    h.off.set(
      this.camera.position.x + side * wide - center.x,
      spot.y + rand(-0.3, 0.3),
      z - center.z,
    );
    h.v.set(-side * 2, rand(-0.2, 0.2), 0);
    h.vs.copy(h.v);
    h.span = Math.max(1.3, Math.min(2.4, h.off.distanceTo(spot) / 1.7));
    // The approach is kept as an offset from the moving join point, so it fades out onto the line.
    h.from.copy(h.off).sub(spot);
    h.fromV.copy(h.v).sub(this.lineVelAt(tail + JOIN_LAG, this.lineVel));
    h.at.copy(center).add(h.off);
    h.push.set(0, 0, 0);
    h.pushV.set(0, 0, 0);
    Object.assign(h, {
      live: true,
      phase: "join",
      order: this.heartOrder,
      born: this.lineClock,
      since: this.lineClock,
      delay: tail + JOIN_LAG,
      delayV: 0,
      bank: 0,
      aim: 0,
    });
    this.heartOrder += 1;
    /* eslint-enable no-param-reassign */
  }

  startKiss(h, center, radius) {
    /* eslint-disable no-param-reassign */
    const hit = this.toucher.hitFrom(h.at);
    if (hit) h.to.copy(hit.point).sub(center);
    else h.to.copy(h.off).setLength(radius * 0.5);
    const n = this.lineBack.copy(h.to).normalize();
    h.out ??= new Vector3();
    h.out.copy(n);
    h.to.addScaledVector(n, 0.06);
    const point = Math.atan2(-n.y, -n.x) + Math.PI / 2;
    let turn = point - h.bank;
    turn -= 2 * Math.PI * Math.round(turn / (2 * Math.PI));
    h.aim = h.bank + Math.max(-0.7, Math.min(0.7, turn));
    h.bankFrom = h.bank;
    h.span = Math.max(1.3, Math.min(1.8, h.off.distanceTo(h.to) / 0.9));
    h.slide ??= new Vector3();
    h.phase = "dive";
    h.since = this.lineClock;
    /* eslint-enable no-param-reassign */
  }

  skinBelow(h, spot, peach, radius) {
    const dir = this.lineBack.copy(spot).normalize();
    const hit = this.toucher.hitFrom(
      this.lineVel.copy(peach).addScaledVector(dir, radius + 0.5),
    );
    if (!hit) return;
    h.out.copy(dir);
    h.to.copy(hit.point).sub(peach).addScaledVector(dir, 0.06);
  }

  kiss(h) {
    const hit = this.toucher.hitFrom(h.at);
    if (!hit) return;
    const { peach, settings } = this.i;
    peach.addJiggle(hit.point, this.toucher.dir, 0.045, 0.5);
    const slot = this.kissRings.find((r) => r.age >= 1) || this.kissRings[0];
    const out = this.lineBack.copy(this.toucher.dir).negate();
    slot.ring.position.copy(hit.point).addScaledVector(out, 0.03);
    slot.ring.quaternion.setFromUnitVectors(Z_AXIS, out);
    slot.flash.position.copy(hit.point).addScaledVector(out, 0.1);
    slot.age = 0;
    if (settings.handprints)
      peach.addHandprint(
        hit.point,
        hit.face.normal,
        rand(-0.4, 0.4),
        false,
        0.8,
        1,
        0.7,
        PRINT_KIND.kiss,
      );
    if (this.game.state.options.castSound) {
      this.toucher.soundTimer = 0.3;
      playKiss();
    }
  }

  kissBurst(at, out) {
    let made = 0;
    this.kissSparks.forEach((s) => {
      /* eslint-disable no-param-reassign */
      if (made >= 5 || s.age < 1) return;
      made += 1;
      s.v
        .set(rand(-1, 1), rand(-1, 1), rand(-1, 1))
        .normalize()
        .addScaledVector(out, 1.4)
        .setLength(rand(0.5, 0.9));
      s.age = 0;
      s.sprite.position.copy(at);
      /* eslint-enable no-param-reassign */
    });
  }

  heartFlock(delta, count, still) {
    /* eslint-disable no-param-reassign */
    const peach = this.i.group.position;
    const here = this.peachHere();
    const center = this.home;
    // The measured bounds swing with every jiggle, so the orbit eases toward them.
    const reach = this.bounds.x + 1;
    this.lineRadius = this.lineRadius
      ? this.lineRadius + (reach - this.lineRadius) * Math.min(1, delta * 0.6)
      : reach;
    const radius = this.lineRadius;
    // The line follows a soft spring behind the peach instead of every jolt.
    this.lineAnchor ??= center.clone();
    const anchor = this.lineAnchor;
    this.anchorV.addScaledVector(
      this.lineBase
        .copy(center)
        .sub(anchor)
        .multiplyScalar(25)
        .addScaledVector(this.anchorV, -10),
      delta,
    );
    anchor.addScaledVector(this.anchorV, delta);
    const d = delta * still;
    this.lineClock += d;
    const clock = this.lineClock;
    this.stepLead(d, radius);
    const leaving = (h) =>
      h.phase === "dive" || h.phase === "press" || h.phase === "pop";
    this.hearts.forEach((h, n) => {
      if (n >= count && !leaving(h)) h.live = false;
    });
    const line = this.hearts
      .filter((h) => h.live && !leaving(h))
      .sort((a, b) => a.order - b.order);
    this.heartGate -= delta;
    const free = this.hearts.find((h, n) => n < count && !h.live);
    if (free && this.heartGate <= 0) {
      const last = line[line.length - 1];
      const tail = Math.max(
        0.2 + line.length * LINE_GAP,
        last ? last.delay + LINE_GAP : 0,
      );
      this.spawnHeart(free, anchor, tail);
      line.push(free);
      this.heartGate = rand(0.22, 0.34);
    }

    this.diveTimer -= d;
    const head = line[0];
    if (this.diveTimer <= 0 && head) {
      const ready =
        here &&
        head.phase === "line" &&
        clock - head.born > 3 &&
        head.off.z > 0.5 &&
        Math.abs(head.off.x) < radius * 0.85;
      if (ready) {
        this.diveTimer = rand(1.2, 3) / (1 + level(count, HEARTS));
        this.startKiss(head, peach, radius);
        line.shift();
      } else this.diveTimer = 0.1;
    }

    const settle = (u) => u * u * u * (u * (u * 6 - 15) + 10);
    const spot = this.lineSpot;
    line.forEach((h, rank) => {
      const goal = 0.2 + rank * LINE_GAP;
      h.delayV += (6.8 * (goal - h.delay) - 5.2 * h.delayV) * d;
      h.delay += h.delayV * d;
      this.lineAt(h.delay, spot);
      if (h.phase === "join") {
        const age = clock - h.since;
        const u = Math.min(1, age / h.span);
        spot
          .addScaledVector(h.from, 1 - settle(u))
          .addScaledVector(h.fromV, age * (1 - settle(u)));
        if (u >= 1) h.phase = "line";
      }
      h.v.copy(spot).sub(h.off).divideScalar(Math.max(d, 1e-4));
      h.off.copy(spot);
    });
    this.hearts.forEach((h) => {
      if (!h.live || !leaving(h)) return;
      if (!here && h.phase !== "pop") {
        h.phase = "pop";
        h.since = clock;
        h.off.copy(h.at).sub(peach);
        h.to.copy(h.off);
        h.out.copy(h.off).normalize();
      }
      const age = clock - h.since;
      if (h.phase === "dive") {
        const u = Math.min(1, age / h.span);
        h.delay += d * 0.65 * u * u * (3 - 2 * u);
        this.lineAt(h.delay, spot);
        this.skinBelow(h, spot, peach, radius);
        spot.lerp(h.to, settle(u));
        h.v.copy(spot).sub(h.off).divideScalar(Math.max(d, 1e-4));
        h.off.copy(spot);
        if (u >= 1) {
          h.slide.copy(h.v).addScaledVector(h.out, -h.v.dot(h.out));
          h.phase = "press";
          h.since = clock;
          h.at.copy(peach).add(h.off);
          this.kiss(h);
        }
      } else if (h.phase === "press") {
        h.off.copy(h.to).addScaledVector(h.slide, (1 - Math.exp(-6 * age)) / 6);
        if (age < PRESS_TIME) return;
        h.to.copy(h.off);
        h.phase = "pop";
        h.since = clock;
        this.kissBurst(h.at, h.out);
      } else if (h.phase === "pop") {
        const k = Math.min(1, age / POP_TIME);
        h.off.copy(h.to).addScaledVector(h.out, 0.28 * (1 - (1 - k) ** 3));
        if (k >= 1) h.live = false;
      }
    });

    this.hearts.forEach((h) => {
      const { sprite } = h;
      sprite.visible = !!h.live;
      if (!h.live) return;
      const age = clock - h.since;
      const base = this.lineBase.copy(anchor);
      if (h.phase === "dive")
        base.lerp(peach, settle(Math.min(1, age / h.span)));
      else if (leaving(h)) base.copy(peach);
      this.wind.kick(h.at, h.pushV, delta);
      h.pushV
        .addScaledVector(h.push, -18 * delta)
        .multiplyScalar(Math.exp(-delta * 6));
      h.push.addScaledVector(h.pushV, delta);
      if (leaving(h)) h.push.multiplyScalar(Math.exp(-delta * 8));
      h.at.copy(base).add(h.off).add(h.push);
      sprite.position.copy(h.at);
      const depth = Math.max(-1, Math.min(1, h.off.z / radius));
      const near = (depth + 1) / 2;
      const life = clock - h.born;
      const g = Math.min(1, life / 0.8) - 1;
      const grow = 1 + 2.7 * g * g * g + 1.7 * g * g;
      let scale = 0.22 * grow * (0.8 + 0.35 * near);
      let opacity = Math.min(1, life / 0.5) * (0.5 + 0.45 * near);
      let wide = 1;
      let tall = 1;
      let rock = 0;
      if (h.phase === "pop") {
        const k = Math.min(1, age / POP_TIME);
        scale *= 1 + 0.45 * (1 - (1 - k) ** 3);
        opacity *= (1 - k) ** 1.6;
      } else if (h.phase === "press") {
        const s =
          Math.exp(-14 * age) *
          Math.cos(26 * age) *
          Math.sin(Math.min(1, age / 0.04) * (Math.PI / 2));
        wide = 1 + 0.4 * s;
        tall = 1 - 0.32 * s;
        rock = 0.12 * Math.exp(-10 * age) * Math.sin(22 * age);
      }
      const before = this.lineVel.copy(h.vs);
      h.vs.lerp(h.v, Math.min(1, delta * 6));
      const turn =
        (before.x * h.vs.y - before.y * h.vs.x) /
        Math.max(h.vs.x * h.vs.x + h.vs.y * h.vs.y, 0.2) /
        Math.max(delta, 1e-4);
      const bank = Math.max(-0.6, Math.min(0.6, turn * 0.18 - h.vs.x * 0.08));
      if (leaving(h)) {
        const u = h.phase === "dive" ? Math.min(1, age / h.span) : 1;
        h.bank = h.bankFrom + (h.aim - h.bankFrom) * settle(u);
      } else h.bank += (bank - h.bank) * Math.min(1, delta * 6);
      sprite.scale.set(scale * wide, scale * tall, 1);
      sprite.material.rotation = h.bank + rock;
      sprite.material.color
        .copy(depth < 0 ? HEART_FAR : WHITE)
        .lerp(depth < 0 ? WHITE : HEART_NEAR, depth < 0 ? depth + 1 : depth);
      sprite.material.opacity = opacity;
    });

    this.kissSparks.forEach((s) => {
      const { sprite } = s;
      sprite.visible = s.age < 1;
      if (s.age >= 1) return;
      s.age += delta / 0.42;
      s.v.multiplyScalar(Math.exp(-delta * 3));
      s.v.y += 0.3 * delta;
      sprite.position.addScaledVector(s.v, delta);
      sprite.scale.setScalar(0.1 * (1 - s.age * 0.6));
      sprite.material.opacity = Math.max(0, 1 - s.age) ** 1.5 * 0.8;
    });
    this.kissRings.forEach((r) => {
      r.flash.visible = r.age < 0.5;
      if (r.age >= 1) {
        r.ring.visible = false;
        return;
      }
      r.age = Math.min(1, r.age + delta / 0.34);
      showRing(r.ring, r.age, 0.15, 0.6, 0.22);
      const k = Math.min(1, r.age * 2);
      r.flash.scale.setScalar(0.25 + 0.3 * (1 - (1 - k) ** 3));
      r.flash.material.opacity = (1 - k) ** 2 * 0.35;
    });
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
    const { i } = this;
    const still = reducedMotion.matches ? 0.15 : 1;
    const own = (id) => (helpers[id] || 0) * this.presence(id);
    const center = this.followPeach(delta);
    this.measure(delta);
    this.sweepFeathers();
    this.steady();
    if (!this.anchor) this.anchor = center.clone();
    this.anchor.lerp(center, ease(0.5, delta));
    const rest = this.anchor;
    this.wind.update(delta, this.halfHeightAt);

    this.toucher
      .due(delta)
      .filter((id) => id !== "coach" && Math.random() < this.presence(id))
      .forEach((id) => {
        if (id === "paddle") this.paddles.swing(id);
        else this.toucher.touch(id, this.toucher.randomHit());
      });
    this.paddles.update(delta);
    this.extras.update(delta);
    this.sippers.update(delta);

    this.drift(
      this.feathers,
      this.featherData,
      this.arrive("feather", crowd(own("feather"), 36), delta),
      delta,
      1,
    );
    this.drift(
      this.petals,
      this.petalData,
      this.arrive("petal", crowd(own("admirer"), 40), delta),
      delta,
      0.22,
    );

    this.kneadPeach(delta, own("masseuse"));
    this.coachBeat(delta, own("coach"));
    this.oil.update(
      delta,
      this.arrive(
        "oil",
        Math.max(Math.sign(own("baron")), crowd(own("baron"), 3)),
        delta,
      ),
      this.bounds,
    );
    this.lifecycle(
      this.notes,
      this.arrive("note", crowd(own("choir"), 10, 50), delta),
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

    this.heartFlock(
      delta,
      this.arrive("heart", crowd(own("admirer"), HEARTS), delta),
      still,
    );
    if (this.wind.gustStarted)
      this.puff(Math.round(40 * level(own("admirer"))));

    this.lifecycle(
      this.fog,
      this.arrive("fog", crowd(own("spa"), 6, 50), delta),
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

    const drops = this.arrive("drop", crowd(own("press"), 16, 50), delta);
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
    this.renderer.getDrawingBufferSize(
      glowingJuiceMaterial.uniforms.uResolution.value,
    );
    this.droplets.instanceMatrix.needsUpdate = true;

    const candles = this.arrive("candle", crowd(own("cult"), 12, 50), delta);
    this.floatCandles(delta, candles, rest, still);

    const moon = level(own("moon"), 50);
    this.moon.visible = own("moon") > 0;
    if (helpers.moon && !this.moonShaped && i.peach.mesh) {
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

    const streaks = this.arrive(
      "streak",
      Math.max(Math.sign(own("collider")), crowd(own("collider"), STREAKS, 50)),
      delta,
    );
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
        (0.35 + level(own("singularity"), 50) * 0.65) * this.lensFade,
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
      const pixelRatio = this.renderer.getPixelRatio();
      this.stars.update(t * still, cosmos, pixelRatio);
      this.galaxy.update(t * still, cosmos);
      this.constellation.update(t * still, cosmos, pixelRatio);
    }
  }
}
