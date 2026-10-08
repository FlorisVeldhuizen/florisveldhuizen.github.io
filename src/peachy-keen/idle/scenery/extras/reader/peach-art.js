/* eslint-disable no-param-reassign -- painters set state on the canvas context they are given */
const RAMPS = {
  skin: [
    [0, [46, 10, 38]],
    [0.3, [122, 32, 70]],
    [0.58, [214, 98, 108]],
    [0.8, [248, 168, 134]],
    [1, [255, 232, 196]],
  ],
  leaf: [
    [0, [40, 26, 20]],
    [0.5, [150, 120, 60]],
    [1, [240, 214, 140]],
  ],
  gold: [
    [0, [92, 54, 22]],
    [0.45, [200, 150, 70]],
    [0.8, [244, 207, 142]],
    [1, [255, 244, 214]],
  ],
};

function ramp(stops, t, out) {
  let k = 1;
  while (k < stops.length - 1 && stops[k][0] < t) k += 1;
  const [t0, a] = stops[k - 1];
  const [t1, b] = stops[k];
  const f = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  out[0] = a[0] + (b[0] - a[0]) * f;
  out[1] = a[1] + (b[1] - a[1]) * f;
  out[2] = a[2] + (b[2] - a[2]) * f;
}

function blur(src, w, h, r) {
  const tmp = new Float32Array(src.length);
  const out = new Float32Array(src.length);
  for (let y = 0; y < h; y += 1) {
    let acc = 0;
    for (let x = -r; x <= r; x += 1)
      acc += src[y * w + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x += 1) {
      tmp[y * w + x] = acc / (2 * r + 1);
      acc +=
        src[y * w + Math.min(w - 1, x + r + 1)] -
        src[y * w + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < w; x += 1) {
    let acc = 0;
    for (let y = -r; y <= r; y += 1)
      acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y += 1) {
      out[y * w + x] = acc / (2 * r + 1);
      acc +=
        tmp[Math.min(h - 1, y + r + 1) * w + x] -
        tmp[Math.max(0, y - r) * w + x];
    }
  }
  return out;
}

function measure(src) {
  const w = src.width;
  const h = src.height;
  const { data } = src.pixels;
  const lum = new Float32Array(w * h);
  const alpha = new Float32Array(w * h);
  const leaf = new Uint8Array(w * h);
  let sx = 0;
  let sy = 0;
  let sum = 0;
  let lo = 1;
  let hi = 0;
  for (let k = 0; k < w * h; k += 1) {
    const i = k * 4;
    const a = data[i + 3] / 255;
    alpha[k] = a;
    if (a >= 0.02) {
      const l = (0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2]) / 255;
      lum[k] = l;
      lo = Math.min(lo, l);
      hi = Math.max(hi, l);
      leaf[k] = data[i + 1] - data[i] > 8 ? 1 : 0;
      if (!leaf[k]) {
        sx += (k % w) * a;
        sy += Math.floor(k / w) * a;
        sum += a;
      }
    }
  }
  const span = Math.max(0.05, hi - lo);
  for (let k = 0; k < w * h; k += 1)
    if (alpha[k] > 0.02) lum[k] = (lum[k] - lo) / span;
  const soft = blur(lum, w, h, Math.max(2, Math.round((7 * w) / 320)));
  const fine = blur(lum, w, h, Math.max(1, Math.round((3 * w) / 320)));
  return {
    w,
    h,
    data,
    lum,
    soft,
    fine,
    alpha,
    leaf,
    cx: sx / sum / w,
    cy: sy / sum / h,
    area: sum / (w * h),
  };
}

function canvasOf(info, fill) {
  const out = document.createElement("canvas");
  out.width = info.w;
  out.height = info.h;
  const c = out.getContext("2d");
  const img = c.createImageData(info.w, info.h);
  const rgb = [0, 0, 0];
  for (let y = 0; y < info.h; y += 1)
    for (let x = 0; x < info.w; x += 1) {
      const k = y * info.w + x;
      const a = fill(k, x, y, rgb);
      if (a > 0) {
        img.data.set(rgb, k * 4);
        img.data[k * 4 + 3] = a * 255;
      }
    }
  c.putImageData(img, 0, 0);
  return out;
}

const smoothstep = (t) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

function valley(info, k, depth) {
  return smoothstep((info.soft[k] - info.lum[k] - depth) / 0.04);
}

function edge(info, x, y) {
  const { w, h, alpha } = info;
  const a = alpha[y * w + x];
  if (a < 0.5) return 0;
  for (let dy = -2; dy <= 2; dy += 1)
    for (let dx = -2; dx <= 2; dx += 1) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h || alpha[ny * w + nx] < 0.5)
        return 1;
    }
  return 0;
}

