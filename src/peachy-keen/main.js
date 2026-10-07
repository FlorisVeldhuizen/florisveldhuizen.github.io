import { Group, Clock, Color } from "three";
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
import { reducedMotion } from "./util";
import IntroTitle from "./intro-title";

const MODE_KEY = "peachy-keen-mode";
const MODES = ["classic", "idle"];
const SWITCH_KEY = "peachy-keen-switching";
const SKIP_KEY = "peachy-keen-intro-ripe";
const SHAPE_FADE_MS = 350;
const RIPEN_MIN_SECONDS = 1.5;
// Each step's share of the fill: shape download, skin download, building and warming the scene.
const LOAD_SHARE = { shape: 0.4, skin: 0.25, prepare: 0.35 };
// The peach model's height range projected onto the intro renders, as a share of the image height.
const RENDER_TOP = 0.2655;
const RENDER_BOTTOM = 0.7345;

const intro = document.getElementById("intro");
const introTitle = new IntroTitle(document.getElementById("intro-title"));
const introStatus = document.getElementById("intro-status");
function setStatus(text) {
  if (introStatus.textContent === text) return;
  introStatus.textContent = text;
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
let peachReady = false;
let idleReady = null;
let startGame = null;
const switching = takeFlag(SWITCH_KEY);
const skipLoading = takeFlag(SKIP_KEY) || switching;
const showMode = () =>
  modeButtons.forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.mode === mode)),
  );
modeButtons.forEach((b) =>
  b.addEventListener("click", () => {
    if (!started && !(idleReady && b.dataset.mode === "classic")) {
      mode = b.dataset.mode;
      showMode();
      // eslint-disable-next-line no-use-before-define
      if (mode === "idle" && peachReady) idleReady ??= prepareIdle();
      startGame?.();
    } else if (b.dataset.mode !== mode) {
      saveMode(b.dataset.mode);
      try {
        sessionStorage.setItem(
          started || startGame ? SWITCH_KEY : SKIP_KEY,
          "1",
        );
      } catch {
        // Without session storage the start screen shows after the switch.
      }
      const url = new URL(window.location.href);
      url.searchParams.delete("mode");
      window.history.replaceState(null, "", url);
      document.body
        .animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 250,
          fill: "forwards",
        })
        .finished.then(() => window.location.reload());
    }
  }),
);
showMode();
document.querySelector(".intro-modes").classList.add("is-set");

const { scene, camera, renderer, lights } = initScene();
const quality = new QualityGovernor(renderer);
const backdrop = createBackdrop(scene, renderer);
setupResizeHandler(camera, renderer, () => {
  backdrop.resize();
  lens.resize();
});
backdrop.setMotion(!reducedMotion.matches);

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
const skinRings = new SkinRings(scene, interaction);
settings.applyAll();
let idle = null;

const loaded = { shape: 0, skin: 0, prepare: 0 };
const loadedShare = () =>
  Object.keys(LOAD_SHARE).reduce(
    (sum, k) => sum + LOAD_SHARE[k] * loaded[k],
    0,
  );
let ripeShown = 0;
let stillGone = false;
let onRipe = null;

const fillCanvas = document.getElementById("intro-fill");
const fillContext = fillCanvas.getContext("2d");
const ripeRender = new Image();
ripeRender.src = "/peachy-keen/intro-peach-ripe.webp";

function drawFill(level, time) {
  if (stillGone || !ripeRender.complete) return;
  const size = Math.round(
    fillCanvas.clientWidth * Math.min(2, devicePixelRatio),
  );
  if (!size) return;
  if (fillCanvas.width !== size) {
    fillCanvas.width = size;
    fillCanvas.height = size;
  }
  const top = RENDER_TOP * size;
  const height = (RENDER_BOTTOM - RENDER_TOP) * size;
  const surface = (x) => {
    const across = (x - size / 2) / height;
    const wave =
      Math.sin(across * 15 + time * 3) * 0.015 +
      Math.sin(across * 12 - time * 2.2) * 0.01;
    return top + height * (1 - (level * 1.2 - 0.1 + wave));
  };
  fillContext.clearRect(0, 0, size, size);
  fillContext.save();
  fillContext.beginPath();
  fillContext.moveTo(0, size);
  for (let x = 0; x <= size; x += size / 64) fillContext.lineTo(x, surface(x));
  fillContext.lineTo(size, size);
  fillContext.clip();
  fillContext.drawImage(ripeRender, 0, 0, size, size);
  fillContext.restore();
}

