// The peach model's height range projected onto the intro renders, as a share of the image height.
const RENDER_TOP = 0.2655;
const RENDER_BOTTOM = 0.7345;
const SLOSH_MODES = 8;

// Work in a 1000-unit square so tuning numbers do not depend on the canvas size.
const S = 1000;
const TOP = RENDER_TOP * S;
const H = (RENDER_BOTTOM - RENDER_TOP) * S;
const CENTRE = ((RENDER_TOP + RENDER_BOTTOM) / 2) * S;

// Loading steps that arrive within the gap join into one bigger gulp.
const GULP_GAP = 0.9;
const STRETCH_SECONDS = 0.11;
const SURGE_DELAY = 0.09;
const QUIET_SECONDS = 0.9;
const DRIPS_PER_SECOND = 2.2;
const LEVEL_HZ = 1.7;
// The live peach's squash spring, so the still bounces the same way.
const SQUASH_STIFFNESS = 248;
const SQUASH_DAMPING = 6;
const COUPLE = 0.6;
const SWAY_HZ = 0.6;
const SETTLE = 0.15;
const PUSH = 1.5 * 0.055;
const SUB = 1 / 240;
// A slow push on the three longest waves, a little off their own pace, so the surface never settles flat.
const AMBIENT = [0, 0.09, 0.12, 0.12];
const AMBIENT_PACE = [0, 0.9, 0.75, 0.7];
// When loading reports nothing for a while, the peach keeps sipping a little ahead, never more than a share of what is left.
const SIP_AFTER = 1.2;
const SIP_RATE = 0.02;
const SIP_MAX = 0.08;
const FEATHER = [
  [4.5, 0.12],
  [3, 0.3],
  [1.5, 0.55],
  [0, 1],
];
const EDGE_ROWS = 14;

// The fill reaches the top of the body only at 1, so the last gulp is the one that fills it.
const lineLevel = (shown) => shown * 1.02 - 0.02;

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Green pixels are leaf, and so are dark pixels next to them (the midrib and the shaded side).
function leafMask(data, size) {
  const count = size * size;
  const green = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const k = i * 4;
    green[i] =
      smooth(18, 45, data[k + 1] - data[k + 2]) *
      (1 - smooth(35, 60, data[k] - data[k + 1]));
  }
  const reach = Math.round(size / 85);
  const across = new Float32Array(count);
  const near = new Float32Array(count);
  for (let y = 0; y < size; y += 1)
    for (let x = 0; x < size; x += 1) {
      let v = 0;
      const end = Math.min(size - 1, x + reach);
      for (let k = Math.max(0, x - reach); k <= end; k += 1)
        v = Math.max(v, green[y * size + k]);
      across[y * size + x] = v;
    }
  for (let y = 0; y < size; y += 1)
    for (let x = 0; x < size; x += 1) {
      let v = 0;
      const end = Math.min(size - 1, y + reach);
      for (let k = Math.max(0, y - reach); k <= end; k += 1)
        v = Math.max(v, across[k * size + x]);
      near[y * size + x] = v;
    }
  const mask = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const k = i * 4;
    const lum = 0.3 * data[k] + 0.59 * data[k + 1] + 0.11 * data[k + 2];
    mask[i] = Math.max(green[i], near[i] * (1 - smooth(70, 120, lum)));
  }
  return mask;
}

function skinEdges(data, mask, size) {
  const scale = S / size;
  const left = new Float32Array(S).fill(-1);
  const right = new Float32Array(S).fill(-1);
  for (let y = 0; y < size; y += 1) {
    let l = -1;
    let r = -1;
    for (let x = 0; x < size; x += 1) {
      const i = y * size + x;
      if (data[i * 4 + 3] > 128 && mask[i] < 0.5) {
        if (l < 0) l = x;
        r = x;
      }
    }
    const end = Math.floor((y + 1) * scale);
    for (let row = Math.floor(y * scale); row < end; row += 1) {
      left[row] = l < 0 ? -1 : l * scale;
      right[row] = r < 0 ? -1 : r * scale;
    }
  }
  // Averaged over nearby rows, the span grows smoothly past the two top lobes and the stem.
  const average = (src) =>
    src.map((v, y) => {
      if (v < 0) return -1;
      let sum = 0;
      let count = 0;
      for (let k = -EDGE_ROWS; k <= EDGE_ROWS; k += 1) {
        const w = src[y + k];
        if (w !== undefined && w >= 0) {
          sum += w;
          count += 1;
        }
      }
      return sum / count;
    });
  return { left: average(left), right: average(right) };
}

