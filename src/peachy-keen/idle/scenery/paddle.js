import {
  AdditiveBlending,
  BoxGeometry,
  BufferGeometry,
  CapsuleGeometry,
  CylinderGeometry,
  CanvasTexture,
  Color,
  ExtrudeGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Object3D,
  Path,
  Plane,
  PlaneGeometry,
  RepeatWrapping,
  Shape,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";
import { twinkleTexture } from "./shapes";
import { ringMaterial, showRing } from "../../rings";
import { reducedMotion } from "../../util";
import { playNotes } from "../../audio";
import { PRINT_KIND } from "../../peach";

const THICK = 0.05;
const BEVEL = 0.014;
const FACE = THICK / 2 + BEVEL;
const SIZE = 0.95;
const POOL = 4;
const REACH = 0.6;
const APPEAR = 0.16;
const COCK = 0.3;
const HIT = 0.37;
const HOLD = 0.42;
const END = 0.8;
const MARK = 1.35;
const SPARKS = 5;
const LETTERS_AT = 0.39;
const GRIP_TOP = -0.11;
const GRIP_BOTTOM = -0.47;
const GRIP_TURNS = 9;
const PONG_X = 0.38;
const PONG_Y = 0.56;
const PONG_H = 0.4;
const PONG_HANDLE = 0.11;
const Z = new Vector3(0, 0, 1);
const UP = new Vector3(0, 1, 0);
const deg = (d) => (d * Math.PI) / 180;
const smooth = (k) => k * k * (3 - 2 * k);
const clamp01 = (k) => Math.min(1, Math.max(0, k));
const backOut = (k) => 1 + 2.7 * (k - 1) ** 3 + 1.7 * (k - 1) ** 2;
const centreOf = (look) => (look.round ? PONG_Y : 0.62);

const LOOKS = [
  { wood: "maple" },
  { wood: "oak" },
  { wood: "oak", holes: true },
  { wood: "oak", holes: true, grip: "leather" },
  { wood: "oak", holes: true, grip: "leather", letters: true },
  { wood: "carbon", holes: true, grip: "black" },
  { wood: "lacquer", round: true },
  { wood: "walnut", holes: true, grip: "leather", fittings: "brass" },
  { wood: "gold", holes: true, grip: "royal", fittings: "gold" },
];

const WOODS = {
  maple: { early: [240, 182, 146], late: [200, 116, 90] },
  oak: { early: [224, 142, 108], late: [154, 72, 54], rays: true },
  lacquer: { early: [242, 186, 150], late: [204, 122, 94] },
  walnut: { early: [154, 74, 62], late: [72, 28, 26] },
};

const cache = new Map();
const once = (key, make) => {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key);
};

function canvasTexture(width, height, draw, color = true) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d"), width, height);
  const t = new CanvasTexture(canvas);
  if (color) t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function drawLetters(ctx, w, h, fill, dx = 0, dy = 0) {
  ctx.font = "bold 56px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = fill;
  ctx.fillText("ΦΚΠ", w / 2 + dx, h * 0.42 + dy);
}

function noise(seed) {
  const hash = (x, y) => {
    const v = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
    return v - Math.floor(v);
  };
  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = smooth(x - xi);
    const fy = smooth(y - yi);
    const top = hash(xi, yi) + (hash(xi + 1, yi) - hash(xi, yi)) * fx;
    const bottom =
      hash(xi, yi + 1) + (hash(xi + 1, yi + 1) - hash(xi, yi + 1)) * fx;
    return top + (bottom - top) * fy;
  };
}

