import { Vector3, Euler, Raycaster, Vector2 } from "three";
import { playSmackSound, playExplosionSound } from "./audio.js";
import { SoftBodyPhysics } from "./softbody.js";
import { ParticleExplosion } from "./particles.js";
import { toggleOilEffect, updateImpactMarkShaders } from "./peach.js";
import { PHYSICS_CONFIG, INTERACTION_CONFIG } from "./config.js";

// Physics and interaction state
export const peachState = {
  velocity: new Vector3(0, 0, 0),
  angularVelocity: new Vector3(0, 0, 0),
  physicsOffset: new Vector3(0, 0, 0), // Offset from default position due to physics
  physicsRotation: new Euler(0, 0, 0), // Rotation offset due to physics
  defaultPosition: new Vector3(0, 0, 0),
  defaultRotation: new Euler(0, 0, 0),
  isWobbling: false,
  softBodies: [], // Array of soft body physics instances for each mesh
  rageLevel: 0, // Builds up with each hit (0-100)
  rageDecayRate: INTERACTION_CONFIG.RAGE_DECAY_RATE,
  explosionThreshold: INTERACTION_CONFIG.RAGE_EXPLOSION_THRESHOLD,
  particleExplosion: null, // Reference to particle explosion system
  isRespawning: false, // Is the peach currently respawning?
  respawnTimer: 0, // Timer for respawn animation
  respawnDuration: INTERACTION_CONFIG.RESPAWN_DURATION,
  idleAnimationTime: 0, // Separate time counter for idle animation (always running)
  impactMarks: [], // Array of impact marks { position: Vector3, age: number, maxAge: number }
};

// Mouse tracking state
const mouseState = {
  position: { x: 0, y: 0 },
  lastPosition: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  lastSmackTime: 0,
  smackCooldown: INTERACTION_CONFIG.SMACK_COOLDOWN_MS,
  velocityHistory: [],
  maxHistorySize: INTERACTION_CONFIG.VELOCITY_HISTORY_SIZE,
  isHoveringPeach: false, // Track if cursor is currently over the peach
};

// Raycaster for mouse interaction
const raycaster = new Raycaster();
const mouse = new Vector2();

let peachMesh = null;
let peachGroup = null;
let camera = null;
let handCursor = null;
let performanceMonitor = null;

/**
 * Initialize the interaction system
 * @param {THREE.Group} peachGroupRef - The peach group
 * @param {THREE.Camera} cameraRef - The camera
 * @param {THREE.Scene} sceneRef - The scene
 * @param {PerformanceMonitor} perfMonitor - Optional performance monitor to notify of mode changes
 */
export function initInteraction(
  peachGroupRef,
  cameraRef,
  sceneRef,
  perfMonitor = null
) {
  if (!peachGroupRef || !cameraRef) {
    console.error("initInteraction: Missing required parameters");
    return;
  }

  peachGroup = peachGroupRef;
  camera = cameraRef;
  handCursor = document.getElementById("hand-cursor");
  performanceMonitor = perfMonitor;

  if (!handCursor) {
    console.warn("Hand cursor element not found");
  }

  // Initialize particle explosion system (will be set up once mesh is loaded)
  if (sceneRef) {
    peachState.sceneRef = sceneRef;
  }

  // Mouse events
  window.addEventListener("mousemove", onMouseMove);

  // Touch events for mobile devices
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });

  // Oil button event
  const oilButton = document.getElementById("oil-button");
  if (oilButton) {
    oilButton.addEventListener("click", () => {
      const isOiled = toggleOilEffect();

      // Update performance monitor to match mode
      if (performanceMonitor) {
        performanceMonitor.setLightingMode(isOiled);
      }

      if (isOiled) {
        oilButton.textContent = "💧 Oiled Up!";
        oilButton.classList.add("oiled");
      } else {
        oilButton.textContent = "💧 Oil Up";
        oilButton.classList.remove("oiled");
      }
    });

    // Add interactive class for cursor handling
    oilButton.classList.add("interactive-element");
  }

  // Universal cursor handler using event delegation
  setupCursorHandling(handCursor);
}

/**
 * Setup universal cursor handling using event delegation
 * @param {HTMLElement} handCursor - The hand cursor element
 */
