import { el, setText } from "./dom";
import { iconSvg } from "./icons";
import { HelpersView } from "./views/helpers";
import { UpgradesView } from "./views/upgrades";
import { OrchardView } from "./views/orchard";
import { RipenView } from "./views/ripen";
import { TrophiesView } from "./views/trophies";
import { StatsView } from "./views/stats";
import { OptionsView } from "./views/options";

const TABS = [
  ["helpers", "Helpers", "hand"],
  ["upgrades", "Upgrades", "recipe"],
  ["orchard", "Orchard", "seed"],
  ["ripen", "Ripen", "nectar"],
  ["trophies", "Trophies", "trophy"],
  ["stats", "Stats", "juice"],
  ["options", "Options", "blush"],
];

const REFRESH = 0.2;
const TAB_KEY = "peachy-keen-tab";

export class Panel {
  constructor(game, orchard, settings, modal) {
    this.game = game;
    this.modal = modal;
    this.root = document.getElementById("panel");
    this.handle = document.getElementById("panel-handle");
    this.tabs = el("nav", "tabs", this.root);
    this.tabs.setAttribute("role", "tablist");
    this.tabs.setAttribute("aria-label", "Shop");
    this.body = el("div", "panel-body", this.root);
    this.sections = {};
    this.buttons = {};
    TABS.forEach(([id, label, icon]) => {
      const b = el(
        "button",
        "tab",
        this.tabs,
        `${iconSvg(icon)}<span>${label}</span><b class="tab-badge" hidden></b>`,
      );
      b.type = "button";
      b.setAttribute("role", "tab");
      b.id = `tab-${id}`;
      b.addEventListener("click", () => this.show(id, true));
      this.buttons[id] = b;
      const section = el("section", `tab-panel tab-${id}`, this.body);
      section.setAttribute("role", "tabpanel");
      section.setAttribute("aria-labelledby", b.id);
      section.hidden = true;
      this.sections[id] = section;
    });
    const confirm = (options) => modal.confirm(options);
    this.views = {
      helpers: new HelpersView(game, this.sections.helpers),
      upgrades: new UpgradesView(game, this.sections.upgrades),
      orchard: new OrchardView(game, orchard, this.sections.orchard),
      ripen: new RipenView(game, this.sections.ripen, confirm),
      trophies: new TrophiesView(game, this.sections.trophies),
      stats: new StatsView(game, this.sections.stats),
      options: new OptionsView(game, this.sections.options, settings, confirm),
    };
    this.settings = settings;
    this.timer = 0;
    this.open = window.matchMedia("(min-width: 900px)").matches;
    this.handle.addEventListener("click", () => this.setOpen(!this.open));
    let saved = "helpers";
    try {
      saved = localStorage.getItem(TAB_KEY) || saved;
    } catch {
      // The first tab is fine when storage is blocked.
    }
    this.show(this.buttons[saved] ? saved : "helpers");
    this.setOpen(this.open);
    game.on("change", () => {
      this.timer = 0;
    });
    game.on("replace", () => {
      Object.values(this.views).forEach((v) => {
        // eslint-disable-next-line no-param-reassign
        v.signature = "";
      });
      this.timer = 0;
    });
  }

  setOpen(open) {
    this.open = open;
    this.root.classList.toggle("is-open", open);
    document.body.classList.toggle("is-shopping", open);
    this.handle.setAttribute("aria-expanded", String(open));
    setText(
      this.handle.querySelector("span"),
      open ? "Hide the shop" : "Open the shop",
    );
  }

  show(id, fromTap = false) {
    this.current = id;
    Object.entries(this.sections).forEach(([key, section]) => {
      // eslint-disable-next-line no-param-reassign
      section.hidden = key !== id;
      this.buttons[key].setAttribute("aria-selected", String(key === id));
    });
    this.settings.visible = id === "options";
    if (fromTap && !this.open) this.setOpen(true);
    try {
      localStorage.setItem(TAB_KEY, id);
    } catch {
      // Tab choice then lasts for this visit only.
    }
    this.timer = 0;
  }

  update(delta) {
    this.timer -= delta;
    if (this.timer > 0) return;
    this.timer = REFRESH;
    const { state } = this.game;
    this.buttons.orchard.hidden = !state.orchard.open;
    this.buttons.ripen.hidden =
      state.nectarTotal === 0 &&
      this.game.pendingNectar() === 0 &&
      state.stats.ripens === 0;
    const badge = (id, count) => {
      const b = this.buttons[id].querySelector(".tab-badge");
      b.hidden = !count;
      setText(b, count);
    };
    badge("upgrades", this.views.upgrades.affordableCount());
    badge("ripen", this.game.pendingNectar() > 0 ? "!" : 0);
    if (this.buttons[this.current].hidden) this.show("helpers");
    this.views[this.current].update();
  }
}
