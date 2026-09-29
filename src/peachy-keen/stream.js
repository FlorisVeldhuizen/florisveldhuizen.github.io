import { clamp, ease, reducedMotion } from "./util";

const GRAVITY = 2400;
const EMIT_RATE = 120;
const LIP_SPEED = 70;
const INHERIT = 0.6;
const MAX_INHERIT = 550;
const AIR_DRAG = 4;
const WIDTH = 3.2;
const SLOW_SPEED = 120;
const DRIPS = 3;
const RIPPLES = 4;
const STIFFNESS = 40;
const MAX_GAP = 14;
const BEAD = 12;
const FLUNG_INHERIT = 0.7;
const LENS_CHANCE = 0.3;
const NEAR_SCALE = 7;
const FLAT = 0.34;
const MIN_SQUASH = 0.2;
const SVG_NS = "http://www.w3.org/2000/svg";

function shape(tag, className, parent) {
  const el = document.createElementNS(SVG_NS, tag);
  el.setAttribute("class", className);
  parent.appendChild(el);
  return el;
}

function place(el, x, y, rx, ry) {
  el.setAttribute("cx", x.toFixed(2));
  el.setAttribute("cy", y.toFixed(2));
  el.setAttribute("rx", Math.max(0, rx).toFixed(2));
  el.setAttribute("ry", Math.max(0, ry).toFixed(2));
}

const fmt = (v) => v.toFixed(2);

function turn(el, degrees, x, y) {
  el.setAttribute("transform", `rotate(${fmt(degrees)} ${fmt(x)} ${fmt(y)})`);
}

const circle = (x, y, r) =>
  `M ${fmt(x - r)} ${fmt(y)} a ${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(r * 2)} 0 a ${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(-r * 2)} 0 Z `;

const drawn = new WeakMap();
function setPath(el, d) {
  if (drawn.get(el) === d) return;
  drawn.set(el, d);
  el.setAttribute("d", d);
}

function smooth(points, command) {
  let d = `${command} ${fmt(points[0][0])} ${fmt(points[0][1])}`;
  for (let i = 1; i < points.length - 1; i += 1) {
    const [x, y] = points[i];
    const [nx, ny] = points[i + 1];
    d += ` Q ${fmt(x)} ${fmt(y)} ${fmt((x + nx) / 2)} ${fmt((y + ny) / 2)}`;
  }
  const last = points[points.length - 1];
  return `${d} L ${fmt(last[0])} ${fmt(last[1])}`;
}

const offset = (points, amount) =>
  points.map(([x, y, w, nx, ny]) => [x + nx * w * amount, y + ny * w * amount]);

function halfWidth(p) {
  const speed = Math.hypot(p.vx, p.vy);
  const thin = Math.sqrt(SLOW_SPEED / Math.max(SLOW_SPEED, speed));
  return Math.max(0.45, p.w * thin);
}

function pulse(time) {
  if (reducedMotion.matches) return 1;
  return 1 + 0.13 * Math.sin(time * 9) + 0.07 * Math.sin(time * 47);
}

export default class OilStream {
  constructor(el) {
    this.el = el;
    this.ripples = Array.from({ length: RIPPLES }, () => ({
      el: shape("ellipse", "stream-ripple", el),
      age: 1,
      x: 0,
      y: 0,
      size: 0,
    }));
    this.poolEl = shape("ellipse", "stream-pool", el);
    this.poolShine = shape("ellipse", "stream-shine-fill", el);
    this.body = shape("path", "stream-oil", el);
    this.shade = shape("path", "stream-shade", el);
    this.shine = shape("path", "stream-shine", el);
    this.drips = Array.from({ length: DRIPS }, () => ({
      el: shape("ellipse", "stream-oil", el),
      shine: shape("ellipse", "stream-shine-fill", el),
      active: false,
      x: 0,
      y: 0,
      vy: 0,
      r: 0,
      hang: 0,
    }));
    this.flungEl = shape("path", "stream-oil", el);
    this.flungShine = shape("path", "stream-shine-fill", el);
    this.flung = [];
    this.onLens = null;
    this.particles = [];
    this.pending = [];
    this.run = 0;
    this.pieces = 0;
    this.emitting = false;
    this.carry = 0;
    this.spout = null;
    this.spoutVelocity = { x: 0, y: 0 };
    this.floor = Infinity;
    this.impact = null;
    this.pool = { x: 0, y: 0, size: 0, bump: 0, tilt: 0, squash: FLAT };
    this.time = 0;
    this.delta = 1 / 60;
  }

  get active() {
    return (
      this.particles.length > 0 ||
      this.flung.length > 0 ||
      this.pool.size > 0.2 ||
      this.pending.length > 0 ||
      this.drips.some((d) => d.active) ||
      this.ripples.some((r) => r.age < 1)
    );
  }

