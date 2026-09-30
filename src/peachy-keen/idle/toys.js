import { TOYS } from "./data/toys";

function toyFor(button) {
  const key = button.dataset.setting;
  const value = button.dataset.value ?? true;
  return TOYS.find((t) => t.setting === key && t.values.includes(value));
}

export class Toys {
  constructor(game, settings) {
    Object.assign(this, { game, settings });
    this.buttons = settings.buttons.filter(toyFor);
    const change = settings.onChange;
    settings.onChange = (key, value) => {
      change(key, value);
      this.sync();
    };
    game.on("toy", (toy) => this.apply(toy.setting, toy.on));
    game.on("toy-set", ({ key, value }) => this.apply(key, value));
    game.on("toy-toggle", (toy) => {
      const on = toy.values.includes(settings[toy.setting]);
      this.apply(toy.setting, on ? toy.off : toy.on);
    });
    game.on("replace", () => this.sync());
    this.sync();
  }

  owned(toy) {
    return this.game.state.toys.includes(toy.id);
  }

  apply(key, value) {
    const { settings } = this;
    settings[key] = value;
    settings.save();
    settings.sync();
    settings.onChange(key, value);
  }

  sync() {
    const { settings } = this;
    TOYS.forEach((toy) => {
      if (!this.owned(toy) && toy.values.includes(settings[toy.setting]))
        this.apply(toy.setting, toy.off);
    });
    this.buttons.forEach((button) => {
      const toy = toyFor(button);
      const locked = !this.owned(toy);
      // eslint-disable-next-line no-param-reassign
      button.disabled = locked;
      button.classList.toggle("is-locked", locked);
      // eslint-disable-next-line no-param-reassign
      button.title = locked ? `Buy “${toy.name}” in the shop to unlock` : "";
    });
    const active = TOYS.filter(
      (toy) => this.owned(toy) && toy.values.includes(settings[toy.setting]),
    ).map((toy) => toy.id);
    if (active.join() !== this.game.activeToys.join())
      this.game.setActiveToys(active);
  }
}
