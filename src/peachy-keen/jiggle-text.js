import { Spring } from "./idle/spring";
import { reducedMotion } from "./util";

const SELECTORS = ["#count", "#count-unit", "#bursts", "#rate", ".hints p"];
// Rewritten every frame, so splitting it into letters would churn; it jiggles as one piece.
const WHOLE = new Set(["rate"]);
// Rolling numbers keep their own digit slots, so those slots jiggle instead of split letters.
const GLYPHS = ".roll-slot, .roll-char";
const KICK_PER_PX = 170 / 44;

const letterOf = (node) => ({
  node,
  y: new Spring(260, 9),
  r: new Spring(220, 8),
  s: new Spring(300, 11),
});
const resting = (l) =>
  [l.y, l.r, l.s].every((s) => Math.abs(s.x) < 0.01 && Math.abs(s.v) < 0.01);

// The score and hints sit over the scene with pointer events off, so hover is found from the pointer
// position instead of events on the text, and the game keeps all of its input.
export default class JiggleText {
  constructor() {
    this.groups = new Map();
    this.queue = [];
    this.active = new Set();
    this.last = null;
    this.splitting = false;
    this.observer = new MutationObserver((records) => {
      if (this.splitting) return;
      new Set(
        records.map((r) => r.target.closest?.(SELECTORS.join(","))),
      ).forEach((el) => el && this.collect(el));
    });
    document.querySelectorAll(SELECTORS.join(",")).forEach((el) => {
      this.collect(el);
      if (WHOLE.has(el.id)) return;
      this.observer.observe(el, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    });
    window.addEventListener("pointermove", (e) => this.hover(e), {
      passive: true,
    });
  }

  collect(el) {
    if (WHOLE.has(el.id)) {
      this.groups.set(el, [letterOf(el)]);
      return;
    }
    const glyphs = [...el.querySelectorAll(GLYPHS)];
    let nodes = glyphs;
    if (!glyphs.length) {
      const onlyText = [...el.childNodes].every(
        (n) =>
          n.nodeType === Node.TEXT_NODE ||
          (n.nodeType === Node.ELEMENT_NODE && n.classList.contains("jig")),
      );
      const text = el.textContent;
      if (!onlyText || !text.trim()) {
        this.groups.delete(el);
        return;
      }
      this.splitting = true;
      el.replaceChildren(
        ...[...text].map((ch) => {
          const span = document.createElement("span");
          span.className = ch === " " ? "jig is-space" : "jig";
          span.textContent = ch;
          return span;
        }),
      );
      this.splitting = false;
      nodes = [...el.children].filter((n) => !n.classList.contains("is-space"));
    }
    this.groups.set(el, nodes.map(letterOf));
  }

  hover(e) {
    if (e.buttons || reducedMotion.matches) return;
    const near = (r, pad) =>
      e.clientX >= r.left - pad &&
      e.clientX <= r.right + pad &&
      e.clientY >= r.top - pad &&
      e.clientY <= r.bottom + pad;
    let hit = null;
    [...this.groups].some(([el, letters]) => {
      if (!near(el.getBoundingClientRect(), 4)) return false;
      if (getComputedStyle(el).opacity === "0") return false;
      const i = letters.findIndex((l) =>
        near(l.node.getBoundingClientRect(), 1),
      );
      if (i >= 0) hit = { el, i };
      return true;
    });
    if (hit && (hit.el !== this.last?.el || hit.i !== this.last?.i))
      this.ripple(hit.el, hit.i);
    this.last = hit;
  }

  ripple(el, from) {
    const letters = this.groups.get(el);
    const size = parseFloat(getComputedStyle(el).fontSize) || 17;
    letters.forEach((_, i) => {
      const d = Math.abs(i - from);
      if (d < 5)
        this.queue.push({
          el,
          i,
          at: d * 0.05,
          amount: (WHOLE.has(el.id) ? 0.3 : 0.7) * 0.55 ** d,
          size,
        });
    });
  }

  update(delta) {
    for (let k = this.queue.length - 1; k >= 0; k -= 1) {
      const item = this.queue[k];
      item.at -= delta;
      if (item.at <= 0) {
        this.queue.splice(k, 1);
        const letter = this.groups.get(item.el)?.[item.i];
        if (letter) {
          letter.y.v -= item.amount * KICK_PER_PX * item.size;
          letter.r.v += (Math.random() * 2 - 1) * item.amount * 220;
          letter.s.v += item.amount * 4;
          this.active.add(letter);
        }
      }
    }
    this.active.forEach((l) => {
      l.y.step(delta);
      l.r.step(delta);
      l.s.step(delta);
      const s = Math.min(0.4, Math.max(-0.35, l.s.x));
      // eslint-disable-next-line no-param-reassign
      l.node.style.transform = `translateY(${l.y.x.toFixed(2)}px) rotate(${l.r.x.toFixed(2)}deg) scale(${(1 + s).toFixed(3)}, ${(1 - s).toFixed(3)})`;
      if (resting(l) || !l.node.isConnected) {
        // eslint-disable-next-line no-param-reassign
        l.node.style.transform = "";
        this.active.delete(l);
      }
    });
  }
}
