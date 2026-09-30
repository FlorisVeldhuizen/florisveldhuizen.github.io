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

function read() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch {
    return { ...DEFAULTS };
  }
}

export class Settings {
  constructor(onChange) {
    Object.assign(this, read());
    this.onChange = onChange;
    this.panel = document.getElementById("settings");
    this.fps = document.getElementById("fps");
    this.visible = false;

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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage can be blocked; settings then last for this visit only.
    }
  }
}
