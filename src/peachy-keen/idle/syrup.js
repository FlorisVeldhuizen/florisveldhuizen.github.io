import { Spring } from "./spring";

const SVG = "http://www.w3.org/2000/svg";
const DROP = "M16 2C16 2 29 18 29 30A13 13 0 0 1 3 30C3 18 16 2 16 2Z";
const PIT =
  "M17 3.5C24.8 8 29 18.5 28.6 29.2C28.2 37.6 23.2 43 16 43C8.8 43 4 37.6 3.6 29.6C3.2 18.6 9 8 17 3.5Z";
const PIT_SEAM =
  "M17.2 6C19.8 12.4 20.6 20.2 20 27.8C19.5 34.2 18 38.8 15.8 42";
const DROP_SHINE =
  '<ellipse cx="10.5" cy="27" rx="3" ry="5.5" fill="#fff" opacity="0.38" transform="rotate(18 10.5 27)"/><circle cx="12.5" cy="37" r="1.3" fill="#fff" opacity="0.3"/>';
const BEAD_MAX = 7.4;
const BEAD_HANG = 0.13;
const BEAD_GRAVITY = 1500;
const BEADS_IN_AIR = 3;
const GOO_MIN_BEAD = 3.4;
const GOO_JOIN_Y = -2;
const CROWN_SIZES = [4.6, 4.2, 3.9, 3.6, 3.4, 3.2, 3];
const CROWN_SPREAD = 0.9;
const CROWN_SPEED = 215;
const CROWN_STAGGER = 0.015;
const CROWN_HOLD = 0.06;
const RISE_GRAVITY = 760;
const FALL_GRAVITY = 980;
const MAX_STRETCH = 1.6;
const MELT_RATE = 14;

// The icons sit under SVG filters, so a write is skipped when nothing changed.
function setChanged(node, name, value) {
  if (node.getAttribute(name) !== value) node.setAttribute(name, value);
}

const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <linearGradient id="syrup-drop-fill" x1="0.2" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#ffc09a"/>
      <stop offset="0.55" stop-color="#ff8f66"/>
      <stop offset="1" stop-color="#e8505f"/>
    </linearGradient>
    <linearGradient id="syrup-pit-fill" x1="0.2" y1="0" x2="0.75" y2="1">
      <stop offset="0" stop-color="#d9a080"/>
      <stop offset="0.5" stop-color="#9a5a40"/>
      <stop offset="1" stop-color="#5a2a20"/>
    </linearGradient>
    <filter id="syrup-goo" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur"/>
      <feColorMatrix in="blur" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" result="goo"/>
      <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
    </filter>
    <filter id="syrup-blur-wide" filterUnits="userSpaceOnUse" x="-20" y="-30" width="80" height="110"><feGaussianBlur stdDeviation="3.5"/></filter>
    <filter id="syrup-blur" filterUnits="userSpaceOnUse" x="-20" y="-30" width="80" height="110"><feGaussianBlur stdDeviation="0.7"/></filter>
    <clipPath id="syrup-pit-clip"><path d="${PIT}"/></clipPath>
    <g id="syrup-pit">
      <path d="${PIT}" fill="url(#syrup-pit-fill)"/>
      <g clip-path="url(#syrup-pit-clip)">
        <ellipse cx="25" cy="34" rx="10" ry="15" fill="#4e1a14" opacity="0.42" filter="url(#syrup-blur-wide)"/>
        <ellipse cx="9" cy="16" rx="7" ry="10" fill="#ffe2cc" opacity="0.35" filter="url(#syrup-blur-wide)"/>
        <path d="${PIT_SEAM}L30 44L30 2Z" fill="#3e120c" opacity="0.5" filter="url(#syrup-blur)"/>
      </g>
      <ellipse cx="10.6" cy="19" rx="3.4" ry="6.4" fill="#ffe6d4" opacity="0.2" transform="rotate(18 10.6 19)" filter="url(#syrup-blur)"/>
    </g>
    <g id="syrup-drop"><path d="${DROP}" fill="url(#syrup-drop-fill)"/>${DROP_SHINE}</g>
  </defs>
