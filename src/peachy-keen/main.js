import { Group, Clock, Color, Vector3, Vector4 } from "three";
import { initScene, setupResizeHandler, QualityGovernor } from "./scene";
import { createBackdrop } from "./backdrop";
import { Peach } from "./peach";
import { Juice, Droplets, JUICE_LAYER } from "./juice";
import { Lens } from "./lens";
import { Interaction } from "./interaction";
import { UI } from "./ui";
import { Settings } from "./settings";
import { Talk } from "./spicy";
import { Naughty } from "./naughty";
import { MoodLight } from "./mood";
import { Wild } from "./wild";
import { Shock } from "./shock";
import { SkinRings } from "./rings";
import { keepAudioUnlocked, loadSounds, setMuted, playLensHit } from "./audio";
import {
  reducedMotion,
  warmedLights,
  sheet,
  viewHeight,
  viewWidth,
} from "./util";
import IntroTitle from "./intro-title";
import JiggleText from "./jiggle-text";
import slideToggle from "./slide-toggle";
import { stepFill, drawFill } from "./fill-wave";

const MODE_KEY = "peachy-keen-mode";
const MODES = ["classic", "idle"];
const SWITCH_KEY = "peachy-keen-switching";
const SWAP_SHOT_KEY = "peachy-keen-swap-shot";
const SWAP_TIME_KEY = "peachy-keen-swap-time";
const LEAVE_MS = 700;
const SHAPE_FADE_MS = 350;
const STAGE_FADE_MS = 800;
// Each step's share of the fill: shape download, skin download, building and warming the scene.
const LOAD_SHARE = { shape: 0.4, skin: 0.25, prepare: 0.35 };

const intro = document.getElementById("intro");
const introTitle = new IntroTitle(document.getElementById("intro-title"));
const introStatus = document.getElementById("intro-status");
const modeName = (picked) => (picked === "idle" ? "Idle" : "Classic");
// eslint-disable-next-line no-use-before-define
const readyText = () => `Tap the peach to play ${modeName(mode)}.`;
const openingText = (picked) =>
  picked === "idle" ? "Opening the shop" : "Opening Classic";

// Each letter is its own span, so the line can carry a wave while the game loads.
const statusLetters = (text) =>
  [...text].map((ch, i) => {
    const span = document.createElement("span");
    span.className = ch === " " ? "status-letter is-space" : "status-letter";
    span.style.setProperty("--i", i);
    span.textContent = ch;
    return span;
  });

function writeStatus(text) {
  introStatus.replaceChildren(...statusLetters(text));
}

function setStatus(text) {
  if (introStatus.textContent === text) return;
  writeStatus(text);
  introStatus.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: 350,
    easing: "ease-out",
  });
}
const showText = () => intro.classList.add("has-fonts");
document.fonts.load("italic 560 44px Fraunces").then(showText, showText);
setTimeout(showText, 2000);
const modeButtons = [...document.querySelectorAll("[data-mode]")];

function readMode() {
  const asked = new URLSearchParams(window.location.search).get("mode");
  if (MODES.includes(asked)) return asked;
  try {
    const saved = localStorage.getItem(MODE_KEY);
    if (MODES.includes(saved)) return saved;
  } catch {
    // Blocked storage falls back to the classic game.
  }
  return "classic";
}

function saveMode(value) {
  try {
    localStorage.setItem(MODE_KEY, value);
  } catch {
    // The mode is then picked again on the next visit.
  }
}

function takeFlag(key) {
  try {
    const set = sessionStorage.getItem(key) === "1";
    sessionStorage.removeItem(key);
    return set;
  } catch {
    return false;
  }
}

let mode = readMode();
let started = false;
let idleReady = null;
let preparedMode = null;
let startGame = null;
let jiggleText = null;
const switching = takeFlag(SWITCH_KEY);
const swapping = document.documentElement.classList.contains("is-swapping");
const swapTime = (() => {
  try {
    const time = sessionStorage.getItem(SWAP_TIME_KEY);
    sessionStorage.removeItem(SWAP_TIME_KEY);
    sessionStorage.removeItem(SWAP_SHOT_KEY);
    return time;
  } catch {
    return null;
  }
})();
const skipLoading = switching;
if (switching) {
  writeStatus(openingText(mode));
  document.documentElement.classList.add("has-status");
}
const showMode = () =>
  modeButtons.forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.mode === mode)),
  );
