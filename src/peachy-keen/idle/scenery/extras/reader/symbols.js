/* eslint-disable no-param-reassign -- painters set state on the canvas context they are given */
import { TAU, crown, heartPath, lips, star, wheel } from "./art";

function inked(c, S, width = S.lw) {
  c.strokeStyle = S.ink;
  c.lineWidth = width;
  c.lineCap = "round";
  c.lineJoin = "round";
  S.glow(c);
}

function paint(c, S) {
  inked(c, S);
  c.stroke();
}

function crescentMark(c, S, x, y, r, tilt = 0.6) {
  const ox = x + Math.cos(tilt) * r * 0.5;
  const oy = y - Math.sin(tilt) * r * 0.5;
  const ir = r * 0.82;
  c.save();
  if (S.lineOnly) {
    inked(c, S);
    c.save();
    c.beginPath();
    c.rect(x - r * 3, y - r * 3, r * 6, r * 6);
    c.arc(ox, oy, ir, 0, TAU, true);
    c.clip("evenodd");
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.stroke();
    c.restore();
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    c.clip();
    c.beginPath();
    c.arc(ox, oy, ir, 0, TAU);
    c.stroke();
  } else {
    c.beginPath();
    c.rect(x - r * 3, y - r * 3, r * 6, r * 6);
    c.arc(ox, oy, ir, 0, TAU, true);
    c.clip("evenodd");
    c.beginPath();
    c.arc(x, y, r, 0, TAU);
    paint(c, S, S.moon);
  }
  c.restore();
}

function starShape(c, x, y, r, points = 8, inner = 0.38) {
  star(c, x, y, r, points, inner);
}

function drapes(c, S, x, y, u) {
  c.save();
  inked(c, S);
  c.beginPath();
  c.moveTo(x - u * 1.05, y - u * 0.75);
  c.lineTo(x + u * 1.05, y - u * 0.75);
  c.stroke();
  [-1, 1].forEach((side) => {
    const o = x + side * u * 0.98;
    c.beginPath();
    c.moveTo(o, y - u * 0.75);
    c.lineTo(o, y + u * 0.85);
    c.moveTo(x + side * u * 0.12, y - u * 0.75);
    c.bezierCurveTo(
      x + side * u * 0.2,
      y - u * 0.2,
      x + side * u * 0.7,
      y + u * 0.05,
      x + side * u * 0.92,
      y + u * 0.12,
    );
    c.bezierCurveTo(
      x + side * u * 0.75,
      y + u * 0.3,
      x + side * u * 0.78,
      y + u * 0.6,
      x + side * u * 0.8,
      y + u * 0.85,
    );
    c.moveTo(x + side * u * 0.45, y - u * 0.75);
    c.quadraticCurveTo(
      x + side * u * 0.55,
      y - u * 0.3,
      x + side * u * 0.8,
      y + u * 0.02,
    );
    c.stroke();
    c.beginPath();
    c.arc(x + side * u * 0.92, y + u * 0.12, u * 0.06, 0, TAU);
    c.stroke();
  });
  c.restore();
  crescentMark(c, S, x, y - u * 0.18, u * 0.28, 1.6);
}

function peachMark(c, S, x, y, u, P) {
  if (!P) return;
  c.save();
  S.glow(c);
  P.draw(c, "back", x, y, u * 2.2, { look: S.lineOnly ? "mark" : "smooth" });
  c.restore();
  c.save();
  inked(c, S);
  for (let k = 0; k < 10; k += 1) {
    const a = -Math.PI / 2 + ((k - 4.5) / 9) * Math.PI * 1.25;
    c.beginPath();
    c.moveTo(x + Math.cos(a) * u * 1.0, y + Math.sin(a) * u * 0.95);
    c.lineTo(
      x + Math.cos(a) * u * (k % 2 ? 1.18 : 1.3),
      y + Math.sin(a) * u * (k % 2 ? 1.12 : 1.24),
    );
    c.stroke();
  }
  c.restore();
}

