import { Color, LinearSRGBColorSpace, Quaternion, Vector3 } from "three";
import { ease } from "./util";

const FADE_RATE = 9;
const STYLE_RATE = 14;

export const MARKERS = {
  hand: { color: 0xffa877, shape: 0, radius: 17, width: 1.5, fill: 0 },
  lips: { color: 0xe8505f, shape: 1, radius: 17, width: 1.5, fill: 0 },
  buzz: { color: 0xff5fa8, shape: 2, radius: 17, width: 2, fill: 0 },
  oil: { color: 0xf6b35c, shape: 0, radius: 17, width: 1.5, fill: 0 },
  grab: { color: 0xffa877, shape: 0, radius: 14, width: 3, fill: 0.3 },
};

export function surfaceNormal(hit, target) {
  return target
    .copy(hit.face.normal)
    .transformDirection(hit.object.matrixWorld);
}

export default class SurfaceMarker {
  constructor(peach, camera) {
    this.peach = peach;
    this.camera = camera;
    this.shown = 0;
    this.point = new Vector3();
    this.normal = new Vector3(0, 0, 1);
    this.hitSpot = { local: new Vector3(), normal: new Vector3() };
    this.up = new Vector3();
    this.world = new Vector3();
    this.turn = new Quaternion();
    this.color = new Color();
    this.wantedColor = new Color();
    this.style = { radius: 17, width: 1.5, fill: 0 };
  }

  fromHit(hit) {
    this.peach.toLocal(hit.point, this.hitSpot.local);
    this.hitSpot.normal.copy(hit.face.normal);
    return this.hitSpot;
  }

  pixelsToWorld(pixels) {
    this.world.copy(this.point).applyMatrix4(this.peach.mesh.matrixWorld);
    const distance = this.camera.position.distanceTo(this.world);
    const halfFov = (this.camera.fov * Math.PI) / 360;
    return (pixels * 2 * distance * Math.tan(halfFov)) / window.innerHeight;
  }

  update(spot, marker, delta, shrink = 0) {
    const { uniforms } = this.peach;
    const fresh = this.shown < 0.05;
    if (spot) {
      this.wantedColor.setHex(marker.color, LinearSRGBColorSpace);
      if (fresh) {
        this.point.copy(spot.local);
        this.normal.copy(spot.normal);
        this.color.copy(this.wantedColor);
        Object.assign(this.style, marker);
      } else {
        this.point.lerp(spot.local, ease(30, delta));
        this.normal.lerp(spot.normal, ease(16, delta)).normalize();
        const k = ease(STYLE_RATE, delta);
        this.color.lerp(this.wantedColor, k);
        ["radius", "width", "fill"].forEach((key) => {
          this.style[key] += (marker[key] - this.style[key]) * k;
        });
      }
      uniforms.uMarkerShape.value = marker.shape;
    }
    this.shown += ((spot ? 1 : 0) - this.shown) * ease(FADE_RATE, delta);
    const shown = this.shown > 0.01 ? this.shown : 0;
    uniforms.uMarkerShown.value = shown;
    if (!shown) return;
    uniforms.uMarkerColor.value.copy(this.color);
    uniforms.uMarkerStyle.value.set(this.style.width / 2, this.style.fill);
    const radius =
      this.pixelsToWorld(this.style.radius * (1 - shrink)) /
      this.peach.worldScale();
    uniforms.uMarker.value.set(
      this.point.x,
      this.point.y,
      this.point.z,
      radius,
    );
    this.peach.mesh.getWorldQuaternion(this.turn).invert();
    this.up
      .set(0, 1, 0)
      .applyQuaternion(this.camera.quaternion)
      .applyQuaternion(this.turn);
    const x = uniforms.uMarkerAxisX.value.crossVectors(this.up, this.normal);
    if (x.lengthSq() < 1e-6) x.set(1, 0, 0);
    x.normalize();
    uniforms.uMarkerAxisY.value.crossVectors(this.normal, x);
  }
}
