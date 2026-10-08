import { HELPERS, HELPER_BY_ID, COST_GROWTH } from "./data/helpers";
import { UPGRADE_BY_ID, nonFeathers } from "./data/upgrades";
import { TREE_BY_ID } from "./data/tree";
import { DARE_BY_ID } from "./data/dares";
import { SEED_BY_ID } from "./data/orchard";
import { TOY_BY_ID } from "./data/toys";
import { bulkCost, maxAffordable } from "./numbers";

export const NECTAR_SCALE = 1e9;
const NECTAR_ROOT = 5;
export const OFFLINE_BASE = { rate: 0.25, hours: 8 };
export const HEAT_CAP_COLD = 60;

export const BUFFS = {
  frenzy: { name: "Frenzy", about: "All juice ×7", seconds: 77 },
  storm: { name: "Smack storm", about: "Smacks ×777", seconds: 13 },
  spill: { name: "Oil spill", about: "Fully oiled, oil ×3", seconds: 30 },
  showcase: { name: "Showcase", about: "One helper goes wild", seconds: 30 },
  wave: { name: "Heat wave", about: "Heat never cools", seconds: 20 },
  crave: { name: "Satisfied ×3", about: "All juice ×3", seconds: 30 },
  sweet: { name: "Sweet rot ×21", about: "All juice ×21", seconds: 15 },
  sour: { name: "Sour ×½", about: "All juice ×½", seconds: 60 },
  numb: { name: "Numb", about: "Smacks earn nothing", seconds: 10 },
};

export function nectarFor(juiceTotal, gain = 1) {
  return Math.floor((juiceTotal / NECTAR_SCALE) ** (1 / NECTAR_ROOT) * gain);
}

export function juiceForNectar(nectar, gain = 1) {
  return (nectar / gain) ** NECTAR_ROOT * NECTAR_SCALE;
}

function activeEffects(state, now, toys) {
  const effects = [];
  toys.forEach((id) => {
    if (state.toys.includes(id)) effects.push(...TOY_BY_ID[id].effects);
  });
  state.upgrades.forEach((id) => {
    const u = UPGRADE_BY_ID[id];
    if (u) effects.push(...u.effects);
  });
  state.tree.forEach((id) => {
    const n = TREE_BY_ID[id];
    if (n) effects.push(...n.effects);
  });
  state.dares.done.forEach((id) => {
    const d = DARE_BY_ID[id];
    if (d) effects.push(...d.effects);
  });
  state.orchard.plots.forEach((plot) => {
    if (!plot?.seed || plot.rotten) return;
    const seed = SEED_BY_ID[plot.seed];
    if (seed && plot.plantedAt <= now)
      effects.push({ ...seed.passive, orchard: true });
  });
  return effects;
}