export default class Gulp {
  constructor({ makeCanvas, calm = 1 }) {
    this.makeCanvas = makeCanvas;
    this.calm = calm;
    this.ready = false;
    this.grey = null;
    this.body = null;
    this.edges = null;
    this.layer = null;
    this.shown = 0;
    this.velocity = 0;
    this.target = 0;
    this.loaded = 0;
    this.real = 0;
    this.progressAt = 0;
    this.pendingJump = 0;
    this.gulpTarget = 0;
    this.gulpJump = 0;
    this.lastGulp = -Infinity;
    this.squashAt = null;
    this.squashKick = 0;
    this.surgeAt = null;
    this.dripsFrom = 0;
    this.side = 1;
    this.squash = 0;
    this.squashVel = 0;
    this.squashAcc = 0;
    this.modes = new Float64Array(SLOSH_MODES + 1);
    this.modeVel = new Float64Array(SLOSH_MODES + 1);
    this.span = null;
    this.clock = 0;
    this.acc = 0;
    this.stretches = 0;
    this.squashes = 0;
    this.full = false;
    this.holdUntil = 0;
  }

  holdGulps(seconds) {
    this.holdUntil = this.clock + seconds;
  }

  // Without the ripe image the level still rises over a plain span, so loading can finish.
  setImages(ripe, grey) {
    if (ripe) {
      const size = 512;
      const sample = this.makeCanvas(size, size);
      const g = sample.getContext("2d", { willReadFrequently: true });
      g.drawImage(ripe, 0, 0, size, size);
      const { data } = g.getImageData(0, 0, size, size);
      const mask = leafMask(data, size);
      this.edges = skinEdges(data, mask, size);
      const cut = this.makeCanvas(size, size);
      const cg = cut.getContext("2d");
      const cutImage = cg.createImageData(size, size);
      for (let i = 0; i < mask.length; i += 1)
        cutImage.data[i * 4 + 3] = mask[i] * 255;
      cg.putImageData(cutImage, 0, 0);
      this.body = this.makeCanvas(ripe.width, ripe.height);
      const bg = this.body.getContext("2d");
      bg.drawImage(ripe, 0, 0);
      bg.globalCompositeOperation = "destination-out";
      bg.drawImage(cut, 0, 0, ripe.width, ripe.height);
    }
    this.grey = grey ?? null;
    this.ready = true;
  }

  rawSpan() {
    if (!this.edges) return [S * 0.25, S * 0.75];
    const row = Math.round(TOP + H * (1 - lineLevel(this.shown)));
    if (row < 0 || row >= S) return null;
    const { left, right } = this.edges;
    if (left[row] < 0 || right[row] - left[row] < 20) return null;
    return [left[row], right[row]];
  }

  followSpan(dt) {
    const raw = this.rawSpan();
    if (!raw) return;
    if (!this.span) {
      this.span = raw;
      return;
    }
    const k = Math.min(1, dt * 5);
    this.span[0] += (raw[0] - this.span[0]) * k;
    this.span[1] += (raw[1] - this.span[1]) * k;
  }

  poke(x, amount, width = 0.07) {
    if (!this.span) return;
    const [L, R] = this.span;
    const t0 = (x - L) / (R - L);
    const w = (width * H) / (R - L);
    for (let n = 1; n <= SLOSH_MODES; n += 1) {
      const k = n * Math.PI;
      this.modeVel[n] -=
        amount * PUSH * Math.cos(k * t0) * Math.exp(-((k * w) ** 2) / 4);
    }
  }

  // Slosh modes rise in frequency with the square root of the mode, like deep water, and short waves die fastest.
  simulate(dt) {
    this.squashAcc =
      -SQUASH_STIFFNESS * this.squash - SQUASH_DAMPING * this.squashVel;
    this.squashVel += this.squashAcc * dt;
    this.squash += this.squashVel * dt;
    const base = Math.PI * 2 * SWAY_HZ;
    for (let n = 1; n <= SLOSH_MODES; n += 1) {
      const omega = base * Math.sqrt(n);
      const zeta = Math.min(0.95, SETTLE * (1 + 0.35 * (n - 1) ** 2));
      let force =
        -omega * omega * this.modes[n] - 2 * zeta * omega * this.modeVel[n];
      if (n === 2) force += COUPLE * this.squashAcc;
      if (n === 1) force += COUPLE * 0.4 * this.side * this.squashAcc;
      if (n < AMBIENT.length)
        force +=
          AMBIENT[n] *
          (1 - this.shown ** 8) *
          Math.sin(omega * AMBIENT_PACE[n] * this.clock + n * 1.7);
      this.modeVel[n] += force * dt;
      this.modes[n] += this.modeVel[n] * dt;
    }
  }

  sloshAt(x) {
    if (!this.span) return 0;
    const [L, R] = this.span;
    const t = Math.min(1, Math.max(0, (x - L) / (R - L)));
    let y = 0;
    for (let n = 1; n <= SLOSH_MODES; n += 1)
      y += this.modes[n] * Math.cos(n * Math.PI * t);
    return y;
  }

  surfaceY(x, time) {
    const across = (x - S / 2) / H;
    const tilt = Math.sin(time * 1.4) * 0.02 * across;
    return TOP + H * (1 - (lineLevel(this.shown) + tilt + this.sloshAt(x)));
  }

