/* eslint-disable no-plusplus, no-continue, no-param-reassign, no-restricted-syntax */
import { Vector3 } from "three";
import { PHYSICS_CONFIG } from "./config";

/**
 * Soft Body Physics System for Jiggle Effects
 * Applies spring-mass dynamics to vertices for realistic deformation
 */

// eslint-disable-next-line import/prefer-default-export
export class SoftBodyPhysics {
  constructor(mesh) {
    if (!mesh || !mesh.geometry) {
      throw new Error("SoftBodyPhysics: Invalid mesh provided");
    }

    this.mesh = mesh;
    this.geometry = mesh.geometry.clone(); // Clone to avoid modifying original
    this.mesh.geometry = this.geometry; // Use the clone

    // Recompute normals immediately to ensure consistent lighting from the start
    this.geometry.computeVertexNormals();

    // Store original positions for spring rest state
    this.originalPositions = [];
    this.vertexVelocities = [];
    this.vertexForces = [];

    // CRITICAL: Group vertices at the same position together
    // This prevents tearing while preserving UVs and other attributes
    this.vertexGroups = []; // Maps each vertex to its group of duplicates

    // Physics parameters - tuned for peachy jiggle!
    this.stiffness = 0.45; // Spring stiffness (higher = firmer, less jiggly)
    this.damping = 0.9; // Velocity damping (higher = less bouncy)
    this.mass = 1.8; // Vertex mass (higher = slower response)
    this.propagation = 0.25; // Force propagation to neighbors
    this.maxDisplacement = 0.12; // Maximum distance a vertex can move from original (reduced for firmness)
    this.timeScale = 0.75; // Global time scale for physics (lower = slower)

    this.initialized = false;
    this.isActive = false; // Only compute when needed
    this.activityTimer = 0;
    this.frameCount = 0; // For reducing normal recalculation frequency

    // Reusable vectors to avoid garbage collection
    this.tempVec1 = new Vector3();
    this.tempVec2 = new Vector3();
    this.tempVec3 = new Vector3();

    this.init();
  }

  init() {
    const positions = this.geometry.attributes.position;

    if (!positions) {
      // eslint-disable-next-line no-console
      console.error("SoftBodyPhysics: No position attribute found");
      return;
    }

    // Store original positions and initialize physics arrays
    for (let i = 0; i < positions.count; i++) {
      this.originalPositions.push(
        new Vector3(positions.getX(i), positions.getY(i), positions.getZ(i))
      );
      this.vertexVelocities.push(new Vector3(0, 0, 0));
      this.vertexForces.push(new Vector3(0, 0, 0));
    }

    // Build vertex groups - vertices at the same position are grouped
    this.buildVertexGroups();

    // Build neighbor map for force propagation
    this.buildNeighborMap();

    this.initialized = true;
  }

  buildVertexGroups() {
    // Group vertices that share the same position (within tolerance)
    const tolerance = PHYSICS_CONFIG.VERTEX_POSITION_TOLERANCE;
    const positions = this.geometry.attributes.position;
    const posArray = positions.array;
    const positionMap = new Map();

    // Initialize - each vertex starts in its own group
    for (let i = 0; i < positions.count; i++) {
      this.vertexGroups[i] = [i];
    }

    // Find vertices at the same position (use direct array access)
    for (let i = 0; i < positions.count; i++) {
      const i3 = i * 3;
      const x = posArray[i3];
      const y = posArray[i3 + 1];
      const z = posArray[i3 + 2];

      // Create position key
      const key = `${Math.round(x / tolerance)}_${Math.round(
        y / tolerance
      )}_${Math.round(z / tolerance)}`;

      if (!positionMap.has(key)) {
        positionMap.set(key, [i]);
      } else {
        positionMap.get(key).push(i);
      }
    }

    // Build groups - all vertices at same position share the same group
    for (const group of positionMap.values()) {
      if (group.length > 1) {
        // All vertices in this group reference the same array
        for (const vertexIndex of group) {
          this.vertexGroups[vertexIndex] = group;
        }
      }
    }
  }

  buildNeighborMap() {
    // Build a map of neighboring vertices based on shared edges
    this.neighbors = new Map();
    const indices = this.geometry.index;

    if (!indices) {
      // No index buffer, use simple proximity-based neighbors
      this.buildProximityNeighbors();
      return;
    }

    // Build neighbor map from triangle indices
    for (let i = 0; i < indices.count; i += 3) {
      const a = indices.getX(i);
      const b = indices.getX(i + 1);
      const c = indices.getX(i + 2);

      this.addNeighbor(a, b);
      this.addNeighbor(a, c);
      this.addNeighbor(b, a);
      this.addNeighbor(b, c);
      this.addNeighbor(c, a);
      this.addNeighbor(c, b);
    }
  }

