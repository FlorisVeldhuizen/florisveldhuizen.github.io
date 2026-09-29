import {
  Camera,
  Mesh,
  PlaneGeometry,
  Scene,
  Vector2,
  WebGLRenderTarget,
} from "three";
import {
  createBackgroundMaterial,
  createBackdropBlitMaterial,
} from "./shaders";

const SMOKE_SCALE = 0.5;

export function createBackdrop(scene, renderer) {
  const quad = new PlaneGeometry(2, 2);
  const material = createBackgroundMaterial();
  const smokeScene = new Scene();
  smokeScene.add(new Mesh(quad, material));
  const smokeCamera = new Camera();
  const target = new WebGLRenderTarget(1, 1, { depthBuffer: false });
  const blit = createBackdropBlitMaterial(target.texture);
  const plane = new Mesh(quad, blit);
  plane.frustumCulled = false;
  plane.renderOrder = -1;
  scene.add(plane);
  const size = new Vector2();
  let speed = 1;

  return {
    resize() {
      material.uniforms.resolution.value.set(
        window.innerWidth,
        window.innerHeight,
      );
    },
    update(delta, heat) {
      material.uniforms.time.value += delta * speed;
      blit.uniforms.time.value = material.uniforms.time.value;
      const h = material.uniforms.heat;
      h.value += (heat - h.value) * Math.min(1, delta * 2);
    },
    render() {
      renderer.getDrawingBufferSize(size).multiplyScalar(SMOKE_SCALE).ceil();
      if (target.width !== size.x || target.height !== size.y)
        target.setSize(size.x, size.y);
      const previous = renderer.getRenderTarget();
      renderer.setRenderTarget(target);
      renderer.render(smokeScene, smokeCamera);
      renderer.setRenderTarget(previous);
    },
    setMotion(enabled) {
      speed = enabled ? 1 : 0.15;
    },
  };
}
