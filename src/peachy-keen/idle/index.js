import { IdleGame } from "./game";
import { Orchard } from "./orchard";
import { Panel } from "./panel";
import { Hud } from "./hud";
import { CravingLook } from "./craving-look";
import { Popups } from "./popups";
import { Modal } from "./modal";
import { GoldenPeach } from "./golden";
import { Room } from "./scenery/room";
import { renders } from "./renders";
import { showHarvests } from "./harvest";
import { Layout } from "./layout";
import { applySkin, switchSkin, SKIN_NAMES } from "./skins";
import { Toys } from "./toys";
import { Privacy } from "./privacy";
import { preparePage } from "./page";
import { awayMessage } from "./away";
import { HELPERS } from "./data/helpers";
import { bottleEarned, rubLearned } from "./data/cravings";
import { TREE_BY_ID } from "./data/tree";
import { format } from "./numbers";
import { playDing, playBuy, playNotes } from "../audio";
import { PHYSICS_CONFIG } from "../config";
import { clamp, reducedMotion } from "../util";
import { warmsSettled } from "./scenery/extras/kit";

const BEADS = { smack: 4, crit: 5.2, other: 4.6 };

const SHEET_SQUASH = 0.012;
const SETTLE_LIMIT_MS = 1000;

export function createIdle({
  interaction,
  peach,
  camera,
  settings,
  talk,
  buzzer,
  scene,
  renderer,
  backdrop,
  mood,
  lights,
  wild,
  lens,
  juice,
  droplets,
  privacyTag,
}) {
  preparePage();
  interaction.ui.scoreboard = false;
  settings.useStore("peachy-keen-idle-settings");
  const game = new IdleGame(interaction);
  game.buzzer = buzzer;
  const cravingLook = new CravingLook(game, interaction);
  const orchard = new Orchard(game);
  const modal = new Modal();
  const popups = new Popups(modal);
  modal.onIdle = () => popups.next();
  const panel = new Panel(game, orchard, settings, modal);
  const hud = new Hud(game);
  const layout = new Layout(camera, panel);
  const squashWithSheet = (delta) => {
    if (!delta || reducedMotion.matches) return;
    const press = clamp(-layout.growth * SHEET_SQUASH, -0.08, 0.08);
    if (Math.abs(press) < 0.002) return;
    interaction.squashVelocity.x +=
      PHYSICS_CONFIG.SQUASH_STIFFNESS *
      interaction.firmness.stiffness *
      press *
      delta;
    interaction.squashAxis.set(0, 1);
  };
  const golden = new GoldenPeach(
    game,
    layout,
    popups,
    scene,
    camera,
    interaction,
  );
  const room = new Room(
    game,
    interaction,
    popups,
    scene,
    camera,
    backdrop,
    mood,
    renderer,
    { lights, wild, lens, juice, droplets, talk },
  );
  let style = null;
  const syncStyle = () => {
    const wanted = game.state.options.helperStyle;
    if (wanted === style) return;
    style = wanted;
    room.setActive(wanted === "room");
  };
  const toys = new Toys(game, settings);
  const privacy = new Privacy({
    game,
    settings,
    panel,
    room,
    talk,
    popups,
    tag: privacyTag,
  });
  showHarvests(game, hud);
  let started = false;
  let skin = null;

  const syncSkin = () => {
    const wanted = game.model.skins.includes(game.state.options.skin)
      ? game.state.options.skin
      : "classic";
    if (wanted === skin || !peach.material) return;
    const first = !skin;
    skin = wanted;
    if (first) {
      applySkin(peach, wanted);
      return;
    }
    playNotes([784, 1047, 1319], { gap: 0.06, volume: 0.05 });
    switchSkin(peach, wanted, [
      { at: 0.3, run: () => interaction.skinSquash() },
      { at: 0.4, run: () => interaction.skinPop() },
    ]);
  };

  const showAway = (away) => {
    modal.show({
      ...awayMessage(away, game.state.helpers),
      buttons: [{ label: "Thanks, helpers", primary: true }],
    });
  };

  const { bottle, ui } = interaction;
  const showBottleUi = (shown) => {
    bottle.el.style.visibility = shown ? "" : "hidden";
    ui.hintRub.hidden = !shown;
  };
  const showBottle = (shown) => {
    bottle.view.group.visible = shown;
    showBottleUi(shown);
  };
  const showMassageHint = () => {
    const s = game.state;
    ui.hintMassage.hidden = !bottleEarned(s) || rubLearned(s);
    ui.hintMassage.classList.remove("is-learned");
  };
  // The second peach brings the bottle, so it never crowds the busy run up to the first split.
  const revealBottle = () => {
    const s = game.state;
    if (bottle.view.group.visible || s.stats.bursts < 1) return;
    if (interaction.phase !== "live" || interaction.heat < 50) return;
    s.seen.bottle = true;
    showBottle(true);
    bottle.screen.x -= 220;
    showMassageHint();
  };
  const fadeMassageHint = () => {
    if (ui.hintMassage.hidden || !rubLearned(game.state)) return;
    ui.hintMassage.classList.add("is-learned");
  };
  game.on("replace", () => {
    showBottle(bottleEarned(game.state));
    showMassageHint();
  });

  game.on("pop", ({ x, y, value, kind }) => {
    if (!(value > 0)) return;
    popups.juice(x, y, value, kind);
    hud.drip(value, BEADS[kind] ?? BEADS.other);
  });
  game.on("split", ({ value, pits }) => {
    hud.hold("juice", value);
    hud.hold("pits", pits);
  });
  game.on("burst", ({ value, pits, lucky }) => {
    const at = interaction.toScreen(
      interaction.sliceCenter || interaction.group.position,
    );
    const pitText = `+${pits} ${pits === 1 ? "pit" : "pits"}${lucky ? ", lucky!" : ""}`;
    popups.big(at.x, at.y - 30, `+${format(value)}`, pitText);
    hud.splash(value);
    if (pits > 0) hud.flyPits({ x: at.x, y: at.y - 30 }, pits);
  });
  let trophies = [];
  game.on("trophy", (t) => {
    trophies.push(t);
    if (trophies.length > 1) return;
    setTimeout(() => {
      const [first, ...rest] = trophies;
      trophies = [];
      if (rest.length)
        popups.toast(
          `${rest.length + 1} trophies`,
          first.name,
          rest.length > 3
            ? `and ${rest.length} more`
            : `and ${rest.map((r) => r.name).join(", ")}`,
        );
      else popups.toast("Trophy", first.name, first.about);
      playDing();
    }, 60);
  });
  game.on("discover", (seed) => {
    popups.toast("New tree", seed.name, seed.about, "seed");
    playNotes([659, 880, 1109], { gap: 0.09, volume: 0.06 });
  });
  game.on("harvest", () => playNotes([523, 784], { gap: 0.06, volume: 0.06 }));
  game.on("butterflies", () => {
    popups.toast(
      "Unlocked",
      "Butterflies",
      "Your blossoms draw butterflies. They sip juice; tap one to get it back with interest.",
      "seed",
    );
  });
  game.on("butterfly-slot", (slots) => {
    popups.toast(
      "Unlocked",
      `${slots} butterflies`,
      slots === 3
        ? "Your orchard now draws three butterflies, and sometimes a rare Sunset morpho."
        : "Your orchard now draws two butterflies at once.",
      "seed",
    );
  });
  game.on("orchard-open", () => {
    popups.toast(
      "Unlocked",
      "The Orchard",
      "Open the sprout tab to plant your pit.",
      "seed",
    );
  });
  game.on("bought", ({ kind, id, first }) => {
    const helper = kind === "helper" && HELPERS.find((h) => h.id === id);
    if (first && game.state.options.helperStyle === "room")
      popups.toast(`First ${helper.name}`, helper.room, "", "seed");
    if (kind === "helper")
      playBuy(1 + HELPERS.findIndex((h) => h.id === id) * 0.06);
    else playBuy(1.5);
  });
  game.on("bought", ({ kind, id }) => {
    const unlock =
      kind === "tree" && TREE_BY_ID[id].effects.find((e) => e.kind === "skin");
    if (!unlock) return;
    game.setOption("skin", unlock.skin);
    popups.toast(
      "New skin",
      SKIN_NAMES[unlock.skin],
      "Wearing it now. Switch skins in Options.",
      "seed",
    );
  });
  game.on("golden", ({ effect, pits }) => {
    talk.say("golden", 0.8);
    if (effect !== "pits") return;
    hud.hold("pits", pits);
    hud.flyPits(golden.claimedAt, pits);
  });
  game.on("bruised", ({ effect, pits }) => {
    if (effect !== "pits") return;
    hud.hold("pits", pits);
    hud.flyPits(golden.claimedAt, pits);
  });
  game.on("craving", ({ done }) => {
    if (done === null) {
      playNotes([659, 880], { gap: 0.09, length: 0.18, volume: 0.04 });
    } else if (done) {
      const at = interaction.toScreen(interaction.group.position);
      popups.big(at.x, at.y - 30, "×3", "all juice for 30 seconds");
      playNotes([523, 659, 784, 1046], {
        gap: 0.06,
        length: 0.2,
        volume: 0.05,
      });
    }
  });
  game.on("toy", (toy) =>
    popups.toast(
      "New toy",
      toy.name,
      toy.cord
        ? "Tap the tag to send it up. Pull it down to hang it again."
        : "It's on now. Switch it off in Options.",
      "seed",
    ),
  );
  game.on("ripen", ({ gain, dare }) => {
    popups.toast(
      "Ripened",
      `+${format(gain, { whole: true })} nectar`,
      dare ? "The dare is on." : "A fresh peach. Same you.",
      "nectar",
    );
    playNotes([392, 523, 659, 784, 1046], {
      gap: 0.1,
      length: 0.6,
      volume: 0.07,
    });
    talk.say("ripen");
  });
  game.on("dare", ({ dare, won }) => {
    if (won)
      modal.info(
        `Dare complete: ${dare.name}`,
        `You did it. ${dare.reward}`,
        "Mm, yes",
      );
    else
      modal.info(
        `Dare failed: ${dare.name}`,
        "Time ran out. The run goes on without the rule.",
        "Next time",
      );
  });
  let pendingAway = null;
  const flushAway = () => {
    if (!started || document.hidden || !pendingAway) return;
    showAway(pendingAway);
    pendingAway = null;
  };
  const addAway = (away) => {
    if (!pendingAway) pendingAway = { ...away };
    else {
      pendingAway.seconds += away.seconds;
      pendingAway.capped += away.capped;
      pendingAway.value += away.value;
    }
    flushAway();
  };
  game.on("away", addAway);
  document.addEventListener("visibilitychange", flushAway);
  game.on("change", syncSkin);
  game.on("change", syncStyle);
  game.on("replace", syncSkin);
  const pageTitle = document.title;
  setInterval(() => {
    document.title = `${format(game.state.juice)} juice · ${pageTitle}`;
  }, 1000);

  if (import.meta.env.DEV)
    window.peachy = {
      game,
      golden: () => golden.spawn(),
      burst: () => interaction.charge(),
      give(id, count) {
        game.setHelpers(id, count);
        game.refresh();
      },
      juice(amount) {
        game.state.juice += amount;
        game.state.juiceTotal += amount;
        game.refresh();
      },
    };

  return {
    // 0 closed, 1 open, 2 open at full height.
    shop: () => (panel.open ? 1 + panel.root.classList.contains("is-full") : 0),
    room,
    glow: golden.shine,
    lightStates() {
      const { state } = game;
      const states = [];
      if (state.toys.includes("mood") || state.helpers.cult > 0)
        states.push([true, false]);
      if (state.toys.includes("disco")) states.push([false, true]);
      return states;
    },
    // The mood and disco groups as play will most likely start: lit by their toy setting, or mood by cult candles.
    likelyLights() {
      const { state } = game;
      return [
        (state.toys.includes("mood") && !!settings.moodLight) ||
          state.helpers.cult > 0,
        state.toys.includes("disco") && !!settings.disco,
      ];
    },
    warmFade: (warm) => privacy.warmFade(warm),
    prepare() {
      golden.warmup(peach);
      peach.prepareSkinFade();
    },
    ready() {
      renders.setup(renderer, scene.environment);
      // The first burst opens the orchard, so its shaders build now instead of mid-burst.
      renders.warm();
      syncStyle();
      syncSkin();
      toys.sync();
      showBottleUi(bottleEarned(game.state));
      showMassageHint();
    },
    async settle(progress) {
      await room.prepare();
      progress(0.5);
      await warmsSettled();
      progress(1);
    },
    bottleEarned: () => bottleEarned(game.state),
    begin(free) {
      started = true;
      privacy.start(free);
      panel.slide(true);
      if (game.away) addAway(game.away);
      game.away = null;
      flushAway();
    },
    async leave() {
      await panel.slide(false);
      const until = performance.now() + SETTLE_LIMIT_MS;
      while (!layout.settled() && performance.now() < until)
        // eslint-disable-next-line no-await-in-loop
        await new Promise(requestAnimationFrame);
    },
    frame(realDelta) {
      if (started) {
        revealBottle();
        fadeMassageHint();
      }
      layout.update(realDelta);
      squashWithSheet(realDelta);
    },
    update(realDelta) {
      game.tick();
      orchard.update(realDelta);
      cravingLook.update(realDelta);
      hud.update();
      panel.update(realDelta);
      renders.update();
      if (!started) return;
      golden.paused = privacy.shown;
      golden.update(realDelta);
      privacy.update(realDelta);
      privacy.restoreFade();
      room.update(realDelta);
      privacy.applyFade();
    },
  };
}
