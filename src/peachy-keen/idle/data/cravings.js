export const CRAVE_SECONDS = 20;
export const CRAVE_EVERY = [60, 120];
export const CRAVE_COMBO = 15;
export const CRAVE_RUB = 2;

export const CRAVINGS = [
  { id: "oil", ask: "Oil me up. Now.", can: (m) => m.dare !== "dry" },
  { id: "rub", ask: "Rub me. Slowly.", can: () => true },
  { id: "combo", ask: "Don't stop. Fifteen.", can: () => true },
  { id: "burst", ask: "Make me burst.", can: (m) => m.heatCap >= 100 },
  { id: "grab", ask: "Grab me. Hard.", can: () => true },
  {
    id: "wedgie",
    ask: "Pull it up. Higher.",
    can: (m, toys) => toys.includes("lingerie"),
  },
];
