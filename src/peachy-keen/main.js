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
// Roughly the shape's share of the bytes; the skin is the rest.
const SHAPE_SHARE = 0.6;
const SHAPE_FADE_MS = 350;

const intro = document.getElementById("intro");
const introTitle = new IntroTitle(document.getElementById("intro-title"));
const introStatus = document.getElementById("intro-status");
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

function takeSwitch() {
  try {
    const switching = sessionStorage.getItem(SWITCH_KEY) === "1";
    sessionStorage.removeItem(SWITCH_KEY);
    return switching;
  } catch {
    return false;
  }
}

let mode = readMode();
let started = false;
const switching = takeSwitch();
const showMode = () =>
  modeButtons.forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.mode === mode)),
  );
modeButtons.forEach((b) =>
  b.addEventListener("click", () => {
    if (!started) {
      mode = b.dataset.mode;
      showMode();
    } else if (b.dataset.mode !== mode) {
      saveMode(b.dataset.mode);
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
  }),
);
showMode();

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
const naughty = new Naughty(interaction, talk);
const wild = new Wild({ scene, camera, interaction, talk, backdrop });
const shock = new Shock(renderer, interaction);
const skinRings = new SkinRings(scene, interaction);
settings.applyAll();
let idle = null;

let ripeStep = 0;
function ripen(fraction) {
  peach.uniforms.uRipe.value = fraction;
  introTitle.fill(SHAPE_SHARE + fraction * (1 - SHAPE_SHARE));
  const step = Math.floor(fraction * 10);
  if (step <= ripeStep) return;
  ripeStep = step;
  if (!interaction.holdStill) interaction.nudge(0.3);
}

let statusTimer = 0;
function sayForAMoment(text) {
  const before = introStatus.textContent;
  introStatus.textContent = text;
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    if (!started) introStatus.textContent = before;
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

async function startIdle() {
  introStatus.textContent = "Opening the shop";
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
}

let startGame = null;
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

peach
  .load((fraction) => introTitle.fill(fraction * SHAPE_SHARE))
  .then(async () => {
    introTitle.fill(SHAPE_SHARE);
    peach.uniforms.uRipe.value = 0;
    group.visible = true;
    intro.classList.add("has-shape");
    introStatus.textContent = "Ripening";
    setTimeout(() => {
      interaction.holdStill = false;
    }, SHAPE_FADE_MS);
    await peach.loadSkin(ripen);
    ripen(1);
    interaction.prepareHalves();
    await warm();
    juice.clear();
    loadSounds();
    keepAudioUnlocked();

    const start = async () => {
      started = true;
      interaction.holdStill = false;
      intro.classList.remove("is-ready");
      saveMode(mode);
      if (mode === "idle") await startIdle();
      interaction.requestShake();
      intro.classList.add("is-leaving");
      document.body.classList.remove("is-intro");
      setTimeout(() => intro.remove(), 700);
      interaction.begin();
      idle?.begin();
    };

    if (switching) {
      start();
      return;
    }
    introStatus.textContent = "Ripe. Tap the peach. Sound on.";
    intro.classList.add("is-ready");
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
  if (!started || intro.isConnected) introTitle.update(realDelta);
  shadowHold = castersInPlay()
    ? SHADOW_HOLD
    : Math.max(0, shadowHold - realDelta);
  const shadows = shadowHold > 0;
  if (renderer.shadowMap.enabled && !shadows) clearShadow();
  renderer.shadowMap.enabled = shadows;
  const delta = realDelta * interaction.timeScale(realDelta);
  // The camera and bottle read the framing, so it updates before them.
  idle?.frame(realDelta);
  interaction.update(delta);
  naughty.update(delta);
  idle?.update(realDelta);
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
  lens.render([juice, droplets]);
  shock.render();
});

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/peachy-keen/sw.js").catch(() => {});
  });
}
