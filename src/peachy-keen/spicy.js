import { reducedMotion } from "./util";

const LINES = {
  cheeky: {
    smack: [
      "Ha! Okay, I deserved that.",
      "Mm. Yes please.",
      "Oh. I was hoping you would.",
      "Did I do something wrong?",
      "Cheeky. I like it.",
      "One more? For me?",
      "Ow. …Thank you.",
      "You've got good hands.",
    ],
    combo: [
      "I'm all yours.",
      "Whatever you want.",
      "Please don't stop.",
      "I'll be good. Promise.",
      "Mm. Yes. Yes.",
      "I could get used to this.",
    ],
    hot: [
      "You're making me blush.",
      "Look what you do to me.",
      "I'm all warm now.",
      "Is this how you like me?",
      "All pink. Just for you.",
    ],
    rub: [
      "Mm, that's nice.",
      "Oh. Right there.",
      "Wherever you want.",
      "You're good at that.",
      "Please keep going.",
      "I'm melting.",
    ],
    charge: [
      "Oh god. Oh god.",
      "Can I? Please?",
      "Don't stop. Don't stop.",
      "I'm so close…",
      "Hold me. Tight.",
      "Say I can.",
      "Oh— oh— yes—",
    ],
    burst: [
      "Mm. I needed that.",
      "Wow. Just… wow.",
      "You ruined me. Thanks.",
      "I'm still tingling.",
      "Where did you learn that?",
      "I can't feel my pit.",
      "Round two? Please?",
    ],
    idle: [
      "Hey. Over here.",
      "I'm waiting for you.",
      "Miss me yet?",
      "I got all dressed up.",
      "I'll be good. Come back.",
      "I'm getting lonely.",
    ],
    grab: [
      "Oh, hi.",
      "I'm yours. Hold tight.",
      "Mm. Take what you want.",
      "Somebody's keen.",
      "Don't let go.",
      "You can keep those there.",
    ],
    release: [
      "Hey, come back.",
      "That's it?",
      "I wasn't done.",
      "Still jiggling. For you.",
      "Please?",
    ],
    clap: ["Ha! Let them hear.", "I'm all yours.", "Oh, stop. …Don't."],
    kiss: [
      "Oh. Hi.",
      "Mm. More, please.",
      "Soft lips.",
      "Okay, now I'm smitten.",
      "Kiss it better.",
    ],
    shake: [
      "Whee!",
      "Do what you want with me.",
      "Everything's wobbling.",
      "Easy, easy.",
    ],
    strip: [
      "Oh? Okay then.",
      "Go ahead.",
      "Skipping ahead, huh?",
      "I was hoping you'd do that.",
      "I wore those for you.",
    ],
    snap: [
      "Ow! Cheeky.",
      "That'll leave a line.",
      "I'll behave. Maybe.",
      "Mm. Again?",
    ],
    wedgie: [
      "Oh, a thong now?",
      "Very snug. Thanks.",
      "That's one way to say hi.",
      "If you like it, I like it.",
      "They live there now.",
    ],
    stripped: [
      "So? Do you like it?",
      "Like what you see?",
      "All yours.",
      "Be nice to me.",
      "What now? You decide.",
    ],
    buzz: [
      "Oh. Oh, that's new.",
      "Turn it up.",
      "Don't you dare stop.",
      "Where did you get that?",
      "Bzzzz. Yes.",
    ],
    disco: [
      "Watch me move.",
      "Is this song about me?",
      "Shake it for you.",
      "Bounce with me.",
    ],
    golden: [
      "Ooh, shiny. For me?",
      "Good catch, handsome.",
      "Gold looks good on us.",
      "Lucky you. Lucky me.",
    ],
    ripen: [
      "A whole new me. Still yours.",
      "Fresh and ready.",
      "Like new. Be rough with me.",
      "I remember everything.",
    ],
  },
  shy: {
    smack: [
      "Oh! …Hi.",
      "I didn't say stop.",
      "Was that on purpose?",
      "It tingles…",
      "Why do I want another?",
      "Eep.",
      "G-gently.",
      "…Again?",
    ],
    combo: [
      "I can't think…",
      "I'm all flustered…",
      "Don't tell anyone.",
      "Please don't stop.",
      "Are you always like this?",
      "I'm getting used to you.",
    ],
    hot: [
      "Don't look at me.",
      "Is it warm in here?",
      "I feel all soft.",
      "I'm getting… juicy.",
      "My pit is racing.",
      "I'm not blushing.",
    ],
    rub: [
      "Your hands are warm…",
      "Nobody touches me there.",
      "Is this okay?",
      "Don't stop.",
      "My fuzz is standing up…",
      "A little longer?",
      "That's nice.",
    ],
    charge: [
      "Wait, I'm— wait…",
      "Don't look!",
      "Something's happening…",
      "Is it okay if I…?",
      "Hold me… please…",
      "I can't hold it…",
      "Oh no. Oh no. Oh—",
    ],
    burst: [
      "I'm so sorry…",
      "That never happens…",
      "Did I… get you?",
      "Please don't look at me.",
      "I need a minute…",
      "…Was it good for you?",
      "Could we… again?",
    ],
    idle: [
      "Are you still there?",
      "I wasn't waiting.",
      "Did I do something wrong?",
      "It's quiet without you.",
      "I miss your hands.",
      "I kept warm for you.",
    ],
    grab: [
      "Oh! Your hands…",
      "You could ask. …Yes.",
      "I wasn't ready.",
      "Your hands are big.",
      "Not so tight… okay.",
      "Soft enough?",
    ],
    release: [
      "Oh. Okay.",
      "Is that all…?",
      "Don't look. It's jiggling.",
      "My knees are weak.",
      "Come back…",
    ],
    clap: [
      "People can hear…",
      "The neighbours…",
      "So loud…",
      "Everyone will know.",
    ],
    kiss: [
      "A kiss? There?",
      "My first kiss…",
      "My heart didn't skip.",
      "Another?",
      "Your lips are soft…",
    ],
    shake: [
      "I'm dizzy…",
      "Put me down. Gently.",
      "Whoa…",
      "Everything's jiggling…",
    ],
    strip: [
      "Those are mine…",
      "Not my cute ones…",
      "Not so fast…",
      "I wore those for you.",
      "Wait. …Okay.",
    ],
    wedgie: [
      "It's riding up…",
      "So snug…",
      "Why so high?",
      "I can't fix it…",
      "It's… in there.",
    ],
    snap: [
      "Ow… that stings.",
      "On purpose?",
      "That'll leave a mark…",
      "Again? I mean— no.",
    ],
    stripped: [
      "Please don't stare.",
      "I feel so exposed.",
      "Do you like it?",
      "Nobody sees me like this.",
      "Say something.",
      "Be gentle with me.",
    ],
    buzz: [
      "What is that?!",
      "It tickles… a lot…",
      "My whole pit is shaking…",
      "Too much— no, stay.",
    ],
    disco: [
      "I don't dance… usually.",
      "Is everyone watching?",
      "My cheeks have rhythm?",
    ],
    golden: ["Was that… gold?", "You caught it! For me?", "So sparkly…"],
    ripen: [
      "I feel… new.",
      "Do I look different?",
      "Please be gentle. It's my first time. Again.",
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
    const line = options[Math.floor(Math.random() * options.length)];
    this.show(line, event === "burst");
  }

  show(line, soft = false) {
    if (this.level === "off") return;
    const now = performance.now();
    this.snap = !this.showing;
    this.last = line;
    this.el.textContent = line;
    this.el.classList.add("is-visible");
    this.width = this.el.offsetWidth;
    this.until = now + 1300 + line.length * 45;
    this.quietUntil = this.until + 1200;
    if (soft && !reducedMotion.matches) {
      this.el.animate(
        [
          { opacity: 0, scale: "0.9" },
          { opacity: 1, scale: "1" },
        ],
        { duration: 500, easing: "cubic-bezier(.3,.7,.4,1)" },
      );
    } else if (!reducedMotion.matches) {
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
    const now = performance.now();
    if (now > this.until) {
      this.hide();
      return;
    }
    const margin = 16;
    const left = Math.max(margin + this.width, x);
    const top = Math.max(margin, y);
    if (this.snap) {
      this.snap = false;
      this.x = left;
      this.y = top;
    } else {
      const k = 1 - Math.exp(-(now - this.placedAt) / 120);
      this.x += (left - this.x) * k;
      this.y += (top - this.y) * k;
    }
    this.placedAt = now;
    this.el.style.translate = `${this.x}px ${this.y}px`;
  }
}