function reloadInto(picked) {
  saveMode(picked);
  try {
    sessionStorage.setItem(SWITCH_KEY, "1");
  } catch {
    // Without session storage the start screen shows after the switch.
  }
  const url = new URL(window.location.href);
  url.searchParams.delete("mode");
  window.history.replaceState(null, "", url);
  window.location.reload();
}

modeButtons.forEach((b) =>
  b.addEventListener("click", () => {
    const picked = b.dataset.mode;
    if (started) {
      // eslint-disable-next-line no-use-before-define
      if (picked !== mode) leaveFor(picked);
      return;
    }
    // Before the start a pick only selects; the peach is the one way to start.
    if (picked === mode) return;
    mode = picked;
    showMode();
    if (!startGame) return;
    setStatus(readyText());
    // eslint-disable-next-line no-use-before-define
    if (!interaction.holdStill) interaction.nudge(0.6);
  }),
);
showMode();
document.querySelector(".intro-modes").classList.add("is-set");
slideToggle(document.querySelector(".intro-modes"));

const { scene, camera, renderer, lights } = initScene();
const quality = new QualityGovernor(renderer);
const backdrop = createBackdrop(scene, renderer);
setupResizeHandler(camera, renderer, () => {
  backdrop.resize();
  lens.resize();
});
backdrop.setMotion(!reducedMotion.matches);
if (swapping && swapTime !== null) backdrop.time = Number(swapTime);

const group = new Group();
group.visible = false;
scene.add(group);

const peach = new Peach(group);
const juice = new Juice(scene);
const droplets = new Droplets(scene);
const lens = new Lens(renderer, scene, camera);
juice.onSplat = (position, velocity) => lens.splat(position, velocity);
lens.onHit = () => playLensHit(1);
const ui = new UI();
const talk = new Talk();
const mood = new MoodLight(scene, renderer, lights);

const settings = new Settings((key, value) => {
  if (key === "sound") setMuted(!value);
  if (key === "quality") quality.setMode(value);
  if (key === "splatter") lens.enabled = value;
  if (key === "firmness") interaction.setFirmness(value);
  if (key === "tool") interaction.setTool(value);
  if (key === "talk") talk.setLevel(value);
  if (key === "moodLight") mood.set(value);
  naughty.set(key, value);
  wild.set(key, value);
  if (key === "lingerie" && value) interaction.dressUp(true);
  if (key === "lingerie" && !value) interaction.undress();
});

const interaction = new Interaction({
  scene,
  peach,
  group,
  camera,
  juice,
  droplets,
  lens,
  ui,
  settings,
  talk,
});
interaction.bottle.view.group.visible = false;
const naughty = new Naughty(interaction, talk);
const wild = new Wild({ scene, camera, interaction, talk, backdrop });
const shock = new Shock(renderer, interaction);
interaction.on("charge", () => quality.hold(4));
const skinRings = new SkinRings(scene, interaction);
settings.applyAll();
let idle = null;
let idleActive = false;

const loaded = { shape: 0, skin: 0, prepare: 0 };
const loadedShare = () =>
  Object.keys(LOAD_SHARE).reduce(
    (sum, k) => sum + LOAD_SHARE[k] * loaded[k],
    0,
  );
const fill = { shown: 0, motion: 0, velocity: 0, at: 0 };
const ripeCentre = new Vector3();
let stillGone = false;
let onRipe = null;
const RIPE_RENDER = "/peachy-keen/intro-peach-ripe.webp";
// The still and the live peach share one wave clock, so the wave carries on across the handover.
const waveEpoch = performance.timeOrigin + performance.now();
const waveTime = () =>
  (performance.timeOrigin + performance.now() - waveEpoch) / 1000;

const fillCanvas = document.getElementById("intro-fill");
const fillSize = () =>
  Math.round(fillCanvas.clientWidth * Math.min(2, devicePixelRatio));
