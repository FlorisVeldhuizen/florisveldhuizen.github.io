import {
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  TextureLoader,
  Vector3,
} from "three";

const RISE_SECONDS = 1.2;
const FADE_SECONDS = 2.4;
const STRENGTH = 0.5;
// The halo images are the intro still with a quarter of padding on each side.
const PAD = 1.5;
// The textures store their alpha raised by these gains so the faint glow keeps its gradation.
const LAYERS = [
  { url: "/peachy-keen/intro-glow-inner.webp", gain: 2.5, spread: 0 },
  { url: "/peachy-keen/intro-glow-outer.webp", gain: 5, spread: 0.08 },
];
const ease = (x) => x * x * x * (x * (x * 6 - 15) + 10);

// Sits in the scene, not the page, so the peach covers it.
export default class IntroGlow {
  constructor(scene, camera, viewHeight) {
    this.camera = camera;
    this.viewHeight = viewHeight;
    this.layers = LAYERS.map((layer) => {
      const mesh = new Mesh(
        new PlaneGeometry(1, 1),
        new MeshBasicMaterial({
          transparent: true,
          depthWrite: false,
          toneMapped: false,
          opacity: 0,
        }),
      );
      mesh.visible = false;
      scene.add(mesh);
      return { ...layer, mesh };
    });
    this.anchor = null;
    this.ray = new Vector3();
    this.forward = new Vector3();
    this.at = new Vector3();
  }

  load() {
    const loader = new TextureLoader();
    this.layers.forEach(({ url, mesh }) =>
      loader.load(url, (texture) => {
        // eslint-disable-next-line no-param-reassign
        texture.colorSpace = SRGBColorSpace;
        Object.assign(mesh.material, { map: texture, needsUpdate: true });
      }),
    );
  }

  // Ties the halo to the still's place on screen, measured against the peach, so it keeps lining up as the peach moves.
  place(rect, group, behind) {
    group.getWorldPosition(this.at);
    const peach = this.at.clone().project(this.camera);
    const height = this.viewHeight();
    const width = height * this.camera.aspect;
    this.anchor = {
      dx: rect.left + rect.width / 2 - ((peach.x + 1) / 2) * width,
      dy: rect.top + rect.height / 2 - ((1 - peach.y) / 2) * height,
      side: rect.width * PAD,
      scale: group.scale.y,
      behind,
    };
  }

  update(seconds, group) {
    const shown =
      this.anchor && seconds >= 0 && seconds < RISE_SECONDS + FADE_SECONDS;
    this.layers.forEach(({ mesh }) => {
      // eslint-disable-next-line no-param-reassign
      mesh.visible = !!shown;
    });
    if (!shown) return;
    const level =
      seconds < RISE_SECONDS
        ? ease(seconds / RISE_SECONDS)
        : ease(1 - (seconds - RISE_SECONDS) / FADE_SECONDS);
    const spread = seconds < RISE_SECONDS ? 0 : 1 - level;
    const { camera } = this;
    const height = this.viewHeight();
    const width = height * camera.aspect;
    group.getWorldPosition(this.at);
    const peach = this.at.clone().project(camera);
    const sx = ((peach.x + 1) / 2) * width + this.anchor.dx;
    const sy = ((1 - peach.y) / 2) * height + this.anchor.dy;
    camera.getWorldDirection(this.forward);
    const depth =
      this.at.sub(camera.position).dot(this.forward) + this.anchor.behind;
    this.ray
      .set((sx / width) * 2 - 1, 1 - (sy / height) * 2, 0.5)
      .unproject(camera)
      .sub(camera.position)
      .normalize();
    const point = this.ray
      .multiplyScalar(depth / this.ray.dot(this.forward))
      .add(camera.position);
    const unitsPerPixel =
      (2 * depth * Math.tan((camera.fov * Math.PI) / 360)) / height;
    const follow = group.scale.y / this.anchor.scale;
    this.layers.forEach(({ mesh, gain, spread: grow }) => {
      mesh.position.copy(point);
      mesh.quaternion.copy(camera.quaternion);
      mesh.scale.setScalar(
        this.anchor.side * unitsPerPixel * follow * (1 + grow * spread),
      );
      // eslint-disable-next-line no-param-reassign
      mesh.material.opacity =
        (STRENGTH * level * (1 - (grow ? 0.5 * spread : 0))) / gain;
    });
  }
}
