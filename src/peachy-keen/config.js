import ass2Sound from "./assets/ass2.m4a?url";
import ass3Sound from "./assets/ass3.m4a?url";
import ass5Sound from "./assets/ass5.m4a?url";
import uhSound from "./assets/uh.m4a?url";
import rub1Sound from "./assets/rub1.m4a?url";
import rub2Sound from "./assets/rub2.m4a?url";
import rub3Sound from "./assets/rub3.m4a?url";
import rub4Sound from "./assets/rub4.m4a?url";
import rub5Sound from "./assets/rub5.m4a?url";
import rub6Sound from "./assets/rub6.m4a?url";
import grab4Sound from "./assets/grab4.m4a?url";
import grab5Sound from "./assets/grab5.m4a?url";
import grab6Sound from "./assets/grab6.m4a?url";
import grab8Sound from "./assets/grab8.m4a?url";
import grab9Sound from "./assets/grab9.m4a?url";
import kiss1Sound from "./assets/kiss1.m4a?url";
import kiss2Sound from "./assets/kiss2.m4a?url";
import kiss3Sound from "./assets/kiss3.m4a?url";
import kiss4Sound from "./assets/kiss4.m4a?url";
import kiss5Sound from "./assets/kiss5.m4a?url";
import kiss6Sound from "./assets/kiss6.m4a?url";
import kiss7Sound from "./assets/kiss7.m4a?url";
import kiss8Sound from "./assets/kiss8.m4a?url";
import kiss9Sound from "./assets/kiss9.m4a?url";
import kiss10Sound from "./assets/kiss10.m4a?url";
import snap1Sound from "./assets/snap1.m4a?url";
import snap2Sound from "./assets/snap2.m4a?url";
import snap3Sound from "./assets/snap3.m4a?url";
import snap4Sound from "./assets/snap4.m4a?url";
import snap5Sound from "./assets/snap5.m4a?url";
import snap6Sound from "./assets/snap6.m4a?url";
import snap7Sound from "./assets/snap7.m4a?url";
import snap8Sound from "./assets/snap8.m4a?url";
import snap9Sound from "./assets/snap9.m4a?url";
import snap10Sound from "./assets/snap10.m4a?url";
import slice1Sound from "./assets/slice1.m4a?url";
import slice2Sound from "./assets/slice2.m4a?url";
import slice3Sound from "./assets/slice3.m4a?url";
import glug1Sound from "./assets/glug1.m4a?url";
import glug2Sound from "./assets/glug2.m4a?url";
import glug3Sound from "./assets/glug3.m4a?url";
import glug4Sound from "./assets/glug4.m4a?url";
import glug5Sound from "./assets/glug5.m4a?url";
import glug6Sound from "./assets/glug6.m4a?url";
import glug7Sound from "./assets/glug7.m4a?url";
import glug8Sound from "./assets/glug8.m4a?url";
import glug9Sound from "./assets/glug9.m4a?url";
import glug10Sound from "./assets/glug10.m4a?url";
import massageBankSound from "./assets/massagebank.m4a?url";

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
  WIGGLE_SPEED: 6,
  WIGGLE_SWING: 0.5,
  WIGGLE_TURNS: 2,
  WIGGLE_GAP: 0.22,
  WOBBLE_FROM: 0.25,
  HEARTBEAT_FROM: 0.45,
};

const inNumberOrder = (files) =>
  Object.keys(files)
    .sort((a, b) => a.match(/\d+/)[0] - b.match(/\d+/)[0])
    .map((path) => files[path]);

export const AUDIO_CONFIG = {
  slapSounds: [ass2Sound, ass3Sound, ass5Sound],
  burstSound: uhSound,
  rubSounds: [rub1Sound, rub2Sound, rub3Sound, rub4Sound, rub5Sound, rub6Sound],
  grabSounds: [grab4Sound, grab5Sound, grab6Sound, grab8Sound, grab9Sound],
  kissSounds: [
    kiss1Sound,
    kiss2Sound,
    kiss3Sound,
    kiss4Sound,
    kiss5Sound,
    kiss6Sound,
    kiss7Sound,
    kiss8Sound,
    kiss9Sound,
    kiss10Sound,
  ],
  glugSounds: [
    glug1Sound,
    glug2Sound,
    glug3Sound,
    glug4Sound,
    glug5Sound,
    glug6Sound,
    glug7Sound,
    glug8Sound,
    glug9Sound,
    glug10Sound,
  ],
  snapSounds: [
    snap1Sound,
    snap2Sound,
    snap3Sound,
    snap4Sound,
    snap5Sound,
    snap6Sound,
    snap7Sound,
    snap8Sound,
    snap9Sound,
    snap10Sound,
  ],
  sliceSounds: [slice1Sound, slice2Sound, slice3Sound],
  patSounds: inNumberOrder(
    import.meta.glob("./assets/pat*.m4a", {
      eager: true,
      query: "?url",
      import: "default",
    }),
  ),
  skinBodySounds: inNumberOrder(
    import.meta.glob("./assets/skinbody*.m4a", {
      eager: true,
      query: "?url",
      import: "default",
    }),
  ),
  massageBankSound,
  pitchVariationMin: 0.88,
  pitchVariationMax: 1.12,
};
