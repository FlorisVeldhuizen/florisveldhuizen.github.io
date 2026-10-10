import { TOYS, TOY_BY_ID, PICKERS } from "./data/toys";
import { el, setText, sidePanel } from "./dom";
import { iconSvg } from "./icons";
import toolTrack from "./tool-track";

const OPEN_KEY = "peachy-keen-free-toys";
const LEAVE_WAIT = 2500;
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
    el("p", "ft-empty", this.card, "No toys yet. Find them in the shop.");
    PICKERS.forEach((picker) => {
      const track = toolTrack(this.card, picker, (id) => {
        const toy = TOY_BY_ID[id];
        this.game.emit("toy-set", {
          key: picker.key,
          value: toy ? toy.on : picker.off,
        });
      });
      this.controls.push({ track, picker });
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
    this.leaveLink();
  }

  leaveLink() {
    const foot = el("div", "ft-foot", this.card);
    const link = el("button", "ft-leave", foot, "Leave free play");
    link.type = "button";
    let armed = null;
    const disarm = () => {
      clearTimeout(armed);
      armed = null;
      link.classList.remove("is-armed");
      link.textContent = "Leave free play";
    };
    link.addEventListener("click", () => {
      if (armed) {
        disarm();
        this.leave();
        return;
      }
      link.classList.add("is-armed");
      link.textContent = "Tap again to leave";
      armed = setTimeout(disarm, LEAVE_WAIT);
    });
  }

  update() {
    const { game } = this;
    const signature = game.state.toys.join();
    if (signature !== this.signature) {
      this.signature = signature;
      this.build();
    }
    const owned = (id) => !TOY_BY_ID[id] || game.state.toys.includes(id);
    let empty = true;
    this.controls.forEach(({ button, picker, track, toy, state }) => {
      if (track) {
        const active = picker.options.find(([option]) =>
          game.activeToys.includes(option),
        );
        track.update(active ? active[0] : picker.off, owned);
        if (!track.row.hidden) empty = false;
        return;
      }
      empty = false;
      const on = game.activeToys.includes(toy.id);
      setText(state, on ? "On" : "Off");
      const pressed = String(on);
      if (button.getAttribute("aria-pressed") !== pressed)
        button.setAttribute("aria-pressed", pressed);
    });
    this.card.classList.toggle("is-empty", empty);
  }
}
