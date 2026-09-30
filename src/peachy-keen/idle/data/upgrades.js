import { HELPERS, HELPER_BY_ID, TIER_AT, TIER_PRICE } from "./helpers";

const owned = (s, id) => s.helpers[id] || 0;
const nonFeathers = (s) =>
  HELPERS.reduce(
    (sum, h) => sum + (h.id === "feather" ? 0 : owned(s, h.id)),
    0,
  );

const tierUpgrades = HELPERS.flatMap((helper) =>
  helper.tiers.map(([name, about], tier) => ({
    id: `${helper.id}-${tier}`,
    name,
    about,
    group: "helper",
    icon: helper.id,
    cost: helper.cost * TIER_PRICE[tier],
    unlock: (s) => owned(s, helper.id) >= TIER_AT[tier],
    effects: [{ kind: "helper", helper: helper.id, mult: 2 }],
  })),
);

const TICKLE = [
  ["Tickle fight", 1e5, 25, 0.1],
  ["Tickle war", 1e7, 50, 5],
  ["Tickle apocalypse", 1e8, 100, 10],
  ["Tickle singularity", 1e10, 150, 20],
  ["Tickle heat death", 1e13, 200, 20],
  ["Tickle afterlife", 1e16, 250, 20],
].map(([name, cost, need, value], n) => ({
  id: `tickle-${n}`,
  name,
  about:
    n === 0
      ? "Feathers and smacks gain +0.1 juice for every helper that isn't a Feather."
      : `The tickle bonus is ×${value}.`,
  group: "smack",
  icon: "feather",
  cost,
  unlock: (s) => owned(s, "feather") >= need,
  effects: [
    n === 0 ? { kind: "tickle", add: value } : { kind: "tickle", mult: value },
  ],
}));

const PALMS = [
  ["Kinetic palm", 5e4, 1e3],
  ["Seismic palm", 5e6, 5e3],
  ["Tectonic palm", 5e8, 2e4],
  ["Palm of the gods", 5e10, 5e4],
  ["Palm of all gods", 5e12, 1e5],
  ["Palm of the void", 5e14, 2e5],
].map(([name, cost, need], n) => ({
  id: `palm-${n}`,
  name,
  about: "Each smack also earns 1% of your juice per second.",
  group: "smack",
  icon: "hand",
  cost,
  unlock: (s) => s.stats.smacks >= need,
  effects: [{ kind: "smackShare", add: 0.01 }],
}));

const HANDS = [
  ["Open palm", 100, 10, "Smacks earn twice as much. Fingers together."],
  ["Firm grip", 500, 50, "Smacks earn twice as much. Knuckles white."],
  ["Ambidextrous", 1e4, 250, "Both hands now. Smacks ×2."],
].map(([name, cost, need, about], n) => ({
  id: `hand-${n}`,
  name,
  about,
  group: "smack",
  icon: "hand",
  cost,
  unlock: (s) => s.stats.smacks >= need,
  effects: [{ kind: "smack", mult: 2 }],
}));

const SPOTS = [
  {
    id: "spot-0",
    name: "Sweet spot",
    about: "Smacks have a 5% chance to land a critical ×10.",
    cost: 2e4,
    unlock: (s) => s.stats.smacks >= 500,
    effects: [{ kind: "crit", chance: 0.05 }],
  },
  {
    id: "spot-1",
    name: "Sweeter spot",
    about: "Critical chance +5%.",
    cost: 2e7,
    unlock: (s) => s.stats.crits >= 50,
    effects: [{ kind: "crit", chance: 0.05 }],
  },
  {
    id: "spot-2",
    name: "The spot",
    about: "Critical smacks hit ×25 instead of ×10.",
    cost: 2e10,
    unlock: (s) => s.stats.crits >= 250,
    effects: [{ kind: "critPower", value: 25 }],
  },
  {
    id: "combo-0",
    name: "Rhythm section",
    about: "Combos build twice as much bonus.",
    cost: 5e4,
    unlock: (s) => s.stats.bestCombo >= 10,
    effects: [{ kind: "combo", mult: 2 }],
  },
  {
    id: "combo-1",
    name: "Drum solo",
    about: "Combos can build up to ×100 instead of ×50.",
    cost: 5e7,
    unlock: (s) => s.stats.bestCombo >= 30,
    effects: [{ kind: "comboCap", value: 100 }],
  },
].map((u) => ({ group: "smack", icon: "hand", ...u }));

