import { el, setText } from "../dom";
import { HELPERS } from "../data/helpers";
import { SKIN_NAMES } from "../skins";

const ENDLESS_KEY = "peachy-keen-dev-endless";

function segmented(parent, label, choices, read, write) {
  const row = el("div", "settings-row", parent);
  el("span", "", row).textContent = label;
  const group = el("span", "segmented", row);
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", label);
  const buttons = choices.map(([value, text]) => {
    const b = el("button", "", group);
    b.type = "button";
    b.textContent = text;
    b.addEventListener("click", () => write(value));
    return { b, value };
  });
  return {
    row,
    sync() {
      buttons.forEach(({ b, value }) =>
        b.setAttribute("aria-pressed", String(read() === value)),
      );
    },
  };
}

function actionRow(parent, label, text, onClick) {
  const row = el("p", "settings-row", parent);
  el("span", "", row).textContent = label;
  const b = el("button", "switch", row);
  b.type = "button";
  b.textContent = text;
  b.addEventListener("click", onClick);
}

function switchRow(parent, label, read, write) {
  const row = el("p", "settings-row", parent);
  el("span", "", row).textContent = label;
  const b = el("button", "switch", row);
  b.type = "button";
  b.addEventListener("click", () => write(!read()));
  return {
    row,
    sync() {
      b.setAttribute("aria-pressed", String(read()));
      b.textContent = read() ? "On" : "Off";
    },
  };
}

export class OptionsView {
  constructor(game, root, settings, confirm) {
    Object.assign(this, { game, confirm });
    const opts = () => game.state.options;
    const set = (key) => (value) => {
      game.setOption(key, value);
      this.sync();
    };
    const box = el("div", "settings", root);
    this.controls = [
      segmented(
        box,
        "Numbers",
        [
          ["short", "1.2M"],
          ["long", "1.2 million"],
          ["scientific", "1.2e6"],
        ],
        () => opts().notation,
        set("notation"),
      ),
      segmented(
        box,
        "Helper style",
        [
          ["room", "Room"],
          ["minimal", "Minimal"],
        ],
        () => opts().helperStyle,
        set("helperStyle"),
      ),
      switchRow(box, "Helpers on screen", () => opts().cast, set("cast")),
      switchRow(box, "Helper sounds", () => opts().castSound, set("castSound")),
    ];
    this.skinBox = el("div", "", box);
    this.skinCount = 0;

    el("h3", "shop-title", root, "The peach");
    root.appendChild(settings.panel);

    el("h3", "shop-title", root, "Save");
    const saveRow = el("div", "save-row", root);
    const button = (label, onClick) => {
      const b = el("button", "switch", saveRow);
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", onClick);
      return b;
    };
    this.code = el("textarea", "save-code", root);
    this.code.setAttribute("aria-label", "Save code");
    this.code.placeholder =
      "Export puts your save code here. Paste a code here to import it.";
    this.code.rows = 3;
    this.message = el("p", "shop-note", root);
    button("Save now", () => {
      game.save();
      setText(this.message, "Saved.");
    });
    button("Export", () => {
      this.code.value = game.exportCode();
      this.code.select();
      navigator.clipboard?.writeText(this.code.value).then(
        () => setText(this.message, "Save code copied to the clipboard."),
        () => setText(this.message, "Copy the save code above."),
      );
    });
    button("Import", () => {
      try {
        game.importCode(this.code.value);
        setText(this.message, "Save imported.");
      } catch {
        setText(this.message, "That code is not a Jiggle Peach save.");
      }
    });
    button("Start over", () =>
      confirm({
        title: "Start over?",
        text: "This deletes everything: juice, nectar, pits, the Orchard and every trophy. It cannot be undone.",
        yes: "Delete my save",
        danger: true,
        onYes: () => game.hardReset(),
      }),
    );
    if (import.meta.env.DEV) this.buildDev(root);
    this.sync();
  }

  buildDev(root) {
    const { game } = this;
    el("h3", "shop-title", root, "Dev");
    const box = el("div", "settings", root);
    let endless = false;
    try {
      endless = localStorage.getItem(ENDLESS_KEY) === "on";
    } catch {
      // Endless juice then starts off on every visit.
    }
    this.controls.push(
      switchRow(
        box,
        "Endless juice",
        () => endless,
        (on) => {
          endless = on;
          try {
            localStorage.setItem(ENDLESS_KEY, on ? "on" : "off");
          } catch {
            // The switch then lasts for this visit only.
          }
          this.sync();
        },
      ),
    );
    setInterval(() => {
      if (!endless) return;
      const s = game.state;
      s.juice = Math.max(s.juice, 1e30);
      s.juiceTotal = Math.max(s.juiceTotal, 1e30);
    }, 250);
    actionRow(box, "Every helper", "Own one each", () => {
      HELPERS.forEach((h) => {
        game.state.helpers[h.id] ||= 1;
      });
      game.refresh();
    });
    actionRow(box, "Golden peach", "Spawn", () => game.emit("summon"));
    actionRow(box, "Fresh save", "Restart", () => game.hardReset());
  }

  buildSkins() {
    const { skins } = this.game.model;
    this.skinCount = skins.length;
    this.skinBox.replaceChildren();
    if (skins.length < 2) return;
    this.skinControl = segmented(
      this.skinBox,
      "Skin",
      skins.map((id) => [id, SKIN_NAMES[id]]),
      () => this.game.state.options.skin,
      (value) => {
        this.game.setOption("skin", value);
        this.sync();
      },
    );
    this.skinControl.row.classList.add("skin-row");
  }

  sync() {
    this.controls.forEach((c) => c.sync());
    this.skinControl?.sync();
  }

  update() {
    if (this.skinCount !== this.game.model.skins.length) {
      this.buildSkins();
      this.sync();
    }
  }
}
