import { el, setText } from "../dom";
import { format, formatTime } from "../numbers";

const ROWS = [
  ["Juice in the bank", (s) => format(s.juice)],
  ["Juice this run", (s) => format(s.juiceRun)],
  ["Juice ever", (s) => format(s.juiceTotal)],
  ["Juice per second", (s, g) => format(g.rate)],
  ["Best juice per second", (s) => format(s.stats.bestRate)],
  ["Juice from your hands", (s) => format(s.stats.handJuice)],
  ["Smacks", (s) => format(s.stats.smacks, { whole: true })],
  ["Critical smacks", (s) => format(s.stats.crits, { whole: true })],
  ["Best combo", (s) => `×${s.stats.bestCombo}`],
  ["Bursts", (s) => format(s.stats.bursts, { whole: true })],
  [
    "Pits",
    (s) =>
      `${format(s.pits, { whole: true })} (${format(s.pitsTotal, { whole: true })} ever)`,
  ],
  ["Golden peaches", (s) => format(s.stats.goldens, { whole: true })],
  ["Grabs", (s) => format(s.stats.grabs, { whole: true })],
  ["Time rubbing", (s) => formatTime(s.stats.rubSeconds)],
  ["Twerks", (s) => format(s.stats.twerks, { whole: true })],
  ["Wedgies", (s) => format(s.stats.wedgies, { whole: true })],
  ["Harvests", (s) => format(s.stats.harvests, { whole: true })],
  ["Ripenings", (s) => format(s.stats.ripens, { whole: true })],
  ["Nectar earned", (s) => format(s.nectarTotal, { whole: true })],
  ["This run", (s) => formatTime(s.runTime)],
  ["Time played", (s) => formatTime(s.stats.played)],
  ["Time away", (s) => formatTime(s.stats.away)],
];

export class StatsView {
  constructor(game, root) {
    this.game = game;
    const list = el("dl", "stats", root);
    this.values = ROWS.map(([label, read]) => {
      el("dt", "", list).textContent = label;
      return { node: el("dd", "", list), read };
    });
  }

  update() {
    const { state } = this.game;
    this.values.forEach(({ node, read }) =>
      setText(node, read(state, this.game)),
    );
  }
}