function sunDisc(c, S, x, y, r) {
  c.save();
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  paint(c, S, S.gold);
  inked(c, S);
  for (let k = 0; k < 16; k += 1) {
    const a = (k / 16) * TAU;
    const long = k % 2 ? 1.45 : 1.75;
    c.beginPath();
    c.moveTo(x + Math.cos(a) * r * 1.22, y + Math.sin(a) * r * 1.22);
    c.lineTo(x + Math.cos(a) * r * long, y + Math.sin(a) * r * long);
    c.stroke();
  }
  c.restore();
}

function lovelyHeart(c, x, y, s) {
  c.beginPath();
  c.moveTo(x, y + s * 0.92);
  c.bezierCurveTo(
    x - s * 0.2,
    y + s * 0.68,
    x - s * 1.02,
    y + s * 0.2,
    x - s * 1.0,
    y - s * 0.3,
  );
  c.bezierCurveTo(
    x - s * 0.98,
    y - s * 0.82,
    x - s * 0.38,
    y - s * 1.02,
    x,
    y - s * 0.5,
  );
  c.bezierCurveTo(
    x + s * 0.38,
    y - s * 1.02,
    x + s * 0.98,
    y - s * 0.82,
    x + s * 1.0,
    y - s * 0.3,
  );
  c.bezierCurveTo(
    x + s * 1.02,
    y + s * 0.2,
    x + s * 0.2,
    y + s * 0.68,
    x,
    y + s * 0.92,
  );
  c.closePath();
}

function twinHearts(c, S, x, y, u) {
  const s = u * 0.46;
  const ax = x - u * 0.34;
  const bx = x + u * 0.34;
  const by = y + u * 0.16;
  const px = Math.ceil(u * 3.2);
  const o = document.createElement("canvas");
  o.width = px;
  o.height = px;
  const g = o.getContext("2d");
  g.translate(px / 2 - x, px / 2 - y);
  const stroke = (hx, hy) => {
    lovelyHeart(g, hx, hy, s);
    g.stroke();
  };
  const gap = (hx, hy, top) => {
    g.save();
    g.beginPath();
    g.rect(x - u * 0.35, top ? y - u * 2 : y, u * 0.7, u * 2);
    g.clip();
    g.globalCompositeOperation = "destination-out";
    g.lineWidth = S.lw * 3.4;
    lovelyHeart(g, hx, hy, s);
    g.stroke();
    g.restore();
  };
  g.strokeStyle = S.ink;
  g.lineWidth = S.lw;
  g.lineJoin = "round";
  g.lineCap = "round";
  if (!S.lineOnly) {
    g.fillStyle = S.blush;
    lovelyHeart(g, ax, y, s);
    g.fill();
    lovelyHeart(g, bx, by, s);
    g.fill();
  }
  stroke(ax, y);
  gap(bx, by, true);
  stroke(bx, by);
  gap(ax, y, false);
  g.save();
  g.beginPath();
  g.rect(x - u * 0.35, y, u * 0.7, u * 2);
  g.clip();
  stroke(ax, y);
  g.restore();
  c.save();
  S.glow(c);
  c.drawImage(o, x - px / 2, y - px / 2);
  c.restore();
}

function sparkles(c, S, list) {
  c.save();
  c.fillStyle = S.ink;
  S.glow(c);
  list.forEach(([x, y, r]) => {
    star(c, x, y, r, 4, 0.3);
    c.fill();
  });
  c.restore();
}

function peachLine(c, S, P, x, y, size) {
  if (!P) return;
  c.save();
  S.glow(c);
  P.draw(c, "back", x, y, size, { look: S.lineOnly ? "mark" : "smooth" });
  c.restore();
}

