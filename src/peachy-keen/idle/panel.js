import { el, setText, animate, sidePanel } from "./dom";
import { iconSvg } from "./icons";
import { clamp, viewHeight, reducedMotion } from "../util";
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

function strokes(icon) {
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
  return [...icon.querySelectorAll("path")];
}

function growPlant(icon) {
  const [stem, top, side] = strokes(icon);
  draw(stem, 800);
  draw(side, 700, 480);
  unfurl(side, "12px 14px", 25, 480);
  draw(top, 700, 720);
  unfurl(top, "12px 11px", -25, 720);
}

const TILTS = [0, 14, -11, 7, -3, 0];
const SLOSH = [0, -3, 4, -2.5, 1, 0];

function sloshFlask(icon) {
  const liquid = strokes(icon).at(-1);
  const timing = { duration: 950 };
  animate(
    icon,
    TILTS.map((deg) => ({
      transform: `rotate(${deg}deg)`,
      transformOrigin: "50% 88%",
      easing: "ease-in-out",
    })),
    timing,
  );
  animate(
    liquid,
    TILTS.map((deg, n) => ({
      transform: `rotate(${SLOSH[n] - deg}deg)`,
      transformOrigin: "12px 13px",
      easing: "ease-in-out",
    })),
    timing,
  );
}

const SHINE = `<defs><clipPath id="trophy-cup"><path d="M7 4h10v5a5 5 0 0 1-10 0z"/></clipPath></defs><g clip-path="url(#trophy-cup)"><g class="shine" opacity="0"><path d="M3 15L15 3" stroke-width="2.4"/><path d="M6.4 15.6L18.4 3.6" stroke-width="1"/></g></g>`;

function shineTrophy(icon) {
  if (!icon.querySelector(".shine"))
    icon.insertAdjacentHTML("beforeend", SHINE);
  animate(
    icon.querySelector(".shine"),
    [
      { opacity: 1, transform: "translateX(-9px)" },
      { opacity: 1, transform: "translateX(11px)" },
    ],
    { duration: 620, delay: 80, easing: "cubic-bezier(0.5, 0, 0.3, 1)" },
  );
}

