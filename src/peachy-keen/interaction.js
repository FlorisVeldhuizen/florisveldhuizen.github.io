import { Vector2, Vector3, Raycaster, Matrix4, Group, Plane } from "three";
import {
  playSlap,
  playBurst,
  setRub,
  setSlide,
  playSlice,
  playGrab,
  cutSlap,
  playKiss,
  playHeartbeat,
  playSquish,
  playSnap,
  playFibre,
  playSlide,
  playSettle,
  playSplash,
  playGlug,
  playPat,
  playWobble,
} from "./audio";
import {
  PHYSICS_CONFIG,
  FIRMNESS,
  TOOLS,
  INTERACTION_CONFIG as CFG,
} from "./config";
import { Bottle } from "./bottle";
import { clamp, reducedMotion, viewHeight } from "./util";
import { tune, tuneLog } from "./tune";
import SurfaceMarker, { MARKERS, surfaceNormal } from "./marker";

const DROP_STEP_PX = 12;
const TIPS = [
  {
    gesture: "rub",
    text: (touch) =>
      touch
        ? "Slide a finger over the peach to rub it."
        : "Move slowly over the peach to rub it.",
  },
  { gesture: "clap", text: "Tap twice quickly to clap." },
  {
    gesture: "knead",
    text: "Grab and hold still to knead.",
    when: (i) => i.toolName === "hand",
  },
  {
    gesture: "shake",
    text: "Grab and shake it fast.",
    when: (i) => i.toolName === "hand",
  },
  { gesture: "latch", text: "Tap the bottle to carry it without holding." },
  {
    gesture: "strip",
    text: "Pull the waistband down, or up.",
    when: (i) => i.garment.worn,
  },
  {
    gesture: "buzzmode",
    text: "Tap to change the buzz mode.",
    when: (i) => i.toolName === "buzz",
  },
];