  eachStreak(visit) {
    this.runs().forEach((run) => {
      if (run.points.length === 1) {
        const p = run.points[0];
        const r = halfWidth(p);
        if (p.y < this.floor)
          visit([
            [p.x, p.y - r, r],
            [p.x, p.y + r, r],
          ]);
        return;
      }
      const outline = this.outline(
        run.points,
        run.id === this.run && this.emitting,
      );
      if (outline) visit(outline.middle);
    });
    this.drips.forEach((d) => {
      if (!d.active) return;
      const tail = d.r * (1 + clamp(d.vy / 900, 0, 0.5));
      visit([
        [d.x, d.y - tail, d.r],
        [d.x, d.y + tail, d.r],
      ]);
    });
  }

  update(spout, angle, landing, pour, delta) {
    this.time += delta;
    this.delta = delta;
    if (landing !== undefined)
      this.floor = landing ? landing.y : window.innerHeight + 40;
    if (landing?.tilt !== undefined) {
      const k = ease(16, delta);
      this.pool.tilt += (landing.tilt - this.pool.tilt) * k;
      this.pool.squash += (landing.squash - this.pool.squash) * k;
    }
    if (spout && this.spout) {
      const k = ease(8, delta);
      const step = Math.max(delta, 1 / 60);
      const v = this.spoutVelocity;
      v.x += ((spout.x - this.spout.x) / step - v.x) * k;
      v.y += ((spout.y - this.spout.y) / step - v.y) * k;
    }
    const previous = this.spout;
    if (spout) this.spout = { x: spout.x, y: spout.y };

    const flowing = !!spout && pour > 0.05;
    if (flowing && !this.emitting) this.run += 1;
    if (!flowing && this.emitting && spout) this.pending.push(0.1, 0.34);
    this.emitting = flowing;
    this.simulate(delta);
    if (flowing) this.emit(previous ?? spout, spout, angle, pour, delta);
    this.updateDrips(delta);
    this.updateFlung(delta);
    this.draw();
    this.el.classList.toggle("is-visible", this.active);
  }

  emit(from, to, angle, pour, delta) {
    const radians = (angle * Math.PI) / 180;
    const v = this.spoutVelocity;
    const speed = Math.hypot(v.x, v.y);
    const inherit = speed > 0 ? Math.min(1, MAX_INHERIT / speed) * INHERIT : 0;
    const lipX = Math.sin(radians);
    const lipY = Math.max(0, -Math.cos(radians));
    this.carry += delta * EMIT_RATE;
    const count = Math.floor(this.carry);
    this.carry -= count;
    for (let i = 1; i <= count; i += 1) {
      const t = i / count;
      const age = delta * (1 - t);
      const vx = lipX * LIP_SPEED + v.x * inherit;
      const vy = lipY * LIP_SPEED + v.y * inherit * 0.5;
      this.particles.push({
        run: this.run,
        x: from.x + (to.x - from.x) * t + vx * age,
        y: from.y + (to.y - from.y) * t + vy * age,
        vx,
        vy,
        w: WIDTH * clamp(pour, 0, 1) * pulse(this.time - age),
      });
    }
  }

  simulate(delta) {
    const drag = Math.exp(-delta * AIR_DRAG);
    this.particles.forEach((particle) => {
      const p = particle;
      p.vy += GRAVITY * delta;
      p.vx *= drag;
      p.x += p.vx * delta;
      p.y += p.vy * delta;
    });
    const k = ease(STIFFNESS, delta) * 0.5;
    const rope = this.particles;
    for (let i = 1; i < rope.length - 1; i += 1) {
      const a = rope[i - 1];
      const p = rope[i];
      const b = rope[i + 1];
      if (a.run === p.run && b.run === p.run) {
        p.x += ((a.x + b.x) / 2 - p.x) * k;
        p.vx += ((a.vx + b.vx) / 2 - p.vx) * k;
      }
    }
    this.snap();
    this.bead(delta);
    const list = this.particles;
    this.particles = list.filter((p, i) => {
      const newer = list[i + 1];
      return (
        p.y < this.floor ||
        (newer && newer.run === p.run && newer.y < this.floor)
      );
    });
  }

  snap() {
    const rope = this.particles;
    for (let i = rope.length - 2; i >= 0; i -= 1) {
      const p = rope[i];
      const newer = rope[i + 1];
      if (
        p.run === newer.run &&
        Math.hypot(newer.x - p.x, newer.y - p.y) > MAX_GAP
      ) {
        this.pieces -= 1;
        const { run } = p;
        for (let j = i; j >= 0 && rope[j].run === run; j -= 1)
          rope[j].run = this.pieces;
      }
    }
  }

