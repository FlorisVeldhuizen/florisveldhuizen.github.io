import {
  CanvasTexture,
  Color,
  DoubleSide,
  Group,
  LatheGeometry,
  Mesh,
  MeshPhysicalMaterial,
  Object3D,
  PlaneGeometry,
  SphereGeometry,
  SRGBColorSpace,
  Vector2,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils";

const span = (from, shape) => (t) =>
  t < from ? 0 : shape((t - from) / (1 - from));
const lance = span(0.06, (u) => Math.sin(Math.PI * u ** 0.85) ** 0.6);
const SWAN_FROM = 0.2;
const round = span(SWAN_FROM, (u) =>
  Math.sqrt(Math.max(0, 1 - ((u - 0.5) / 0.5) ** 2)),
);

export const FEATHER_LOOKS = [
  { root: 0xe8507a, tip: 0xffe8ef, size: [1, 1] },
  { root: 0xf2b9b4, tip: 0xfff3ea, size: [1.25, 1.9], plume: true },
  {
    root: 0xff3d8a,
    tip: 0xffa6cc,
    size: [1.15, 1.35],
    fluff: lance,
    curl: 70,
    quill: 0.9,
  },
  { size: [1.6, 1.25], peacock: true, spine: "#d8e6a8" },
  {
    root: 0xffffff,
    tip: 0xf4f0ff,
    size: [0.55, 1.1],
    fluff: round,
    curl: 50,
    quill: 0.85,
  },
  { root: 0xfff1d6, tip: 0xffffff, size: [1.2, 1.45], spine: "#ffd98a" },
  { root: 0xd8261c, tip: 0xffd24a, size: [1.3, 1.2], spine: "#ffe08a" },
  {
    root: 0xe0a238,
    tip: 0xfff2b8,
    size: [1.1, 1.1],
    spine: "#fff3c4",
    glints: true,
  },
];

const FEATHER_W = 256;
const FEATHER_H = 1024;
let featherMap = null;

const PEACOCK = {
  vane: [
    [66, 120, 60],
    [176, 164, 72],
  ],
  wisp: [
    [63, 143, 74],
    [154, 122, 52],
  ],
  rings: [
    [0, [18, 20, 84]],
    [0.2, [30, 34, 124]],
    [0.27, [28, 112, 200]],
    [0.38, [36, 176, 192]],
    [0.46, [28, 136, 150]],
    [0.5, [150, 98, 44]],
    [0.6, [184, 132, 62]],
    [0.66, [70, 52, 34]],
    [0.7, [104, 168, 88]],
    [0.84, [196, 178, 80]],
    [0.95, [136, 154, 70]],
  ],
  eye: [92, 128],
};

const ease = (k) => k * k * (3 - 2 * k);
const mix = (a, b, k) => a.map((v, i) => v + (b[i] - v) * k);

function ringColor(rings, d) {
  if (d <= rings[0][0]) return rings[0][1];
  for (let n = 1; n < rings.length; n += 1) {
    const [at, c] = rings[n];
    const [from, p] = rings[n - 1];
    if (d <= at) return mix(p, c, ease((d - from) / (at - from)));
  }
  return rings[rings.length - 1][1];
}

function peacockPattern(ctx, ox, spine, cfg, eyeAt) {
  const w = FEATHER_W;
  const h = FEATHER_H;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const paint = canvas.getContext("2d");
  const image = paint.createImageData(w, h);
  const n = (x, y) => {
    const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };
  const smoothNoise = (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = ease(x - xi);
    const fy = ease(y - yi);
    const top = n(xi, yi) + (n(xi + 1, yi) - n(xi, yi)) * fx;
    const bottom = n(xi, yi + 1) + (n(xi + 1, yi + 1) - n(xi, yi + 1)) * fx;
    return top + (bottom - top) * fy;
  };
  const [rx, ry] = cfg.eye;
  for (let y = 0; y < h; y += 1) {
    const sx = spine(1 - (y - 50) / (h - 70)).x - ox;
    for (let x = 0; x < w; x += 1) {
      const off = Math.abs(x - sx);
      let c = mix(cfg.vane[0], cfg.vane[1], Math.min(1, off / 105));
      const shimmer = smoothNoise(x * 0.04, y * 0.015);
      const dx = x - (eyeAt.x - ox);
      const dy = y - eyeAt.y;
      const lower = dy > 0 ? 1 - 0.42 * Math.min(1, dy / ry) : 1;
      const outer = Math.hypot(dx / (rx * lower), dy / ry);
      const raw = Math.hypot(
        dx / (rx * lower),
        dy / ry - 0.34 * Math.max(0, 1 - outer),
      );
      const notch =
        0.3 *
        Math.exp(-(((Math.atan2(dy, dx) - Math.PI / 2) / 0.45) ** 2)) *
        Math.max(0, 1 - raw / 0.45);
      const d = raw / (1 - notch);
      const wobble = (smoothNoise(x * 0.08, y * 0.08) - 0.5) * 0.04;
      if (d < 1.12) {
        let ring = ringColor(cfg.rings, d + wobble);
        const gleam = Math.exp(
          -(
            ((dx + rx * 0.09) / (rx * 0.08)) ** 2 +
            ((dy + ry * 0.1) / (ry * 0.07)) ** 2
          ),
        );
        ring = mix(ring, [150, 196, 255], gleam * 0.55);
        c = mix(ring, c, ease(Math.max(0, (d - 0.96) / 0.16)));
      }
      const along = y + off * 0.55;
      const streak = 0.9 + 0.1 * Math.sin(along * 1.4 + shimmer * 3);
      const glow = 1 + 0.08 * shimmer;
      const i = (y * w + x) * 4;
      image.data[i] = c[0] * streak * glow;
      image.data[i + 1] = c[1] * streak * glow;
      image.data[i + 2] = c[2] * streak * glow;
      image.data[i + 3] = 255;
    }
  }
  paint.putImageData(image, 0, 0);
  const pattern = ctx.createPattern(canvas, "no-repeat");
  pattern.setTransform(new DOMMatrix().translate(ox, 0));
  return pattern;
}

const peacockHead = (t) =>
  t < 0.56 ? 0 : 118 * Math.sqrt(Math.max(0, 1 - ((t - 0.78) / 0.22) ** 2));

function drawPeacock(ctx, ox, spine, barb) {
  const cfg = PEACOCK;
  ctx.lineWidth = 2.4;
  for (let n = 0; n < 200; n += 1) {
    const k = n / 200;
    const t = 0.06 + k * 0.56;
    const p = spine(t);
    const envelope = (50 + 60 * k ** 0.7) * (0.6 + t * 0.6);
    [-1, 1].forEach((side) => {
      if (Math.random() < 0.3) return;
      const r = Math.random();
      const reach = envelope * (0.5 + r);
      const lift = 0.1 + k * 0.12 + (r - 0.5) * 0.3;
      const bend = (Math.random() - 0.5) * 50;
      const g = ctx.createLinearGradient(
        p.x,
        p.y,
        p.x + side * reach,
        p.y - reach * lift,
      );
      g.addColorStop(0, `rgb(${cfg.wisp[0].join(", ")})`);
      g.addColorStop(1, `rgba(${cfg.wisp[1].join(", ")}, 0.85)`);
      ctx.strokeStyle = g;
      barb(p, side, reach, lift, bend);
    });
  }
  ctx.strokeStyle = peacockPattern(ctx, ox, spine, cfg, spine(0.74));
  ctx.lineWidth = 1.5;
  for (let n = 0; n < 560; n += 1) {
    const t = 0.06 + (n / 560) * 0.94;
    const width = peacockHead(t);
    [-1, 1].forEach((side) => {
      if (width <= 0 || Math.random() < 0.1) return;
      const reach = width * (0.85 + Math.random() * 0.25) + 4;
      barb(spine(t), side, reach, 0.5 + Math.random() * 0.15, -reach * 0.1);
    });
  }
}

function drawFeather(ctx, ox, look) {
  const w = FEATHER_W;
  const h = FEATHER_H;
  const spine = (t) => ({
    x: ox + w / 2 - 22 + t * t * 44,
    y: h - 20 - t * (h - 70),
  });
  const root = new Color(look.root);
  const tip = new Color(look.tip);
  const color = (t, alpha) => {
    const c = root.clone().lerp(tip, t ** 0.7);
    return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${alpha})`;
  };
  const barb = (p, side, reach, lift, bend) => {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.quadraticCurveTo(
      p.x + side * reach * 0.55,
      p.y - reach * lift * 0.2 + bend,
      p.x + side * reach,
      p.y - reach * lift,
    );
    ctx.stroke();
  };
  ctx.lineCap = "round";
  if (look.fluff) {
    const start = look.fluff === round ? SWAN_FROM : 0.06;
    for (let n = 0; n < 1300; n += 1) {
      const t = start + Math.random() * (1 - start);
      const p = spine(t);
      const stray = Math.random() < 0.15;
      const width = look.fluff(t) * 105 * (stray ? 1.35 : 1);
      ctx.strokeStyle = color(t, stray ? 0.4 : 0.62);
      ctx.lineWidth = stray ? 1 : 1.5;
      [-1, 1].forEach((side) =>
        barb(
          p,
          side,
          width * (0.45 + Math.random() * 0.6),
          0.2 + Math.random() * 0.5,
          (Math.random() - 0.5) * look.curl,
        ),
      );
    }
  } else if (look.peacock) {
    drawPeacock(ctx, ox, spine, barb);
  } else {
    const downTo = look.plume ? 0.1 : 0.16;
    for (let n = 0; n < 420; n += 1) {
      const t = n / 420;
      const p = spine(t);
      const down = t < downTo;
      const vane = Math.max(0, (t - 0.1) / 0.9);
      const rise = Math.sin((Math.PI / 2) * Math.min(1, vane / 0.35)) ** 0.7;
      const cap =
        vane > 0.6 ? Math.sqrt(Math.max(0, 1 - ((vane - 0.6) / 0.4) ** 2)) : 1;
      const width = down ? 60 + Math.random() * 40 : 100 * rise * cap + 4;
      [-1, 1].forEach((side) => {
        if (!down && Math.random() < 0.035) return;
        const reach =
          width * (0.85 + Math.random() * 0.2) * (side > 0 ? 0.92 : 1);
        let lift = down ? 0.2 + Math.random() * 0.5 : 0.42 + vane * 0.3;
        let bend = down ? (Math.random() - 0.5) * 40 : -reach * 0.12;
        if (look.plume && !down) {
          lift = 0.1 - vane * 0.05;
          bend = reach * 0.18;
        }
        ctx.strokeStyle = color(t, down ? 0.35 : 0.9);
        ctx.lineWidth = down ? 1.2 : 1.8;
        barb(p, side, reach, lift, bend);
      });
    }
  }
  if (look.glints)
    for (let n = 0; n < 40; n += 1) {
      const p = spine(0.2 + Math.random() * 0.75);
      ctx.fillStyle = "rgba(255, 255, 240, 0.95)";
      ctx.beginPath();
      ctx.arc(
        p.x + (Math.random() - 0.5) * 120,
        p.y - Math.random() * 30,
        1.5 + Math.random() * 2,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  const quill = look.fluff ? (look.quill ?? 0) : 1;
  ctx.strokeStyle = look.spine || "rgba(255, 246, 236, 0.95)";
  for (let n = 0; n < 60 * quill; n += 1) {
    const t0 = n / 60;
    const t1 = (n + 1) / 60;
    const p0 = spine(t0);
    const p1 = spine(t1);
    ctx.lineWidth =
      look.peacock || look.fluff ? 3 * (1 - t0) + 1 : 7 * (1 - t0) + 1;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }
}

let shimmerMap = null;

function shimmerMask() {
  if (shimmerMap) return shimmerMap;
  const canvas = document.createElement("canvas");
  canvas.width = FEATHER_LOOKS.length * 4;
  canvas.height = 4;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, 4);
  ctx.fillStyle = "#fff";
  FEATHER_LOOKS.forEach((look, k) => {
    if (look.peacock) ctx.fillRect(k * 4, 0, 4, 4);
  });
  shimmerMap = new CanvasTexture(canvas);
  return shimmerMap;
}

function featherTexture() {
  if (featherMap) return featherMap;
  const canvas = document.createElement("canvas");
  canvas.width = FEATHER_W * FEATHER_LOOKS.length;
  canvas.height = FEATHER_H;
  const ctx = canvas.getContext("2d");
  FEATHER_LOOKS.forEach((look, k) => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(k * FEATHER_W + 2, 0, FEATHER_W - 4, FEATHER_H);
    ctx.clip();
    drawFeather(ctx, k * FEATHER_W, look);
    ctx.restore();
  });
  featherMap = new CanvasTexture(canvas);
  featherMap.colorSpace = SRGBColorSpace;
  featherMap.anisotropy = 8;
  return featherMap;
}

export function featherGeometry(length = 0.72) {
  const g = new PlaneGeometry(length * 0.26, length, 8, 24);
  const p = g.attributes.position;
  for (let n = 0; n < p.count; n += 1) {
    const x = p.getX(n) / (length * 0.13);
    const y = p.getY(n) / length + 0.5;
    const sweep = (y * y * 0.14 + Math.sin(y * Math.PI) * 0.03) * length;
    const bow = (Math.sin(y * Math.PI) * 0.09 + y * y * 0.12) * length;
    p.setXYZ(n, p.getX(n) + sweep, y * length, bow + x * x * 0.08 * length);
  }
  g.computeVertexNormals();
  return g;
}

export function featherMaterial() {
  const material = new MeshPhysicalMaterial({
    map: featherTexture(),
    alphaTest: 0.3,
    roughness: 0.8,
    sheen: 1,
    sheenRoughness: 0.5,
    sheenColor: new Color(0xffd6e4),
    side: DoubleSide,
    iridescence: 1,
    iridescenceMap: shimmerMask(),
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [120, 420],
  });
  material.onBeforeCompile = (shader) => {
    // eslint-disable-next-line no-param-reassign
    shader.vertexShader = shader.vertexShader
      .replace("void main() {", "attribute float aLook;\nvoid main() {")
      .replace(
        "#include <uv_vertex>",
        `#include <uv_vertex>\n  vMapUv.x = (vMapUv.x + aLook) / ${FEATHER_LOOKS.length}.0;\n  vIridescenceMapUv.x = (vIridescenceMapUv.x + aLook) / ${FEATHER_LOOKS.length}.0;`,
      );
  };
  return material;
}