const buzz = (ms) => navigator.vibrate?.(ms);
const SLICE_HOLD = 0.42;
const TEARS = [0.22, 0.42, 0.6];
const WINDUP_FROM = 0.72;
const BEAT_LENGTH = 0.32;
const GRAB_OVERREACH = 1.25;
const GRAB_BODY_PULL = 4;

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
    this.heatGain = 1;
    this.heatCap = 100;
    this.coolRate = 1;
    this.twerkAfter = CFG.TWERK_IDLE_SECONDS;
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
      y: viewHeight() / 2,
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
    this.marker = new SurfaceMarker(peach, camera);
    this.markerSpot = null;
    this.stripSpot = { local: new Vector3(), normal: new Vector3() };
    this.markerStyle = MARKERS.hand;
    this.bottle.stream.onLens = (x, y, r) => this.lens.oilSplat(x, y, r);
    this.grab = null;
    this.recoil = null;
    this.grabPlane = new Plane();
    this.grabTarget = new Vector3();
    this.lastTap = null;
    this.found = new Set();
    this.tip = null;
    this.tipIdle = 0;
    this.claps = null;
    this.clapNormal = new Vector3();
    this.beatTimer = 0;
    this.throb = 0;
    this.beatAge = Infinity;
    this.beatAmp = 0;
    this.lastJoltAt = 0;
    this.saidHot = false;
    this.garment = {
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
    this.pose = { x: 0, lift: 0, yaw: 0, roll: 0 };
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
    this.peach.setTool(this.toolName);
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
      if (p.pressed || p.inside) this.tipIdle = 0;
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
      p.touch = e.pointerType !== "mouse";
      p.rubbing = false;
      const hit = this.raycastAt(e.clientX, e.clientY);
      p.downOnPeach = !!hit;
      p.onWaistband = this.onWaistband(hit);
    });
    const release = (e) => {
      const tapped =
        e.type === "pointerup" && e.timeStamp - p.downAt < 220 && p.travel < 14;
      if (this.carrying && e.type === "pointerup") {
        this.carryLatched = !this.carryLatched && tapped;
        if (this.carryLatched) this.discover("latch");
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
    this.wake();
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
    return 0.25 + 0.75 * k * k * k;
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
    g.visible = 0;
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
      freed: false,
    });
    playSlide(0.5, 3000, 800);
  }

  updateDressing(delta) {
    const g = this.garment;
    g.dressing.time += delta;
    const t = Math.min(1, g.dressing.time / 0.55);
    const fade = Math.min(1, g.dressing.time / 0.3);
    g.visible = fade * fade * (3 - 2 * fade);
    g.target = t < 1 ? 1.5 - 1.64 * t * t * (3 - 2 * t) : 0;
    if (!g.dressing.landed && (g.pull <= 0 || t >= 1)) {
      g.dressing.landed = true;
      this.snapOn();
    }
    if (g.dressing.time > 0.9) g.dressing = null;
  }

  skinSquash() {
    this.squashVelocity.x -= 0.6;
    this.squashAxis.set(0, 1);
  }

  skinPop() {
    this.wobbleAll(0.06);
    this.squashVelocity.x += 1.3;
    this.squashAxis.set(0, 1);
    buzz(14);
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
    const unit = Math.min(window.innerWidth, viewHeight());
    const vx = (b.x - a.x) / dt / unit;
    const vy = (b.y - a.y) / dt / unit;
    return { vx, vy, speed: Math.hypot(vx, vy) };
  }

  pathSpeed(now) {
    const s = this.pointer.samples;
    let first = s.length - 1;
    while (first > 0 && now - s[first - 1].t < CFG.SAMPLE_WINDOW_MS) first -= 1;
    const b = s[s.length - 1];
    if (!b || first === s.length - 1 || now - b.t > CFG.SAMPLE_WINDOW_MS)
      return 0;
    let path = 0;
    for (let i = first + 1; i < s.length; i += 1)
      path += Math.hypot(s[i].x - s[i - 1].x, s[i].y - s[i - 1].y);
    const dt = Math.max(CFG.SAMPLE_MIN_MS, b.t - s[first].t) / 1000;
    return path / dt / Math.min(window.innerWidth, viewHeight());
  }

  raycastAt(x, y) {
    if (!this.peach.mesh) return null;
    this.ndc.set((x / window.innerWidth) * 2 - 1, -(y / viewHeight()) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    return this.raycaster.intersectObject(this.peach.mesh, false)[0] || null;
  }

  pourHit(x, y) {
    const hit = this.raycastAt(x, y);
    if (hit || !this.peach.mesh) return hit;
    const bottom =
      this.toScreen(this.group.position).y +
      1.4 * this.pixelsPerUnit(this.group.position);
    let miss = y;
    let found = null;
    for (let at = y + DROP_STEP_PX; at < bottom; at += DROP_STEP_PX) {
      found = this.raycastAt(x, at);
      if (found) break;
      miss = at;
    }
    if (!found) return null;
    let near = miss + DROP_STEP_PX;
    for (let i = 0; i < 4; i += 1) {
      const middle = (miss + near) / 2;
      const probe = this.raycastAt(x, middle);
      if (probe) {
        found = probe;
        near = middle;
      } else {
        miss = middle;
      }
    }
    return found;
  }

  landingAt(hit) {
    const at = this.toScreen(hit.point);
    const normal = surfaceNormal(hit, this.tempA);
    const facing = this.tempB.copy(this.camera.position).sub(hit.point);
    const squash = Math.abs(normal.dot(facing.normalize()));
    normal.transformDirection(this.camera.matrixWorldInverse);
    return { ...at, tilt: Math.atan2(-normal.y, normal.x), squash };
  }

  tap() {
    if (this.phase !== "live") return;
    const now = performance.now();
    const { x, y } = this.pointer;
    const hit = this.raycastAt(x, y);
    const last = this.lastTap;
    this.lastTap = hit ? { at: now, x, y } : null;
    if (!hit) return;
    if (
      last &&
      now - last.at < CFG.CLAP_GAP_MS &&
      Math.hypot(x - last.x, y - last.y) < CFG.CLAP_REACH_PX
    ) {
      this.lastTap = null;
      this.claps = { left: 3, timer: 0.06 };
      cutSlap();
      this.discover("clap");
      this.talk.say("clap", 0.6);
      return;
    }
    this.smack(hit, 0, 0, 0.9);
  }

  smack(hit, vx, vy, strength, toolName = this.toolName) {
    const tool = TOOLS[toolName];
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

    if (this.settings.handprints && tool.print) {
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
        toolName === "lips"
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

    this.countSmack(now);
    this.addHeat(
      (CFG.HEAT_PER_SMACK + CFG.HEAT_PER_SPEED * strength) * tool.heat,
    );
    if (strength * tool.force > 1.3) this.hitStop = 0.045;
    this.kickVelocity.addScaledVector(swipe, 0.5 * strength * tool.force);

    if (toolName === "lips") {
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
    else if (toolName === "lips") this.talk.say("kiss", 0.4);
    else this.talk.say("smack", 0.3);
    this.emit("smack", {
      strength,
      x: this.pointer.x,
      y: this.pointer.y,
      combo: this.combo,
      total: this.smacks,
      tool: toolName,
    });

    if (this.heat >= 100) this.charge();
  }

  holdMarker() {
    if (this.grab) {
      this.markerSpot = this.grab;
      this.markerStyle = MARKERS.grab;
    }
    this.ui.setCursorState(this.grab ? "hold" : "over");
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
      sounded: false,
      wiggle: {
        at: new Vector3(),
        anchor: new Vector3(),
        far: new Vector3(),
        last: new Vector3(),
        path: 0,
        pathToFar: 0,
        since: 0,
        farAt: 0,
      },
      pattedAt: 0,
      streak: 0,
      peak: 0,
      endArmed: true,
      wild: 0,
      shaken: 0,
      heading: new Vector3(),
      turning: 0,
    };
    this.pointer.grabbed = true;
    buzz(8);
    this.talk.say("grab", 0.7);
  }

  updateGrab(delta, motion) {
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
      -(this.pointer.y / viewHeight()) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.ndc, this.camera);
    if (!this.raycaster.ray.intersectPlane(this.grabPlane, this.grabTarget))
      return;
    const target = this.grabTarget.sub(world);
    const give = this.firmness.grab;
    const limit = CFG.GRAB_REACH * give;
    target.divideScalar(
      Math.hypot(1, target.length() / (limit * GRAB_OVERREACH)),
    );
    const stiffness = (420 * this.firmness.stiffness) / give;
    g.pullVelocity
      .addScaledVector(this.tempB.copy(target).sub(g.pull), stiffness * delta)
      .multiplyScalar(Math.exp(-delta * (18 + (1 - give) * 8)));
    g.pull.addScaledVector(g.pullVelocity, delta);
    g.squeeze += (1 - g.squeeze) * (1 - Math.exp(-delta * 14));
    const length = g.pull.length();
    const speed = g.pullVelocity.length();
    g.tension = Math.min(1, length / limit);
    if (g.tension > 0.3) this.ui.onGrab();
    g.age += delta;
    if (!g.sounded && (g.age > 0.12 || this.pointer.travel > 8)) {
      g.sounded = true;
      playGrab(this.oil);
    }
    const turnedFrom = this.trackTurn(g, delta);
    this.updateShake(g, delta, world, turnedFrom);
    this.updateWiggle(g, limit, delta);
    this.updateDragEnd(g, limit, delta);
    const still = g.age > 0.25 && motion.speed < CFG.GRAB_STILL_SPEED;
    g.knead = still
      ? Math.min(1, g.knead + delta / CFG.GRAB_KNEAD_SECONDS)
      : Math.max(0, g.knead - delta * 1.5);
    if (g.knead > 0.5) this.discover("knead");

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
    this.velocity.addScaledVector(g.pull, GRAB_BODY_PULL * delta);
    const lever = this.tempB.copy(world).sub(this.group.position);
    this.spin.addScaledVector(lever.cross(g.pull), GRAB_BODY_PULL * delta);
    this.addHeat(2 * delta * (0.2 + length), 99);
    this.wake();
  }

  trackTurn(g, delta) {
    const speed = g.pullVelocity.length();
    if (speed < 0.5) return null;
    const heading = this.tempB.copy(g.pullVelocity).divideScalar(speed);
    const from = g.heading.clone();
    g.heading.copy(heading);
    if (from.lengthSq() === 0) return null;
    g.turning = g.turning * Math.exp(-delta * 2) + from.angleTo(heading);
    if (g.turning < CFG.WIGGLE_TURN_ANGLE) return null;
    g.turning = 0;
    return from;
  }

  flingPoint(heading) {
    const c = this.group.position;
    const { ray } = this.raycaster;
    ray.origin.set(
      c.x + heading.x * 0.6 + (Math.random() - 0.5),
      c.y + heading.y * 0.6 + (Math.random() - 0.5),
      20,
    );
    ray.direction.set(0, 0, -1);
    return this.raycaster.intersectObject(this.peach.mesh, false)[0] || null;
  }

  updateWiggle(g, limit, delta) {
    const w = g.wiggle;
    const at = w.at.copy(g.pull).divideScalar(limit);
    w.path += w.last.distanceTo(at);
    w.last.copy(at);
    const reach = w.far.distanceTo(w.anchor);
    const out = at.distanceTo(w.anchor);
    if (out >= reach) {
      w.far.copy(at);
      w.pathToFar = w.path;
      w.farAt = this.clock;
      return;
    }
    if (at.distanceTo(w.far) < reach * CFG.WIGGLE_RETURN) return;
    const swing = reach;
    const half = w.farAt - w.since;
    const pace = w.path / Math.max(this.clock - w.since, delta);
    const straight = swing / Math.max(w.pathToFar, swing);
    w.anchor.copy(w.far);
    w.far.copy(at);
    w.path = at.distanceTo(w.anchor);
    w.pathToFar = w.path;
    w.since = w.farAt;
    w.farAt = this.clock;
    const from = tune.turnFrom / this.jiggle();
    if (
      swing < from ||
      half > CFG.WIGGLE_HALF_MAX ||
      pace < CFG.WIGGLE_PACE ||
      this.clock - g.pattedAt < CFG.WIGGLE_GAP ||
      g.wild < CFG.WIGGLE_WILD
    ) {
      g.streak = 0;
      return;
    }
    g.streak = this.clock - g.pattedAt < CFG.WIGGLE_ROW ? g.streak + 1 : 1;
    g.pattedAt = this.clock;
    const ramp = Math.min(1, g.streak / CFG.WIGGLE_RAMP) ** 2;
    const size = clamp((swing - from) / (CFG.WIGGLE_FULL - from), 0, 1);
    const fast = clamp(
      (pace - CFG.WIGGLE_PACE) / (tune.turnPaceFull - CFG.WIGGLE_PACE),
      0,
      1,
    );
    // A half circle travels about 1.57x its diameter; a back-and-forth swing about 1x.
    const sharp = clamp((straight - 0.68) / 0.22, 0, 1);
    const gain =
      tune.turnVolume *
      ramp *
      (0.15 + 0.85 * size) ** 2 *
      (0.1 + 0.9 * fast) ** 2 *
      (0.3 + 0.7 * sharp);
    tuneLog(
      `wiggle pat  pull swing ${swing.toFixed(2)} half ${half.toFixed(2)}s pace ${pace.toFixed(1)} straight ${straight.toFixed(2)} row ${g.streak} vol ${gain.toFixed(2)}`,
    );
    playPat(
      size * (0.3 + 0.7 * fast),
      clamp(g.pull.x / limit, -0.6, 0.6),
      this.oil,
      { gain },
    );
    this.squashVelocity.x += (0.1 + size * 0.3) * (0.3 + 0.7 * fast) * ramp;
    const dir = this.tempB.copy(w.anchor).sub(at);
    this.squashAxis.set(Math.abs(dir.x), Math.abs(dir.y)).normalize();
  }

  updateDragEnd(g, limit, delta) {
    const speed = g.pullVelocity.length() / limit;
    g.peak = Math.max(g.peak * Math.exp(-delta * 4), speed);
    if (g.tension < 0.6) g.endArmed = true;
    const { peak } = g;
    if (
      !g.endArmed ||
      g.wild > CFG.WIGGLE_WILD ||
      g.tension < CFG.DRAG_END_TENSION ||
      peak < CFG.DRAG_END_SPEED ||
      speed > peak * 0.5
    )
      return;
    g.endArmed = false;
    playPat(0.1, clamp(g.pull.x / limit, -0.6, 0.6), this.oil, {
      gain:
        0.5 *
        (CFG.WIGGLE_QUIET +
          (1 - CFG.WIGGLE_QUIET) * clamp(peak / CFG.DRAG_END_SPEED - 1, 0, 1)),
    });
    this.squashVelocity.x += 0.1;
    this.squashAxis.set(Math.abs(g.pull.x), Math.abs(g.pull.y)).normalize();
  }

  jiggle() {
    return this.firmness.jiggle / FIRMNESS.ripe.jiggle;
  }

  updateShake(g, delta, world, turnedFrom) {
    const shake = this.pathSpeed(performance.now());
    g.wild +=
      (clamp((shake - 1.5) / 2.5, 0, 1) - g.wild) * (1 - Math.exp(-delta * 8));
    g.shaken =
      g.wild > 0.3 ? g.shaken + g.wild * delta : Math.max(0, g.shaken - delta);
    if (g.shaken > 0.5) this.discover("shake");
    if (!turnedFrom || this.oil < 0.25 || g.wild < 0.4) return;
    if (Math.random() > CFG.FLING_CHANCE) return;
    const hit = this.flingPoint(turnedFrom);
    const flung = this.droplets.spray(
      hit ? hit.point.clone() : world.clone(),
      (hit ? hit.face.normal : g.normal)
        .clone()
        .transformDirection(this.peach.mesh.matrixWorld),
      turnedFrom.clone().multiplyScalar(2 + g.wild * 2),
      this.oil * g.wild * CFG.FLING_AMOUNT,
      0.4,
    );
    if (g.wild > 0.7 && Math.random() < 0.15)
      this.lens.splash(flung, this.oil * 0.35);
  }

  releaseGrab() {
    const g = this.grab;
    this.pointer.armed = false;
    const length = g.pull.length();
    this.emit("release", { knead: g.knead, length });
    this.velocity.addScaledVector(g.pull, -1.6);
    if (g.shaken > 1.5) {
      const dizzy = Math.min(1, g.shaken / 4);
      this.spin.z += (Math.random() < 0.5 ? -1 : 1) * dizzy * 2.5;
      this.wobbleAll(0.04 + dizzy * 0.06);
    }
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
      : 420 * this.firmness.stiffness * (1 + tension * 0.8);
    const c = r.landed ? settle * 0.35 : 6;
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
    if ((r.landed && motion < r.start.length() * 0.01) || r.age > 2.2) {
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
    this.releaseSound(r);
    const stretch = length / CFG.GRAB_REACH;
    const jiggle = this.jiggle();
    const from = Math.min(0.95, tune.wobbleFrom / jiggle);
    if (stretch > from)
      playWobble(
        Math.min(1, (stretch - from) / (1 - from)),
        Math.PI / (this.firmness.dentFrequency * 0.85),
        this.oil,
        {
          gain: tune.wobbleVolume * jiggle,
          most: Math.max(1, Math.round(2 * jiggle ** 2)),
          decay: 0.375 ** (this.firmness.dentDecay / FIRMNESS.ripe.dentDecay),
        },
      );
    this.talk.say("release", 0.6);
    this.addHeat(5 * length);
    this.ui.onSnapback(at.x, at.y, length / CFG.GRAB_REACH);
    if (this.heat >= 100) this.charge();
  }

  releaseSound(r) {
    const stretch = r.length / (CFG.GRAB_REACH * this.firmness.grab);
    const pan = clamp(r.worldPull.x / CFG.GRAB_REACH, -0.6, 0.6);
    const weight = clamp(stretch, 0, 1);
    playPat(weight, pan, this.oil, {
      gain: 0.35 + 0.75 * weight,
      flam: false,
    });
    const slap = clamp((stretch - CFG.RELEASE_SLAP_FROM) / 0.35, 0, 1);
    tuneLog(
      `release  stretch ${stretch.toFixed(2)} pat ${(0.35 + 0.75 * weight).toFixed(2)} slap ${slap > 0 ? (slap ** 1.5).toFixed(2) : "none"}`,
    );
    if (slap > 0)
      playSlap(slap, this.heat / 100, this.oil, 1.1, 0, slap ** 1.5);
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

  onWaistband(hit) {
    return (
      !!hit &&
      this.canStrip() &&
      this.peach.heightAt(hit.point) > CFG.WAISTBAND_FROM
    );
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

  holdStripSpot(hit) {
    const spot = this.marker.fromHit(hit);
    this.stripSpot.local.copy(spot.local);
    this.stripSpot.normal.copy(spot.normal);
  }

  startStrip() {
    this.garment.stripping = true;
    this.discover("strip");
    playSquish(0.2);
    this.talk.say("strip", 0.6);
  }

  updateStrip(delta) {
    const p = this.pointer;
    const g = this.garment;
    const wanted = clamp((p.y - p.downY) / (viewHeight() * 0.22), -0.6, 1);
    g.target = wanted < 0 ? -0.42 * Math.tanh(-wanted / 0.42) : wanted;
    this.rubbing = clamp(Math.abs(g.velocity) * 0.3, 0, 0.6);
    if (g.pull < 0) {
      const hike = Math.min(1, -g.pull / 0.45);
      const lifting = Math.max(0, -0.17 - g.pull) / 0.2;
      g.liftHold = lifting > 0 ? (g.liftHold || 0) + delta : 0;
      const giving = Math.min(1, g.liftHold / 0.9) ** 2;
      const t = this.clock;
      const tugBack = Math.max(0, Math.sin(t * 2.6)) ** 2;
      this.velocity.y +=
        (hike * 2 + lifting * 24 * giving - lifting * tugBack * 5) * delta;
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
      this.addHeat(hike * 18 * delta, 99);
      if (hike > 0.6) this.talk.say("wedgie", 0.02);
    } else {
      g.notch = 0;
    }
    this.wake();
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
    this.addHeat(10 * amount);
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
    this.addHeat(8 + 12 * amount);
    if (this.heat >= 100) this.charge();
  }

  removeGarment() {
    const g = this.garment;
    g.worn = false;
    g.stripping = false;
    g.freed = false;
    buzz(30);
    playSnap(0.6);
    this.talk.say("stripped");
    this.emit("stripped");
    this.addHeat(20);
  }

  updateGarment(delta) {
    const g = this.garment;
    if (!this.settings.lingerie && (g.worn || g.visible <= 0)) {
      g.shown = false;
      this.peach.setLingerie(false, 0, 0);
      return;
    }
    if (g.worn && g.dressing) this.updateDressing(delta);
    const steps = Math.ceil(delta / PHYSICS_CONFIG.SUBSTEP);
    const h = delta / steps;
    for (let i = 0; i < steps; i += 1) {
      if (g.worn) {
        const target = g.stripping || g.dressing ? g.target : 0;
        const hike = clamp(-g.pull / 0.45, 0, 1);
        g.velocity += (target - g.pull) * 420 * (1 - 0.5 * hike) * h;
        g.velocity *= Math.exp(-h * 14);
      } else if (g.visible > 0) {
        g.velocity += (1.9 - g.pull) * 70 * h;
        g.velocity *= Math.exp(-h * 6);
      }
      g.pull += g.velocity * h;
    }
    if (!g.worn && g.visible > 0) {
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
    this.countSmack(now);
    this.addHeat(CFG.HEAT_PER_SMACK);
    playSlap(1, this.heat / 100, this.oil, this.firmness.pitch * 1.1);
    const at = this.toScreen(g);
    this.ui.onSmack(this.smacks, this.combo, at.x, at.y);
    this.emit("smack", {
      strength: 1,
      x: at.x,
      y: at.y,
      combo: this.combo,
      total: this.smacks,
      tool: "hand",
    });
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
      y: (1 - this.screen.y) * 0.5 * viewHeight(),
    };
  }

  pixelsPerUnit(world) {
    const distance = this.camera.position.distanceTo(world);
    const halfFov = (this.camera.fov * Math.PI) / 360;
    return viewHeight() / (2 * distance * Math.tan(halfFov));
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

  wake() {
    this.idle = 0;
    this.twerk = null;
  }

  countSmack(now) {
    this.combo =
      now - this.lastSmackAt < CFG.COMBO_WINDOW_MS ? this.combo + 1 : 1;
    this.lastSmackAt = now;
    this.smacks += 1;
    this.wake();
  }

  addHeat(amount, cap = 100) {
    this.heat = Math.min(
      Math.min(cap, this.heatCap),
      this.heat + amount * this.heatGain,
    );
    this.heatHold = CFG.HEAT_DECAY_DELAY;
  }

  charge() {
    if (this.phase !== "live") return;
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
    playFibre(1);
    playHeartbeat(0.65);
    buzz([25, 40, 60]);
    this.ui.onCharge();
    this.talk.say("charge");
    this.emit("charge");
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
    this.talk.hide();
    this.burstLinePending = true;
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
      };
    });
  }

  startSlice() {
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
    buzz(15);
  }

  tearFibre(index) {
    playFibre(0.15 + index * 0.1);
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
    this.freeze = 0.05;
    if (!reducedMotion.matches) {
      this.slowmo = Math.min(0.5, 0.35 * power);
      this.trauma = Math.max(this.trauma, 0.8);
      this.zoomVelocity -= 2;
    }
    buzz([40, 30, 80]);
    this.kickVelocity.addScaledVector(this.sliceNormal, 1.2);
    this.kickVelocity.y -= 0.8;
    playSlap(0.7, 0.6, 0.6, 0.75, 120);
    playSnap(1, true);
    playBurst();
    playSplash();
    this.emit("snap");
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

  pour(hit, landing, motion, flow, delta) {
    const spread = clamp(motion.speed / 1.2, 0, 1);
    this.rubbing = clamp(motion.speed / 2.5, 0.02, 0.6);
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
      this.bottle.splash(landing.x, landing.y);
      playGlug(flow);
      buzz(4);
    }
    this.wake();
    this.ui.onRub();
    this.talk.say("rub", delta * 0.5);
  }

  handlePointer(delta) {
    const p = this.pointer;
    const from = { x: p.frameX ?? p.x, y: p.frameY ?? p.y };
    p.frameX = p.x;
    p.frameY = p.y;
    const motion = this.pointerSpeed(performance.now());
    this.ui.shapeCursor(motion.vx, motion.vy, p.present, delta);
    this.markerSpot = null;
    this.rubbing = 0;

    if (this.carrying) {
      if ((p.pressed || this.carryLatched) && this.phase === "live") {
        const hit = this.pourHit(p.x, p.y);
        const landing = hit ? this.landingAt(hit) : null;
        const peach = {
          x: this.toScreen(this.group.position).x,
          radius: 1.4 * this.pixelsPerUnit(this.group.position),
          center: this.group.position,
          worldRadius: 1.4,
        };
        const flow = this.bottle.carry(
          p.x,
          p.y,
          motion.vx,
          hit,
          landing,
          peach,
          delta,
        );
        this.markerSpot = hit && this.marker.fromHit(hit);
        this.markerStyle = MARKERS.oil;
        if (hit && flow > 0.4) this.pour(hit, landing, motion, flow, delta);
        this.bottle.fling(motion, delta);
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
        this.ui.setGrabTension(0);
      } else if (p.pressed && this.phase === "live") {
        this.updateGrab(delta, motion);
        this.holdMarker();
        return;
      } else {
        this.releaseGrab();
      }
    }
    if (this.garment.stripping) {
      if (p.pressed && this.phase === "live" && this.garment.worn) {
        this.updateStrip(delta);
        const hit = this.raycastAt(p.x, p.y);
        if (hit) this.holdStripSpot(hit);
        this.markerSpot = this.stripSpot;
        this.markerStyle = MARKERS.grab;
        this.ui.setCursorState("hold");
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
    const swiping =
      p.armed &&
      !(p.pressed && p.grabbed) &&
      motion.speed > CFG.MIN_SWIPE_SPEED;
    if (!hit) {
      const crossed = swiping && this.raycastBetween(from, p);
      if (crossed)
        this.smack(
          crossed,
          motion.vx,
          motion.vy,
          clamp(motion.speed / CFG.FULL_SWIPE_SPEED, 0.3, 2),
        );
      p.armed = !p.rubbing;
    } else if (swiping) {
      p.armed = false;
      this.smack(
        hit,
        motion.vx,
        motion.vy,
        clamp(motion.speed / CFG.FULL_SWIPE_SPEED, 0.3, 2),
      );
    } else if (p.pressed) {
      if (this.canStrip() && this.isStripPull()) {
        this.holdStripSpot(hit);
        this.startStrip();
      } else if (p.rubbing || this.startsRub()) {
        if (motion.speed > CFG.MASSAGE_MIN_SPEED)
          this.massageAt(hit, motion, delta);
      } else if (this.canGrab()) {
        this.startGrab(hit);
        this.updateGrab(delta, motion);
        this.holdMarker();
        return;
      }
    } else {
      p.armed = false;
      if (motion.speed > CFG.MASSAGE_MIN_SPEED)
        this.massageAt(hit, motion, delta);
    }
    this.markerSpot = hit && this.marker.fromHit(hit);
    this.markerStyle = this.onWaistband(hit)
      ? MARKERS.band
      : MARKERS[this.toolName];
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
    const afterSmack = performance.now() - this.lastSmackAt < 400;
    const rubSpeed = Math.max(motion.speed, this.pathSpeed(performance.now()));
    this.rubbing = afterSmack ? 0.001 : clamp(rubSpeed / 2.5, 0.02, 0.6);
    this.discover("rub");
    this.wake();
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
    const held = performance.now() - p.downAt > CFG.GRAB_HOLD_MS;
    let gripped = held || p.travel > CFG.GRAB_START_PX;
    if (p.touch) gripped = held;
    if (p.onWaistband) gripped = p.travel > 28;
    return this.toolName === "hand" && p.armed && p.downOnPeach && gripped;
  }

  startsRub() {
    const p = this.pointer;
    if (
      !p.touch ||
      this.toolName !== "hand" ||
      !p.downOnPeach ||
      p.onWaistband ||
      p.grabbed ||
      p.travel <= CFG.GRAB_START_PX
    )
      return false;
    p.rubbing = true;
    p.armed = false;
    return true;
  }

  raycastBetween(a, b) {
    const steps = Math.min(
      24,
      Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / CFG.SWIPE_STEP_PX),
    );
    for (let k = 1; k < steps; k += 1) {
      const t = k / steps;
      const hit = this.raycastAt(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
      if (hit) return hit;
    }
    return null;
  }

  discover(gesture) {
    this.found.add(gesture);
    if (this.tip?.gesture === gesture) {
      this.tip = null;
      this.ui.hideTip();
    }
  }

  updateTips(delta) {
    this.tipIdle += delta;
    if (this.tip) {
      this.tip.left -= delta;
      if (this.tip.left <= 0) {
        this.tip = null;
        this.ui.hideTip();
        this.tipIdle = 0;
      }
      return;
    }
    if (this.tipIdle < CFG.TIP_IDLE_SECONDS || this.phase !== "live") return;
    const { touch } = this.pointer;
    const open = TIPS.find(
      (t) => !this.found.has(t.gesture) && (!t.when || t.when(this, touch)),
    );
    if (!open) return;
    this.tip = { gesture: open.gesture, left: CFG.TIP_SECONDS };
    this.ui.showTip(
      typeof open.text === "function" ? open.text(touch) : open.text,
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
    this.emit("twerk", { beat: this.twerk.beats });
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
      this.idle > this.twerkAfter &&
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

    const { pose } = this;
    g.position.set(
      this.offset.x + pose.x,
      this.offset.y + Math.sin(t * 1.4) * 0.12 * calm + pose.lift,
      this.offset.z,
    );
    g.rotation.set(
      this.tilt.x,
      Math.sin(t * 0.45) * 0.25 * calm + this.tilt.y + pose.yaw,
      this.tilt.z + Math.sin(t * 43) * tremble + pose.roll,
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
    const ty = still || !p.present ? 0 : (p.y / viewHeight() - 0.5) * -0.3;
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
    if (
      this.burstLinePending &&
      (this.phase === "live" ||
        (this.phase === "entering" &&
          this.phaseTime >= CFG.RESPAWN_DURATION * 0.5))
    ) {
      this.burstLinePending = false;
      this.talk.say("burst");
    }
    if (this.phase === "charging") this.updateCharge(delta);
    this.updateHalves(delta);
    if (this.phase === "burst" && this.phaseTime >= CFG.RESPAWN_DELAY) {
      this.enter();
    }

    this.handlePointer(delta);
    this.updateTips(delta);
    const holding = this.grab && this.markerSpot === this.grab;
    this.marker.update(
      this.markerSpot,
      this.markerStyle,
      delta,
      holding ? this.grab.tension * 0.35 : 0,
    );
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
      this.heat = Math.max(
        0,
        this.heat - CFG.HEAT_DECAY * this.coolRate * delta,
      );
    if (!this.rubbing)
      this.oil = Math.max(0, this.oil - CFG.OIL_DRY_RATE * delta);
    this.peach.setOil(this.oil);
    setRub(
      this.carrying ? 0 : this.rubbing,
      this.oil,
      clamp((this.pointer.x / window.innerWidth) * 2 - 1, -1, 1) * 0.5,
    );

    this.juice.update(delta);
    this.ui.setMeters(this.heat / 100, this.oil);
    this.bottle.update(delta);
    this.bottle.setCalling(
      this.phase === "live" && !this.carrying && this.oil < 0.05,
    );
    this.updateOverlays();
  }
}
