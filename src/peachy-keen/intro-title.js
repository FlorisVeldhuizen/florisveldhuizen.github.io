import { Spring } from "./idle/spring";
import { reducedMotion } from "./util";

const STIFFNESS = 260;
const DAMPING = 9;
const SPREAD = 0.55;
const RIPPLE_DELAY = 0.045;
// Kicks are tuned at a 44 px title, so they scale with the font size.
const KICK_PER_PX = 170 / 44;

export default class IntroTitle {
  constructor(element) {
    this.element = element;
    const text = element.textContent.trim();
    this.element.setAttribute("aria-label", text);
    this.element.textContent = "";
    const firstSpace = text.indexOf(" ");
    this.letters = [...text].map((ch, i) => {
      const span = document.createElement("span");
      span.className = ch === " " ? "intro-letter is-space" : "intro-letter";
      span.textContent = ch === " " ? " " : ch;
      span.setAttribute("aria-hidden", "true");
      this.element.append(span);
      const letter = {
        span,
        ch,
        jiggly: firstSpace < 0 || i < firstSpace,
        y: new Spring(STIFFNESS, DAMPING),
        r: new Spring(STIFFNESS * 0.85, DAMPING * 0.9),
        s: new Spring(STIFFNESS * 1.2, DAMPING * 1.25),
      };
      span.addEventListener("pointerenter", () => this.poke(i, 0.8));
      span.addEventListener("pointerdown", () => this.ripple(i));
      return letter;
    });
    this.queue = [];
    this.idleIn = 1.5;
  }

  kick() {
    const size = parseFloat(getComputedStyle(this.element).fontSize) || 44;
    return KICK_PER_PX * size * (reducedMotion.matches ? 0.3 : 1);
  }

  poke(i, amount = 1, spread = true) {
    const letter = this.letters[i];
    if (!letter || letter.ch === " ") return;
    letter.y.v -= amount * this.kick();
    letter.r.v += (Math.random() * 2 - 1) * amount * 240;
    letter.s.v += amount * 4;
    if (!spread) return;
    for (let d = 1; d < 5; d += 1) {
      [i - d, i + d].forEach((j) =>
        this.queue.push({ at: d * 0.06, i: j, amount: amount * SPREAD ** d }),
      );
    }
  }

  ripple(from, amount = 1) {
    this.letters.forEach((_, i) => {
      const d = Math.abs(i - from);
      this.queue.push({
        at: d * RIPPLE_DELAY,
        i,
        amount: amount * Math.max(0.15, SPREAD ** (d * 0.5)),
        squash: true,
      });
    });
  }

  nearest(clientX) {
    let best = 0;
    let bestGap = Infinity;
    this.letters.forEach((letter, i) => {
      if (letter.ch === " ") return;
      const box = letter.span.getBoundingClientRect();
      const gap = Math.abs(box.left + box.width / 2 - clientX);
      if (gap < bestGap) {
        bestGap = gap;
        best = i;
      }
    });
    return best;
  }

  update(delta) {
    for (let k = this.queue.length - 1; k >= 0; k -= 1) {
      const item = this.queue[k];
      item.at -= delta;
      if (item.at <= 0) {
        this.queue.splice(k, 1);
        const letter = this.letters[item.i];
        if (letter && letter.ch !== " ") {
          if (!item.squash) this.poke(item.i, item.amount, false);
          else {
            letter.s.v += item.amount * 8;
            letter.y.v -= item.amount * this.kick() * 0.45;
          }
        }
      }
    }
    this.idleIn -= delta;
    if (this.idleIn <= 0 && !reducedMotion.matches) {
      this.idleIn = 1.6 + Math.random() * 1.6;
      const jiggly = this.letters.filter((l) => l.jiggly && l.ch !== " ");
      const pick = jiggly[Math.floor(Math.random() * jiggly.length)];
      if (pick) this.poke(this.letters.indexOf(pick), 0.5);
    }
    this.letters.forEach((letter) => {
      const { span } = letter;
      letter.y.step(delta);
      letter.r.step(delta);
      letter.s.step(delta);
      const s = Math.min(0.45, Math.max(-0.4, letter.s.x));
      span.style.transform = `translateY(${letter.y.x.toFixed(2)}px) rotate(${letter.r.x.toFixed(2)}deg) scale(${(1 + s).toFixed(3)}, ${(1 - s).toFixed(3)})`;
    });
  }
}