function woodMaps(kind, letters, straight) {
  return once(`wood-${kind}-${!!letters}-${!!straight}`, () => {
    const { early, late, rays } = WOODS[kind];
    const w = 256;
    const h = 728;
    const n = noise(Math.random() * 100);
    const fbm = (x, y) =>
      n(x, y) * 0.55 + n(x * 2.1, y * 2.1) * 0.3 + n(x * 4.3, y * 4.3) * 0.15;
    const color = new ImageData(w, h);
    const height = new ImageData(w, h);
    const pith = 0.35 + Math.random() * 0.3;
    for (let y = 0; y < h; y += 1) {
      const v = 1 - y / h;
      for (let x = 0; x < w; x += 1) {
        const u = x / w;
        const warp = (fbm(u * 2.5, v * 1.2) - 0.5) * 0.15;
        const across = u - pith + warp;
        const phase = straight
          ? (u + warp) * 9 + fbm(u * 4, v * 2) * 0.5
          : (across * across * 5 + v * 0.35) * 4 + fbm(u * 5, v * 1.5) * 0.6;
        const t = phase - Math.floor(phase);
        const band =
          smooth(clamp01((t - 0.7) / 0.16)) *
          (1 - smooth(clamp01((t - 0.9) / 0.1)));
        const streak = fbm(u * 60, v * 2);
        const pore = n(u * 180, v * 22) > 0.86 ? 1 : 0;
        const fleck = rays && n(u * 55, v * 7) > 0.88 ? 1 : 0;
        const dark = clamp01(
          band * 0.4 + (streak - 0.5) * 0.2 + pore * 0.25 + fleck * 0.3,
        );
        const tint = 1 + (fbm(u * 2, v * 1.2) - 0.5) * 0.18;
        const i = (y * w + x) * 4;
        for (let c = 0; c < 3; c += 1)
          color.data[i + c] = (early[c] + (late[c] - early[c]) * dark) * tint;
        color.data[i + 3] = 255;
        const lift = 128 - band * 22 - pore * 30 - fleck * 12;
        height.data[i] = lift;
        height.data[i + 1] = lift;
        height.data[i + 2] = lift;
        height.data[i + 3] = 255;
      }
    }
    const map = canvasTexture(w, h, (ctx) => {
      ctx.putImageData(color, 0, 0);
      if (letters) {
        drawLetters(ctx, w, h, "rgba(60, 20, 8, 0.8)", 2, 3);
        drawLetters(ctx, w, h, "rgba(255, 214, 140, 0.95)");
      }
    });
    const bump = canvasTexture(
      w,
      h,
      (ctx) => {
        ctx.putImageData(height, 0, 0);
        if (letters) drawLetters(ctx, w, h, "#000");
      },
      false,
    );
    return { map, bump };
  });
}

