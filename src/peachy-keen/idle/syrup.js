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

const wobbleTransform = (wobble, tilt) => {
  const y = 1 + wobble.x * 0.12;
  return `translate(16 43) rotate(${tilt.x.toFixed(2)}) scale(${(1 / Math.sqrt(y)).toFixed(3)} ${y.toFixed(3)}) translate(-16 -43)`;
};

export class SyrupDrop {
  constructor(parent) {
    this.svg = document.createElementNS(SVG, "svg");
    this.svg.setAttribute("class", "syrup-drop");
    this.svg.setAttribute("viewBox", "-4 -14 40 64");
    this.svg.setAttribute("aria-hidden", "true");
    this.svg.innerHTML = `<g><g filter="url(#syrup-goo)"><path d="${DROP}" fill="url(#syrup-drop-fill)"/></g>${DROP_SHINE}</g>`;
    parent.appendChild(this.svg);
    this.body = this.svg.firstElementChild;
    this.pool = this.body.firstElementChild;
    this.wobble = new Spring(120, 8);
    this.tilt = new Spring(90, 7);
    this.beads = [];
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
    this.pool.appendChild(node);
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
        b.node.setAttribute("cy", (b.y - b.r * 0.4).toFixed(1));
        b.node.setAttribute("r", b.r.toFixed(2));
      }
    }
    this.wobble.step(dt);
    this.tilt.step(dt);
    this.body.setAttribute(
      "transform",
      wobbleTransform(this.wobble, this.tilt),
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
    step(dt) {
      wobble.step(dt);
      tilt.step(dt);
      group.setAttribute("transform", wobbleTransform(wobble, tilt));
    },
  };
}