function setupCursorHandling(handCursor) {
  if (!handCursor) return;

  // Use event delegation on document body
  document.body.addEventListener("mouseover", (e) => {
    // Check if the target or any parent has the interactive class
    const interactiveElement = e.target.closest(".interactive-element");
    if (interactiveElement) {
      handCursor.textContent = "👆";
    }
  });

  document.body.addEventListener("mouseout", (e) => {
    // Check if we're leaving an interactive element
    const interactiveElement = e.target.closest(".interactive-element");
    if (interactiveElement && !interactiveElement.contains(e.relatedTarget)) {
      handCursor.textContent = "🤚";
    }
  });
}

/**
 * Set the peach mesh for raycasting and initialize soft body physics
 * @param {Array|THREE.Mesh} meshes - The peach mesh(es)
 */
export function setPeachMesh(meshes) {
  if (!meshes) {
    console.error("setPeachMesh: No meshes provided");
    return;
  }

  peachMesh = meshes;

  // Initialize soft body physics for each mesh
  peachState.softBodies = [];
  const meshArray = Array.isArray(meshes) ? meshes : [meshes];

  meshArray.forEach((mesh) => {
    if (mesh.geometry && mesh.geometry.attributes.position) {
      // Make sure geometry is not shared/indexed in a way that prevents modification
      if (!mesh.geometry.attributes.position.array) {
        console.warn(
          "⚠️ Mesh geometry cannot be modified, skipping soft body physics"
        );
        return;
      }

      const softBody = new SoftBodyPhysics(mesh);
      peachState.softBodies.push(softBody);
    }
  });

  // Initialize particle explosion system with respawn callback
  if (peachState.sceneRef && !peachState.particleExplosion) {
    peachState.particleExplosion = new ParticleExplosion(
      meshArray,
      peachState.sceneRef,
      () => {
        // Callback when explosion is complete - spawn fresh peach
        // Show meshes again
        meshArray.forEach((mesh) => {
          mesh.visible = true;
        });

        // Start respawn animation
        peachState.isRespawning = true;
        peachState.respawnTimer = 0;

        // Reset soft body physics
        peachState.softBodies.forEach((softBody) => {
          softBody.resetToOriginalImmediate();
        });

        // Reset physics state
        peachState.velocity.set(0, 0, 0);
        peachState.angularVelocity.set(0, 0, 0);
        peachState.physicsOffset.set(0, 0, 0);
        peachState.physicsRotation.set(0, 0, 0);
        peachState.isWobbling = false;
        // Don't reset idleAnimationTime here - let it continue running

        // Impact marks are already cleared when explosion starts

        // Set initial state for animation (far away and small)
        if (peachGroup) {
          peachGroup.position.set(0, 0, -10); // Start far back
          peachGroup.rotation.set(0, 0, 0); // Start at 0 rotation
          peachGroup.scale.set(0.01, 0.01, 0.01); // Start tiny
        }
      }
    );
  }
}

// Track mouse movement for velocity calculation
function onMouseMove(event) {
  updatePointerPosition(event.clientX, event.clientY);

  // Update hand cursor position (only for mouse, not touch)
  if (handCursor) {
    handCursor.style.left = event.clientX + "px";
    handCursor.style.top = event.clientY + "px";
  }

  // Check for hover and smack
  checkHoverSmack();
}

// Touch event handlers for mobile devices
function onTouchStart(event) {
  if (event.touches.length > 0) {
    const touch = event.touches[0];
    updatePointerPosition(touch.clientX, touch.clientY);

    // Hide hand cursor on touch devices
    if (handCursor) {
      handCursor.style.display = "none";
    }
  }
}

function onTouchMove(event) {
  if (event.touches.length > 0) {
    const touch = event.touches[0];
    updatePointerPosition(touch.clientX, touch.clientY);
    checkHoverSmack();
  }
}

function onTouchEnd(event) {
  // Reset hover state when touch ends
  mouseState.isHoveringPeach = false;
}

