import { el, animate } from "./dom";
import { format } from "./numbers";
import { renders } from "./renders";
import { reducedMotion } from "../util";
import { playNotes } from "../audio";

const FRUIT = 5;
const STAGGER = 70;
const NOTES = [659, 784, 880, 988, 1175];

function targetFor(reward) {
  if (reward.kind === "pits") return document.getElementById("pits");
  if (reward.kind === "nectar") return document.getElementById("tab-ripen");
  return document.getElementById("count");
}

class HarvestFx {
  constructor() {
    this.layer = el("div", "harvest-layer", document.body);
    this.layer.setAttribute("aria-hidden", "true");
  }

  play({ seed, reward, button }) {
    const box = button.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height * 0.42;
    animate(
      button,
      [
        { scale: 1 },
        { scale: 0.9, offset: 0.25 },
        { scale: 1.06, offset: 0.6 },
        { scale: 1 },
      ],
      { duration: 420, easing: "cubic-bezier(.3,.7,.3,1.4)" },
    );
    this.label(cx, box.top + box.height * 0.3, reward);
    if (reducedMotion.matches) return;
    this.burst(cx, cy, seed.color);
    const target = targetFor(reward);
    const end = target?.getBoundingClientRect();
    renders.fruitIcon(seed, (url) => {
      for (let n = 0; n < FRUIT; n += 1)
        setTimeout(
          () =>
            this.fly(url, cx, cy, box.width, end, () => {
              playNotes([NOTES[n]], { length: 0.18, volume: 0.045 });
              if (target && n === FRUIT - 1)
                animate(target, [{ scale: 1 }, { scale: 1.12 }, { scale: 1 }], {
                  duration: 260,
                  easing: "ease-out",
                });
            }),
          n * STAGGER,
        );
    });
  }

  fly(url, cx, cy, spread, end, land) {
    const x0 = cx + (Math.random() - 0.5) * spread * 0.5;
    const y0 = cy + (Math.random() - 0.5) * spread * 0.25;
    const tx = end ? end.left + end.width / 2 : x0;
    const ty = end ? end.top + end.height / 2 : y0 - 160;
    const lift = 60 + Math.random() * 40;
    const outer = el("div", "harvest-fruit", this.layer);
    const inner = el("img", "", outer);
    inner.src = url;
    inner.alt = "";
    const duration = 780 + Math.random() * 160;
    outer.animate(
      [
        { translate: `${x0}px 0` },
        { translate: `${x0 + (Math.random() - 0.5) * 50}px 0`, offset: 0.3 },
        { translate: `${tx}px 0` },
      ],
      { duration, easing: "cubic-bezier(.45,0,.75,.6)", fill: "forwards" },
    );
    inner
      .animate(
        [
          { translate: `0 ${y0}px`, scale: 0.4, rotate: "0deg" },
          {
            translate: `0 ${y0 - lift}px`,
            scale: 1.15,
            rotate: `${(Math.random() - 0.5) * 60}deg`,
            offset: 0.32,
            easing: "cubic-bezier(.3,.6,.5,1)",
          },
          {
            translate: `0 ${ty}px`,
            scale: end ? 0.45 : 0,
            rotate: `${(Math.random() - 0.5) * 240}deg`,
          },
        ],
        { duration, easing: "cubic-bezier(.5,0,.8,.4)", fill: "forwards" },
      )
      .finished.then(() => {
        outer.remove();
        land();
      });
  }

  burst(cx, cy, color) {
    for (let n = 0; n < 12; n += 1) {
      const dot = el("i", "harvest-spark", this.layer);
      dot.style.background = n % 3 ? color : "#ffe08a";
      const a = (n / 12) * Math.PI * 2 + Math.random() * 0.4;
      const d = 30 + Math.random() * 34;
      dot
        .animate(
          [
            { translate: `${cx}px ${cy}px`, scale: 1, opacity: 1 },
            {
              translate: `${cx + Math.cos(a) * d}px ${cy + Math.sin(a) * d}px`,
              scale: 0.2,
              opacity: 0,
            },
          ],
          {
            duration: 520 + Math.random() * 200,
            easing: "cubic-bezier(.2,.8,.3,1)",
          },
        )
        .finished.then(() => dot.remove());
    }
  }

  label(x, y, reward) {
    const text = el("strong", "harvest-label", this.layer);
    text.textContent = reward.value ? `+${format(reward.value)}` : reward.text;
    animate(
      text,
      [
        { translate: `${x}px ${y}px`, scale: 0.6, opacity: 0 },
        {
          translate: `${x}px ${y - 26}px`,
          scale: 1.1,
          opacity: 1,
          offset: 0.2,
        },
        { translate: `${x}px ${y - 40}px`, scale: 1, opacity: 1, offset: 0.75 },
        { translate: `${x}px ${y - 60}px`, scale: 1, opacity: 0 },
      ],
      { duration: 1500, easing: "cubic-bezier(.2,.8,.3,1)" },
    ).finished.then(() => text.remove());
  }
}

export function showHarvests(game) {
  const fx = new HarvestFx();
  game.on("harvest", (e) => fx.play(e));
}