export function buildModel(state, now = Date.now(), toys = []) {
  const m = {
    helperMult: {},
    pairs: [],
    helpersAll: 1,
    global: 1,
    smackMult: 1,
    smackShare: 0,
    tickleAdd: 0,
    tickleMult: 1,
    crit: 0,
    critPower: 10,
    comboPer: 0.03,
    comboCap: 50,
    oil: 0.5,
    glaze: 0,
    oilFloor: 0,
    flush: 0,
    autoHeat: 0,
    heatGain: 1,
    cool: 1,
    burst: 1,
    pits: 1,
    luckyPit: 0,
    rub: 1,
    grab: 1,
    twerk: 1,
    twerkSooner: 1,
    wedgie: 1,
    strip: 1,
    goldenRate: 1,
    goldenLength: 1,
    lucky: 1,
    offline: OFFLINE_BASE.rate,
    offlineCap: OFFLINE_BASE.hours,
    offlineBonus: 0,
    helperDiscount: 1,
    upgradeDiscount: 1,
    nectarPower: 0.02,
    nectarGain: 1,
    growth: 1,
    mutation: 1,
    orchardSize: 3,
    blushPer: 0,
    orchardGlobal: 0,
    orchardSmack: 0,
    start: {},
    skins: ["classic"],
    unlocks: new Set(),
    dare: state.dares.active,
    buzz: 0,
    edged: 1,
  };
  HELPERS.forEach((h) => {
    m.helperMult[h.id] = 1;
  });

  activeEffects(state, now, toys).forEach((e) => {
    switch (e.kind) {
      case "helper":
        m.helperMult[e.helper] *= e.mult;
        break;
      case "pair":
        m.pairs.push(e);
        break;
      case "helpersAll":
        m.helpersAll *= e.mult;
        break;
      case "global":
        if (e.orchard) m.orchardGlobal += e.value;
        else m.global *= e.mult;
        break;
      case "smack":
        if (e.orchard) m.orchardSmack += e.value;
        else m.smackMult *= e.mult;
        break;
      case "smackShare":
        m.smackShare += e.add;
        break;
      case "tickle":
        if (e.add) m.tickleAdd += e.add;
        if (e.mult) m.tickleMult *= e.mult;
        break;
      case "crit":
        m.crit += e.chance;
        break;
      case "critPower":
        m.critPower = Math.max(m.critPower, e.value);
        break;
      case "combo":
        m.comboPer *= e.mult;
        break;
      case "comboCap":
        m.comboCap = Math.max(m.comboCap, e.value);
        break;
      case "oil":
        m.oil += e.add;
        break;
      case "glaze":
        m.glaze += e.add;
        break;
      case "oilFloor":
        m.oilFloor = Math.max(m.oilFloor, e.value);
        break;
      case "flush":
        m.flush += e.orchard ? e.value : e.add;
        break;
      case "autoHeat":
        m.autoHeat += e.add;
        break;
      case "heatGain":
        m.heatGain *= e.mult;
        m.cool /= e.mult;
        break;
      case "cool":
        m.cool *= 1 - e.value;
        break;
      case "burst":
        if (e.orchard) m.burst *= 1 + e.value;
        else m.burst *= e.mult;
        break;
      case "pits":
        m.pits += e.add;
        break;
      case "luckyPit":
        m.luckyPit += e.chance;
        break;
      case "rub":
        if (e.orchard) m.rub *= 1 + e.value;
        else m.rub *= e.mult;
        break;
      case "grab":
        m.grab *= e.mult;
        break;
      case "twerk":
        m.twerk *= e.mult;
        break;
      case "twerkSooner":
        m.twerkSooner *= e.value;
        break;
      case "wedgie":
        m.wedgie *= e.mult;
        break;
      case "strip":
        m.strip *= e.mult;
        break;
      case "goldenRate":
        if (e.orchard) m.goldenRate *= 1 + e.value;
        else m.goldenRate *= e.mult;
        break;
      case "goldenLength":
        m.goldenLength *= e.mult;
        break;
      case "lucky":
        m.lucky *= e.mult;
        break;
      case "offline":
        if (e.orchard) m.offlineBonus += e.value;
        else m.offline = Math.max(m.offline, e.rate);
        break;
      case "offlineCap":
        m.offlineCap = Math.max(m.offlineCap, e.hours);
        break;
      case "helperDiscount":
        m.helperDiscount *= e.mult;
        break;
      case "upgradeDiscount":
        m.upgradeDiscount *= e.mult;
        break;
      case "nectarPower":
        m.nectarPower = Math.max(m.nectarPower, e.value);
        break;
      case "nectarGain":
        m.nectarGain *= e.mult;
        break;
      case "growth":
        m.growth *= e.mult;
        break;
      case "mutation":
        m.mutation *= e.mult;
        break;
      case "orchardSize":
        m.orchardSize = Math.max(m.orchardSize, e.size);
        break;
      case "blush":
        m.blushPer += e.per;
        break;
      case "start":
        Object.entries(e.helpers).forEach(([id, n]) => {
          m.start[id] = Math.max(m.start[id] || 0, n);
        });
        break;
      case "skin":
        m.skins.push(e.skin);
        break;
      case "buzz":
        m.buzz = e.mult;
        break;
      case "edged":
        m.edged *= e.mult;
        break;
      case "unlock":
        m.unlocks.add(e.what);
        break;
      default:
    }
  });

  m.offline = Math.min(1, m.offline + m.offlineBonus);
  m.nectarMult = 1 + state.nectarTotal * m.nectarPower;
  m.trophyMult = 1 + state.achievements.length * (0.01 + m.blushPer);
  m.global *= m.nectarMult * m.trophyMult * (1 + m.orchardGlobal);

  const tickle = m.tickleAdd * m.tickleMult * nonFeathers(state);
  m.tickle = tickle;
  m.rates = {};
  m.totals = {};
  m.helperJps = 0;
  HELPERS.forEach((h) => {
    let rate = h.rate + (h.id === "feather" ? tickle : 0);
    rate *= m.helperMult[h.id] * m.helpersAll;
    m.pairs.forEach((p) => {
      if (p.helper === h.id) rate *= 1 + p.value * (state.helpers[p.per] || 0);
    });
    if (m.dare === "dry" && h.id === "baron") rate = 0;
    m.rates[h.id] = rate * m.global;
    m.totals[h.id] = m.rates[h.id] * (state.helpers[h.id] || 0);
    m.helperJps += m.totals[h.id];
  });
  m.smackBase = (1 + tickle) * m.smackMult * m.global * (1 + m.orchardSmack);
  if (m.dare === "dry") {
    m.oil = 0;
    m.glaze = 0;
  }
  m.heatCap = m.dare === "cold" ? HEAT_CAP_COLD : 100;
  m.handsOff = m.dare === "handsoff";
  m.noGolden = m.dare === "unlucky";
  m.noUpgrades = m.dare === "chaste";
  m.maxOwned = m.dare === "minimal" ? 10 : Infinity;
  return m;
}