// Unified function to update pointer position (works for both mouse and touch)
function updatePointerPosition(clientX, clientY) {
  // Store last position
  mouseState.lastPosition.x = mouseState.position.x;
  mouseState.lastPosition.y = mouseState.position.y;

  // Update current position
  mouseState.position.x = clientX;
  mouseState.position.y = clientY;

  // Calculate velocity (pixels per frame)
  mouseState.velocity.x = mouseState.position.x - mouseState.lastPosition.x;
  mouseState.velocity.y = mouseState.position.y - mouseState.lastPosition.y;

  // Store velocity in history for smoothing
  mouseState.velocityHistory.push({
    x: mouseState.velocity.x,
    y: mouseState.velocity.y,
    time: Date.now(),
  });

  // Keep only recent history
  if (mouseState.velocityHistory.length > mouseState.maxHistorySize) {
    mouseState.velocityHistory.shift();
  }

  // Update normalized coordinates for raycasting
  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;
}

function checkHoverSmack() {
  // Only process if the model is loaded
  if (!peachMesh || !peachGroup || !camera) return;

  // Can't slap during explosion or respawn!
  if (peachState.isRespawning) return;
  if (peachState.particleExplosion && peachState.particleExplosion.isActive())
    return;

  raycaster.setFromCamera(mouse, camera);

  // Handle both array of meshes (GLTF) and single mesh (procedural)
  const meshesToCheck = Array.isArray(peachMesh) ? peachMesh : [peachMesh];
  const intersects = raycaster.intersectObjects(meshesToCheck, true);

  const isCurrentlyHovering = intersects.length > 0;

  // Only allow smacking when cursor ENTERS the peach (transition from not hovering to hovering)
  if (isCurrentlyHovering) {
    // Check if this is a fresh entry (cursor was not hovering before)
    if (mouseState.isHoveringPeach) {
      // Still hovering from before - don't smack
      return;
    }

    // This is a new entry! Check velocity and cooldown
    const currentTime = Date.now();
    if (currentTime - mouseState.lastSmackTime < mouseState.smackCooldown) {
      // Update hover state but don't smack yet
      mouseState.isHoveringPeach = true;
      return;
    }
    // Calculate average velocity from history for smoother, more accurate direction
    let avgVelocityX = 0;
    let avgVelocityY = 0;

    if (mouseState.velocityHistory.length > 0) {
      for (const vel of mouseState.velocityHistory) {
        avgVelocityX += vel.x;
        avgVelocityY += vel.y;
      }
      avgVelocityX /= mouseState.velocityHistory.length;
      avgVelocityY /= mouseState.velocityHistory.length;
    }

    // Calculate velocity magnitude from averaged values
    const velocityMagnitude = Math.sqrt(
      avgVelocityX * avgVelocityX + avgVelocityY * avgVelocityY
    );

    // Only smack if moving fast enough (minimum threshold)
    if (velocityMagnitude < INTERACTION_CONFIG.MIN_VELOCITY_THRESHOLD) return;

    mouseState.lastSmackTime = currentTime;

    // Add smack animation to cursor
    if (handCursor) {
      handCursor.classList.remove("smacking");
      void handCursor.offsetWidth; // Trigger reflow
      handCursor.classList.add("smacking");
      setTimeout(() => handCursor.classList.remove("smacking"), 200);
    }

    // Convert 2D screen velocity to 3D world direction
    // Normalize the velocity to get direction
    const velocityDir = new Vector2(avgVelocityX, avgVelocityY).normalize();

    // Map screen space to world space direction
    // X: right is positive (keep as is)
    // Y: down is positive in screen space, but up is positive in 3D (invert)
    // Z: push towards camera for satisfying movement
    const direction = new Vector3(
      velocityDir.x, // Horizontal movement matches screen
      -velocityDir.y, // Vertical inverted (screen Y is flipped)
      0.4 // Always push a bit toward camera for nice effect
    ).normalize();

    // Scale force based on velocity (faster movement = harder hit)
    const velocityScale = Math.min(velocityMagnitude / 20, 2.0); // Cap at 2x for controlled but responsive movement
    const force = 1.7 * velocityScale; // Moderate base force
    peachState.velocity.add(direction.multiplyScalar(force));

    // Add angular velocity based on impact force (moderate rotation)
    peachState.angularVelocity.set(
      (Math.random() - 0.5) * 4 * velocityScale,
      (Math.random() - 0.5) * 4 * velocityScale,
      (Math.random() - 0.5) * 4 * velocityScale
    );

    peachState.isWobbling = true;
    // Keep idle animation running in the background

    // Apply soft body impulse for jiggle effect at the intersection point
    // (Note: This doesn't check perfMonitor since we don't have access here,
    // but the actual physics update will be skipped if disabled)
    const intersectPoint = intersects[0].point;
    const jiggleForce = 0.18 * velocityScale; // Force for vertex deformation
    peachState.softBodies.forEach((softBody) => {
      softBody.applyImpulse(intersectPoint, direction.clone(), jiggleForce);
    });

    // Add impact mark for visual feedback (red skin that fades over time)
    addImpactMark(intersectPoint.clone(), velocityScale);

    // Sound intensity based on velocity
    const intensity = Math.min(0.4 + velocityMagnitude / 30, 1.0);
    playSmackSound(intensity);

    // Mark that we're now hovering (after a successful smack)
    mouseState.isHoveringPeach = true;

    // Increase rage level based on hit intensity
    const rageIncrease =
      INTERACTION_CONFIG.RAGE_BASE_INCREASE +
      velocityScale * INTERACTION_CONFIG.RAGE_VELOCITY_MULTIPLIER;
    peachState.rageLevel = Math.min(
      peachState.explosionThreshold,
      peachState.rageLevel + rageIncrease
    );

    // Update rage meter UI
    updateRageMeter();

    // Trigger explosion if rage threshold is reached
    if (
      peachState.rageLevel >= peachState.explosionThreshold &&
      peachState.particleExplosion
    ) {
      if (!peachState.particleExplosion.isActive()) {
        // Clear impact marks immediately when explosion starts
        peachState.impactMarks = [];
        updateImpactMarkShaders([]);
        
        peachState.particleExplosion.explode();
        playExplosionSound(1.0);
        peachState.rageLevel = 0; // Reset rage after explosion
        updateRageMeter();
      }
    }
  } else {
    // Cursor is not hovering - reset hover state
    mouseState.isHoveringPeach = false;
  }
}