</svg>`;

export function installSyrup() {
  document.body.insertAdjacentHTML("afterbegin", DEFS);
}

export const pitIcon = () =>
  `<svg class="pit-icon" viewBox="1 1 30 44" aria-hidden="true"><g><use href="#syrup-pit"/></g></svg>`;

export const dropIcon = () =>
  `<svg class="drop-icon" viewBox="1 1 30 44" aria-hidden="true"><use href="#syrup-drop"/></svg>`;

const wobbleTransform = (wobble, tilt, pulse = 0) => {
  const y = 1 + wobble.x * 0.12 + pulse;
  return `translate(16 43) rotate(${tilt.x.toFixed(2)}) scale(${(1 / Math.sqrt(y)).toFixed(3)} ${y.toFixed(3)}) translate(-16 -43)`;
};

export class SyrupDrop {
  constructor(parent) {
    this.svg = document.createElementNS(SVG, "svg");
    this.svg.setAttribute("class", "syrup-drop");
    this.svg.setAttribute("viewBox", "-4 -14 40 64");
    this.svg.setAttribute("aria-hidden", "true");
    this.svg.innerHTML = `<g><g filter="url(#syrup-goo)"><path d="${DROP}" fill="url(#syrup-drop-fill)"/></g><g></g>${DROP_SHINE}</g>`;
    parent.appendChild(this.svg);
    this.body = this.svg.firstElementChild;
    this.pool = this.body.firstElementChild;
    this.loose = this.pool.nextElementSibling;
    this.wobble = new Spring(120, 8);
    this.tilt = new Spring(90, 7);
    this.hop = new Spring(170, 11);
    this.pulse = new Spring(1900, 35);
    this.shine = [...this.body.children].slice(2);
    this.hold = 0;
    this.flash = 0;
    this.launches = [];
    this.beads = [];
    this.crownDrops = [];
  }

  drip(size, release) {
    const last = this.beads[this.beads.length - 1];
    if (last && (last.hanging || this.beads.length >= BEADS_IN_AIR)) {
      last.goal = Math.min(BEAD_MAX, Math.hypot(last.goal, size));
      last.releases.push(release);
      if (last.hanging) last.t = Math.min(last.t, 0.06);
      return;
    }
    const node = document.createElementNS(SVG, "circle");
    node.setAttribute("cx", "16");
    node.setAttribute("fill", "#ffa078");
    (size < GOO_MIN_BEAD ? this.loose : this.pool).appendChild(node);
    this.beads.push({
      node,
      hanging: true,
      t: 0,
      y: -26,
      v: 0,
      r: 0,
      goal: Math.min(BEAD_MAX, size),
      releases: [release],
    });
  }

  crown(power = 1) {
    this.hold = CROWN_HOLD;
    this.flash = 1;
    this.pulse.x = -0.15;
    this.pulse.v = 0;
    this.power = power;
    const count = Math.round(CROWN_SIZES.length * power);
    const fan = Array.from(
      { length: count },
      (_, n) => (n / (count - 1)) * 2 - 1,
    ).sort((a, b) => Math.abs(a) - Math.abs(b));
    fan.forEach((side, n) => {
      const size = CROWN_SIZES[Math.floor(Math.random() * CROWN_SIZES.length)];
      const heavy = (size - 3) / 1.6;
      const speed =
        CROWN_SPEED *
        Math.sqrt(power) *
        (1.1 - heavy * 0.3) *
        (0.85 + Math.random() * 0.3);
      const angle = -Math.PI / 2 + side * CROWN_SPREAD;
      this.launches.push({
        at: n * CROWN_STAGGER,
        x: 16 + side * 5,
        vx: Math.cos(angle) * speed * 0.75,
        vy: Math.sin(angle) * speed,
        r: size * Math.sqrt(power),
      });
    });
  }

  launch(spec) {
    const node = document.createElementNS(SVG, "ellipse");
    node.setAttribute("fill", "#ff9a70");
    this.pool.appendChild(node);
    this.crownDrops.push({ ...spec, node, y: 5, age: 0 });
  }

  hit(size) {
    this.wobble.v -= 2.6 * size;
    this.tilt.v += (Math.random() * 2 - 1) * 14 * size;
  }

  step(dt) {
    for (let i = this.beads.length - 1; i >= 0; i -= 1) {
      const b = this.beads[i];
      b.r += (b.goal - b.r) * (1 - Math.exp(-dt * 20));
      if (b.hanging) {
        b.t += dt;
        if (b.t > BEAD_HANG) b.hanging = false;
      } else {
        b.v += BEAD_GRAVITY * dt;
        b.y += b.v * dt;
      }
      if (b.y >= 9) {
        this.wobble.v -= b.r * 0.55;
        this.tilt.v += (Math.random() * 2 - 1) * b.r * 2;
        b.releases.forEach((release) => release());
        b.node.remove();
        this.beads.splice(i, 1);
      } else {
        if (b.y > GOO_JOIN_Y && b.node.parentNode === this.loose)
          this.pool.appendChild(b.node);
        b.node.setAttribute("cy", (b.y - b.r * 0.4).toFixed(1));
        b.node.setAttribute("r", b.r.toFixed(2));
      }
    }
    if (this.hold > 0) {
      this.hold -= dt;
      if (this.hold <= 0) this.hop.v -= 130 * this.power;
    } else {
      this.launches = this.launches.filter((spec) => {
        // eslint-disable-next-line no-param-reassign
        spec.at -= dt;
        if (spec.at > 0) return true;
        this.launch(spec);
        return false;
      });
      this.pulse.step(dt);
    }
    for (let i = this.crownDrops.length - 1; i >= 0; i -= 1) {
      const d = this.crownDrops[i];
      d.vy += (d.vy < 0 ? RISE_GRAVITY : FALL_GRAVITY) * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.age += dt;
      const inside =
        d.vy > 0 && Math.abs(d.x - 16) < Math.max(1, (d.y - 2) * 0.45);
      if (inside) d.melt = (d.melt || 1) * Math.exp(-dt * MELT_RATE);
      if ((d.melt || 1) < 0.15 || d.y > 70) {
        d.node.remove();
        this.crownDrops.splice(i, 1);
      } else {
        const speed = Math.hypot(d.vx, d.vy);
        const stretch = Math.min(MAX_STRETCH, 1 + speed / 500);
        const radius =
          d.r * (1 - 0.25 * Math.min(1, d.age / 0.5)) * (d.melt || 1);
        const angle = (Math.atan2(d.vy, d.vx) * 180) / Math.PI;
        d.node.setAttribute("cx", d.x.toFixed(1));
        d.node.setAttribute("cy", d.y.toFixed(1));
        d.node.setAttribute("rx", (radius * Math.sqrt(stretch)).toFixed(2));
        d.node.setAttribute("ry", (radius / Math.sqrt(stretch)).toFixed(2));
        d.node.setAttribute(
          "transform",
          `rotate(${angle.toFixed(1)} ${d.x.toFixed(1)} ${d.y.toFixed(1)})`,
        );
      }
    }
    this.flash = Math.max(0, this.flash - dt * 8);
    this.shine.forEach((node, n) => {
      const base = n ? 0.3 : 0.38;
      setChanged(
        node,
        "opacity",
        (base + (0.9 - base) * this.flash).toFixed(2),
      );
    });
    this.wobble.step(dt);
    this.tilt.step(dt);
    this.hop.step(dt);
    setChanged(
      this.body,
      "transform",
      `translate(0 ${this.hop.x.toFixed(2)}) ${wobbleTransform(this.wobble, this.tilt, this.pulse.x)}`,
    );
  }
}

export function pitWobble(svg) {
  const group = svg.querySelector("g");
  const wobble = new Spring(120, 8);
  const tilt = new Spring(90, 7);
  return {
    land(size) {
      wobble.v -= 2.6 + 1.4 * size;
      tilt.v += (Math.random() * 2 - 1) * (26 + 14 * size);
    },
    thump(size) {
      wobble.v -= 9.2 + 11 * size;
      tilt.v += (Math.random() * 2 - 1) * (40 + 50 * size);
    },
    step(dt) {
      wobble.step(dt);
      tilt.step(dt);
      setChanged(group, "transform", wobbleTransform(wobble, tilt));
    },
  };
}
