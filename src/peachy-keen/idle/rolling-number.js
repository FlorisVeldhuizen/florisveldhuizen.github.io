import { el } from "./dom";
import { Spring } from "./spring";

export class RollingNumber {
  constructor(root, stiffness, damping) {
    this.root = root;
    this.k = stiffness;
    this.c = damping;
    this.text = null;
    this.cells = [];
    root.setAttribute("role", "img");
  }

  build(text) {
    this.root.replaceChildren();
    this.cells = [...text].map((ch) => {
      if (!/\d/.test(ch))
        return { ch, node: el("span", "roll-char", this.root, ch) };
      const node = el("span", "roll-slot", this.root);
      const strip = el(
        "span",
        "roll-strip",
        node,
        Array.from({ length: 30 }, (_, i) => `<span>${i % 10}</span>`).join(""),
      );
      return { ch, strip, spring: new Spring(this.k, this.c, +ch) };
    });
  }

  set(text) {
    if (text === this.text) return;
    this.root.setAttribute("aria-label", text);
    const shape = (s) => s?.replace(/\d/g, "0");
    if (shape(text) !== shape(this.text)) this.build(text);
    else
      [...text].forEach((ch, i) => {
        const cell = this.cells[i];
        if (cell.ch === ch || !cell.spring) return;
        const s = cell.spring;
        const was = ((Math.round(s.target) % 10) + 10) % 10;
        s.target = Math.round(s.target) - was + +ch + (+ch < was ? 10 : 0);
        cell.ch = ch;
      });
    this.text = text;
  }

  step(dt) {
    this.cells.forEach(({ strip, spring }) => {
      if (!spring) return;
      spring.step(dt);
      spring.wrap(10);
      // eslint-disable-next-line no-param-reassign
      strip.style.transform = `translateY(${-spring.x}em)`;
    });
  }
}
