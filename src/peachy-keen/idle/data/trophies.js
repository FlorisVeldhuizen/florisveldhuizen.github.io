import { HELPERS } from "./helpers";
import { SEEDS } from "./orchard";
import { DARES } from "./dares";
import { TREE } from "./tree";
import { format } from "../numbers";

const owned = (s, id) => s.helpers[id] || 0;

const JUICE = [
  [1e3, "Moist", "Earn a thousand juice."],
  [1e5, "Dripping", "Earn a hundred thousand juice."],
  [1e6, "Juicy", "Earn a million juice."],
  [1e8, "Sticky situation", "Earn a hundred million juice."],
  [1e9, "Juice box", "Earn a billion juice."],
  [1e11, "Splash zone", "Earn a hundred billion juice."],
  [1e12, "Juice cleanse", "Earn a trillion juice."],
  [1e14, "Flood warning", "Earn a hundred trillion juice."],
  [1e15, "Tsunami", "Earn a quadrillion juice."],
  [1e18, "Juice ocean", "Earn a quintillion juice."],
  [1e21, "Juice planet", "Earn a sextillion juice."],
  [1e24, "Juiceverse", "Earn a septillion juice."],
  [1e27, "Beyond juice", "Earn an octillion juice."],
].map(([n, name, about]) => ({
  icon: "juice",
  id: `juice-${n}`,
  name,
  about,
  test: (s) => s.juiceTotal >= n,
}));

const RATE = [
  [10, "Trickle"],
  [1e3, "Drizzle"],
  [1e5, "Downpour"],
  [1e7, "Fire hose"],
  [1e9, "Burst pipe"],
  [1e11, "Niagara"],
  [1e13, "Monsoon"],
  [1e15, "Biblical"],
].map(([n, name]) => ({
  icon: "juice",
  id: `rate-${n}`,
  name,
  about: `Make ${format(n)} juice per second.`,
  test: (s) => s.stats.bestRate >= n,
}));

const SMACKS = [
  [1, "Hello there", "First smack. It won't be the last."],
  [10, "Warmed up", "Ten smacks."],
  [69, "Nice.", "69 smacks. Nice."],
  [100, "Centurion", "A hundred smacks. Your hand is fine. Probably."],
  [500, "Carpal tunnel", "Five hundred smacks. Stretch your wrist."],
  [1000, "Iron palm", "A thousand smacks."],
  [5000, "Spank bank", "Five thousand smacks."],
  [10000, "Ten thousand hands", "Ten thousand smacks."],
  [50000, "The long game", "Fifty thousand smacks. Go outside."],
  [100000, "Legendary hand", "A hundred thousand smacks."],
].map(([n, name, about]) => ({
  icon: "hand",
  id: n === 1 ? "first" : `smacks-${n}`,
  name,
  about,
  test: (s) => s.stats.smacks >= n,
}));

const BURSTS = [
  [1, "Pop!", "First burst."],
  [5, "Serial peacher", "Five bursts."],
  [25, "Juice fountain", "25 bursts."],
  [100, "Pit collector", "A hundred bursts."],
  [500, "Stone cold", "Five hundred bursts."],
  [2000, "Peach apocalypse", "Two thousand bursts."],
].map(([n, name, about]) => ({
  icon: "pit",
  id: n === 1 ? "pop" : `bursts-${n}`,
  name,
  about,
  test: (s) => s.stats.bursts >= n,
}));

const GOLDEN = [
  [1, "Golden touch", "Click a golden peach."],
  [7, "Lucky seven", "Click 7 golden peaches."],
  [27, "Gold digger", "Click 27 golden peaches."],
  [77, "Fort Knox", "Click 77 golden peaches."],
  [777, "Jackpot", "Click 777 golden peaches."],
].map(([n, name, about]) => ({
  icon: "golden",
  id: `golden-${n}`,
  name,
  about,
  test: (s) => s.stats.goldens >= n,
}));

const COMBOS = [
  [10, "Drum solo", "A ten-hit combo."],
  [25, "Rimshot", "A 25-hit combo."],
  [50, "Blast beat", "A 50-hit combo."],
  [100, "Metronome", "A 100-hit combo."],
].map(([n, name, about]) => ({
  icon: "hand",
  id: n === 10 ? "drum" : `combo-${n}`,
  name,
  about,
  test: (s) => s.stats.bestCombo >= n,
}));

const HELPER_COUNTS = [
  [1, (h) => `First ${h.name}`, (h) => `Own a ${h.name}.`],
  [50, (h) => `${h.plural} galore`, (h) => `Own 50 ${h.plural}.`],
  [100, (h) => `Century of ${h.plural}`, (h) => `Own 100 ${h.plural}.`],
  [200, (h) => `${h.name} empire`, (h) => `Own 200 ${h.plural}.`],
];

const HELPER_TROPHIES = HELPERS.flatMap((h) =>
  HELPER_COUNTS.map(([n, name, about]) => ({
    id: `own-${h.id}-${n}`,
    name: name(h),
    about: about(h),
    icon: h.id,
    test: (s) => owned(s, h.id) >= n,
  })),
);