  buildProximityNeighbors() {
    // Fallback: use proximity-based neighbors
    const positions = this.geometry.attributes.position;
    const posArray = positions.array;
    const threshold = PHYSICS_CONFIG.PROXIMITY_THRESHOLD;
    const thresholdSq = threshold * threshold; // Use squared distance (faster)

    for (let i = 0; i < positions.count; i++) {
      const neighbors = [];
      const i3 = i * 3;
      const ix = posArray[i3];
      const iy = posArray[i3 + 1];
      const iz = posArray[i3 + 2];

      // Only check a subset to avoid O(n²) complexity
      const step = Math.max(
        1,
        Math.floor(
          positions.count / PHYSICS_CONFIG.PROXIMITY_SAMPLING_STEP_DIVISOR
        )
      );
      for (let j = 0; j < positions.count; j += step) {
        if (i === j) continue;

        const j3 = j * 3;
        const dx = posArray[j3] - ix;
        const dy = posArray[j3 + 1] - iy;
        const dz = posArray[j3 + 2] - iz;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < thresholdSq) {
          neighbors.push(j);
        }
      }

      if (neighbors.length > 0) {
        this.neighbors.set(i, neighbors);
      }
    }
  }

  addNeighbor(vertexIndex, neighborIndex) {
    if (!this.neighbors.has(vertexIndex)) {
      this.neighbors.set(vertexIndex, []);
    }
    const neighbors = this.neighbors.get(vertexIndex);
    if (!neighbors.includes(neighborIndex)) {
      neighbors.push(neighborIndex);
    }
  }

  applyImpulse(worldPoint, worldDirection, force) {
    if (!this.initialized) return;

    // Apply an impulse at a specific point on the mesh
    // This creates the initial jiggle from the smack

    this.isActive = true;
    this.activityTimer = 1.5; // Stay active for 1.5 seconds (2.5x faster)
    this.frameCount = 0; // Reset frame count

    // Transform world space to local space (reuse temp vectors)
    this.tempVec1.copy(worldPoint);
    this.mesh.worldToLocal(this.tempVec1);

    this.tempVec2
      .copy(worldDirection)
      .transformDirection(this.mesh.matrixWorld.clone().invert());

    const positions = this.geometry.attributes.position;
    const posArray = positions.array;
    const impactRadius = 0.8; // Radius of impact effect (smaller = more localized)
    const impactRadiusSq = impactRadius * impactRadius; // Compare squared distances (faster)

    // Apply force to vertices near the impact point
    for (let i = 0; i < positions.count; i++) {
      const i3 = i * 3;

      // Calculate distance squared (avoid sqrt for performance)
      const dx = posArray[i3] - this.tempVec1.x;
      const dy = posArray[i3 + 1] - this.tempVec1.y;
      const dz = posArray[i3 + 2] - this.tempVec1.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < impactRadiusSq) {
        const distance = Math.sqrt(distSq);

        // Falloff based on distance (closer = stronger)
        const falloff = 1.0 - distance / impactRadius;
        const strength = force * falloff * falloff * falloff; // Cubic falloff for even softer impact

        // Add velocity in the impact direction
        this.tempVec3.copy(this.tempVec2).multiplyScalar(strength);
        this.vertexVelocities[i].add(this.tempVec3);

        // Clamp velocity to prevent explosion
        const velLength = this.vertexVelocities[i].length();
        const maxVelocity = PHYSICS_CONFIG.MAX_VELOCITY_CAP;
        if (velLength > maxVelocity) {
          this.vertexVelocities[i].multiplyScalar(maxVelocity / velLength);
        }
      }
    }
  }

  update(delta) {
    if (!this.initialized || !this.isActive) return;

    // Countdown activity timer
    this.activityTimer -= delta;

    // Gradually increase damping as we approach timeout for smooth settle
    const fadeOutTime = 0.5; // Start fading out in the last 0.5 seconds (2.5x faster)
    let dampingMultiplier = 1.0;
    if (this.activityTimer < fadeOutTime) {
      // Smoothly increase damping to help settle naturally
      dampingMultiplier = 0.88 + (this.activityTimer / fadeOutTime) * 0.12;
    }

    // Smoothly lerp vertices back to original over a longer period
    const lerpStartTime = 1.2; // Start lerping in the last 1.2 seconds (2.5x faster)
    let lerpAmount = 0;
    if (this.activityTimer < lerpStartTime) {
      // Gradually increase lerp from 0 to 1 as we approach the end
      // Use easeInOut curve for smoother transition
      let t = 1.0 - this.activityTimer / lerpStartTime;
      t = Math.min(t, 1.0);
      t = Math.max(t, 0.0);
      // Ease in-out: smooth at both ends
      lerpAmount = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    }

    // Force lerpAmount to exactly 1.0 when timer is very close to or past 0
    if (this.activityTimer <= 0.02) {
      lerpAmount = 1.0;
    }

    // Deactivate when timer fully expires
    if (this.activityTimer <= 0) {
      // At this point, lerp should be exactly 1.0 and vertices should be at original
      // Zero out velocities and deactivate (positions are already correct from lerp)
      for (let i = 0; i < this.vertexVelocities.length; i++) {
        this.vertexVelocities[i].set(0, 0, 0);
        this.vertexForces[i].set(0, 0, 0);
      }
      this.isActive = false;
      return;
    }

    this.frameCount++;
    const positions = this.geometry.attributes.position;
    const posArray = positions.array; // Direct array access is faster

    // Reset forces
    for (let i = 0; i < this.vertexForces.length; i++) {
      this.vertexForces[i].set(0, 0, 0);
    }

    // Calculate spring forces (restore to original position)
    // Reuse temp vectors to avoid creating new objects
    for (let i = 0; i < positions.count; i++) {
      const i3 = i * 3;
      this.tempVec1.set(posArray[i3], posArray[i3 + 1], posArray[i3 + 2]);

      const original = this.originalPositions[i];

      // Spring force: F = -k * displacement
      this.tempVec2
        .copy(this.tempVec1)
        .sub(original)
        .multiplyScalar(-this.stiffness);

      this.vertexForces[i].add(this.tempVec2);
    }

    // Propagate forces to neighbors (creates wave effect)
    // Only do this every other frame for performance
    if (this.frameCount % 2 === 0) {
      for (let i = 0; i < positions.count; i++) {
        if (!this.neighbors.has(i)) continue;

        const neighbors = this.neighbors.get(i);
        const i3 = i * 3;
        this.tempVec1.set(posArray[i3], posArray[i3 + 1], posArray[i3 + 2]);

        for (const neighborIndex of neighbors) {
          const ni3 = neighborIndex * 3;
          this.tempVec2.set(
            posArray[ni3],
            posArray[ni3 + 1],
            posArray[ni3 + 2]
          );

          // Force to align with neighbors (creates smooth waves)
          this.tempVec3
            .copy(this.tempVec2)
            .sub(this.tempVec1)
            .multiplyScalar(this.propagation * 0.1);
          this.vertexForces[i].add(this.tempVec3);
        }
      }
    }

    // Track which groups we've already processed
    const processedGroups = new Set();

    // Update velocities and positions
    for (let i = 0; i < positions.count; i++) {
      const group = this.vertexGroups[i];

      // If this vertex is part of a group with duplicates
      if (group.length > 1) {
        // Use the first vertex in the group as the representative
        const representative = group[0];

        // Only process each group once
        if (processedGroups.has(representative)) {
          continue;
        }
        processedGroups.add(representative);

        // Average the forces from all vertices in the group
        const avgForce = new Vector3(0, 0, 0);
        for (const idx of group) {
          avgForce.add(this.vertexForces[idx]);
        }
        avgForce.divideScalar(group.length);

        // Apply force: a = F / m
        avgForce.divideScalar(this.mass);

        // Update velocity for the group (use representative's velocity)
        this.tempVec1
          .copy(avgForce)
          .multiplyScalar(delta * 60 * this.timeScale);
        this.vertexVelocities[representative].add(this.tempVec1);

        // Apply damping (with fade-out multiplier)
        this.vertexVelocities[representative].multiplyScalar(
          this.damping * dampingMultiplier
        );

        // Clamp velocity
        const velLength = this.vertexVelocities[representative].length();
        const maxVelocity = PHYSICS_CONFIG.MAX_VELOCITY_CAP;
        if (velLength > maxVelocity) {
          this.vertexVelocities[representative].multiplyScalar(
            maxVelocity / velLength
          );
        }

        // Calculate new position for the group (reuse temp vectors)
        const rep3 = representative * 3;
        this.tempVec1.set(
          posArray[rep3],
          posArray[rep3 + 1],
          posArray[rep3 + 2]
        );
        this.tempVec2
          .copy(this.vertexVelocities[representative])
          .multiplyScalar(delta * 60 * this.timeScale);
        this.tempVec1.add(this.tempVec2);

        // Constrain position
        this.tempVec3
          .copy(this.tempVec1)
          .sub(this.originalPositions[representative]);
        const displacementLength = this.tempVec3.length();

        if (displacementLength > this.maxDisplacement) {
          this.tempVec3.multiplyScalar(
            this.maxDisplacement / displacementLength
          );
          this.tempVec1
            .copy(this.originalPositions[representative])
            .add(this.tempVec3);
          this.vertexVelocities[representative].multiplyScalar(0.5);
        }

        // Apply the same position to ALL vertices in the group
        for (const idx of group) {
          const offset = this.originalPositions[idx]
            .clone()
            .sub(this.originalPositions[representative]);
          const finalPos = this.tempVec1.clone().add(offset);

          // Apply lerp towards original position if we're in the fade-out phase
          if (lerpAmount > 0) {
            finalPos.lerp(this.originalPositions[idx], lerpAmount);
            // Aggressively zero out velocities during lerp (stronger damping)
            this.vertexVelocities[representative].multiplyScalar(
              1.0 - lerpAmount * 0.9
            );
          }

          const idx3 = idx * 3;
          posArray[idx3] = finalPos.x;
          posArray[idx3 + 1] = finalPos.y;
          posArray[idx3 + 2] = finalPos.z;
          // Sync velocities too
          this.vertexVelocities[idx].copy(
            this.vertexVelocities[representative]
          );
        }
      } else {
        // Single vertex, process normally (reuse temp vectors)
        this.tempVec1
          .copy(this.vertexForces[i])
          .divideScalar(this.mass)
          .multiplyScalar(delta * 60 * this.timeScale);
        this.vertexVelocities[i].add(this.tempVec1);
        this.vertexVelocities[i].multiplyScalar(
          this.damping * dampingMultiplier
        );

        const velLength = this.vertexVelocities[i].length();
        const maxVelocity = PHYSICS_CONFIG.MAX_VELOCITY_CAP_SINGLE;
        if (velLength > maxVelocity) {
          this.vertexVelocities[i].multiplyScalar(maxVelocity / velLength);
        }

        const i3 = i * 3;
        this.tempVec1.set(posArray[i3], posArray[i3 + 1], posArray[i3 + 2]);
        this.tempVec2
          .copy(this.vertexVelocities[i])
          .multiplyScalar(delta * 60 * this.timeScale);
        this.tempVec1.add(this.tempVec2);

        this.tempVec3.copy(this.tempVec1).sub(this.originalPositions[i]);
        const displacementLength = this.tempVec3.length();

        if (displacementLength > this.maxDisplacement) {
          this.tempVec3.multiplyScalar(
            this.maxDisplacement / displacementLength
          );
          this.tempVec1.copy(this.originalPositions[i]).add(this.tempVec3);
          this.vertexVelocities[i].multiplyScalar(0.5);
        }

        // Apply lerp towards original position if we're in the fade-out phase
        if (lerpAmount > 0) {
          this.tempVec1.lerp(this.originalPositions[i], lerpAmount);
          // Aggressively zero out velocities during lerp (stronger damping)
          this.vertexVelocities[i].multiplyScalar(1.0 - lerpAmount * 0.9);
        }

        posArray[i3] = this.tempVec1.x;
        posArray[i3 + 1] = this.tempVec1.y;
        posArray[i3 + 2] = this.tempVec1.z;
      }
    }

    // Mark geometry as needing update
    positions.needsUpdate = true;

    // Only recalculate normals every N frames (huge performance boost!)
    // EXCEPT when lerp is complete (at original position) - then always recalculate for correct final state
    if (
      this.frameCount % PHYSICS_CONFIG.NORMAL_RECALC_INTERVAL === 0 ||
      lerpAmount >= 1.0
    ) {
      this.geometry.computeVertexNormals();
    }
  }

  getMaxVelocity() {
    // Find the maximum velocity magnitude across all vertices
    let maxVel = 0;
    for (let i = 0; i < this.vertexVelocities.length; i++) {
      const vel = this.vertexVelocities[i].length();
      if (vel > maxVel) maxVel = vel;
    }
    return maxVel;
  }

  getMaxDisplacement() {
    // Find the maximum displacement from original position
    let maxDisp = 0;
    const positions = this.geometry.attributes.position;
    const posArray = positions.array;

    for (let i = 0; i < positions.count; i++) {
      const i3 = i * 3;
      this.tempVec1.set(posArray[i3], posArray[i3 + 1], posArray[i3 + 2]);
      const disp = this.tempVec1.distanceTo(this.originalPositions[i]);
      if (disp > maxDisp) maxDisp = disp;
    }
    return maxDisp;
  }

  resetToOriginalImmediate() {
    // Immediately reset vertices to original positions (should already be very close via lerping)
    const positions = this.geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const original = this.originalPositions[i];
      positions.setXYZ(i, original.x, original.y, original.z);
      this.vertexVelocities[i].set(0, 0, 0);
      this.vertexForces[i].set(0, 0, 0);
    }

    positions.needsUpdate = true;
    this.geometry.computeVertexNormals();
  }

  dispose() {
    this.originalPositions = [];
    this.vertexVelocities = [];
    this.vertexForces = [];
    this.neighbors.clear();
  }
}
