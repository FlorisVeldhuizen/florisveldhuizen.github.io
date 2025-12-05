/**
 * Central Configuration File
 * Single source of truth for all shared constants across the application
 */

// ===== LIGHTING CONFIGURATION =====
export const LIGHTING_CONFIG = {
  // Number of lights per mode
  NORMAL_MODE_LIGHTS: 6,
  OILED_MODE_LIGHTS: 24,

  // Ring light geometry
  RING_RADIUS: 3.5,
  RING_TUBE_RADIUS: 0.15,
  RING_RADIAL_SEGMENTS: 16,
  RING_TUBULAR_SEGMENTS: 100,
  RING_POSITION_Z: 6,

  // Ring light properties
  RING_COLOR: 0xffd9a8,
  RING_EMISSIVE_INTENSITY: 2,
  RING_LIGHT_DISTANCE: 100,
  RING_LIGHT_INTENSITY_OILED: 2.5,
  RING_LIGHT_INTENSITY_NORMAL: 6.0,

  // Ambient light
  AMBIENT_COLOR: 0xffeedd,
  AMBIENT_INTENSITY: 0.25,

  // Key light (directional)
  KEY_LIGHT_COLOR: 0xffffff,
  KEY_LIGHT_INTENSITY: 1.2,
  KEY_LIGHT_POSITION: { x: 2, y: 5, z: 8 },

  // Rim light (back highlight)
  RIM_LIGHT_COLOR: 0xffe4d6,
  RIM_LIGHT_INTENSITY: 2.0,
  RIM_LIGHT_DISTANCE: 100,
  RIM_LIGHT_POSITION: { x: 0, y: 1, z: -6 },

  // Bottom fill light
  BOTTOM_FILL_COLOR: 0xffd9c8,
  BOTTOM_FILL_INTENSITY: 0.6,
  BOTTOM_FILL_DISTANCE: 100,
  BOTTOM_FILL_POSITION: { x: 0, y: -3, z: 4 },
};

// ===== PHYSICS CONFIGURATION =====
export const PHYSICS_CONFIG = {
  // Rigid body physics
  DAMPING: 0.95,
  RETURN_FORCE: 0.05,
  ANGULAR_DAMPING: 0.92,
  VELOCITY_SETTLE_THRESHOLD: 0.01,
  ROTATION_RETURN_FACTOR: 0.05,

  // Soft body physics
  VERTEX_POSITION_TOLERANCE: 0.0001,
  PROXIMITY_THRESHOLD: 0.3,
  PROXIMITY_SAMPLING_STEP_DIVISOR: 100,
  SETTLE_THRESHOLD: 0.01,
  MAX_VELOCITY_CAP: 0.5,
  MAX_VELOCITY_CAP_SINGLE: 0.25,
  NORMAL_RECALC_INTERVAL: 3,
};

// ===== INTERACTION CONFIGURATION =====
export const INTERACTION_CONFIG = {
  SMACK_COOLDOWN_MS: 200,
  VELOCITY_HISTORY_SIZE: 5,
  MIN_VELOCITY_THRESHOLD: 2,
  RAGE_DECAY_RATE: 15,
  RAGE_EXPLOSION_THRESHOLD: 100,
  RAGE_BASE_INCREASE: 4,
  RAGE_VELOCITY_MULTIPLIER: 3,
  RESPAWN_DURATION: 0.9,
  // Impact marks
  IMPACT_MARK_RADIUS: 0.32, // Size of impact marks
  IMPACT_MARK_BASE_DURATION: 3.5, // Base duration in seconds
  IMPACT_MARK_MAX_DURATION: 6.0, // Max duration for strong hits
  IMPACT_MARK_INTENSITY_SCALE: 0.6, // Scale intensity for subtlety
  IMPACT_MARK_STRENGTH: 0.4, // Overall visual strength
  MAX_IMPACT_MARKS: 8, // Maximum number of simultaneous marks
};

// ===== PARTICLE CONFIGURATION =====
export const PARTICLE_CONFIG = {
  SPHERE_SEGMENTS: 8,
  RADIUS: 0.05,
  MAX_PARTICLES: 300,
  EXPLOSION_FORCE: 8.0,
  FALL_DURATION: 1.8,
  FADE_START_TIME: 1.0,
  FADE_DURATION: 0.8,
  GRAVITY_STRENGTH: 15.0,
  AIR_RESISTANCE: 0.99,
  ROTATION_DAMPING: 0.98,
  UPWARD_BIAS: 2.0,
  EMISSIVE_BASE: 0.3,
  EMISSIVE_PULSE_AMPLITUDE: 0.2,
  EMISSIVE_PULSE_FREQUENCY: 10,
};

// ===== AUDIO CONFIGURATION =====
export const AUDIO_CONFIG = {
  slapSounds: [
    "./assets/ass2.m4a",
    "./assets/ass3.m4a",
    "./assets/ass5.m4a",
  ],
  explosionSound: "./assets/uh.m4a",
  pitchVariationMin: 0.85,
  pitchVariationMax: 1.15,
  highShelfFrequency: 2000,
  highShelfGainMin: 3,
  highShelfGainMax: 6,
  lowpassFrequencyMin: 8000,
  lowpassFrequencyMax: 12000,
  lowpassQ: 0.7,
  silentOffset: 0.08,
};

// ===== PEACH MODEL CONFIGURATION =====
export const PEACH_CONFIG = {
  NORMAL_MAP_SIZE: 512,
  NORMAL_MAP_OCTAVES: 4,
  NORMAL_MAP_HEIGHT_SCALE: 0.3,
  TARGET_MODEL_HEIGHT: 3,
  MODEL_ROTATION_DEGREES: 300,
};
