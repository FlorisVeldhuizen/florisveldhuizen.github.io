/* eslint-disable no-param-reassign -- painters set state on the canvas context they are given */
import { SRGBColorSpace, Texture } from "three";
import makePeachArt from "./peach-art";
import { bounds } from "./symbols";
import { TAU, grain, rays, roundRect, sparkle } from "./art";
import { GOLD, GOLD_DIM, H, W } from "./layout";
import face from "./face";

const S = {
  ink: GOLD,
  lw: 2.2,
  glow(c) {
    c.shadowColor = "rgba(255, 205, 140, 0.55)";
    c.shadowBlur = 7;
  },
  spark: GOLD,
};

export const CARDS = [
  {
    id: "cheeks",
    pose: "back",
    n: "0",
    name: "THE CHEEKS",
    line: "The Cheeks. Well, obviously.",
    shy: "The Cheeks. Oh. That is… me.",
  },
  {
    id: "hand",
    pose: "back",
    n: "I",
    name: "THE HAND",
    line: "The Hand. Someone has plans for you.",
    shy: "The Hand. Someone might… hold me?",
  },
  {
    id: "veil",
    pose: "threeq",
    n: "II",
    name: "THE VEIL",
    line: "The Veil. A little mystery. A little peek.",
    shy: "The Veil. I would rather stay covered. Maybe.",
  },
  {
    id: "empress",
    pose: "back",
    n: "III",
    name: "THE EMPRESS",
    line: "The Empress. Bow to the behind.",
    shy: "The Empress. Me? Royal? Oh, stop.",
  },
  {
    id: "lovers",
    pose: "threeq",
    n: "VI",
    name: "THE LOVERS",
    line: "The Lovers. Someone wants a squeeze.",
    shy: "The Lovers. Someone likes me. Eek.",
  },
  {
    id: "paddle",
    pose: "tilt",
    n: "VII",
    name: "THE PADDLE",
    line: "The Paddle. Brace yourself, sweetheart.",
    shy: "The Paddle. Gently, please.",
  },
  {
    id: "firm",
    pose: "back",
    n: "VIII",
    name: "FIRMNESS",
    line: "Firmness. You can take it.",
    shy: "Firmness. I will try to be brave.",
  },
  {
    id: "wheel",
    pose: "back",
    n: "X",
    name: "FORTUNE",
    line: "Fortune. What goes around comes around. Firmly.",
    shy: "Fortune. Things go round. So do I.",
  },
  {
    id: "kiss",
    pose: "side",
    n: "XI",
    name: "THE KISS",
    line: "The Kiss. Pucker up, buttercup.",
    shy: "The Kiss. A little one. On the cheek.",
  },
  {
    id: "oil",
    pose: "threeq",
    n: "XIV",
    name: "THE OIL",
    line: "The Oil. Slippery times ahead.",
    shy: "The Oil. That sounds… slippery.",
  },
  {
    id: "star",
    pose: "back",
    n: "XVII",
    name: "THE STAR",
    line: "The Star. The brightest bum in the sky.",
    shy: "The Star. Everyone is looking. Oh no.",
  },
  {
    id: "moon",
    pose: "above",
    n: "XVIII",
    name: "THE MOON",
    line: "The Moon. Things look full tonight.",
    shy: "The Moon. Is it showing? It is showing.",
  },
  {
    id: "sun",
    pose: "back",
    n: "XIX",
    name: "THE SUN",
    line: "The Sun. Warm days, warmer cheeks.",
    shy: "The Sun. I am blushing. It is the sun.",
  },
  {
    id: "world",
    pose: "threeq",
    n: "XXI",
    name: "PEACHVERSE",
    line: "The Peachverse. It all revolves around you.",
    shy: "The Peachverse. All of it? For me?",
  },
];

function base(c) {
  const g = c.createRadialGradient(W / 2, H * 0.42, 20, W / 2, H / 2, H * 0.62);
  g.addColorStop(0, "#5a1c46");
  g.addColorStop(0.55, "#33102c");
  g.addColorStop(1, "#1c0818");
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  grain(c, W, H, 0.06, 255, 0);
  c.save();
  roundRect(c, 5, 5, W - 10, H - 10, 20);
  c.lineWidth = 4;
  c.strokeStyle = GOLD;
  c.stroke();
  roundRect(c, 17, 17, W - 34, H - 34, 11);
  c.lineWidth = 1.2;
  c.strokeStyle = GOLD_DIM;
  c.stroke();
  c.restore();
}

