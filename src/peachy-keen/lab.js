import { Group, Clock } from "three";
import { initScene, setupResizeHandler } from "./scene";
import { createBackdrop } from "./backdrop";
import { Peach } from "./peach";
import { FABRIC } from "./config";

const STORAGE_KEY = "peachy-keen-lab";
const DEFAULTS = {
  view: "back",
  pull: 0,
  ...FABRIC,
};
const VIEWS = { back: 0, quarter: 0.7, side: 1.45, front: 3.14 };

function read() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch {
    return { ...DEFAULTS };
  }
}

const state = read();
const { scene, camera, renderer } = initScene();
const backdrop = createBackdrop(scene);
setupResizeHandler(camera, renderer, () => backdrop.resize());

const group = new Group();
scene.add(group);
const peach = new Peach(group);
let yaw = VIEWS[state.view] ?? 0;
let zoom = 1;

const valuesBox = document.getElementById("lab-values");

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be blocked; the lab then forgets on reload.
  }
}

function describe() {
  const { rest, press, bulge, width } = state;
  return `FABRIC = { rest: ${rest}, press: ${press}, bulge: ${bulge}, width: ${width} }`;
}

function apply() {
  peach.setLingerie(true, state.pull, 1);
  peach.setFabric(state);
  document.querySelectorAll(".lab-choices").forEach((group) => {
    const key = group.dataset.group;
    group.querySelectorAll("button").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(state[key] === button.dataset.value),
      );
    });
  });
  document.querySelectorAll("input[data-key]").forEach((input) => {
    input.value = state[input.dataset.key];
    document.querySelector(
      `output[data-for="${input.dataset.key}"]`,
    ).textContent = Number(state[input.dataset.key]).toFixed(2);
  });
  valuesBox.textContent = describe();
  save();
}

document.querySelectorAll(".lab-choices").forEach((choices) => {
  choices.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;
    state[choices.dataset.group] = button.dataset.value;
    if (
      choices.dataset.group === "view" &&
      VIEWS[button.dataset.value] !== undefined
    )
      yaw = VIEWS[button.dataset.value];
    apply();
  });
});

document.querySelectorAll("input[data-key]").forEach((input) => {
  input.addEventListener("input", () => {
    state[input.dataset.key] = Number(input.value);
    apply();
  });
});

document.getElementById("lab-copy").addEventListener("click", () => {
  navigator.clipboard?.writeText(describe());
});
document.getElementById("lab-reset").addEventListener("click", () => {
  Object.assign(state, DEFAULTS);
  yaw = VIEWS.back;
  apply();
});

let dragging = null;
renderer.domElement.addEventListener("pointerdown", (e) => {
  dragging = { x: e.clientX, yaw };
  renderer.domElement.setPointerCapture(e.pointerId);
});
renderer.domElement.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  yaw = dragging.yaw + (e.clientX - dragging.x) * 0.01;
  if (state.view === "spin") {
    state.view = "back";
    apply();
  }
});
renderer.domElement.addEventListener("pointerup", () => {
  dragging = null;
});
renderer.domElement.addEventListener(
  "wheel",
  (e) => {
    zoom = Math.min(2.4, Math.max(0.8, zoom - e.deltaY * 0.001));
  },
  { passive: true },
);

peach.load(() => {}).then(() => apply());

const clock = new Clock();
renderer.setAnimationLoop(() => {
  const delta = Math.min(clock.getDelta(), 1 / 20);
  if (state.view === "spin") yaw += delta * 0.6;
  group.rotation.y = yaw;
  camera.position.z = camera.userData.baseZ / zoom;
  camera.lookAt(0, 0, 0);
  peach.update(delta, 0);
  backdrop.update(delta, 0);
  peach.updateRing(camera);
  renderer.render(scene, camera);
});
