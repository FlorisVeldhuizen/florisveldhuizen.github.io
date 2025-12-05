import { AUDIO_CONFIG } from "./config.js";

// Audio context for sound effects (lazy initialized)
let audioContext = null;

// Sound buffers
const slapSounds = [];
let explosionSound = null;
let isLoading = false;
let isLoaded = false;

/**
 * Initialize audio context (lazy initialization)
 */
function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Load a single audio file and return the decoded buffer
 */
async function loadAudioFile(path) {
  const ctx = getAudioContext();
  const response = await fetch(path);
  const arrayBuffer = await response.arrayBuffer();
  return await ctx.decodeAudioData(arrayBuffer);
}

/**
 * Load all sound files (lazy loading - called on first interaction)
 */
async function loadSounds() {
  if (isLoaded || isLoading) return;

  isLoading = true;

  try {
    // Load slap sounds in parallel
    const slapPromises = AUDIO_CONFIG.slapSounds.map((path) =>
      loadAudioFile(path).catch((error) => {
        console.error(`Error loading slap sound from ${path}:`, error);
        return null;
      })
    );

    // Load explosion sound
    const explosionPromise = loadAudioFile(AUDIO_CONFIG.explosionSound).catch(
      (error) => {
        console.error("Error loading explosion sound:", error);
        return null;
      }
    );

    // Wait for all sounds to load
    const [loadedSlapSounds, loadedExplosionSound] = await Promise.all([
      Promise.all(slapPromises),
      explosionPromise,
    ]);

    // Store successfully loaded sounds
    loadedSlapSounds.forEach((buffer) => {
      if (buffer) slapSounds.push(buffer);
    });

    explosionSound = loadedExplosionSound;
    isLoaded = true;
  } finally {
    isLoading = false;
  }
}

/**
 * Play a slap/smack sound with randomized modulation for variety
 * @param {number} intensity - Volume intensity (0-1)
 */
function playSmackSound(intensity = 1.0) {
  // Lazy load sounds on first interaction
  if (!isLoaded && !isLoading) {
    loadSounds();
  }

  if (slapSounds.length === 0) return;

  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Randomly select one of the loaded sounds
  const randomSound = slapSounds[Math.floor(Math.random() * slapSounds.length)];

  // Create buffer source
  const source = audioContext.createBufferSource();
  source.buffer = randomSound;

  // Add pitch/speed variation for variety
  const pitchVariation =
    AUDIO_CONFIG.pitchVariationMin +
    Math.random() *
      (AUDIO_CONFIG.pitchVariationMax - AUDIO_CONFIG.pitchVariationMin);
  source.playbackRate.value = pitchVariation;

  // Create gain node for volume control
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(intensity * 0.7, now);

  // Add a high-shelf EQ for brightness control
  const highShelf = audioContext.createBiquadFilter();
  highShelf.type = "highshelf";
  highShelf.frequency.value = AUDIO_CONFIG.highShelfFrequency;
  highShelf.gain.value =
    AUDIO_CONFIG.highShelfGainMin +
    Math.random() *
      (AUDIO_CONFIG.highShelfGainMax - AUDIO_CONFIG.highShelfGainMin);

  // Add a slight low-pass variation for tonal variety
  const lowpass = audioContext.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value =
    AUDIO_CONFIG.lowpassFrequencyMin +
    Math.random() *
      (AUDIO_CONFIG.lowpassFrequencyMax - AUDIO_CONFIG.lowpassFrequencyMin);
  lowpass.Q.value = AUDIO_CONFIG.lowpassQ;

  // Connect the audio graph
  source.connect(lowpass);
  lowpass.connect(highShelf);
  highShelf.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Play the sound with offset to skip silent beginning
  source.start(now, AUDIO_CONFIG.silentOffset);
}

/**
 * Play the explosion sound effect
 * @param {number} intensity - Volume intensity (0-1)
 */
function playExplosionSound(intensity = 1.0) {
  // Lazy load sounds on first interaction
  if (!isLoaded && !isLoading) {
    loadSounds();
  }

  if (!explosionSound) return;

  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Create buffer source
  const source = audioContext.createBufferSource();
  source.buffer = explosionSound;

  // Create gain node for volume control
  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(intensity * 0.8, now);

  // Connect the audio graph
  source.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Play the sound
  source.start(now);
}

/**
 * Resume audio context (required for browsers that suspend audio until user interaction)
 */
async function resumeAudioContext() {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
}

export { loadSounds, playSmackSound, playExplosionSound, resumeAudioContext };
