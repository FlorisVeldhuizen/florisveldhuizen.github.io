import { LIGHTING_CONFIG } from "./config.js";

/**
 * Performance Monitoring and Control System
 * Tracks FPS and allows toggling of performance-heavy features
 */

export class PerformanceMonitor {
  constructor() {
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsUpdateInterval = 0.5; // Update FPS display every 0.5 seconds
    this.fpsAccumulator = 0;

    // Feature toggles
    this.features = {
      backgroundShader: true,
      ringLights: true,
      softBodyPhysics: true,
      particles: true,
      impactMarks: true,
    };

    // Performance metrics
    this.metrics = {
      avgFps: 0,
      minFps: Infinity,
      maxFps: 0,
      frameTime: 0,
    };

    // References to scene objects (set externally)
    this.backgroundMesh = null;
    this.animatedBackgroundMaterial = null;
    this.gradientBackgroundMaterial = null;
    this.ringLights = [];
    this.renderer = null;
    this.scene = null;

    // Ring light configuration
    this.ringLightCount = LIGHTING_CONFIG.NORMAL_MODE_LIGHTS; // Current light count (start in normal mode)
    this.ringLightMesh = null; // The physical torus mesh
    this.ringPointLights = []; // Just the point lights (not the mesh)
    this.isOiledMode = false; // Track current lighting mode
    this.maxLightsNormalMode = LIGHTING_CONFIG.NORMAL_MODE_LIGHTS;
    this.maxLightsOiledMode = LIGHTING_CONFIG.OILED_MODE_LIGHTS;
    this.lightingModeCallback = null; // Reference to setOiledMode function from lighting.js

    // Track light counts independently per mode
    this.normalModeLightCount = LIGHTING_CONFIG.NORMAL_MODE_LIGHTS;
    this.oiledModeLightCount = LIGHTING_CONFIG.OILED_MODE_LIGHTS;

    // Track intensities independently per mode
    this.normalModeIntensity = LIGHTING_CONFIG.RING_LIGHT_INTENSITY_NORMAL;
    this.oiledModeIntensity = LIGHTING_CONFIG.RING_LIGHT_INTENSITY_OILED;

    this.createUI();
  }

