import { TROPHIES } from "../data/trophies";
import {
  el,
  setText,
  setDetail,
  clearOnLeave,
  floatBeside,
  toggle,
} from "../dom";
import { iconSvg } from "../icons";

const NEAR = 3;

export class TrophiesView {
  constructor(game, root) {
    this.game = game;
    this.summary = el("p", "shop-note", root);
    this.nearTitle = el("h3", "shop-title", root, "Almost there");
    const list = el("ol", "near", root);
    this.near = Array.from({ length: NEAR }, () => {
      const li = el("li", "near-row", list);
      const icon = el("span", "near-icon", li);
      const main = el("span", "near-main", li);
      const head = el("span", "near-head", main);
      return {
        li,
        icon,
        name: el("span", "near-name", head),
        count: el("span", "near-count", head),
        about: el("span", "near-about", main),
        bar: el("b", "", el("i", "near-bar", main)),
      };
    });
    this.grid = el("div", "trophies", root);
    this.detail = el("p", "shop-detail is-floating", root);
    this.detail.setAttribute("aria-live", "polite");
    clearOnLeave(this.grid, this.detail);
    this.cells = TROPHIES.map((t) => {
      const b = el("button", "trophy", this.grid, iconSvg(t.icon || "trophy"));
      b.type = "button";
      const show = () => this.show(t, b);
      b.addEventListener("pointerenter", show);
      b.addEventListener("focus", show);
      b.addEventListener("click", show);
      b.addEventListener("animationend", (e) => {
        if (e.animationName === "trophy-soak") b.classList.remove("is-seen");
      });
      return { t, b };
    });
    this.shown = -1;
  }

  show(t, anchor) {
    const { achievements, trophiesRead } = this.game.state;
    const got = achievements.includes(t.id);
    if (got && !trophiesRead.includes(t.id)) {
      trophiesRead.push(t.id);
      toggle(anchor, "is-new", false);
      anchor.classList.add("is-seen");
    }
    setDetail(this.detail, got ? t.name : "Locked", [t.about]);
    floatBeside(this.detail, anchor);
  }

  updateNear() {
    const s = this.game.state;
    const owned = new Set(s.achievements);
    const near = TROPHIES.filter((t) => t.need && !owned.has(t.id))
      .map((t) => {
        const have = t.count(s);
        return { t, have, share: have / t.need };
      })
      .filter(({ share }) => share > 0)
      .sort((a, b) => b.share - a.share)
      .slice(0, NEAR);
    this.nearTitle.hidden = !near.length;
    for (let n = 0; n < NEAR; n += 1) {
      const row = this.near[n];
      const pick = near[n];
      toggle(row.li, "is-empty", !pick);
      if (pick) {
        const { t, have, share } = pick;
        if (row.id !== t.id) {
          row.id = t.id;
          row.icon.innerHTML = iconSvg(t.icon || "trophy");
          setText(row.name, t.name);
          setText(row.about, t.about);
        }
        setText(row.count, `${t.show(have)} / ${t.show(t.need)}`);
        row.bar.style.transform = `scaleX(${share})`;
      }
    }
  }

  update() {
    this.updateNear();
    const { achievements, trophiesRead } = this.game.state;
    if (achievements.length === this.shown) return;
    this.shown = achievements.length;
    const owned = new Set(achievements);
    const read = new Set(trophiesRead);
    this.cells.forEach(({ t, b }) => {
      const got = owned.has(t.id);
      b.classList.toggle("is-unlocked", got);
      toggle(b, "is-new", got && !read.has(t.id));
      b.setAttribute("aria-label", got ? t.name : `Locked trophy`);
    });
    const per = 0.01 + this.game.model.blushPer;
    setText(
      this.summary,
      `${achievements.length} of ${TROPHIES.length} trophies. Each one adds ${Math.round(per * 1000) / 10}% juice.`,
    );
  }
}