const OIL = [
  {
    id: "oil-0",
    name: "Slick hands",
    about: "Oil boosts smacks by +50% more at full shine.",
    cost: 2000,
    unlock: (s) => s.stats.pours > 0,
    effects: [{ kind: "oil", add: 0.5 }],
  },
  {
    id: "oil-1",
    name: "Baby oil",
    about: "Oil boosts smacks by another +100%.",
    cost: 2e6,
    unlock: (s) => s.stats.pours > 20,
    effects: [{ kind: "oil", add: 1 }],
  },
  {
    id: "oil-2",
    name: "Glazed",
    about: "Oil shine also boosts every helper by up to +25%.",
    cost: 2e8,
    unlock: (s) => owned(s, "baron") >= 10,
    effects: [{ kind: "glaze", add: 0.25 }],
  },
  {
    id: "oil-3",
    name: "Standing order",
    about: "Oil Barons keep the peach at least 40% oiled.",
    cost: 5e9,
    unlock: (s) => owned(s, "baron") >= 50,
    effects: [{ kind: "oilFloor", value: 0.4 }],
  },
  {
    id: "oil-4",
    name: "Coconut oil",
    about: "Oil boosts smacks by another +200%. Smells like holiday.",
    cost: 5e11,
    unlock: (s) => s.stats.pours > 100,
    effects: [{ kind: "oil", add: 2 }],
  },
].map((u) => ({ group: "oil", icon: "baron", ...u }));

const HEAT = [
  {
    id: "flush-0",
    name: "Hot flush",
    about: "While the peach is hot, all juice gets up to +50% more.",
    cost: 5000,
    unlock: (s) => s.stats.hottest >= 75,
    effects: [{ kind: "flush", add: 0.5 }],
  },
  {
    id: "flush-1",
    name: "Fever dream",
    about: "The heat bonus goes up by another +50%.",
    cost: 5e7,
    unlock: (s) => s.stats.bursts >= 10,
    effects: [{ kind: "flush", add: 0.5 }],
  },
  {
    id: "flush-2",
    name: "Spontaneous combustion",
    about: "The heat bonus goes up by another +100%.",
    cost: 5e11,
    unlock: (s) => s.stats.bursts >= 100,
    effects: [{ kind: "flush", add: 1 }],
  },
  {
    id: "warm-0",
    name: "Warm hands",
    about: "Your helpers slowly heat the peach up on their own.",
    cost: 3e4,
    unlock: (s) => owned(s, "paddle") >= 5 && s.stats.bursts >= 1,
    effects: [{ kind: "autoHeat", add: 1 }],
  },
  {
    id: "warm-1",
    name: "Hot hands",
    about: "Helpers heat the peach three times as fast.",
    cost: 3e7,
    unlock: (s) => owned(s, "coach") >= 10,
    effects: [{ kind: "autoHeat", add: 2 }],
  },
  {
    id: "warm-2",
    name: "Molten hands",
    about: "Helpers heat the peach twice as fast again.",
    cost: 3e11,
    unlock: (s) => owned(s, "spa") >= 25,
    effects: [{ kind: "autoHeat", add: 3 }],
  },
  {
    id: "burst-0",
    name: "Big finish",
    about: "Bursts pay out twice as much.",
    cost: 1000,
    unlock: (s) => s.stats.bursts >= 1,
    effects: [{ kind: "burst", mult: 2 }],
  },
  {
    id: "burst-1",
    name: "Encore",
    about: "Bursts pay out twice as much.",
    cost: 1e6,
    unlock: (s) => s.stats.bursts >= 5,
    effects: [{ kind: "burst", mult: 2 }],
  },
  {
    id: "burst-2",
    name: "Standing ovation",
    about: "Bursts pay out twice as much.",
    cost: 1e9,
    unlock: (s) => s.stats.bursts >= 25,
    effects: [{ kind: "burst", mult: 2 }],
  },
  {
    id: "burst-3",
    name: "Legendary performance",
    about: "Bursts pay out three times as much.",
    cost: 1e13,
    unlock: (s) => s.stats.bursts >= 100,
    effects: [{ kind: "burst", mult: 3 }],
  },
  {
    id: "pit-0",
    name: "Pit stop",
    about: "Each burst drops one more pit.",
    cost: 2.5e5,
    unlock: (s) => s.stats.bursts >= 10,
    effects: [{ kind: "pits", add: 1 }],
  },
  {
    id: "pit-1",
    name: "Stone cold",
    about: "Each burst drops one more pit.",
    cost: 2.5e9,
    unlock: (s) => s.stats.bursts >= 50,
    effects: [{ kind: "pits", add: 1 }],
  },
  {
    id: "pit-2",
    name: "Pitmaster",
    about: "Each burst drops two more pits.",
    cost: 2.5e13,
    unlock: (s) => s.stats.bursts >= 200,
    effects: [{ kind: "pits", add: 2 }],
  },
].map((u) => ({ group: "heat", icon: "heat", ...u }));

