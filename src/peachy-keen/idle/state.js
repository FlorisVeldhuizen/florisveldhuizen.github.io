import { buildModel, nectarFor } from "./economy";
import { TREE_BY_ID } from "./data/tree";

const STORAGE_KEY = "peachy-keen-idle";
const VERSION = 3;

const freshStats = () => ({
  smacks: 0,
  crits: 0,
  bursts: 0,
  goldens: 0,
  bruises: 0,
  ripens: 0,
  pours: 0,
  grabs: 0,
  twerks: 0,
  wedgies: 0,
  strips: 0,
  cravings: 0,
  harvests: 0,
  plantings: 0,
  rubSeconds: 0,
  bestCombo: 0,
  hottest: 0,
  bestRate: 0,
  handJuice: 0,
  played: 0,
  away: 0,
  longestAway: 0,
});

export function freshRun(state) {
  Object.assign(state, {
    juice: 0,
    juiceRun: 0,
    helpers: {},
    peak: {},
    butlerSkip: [],
    upgrades: [],
    runTime: 0,
    runSmacks: 0,
    runBursts: 0,
    buffs: [],
  });
  return state;
}

export function freshState() {
  return freshRun({
    version: VERSION,
    juiceTotal: 0,
    pits: 0,
    pitsTotal: 0,
    nectar: 0,
    nectarTotal: 0,
    achievements: [],
    tree: [],
    toys: [],
    dares: { active: null, done: [] },
    orchard: { plots: [], discovered: ["cling", "free"], open: false },
    stats: freshStats(),
    options: {
      notation: "short",
      buy: 1,
      sell: false,
      butler: false,
      valet: false,
      skin: "classic",
      cast: true,
      castSound: true,
      helperStyle: "room",
      freshCrate: false,
    },
    seen: {},
    savedAt: Date.now(),
    startedAt: Date.now(),
  });
}

function merge(base, saved) {
  Object.keys(saved).forEach((key) => {
    const value = saved[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === "object" &&
      !Array.isArray(base[key])
    ) {
      merge(base[key], value);
    } else {
      // eslint-disable-next-line no-param-reassign
      base[key] = value;
    }
  });
  return base;
}

function rescaleNectar(state) {
  const earned = nectarFor(state.juiceTotal, buildModel(state).nectarGain);
  const spent = state.tree.reduce((sum, id) => sum + TREE_BY_ID[id].cost, 0);
  Object.assign(state, {
    nectarTotal: Math.min(state.nectarTotal, earned),
    nectar: Math.min(state.nectar, Math.max(0, earned - spent)),
  });
}

export function decode(text) {
  const saved = JSON.parse(text);
  if (!saved || typeof saved !== "object" || typeof saved.juice !== "number")
    throw new Error("Not a Jiggle Peach save");
  const state = merge(freshState(), saved);
  if (state.version < 2 && state.toys.includes("talk")) state.toys.push("shy");
  if (state.options.helperStyle === "props") state.options.helperStyle = "room";
  if (state.version < 3) rescaleNectar(state);
  state.options.sell = false;
  state.version = VERSION;
  return state;
}

export function load() {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (text) return decode(text);
  } catch {
    // A broken or blocked save starts a new game rather than a blank page.
  }
  return freshState();
}

export function save(state) {
  // eslint-disable-next-line no-param-reassign
  state.savedAt = Date.now();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function exportSave(state) {
  const json = JSON.stringify({ ...state, savedAt: Date.now() });
  let binary = "";
  new TextEncoder().encode(json).forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export function importSave(code) {
  const bytes = Uint8Array.from(atob(code.trim()), (c) => c.charCodeAt(0));
  return decode(new TextDecoder().decode(bytes));
}

export function wipe() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to remove when storage is blocked.
  }
}
