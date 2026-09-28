import { Group, Clock } from "three";
import { initScene, setupResizeHandler, QualityGovernor } from "./scene";
import { createBackdrop } from "./backdrop";
import { Peach } from "./peach";
import { Juice, Droplets } from "./juice";
import { Lens } from "./lens";
import { Interaction } from "./interaction";
import { UI } from "./ui";
import { Settings } from "./settings";
import { Talk, Censor } from "./spicy";
import { unlockAudio, loadSounds, setMuted } from "./audio";

const BLACK_GOLD = { color: 0x0a0408, sheen: 0xd4a24c };
const BOW_STYLES = {
  gold: BLACK_GOLD,
  sheer: { color: 0x0a0408, sheen: 0x6b5a63, opacity: 0.55 },
  red: { color: 0x6e0a16, sheen: 0xe04a5c },
  back: { ...BLACK_GOLD, placement: "back" },
  ties: BLACK_GOLD,
};

const intro = document.getElementById("intro");
const introTitle = document.getElementById("intro-title");
const introStatus = document.getElementById("intro-status");

const { scene, camera, renderer } = initScene();
const quality = new QualityGovernor(renderer);
const backdrop = createBackdrop(scene);
setupResizeHandler(camera, renderer, () => {
  backdrop.resize();
  lens.resize();
});
backdrop.setMotion(
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
);

const group = new Group();
group.visible = false;
scene.add(group);

const peach = new Peach(group);
const juice = new Juice(scene);
const droplets = new Droplets(scene);
const lens = new Lens(renderer, scene, camera);
juice.onSplat = (position, velocity) => lens.splat(position, velocity);
const ui = new UI();
const talk = new Talk();
const censor = new Censor();

const settings = new Settings((key, value) => {
  if (key === "sound") setMuted(!value);
  if (key === "quality") quality.setMode(value);
  if (key === "splatter") lens.enabled = value;
  if (key === "firmness") interaction.setFirmness(value);
  if (key === "tool") interaction.setTool(value);
  if (key === "bottle") interaction.bottle.setStyle(value);
  if (key === "talk") talk.setLevel(value);
  if (key === "censor") censor.setMode(value);
  if (key === "lingerie") interaction.dressUp(true);
  if (key === "bowColor") {
    peach.setBowStyle(BOW_STYLES[value] || BOW_STYLES.gold);
    interaction.dressUp();
  }
});

const interaction = new Interaction({
  scene,
  peach,
  group,
  camera,
  juice,
  droplets,
  lens,
  backdrop,
  ui,
  settings,
  talk,
  censor,
});
settings.applyAll();

function setProgress(fraction) {
  introTitle.style.setProperty("--progress", `${Math.round(fraction * 100)}%`);
}

peach.load(setProgress).then(async () => {
  setProgress(1);
  group.visible = true;
  const halves = interaction.prepareHalves();
  halves.forEach((h) => {
    // eslint-disable-next-line no-param-reassign
    h.visible = true;
  });
  const compiled = Promise.all([
    renderer.compileAsync(scene, camera),
    renderer.compileAsync(lens.overlay, lens.overlayCamera),
  ]);
  halves.forEach((h) => {
    // eslint-disable-next-line no-param-reassign
    h.visible = false;
  });
  group.visible = false;
  await compiled;
  juice.clear();
  loadSounds();
  introStatus.textContent = "Click anywhere to begin. Sound on.";
  intro.classList.add("is-ready");

  intro.addEventListener(
    "click",
    () => {
      unlockAudio();
      interaction.requestShake();
      intro.classList.add("is-leaving");
      setTimeout(() => intro.remove(), 700);
      interaction.begin();
    },
    { once: true },
  );
});

const clock = new Clock();
renderer.setAnimationLoop(() => {
  const realDelta = Math.min(clock.getDelta(), 1 / 20);
  const delta = realDelta * interaction.timeScale(realDelta);
  interaction.update(delta);
  peach.update(delta, interaction.heat / 100);
  backdrop.update(delta, interaction.heat / 100);
  peach.updateRing(camera);
  quality.update(realDelta);
  settings.showFps(quality.fps);
  juice.splatZ = camera.position.z - 2.5;
  const halfHeight = 2.5 * Math.tan((camera.fov * Math.PI) / 360);
  juice.splatHalf.set(halfHeight * camera.aspect, halfHeight);
  droplets.update(delta);
  lens.update(delta);
  lens.render([juice, droplets]);
});