let fillWorker = null;
let fillContext = null;
const ripeRender = new Image();
if (fillCanvas.transferControlToOffscreen) {
  fillWorker = new Worker(new URL("./fill-worker.js", import.meta.url), {
    type: "module",
  });
  const canvas = fillCanvas.transferControlToOffscreen();
  fillWorker.postMessage(
    {
      canvas,
      size: fillSize(),
      epoch: waveEpoch,
      image: RIPE_RENDER,
      instant: skipLoading,
    },
    [canvas],
  );
  fillWorker.onmessage = ({ data }) => Object.assign(fill, data);
  window.addEventListener("resize", () =>
    fillWorker?.postMessage({ size: fillSize() }),
  );
} else {
  fillContext = fillCanvas.getContext("2d");
  ripeRender.src = RIPE_RENDER;
}

function showRipeness(delta) {
  const target = loadedShare();
  const time = waveTime();
  if (fillWorker) fillWorker.postMessage({ target });
  else {
    if (ripeRender.complete) stepFill(fill, target, delta, skipLoading);
    const size = fillSize();
    if (!stillGone && ripeRender.complete && size) {
      if (fillCanvas.width !== size) {
        fillCanvas.width = size;
        fillCanvas.height = size;
      }
      drawFill(fillContext, ripeRender, size, fill.shown, time, fill.motion);
    }
  }
  // Messages arrive unevenly, so the level carries on along its last speed in between.
  const ahead = fillWorker
    ? Math.min(
        0.1,
        Math.max(
          0,
          (performance.timeOrigin + performance.now() - fill.at) / 1000,
        ),
      )
    : 0;
  peach.uniforms.uRipe.value = Math.min(1, fill.shown + fill.velocity * ahead);
  peach.uniforms.uRipeMotion.value = fill.motion;
  peach.uniforms.uRipeTime.value = time;
  if (peach.mesh) {
    const bounds = peach.uniforms.uBounds.value;
    peach.mesh.updateMatrixWorld();
    ripeCentre.set(bounds.x, bounds.y, bounds.z);
    peach.mesh.localToWorld(ripeCentre).applyMatrix4(camera.matrixWorldInverse);
    peach.uniforms.uRipeFrame.value.set(
      -ripeCentre.z,
      bounds.w * peach.worldScale(),
      ripeCentre.y,
    );
  }
  if (fill.shown >= 1) onRipe?.();
}

const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
const introShape = document.getElementById("intro-shape");
// Web animations of transform run on the compositor, so the peach keeps breathing while the page is busy.
const BREATH = [
  [
    { transform: "scale(1, 1)" },
    { transform: "scale(1.025, 0.975)" },
    { transform: "scale(1, 1)" },
  ],
  { duration: 1400, iterations: Infinity, easing: "ease-in-out" },
];
let breathing = null;
const breathe = () => {
  breathing = introShape.animate(...BREATH);
};
// The still eases back to rest, the live peach (held in the same pose) fades in under it, then the still goes.
const handOver = async () => {
  if (breathing) {
    const from = getComputedStyle(introShape).transform;
    breathing.cancel();
    breathing = null;
    await introShape.animate([{ transform: from }, { transform: "none" }], {
      duration: 250,
      easing: "ease-out",
    }).finished;
  }
  const root = document.documentElement;
  root.classList.add("is-handing");
  if (swapping)
    interaction.bottle.view.group.visible = idle?.bottleEarned() ?? true;
  root.classList.remove("is-switching");
  await wait(STAGE_FADE_MS);
};
if (switching) breathe();

let statusTimer = 0;
function sayForAMoment(text) {
  const before = introStatus.textContent;
  setStatus(text);
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    if (!started) setStatus(before);
  }, 1400);
}

const clearColor = new Color();
// Materials keep sampling the last shadow map after shadows switch off, so blank it.
const clearShadow = () => {
  const { map } = lights.key.shadow;
  if (!map) return;
  const alpha = renderer.getClearAlpha();
  renderer.getClearColor(clearColor);
  const previous = renderer.getRenderTarget();
  renderer.setRenderTarget(map);
  renderer.setClearColor(0xffffff, 1);
  renderer.clear();
  renderer.setRenderTarget(previous);
  renderer.setClearColor(clearColor, alpha);
};

