/* eslint-disable no-param-reassign -- painters set state on the canvas context they are given */
export const TAU = Math.PI * 2;

export function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

const tiles = new Map();

function grainTile(amount, light, dark) {
  const key = `${amount}|${light}|${dark}`;
  if (tiles.has(key)) return tiles.get(key);
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const c = canvas.getContext("2d");
  const img = c.createImageData(size, size);
  const d = img.data;
  let seed = 7;
  for (let k = 0; k < d.length; k += 4) {
    seed = (seed * 16807) % 2147483647;
    const n = (seed / 2147483647 - 0.5) * amount;
    const t = n > 0 ? light : dark;
    d[k] = t;
    d[k + 1] = t;
    d[k + 2] = t;
    d[k + 3] = Math.round(Math.abs(n) * 255);
  }
  c.putImageData(img, 0, 0);
  tiles.set(key, canvas);
  return canvas;
}

export function grain(c, w, h, amount, light = 255, dark = 0) {
  c.save();
  c.fillStyle = c.createPattern(grainTile(amount, light, dark), "repeat");
  c.fillRect(0, 0, w, h);
  c.restore();
}

export function star(c, x, y, r, points = 4, inner = 0.28) {
  c.beginPath();
  for (let k = 0; k < points * 2; k += 1) {
    const a = (k / (points * 2)) * TAU - Math.PI / 2;
    const d = k % 2 ? r * inner : r;
    c.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
  }
  c.closePath();
}

export function sparkle(c, S, list) {
  c.save();
  c.fillStyle = S.spark;
  S.glow(c);
  list.forEach(([x, y, r]) => {
    star(c, x, y, r);
    c.fill();
  });
  c.restore();
}

export function heartPath(c, x, y, s) {
  c.beginPath();
  c.moveTo(x, y + s * 0.85);
  c.bezierCurveTo(
    x - s * 1.15,
    y + s * 0.1,
    x - s * 0.75,
    y - s * 0.85,
    x,
    y - s * 0.25,
  );
  c.bezierCurveTo(
    x + s * 0.75,
    y - s * 0.85,
    x + s * 1.15,
    y + s * 0.1,
    x,
    y + s * 0.85,
  );
  c.closePath();
}

function heart(c, S, x, y, s) {
  c.save();
  heartPath(c, x, y, s);
  c.fillStyle = S.blush;
  S.glow(c);
  c.fill();
  c.lineWidth = S.lw * 0.8;
  c.strokeStyle = S.ink;
  c.stroke();
  c.restore();
}

export function lips(c, S, x, y, s) {
  c.save();
  c.translate(x, y);
  c.beginPath();
  c.moveTo(-s, 0);
  c.bezierCurveTo(-s * 0.7, -s * 0.5, -s * 0.25, -s * 0.62, 0, -s * 0.3);
  c.bezierCurveTo(s * 0.25, -s * 0.62, s * 0.7, -s * 0.5, s, 0);
  c.bezierCurveTo(s * 0.6, s * 0.7, -s * 0.6, s * 0.7, -s, 0);
  c.closePath();
  c.fillStyle = S.lips;
  S.glow(c);
  c.fill();
  c.lineWidth = S.lw;
  c.strokeStyle = S.ink;
  c.stroke();
  c.beginPath();
  c.moveTo(-s * 0.95, 0);
  c.bezierCurveTo(-s * 0.4, s * 0.12, s * 0.4, s * 0.12, s * 0.95, 0);
  c.stroke();
  c.restore();
}

export function rays(c, S, x, y, r0, r1, count) {
  c.save();
  c.strokeStyle = S.ink;
  c.lineWidth = S.lw * 0.7;
  c.lineCap = "round";
  S.glow(c);
  for (let k = 0; k < count; k += 1) {
    const a = (k / count) * TAU;
    const long = k % 2 ? 0.8 : 1;
    c.beginPath();
    c.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0);
    c.lineTo(x + Math.cos(a) * r1 * long, y + Math.sin(a) * r1 * long);
    c.stroke();
  }
  c.restore();
}

export function crown(c, S, x, y, s) {
  c.save();
  c.beginPath();
  c.moveTo(x - s, y + s * 0.45);
  c.lineTo(x - s * 1.08, y - s * 0.45);
  c.lineTo(x - s * 0.5, y);
  c.lineTo(x, y - s * 0.7);
  c.lineTo(x + s * 0.5, y);
  c.lineTo(x + s * 1.08, y - s * 0.45);
  c.lineTo(x + s, y + s * 0.45);
  c.closePath();
  c.fillStyle = S.gold;
  S.glow(c);
  c.fill();
  c.lineWidth = S.lw * 0.8;
  c.strokeStyle = S.ink;
  c.stroke();
  c.fillStyle = S.blush;
  [
    [-1.08, -0.45],
    [0, -0.7],
    [1.08, -0.45],
  ].forEach(([dx, dy]) => {
    c.beginPath();
    c.arc(x + dx * s, y + dy * s - s * 0.12, s * 0.13, 0, TAU);
    c.fill();
  });
  c.restore();
}

export function wheel(c, S, x, y, r) {
  c.save();
  c.strokeStyle = S.ink;
  c.lineWidth = S.lw * 1.3;
  S.glow(c);
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.stroke();
  c.lineWidth = S.lw * 0.6;
  c.beginPath();
  c.arc(x, y, r * 0.84, 0, TAU);
  c.stroke();
  for (let k = 0; k < 8; k += 1) {
    const a = (k / 8) * TAU;
    c.beginPath();
    c.moveTo(x + Math.cos(a) * r * 0.42, y + Math.sin(a) * r * 0.42);
    c.lineTo(x + Math.cos(a) * r * 0.84, y + Math.sin(a) * r * 0.84);
    c.stroke();
  }
  c.restore();
  for (let k = 0; k < 8; k += 1) {
    const a = (k / 8) * TAU + Math.PI / 8;
    heart(
      c,
      S,
      x + Math.cos(a) * r * 0.92,
      y + Math.sin(a) * r * 0.92,
      r * 0.06,
    );
  }
}
