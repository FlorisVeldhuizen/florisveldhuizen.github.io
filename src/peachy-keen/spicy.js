const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const LINES = {
  cheeky: {
    smack: [
      "Ooh! Do that again and I'll scream.",
      "Oi! …left a bit.",
      "Careful. I might like it.",
      "Ow! …encore.",
      "That's one. I'm keeping score.",
      "Is that a spank or a question?",
      "Harder. I won't break. Probably.",
      "Oh, you're trouble.",
    ],
    combo: [
      "Don't you dare stop.",
      "Somebody's been practising.",
      "Oh, you've done this before.",
      "Now you're showing off. Continue.",
      "I lost count. Start over.",
      "Ooh, rhythm. What else can you do?",
    ],
    hot: [
      "Look how pink you made me.",
      "I'm blushing in places I didn't know I had.",
      "Is it hot, or is it me? It's me.",
      "Don't touch me. Kidding. Touch me.",
      "Keep this up and I'll need a cold shower.",
    ],
    rub: [
      "Ooh, slippery.",
      "Mmm, right there. No, there.",
      "You missed a spot. On purpose?",
      "Slower… you're not late for anything.",
      "Keep rubbing and I'll grant you a wish.",
      "Oil me up and call me slippery.",
    ],
    charge: [
      "Oh no. Oh yes. Oh no.",
      "Don't stop now!",
      "I'm gonna— I'm gonna—",
      "Hold me, I'm close!",
      "Everybody stay calm!",
    ],
    burst: [
      "Oops. All over you.",
      "Look what you made me do.",
      "Well. That escalated.",
      "I'd apologise, but I'm not sorry.",
      "Wipe your screen. And your face.",
      "Again? Give a girl a minute.",
    ],
    idle: [
      "Hello? I'm right here.",
      "Bored of me already?",
      "I didn't get dressed up for nothing.",
      "Fine. I'll wiggle by myself.",
      "Psst. The good stuff is back here.",
      "I'll count to three. One…",
    ],
    grab: [
      "Ooh, grabby.",
      "Oh! Somebody's hungry.",
      "Two hands. Ambitious.",
      "Where are you taking me? Somewhere nice?",
      "Gentle! …or not.",
      "Finders keepers?",
    ],
    release: [
      "Boing!",
      "Hey, I wasn't done.",
      "Still jiggling. You're welcome.",
      "That's it? I shaved for this.",
      "Leaving already? Rude.",
    ],
    clap: [
      "Applause! Finally, some respect.",
      "Oh, stop. …no, keep going.",
      "Encore? Well, if you insist.",
    ],
    kiss: [
      "Mwah!",
      "Kiss it better.",
      "Oh! Lips. Now it's serious.",
      "Kiss first, spank later. Classy.",
      "Shouldn't you buy me dinner first?",
    ],
    shake: [
      "Whee!",
      "I'm all wobbly.",
      "Shaken, not stirred.",
      "Careful, I'll spill.",
    ],
    strip: [
      "Oh! Those are mine!",
      "Slowly! Make it a show.",
      "Not the undies! …fine.",
      "At least say please.",
      "Oh, we're skipping the small talk?",
    ],
    snap: [
      "Ow! The elastic!",
      "Naughty. Do it again.",
      "That'll leave a line.",
      "Snap it again and see what happens.",
    ],
    wedgie: [
      "Not so high!",
      "Now it's a thong.",
      "They live there now.",
      "Well, that's one way to say hello.",
      "Somebody send a search party.",
    ],
    stripped: [
      "Well. Now what?",
      "Like what you see?",
      "Look all you want. Touching costs extra.",
      "Don't just stare. Say something sweet.",
      "I'd cover up, but I have no arms.",
    ],
  },
  shy: {
    smack: [
      "Eep!",
      "W-what was that for?",
      "I didn't say you could… but okay.",
      "Um. Hi.",
      "P-please be gentle.",
      "Why do I want another one?",
      "I-it tingles…",
      "Was that… on purpose?",
    ],
    combo: [
      "S-so many…",
      "I can't keep up…",
      "Are you always like this?",
      "My face is so hot right now.",
      "I don't hate it. Don't tell anyone.",
      "I-I think I'm getting used to it…",
      "Please don't stop. I mean— um.",
    ],
    hot: [
      "I-I'm not blushing. I'm just ripe.",
      "Is it warm in here, or…",
      "Please don't look at me right now.",
      "I feel all soft inside.",
      "I think I'm getting… juicy.",
      "My pit is pounding.",
    ],
    rub: [
      "Your hands are… warm.",
      "I-is this okay?",
      "N-nobody's touched me there before.",
      "I don't know what to say…",
      "That's… nice. Very nice.",
      "My fuzz is standing up…",
      "C-could you… keep doing that?",
    ],
    charge: [
      "W-wait, not yet…",
      "Please close your eyes!",
      "Something's happening to me…",
      "I-I'm sorry in advance!",
      "I can't hold it…",
    ],
    burst: [
      "I'm so sorry…",
      "Please don't tell anyone.",
      "C-can we forget that?",
      "I need a moment.",
      "That's never happened before…",
      "D-did I get any on you?",
      "…can we do that again?",
    ],
    idle: [
      "Um… are you still there?",
      "I wasn't waiting. Really.",
      "Did I do something wrong?",
      "It's quiet back here…",
      "I kind of miss your hands.",
      "I-I kept them warm for you.",
    ],
    grab: [
      "Ah! Your hands…",
      "Y-you could ask first…",
      "I don't mind. I just… wasn't ready.",
      "Your hands are so big.",
      "N-not so tight… okay, a little tight.",
      "I-is it soft enough?",
    ],
    release: [
      "Oh. Okay.",
      "Is that all…?",
      "It's still jiggling…",
      "My knees are weak. I don't have knees.",
      "C-come back…",
    ],
    clap: [
      "P-people can hear…",
      "That's so loud…",
      "The neighbours…",
      "Everyone will know…",
    ],
    kiss: [
      "A k-kiss?",
      "Not… not there…",
      "I wasn't ready for that.",
      "My heart didn't skip. It didn't.",
      "C-can I have another?",
      "My first kiss was… there?",
    ],
    shake: [
      "I'm getting dizzy…",
      "P-please put me down.",
      "Whoa… whoa…",
      "Everything's jiggling…",
    ],
    strip: [
      "Th-those are mine…",
      "Please give them back.",
      "W-wait…",
      "I'm not wearing cute ones today…",
      "N-not so fast…",
      "I wore those for you…",
    ],
    wedgie: [
      "It's r-riding up…",
      "That's… very snug.",
      "W-why is it so high?",
      "I can't reach it to fix it…",
      "It's… it's in there…",
    ],
    snap: [
      "Ow… that stings.",
      "W-was that on purpose?",
      "The elastic… really?",
      "That left a mark…",
      "D-do it again? I mean— no.",
    ],
    stripped: [
      "P-please don't stare.",
      "I feel so exposed…",
      "Is it… okay? Do you like it?",
      "You're the first to see me like this.",
      "Say something… please.",
      "I-I've never shown anyone my fuzz.",
    ],
  },
};