  /**
   * Create the performance monitoring UI
   */
  createUI() {
    // Create gear icon button (visible when panel is collapsed)
    const gearButton = document.createElement("button");
    gearButton.id = "perf-gear-button";
    gearButton.innerHTML = "⚙️";
    gearButton.className = "perf-gear-btn interactive-element";
    document.body.appendChild(gearButton);

    const panel = document.createElement("div");
    panel.id = "performance-panel";
    panel.style.display = "none"; // Start hidden
    panel.innerHTML = `
            <div class="perf-header">
                <h3>Performance Monitor</h3>
                <button id="perf-toggle" class="perf-collapse interactive-element">×</button>
            </div>
            <div class="perf-content">
                <div class="perf-stats">
                    <div class="stat-row">
                        <span class="stat-label">FPS:</span>
                        <span id="fps-display" class="stat-value">60</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Frame Time:</span>
                        <span id="frametime-display" class="stat-value">16.7ms</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Min FPS:</span>
                        <span id="minfps-display" class="stat-value">60</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Max FPS:</span>
                        <span id="maxfps-display" class="stat-value">60</span>
                    </div>
                </div>
                
                <div class="perf-controls">
                    <h4>Feature Toggles</h4>
                    <label class="toggle-label interactive-element">
                        <input type="checkbox" id="toggle-background" checked>
                        <span>Background Shader</span>
                    </label>
                    <label class="toggle-label interactive-element">
                        <input type="checkbox" id="toggle-lights" checked>
                        <span>Ring Lights</span>
                    </label>
                    <div class="slider-control">
                        <label class="slider-label interactive-element">
                            <span>Light Count: <span id="light-count-value">${LIGHTING_CONFIG.NORMAL_MODE_LIGHTS}</span> <span id="light-mode-indicator">(Normal Mode)</span></span>
                            <input type="range" id="light-count-slider" min="0" max="${LIGHTING_CONFIG.NORMAL_MODE_LIGHTS}" value="${LIGHTING_CONFIG.NORMAL_MODE_LIGHTS}" step="1" class="interactive-element">
                        </label>
                    </div>
                    <div class="slider-control">
                        <label class="slider-label interactive-element">
                            <span>Light Intensity: <span id="light-intensity-value">${LIGHTING_CONFIG.RING_LIGHT_INTENSITY_NORMAL.toFixed(1)}</span></span>
                            <input type="range" id="light-intensity-slider" min="0" max="15" value="${LIGHTING_CONFIG.RING_LIGHT_INTENSITY_NORMAL}" step="0.1" class="interactive-element">
                        </label>
                    </div>
                    <label class="toggle-label interactive-element">
                        <input type="checkbox" id="toggle-physics" checked>
                        <span>Soft Body Physics</span>
                    </label>
                    <label class="toggle-label interactive-element">
                        <input type="checkbox" id="toggle-particles" checked>
                        <span>Particles</span>
                    </label>
                    <label class="toggle-label interactive-element">
                        <input type="checkbox" id="toggle-impact-marks" checked>
                        <span>Impact Marks</span>
                    </label>
                </div>
                
                <div class="perf-actions">
                    <button id="reset-metrics" class="perf-button interactive-element">Reset Metrics</button>
                </div>
            </div>
        `;

    document.body.appendChild(panel);

    // Setup event listeners
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for UI controls
   */
  setupEventListeners() {
    const panel = document.getElementById("performance-panel");
    const gearButton = document.getElementById("perf-gear-button");
    const toggleBtn = document.getElementById("perf-toggle");
    const content = document.querySelector(".perf-content");

    // Gear button toggles the panel
    gearButton.addEventListener("click", () => {
      const isOpen = panel.style.display === "block";
      panel.style.display = isOpen ? "none" : "block";
      content.style.display = isOpen ? "none" : "block";
    });

    // Close button hides the panel
    toggleBtn.addEventListener("click", () => {
      panel.style.display = "none";
      content.style.display = "none";
    });

    // Feature toggles
    document
      .getElementById("toggle-background")
      .addEventListener("change", (e) => {
        this.toggleFeature("backgroundShader", e.target.checked);
      });

    document.getElementById("toggle-lights").addEventListener("change", (e) => {
      this.toggleFeature("ringLights", e.target.checked);
    });

    document
      .getElementById("toggle-physics")
      .addEventListener("change", (e) => {
        this.toggleFeature("softBodyPhysics", e.target.checked);
      });

    document
      .getElementById("toggle-particles")
      .addEventListener("change", (e) => {
        this.toggleFeature("particles", e.target.checked);
      });

    document
      .getElementById("toggle-impact-marks")
      .addEventListener("change", (e) => {
        this.toggleFeature("impactMarks", e.target.checked);
      });

    // Reset metrics button
    document.getElementById("reset-metrics").addEventListener("click", () => {
      this.resetMetrics();
    });

    // Light count slider
    document
      .getElementById("light-count-slider")
      .addEventListener("input", (e) => {
        this.adjustLightCount(parseInt(e.target.value));
      });

    // Light intensity slider
    document
      .getElementById("light-intensity-slider")
      .addEventListener("input", (e) => {
        this.adjustLightIntensity(parseFloat(e.target.value));
      });
  }

  /**
   * Toggle a performance feature on/off
   */
  toggleFeature(feature, enabled) {
    this.features[feature] = enabled;

    switch (feature) {
      case "backgroundShader":
        if (this.backgroundMesh) {
          // Switch between animated and gradient background
          if (enabled && this.animatedBackgroundMaterial) {
            this.backgroundMesh.material = this.animatedBackgroundMaterial;
          } else if (!enabled && this.gradientBackgroundMaterial) {
            this.backgroundMesh.material = this.gradientBackgroundMaterial;
          }
        }
        console.log(`Background Shader: ${enabled ? "Animated" : "Gradient"}`);
        break;

      case "ringLights":
        this.ringLights.forEach((light) => {
          light.visible = enabled;
        });

        // Enable/disable the sliders based on ring lights state
        const countSlider = document.getElementById("light-count-slider");
        const intensitySlider = document.getElementById(
          "light-intensity-slider"
        );
        if (countSlider) {
          countSlider.disabled = !enabled;
        }
        if (intensitySlider) {
          intensitySlider.disabled = !enabled;
        }

        console.log(`Ring Lights: ${enabled ? "ON" : "OFF"}`);
        break;

      case "softBodyPhysics":
        // This will be checked in the physics update loop
        console.log(`Soft Body Physics: ${enabled ? "ON" : "OFF"}`);
        break;

      case "particles":
        // This will be checked in the particle update loop
        console.log(`Particles: ${enabled ? "ON" : "OFF"}`);
        break;

      case "impactMarks":
        // This will be checked when creating impact marks
        console.log(`Impact Marks: ${enabled ? "ON" : "OFF"}`);
        break;
    }
  }

  /**
   * Update FPS and performance metrics
   */
  update() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds

    // Calculate instantaneous FPS
    const instantFps = 1 / deltaTime;

    // Update metrics
    this.metrics.frameTime = deltaTime * 1000; // Convert to ms
    this.metrics.minFps = Math.min(this.metrics.minFps, instantFps);
    this.metrics.maxFps = Math.max(this.metrics.maxFps, instantFps);

    // Accumulate for average
    this.fpsAccumulator += deltaTime;
    this.frameCount++;

    // Update FPS display periodically
    if (this.fpsAccumulator >= this.fpsUpdateInterval) {
      this.fps = this.frameCount / this.fpsAccumulator;
      this.metrics.avgFps = this.fps;

      // Update UI
      this.updateUI();

      // Reset accumulators
      this.frameCount = 0;
      this.fpsAccumulator = 0;
    }

    this.lastTime = currentTime;
  }

