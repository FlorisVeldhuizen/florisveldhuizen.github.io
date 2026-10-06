import { el, animate } from "./dom";
import { format } from "./numbers";
import { renders } from "./renders";
import { reducedMotion } from "../util";

const FRUIT = 5;
const FRUIT_POP = 1.2;
const FRUIT_DOCK = 0.5;
const FRUIT_STAGGER = 0.14;
const FRUIT_HANG = 0.5;
const FRUIT_LIFT = 1.1;
const FRUIT_SPREAD = 0.7;

function shown(node) {
  return node?.getClientRects().length ? node : null;
}

function centerOf(node) {
  const box = node.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

const TARGETS = {
  juice: () => document.getElementById("count-unit"),
  pits: () => document.querySelector("#pits .pit-icon"),
  nectar: () => document.getElementById("tab-ripen"),
  frenzy: () => document.querySelector(".buff-frenzy"),
};

function targetFor(kind, i) {
  if (!TARGETS[kind]) return { at: i.toScreen(i.group.position), node: null };
  const node = shown(TARGETS[kind]());
  return node && { at: centerOf(node), node };
}

function heldAmount(reward) {
  if (reward.kind === "juice") return ["juice", reward.value];
  if (reward.kind === "pits") return ["pits", reward.amount];
  return null;
}

function share(kind, amount, n) {
  if (kind === "juice") return amount / FRUIT;
  return Math.floor(amount / FRUIT) + (n < amount % FRUIT ? 1 : 0);
}

class HarvestFx {
  constructor(interaction, hud) {
    this.i = interaction;
    this.hud = hud;
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
    const { kind } = reward;
    const held = heldAmount(reward);
    if (held) this.hud.hold(...held);
    const carries = Array.from({ length: FRUIT }, (_, n) =>
      held ? share(...held, n) : 0,
    );
    renders.fruitIcon(seed, (url) => {
      this.hud.launch({ x: cx, y: cy }, carries, {
        make: () => `<img class="harvest-fruit" src="${url}" alt="">`,
        target: () => targetFor(kind, this.i)?.at,
        pop: FRUIT_POP,
        dock: FRUIT_DOCK,
        stagger: FRUIT_STAGGER,
        hang: FRUIT_HANG,
        lift: FRUIT_LIFT,
        spread: FRUIT_SPREAD,
        land: (f, progress) => {
          this.burst(f.x, f.y, seed.color, 6, 0.6);
          if (held) {
            this.hud.release(kind, f.carry, 0.5 + progress);
            return;
          }
          const node = targetFor(kind, this.i)?.node;
          if (node)
            animate(
              node,
              [{ scale: 1 }, { scale: 1.06 + 0.12 * progress }, { scale: 1 }],
              { duration: 240, easing: "cubic-bezier(.3,.7,.3,1.4)" },
            );
        },
      });
    });
  }

  burst(cx, cy, color, count = 12, reach = 1) {
    for (let n = 0; n < count; n += 1) {
      const dot = el("i", "harvest-spark", this.layer);
      dot.style.background = n % 3 ? color : "#ffe08a";
      const a = (n / count) * Math.PI * 2 + Math.random() * 0.4;
      const d = (30 + Math.random() * 34) * reach;
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

export function showHarvests(game, hud) {
  const fx = new HarvestFx(game.i, hud);
  game.on("harvest", (e) => fx.play(e));
}