function carbonTexture() {
  const t = canvasTexture(64, 64, (ctx) => {
    const cell = 16;
    for (let y = 0; y < 4; y += 1)
      for (let x = 0; x < 4; x += 1) {
        const across = (x + y) % 4 < 2;
        const g = across
          ? ctx.createLinearGradient(x * cell, 0, x * cell + cell, 0)
          : ctx.createLinearGradient(0, y * cell, 0, y * cell + cell);
        g.addColorStop(0, "#151518");
        g.addColorStop(0.5, "#4a4a55");
        g.addColorStop(1, "#151518");
        ctx.fillStyle = g;
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
  });
  t.wrapS = RepeatWrapping;
  t.wrapT = RepeatWrapping;
  t.repeat.set(7, 19);
  return t;
}

function leatherTexture(dark, light) {
  const t = canvasTexture(128, 128, (ctx, w, h) => {
    const image = ctx.createImageData(w, h);
    for (let y = 0; y < h; y += 1)
      for (let x = 0; x < w; x += 1) {
        const phase = (1 - y / h + x / w) % 1;
        const strip = Math.sin(Math.PI * phase) ** 0.7;
        const grain = 0.92 + Math.random() * 0.16;
        const i = (y * w + x) * 4;
        for (let c = 0; c < 3; c += 1)
          image.data[i + c] = (dark[c] + (light[c] - dark[c]) * strip) * grain;
        image.data[i + 3] = 255;
      }
    ctx.putImageData(image, 0, 0);
  });
  t.wrapS = RepeatWrapping;
  t.wrapT = RepeatWrapping;
  t.repeat.set(1, GRIP_TURNS);
  return t;
}

function rubberBump() {
  const t = canvasTexture(
    64,
    64,
    (ctx, w) => {
      ctx.fillStyle = "#555";
      ctx.fillRect(0, 0, w, w);
      ctx.fillStyle = "#fff";
      [8, 24, 40, 56].forEach((x, i) =>
        [8, 24, 40, 56].forEach((y) => {
          ctx.beginPath();
          ctx.arc(x + (i % 2) * 8, y, 4, 0, Math.PI * 2);
          ctx.fill();
        }),
      );
    },
    false,
  );
  t.wrapS = RepeatWrapping;
  t.wrapT = RepeatWrapping;
  t.repeat.set(10, 10);
  return t;
}

function classicShape() {
  const s = new Shape();
  s.moveTo(0, -0.7);
  s.bezierCurveTo(-0.06, -0.7, -0.088, -0.69, -0.088, -0.64);
  s.bezierCurveTo(-0.088, -0.58, -0.062, -0.55, -0.06, -0.48);
  s.lineTo(-0.057, -0.12);
  s.bezierCurveTo(-0.056, 0.06, -0.3, 0.1, -0.31, 0.3);
  s.lineTo(-0.315, 0.9);
  s.bezierCurveTo(-0.315, 1.12, -0.2, 1.16, 0, 1.16);
  s.bezierCurveTo(0.2, 1.16, 0.315, 1.12, 0.315, 0.9);
  s.lineTo(0.31, 0.3);
  s.bezierCurveTo(0.3, 0.1, 0.056, 0.06, 0.057, -0.12);
  s.lineTo(0.06, -0.48);
  s.bezierCurveTo(0.062, -0.55, 0.088, -0.58, 0.088, -0.64);
  s.bezierCurveTo(0.088, -0.69, 0.06, -0.7, 0, -0.7);
  return s;
}

const onPong = (a, inset = 0) => {
  const c = Math.cos(a);
  const sn = Math.sin(a);
  const square = (k) => Math.sign(k) * Math.abs(k) ** 0.86;
  const narrow = sn < 0 ? 1 - 0.14 * sn * sn : 1;
  return [
    (PONG_X - inset) * square(c) * narrow,
    PONG_Y + (PONG_H - inset) * square(sn),
  ];
};

function traceRim(shape, from, to, inset = 0) {
  for (let k = 1; k <= 64; k += 1)
    shape.lineTo(...onPong(from + ((to - from) * k) / 64, inset));
}

function roundShape() {
  const a = deg(246);
  const [x, y] = onPong(a);
  const s = new Shape();
  s.moveTo(-0.05, -0.1);
  s.lineTo(-0.05, 0.08);
  s.bezierCurveTo(-0.05, 0.13, x + 0.05, y - 0.03, x, y);
  traceRim(s, a, deg(-66));
  s.bezierCurveTo(-x - 0.05, y - 0.03, 0.05, 0.13, 0.05, 0.08);
  s.lineTo(0.05, -0.1);
  s.closePath();
  return s;
}

function holes(shape) {
  [
    [-0.13, 0.6],
    [0.13, 0.6],
    [0, 0.71],
    [-0.13, 0.82],
    [0.13, 0.82],
    [0, 0.95],
  ].forEach(([x, y]) => {
    const p = new Path();
    p.absarc(x, y, 0.045, 0, Math.PI * 2, false);
    shape.holes.push(p);
  });
  return shape;
}

function readBothSides(geometry) {
  const caps = geometry.groups[0];
  const p = geometry.attributes.position;
  const { uv } = geometry.attributes;
  for (let n = caps.start; n < caps.start + caps.count; n += 1)
    if (p.getZ(n) < 0) uv.setX(n, 1 - uv.getX(n));
  return geometry;
}

function fitUV(geometry) {
  geometry.computeBoundingBox();
  const { min, max } = geometry.boundingBox;
  const p = geometry.attributes.position;
  const { uv } = geometry.attributes;
  for (let n = 0; n < p.count; n += 1)
    uv.setXY(
      n,
      (p.getX(n) - min.x) / (max.x - min.x),
      (p.getY(n) - min.y) / (max.y - min.y),
    );
  return geometry;
}

function bladeGeometry(round, drilled) {
  return once(`blade-${round}-${drilled}`, () => {
    const shape = round ? roundShape() : classicShape();
    const g = new ExtrudeGeometry(drilled ? holes(shape) : shape, {
      depth: THICK,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelSegments: 3,
      curveSegments: 28,
    });
    g.translate(0, 0, -THICK / 2);
    return readBothSides(fitUV(g));
  });
}

function rubberGeometry() {
  return once("rubber", () => {
    const inset = 0.006;
    const a = deg(232);
    const [x, y] = onPong(a, inset);
    const s = new Shape();
    s.moveTo(x, y);
    traceRim(s, a, deg(-52), inset);
    s.quadraticCurveTo(0, y - 0.07, x, y);
    const g = new ExtrudeGeometry(s, {
      depth: 0.012,
      bevelEnabled: true,
      bevelThickness: 0.004,
      bevelSize: 0.004,
      bevelSegments: 2,
      curveSegments: 48,
    });
    return fitUV(g);
  });
}

function handleGeometry() {
  return once("handle", () => {
    const s = new Shape();
    s.moveTo(-0.05, 0.1);
    s.lineTo(-0.05, -0.05);
    s.bezierCurveTo(-0.05, -0.2, -0.07, -0.25, -0.07, -0.31);
    s.quadraticCurveTo(-0.07, -0.355, 0, -0.36);
    s.quadraticCurveTo(0.07, -0.355, 0.07, -0.31);
    s.bezierCurveTo(0.07, -0.25, 0.05, -0.2, 0.05, -0.05);
    s.lineTo(0.05, 0.1);
    s.closePath();
    const depth = PONG_HANDLE - 0.04;
    const g = new ExtrudeGeometry(s, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.015,
      bevelSegments: 5,
      curveSegments: 20,
    });
    g.translate(0, 0, -depth / 2);
    return fitUV(g);
  });
}

