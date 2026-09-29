import ass2Sound from "./assets/ass2.m4a?url";
import ass3Sound from "./assets/ass3.m4a?url";
import ass5Sound from "./assets/ass5.m4a?url";
import uhSound from "./assets/uh.m4a?url";

export const PEACH_CONFIG = {
  TARGET_MODEL_HEIGHT: 3,
  MODEL_ROTATION_DEGREES: 300,
  SKIN_TINT: 0xffb3ba,
  MAX_HITS: 8,
  MAX_PRINTS: 8,
  PRINT_LIFE: 7,
};

export const FABRIC = {
  rest: 0.9,
  press: 0.85,
  bulge: 0.9,
  width: 1,
  depth: 0.01,
};

export const TOOLS = {
  hand: { force: 1, reach: 0.8, print: 1.4, pitch: 1, heat: 1 },
  lips: { force: 0.3, reach: 0.55, print: 0.8, pitch: 1, heat: 0.6 },
  buzz: { force: 0.25, reach: 0.5, print: 0, pitch: 1.2, heat: 0.4 },
};

export const PHYSICS_CONFIG = {
  SUBSTEP: 1 / 120,
  POSITION_STIFFNESS: 55,
  POSITION_DAMPING: 4.5,
  ROTATION_STIFFNESS: 45,
  ROTATION_DAMPING: 3.8,
  SQUASH_STIFFNESS: 180,
  SQUASH_DAMPING: 6,
};

export const FIRMNESS = {
  firm: {
    grab: 0.6,
    jiggle: 0.7,
    reach: 0.9,
    dentFrequency: 30,
    dentDecay: 7,
    wobble: 0.18,
    stiffness: 1.45,
    squash: 0.8,
    pitch: 1.08,
    body: 1,
    splash: 0,
    sway: 1,
    rebound: 0.75,
    bulge: 0.6,
    depth: 0.6,
  },
  ripe: {
    grab: 0.7,
    jiggle: 0.85,
    reach: 0.95,
    dentFrequency: 28.5,
    dentDecay: 5.4,
    wobble: 0.24,
    stiffness: 1.38,
    squash: 0.86,
    pitch: 1.04,
    body: 0.88,
    splash: 0.15,
    sway: 1.18,
    rebound: 0.85,
    bulge: 1,
    depth: 1,
  },
  juicy: {
    grab: 0.8,
    jiggle: 1,
    reach: 1,
    dentFrequency: 27,
    dentDecay: 3.8,
    wobble: 0.3,
    stiffness: 1.32,
    squash: 0.92,
    pitch: 1,
    body: 0.75,
    splash: 0.3,
    sway: 1.35,
    rebound: 0.95,
    bulge: 1.3,
    depth: 1.35,
  },
};

export const INTERACTION_CONFIG = {
  MIN_SWIPE_SPEED: 0.7,
  FULL_SWIPE_SPEED: 3,
  SAMPLE_WINDOW_MS: 60,
  SAMPLE_MIN_MS: 40,
  COMBO_WINDOW_MS: 900,
  HEAT_PER_SMACK: 2.8,
  HEAT_PER_SPEED: 2.4,
  HEAT_DECAY: 7,
  HEAT_DECAY_DELAY: 0.6,
  OIL_POUR_RATE: 0.35,
  OIL_DRY_RATE: 0.015,
  RESPAWN_DELAY: 1.3,
  CHARGE_TIME: 0.45,
  CHARGE_STRIP_TIME: 0.2,
  CHARGE_PEEL_TIME: 0.4,
  RESPAWN_DURATION: 0.9,
  TWERK_IDLE_SECONDS: 20,
  TWERK_BEAT_HZ: 2.2,
  TWERK_BEATS: 8,
  GRAB_FLICK_MS: 150,
  GRAB_FLICK_SPEED: 1.1,
  GRAB_STILL_SPEED: 0.08,
  GRAB_KNEAD_SECONDS: 1.4,
  GRAB_DENT: 0.055,
  GRAB_DENT_RADIUS: 0.38,
  GRAB_REACH: 1.05,
  MASSAGE_MIN_SPEED: 0.05,
  MASSAGE_DENT: 0.045,
  MASSAGE_DENT_RADIUS: 0.45,
  MASSAGE_DRAG: 0.09,
  MASSAGE_RADIUS: 0.7,
  WAISTBAND_FROM: 0.55,
  CLAP_GAP_MS: 320,
  HEARTBEAT_FROM: 0.45,
};

export const AUDIO_CONFIG = {
  slapSounds: [ass2Sound, ass3Sound, ass5Sound],
  burstSound: uhSound,
  pitchVariationMin: 0.88,
  pitchVariationMax: 1.12,
  silentOffset: 0.08,
};
