import { IdleGame } from "./game";
import { Orchard } from "./orchard";
import { Panel } from "./panel";
import { Hud } from "./hud";
import { Popups } from "./popups";
import { Modal } from "./modal";
import { GoldenPeach } from "./golden";
import { Room } from "./scenery/room";
import { renders } from "./renders";
import { showHarvests } from "./harvest";
import { Layout } from "./layout";
import { applySkin, switchSkin, SKIN_NAMES } from "./skins";
import { Toys } from "./toys";
import { preparePage } from "./page";
import { awayMessage } from "./away";
import { HELPERS } from "./data/helpers";
import { TREE_BY_ID } from "./data/tree";
import { format } from "./numbers";
import { playDing, playBuy, playNotes } from "../audio";

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
}) {
  preparePage();
  interaction.ui.scoreboard = false;
  settings.useStore("peachy-keen-idle-settings");
  const game = new IdleGame(interaction);
  game.buzzer = buzzer;
  const orchard = new Orchard(game);
  const modal = new Modal();
  const popups = new Popups(modal);
  modal.onIdle = () => popups.next();
  const panel = new Panel(game, orchard, settings, modal);
  const hud = new Hud(game);
  const layout = new Layout(camera, panel);
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
  );
  let style = null;
  const syncStyle = () => {
    const wanted = game.state.options.helperStyle;
    if (wanted === style) return;
    style = wanted;
    room.setActive(wanted === "room");
  };
  const toys = new Toys(game, settings);
  showHarvests(game);
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

  game.on("pop", ({ x, y, value, kind }) => {
    if (value > 0) popups.juice(x, y, value, kind);
  });
  game.on("burst", ({ value, pits, lucky }) => {
    const at = interaction.toScreen(
      interaction.sliceCenter || interaction.group.position,
    );
    const pitText = `+${pits} ${pits === 1 ? "pit" : "pits"}${lucky ? ", lucky!" : ""}`;
    popups.big(at.x, at.y - 30, `+${format(value)}`, pitText);
    hud.bump();
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
    popups.toast("New peach", seed.name, seed.about, "seed");
    playNotes([659, 880, 1109], { gap: 0.09, volume: 0.06 });
  });
  game.on("harvest", () => playNotes([523, 784], { gap: 0.06, volume: 0.06 }));
  game.on("orchard-open", () =>
    popups.toast(
      "Unlocked",
      "The Orchard",
      "Plant the pits you get from bursts.",
      "seed",
    ),
  );
  game.on("bought", ({ kind, id, count }) => {
    const helper = kind === "helper" && HELPERS.find((h) => h.id === id);
    const first = helper && game.state.helpers[id] === count;
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
  game.on("golden", () => talk.say("golden", 0.8));
  game.on("toy", (toy) =>
    popups.toast(
      "New toy",
      toy.name,
      "It's on now. Switch it off in Options.",
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

  if (import.meta.env.DEV)
    window.peachy = {
      game,
      golden: () => golden.spawn(),
      give(id, count) {
        game.state.helpers[id] = count;
        game.refresh();
      },
      juice(amount) {
        game.state.juice += amount;
        game.state.juiceTotal += amount;
        game.refresh();
      },
    };

  return {
    room,
    warmups() {
      return [...room.warmups(), golden.warmup(peach)];
    },
    ready() {
      renders.setup(renderer, scene.environment);
      syncStyle();
      syncSkin();
      toys.sync();
    },
    begin() {
      started = true;
      if (game.away) addAway(game.away);
      game.away = null;
      flushAway();
    },
    frame() {
      layout.update();
    },
    update(realDelta) {
      game.tick();
      orchard.update(realDelta);
      hud.update();
      panel.update(realDelta);
      renders.update();
      if (!started) return;
      golden.update(realDelta);
      room.update(realDelta);
    },
  };
}