/**
 * Add an impact mark at a world position that fades over time
 * @param {Vector3} worldPosition - The world position of the impact
 * @param {number} intensity - The intensity of the impact (0-2)
 */
function addImpactMark(worldPosition, intensity = 1.0) {
  if (!peachGroup || !peachMesh) return;

  // Check if impact marks are enabled via performance monitor
  if (
    performanceMonitor &&
    !performanceMonitor.isFeatureEnabled("impactMarks")
  ) {
    return;
  }

  // Convert to local space ONCE at impact time, so it's "baked" onto the surface
  // This way it follows the mesh through all rotations and transformations
  const meshArray = Array.isArray(peachMesh) ? peachMesh : [peachMesh];
  const localPositions = [];

  // Store local position for each mesh (in case we have multiple meshes in GLTF)
  meshArray.forEach((mesh) => {
    const localPos = worldPosition.clone();
    mesh.worldToLocal(localPos);
    localPositions.push({
      mesh: mesh,
      position: localPos,
    });
  });

  // Duration based on intensity - more realistic fade times
  const duration =
    INTERACTION_CONFIG.IMPACT_MARK_BASE_DURATION +
    intensity *
      (INTERACTION_CONFIG.IMPACT_MARK_MAX_DURATION -
        INTERACTION_CONFIG.IMPACT_MARK_BASE_DURATION);

  peachState.impactMarks.push({
    localPositions: localPositions, // Store per-mesh local positions
    age: 0,
    maxAge: duration,
    intensity: Math.min(
      intensity * INTERACTION_CONFIG.IMPACT_MARK_INTENSITY_SCALE,
      1.2
    ), // Reduced intensity for subtlety
  });

  // Limit total number of impact marks for performance
  if (peachState.impactMarks.length > INTERACTION_CONFIG.MAX_IMPACT_MARKS) {
    peachState.impactMarks.shift(); // Remove oldest
  }
}

/**
 * Update impact marks (age them and remove expired ones)
 * @param {number} delta - Time delta since last frame
 */
