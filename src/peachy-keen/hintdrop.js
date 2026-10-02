import { clamp, reducedMotion } from "./util";

const DELAY = 0.55;
const FALL = 0.3;
const RESTITUTION = 0.38;
const STAGGER = 0.05;
const CALM = 0.5;
const MIN_BOUNCE = 12;

const smoothstep = (t) => t * t * (3 - 2 * t);

function motionAt(m, time) {
  const t = time - m.start;
  const distance = m.to - m.from;
  if (t <= 0 || distance === 0) return { at: m.from, phase: "wait" };
  if (reducedMotion.matches) {
    const u = clamp(t / CALM, 0, 1);
    return { at: m.from + distance * smoothstep(u), phase: "calm" };
  }
  if (t < FALL) {
    const u = t / FALL;
    return {
      at: m.from + distance * u * u,
      phase: "fall",
      speed: (2 * Math.abs(distance) * u) / FALL,
    };
  }
  const gravity = (2 * Math.abs(distance)) / (FALL * FALL);
  let speed = (2 * Math.abs(distance)) / FALL;
  let since = t - FALL;
  let contact = 0;
  for (;;) {
    speed *= RESTITUTION;
    contact += 1;
    if (speed < MIN_BOUNCE) return { at: m.to, phase: "rest", contact };
    const flight = (2 * speed) / gravity;
    if (since < flight) {
      const height = speed * since - (gravity * since * since) / 2;
      return {
        at: m.to - Math.sign(distance) * height,
        phase: "bounce",
        contact,
      };
    }
    since -= flight;
  }
}

export function contactSpeed(m, contact) {
  const span = Math.abs(m.to - m.from);
  return ((2 * span) / FALL) * RESTITUTION ** (contact - 1);
}

export class HintDrop {
  constructor(hints) {
    this.hints = hints;
    this.lines = [...hints.querySelectorAll("p")];
    this.time = 0;
    this.lineMotions = this.lines.map(() => ({ from: 0, to: 0, start: 0 }));
    this.bottle = { from: 0, to: 0, start: 0 };
    this.bottleState = { at: 0, phase: "rest" };
  }

  targets() {
    const heights = this.lines.map((line) => line.offsetHeight);
    const learned = this.lines.map((line) =>
      line.classList.contains("is-learned"),
    );
    const shifts = this.lines.map((_, i) =>
      heights.reduce((sum, h, j) => (j > i && learned[j] ? sum + h : sum), 0),
    );
    const drop = heights.reduce((sum, h, j) => (learned[j] ? sum + h : sum), 0);
    return { shifts, drop };
  }

  settle() {
    const { shifts, drop } = this.targets();
    this.lineMotions.forEach((m, i) =>
      Object.assign(m, { from: shifts[i], to: shifts[i], start: -Infinity }),
    );
    Object.assign(this.bottle, { from: drop, to: drop, start: -Infinity });
    this.bottleState = { at: drop, phase: "rest" };
    this.render();
  }

  update(delta) {
    this.time += delta;
    const { shifts, drop } = this.targets();
    let order = 0;
    for (let i = this.lines.length - 1; i >= 0; i -= 1) {
      const m = this.lineMotions[i];
      if (shifts[i] !== m.to) {
        this.retarget(m, shifts[i], order);
        order += 1;
      }
    }
    if (drop !== this.bottle.to) this.retarget(this.bottle, drop, order);
    this.bottleState = motionAt(this.bottle, this.time);
    this.render();
  }

  retarget(m, to, order) {
    Object.assign(m, {
      from: motionAt(m, this.time).at,
      to,
      start: this.time + DELAY + order * STAGGER,
    });
  }

  render() {
    this.lines.forEach((line, i) => {
      const m = this.lineMotions[i];
      const { at } = motionAt(m, this.time);
      Object.assign(line.style, { translate: at ? `0 ${at}px` : "" });
    });
  }
}
