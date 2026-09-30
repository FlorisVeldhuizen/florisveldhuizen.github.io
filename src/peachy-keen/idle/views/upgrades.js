import { UPGRADE_BY_ID } from "../data/upgrades";
import { TOYS, TOY_BY_ID } from "../data/toys";

const PICKERS = [
  {
    key: "tool",
    label: "Tool",
    off: "hand",
    options: [
      ["hand", "Hand"],
      ["lips", "Lips"],
      ["buzz", "Buzz"],
    ],
  },
  {
    key: "talk",
    label: "Voice",
    off: "off",
    options: [
      ["off", "Off"],
      ["talk", "Cheeky"],
      ["shy", "Shy"],
    ],
  },
];
const PICKED = PICKERS.map((p) => p.key);
const TRAY_KEY = "peachy-keen-toy-tray";

function readTray() {
  try {
    return localStorage.getItem(TRAY_KEY) !== "closed";
  } catch {
    return true;
  }
}

function saveTray(open) {
  try {
    localStorage.setItem(TRAY_KEY, open ? "open" : "closed");
  } catch {
    // The tray then remembers its state for this visit only.
  }
}
import { el, setText, toggle, keepFocus, nudge } from "../dom";
import { iconSvg } from "../icons";
import { format } from "../numbers";

export class UpgradesView {
  constructor(game, root) {
    this.game = game;
    this.root = root;
    this.rows = new Map();
    this.signature = "";
    const head = el("div", "shop-head", root);
    this.buyAll = el("button", "switch shop-all", head);
    this.buyAll.type = "button";
    this.buyAll.textContent = "Buy all I can afford";
    this.buyAll.addEventListener("click", () => {
      game.availableUpgrades().forEach((u) => game.buyUpgrade(u.id));
    });
    this.valet = el("button", "switch shop-auto", head);
    this.valet.type = "button";
    this.valet.addEventListener("click", () =>
      game.setOption("valet", !game.state.options.valet),
    );
    this.tray = el("details", "toy-tray", root);
    this.tray.open = readTray();
    this.tray.addEventListener("toggle", () => saveTray(this.tray.open));
    el("summary", "shop-title shop-title-first", this.tray, "Toys");
    el(
      "p",
      "shop-note",
      this.tray,
      "Toys are yours for good, even after you ripen. Tap a toy you own to switch it on or off.",
    );
    this.pickers = PICKERS.map((picker) => {
      const row = el("div", "tool-row", this.tray);
      el("span", "tool-label", row, picker.label);
      const group = el("span", "segmented", row);
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", picker.label);
      const buttons = picker.options.map(([id, label]) => {
        const b = el("button", "", group);
        b.type = "button";
        b.addEventListener("click", () => this.pick(picker, id));
        return { id, label, button: b, toy: TOY_BY_ID[id] };
      });
      return { ...picker, row, buttons };
    });
    this.toyList = el("ol", "rows", this.tray);
    this.toyRows = new Map();
    this.toySignature = "";
    this.upgradesTitle = el("h3", "shop-title", root, "Upgrades");
    this.note = el("p", "shop-note", root);
    this.list = el("ol", "rows", root);
    this.empty = el(
      "p",
      "shop-empty",
      root,
      "Nothing to buy yet. Smack, buy helpers, and new upgrades appear here.",
    );
    this.owned = el("details", "shop-owned", root);
    this.ownedTitle = el("summary", "", this.owned);
    this.ownedList = el("ul", "chips", this.owned);
    this.ownedCount = -1;
  }

  build(list) {
    this.list.replaceChildren();
    this.rows.clear();
    list.forEach((u) => {
      const li = el("li", "", this.list);
      const b = el("button", "row upgrade-row", li);
      b.type = "button";
      b.innerHTML = `
        <span class="row-icon">${iconSvg(u.icon)}</span>
        <span class="row-main">
          <span class="row-name">${u.name}</span>
          <span class="row-about">${u.about}</span>
        </span>
        <span class="row-price"></span>`;
      b.addEventListener("click", () => {
        if (!this.game.buyUpgrade(u.id)) nudge(b.querySelector(".row-price"));
      });
      this.rows.set(u.id, {
        button: b,
        price: b.querySelector(".row-price"),
        u,
      });
    });
  }

  buildToys(list) {
    this.toyList.replaceChildren();
    this.toyRows.clear();
    list.forEach((toy) => {
      const li = el("li", "", this.toyList);
      const b = el("button", "row upgrade-row toy-row", li);
      b.type = "button";
      b.innerHTML = `
        <span class="row-icon">${iconSvg(toy.id)}</span>
        <span class="row-main">
          <span class="row-name">${toy.name}</span>
          <span class="row-about">${toy.about}</span>
        </span>
        <span class="row-price"></span>`;
      b.addEventListener("click", () => {
        if (this.game.state.toys.includes(toy.id))
          this.game.emit("toy-toggle", toy);
        else if (!this.game.buyToy(toy.id))
          nudge(b.querySelector(".row-price"));
      });
      this.toyRows.set(toy.id, {
        button: b,
        price: b.querySelector(".row-price"),
        toy,
      });
    });
  }

