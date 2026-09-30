import { el, setText, animate } from "./dom";
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

const swing = (origin, ...turns) =>
  [0, ...turns, 0].map((deg) => ({
    transform: `rotate(${deg}deg)`,
    transformOrigin: origin,
  }));

const MOTIONS = {
  hand: swing("50% 90%", -16, 12, -8, 4),
  trophy: swing("50% 95%", 10, -8, 4),
  recipe: [
    { transform: "none" },
    { transform: "translateY(-5px) scale(0.94, 1.08)" },
    { transform: "translateY(0) scale(1.1, 0.9)" },
    { transform: "translateY(-1.5px)" },
    { transform: "none" },
  ],
  blush: [
    { transform: "none" },
    { transform: "scale(1.22)" },
    { transform: "scale(0.96)" },
    { transform: "scale(1.12)" },
    { transform: "none" },
  ],
};

const GROW = "cubic-bezier(0.33, 0, 0.2, 1)";

function draw(path, duration, delay = 0) {
  path.setAttribute("pathLength", "1");
  animate(
    path,
    [
      { strokeDasharray: "1 1", strokeDashoffset: 1 },
      { strokeDasharray: "1 1", strokeDashoffset: 0 },
    ],
    { duration, delay, easing: GROW, fill: "backwards" },
  );
}

function unfurl(path, origin, turn, delay) {
  animate(
    path,
    [
      { transform: `scale(0.2) rotate(${turn}deg)`, transformOrigin: origin },
      { transform: "none", transformOrigin: origin },
    ],
    { duration: 700, delay, easing: GROW, fill: "backwards" },
  );
}

function growPlant(icon) {
  if (!icon.dataset.split) {
    const d = icon.querySelector("path").getAttribute("d");
    // eslint-disable-next-line no-param-reassign
    icon.innerHTML = d
      .split(/(?=M)/)
      .map((part) => `<path d="${part}"/>`)
      .join("");
    // eslint-disable-next-line no-param-reassign
    icon.dataset.split = "1";
  }
  const [stem, top, side] = icon.querySelectorAll("path");
  draw(stem, 800);
  draw(side, 700, 480);
  unfurl(side, "12px 14px", 25, 480);
  draw(top, 700, 720);
  unfurl(top, "12px 11px", -25, 720);
}

const REFRESH = 0.2;
const TAB_KEY = "peachy-keen-tab";
const OPEN_KEY = "peachy-keen-shop-open";
const WIDE = window.matchMedia("(min-width: 900px)");

export class Panel {
  constructor(game, orchard, settings, modal) {
    this.game = game;
    this.modal = modal;
    this.root = document.getElementById("panel");
    this.handle = document.getElementById("panel-handle");
    const head = el("div", "panel-head", this.root);
    this.tabs = el("nav", "tabs", head);
    this.tabs.setAttribute("role", "tablist");
    this.tabs.setAttribute("aria-label", "Shop");
    this.body = el("div", "panel-body", this.root);
    this.title = el("h2", "panel-title", this.body);
    this.sections = {};
    this.buttons = {};
    this.scrolls = {};
    this.tabs.addEventListener("keydown", (e) => this.moveTab(e));
    this.tabs.addEventListener("wheel", (e) => this.scrollTabs(e), {
      passive: false,
    });
    TABS.forEach(([id, label, icon]) => {
      const b = el(
        "button",
        "tab",
        this.tabs,
        `${iconSvg(icon)}<span>${label}</span><b class="tab-badge" hidden></b>`,
      );
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", label);
      b.title = label;
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
    this.open = WIDE.matches;
    try {
      if (this.open) this.open = localStorage.getItem(OPEN_KEY) !== "0";
    } catch {
      // The shop then starts open.
    }
    this.collapse = el("button", "panel-collapse", head, iconSvg("chevron"));
    this.collapse.type = "button";
    [this.handle, this.collapse].forEach((b) =>
      b.addEventListener("click", () => this.setOpen(!this.open)),
    );
    let saved = "helpers";
    try {
      saved = localStorage.getItem(TAB_KEY) || saved;
    } catch {
      // The first tab is fine when storage is blocked.
    }
    this.show(this.buttons[saved] ? saved : "helpers");
    this.root.style.transition = "none";
    this.setOpen(this.open);
    this.root.getBoundingClientRect();
    this.root.style.transition = "";
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
    const label = open ? "Hide the shop" : "Open the shop";
    this.handle.setAttribute("aria-expanded", String(open));
    setText(this.handle.querySelector("span"), label);
    this.collapse.setAttribute("aria-expanded", String(open));
    this.collapse.setAttribute("aria-label", label);
    this.collapse.title = label;
    if (!WIDE.matches) return;
    try {
      localStorage.setItem(OPEN_KEY, open ? "1" : "0");
    } catch {
      // The shop then opens again on the next visit.
    }
  }

  scrollTabs(e) {
    const { tabs } = this;
    if (tabs.scrollWidth <= tabs.clientWidth) return;
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
    e.preventDefault();
    tabs.scrollLeft += e.deltaY;
  }

  moveTab(e) {
    const shown = TABS.map(([id]) => id).filter(
      (id) => !this.buttons[id].hidden,
    );
    const at = shown.indexOf(this.current);
    const next = {
      ArrowLeft: shown[(at - 1 + shown.length) % shown.length],
      ArrowRight: shown[(at + 1) % shown.length],
      Home: shown[0],
      End: shown[shown.length - 1],
    }[e.key];
    if (!next) return;
    e.preventDefault();
    this.show(next, true);
    this.buttons[next].focus();
  }

  show(id, fromTap = false) {
    if (this.current) this.scrolls[this.current] = this.body.scrollTop;
    if (this.current && id !== this.current) this.celebrate(id);
    this.current = id;
    Object.entries(this.sections).forEach(([key, section]) => {
      // eslint-disable-next-line no-param-reassign
      section.hidden = key !== id;
      this.buttons[key].setAttribute("aria-selected", String(key === id));
      this.buttons[key].tabIndex = key === id ? 0 : -1;
    });
    this.body.scrollTop = this.scrolls[id] || 0;
    setText(this.title, TABS.find(([key]) => key === id)[1]);
    this.settings.visible = id === "options";
    if (fromTap && !this.open) this.setOpen(true);
    try {
      localStorage.setItem(TAB_KEY, id);
    } catch {
      // Tab choice then lasts for this visit only.
    }
    this.timer = 0;
  }

  celebrate(id) {
    const icon = this.buttons[id].querySelector(".icon");
    const name = TABS.find(([key]) => key === id)[2];
    const motion = MOTIONS[name];
    if (motion) {
      animate(icon, motion, {
        duration: 560,
        easing: "cubic-bezier(0.3, 0.7, 0.3, 1)",
      });
      return;
    }
    if (name === "seed") growPlant(icon);
    else draw(icon.querySelector("path"), 720);
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