const RIPENS = [
  [1, "Ripe", "Ripen once."],
  [5, "Reborn", "Ripen five times."],
  [10, "Seasoned", "Ripen ten times."],
  [25, "Eternal peach", "Ripen 25 times."],
].map(([n, name, about]) => ({
  icon: "nectar",
  id: `ripen-${n}`,
  name,
  about,
  test: (s) => s.stats.ripens >= n,
}));

const ORCHARD = [
  {
    icon: "seed",
    id: "plant-1",
    name: "Green thumb",
    about: "Plant a pit in the Orchard.",
    test: (s) => s.stats.plantings >= 1,
  },
  {
    icon: "seed",
    id: "harvest-10",
    name: "Harvest festival",
    about: "Harvest 10 ripe peaches.",
    test: (s) => s.stats.harvests >= 10,
  },
  {
    icon: "seed",
    id: "harvest-100",
    name: "Peach farmer",
    about: "Harvest 100 ripe peaches.",
    test: (s) => s.stats.harvests >= 100,
  },
  ...SEEDS.slice(2).map((seed) => ({
    icon: "seed",
    id: `seed-${seed.id}`,
    name: `Discovered: ${seed.name}`,
    about: `Grow a ${seed.name}.`,
    test: (s) => s.orchard.discovered.includes(seed.id),
  })),
];

const DARE_TROPHIES = DARES.map((d) => ({
  icon: "heat",
  id: `dare-${d.id}`,
  name: `Dared: ${d.name}`,
  about: `Complete the ${d.name} dare.`,
  test: (s) => s.dares.done.includes(d.id),
}));

const SPECIAL = [
  {
    id: "unwrapped",
    name: "Unwrapped",
    about: "The lingerie came off.",
    test: (s) => s.stats.strips >= 1,
  },
  {
    id: "atomic",
    name: "Atomic",
    about: "A wedgie with a snap.",
    test: (s) => s.stats.wedgies >= 1,
  },
  {
    id: "slippery",
    name: "Slippery when wet",
    about: "Fully oiled.",
    test: (s) => s.seen.fullyOiled,
  },
  {
    id: "patience",
    name: "Worth the wait",
    about: "You finished after edging.",
    test: (s) => s.seen.edged,
  },
  {
    id: "crit",
    name: "Right there",
    about: "Land a critical smack.",
    test: (s) => s.stats.crits >= 1,
  },
  {
    id: "twerk",
    name: "Look what I can do",
    about: "Let the peach twerk for you.",
    test: (s) => s.stats.twerks >= 1,
  },
  {
    id: "away",
    name: "Did you miss me?",
    about: "Come back after at least an hour away.",
    test: (s) => s.stats.longestAway >= 3600,
  },
  {
    id: "overnight",
    name: "Morning glory",
    about: "Come back after at least eight hours away.",
    test: (s) => s.stats.longestAway >= 8 * 3600,
  },
  {
    id: "hot",
    name: "Hot to trot",
    about: "Heat the peach to the edge.",
    test: (s) => s.stats.hottest >= 99,
  },
  {
    id: "massage",
    name: "Masseur",
    about: "Rub the peach for a full minute in total.",
    test: (s) => s.stats.rubSeconds >= 60,
  },
  {
    id: "grabby",
    name: "Grabby",
    about: "Grab the peach 50 times.",
    test: (s) => s.stats.grabs >= 50,
  },
  {
    id: "shopaholic",
    name: "Shopaholic",
    about: "Own 50 upgrades at once.",
    test: (s) => s.upgrades.length >= 50,
  },
  {
    id: "collector",
    name: "Completionist",
    about: "Own 100 upgrades at once.",
    test: (s) => s.upgrades.length >= 100,
  },
  {
    id: "frenzy-golden",
    name: "Double dip",
    about: "Click a golden peach during a Frenzy.",
    test: (s) => s.seen.doubleDip,
  },
  {
    id: "no-feathers",
    name: "Featherless",
    about: "Reach a million juice in a run without buying a Feather.",
    test: (s) => s.juiceRun >= 1e6 && !owned(s, "feather"),
  },
  {
    id: "pits-100",
    name: "The pits",
    about: "Collect 100 pits in total.",
    test: (s) => s.pitsTotal >= 100,
  },
  {
    id: "tree-all",
    name: "Tree hugger",
    about: "Grow every branch of the Nectar tree.",
    test: (s) => s.tree.length >= TREE.length,
  },
  {
    id: "played-hour",
    name: "Committed",
    about: "Play for a total of one hour.",
    test: (s) => s.stats.played >= 3600,
  },
  {
    id: "played-day",
    name: "Devoted",
    about: "Play for a total of 24 hours.",
    test: (s) => s.stats.played >= 86400,
  },
];

export const TROPHIES = [
  ...SMACKS,
  ...JUICE,
  ...RATE,
  ...BURSTS,
  ...COMBOS,
  ...GOLDEN,
  ...SPECIAL,
  ...RIPENS,
  ...ORCHARD,
  ...DARE_TROPHIES,
  ...HELPER_TROPHIES,
];

export const TROPHY_BY_ID = Object.fromEntries(TROPHIES.map((t) => [t.id, t]));
