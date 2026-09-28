import {
  Group,
  Clock,
  Vector3,
  Mesh,
  CylinderGeometry,
  MeshPhysicalMaterial,
  Color,
} from "three";
import { initScene, setupResizeHandler } from "./scene";
import { createBackdrop } from "./backdrop";
import { Peach } from "./peach";
import { BottleModel, BOTTLE_STYLES } from "./bottle3d";

const { scene, camera, renderer } = initScene();
const backdrop = createBackdrop(scene);
setupResizeHandler(camera, renderer, () => backdrop.resize());
backdrop.resize();

const group = new Group();
scene.add(group);
const peach = new Peach(group);
peach.load(() => {});

const params = new URLSearchParams(window.location.search);
let pose = params.get("pose") || "shelf";
const bottles = Object.keys(BOTTLE_STYLES).map((style, i) => {
  const model = new BottleModel(style);
  model.group.scale.setScalar(1.25);
  model.home = new Vector3(-2.2 + i * 1.3, -1.35, 2.2);
  model.pour = new Vector3(-1.5 + i * 1.1, 1.5, 2.2);
  model.group.position.copy(model.home);
  model.tilt = 0;
  model.slosh = 0;
  model.sloshVelocity = 0;
  scene.add(model.group);
  const stream = new Mesh(
    new CylinderGeometry(0.018, 0.012, 1, 12),
    new MeshPhysicalMaterial({
      color: new Color(0xf6bf5c),
      emissive: new Color(0x7a3010),
      emissiveIntensity: 0.6,
      roughness: 0.15,
      clearcoat: 1,
    }),
  );
  stream.visible = false;
  scene.add(stream);
  model.stream = stream;
  return model;
});

function setPose(value) {
  pose = value;
  document.querySelectorAll("[data-group='pose'] button").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.value === pose));
  });
}
document.querySelectorAll("[data-group='pose'] button").forEach((b) => {
  b.addEventListener("click", () => setPose(b.dataset.value));
});
setPose(pose);

const spout = new Vector3();
const clock = new Clock();
renderer.setAnimationLoop(() => {
  const delta = Math.max(1 / 240, Math.min(clock.getDelta(), 1 / 20));
  const t = clock.elapsedTime;
  bottles.forEach((b, i) => {
    const pouring = pose === "pour";
    const target = pouring ? (-118 * Math.PI) / 180 : 0;
    const before = b.tilt;
    b.tilt += (target - b.tilt) * (1 - Math.exp(-delta * 5));
    b.sloshVelocity +=
      (-b.slosh * 60 -
        b.sloshVelocity * 4 -
        ((b.tilt - before) / delta) * 0.4) *
      delta;
    b.slosh += b.sloshVelocity * delta;
    b.group.position.lerpVectors(
      b.home,
      b.pour,
      Math.min(1, b.tilt / target || 0),
    );
    b.group.rotation.set(0, Math.sin(t * 0.5 + i) * 0.6, b.tilt);
    b.stopper.visible = !pouring || b.tilt / target < 0.3;
    b.updateLiquid(b.slosh);
    const flowing = pouring && b.tilt / target > 0.85;
    b.stream.visible = flowing;
    if (flowing) {
      b.spoutWorld(spout);
      const end = new Vector3(spout.x, 0.2, 1.2);
      b.stream.position.lerpVectors(spout, end, 0.5);
      b.stream.scale.set(1, spout.distanceTo(end), 1);
      b.stream.lookAt(end);
      b.stream.rotateX(Math.PI / 2);
    }
  });
  peach.update(delta, 0);
  backdrop.update(delta, 0);
  renderer.render(scene, camera);
});