export function petalGeometry() {
  const g = new PlaneGeometry(1, 1, 8, 8);
  const p = g.attributes.position;
  for (let n = 0; n < p.count; n += 1) {
    const u = p.getX(n);
    const v = p.getY(n) + 0.5;
    const width = Math.sin(Math.PI * v) ** 0.8 * (0.7 + 0.3 * v);
    const x = u * width * 0.7;
    p.setXYZ(n, x, v - 0.5, x * x * 1.2 + (v - 0.5) ** 2 * 0.25);
  }
  g.computeVertexNormals();
  return g;
}

export function softTexture(
  inner = "rgba(255,255,255,1)",
  outer = "rgba(255,255,255,0)",
) {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function canvasTexture(width, height, draw) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d"), width, height);
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export function twinkleTexture() {
  return canvasTexture(64, 64, (ctx, w) => {
    const c = w / 2;
    const glow = ctx.createRadialGradient(c, c, 0, c, c, c * 0.5);
    glow.addColorStop(0, "rgba(255,245,210,1)");
    glow.addColorStop(1, "rgba(255,220,140,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, w);
    ctx.fillStyle = "rgba(255,250,230,0.95)";
    [0, Math.PI / 2].forEach((a) => {
      ctx.save();
      ctx.translate(c, c);
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(-c, 0);
      ctx.quadraticCurveTo(0, -2.5, c, 0);
      ctx.quadraticCurveTo(0, 2.5, -c, 0);
      ctx.fill();
      ctx.restore();
    });
  });
}

export function glyphTexture(glyph, color) {
  return canvasTexture(128, 128, (ctx, w) => {
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.font = "96px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(glyph, w / 2, w / 2 + 6);
  });
}

export function heartTexture() {
  return canvasTexture(128, 128, (ctx) => {
    ctx.shadowColor = "rgba(255, 90, 140, 0.9)";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#ff6f9a";
    ctx.beginPath();
    ctx.moveTo(64, 104);
    ctx.bezierCurveTo(8, 70, 22, 18, 64, 42);
    ctx.bezierCurveTo(106, 18, 120, 70, 64, 104);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.ellipse(46, 50, 9, 5, -0.6, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function fogTexture() {
  return canvasTexture(256, 64, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, "rgba(220, 200, 240, 0.9)");
    g.addColorStop(1, "rgba(220, 200, 240, 0)");
    ctx.setTransform(1, 0, 0, h / w, 0, 0);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, w);
  });
}

export function flameTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const halo = ctx.createRadialGradient(64, 60, 0, 64, 60, 20);
  halo.addColorStop(0, "rgba(255,170,80,0.45)");
  halo.addColorStop(1, "rgba(255,120,40,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, 128, 128);
  const tongue = (tip, base, width, fill) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(64, tip);
    ctx.bezierCurveTo(
      64 + width * 0.6,
      tip + 10,
      64 + width,
      base - 8,
      64,
      base,
    );
    ctx.bezierCurveTo(
      64 - width,
      base - 8,
      64 - width * 0.6,
      tip + 10,
      64,
      tip,
    );
    ctx.fill();
  };
  const outer = ctx.createLinearGradient(0, 38, 0, 74);
  outer.addColorStop(0, "rgba(255,90,40,0.9)");
  outer.addColorStop(0.5, "rgba(255,150,50,1)");
  outer.addColorStop(1, "rgba(255,190,90,1)");
  tongue(38, 74, 6, outer);
  tongue(52, 73, 3, "rgba(255,248,220,1)");
  ctx.fillStyle = "rgba(110,140,255,0.7)";
  ctx.beginPath();
  ctx.ellipse(64, 72, 2.5, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export function candleGeometry(height = 0.62, radius = 0.12) {
  const top = height / 2;
  return new LatheGeometry(
    [
      [0, -top],
      [radius * 1.08, -top],
      [radius, top * 0.7],
      [radius * 1.05, top * 0.82],
      [radius * 0.9, top * 0.9],
      [radius * 0.6, top * 0.84],
      [0, top * 0.8],
    ].map(([x, y]) => new Vector2(x, y)),
    28,
  );
}

export function makeLotus() {
  const g = new Group();
  const petal = petalGeometry().translate(0, 0.5, 0).scale(1, 1, -1);
  const place = new Object3D();
  const petals = [];
  [
    [8, 0.62, 1.05, 0],
    [8, 0.5, 0.6, 0.4],
    [5, 0.36, 0.25, 0.1],
  ].forEach(([count, size, tilt, twist]) => {
    for (let n = 0; n < count; n += 1) {
      const a = (n / count) * Math.PI * 2 + twist;
      place.scale.setScalar(size);
      place.position.set(Math.cos(a) * 0.05, 0, Math.sin(a) * 0.05);
      place.rotation.set(tilt, -a + Math.PI / 2, 0, "YXZ");
      place.updateMatrix();
      petals.push(petal.clone().applyMatrix4(place.matrix));
    }
  });
  g.add(
    new Mesh(
      mergeGeometries(petals),
      new MeshPhysicalMaterial({
        color: 0xffb8d0,
        roughness: 0.6,
        sheen: 1,
        side: DoubleSide,
      }),
    ),
  );
  const core = new Mesh(
    new SphereGeometry(0.07, 16, 12),
    new MeshPhysicalMaterial({
      color: 0xffc94a,
      metalness: 1,
      roughness: 0.22,
    }),
  );
  core.position.y = 0.08;
  core.scale.y = 0.6;
  g.add(core);
  g.position.y = -0.2;
  const prop = new Group();
  prop.add(g);
  return prop;
}
