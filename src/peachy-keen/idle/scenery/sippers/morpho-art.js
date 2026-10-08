/* eslint-disable no-param-reassign, no-continue */
import { canvas } from "./parts";

let seed = 1;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

function scaleTile(light, dark) {
  const c = document.createElement("canvas");
  c.width = 48;
  c.height = 48;
  const g = c.getContext("2d");
  for (let row = 0; row < 8; row += 1)
    for (let col = 0; col < 10; col += 1) {
      const x = col * 5 + (row % 2) * 2.5;
      const y = row * 6;
      g.fillStyle = (row + col) % 3 ? light : dark;
      g.beginPath();
      g.ellipse(x, y + 3, 2.1, 3.4, 0, 0, Math.PI);
      g.fill();
    }
  return c;
}

function sectorScales(g, size, root, light, dark, k) {
  const tile = scaleTile(light, dark);
  const pattern = g.createPattern(tile, "repeat");
  const [rx, ry] = [root[0] * size, (1 - root[1]) * size];
  const sectors = 14;
  for (let s = 0; s < sectors; s += 1) {
    const a0 = -Math.PI / 2 + (s / sectors) * Math.PI;
    const a1 = -Math.PI / 2 + ((s + 1) / sectors) * Math.PI;
    g.save();
    g.beginPath();
    g.moveTo(rx, ry);
    g.arc(rx, ry, size * 1.6, a0, a1);
    g.closePath();
    g.clip();
    g.translate(rx, ry);
    g.rotate((a0 + a1) / 2 + Math.PI / 2);
    g.scale(k * 0.9, k * 0.9);
    g.fillStyle = pattern;
    g.fillRect(-size * 2, -size * 2, size * 4, size * 4);
    g.restore();
  }
}

