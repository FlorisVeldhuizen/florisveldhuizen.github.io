import { playDing, playHeartbeat } from "./audio";
import { reducedMotion } from "./util";

const pick = (list) => list[Math.floor(Math.random() * list.length)];

const ACHIEVEMENTS = {
  first: ["Hello there", "First smack. It won't be the last."],
  ten: ["Warmed up", "Ten smacks."],
  nice: ["Nice.", "69 smacks. Nice."],
  hundred: ["Centurion", "A hundred smacks. Your hand is fine. Probably."],
  fiveHundred: ["Carpal tunnel", "Five hundred smacks. Stretch your wrist."],
  drum: ["Drum solo", "A ten-hit combo."],
  pop: ["Pop!", "First burst."],
  serial: ["Serial peacher", "Five bursts."],
  unwrapped: ["Unwrapped", "The lingerie came off."],
  atomic: ["Atomic", "A wedgie with a snap."],
  slippery: ["Slippery when wet", "Fully oiled."],
  patience: ["Sweet release", "Held off three times, then let it go."],
};

const EDGES_NEEDED = 3;
const BRINK = 85;
const COOLED = 60;

const PLEADING = [
  "Oh… oh…",
  "Don't stop now.",
  "So close…",
  "Almost there…",
  "I'm so ripe for you…",
  "Just one more?",
];

const WHINING = [
  "Hey! I was so close.",
  "Rude.",
  "You tease.",
  "You did that on purpose.",
  "Not fair…",
  "Again? Really?",
];

function element(tag, className, parent = document.body) {
  const el = document.createElement(tag);
  el.className = className;
  parent.appendChild(el);
  return el;
}

function animate(el, frames, options) {
  const last = frames[frames.length - 1];
  return el.animate(reducedMotion.matches ? [last, last] : frames, options);
}

class Achievements {
  constructor(interaction) {
    this.interaction = interaction;
    this.on = false;
    try {
      this.unlocked = new Set(
        JSON.parse(localStorage.getItem("peachy-keen-achievements")) || [],
      );
    } catch {
      this.unlocked = new Set();
    }
    this.el = element("div", "toast");
    this.el.setAttribute("role", "status");
    this.queue = [];
    this.busy = false;
    this.watch(interaction);
  }

  watch(interaction) {
    interaction.on("smack", ({ total, combo }) => {
      if (total === 1) this.unlock("first");
      if (total === 10) this.unlock("ten");
      if (total === 69) this.unlock("nice");
      if (total === 100) this.unlock("hundred");
      if (total === 500) this.unlock("fiveHundred");
      if (combo >= 10) this.unlock("drum");
    });
    interaction.on("burst", ({ total }) => {
      this.unlock("pop");
      if (total >= 5) this.unlock("serial");
    });
    interaction.on("stripped", () => this.unlock("unwrapped"));
    interaction.on("wedgie", () => this.unlock("atomic"));
  }

  unlock(id) {
    if (!this.on || this.unlocked.has(id)) return;
    this.unlocked.add(id);
    try {
      localStorage.setItem(
        "peachy-keen-achievements",
        JSON.stringify([...this.unlocked]),
      );
    } catch {
      // Storage can be blocked; unlocks then last for this visit only.
    }
    this.queue.push(id);
    this.next();
  }

  next() {
    if (this.busy || !this.queue.length) return;
    this.busy = true;
    const [title, text] = ACHIEVEMENTS[this.queue.shift()];
    this.el.replaceChildren();
    element("small", "", this.el).textContent = "Achievement unlocked";
    element("strong", "", this.el).textContent = title;
    element("span", "", this.el).textContent = text;
    playDing();
    animate(
      this.el,
      [
        { opacity: 0, transform: "translate(-50%, 20px)" },
        { opacity: 1, transform: "translate(-50%, 0)", offset: 0.1 },
        { opacity: 1, transform: "translate(-50%, 0)", offset: 0.85 },
        { opacity: 0, transform: "translate(-50%, 10px)" },
      ],
      { duration: 3200, easing: "ease-out" },
    ).finished.then(() => {
      this.busy = false;
      this.next();
    });
  }

  update() {
    if (this.interaction.oil > 0.95) this.unlock("slippery");
  }
}

class Edging {
  constructor(interaction, talk, achievements) {
    Object.assign(this, { interaction, talk });
    this.on = false;
    this.edges = 0;
    this.atBrink = false;
    this.layer = document.getElementById("combos");
    interaction.on("charge", () => {
      if (this.on && this.ready) interaction.burstPower = 1.8;
    });
    interaction.on("burst", () => {
      if (this.on && this.ready) achievements.unlock("patience");
      this.edges = 0;
      this.atBrink = false;
    });
  }

  get ready() {
    return this.edges >= EDGES_NEEDED;
  }

  update() {
    const i = this.interaction;
    if (!this.on || i.phase !== "live") return;
    if (!this.atBrink && i.heat >= BRINK) {
      this.atBrink = true;
      playHeartbeat(1);
      i.wobbleAll(0.04);
      this.talk.show(this.ready ? "Okay. Now. Please." : pick(PLEADING));
    } else if (this.atBrink && i.heat < COOLED) {
      this.atBrink = false;
      if (this.ready) return;
      this.edges += 1;
      this.talk.show(pick(WHINING));
      this.popLabel(this.ready ? "Ripe & ready" : `Teased ×${this.edges}`);
    }
  }

  popLabel(text) {
    const i = this.interaction;
    const at = i.toScreen(i.group.position);
    const radius = 1.3 * i.group.scale.x * i.pixelsPerUnit(i.group.position);
    const label = element("span", "pop", this.layer);
    label.textContent = text;
    label.style.left = `${at.x}px`;
    label.style.top = `${at.y - radius}px`;
    animate(
      label,
      [
        { opacity: 0, transform: "translate(-50%, -30%) scale(0.7)" },
        {
          opacity: 1,
          transform: "translate(-50%, -80%) scale(1)",
          offset: 0.2,
        },
        {
          opacity: 0,
          transform: "translate(-50%, calc(-80% - 40px)) scale(1)",
        },
      ],
      { duration: 1100, easing: "ease-out" },
    ).finished.then(() => label.remove());
  }
}

export class Naughty {
  constructor(interaction, talk) {
    this.achievements = new Achievements(interaction);
    this.edging = new Edging(interaction, talk, this.achievements);
  }

  set(key, on) {
    if (key === "achievements") this.achievements.on = on;
    if (key === "edging") this.edging.on = on;
  }

  update() {
    this.achievements.update();
    this.edging.update();
  }
}
