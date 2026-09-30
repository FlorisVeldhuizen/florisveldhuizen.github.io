import { newsFor } from "./data/news";
import { animate } from "./dom";

const EVERY = 10;

export class Ticker {
  constructor(game) {
    this.game = game;
    this.el = document.getElementById("ticker");
    this.timer = 2;
    this.last = "";
  }

  update(delta) {
    const on = this.game.state.options.ticker;
    this.el.hidden = !on;
    if (!on) return;
    this.timer -= delta;
    if (this.timer > 0) return;
    this.timer = EVERY;
    const lines = newsFor(this.game.state).filter((line) => line !== this.last);
    const line = lines[Math.floor(Math.random() * lines.length)];
    this.last = line;
    this.el.textContent = line;
    animate(
      this.el,
      [
        { opacity: 0, transform: "translateY(6px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 600, easing: "ease-out" },
    );
  }
}
