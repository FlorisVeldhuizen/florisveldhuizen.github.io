const has = (s, id, n = 1) => (s.helpers[id] || 0) >= n;

export const NEWS = [
  {
    test: () => true,
    lines: [
      "Local peach reports feeling 'seen'.",
      "Scientists confirm: peaches are, in fact, fruit. Crowd disappointed.",
      "Weather: warm, with a chance of juice.",
      "Opinion: is it wrong to want another smack? Our columnist says no.",
      "Peach refuses to comment on 'the crease'.",
      "Fruit bowl drama as banana accuses peach of attention-seeking.",
      "Study: 9 out of 10 hands prefer peaches.",
      "Horoscope for Stone Fruits: someone will touch you today.",
    ],
  },
  {
    test: (s) => s.juiceTotal < 1000,
    lines: [
      "Rumours spread of a peach that pays you to smack it.",
      "Nobody has noticed the peach yet. Yet.",
      "Peach sits alone in the dark, waiting.",
    ],
  },
  {
    test: (s) => has(s, "feather"),
    lines: [
      "Feather union demands better tickling conditions.",
      "Pillow manufacturers report mysterious feather shortage.",
      "Ostriches file missing-plume report.",
    ],
  },
  {
    test: (s) => has(s, "admirer"),
    lines: [
      "Admirers form an orderly queue. Mostly orderly.",
      "Local admirer writes 400-page poem titled 'Cheeks'.",
      "Admirer caught sniffing the fruit bowl. Says it was research.",
    ],
  },
  {
    test: (s) => has(s, "paddle"),
    lines: [
      "Ping-pong federation denies involvement.",
      "Wooden spoon sales plummet as paddles take over.",
      "Paddle review: 'firm, fair, five stars'.",
    ],
  },
  {
    test: (s) => has(s, "masseuse"),
    lines: [
      "Masseuse strike averted after oil budget doubled.",
      "Spa-goers complain of 'suspiciously fruity' treatments.",
    ],
  },
  {
    test: (s) => has(s, "baron"),
    lines: [
      "Oil prices rise. Barons blame 'unprecedented peach demand'.",
      "Environmental groups worry about slick runoff near the peach.",
      "Oil Baron seen wearing a monocle made of hardened oil.",
    ],
  },
  {
    test: (s) => has(s, "coach"),
    lines: [
      "Twerk Coach counts to eight 40,000 times. Voice holding up.",
      "Gyms report record interest in 'posterior chain' classes.",
      "Olympic committee considers twerking as a sport. Again.",
    ],
  },
  {
    test: (s) => has(s, "choir"),
    lines: [
      "Peach Choir's new hymn 'Thy Crease Be Done' tops the charts.",
      "Neighbours complain about 'devotional clapping' at 3 a.m.",
    ],
  },
  {
    test: (s) => has(s, "spa"),
    lines: [
      "Day Spa introduces 'the peach treatment'. Waiting list: 9 years.",
      "Cucumber shortage hits spas worldwide.",
    ],
  },
  {
    test: (s) => has(s, "press"),
    lines: [
      "Juice Press workers unionise. Demand gloves.",
      "Health inspector finds 'too much juice'. Leaves sticky.",
      "Juice now traded on the stock market as PCHY.",
    ],
  },
  {
    test: (s) => has(s, "cult"),
    lines: [
      "Cheek Cult recruits door to door. 'Have you heard the good news about the crease?'",
      "Cult leader claims the peach spoke to him. It said 'mm'.",
    ],
  },
  {
    test: (s) => has(s, "moon"),
    lines: [
      "Astronomers baffled by new moon with visible crease.",
      "Tides now jiggle twice a day.",
      "Werewolves report confusing new urges.",
    ],
  },
  {
    test: (s) => has(s, "collider"),
    lines: [
      "Physicists discover the jiggle boson. It's pink.",
      "Collider accidentally creates a peach made of antimatter. Very cold to the touch.",
    ],
  },
  {
    test: (s) => has(s, "singularity"),
    lines: [
      "Light can no longer escape the peach. Neither can we.",
      "Stephen Hawking's notes found to contain one word: 'cheeks'.",
    ],
  },
  {
    test: (s) => has(s, "peachverse"),
    lines: [
      "Philosophers ask: if a peach jiggles in a universe of peaches, is it still cheeky?",
      "Peachverse census counts 10^80 peaches. Each one smacked daily.",
      "It's peaches all the way down.",
    ],
  },
  {
    test: (s) => s.stats.bursts >= 1,
    lines: [
      "Cleaning crews overwhelmed by juice. 'It's everywhere.'",
      "Peach bursts, reforms, asks for more. Doctors stunned.",
      "Pit sightings rise across the region.",
    ],
  },
  {
    test: (s) => s.stats.goldens >= 1,
    lines: [
      "Golden peach sighted over the city. Everyone clicked it at once.",
      "Jewellers warn: golden peaches are not real gold. Probably.",
    ],
  },
  {
    test: (s) => s.stats.ripens >= 1,
    lines: [
      "Peach claims to remember 'past lives'. Therapists intrigued.",
      "Nectar futures soar after mysterious ripening event.",
      "Déjà vu reported by entire fruit bowl.",
    ],
  },
  {
    test: (s) => s.orchard.open,
    lines: [
      "Orchard tours now booking. Please do not touch the trees. Or do.",
      "Bees go on strike: 'Too much blossom.'",
    ],
  },
  {
    test: (s) => s.juiceTotal >= 1e12,
    lines: [
      "Economists: the juice economy is 'a bubble, but a juicy one'.",
      "World leaders meet to discuss the peach question.",
      "United Nations declares a Day of the Peach.",
    ],
  },
  {
    test: (s) => s.juiceTotal >= 1e18,
    lines: [
      "The sun is now 3% peach.",
      "Galactic council bans export of juice beyond the Kuiper belt.",
    ],
  },
];

export function newsFor(state) {
  return NEWS.filter((n) => n.test(state)).flatMap((n) => n.lines);
}
