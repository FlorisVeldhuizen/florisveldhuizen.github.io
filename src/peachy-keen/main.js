import { Group, PlaneGeometry, Mesh, Clock } from "three";
import {
  createBackgroundMaterial,
  createGradientBackgroundMaterial,
} from "./shaders";
import { loadPeachModel } from "./peach";
import { setupLighting } from "./lighting";
import {
  initInteraction,
  setPeachMesh,
  updatePeachPhysics,
} from "./interaction";
import { initScene, setupResizeHandler } from "./scene";
import { resumeAudioContext } from "./audio";
import { PerformanceMonitor } from "./performance";

// Audio is now lazy-loaded on first interaction for better performance

// Loading screen management
const soundOverlay = document.getElementById("sound-overlay");
const loadingProgress = document.getElementById("loading-progress");
const loadingStatus = document.getElementById("loading-status");
const loadingItems = document.getElementById("loading-items");
const soundOverlayContent = document.getElementById("sound-overlay-content");
let loadingComplete = false;
let hasStarted = false;

function updateLoadingProgress(percent, status = "Loading...") {
  if (loadingProgress) {
    loadingProgress.style.width = `${percent}%`;
  }
  if (loadingStatus) {
    loadingStatus.textContent = status;
  }
}

function showStartButton() {
  // Hide loading items
  if (loadingItems) {
    loadingItems.style.opacity = "0";
    setTimeout(() => {
      loadingItems.style.display = "none";
      // Show click to start message
      if (soundOverlayContent) {
        soundOverlayContent.style.display = "block";
      }
    }, 300);
  }
}

function hideLoadingScreen() {
  if (soundOverlay && loadingComplete && hasStarted) {
    soundOverlay.style.opacity = "0";
    setTimeout(() => {
      soundOverlay.style.display = "none";
    }, 300);
  }
}

// Handle click anywhere on sound overlay to start
if (soundOverlay) {
  soundOverlay.addEventListener("click", async (event) => {
    if (!loadingComplete || hasStarted) return;

    // Stop event from propagating to prevent triggering peach smack
    event.stopPropagation();
    event.preventDefault();

    hasStarted = true;

    // Resume audio context (required by browsers)
    await resumeAudioContext();

    // Hide loading screen
    hideLoadingScreen();
  });
}

// Initialize scene, camera, and renderer
updateLoadingProgress(10, "Initializing...");
const { scene, camera, renderer } = initScene();

// Initialize performance monitor
const perfMonitor = new PerformanceMonitor();
perfMonitor.setRenderer(renderer);
perfMonitor.setScene(scene);

updateLoadingProgress(20, "Creating background...");

// Create both background materials
const animatedBackgroundMaterial = createBackgroundMaterial();
const gradientBackgroundMaterial = createGradientBackgroundMaterial();
const backgroundGeometry = new PlaneGeometry(2, 2);

// Start with the animated background
const background = new Mesh(backgroundGeometry, animatedBackgroundMaterial);
scene.add(background);

// Set reference for performance monitoring
perfMonitor.setBackgroundMesh(background);
perfMonitor.setBackgroundMaterials(
  animatedBackgroundMaterial,
  gradientBackgroundMaterial
);

// Create the peach group
const peachGroup = new Group();
scene.add(peachGroup);

// Setup lighting
updateLoadingProgress(40, "Setting up lights...");
const { ringLights } = setupLighting(scene);

// Set ring lights reference for performance monitoring
perfMonitor.setRingLights(ringLights);

// Load the peach model
updateLoadingProgress(50, "Loading peach model...");
loadPeachModel(peachGroup, (meshes) => {
  updateLoadingProgress(80, "Preparing physics...");
  setPeachMesh(meshes);
  updateLoadingProgress(100, "Ready!");

  // Show start button once model is loaded
  setTimeout(() => {
    loadingComplete = true;
    showStartButton();
  }, 300);
});

// Initialize interaction system
updateLoadingProgress(60, "Setting up interactions...");
initInteraction(peachGroup, camera, scene, perfMonitor);

// Setup window resize handler
updateLoadingProgress(70, "Finalizing...");
setupResizeHandler(
  camera,
  renderer,
  animatedBackgroundMaterial,
  gradientBackgroundMaterial
);

// Animation loop with clock for accurate timing
const clock = new Clock();

// Idle floating animation timer
let idleTime = 0;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Use clock for accurate delta time (capped to avoid large jumps)
  const delta = Math.min(clock.getDelta(), 0.1);
  idleTime += delta;

  // Update background shader (only if enabled)
  if (perfMonitor.isFeatureEnabled("backgroundShader")) {
    animatedBackgroundMaterial.uniforms.time.value += delta;
  }

  // Update peach physics and animation
  // Pass performance monitor to check if physics is enabled
  updatePeachPhysics(delta, idleTime, perfMonitor);

  // Update performance monitor
  perfMonitor.update();

  renderer.render(scene, camera);
}

animate();