  /**
   * Update the UI display with current metrics
   */
  updateUI() {
    const fpsDisplay = document.getElementById("fps-display");
    const frameTimeDisplay = document.getElementById("frametime-display");
    const minFpsDisplay = document.getElementById("minfps-display");
    const maxFpsDisplay = document.getElementById("maxfps-display");

    if (fpsDisplay) {
      // Color code FPS: green > 50, yellow > 30, red <= 30
      const fps = Math.round(this.fps);
      fpsDisplay.textContent = fps;
      fpsDisplay.className = "stat-value";
      if (fps > 50) {
        fpsDisplay.classList.add("good");
      } else if (fps > 30) {
        fpsDisplay.classList.add("warning");
      } else {
        fpsDisplay.classList.add("bad");
      }
    }

    if (frameTimeDisplay) {
      frameTimeDisplay.textContent = this.metrics.frameTime.toFixed(2) + "ms";
    }

    if (minFpsDisplay) {
      const minFps = Math.round(this.metrics.minFps);
      minFpsDisplay.textContent = minFps === Infinity ? "--" : minFps;
    }

    if (maxFpsDisplay) {
      maxFpsDisplay.textContent = Math.round(this.metrics.maxFps);
    }
  }

  /**
   * Reset performance metrics
   */
  resetMetrics() {
    this.metrics.minFps = Infinity;
    this.metrics.maxFps = 0;
    this.frameCount = 0;
    this.fpsAccumulator = 0;
    console.log("Performance metrics reset");
  }

  /**
   * Set reference to background mesh
   */
  setBackgroundMesh(mesh) {
    this.backgroundMesh = mesh;
  }

  /**
   * Set references to both background materials
   */
  setBackgroundMaterials(animatedMaterial, gradientMaterial) {
    this.animatedBackgroundMaterial = animatedMaterial;
    this.gradientBackgroundMaterial = gradientMaterial;
  }