function back(c, P) {
  base(c);
  c.save();
  roundRect(c, 24, 24, W - 48, H - 48, 8);
  c.clip();
  c.strokeStyle = "rgba(244, 207, 142, 0.09)";
  c.lineWidth = 1;
  for (let k = -H; k < W + H; k += 24) {
    c.beginPath();
    c.moveTo(k, 0);
    c.lineTo(k + H, H);
    c.moveTo(k, H);
    c.lineTo(k + H, 0);
    c.stroke();
  }
  c.restore();
  const x = W / 2;
  const y = H / 2;
  rays(c, { ...S, ink: GOLD_DIM, lw: 1.6 }, x, y, 90, 124, 32);
  c.save();
  c.fillStyle = "#2a0c24";
  c.beginPath();
  c.arc(x, y, 80, 0, TAU);
  c.fill();
  c.strokeStyle = GOLD;
  c.lineWidth = 2.2;
  S.glow(c);
  c.stroke();
  c.lineWidth = 1;
  c.beginPath();
  c.arc(x, y, 72, 0, TAU);
  c.stroke();
  c.restore();
  P.gold(c, "back", x, y - 3, 128);
  sparkle(c, S, [
    [x, 70, 9],
    [x, H - 70, 9],
  ]);
}

let fontsReady = null;
const loadFonts = () => {
  if (!fontsReady)
    fontsReady = Promise.all(
      ["500 14px Fraunces", "italic 400 17px Fraunces"].map((f) =>
        document.fonts.load(f).catch(() => null),
      ),
    );
  return fontsReady;
};

const POSES = ["back", "threeq", "threeqL", "side", "tilt", "above"];
const ETCHED_PLAN = [
  ...POSES.flatMap((pose) => [
    [pose, "skin", 160],
    [pose, GOLD, 160],
  ]),
  ["back", "gold", 128],
  ["back", "mark", 80],
  ["back", "#000000", 80],
];

let fontsLoaded = false;
const FACE_FONTS = [
  "500 14px Fraunces, Georgia, serif",
  "italic 400 17px Fraunces, Georgia, serif",
];

export function makeDeck(renderer, render) {
  const P = makePeachArt(ETCHED_PLAN, render);
  const { jobs } = P;
  const make = (paint) => {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const c = canvas.getContext("2d");
    paint(c);
    const t = new Texture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 8;
    t.needsUpdate = true;
    return { t, c, canvas, paint };
  };
  const upload = (entry) => {
    renderer.initTexture(entry.t);
    entry.canvas.width = 0;
    entry.t.image = { width: W, height: H };
  };
  const faces = new Map();
  const ready = new Map();
  const idle = (fn) =>
    window.requestIdleCallback
      ? window.requestIdleCallback(fn, { timeout: 600 })
      : setTimeout(fn, 30);
  CARDS.forEach((card) => jobs.push(() => bounds(card.id, face.S, P)));
  const probe = document.createElement("canvas").getContext("2d");
  FACE_FONTS.forEach((font) =>
    jobs.push(() => {
      if (!fontsLoaded) return false;
      probe.font = font;
      probe.measureText("THE CHEEKS XVIII");
      return true;
    }),
  );
  const backTexture = new Texture();
  backTexture.colorSpace = SRGBColorSpace;
  backTexture.anisotropy = 8;
  let backEntry = null;
  jobs.push(() => {
    if (!fontsLoaded) return false;
    backEntry = make((c) => back(c, P));
    return true;
  });
  jobs.push(() => {
    backTexture.image = backEntry.canvas;
    backTexture.needsUpdate = true;
    renderer.initTexture(backTexture);
    backEntry.canvas.width = 0;
    backEntry.t.dispose();
    backTexture.image = { width: W, height: H };
  });
  loadFonts().then(() => {
    fontsLoaded = true;
  });
  return {
    jobs,
    style: face.S,
    back: backTexture,
    prepare(index) {
      if (faces.has(index) || ready.has(index)) return;
      if (!fontsLoaded) {
        loadFonts().then(() => this.prepare(index));
        return;
      }
      ready.forEach((e, k) => {
        if (e) e.canvas.width = 0;
        ready.delete(k);
      });
      ready.set(index, null);
      const entry = make(() => {});
      const stages = face.stages(entry.c, CARDS[index], P);
      const run = () => {
        if (!ready.has(index)) {
          entry.canvas.width = 0;
          return;
        }
        stages.shift()();
        if (stages.length) idle(run);
        else ready.set(index, entry);
      };
      idle(run);
    },
    face(index) {
      if (!faces.has(index)) {
        const pre = ready.get(index);
        ready.delete(index);
        let entry = pre;
        if (!entry) {
          entry = make(() => {});
          face.stages(entry.c, CARDS[index], P).forEach((stage) => stage());
        }
        upload(entry);
        faces.set(index, entry.t);
      }
      return faces.get(index);
    },
    release(index) {
      const t = faces.get(index);
      if (!t) return;
      t.dispose();
      faces.delete(index);
    },
    dispose() {
      faces.forEach((t) => t.dispose());
      backTexture.dispose();
      ready.forEach((e) => {
        if (e) e.canvas.width = 0;
      });
      ready.clear();
      P.dispose();
    },
  };
}
