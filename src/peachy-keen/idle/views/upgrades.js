import { UPGRADE_BY_ID } from "../data/upgrades";
import { TOYS, TOY_BY_ID } from "../data/toys";

const TOOLS = [
  ["hand", "Hand"],
  ["lips", "Lips"],
  ["buzz", "Buzz"],
];
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
import { el, setText, toggle } from "../dom";
import { iconSvg, rowIcon, iconKey } from "../icons";
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
    const tools = el("div", "tool-row", this.tray);
    el("span", "tool-label", tools, "Tool");
    this.toolGroup = el("span", "segmented", tools);
    this.toolGroup.setAttribute("role", "group");
    this.toolGroup.setAttribute("aria-label", "Tool");
    this.tools = TOOLS.map(([id, label]) => {
      const b = el("button", "", this.toolGroup);
      b.type = "button";
      b.addEventListener("click", () => this.pickTool(id));
      return { id, label, button: b, toy: TOY_BY_ID[id] };
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
        <span class="row-icon">${rowIcon(u.icon)}</span>
        <span class="row-main">
          <span class="row-name">${u.name}</span>
          <span class="row-about">${u.about}</span>
        </span>
        <span class="row-price"></span>`;
      b.addEventListener("click", () => this.game.buyUpgrade(u.id));
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
        <span class="row-icon">${iconSvg("play")}</span>
        <span class="row-main">
          <span class="row-name">${toy.name}</span>
          <span class="row-about">${toy.about}</span>
        </span>
        <span class="row-price"></span>`;
      b.addEventListener("click", () => {
        if (this.game.state.toys.includes(toy.id))
          this.game.emit("toy-toggle", toy);
        else this.game.buyToy(toy.id);
      });
      this.toyRows.set(toy.id, {
        button: b,
        price: b.querySelector(".row-price"),
        toy,
      });
    });
  }

  pickTool(id) {
    const { game } = this;
    const toy = TOY_BY_ID[id];
    if (!toy) game.emit("toy-set", { key: "tool", value: "hand" });
    else if (game.state.toys.includes(id))
      game.emit("toy-set", { key: "tool", value: toy.on });
    else game.buyToy(id);
  }

  updateTools() {
    const { game } = this;
    const s = game.state;
    const active = this.tools.find((t) => game.activeToys.includes(t.id));
    this.tools.forEach(({ id, label, button, toy }) => {
      const owned = !toy || s.toys.includes(id);
      const visible = owned || toy.unlock(s);
      // eslint-disable-next-line no-param-reassign
      button.hidden = !visible;
      setText(button, owned ? label : `${label} · ${format(toy.cost)}`);
      // eslint-disable-next-line no-param-reassign
      button.disabled = !owned && toy.cost > s.juice;
      button.setAttribute(
        "aria-pressed",
        String(active ? active.id === id : id === "hand"),
      );
    });
  }

  updateToys() {
    const s = this.game.state;
    this.updateTools();
    const list = TOYS.filter(
      (t) => t.setting !== "tool" && (s.toys.includes(t.id) || t.unlock(s)),
    );
    const signature = list.map((t) => `${t.id}${s.toys.includes(t.id)}`).join();
    if (signature !== this.toySignature) {
      this.toySignature = signature;
      this.buildToys(list);
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
    const signature = iconKey() + list.map((u) => u.id).join();
    if (signature !== this.signature) {
      this.signature = signature;
      this.build(list);
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