function showRipeness(delta, time) {
  const target = loadedShare();
  // Follows the loading at an even pace: it eases toward each new step and never jumps.
  const speed = Math.min(
    1 / RIPEN_MIN_SECONDS,
    Math.max(0.25, (target - ripeShown) * 2.5),
  );
  if (ripeShown < target)
    ripeShown = skipLoading
      ? target
      : Math.min(target, ripeShown + delta * speed);
  peach.uniforms.uRipe.value = ripeShown;
  drawFill(skipLoading ? 1 : ripeShown, time);
  if (ripeShown >= 1) onRipe?.();
}

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
const extraLights = [mood.candle, mood.halo, ...wild.disco.lights];
const showExtraLights = (shown) =>
  extraLights.forEach((light) => {
    // eslint-disable-next-line no-param-reassign
    light.visible = shown;
  });

async function warmLights(lit) {
  showExtraLights(lit);
  renderer.shadowMap.enabled = true;
  const shadowed = renderer.compileAsync(scene, camera);
  renderer.shadowMap.enabled = false;
  await Promise.all([
    shadowed,
    renderer.compileAsync(scene, camera),
    renderer.compileAsync(lens.overlay, lens.overlayCamera),
    renderer.compileAsync(shock.scene, shock.camera),
  ]);
  // The render loop switches unlit lights off while the compile runs.
  showExtraLights(lit);
  // ANGLE on Metal builds a shader on its first draw, not at compile, so draw every variant into one pixel.
  drawEverything();
}

async function warm() {
  await warmLights(true);
  await warmLights(false);
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
  });
  naughty.set("achievements", false);
  idle.prepare();
  await warm();
  idle.ready();
  setStatus(status);
}

const HUD = [".score", ".hints", ".settings-dock", ".bottle", ".panel"];
function showHud() {
  document.body.classList.remove("is-intro");
  HUD.forEach((selector) =>
    document
      .querySelector(selector)
      ?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 700,
        easing: "ease-out",
      }),
  );
}

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
    if (mode === "idle") idleReady = prepareIdle();
    else await warm();
    await idleReady;
    loaded.prepare = 1;
    peachReady = true;
    group.visible = true;
    intro.classList.add("has-shape");
    setStatus("Ripening");
    setTimeout(() => {
      interaction.holdStill = false;
      stillGone = true;
    }, SHAPE_FADE_MS);
    const ripe = new Promise((resolve) => {
      onRipe = resolve;
    });
    peach.applySkin(await skinImage);
    loaded.skin = 1;
    await ripe;
    if (switching) intro.classList.add("is-leaving", "is-quiet");
    document.documentElement.classList.remove("is-switching");
    juice.clear();
    loadSounds();
    keepAudioUnlocked();

    const start = async () => {
      started = true;
      interaction.holdStill = false;
      saveMode(mode);
      await idleReady;
      interaction.requestShake();
      // The shop panel reserves its space as it appears; the fading intro keeps its place.
      intro.style.padding = getComputedStyle(intro).padding;
      intro.classList.add("is-leaving");
      showHud();
      setTimeout(() => intro.remove(), 700);
      peach.fitPlant();
      interaction.begin();
      interaction.bottle.view.group.visible = true;
      interaction.bottle.screen.x -= 220;
      idle?.begin();
    };

    if (switching) {
      start();
      return;
    }
    setStatus("Ripe. Tap the peach to play. Sound on.");
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
renderer.setAnimationLoop(() => {
  if (warming) return;
  const realDelta = Math.min(clock.getDelta(), 1 / 20);
  if (!started || intro.isConnected) {
    showRipeness(realDelta, clock.elapsedTime);
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
  if (started) idle?.frame(realDelta);
  interaction.update(delta);
  naughty.update(delta);
  if (started) idle?.update(realDelta);
  wild.update(delta, realDelta);
  peach.update(delta, interaction.heat / 100);
  backdrop.update(delta, interaction.heat / 100);
  mood.update(realDelta, interaction.heat / 100);
  showExtraLights(extraLights.some((light) => light.intensity > 0));
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
  backdrop.render();
  if (!renderer.domElement.classList.contains("is-drawn"))
    requestAnimationFrame(() => renderer.domElement.classList.add("is-drawn"));
  lens.render([juice, droplets]);
  shock.render();
});

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/peachy-keen/sw.js").catch(() => {});
  });
}