  bead(delta) {
    const rope = this.particles;
    const k = ease(24, delta);
    let start = 0;
    for (let i = 1; i <= rope.length; i += 1) {
      const { run } = rope[start];
      if (i === rope.length || rope[i].run !== run) {
        const count = i - start;
        if (run < 0 && count <= BEAD) {
          let x = 0;
          let y = 0;
          for (let j = start; j < i; j += 1) {
            x += rope[j].x / count;
            y += rope[j].y / count;
          }
          for (let j = start; j < i; j += 1) {
            const p = rope[j];
            p.x += (x - p.x) * k;
            p.y += (y - p.y) * k;
            p.w = Math.min(WIDTH * 1.1, p.w * (1 + delta * 3));
          }
        }
        start = i;
      }
    }
  }

  runs() {
    const runs = [];
    let current = null;
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const p = this.particles[i];
      if (!current || current.id !== p.run) {
        current = { id: p.run, points: [] };
        runs.push(current);
      }
      current.points.push(p);
    }
    return runs;
  }

  outline(points, attached) {
    const pts = [];
    let landed = null;
    for (let i = 0; i < points.length; i += 1) {
      const p = points[i];
      if (p.y >= this.floor) {
        const prev = points[i - 1];
        if (prev) {
          const t = (this.floor - prev.y) / (p.y - prev.y);
          const coil = reducedMotion.matches
            ? 0
            : Math.sin(this.time * 21) * halfWidth(p) * 0.35;
          landed = {
            ...p,
            x: prev.x + (p.x - prev.x) * t + coil,
            y: this.floor,
          };
          pts.push(landed);
        }
        break;
      }
      pts.push(p);
    }
    if (attached && this.spout && pts.length)
      pts.unshift({ ...pts[0], ...this.spout });
    if (pts.length < 2) return null;
    const middle = pts.map((p, i) => {
      const a = pts[Math.max(0, i - 1)];
      const b = pts[Math.min(pts.length - 1, i + 1)];
      const norm = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      return [p.x, p.y, halfWidth(p), -(b.y - a.y) / norm, (b.x - a.x) / norm];
    });
    return { middle, landed };
  }

  draw() {
    let body = "";
    let shade = "";
    let shine = "";
    this.impact = null;
    this.runs().forEach((run) => {
      const attached = run.id === this.run && this.emitting;
      if (run.points.length === 1 && !attached) {
        const p = run.points[0];
        if (p.y >= this.floor) return;
        body += circle(p.x, p.y, halfWidth(p) * 1.2 + 0.3);
        return;
      }
      const outline = this.outline(run.points, attached);
      if (!outline) return;
      const { middle, landed } = outline;
      const left = offset(middle, 1);
      const back = offset(middle, -1).reverse();
      const head = middle[middle.length - 1][2];
      const tail = middle[0][2];
      const endCap = landed ? "L" : `A ${fmt(head)} ${fmt(head)} 0 0 0`;
      const topCap = attached
        ? "Z"
        : `A ${fmt(tail)} ${fmt(tail)} 0 0 0 ${fmt(left[0][0])} ${fmt(left[0][1])} Z`;
      body +=
        `${smooth(left, "M")} ${endCap} ${fmt(back[0][0])} ${fmt(back[0][1])}` +
        ` ${smooth(back, "L")} ${topCap} `;
      shade += `${smooth(offset(middle, -0.35), "M")} ${smooth(back, "L")} Z `;
      const from = Math.floor(middle.length * 0.12);
      const to = Math.ceil(middle.length * (landed ? 0.8 : 0.9));
      if (to - from >= 2)
        shine += `${smooth(offset(middle.slice(from, to), 0.45), "M")} `;
      if (landed && !this.impact) this.impact = landed;
    });
    setPath(this.body, body);
    setPath(this.shade, shade);
    setPath(this.shine, shine);
    this.drawPool();
  }

  drawPool() {
    const { pool, impact, delta } = this;
    const target = impact ? 1.5 + halfWidth(impact) * 2.6 : 0;
    pool.size += (target - pool.size) * ease(impact ? 30 : 12, delta);
    pool.bump *= 1 - ease(9, delta);
    if (impact) {
      pool.x = impact.x;
      pool.y = impact.y;
    }
    const hidden = pool.size < 0.01;
    if (!hidden || !this.poolHidden) {
      const rise = pool.bump * 0.15;
      const rx = pool.size * (1 - rise * 0.4);
      const ry = pool.size * (Math.max(MIN_SQUASH, pool.squash) + rise);
      const degrees = (pool.tilt * 180) / Math.PI - 90;
      place(this.poolEl, pool.x, pool.y, rx, ry);
      place(
        this.poolShine,
        pool.x - rx * 0.32,
        pool.y - ry * 0.35,
        rx * 0.3,
        ry * 0.25,
      );
      turn(this.poolEl, degrees, pool.x, pool.y);
      turn(this.poolShine, degrees, pool.x, pool.y);
    }
    this.poolHidden = hidden;
    this.ripples.forEach((ripple) => {
      const r = ripple;
      if (r.age >= 1) return;
      r.age = Math.min(1, r.age + delta * 2.2);
      const grow = 1 + (1 - (1 - r.age) ** 3) * 1.7;
      place(r.el, r.x, r.y, r.size * grow, r.size * grow * r.squash);
      turn(r.el, r.degrees, r.x, r.y);
      r.el.style.opacity = fmt((1 - r.age) * 0.6);
    });
  }

  splash(x, y) {
    if (reducedMotion.matches) return;
    this.pool.bump = 1;
    const ripple = this.ripples.find((r) => r.age >= 1);
    if (!ripple) return;
    const at = this.impact ?? { x, y };
    Object.assign(ripple, {
      age: 0,
      x: at.x,
      y: at.y,
      size: Math.max(5, this.pool.size * 1.2),
      squash: Math.max(MIN_SQUASH, this.pool.squash),
      degrees: (this.pool.tilt * 180) / Math.PI - 90,
    });
  }

  fling(spout, vx, vy, amount) {
    const count = Math.round(5 + amount * 8);
    for (let i = 0; i < count; i += 1) {
      const toLens = Math.random() < LENS_CHANCE;
      const speed =
        FLUNG_INHERIT * (0.6 + Math.random() * 0.6) * (toLens ? 0.3 : 1);
      this.flung.push({
        x: spout.x,
        y: spout.y,
        vx: vx * speed + (Math.random() - 0.5) * 160,
        vy: vy * speed + (Math.random() - 0.5) * 160,
        z: 0,
        vz: toLens ? 3 + Math.random() * 1.5 : 0,
        r: 1 + Math.random() ** 1.5 * 2.5 * amount,
      });
    }
  }

  updateFlung(delta) {
    if (this.flung.length === 0 && this.flungDrawn === false) return;
    const drag = Math.exp(-delta * AIR_DRAG * 0.5);
    let body = "";
    let shine = "";
    this.flung = this.flung.filter((drop) => {
      const d = drop;
      d.vy += GRAVITY * (d.vz > 0 ? 0.3 : 1) * delta;
      d.vx *= drag;
      d.x += d.vx * delta;
      d.y += d.vy * delta;
      d.z += d.vz * delta;
      const onScreen =
        d.x > 0 &&
        d.x < window.innerWidth &&
        d.y > 0 &&
        d.y < window.innerHeight;
      if (d.z >= 1) {
        if (onScreen) this.onLens?.(d.x, d.y, d.r * NEAR_SCALE);
        return false;
      }
      if (d.y > window.innerHeight + 40) return false;
      const r = d.r * (1 + d.z * (NEAR_SCALE - 1));
      body += circle(d.x, d.y, r);
      shine += circle(d.x - r * 0.35, d.y - r * 0.4, r * 0.3);
      return true;
    });
    setPath(this.flungEl, body);
    setPath(this.flungShine, shine);
    this.flungDrawn = this.flung.length > 0;
  }

  updateDrips(delta) {
    this.pending = this.pending
      .map((t) => t - delta)
      .filter((t) => {
        if (t > 0) return true;
        this.drip();
        return false;
      });
    this.drips.forEach((drip) => {
      const d = drip;
      if (!d.active) return;
      if (d.hang > 0) {
        d.hang -= delta;
        d.r += (1.9 - d.r) * ease(14, delta);
      } else {
        d.vy += GRAVITY * delta;
        d.y += d.vy * delta;
      }
      if (d.y >= this.floor) {
        d.active = false;
        this.splash(d.x, this.floor);
      }
      const r = d.active ? d.r : 0;
      const stretch = 1 + clamp(d.vy / 900, 0, 0.5);
      const y = d.y + (d.hang > 0 ? d.r * 0.7 : 0);
      place(d.el, d.x, y, r / Math.sqrt(stretch), r * stretch);
      place(d.shine, d.x - r * 0.35, y - r * 0.4, r * 0.3, r * 0.3 * stretch);
    });
  }

  drip() {
    const d = this.drips.find((drip) => !drip.active);
    if (!d || !this.spout || reducedMotion.matches) return;
    Object.assign(d, {
      active: true,
      x: this.spout.x + (Math.random() - 0.5) * 1.5,
      y: this.spout.y,
      vy: 0,
      r: 0,
      hang: 0.12,
    });
  }
}
