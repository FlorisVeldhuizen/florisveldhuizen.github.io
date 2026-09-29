import { Vector2, Vector3, Raycaster, Matrix4, Group, Plane } from "three";
import {
  playSlap,
  playBurst,
  setRub,
  setSlide,
  playSlice,
  playKiss,
  playHeartbeat,
  playSquish,
  playSnap,
  playSlide,
  playSettle,
  playTear,
  playSplash,
  playGlug,
} from "./audio";
import {
  PHYSICS_CONFIG,
  FIRMNESS,
  TOOLS,
  INTERACTION_CONFIG as CFG,
} from "./config";
import { Bottle } from "./bottle";

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const buzz = (ms) => navigator.vibrate?.(ms);
const SLICE_HOLD = 0.42;
const TEARS = [0.22, 0.42, 0.6];
const WINDUP_FROM = 0.72;
const BEAT_LENGTH = 0.32;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function spring(x, v, k, c, h) {
  v.addScaledVector(x, -k * h).multiplyScalar(1 - c * h);
  x.addScaledVector(v, h);
}

export class Interaction {
  constructor({
    scene,
    peach,
    group,
    camera,
    juice,
    droplets,
    lens,
    backdrop,
    ui,
    settings,
    talk,
  }) {
    Object.assign(this, {
      peach,
      group,
      camera,
      juice,
      droplets,
      lens,
      backdrop,
      ui,
      settings,
      talk,
    });

    this.offset = new Vector3();
    this.velocity = new Vector3();
    this.tilt = new Vector3();
    this.spin = new Vector3();
    this.squash = new Vector3();
    this.squashVelocity = new Vector3();
    this.squashAxis = new Vector2(1, 0);
    this.accumulator = 0;
    this.hitStop = 0;
    this.slowmo = 0;
    this.freeze = 0;
    this.trauma = 0;
    this.kick = new Vector3();
    this.kickVelocity = new Vector3();

    this.phase = "hidden";
    this.phaseTime = 0;
    this.clock = 0;
    this.idle = 0;
    this.twerk = null;

    this.heat = 0;
    this.heatHold = 0;
    this.oil = 0;
    this.smacks = 0;
    this.bursts = 0;

    this.combo = 0;
    this.lastSmackAt = -Infinity;
    this.rubPulse = 0;
    this.rubbing = 0;
    this.massage = {
      amount: 0,
      target: 0,
      active: false,
      pulse: 0,
      local: new Vector3(),
      normal: new Vector3(),
      drag: new Vector3(),
      point: new Vector3(),
      pull: new Vector3(),
      dent: new Vector3(),
    };

    this.pointer = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      samples: [],
      present: false,
      inside: false,
      armed: true,
      pressed: false,
      downAt: 0,
      downX: 0,
      downY: 0,
      travel: 0,
    };
    this.raycaster = new Raycaster();
    this.ndc = new Vector2();
    this.parallax = new Vector2();
    this.tempA = new Vector3();
    this.tempB = new Vector3();
    this.screen = new Vector3();

    this.carrying = false;
    this.carryLatched = false;
    this.bottle = new Bottle(scene, camera);
    this.grab = null;
    this.recoil = null;
    this.grabPlane = new Plane();
    this.grabTarget = new Vector3();
    this.lastTapAt = -Infinity;
    this.claps = null;
    this.clapNormal = new Vector3();
    this.beatTimer = 0;
    this.throb = 0;
    this.beatAge = Infinity;
    this.beatAmp = 0;
    this.lastJoltAt = 0;
    this.saidHot = false;
    this.garment = {
      peel: 0,
      worn: true,
      stripping: false,
      target: 0,
      pull: 0,
      velocity: 0,
      visible: 1,
      dressing: null,
      shown: false,
    };
    this.zoom = 0;
    this.zoomVelocity = 0;
    this.listeners = {};
    this.chargeGuard = null;
    this.burstPower = 1;