function drawEverything() {
  const culled = [];
  const hidden = [];
  scene.traverse((o) => {
    /* eslint-disable no-param-reassign */
    if (!o.visible && !o.isLight) {
      hidden.push(o);
      o.visible = true;
    }
    if (o.frustumCulled) {
      culled.push(o);
      o.frustumCulled = false;
    }
    /* eslint-enable no-param-reassign */
  });
  camera.layers.enable(JUICE_LAYER);
  renderer.setScissor(0, 0, 1, 1);
  renderer.setScissorTest(true);
  [true, false].forEach((shadows) => {
    renderer.shadowMap.enabled = shadows;
    // Toggling shadows alone does not make three pick the other shader variant.
    scene.traverse(({ material }) => {
      [].concat(material ?? []).forEach((m) => {
        // eslint-disable-next-line no-param-reassign
        m.needsUpdate = true;
      });
    });
    renderer.render(scene, camera);
  });
  renderer.render(lens.overlay, lens.overlayCamera);
  lens.blobGeometry.instanceCount = 1;
  renderer.render(lens.blobScene, lens.overlayCamera);
  renderer.render(shock.scene, shock.camera);
  renderer.setScissorTest(false);
  camera.layers.disable(JUICE_LAYER);
  /* eslint-disable no-param-reassign */
  culled.forEach((o) => {
    o.frustumCulled = true;
  });
  hidden.forEach((o) => {
    o.visible = false;
  });
  /* eslint-enable no-param-reassign */
  clearShadow();
}

// Every lit pixel pays for each visible light, so lights that are off stay out of the shaders.
const lightGroups = [[mood.candle, mood.halo], wild.disco.lights];
const lightIndex = (shown) => (shown[0] ? 1 : 0) + (shown[1] ? 2 : 0);
// Each light combination is its own shader variant; unwarmed ones fall back to all lights on.
const ALL_LIGHTS = [true, true];
let warmExtra = [];
const showLights = (shown) =>
  lightGroups.forEach((members, n) =>
    members.forEach((light) => {
      // eslint-disable-next-line no-param-reassign
      light.visible = shown[n];
    }),
  );
const lightsShown = [false, false];
const showLitGroups = () => {
  lightGroups.forEach((members, n) => {
    lightsShown[n] = members.some((light) => light.intensity > 0);
  });
  showLights(
    warmedLights.has(lightIndex(lightsShown)) ? lightsShown : ALL_LIGHTS,
  );
};

async function warmLights(shown) {
  showLights(shown);
  renderer.shadowMap.enabled = true;
  const shadowed = renderer.compileAsync(scene, camera);
  renderer.shadowMap.enabled = false;
  await Promise.all([
    shadowed,
    renderer.compileAsync(scene, camera),
    renderer.compileAsync(lens.overlay, lens.overlayCamera),
    renderer.compileAsync(lens.blobScene, lens.overlayCamera),
    renderer.compileAsync(shock.scene, shock.camera),
  ]);
  // The render loop switches unlit lights off while the compile runs.
  showLights(shown);
  // ANGLE on Metal builds a shader on its first draw, not at compile, so draw every variant into one pixel.
  drawEverything();
  warmedLights.add(lightIndex(shown));
}

async function warm(extra = warmExtra) {
  warmExtra = extra;
  warmedLights.clear();
  const states = [ALL_LIGHTS, [false, false], ...extra];
  for (let n = 0; n < states.length; n += 1)
    // eslint-disable-next-line no-await-in-loop
    await warmLights(states[n]);
}

let warming = false;
renderer.domElement.addEventListener("webglcontextrestored", async () => {
  warming = true;
  await warm();
  warming = false;
});

// Building the shop and compiling its shaders freezes the page, so it happens before the tap.
async function prepareIdle() {
  const status = introStatus.textContent;
  setStatus("Opening the shop");
  const { createIdle } = await import("./idle");
  idle = createIdle({
    interaction,
    peach,
    camera,
    settings,
    talk,
    buzzer: wild.buzzer,
    scene,
    renderer,
    backdrop,
    mood,
    lights,
    wild,
    lens,
    juice,
    droplets,
  });
  naughty.set("achievements", false);
  idle.prepare();
  await warm(idle.lightStates());
  idle.ready();
  setStatus(status);
}

