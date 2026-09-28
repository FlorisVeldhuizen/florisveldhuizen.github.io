import { Mesh, PlaneGeometry } from "three";
import { createBackgroundMaterial } from "./shaders";

export function createBackdrop(scene) {
  const material = createBackgroundMaterial();
  const plane = new Mesh(new PlaneGeometry(2, 2), material);
  plane.frustumCulled = false;
  plane.renderOrder = -1;
  scene.add(plane);
  let speed = 1;

  return {
    resize() {
      material.uniforms.resolution.value.set(
        window.innerWidth,
        window.innerHeight,
      );
    },
    shock() {
      material.uniforms.shock.value = 0;
    },
    update(delta, heat) {
      material.uniforms.time.value += delta * speed;
      const s = material.uniforms.shock;
      if (s.value >= 0) s.value = s.value > 2 ? -1 : s.value + delta;
      const h = material.uniforms.heat;
      h.value += (heat - h.value) * Math.min(1, delta * 2);
    },
    setMotion(enabled) {
      speed = enabled ? 1 : 0.15;
    },
  };
}