export class Talk {
  constructor() {
    this.el = document.getElementById("talk");
    this.level = "off";
    this.until = 0;
    this.quietUntil = 0;
    this.last = "";
  }

  setLevel(level) {
    this.level = LINES[level] ? level : "off";
    if (this.level === "off") this.hide();
  }

  say(event, chance = 1) {
    const lines = LINES[this.level]?.[event];
    if (!lines) return;
    const now = performance.now();
    const urgent = chance >= 1;
    if ((!urgent && now < this.quietUntil) || Math.random() > chance) return;
    const options = lines.filter((line) => line !== this.last);
    this.show(options[Math.floor(Math.random() * options.length)]);
  }

  show(line) {
    const now = performance.now();
    this.last = line;
    this.el.textContent = line;
    this.el.classList.add("is-visible");
    this.until = now + 1300 + line.length * 45;
    this.quietUntil = this.until + 1200;
    if (!reducedMotion.matches) {
      this.el.animate(
        [
          { scale: "0.6", rotate: "-6deg" },
          { scale: "1.06", rotate: "2deg", offset: 0.6 },
          { scale: "1", rotate: "0deg" },
        ],
        { duration: 320, easing: "cubic-bezier(.2,.9,.3,1.3)" },
      );
    }
  }

  hide() {
    this.until = 0;
    this.el.classList.remove("is-visible");
  }

  get showing() {
    return this.until > 0;
  }

  place(x, y) {
    if (!this.showing) return;
    if (performance.now() > this.until) {
      this.hide();
      return;
    }
    const margin = 16;
    const left = Math.max(margin + this.el.offsetWidth, x);
    this.el.style.translate = `${left}px ${Math.max(margin, y)}px`;
  }
}