  /**
   * Set references to ring lights
   * @param {Array} lights - Array containing mesh and point lights
   * @param {Function} modeCallback - Optional callback for switching lighting modes
   */
  setRingLights(lights, modeCallback = null) {
    this.ringLights = lights;
    this.lightingModeCallback = modeCallback;

    // Separate the mesh from the point lights
    // First element is the torus mesh, rest are point lights
    if (lights.length > 0) {
      this.ringLightMesh = lights[0]; // The torus mesh
      this.ringPointLights = lights.slice(1); // All the point lights
      this.ringLightCount = this.ringPointLights.length;
    }
  }

  /**
   * Set reference to renderer
   */
  setRenderer(renderer) {
    this.renderer = renderer;
  }

  /**
   * Set reference to scene
   */
  setScene(scene) {
    this.scene = scene;
  }

  /**
   * Adjust the number of ring lights
   * @returns {Promise} Resolves when adjustment is complete
   */
  adjustLightCount(newCount) {
    if (!this.scene) {
      console.warn("Scene not set, cannot adjust lights");
      return Promise.resolve();
    }

    // Validate against current mode's maximum
    const maxAllowed = this.isOiledMode
      ? this.maxLightsOiledMode
      : this.maxLightsNormalMode;
    if (newCount > maxAllowed) {
      console.warn(
        `⚠️ Cannot have ${newCount} lights in ${
          this.isOiledMode ? "Oiled" : "Normal"
        } mode (max: ${maxAllowed})`
      );
      newCount = maxAllowed;
    }

    // Update display
    const countDisplay = document.getElementById("light-count-value");
    if (countDisplay) {
      countDisplay.textContent = newCount;
    }

    const currentCount = this.ringPointLights.length;
    const ringRadius = LIGHTING_CONFIG.RING_RADIUS;
    const zPosition = LIGHTING_CONFIG.RING_POSITION_Z;

    // Use the current mode's intensity for new lights
    const intensity = this.isOiledMode
      ? this.oiledModeIntensity
      : this.normalModeIntensity;

    // Import PointLight dynamically and return the promise
    return import("three").then(({ PointLight }) => {
      if (newCount > currentCount) {
        // Add more lights with current mode's intensity
        for (let i = currentCount; i < newCount; i++) {
          const angle = (i / newCount) * Math.PI * 2;
          const x = Math.cos(angle) * ringRadius;
          const y = Math.sin(angle) * ringRadius;

          const light = new PointLight(
            LIGHTING_CONFIG.RING_COLOR,
            intensity,
            LIGHTING_CONFIG.RING_LIGHT_DISTANCE
          );
          light.position.set(x, y, zPosition);
          this.scene.add(light);
          this.ringPointLights.push(light);
          this.ringLights.push(light);
        }
      } else if (newCount < currentCount) {
        // Remove lights
        const lightsToRemove = currentCount - newCount;
        for (let i = 0; i < lightsToRemove; i++) {
          const light = this.ringPointLights.pop();
          if (light) {
            this.scene.remove(light);
            // Remove from ringLights array too
            const index = this.ringLights.indexOf(light);
            if (index > -1) {
              this.ringLights.splice(index, 1);
            }
          }
        }
      }

      // Redistribute remaining lights evenly around the circle
      // DON'T update intensity here - let adjustLightIntensity handle that
      for (let i = 0; i < this.ringPointLights.length; i++) {
        const angle = (i / this.ringPointLights.length) * Math.PI * 2;
        const x = Math.cos(angle) * ringRadius;
        const y = Math.sin(angle) * ringRadius;
        this.ringPointLights[i].position.set(x, y, zPosition);

        // Set visibility based on newCount AND the ringLights feature toggle
        this.ringPointLights[i].visible = i < newCount && this.features.ringLights;

        // Only set intensity for newly created lights, don't override existing
        if (i >= currentCount && i < newCount) {
          this.ringPointLights[i].intensity = intensity;
        }
      }

      // Also update the ring mesh visibility to match the feature toggle
      if (this.ringLightMesh) {
        this.ringLightMesh.visible = this.features.ringLights;
      }

      this.ringLightCount = newCount;

      // Save to the current mode's light count
      if (this.isOiledMode) {
        this.oiledModeLightCount = newCount;
      } else {
        this.normalModeLightCount = newCount;
      }
    });
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature) {
    return this.features[feature];
  }

