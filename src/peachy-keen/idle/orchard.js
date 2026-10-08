import {
  SEEDS,
  SEED_BY_ID,
  RIPE_FOR,
  STAGES,
  RIPE,
  ROTTEN,
  BUTTERFLY_HARVESTS,
  butterflySlots,
} from "./data/orchard";

const TICK = 5;
const STAGE_AT = [0.12, 0.3, 0.5, 0.75, 1];
const BLOSSOM = STAGES.indexOf("Blossom");

export class Orchard {
  constructor(game) {
    this.game = game;
    this.timer = 0;
  }

  get data() {
    return this.game.state.orchard;
  }

  get size() {
    return this.game.model.orchardSize;
  }

  fit() {
    const { plots } = this.data;
    const count = this.size * this.size;
    while (plots.length < count) plots.push(null);
  }

  progress(plot, now = Date.now()) {
    const seed = SEED_BY_ID[plot.seed];
    return ((now - plot.plantedAt) / 1000 / seed.grow) * this.game.model.growth;
  }

  stage(plot, now = Date.now()) {
    if (!plot) return -1;
    if (plot.rotten) return ROTTEN;
    const p = this.progress(plot, now);
    if (p >= 1 + RIPE_FOR) return ROTTEN;
    const n = STAGE_AT.findIndex((at) => p < at);
    return n < 0 ? RIPE : n;
  }

  describe(index, now = Date.now()) {
    const plot = this.data.plots[index];
    if (!plot) return null;
    const seed = SEED_BY_ID[plot.seed];
    const stage = this.stage(plot, now);
    const p = this.progress(plot, now);
    const { growth } = this.game.model;
    const left =
      stage < RIPE
        ? ((1 - p) * seed.grow) / growth
        : ((1 + RIPE_FOR - p) * seed.grow) / growth;
    return { seed, stage, name: STAGES[stage], progress: Math.min(1, p), left };
  }

  update(dt) {
    const s = this.game.state;
    if (!this.data.open && s.pitsTotal > 0) {
      this.data.open = true;
      this.game.emit("orchard-open");
    }
    if (!this.data.open) return;
    this.timer -= dt;
    if (this.timer > 0) return;
    this.timer = TICK;
    this.fit();
    const now = Date.now();
    let changed = false;
    if (
      !s.seen.butterflies &&
      s.stats.ripens > 0 &&
      this.data.plots.some((plot) => {
        const stage = this.stage(plot, now);
        return stage >= BLOSSOM && stage < ROTTEN;
      })
    ) {
      s.seen.butterflies = true;
      this.game.emit("butterflies");
    }
    this.data.plots.forEach((plot) => {
      if (plot && !plot.rotten && this.stage(plot, now) === ROTTEN) {
        // eslint-disable-next-line no-param-reassign
        plot.rotten = true;
        changed = true;
      }
    });
    changed = this.mutate(now) || changed;
    if (changed) {
      this.game.refresh();
      this.game.emit("orchard");
    }
  }

  neighbours(index) {
    const { size } = this;
    const x = index % size;
    const y = Math.floor(index / size);
    const found = [];
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        const nx = x + dx;
        const ny = y + dy;
        if ((dx || dy) && nx >= 0 && ny >= 0 && nx < size && ny < size)
          found.push(ny * size + nx);
      }
    }
    return found;
  }

  mutate(now) {
    const { plots } = this.data;
    const boost = this.game.model.mutation;
    let changed = false;
    plots.forEach((plot, index) => {
      if (plot?.rotten) {
        const ghost = SEEDS.find((seed) => seed.fromRot);
        if (Math.random() < ghost.fromRot * boost) {
          plots[index] = { seed: ghost.id, plantedAt: now, wild: true };
          this.discover(ghost.id);
          changed = true;
        }
        return;
      }
      if (plot) return;
      const around = this.neighbours(index)
        .map((n) => plots[n])
        .filter((p) => p && !p.rotten && this.progress(p, now) >= 0.5)
        .map((p) => p.seed);
      const candidates = SEEDS.filter(({ parents }) => {
        if (!parents) return false;
        const [a, b] = parents;
        if (a === b) return around.filter((id) => id === a).length >= 2;
        return around.includes(a) && around.includes(b);
      });
      const hit = candidates.find(
        (seed) => Math.random() < seed.chance * boost,
      );
      if (!hit) return;
      plots[index] = { seed: hit.id, plantedAt: now, wild: true };
      this.discover(hit.id);
      changed = true;
    });
    return changed;
  }

  discover(id) {
    const { discovered } = this.data;
    if (discovered.includes(id)) return;
    discovered.push(id);
    this.game.emit("discover", SEED_BY_ID[id]);
  }

  plant(index, id) {
    const s = this.game.state;
    const seed = SEED_BY_ID[id];
    if (!seed || !this.data.discovered.includes(id)) return false;
    if (this.data.plots[index] || s.pits < seed.pits) return false;
    s.pits -= seed.pits;
    this.data.plots[index] = { seed: id, plantedAt: Date.now() };
    s.stats.plantings += 1;
    this.game.refresh();
    this.game.emit("orchard");
    return true;
  }

  harvest(index) {
    const plot = this.data.plots[index];
    if (!plot) return null;
    const stage = this.stage(plot);
    this.data.plots[index] = null;
    let reward = null;
    if (stage === RIPE) {
      reward = this.reward(SEED_BY_ID[plot.seed]);
      const s = this.game.state;
      s.stats.harvests += 1;
      if (s.seen.butterflies && BUTTERFLY_HARVESTS.includes(s.stats.harvests))
        this.game.emit("butterfly-slot", butterflySlots(s));
    }
    this.game.refresh();
    this.game.emit("orchard");
    return reward;
  }

  reward(seed) {
    const { game } = this;
    const s = game.state;
    const h = seed.harvest;
    if (h.kind === "juice") {
      const value = game.rate * 60 * h.minutes;
      game.gain(value, "orchard");
      return { ...h, value };
    }
    if (h.kind === "pits") {
      s.pits += h.amount;
      s.pitsTotal += h.amount;
    } else if (h.kind === "nectar") {
      s.nectar += h.amount;
    } else if (h.kind === "heat") {
      game.i.addHeat(Math.max(0, 97 - game.i.heat), 99);
    } else if (h.kind === "frenzy") {
      game.addBuff("frenzy", h.seconds);
    } else if (h.kind === "golden") {
      game.emit("summon", "golden");
    }
    return h;
  }
}
