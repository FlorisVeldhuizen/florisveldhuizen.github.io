import {
  AdditiveBlending,
  Color,
  Group,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";
import { softTexture, twinkleTexture } from "../shapes";
import { beforeDraw, rider, skinLayer } from "./skin-layer";

const FLASHES = 8;
const SINGLE = [1.4, 3.4];
const BURST = [4, 7];
const GAP = [0.08, 0.24];
const POSE = { jiggle: 0.06, radius: 0.9, sway: 0.55, squash: 0.8 };
const DECAY = 13;
const FLASH_COLOR = new Color(0xfff6ec);
const KEY_BOOST = 0.45;
const RIM_BOOST = 14;
const RIM_REACH = 5;

const WASH_HEADER = `
  uniform vec3 uFlashDir;
  uniform float uFlash;
  uniform float uPeak;
  uniform vec3 uSkinTint;
`;

const WASH_BODY = `
  vec3 eye = normalize(vViewPosition);
  float facing = max(dot(normal, uFlashDir), 0.0);
  float rim = pow(1.0 - max(dot(normal, eye), 0.0), 2.0);
  vec3 skin = diffuseColor.rgb * uSkinTint;
  vec3 light = mix(vec3(1.0, 0.97, 0.93), skin, 0.5);
  float wash = (pow(facing, 1.3) * 0.055 + rim * facing * 0.09) * uFlash + facing * uPeak * 0.035;
  diffuseColor.rgb = light * wash;
`;

const WASH_AFTER = `
  outgoingLight = diffuseColor.rgb;
`;

const between = ([lo, hi]) => lo + Math.random() * (hi - lo);

// The flash goes on top of what the mood wrote this frame and comes off again before the next frame's writes.
function borrow(light) {
  const base = { intensity: 0, color: new Color(), position: new Vector3() };
  const written = { intensity: 0, color: new Color(), position: new Vector3() };
  let lent = false;
  return {
    base,
    take() {
      base.intensity = light.intensity;
      base.color.copy(light.color);
      base.position.copy(light.position);
    },
    set(intensity, color, position) {
      Object.assign(light, { intensity });
      light.color.copy(color);
      light.position.copy(position);
      written.intensity = light.intensity;
      written.color.copy(light.color);
      written.position.copy(light.position);
      lent = true;
    },
    restore() {
      if (!lent) return;
      lent = false;
      if (light.intensity === written.intensity)
        Object.assign(light, { intensity: base.intensity });
      if (light.color.equals(written.color)) light.color.copy(base.color);
      if (light.position.equals(written.position))
        light.position.copy(base.position);
    },
  };
}

function sounds(ctx) {
  const click = (t, volume, hz) => {
    const ac = ctx.audio();
    const s = ac.createBufferSource();
    s.buffer = ctx.noiseBuffer();
    const f = ac.createBiquadFilter();
    f.type = "bandpass";
    f.frequency.value = hz;
    f.Q.value = 1.4;
    const g = ac.createGain();
    g.gain.setValueAtTime(volume, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.018);
    s.connect(f).connect(g).connect(ctx.audioOut());
    s.start(t, Math.random(), 0.03);
  };
  return {
    shutter(volume = 1) {
      const t = ctx.audio().currentTime;
      click(t, 0.09 * volume, 3200);
      click(t + 0.05, 0.06 * volume, 2300);
    },
    whine() {
      const ac = ctx.audio();
      const t = ac.currentTime;
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.frequency.setValueAtTime(2600, t);
      o.frequency.exponentialRampToValueAtTime(6800, t + 0.7);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.004, t + 0.1);
      g.gain.linearRampToValueAtTime(0, t + 0.7);
      o.connect(g).connect(ctx.audioOut());
      o.start(t);
      o.stop(t + 0.75);
    },
  };
}

