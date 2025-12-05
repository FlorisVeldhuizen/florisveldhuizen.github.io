import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  PCFSoftShadowMap,
  ACESFilmicToneMapping,
} from "three";

/**
 * Initialize the Three.js scene, camera, and renderer
 * @returns {Object} Object containing scene, camera, and renderer
 */
export function initScene() {
  const scene = new Scene();

  // No solid background color needed - we use shader materials for the background
  scene.background = null;

  const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  camera.position.z = 5;

  // Enable shadows and tone mapping for dramatic contrast
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;

  return { scene, camera, renderer };
}

/**
 * Setup window resize handler to keep canvas responsive
 * @param {THREE.Camera} camera - The camera
 * @param {THREE.Renderer} renderer - The renderer
 * @param {THREE.ShaderMaterial} animatedBackgroundMaterial - The animated background shader material
 * @param {THREE.ShaderMaterial} gradientBackgroundMaterial - The gradient background shader material
 */
export function setupResizeHandler(
  camera,
  renderer,
  animatedBackgroundMaterial,
  gradientBackgroundMaterial
) {
  if (
    !camera ||
    !renderer ||
    !animatedBackgroundMaterial ||
    !gradientBackgroundMaterial
  ) {
    // eslint-disable-next-line no-console
    console.error("setupResizeHandler: Missing required parameters");
    return;
  }

  window.addEventListener("resize", () => {
    const newCamera = camera;
    newCamera.aspect = window.innerWidth / window.innerHeight;
    newCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    animatedBackgroundMaterial.uniforms.resolution.value.set(
      window.innerWidth,
      window.innerHeight
    );
    gradientBackgroundMaterial.uniforms.resolution.value.set(
      window.innerWidth,
      window.innerHeight
    );
  });
}
