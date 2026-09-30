import {
  CanvasTexture,
  Color,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshPhysicalMaterial,
  PlaneGeometry,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector2,
} from "three";

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

export function dropGeometry() {
  const points = [];
  for (let n = 0; n <= 24; n += 1) {
    const y = -1 + (n / 24) * 2.2;
    const r =
      y <= 0
        ? Math.sqrt(Math.max(0, 1 - y * y))
        : Math.max(0, 1 - y / 1.2) ** 1.6;
    points.push(new Vector2(r, y));
  }
  return new LatheGeometry(points, 24);
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
  canvas.width = 64;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const glow = ctx.createRadialGradient(32, 84, 2, 32, 76, 40);
  glow.addColorStop(0, "rgba(255,240,200,1)");
  glow.addColorStop(0.25, "rgba(255,190,90,0.9)");
  glow.addColorStop(0.6, "rgba(255,110,40,0.35)");
  glow.addColorStop(1, "rgba(255,80,20,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.moveTo(32, 8);
  ctx.bezierCurveTo(52, 50, 58, 90, 32, 120);
  ctx.bezierCurveTo(6, 90, 12, 50, 32, 8);
  ctx.fill();
  const t = new CanvasTexture(canvas);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export function moonTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffc49a";
  ctx.fillRect(0, 0, 256, 128);
  for (let n = 0; n < 60; n += 1) {
    const x = Math.random() * 256;
    const y = 10 + Math.random() * 108;
    const r = 2 + Math.random() ** 2 * 12;
    ctx.fillStyle = `rgba(190, 100, 80, ${0.12 + Math.random() * 0.18})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
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

function physical(options) {
  return new MeshPhysicalMaterial({ roughness: 0.5, ...options });
}

function extrude(shape, depth, bevel = 0.04) {
  return new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 24,
  }).center();
}

function heartShape(s = 1) {
  const h = new Shape();
  h.moveTo(0, -0.5 * s);
  h.bezierCurveTo(-0.9 * s, 0.05 * s, -0.45 * s, 0.75 * s, 0, 0.3 * s);
  h.bezierCurveTo(0.45 * s, 0.75 * s, 0.9 * s, 0.05 * s, 0, -0.5 * s);
  return h;
}

function starShape(outer = 0.5, inner = 0.22) {
  const s = new Shape();
  for (let n = 0; n < 10; n += 1) {
    const r = n % 2 ? inner : outer;
    const a = (n / 10) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (n) s.lineTo(x, y);
    else s.moveTo(x, y);
  }
  return s;
}

function lathe(points, material, segments = 40) {
  return new Mesh(
    new LatheGeometry(
      points.map(([x, y]) => new Vector2(x, y)),
      segments,
    ),
    material,
  );
}

const MATERIALS = {
  wood: () => physical({ color: 0xc98a52, roughness: 0.55, clearcoat: 0.4 }),
  darkWood: () => physical({ color: 0x8a5228, roughness: 0.6 }),
  heart: () =>
    physical({ color: 0xff4f7a, roughness: 0.25, clearcoat: 1, sheen: 0.5 }),
  stone: () => physical({ color: 0x2a2228, roughness: 0.18, clearcoat: 1 }),
  glass: () =>
    physical({
      color: 0xffa640,
      roughness: 0.08,
      transparent: true,
      opacity: 0.82,
      clearcoat: 1,
    }),
  cork: () => physical({ color: 0xb8864e, roughness: 0.9 }),
  silver: () => physical({ color: 0xe8e8f0, metalness: 1, roughness: 0.18 }),
  gold: () => physical({ color: 0xffc94a, metalness: 1, roughness: 0.22 }),
  towel: () =>
    physical({
      color: 0xfff4ec,
      roughness: 1,
      sheen: 1,
      sheenColor: new Color(0xffffff),
    }),
  lotus: () =>
    physical({ color: 0xffb8d0, roughness: 0.6, sheen: 1, side: DoubleSide }),
  reamer: () =>
    physical({
      color: 0xffd9a0,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
      clearcoat: 1,
    }),
  wax: () => physical({ color: 0xfff0dc, roughness: 0.7, sheen: 0.6 }),
  moon: (map) =>
    physical({ color: 0xffffff, map, roughness: 0.9, emissive: 0x3a1408 }),
  pink: () =>
    physical({
      color: 0xff7ab8,
      emissive: 0x6a1a44,
      roughness: 0.3,
      metalness: 0.4,
    }),
  cyan: () =>
    physical({
      color: 0x7ae0ff,
      emissive: 0x104050,
      roughness: 0.3,
      metalness: 0.4,
    }),
  core: () =>
    physical({ color: 0xffe0f0, emissive: 0xff5fa8, emissiveIntensity: 0.6 }),
  void: () => physical({ color: 0x050104, roughness: 0.1, clearcoat: 1 }),
  disc: () =>
    physical({
      color: 0xffb86a,
      emissive: 0xff5fa8,
      emissiveIntensity: 0.9,
      side: DoubleSide,
    }),
};

const PROPS = {
  feather: () => {
    const m = new Mesh(featherGeometry(1), featherMaterial());
    m.position.y = -0.5;
    m.rotation.z = -0.4;
    return m;
  },
  admirer: () =>
    new Mesh(extrude(heartShape(0.8), 0.18, 0.08), MATERIALS.heart()),
  paddle: () => {
    const g = new Group();
    const face = new Shape();
    face.absarc(0, 0.2, 0.34, 0, Math.PI * 2);
    [
      [-0.12, 0.3],
      [0.12, 0.3],
      [0, 0.1],
    ].forEach(([x, y]) => {
      const hole = new Shape();
      hole.absarc(x, y, 0.05, 0, Math.PI * 2);
      face.holes.push(hole);
    });
    const head = new Mesh(extrude(face, 0.06, 0.02), MATERIALS.wood());
    head.position.y = 0.2;
    const handle = new Mesh(
      new CylinderGeometry(0.05, 0.06, 0.42, 16),
      MATERIALS.darkWood(),
    );
    handle.position.y = -0.34;
    g.add(head, handle);
    return g;
  },
  masseuse: () => {
    const g = new Group();
    const mat = MATERIALS.stone();
    [
      [0, -0.22, 0.34],
      [0.02, 0.0, 0.27],
      [-0.01, 0.17, 0.2],
    ].forEach(([x, y, r]) => {
      const s = new Mesh(new SphereGeometry(r, 32, 16), mat);
      s.scale.y = 0.42;
      s.position.set(x, y, 0);
      g.add(s);
    });
    return g;
  },
  baron: () => {
    const g = new Group();
    g.add(
      lathe(
        [
          [0, -0.45],
          [0.26, -0.45],
          [0.3, -0.38],
          [0.3, 0.05],
          [0.16, 0.22],
          [0.1, 0.3],
          [0.1, 0.42],
          [0, 0.42],
        ],
        MATERIALS.glass(),
      ),
    );
    const cork = new Mesh(
      new CylinderGeometry(0.09, 0.08, 0.14, 20),
      MATERIALS.cork(),
    );
    cork.position.y = 0.48;
    g.add(cork);
    return g;
  },
  coach: () => {
    const g = new Group();
    const body = new Mesh(
      new CylinderGeometry(0.2, 0.2, 0.34, 32),
      MATERIALS.silver(),
    );
    body.rotation.x = Math.PI / 2;
    const tube = new Mesh(
      new CylinderGeometry(0.07, 0.08, 0.4, 20),
      MATERIALS.silver(),
    );
    tube.rotation.z = Math.PI / 2;
    tube.position.set(0.3, 0.12, 0);
    const ring = new Mesh(
      new TorusGeometry(0.1, 0.025, 12, 32),
      MATERIALS.gold(),
    );
    ring.position.set(-0.2, 0.18, 0);
    g.add(body, tube, ring);
    return g;
  },
  choir: () => {
    const note = new Shape();
    note.absellipse(0, 0, 0.16, 0.12, 0, Math.PI * 2, false, -0.4);
    const stem = new Shape();
    stem.moveTo(0.12, 0);
    stem.lineTo(0.17, 0);
    stem.lineTo(0.17, 0.62);
    stem.lineTo(0.42, 0.5);
    stem.lineTo(0.42, 0.42);
    stem.lineTo(0.17, 0.52);
    stem.lineTo(0.12, 0.52);
    const g = new Group();
    g.add(new Mesh(extrude(note, 0.08, 0.03), MATERIALS.gold()));
    const s = new Mesh(extrude(stem, 0.06, 0.015), MATERIALS.gold());
    s.position.set(0.14, 0.3, 0);
    g.add(s);
    g.position.y = -0.2;
    return g;
  },
  spa: () => {
    const g = new Group();
    const petal = petalGeometry().translate(0, 0.5, 0).scale(1, 1, -1);
    const mat = MATERIALS.lotus();
    [
      [8, 0.62, 1.05, 0],
      [8, 0.5, 0.6, 0.4],
      [5, 0.36, 0.25, 0.1],
    ].forEach(([count, size, tilt, twist]) => {
      for (let n = 0; n < count; n += 1) {
        const p = new Mesh(petal, mat);
        const a = (n / count) * Math.PI * 2 + twist;
        p.scale.setScalar(size);
        p.position.set(Math.cos(a) * 0.05, 0, Math.sin(a) * 0.05);
        p.rotation.set(tilt, -a + Math.PI / 2, 0, "YXZ");
        g.add(p);
      }
    });
    const core = new Mesh(new SphereGeometry(0.07, 16, 12), MATERIALS.gold());
    core.position.y = 0.08;
    core.scale.y = 0.6;
    g.add(core);
    g.position.y = -0.2;
    return g;
  },
  press: () => {
    const points = [];
    for (let n = 0; n <= 16; n += 1) {
      const t = n / 16;
      points.push([0.08 + (1 - t) * 0.32 + (n % 2) * 0.02, t * 0.5 - 0.3]);
    }
    points.push([0, 0.24]);
    const g = new Group();
    g.add(
      lathe(
        [[0, -0.36], [0.46, -0.36], [0.5, -0.3], ...points],
        MATERIALS.reamer(),
        12,
      ),
    );
    return g;
  },
  cult: () => {
    const g = new Group();
    const wax = new Mesh(candleGeometry(), MATERIALS.wax());
    const wick = new Mesh(
      new CylinderGeometry(0.01, 0.01, 0.06, 6),
      MATERIALS.stone(),
    );
    wick.position.y = 0.34;
    g.add(wax, wick);
    return g;
  },
  moon: () =>
    new Mesh(new SphereGeometry(0.42, 48, 32), MATERIALS.moon(moonTexture())),
  collider: () => {
    const g = new Group();
    g.add(new Mesh(new SphereGeometry(0.12, 24, 16), MATERIALS.core()));
    [0, Math.PI / 3, -Math.PI / 3].forEach((rot, n) => {
      const ring = new Mesh(
        new TorusGeometry(0.4, 0.02, 10, 64),
        n === 1 ? MATERIALS.cyan() : MATERIALS.pink(),
      );
      ring.rotation.set(Math.PI / 2.4, 0, rot);
      g.add(ring);
    });
    return g;
  },
  singularity: () => {
    const g = new Group();
    g.add(new Mesh(new SphereGeometry(0.22, 32, 24), MATERIALS.void()));
    const disc = new Mesh(
      new TorusGeometry(0.38, 0.09, 4, 64),
      MATERIALS.disc(),
    );
    disc.scale.z = 0.12;
    disc.rotation.x = Math.PI / 2.3;
    g.add(disc);
    return g;
  },
  peachverse: () =>
    new Mesh(extrude(starShape(0.48, 0.2), 0.12, 0.05), MATERIALS.gold()),
};

export function makeProp(id) {
  const g = new Group();
  g.add(PROPS[id]());
  return g;
}
