import {
  AmbientLight,
  TorusGeometry,
  MeshStandardMaterial,
  Mesh,
  PointLight,
  DirectionalLight,
} from "three";
import { LIGHTING_CONFIG } from "./config.js";

/**
 * Setup atmospheric lighting with influencer-style ring light
 * @param {THREE.Scene} scene - The scene to add lights to
 * @returns {Object} Object containing references to all lights and mode control
 */
export function setupLighting(scene) {
  if (!scene) {
    console.error("setupLighting: No scene provided");
    return {
      ringLights: [],
      otherLights: [],
      normalModeLights: [],
      oiledModeLights: [],
      setOiledMode: () => {},
    };
  }

  const ringLights = [];
  const normalModeLights = []; // Lights for normal mode (subset)
  const oiledModeLights = []; // Lights for oiled mode (full set)
  const otherLights = [];

  // Reduced ambient base for stronger shadows
  const ambientLight = new AmbientLight(
    LIGHTING_CONFIG.AMBIENT_COLOR,
    LIGHTING_CONFIG.AMBIENT_INTENSITY
  );
  scene.add(ambientLight);
  otherLights.push(ambientLight);

  // Create the physical ring light (like influencer/beauty ring lights)
  const ringLightGeometry = new TorusGeometry(
    LIGHTING_CONFIG.RING_RADIUS,
    LIGHTING_CONFIG.RING_TUBE_RADIUS,
    LIGHTING_CONFIG.RING_RADIAL_SEGMENTS,
    LIGHTING_CONFIG.RING_TUBULAR_SEGMENTS
  );
  const ringLightMaterial = new MeshStandardMaterial({
    color: LIGHTING_CONFIG.RING_COLOR,
    emissive: LIGHTING_CONFIG.RING_COLOR,
    emissiveIntensity: LIGHTING_CONFIG.RING_EMISSIVE_INTENSITY,
    toneMapped: false, // Make it super bright
  });
  const ringLightMesh = new Mesh(ringLightGeometry, ringLightMaterial);

  // Position it in front of the peach, facing it
  ringLightMesh.position.set(0, 0, LIGHTING_CONFIG.RING_POSITION_Z);
  ringLightMesh.rotation.x = 0; // Face the camera/peach
  scene.add(ringLightMesh);
  ringLights.push(ringLightMesh);

  // Add point lights around the ring to actually illuminate the scene
  // Create all lights, but split into normal and oiled mode groups
  const numLights = LIGHTING_CONFIG.OILED_MODE_LIGHTS;
  for (let i = 0; i < numLights; i++) {
    const angle = (i / numLights) * Math.PI * 2;
    const x = Math.cos(angle) * LIGHTING_CONFIG.RING_RADIUS;
    const y = Math.sin(angle) * LIGHTING_CONFIG.RING_RADIUS;

    // In oiled mode, all lights are at full intensity
    // In normal mode, fewer lights but slightly brighter to compensate
    const light = new PointLight(
      LIGHTING_CONFIG.RING_COLOR,
      LIGHTING_CONFIG.RING_LIGHT_INTENSITY_OILED,
      LIGHTING_CONFIG.RING_LIGHT_DISTANCE
    );
    light.position.set(x, y, LIGHTING_CONFIG.RING_POSITION_Z);
    scene.add(light);
    ringLights.push(light);
    oiledModeLights.push(light);

    // Only some lights are used in normal mode (evenly distributed)
    if (i % (numLights / LIGHTING_CONFIG.NORMAL_MODE_LIGHTS) === 0) {
      normalModeLights.push(light);
    }
  }

  // Start in normal mode (most lights disabled)
  oiledModeLights.forEach((light, idx) => {
    light.visible = normalModeLights.includes(light);
  });

  // Boost intensity of normal mode lights slightly to compensate for fewer lights
  normalModeLights.forEach((light) => {
    light.intensity = LIGHTING_CONFIG.RING_LIGHT_INTENSITY_NORMAL;
  });

  // Stronger key light from above for defined shadows
  const keyLight = new DirectionalLight(
    LIGHTING_CONFIG.KEY_LIGHT_COLOR,
    LIGHTING_CONFIG.KEY_LIGHT_INTENSITY
  );
  keyLight.position.set(
    LIGHTING_CONFIG.KEY_LIGHT_POSITION.x,
    LIGHTING_CONFIG.KEY_LIGHT_POSITION.y,
    LIGHTING_CONFIG.KEY_LIGHT_POSITION.z
  );
  scene.add(keyLight);
  otherLights.push(keyLight);

  // Rim light from behind to enhance contours
  const rimLight = new PointLight(
    LIGHTING_CONFIG.RIM_LIGHT_COLOR,
    LIGHTING_CONFIG.RIM_LIGHT_INTENSITY,
    LIGHTING_CONFIG.RIM_LIGHT_DISTANCE
  );
  rimLight.position.set(
    LIGHTING_CONFIG.RIM_LIGHT_POSITION.x,
    LIGHTING_CONFIG.RIM_LIGHT_POSITION.y,
    LIGHTING_CONFIG.RIM_LIGHT_POSITION.z
  );
  scene.add(rimLight);
  otherLights.push(rimLight);

  // Subtle fill from below
  const bottomFill = new PointLight(
    LIGHTING_CONFIG.BOTTOM_FILL_COLOR,
    LIGHTING_CONFIG.BOTTOM_FILL_INTENSITY,
    LIGHTING_CONFIG.BOTTOM_FILL_DISTANCE
  );
  bottomFill.position.set(
    LIGHTING_CONFIG.BOTTOM_FILL_POSITION.x,
    LIGHTING_CONFIG.BOTTOM_FILL_POSITION.y,
    LIGHTING_CONFIG.BOTTOM_FILL_POSITION.z
  );
  scene.add(bottomFill);
  otherLights.push(bottomFill);

  return { ringLights, otherLights, normalModeLights, oiledModeLights };
}