const PLAY = [
  {
    id: "rub-0",
    name: "Deep tissue",
    about: "Rubbing and massaging earn three times as much.",
    cost: 3000,
    unlock: (s) => s.stats.rubSeconds >= 10,
    effects: [{ kind: "rub", mult: 3 }],
  },
  {
    id: "rub-1",
    name: "Happy hands",
    about: "Rubbing and massaging earn three times as much.",
    cost: 3e8,
    unlock: (s) => s.stats.rubSeconds >= 300,
    effects: [{ kind: "rub", mult: 3 }],
  },
  {
    id: "knead-0",
    name: "Kneading dough",
    about: "Grabs and snapbacks earn five times as much.",
    cost: 8000,
    unlock: (s) => s.stats.grabs >= 10,
    effects: [{ kind: "grab", mult: 5 }],
  },
  {
    id: "twerk-0",
    name: "Shake it",
    about: "Every twerk beat while you're away earns 3× as much.",
    cost: 1e4,
    unlock: (s) => s.stats.twerks >= 1,
    effects: [{ kind: "twerk", mult: 3 }],
  },
  {
    id: "twerk-1",
    name: "Drop it low",
    about: "Twerks start sooner and earn 3× as much.",
    cost: 1e8,
    unlock: (s) => s.stats.twerks >= 25,
    effects: [
      { kind: "twerk", mult: 3 },
      { kind: "twerkSooner", value: 0.5 },
    ],
  },
  {
    id: "thong-0",
    name: "Thong song",
    about: "Wedgies earn five times as much.",
    cost: 5e4,
    unlock: (s) => s.stats.wedgies >= 1,
    effects: [{ kind: "wedgie", mult: 5 }],
  },
  {
    id: "strip-0",
    name: "Striptease",
    about: "Taking the lingerie off earns ten times as much.",
    cost: 5e4,
    unlock: (s) => s.stats.strips >= 1,
    effects: [{ kind: "strip", mult: 10 }],
  },
].map((u) => ({ group: "play", icon: "play", ...u }));

const GOLDEN = [
  [
    "Lucky charm",
    7.7e4,
    1,
    [{ kind: "goldenRate", mult: 1.15 }],
    "Golden peaches show up 15% more often.",
  ],
  [
    "Four-leaf clover",
    7.7e7,
    7,
    [{ kind: "goldenRate", mult: 1.15 }],
    "Golden peaches show up 15% more often.",
  ],
  [
    "Horseshoe",
    7.7e9,
    27,
    [{ kind: "goldenLength", mult: 1.5 }],
    "Golden peach effects last 50% longer.",
  ],
  [
    "Get lucky",
    7.7e11,
    77,
    [
      { kind: "goldenRate", mult: 1.2 },
      { kind: "goldenLength", mult: 1.2 },
    ],
    "Golden peaches come 20% more often and last 20% longer.",
  ],
].map(([name, cost, need, effects, about], n) => ({
  id: `golden-${n}`,
  name,
  about,
  group: "golden",
  icon: "golden",
  cost,
  unlock: (s) => s.stats.goldens >= need,
  effects,
}));