    this.setFirmness("ripe");
    this.setTool("hand");
    this.bindPointer();
    this.bottle.el.addEventListener("pointerdown", (e) => this.pickBottle(e));
    this.bindShake();
  }

  on(name, listener) {
    (this.listeners[name] ||= []).push(listener);
  }

  emit(name, detail) {
    this.listeners[name]?.forEach((listener) => listener(detail));
  }

  setTool(name) {
    this.toolName = TOOLS[name] ? name : "hand";
    this.tool = TOOLS[this.toolName];
    this.peach.setTool(this.toolName === "lips" ? "lips" : "hand");
    this.ui.setTool(this.toolName);
  }

  setFirmness(name) {
    const before = this.firmness;
    this.firmness = FIRMNESS[name] || FIRMNESS.ripe;
    this.peach.setFirmness(this.firmness);
    if (!before || before === this.firmness || !this.garment.shown) return;
    const change = Math.abs(this.firmness.bulge - before.bulge);
    this.wobbleAll(0.04 + change * 0.05);
    this.squashVelocity.x += 0.5 + change * 0.6;
    this.squashAxis.set(0, 1);
    playSquish(0.25 + change * 0.3);
  }

  bindPointer() {
    const isUi = (e) => e.target instanceof Element && e.target.closest(".ui");
    const p = this.pointer;
    const record = (e) => {
      const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      (events.length ? events : [e]).forEach((ev) => {
        p.samples.push({ x: ev.clientX, y: ev.clientY, t: ev.timeStamp });
      });
      if (p.samples.length > 24) p.samples.splice(0, p.samples.length - 24);
      p.travel += Math.hypot(e.clientX - p.x, e.clientY - p.y);
      p.x = e.clientX;
      p.y = e.clientY;
      this.ui.placeCursor(p.x, p.y);
    };

    window.addEventListener("pointermove", (e) => {
      p.present = !isUi(e);
      record(e);
    });
    window.addEventListener("pointerdown", (e) => {
      if (isUi(e)) return;
      p.present = true;
      record(e);
      p.pressed = true;
      p.armed = true;
      p.downAt = e.timeStamp;
      p.downX = e.clientX;
      p.downY = e.clientY;
      p.travel = 0;
      p.grabbed = false;
      p.downOnPeach = !!this.raycastAt(e.clientX, e.clientY);
      p.onWaistband = this.onWaistband(e.clientX, e.clientY);
    });
    const release = (e) => {
      const tapped =
        e.type === "pointerup" &&
        e.timeStamp - p.downAt < 220 &&
        p.travel < 14;
      if (this.carrying && e.type === "pointerup") {
        this.carryLatched = !this.carryLatched && tapped;
      }
      if (!this.carrying && p.pressed && tapped) {
        this.tap();
      }
      p.pressed = false;
      if (e.pointerType !== "mouse") {
        p.present = false;
        p.inside = false;
        p.armed = true;
      }
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    document.documentElement.addEventListener("pointerleave", () => {
      p.present = false;
      p.inside = false;
      p.armed = true;
      p.pressed = false;
      this.carryLatched = false;
    });
  }

  bindShake() {
    window.addEventListener(
      "wheel",
      (e) => {
        if (e.target instanceof Element && e.target.closest(".ui")) return;
        this.jolt(0, clamp(-e.deltaY / 100, -2, 2) * 1.6);
      },
      { passive: true },
    );
    window.addEventListener("devicemotion", (e) => {
      const a = e.acceleration;
      if (!a || Math.hypot(a.x || 0, a.y || 0) < 7) return;
      this.jolt(-(a.x || 0) / 7, (a.y || 0) / 7);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  requestShake() {
    if (typeof DeviceMotionEvent?.requestPermission === "function")
      DeviceMotionEvent.requestPermission().catch(() => {});
  }

  jolt(x, y) {
    if (this.phase !== "live") return;
    const now = performance.now();
    if (now - this.lastJoltAt < 90) return;
    this.lastJoltAt = now;
    const size = Math.min(3, Math.hypot(x, y));
    this.velocity.x += x;
    this.velocity.y += y;
    this.spin.z += x * 0.6 + (Math.random() - 0.5) * size * 0.5;
    this.spin.x += y * 0.35;
    this.squashVelocity.x += size * 1.1;
    this.squashAxis.set(Math.abs(x), Math.abs(y)).normalize();
    this.wobbleAll(0.05 + size * 0.05);
    this.idle = 0;
    this.twerk = null;
    this.talk.say("shake", 0.2);
  }

  begin() {
    this.enter();
  }

  timeScale(realDelta) {
    if (this.freeze > 0) {
      this.freeze -= realDelta;
      return 0;
    }
    if (this.slowmo <= 0) return 1;
    this.slowmo -= realDelta;
    const k = 1 - Math.max(0, this.slowmo) / 0.5;
    return 0.12 + 0.88 * k * k * k;
  }

  enter() {
    this.phase = "entering";
    this.phaseTime = 0;
    this.group.visible = true;
    this.offset.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
    this.tilt.set(0, 0, 0);
    this.spin.set(0, 0, 0);
    this.squash.set(0, 0, 0);
    this.squashVelocity.set(0, 0, 0);
    this.idle = 0;
    this.dressUp();
  }

  dressUp(animate = false) {
    const g = this.garment;
    Object.assign(g, {
      worn: true,
      stripping: false,
      target: 0,
      pull: 0,
      velocity: 0,
      visible: 1,
      dressing: null,
    });
    if (!this.settings.lingerie || !animate) return;
    g.dressing = { time: 0, landed: false };
    g.pull = 1.5;
    g.target = 1.5;
  }

  undress() {
    const g = this.garment;
    if (!g.shown) return;
    Object.assign(g, {
      worn: false,
      stripping: false,
      dressing: null,
      peel: 0,
      freed: false,
    });
    playSlide(0.5, 3000, 800);
  }

  updateDressing(delta) {
    const g = this.garment;
    g.dressing.time += delta;
    const t = Math.min(1, g.dressing.time / 0.55);
    g.target = t < 1 ? 1.5 - 1.64 * t * t * (3 - 2 * t) : 0;
    if (!g.dressing.landed && (g.pull <= 0 || t >= 1)) {
      g.dressing.landed = true;
      this.snapOn();
    }
    if (g.dressing.time > 0.9) g.dressing = null;
  }

  snapOn() {
    this.wobbleAll(0.08);
    this.squashVelocity.x += 1.24;
    this.squashAxis.set(0, 1);
    playSettle();
    buzz(22);
  }

  pointerSpeed(now) {
    const s = this.pointer.samples;
    let first = s.length - 1;
    while (first > 0 && now - s[first - 1].t < CFG.SAMPLE_WINDOW_MS) first -= 1;
    const a = s[first];
    const b = s[s.length - 1];
    if (!a || a === b || now - b.t > CFG.SAMPLE_WINDOW_MS)
      return { vx: 0, vy: 0, speed: 0 };
    const dt = Math.max(CFG.SAMPLE_MIN_MS, b.t - a.t) / 1000;
    const unit = Math.min(window.innerWidth, window.innerHeight);
    const vx = (b.x - a.x) / dt / unit;
    const vy = (b.y - a.y) / dt / unit;
    return { vx, vy, speed: Math.hypot(vx, vy) };
  }

  raycastAt(x, y) {
    if (!this.peach.mesh) return null;
    this.ndc.set(
      (x / window.innerWidth) * 2 - 1,
      -(y / window.innerHeight) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.ndc, this.camera);
    return this.raycaster.intersectObject(this.peach.mesh, false)[0] || null;
  }

  tap() {
    if (this.phase !== "live") return;
    const now = performance.now();
    if (now - this.lastTapAt < CFG.CLAP_GAP_MS) {
      this.lastTapAt = -Infinity;
      this.claps = { left: 3, timer: 0 };
      this.talk.say("clap", 0.6);
      return;
    }
    this.lastTapAt = now;
    const hit = this.raycastAt(this.pointer.x, this.pointer.y);
    if (hit) this.smack(hit, 0, 0, 0.9);
  }

  smack(hit, vx, vy, strength) {
    const { tool } = this;
    const now = performance.now();
    const tapped = vx === 0 && vy === 0;
    const swipe = tapped
      ? this.tempA.set(0, 0, -1)
      : this.tempA.set(vx, -vy, 0).normalize();
    const normal = this.tempB
      .copy(hit.face.normal)
      .transformDirection(this.peach.mesh.matrixWorld);

    const push = swipe
      .clone()
      .multiplyScalar(0.75)
      .addScaledVector(normal, -0.65)
      .normalize();
    this.peach.addJiggle(
      hit.point,
      push,
      (0.06 + strength ** 1.4 * 0.08) * tool.force,
      tool.reach,
    );

    const knock = strength * tool.force * this.firmness.body;
    this.velocity.addScaledVector(swipe, 1.1 * knock);
    this.velocity.z -= 0.3 * knock;
    const lever = hit.point.clone().sub(this.group.position);
    this.spin.add(lever.cross(swipe).multiplyScalar(0.7 * knock));
    this.squashVelocity.x += 0.7 * strength * tool.force * this.firmness.squash;
    this.squashAxis.set(Math.abs(swipe.x), Math.abs(swipe.y));
    if (tapped) this.squashAxis.set(0.5, 0.5);

    if (this.settings.handprints) {
      const tilt = tapped
        ? (Math.random() - 0.5) * 0.6
        : Math.atan2(swipe.y * Math.sign(swipe.x || 1), Math.abs(swipe.x)) +
          (Math.random() - 0.5) * 0.4;
      this.peach.addHandprint(
        hit.point,
        hit.face.normal,
        tilt,
        swipe.x < 0,
        Math.min(0.9, 0.45 + strength * 0.3),
        this.toolName === "lips"
          ? 1
          : clamp((strength - 0.5) / 0.7, 0, 1) * (0.75 + Math.random() * 0.25),
        tool.print,
      );
    }

    if (this.oil > 0.25) {
      const flung = this.droplets.spray(
        hit.point,
        normal,
        swipe,
        this.oil * strength,
      );
      if (strength > 1) this.lens.splash(flung, this.oil);
    }

    this.combo =
      now - this.lastSmackAt < CFG.COMBO_WINDOW_MS ? this.combo + 1 : 1;
    this.lastSmackAt = now;
    this.smacks += 1;
    this.idle = 0;
    this.twerk = null;
    this.heat = Math.min(
      100,
      this.heat +
        (CFG.HEAT_PER_SMACK + CFG.HEAT_PER_SPEED * strength) * tool.heat,
    );
    this.heatHold = CFG.HEAT_DECAY_DELAY;
    if (strength * tool.force > 1.3) this.hitStop = 0.045;
    this.kickVelocity.addScaledVector(swipe, 0.5 * strength * tool.force);

    if (this.toolName === "lips") {
      playKiss();
    } else {
      playSlap(
        Math.min(1, 0.4 + strength * 0.35),
        this.heat / 100,
        this.oil,
        this.firmness.pitch * tool.pitch,
      );
    }
    this.ui.onSmack(this.smacks, this.combo, this.pointer.x, this.pointer.y);
    if (this.combo >= 5) this.talk.say("combo", 0.5);
    else if (this.toolName === "lips") this.talk.say("kiss", 0.4);
    else this.talk.say("smack", 0.3);
    this.emit("smack", {
      strength,
      x: this.pointer.x,
      y: this.pointer.y,
      combo: this.combo,
      total: this.smacks,
    });

    if (this.heat >= 100) this.charge();
  }

  startGrab(hit) {
    const normal = hit.face.normal.clone().normalize();
    this.recoil = null;
    this.grab = {
      local: this.peach.toLocal(hit.point, new Vector3()),
      normal,
      pull: new Vector3(),
      pullVelocity: new Vector3(),
      localPull: new Vector3(),
      radius: 1.25,
      dent: new Vector3(),
      tension: 0,
      squeeze: 0,
      knead: 0,
      age: 0,
      ripple: 0,
    };
    this.pointer.grabbed = true;
    this.ui.onGrab();
    playSquish(0.2);
    buzz(8);
    this.talk.say("grab", 0.7);
  }

  updateGrab(delta) {
    const g = this.grab;
    const world = this.tempA
      .copy(g.local)
      .applyMatrix4(this.peach.mesh.matrixWorld);
    this.grabPlane.setFromNormalAndCoplanarPoint(
      this.camera.getWorldDirection(this.tempB),
      world,
    );
    this.ndc.set(
      (this.pointer.x / window.innerWidth) * 2 - 1,
      -(this.pointer.y / window.innerHeight) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.ndc, this.camera);
    if (!this.raycaster.ray.intersectPlane(this.grabPlane, this.grabTarget))
      return;
    const target = this.grabTarget.sub(world);
    const give = this.firmness.grab;
    const limit = CFG.GRAB_REACH * give;
    const reach = target.length();
    if (reach > 0)
      target.multiplyScalar((limit * Math.tanh(reach / limit)) / reach);
    const stiffness = (420 * this.firmness.stiffness) / give;
    g.pullVelocity
      .addScaledVector(this.tempB.copy(target).sub(g.pull), stiffness * delta)
      .multiplyScalar(Math.exp(-delta * (10 + (1 - give) * 8)));
    g.pull.addScaledVector(g.pullVelocity, delta);
    g.squeeze += (1 - g.squeeze) * (1 - Math.exp(-delta * 14));
    const length = g.pull.length();
    const speed = g.pullVelocity.length();
    g.tension = length / limit;
    g.age += delta;
    const still =
      g.age > 0.25 &&
      this.pointerSpeed(performance.now()).speed < CFG.GRAB_STILL_SPEED;
    g.knead = still
      ? Math.min(1, g.knead + delta / CFG.GRAB_KNEAD_SECONDS)
      : Math.max(0, g.knead - delta * 1.5);

    const scale = this.peach.worldScale();
    const strain = clamp((g.tension - 0.55) / 0.45, 0, 1);
    const tremble = reducedMotion.matches
      ? 0
      : Math.sin(this.clock * 40) * (0.006 * strain + 0.008 * g.knead);
    const localPull = this.peach
      .toLocal(this.tempB.copy(world).add(g.pull), this.tempB)
      .sub(g.local)
      .addScaledVector(g.normal, tremble / scale);
    g.localPull.copy(localPull);
    g.radius = 1.25 + length * 0.9;
    const depth = g.squeeze * (1 + g.tension * 0.6 + g.knead * 0.9);
    g.dent.copy(g.normal).multiplyScalar((-CFG.GRAB_DENT * depth) / scale);
    this.peach.setGrab(
      g.local,
      localPull,
      g.radius,
      g.dent,
      CFG.GRAB_DENT_RADIUS,
    );
    this.ui.setGrabTension(g.tension);

    g.ripple -= delta;
    if (g.ripple <= 0 && speed > 0.5) {
      g.ripple = 0.06;
      const around = this.tempB
        .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
        .multiplyScalar(0.5)
        .add(world);
      this.peach.addJiggle(
        around,
        g.pullVelocity.clone().normalize(),
        Math.min(0.07, speed * 0.02),
        1,
      );
    }
    this.velocity.addScaledVector(g.pull, 9 * delta);
    const lever = this.tempB.copy(world).sub(this.group.position);
    this.spin.addScaledVector(lever.cross(g.pull), 9 * delta);
    this.heat = Math.min(99, this.heat + 2 * delta * (0.2 + length));
    this.heatHold = CFG.HEAT_DECAY_DELAY;
    this.idle = 0;
    this.twerk = null;
  }

  releaseGrab() {
    const g = this.grab;
    const length = g.pull.length();
    this.velocity.addScaledVector(g.pull, -1.6);
    if (length > 0.08) playSquish(0.2 + length * 0.3);
    if (g.knead > 0.2) {
      const world = this.peach.mesh.localToWorld(g.local.clone());
      const outward = g.normal
        .clone()
        .transformDirection(this.peach.mesh.matrixWorld);
      this.peach.addJiggle(world, outward, 0.04 + g.knead * 0.1, 1);
      this.squashVelocity.x += g.knead * 1.2;
      this.squashAxis.set(0.5, 0.5);
      if (length <= 0.08) playSquish(0.3 * g.knead);
    }
    this.recoil = {
      local: g.local,
      normal: g.normal,
      dent: g.dent.clone(),
      pull: g.localPull.clone(),
      start: g.localPull.clone(),
      velocity: new Vector3(),
      worldPull: g.pull.clone(),
      radius: g.radius,
      length,
      age: 0,
      landed: false,
    };
    this.grab = null;
    this.ui.setGrabTension(0);
  }

  updateRecoil(delta) {
    const r = this.recoil;
    if (!r) return;
    r.age += delta;
    const tension = Math.min(1, r.length / CFG.GRAB_REACH) ** 2;
    const settle = this.firmness.dentFrequency * 0.85;
    const k = r.landed
      ? settle * settle
      : 1100 * this.firmness.stiffness * (1 + tension * 0.8);
    const c = r.landed ? settle * 0.5 : 8;
    const h = 1 / 240;
    for (let t = 0; t < delta; t += h) {
      spring(r.pull, r.velocity, k, c, h);
      if (!r.landed && r.pull.dot(r.start) <= 0) {
        this.landRecoil(r);
        break;
      }
    }
    r.dent.multiplyScalar(Math.exp(-delta * 18));
    this.peach.setGrab(r.local, r.pull, r.radius, r.dent, CFG.GRAB_DENT_RADIUS);
    const motion = r.pull.length() + r.velocity.length() / 40;
    if ((r.landed && motion < r.start.length() * 0.01) || r.age > 1.5) {
      this.peach.releaseGrab();
      this.recoil = null;
    }
  }

  landRecoil(r) {
    r.landed = true;
    const { length, worldPull: pull } = r;
    const punch = Math.min(1, 0.75 / Math.max(length, 0.001));
    r.velocity.setLength(
      r.start.length() * this.firmness.dentFrequency * 0.75 * punch,
    );
    const tension = Math.min(1, length / CFG.GRAB_REACH) ** 2;
    const world = this.tempA
      .copy(r.local)
      .applyMatrix4(this.peach.mesh.matrixWorld);
    const at = this.toScreen(world);
    this.peach.addJiggle(
      world,
      this.tempB.copy(pull).normalize().negate(),
      0.04 + Math.min(0.7, length) * 0.26 + tension * 0.16,
      1,
    );
    this.velocity.addScaledVector(pull, -(1.2 + tension * 1.2) * punch);
    this.spin.addScaledVector(
      this.tempA.sub(this.group.position).cross(pull),
      -1.8 * punch,
    );
    this.squashVelocity.x +=
      0.25 + Math.min(0.75, length) * 1.1 + tension * 0.8;
    this.squashAxis.set(Math.abs(pull.x), Math.abs(pull.y)).normalize();
    this.kickVelocity.addScaledVector(
      pull,
      -(0.6 + tension * 0.8) * length * punch,
    );
    buzz(15 + Math.round(length * 30));
    if (length < 0.08) return;
    if (this.oil > 0.25) {
      const flung = this.droplets.spray(
        this.peach.mesh.localToWorld(r.local.clone()),
        r.normal.clone().transformDirection(this.peach.mesh.matrixWorld),
        pull.clone().normalize().multiplyScalar(-2.2),
        this.oil * (0.3 + Math.min(0.75, length) * 1.2),
        0.25,
      );
      if (tension > 0.5) this.lens.splash(flung, this.oil);
    }
    playSlap(0.4 + length * 0.6, this.heat / 100, this.oil, 1.1);
    this.talk.say("release", 0.6);
    this.heat = Math.min(100, this.heat + 5 * length);
    this.heatHold = CFG.HEAT_DECAY_DELAY;
    this.ui.onSnapback(at.x, at.y, length / CFG.GRAB_REACH);
    if (this.heat >= 100 && this.phase === "live") this.charge();
  }

  cheekPoint(side, dy) {
    const n = this.peach.creaseNormal(this.clapNormal);
    const g = this.group.position;
    this.raycaster.set(
      this.tempA.set(g.x + n.x * side * 0.75, g.y + dy, 20),
      this.tempB.set(0, 0, -1),
    );
    return this.raycaster.intersectObject(this.peach.mesh, false)[0] || null;
  }

  canStrip() {
    return (
      this.settings.lingerie && this.garment.worn && !this.garment.dressing
    );
  }

  onWaistband(x, y) {
    if (!this.canStrip()) return false;
    const hit = this.raycastAt(x, y);
    return !!hit && this.peach.heightAt(hit.point) > CFG.WAISTBAND_FROM;
  }

  isStripPull() {
    const p = this.pointer;
    const vertical = Math.abs(p.y - p.downY);
    return (
      p.onWaistband &&
      vertical > 24 &&
      Math.abs(p.x - p.downX) < vertical * 0.6 &&
      p.travel < vertical * 1.4
    );
  }

  startStrip() {
    this.garment.stripping = true;
    playSquish(0.2);
    this.talk.say("strip", 0.6);
  }

  updateStrip() {
    const p = this.pointer;
    const g = this.garment;
    const wanted = clamp(
      (p.y - p.downY) / (window.innerHeight * 0.22),
      -0.6,
      1,
    );
    g.target = wanted < 0 ? -0.42 * Math.tanh(-wanted / 0.42) : wanted;
    this.rubbing = clamp(Math.abs(g.velocity) * 0.3, 0, 0.6);
    if (g.pull < 0) {
      const hike = Math.min(1, -g.pull / 0.45);
      const lifting = Math.max(0, -0.17 - g.pull) / 0.2;
      g.liftHold = lifting > 0 ? (g.liftHold || 0) + 1 / 60 : 0;
      const giving = Math.min(1, g.liftHold / 0.9) ** 2;
      const t = this.clock;
      const tugBack = Math.max(0, Math.sin(t * 2.6)) ** 2;
      this.velocity.y +=
        (hike * 2 + lifting * 24 * giving - lifting * tugBack * 5) * (1 / 60);
      this.spin.z += Math.sin(t * 4.1) * 0.05 * lifting;
      this.spin.x += Math.sin(t * 2.9 + 1.3) * 0.025 * lifting;
      this.squashAxis.set(0, 1);
      this.squashVelocity.x -= hike * hike * 0.3;
      const notch = Math.floor(-g.pull / 0.06);
      if (notch > (g.notch || 0) && g.velocity < 0) {
        g.velocity += 0.5 + hike * 0.6;
        [1, -1].forEach((side) => {
          const hit = this.cheekPoint(side, 0.45);
          if (hit)
            this.peach.addJiggle(
              hit.point,
              this.tempB.set(0, 1, -0.3).normalize(),
              0.02 + hike * 0.03,
              1,
            );
        });
        buzz(4);
      }
      g.notch = notch;
      this.heat = Math.min(99, this.heat + hike * 0.3);
      this.heatHold = CFG.HEAT_DECAY_DELAY;
      if (hike > 0.6) this.talk.say("wedgie", 0.02);
    } else {
      g.notch = 0;
    }
    this.idle = 0;
    this.twerk = null;
    if (g.target >= 1) this.removeGarment();
  }

  endStrip() {
    const g = this.garment;
    g.stripping = false;
    if (!g.worn) return;
    if (g.pull < -0.04) {
      this.snapWedgie(Math.min(1, -g.pull / 0.45));
      return;
    }
    const amount = clamp(g.pull, 0, 1);
    if (amount < 0.05) return;
    [1, -1].forEach((side) => {
      const hit = this.cheekPoint(side, 0.75 - amount * 0.9);
      if (hit)
        this.peach.addJiggle(
          hit.point,
          this.tempB.set(0, -0.3, -1).normalize(),
          0.05 + amount * 0.12,
          0.9,
        );
    });
    this.squashVelocity.x += amount * 1.4;
    this.squashAxis.set(0, 1);
    this.kickVelocity.y += amount * 0.4;
    playSnap(amount);
    buzz(10 + Math.round(amount * 25));
    this.talk.say("snap", 0.7);
    this.heat = Math.min(100, this.heat + 10 * amount);
    this.heatHold = CFG.HEAT_DECAY_DELAY;
    if (this.heat >= 100) this.charge();
  }

  snapWedgie(amount) {
    [1, -1].forEach((side) => {
      const hit = this.cheekPoint(side, 0.3);
      if (hit)
        this.peach.addJiggle(
          hit.point,
          this.tempB.set(side * 0.3, -1, -0.4).normalize(),
          0.08 + amount * 0.14,
          1,
        );
    });
    this.wobbleAll(0.04 + amount * 0.06);
    this.velocity.y -= 1 + amount * 1.6;
    this.squashVelocity.x += 0.8 + amount * 1.8;
    this.squashAxis.set(0, 1);
    this.kickVelocity.y -= amount * 0.6;
    playSnap(Math.min(1, 0.4 + amount * 0.8));
    playSlap(0.4 + amount * 0.5, this.heat / 100, this.oil, 1.2);
    buzz(20 + Math.round(amount * 30));
    this.talk.say("wedgie", 0.8);
    this.emit("wedgie", { amount });
    this.heat = Math.min(100, this.heat + 8 + 12 * amount);
    this.heatHold = CFG.HEAT_DECAY_DELAY;
    if (this.heat >= 100) this.charge();
  }

  removeGarment() {
    const g = this.garment;
    g.worn = false;
    g.stripping = false;
    g.peel = 0;
    g.freed = false;
    buzz(30);
    playSnap(0.6);
    this.talk.say("stripped");
    this.emit("stripped");
    this.heat = Math.min(100, this.heat + 20);
    this.heatHold = CFG.HEAT_DECAY_DELAY;
  }

  updateGarment(delta) {
    const g = this.garment;
    if (!this.settings.lingerie && (g.worn || g.visible <= 0)) {
      g.shown = false;
      this.peach.setLingerie(false, 0, 0);
      return;
    }
    if (g.worn) {
      if (g.dressing) this.updateDressing(delta);
      const target = g.stripping || g.dressing ? g.target : 0;
      const hike = clamp(-g.pull / 0.45, 0, 1);
      g.velocity += (target - g.pull) * 420 * (1 - 0.5 * hike) * delta;
      g.velocity *= Math.exp(-delta * 14);
    } else if (g.visible > 0) {
      g.peel += delta;
      g.velocity += (1.9 - g.pull) * 70 * delta;
      g.velocity *= Math.exp(-delta * 6);
      if (!g.freed && g.pull > 1.05) {
        g.freed = true;
        this.wobbleAll(0.1);
        this.velocity.y += 0.6;
        this.squashVelocity.x += 1.4;
        this.squashAxis.set(0, 1);
        playSquish(0.7);
      }
      if (g.pull > 1.55) g.visible = Math.max(0, g.visible - delta * 5);
    }
    g.pull += g.velocity * delta;
    setSlide(
      g.dressing ? Math.abs(g.velocity) / 5 : 0,
      clamp(1 - g.pull / 1.5, 0, 1),
    );
    this.peach.setLingerie(true, g.pull, g.visible);
    g.shown = true;
  }

  updateClaps(delta) {
    if (!this.claps || this.phase !== "live") {
      this.claps = null;
      return;
    }
    this.claps.timer -= delta;
    if (this.claps.timer > 0) return;
    this.claps.timer = 0.16;
    this.claps.left -= 1;
    if (this.claps.left <= 0) this.claps = null;

    const g = this.group.position;
    [1, -1].forEach((side) => {
      const hit = this.cheekPoint(side, -0.3);
      const n = this.clapNormal;
      if (hit)
        this.peach.addJiggle(
          hit.point,
          this.tempB.copy(n).multiplyScalar(-side),
          0.17,
          1,
        );
    });
    this.squashVelocity.x += 2;
    this.squashAxis.set(1, 0);
    this.velocity.z += 0.8;
    this.kickVelocity.y += 0.5;
    const now = performance.now();
    this.combo =
      now - this.lastSmackAt < CFG.COMBO_WINDOW_MS ? this.combo + 1 : 1;
    this.lastSmackAt = now;
    this.smacks += 1;
    this.idle = 0;
    this.twerk = null;
    this.heat = Math.min(100, this.heat + CFG.HEAT_PER_SMACK);
    this.heatHold = CFG.HEAT_DECAY_DELAY;
    playSlap(1, this.heat / 100, this.oil, this.firmness.pitch * 1.1);
    const at = this.toScreen(g);
    this.ui.onSmack(this.smacks, this.combo, at.x, at.y);
    if (this.heat >= 100) {
      this.claps = null;
      this.charge();
    }
  }

  updateHeartbeat(delta) {
    this.beatAge += delta;
    const pulse = Math.sin(Math.PI * Math.min(1, this.beatAge / BEAT_LENGTH));
    this.throb = this.beatAmp * pulse * pulse;
    const h = this.heat / 100;
    if (
      h < CFG.HEARTBEAT_FROM ||
      (this.phase !== "live" && this.phase !== "charging")
    ) {
      this.beatTimer = 0;
      return;
    }
    this.beatTimer -= delta;
    if (this.beatTimer > 0) return;
    const k = (h - CFG.HEARTBEAT_FROM) / (1 - CFG.HEARTBEAT_FROM);
    this.beatTimer = 1 / (1.1 + k * 1.8);
    this.beatAge = 0;
    this.beatAmp = (0.004 + k * 0.007) * (reducedMotion.matches ? 0.3 : 1);
    playHeartbeat(0.3 + k * 0.7);
    this.ui.onHeartbeat();
  }

  toScreen(world) {
    this.screen.copy(world).project(this.camera);
    return {
      x: (this.screen.x + 1) * 0.5 * window.innerWidth,
      y: (1 - this.screen.y) * 0.5 * window.innerHeight,
    };
  }

  pixelsPerUnit(world) {
    const distance = this.camera.position.distanceTo(world);
    const halfFov = (this.camera.fov * Math.PI) / 360;
    return window.innerHeight / (2 * distance * Math.tan(halfFov));
  }

  updateOverlays() {
    if (this.talk.showing) {
      const anchor = this.tempB.copy(this.offset);
      anchor.x -= 0.75;
      anchor.y += 1.35;
      const at = this.toScreen(anchor);
      this.talk.place(at.x, at.y);
    }
    if (this.heat > 75 && !this.saidHot) {
      this.saidHot = true;
      this.talk.say("hot", 0.8);
    } else if (this.heat < 50) {
      this.saidHot = false;
    }
  }

  charge() {
    if (this.chargeGuard?.()) return;
    this.phase = "charging";
    this.phaseTime = 0;
    this.chargeTime = CFG.CHARGE_TIME;
    this.chargeStrip = this.garment.shown && this.garment.worn;
    if (this.chargeStrip) this.chargeTime += CFG.CHARGE_STRIP_TIME;
    this.chargePulse = 0;
    this.twerk = null;
    setRub(0, 0);
    this.wobbleAll(0.09);
    this.squashVelocity.x += 2.2;
    this.squashAxis.set(0.5, 0.5);
    this.freeze = 0.05;
    if (!reducedMotion.matches) {
      this.kickVelocity.y -= 1;
      this.trauma = Math.max(this.trauma, 0.35);
    }
    playSnap(1);
    playHeartbeat(1.3);
    buzz([25, 40, 60]);
    this.ui.onCharge();
    this.talk.say("charge");
  }

  updateCharge(delta) {
    const k = clamp(this.phaseTime / this.chargeTime, 0, 1);
    this.heat = 100;
    if (
      this.chargeStrip &&
      this.phaseTime >= this.chargeTime - CFG.CHARGE_PEEL_TIME
    ) {
      this.chargeStrip = false;
      this.undress();
    }
    this.chargePulse -= delta;
    if (this.chargePulse <= 0) {
      this.chargePulse = 0.05;
      const pos = this.peach.mesh.geometry.attributes.position;
      const point = this.tempA
        .fromBufferAttribute(pos, Math.floor(Math.random() * pos.count))
        .applyMatrix4(this.peach.mesh.matrixWorld);
      const out = this.tempB.copy(point).sub(this.group.position).normalize();
      this.peach.addJiggle(point, out, 0.03 + k * 0.07, 0.7);
    }
    if (k >= 1) this.burst();
  }

  chargeShape(g) {
    const k = clamp(this.phaseTime / this.chargeTime, 0, 1);
    const still = reducedMotion.matches ? 0.2 : 1;
    const shake = Math.sin(this.clock * 70) * 0.05 * k * k * still;
    const inhale = clamp((k - 0.6) / 0.4, 0, 1);
    g.scale.multiplyScalar(1 - 0.08 * inhale * inhale * (3 - 2 * inhale));
    g.rotation.z += shake * 1.6;
    g.position.x += shake * 0.8;
  }

  burst() {
    this.group.updateMatrixWorld(true);
    this.startSlice();
    this.finishBurst();
    this.talk.say("burst");
    this.emit("burst", { total: this.bursts });
  }

  wobbleAll(amount) {
    const pos = this.peach.mesh.geometry.attributes.position;
    for (let n = 0; n < 6; n += 1) {
      const point = this.tempA
        .fromBufferAttribute(pos, Math.floor(Math.random() * pos.count))
        .applyMatrix4(this.peach.mesh.matrixWorld);
      const out = this.tempB.copy(point).sub(this.group.position).normalize();
      this.peach.addJiggle(point, out, amount, 1);
    }
  }

  prepareHalves() {
    const scene = this.group.parent;
    this.halves = [1, -1].map((side, index) => {
      const mesh = this.peach.makeHalf(side, 10 + index * 5);
      const holder = new Group();
      holder.add(mesh);
      holder.visible = false;
      scene.add(holder);
      return {
        holder,
        mesh,
        side,
        velocity: new Vector3(),
        spin: new Vector3(),
      };
    });
    return this.halves.map((h) => h.holder);
  }

  startSlice() {
    if (!this.halves) this.prepareHalves();
    const center = this.group.position.clone();
    const normal = this.peach.creaseNormal(new Vector3());
    const toCenter = new Matrix4().makeTranslation(
      -center.x,
      -center.y,
      -center.z,
    );
    this.peach.refreshHalves();
    this.halfLingerie = this.garment.visible;
    if (this.settings.lingerie && this.garment.visible > 0) {
      this.garment.worn = false;
      this.garment.visible = 0;
      this.peach.setLingerie(false, 0, 0);
    }
    this.halves.forEach((h) => {
      h.mesh.matrix.copy(this.peach.mesh.matrixWorld).premultiply(toCenter);
      h.holder.position.copy(center);
      h.holder.rotation.set(0, 0, 0);
      h.holder.scale.setScalar(1);
      h.holder.visible = true;
      h.normal = normal.clone();
      h.launch = normal
        .clone()
        .multiplyScalar(h.side * (13 + Math.random() * 2.5))
        .add(new Vector3(0, 4.2 + Math.random(), -5));
      h.velocity.set(0, 0, 0);
      h.yaw = -Math.sign(-h.side * normal.x || 1) * 1.05;
      h.roll = 0;
      h.rollVelocity = h.side * (2 + Math.random());
      h.landed = false;
    });
    this.halvesAge = 0;
    this.tearCount = 0;
    this.slicing = true;
    this.snapped = false;
    this.strandTimer = 0;
    this.trailTimer = 0;
    this.sliceCenter = center;
    this.sliceNormal = normal;
    playSlice();
    playTear(SLICE_HOLD * WINDUP_FROM);
    buzz(15);
  }

  tearFibre(index) {
    playSnap(0.15 + index * 0.1);
    buzz(10 + index * 6);
    if (!reducedMotion.matches) {
      this.trauma = Math.max(this.trauma, 0.15 + index * 0.08);
      this.kickVelocity.y -= 0.15 + index * 0.05;
    }
    for (let n = 0; n < 3 + index * 2; n += 1) {
      const p = this.tempA
        .copy(this.sliceCenter)
        .add(this.tempB.set(0, (Math.random() - 0.5) * 1.8, 0.9));
      this.juice.emit(
        p,
        this.tempB.set((Math.random() - 0.5) * 1.5, 0.5 + Math.random(), 1.5),
      );
    }
  }

  snapHalves() {
    this.snapped = true;
    this.halves.forEach((h) => {
      h.velocity.copy(h.launch);
      h.holder.position.addScaledVector(h.normal, h.side * 0.2);
    });
    const power = this.burstPower;
    this.burstPower = 1;
    this.juice.burst(this.peach.mesh, {
      force: 0.9 * power,
      flying: 1.5 * power,
      limit: Math.min(240, Math.round(160 * power)),
    });
    this.sprayCut();
    this.juice.update(1 / 30);
    this.freeze = 0.08;
    if (!reducedMotion.matches) {
      this.slowmo = Math.min(0.5, 0.35 * power);
      this.trauma = Math.max(this.trauma, 0.8);
      this.zoomVelocity -= 2;
    }
    buzz([40, 30, 80]);
    this.kickVelocity.addScaledVector(this.sliceNormal, 1.2);
    this.kickVelocity.y -= 0.8;
    playSlap(1, 0.6, 0.6, 0.75);
    playSnap(1);
    playBurst();
    playSplash();
  }

  sprayCut() {
    const at = new Vector3();
    const v = new Vector3();
    for (let n = 0; n < 60; n += 1) {
      const side = n % 2 ? 1 : -1;
      const height = (Math.random() - 0.5) * 1.8;
      at.copy(this.sliceCenter)
        .addScaledVector(this.sliceNormal, side * 0.05)
        .add(v.set(0, height, (Math.random() - 0.3) * 0.8));
      const lens = n < 3;
      v.copy(this.sliceNormal)
        .multiplyScalar(side * (1 + Math.random() ** 2 * 2.5))
        .add(
          new Vector3(
            0,
            1.5 + Math.random() * 1.5 + height * 0.6,
            2 + Math.random() * 2.5,
          ),
        );
      if (lens) v.set(v.x * 0.2, 2.5 + Math.random() * 2, 11 - n * 1.4);
      this.juice.emit(at, v, lens);
    }
  }

  updateHalves(delta) {
    if (!this.slicing) return;
    this.halvesAge += delta;
    const t = this.halvesAge;
    const fade = clamp((t - 0.3) / 0.35, 0, 1);
    this.peach.fadeHalfLingerie(
      this.halfLingerie * (1 - fade * fade * (3 - 2 * fade)),
    );
    if (!this.snapped && t >= SLICE_HOLD) this.snapHalves();
    if (!this.snapped) {
      const k = t / SLICE_HOLD;
      const strain = k * k;
      while (this.tearCount < TEARS.length && k >= TEARS[this.tearCount]) {
        this.tearFibre(this.tearCount);
        this.tearCount += 1;
      }
      let gap = 0.015 + k * 0.02;
      let settle = 1;
      TEARS.forEach((at) => {
        const d = t - at * SLICE_HOLD;
        if (d < 0) return;
        gap += 0.03 * (1 - Math.exp(-d * 30) * Math.cos(d * 50));
        settle = Math.min(settle, 1 - Math.exp(-d * 12));
      });
      const w = clamp((k - WINDUP_FROM) / (1 - WINDUP_FROM), 0, 1);
      const windup = w * w * (3 - 2 * w);
      gap -= (gap - 0.005) * windup;
      const tremble =
        Math.sin(t * 90) *
        (0.004 + 0.014 * strain) *
        settle *
        (1 + windup * 0.5);
      this.halves.forEach((h) => {
        h.holder.position
          .copy(this.sliceCenter)
          .addScaledVector(h.normal, h.side * (gap + tremble));
        h.holder.rotation.set(0, h.yaw * 0.12 * strain, h.side * 0.05 * strain);
        h.holder.scale.set(
          1 - 0.04 * strain - 0.05 * windup,
          1 + 0.03 * strain + 0.04 * windup,
          1,
        );
      });
      this.strandTimer -= delta;
      if (this.strandTimer <= 0) {
        this.strandTimer = 0.02;
        const p = this.sliceCenter
          .clone()
          .add(
            new Vector3(
              (Math.random() - 0.5) * 0.1,
              (Math.random() - 0.5) * 2.2,
              1,
            ),
          );
        this.juice.emit(p, new Vector3((Math.random() - 0.5) * 0.6, -0.5, 0.8));
      }
      return;
    }
    const s = t - SLICE_HOLD;
    const open = 1 - Math.exp(-s * 14);
    const tilt = (s * s) / (s + 0.08);
    const glow =
      clamp(s / 0.025, 0, 1) * Math.exp(-Math.max(0, s - 0.025) * 16) * 0.7;
    this.trailTimer -= delta;
    const drip = s < 0.7 && this.trailTimer <= 0;
    if (drip) this.trailTimer = 0.035;
    this.halves.forEach((h) => {
      h.mesh.userData.cap.emissiveIntensity = glow;
      if (drip)
        this.juice.emit(
          this.tempA
            .copy(h.holder.position)
            .add(this.tempB.set(0, (Math.random() - 0.5) * 1.4, 0.3)),
          this.tempB
            .copy(h.velocity)
            .multiplyScalar(0.35)
            .add(this.screen.set(0, -0.5, Math.random() - 0.5)),
        );
      h.velocity.y -= 11 * delta;
      h.velocity.multiplyScalar(
        Math.exp(-delta * (0.3 + 4 * Math.exp(-s * 8))),
      );
      h.holder.position.addScaledVector(h.velocity, delta);
      h.holder.rotation.set(
        -tilt * 3.2,
        h.yaw * (0.12 + 0.88 * open),
        h.side * (0.05 + tilt * 2.4),
      );
      const release = Math.exp(-s * 7);
      const bounce = release * Math.cos(s * 26) * 0.13;
      const pop = 1 + 0.06 * (s / 0.03) * Math.exp(1 - s / 0.03);
      h.holder.scale.set(
        (1 - 0.04 * release + bounce) * pop,
        (1 + 0.03 * release - bounce) * pop,
        (1 + bounce * 0.5) * pop,
      );
    });
    if (s < 1.6) return;
    this.halves.forEach((h) => {
      h.holder.visible = false;
    });
    this.slicing = false;
  }

  finishBurst() {
    this.phase = "burst";
    this.phaseTime = 0;
    this.group.visible = false;
    this.peach.clearMarks();
    this.heat = 0;
    this.oil = 0;
    this.peach.setOil(0, true);
    this.bursts += 1;
    this.kickVelocity.set(0, 1.6, 0);
    this.ui.onBurst(this.bursts);
    setRub(0, 0);
  }

  pickBottle(e) {
    if (this.phase !== "live" || this.carrying) return;
    if (this.bottle.el.hasPointerCapture(e.pointerId))
      this.bottle.el.releasePointerCapture(e.pointerId);
    const p = this.pointer;
    p.x = e.clientX;
    p.y = e.clientY;
    p.present = true;
    p.pressed = true;
    p.armed = false;
    p.downAt = e.timeStamp;
    p.travel = 0;
    this.carrying = true;
    this.bottle.pick();
    this.ui.placeCursor(p.x, p.y);
  }

  pour(hit, motion, flow, delta) {
    const spread = clamp(motion.speed / 1.2, 0, 1);
    this.rubbing = 0.25 + spread * 0.35;
    this.oil = Math.min(
      1,
      this.oil + CFG.OIL_POUR_RATE * delta * (0.6 + spread),
    );
    this.rubPulse -= delta;
    if (this.rubPulse <= 0) {
      this.rubPulse = 0.16 + Math.random() * 0.12;
      const down = this.tempA.set(0, -0.4, -1).normalize();
      this.peach.addJiggle(hit.point, down, 0.01 * flow, 0.4);
      const normal = this.tempB
        .copy(hit.face.normal)
        .transformDirection(this.peach.mesh.matrixWorld);
      this.droplets.spray(hit.point, normal, down, 0);
      this.bottle.splash(this.pointer.x, this.pointer.y);
      playGlug(flow);
      buzz(4);
    }
    this.idle = 0;
    this.twerk = null;
    this.ui.onRub();
    this.talk.say("rub", delta * 0.5);
  }

  handlePointer(delta) {
    const p = this.pointer;
    const motion = this.pointerSpeed(performance.now());
    this.ui.shapeCursor(motion.vx, motion.vy, p.present, delta);
    this.rubbing = 0;

    if (this.carrying) {
      if ((p.pressed || this.carryLatched) && this.phase === "live") {
        const hit = this.raycastAt(p.x, p.y);
        const peach = {
          x: this.toScreen(this.group.position).x,
          radius: 1.4 * this.pixelsPerUnit(this.group.position),
          center: this.group.position,
          worldRadius: 1.4,
        };
        const flow = this.bottle.carry(p.x, p.y, motion.vx, hit, peach, delta);
        if (hit && flow > 0.4) this.pour(hit, motion, flow, delta);
        this.ui.setCursorState("carry");
        return;
      }
      this.carrying = false;
      this.carryLatched = false;
      this.bottle.drop();
    }
    if (this.grab) {
      const flicked =
        motion.speed > CFG.GRAB_FLICK_SPEED &&
        performance.now() - p.downAt < CFG.GRAB_FLICK_MS;
      if (flicked) {
        this.grab = null;
        p.grabbed = false;
        this.peach.releaseGrab();
      } else if (p.pressed && this.phase === "live") {
        this.updateGrab(delta);
        this.ui.setCursorState(this.grab ? "grab" : "over");
        return;
      } else {
        this.releaseGrab();
      }
    }
    if (this.garment.stripping) {
      if (p.pressed && this.phase === "live" && this.garment.worn) {
        this.updateStrip();
        this.ui.setCursorState("grab");
        return;
      }
      this.endStrip();
    }

    if (this.phase !== "live" || !p.present) {
      this.ui.setCursorState(null);
      return;
    }
    const hit = this.raycastAt(p.x, p.y);
    p.inside = !!hit;
    if (!hit) {
      p.armed = true;
    } else if (
      p.armed &&
      !(p.pressed && p.grabbed) &&
      motion.speed > CFG.MIN_SWIPE_SPEED
    ) {
      p.armed = false;
      this.smack(
        hit,
        motion.vx,
        motion.vy,
        clamp(motion.speed / CFG.FULL_SWIPE_SPEED, 0.3, 2),
      );
    } else if (p.pressed) {
      if (this.canStrip() && this.isStripPull()) {
        this.startStrip();
      } else if (this.canGrab()) {
        this.startGrab(hit);
        this.updateGrab(delta);
        this.ui.setCursorState(this.grab ? "grab" : "over");
        return;
      }
    } else {
      p.armed = false;
      if (motion.speed > CFG.MASSAGE_MIN_SPEED)
        this.massageAt(hit, motion, delta);
    }
    this.ui.setCursorState(p.inside ? "over" : null);
  }

  massageAt(hit, motion, delta) {
    const m = this.massage;
    const strength = clamp(motion.speed / 0.8, 0.2, 1);
    const local = this.peach.toLocal(hit.point, m.point);
    const follow = 1 - Math.exp(-delta * 14);
    if (m.amount < 0.02) {
      m.local.copy(local);
      m.normal.copy(hit.face.normal).normalize();
      m.drag.set(0, 0, 0);
    } else {
      m.local.lerp(local, follow);
      m.normal.lerp(hit.face.normal, follow).normalize();
    }
    const push = this.tempA.set(motion.vx, -motion.vy, 0);
    push.multiplyScalar(
      (CFG.MASSAGE_DRAG * this.firmness.grab) / Math.max(0.5, push.length()),
    );
    const target = this.peach
      .toLocal(this.tempB.copy(hit.point).add(push), this.tempB)
      .sub(local);
    m.drag.lerp(target, 1 - Math.exp(-delta * 6));
    m.target = strength;

    m.pulse -= delta;
    if (m.pulse <= 0) {
      m.pulse = 0.09 + Math.random() * 0.05;
      const dir = this.tempA.set(motion.vx, -motion.vy, -0.6).normalize();
      this.peach.addJiggle(hit.point, dir, 0.03 * strength, 0.55);
    }
    this.rubbing = 0.2 + strength * 0.35;
    this.idle = 0;
    this.twerk = null;
    this.talk.say("rub", delta * 0.5);
  }

  updateMassage(delta) {
    const m = this.massage;
    if (this.grab || this.recoil) {
      m.amount = 0;
      m.target = 0;
      m.active = false;
      return;
    }
    const rate = m.target > m.amount ? 5 : 3;
    m.amount += (m.target - m.amount) * (1 - Math.exp(-delta * rate));
    m.target = 0;
    if (m.amount < 0.005) {
      if (m.active) this.peach.releaseGrab();
      m.active = false;
      return;
    }
    m.active = true;
    const scale = this.peach.worldScale();
    const press = reducedMotion.matches
      ? 1
      : 1 + Math.sin(this.clock * 9) * 0.15;
    m.dent
      .copy(m.normal)
      .multiplyScalar((-CFG.MASSAGE_DENT * m.amount * press) / scale);
    m.pull.copy(m.drag).multiplyScalar(m.amount);
    this.peach.setGrab(
      m.local,
      m.pull,
      CFG.MASSAGE_RADIUS,
      m.dent,
      CFG.MASSAGE_DENT_RADIUS,
    );
  }

  canGrab() {
    const p = this.pointer;
    return (
      this.toolName === "hand" &&
      p.armed &&
      p.downOnPeach &&
      (!p.onWaistband || p.travel > 28)
    );
  }

  twerkBeat() {
    const side = this.twerk.beats % 2 === 0 ? -1 : 1;
    this.raycaster.set(
      this.tempA.set(
        this.group.position.x + side * 0.7,
        this.group.position.y - 0.35,
        20,
      ),
      this.tempB.set(0, 0, -1),
    );
    const hit = this.raycaster.intersectObject(this.peach.mesh, false)[0];
    if (hit)
      this.peach.addJiggle(
        hit.point,
        this.tempA.set(0, 1, 0.3).normalize(),
        0.13,
        0.95,
      );
    this.velocity.y += 1.1;
    this.spin.z += side * 0.5;
    this.squashVelocity.x += 1.2;
    this.squashAxis.set(0, 1);
    this.twerk.beats += 1;
  }

  updateTwerk(delta) {
    if (this.twerk) {
      this.twerk.timer -= delta;
      if (this.twerk.timer <= 0) {
        this.twerk.timer += 1 / CFG.TWERK_BEAT_HZ;
        this.twerkBeat();
        if (this.twerk.beats >= CFG.TWERK_BEATS) {
          this.twerk = null;
          this.idle = -30;
        }
      }
      return;
    }
    this.idle += delta;
    if (
      this.idle > CFG.TWERK_IDLE_SECONDS &&
      this.settings.tease &&
      !reducedMotion.matches &&
      !this.pointer.pressed
    ) {
      this.twerk = { beats: 0, timer: 0 };
      this.talk.say("idle");
    }
  }

  stepPhysics(delta) {
    if (this.hitStop > 0) {
      this.hitStop -= delta;
      return;
    }
    this.accumulator += delta;
    const h = PHYSICS_CONFIG.SUBSTEP;
    let steps = 0;
    while (this.accumulator >= h && steps < 10) {
      spring(
        this.offset,
        this.velocity,
        PHYSICS_CONFIG.POSITION_STIFFNESS * this.firmness.stiffness,
        PHYSICS_CONFIG.POSITION_DAMPING,
        h,
      );
      spring(
        this.tilt,
        this.spin,
        PHYSICS_CONFIG.ROTATION_STIFFNESS,
        PHYSICS_CONFIG.ROTATION_DAMPING,
        h,
      );
      spring(
        this.squash,
        this.squashVelocity,
        PHYSICS_CONFIG.SQUASH_STIFFNESS * this.firmness.stiffness,
        PHYSICS_CONFIG.SQUASH_DAMPING,
        h,
      );
      this.accumulator -= h;
      steps += 1;
    }
    if (steps === 10) this.accumulator = 0;
  }

  applyTransform() {
    const t = this.clock;
    const g = this.group;
    const calm = reducedMotion.matches ? 0.3 : 1;
    const tremble =
      this.heat > 70 && !reducedMotion.matches
        ? ((this.heat - 70) / 30) * 0.02
        : 0;

    g.position.set(
      this.offset.x,
      this.offset.y + Math.sin(t * 1.4) * 0.12 * calm,
      this.offset.z,
    );
    g.rotation.set(
      this.tilt.x,
      Math.sin(t * 0.45) * 0.25 * calm + this.tilt.y,
      this.tilt.z + Math.sin(t * 43) * tremble,
    );

    let grow = 1;
    if (this.phase === "entering") {
      const k = clamp(this.phaseTime / CFG.RESPAWN_DURATION, 0, 1);
      const ease = 1 - (1 - k) ** 3;
      grow = 0.01 + 0.99 * ease;
      g.position.z += -10 * (1 - ease);
      g.rotation.y += (1 - ease) * Math.PI * 2;
    }
    const s = clamp(this.squash.x, -0.35, 0.35);
    const ax = this.squashAxis.x;
    const ay = this.squashAxis.y;
    g.scale.set(
      grow * (1 - s * ax + s * 0.5 * ay),
      grow * (1 - s * ay + s * 0.5 * ax),
      grow * (1 + s * 0.4),
    );
    g.scale.multiplyScalar(1 + this.throb);
    if (this.phase === "charging") this.chargeShape(g);
  }

  updateCamera(delta) {
    const still = reducedMotion.matches;
    const p = this.pointer;
    const tx = still || !p.present ? 0 : (p.x / window.innerWidth - 0.5) * 0.5;
    const ty =
      still || !p.present ? 0 : (p.y / window.innerHeight - 0.5) * -0.3;
    const ease = 1 - Math.exp(-delta * 3);
    this.parallax.x += (tx - this.parallax.x) * ease;
    this.parallax.y += (ty - this.parallax.y) * ease;
    spring(this.kick, this.kickVelocity, 140, 17, delta);
    const jolt = still ? 0 : 1;
    const close =
      this.phase === "charging"
        ? 1
        : clamp((this.heat / 100 - 0.2) / 0.8, 0, 1);
    this.zoomVelocity +=
      ((close - this.zoom) * 9 - this.zoomVelocity * 6) * delta;
    this.zoom += this.zoomVelocity * delta;
    const z = clamp(this.zoom, 0, 1);
    const reach = 1 - 0.22 * z;
    this.trauma = Math.max(0, this.trauma - delta * 1.4);
    const shake = this.trauma * this.trauma * jolt * reach;
    const c = this.clock;
    const nx = Math.sin(c * 19 + Math.sin(c * 7)) + 0.5 * Math.sin(c * 31);
    const ny = Math.sin(c * 17 + Math.sin(c * 5)) + 0.5 * Math.sin(c * 29);
    const kx = this.kick.x * jolt * reach;
    const ky = this.kick.y * jolt * reach;
    this.camera.position.set(
      this.parallax.x * reach + kx + shake * 0.05 * nx,
      this.parallax.y * reach + ky - z * 0.35 + shake * 0.05 * ny,
      this.camera.userData.baseZ * reach,
    );
    this.camera.lookAt(
      kx * 0.4 - shake * 0.06 * nx,
      ky * 0.4 - 0.3 * z - shake * 0.06 * ny,
      0,
    );
    const sway = still ? 0 : Math.sin(c * 0.4) * 0.04 * z;
    const roll = shake * 0.025 * Math.sin(c * 23 + Math.sin(c * 11));
    this.camera.rotateZ(sway + roll - kx * 0.06);
    const charging =
      this.phase === "charging"
        ? clamp(this.phaseTime / this.chargeTime, 0, 1)
        : 0;
    this.ui.setVignette(Math.min(1, z * 0.7 + charging * 0.3));
  }

  update(delta) {
    this.clock += delta;
    this.phaseTime += delta;

    if (this.phase === "entering" && this.phaseTime >= CFG.RESPAWN_DURATION) {
      this.phase = "live";
    }
    if (this.phase === "charging") this.updateCharge(delta);
    this.updateHalves(delta);
    if (this.phase === "burst" && this.phaseTime >= CFG.RESPAWN_DELAY) {
      this.enter();
    }

    this.handlePointer(delta);
    this.updateMassage(delta);
    this.updateRecoil(delta);
    if (this.phase === "live") this.updateTwerk(delta);
    this.updateClaps(delta);
    this.updateHeartbeat(delta);
    this.updateGarment(delta);
    this.stepPhysics(delta);
    this.applyTransform();
    this.updateCamera(delta);

    this.heatHold -= delta;
    if (this.heatHold <= 0)
      this.heat = Math.max(0, this.heat - CFG.HEAT_DECAY * delta);
    if (!this.rubbing)
      this.oil = Math.max(0, this.oil - CFG.OIL_DRY_RATE * delta);
    this.peach.setOil(this.oil);
    setRub(this.rubbing, this.oil);

    this.juice.update(delta);
    this.ui.setMeters(this.heat / 100, this.oil);
    this.bottle.update(delta);
    this.bottle.setCalling(
      this.phase === "live" && !this.carrying && this.oil < 0.05,
    );
    this.updateOverlays();
  }
}