function badgeGeometry() {
  return once("badge", () =>
    new CylinderGeometry(0.036, 0.036, 0.008, 28).rotateX(Math.PI / 2),
  );
}

const handleHalf = (y) => 0.057 + clamp01((-0.12 - y) / 0.36) * 0.003;

function sleeveGeometry(y0, y1, grow, ridge = 0) {
  const around = 40;
  const along = ridge ? 96 : 2;
  const position = [];
  const uv = [];
  const index = [];
  const squircle = (k) => Math.sign(k) * Math.abs(k) ** 0.55;
  for (let j = 0; j <= along; j += 1) {
    const v = j / along;
    const y = y0 + (y1 - y0) * v;
    for (let i = 0; i <= around; i += 1) {
      const u = i / around;
      const a = u * Math.PI * 2;
      const bump =
        ridge * Math.sin(Math.PI * ((v * GRIP_TURNS + u) % 1)) ** 0.5;
      position.push(
        (handleHalf(y) + BEVEL + grow + bump) * squircle(Math.cos(a)),
        y,
        (THICK / 2 + BEVEL + grow + bump) * squircle(Math.sin(a)),
      );
      uv.push(u, v);
      if (i < around && j < along) {
        const k = j * (around + 1) + i;
        index.push(
          k,
          k + around + 1,
          k + 1,
          k + 1,
          k + around + 1,
          k + around + 2,
        );
      }
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(position, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

function capGeometry() {
  return once("cap", () => {
    const s = new Shape();
    s.moveTo(-0.096, -0.6);
    s.lineTo(-0.096, -0.645);
    s.bezierCurveTo(-0.096, -0.7, -0.065, -0.712, 0, -0.712);
    s.bezierCurveTo(0.065, -0.712, 0.096, -0.7, 0.096, -0.645);
    s.lineTo(0.096, -0.6);
    s.closePath();
    const depth = THICK + 2 * BEVEL - 0.012;
    const g = new ExtrudeGeometry(s, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.008,
      bevelSize: 0.006,
      bevelSegments: 3,
      curveSegments: 16,
    });
    return g.translate(0, 0, -depth / 2);
  });
}

function guardGeometry() {
  return once("guard", () =>
    mergeGeometries([
      new CapsuleGeometry(0.05, 0.3, 8, 20)
        .rotateZ(Math.PI / 2)
        .scale(1, 0.62, 1),
      ...[1, -1].map((side) =>
        new SphereGeometry(0.048, 20, 14).translate(side * 0.21, 0, 0),
      ),
    ]).translate(0, -0.12, 0),
  );
}

function bladeMaterial(look) {
  const key = `blade-${look.wood}-${!!look.letters}-${!!look.straight}`;
  return once(key, () => {
    if (look.wood === "gold")
      return new MeshPhysicalMaterial({
        color: 0xffc94a,
        metalness: 1,
        roughness: 0.2,
        clearcoat: 0.6,
        envMapIntensity: 1.6,
        emissive: new Color(0x6b3a1c),
        emissiveIntensity: 0.7,
      });
    if (look.wood === "carbon")
      return new MeshPhysicalMaterial({
        map: carbonTexture(),
        roughness: 0.45,
        metalness: 0.3,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
      });
    const { map, bump } = woodMaps(look.wood, look.letters, look.straight);
    return new MeshPhysicalMaterial({
      map,
      bumpMap: bump,
      bumpScale: 1.5,
      roughness: 0.48,
      clearcoat: look.wood === "walnut" ? 0.8 : 0.55,
      clearcoatRoughness: 0.28,
      sheen: 0.25,
      sheenColor: new Color(0xffd0b0),
    });
  });
}

function gripMaterial(kind) {
  return once(`grip-${kind}`, () => {
    const [dark, light, sheen] = {
      leather: [[48, 12, 12], [122, 40, 34], 0xffb0a0],
      black: [[12, 12, 14], [64, 64, 72], 0x9090a0],
      royal: [[34, 10, 48], [116, 52, 150], 0xe0a0ff],
    }[kind];
    return new MeshPhysicalMaterial({
      map: leatherTexture(dark, light),
      roughness: 0.55,
      sheen: 0.8,
      sheenColor: new Color(sheen),
    });
  });
}

const fittingMaterials = {
  brass: () =>
    new MeshPhysicalMaterial({
      color: 0xd9a441,
      metalness: 1,
      roughness: 0.28,
      clearcoat: 0.4,
    }),
  gold: () => bladeMaterial({ wood: "gold" }),
  badge: () =>
    new MeshPhysicalMaterial({
      color: 0xc81e3a,
      roughness: 0.25,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    }),
  gem: () =>
    new MeshPhysicalMaterial({
      color: 0xff6fa8,
      emissive: new Color(0xff3d8a),
      emissiveIntensity: 1.2,
      roughness: 0.05,
      clearcoat: 1,
      flatShading: true,
    }),
};

const rubberMaterial = (color) =>
  once(`rubber-${color}`, () => {
    const bump = rubberBump();
    return new MeshPhysicalMaterial({
      color,
      roughness: 0.6,
      bumpMap: bump,
      bumpScale: 0.6,
      sheen: 0.25,
      sheenColor: new Color(0xffd0d0),
    });
  });

export function paddleLevel(upgrades) {
  let level = 0;
  for (let n = 0; n < LOOKS.length - 1; n += 1)
    if (upgrades.includes(`paddle-${n}`)) level = n + 1;
  return level;
}

export function paddleModel() {
  const model = new Group();
  const blade = new Mesh();
  const handle = new Mesh();
  const grip = new Mesh(
    once("grip", () => sleeveGeometry(GRIP_BOTTOM, GRIP_TOP, 0.004, 0.006)),
  );
  const collars = [GRIP_TOP, GRIP_BOTTOM].map(
    (y) =>
      new Mesh(
        once(`collar-${y}`, () => sleeveGeometry(y - 0.012, y + 0.012, 0.011)),
      ),
  );
  const cap = new Mesh(capGeometry());
  const guard = new Mesh(guardGeometry());
  const gems = [1, -1].map((side) => {
    const gem = new Mesh(
      once("gem", () => new IcosahedronGeometry(0.045, 0).scale(1, 1.25, 0.6)),
    );
    gem.position.set(0, -0.12, side * 0.058);
    return gem;
  });
  const badges = [1, -1].map((side) => {
    const badge = new Mesh(badgeGeometry());
    badge.position.set(0, -0.02, side * (PONG_HANDLE / 2 + 0.002));
    return badge;
  });
  const front = new Mesh(rubberGeometry(), rubberMaterial(0xb8102a));
  const back = new Mesh(rubberGeometry(), rubberMaterial(0x1a1a1e));
  front.position.z = FACE - 0.004;
  back.position.z = -FACE + 0.004;
  back.rotation.y = Math.PI;
  model.add(
    blade,
    handle,
    grip,
    ...collars,
    cap,
    guard,
    ...gems,
    ...badges,
    front,
    back,
  );
  model.traverse((o) => {
    // eslint-disable-next-line no-param-reassign
    o.castShadow = o.isMesh;
  });
  model.userData.dress = (level) => {
    const look = LOOKS[level];
    blade.geometry = bladeGeometry(!!look.round, !!look.holes);
    blade.material = bladeMaterial(look);
    handle.visible = !!look.round;
    if (look.round) {
      handle.geometry = handleGeometry();
      handle.material = bladeMaterial({ wood: look.wood, straight: true });
    }
    grip.visible = !!look.grip;
    if (look.grip) grip.material = gripMaterial(look.grip);
    const metal =
      look.fittings &&
      once(`fit-${look.fittings}`, fittingMaterials[look.fittings]);
    collars.forEach((c, n) => {
      /* eslint-disable no-param-reassign */
      c.visible = !!look.grip;
      c.material = n === 0 && metal ? metal : grip.material;
      /* eslint-enable no-param-reassign */
    });
    cap.visible = !!metal;
    guard.visible = look.fittings === "gold";
    if (metal) {
      cap.material = metal;
      guard.material = metal;
    }
    gems.forEach((gem) => {
      /* eslint-disable no-param-reassign */
      gem.visible = guard.visible;
      gem.material = once("fit-gem", fittingMaterials.gem);
      /* eslint-enable no-param-reassign */
    });
    badges.forEach((badge) => {
      /* eslint-disable no-param-reassign */
      badge.visible = !!look.round;
      badge.material = once("fit-badge", fittingMaterials.badge);
      /* eslint-enable no-param-reassign */
    });
    front.visible = !!look.round;
    back.visible = !!look.round;
  };
  model.userData.dress(0);
  return model;
}

function markShape(look) {
  const size = 256;
  const k = size / MARK;
  const c = centreOf(look);
  const stamp = document.createElement("canvas");
  stamp.width = size;
  stamp.height = size;
  const ctx = stamp.getContext("2d");
  const trace = (points) => {
    points.forEach((p, n) => {
      const x = size / 2 + p.x * k;
      const y = size / 2 - (p.y - c) * k;
      if (n === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
  };
  const shape = look.round ? roundShape() : classicShape();
  if (look.holes) holes(shape);
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  trace(shape.getPoints(24));
  shape.holes.forEach((h) => trace(h.getPoints(16)));
  ctx.fill("evenodd");
  ctx.globalCompositeOperation = "destination-out";
  if (look.letters) {
    ctx.font = `bold ${Math.round(0.15 * k)}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ΦΚΠ", size / 2, size / 2 - (LETTERS_AT - c) * k);
  }
  if (look.round)
    for (let y = 8; y < size; y += 11)
      for (let x = 8 + ((y / 11) % 2) * 5; x < size; x += 11) {
        ctx.beginPath();
        ctx.arc(x, y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
  const draw = (target, x) => target.drawImage(stamp, x, 0);
  return { blur: draw, sharp: draw };
}

const markFor = (level) => once(`mark-${level}`, () => markShape(LOOKS[level]));

function pose(t) {
  if (t < COCK) {
    const k = smooth(t / COCK);
    return {
      up: 0.95 + k * 0.45,
      toward: 0.45 + k * 0.35,
      wrist: k * 0.55,
      grow: backOut(clamp01(t / APPEAR)),
      stretch: 1,
    };
  }
  if (t < HIT) {
    const k = (t - COCK) / (HIT - COCK);
    const arm = k ** 2.2;
    return {
      up: 1.4 * (1 - arm),
      toward: 0.8 * (1 - arm),
      wrist: 0.55 * (1 - k ** 4),
      grow: 1,
      stretch: 1 + 0.08 * Math.sin(Math.PI * k),
    };
  }
  if (t < HOLD)
    return { up: 0, toward: -0.035, wrist: -0.06, grow: 1, stretch: 0.94 };
  const k = clamp01((t - HOLD) / (END - HOLD));
  const out = 1 - (1 - k) ** 3;
  const gone = clamp01((t - END + 0.16) / 0.16);
  return {
    up: 0.55 * out,
    toward: -0.035 + 0.5 * out,
    wrist: -0.06 + 0.3 * out,
    grow: 1 - gone * gone,
    stretch: 1,
  };
}

function place(slot, at) {
  const { arm, model } = slot;
  arm.quaternion.setFromRotationMatrix(slot.basis);
  arm.position
    .copy(slot.p)
    .addScaledVector(slot.n, FACE * SIZE)
    .addScaledVector(slot.along, -(REACH + centreOf(slot.look) * SIZE));
  arm.rotateZ(slot.sweep * at.up);
  arm.rotateX(at.toward);
  model.position.y = REACH;
  model.rotation.set(at.wrist, 0, 0);
  const g = SIZE * Math.max(0.001, at.grow);
  model.scale.set(g / Math.sqrt(at.stretch), g * at.stretch, g);
}

function effects(slot, t, delta) {
  const since = t - HIT;
  if (since < 0) return;
  const { flash, ripple, sparks } = slot;
  flash.scale.setScalar(0.3 + clamp01(since / 0.05) * 0.6);
  flash.material.opacity = (1 - clamp01((since - 0.02) / 0.12)) * 0.6;
  showRing(ripple, clamp01(since / 0.32), 0.4, 1.9, 0.5);
  const k = clamp01(since / 0.28);
  sparks.forEach((s) => {
    s.userData.v.multiplyScalar(Math.exp(-delta * 7));
    s.position.addScaledVector(s.userData.v, delta);
    s.scale.setScalar(0.12 * (1 - k * 0.6));
    // eslint-disable-next-line no-param-reassign
    s.material.opacity = (1 - k) * 0.7;
  });
}

function additive(map, color) {
  return new SpriteMaterial({
    map,
    color,
    blending: AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0,
  });
}

function endMorph(slot) {
  if (!slot.morph) return;
  slot.morph.forEach(([mesh, original]) => {
    mesh.material.dispose();
    // eslint-disable-next-line no-param-reassign
    mesh.material = original;
  });
  /* eslint-disable no-param-reassign */
  slot.morph = null;
  slot.ghost.visible = false;
  slot.seam.visible = false;
  /* eslint-enable no-param-reassign */
}

export class Paddles {
  constructor(game, interaction, toucher, parent) {
    Object.assign(this, { game, i: interaction, toucher });
    this.along = new Vector3();
    this.side = new Vector3();
    this.tmp = new Vector3();
    this.down = new Vector3(0, -1, 0);
    this.markN = new Vector3();
    this.markUp = new Vector3();
    this.markSide = new Vector3();
    this.edgeNormal = new Vector3();
    this.shownLevel = paddleLevel(game.state.upgrades);
    const seamMaterial = new MeshBasicMaterial({
      color: 0xffd9a0,
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const twinkle = twinkleTexture();
    this.slots = Array.from({ length: POOL }, () => {
      const arm = new Object3D();
      const model = paddleModel();
      arm.add(model);
      const ghost = paddleModel();
      ghost.visible = false;
      const seam = new Mesh(
        new BoxGeometry(0.76, 0.03, FACE * 2 + 0.012),
        seamMaterial,
      );
      seam.visible = false;
      model.add(ghost, seam);
      const flash = new Sprite(additive(twinkle, 0xffc8d0));
      const ripple = new Mesh(
        new PlaneGeometry(1, 1),
        ringMaterial(0xffb8c8, { onTop: true }),
      );
      const sparks = Array.from({ length: SPARKS }, () => {
        const s = new Sprite(additive(twinkle, 0xffe0d0));
        s.userData.v = new Vector3();
        return s;
      });
      ripple.renderOrder = 3;
      const fx = [flash, ripple, ...sparks];
      [arm, ...fx].forEach((o) => {
        // eslint-disable-next-line no-param-reassign
        o.visible = false;
        parent.add(o);
      });
      return {
        arm,
        model,
        ghost,
        seam,
        clipNew: new Plane(),
        clipOld: new Plane(),
        morph: null,
        flash,
        ripple,
        sparks,
        fx,
        busy: false,
        look: LOOKS[0],
        local: new Vector3(),
        normal: new Vector3(),
        p: new Vector3(),
        n: new Vector3(),
        along: new Vector3(),
        basis: new Matrix4(),
      };
    });
  }

  dress(slot, level) {
    // eslint-disable-next-line no-param-reassign
    slot.look = LOOKS[level];
    slot.model.userData.dress(level);
    this.i.peach.setPaddlePrint(`paddle-${level}`, markFor(level));
  }

  target() {
    const { group, peach, raycaster } = this.i;
    const crease = peach.creaseNormal(this.tmp);
    const across =
      (Math.random() < 0.5 ? -1 : 1) * (0.45 + Math.random() * 0.7);
    raycaster.set(
      this.side.set(
        group.position.x + crease.x * across,
        group.position.y - 0.75 + Math.random() * 1.2,
        20,
      ),
      this.along.set(0, 0, -1),
    );
    return raycaster.intersectObject(peach.mesh, false)[0] || null;
  }

  swing(id) {
    const hit = this.target();
    const slot = this.slots.find((s) => !s.busy);
    if (!hit || !slot || reducedMotion.matches) {
      const any = hit || this.toucher.randomHit();
      this.toucher.touch(id, any);
      if (any) {
        const level = paddleLevel(this.game.state.upgrades);
        this.i.peach.setPaddlePrint(`paddle-${level}`, markFor(level));
        this.mark(any, this.down, any.point);
      }
      return;
    }
    Object.assign(slot, {
      id,
      hit,
      busy: true,
      age: 0,
      fired: false,
      sweep: Math.random() < 0.5 ? -1 : 1,
      lean: -0.7 + Math.random() * 1.1,
    });
    slot.local.copy(hit.point);
    this.i.peach.mesh.worldToLocal(slot.local);
    slot.normal.copy(hit.face.normal);
    const level = paddleLevel(this.game.state.upgrades);
    const from = level > this.shownLevel ? this.shownLevel : null;
    this.shownLevel = level;
    this.dress(slot, level);
    if (from !== null) this.startMorph(slot, from);
    slot.arm.visible = true;
  }

  startMorph(slot, from) {
    const { model, ghost, seam } = slot;
    ghost.userData.dress(from);
    ghost.visible = true;
    seam.visible = true;
    const clip = (meshes, plane) =>
      meshes.map((mesh) => {
        const original = mesh.material;
        // eslint-disable-next-line no-param-reassign
        mesh.material = original.clone();
        // eslint-disable-next-line no-param-reassign
        mesh.material.clippingPlanes = [plane];
        return [mesh, original];
      });
    // eslint-disable-next-line no-param-reassign
    slot.morph = [
      ...clip(
        model.children.filter((c) => c.isMesh && c !== seam),
        slot.clipNew,
      ),
      ...clip(
        ghost.children.filter((c) => c.isMesh),
        slot.clipOld,
      ),
    ];
    if (this.game.state.options.castSound)
      playNotes([784, 1047, 1319], { gap: 0.06, volume: 0.05 });
  }

  updateMorph(slot, t) {
    if (!slot.morph) return;
    const k = Math.min(1, t / COCK);
    if (k >= 1) {
      endMorph(slot);
      return;
    }
    const edge = 1.25 - 2.05 * k * k * (3 - 2 * k);
    slot.seam.position.y = edge; // eslint-disable-line no-param-reassign
    slot.arm.updateMatrixWorld(true);
    const normal = this.edgeNormal
      .setFromMatrixColumn(slot.model.matrixWorld, 1)
      .normalize();
    const point = slot.model.localToWorld(this.tmp.set(0, edge, 0));
    slot.clipNew.setFromNormalAndCoplanarPoint(normal, point);
    slot.clipOld.setFromNormalAndCoplanarPoint(normal.negate(), point);
  }

  mark(hit, along, point) {
    const { i } = this;
    if (!i.settings.handprints) return;
    const n = this.markN
      .copy(hit.face.normal)
      .transformDirection(i.peach.mesh.matrixWorld);
    const up = this.markUp.copy(UP).addScaledVector(n, -n.y).normalize();
    const across = this.markSide.crossVectors(n, up);
    const tilt = Math.atan2(along.dot(across), along.dot(up));
    i.peach.addHandprint(
      point,
      hit.face.normal,
      tilt,
      true,
      0.85,
      1,
      MARK * SIZE,
      PRINT_KIND.paddle,
    );
  }

  frame(slot) {
    const { p, n } = slot;
    const out = this.side.copy(p).sub(this.i.group.position).setZ(0);
    out.normalize().y += slot.lean;
    this.along.copy(out).addScaledVector(n, -out.dot(n)).negate().normalize();
    slot.along.copy(this.along);
    this.side.crossVectors(this.along, n).normalize();
    slot.basis.makeBasis(this.side, this.along, n);
  }

  impact(slot) {
    const { i } = this;
    const { p, n } = slot;
    slot.hit.point.copy(p);
    this.toucher.dir.copy(n).negate();
    this.toucher.touch(slot.id, slot.hit, true);
    this.mark(slot.hit, slot.along, p);
    i.hitStop = Math.max(i.hitStop, 0.035);
    i.trauma = Math.max(i.trauma, 0.14);
    i.squashVelocity.x += 0.45;
    i.squashAxis.set(0.5, 0.5);
    slot.flash.position.copy(p).addScaledVector(n, 0.2);
    slot.ripple.position.copy(p).addScaledVector(n, 0.04);
    slot.ripple.quaternion.setFromUnitVectors(Z, n);
    this.side.crossVectors(n, slot.along).normalize();
    slot.sparks.forEach((s, k) => {
      const a = ((k + Math.random() * 0.5) / SPARKS) * Math.PI * 2;
      s.userData.v
        .copy(slot.along)
        .multiplyScalar(Math.cos(a))
        .addScaledVector(this.side, Math.sin(a))
        .multiplyScalar(2 + Math.random())
        .addScaledVector(n, 0.8);
      s.position.copy(p).addScaledVector(n, 0.1);
    });
    slot.fx.forEach((o) => {
      // eslint-disable-next-line no-param-reassign
      o.visible = true;
    });
  }

  update(delta) {
    const { matrixWorld } = this.i.peach.mesh;
    this.slots.forEach((slot) => {
      if (!slot.busy) return;
      /* eslint-disable no-param-reassign */
      slot.age += delta;
      const t = slot.age;
      if (!slot.fired) {
        slot.p.copy(slot.local).applyMatrix4(matrixWorld);
        slot.n.copy(slot.normal).transformDirection(matrixWorld);
        this.frame(slot);
      }
      if (t >= HIT && !slot.fired) {
        slot.fired = true;
        this.impact(slot);
      }
      place(slot, pose(t));
      this.updateMorph(slot, t);
      effects(slot, t, delta);
      if (t >= END) {
        endMorph(slot);
        slot.busy = false;
        [slot.arm, ...slot.fx].forEach((o) => {
          o.visible = false;
        });
      }
      /* eslint-enable no-param-reassign */
    });
  }
}
