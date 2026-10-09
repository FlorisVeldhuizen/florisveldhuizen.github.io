import { TOYS } from "./data/toys";

export class Toys {
  constructor(game, settings) {
    Object.assign(this, { game, settings });
    const change = settings.onChange;
    settings.onChange = (key, value) => {
      change(key, value);
      this.sync();
    };
    game.on("toy", (toy) => this.apply(toy.setting, toy.on));
    game.on("toy-set", ({ key, value }) => this.apply(key, value));
    game.on("toy-toggle", (toy) => {
      if (toy.cord) {
        const show = !game.state.options.dndCord;
        game.setOption("dndCord", show);
        this.apply(toy.setting, show);
        return;
      }
      if (toy.id === "lingerie" && settings.lingerie && !game.i.garment.worn) {
        this.apply(toy.setting, true);
        return;
      }
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
    const active = TOYS.filter(
      (toy) => this.owned(toy) && toy.values.includes(settings[toy.setting]),
    ).map((toy) => toy.id);
    if (active.join() !== this.game.activeToys.join())
      this.game.setActiveToys(active);
  }
}