  // The peach stretches, then squashes, and the juice rises on the rebound, so the squash reads as the cause.
  step(delta, loaded) {
    if (!this.ready || delta <= 0) return;
    this.clock += delta;
    if (loaded > this.real) {
      this.real = loaded;
      this.progressAt = this.clock;
    }
    const waiting = this.clock - this.progressAt - SIP_AFTER;
    const sip =
      waiting > 0
        ? Math.min(SIP_RATE * waiting, SIP_MAX, (1 - this.real) * 0.3)
        : 0;
    if (this.real + sip > this.loaded) {
      this.pendingJump += this.real + sip - this.loaded;
      this.loaded = this.real + sip;
    }
    if (
      this.pendingJump > 0.0005 &&
      this.clock - this.lastGulp >= GULP_GAP &&
      this.clock >= this.holdUntil
    ) {
      const jump = this.pendingJump;
      const kick = (0.3 * Math.min(1, jump / 0.04) + jump * 1.1) * this.calm;
      this.squashVel -= kick * 0.3;
      this.squashAt = this.clock + STRETCH_SECONDS;
      this.squashKick = kick;
      this.surgeAt = this.squashAt + SURGE_DELAY;
      this.gulpTarget = this.loaded;
      this.gulpJump = this.pendingJump;
      this.pendingJump = 0;
      this.lastGulp = this.clock;
      this.side *= -1;
      this.stretches += 1;
    }
    if (this.squashAt !== null && this.clock >= this.squashAt) {
      this.squashAt = null;
      this.squashVel += this.squashKick;
      this.squashes += 1;
    }
    if (this.surgeAt !== null && this.clock >= this.surgeAt) {
      this.surgeAt = null;
      this.target = this.gulpTarget;
      if (this.target >= 1) this.full = true;
      this.dripsFrom = this.clock + QUIET_SECONDS;
      if (this.span) {
        const [L, R] = this.span;
        this.poke(
          L + (R - L) * (0.25 + Math.random() * 0.5),
          0.9 + this.gulpJump * 4,
        );
      }
    }
    if (
      this.shown < 1 &&
      this.span &&
      this.clock >= this.dripsFrom &&
      Math.random() < delta * DRIPS_PER_SECOND
    ) {
      const [L, R] = this.span;
      this.poke(L + Math.random() * (R - L), 0.12 + Math.random() * 0.12, 0.05);
    }
    const w = Math.PI * 2 * LEVEL_HZ;
    this.velocity +=
      (w * w * (this.target - this.shown) - 2 * w * this.velocity) * delta;
    this.shown += this.velocity * delta;
    if (this.target >= 1 && this.shown >= 0.995) {
      this.shown = 1;
      this.velocity = 0;
    }
    this.followSpan(delta);
    this.acc = Math.min(0.1, this.acc + delta);
    while (this.acc >= SUB) {
      this.simulate(SUB);
      this.acc -= SUB;
    }
  }

  snapshot() {
    const span = this.span
      ? [(this.span[0] - S / 2) / H, (this.span[1] - S / 2) / H]
      : [-0.6, 0.6];
    return {
      shown: this.shown,
      velocity: this.velocity,
      modes: Array.from(this.modes.subarray(1)),
      span,
      stretches: this.stretches,
      squashes: this.squashes,
      kick: this.squashKick,
      squash: this.squash,
      squashVel: this.squashVel,
      full: this.full,
    };
  }

  draw(context, size, time) {
    if (!this.ready || !size) return;
    const k = size / S;
    if (!this.layer || this.layer.width !== size)
      this.layer = this.makeCanvas(size, size);
    const layer = this.layer.getContext("2d");
    const s = Math.max(-0.35, Math.min(0.35, this.squash));
    const view = (g) => {
      g.setTransform(k, 0, 0, k, 0, 0);
      g.translate(S / 2, CENTRE);
      g.scale(1 + s * 0.5, 1 - s);
      g.translate(-S / 2, -CENTRE);
    };
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, size, size);
    view(context);
    if (this.grey) context.drawImage(this.grey, 0, 0, S, S);
    if (!this.body) return;

    layer.setTransform(1, 0, 0, 1, 0, 0);
    layer.globalCompositeOperation = "source-over";
    layer.clearRect(0, 0, size, size);
    view(layer);
    layer.fillStyle = "#000";
    FEATHER.forEach(([lift, alpha]) => {
      layer.beginPath();
      layer.moveTo(0, S);
      for (let x = 0; x <= S; x += S / 160)
        layer.lineTo(x, this.surfaceY(x, time) - lift);
      layer.lineTo(S, S);
      layer.closePath();
      layer.globalAlpha = alpha;
      layer.fill();
    });
    layer.globalAlpha = 1;
    layer.globalCompositeOperation = "source-in";
    layer.drawImage(this.body, 0, 0, S, S);
    // A touch deeper towards the bottom, so it reads as liquid.
    layer.globalCompositeOperation = "source-atop";
    const top = this.surfaceY(S / 2, time);
    const bottom = RENDER_BOTTOM * S;
    const shade = layer.createLinearGradient(0, top - 10, 0, bottom);
    shade.addColorStop(0.6, "rgba(120, 20, 50, 0)");
    shade.addColorStop(1, "rgba(120, 20, 50, 0.16)");
    layer.fillStyle = shade;
    layer.fillRect(0, top - 40, S, bottom - top + 80);
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.drawImage(this.layer, 0, 0);
  }
}
