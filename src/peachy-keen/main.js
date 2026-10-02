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
import { keepAudioUnlocked, loadSounds, setMuted, playLensHit } from "./audio";
import { reducedMotion } from "./util";

const MODE_KEY = "peachy-keen-mode";
const MODES = ["classic", "idle"];
const SWITCH_KEY = "peachy-keen-switching";

const intro = document.getElementById("intro");
const introTitle = document.getElementById("intro-title");
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
settings.applyAll();
let idle = null;

function setProgress(fraction) {
  introTitle.style.setProperty("--progress", `${Math.round(fraction * 100)}%`);
}

async function warm(warmups) {
  const showWarmups = (visible) => {
    group.visible = visible;
    warmups.forEach((h) => {
      // eslint-disable-next-line no-param-reassign
      h.visible = visible;
    });
  };
  showWarmups(true);
  camera.layers.enable(JUICE_LAYER);
  renderer.shadowMap.enabled = true;
  const shadowed = renderer.compileAsync(scene, camera);
  renderer.shadowMap.enabled = false;
  const compiled = Promise.all([
    shadowed,
    renderer.compileAsync(scene, camera),
    renderer.compileAsync(lens.overlay, lens.overlayCamera),
    renderer.compileAsync(shock.scene, shock.camera),
  ]);
  camera.layers.disable(JUICE_LAYER);
  showWarmups(false);
  await compiled;
  // compileAsync skips the shadow pass, so one hidden render builds its depth shaders.
  showWarmups(true);
  renderer.shadowMap.enabled = true;
  camera.layers.enable(JUICE_LAYER);
  renderer.render(scene, camera);
  camera.layers.disable(JUICE_LAYER);
  showWarmups(false);
}

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
  await warm(idle.warmups());
  idle.ready();
}

peach.load(setProgress).then(async () => {
  setProgress(1);
  await warm([
    ...interaction.prepareHalves(),
    ...wild.warmups(),
    juice.mesh,
    droplets.mesh,
  ]);
  juice.clear();
  loadSounds();
  keepAudioUnlocked();

  const start = async () => {
    started = true;
    intro.classList.remove("is-ready");
    saveMode(mode);
    if (mode === "idle") await startIdle();
    interaction.requestShake();
    intro.classList.add("is-leaving");
    setTimeout(() => intro.remove(), 700);
    interaction.begin();
    idle?.begin();
  };

  if (switching) {
    start();
    return;
  }
  introStatus.textContent = "Click anywhere to begin. Sound on.";
  intro.classList.add("is-ready");
  intro.addEventListener("click", start, { once: true });
});

const SHADOW_HOLD = 1.5;
let shadowHold = 0;
const castersInPlay = () =>
  settings.shadows === "always" ||
  interaction.bottle.carried ||
  interaction.bottle.stream.active ||
  wild.disco.mirror.holder.visible ||
  interaction.halves?.some((h) => h.holder.visible);

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

const clock = new Clock();
renderer.setAnimationLoop(() => {
  const realDelta = Math.min(clock.getDelta(), 1 / 20);
  shadowHold = castersInPlay()
    ? SHADOW_HOLD
    : Math.max(0, shadowHold - realDelta);
  const shadows = shadowHold > 0;
  if (renderer.shadowMap.enabled && !shadows) clearShadow();
  renderer.shadowMap.enabled = shadows;
  const delta = realDelta * interaction.timeScale(realDelta);
  interaction.update(delta);
  naughty.update(delta);
  idle?.update(realDelta);
  wild.update(delta, realDelta);
  peach.update(delta, interaction.heat / 100);
  backdrop.update(delta, interaction.heat / 100);
  mood.update(realDelta, interaction.heat / 100);
  peach.updateRing(camera);
  quality.update(realDelta);
  settings.showFps(quality.fps);
  juice.splatZ = camera.position.z - 2.5;
  const halfHeight = 2.5 * Math.tan((camera.fov * Math.PI) / 360);
  juice.splatHalf.set(halfHeight * camera.aspect, halfHeight);
  droplets.update(delta);
  lens.update(delta);
  shock.update(realDelta);
  backdrop.render();
  lens.render(idle ? [juice, droplets, idle.room] : [juice, droplets]);
  shock.render();
});

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/peachy-keen/sw.js").catch(() => {});
  });
}
