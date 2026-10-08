/* eslint-disable no-param-reassign -- painters set state on the canvas context they are given */
import { TAU, grain, roundRect } from "./art";
import { GOLD, H, SERIF, W, figure, textFit } from "./layout";
import { fitSymbol } from "./symbols";

const MID = W / 2;
const MED = { y: 276, r: 90 };
const SOFT = "rgba(244, 207, 142, 0.45)";
const SYMBOL_Y = 137;
const CLEAR = "rgba(0, 0, 0, 0)";

const S = {
  foil: [1, 0.82, 0.45],
  foilSat: 0.5,
  edge: [0.85, 0.65, 0.3],
  ink: GOLD,
  lw: 1.3,
  lineOnly: true,
  glow(c) {
    c.shadowColor = "rgba(255, 205, 140, 0.45)";
    c.shadowBlur = 4;
  },
  moon: CLEAR,
  gold: CLEAR,
  wood: CLEAR,
  oil: CLEAR,
  drop: CLEAR,
  grip: CLEAR,
  blush: CLEAR,
  lips: CLEAR,
};

function foil(c, y0, y1) {
  const g = c.createLinearGradient(0, y0, W, y1);
  g.addColorStop(0, "#c99a52");
  g.addColorStop(0.3, "#fff0c4");
  g.addColorStop(0.55, "#d8a95c");
  g.addColorStop(0.8, "#ffe6aa");
  g.addColorStop(1, "#b88a44");
  return g;
}

function stepped(c, inset) {
  const l = 26 + inset;
  const r = W - 26 - inset;
  const b = H - 26 - inset;
  const corners = [
    [l, 128 + inset],
    [l + 22, 128 + inset],
    [l + 22, 104 + inset],
    [l + 48, 104 + inset],
    [l + 48, 80 + inset],
  ];
  c.beginPath();
  c.moveTo(l, b);
  corners.forEach(([x, y]) => c.lineTo(x, y));
  [...corners].reverse().forEach(([x, y]) => c.lineTo(W - x, y));
  c.lineTo(r, b);
  c.closePath();
}

function wedges(c) {
  c.fillStyle = "rgba(244, 207, 142, 0.08)";
  c.strokeStyle = "rgba(244, 207, 142, 0.16)";
  c.lineWidth = 0.6;
  for (let k = 0; k < 24; k += 1) {
    const a = (k / 24) * TAU;
    const w = TAU / 24 / 2.6;
    c.beginPath();
    c.moveTo(
      MID + Math.cos(a) * (MED.r + 20),
      MED.y + Math.sin(a) * (MED.r + 20),
    );
    c.lineTo(MID + Math.cos(a - w) * 420, MED.y + Math.sin(a - w) * 420);
    c.lineTo(MID + Math.cos(a + w) * 420, MED.y + Math.sin(a + w) * 420);
    c.closePath();
    c.fill();
    c.stroke();
  }
}

function dotted(c) {
  c.save();
  stepped(c, 13.5);
  c.setLineDash([0.1, 7]);
  c.lineCap = "round";
  c.lineWidth = 1.8;
  c.strokeStyle = GOLD;
  c.stroke();
  c.restore();
}

function fan(c, x, y, flip) {
  c.save();
  c.translate(x, y);
  c.scale(flip, 1);
  c.strokeStyle = GOLD;
  c.lineWidth = 0.8;
  for (let k = 1; k <= 3; k += 1) {
    c.beginPath();
    c.arc(0, 0, k * 11, -Math.PI / 2, 0);
    c.stroke();
  }
  for (let k = 0; k <= 4; k += 1) {
    const a = -Math.PI / 2 + (k / 4) * (Math.PI / 2);
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(Math.cos(a) * 33, Math.sin(a) * 33);
    c.stroke();
  }
  c.restore();
}

function plum(c) {
  const g = c.createRadialGradient(MID, H * 0.5, 20, MID, H / 2, H * 0.64);
  g.addColorStop(0, "#46143c");
  g.addColorStop(0.6, "#2a0b25");
  g.addColorStop(1, "#170614");
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
  grain(c, W, H, 0.05, 255, 0);
  c.save();
  c.strokeStyle = foil(c, 0, H);
  c.lineWidth = 3;
  roundRect(c, 6, 6, W - 12, H - 12, 15);
  c.stroke();
  c.restore();
}

