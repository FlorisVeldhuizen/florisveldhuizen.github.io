import {
  SphereGeometry,
  MeshStandardMaterial,
  Group,
  Vector3,
  Mesh,
} from "three";
import { PARTICLE_CONFIG } from "./config.js";

/**
 * Particle Explosion System
 * When the peach takes too much damage, it explodes into particles
 * that dramatically scatter and then slowly reform
 */

export class ParticleExplosion {
  constructor(mesh, scene, onComplete) {
    if (!mesh || !scene) {
      throw new Error("ParticleExplosion: Missing required parameters");
    }

    this.originalMesh = mesh;
    this.scene = scene;
    this.onComplete = onComplete;
    this.particles = [];
    this.isExploding = false;
    this.explosionTimer = 0;
    this.explosionForce = PARTICLE_CONFIG.EXPLOSION_FORCE;
    this.fallDuration = PARTICLE_CONFIG.FALL_DURATION;

    // Particle geometry and material (shared for performance)
    this.particleGeometry = new SphereGeometry(
      PARTICLE_CONFIG.RADIUS,
      PARTICLE_CONFIG.SPHERE_SEGMENTS,
      PARTICLE_CONFIG.SPHERE_SEGMENTS
    );
    this.particleMaterial = new MeshStandardMaterial({
      color: 0xffb0c0,
      roughness: 0.7,
      metalness: 0.0,
      emissive: 0xff7090,
      emissiveIntensity: PARTICLE_CONFIG.EMISSIVE_BASE,
    });

    // Group to hold all particles
    this.particleGroup = new Group();
    this.scene.add(this.particleGroup);

    // Track original vertices for reformation
    this.originalVertices = [];
    this.particleTargets = [];
  }

  /**
   * Trigger the explosion effect
   */
  explode() {
    if (this.isExploding) return; // Already exploding

    this.isExploding = true;
    this.explosionTimer = 0;

    // Hide the original mesh
    this.originalMesh.forEach((mesh) => {
      mesh.visible = false;
    });

    // Clear any existing particles
    this.clearParticles();

    // Create particles from mesh vertices
    this.createParticlesFromMesh();

    // Apply explosion forces
    this.applyExplosionForces();
  }

  /**
   * Create particles from the mesh geometry
   */
  createParticlesFromMesh() {
    // Sample vertices from the mesh (not all, for performance)
    const meshArray = Array.isArray(this.originalMesh)
      ? this.originalMesh
      : [this.originalMesh];

    meshArray.forEach((mesh) => {
      const geometry = mesh.geometry;
      const positions = geometry.attributes.position;

      // Sample every Nth vertex to create particles
      const samplingRate = Math.max(
        1,
        Math.floor(positions.count / PARTICLE_CONFIG.MAX_PARTICLES)
      );

      for (let i = 0; i < positions.count; i += samplingRate) {
        const vertex = new Vector3(
          positions.getX(i),
          positions.getY(i),
          positions.getZ(i)
        );

        // Transform to world space
        vertex.applyMatrix4(mesh.matrixWorld);

        // Create particle (share geometry, clone material for individual control)
        const particle = new Mesh(
          this.particleGeometry,
          this.particleMaterial.clone()
        );
        particle.position.copy(vertex);

        // Store physics data
        particle.userData.velocity = new Vector3(0, 0, 0);
        particle.userData.originalPosition = vertex.clone();
        particle.userData.targetPosition = vertex.clone();

        this.particleGroup.add(particle);
        this.particles.push(particle);
      }
    });
  }