// The last frame without the peach covers the reload; the breathing still stands in for the peach.
function snapshotWithoutPeach() {
  const shown = group.visible;
  group.visible = false;
  renderer.render(scene, camera);
  group.visible = shown;
  const shot = document.createElement("canvas");
  shot.width = window.innerWidth;
  shot.height = window.innerHeight;
  shot
    .getContext("2d")
    .drawImage(renderer.domElement, 0, 0, shot.width, shot.height);
  return shot.toDataURL("image/jpeg", 0.8);
}

let leaving = false;

// While the shop compiles the page freezes, so a still copy of the frame with a breathing peach covers it.
function coverFrame(text) {
  const cover = document.createElement("div");
  cover.className = "swap-cover";
  cover.style.backgroundImage = `url(${snapshotWithoutPeach()})`;
  cover.innerHTML = `<div class="intro-shape"></div><p class="intro-status swap-status"></p>`;
  cover.querySelector(".swap-status").append(...statusLetters(text));
  document.body.append(cover);
  const still = cover.firstElementChild;
  const breath = still.animate(...BREATH);
  return async () => {
    const from = getComputedStyle(still).transform;
    breath.cancel();
    await still.animate([{ transform: from }, { transform: "none" }], {
      duration: 250,
      easing: "ease-out",
    }).finished;
    await cover.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 300,
      easing: "ease-out",
    }).finished;
    cover.remove();
  };
}

// Classic has everything Idle needs except the shop, so the shop is built in this page instead of a reload.
async function openIdleHere() {
  const root = document.documentElement;
  root.classList.add("is-leaving-mode");
  interaction.holdStill = true;
  await wait(LEAVE_MS);
  const { time } = backdrop;
  const uncover = coverFrame(openingText("idle"));
  mode = "idle";
  preparedMode = "idle";
  saveMode("idle");
  showMode();
  idleReady = prepareIdle();
  await idleReady;
  backdrop.time = time;
  root.classList.remove("is-leaving-mode");
  await uncover();
  document.querySelectorAll(".score > *").forEach((n) =>
    n.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 500,
      easing: "ease-out",
    }),
  );
  interaction.holdStill = false;
  idleActive = true;
  idle.begin();
  leaving = false;
}

async function leaveFor(picked) {
  if (leaving) return;
  leaving = true;
  if (picked === "idle" && !idle) {
    openIdleHere();
    return;
  }
  document.documentElement.classList.add("is-leaving-mode");
  interaction.holdStill = true;
  await Promise.all([idle?.leave(), wait(LEAVE_MS)]);
  try {
    sessionStorage.setItem(SWAP_TIME_KEY, String(backdrop.time));
    sessionStorage.setItem(SWAP_SHOT_KEY, snapshotWithoutPeach());
  } catch {
    // Without session storage the switch shows the plain opening screen.
  }
  reloadInto(picked);
}

const HUD = [".score", ".hints", ".settings-dock", ".bottle"];
// After a switch from inside the game the score and hints never left, so only what is new fades in.
const SWAP_HUD = [".score > *", ".settings-dock"];
function showHud() {
  document.body.classList.remove("is-intro");
  (swapping ? SWAP_HUD : HUD).forEach((selector) =>
    document
      .querySelector(selector)
      ?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 700,
        easing: "ease-out",
      }),
  );
}

// Once ripe, the peach answers the pointer the way the game will, so it reads as touchable.
let overPeach = false;
let lastPointer = null;
intro.addEventListener("pointermove", (e) => {
  if (!startGame || started) return;
  const over = !!interaction.raycastAt(e.clientX, e.clientY);
  if (over && !overPeach) interaction.nudge(0.6);
  overPeach = over;
  intro.classList.toggle("is-over", over);
  if (over && lastPointer) {
    const dx = Math.max(-40, Math.min(40, e.clientX - lastPointer.x));
    const dy = Math.max(-40, Math.min(40, e.clientY - lastPointer.y));
    interaction.spin.z -= dx * 0.004;
    interaction.spin.x += dy * 0.003;
  }
  lastPointer = { x: e.clientX, y: e.clientY };
});
intro.addEventListener("pointerleave", () => {
  overPeach = false;
  lastPointer = null;
  intro.classList.remove("is-over");
});
intro.addEventListener("pointerdown", (e) => {
  if (!startGame || started || !interaction.raycastAt(e.clientX, e.clientY))
    return;
  interaction.squashVelocity.x -= 1.4;
  interaction.squashAxis.set(0, 1);
});

