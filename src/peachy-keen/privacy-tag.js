import {
  CanvasTexture,
  CatmullRomCurve3,
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
import { playCord } from "./audio";
import { sidePanel } from "./idle/dom";

const DEPTH = 2.2;
const LINKS = 12;
const GRAVITY = 2600;
const SOLVE = 14;
const STEP = 1 / 120;
const FLICK = 900;
const TUG_SNAP = 1200;
const REEL = [90, 14];
const SETTLE = [60, 9];
const REEL_CALM = 250;
const MIN_HANG = 0.35;
const REEL_DRAG = 0.045;
const TAIL_KEEP = 0.9;
const TAIL_WIND = 90;
const TUCKED_SWAY = 0.12;
const CATCH = 70;
const GIVE = 180;
const STALE_MS = 100;
const TAP_MS = 320;
const IDLE_GRAB = 48;
const IDLE_CATCH = 50;
const IDLE_SWAY = 80;
const MAX_FLING = 2500;
const IDLE_FLICK = 400;
const IDLE_TUG = 24;
const HOVER_PEEK = 18;
const ELASTIC = 0.2;
const TAUT = 0.985;
const TIGHTEN = 0.12;
const BEND_START = 0.04;
const SLACK = 1;
const BEND = 0.2;
const CURVE_LINKS = 36;
const CORD_KEEP = 0.975;
const STRETCH_EASE = 10;
const SHEET_SCALE = 0.72;
const SIZE = [44, 134, 6];
const PIVOT = SIZE[0] * 0.42;
const HANG = { side: 191, sheet: 137 };
const PEEK = 52;
const TASSEL_GRAB = 30;
const SLIDE_PX = 8;
const FINGER = 14;
const CORD_KICK = 0.08;
const SPIN_KICK = 0.05;
const TOW_KICK = 0.06;
const MAX_KICK = 160;
const TOW_FALLOFF = [1, 0.6, 0.3];
const STEADY_SPEED = 300;
const STEADY = 3;
const BOARD_WIND = 620;
const BOARD_DAMP = 7;
const MAX_PULL = 7000;
const MAX_ROLL = 1.5;
const KNOT_GAP = 3;
const TASSEL_LINKS = 3;
const RED = 0xc0252f;
const MINCHO =
  '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", "Noto Serif CJK JP", serif';
const LABEL = "起こさないで";
const LABEL_SIZE = 28;
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
  const top = new Path();
  top.absarc(0, h / 2 - w * 0.42, w * 0.085, 0, Math.PI * 2, true);
  const bottom = new Path();
  bottom.absarc(0, -h / 2 + w * 0.16, w * 0.06, 0, Math.PI * 2, true);
  s.holes.push(top, bottom);
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
  const top = h * 0.5 - ((LABEL.length - 1) * step) / 2;
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
  c.fillRect(mid - 15 * u, h * 0.8, 30 * u, 30 * u);
  c.strokeStyle = "#f6e6d0";
  c.lineWidth = 2 * u;
  peachLine(c, mid, h * 0.8 + 17 * u, 7 * u);
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
    this.knotShape = new SphereGeometry(1, 12, 8);
    this.links = Array.from({ length: CURVE_LINKS }, () => {
      const m = new Mesh(this.silk, this.red);
      this.group.add(m);
      return m;
    });
    this.ropeWorld = Array.from({ length: LINKS + 1 }, () => new Vector3());
    // The cord is drawn as a smooth curve through the physics points, so bends show no corners.
    this.curve = new CatmullRomCurve3(this.ropeWorld, false, "centripetal");
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
    this.finger = null;
    this.peek = false;
    this.stretch = 0;
    this.touching = new Set();
    this.onBoard = false;
    this.steady = false;
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
    document.addEventListener("pointerleave", () => {
      this.peek = false;
    });
    document.fonts?.load(`600 20px ${MINCHO}`).then(() => {
      this.painted = false;
    });
  }

  build(layout) {
    const k = layout === "side" ? 1 : SHEET_SCALE;
    const [w, h, t] = SIZE.map((v) => v * k);
    const pivot = PIVOT * k;
    // The tag hangs from a knot above it; the cord loops down through the top hole.
    const gap = KNOT_GAP * k;
    const knotUp = pivot + gap;
    const shift = -h / 2 + pivot - knotUp;
    this.scale = k;
    this.hangL = h / 2 - pivot + knotUp;
    this.arm = h - pivot + knotUp + gap;
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
    geometry.translate(0, shift, -depth / 2);
    const { uv } = geometry.attributes;
    for (let i = 0; i < uv.count; i += 1)
      uv.setXY(i, uv.getX(i) / w + 0.5, uv.getY(i) / h + 0.5);
    this.board.add(new Mesh(geometry, this.wood));
    const plane = new PlaneGeometry(w, h);
    this.prints.forEach(({ material }, n) => {
      const m = new Mesh(plane, material);
      m.position.set(0, shift, (n ? -1 : 1) * (t / 2 + 0.35));
      if (n) m.rotation.y = Math.PI;
      this.board.add(m);
    });
    const grab = new Mesh(
      new PlaneGeometry(w + 64, h + 44),
      new MeshStandardMaterial({ visible: false }),
    );
    grab.position.set(0, shift, 0);
    this.board.add(grab);
    const bottomEdge = -(h - pivot) - knotUp;
    this.addLoop(-knotUp, -gap, 0, t, 2.2 * k);
    this.addLoop(
      bottomEdge + w * 0.16,
      bottomEdge,
      bottomEdge - gap,
      t,
      1.8 * k,
    );
  }

  // Two strands from a hole, one each side of the wood, over the edge to a knot.
  addLoop(hole, edge, knot, t, knotSize) {
    const k = this.scale;
    [1, -1].forEach((side) => {
      const a = new Vector3(0, hole, side * (t / 2 + 0.6));
      const b = new Vector3(
        0,
        edge + Math.sign(edge - hole) * 0.5,
        side * t * 0.25,
      );
      const c = new Vector3(0, knot, 0);
      [
        [a, b],
        [b, c],
      ].forEach(([from, to]) => {
        const m = new Mesh(this.silk, this.red);
        this.placeLink(m, from, to, 0.9 * k);
        this.board.add(m);
      });
    });
    const tie = new Mesh(this.knotShape, this.red);
    tie.position.set(0, knot, 0);
    tie.scale.setScalar(knotSize);
    this.board.add(tie);
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
      idle: PEEK - tassel - this.arm - top + (this.peek ? HOVER_PEEK * k : 0),
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

  // Where the tag shows on screen, so candlelight can keep a soft light on it.
  spot() {
    if (!this.group.visible) return null;
    const k = this.scale;
    const [w, h] = SIZE.map((v) => v * k);
    let x;
    let y;
    if (this.state === "on") {
      const end = this.points[LINKS].p;
      const down = this.bottomDir(this.tmp);
      x = end.x + down.x * this.hangL;
      y = end.y + down.y * this.hangL;
    } else {
      const top = this.tasselPoints[0].p;
      x = top.x;
      y = (top.y + this.tasselPoints[TASSEL_LINKS].p.y + 30 * k) / 2;
    }
    return { x, y, rx: w * 2.4, ry: h * 1.3, soft: true };
  }

  hang() {
    if (this.state === "on") return;
    const fresh = this.state === "off" || this.state === "hiding";
    this.state = "on";
    this.angle = 0;
    this.spin = 0;
    this.goal = null;
    if (fresh && this.layout) this.reset(0);
    // The cord unrolls at once and the tag drops on it, so the elastic catches it with a small bounce.
    if (this.layout) {
      this.length = this.rope().lengths.on;
      this.lengthV = 0;
      // Tucked, the cord lies folded above the screen; unrolling it folded would fling the tag sideways.
      this.points.forEach(({ p, old }) => {
        /* eslint-disable no-param-reassign */
        p.x = this.anchor.x;
        old.x = this.anchor.x;
        /* eslint-enable no-param-reassign */
      });
    }
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
    if (this.state === "idle") {
      // Tucked up only the cord and tail show, so they get a generous grab area.
      const reach = IDLE_GRAB * this.scale;
      return (
        this.knotDistance(e) < reach ||
        this.points
          .slice(-4)
          .some(({ p }) => Math.hypot(e.clientX - p.x, e.clientY - p.y) < reach)
      );
    }
    if (this.knotDistance(e) < TASSEL_GRAB) return true;
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
      moved: 0,
      holding: false,
      caught: false,
      want: new Vector3().copy(end),
      trail: [{ x: e.clientX, y: e.clientY, t: e.timeStamp }],
    };
  }

  // Where the held cord end goes: right under the pointer, with resistance below the resting length.
  holdAt(x, y) {
    const d = this.drag;
    const { lengths } = this.rope();
    const end = this.points[LINKS].p;
    if (this.state === "on") {
      d.want.set(x + d.dx, y + d.dy, end.z);
      const dir = this.tmp2.subVectors(d.want, this.anchor);
      const dist = dir.length();
      const rest = lengths.on;
      if (dist > rest) {
        const reach = GIVE * this.scale;
        const shown = rest + (1 - 1 / ((dist - rest) / reach + 1)) * reach;
        d.want.copy(this.anchor).addScaledVector(dir, shown / dist);
      }
      this.setCaught(
        Math.min(dist, d.want.distanceTo(this.anchor)) >
          rest + CATCH * this.scale,
      );
    } else {
      const length = Math.max(
        lengths.idle - 20,
        Math.min(lengths.on, d.length + (y - d.y)),
      );
      this.length = length;
      const sway = Math.max(-IDLE_SWAY, Math.min(IDLE_SWAY, x - d.x)) * 0.6;
      d.want.set(this.anchor.x + sway, this.anchor.y + length, end.z);
      this.setCaught(length > lengths.idle + IDLE_CATCH * this.scale);
    }
    end.copy(d.want);
    this.points[LINKS].prev.copy(d.want);
  }

  setCaught(caught) {
    const d = this.drag;
    if (caught === d.caught) return;
    d.caught = caught;
    playCord(false, caught ? 1 : 0.4);
  }

  // The pointer brushes past: each part gets one small nudge as the pointer reaches it, never a pull, so it cannot stick.
  brush(e) {
    const last = this.finger;
    this.finger = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    this.steady = false;
    // Tucked away, hovering the grab area lets the cord drop a little: it can be pulled.
    this.peek =
      this.state === "idle" &&
      !e.target.closest?.(".ui, .panel, .intro") &&
      this.hit(e);
    const shown = this.state === "on" || this.state === "idle";
    const stale = !last || e.timeStamp - last.t > STALE_MS;
    if (!shown || stale || e.target.closest?.(".ui, .panel")) {
      this.touching.clear();
      this.onBoard = false;
      return;
    }
    const dt = Math.max(8, e.timeStamp - last.t) / 1000;
    const vx = (e.clientX - last.x) / dt;
    const speed = Math.hypot(vx, (e.clientY - last.y) / dt);
    const kick = (share) => Math.max(-MAX_KICK, Math.min(MAX_KICK, vx * share));
    const reach = FINGER * this.scale;
    this.points.forEach(({ p, w }, n) => {
      const inside =
        w > 0 && Math.hypot(p.x - e.clientX, p.y - e.clientY) < reach;
      // eslint-disable-next-line no-param-reassign
      if (inside && !this.touching.has(n)) p.x += kick(CORD_KICK) * STEP;
      if (inside) this.touching.add(n);
      else this.touching.delete(n);
    });
    let onBoard = false;
    if (this.state === "on") {
      this.ndc.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / viewHeight()) * 2 + 1,
      );
      this.ray.setFromCamera(this.ndc, this.camera);
      onBoard = this.ray.intersectObject(this.board, true).length > 0;
    }
    this.steady = onBoard && speed < STEADY_SPEED;
    const entered = onBoard && !this.onBoard;
    this.onBoard = onBoard;
    if (!entered || this.steady) return;
    const end = this.points[LINKS].p;
    const lever = Math.max(
      20,
      Math.hypot(e.clientX - end.x, e.clientY - end.y),
    );
    this.body.rollV += kick(SPIN_KICK) / lever;
    TOW_FALLOFF.forEach((share, n) => {
      this.points[LINKS - n].p.x += kick(TOW_KICK) * STEP * share;
    });
  }

  move(e) {
    const d = this.drag;
    if (!d) this.brush(e);
    if (!d || e.pointerId !== d.id) return;
    d.moved = Math.max(d.moved, Math.hypot(e.clientX - d.x, e.clientY - d.y));
    d.trail.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
    if (d.trail.length > 5) d.trail.shift();
    if (d.moved > SLIDE_PX) d.holding = true;
    if (d.holding) this.holdAt(e.clientX, e.clientY);
  }

  up(e) {
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    e.stopPropagation();
    this.drag = null;
    if (!d.holding) {
      if (e.timeStamp - d.t < TAP_MS) {
        if (this.state === "idle") this.pull();
        else this.takeDown();
      }
      return;
    }
    const first = d.trail[0];
    const dt = Math.max(16, e.timeStamp - first.t) / 1000;
    const clamp = (v) => Math.max(-MAX_FLING, Math.min(MAX_FLING, v));
    const vx = clamp((e.clientX - first.x) / dt);
    const vy = clamp((e.clientY - first.y) / dt);
    if (this.state === "idle") {
      const tugged = this.length - d.length > IDLE_TUG * this.scale;
      if (d.caught || tugged || vy > IDLE_FLICK) {
        playCord(true);
        this.pull();
      }
      return;
    }
    if (d.caught) {
      playCord(true);
      this.lengthV = -TUG_SNAP;
      this.takeDown();
      return;
    }
    // Let go, it keeps the throw and swings from where it was held; a stretched cord eases back.
    const end = this.points[LINKS];
    this.stretch = Math.max(0, end.p.distanceTo(this.anchor) - this.length);
    end.old.set(end.p.x - vx * STEP, end.p.y - vy * STEP, end.p.z);
    if (Math.abs(vx) > FLICK && e.timeStamp - d.t < 400) {
      this.spin = Math.sign(vx) * 9;
      this.goal = (Math.round(this.angle / TURN) + Math.sign(vx)) * TURN;
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
    const calm = Math.max(
      this.steady ? STEADY : 1,
      1 + Math.abs(this.lengthV) / REEL_CALM,
    );
    // A sharp stop at the top would flip gravity and topple the tag, so some downward pull always stays.
    const gy = Math.max(GRAVITY * MIN_HANG, GRAVITY - a.y);
    const gx = -a.x + this.gust * BOARD_WIND * still;
    const gz =
      -a.z + this.gust * BOARD_WIND * 0.3 * Math.sin(this.time * 0.7) * still;
    // Held, the tag lines up with the cord, as it would on a taut string.
    const lead = this.drag?.holding
      ? Math.max(
          -1.3,
          Math.min(
            1.3,
            Math.atan2(
              end.x - this.anchor.x,
              Math.max(1, end.y - this.anchor.y),
            ),
          ),
        )
      : null;
    if (lead === null)
      b.rollV +=
        ((gx * Math.cos(b.roll) - gy * Math.sin(b.roll)) / this.hangL -
          BOARD_DAMP * calm * b.rollV) *
        dt;
    else b.rollV += ((lead - b.roll) * 90 - b.rollV * 9) * dt;
    b.roll += b.rollV * dt;
    if (Math.abs(b.roll) > MAX_ROLL) {
      b.roll = Math.sign(b.roll) * MAX_ROLL;
      b.rollV *= -0.25;
    }
    b.pitchV +=
      ((gz * Math.cos(b.pitch) - gy * Math.sin(b.pitch)) / this.hangL -
        BOARD_DAMP * 1.4 * calm * b.pitchV) *
      dt;
    b.pitch = Math.max(-0.9, Math.min(0.9, b.pitch + b.pitchV * dt));
    const twist = this.gust * Math.sin(this.time * 1.3 + 0.6) * 2.2 * still;
    b.flutterV +=
      (-14 * b.flutter - 1.6 * calm * b.flutterV + twist - b.rollV * 0.4) * dt;
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
      const vx = (p.x - old.x) * TAIL_KEEP;
      const vy = (p.y - old.y) * TAIL_KEEP;
      const vz = (p.z - old.z) * 0.85;
      old.copy(p);
      p.x += vx + this.gust * TAIL_WIND * still * dt * dt;
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
    // While the cord reels in, extra air drag stops its links flying past the top.
    const keep =
      CORD_KEEP * (1 - Math.min(REEL_DRAG, Math.abs(this.lengthV) / 25000));
    this.points.forEach((pt, n) => {
      if (!pt.w) return;
      const { p, old } = pt;
      const vx = (p.x - old.x) * keep;
      const vy = (p.y - old.y) * keep;
      const vz = (p.z - old.z) * 0.97;
      old.copy(p);
      p.x += vx + push * (n / LINKS);
      p.y += vy + g;
      p.z += vz + push * 0.4 * Math.sin(this.time * 0.9) * (n / LINKS);
    });
    const d = this.drag;
    const held = d?.holding;
    const end = this.points[LINKS];
    if (held) {
      end.p.copy(d.want);
      // Near full length the slack is taken up gradually, so the cord tightens without a snap.
      const dist = end.p.distanceTo(this.anchor);
      const from = this.length * (1 - TIGHTEN);
      if (dist > from) {
        const x = Math.min(1, (dist - from) / (this.length - from));
        const ease = x * x * (3 - 2 * x);
        const taut = Math.max(dist, this.length) * TAUT;
        this.segment = (this.length + (taut - this.length) * ease) / LINKS;
      }
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
          // A stretched link only partly springs back each pass, so the cord gives a little like elastic.
          // A slack link may shorten, so a loose cord hangs in a soft curve instead of folding.
          let give = len > this.segment && !held ? ELASTIC : 1;
          if (len < this.segment) give = SLACK;
          const corr = ((len - this.segment) / len / wsum) * give;
          a.p.addScaledVector(diff, a.w * corr);
          b.p.addScaledVector(diff, -b.w * corr);
        }
      }
    end.w = weight;
    if (held) this.startBend();
    for (let n = 1; n < LINKS; n += 1) {
      const pt = this.points[n];
      if (pt.w) {
        const mid = this.tmp
          .addVectors(this.points[n - 1].p, this.points[n + 1].p)
          .multiplyScalar(0.5);
        pt.p.lerp(mid, held ? BEND : BEND * 0.25);
      }
    }
    this.stepBody(dt);
  }

  // A straight cord with slack would wait and then buckle at once; a tiny push starts the bend early.
  startBend() {
    const a = this.points[0].p;
    const b = this.points[LINKS].p;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 1;
    const spare = this.segment * LINKS - dist;
    if (spare <= 0) return;
    const nx = -dy / dist;
    const ny = dx / dist;
    let bulge = 0;
    this.points.forEach(({ p }) => {
      bulge += (p.x - a.x) * nx + (p.y - a.y) * ny;
    });
    if (Math.abs(bulge) > dist * 0.5) return;
    const side = Math.abs(bulge) > 1 ? Math.sign(bulge) : 1;
    const push = Math.min(1, spare * BEND_START) * side;
    for (let n = 1; n < LINKS; n += 1) {
      const t = n / LINKS;
      const { p } = this.points[n];
      p.x += nx * push * 4 * t * (1 - t);
      p.y += ny * push * 4 * t * (1 - t);
    }
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
    if (!(this.drag?.holding && this.state === "idle")) {
      // Going up it reels in quickly without bouncing; hanging it settles softer.
      const [stiff, damp] = this.state === "on" ? SETTLE : REEL;
      this.lengthV +=
        ((length - this.length) * stiff - this.lengthV * damp) * dt;
      this.length += this.lengthV * dt;
    }
    this.anchor.x += (x - this.anchor.x) * Math.min(1, delta * 8);
    this.anchor.y = top;
    this.stretch *= Math.exp(-delta * STRETCH_EASE);
    this.segment = (Math.max(0.5, this.length) + this.stretch) / LINKS;
    if (this.state === "hiding" && this.length < 4) {
      this.state = "off";
      this.group.visible = false;
      this.angle = 0;
      return;
    }
    const still = reducedMotion.matches ? 0.3 : 1;
    const t = this.time;
    this.gust =
      (wind +
        (0.35 * Math.sin(t * 0.8) +
          0.2 * Math.sin(t * 1.9 + 1.3) +
          0.12 * Math.sin(t * 3.7 + 0.4)) *
          (0.25 + Math.abs(wind)) *
          still) *
      (this.state === "on" ? 1 : TUCKED_SWAY);
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
    rope.forEach((p, n) =>
      this.screenToWorld(p.x, p.y, p.z, this.ropeWorld[n]),
    );
    this.links.forEach((m, n) => {
      this.placeLink(
        m,
        this.curve.getPoint(n / CURVE_LINKS, this.worldA),
        this.curve.getPoint((n + 1) / CURVE_LINKS, this.worldB),
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