  /**
   * Apply outward explosion forces to all particles
   */
  applyExplosionForces() {
    // Calculate center of explosion (average position)
    const center = new Vector3(0, 0, 0);
    this.particles.forEach((particle) => {
      center.add(particle.position);
    });
    center.divideScalar(this.particles.length);

    // Apply forces radiating outward from center
    this.particles.forEach((particle) => {
      // Direction from center to particle
      const direction = particle.position.clone().sub(center).normalize();

      // Add some randomness for chaotic effect
      direction.x += (Math.random() - 0.5) * 0.5;
      direction.y += (Math.random() - 0.5) * 0.5;
      direction.z += (Math.random() - 0.5) * 0.5;
      direction.normalize();

      // Random force magnitude
      const forceMagnitude = this.explosionForce * (0.7 + Math.random() * 0.6);

      // Set initial velocity
      particle.userData.velocity.copy(direction).multiplyScalar(forceMagnitude);

      // Add slight upward bias for dramatic effect
      particle.userData.velocity.y += PARTICLE_CONFIG.UPWARD_BIAS;

      // Random rotation for visual interest
      particle.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      particle.userData.angularVelocity = new Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      );
    });
  }

  /**
   * Update particle physics - particles fall and disappear
   */
  update(delta) {
    if (!this.isExploding) return;

    this.explosionTimer += delta;

    // Calculate fade progress (starts after particles have fallen)
    let fadeProgress = 0;
    if (this.explosionTimer > PARTICLE_CONFIG.FADE_START_TIME) {
      fadeProgress = Math.min(
        1.0,
        (this.explosionTimer - PARTICLE_CONFIG.FADE_START_TIME) /
          PARTICLE_CONFIG.FADE_DURATION
      );
    }

    // Update each particle
    this.particles.forEach((particle) => {
      const velocity = particle.userData.velocity;

      // Apply gravity
      velocity.y -= PARTICLE_CONFIG.GRAVITY_STRENGTH * delta;

      // Air resistance
      velocity.x *= PARTICLE_CONFIG.AIR_RESISTANCE;
      velocity.z *= PARTICLE_CONFIG.AIR_RESISTANCE;

      // Update position
      particle.position.add(velocity.clone().multiplyScalar(delta));

      // Update rotation
      const angularVel = particle.userData.angularVelocity;
      particle.rotation.x += angularVel.x * delta;
      particle.rotation.y += angularVel.y * delta;
      particle.rotation.z += angularVel.z * delta;

      // Slow down rotation over time
      angularVel.multiplyScalar(PARTICLE_CONFIG.ROTATION_DAMPING);

      // Pulse emissive intensity during explosion
      if (fadeProgress === 0) {
        particle.material.emissiveIntensity =
          PARTICLE_CONFIG.EMISSIVE_BASE +
          Math.sin(
            this.explosionTimer * PARTICLE_CONFIG.EMISSIVE_PULSE_FREQUENCY
          ) *
            PARTICLE_CONFIG.EMISSIVE_PULSE_AMPLITUDE;
      } else {
        // Fade out particles
        const fadeAmount = 1.0 - fadeProgress;
        particle.scale.setScalar(fadeAmount);
        particle.material.opacity = fadeAmount;
        particle.material.transparent = true;
        particle.material.emissiveIntensity =
          PARTICLE_CONFIG.EMISSIVE_BASE * fadeAmount;
      }
    });

    // Check if explosion is complete
    if (this.explosionTimer >= this.fallDuration) {
      this.finishExplosion();
    }
  }

  /**
   * Complete the explosion and trigger respawn
   */
  finishExplosion() {
    // Clear all particles
    this.clearParticles();

    this.isExploding = false;
    this.explosionTimer = 0;

    // Trigger callback to spawn fresh peach
    if (this.onComplete) {
      this.onComplete();
    }
  }

  /**
   * Force finish explosion (used when particles are disabled mid-explosion)
   */
  forceFinishExplosion() {
    if (!this.isExploding) return;

    // Immediately clear particles
    this.clearParticles();

    this.isExploding = false;
    this.explosionTimer = 0;

    // Trigger callback to spawn fresh peach
    if (this.onComplete) {
      this.onComplete();
    }
  }

  /**
   * Clear all particles from the scene
   */
  clearParticles() {
    this.particles.forEach((particle) => {
      this.particleGroup.remove(particle);
      // Don't dispose geometry - it's shared
      particle.material.dispose();
    });
    this.particles = [];
  }

  /**
   * Check if currently exploding
   */
  isActive() {
    return this.isExploding;
  }

  /**
   * Cleanup
   */
  dispose() {
    this.clearParticles();
    this.particleGeometry.dispose();
    this.particleMaterial.dispose();
    this.scene.remove(this.particleGroup);
  }
}
