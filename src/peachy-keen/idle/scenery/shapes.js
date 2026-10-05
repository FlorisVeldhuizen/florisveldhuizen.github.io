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

let featherMap = null;

function featherTexture() {
  if (featherMap) return featherMap;
  const w = 256;
  const h = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const spine = (t) => ({
    x: w / 2 - 22 + t * t * 44,
    y: h - 20 - t * (h - 70),
  });
  const color = (t, alpha) => {
    const c = new Color(0xe8507a).lerp(new Color(0xffe8ef), t ** 0.7);
    return `rgba(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}, ${alpha})`;
  };
  ctx.lineCap = "round";
  const barbs = 420;
  for (let n = 0; n < barbs; n += 1) {
    const t = n / barbs;
    const p = spine(t);
    const down = t < 0.16;
    const vane = Math.max(0, (t - 0.1) / 0.9);
    const rise = Math.sin((Math.PI / 2) * Math.min(1, vane / 0.35)) ** 0.7;
    const cap =
      vane > 0.6 ? Math.sqrt(Math.max(0, 1 - ((vane - 0.6) / 0.4) ** 2)) : 1;
    const width = down ? 60 + Math.random() * 40 : 100 * rise * cap + 4;
    [-1, 1].forEach((side) => {
      if (!down && Math.random() < 0.035) return;
      const reach =
        width * (0.85 + Math.random() * 0.2) * (side > 0 ? 0.92 : 1);
      const lift = down ? 0.2 + Math.random() * 0.5 : 0.42 + vane * 0.3;
      const ex = p.x + side * reach;
      const ey = p.y - reach * lift;
      ctx.strokeStyle = color(t, down ? 0.35 : 0.9);
      ctx.lineWidth = down ? 1.2 : 1.8;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      const bend = down ? (Math.random() - 0.5) * 40 : -reach * 0.12;
      ctx.quadraticCurveTo(
        p.x + side * reach * 0.55,
        p.y - reach * lift * 0.2 + bend,
        ex,
        ey,
      );
      ctx.stroke();
    });
  }
  ctx.strokeStyle = "rgba(255, 246, 236, 0.95)";
  for (let n = 0; n < 60; n += 1) {
    const t0 = n / 60;
    const t1 = (n + 1) / 60;
    const p0 = spine(t0);
    const p1 = spine(t1);
    ctx.lineWidth = 7 * (1 - t0) + 1;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }
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
  return new MeshPhysicalMaterial({
    map: featherTexture(),
    alphaTest: 0.3,
    roughness: 0.8,
    sheen: 1,
    sheenRoughness: 0.5,
    sheenColor: new Color(0xffd6e4),
    side: DoubleSide,
  });
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