function updateImpactMarks(delta) {
  // Age all impact marks
  for (let i = peachState.impactMarks.length - 1; i >= 0; i--) {
    const mark = peachState.impactMarks[i];
    mark.age += delta;

    // Remove expired marks
    if (mark.age >= mark.maxAge) {
      peachState.impactMarks.splice(i, 1);
    }
  }
}

/**
 * Update the rage meter UI
 */
function updateRageMeter() {
  const rageMeter = document.getElementById("rage-meter-fill");
  const rageContainer = document.getElementById("rage-meter-container");

  if (!rageMeter || !rageContainer) return;

  try {
    rageMeter.style.width = `${peachState.rageLevel}%`;

    // Change color based on rage level
    if (peachState.rageLevel < 33) {
      rageMeter.style.background = "linear-gradient(90deg, #4CAF50, #8BC34A)";
    } else if (peachState.rageLevel < 66) {
      rageMeter.style.background = "linear-gradient(90deg, #FF9800, #FFC107)";
    } else {
      rageMeter.style.background = "linear-gradient(90deg, #F44336, #FF5722)";
      // Add pulsing effect when high rage
      rageMeter.style.animation = "rage-pulse 0.5s infinite";
    }

    // Show container when rage > 0
    if (peachState.rageLevel > 0) {
      rageContainer.style.opacity = "1";
    } else {
      rageContainer.style.opacity = "0";
    }
  } catch (error) {
    console.error("Error updating rage meter:", error);
  }
}

/**
 * Update peach physics and animation
 * @param {number} delta - Time delta since last frame
 * @param {number} idleTime - Total idle animation time
 * @param {PerformanceMonitor} perfMonitor - Optional performance monitor for feature toggling
 */
