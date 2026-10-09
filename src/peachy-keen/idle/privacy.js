import { format } from "./numbers";
import { TOYS } from "./data/toys";
import FreeToys from "./free-toys";
import { ease } from "../util";
import { freePlayOpen, openFreePlay } from "../privacy-tag";

const ROOM_IDS = [
  "feather",
  "admirer",
  "paddle",
  "masseuse",
  "baron",
  "coach",
  "choir",
  "spa",
  "press",
  "cult",
  "collider",
];
const CROWD_KINDS = 6;
const CROWD_BURSTS = 3;
const PRICE_SECONDS = 1800;
const MIN_PRICE = 1e6;
// The room returns first, then the score, then the shop, so the peach is not reframed mid-fade.
const SHOP_RETURN_DELAY = 1.4;
const smooth = (x) => x * x * (3 - 2 * x);

// Custom shaders ignore opacity, so they get one multiplier on their final colour.
function fadeShader(m) {
  /* eslint-disable no-param-reassign */
  if (!m.userData.privacyFade) {
    m.uniforms.uPrivacyFade = { value: 1 };
    m.userData.privacyFade = m.uniforms.uPrivacyFade;
    const end = m.fragmentShader.lastIndexOf("}");
    // Scaling colour as well as alpha would darken opaque shaders mid-fade.
    const fade = m.premultipliedAlpha ? "gl_FragColor" : "gl_FragColor.a";
    m.fragmentShader = `${m.fragmentShader
      .slice(0, end)
      .replace(
        /void\s+main\s*\(\s*\)/,
        "uniform float uPrivacyFade;\nvoid main()",
      )}  ${fade} *= uPrivacyFade;\n}`;
    m.needsUpdate = true;
  }
  /* eslint-enable no-param-reassign */
  return m.userData.privacyFade;
}

function fadeMaterial(m, v, faded) {
  /* eslint-disable no-param-reassign */
  if (m.isShaderMaterial) fadeShader(m).value = v;
  else {
    m.userData.privacyBase = m.opacity;
    m.opacity *= v;
  }
  if (faded && !m.transparent) {
    m.transparent = true;
    m.userData.privacyOpaque = true;
    m.needsUpdate = true;
  } else if (!faded && m.userData.privacyOpaque) {
    m.transparent = false;
    m.userData.privacyOpaque = false;
    m.needsUpdate = true;
  }
  /* eslint-enable no-param-reassign */
}

export class Privacy {
  constructor({ game, settings, panel, room, talk, popups, tag }) {
    Object.assign(this, { game, settings, panel, room, talk, popups, tag });
    this.away = 0;
    this.mats = new Set();
    this.faded = false;
    this.shown = false;
    this.shopWasOpen = false;
    this.shopReturn = 0;
    this.toys = new FreeToys(game, () => {
      this.shopWasOpen = true;
      this.set(false);
    });
    /* eslint-disable no-param-reassign */
    room.presence = (id) => this.presence(id);
    tag.pull = () => this.set(true);
    tag.takeDown = () => this.set(false);
    /* eslint-enable no-param-reassign */
    game.on("burst", () => this.countBurst());
    game.on("bought", ({ id }) => {
      if (id === "dnd") openFreePlay();
    });
    if (freePlayOpen() && !this.owned) game.state.toys.push("dnd");
    if (import.meta.env.DEV)
      TOYS.forEach(({ id }) => {
        if (!game.state.toys.includes(id)) game.state.toys.push(id);
      });
  }

  get owned() {
    return this.game.state.toys.includes("dnd");
  }

  set(on) {
    this.game.emit("toy-set", { key: "dnd", value: on });
  }

  start(free) {
    if (!this.owned) return;
    this.set(free);
    if (!free) return;
    this.game.setOption("dndCord", true);
    this.away = 1;
    this.show(true);
  }

  show(on) {
    const { panel } = this;
    this.shown = on;
    if (on) {
      this.shopReturn = 0;
      this.shopWasOpen = panel.open;
      panel.setOpen(false);
      this.tag.hang();
      this.room.wind.blast(this.room.i.group.position, 3);
    } else {
      if (this.shopWasOpen && !panel.open) this.shopReturn = SHOP_RETURN_DELAY;
      this.tag.raise();
    }
    document.body.classList.toggle("is-dnd", on);
  }

  presence(id) {
    const gone = smooth(this.away);
    if (id === "sippers") return 1 - gone;
    // Helpers leave and return only while faded out, so nobody pops in or out in view.
    return this.away > 0.97 ? 0 : 1;
  }

  fadeRoots() {
    const { room } = this;
    return [
      room.group,
      ...Object.values(room.extras.runs).map((r) => r.ctx.group),
    ];
  }

  restoreFade() {
    this.mats.forEach((m) => {
      const base = m.userData.privacyBase;
      if (base !== undefined) m.opacity = base; // eslint-disable-line no-param-reassign
    });
  }

  // Faded materials compile a transparent shader; building those during loading keeps the first fade smooth.
  async warmFade(warm) {
    this.away = 0.5;
    this.applyFade();
    await warm();
    this.restoreFade();
    this.away = 0;
    this.applyFade();
  }

  applyFade() {
    const v = 1 - smooth(this.away);
    if (v > 0.999 && !this.faded) return;
    this.faded = v <= 0.999;
    const visit = (o) => {
      [].concat(o.material ?? []).forEach((m) => this.mats.add(m));
      o.children.forEach(visit);
    };
    this.fadeRoots().forEach(visit);
    this.mats.forEach((m) => fadeMaterial(m, v, this.faded));
  }

  crowded() {
    const { helpers } = this.game.state;
    return ROOM_IDS.filter((id) => helpers[id] > 0).length >= CROWD_KINDS;
  }

  countBurst() {
    const p = this.game.state.privacy;
    if (this.owned || p.price > 0 || !this.crowded()) return;
    p.crowd += 1;
    if (p.crowd === CROWD_BURSTS - 1)
      setTimeout(() => this.talk.show("So many eyes on me…", true), 1800);
    if (p.crowd < CROWD_BURSTS) return;
    p.price = Math.max(MIN_PRICE, this.game.rate * PRICE_SECONDS);
    setTimeout(() => {
      this.talk.show(
        "It's so crowded in here. If only I could hang a sign on the door…",
        true,
      );
      setTimeout(
        () =>
          this.popups.toast(
            "New in the shop",
            "Ryokan tag",
            `A toy in the Toys tray, for ${format(p.price)} juice.`,
            "seed",
          ),
        2600,
      );
    }, 1800);
  }

  update(delta) {
    const on = !!this.settings.dnd && this.owned;
    if (on) this.toys.update();
    const { panel } = this;
    if (on !== this.shown) this.show(on);
    if (this.shopReturn > 0) {
      this.shopReturn -= delta;
      if (this.shopReturn <= 0) panel.setOpen(true);
    }
    this.away += ((on ? 1 : 0) - this.away) * ease(on ? 2.2 : 0.9, delta);
    this.room.snap = this.away > 0.5;
    this.room.lensFade = 1 - smooth(this.away);
    this.tag.owned = this.owned && this.game.state.options.dndCord;
    if (on && !this.game.state.options.dndCord) this.set(false);
    this.tag.update(delta, { wind: this.room.wind.breeze.x });
  }
}
