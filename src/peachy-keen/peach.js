/* eslint-disable no-plusplus, no-continue, no-param-reassign, no-restricted-syntax */
import {
  SphereGeometry,
  MeshStandardMaterial,
  Mesh,
  BoxGeometry,
  CanvasTexture,
  RepeatWrapping,
  Vector3,
  Vector2,
  Box3,
  Color,
  BufferAttribute,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { PEACH_CONFIG, INTERACTION_CONFIG } from "./config";
import peachyModel from "./assets/peachy.glb";

// Oil effect state
let peachMeshes = [];
let isOiled = false;
const originalMaterialProperties = new Map();

/**
 * Setup vertex colors for impact marks
 * @param {THREE.Mesh} mesh - The mesh to setup
 */
function setupImpactMarkColors(mesh) {
  if (!mesh || !mesh.geometry) return;

  const { geometry } = mesh;
  const { count } = geometry.attributes.position;

  // Add vertex color attribute if it doesn't exist
  if (!geometry.attributes.color) {
    const colors = new Float32Array(count * 3);
    // Initialize to white (no tint)
    for (let i = 0; i < count; i++) {
      colors[i * 3] = 1.0; // R
      colors[i * 3 + 1] = 1.0; // G
      colors[i * 3 + 2] = 1.0; // B
    }
    geometry.setAttribute("color", new BufferAttribute(colors, 3));
  }

  // Enable vertex colors on material
  if (mesh.material) {
    mesh.material.vertexColors = true;
    mesh.material.needsUpdate = true;
  }
}

/**
 * Generate a procedural normal map for smooth peach skin texture
 * @returns {THREE.CanvasTexture} Generated normal map texture
 */
function generatePeachNormalMap() {
  const size = PEACH_CONFIG.NORMAL_MAP_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Create image data
  const imageData = ctx.createImageData(size, size);
  const { data } = imageData;

  // Noise function for peach fuzz texture
  const noise = (x, y) => {
    const random = (n) => {
      const val = Math.sin(n) * 43758.5453123;
      return val - Math.floor(val);
    };
    return random(x * 12.9898 + y * 78.233);
  };

  // Multi-octave noise for detail (Fractal Brownian Motion)
  const fbm = (x, y) => {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;

    for (let i = 0; i < PEACH_CONFIG.NORMAL_MAP_OCTAVES; i++) {
      value += amplitude * noise(x * frequency, y * frequency);
      amplitude *= 0.5;
      frequency *= 2;
    }
    return value;
  };

  // Generate normal map data
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Sample neighboring pixels for height
      const h0 = fbm(x / size, y / size) * PEACH_CONFIG.NORMAL_MAP_HEIGHT_SCALE;
      const h1 =
        fbm((x + 1) / size, y / size) * PEACH_CONFIG.NORMAL_MAP_HEIGHT_SCALE;
      const h2 =
        fbm(x / size, (y + 1) / size) * PEACH_CONFIG.NORMAL_MAP_HEIGHT_SCALE;

      // Calculate normal from height differences
      const dx = h1 - h0;
      const dy = h2 - h0;

      // Normal vector (z is always positive for a bump)
      const nx = -dx;
      const ny = -dy;
      const nz = 1.0;

      // Normalize
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

      // Convert to 0-255 range (normal maps store normals as RGB)
      data[idx] = ((nx / len) * 0.5 + 0.5) * 255; // R
      data[idx + 1] = ((ny / len) * 0.5 + 0.5) * 255; // G
      data[idx + 2] = ((nz / len) * 0.5 + 0.5) * 255; // B
      data[idx + 3] = 255; // A
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Create texture from canvas
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.needsUpdate = true;

  return texture;
}

/**
 * Create a procedural peach as fallback when GLTF model fails to load
 * @returns {Object} Object containing meshes array and leaf mesh
 */
function createProceduralPeach() {
  // Peach body (sphere with deformations)
  const peachGeometry = new SphereGeometry(1.5, 64, 64);
  const peachPositions = peachGeometry.attributes.position;

  // Add peach features: dimple at top and vertical seam creating two round halves
  for (let i = 0; i < peachPositions.count; i++) {
    let x = peachPositions.getX(i);
    let y = peachPositions.getY(i);
    let z = peachPositions.getZ(i);

    // Create dimple effect at the top
    if (y > 0.7) {
      const factor = (y - 0.7) * 2.0;
      x *= 1 - factor * 0.3;
      y -= factor * 0.2;
      z *= 1 - factor * 0.3;
    }

    // Create the characteristic peach seam: tight crease with round bulbous halves
    const radius = Math.sqrt(x * x + z * z);
    const angle = Math.atan2(x, z);

    // Tight crease in the center
    const seamInfluence = Math.exp(-Math.abs(angle) * 15.0);

    // Vertical fade - strongest in middle, fades at top and bottom
    const verticalFade = Math.exp(-y * y * 2.0);

    // Create a tight crease by pulling inward sharply at center
    const creaseDepth = seamInfluence * verticalFade * 0.25;

    // Each half should bulge outward with its own rounded shape
    const absAngle = Math.abs(angle);
    const sideInfluence = Math.exp(
      -(absAngle - Math.PI / 2) * (absAngle - Math.PI / 2) * 3.0
    );
    const bulgeFactor = sideInfluence * verticalFade * 0.15;

    // Combine: crease pulls in, bulge pushes out
    const finalRadius = radius * (1.0 - creaseDepth + bulgeFactor);

    // Convert back to cartesian
    x = Math.sin(angle) * finalRadius;
    z = Math.cos(angle) * finalRadius;

    peachPositions.setXYZ(i, x, y, z);
  }

  peachGeometry.computeVertexNormals();

  const normalMap = generatePeachNormalMap();
  const peachMaterial = new MeshStandardMaterial({
    color: 0xffb347,
    roughness: 0.7,
    metalness: 0.0,
    emissive: 0xff8c42,
    emissiveIntensity: 0.1,
    normalMap,
    normalScale: new Vector2(0.5, 0.5), // Subtle effect
  });

  const peachMesh = new Mesh(peachGeometry, peachMaterial);

  // Setup impact mark vertex colors
  setupImpactMarkColors(peachMesh);

  // Add a leaf on top
  const leafGeometry = new BoxGeometry(0.15, 0.4, 0.05);
  const leafMaterial = new MeshStandardMaterial({
    color: 0x2d5016,
    roughness: 0.7,
  });

  const leaf = new Mesh(leafGeometry, leafMaterial);
  leaf.position.y = 0.9;
  leaf.rotation.x = -0.3;

  return { meshes: [peachMesh], leaf };
}

/**
 * Load the peach GLTF model, with fallback to procedural generation
 * @param {THREE.Group} peachGroup - The group to add the peach to
 * @param {Function} onMeshesLoaded - Callback function when meshes are loaded
 */
export function loadPeachModel(peachGroup, onMeshesLoaded) {
  const loader = new GLTFLoader();
  const normalMap = generatePeachNormalMap();

  loader.load(
    peachyModel,
    (gltf) => {
      const model = gltf.scene;

      // Get the bounding box to understand the model size
      const box = new Box3().setFromObject(model);
      const size = box.getSize(new Vector3());
      const center = box.getCenter(new Vector3());

      // Scale the model to target height
      const scaleFactor = PEACH_CONFIG.TARGET_MODEL_HEIGHT / size.y;
      model.scale.set(scaleFactor, scaleFactor, scaleFactor);

      // Recalculate box after scaling
      box.setFromObject(model);
      box.getCenter(center);

      // Center the model at origin
      model.position.sub(center);

      // Rotate the peach to face the camera nicely - crease towards user
      model.rotation.y = (PEACH_CONFIG.MODEL_ROTATION_DEGREES * Math.PI) / 180;

      // Store all meshes for raycasting
      const meshes = [];
      model.traverse((child) => {
        if (child.isMesh) {
          meshes.push(child);

          // Don't recompute normals - use the ones from the GLTF file
          // (The model has duplicate vertices at UV seams, so computeVertexNormals
          // would create flat shading. The original normals are smooth.)

          // Force smooth shading on the material and add normal map with peachy pink tint
          if (child.material) {
            child.material.flatShading = false;
            child.material.normalMap = normalMap;
            child.material.normalScale = new Vector2(0.5, 0.5); // Subtle effect
            // Add peachy pink tint (FFB3BA is a soft peachy pink color)
            child.material.color = new Color(0xffb3ba);
            child.material.needsUpdate = true;
          }

          // Setup impact mark vertex colors
          setupImpactMarkColors(child);
        }
      });

      peachGroup.add(model);
      peachMeshes = meshes; // Store meshes for oil effect
      onMeshesLoaded(meshes);
    },
    undefined,
    (error) => {
      // eslint-disable-next-line no-console
      console.error(
        "Could not load GLTF model, using procedural peach instead:",
        error
      );

      const { meshes, leaf } = createProceduralPeach();
      peachGroup.add(meshes[0]);
      peachGroup.add(leaf);
      peachMeshes = meshes; // Store meshes for oil effect
      onMeshesLoaded(meshes);
    }
  );
}

/**
 * Toggle the oil effect on the peach
 * @returns {boolean} Whether the peach is now oiled
 */
export function toggleOilEffect() {
  isOiled = !isOiled;

  peachMeshes.forEach((mesh) => {
    if (mesh.material) {
      if (isOiled) {
        // Store original properties if not already stored
        if (!originalMaterialProperties.has(mesh)) {
          originalMaterialProperties.set(mesh, {
            roughness: mesh.material.roughness,
            metalness: mesh.material.metalness,
            emissiveIntensity: mesh.material.emissiveIntensity,
          });
        }

        // Apply oil effect: very shiny, glossy, bright
        mesh.material.roughness = 0.1; // Very smooth and shiny
        mesh.material.metalness = 0.1; // Minimal metallic reflection to stay bright
        mesh.material.emissiveIntensity = 0.5; // Strong glow for brightness
        mesh.material.envMapIntensity = 2.0; // Enhance reflections if env map exists
      } else {
        // Restore original properties
        const original = originalMaterialProperties.get(mesh);
        if (original) {
          mesh.material.roughness = original.roughness;
          mesh.material.metalness = original.metalness;
          mesh.material.emissiveIntensity = original.emissiveIntensity;
          mesh.material.envMapIntensity = 1.0;
        }
      }

      mesh.material.needsUpdate = true;
    }
  });

  return isOiled;
}

/**
 * Check if the peach is currently oiled
 * @returns {boolean} Whether the peach is oiled
 */
export function isOiledState() {
  return isOiled;
}

/**
 * Update impact mark vertex colors based on current impact marks
 * @param {Array} impactMarks - Array of impact marks from peachState
 */
export function updateImpactMarkShaders(impactMarks) {
  if (!peachMeshes || peachMeshes.length === 0) return;

  // Update vertex colors for each mesh
  peachMeshes.forEach((mesh) => {
    if (!mesh || !mesh.geometry || !mesh.geometry.attributes.color) return;

    const { geometry } = mesh;
    const positions = geometry.attributes.position;
    const colors = geometry.attributes.color;
    const posArray = positions.array;
    const colorArray = colors.array;

    // Subtle reddish-pink tint for impact marks (more realistic skin flush)
    const redTint = new Color(0xff8888); // Soft pinkish-red, not harsh red

    // Temp vectors for calculations
    const vertexPos = new Vector3();

    // Update each vertex color based on proximity to impact marks
    for (let i = 0; i < positions.count; i++) {
      const i3 = i * 3;

      // Get vertex local position (this is in the original, undeformed mesh space)
      vertexPos.set(posArray[i3], posArray[i3 + 1], posArray[i3 + 2]);

      // Start with white (no tint - lets material color through naturally)
      let impactEffect = 0.0;

      // Check all impact marks
      if (impactMarks && impactMarks.length > 0) {
        for (const mark of impactMarks) {
          // Find the local position for this specific mesh
          if (!mark.localPositions) continue;

          const meshData = mark.localPositions.find((m) => m.mesh === mesh);
          if (!meshData) continue;

          // Distance from impact point (both in local mesh space)
          const dist = vertexPos.distanceTo(meshData.position);

          // Mark size from config
          const radius =
            INTERACTION_CONFIG.IMPACT_MARK_RADIUS * (mark.intensity || 1.0);
          let distFade = 1.0 - dist / radius;
          distFade = Math.max(0, Math.min(1, distFade)); // Clamp 0-1
          // Cubic falloff for even softer, more natural edge
          distFade *= distFade * distFade;

          // Gradual fade over time with smooth easing
          let timeFade = 1.0 - mark.age / mark.maxAge;
          timeFade = Math.max(0, Math.min(1, timeFade));
          // Ease out for natural fade
          timeFade = 1.0 - (1.0 - timeFade) ** 2;

          // Combine fades with strength from config
          const markStrength =
            distFade *
            timeFade *
            (mark.intensity || 1.0) *
            INTERACTION_CONFIG.IMPACT_MARK_STRENGTH;
          impactEffect = Math.max(impactEffect, markStrength);
        }
      }

      // Mix white with subtle red tint based on impact effect
      // White (1,1,1) = no tint, Soft red = subtle flush
      const finalColor = new Color(1, 1, 1).lerp(redTint, impactEffect);

      // Set vertex color (this multiplies with material color)
      colorArray[i3] = finalColor.r;
      colorArray[i3 + 1] = finalColor.g;
      colorArray[i3 + 2] = finalColor.b;
    }

    // Mark colors as needing update
    colors.needsUpdate = true;
  });
}