function medallion(c) {
  const glow = c.createRadialGradient(
    MID,
    MED.y - 10,
    10,
    MID,
    MED.y,
    MED.r * 1.9,
  );
  glow.addColorStop(0, "rgba(255, 170, 150, 0.26)");
  glow.addColorStop(0.5, "rgba(214, 96, 140, 0.1)");
  glow.addColorStop(1, "rgba(214, 96, 140, 0)");
  c.fillStyle = glow;
  c.fillRect(0, 0, W, H);
  c.save();
  c.beginPath();
  c.arc(MID, MED.y, MED.r, 0, TAU);
  const m = c.createRadialGradient(MID, MED.y - 30, 10, MID, MED.y, MED.r);
  m.addColorStop(0, "rgba(110, 30, 84, 0.85)");
  m.addColorStop(1, "rgba(30, 6, 26, 0.9)");
  c.fillStyle = m;
  c.fill();
  c.strokeStyle = foil(c, MED.y - MED.r, MED.y + MED.r);
  c.lineWidth = 1.3;
  c.stroke();
  c.strokeStyle = SOFT;
  c.lineWidth = 0.7;
  c.beginPath();
  c.arc(MID, MED.y, MED.r - 6, 0, TAU);
  c.stroke();
  c.strokeStyle = GOLD;
  for (let k = 0; k < 32; k += 1) {
    const a = (k / 32) * TAU;
    const len = k % 4 ? 5 : 11;
    c.beginPath();
    c.moveTo(
      MID + Math.cos(a) * (MED.r + 5),
      MED.y + Math.sin(a) * (MED.r + 5),
    );
    c.lineTo(
      MID + Math.cos(a) * (MED.r + 5 + len),
      MED.y + Math.sin(a) * (MED.r + 5 + len),
    );
    c.stroke();
  }
  c.restore();
}

function plaque(c, card) {
  const y = H - 92;
  c.save();
  c.beginPath();
  c.moveTo(78, y);
  c.lineTo(W - 78, y);
  c.lineTo(W - 66, y + 15);
  c.lineTo(W - 78, y + 30);
  c.lineTo(78, y + 30);
  c.lineTo(66, y + 15);
  c.closePath();
  c.fillStyle = "rgba(24, 5, 20, 0.85)";
  c.fill();
  c.strokeStyle = foil(c, y, y + 30);
  c.lineWidth = 1;
  c.stroke();
  c.fillStyle = GOLD;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.font = `500 14px ${SERIF}`;
  c.letterSpacing = "5px";
  textFit(c, card.name, MID + 2.5, y + 16, W - 176);
  [-1, 1].forEach((side) => {
    c.beginPath();
    c.moveTo(MID + side * 94, y + 11);
    c.lineTo(MID + side * 98, y + 15);
    c.lineTo(MID + side * 94, y + 19);
    c.lineTo(MID + side * 90, y + 15);
    c.closePath();
    c.fill();
  });
  c.font = `italic 400 17px ${SERIF}`;
  c.letterSpacing = "1px";
  c.fillText(card.n, MID, 52);
  c.restore();
}

// Separate stages so a face can be painted one stage per idle slot.
const stages = (c, card, art) => [
  () => plum(c),
  () => {
    c.save();
    stepped(c, 10);
    c.clip();
    wedges(c);
    c.restore();
  },
  () => {
    c.save();
    S.glow(c);
    stepped(c, 10);
    c.strokeStyle = foil(c, 0, H);
    c.lineWidth = 1.3;
    c.stroke();
    c.restore();
    stepped(c, 17);
    c.strokeStyle = SOFT;
    c.lineWidth = 0.7;
    c.stroke();
    dotted(c);
    fan(c, 44, H - 44, 1);
    fan(c, W - 44, H - 44, -1);
  },
  () => medallion(c),
  () => {
    c.save();
    c.beginPath();
    c.arc(MID, MED.y, MED.r - 7, 0, TAU);
    c.clip();
    figure(art, c, card, MID, MED.y + 9, 146, {
      look: "skin",
      rim: GOLD,
      rimWidth: 0.8,
      pair: 0.64,
      gap: 0.27,
    });
    c.restore();
  },
  () => fitSymbol(c, card.id, S, MID, SYMBOL_Y, 74, 48, art),
  () => plaque(c, card),
];

export default { S, stages };