const TREAT = {
  mark(info) {
    const line = TREAT.line(info);
    const out = document.createElement("canvas");
    out.width = info.w;
    out.height = info.h;
    const c = out.getContext("2d");
    for (let a = 0; a < 16; a += 1) {
      const t = (a / 16) * Math.PI * 2;
      c.drawImage(line, Math.cos(t) * 2.5, Math.sin(t) * 2.5);
    }
    line.width = 0;
    return out;
  },
  skin(info) {
    return canvasOf(info, (k, x, y, rgb) => {
      if (info.alpha[k] < 0.02) return 0;
      const l = smoothstep(info.lum[k]);
      ramp(info.leaf[k] ? RAMPS.leaf : RAMPS.skin, l, rgb);
      if (l < 0.5) {
        const line = Math.sin((x + y * 0.55 + Math.sin(y * 0.045) * 9) * 0.85);
        const m = 1 - (0.5 - l) * 0.7 * (line > 0.55 ? 1 : 0);
        rgb[0] *= m;
        rgb[1] *= m;
        rgb[2] *= m;
      }
      return info.alpha[k];
    });
  },
  gold(info) {
    return canvasOf(info, (k, x, y, rgb) => {
      if (info.alpha[k] < 0.02) return 0;
      ramp(RAMPS.gold, smoothstep(info.lum[k]), rgb);
      return info.alpha[k];
    });
  },
  line(info) {
    return canvasOf(info, (k, x, y, rgb) => {
      if (info.alpha[k] < 0.02) return 0;
      const ridge = smoothstep((info.fine[k] - info.lum[k] - 0.012) / 0.03);
      const v = Math.max(
        edge(info, x, y),
        ridge * valley(info, k, info.leaf[k] ? 0.04 : 0.01),
      );
      rgb[0] = 246;
      rgb[1] = 212;
      rgb[2] = 150;
      return v;
    });
  },
};

function tinted(src, fill) {
  const out = document.createElement("canvas");
  out.width = src.width;
  out.height = src.height;
  const c = out.getContext("2d");
  c.drawImage(src, 0, 0);
  c.globalCompositeOperation = "source-in";
  c.fillStyle = fill;
  c.fillRect(0, 0, out.width, out.height);
  return out;
}

function atlasOf(plan) {
  let x = 0;
  let y = 0;
  let row = 0;
  const max = 960;
  const rects = plan.map(([, , size]) => {
    if (x + size > max) {
      x = 0;
      y += row;
      row = 0;
    }
    const r = { sx: x, sy: y, s: size };
    x += size;
    row = Math.max(row, size);
    return r;
  });
  const canvas = document.createElement("canvas");
  canvas.width = max;
  canvas.height = y + row;
  const c = canvas.getContext("2d");
  c.imageSmoothingQuality = "high";
  const cells = {};
  return {
    canvas,
    cells,
    bake(k, img) {
      const [pose, key] = plan[k];
      const r = rects[k];
      c.drawImage(img, r.sx, r.sy, r.s, r.s);
      img.width = 0;
      cells[`${pose}|${key}`] = r;
    },
  };
}

export default function makePeachArt(plan, render) {
  const art = {};
  const make = (pose, key) => {
    const a = art[pose];
    return key.startsWith("#") ? tinted(a.src, key) : TREAT[key](a.info);
  };
  const atlas = atlasOf(plan);
  const jobs = [];
  [...new Set(plan.map(([pose]) => pose))].forEach((pose) => {
    jobs.push(() => render.draw(pose));
    jobs.push(() => render.fetch());
    jobs.push(() => (render.ready() ? render.collect() : false));
    jobs.push(() => {
      art[pose] = { src: render.read() };
    });
    jobs.push(() => {
      art[pose].info = measure(art[pose].src);
    });
    plan.forEach(([p, key], k) => {
      if (p === pose) jobs.push(() => atlas.bake(k, make(p, key)));
    });
    jobs.push(() => {
      const a = art[pose];
      const { cx, cy, area } = a.info;
      a.info = { cx, cy, area };
      a.src.width = 0;
      a.src.pixels = null;
      a.src = null;
    });
  });
  const blit = (c, pose, key, x, y, w, h) => {
    const r = atlas.cells[`${pose}|${key}`];
    if (r) c.drawImage(atlas.canvas, r.sx, r.sy, r.s, r.s, x, y, w, h);
  };
  const place = (pose, x, y, size) => {
    const { info } = art[pose];
    return [x - info.cx * size, y - info.cy * size];
  };
  return {
    jobs,
    info: (pose) => art[pose].info,
    dispose() {
      atlas.canvas.width = 0;
    },
    draw(c, pose, x, y, size, { look = "skin", rim, rimWidth = 1.3 } = {}) {
      const [left, top] = place(pose, x, y, size);
      if (rim) {
        const steps = Math.max(8, Math.round(rimWidth * 6));
        for (let a = 0; a < steps; a += 1) {
          const t = (a / steps) * Math.PI * 2;
          blit(
            c,
            pose,
            rim,
            left + Math.cos(t) * rimWidth,
            top + Math.sin(t) * rimWidth,
            size,
            size,
          );
        }
      }
      blit(c, pose, look, left, top, size, size);
    },
    gold(c, pose, x, y, size) {
      const [left, top] = place(pose, x, y, size);
      c.save();
      c.shadowColor = "rgba(255, 205, 140, 0.55)";
      c.shadowBlur = 10;
      blit(c, pose, "gold", left, top, size, size);
      c.restore();
    },
  };
}
