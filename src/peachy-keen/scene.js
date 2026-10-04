import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  ACESFilmicToneMapping,
  PMREMGenerator,
  HemisphereLight,
  PointLight,
  DirectionalLight,
  PCFSoftShadowMap,
  Mesh,
  SphereGeometry,
  MeshBasicMaterial,
  Color,
  BackSide,
} from "three";
import { viewHeight } from "./util";

const FRAME_HEIGHT = 6.4;
const FRAME_WIDTH = 5.2;

export const RING = {
  COLOR: 0xffd9a8,
  RADIUS: 3.5,
  Z: 6,
  POINTS: 24,
};

function fitCamera(camera) {
  const aspect = window.innerWidth / viewHeight();
  const halfFov = (camera.fov * Math.PI) / 360;
  const needHeight = Math.max(FRAME_HEIGHT, FRAME_WIDTH / aspect);
  camera.aspect = aspect;
  camera.userData.baseZ = needHeight / 2 / Math.tan(halfFov);
  camera.position.z = camera.userData.baseZ;
  camera.updateProjectionMatrix();
}

function createRingLightEnvironment() {
  const env = new Scene();
  env.add(
    new Mesh(
      new SphereGeometry(20, 32, 16),
      new MeshBasicMaterial({
        color: new Color(0.03, 0.02, 0.03),
        side: BackSide,
      }),
    ),
  );
  const key = new Mesh(
    new SphereGeometry(11, 32, 16),
    new MeshBasicMaterial({ color: new Color(0xffd8c8).multiplyScalar(1.4) }),
  );
  key.position.set(-15, 12, 1);
  env.add(key);
  const glow = new Mesh(
    new SphereGeometry(6, 32, 16),
    new MeshBasicMaterial({ color: new Color(0xc070ff).multiplyScalar(0.35) }),
  );
  glow.position.set(8, -8, 8);
  env.add(glow);
  const front = new Mesh(
    new SphereGeometry(8, 32, 16),
    new MeshBasicMaterial({ color: new Color(0xffe0d4).multiplyScalar(0.9) }),
  );
  front.position.set(2, 3, 16);
  env.add(front);
  return env;
}

export function initScene() {
  const scene = new Scene();
  const camera = new PerspectiveCamera(34, 1, 0.1, 100);
  fitCamera(camera);

  const renderer = new WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, viewHeight());
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;
  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.domElement.id = "stage";
  document.body.prepend(renderer.domElement);

  const pmrem = new PMREMGenerator(renderer);
  const env = createRingLightEnvironment();
  scene.environment = pmrem.fromScene(env, 0).texture;
  pmrem.dispose();
  env.traverse((o) => {
    o.geometry?.dispose();
    o.material?.dispose();
  });

  const hemi = new HemisphereLight(0xffe4ea, 0x7a3060, 0.95);
  scene.add(hemi);

  const key = new DirectionalLight(0xffd6b8, 1.1);
  key.position.set(4, 4.5, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, {
    left: -3.5,
    right: 3.5,
    top: 3.5,
    bottom: -3.5,
    near: 1,
    far: 18,
  });
  key.shadow.normalBias = 0.02;
  scene.add(key);

  const rose = new PointLight(0xff4f9a, 80, 30);
  rose.position.set(-4, 2.5, -3.5);
  scene.add(rose);

  const peachRim = new PointLight(0xffb070, 70, 30);
  peachRim.position.set(4, -1, -3);
  scene.add(peachRim);

  return { scene, camera, renderer, lights: { hemi, key, rose, peachRim } };
}

export function setupResizeHandler(camera, renderer, onResize) {
  let pending = false;
  window.addEventListener("resize", () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      fitCamera(camera);
      renderer.setSize(window.innerWidth, viewHeight());
      onResize?.();
    });
  });
}

export class QualityGovernor {
  constructor(renderer) {
    this.renderer = renderer;
    this.mode = "auto";
    this.max = Math.min(window.devicePixelRatio, 2);
    this.ratio = this.max;
    this.windowTime = 0;
    this.windowFrames = 0;
    this.goodWindows = 0;
    this.badWindows = 0;
    this.fps = 60;
    this.refresh = 60;
  }

  setMode(mode) {
    this.mode = mode;
    this.apply(mode === "fast" ? 1 : this.max);
  }

  apply(ratio) {
    if (ratio === this.ratio) return;
    this.ratio = ratio;
    this.renderer.setPixelRatio(ratio);
  }

  update(delta) {
    this.windowTime += delta;
    this.windowFrames += 1;
    if (this.windowTime < 1) return;

    this.fps = this.windowFrames / this.windowTime;
    this.windowTime = 0;
    this.windowFrames = 0;
    if (this.mode !== "auto") return;

    this.refresh = Math.max(this.refresh, this.fps);
    this.badWindows = this.fps < this.refresh * 0.85 ? this.badWindows + 1 : 0;
    if (this.badWindows >= 2 && this.ratio > 1) {
      this.badWindows = 0;
      this.goodWindows = -30;
      // Pixel cost grows with the square of the ratio, so jump straight to a ratio that should fit.
      const fit = this.ratio * Math.sqrt(this.fps / this.refresh);
      this.apply(
        Math.max(1, Math.min(this.ratio - 0.25, Math.floor(fit * 4) / 4)),
      );
    } else if (this.fps > this.refresh * 0.95) {
      this.goodWindows += 1;
      if (this.goodWindows >= 10 && this.ratio < this.max) {
        this.goodWindows = 0;
        this.apply(Math.min(this.max, this.ratio + 0.25));
      }
    }
  }
}