function gauge(c, S, x, y, u) {
  c.save();
  inked(c, S);
  const cy = y + u * 0.42;
  const r = u;
  const a0 = Math.PI;
  const a1 = Math.PI * 2;
  c.beginPath();
  c.moveTo(x - r * 1.12, cy);
  c.arc(x, cy, r * 1.12, a0, a1);
  c.lineTo(x - r * 1.12, cy);
  paint(c, S, S.gold);
  inked(c, S);
  c.beginPath();
  c.arc(x, cy, r * 0.96, a0, a1);
  c.stroke();
  for (let k = 0; k <= 10; k += 1) {
    const a = a0 + ((a1 - a0) * k) / 10;
    const len = k % 5 ? 0.12 : 0.24;
    c.beginPath();
    c.moveTo(
      x + Math.cos(a) * r * (0.92 - len),
      cy + Math.sin(a) * r * (0.92 - len),
    );
    c.lineTo(x + Math.cos(a) * r * 0.92, cy + Math.sin(a) * r * 0.92);
    c.stroke();
  }
  for (let k = 0; k < 3; k += 1) {
    c.beginPath();
    c.arc(x, cy, r * (0.38 + k * 0.08), a0 + 0.25, a1 - 0.25);
    c.globalAlpha = 0.6;
    c.stroke();
    c.globalAlpha = 1;
  }
  const n = a0 + (a1 - a0) * 0.88;
  c.beginPath();
  c.moveTo(x, cy);
  c.lineTo(x + Math.cos(n) * r * 0.84, cy + Math.sin(n) * r * 0.84);
  c.stroke();
  heartPath(c, x, cy - u * 0.04, u * 0.16);
  paint(c, S, S.blush);
  c.restore();
}
function drop(c, S, x, y, s) {
  c.save();
  c.beginPath();
  c.moveTo(x, y - s);
  c.bezierCurveTo(
    x + s * 0.12,
    y - s * 0.6,
    x + s * 0.62,
    y - s * 0.1,
    x + s * 0.62,
    y + s * 0.3,
  );
  c.arc(x, y + s * 0.3, s * 0.62, 0, Math.PI);
  c.bezierCurveTo(
    x - s * 0.62,
    y - s * 0.1,
    x - s * 0.12,
    y - s * 0.6,
    x,
    y - s,
  );
  c.closePath();
  paint(c, S, S.drop ?? S.oil);
  inked(c, S);
  c.beginPath();
  c.arc(x, y + s * 0.3, s * 0.4, Math.PI * 0.95, Math.PI * 1.3);
  c.stroke();
  c.restore();
}

function rasterOutline(c, S, x, y, box, drawShape) {
  const px = Math.ceil(box + S.lw * 6);
  const shape = document.createElement("canvas");
  shape.width = px;
  shape.height = px;
  const g = shape.getContext("2d");
  g.translate(px / 2, px / 2);
  g.fillStyle = "#000";
  g.strokeStyle = "#000";
  drawShape(g);
  const out = document.createElement("canvas");
  out.width = px;
  out.height = px;
  const o = out.getContext("2d");
  for (let a = 0; a < 16; a += 1) {
    const t = (a / 16) * TAU;
    o.drawImage(shape, Math.cos(t) * S.lw, Math.sin(t) * S.lw);
  }
  o.globalCompositeOperation = "destination-out";
  o.drawImage(shape, 0, 0);
  o.globalCompositeOperation = "source-in";
  o.fillStyle = S.ink;
  o.fillRect(0, 0, px, px);
  c.save();
  S.glow(c);
  c.drawImage(out, x - px / 2, y - px / 2);
  c.restore();
}

const HAND = {
  palm: [128, 172, 48, 54],
  fingers: [
    [96, 128, -0.2, 78, 22],
    [121, 122, -0.06, 92, 23],
    [146, 124, 0.08, 84, 22],
    [163, 141, 0.3, 70, 18],
    [86, 180, -0.95, 62, 25],
  ],
};
function gameHand(c, S, x, y, u) {
  const k = (u * 2.1) / 200;
  rasterOutline(c, S, x, y, u * 2.6, (g) => {
    g.scale(k, k);
    g.translate(-128, -150);
    const [px, py, rx, ry] = HAND.palm;
    g.beginPath();
    g.ellipse(px, py, rx, ry, 0, 0, TAU);
    g.fill();
    g.lineCap = "round";
    HAND.fingers.forEach(([fx, fy, angle, length, width]) => {
      g.lineWidth = width;
      g.beginPath();
      g.moveTo(fx, fy);
      g.lineTo(fx + Math.sin(angle) * length, fy - Math.cos(angle) * length);
      g.stroke();
    });
    g.beginPath();
    g.moveTo(128, 150);
    g.lineTo(163, 141);
    g.lineTo(175, 132);
    g.bezierCurveTo(178, 148, 179, 160, 176, 174);
    g.closePath();
    g.fill();
  });
}

