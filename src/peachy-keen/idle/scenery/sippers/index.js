import { makeContext } from "../extras/kit";
import { createSippers, SHADOWS } from "./sippers";
import { patchPeach } from "./shadows";

export default class Sippers {
  constructor(world) {
    this.world = world;
    this.clock = { time: 0 };
    this.run = null;
    world.game.on("ripen", () => this.run?.instance.leave());
    if (SHADOWS) patchPeach(world.interaction.peach);
  }

  update(delta) {
    if (!this.world.game.state.seen.butterflies) return;
    const away = this.world.room.presence("sippers") < 0.5;
    if (away && !this.away) this.run?.instance.scatter();
    this.away = away;
    this.clock.time += delta;
    if (!this.run) {
      const ctx = makeContext("sippers", this.world, this.clock);
      this.run = { ctx, instance: createSippers(ctx) };
    }
    this.run.instance.update(delta, away);
  }

  clear() {
    if (!this.run) return;
    this.run.instance.dispose();
    this.run.ctx.dispose();
    this.run = null;
  }
}