const RECIPES = [
  ["Peach cobbler", 5e4, 0.05],
  ["Bellini", 5e5, 0.05],
  ["Peach melba", 5e6, 0.1],
  ["Peaches and cream", 5e7, 0.1],
  ["Fuzzy navel", 5e8, 0.15],
  ["Peach schnapps", 5e9, 0.15],
  ["Georgia pie", 5e10, 0.2],
  ["Peach iced tea", 5e11, 0.2],
  ["Bellini royale", 5e12, 0.25],
  ["Peach tatin", 5e13, 0.25],
  ["Peach sorbet", 5e14, 0.3],
  ["Peach brandy", 5e15, 0.3],
  ["Peach soufflé", 5e16, 0.35],
  ["Ambrosia", 5e17, 0.4],
].map(([name, cost, add], n) => ({
  id: `recipe-${n}`,
  name,
  about: `All juice +${Math.round(add * 100)}%.`,
  group: "global",
  icon: "recipe",
  cost,
  unlock: (s) => s.juiceRun >= cost / 5,
  effects: [{ kind: "global", mult: 1 + add }],
}));

const BLUSH = [
  ["Pillow talk", 1e6, 10, 0.01],
  ["Sweet nothings", 1e9, 25, 0.015],
  ["Dirty talk", 1e12, 50, 0.02],
  ["Love bombing", 1e15, 75, 0.025],
  ["Soulmates", 1e18, 100, 0.03],
].map(([name, cost, need, per], n) => ({
  id: `blush-${n}`,
  name,
  about: `All juice +${per * 100}% for every trophy you own.`,
  group: "global",
  icon: "blush",
  cost,
  unlock: (s) => s.achievements.length >= need,
  effects: [{ kind: "blush", per }],
}));

const PAIRS = [
  ["admirer", "paddle", "Secret admirer", "Admirers bring their own Paddles."],
  [
    "masseuse",
    "baron",
    "Hot oil massage",
    "Masseuses and Oil Barons work together.",
  ],
  ["coach", "choir", "Backing dancers", "The Choir sings, the Coaches count."],
  ["spa", "press", "Juice cleanse", "The Spa serves fresh-pressed juice."],
  ["cult", "moon", "Moon worship", "The Cult howls at the Peach Moon."],
  [
    "collider",
    "singularity",
    "Accidental black hole",
    "The Collider made a Singularity. Oops.",
  ],
  [
    "singularity",
    "peachverse",
    "Big bounce",
    "Every Singularity births a Peachverse.",
  ],
].map(([a, b, name, about]) => ({
  id: `pair-${a}-${b}`,
  name,
  about: `${about} ${HELPER_BY_ID[a].plural} +5% per ${HELPER_BY_ID[b].name}, ${HELPER_BY_ID[b].plural} +0.1% per ${HELPER_BY_ID[a].name}.`,
  group: "helper",
  icon: a,
  cost: (HELPER_BY_ID[a].cost + HELPER_BY_ID[b].cost) * 150,
  unlock: (s) => owned(s, a) >= 15 && owned(s, b) >= 15,
  effects: [
    { kind: "pair", helper: a, per: b, value: 0.05 },
    { kind: "pair", helper: b, per: a, value: 0.001 },
  ],
}));

export const UPGRADES = [
  ...HANDS,
  ...tierUpgrades,
  ...TICKLE,
  ...PALMS,
  ...SPOTS,
  ...OIL,
  ...HEAT,
  ...PLAY,
  ...GOLDEN,
  ...RECIPES,
  ...BLUSH,
  ...PAIRS,
];

export const UPGRADE_BY_ID = Object.fromEntries(UPGRADES.map((u) => [u.id, u]));

export { nonFeathers };
