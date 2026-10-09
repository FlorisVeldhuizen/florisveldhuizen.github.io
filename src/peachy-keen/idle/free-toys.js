import { TOYS, TOY_BY_ID, PICKERS } from "./data/toys";
import { el, setText, sidePanel } from "./dom";
import { iconSvg } from "./icons";

const OPEN_KEY = "peachy-keen-free-toys";
const PICKED = PICKERS.map((p) => p.key);

function readOpen() {
  try {
    // On phones the open card covers the peach, so it starts folded there.
    return (
      (localStorage.getItem(OPEN_KEY) ?? (sidePanel.matches ? "1" : "0")) ===
      "1"
    );
  } catch {
    return sidePanel.matches;
  }
}

function saveOpen(open) {
  try {
    localStorage.setItem(OPEN_KEY, open ? "1" : "0");
  } catch {
    // The card then remembers its state for this visit only.
  }
}

export default class FreeToys {
  constructor(game, leave) {
    this.game = game;
    this.leave = leave;
    this.root = el("div", "ui free-toys", document.body);
    this.toggle = el("button", "ft-toggle", this.root, "Your toys");
    this.toggle.type = "button";
    this.toggle.addEventListener("click", () => this.setOpen(!this.open));
    this.card = el("div", "ft-card", this.root);
    this.setOpen(readOpen(), false);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.open) this.setOpen(false);
    });
    this.signature = null;
    this.controls = [];
  }

  setOpen(open, save = true) {
    this.open = open;
    this.root.classList.toggle("is-open", open);
    this.toggle.setAttribute("aria-expanded", String(open));
    if (save) saveOpen(open);
  }

  build() {
    const s = this.game.state;
    const owns = (id) => s.toys.includes(id);
    this.card.replaceChildren();
    this.controls = [];
    this.modeRow();
    PICKERS.forEach((picker) => {
      const options = picker.options.filter(
        ([id]) => !TOY_BY_ID[id] || owns(id),
      );
      if (options.length < 2) return;
      const row = el("div", "ft-pick", this.card);
      el("span", "ft-label", row, picker.label);
      const group = el("span", "segmented", row);
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", picker.label);
      options.forEach(([id, label]) => {
        const b = el("button", "", group, label);
        b.type = "button";
        const toy = TOY_BY_ID[id];
        b.addEventListener("click", () =>
          this.game.emit("toy-set", {
            key: picker.key,
            value: toy ? toy.on : picker.off,
          }),
        );
        this.controls.push({ button: b, picker, id });
      });
    });
    TOYS.filter(
      (t) => !t.cord && !PICKED.includes(t.setting) && owns(t.id),
    ).forEach((toy) => {
      const b = el(
        "button",
        "ft-switch",
        this.card,
        `${iconSvg(toy.id)}<span class="ft-name">${toy.name}</span><span class="ft-state"></span>`,
      );
      b.type = "button";
      b.addEventListener("click", () => this.game.emit("toy-toggle", toy));
      this.controls.push({
        button: b,
        toy,
        state: b.querySelector(".ft-state"),
      });
    });
  }

  modeRow() {
    const row = el("div", "ft-pick ft-mode", this.card);
    el("span", "ft-label", row, "Mode");
    const group = el("span", "segmented", row);
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", "Mode");
    const standard = el("button", "", group, "Standard");
    standard.type = "button";
    standard.setAttribute("aria-pressed", "false");
    standard.addEventListener("click", () => this.leave());
    const free = el("button", "", group, "Free play");
    free.type = "button";
    free.setAttribute("aria-pressed", "true");
  }

  update() {
    const { game } = this;
    const signature = game.state.toys.join();
    if (signature !== this.signature) {
      this.signature = signature;
      this.build();
    }
    this.controls.forEach(({ button, picker, id, toy, state }) => {
      let on;
      if (picker) {
        const active = picker.options.find(([option]) =>
          game.activeToys.includes(option),
        );
        on = active ? active[0] === id : id === picker.off;
      } else {
        on = game.activeToys.includes(toy.id);
        setText(state, on ? "On" : "Off");
      }
      const pressed = String(on);
      if (button.getAttribute("aria-pressed") !== pressed)
        button.setAttribute("aria-pressed", pressed);
    });
  }
}
