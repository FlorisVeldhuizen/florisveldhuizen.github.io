import { clamp, cubicBezier } from "./util";

// Matches the opacity and transform transition on .hints p in style.css.
const MOVE = 0.8;
const textEase = cubicBezier(0.25, 0.1, 0.25, 1);

function motionAt(m, time) {
  const u = clamp((time - m.start) / MOVE, 0, 1);
  return m.from + (m.to - m.from) * textEase(u);
}

export class HintDrop {
  constructor(hints) {
    this.hints = hints;
    this.lines = [...hints.querySelectorAll("p")];
    this.time = 0;
    this.lineMotions = this.lines.map(() => ({ from: 0, to: 0, start: 0 }));
    this.bottle = { from: 0, to: 0, start: 0 };
    this.bottleAt = 0;
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
    this.bottleAt = drop;
    this.render();
  }

  update(delta) {
    this.time += delta;
    const { shifts, drop } = this.targets();
    this.lineMotions.forEach((m, i) => {
      if (shifts[i] !== m.to) this.retarget(m, shifts[i]);
    });
    if (drop !== this.bottle.to) this.retarget(this.bottle, drop);
    this.bottleAt = motionAt(this.bottle, this.time);
    this.render();
  }

  retarget(m, to) {
    Object.assign(m, {
      from: motionAt(m, this.time),
      to,
      start: this.time,
    });
  }

  render() {
    this.lines.forEach((line, i) => {
      const m = this.lineMotions[i];
      const at = motionAt(m, this.time);
      Object.assign(line.style, { translate: at ? `0 ${at}px` : "" });
    });
  }
}