export function buffActive(state, id, now = Date.now()) {
  return state.buffs.find((b) => b.id === id && b.until > now);
}

export function flushMult(m, heat) {
  return 1 + m.flush * (heat / 100) ** 2;
}

export function liveRate(m, state, { heat = 0, oil = 0 }, now = Date.now()) {
  let rate = m.helperJps * (1 + m.glaze * oil) * flushMult(m, heat);
  if (buffActive(state, "frenzy", now)) rate *= 7;
  if (buffActive(state, "crave", now)) rate *= 3;
  if (buffActive(state, "sweet", now)) rate *= 21;
  if (buffActive(state, "sour", now)) rate *= 0.5;
  const show = buffActive(state, "showcase", now);
  if (show) rate += m.totals[show.helper] * show.power;
  return rate;
}

export function smackValue(m, state, live, hit, now = Date.now()) {
  if (m.handsOff) return 0;
  const rate = liveRate(m, state, live, now);
  let value = m.smackBase + m.smackShare * rate;
  value *= 0.6 + 0.4 * Math.min(2, hit.strength ?? 1);
  value *= 1 + Math.min(hit.combo ?? 0, m.comboCap) * m.comboPer;
  const spill = buffActive(state, "spill", now) ? 3 : 1;
  value *= 1 + live.oil * m.oil * spill;
  value *= flushMult(m, live.heat);
  if (buffActive(state, "frenzy", now)) value *= 7;
  if (buffActive(state, "crave", now)) value *= 3;
  if (buffActive(state, "sweet", now)) value *= 21;
  if (buffActive(state, "sour", now)) value *= 0.5;
  if (buffActive(state, "numb", now)) return 0;
  if (buffActive(state, "storm", now)) value *= 777;
  return value;
}

export function helperCost(m, state, id, count = 1) {
  const h = HELPER_BY_ID[id];
  return bulkCost(
    h.cost * m.helperDiscount,
    COST_GROWTH,
    state.helpers[id] || 0,
    count,
  );
}

const SELL_REFUND = 0.5;

export function helperRefund(m, state, id, count = 1) {
  const h = HELPER_BY_ID[id];
  const owned = state.helpers[id] || 0;
  return (
    SELL_REFUND *
    bulkCost(h.cost * m.helperDiscount, COST_GROWTH, owned - count + 1, count)
  );
}

export function helperMax(m, state, id) {
  const h = HELPER_BY_ID[id];
  const n = maxAffordable(
    h.cost * m.helperDiscount,
    COST_GROWTH,
    state.helpers[id] || 0,
    state.juice,
  );
  return Math.min(n, m.maxOwned - (state.helpers[id] || 0));
}

export function upgradeCost(m, upgrade) {
  return upgrade.cost * m.upgradeDiscount;
}

export function burstPayout(m, state, live, now = Date.now()) {
  const rate = liveRate(m, state, live, now);
  return m.burst * (rate * 8 + (m.handsOff ? 0 : m.smackBase * 25));
}