function classicPaddle(g) {
  g.moveTo(0, -0.7);
  g.bezierCurveTo(-0.06, -0.7, -0.088, -0.69, -0.088, -0.64);
  g.bezierCurveTo(-0.088, -0.58, -0.062, -0.55, -0.06, -0.48);
  g.lineTo(-0.057, -0.12);
  g.bezierCurveTo(-0.056, 0.06, -0.3, 0.1, -0.31, 0.3);
  g.lineTo(-0.315, 0.9);
  g.bezierCurveTo(-0.315, 1.12, -0.2, 1.16, 0, 1.16);
  g.bezierCurveTo(0.2, 1.16, 0.315, 1.12, 0.315, 0.9);
  g.lineTo(0.31, 0.3);
  g.bezierCurveTo(0.3, 0.1, 0.056, 0.06, 0.057, -0.12);
  g.lineTo(0.06, -0.48);
  g.bezierCurveTo(0.062, -0.55, 0.088, -0.58, 0.088, -0.64);
  g.bezierCurveTo(0.088, -0.69, 0.06, -0.7, 0, -0.7);
  g.closePath();
}

const PADDLE_HOLES = [
  [-0.13, 0.6],
  [0.13, 0.6],
  [0, 0.71],
  [-0.13, 0.82],
  [0.13, 0.82],
  [0, 0.95],
];

function gamePaddle(c, S, x, y, u) {
  const k = u * 1.12;
  const m = new DOMMatrix()
    .translate(x, y)
    .rotate(24)
    .scale(k, -k)
    .translate(0, -0.23);
  const local = new Path2D();
  classicPaddle(local);
  const blade = new Path2D();
  blade.addPath(local, m);
  const marks = new Path2D();
  const detail = new Path2D();
  PADDLE_HOLES.forEach(([hx, hy]) => {
    detail.moveTo(hx + 0.045, hy);
    detail.arc(hx, hy, 0.045, 0, TAU);
  });
  for (let n = 0; n < 4; n += 1) {
    const gy = -0.58 + n * 0.12;
    detail.moveTo(-0.062, gy - 0.03);
    detail.lineTo(0.062, gy + 0.03);
  }
  detail.moveTo(-0.06, -0.14);
  detail.lineTo(0.06, -0.14);
  marks.addPath(detail, m);
  c.save();
  if (!S.lineOnly && S.wood) {
    c.fillStyle = S.wood;
    c.fill(blade);
  }
  inked(c, S);
  c.stroke(blade);
  c.stroke(marks);
  c.restore();
}

function drip(c, S, x, y, u) {
  drop(c, S, x, y - u * 0.05, u * 0.95);
}

function ringedPeach(c, S, x, y, u, P) {
  const rx = u * 1.2;
  const ry = u * 0.3;
  const tilt = -0.3;
  const size = u * 1.7;
  if (P) {
    const px = Math.ceil(u * 3.2);
    const back = document.createElement("canvas");
    back.width = px;
    back.height = px;
    const g = back.getContext("2d");
    g.translate(px / 2 - x, px / 2 - y);
    inked(g, S);
    g.shadowBlur = 0;
    g.beginPath();
    g.ellipse(x, y + u * 0.06, rx, ry, tilt, Math.PI, TAU);
    g.stroke();
    g.globalCompositeOperation = "destination-out";
    P.draw(g, "back", x, y, size * 1.04, { look: "#000000" });
    c.save();
    S.glow(c);
    c.drawImage(back, x - px / 2, y - px / 2);
    c.restore();
  }
  peachLine(c, S, P, x, y, size);
  c.save();
  inked(c, S);
  c.beginPath();
  c.ellipse(x, y + u * 0.06, rx, ry, tilt, 0, Math.PI);
  c.stroke();
  c.restore();
  sparkles(c, S, [
    [x + u * 1.05, y - u * 0.7, u * 0.13],
    [x - u * 1.0, y + u * 0.72, u * 0.1],
  ]);
}