export function updatePeachPhysics(delta, idleTime, perfMonitor = null) {
  if (!peachGroup) return;

  // Validate delta to prevent physics explosions
  if (!delta || delta <= 0 || delta > 1) return;

  // Always update idle animation time (runs continuously as base layer)
  peachState.idleAnimationTime += delta;

  // Update particle explosion if active (check if particles are enabled)
  const particlesEnabled =
    !perfMonitor || perfMonitor.isFeatureEnabled("particles");
  if (peachState.particleExplosion) {
    if (particlesEnabled) {
      peachState.particleExplosion.update(delta);

      // Skip normal physics during explosion
      if (peachState.particleExplosion.isActive()) {
        return;
      }
    } else {
      // If particles are disabled during an active explosion, force-finish it immediately
      if (peachState.particleExplosion.isActive()) {
        peachState.particleExplosion.forceFinishExplosion();
      }
    }
  }

  // Handle respawn animation
  if (peachState.isRespawning) {
    peachState.respawnTimer += delta;

    // Calculate progress (0 to 1)
    let progress = Math.min(
      1.0,
      peachState.respawnTimer / peachState.respawnDuration
    );

    // Ease out cubic for smooth deceleration
    progress = 1 - (1 - progress) ** 3;

    // Animate position (from far back to center)
    const startZ = -10;
    const endZ = peachState.defaultPosition.z;
    peachGroup.position.z = startZ + (endZ - startZ) * progress;
    peachGroup.position.x = peachState.defaultPosition.x;
    peachGroup.position.y = peachState.defaultPosition.y;

    // Animate scale (from tiny to normal size)
    const scale = 0.01 + (1.0 - 0.01) * progress;
    peachGroup.scale.set(scale, scale, scale);

    // Spin slows down and ends at rotation 0 (matching idle animation start)
    const remainingSpin = 1 - progress;
    peachGroup.rotation.x = peachState.defaultRotation.x;
    peachGroup.rotation.y = remainingSpin * Math.PI * 2;
    peachGroup.rotation.z = peachState.defaultRotation.z;

    // Check if animation is complete
    if (progress >= 1.0) {
      peachState.isRespawning = false;
      peachGroup.scale.set(1, 1, 1); // Ensure exact final scale
      // Reset idle animation so it starts from 0 (facing forward)
      peachState.idleAnimationTime = 0;
    }

    return; // Skip normal physics during respawn
  }

  // Decay rage level over time
  if (peachState.rageLevel > 0) {
    peachState.rageLevel = Math.max(
      0,
      peachState.rageLevel - peachState.rageDecayRate * delta
    );
    updateRageMeter();
  }

  // Update impact marks (age them and remove expired ones) - only if enabled
  const impactMarksEnabled =
    !perfMonitor || perfMonitor.isFeatureEnabled("impactMarks");
  if (impactMarksEnabled) {
    updateImpactMarks(delta);

    // Update shader uniforms with current impact marks
    updateImpactMarkShaders(peachState.impactMarks);
  } else {
    // Clear impact marks if disabled
    if (peachState.impactMarks.length > 0) {
      peachState.impactMarks = [];
      updateImpactMarkShaders([]); // Clear visual marks
    }
  }

  // Update soft body physics (jiggle) - only if enabled
  const physicsEnabled =
    !perfMonitor || perfMonitor.isFeatureEnabled("softBodyPhysics");
  if (physicsEnabled) {
    peachState.softBodies.forEach((softBody) => {
      softBody.update(delta);
    });
  }

  // If wobbling, update physics offset
  if (peachState.isWobbling) {
    const velocityLength = peachState.velocity.length();
    const angularVelLength = peachState.angularVelocity.length();
    const settleThreshold = 0.01;

    // Apply velocity to physics offset
    peachState.physicsOffset.add(
      peachState.velocity.clone().multiplyScalar(delta)
    );

    // Apply angular velocity to physics rotation
    peachState.physicsRotation.x += peachState.angularVelocity.x * delta;
    peachState.physicsRotation.y += peachState.angularVelocity.y * delta;
    peachState.physicsRotation.z += peachState.angularVelocity.z * delta;

    // Apply damping
    peachState.velocity.multiplyScalar(PHYSICS_CONFIG.DAMPING);
    peachState.angularVelocity.multiplyScalar(PHYSICS_CONFIG.ANGULAR_DAMPING);

    // Return force pulls physics offset back to zero
    const toDefault = peachState.physicsOffset
      .clone()
      .multiplyScalar(-PHYSICS_CONFIG.RETURN_FORCE);
    peachState.velocity.add(toDefault);

    // Return to default rotation gradually
    peachState.physicsRotation.x +=
      (0 - peachState.physicsRotation.x) *
      PHYSICS_CONFIG.ROTATION_RETURN_FACTOR;
    peachState.physicsRotation.y +=
      (0 - peachState.physicsRotation.y) *
      PHYSICS_CONFIG.ROTATION_RETURN_FACTOR;
    peachState.physicsRotation.z +=
      (0 - peachState.physicsRotation.z) *
      PHYSICS_CONFIG.ROTATION_RETURN_FACTOR;

    // Check if peach has settled
    if (
      velocityLength < PHYSICS_CONFIG.VELOCITY_SETTLE_THRESHOLD &&
      angularVelLength < PHYSICS_CONFIG.VELOCITY_SETTLE_THRESHOLD
    ) {
      peachState.isWobbling = false;
      peachState.velocity.set(0, 0, 0);
      peachState.angularVelocity.set(0, 0, 0);
      peachState.physicsOffset.set(0, 0, 0);
      peachState.physicsRotation.set(0, 0, 0);
    }
  }

  // ALWAYS apply idle animation as base layer
  const idleY = Math.sin(peachState.idleAnimationTime * 1.5) * 0.2;
  const idleRotY = Math.sin(peachState.idleAnimationTime * 0.5) * 0.3;

  // Apply: default + idle + physics offset
  peachGroup.position.x =
    peachState.defaultPosition.x + peachState.physicsOffset.x;
  peachGroup.position.y =
    peachState.defaultPosition.y + idleY + peachState.physicsOffset.y;
  peachGroup.position.z =
    peachState.defaultPosition.z + peachState.physicsOffset.z;

  peachGroup.rotation.x =
    peachState.defaultRotation.x + peachState.physicsRotation.x;
  peachGroup.rotation.y =
    peachState.defaultRotation.y + idleRotY + peachState.physicsRotation.y;
  peachGroup.rotation.z =
    peachState.defaultRotation.z + peachState.physicsRotation.z;
}