intro.addEventListener("click", (e) => {
  if (started || e.target.closest("[data-mode]")) return;
  const onPeach = peach.mesh && interaction.raycastAt(e.clientX, e.clientY);
  if (!onPeach) {
    if (group.visible && !interaction.holdStill) interaction.nudge();
    return;
  }
  if (startGame) startGame();
  else {
    sayForAMoment("Not ripe yet");
    if (!interaction.holdStill) interaction.nudge(0.6);
  }
});

const skinImage = Peach.fetchSkin((fraction) => {
  loaded.skin = fraction;
});
peach
  .load((fraction) => {
    loaded.shape = fraction;
  })
  .then(async () => {
    loaded.shape = 1;
    interaction.prepareHalves();
    preparedMode = mode;
    if (mode === "idle") idleReady = prepareIdle();
    else await warm();
    await idleReady;
    loaded.prepare = 1;
    group.visible = true;
    intro.classList.add("has-shape");
    setStatus(switching ? openingText(mode) : "Ripening");
    setTimeout(() => {
      if (!switching) interaction.holdStill = false;
      stillGone = true;
      fillWorker?.postMessage({ stop: true });
    }, SHAPE_FADE_MS);
    const ripe = new Promise((resolve) => {
      onRipe = resolve;
    });
    peach.applySkin(await skinImage);
    if (switching) peach.fitPlant();
    loaded.skin = 1;
    await ripe;
    juice.clear();
    loadSounds();
    keepAudioUnlocked();

    // Starting the mode that was not prepared: the peach stays as the one fixed point while the rest
    // fades to a calm screen, and the slow work happens behind it.
    let opening = false;
    const openOther = async () => {
      if (opening) return;
      opening = true;
      // The tap squash settles and the sway eases to the rest pose before the still takes over.
      interaction.nudge(1.4);
      interaction.holdStill = true;
      intro.classList.remove("is-ready");
      setStatus(openingText(mode));
      await wait(650);
      document.documentElement.classList.add(
        "is-switching",
        "is-opening",
        "has-status",
      );
      await wait(450);
      peach.fitPlant();
      if (mode === "classic") {
        reloadInto("classic");
        return;
      }
      breathe();
      preparedMode = "idle";
      idleReady = prepareIdle();
      await idleReady;
      await handOver();
      // eslint-disable-next-line no-use-before-define
      start(true);
    };

    const start = async (afterOpening = false) => {
      if (started) return;
      if (mode !== preparedMode) {
        openOther();
        return;
      }
      if (afterOpening) {
        intro.classList.add("is-handed", "is-quiet");
        await wait(300);
      }
      // The shop panel reserves its space as it appears; the fading intro keeps its place.
      intro.style.padding = getComputedStyle(intro).padding;
      started = true;
      idleActive = !!idle;
      // After a switch the peach waits for the still on top of it to fade, so their leaves stay together.
      if (afterOpening)
        setTimeout(() => {
          interaction.holdStill = false;
        }, 900);
      else interaction.holdStill = false;
      saveMode(mode);
      await idleReady;
      interaction.requestShake();
      intro.classList.add("is-leaving");
      showHud();
      setTimeout(() => {
        intro.remove();
        fillWorker?.terminate();
        fillWorker = null;
        document.documentElement.classList.remove(
          "is-opening",
          "is-handing",
          "has-status",
        );
      }, 700);
      peach.fitPlant();
      interaction.begin(afterOpening ? 0 : 1.6);
      jiggleText ??= new JiggleText();
      if (!swapping) {
        interaction.bottle.view.group.visible = idle?.bottleEarned() ?? true;
        interaction.bottle.screen.x -= 220;
      }
      idle?.begin();
    };

    if (switching) {
      await handOver();
      start(true);
      return;
    }
    setStatus(readyText());
    intro.classList.add("is-ready");
    interaction.nudge(1.4);
    const invite = setInterval(() => {
      if (started) clearInterval(invite);
      else interaction.nudge(0.35);
    }, 3500);
    startGame = start;
  });