const REFRESH = 0.2;
const DRAG_START = 8;
const FLING = 0.6;
const SCORE_PEEK = 64;
const TAB_KEY = "peachy-keen-tab";

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
    const titleRow = el("div", "panel-title-row", this.body);
    this.title = el("h2", "panel-title", titleRow);
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
      b.addEventListener("click", () => {
        if (this.open && id === this.current && !sidePanel.matches)
          this.setOpen(false);
        else this.show(id, true);
      });
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
    Object.values(this.views).forEach((view) => {
      if (view.titleTool) titleRow.append(view.titleTool);
    });
    this.settings = settings;
    this.timer = 0;
    this.open = sidePanel.matches;
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
    this.score = document.querySelector(".score");
    this.dragSheet(head);
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

  setOpen(open, full = false) {
    this.open = open;
    this.root.classList.toggle("is-open", open);
    this.root.classList.toggle("is-full", open && full);
    document.body.classList.toggle("is-shopping", open);
    const label = open ? "Hide the shop" : "Open the shop";
    this.handle.setAttribute("aria-expanded", String(open));
    setText(this.handle.querySelector("span"), label);
    this.collapse.setAttribute("aria-expanded", String(open));
    this.collapse.setAttribute("aria-label", label);
    this.collapse.title = label;
  }

  // The layout measures the panel every frame, so the peach reframes in step with the slide.
  slide(shown) {
    const out = reducedMotion.matches
      ? { opacity: 0 }
      : { translate: sidePanel.matches ? "100% 0" : "0 100%" };
    const frames = shown ? [out, {}] : [{}, out];
    return this.root.animate(frames, {
      duration: shown ? 650 : 450,
      easing: shown
        ? "cubic-bezier(0.2, 0.8, 0.2, 1)"
        : "cubic-bezier(0.4, 0, 0.2, 1)",
      fill: shown ? "backwards" : "forwards",
    }).finished;
  }

  sheetStops() {
    const h = viewHeight();
    const closed = 76 + parseFloat(getComputedStyle(this.root).paddingBottom);
    const full = h - parseFloat(getComputedStyle(this.score).top) - SCORE_PEEK;
    return [closed, Math.min(h * 0.6, 600), full];
  }

  dragSheet(head) {
    const { root } = this;
    let drag = null;
    let dragged = false;
    const begin = (e) => {
      if (sidePanel.matches || !e.isPrimary) return;
      drag = { id: e.pointerId, from: root.offsetHeight, y: e.clientY };
      Object.assign(drag, { at: e.clientY, t: e.timeStamp, v: 0 });
    };
    [this.handle, head].forEach((grip) =>
      grip.addEventListener("pointerdown", begin),
    );
    window.addEventListener("pointermove", (e) => {
      if (drag?.id !== e.pointerId) return;
      if (!drag.moving) {
        if (Math.abs(e.clientY - drag.y) < DRAG_START) return;
        drag.moving = true;
        dragged = true;
        root.classList.add("is-dragging");
      }
      drag.v = (drag.at - e.clientY) / Math.max(1, e.timeStamp - drag.t);
      drag.at = e.clientY;
      drag.t = e.timeStamp;
      const [low, , high] = this.sheetStops();
      const height = clamp(drag.from + drag.y - e.clientY, low, high);
      root.style.height = `${height}px`;
    });
    const end = (e) => {
      if (drag?.id !== e.pointerId) return;
      const { moving, v } = drag;
      drag = null;
      if (!moving) return;
      const at = root.offsetHeight;
      const stops = this.sheetStops();
      let near = stops.reduce(
        (best, stop, n) =>
          Math.abs(stop - at) < Math.abs(stops[best] - at) ? n : best,
        0,
      );
      if (v > FLING) near = stops.findIndex((stop) => stop > at + 1);
      if (v < -FLING) near = stops.findLastIndex((stop) => stop < at - 1);
      if (near < 0) near = v > 0 ? stops.length - 1 : 0;
      root.classList.add("is-released");
      root.classList.remove("is-dragging");
      root.style.height = "";
      this.setOpen(near > 0, near === 2);
      if (!root.getAnimations().some((a) => a.transitionProperty === "height"))
        root.classList.remove("is-released");
      setTimeout(() => {
        dragged = false;
      });
    };
    root.addEventListener("transitionend", (e) => {
      if (e.target === root && e.propertyName === "height")
        root.classList.remove("is-released");
    });
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    root.addEventListener(
      "click",
      (e) => {
        if (!dragged) return;
        e.stopPropagation();
        e.preventDefault();
      },
      true,
    );
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
    if (this.current && (id !== this.current || fromTap)) this.celebrate(id);
    if (this.current && id !== this.current) this.views[this.current].leave?.();
    this.current = id;
    Object.entries(this.sections).forEach(([key, section]) => {
      // eslint-disable-next-line no-param-reassign
      section.hidden = key !== id;
      this.buttons[key].setAttribute("aria-selected", String(key === id));
      this.buttons[key].tabIndex = key === id ? 0 : -1;
      const tool = this.views[key].titleTool;
      if (tool) tool.hidden = key !== id;
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
    icon.getAnimations({ subtree: true }).forEach((a) => a.cancel());
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
    else if (name === "nectar") sloshFlask(icon);
    else if (name === "trophy") shineTrophy(icon);
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
      state.nectar === 0 &&
      state.tree.length === 0 &&
      this.game.pendingNectar() === 0 &&
      state.stats.ripens === 0;
    const badge = (id, count) => {
      const b = this.buttons[id].querySelector(".tab-badge");
      b.hidden = !count;
      setText(b, count);
    };
    badge("upgrades", this.views.upgrades.affordableCount());
    badge("ripen", this.game.ripenReady() ? "!" : 0);
    if (state.orchard.open) badge("orchard", this.views.orchard.badge());
    if (this.buttons[this.current].hidden) this.show("helpers");
    this.views[this.current].update();
  }
}
