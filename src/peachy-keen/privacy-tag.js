import {
  CanvasTexture,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Path,
  Plane,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  RepeatWrapping,
  SRGBColorSpace,
  Shape,
  SphereGeometry,
  Vector2,
  Vector3,
} from "three";
import { reducedMotion, viewHeight } from "./util";
import { sidePanel } from "./idle/dom";

const DEPTH = 2.2;
const LINKS = 12;
const GRAVITY = 2600;
const SOLVE = 14;
const STEP = 1 / 120;
const FLICK = 900;
const TUG = 1100;
const TUG_SNAP = 2500;
const TAP_MS = 320;
const SHEET_SCALE = 0.72;
const SIZE = [44, 134, 6];
const PIVOT = SIZE[0] * 0.42;
const HANG = { side: 210, sheet: 150 };
const PEEK = 52;
const STRETCH = 0.5;
const TASSEL_GRAB = 30;
const SLIDE_PX = 8;
const BRUSH_ROLL = 0.025;
const BRUSH_TWIST = 0.06;
const BRUSH_MAX = 40;
const CORD_REACH = 26;
const CORD_PUSH = 0.2;
const BOARD_WIND = 620;
const BOARD_DAMP = 1.5;
const MAX_PULL = 7000;
const MAX_ROLL = 1.5;
const TASSEL_LINKS = 3;
const RED = 0xc0252f;
const MINCHO =
  '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", "Noto Serif CJK JP", serif';
const LABEL = "起こさないで";
const LABEL_SIZE = 31;
const TURN = Math.PI * 2;
const UP = new Vector3(0, 1, 0);
const FREE_PLAY_KEY = "peachy-keen-free-play";

const playedClassic = () =>
  localStorage.getItem("peachy-keen-mode") === "classic" ||
  JSON.parse(localStorage.getItem("peachy-keen-achievements") || "[]").length >
    0;

export function freePlayOpen() {
  try {
    return localStorage.getItem(FREE_PLAY_KEY) === "1" || playedClassic();
  } catch {
    return false;
  }
}

export function openFreePlay() {
  try {
    localStorage.setItem(FREE_PLAY_KEY, "1");
  } catch {
    // Blocked storage means the start screen does not offer free play.
  }
}

// The top-left corner holds no score, shop or helpers, so the tag hangs there.
export function cordX() {
  return sidePanel.matches ? 84 : 40;
}

function woodTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const c = canvas.getContext("2d");
  const g = c.createLinearGradient(0, 0, 256, 256);
  g.addColorStop(0, "#f2dfb8");
  g.addColorStop(0.5, "#e2c594");
  g.addColorStop(1, "#d4b07a");
  c.fillStyle = g;
  c.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 240; i += 1) {
    const x0 = Math.random() * 256;
    const phase = Math.random() * 6;
    c.strokeStyle =
      Math.random() < 0.55
        ? "rgba(150, 100, 50, 0.2)"
        : "rgba(255, 250, 230, 0.2)";
    c.lineWidth = 0.4 + Math.random() * 1.4;
    c.beginPath();
    for (let y = 0; y <= 256; y += 4) {
      const x =
        x0 + Math.sin(y * 0.009 + phase) * 1 + Math.sin(y * 0.011 + phase) * 6;
      if (y === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  return texture;
}

function tagShape(w, h) {
  const s = new Shape();
  s.moveTo(-w / 2, -h / 2);
  s.lineTo(w / 2, -h / 2);
  s.lineTo(w / 2, h / 2 - w * 0.32);
  s.lineTo(0, h / 2);
  s.lineTo(-w / 2, h / 2 - w * 0.32);
  s.closePath();
  const hole = new Path();
  hole.absarc(0, h / 2 - w * 0.42, w * 0.07, 0, Math.PI * 2, true);
  s.holes.push(hole);
  return s;
}

function peachLine(c, x, y, size) {
  const d = size * 0.42;
  const r = size * 0.72;
  const k = Math.sqrt(r * r - d * d);
  const a = Math.atan2(k, d);
  c.beginPath();
  c.arc(x - d, y, r, -a, a, true);
  c.arc(x + d, y, r, Math.PI - a, -(Math.PI - a), true);
  c.moveTo(x, y - k);
  c.quadraticCurveTo(x + size * 0.08, y - k * 0.3, x, y + k * 0.1);
  c.stroke();
}

/* eslint-disable no-param-reassign */
function drawLabel(c, h, u, mid) {
  const step = LABEL_SIZE * 1.06 * u;
  const top = h * 0.45 - ((LABEL.length - 1) * step) / 2;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillStyle = "#1d1210";
  c.font = `600 ${LABEL_SIZE * u}px ${MINCHO}`;
  [...LABEL].forEach((ch, n) => c.fillText(ch, mid, top + n * step));
}
/* eslint-enable no-param-reassign */

function drawFace(canvas, face) {
  const c = canvas.getContext("2d");
  const { width: w, height: h } = canvas;
  c.clearRect(0, 0, w, h);
  const u = w / 100;
  const mid = w / 2;
  if (face === "front") drawLabel(c, h, u, mid);
  c.fillStyle = "#b3202a";
  c.fillRect(mid - 15 * u, h * 0.86, 30 * u, 30 * u);
  c.strokeStyle = "#f6e6d0";
  c.lineWidth = 2 * u;
  peachLine(c, mid, h * 0.86 + 17 * u, 7 * u);
}

export class PrivacyTag {
  constructor({ scene, camera, anchorX, pull, takeDown }) {
    Object.assign(this, { camera, anchorX, pull, takeDown });
    this.group = new Group();
    this.group.visible = false;
    scene.add(this.group);
    this.board = new Group();
    this.group.add(this.board);
    this.silk = new CylinderGeometry(1, 1, 1, 8, 1);
    this.red = new MeshStandardMaterial({ color: RED, roughness: 0.55 });
    this.links = Array.from({ length: LINKS }, () => {
      const m = new Mesh(this.silk, this.red);
      this.group.add(m);
      return m;
    });
    const gold = new MeshStandardMaterial({
      color: 0xe3b452,
      roughness: 0.4,
      metalness: 0.6,
    });
    this.tassel = {
      cords: Array.from(
        { length: TASSEL_LINKS },
        () => new Mesh(this.silk, this.red),
      ),
      knot: new Mesh(new SphereGeometry(1, 12, 8), this.red),
      band: new Mesh(new CylinderGeometry(1, 1, 1, 12), gold),
      fringe: new Mesh(new ConeGeometry(1, 1, 14, 1, true), this.red),
    };
    this.tasselParts = [
      ...this.tassel.cords,
      this.tassel.knot,
      this.tassel.band,
      this.tassel.fringe,
    ];
    this.tasselParts.forEach((m) => this.group.add(m));
    this.wood = new MeshPhysicalMaterial({
      map: woodTexture(),
      roughness: 0.62,
      sheen: 0.2,
    });
    this.prints = [0, 1].map(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = Math.round((400 * SIZE[1]) / SIZE[0]);
      const map = new CanvasTexture(canvas);
      map.colorSpace = SRGBColorSpace;
      map.anisotropy = 8;
      const material = new MeshPhysicalMaterial({
        map,
        transparent: true,
        depthWrite: false,
        roughness: 0.8,
      });
      return { canvas, map, material };
    });

    this.state = "off";
    this.owned = false;
    this.layout = "";
    this.painted = false;
    this.points = [];
    this.anchor = new Vector3();
    this.segment = 10;
    this.length = 0;
    this.lengthV = 0;
    this.angle = 0;
    this.spin = 0;
    this.goal = null;
    this.drag = null;
    this.time = 0;
    this.pending = 0;
    this.gust = 0;
    this.body = {
      roll: 0,
      rollV: 0,
      pitch: 0,
      pitchV: 0,
      flutter: 0,
      flutterV: 0,
    };
    this.ends = [new Vector3(), new Vector3()];
    this.bodyPrev = { roll: 0, pitch: 0, flutter: 0 };
    this.drawPoints = Array.from({ length: LINKS + 1 }, () => new Vector3());
    this.worldA = new Vector3();
    this.worldB = new Vector3();
    this.tasselWorld = Array.from(
      { length: TASSEL_LINKS + 1 },
      () => new Vector3(),
    );
    this.pullAccel = new Vector3();
    this.bottom = new Vector3();
    this.tasselPoints = [];
    this.ray = new Raycaster();
    this.ndc = new Vector2();
    this.plane = new Plane(new Vector3(0, 0, 1), -DEPTH);
    this.tmp = new Vector3();
    this.tmp2 = new Vector3();
    this.upDir = new Vector3(0, 1, 0);
    this.side = new Vector3();
    this.front = new Vector3();
    this.basis = new Matrix4();
    this.yaw = new Quaternion();

    window.addEventListener("pointerdown", (e) => this.down(e), {
      capture: true,
    });
    window.addEventListener("pointermove", (e) => this.move(e), {
      capture: true,
    });
    window.addEventListener("pointerup", (e) => this.up(e), { capture: true });
    document.fonts?.load(`600 20px ${MINCHO}`).then(() => {
      this.painted = false;
    });
  }

  build(layout) {
    const k = layout === "side" ? 1 : SHEET_SCALE;
    const [w, h, t] = SIZE.map((v) => v * k);
    const pivot = PIVOT * k;
    this.scale = k;
    this.hangL = Math.max(8, h / 2 - pivot);
    this.arm = h - pivot;
    this.tassel.link = 5.5 * k;
    this.board.clear();
    const bevel = Math.min(t * 0.35, 2.2);
    const depth = Math.max(0.5, t - bevel * 2);
    const geometry = new ExtrudeGeometry(
      tagShape(w - bevel * 2, h - bevel * 2),
      {
        depth,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize: bevel,
        bevelSegments: 3,
        curveSegments: 10,
      },
    );
    geometry.translate(0, -h / 2 + pivot, -depth / 2);
    const { uv } = geometry.attributes;
    for (let i = 0; i < uv.count; i += 1)
      uv.setXY(i, uv.getX(i) / w + 0.5, uv.getY(i) / h + 0.5);
    this.board.add(new Mesh(geometry, this.wood));
    const plane = new PlaneGeometry(w, h);
    this.prints.forEach(({ material }, n) => {
      const m = new Mesh(plane, material);
      m.position.set(0, -h / 2 + pivot, (n ? -1 : 1) * (t / 2 + 0.35));
      if (n) m.rotation.y = Math.PI;
      this.board.add(m);
    });
    const grab = new Mesh(
      new PlaneGeometry(w + 64, h + 44),
      new MeshStandardMaterial({ visible: false }),
    );
    grab.position.set(0, -h / 2 + pivot, 0);
    this.board.add(grab);
  }

  paint() {
    this.prints.forEach(({ canvas, map }, n) => {
      drawFace(canvas, n ? "back" : "front");
      map.needsUpdate = true; // eslint-disable-line no-param-reassign
    });
  }

  rope() {
    const k = this.scale;
    const top = -(SIZE[1] * k + 40);
    const tassel = (TASSEL_LINKS * 5.5 + 26) * k;
    const lengths = {
      idle: PEEK - tassel - this.arm - top,
      on: HANG[this.layout === "sheet" ? "sheet" : "side"] - top,
    };
    return {
      x: this.anchorX(),
      top,
      length: lengths[this.state] ?? 0,
      lengths,
    };
  }

  reset(length = 0) {
    const { x, top } = this.rope();
    this.anchor.set(x, top, 0);
    this.length = length;
    this.lengthV = 0;
    this.segment = Math.max(0.5, length) / LINKS;
    this.points = Array.from({ length: LINKS + 1 }, (_, n) => {
      const p = new Vector3(x, top + (n / LINKS) * Math.max(0.5, length), 0);
      return {
        p,
        old: p.clone(),
        prev: p.clone(),
        w: [0, 1, 0.25][Math.sign(n) + (n === LINKS ? 1 : 0)],
      };
    });
    Object.assign(this.body, {
      roll: 0,
      rollV: 0,
      pitch: 0,
      pitchV: 0,
      flutter: 0,
      flutterV: 0,
    });
    const end = this.points[LINKS].p;
    this.ends.forEach((e) => e.copy(end));
    this.tasselPoints = Array.from({ length: TASSEL_LINKS + 1 }, () => ({
      p: end.clone(),
      old: end.clone(),
      prev: end.clone(),
    }));
    this.remember();
  }

  // The steps are fixed, so each frame draws between the last two of them instead of snapping to the newest.
  remember() {
    [...this.points, ...this.tasselPoints].forEach((pt) => pt.prev.copy(pt.p));
    const { roll, pitch, flutter } = this.body;
    Object.assign(this.bodyPrev, { roll, pitch, flutter });
  }

  drawn(points, alpha) {
    return points.map((pt, n) =>
      this.drawPoints[n].lerpVectors(pt.prev, pt.p, alpha),
    );
  }

  hang() {
    if (this.state === "on") return;
    const fresh = this.state === "off" || this.state === "hiding";
    this.state = "on";
    this.angle = 0;
    this.spin = 0;
    this.goal = null;
    if (fresh && this.layout) this.reset(0);
  }

  raise() {
    if (this.state === "on") this.state = "idle";
  }

  screenToWorld(x, y, z, out) {
    this.ndc.set((x / window.innerWidth) * 2 - 1, -(y / viewHeight()) * 2 + 1);
    this.ray.setFromCamera(this.ndc, this.camera);
    this.ray.ray.intersectPlane(this.plane, out);
    return out.addScaledVector(this.ray.ray.direction, -z * this.pixel);
  }

  knotDistance(e) {
    const knot = this.tasselPoints[TASSEL_LINKS]?.p;
    return knot
      ? Math.hypot(e.clientX - knot.x, e.clientY - knot.y - 8 * this.scale)
      : Infinity;
  }

  hit(e) {
    if (this.state !== "idle" && this.state !== "on") return false;
    if (this.knotDistance(e) < TASSEL_GRAB) return true;
    if (this.state !== "on") return false;
    this.ndc.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / viewHeight()) * 2 + 1,
    );
    this.ray.setFromCamera(this.ndc, this.camera);
    return this.ray.intersectObject(this.board, true).length > 0;
  }

  down(e) {
    if (!this.group.visible || e.target.closest?.(".ui, .panel, .intro"))
      return;
    if (!this.hit(e)) return;
    e.stopPropagation();
    e.preventDefault();
    const end = this.points[LINKS].p;
    this.drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      t: e.timeStamp,
      dx: end.x - e.clientX,
      dy: end.y - e.clientY,
      length: this.length,
      grab: Math.min(
        Math.hypot(e.clientX - end.x, e.clientY - end.y),
        this.arm + 30 * this.scale,
      ),
      moved: 0,
      mode: null,
      trail: [{ x: e.clientX, y: e.clientY, t: e.timeStamp }],
    };
  }

  slideTo(x, y) {
    const d = this.drag;
    const { lengths } = this.rope();
    const lo = lengths.idle - 20;
    const hi = lengths.on + 160;
    const dir = this.tmp2.set(x - this.anchor.x, y - this.anchor.y, 0);
    let length = dir.length() - d.grab;
    if (length > hi) length = hi + (length - hi) * STRETCH;
    if (length < lo) length = lo - (lo - length) * STRETCH;
    this.length = length;
    d.lean = Math.max(
      -1.3,
      Math.min(1.3, Math.atan2(dir.x, Math.max(1, dir.y))),
    );
    d.endX = this.anchor.x + Math.sin(d.lean) * Math.max(0, length);
  }

  brush(e) {
    const last = this.brushAt;
    this.brushAt = { x: e.clientX, y: e.clientY };
    const shown = this.state === "on" || this.state === "idle";
    if (!shown || !last || e.target.closest?.(".ui, .panel")) return;
    const dx = Math.max(-BRUSH_MAX, Math.min(BRUSH_MAX, e.clientX - last.x));
    if (!dx) return;
    const reach = CORD_REACH * this.scale;
    this.points.forEach(({ p, w }) => {
      const near = 1 - Math.hypot(p.x - e.clientX, p.y - e.clientY) / reach;
      // eslint-disable-next-line no-param-reassign
      if (w && near > 0) p.x += dx * CORD_PUSH * near;
    });
    if (this.state !== "on") return;
    this.ndc.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / viewHeight()) * 2 + 1,
    );
    this.ray.setFromCamera(this.ndc, this.camera);
    if (!this.ray.intersectObject(this.board, true).length) return;
    this.body.rollV += dx * BRUSH_ROLL;
    this.body.flutterV += dx * BRUSH_TWIST;
    this.points.slice(-3).forEach(({ p }) => {
      // eslint-disable-next-line no-param-reassign
      p.x += dx * CORD_PUSH * 0.3;
    });
  }

  move(e) {
    const d = this.drag;
    if (!d) this.brush(e);
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.moved = Math.max(d.moved, Math.hypot(dx, dy));
    if (!d.mode && d.moved > SLIDE_PX)
      d.mode =
        this.state === "on" && Math.abs(dx) > Math.abs(dy) ? "swing" : "slide";
    d.px = e.clientX;
    d.py = e.clientY;
    d.trail.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
    if (d.trail.length > 5) d.trail.shift();
    if (d.mode === "slide") this.slideTo(e.clientX, e.clientY);
  }

  up(e) {
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    e.stopPropagation();
    this.drag = null;
    const first = d.trail[0];
    const dt = Math.max(16, e.timeStamp - first.t) / 1000;
    if (!d.mode) {
      if (e.timeStamp - d.t < TAP_MS) {
        if (this.state === "idle") this.pull();
        else this.takeDown();
      }
      return;
    }
    if (d.mode === "slide") {
      const v = (e.clientY - first.y) / dt;
      if (this.state === "on" && v > TUG) {
        this.lengthV = -TUG_SNAP;
        this.takeDown();
        return;
      }
      this.lengthV = Math.max(-2500, Math.min(2500, v));
      const { lengths } = this.rope();
      const down = this.length + v * 0.18 > (lengths.idle + lengths.on) / 2;
      if (down && this.state === "idle") this.pull();
      if (!down && this.state === "on") this.takeDown();
      return;
    }
    const v = (e.clientX - first.x) / dt;
    if (Math.abs(v) > FLICK && e.timeStamp - d.t < 400) {
      this.spin = Math.sign(v) * 9;
      this.goal = (Math.round(this.angle / TURN) + Math.sign(v)) * TURN;
    }
  }

  stepTurn(delta) {
    if (this.goal === null) this.goal = Math.round(this.angle / TURN) * TURN;
    this.spin += ((this.goal - this.angle) * 40 - this.spin * 5) * delta;
    this.angle += this.spin * delta;
    if (
      Math.abs(this.goal - this.angle) >= 0.004 ||
      Math.abs(this.spin) >= 0.04
    )
      return;
    this.angle = this.goal;
    this.spin = 0;
    this.goal = null;
  }

  bottomDir(out, { roll, pitch } = this.body) {
    return out.set(
      Math.sin(roll) * Math.cos(pitch),
      Math.cos(roll) * Math.cos(pitch),
      Math.sin(pitch),
    );
  }

  stepBody(dt) {
    const end = this.points[LINKS].p;
    const [e1, e2] = this.ends;
    const a = this.pullAccel
      .copy(end)
      .addScaledVector(e1, -2)
      .add(e2)
      .divideScalar(dt * dt);
    if (a.length() > MAX_PULL) a.setLength(MAX_PULL);
    e2.copy(e1);
    e1.copy(end);
    const b = this.body;
    const still = reducedMotion.matches ? 0.2 : 1;
    const gy = GRAVITY - a.y;
    const gx = -a.x + this.gust * BOARD_WIND * still;
    const gz =
      -a.z + this.gust * BOARD_WIND * 0.3 * Math.sin(this.time * 0.7) * still;
    const lead = this.drag?.mode === "slide" ? (this.drag.lean ?? 0) : null;
    if (lead === null)
      b.rollV +=
        ((gx * Math.cos(b.roll) - gy * Math.sin(b.roll)) / this.hangL -
          BOARD_DAMP * b.rollV) *
        dt;
    else b.rollV += ((lead - b.roll) * 90 - b.rollV * 9) * dt;
    b.roll += b.rollV * dt;
    if (Math.abs(b.roll) > MAX_ROLL) {
      b.roll = Math.sign(b.roll) * MAX_ROLL;
      b.rollV *= -0.25;
    }
    b.pitchV +=
      ((gz * Math.cos(b.pitch) - gy * Math.sin(b.pitch)) / this.hangL -
        BOARD_DAMP * 1.4 * b.pitchV) *
      dt;
    b.pitch = Math.max(-0.9, Math.min(0.9, b.pitch + b.pitchV * dt));
    const twist = this.gust * Math.sin(this.time * 1.3 + 0.6) * 2.2 * still;
    b.flutterV +=
      (-14 * b.flutter - 1.6 * b.flutterV + twist - b.rollV * 0.4) * dt;
    b.flutter += b.flutterV * dt;
    this.stepTassel(dt, end, still);
  }

  stepTassel(dt, end, still) {
    const pts = this.tasselPoints;
    const { link } = this.tassel;
    const bottom = this.bottomDir(this.bottom)
      .multiplyScalar(this.arm)
      .add(end);
    pts[0].p.copy(bottom);
    pts[0].old.copy(bottom);
    const g = GRAVITY * dt * dt;
    for (let n = 1; n < pts.length; n += 1) {
      const { p, old } = pts[n];
      const vx = (p.x - old.x) * 0.95;
      const vy = (p.y - old.y) * 0.95;
      const vz = (p.z - old.z) * 0.85;
      old.copy(p);
      p.x += vx + this.gust * 220 * still * dt * dt;
      p.y += vy + g;
      p.z += vz - p.z * 0.02;
    }
    for (let k = 0; k < 6; k += 1)
      for (let n = 0; n < pts.length - 1; n += 1) {
        const below = pts[n].p;
        const q = pts[n + 1].p;
        const lean = Math.max(
          -0.75,
          Math.min(
            0.75,
            Math.atan2(q.x - below.x, Math.max(q.y - below.y, link * 0.5)),
          ),
        );
        q.x = below.x + Math.sin(lean) * link;
        q.y = below.y + Math.cos(lean) * link;
        q.z = Math.max(
          below.z - link * 0.5,
          Math.min(below.z + link * 0.5, q.z),
        );
      }
  }

  simulate(dt, wind) {
    const g = GRAVITY * dt * dt;
    const still = reducedMotion.matches ? 0.2 : 1;
    const push = wind * 260 * still * dt * dt;
    this.points.forEach((pt, n) => {
      if (!pt.w) return;
      const { p, old } = pt;
      const vx = (p.x - old.x) * 0.988;
      const vy = (p.y - old.y) * 0.988;
      const vz = (p.z - old.z) * 0.97;
      old.copy(p);
      p.x += vx + push * (n / LINKS);
      p.y += vy + g;
      p.z += vz + push * 0.4 * Math.sin(this.time * 0.9) * (n / LINKS);
    });
    const d = this.drag;
    const held = d && d.mode && d.px !== undefined;
    const end = this.points[LINKS];
    if (held) {
      const want = this.tmp2.set(d.px + d.dx, d.py + d.dy, end.p.z);
      if (d.mode === "slide") {
        const lean = d.lean ?? 0;
        want.x = d.endX ?? want.x;
        want.y = this.anchor.y + Math.cos(lean) * this.length;
      } else {
        const reach = want.distanceTo(this.anchor);
        const free = this.length + 60;
        if (reach > free)
          want
            .sub(this.anchor)
            .setLength(free + (reach - free) * STRETCH)
            .add(this.anchor);
      }
      end.p.copy(want);
    }
    const weight = end.w;
    if (held) end.w = 0;
    for (let k = 0; k < SOLVE; k += 1)
      for (let n = 0; n < LINKS; n += 1) {
        const a = this.points[n];
        const b = this.points[n + 1];
        const wsum = a.w + b.w;
        if (wsum) {
          const diff = this.tmp.subVectors(b.p, a.p);
          const len = diff.length() || 1e-6;
          const corr = (len - this.segment) / len / wsum;
          a.p.addScaledVector(diff, a.w * corr);
          b.p.addScaledVector(diff, -b.w * corr);
        }
      }
    end.w = weight;
    this.stepBody(dt);
  }

  placeLink(m, a, b, radius) {
    const dir = this.tmp2.subVectors(b, a);
    const len = dir.length();
    dir.normalize();
    m.position.copy(a).addScaledVector(dir, len / 2);
    m.quaternion.setFromUnitVectors(UP, dir);
    m.scale.set(radius, len * 1.02, radius);
  }

  placeTassel(px, alpha) {
    const { cords, knot, band, fringe } = this.tassel;
    const k = this.scale;
    const pts = this.drawn(this.tasselPoints, alpha).map((p, n) =>
      this.screenToWorld(p.x, p.y, p.z, this.tasselWorld[n]),
    );
    cords.forEach((m, n) =>
      this.placeLink(m, pts[n], pts[n + 1], 0.9 * k * px),
    );
    const last = pts[pts.length - 1];
    const dir = this.tmp2.subVectors(last, pts[pts.length - 2]).normalize();
    knot.position.copy(last);
    knot.scale.setScalar(3.8 * k * px);
    band.position.copy(last).addScaledVector(dir, 3.6 * k * px);
    band.quaternion.setFromUnitVectors(UP, dir);
    band.scale.set(2.3 * k * px, 2 * k * px, 2.3 * k * px);
    fringe.position.copy(last).addScaledVector(dir, 14 * k * px);
    fringe.quaternion.setFromUnitVectors(UP, this.tmp.copy(dir).negate());
    fringe.scale.set(5.6 * k * px, 21 * k * px, 5.6 * k * px);
  }

  update(delta, { wind }) {
    const layout = sidePanel.matches ? "side" : "sheet";
    if (layout !== this.layout) {
      this.layout = layout;
      this.build(layout);
      if (this.state !== "off") this.reset();
    }
    if (!this.painted) {
      this.painted = true;
      this.paint();
    }
    if (this.state === "off" && this.owned) {
      this.state = "idle";
      this.reset(0);
    }
    if (this.state === "hiding" && this.owned) this.state = "idle";
    if (this.state === "idle" && !this.owned) this.state = "hiding";
    this.group.visible = this.state !== "off";
    if (this.state === "off") return;
    this.time += delta;
    const distance = this.camera.position.z - DEPTH;
    this.pixel =
      (2 * distance * Math.tan((this.camera.fov * Math.PI) / 360)) /
      viewHeight();

    const { x, top, length } = this.rope();
    const dt = Math.min(delta, 1 / 30);
    if (this.drag?.mode !== "slide") {
      this.lengthV += ((length - this.length) * 30 - this.lengthV * 11) * dt;
      this.length += this.lengthV * dt;
    }
    this.anchor.x += (x - this.anchor.x) * Math.min(1, delta * 8);
    this.anchor.y = top;
    this.segment = Math.max(0.5, this.length) / LINKS;
    if (this.state === "hiding" && this.length < 4) {
      this.state = "off";
      this.group.visible = false;
      this.angle = 0;
      return;
    }
    const still = reducedMotion.matches ? 0.3 : 1;
    const t = this.time;
    this.gust =
      wind +
      (0.35 * Math.sin(t * 0.8) +
        0.2 * Math.sin(t * 1.9 + 1.3) +
        0.12 * Math.sin(t * 3.7 + 0.4)) *
        (0.25 + Math.abs(wind)) *
        still;
    this.points[0].p.copy(this.anchor);
    this.points[0].old.copy(this.anchor);
    this.pending = Math.min(this.pending + delta, STEP * 6);
    while (this.pending >= STEP) {
      this.pending -= STEP;
      this.remember();
      this.simulate(STEP, wind);
    }
    this.stepTurn(delta);

    const alpha = this.pending / STEP;
    const mix = (key) =>
      this.bodyPrev[key] + (this.body[key] - this.bodyPrev[key]) * alpha;
    const pose = { roll: mix("roll"), pitch: mix("pitch") };
    const px = this.pixel;
    const rope = this.drawn(this.points, alpha);
    this.links.forEach((m, n) => {
      const a = rope[n];
      const b = rope[n + 1];
      this.placeLink(
        m,
        this.screenToWorld(a.x, a.y, a.z, this.worldA),
        this.screenToWorld(b.x, b.y, b.z, this.worldB),
        1.1 * this.scale * px,
      );
    });
    const end = rope[LINKS];
    this.screenToWorld(end.x, end.y, end.z, this.board.position);
    this.board.scale.setScalar(px);
    const down = this.bottomDir(this.tmp, pose);
    const up = this.upDir.set(-down.x, down.y, -down.z).normalize();
    const front = this.front
      .set(0, 0, 1)
      .addScaledVector(up, -up.z)
      .normalize();
    const side = this.side.crossVectors(up, front);
    this.basis.makeBasis(side, up, front);
    this.board.quaternion
      .setFromRotationMatrix(this.basis)
      .premultiply(this.camera.quaternion)
      .multiply(this.yaw.setFromAxisAngle(UP, this.angle + mix("flutter")));
    this.placeTassel(px, alpha);
  }
}