const EMBLEMS = {
  cheeks: (c, S, x, y, k, P) => peachMark(c, S, x, y + 4 * k, 24 * k, P),
  hand: (c, S, x, y, k) => gameHand(c, S, x, y, 30 * k),
  veil: (c, S, x, y, k) => drapes(c, S, x, y, 30 * k),
  empress: (c, S, x, y, k) => crown(c, S, x, y + 2 * k, 26 * k),
  lovers: (c, S, x, y, k) => twinHearts(c, S, x, y, 34 * k),
  paddle: (c, S, x, y, k) => gamePaddle(c, S, x, y, 30 * k),
  firm: (c, S, x, y, k) => gauge(c, S, x, y, 30 * k),
  wheel: (c, S, x, y, k) => wheel(c, S, x, y, 29 * k),
  kiss: (c, S, x, y, k) => lips(c, S, x, y + 2 * k, 27 * k),
  oil: (c, S, x, y, k) => drip(c, S, x, y, 30 * k),
  star(c, S, x, y, k) {
    c.save();
    starShape(c, x, y, 28 * k);
    paint(c, S, S.moon);
    c.restore();
  },
  moon: (c, S, x, y, k) => crescentMark(c, S, x, y, 25 * k, 0.7),
  sun: (c, S, x, y, k) => sunDisc(c, S, x, y, 15 * k),
  world: (c, S, x, y, k, P) => ringedPeach(c, S, x, y, 30 * k, P),
};

const TARGET = 40;
const OPTICAL_FIT = {
  cheeks: 1.04,
  hand: 0.98,
  veil: 1,
  empress: 0.95,
  lovers: 1.02,
  paddle: 1.2,
  firm: 0.92,
  wheel: 0.95,
  kiss: 1.04,
  oil: 1.1,
  star: 1,
  moon: 0.97,
  sun: 0.97,
  world: 1.12,
};

const boxes = new WeakMap();

export function bounds(id, S, P) {
  if (!boxes.has(S)) boxes.set(S, {});
  const cache = boxes.get(S);
  if (cache[id]) return cache[id];
  const size = 240;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d", { willReadFrequently: true });
  EMBLEMS[id](g, { ...S, glow() {} }, size / 2, size / 2, 1, P);
  const { data } = g.getImageData(0, 0, size, size);
  let l = size;
  let r = 0;
  let t = size;
  let b = 0;
  for (let y = 0; y < size; y += 1)
    for (let x = 0; x < size; x += 1)
      if (data[(y * size + x) * 4 + 3] > 40) {
        l = Math.min(l, x);
        r = Math.max(r, x);
        t = Math.min(t, y);
        b = Math.max(b, y);
      }
  cache[id] =
    r < l
      ? null
      : {
          w: r - l + 1,
          h: b - t + 1,
          cx: (l + r) / 2 - size / 2,
          cy: (t + b) / 2 - size / 2,
        };
  return cache[id];
}

export function fitSymbol(c, id, S, x, y, boxW, boxH, P) {
  const box = bounds(id, S, P);
  if (!box) return;
  const mass = Math.sqrt(box.w * box.h);
  const k = Math.min(
    (TARGET / mass) * (OPTICAL_FIT[id] ?? 1),
    boxW / box.w,
    boxH / box.h,
  );
  EMBLEMS[id](c, S, x - box.cx * k, y - box.cy * k, k, P);
}