function blobs(g, size, count, colors, rMin, rMax) {
  for (let n = 0; n < count; n += 1) {
    const x = rnd() * size;
    const y = rnd() * size;
    const r = (rMin + rnd() * (rMax - rMin)) * size;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, colors[n % colors.length]);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

function venation(g, size, root, edge, fore, color, k) {
  const [rx, ry] = [root[0] * size, (1 - root[1]) * size];
  const outer = edge.filter((p) => p.x > root[0] + 0.18);
  const count = fore ? 10 : 8;
  const ends = Array.from(
    { length: count },
    (_, i) => outer[Math.floor(((i + 0.5) / count) * outer.length)],
  );
  const cell = ends.map((p, i) => {
    const t =
      0.36 +
      Math.sin((i / (count - 1)) * Math.PI) * 0.12 +
      (rnd() - 0.5) * 0.02;
    return [rx + (p.x * size - rx) * t, ry + ((1 - p.y) * size - ry) * t];
  });
  g.strokeStyle = color;
  g.lineCap = "round";
  g.lineJoin = "round";
  const taper = (x0, y0, cx, cy, x1, y1, w0, w1) => {
    for (let i = 0; i < 12; i += 1) {
      const a = i / 12;
      const b = (i + 1) / 12;
      const at = (t) => [
        (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x1,
        (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y1,
      ];
      const [ax, ay] = at(a);
      const [bx, by] = at(b);
      g.lineWidth = (w0 + (w1 - w0) * a) * k;
      g.beginPath();
      g.moveTo(ax, ay);
      g.lineTo(bx, by);
      g.stroke();
    }
  };
  g.lineWidth = 2.6 * k;
  g.beginPath();
  g.moveTo(rx, ry);
  cell.forEach(([x, y]) => g.lineTo(x, y));
  g.closePath();
  g.stroke();
  ends.forEach((p, i) => {
    const [cx, cy] = cell[i];
    const ex = p.x * size;
    const ey = (1 - p.y) * size;
    const bend = (rnd() - 0.5) * 0.08;
    const mx = (cx + ex) / 2 + (ey - cy) * (0.05 + bend);
    const my = (cy + ey) / 2 - (ex - cx) * (0.05 + bend);
    taper(cx, cy, mx, my, ex, ey, 2.4, 0.7);
    if (i % 3 === 1) {
      const sx = cx + (ex - cx) * 0.55;
      const sy = cy + (ey - cy) * 0.55;
      const q = ends[Math.min(count - 1, i + 1)];
      const qx = (ex + q.x * size) / 2;
      const qy = (ey + (1 - q.y) * size) / 2;
      taper(sx, sy, (sx + qx) / 2, (sy + qy) / 2, qx, qy, 1.4, 0.6);
    }
  });
  [
    [0.5, 0.95],
    [0.25, 0.8],
  ].forEach(([t, w]) => {
    const p = outer[0];
    taper(
      rx,
      ry,
      rx + (p.x * size - rx) * t,
      ry + ((1 - p.y) * size - ry) * t * 1.1,
      p.x * size,
      (1 - p.y) * size,
      3.6 * w,
      1.6 * w,
    );
  });
}

function innerEdge(root, edge, depth, salt) {
  let s = 977 + salt;
  const r = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  return edge.map((p, i) => {
    const wave =
      1 +
      0.16 * Math.sin(i * 0.31 + salt) +
      0.07 * Math.sin(i * 0.9) +
      (r() - 0.5) * 0.05;
    const scallop = 1 + 0.12 * Math.max(0, Math.sin(i * 0.52));
    let inside = 1;
    if (salt === 3)
      inside = 0.25 + 0.75 * Math.min(1, Math.max(0, (p.y - 0.12) / 0.2));
    else if (salt === 7)
      inside = 0.2 + 0.8 * Math.min(1, Math.max(0, (0.9 - p.y) / 0.12));
    const d =
      depth *
      wave *
      scallop *
      inside *
      Math.min(1, Math.max(0.25, (p.x - root[0]) * 2.2));
    return [p.x + (root[0] - p.x) * d, p.y + (root[1] - p.y) * d];
  });
}

function margin(g, size, root, edge, inner, color, dust, sparkle, k) {
  g.beginPath();
  edge.forEach((p, n) =>
    n
      ? g.lineTo(p.x * size, (1 - p.y) * size)
      : g.moveTo(p.x * size, (1 - p.y) * size),
  );
  g.closePath();
  inner
    .slice()
    .reverse()
    .forEach(([u, f], n) =>
      n
        ? g.lineTo(u * size, (1 - f) * size)
        : g.moveTo(u * size, (1 - f) * size),
    );
  g.closePath();
  g.fillStyle = color;
  g.fill("evenodd");
  inner.forEach(([u, f], i) => {
    const p = edge[i];
    const ix = (root[0] - p.x) * size;
    const iy = -((root[1] - p.y) * size);
    const len = Math.hypot(ix, iy) || 1;
    for (let j = 0; j < 14; j += 1) {
      const t = rnd() ** 3 * 9 * k;
      const side = (rnd() - 0.5) * 10 * k;
      const x = u * size + (ix / len) * t + (-iy / len) * side;
      const y = (1 - f) * size + (iy / len) * t + (ix / len) * side;
      g.fillStyle = dust;
      g.beginPath();
      g.arc(x, y, (0.5 + rnd() * 0.9) * k, 0, Math.PI * 2);
      g.fill();
    }
    if (sparkle && rnd() < 0.5) {
      g.fillStyle = sparkle;
      g.beginPath();
      g.arc(
        u * size - (ix / len) * 4 * k,
        (1 - f) * size - (iy / len) * 4 * k,
        0.8 * k,
        0,
        Math.PI * 2,
      );
      g.fill();
    }
  });
  return inner;
}

function spot(g, x, y, r, color) {
  g.fillStyle = color;
  for (let n = 0; n < 3; n += 1) {
    g.beginPath();
    g.ellipse(
      x + (rnd() - 0.5) * r * 0.8,
      y + (rnd() - 0.5) * r * 0.8,
      r * (0.55 + rnd() * 0.4),
      r * (0.45 + rnd() * 0.4),
      rnd() * 3,
      0,
      Math.PI * 2,
    );
    g.fill();
  }
}

function eyespot(g, x, y, r) {
  [
    ["#2a180c", 1],
    ["#e8b84a", 0.86],
    ["#a86a28", 0.66],
    ["#1a0f08", 0.58],
    ["#3a2414", 0.3],
  ].forEach(([c, s]) => {
    g.fillStyle = c;
    g.beginPath();
    g.ellipse(x, y, r * s, r * s * 0.94, 0.3, 0, Math.PI * 2);
    g.fill();
  });
  g.fillStyle = "#f4ecdc";
  g.beginPath();
  g.ellipse(x + r * 0.12, y - r * 0.1, r * 0.17, r * 0.13, 0.4, 0, Math.PI * 2);
  g.fill();
}

export default function paintMorpho(
  size,
  edgeIn,
  root,
  fore,
  sunset,
  side,
  variantSeed,
) {
  seed = 1 + variantSeed * 7919 + (fore ? 13 : 29) + (side === "top" ? 0 : 101);
  const k = size / 512;
  const edge = edgeIn.map((p) => p.clone());
  const [rx, ry] = [root[0] * size, (1 - root[1]) * size];
  return canvas(size, size, (g) => {
    const radial = (stops) => {
      const r = g.createRadialGradient(rx, ry, 0, rx, ry, size * 1.05);
      stops.forEach(([at, c]) => r.addColorStop(at, c));
      g.fillStyle = r;
      g.fillRect(0, 0, size, size);
    };
    if (side === "top") {
      radial(
        sunset
          ? [
              [0, "#4a0c2a"],
              [0.12, "#a02a54"],
              [0.35, "#e85a7c"],
              [0.6, "#ff8a8c"],
              [0.85, "#e05878"],
              [1, "#6a1430"],
            ]
          : [
              [0, "#081650"],
              [0.12, "#0e2eb0"],
              [0.35, "#1860e8"],
              [0.6, "#2a88ff"],
              [0.85, "#1856e0"],
              [1, "#0a2690"],
            ],
      );
      blobs(
        g,
        size,
        70,
        sunset
          ? ["rgba(255,190,190,0.12)", "rgba(120,20,50,0.12)"]
          : ["rgba(120,210,255,0.12)", "rgba(8,24,110,0.14)"],
        0.04,
        0.13,
      );
      const base = g.createRadialGradient(rx, ry, 0, rx, ry, size * 0.26);
      base.addColorStop(0, sunset ? "rgba(40,6,20,0.85)" : "rgba(4,8,36,0.85)");
      base.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = base;
      g.fillRect(0, 0, size, size);
      sectorScales(
        g,
        size,
        root,
        sunset ? "rgba(255,220,220,0.09)" : "rgba(170,225,255,0.09)",
        "rgba(0,0,30,0.08)",
        k,
      );
      venation(
        g,
        size,
        root,
        edge,
        fore,
        sunset ? "rgba(60,8,24,0.7)" : "rgba(4,8,40,0.72)",
        k,
      );
      const inner = margin(
        g,
        size,
        root,
        edge,
        innerEdge(root, edge, fore ? 0.17 : 0.11, fore ? 3 : 7),
        sunset ? "#20040e" : "#03040c",
        sunset ? "rgba(32,4,14,0.55)" : "rgba(3,4,12,0.55)",
        sunset ? "rgba(255,150,170,0.5)" : "rgba(80,160,255,0.5)",
        k,
      );
      if (fore) {
        const apex = inner
          .map((p, i) => ({ p, e: edge[i] }))
          .filter(({ e }) => e.y > 0.72 && e.x > 0.62);
        apex.forEach(({ p, e }, i) => {
          if (i % Math.max(1, Math.floor(apex.length / 5))) return;
          spot(
            g,
            ((p[0] + e.x) / 2) * size,
            (1 - (p[1] + e.y) / 2) * size,
            (2.4 + rnd() * 1.6) * k,
            sunset ? "rgba(255,244,236,0.95)" : "rgba(240,246,255,0.95)",
          );
        });
      } else
        inner.forEach((p, i) => {
          if (i % 14 !== 3) return;
          const e = edge[i];
          spot(
            g,
            (p[0] * 0.4 + e.x * 0.6) * size,
            (1 - (p[1] * 0.4 + e.y * 0.6)) * size,
            (1.6 + rnd()) * k,
            "rgba(220,235,255,0.6)",
          );
        });
      for (let n = 0; n < 6; n += 1) {
        const p = edge[Math.floor(rnd() * edge.length)];
        if (p.x < root[0] + 0.3) continue;
        g.fillStyle = sunset
          ? "rgba(255,210,210,0.12)"
          : "rgba(170,190,220,0.12)";
        g.beginPath();
        g.ellipse(
          p.x * size + (rnd() - 0.5) * 30 * k,
          (1 - p.y) * size + (rnd() - 0.5) * 30 * k,
          (6 + rnd() * 10) * k,
          (3 + rnd() * 6) * k,
          rnd() * 3,
          0,
          Math.PI * 2,
        );
        g.fill();
      }
    } else {
      radial(
        sunset
          ? [
              [0, "#b08070"],
              [0.5, "#9a6a5c"],
              [1, "#704840"],
            ]
          : [
              [0, "#b08a5e"],
              [0.5, "#946c46"],
              [1, "#6e4c32"],
            ],
      );
      blobs(
        g,
        size,
        120,
        ["rgba(230,200,150,0.12)", "rgba(70,40,20,0.12)"],
        0.02,
        0.07,
      );
      sectorScales(
        g,
        size,
        root,
        "rgba(255,235,200,0.07)",
        "rgba(40,20,0,0.06)",
        k,
      );
      g.lineCap = "round";
      [
        [0.3, 22],
        [0.62, 16],
      ].forEach(([t, w]) => {
        g.strokeStyle = sunset
          ? "rgba(236,190,170,0.5)"
          : "rgba(222,186,128,0.55)";
        g.lineWidth = w * k;
        g.beginPath();
        edge.forEach((p, i) => {
          if (p.x < root[0] + 0.15) return;
          const wob = Math.sin(i * 0.4) * 0.015;
          const u = root[0] + (p.x - root[0]) * (t + wob);
          const f = root[1] + (p.y - root[1]) * (t + wob);
          g.lineTo(u * size, (1 - f) * size);
        });
        g.stroke();
      });
      venation(g, size, root, edge, fore, "rgba(70,44,24,0.6)", k);
      margin(
        g,
        size,
        root,
        edge,
        innerEdge(root, edge, 0.07, 11),
        "rgba(74,48,30,0.92)",
        "rgba(74,48,30,0.4)",
        null,
        k,
      );
      const eyes = fore
        ? [
            [0.56, 0.5, 30],
            [0.74, 0.66, 22],
          ]
        : [
            [0.42, 0.62, 30],
            [0.6, 0.48, 34],
            [0.74, 0.66, 24],
          ];
      eyes.forEach(([u, f, r]) => eyespot(g, u * size, (1 - f) * size, r * k));
    }
    const img = g.getImageData(0, 0, size, size);
    const d = img.data;
    for (let n = 0; n < d.length; n += 4) {
      const v = (Math.random() - 0.5) * 3;
      d[n] += v;
      d[n + 1] += v;
      d[n + 2] += v;
    }
    g.putImageData(img, 0, 0);
  });
}
