import {
  load,
  save,
  freshRun,
  freshState,
  wipe,
  importSave,
  exportSave,
} from "./state";
import {
  buildModel,
  liveRate,
  smackValue,
  helperCost,
  helperMax,
  upgradeCost,
  burstPayout,
  nectarFor,
  juiceForNectar,
  buffActive,
  BUFFS,
} from "./economy";
import { HELPERS } from "./data/helpers";
import { UPGRADES, UPGRADE_BY_ID } from "./data/upgrades";
import { TREE_BY_ID } from "./data/tree";
import { DARE_BY_ID } from "./data/dares";
import { TROPHIES } from "./data/trophies";
import { TOY_BY_ID } from "./data/toys";
import { setNotation } from "./numbers";

const AWAY_AFTER = 60;
const SAVE_EVERY = 15;
const pick = (list) => list[Math.floor(Math.random() * list.length)];

export class IdleGame {
  constructor(interaction) {
    this.i = interaction;
    this.state = load();
    this.listeners = {};
    this.live = { heat: 0, oil: 0 };
    this.rate = 0;
    this.timers = { save: 0, check: 0, butler: 0 };
    this.pouring = false;
    this.pendingBurst = null;
    this.ripening = false;
    this.activeToys = [];
    this.buzzer = null;
    this.lastTick = Date.now();
    this.refresh();
    setNotation(this.state.options.notation);
    this.hook(interaction);
    this.away = this.collectAway(Date.now() - this.state.savedAt);
    window.addEventListener("pagehide", () => this.save());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.save();
    });
    setInterval(() => {
      if (document.hidden) this.tick();
    }, 1000);
  }

  on(name, listener) {
    (this.listeners[name] ||= []).push(listener);
  }

  emit(name, detail) {
    this.listeners[name]?.forEach((listener) => listener(detail));
  }

  refresh() {
    this.model = buildModel(this.state, Date.now(), this.activeToys);
    const m = this.model;
    const i = this.i;
    i.heatGain = m.heatGain;
    i.heatCap = m.heatCap;
    i.twerkAfter = 20 * m.twerkSooner;
    this.emit("change");
  }

  gain(amount, source) {
    if (!(amount > 0)) return;
    const s = this.state;
    s.juice += amount;
    s.juiceRun += amount;
    s.juiceTotal += amount;
    if (source === "hand") s.stats.handJuice += amount;
  }

  hook(i) {
    i.on("smack", ({ strength, combo, x, y }) =>
      this.onSmack(strength, combo, x, y),
    );
    i.on("burst", () => this.onBurst());
    i.on("snap", () => {
      if (this.pendingBurst) this.emit("burst", this.pendingBurst);
      this.pendingBurst = null;
    });
    i.on("release", ({ knead, length }) => {
      const s = this.state;
      s.stats.grabs += 1;
      const value =
        this.handValue(1, 0) * (1 + knead * 4 + length * 3) * this.model.grab;
      this.gain(value, "hand");
      this.popAtPeach(value, "grab");
    });
    i.on("wedgie", ({ amount }) => {
      this.state.stats.wedgies += 1;
      const value = this.handValue(1, 0) * 10 * amount * this.model.wedgie;
      this.gain(value, "hand");
      this.popAtPeach(value, "wedgie");
    });
    i.on("stripped", () => {
      this.state.stats.strips += 1;
      const value = this.handValue(1, 0) * 25 * this.model.strip;
      this.gain(value, "hand");
      this.popAtPeach(value, "strip");
    });
    i.on("twerk", ({ beat }) => {
      if (beat === 1) this.state.stats.twerks += 1;
      const value = this.rate * 0.25 * this.model.twerk;
      this.gain(value, "twerk");
      this.popAtPeach(value, "twerk");
    });
  }

  handValue(strength, combo) {
    return smackValue(this.model, this.state, this.live, { strength, combo });
  }

  onSmack(strength, combo, x, y) {
    const s = this.state;
    const m = this.model;
    let value = this.handValue(strength, combo);
    const crit = value > 0 && Math.random() < m.crit;
    if (crit) {
      value *= m.critPower;
      s.stats.crits += 1;
    }
    s.stats.smacks += 1;
    s.runSmacks += 1;
    s.stats.bestCombo = Math.max(s.stats.bestCombo, combo);
    this.gain(value, "hand");
    this.emit("pop", { x, y, value, kind: crit ? "crit" : "smack" });
  }

  onBurst() {
    const s = this.state;
    const m = this.model;
    if (this.ripening) {
      this.ripening = false;
      return;
    }
    const edged = this.i.burstPower > 1;
    const value =
      burstPayout(m, s, this.live) * this.i.burstPower * (edged ? m.edged : 1);
    const lucky = Math.random() < m.luckyPit;
    const pits = m.pits * (lucky ? 3 : 1);
    s.stats.bursts += 1;
    s.runBursts += 1;
    s.pits += pits;
    s.pitsTotal += pits;
    if (edged) s.seen.edged = true;
    this.gain(value, "burst");
    this.pendingBurst = { value, pits, lucky };
  }

  popAtPeach(value, kind) {
    if (!(value > 0)) return;
    const at = this.i.toScreen(this.i.group.position);
    this.emit("pop", { x: at.x, y: at.y - 40, value, kind });
  }

  collectAway(ms) {
    const seconds = ms / 1000;
    if (!(seconds > AWAY_AFTER)) return null;
    const s = this.state;
    const m = this.model;
    const capped = Math.min(seconds, m.offlineCap * 3600);
    const rate = liveRate(m, s, { heat: 0, oil: 0 }, 0);
    const value = rate * capped * m.offline;
    s.stats.away += seconds;
    s.stats.longestAway = Math.max(s.stats.longestAway, seconds);
    this.gain(value, "away");
    if (!(value > 0)) return null;
    return { seconds, capped, value, rate: m.offline };
  }

  tick() {
    const now = Date.now();
    const elapsed = (now - this.lastTick) / 1000;
    this.lastTick = now;
    if (elapsed > AWAY_AFTER) {
      const away = this.collectAway(elapsed * 1000);
      if (away) this.emit("away", away);
      return;
    }
    this.advance(Math.max(0, elapsed), now);
  }

  advance(dt, now) {
    const s = this.state;
    const m = this.model;
    const i = this.i;
    const live = i.phase === "live";

    if (m.dare === "dry") i.oil = 0;
    else if (m.oilFloor && (s.helpers.baron || 0) > 0)
      i.oil = Math.max(i.oil, m.oilFloor);
    if (buffActive(s, "spill", now)) i.oil = 1;
    i.coolRate = m.cool * (buffActive(s, "wave", now) ? 0 : 1);

    this.live.heat = i.heat;
    this.live.oil = i.oil;
    this.rate = liveRate(m, s, this.live, now);
    this.gain(this.rate * dt, "helpers");

    if (i.rubbing > 0 && live) {
      s.stats.rubSeconds += dt;
      this.gain(this.handValue(1, 0) * i.rubbing * 1.5 * m.rub * dt, "hand");
    }
    if (m.buzz && this.buzzer?.dented && live) {
      s.stats.rubSeconds += dt;
      const power = 1 + 3 * this.buzzer.level;
      this.gain(this.handValue(1, 0) * power * m.rub * dt, "hand");
    }
    const pouring = i.carrying && i.rubbing > 0;
    if (pouring && !this.pouring) s.stats.pours += 1;
    this.pouring = pouring;

    if (m.autoHeat > 0 && m.helperJps > 0 && live && m.heatCap >= 100) {
      i.addHeat(m.autoHeat * dt);
      if (i.heat >= 100) i.charge();
    }

    s.stats.played += dt;
    s.runTime += dt;
    s.stats.bestRate = Math.max(s.stats.bestRate, this.rate);
    s.stats.hottest = Math.max(s.stats.hottest, i.heat);
    if (i.oil > 0.95) s.seen.fullyOiled = true;

    if (s.buffs.length && s.buffs.some((b) => b.until <= now)) {
      s.buffs = s.buffs.filter((b) => b.until > now);
      this.emit("buffs");
    }

    this.timers.check -= dt;
    if (this.timers.check <= 0) {
      this.timers.check = 1;
      this.checkTrophies();
      this.checkDare();
    }
    this.timers.butler -= dt;
    if (this.timers.butler <= 0) {
      this.timers.butler = 2;
      this.runButler();
    }
    this.timers.save -= dt;
    if (this.timers.save <= 0) {
      this.timers.save = SAVE_EVERY;
      this.save();
    }
  }

  save() {
    save(this.state);
  }

  checkTrophies() {
    const s = this.state;
    const owned = new Set(s.achievements);
    const fresh = TROPHIES.filter((t) => !owned.has(t.id) && t.test(s));
    if (!fresh.length) return;
    fresh.forEach((t) => s.achievements.push(t.id));
    this.refresh();
    fresh.forEach((t) => this.emit("trophy", t));
  }

  visibleHelpers() {
    const s = this.state;
    const shown = [];
    HELPERS.some((h, n) => {
      const owned = s.helpers[h.id] || 0;
      const reachable =
        owned > 0 ||
        n === 0 ||
        (s.helpers[HELPERS[n - 1].id] || 0) > 0 ||
        s.juiceTotal >= h.cost;
      shown.push({ helper: h, known: reachable });
      return !reachable;
    });
    return shown;
  }

  buyCount(id) {
    const want = this.state.options.buy;
    if (want === "max")
      return Math.max(1, helperMax(this.model, this.state, id));
    const room = this.model.maxOwned - (this.state.helpers[id] || 0);
    return Math.max(1, Math.min(want, room));
  }

  helperPrice(id) {
    const count = this.buyCount(id);
    return { count, cost: helperCost(this.model, this.state, id, count) };
  }

  buyHelper(id, count = this.buyCount(id)) {
    const s = this.state;
    const owned = s.helpers[id] || 0;
    if (owned + count > this.model.maxOwned) return false;
    const cost = helperCost(this.model, s, id, count);
    if (cost > s.juice) return false;
    s.juice -= cost;
    s.helpers[id] = owned + count;
    this.refresh();
    this.emit("bought", { kind: "helper", id, count });
    return true;
  }

  availableUpgrades() {
    const s = this.state;
    return UPGRADES.filter(
      (u) => !s.upgrades.includes(u.id) && u.unlock(s),
    ).sort((a, b) => a.cost - b.cost);
  }

  upgradePrice(u) {
    return upgradeCost(this.model, u);
  }

  buyUpgrade(id) {
    const s = this.state;
    const u = UPGRADE_BY_ID[id];
    if (!u || this.model.noUpgrades || s.upgrades.includes(id) || !u.unlock(s))
      return false;
    const cost = upgradeCost(this.model, u);
    if (cost > s.juice) return false;
    s.juice -= cost;
    s.upgrades.push(id);
    this.refresh();
    this.emit("bought", { kind: "upgrade", id });
    return true;
  }

  setActiveToys(ids) {
    this.activeToys = ids;
    this.refresh();
  }

  buyToy(id) {
    const s = this.state;
    const toy = TOY_BY_ID[id];
    if (!toy || s.toys.includes(id) || !toy.unlock(s) || toy.cost > s.juice)
      return false;
    s.juice -= toy.cost;
    s.toys.push(id);
    this.refresh();
    this.emit("bought", { kind: "toy", id });
    this.emit("toy", toy);
    return true;
  }

  runButler() {
    const s = this.state;
    const m = this.model;
    if (s.options.butler && m.unlocks.has("butler")) {
      for (let n = 0; n < 10; n += 1) {
        let best = null;
        this.visibleHelpers().forEach(({ helper, known }) => {
          if (!known || (s.helpers[helper.id] || 0) >= m.maxOwned) return;
          const cost = helperCost(m, s, helper.id, 1);
          const score = cost / Math.max(1e-9, m.rates[helper.id]);
          if (!best || score < best.score)
            best = { id: helper.id, cost, score };
        });
        if (!best || best.cost > s.juice || !this.buyHelper(best.id, 1)) break;
      }
    }
    if (s.options.valet && m.unlocks.has("valet") && !m.noUpgrades) {
      this.availableUpgrades()
        .slice(0, 5)
        .forEach((u) => {
          if (upgradeCost(this.model, u) <= s.juice) this.buyUpgrade(u.id);
        });
    }
  }

  pendingNectar() {
    const s = this.state;
    return Math.max(
      0,
      nectarFor(s.juiceTotal, this.model.nectarGain) - s.nectarTotal,
    );
  }

  nextNectarAt() {
    const s = this.state;
    const next = s.nectarTotal + this.pendingNectar() + 1;
    return juiceForNectar(next, this.model.nectarGain);
  }

  ripen(dare = null) {
    const s = this.state;
    const gain = this.pendingNectar();
    s.nectar += gain;
    s.nectarTotal += gain;
    s.stats.ripens += 1;
    freshRun(s);
    s.dares.active = dare;
    this.model = buildModel(s, Date.now(), this.activeToys);
    Object.entries(this.model.start).forEach(([id, n]) => {
      s.helpers[id] = Math.min(n, this.model.maxOwned);
    });
    const i = this.i;
    if (i.phase === "live") {
      this.ripening = true;
      i.group.updateMatrixWorld(true);
      i.burst();
    }
    i.heat = 0;
    i.oil = 0;
    this.refresh();
    this.save();
    this.emit("ripen", { gain, dare });
  }

  treeState(id) {
    const s = this.state;
    const node = TREE_BY_ID[id];
    if (s.tree.includes(id)) return "owned";
    if (node.parent && !s.tree.includes(node.parent)) return "locked";
    return s.nectar >= node.cost ? "ready" : "open";
  }

  buyTree(id) {
    const s = this.state;
    const node = TREE_BY_ID[id];
    if (!node || this.treeState(id) !== "ready") return false;
    s.nectar -= node.cost;
    s.tree.push(id);
    this.refresh();
    this.emit("bought", { kind: "tree", id });
    return true;
  }

  startDare(id) {
    if (!DARE_BY_ID[id] || !this.model.unlocks.has("dares")) return;
    this.ripen(id);
  }

  abandonDare() {
    this.state.dares.active = null;
    this.refresh();
  }

  checkDare() {
    const s = this.state;
    const dare = DARE_BY_ID[s.dares.active];
    if (!dare) return;
    if (dare.limit && s.runTime > dare.limit && s.juiceRun < dare.goal) {
      s.dares.active = null;
      this.refresh();
      this.emit("dare", { dare, won: false });
      return;
    }
    if (s.juiceRun < dare.goal) return;
    s.dares.active = null;
    if (!s.dares.done.includes(dare.id)) s.dares.done.push(dare.id);
    this.refresh();
    this.emit("dare", { dare, won: true });
  }

  addBuff(id, seconds, extra = {}) {
    const s = this.state;
    const until = Date.now() + seconds * 1000;
    s.buffs = s.buffs.filter((b) => b.id !== id);
    s.buffs.push({ id, until, seconds, ...extra });
    this.emit("buffs");
  }

  golden() {
    const s = this.state;
    const m = this.model;
    const now = Date.now();
    s.stats.goldens += 1;
    if (buffActive(s, "frenzy", now)) s.seen.doubleDip = true;
    const owned = HELPERS.filter((h) => (s.helpers[h.id] || 0) > 0);
    const table = [
      ["lucky", 45],
      ["frenzy", 32],
      ["storm", 6],
      ["spill", 6],
      ["showcase", owned.length ? 6 : 0],
      ["wave", 3],
      ["pits", 2],
    ];
    let roll = Math.random() * table.reduce((sum, [, w]) => sum + w, 0);
    const [effect] = table.find(([, w]) => {
      roll -= w;
      return roll <= 0;
    });
    const length = m.goldenLength;
    let result;
    if (effect === "lucky") {
      const value = (Math.min(s.juice * 0.15, this.rate * 900) + 13) * m.lucky;
      this.gain(value, "golden");
      result = { effect, value, title: "Lucky!" };
    } else if (effect === "pits") {
      const pits = 3 + Math.floor(Math.random() * 5);
      s.pits += pits;
      s.pitsTotal += pits;
      result = { effect, pits, title: "Pit rain!" };
    } else if (effect === "showcase") {
      const h = pick(owned);
      const power = 1 + (s.helpers[h.id] || 0) * 0.1;
      this.addBuff("showcase", BUFFS.showcase.seconds * length, {
        helper: h.id,
        power,
      });
      result = { effect, helper: h.id, power, title: `${h.plural} showcase!` };
    } else {
      this.addBuff(effect, BUFFS[effect].seconds * length);
      if (effect === "wave") this.i.addHeat(40);
      result = { effect, title: `${BUFFS[effect].name}!` };
    }
    this.emit("golden", result);
    return result;
  }

  setOption(key, value) {
    this.state.options[key] = value;
    if (key === "notation") setNotation(value);
    this.emit("change");
  }

  exportCode() {
    return exportSave(this.state);
  }

  importCode(code) {
    const state = importSave(code);
    this.replace(state);
  }

  hardReset() {
    wipe();
    this.replace(freshState());
  }

  replace(state) {
    this.state = state;
    setNotation(state.options.notation);
    this.lastTick = Date.now();
    this.refresh();
    this.save();
    this.emit("replace");
  }

  helperShare(id) {
    const total = this.model.helperJps;
    return total > 0 ? this.model.totals[id] / total : 0;
  }
}
