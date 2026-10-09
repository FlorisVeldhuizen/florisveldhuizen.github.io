import paparazzi from "./paparazzi";
import sugar from "./sugar";
import reader from "./reader";
import fractal from "./fractal";
import exe from "./exe";
import { makeContext, setExtrasSound } from "./kit";

const MODULES = [paparazzi, sugar, reader, fractal, exe];

export default class Extras {
  constructor(world) {
    this.world = world;
    this.clock = { time: 0 };
    this.runs = {};
  }

  update(delta) {
    const { helpers, options } = this.world.game.state;
    this.clock.time += delta;
    setExtrasSound(!!options.castSound);
    MODULES.forEach((fx) => {
      const owned = helpers[fx.id] || 0;
      // In free play a helper stays built but hidden and starts nothing new; what it already started, like a flash, fades out.
      const away = this.world.room.presence(fx.id) === 0;
      let run = this.runs[fx.id];
      if (!owned) {
        if (run) this.stop(fx.id);
        return;
      }
      if (!run) {
        const ctx = makeContext(fx.id, this.world, this.clock);
        run = { ctx, instance: fx.create(ctx) || {} };
        this.runs[fx.id] = run;
      }
      run.ctx.group.visible = !away;
      run.ctx.away = away;
      run.instance.update?.(delta, this.clock.time);
    });
  }

  stop(id) {
    const run = this.runs[id];
    if (!run) return;
    delete this.runs[id];
    run.instance.dispose?.();
    run.ctx.dispose();
  }

  clear() {
    Object.keys(this.runs).forEach((id) => this.stop(id));
  }
}