  /**
   * Update lighting mode and adjust slider range accordingly
   * @param {boolean} isOiled - Whether oiled mode is active
   */
  setLightingMode(isOiled) {
    // Save the current mode's light count before switching
    // Use ringLightCount instead of counting visible lights, since visibility
    // can be affected by the ringLights feature toggle
    const currentCount = this.ringLightCount;
    
    // Save the light count for the current mode
    // Note: We don't save intensity here because each mode maintains its own
    // intensity setting independently
    if (this.isOiledMode) {
      // Currently in oiled mode, save oiled light count
      this.oiledModeLightCount = currentCount;
    } else {
      // Currently in normal mode, save normal light count
      this.normalModeLightCount = currentCount;
    }

    this.isOiledMode = isOiled;

    const countSlider = document.getElementById("light-count-slider");
    const intensitySlider = document.getElementById("light-intensity-slider");
    const indicator = document.getElementById("light-mode-indicator");
    const countDisplay = document.getElementById("light-count-value");
    const intensityDisplay = document.getElementById("light-intensity-value");

    if (!countSlider) return;

    // Get the target mode's saved settings
    const targetCount = isOiled
      ? this.oiledModeLightCount
      : this.normalModeLightCount;
    const targetIntensity = isOiled
      ? this.oiledModeIntensity
      : this.normalModeIntensity;
    const maxLights = isOiled
      ? this.maxLightsOiledMode
      : this.maxLightsNormalMode;

    // Update count slider UI
    countSlider.max = maxLights;
    countSlider.value = targetCount;
    if (countDisplay) {
      countDisplay.textContent = targetCount;
    }
    if (indicator) {
      indicator.textContent = isOiled ? "(Oiled Mode)" : "(Normal Mode)";
    }

    // Update intensity slider UI (use mode-specific intensity)
    if (intensitySlider) {
      intensitySlider.value = targetIntensity;
    }
    if (intensityDisplay) {
      intensityDisplay.textContent = targetIntensity.toFixed(1);
    }

    // Apply the target settings to the scene
    // Use promise chaining to ensure proper order
    this.adjustLightCount(targetCount).then(() => {
      // After count is adjusted, set the intensity (using mode-specific intensity)
      this.adjustLightIntensity(targetIntensity);
      console.log(
        `🎚️ Switched to ${
          isOiled ? "Oiled" : "Normal"
        } mode: ${targetCount}/${maxLights} lights @ ${targetIntensity.toFixed(
          1
        )} intensity`
      );
    });
  }

  /**
   * Adjust the intensity of ring lights
   * @param {number} newIntensity - New intensity value
   */
  adjustLightIntensity(newIntensity) {
    // Update display
    const intensityDisplay = document.getElementById("light-intensity-value");
    if (intensityDisplay) {
      intensityDisplay.textContent = newIntensity.toFixed(1);
    }

    // Apply intensity to all visible lights
    this.ringPointLights.forEach((light) => {
      if (light.visible) {
        light.intensity = newIntensity;
      }
    });

    // Save to the current mode's intensity (each mode maintains its own)
    if (this.isOiledMode) {
      this.oiledModeIntensity = newIntensity;
    } else {
      this.normalModeIntensity = newIntensity;
    }

    console.log(
      `💡 Light intensity: ${newIntensity.toFixed(1)} (${
        this.isOiledMode ? "Oiled" : "Normal"
      } Mode)`
    );
  }
}