  pick(picker, id) {
    const { game } = this;
    const toy = TOY_BY_ID[id];
    game.emit("toy-set", { key: picker.key, value: toy ? toy.on : picker.off });
  }

  updatePickers() {
    const { game } = this;
    const s = game.state;
    this.pickers.forEach((picker) => {
      const active = picker.buttons.find((t) => game.activeToys.includes(t.id));
      let owns = false;
      picker.buttons.forEach(({ id, label, button, toy }) => {
        const owned = !toy || s.toys.includes(id);
        if (toy && owned) owns = true;
        // eslint-disable-next-line no-param-reassign
        button.hidden = !owned;
        setText(button, label);
        button.setAttribute(
          "aria-pressed",
          String(active ? active.id === id : id === picker.off),
        );
      });
      // eslint-disable-next-line no-param-reassign
      picker.row.hidden = !owns;
    });
  }

  updateToys() {
    const s = this.game.state;
    this.updatePickers();
    const list = TOYS.filter((t) => {
      const owned = s.toys.includes(t.id);
      if (PICKED.includes(t.setting)) return !owned && t.unlock(s);
      return owned || t.unlock(s);
    });
    const signature = list.map((t) => `${t.id}${s.toys.includes(t.id)}`).join();
    if (signature !== this.toySignature) {
      this.toySignature = signature;
      keepFocus(this.toyList, () => this.buildToys(list));
    }
    const shown = TOYS.some((t) => s.toys.includes(t.id) || t.unlock(s));
    this.tray.hidden = !shown;
    this.upgradesTitle.hidden = !shown;
    let affordable = 0;
    this.toyRows.forEach(({ button, price, toy }) => {
      if (s.toys.includes(toy.id)) {
        const on = this.game.activeToys.includes(toy.id);
        setText(price, on ? "On" : "Off");
        toggle(button, "is-affordable", true);
        toggle(button, "is-owned-toy", true);
        toggle(price, "is-on", on);
        button.setAttribute("aria-pressed", String(on));
        button.removeAttribute("aria-disabled");
        return;
      }
      const ok = toy.cost <= s.juice;
      if (ok) affordable += 1;
      setText(price, format(toy.cost));
      toggle(button, "is-affordable", ok);
      button.setAttribute("aria-disabled", String(!ok));
    });
    return affordable;
  }

  buildOwned() {
    const { upgrades } = this.game.state;
    this.ownedCount = upgrades.length;
    this.owned.hidden = upgrades.length === 0;
    setText(this.ownedTitle, `Owned upgrades (${upgrades.length})`);
    this.ownedList.replaceChildren();
    upgrades.forEach((id) => {
      const u = UPGRADE_BY_ID[id];
      if (!u) return;
      const chip = el(
        "li",
        "chip",
        this.ownedList,
        `${iconSvg(u.icon)}<span>${u.name}</span>`,
      );
      chip.title = u.about;
    });
  }

  affordableCount() {
    const game = this.game;
    const s = game.state;
    const toys = TOYS.filter(
      (t) => !s.toys.includes(t.id) && t.unlock(s) && t.cost <= s.juice,
    ).length;
    if (game.model.noUpgrades) return toys;
    return (
      toys +
      game
        .availableUpgrades()
        .filter((u) => game.upgradePrice(u) <= game.state.juice).length
    );
  }

  update() {
    const game = this.game;
    this.updateToys();
    const list = game.availableUpgrades();
    const signature = list.map((u) => u.id).join();
    if (signature !== this.signature) {
      this.signature = signature;
      keepFocus(this.list, () => this.build(list));
    }
    if (this.ownedCount !== game.state.upgrades.length) this.buildOwned();
    const locked = game.model.noUpgrades;
    setText(this.note, locked ? "Chastity dare: upgrades are off limits." : "");
    this.note.hidden = !locked;
    this.empty.hidden = list.length > 0;
    const { options } = game.state;
    this.valet.hidden = !game.model.unlocks.has("valet");
    setText(this.valet, `Valet ${options.valet ? "on" : "off"}`);
    this.valet.setAttribute("aria-pressed", String(options.valet));
    let affordable = 0;
    this.rows.forEach(({ button, price, u }) => {
      const cost = game.upgradePrice(u);
      const ok = !locked && cost <= game.state.juice;
      if (ok) affordable += 1;
      setText(price, format(cost));
      toggle(button, "is-affordable", ok);
      button.setAttribute("aria-disabled", String(!ok));
    });
    this.buyAll.hidden = affordable < 2;
  }
}
