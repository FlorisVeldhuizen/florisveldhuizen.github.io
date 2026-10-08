export const CRAVE_SECONDS = 20;
export const CRAVE_EVERY = [60, 120];
export const CRAVE_COMBO = 15;
export const CRAVE_RUB = 2;

export const CRAVINGS = [
  {
    id: "oil",
    ask: {
      cheeky: "Oil me up. Now.",
      shy: "Could you… oil me?",
      off: "Some oil, please.",
    },
    can: (m) => m.dare !== "dry",
  },
  {
    id: "rub",
    ask: {
      cheeky: "Rub me. Slowly.",
      shy: "A slow rub? Please?",
      off: "A slow rub, please.",
    },
    can: () => true,
  },
  {
    id: "combo",
    ask: {
      cheeky: "Don't stop. Fifteen.",
      shy: "Fifteen in a row… gently?",
      off: "A 15-hit combo, please.",
    },
    can: () => true,
  },
  {
    id: "burst",
    ask: {
      cheeky: "Make me burst.",
      shy: "I think I'm about to… burst.",
      off: "A burst, please.",
    },
    can: (m) => m.heatCap >= 100,
  },
  {
    id: "grab",
    ask: {
      cheeky: "Grab me. Hard.",
      shy: "Hold me? Just for a bit.",
      off: "A grab, please.",
    },
    can: () => true,
  },
  {
    id: "wedgie",
    ask: {
      cheeky: "Pull it up. Higher.",
      shy: "Um… pull it up a little?",
      off: "A wedgie, please.",
    },
    can: (m, toys) => toys.includes("lingerie"),
  },
];

export const CRAVE_REPLIES = {
  cheeky: {
    yes: ["Mm. Exactly that.", "Good. So good.", "Yes. Just like that."],
    no: ["Too slow.", "Never mind, then."],
  },
  shy: {
    yes: ["Oh… thank you.", "That was… nice.", "Mm… yes."],
    no: ["Oh. That's okay.", "Maybe next time…"],
  },
  off: {
    yes: ["Thank you."],
    no: ["Too late."],
  },
};
