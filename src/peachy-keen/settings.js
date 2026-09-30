const STORAGE_KEY = "peachy-keen-settings";
const DEFAULTS = {
  sound: true,
  quality: "auto",
  shadows: "auto",
  splatter: true,
  firmness: "ripe",
  tease: true,
  handprints: true,
  tool: "hand",
  talk: "off",
  lingerie: false,
  edging: false,
  achievements: false,
  moodLight: false,
  disco: false,
};

function read(key) {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(key)) };
  } catch {
    return { ...DEFAULTS };
  }
}

export class Settings {
  constructor(onChange) {
    this.key = STORAGE_KEY;
    Object.assign(this, read(this.key));
    this.onChange = onChange;
    this.panel = document.getElementById("settings");
    this.toggle = document.getElementById("settings-toggle");
    this.fps = document.getElementById("fps");
    this.visible = false;

    this.toggle.addEventListener("click", () =>
      this.setOpen(this.panel.hidden),
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.toggle.isConnected && !this.panel.hidden) {
        this.setOpen(false);
        this.toggle.focus();
      }
    });

    this.buttons = [...document.querySelectorAll("[data-setting]")];
    this.buttons.forEach((button) => {
      const key = button.dataset.setting;
      button.addEventListener("click", () => {
        this[key] = button.dataset.value || !this[key];
        this.save();
        this.sync();
        this.onChange(key, this[key]);
      });
    });
    this.sync();
  }

  sync() {
    this.buttons.forEach((button) => {
      const key = button.dataset.setting;
      const { value } = button.dataset;
      const pressed = value ? this[key] === value : this[key];
      button.setAttribute("aria-pressed", String(pressed));
      if (!value) button.textContent = pressed ? "On" : "Off";
    });
  }

  applyAll() {
    Object.keys(DEFAULTS).forEach((key) => this.onChange(key, this[key]));
  }

  useStore(key) {
    this.key = key;
    Object.assign(this, read(key));
    this.sync();
    this.applyAll();
  }

  setOpen(open) {
    this.panel.hidden = !open;
    this.visible = open;
    this.toggle.setAttribute("aria-expanded", String(open));
  }

  showFps(fps) {
    if (!this.visible) return;
    const text = `${Math.round(fps)} frames per second`;
    if (text !== this.fps.textContent) this.fps.textContent = text;
  }

  save() {
    try {
      const data = {};
      Object.keys(DEFAULTS).forEach((key) => {
        data[key] = this[key];
      });
      localStorage.setItem(this.key, JSON.stringify(data));
    } catch {
      // Storage can be blocked; settings then last for this visit only.
    }
  }
}
