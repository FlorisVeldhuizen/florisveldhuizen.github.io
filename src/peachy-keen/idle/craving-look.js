import { Raycaster, Vector3 } from "three";
import { playHeartbeat } from "../audio";
import { TOOLS } from "../config";
import { CRAVE_SECONDS } from "./data/cravings";
import { el } from "./dom";

const REPLY_SECONDS = 2;
const YES = ["Mm. Exactly that.", "Good. So good.", "Yes. Just like that."];
const NO = ["Too slow.", "Never mind, then."];
const pick = (list) => list[Math.floor(Math.random() * list.length)];

export class CravingLook {
  constructor(game, interaction) {
    Object.assign(this, { game, i: interaction });
    this.talk = el("div", "talk craving-talk", document.body);
    this.ray = new Raycaster();
    this.from = new Vector3();
    this.down = new Vector3(0, 0, -1);
    this.cue = 0;
    this.reply = 0;
    game.on("craving", (e) => this.react(e));
  }

  react({ craving, done }) {
    if (done === null) {
      this.side = Math.random() < 0.5 ? -1 : 1;
      this.talk.textContent = craving.ask;
      this.cue = 0;
      return;
    }
    this.talk.textContent = pick(done ? YES : NO);
    this.reply = REPLY_SECONDS;
  }

  aim(x, y) {
    const { group, peach } = this.i;
    if (!peach.mesh) return null;
    const s = group.scale.x;
    this.from.set(group.position.x + x * s, group.position.y + y * s, 8);
    this.ray.set(this.from, this.down);
    return this.ray.intersectObject(peach.mesh, false)[0] || null;
  }

  beat(urgency) {
    const { i } = this;
    i.beatAge = 0;
    i.beatAmp = 0.006 + urgency * 0.007;
    playHeartbeat(0.3 + urgency * 0.6);
  }

  print(id) {
    const low = id === "wedgie";
    const hit = this.aim(this.side * (low ? 0.45 : 0.6), low ? -0.55 : -0.05);
    if (!hit) return;
    const lips = id === "combo";
    this.i.peach.addHandprint(
      hit.point,
      hit.face.normal,
      (Math.random() - 0.5) * 0.4,
      this.side < 0,
      0.6,
      1,
      lips ? TOOLS.lips.print : TOOLS.hand.print,
      lips ? 2 : 0,
    );
    if (lips) this.side = -this.side;
  }

  props(c, urgency, delta) {
    this.cue -= delta;
    if (c.id === "oil" || this.cue > 0) return;
    if (c.id === "burst") {
      this.cue = 1 / (0.9 + urgency * 1.6);
      this.beat(urgency);
      return;
    }
    this.cue = 2.4 - urgency * 1.2;
    this.print(c.id);
  }

  update(delta) {
    const c = this.game.craving;
    const left = c
      ? Math.max(0, (c.until - Date.now()) / (CRAVE_SECONDS * 1000))
      : 1;
    this.i.bottle.setCalling(c?.id === "oil");
    if (c) this.props(c, 1 - left, delta);

    this.reply = Math.max(0, this.reply - delta);
    const shown = Boolean(c) || this.reply > 0;
    this.talk.classList.toggle("is-visible", shown);
    if (!shown) return;
    const anchor = this.from.copy(this.i.offset);
    anchor.x -= 0.75;
    anchor.y += 1.35;
    const at = this.i.toScreen(anchor);
    this.talk.style.translate = `${Math.max(this.talk.offsetWidth + 16, at.x)}px ${Math.max(16, at.y)}px`;
    this.talk.style.setProperty("--left", `${left * 100}%`);
  }
}