function build(ctx) {
  const { camera, peach, lights } = ctx;
  const audio = sounds(ctx);
  const keyLight = borrow(lights.key);
  const rimLight = borrow(lights.peachRim);
  const towards = new Vector3();
  const glintAt = new Vector3();
  const tint = new Color();
  const ride = rider(ctx);
  ride.follow();
  const washU = {
    uFlashDir: { value: new Vector3(0, 0, 1) },
    uFlash: { value: 0 },
    uPeak: { value: 0 },
    uSkinTint: { value: peach.skinTint || new Color(1, 1, 1) },
  };
  const pm = peach.material;
  const wash = skinLayer(ctx, ride, {
    key: "paparazzi-wash",
    uniforms: washU,
    header: WASH_HEADER,
    body: WASH_BODY,
    after: WASH_AFTER,
    maps: {
      map: pm.map,
      normalMap: pm.normalMap,
      normalScale: pm.normalScale.clone(),
    },
    blending: AdditiveBlending,
  });

  const star = twinkleTexture();
  const bloom = softTexture("rgba(255,246,235,0.9)", "rgba(255,200,170,0)");
  const additive = (map) =>
    new SpriteMaterial({
      map,
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0,
    });
  const flashes = Array.from({ length: FLASHES }, () => {
    const holder = new Group();
    const glow = new Sprite(additive(bloom));
    const spark = new Sprite(additive(star));
    holder.add(glow, spark);
    holder.visible = false;
    ctx.group.add(holder);
    return { holder, glow, spark, age: 9, power: 0, spin: 0 };
  });
  let warming = true;
  ctx.warm().then(() => {
    warming = false;
  });

  const ndc = new Vector3();
  const ray = new Vector3();
  const dir = new Vector3();
  let next = 1;
  let burst = 0;
  let burstGap = 0;
  let burstTimer = 3;
  let lastSide = 1;
  let flash = 0;
  let peak = 0;
  let due = false;

  const atScreen = (x, y, z, target) => {
    ndc.set(x, y, 0.5).unproject(camera);
    ray.copy(ndc).sub(camera.position).normalize();
    return target
      .copy(camera.position)
      .addScaledVector(ray, (z - camera.position.z) / ray.z);
  };

  const where = (target) => {
    const z = ctx.center().z + 2.4 + Math.random() * 0.8;
    lastSide = Math.random() < 0.7 ? -lastSide : lastSide;
    return atScreen(
      lastSide * (0.72 + Math.random() * 0.2),
      (Math.random() * 2 - 1) * 0.62,
      z,
      target,
    );
  };

  const pose = (scale = 1) => {
    const h = ctx.randomHit();
    if (!h) return;
    ctx.touch(h, {
      ...POSE,
      sway: POSE.sway * scale,
      squash: POSE.squash * scale,
    });
  };

  const pop = (strong) => {
    const f = flashes.reduce((a, b) => (b.age > a.age ? b : a));
    where(f.holder.position);
    f.holder.scale.setScalar(0.6);
    f.age = 0;
    f.power = strong ? 1 : 0.65 + Math.random() * 0.2;
    f.spin = (Math.random() - 0.5) * 0.6;
    f.holder.visible = true;
    audio.shutter(strong ? 1 : 0.7);
  };

  const startBurst = () => {
    burst = Math.round(between(BURST) + ctx.level() * 3);
    burstGap = 0;
    pose(0.9);
    audio.whine();
  };

  const shine = () => {
    if (!due) return;
    due = false;
    ride.follow();
    if (flash <= 0) {
      washU.uFlash.value = 0;
      washU.uPeak.value = 0;
      wash.visible = warming;
      return;
    }
    keyLight.take();
    keyLight.set(
      keyLight.base.intensity + KEY_BOOST * flash,
      tint.copy(keyLight.base.color).lerp(FLASH_COLOR, flash * 0.5),
      keyLight.base.position,
    );
    rimLight.take();
    glintAt
      .copy(ctx.center())
      .addScaledVector(towards, RIM_REACH)
      .lerp(rimLight.base.position, 1 - flash);
    rimLight.set(
      rimLight.base.intensity * (1 - flash) + RIM_BOOST * flash,
      tint.copy(rimLight.base.color).lerp(FLASH_COLOR, flash),
      glintAt,
    );
    washU.uFlashDir.value
      .copy(towards)
      .transformDirection(camera.matrixWorldInverse);
    washU.uFlash.value = flash;
    washU.uPeak.value = peak;
    wash.visible = true;
  };
  const unhook = beforeDraw(ctx.scene, shine);

  ctx.onDispose(() => {
    unhook();
    keyLight.restore();
    rimLight.restore();
    star.dispose();
    bloom.dispose();
  });

  return (dt) => {
    keyLight.restore();
    rimLight.restore();
    due = true;
    const c = ctx.center();
    let total = 0;
    peak = 0;
    towards.set(0, 0, 0);
    flashes.forEach((f) => {
      /* eslint-disable no-param-reassign */
      f.age += dt;
      const a = f.age;
      const hot = a < 0.03 ? a / 0.03 : Math.exp(-(a - 0.03) * DECAY);
      const glow = Math.exp(-a * 3.2);
      const power = f.power * ctx.still ** 0.3;
      f.spark.material.opacity = hot * power;
      f.spark.scale.setScalar((1.1 + 1.8 * hot) * power);
      f.spark.material.rotation = f.spin + a * 0.6;
      f.glow.material.opacity = (hot * 0.9 + glow * 0.15) * power;
      f.glow.scale.setScalar(1.2 + 2.2 * hot);
      f.holder.visible = a < 1.5;
      const lit = hot * power;
      peak = Math.max(peak, Math.exp(-a * 28) * power);
      if (lit > 0.001) {
        towards.addScaledVector(
          dir.copy(f.holder.position).sub(c).normalize(),
          lit,
        );
        total += lit;
      }
      /* eslint-enable no-param-reassign */
    });
    flash = total > 0.001 ? Math.min(1, total) : 0;
    if (flash > 0) towards.normalize();

    if (!ctx.live) return;
    if (burst > 0) {
      burstGap -= dt;
      if (burstGap <= 0) {
        pop(true);
        burst -= 1;
        burstGap = between(GAP);
        if (burst === 2) pose(0.6);
      }
      return;
    }
    next -= dt;
    if (next <= 0) {
      next = between(SINGLE);
      pop(false);
    }
    burstTimer -= dt;
    if (burstTimer <= 0) {
      burstTimer =
        (5.5 * (0.8 + Math.random() * 0.4)) / (1 + ctx.level() * 1.4);
      startBurst();
    }
  };
}

export default {
  id: "paparazzi",
  create(ctx) {
    let step = null;
    const built = () => {
      if (!step && ctx.peach.mesh && ctx.peach.material) step = build(ctx);
      return step;
    };
    built();
    return {
      update(dt) {
        built()?.(dt);
      },
      dispose() {},
    };
  },
};