const SHADOW_HOLD = 1.5;
let shadowHold = 0;
const castersInPlay = () =>
  settings.shadows === "always" ||
  interaction.bottle.carried ||
  interaction.bottle.stream.active ||
  wild.disco.mirror.holder.visible ||
  interaction.halves?.some((h) => h.holder.visible);

const clock = new Clock();
// With the shop sheet up only the visible part is drawn; the margin keeps edge refraction sampling real pixels.
const CLIP_MARGIN = 32;
// A full-height sheet leaves a thin strip of the scene, so it can draw at a lower resolution.
const FULL_SHEET_RESOLUTION = 0.6;
const clipBox = new Vector4();
// With the shop open and nothing being touched, the scene draws every other frame; any touch restores full rate at once.
const CALM_AFTER = 1;
let calmFor = 0;
let skipFrame = false;
let lastFrameAt = performance.now();
const frameClip = () => {
  const w = viewWidth();
  const h = viewHeight();
  if (sheet.side)
    return clipBox.set(0, 0, Math.min(w, w - sheet.side + CLIP_MARGIN), h);
  if (sheet.top === null) return null;
  const shown = Math.min(h, sheet.top + CLIP_MARGIN);
  return clipBox.set(0, h - shown, w, shown);
};
renderer.setAnimationLoop(() => {
  if (warming) return;
  const shop = idle?.shop() ?? 0;
  quality.setCap(shop > 1 ? quality.max * FULL_SHEET_RESOLUTION : undefined);
  const now = performance.now();
  const gap = now - lastFrameAt;
  lastFrameAt = now;
  const busy =
    interaction.pointer.pressed ||
    interaction.carrying ||
    interaction.grab ||
    interaction.slicing ||
    interaction.phase !== "live" ||
    interaction.bottle.stream.active ||
    wild.disco.on ||
    shock.active;
  calmFor = busy ? 0 : calmFor + gap / 1000;
  if (shop && calmFor > CALM_AFTER) {
    // Half rate reads as slow frames, so the resolution governor waits it out.
    quality.hold(1);
    skipFrame = !skipFrame;
    if (skipFrame) return;
  } else skipFrame = false;
  const realDelta = Math.min(clock.getDelta(), 1 / 20);
  jiggleText?.update(realDelta);
  if (!started || intro.isConnected) {
    showRipeness(realDelta);
    introTitle.update(realDelta);
  }
  shadowHold = castersInPlay()
    ? SHADOW_HOLD
    : Math.max(0, shadowHold - realDelta);
  const shadows = shadowHold > 0;
  if (renderer.shadowMap.enabled && !shadows) clearShadow();
  renderer.shadowMap.enabled = shadows;
  const delta = realDelta * interaction.timeScale(realDelta);
  // The camera and bottle read the framing, so it updates before them.
  if (idleActive) idle.frame(realDelta);
  interaction.update(delta);
  naughty.update(delta);
  if (idleActive) idle.update(realDelta);
  wild.update(delta, realDelta);
  peach.breeze = interaction.swayAmount;
  peach.update(delta, interaction.heat / 100);
  backdrop.update(delta, interaction.heat / 100);
  mood.update(realDelta, interaction.heat / 100);
  showLitGroups();
  peach.updateRing(camera);
  quality.update(realDelta);
  settings.showFps(quality.fps);
  juice.splatZ = camera.position.z - 2.5;
  const halfHeight = 2.5 * Math.tan((camera.fov * Math.PI) / 360);
  juice.splatHalf.set(halfHeight * camera.aspect, halfHeight);
  droplets.update(delta);
  lens.update(delta);
  skinRings.update(delta);
  shock.update(realDelta);
  const clip = shop ? frameClip() : null;
  backdrop.render(clip);
  if (!renderer.domElement.classList.contains("is-drawn"))
    requestAnimationFrame(() => renderer.domElement.classList.add("is-drawn"));
  lens.render([juice, droplets], clip);
  shock.render();
  if (clip) renderer.setScissorTest(false);
});

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/peachy-keen/sw.js").catch(() => {});
  });
}
