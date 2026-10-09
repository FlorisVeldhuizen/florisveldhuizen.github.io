import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  Plane,
  Raycaster,
  Vector2,
  Vector3,
} from "three";
import { clamp, viewHeight, viewWidth } from "./util";

const MAX_POINTS = 400;
const SIDES = 6;
const VIEW = new Vector3(0, 0, 1);

export default class OilShadow {
  constructor(scene, camera) {
    this.camera = camera;
    this.positions = new BufferAttribute(
      new Float32Array(MAX_POINTS * SIDES * 3),
      3,
    );
    this.index = new BufferAttribute(
      new Uint16Array((MAX_POINTS - 1) * SIDES * 6),
      1,
    );
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", this.positions);
    geometry.setIndex(this.index);
    geometry.setDrawRange(0, 0);
    this.mesh = new Mesh(
      geometry,
      // Drawn only into the shadow map; the SVG stream is what the viewer sees.
      new MeshBasicMaterial({
        colorWrite: false,
        depthWrite: false,
        side: DoubleSide,
      }),
    );
    this.mesh.castShadow = true;
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
    this.top = { y: 0, z: 0 };
    this.bottom = { y: 1, z: 0 };
    this.plane = new Plane(new Vector3(0, 0, 1), 0);
    this.raycaster = new Raycaster();
    this.ndc = new Vector2();
    this.centers = Array.from({ length: MAX_POINTS }, () => new Vector3());
    this.radii = new Float32Array(MAX_POINTS);
    this.tangent = new Vector3();
    this.across = new Vector3();
    this.depth = new Vector3();
    this.corner = new Vector3();
  }

  anchor(spoutY, spoutZ, landY, landZ) {
    Object.assign(this.top, { y: spoutY, z: spoutZ });
    Object.assign(this.bottom, { y: landY, z: landZ });
  }

  toWorld(x, y, target) {
    const { top, bottom } = this;
    const span = bottom.y - top.y || 1;
    const z = top.z + (bottom.z - top.z) * clamp((y - top.y) / span, 0, 1);
    this.plane.constant = -z;
    this.ndc.set((x / viewWidth()) * 2 - 1, -(y / viewHeight()) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    return this.raycaster.ray.intersectPlane(this.plane, target);
  }

  update(stream) {
    const { camera, centers, radii } = this;
    const perPx = (2 * Math.tan((camera.fov * Math.PI) / 360)) / viewHeight();
    const pos = this.positions.array;
    const index = this.index.array;
    let points = 0;
    let indices = 0;
    stream.eachStreak((line) => {
      if (points + line.length > MAX_POINTS) return;
      const first = points;
      line.forEach(([x, y, r]) => {
        if (!this.toWorld(x, y, centers[points])) return;
        radii[points] = r * perPx * (camera.position.z - centers[points].z);
        points += 1;
      });
      for (let i = first; i < points; i += 1) {
        const a = centers[Math.max(first, i - 1)];
        const b = centers[Math.min(points - 1, i + 1)];
        this.tangent.subVectors(b, a).normalize();
        this.across.crossVectors(this.tangent, VIEW).normalize();
        this.depth.crossVectors(this.tangent, this.across);
        for (let s = 0; s < SIDES; s += 1) {
          const angle = (s / SIDES) * Math.PI * 2;
          this.corner
            .copy(centers[i])
            .addScaledVector(this.across, Math.cos(angle) * radii[i])
            .addScaledVector(this.depth, Math.sin(angle) * radii[i])
            .toArray(pos, (i * SIDES + s) * 3);
        }
        for (let s = 0; s < SIDES && i > first; s += 1) {
          const a0 = (i - 1) * SIDES + s;
          const a1 = (i - 1) * SIDES + ((s + 1) % SIDES);
          const b0 = i * SIDES + s;
          const b1 = i * SIDES + ((s + 1) % SIDES);
          index.set([a0, b0, a1, a1, b0, b1], indices);
          indices += 6;
        }
      }
    });
    this.mesh.geometry.setDrawRange(0, indices);
    if (indices === 0) return;
    this.positions.needsUpdate = true;
    this.index.needsUpdate = true;
  }
}
