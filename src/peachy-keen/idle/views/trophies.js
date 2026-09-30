import { TROPHIES } from "../data/trophies";
import { el, setText, setDetail, clearOnLeave } from "../dom";
import { iconSvg } from "../icons";

export class TrophiesView {
  constructor(game, root) {
    this.game = game;
    this.summary = el("p", "shop-note", root);
    this.grid = el("div", "trophies", root);
    this.detail = el("p", "shop-detail", root);
    this.detail.setAttribute("aria-live", "polite");
    clearOnLeave(this.grid, this.detail);
    this.cells = TROPHIES.map((t) => {
      const b = el("button", "trophy", this.grid, iconSvg(t.icon || "trophy"));
      b.type = "button";
      const show = () => this.show(t);
      b.addEventListener("pointerenter", show);
      b.addEventListener("focus", show);
      b.addEventListener("click", show);
      return { t, b };
    });
    this.shown = -1;
  }

  show(t) {
    const got = this.game.state.achievements.includes(t.id);
    setDetail(this.detail, got ? t.name : "Locked", [t.about]);
  }

  update() {
    const { achievements } = this.game.state;
    if (achievements.length === this.shown) return;
    this.shown = achievements.length;
    const owned = new Set(achievements);
    this.cells.forEach(({ t, b }) => {
      const got = owned.has(t.id);
      b.classList.toggle("is-unlocked", got);
      b.setAttribute("aria-label", got ? t.name : `Locked trophy`);
    });
    const per = 0.01 + this.game.model.blushPer;
    setText(
      this.summary,
      `${achievements.length} of ${TROPHIES.length} trophies. Each one adds ${Math.round(per * 1000) / 10}% juice.`,
    );
  }
}
