import { AUDIO_CONFIG } from "./config";

let ctx = null;
let master = null;
let loading = null;
const slaps = [];
let burst = null;
let noise = null;
let rub = null;

function context() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -6;
    limiter.knee.value = 6;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.002;
    limiter.release.value = 0.15;
    master.connect(limiter).connect(ctx.destination);
  }
  return ctx;
}

async function decode(url) {
  const response = await fetch(url);
  return context().decodeAudioData(await response.arrayBuffer());
}

function noiseBuffer() {
  if (!noise) {
    const c = context();
    noise = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  }
  return noise;
}

export function loadSounds() {
  if (!loading) {
    loading = Promise.all([
      Promise.all(AUDIO_CONFIG.slapSounds.map(decode)).then((buffers) =>
        slaps.push(...buffers),
      ),
      decode(AUDIO_CONFIG.burstSound).then((buffer) => {
        burst = buffer;
      }),
    ]).catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Could not load sounds:", error);
    });
  }
  return loading;
}

export async function unlockAudio() {
  const c = context();
  if (c.state === "suspended") await c.resume();
  return loadSounds();
}

export function setMuted(muted) {
  context();
  master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.02);
}

function wetSquelch(now, intensity, oil) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer();
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 3;
  band.frequency.setValueAtTime(2400, now);
  band.frequency.exponentialRampToValueAtTime(500, now + 0.12);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.35 * intensity * oil, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
  src.connect(band).connect(gain).connect(master);
  src.start(now, Math.random() * 0.5, 0.16);
}

export function playSlap(intensity, heat, oil, pitch = 1) {
  if (slaps.length === 0) return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = slaps[Math.floor(Math.random() * slaps.length)];
  const variation =
    AUDIO_CONFIG.pitchVariationMin +
    Math.random() *
      (AUDIO_CONFIG.pitchVariationMax - AUDIO_CONFIG.pitchVariationMin);
  src.playbackRate.value =
    variation * pitch * (1 + heat * 0.18) * (1 - oil * 0.08);

  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 12000 - oil * 6000;
  const gain = ctx.createGain();
  gain.gain.value = 0.35 + intensity * 0.5;
  src.connect(tone).connect(gain).connect(master);
  src.start(now, AUDIO_CONFIG.silentOffset);

  if (oil > 0.15) wetSquelch(now, intensity, oil);
}

export function playBurst() {
  if (!burst) return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = burst;
  const gain = ctx.createGain();
  gain.gain.value = 0.85;
  src.connect(gain).connect(master);
  src.start(now);

  const thump = ctx.createOscillator();
  thump.frequency.setValueAtTime(120, now);
  thump.frequency.exponentialRampToValueAtTime(38, now + 0.35);
  const thumpGain = ctx.createGain();
  thumpGain.gain.setValueAtTime(0.5, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
  thump.connect(thumpGain).connect(master);
  thump.start(now);
  thump.stop(now + 0.45);
}

export function setRub(amount, oil) {
  if (!ctx || ctx.state !== "running") return;
  if (!rub) {
    if (amount <= 0) return;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer();
    src.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(band).connect(gain).connect(master);
    src.start();
    rub = { band, gain };
  }
  const now = ctx.currentTime;
  rub.gain.gain.setTargetAtTime(amount * (0.05 + oil * 0.1), now, 0.05);
  rub.band.frequency.setTargetAtTime(700 + amount * 900 - oil * 300, now, 0.05);
  rub.band.Q.value = 1.5 + oil * 5;
}

function noiseHit(freqFrom, freqTo, length, volume, type = "bandpass") {
  if (!ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer();
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = 2;
  filter.frequency.setValueAtTime(freqFrom, now);
  filter.frequency.exponentialRampToValueAtTime(freqTo, now + length);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + length);
  src.connect(filter).connect(gain).connect(master);
  src.start(now, Math.random() * 0.5, length + 0.05);
}

export function playSlice() {
  noiseHit(7000, 1800, 0.18, 0.5);
}

export function playTear(duration) {
  if (!ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;
  const end = now + duration;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer();
  src.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 4;
  band.frequency.setValueAtTime(700, now);
  band.frequency.exponentialRampToValueAtTime(2600, end);
  const fibres = ctx.createOscillator();
  fibres.type = "square";
  fibres.frequency.setValueAtTime(18, now);
  fibres.frequency.exponentialRampToValueAtTime(70, end);
  const fibreDepth = ctx.createGain();
  fibreDepth.gain.value = 0.5;
  const crackle = ctx.createGain();
  crackle.gain.value = 0.5;
  fibres.connect(fibreDepth).connect(crackle.gain);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, end);
  gain.gain.linearRampToValueAtTime(0, end + 0.01);
  src.connect(band).connect(crackle).connect(gain).connect(master);
  src.start(now, Math.random() * 0.5);
  fibres.start(now);
  src.stop(end + 0.02);
  fibres.stop(end + 0.02);
}

export function playSplash() {
  if (!ctx || ctx.state !== "running") return;
  noiseHit(1800, 260, 0.38, 0.45, "lowpass");
  noiseHit(3200, 900, 0.12, 0.3);
  const now = ctx.currentTime;
  for (let n = 0; n < 7; n += 1) {
    const at = now + 0.04 + Math.random() * 0.32;
    const osc = ctx.createOscillator();
    const pitch = 900 + Math.random() * 1600;
    osc.frequency.setValueAtTime(pitch, at);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.8, at + 0.03);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(
      0.05 + Math.random() * 0.05,
      at + 0.004,
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.04);
    osc.connect(gain).connect(master);
    osc.start(at);
    osc.stop(at + 0.05);
  }
}

export function playStretch(duration) {
  if (!ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(260, now);
  osc.frequency.exponentialRampToValueAtTime(820, now + duration);
  const wobble = ctx.createOscillator();
  wobble.frequency.value = 14;
  const wobbleDepth = ctx.createGain();
  wobbleDepth.gain.value = 18;
  wobble.connect(wobbleDepth).connect(osc.frequency);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + duration * 0.8);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain).connect(master);
  osc.start(now);
  wobble.start(now);
  osc.stop(now + duration);
  wobble.stop(now + duration);
}

const VOICE_START = 0.25;
const VOICE_END = 0.7;
let lastMoan = 0;
let lastGesture = "";

function breath(at, { length, volume, from = 1400, to = 700 }) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer();
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 0.9;
  band.frequency.setValueAtTime(from, at);
  band.frequency.exponentialRampToValueAtTime(to, at + length);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + length * 0.35);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  src.connect(band).connect(gain).connect(master);
  src.start(at, Math.random() * 0.4, length + 0.05);
}

function grain(
  at,
  {
    length,
    rate,
    bend = [1, 1],
    volume,
    offset = VOICE_START,
    tone = 2600,
    wobble = 18,
  },
) {
  const src = ctx.createBufferSource();
  src.buffer = burst;
  src.playbackRate.setValueCurveAtTime(
    Float32Array.from(bend, (b) => rate * b),
    at,
    length,
  );
  src.detune.value = (Math.random() - 0.5) * 120;
  const vibrato = ctx.createOscillator();
  vibrato.frequency.value = 4.5 + Math.random() * 2;
  const vibratoDepth = ctx.createGain();
  vibratoDepth.gain.value = wobble;
  vibrato.connect(vibratoDepth).connect(src.detune);
  const warm = ctx.createBiquadFilter();
  warm.type = "lowpass";
  warm.frequency.value = tone;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(
    volume,
    at + Math.min(0.05, length * 0.3),
  );
  gain.gain.setValueAtTime(volume, at + length * 0.55);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  src.connect(warm).connect(gain).connect(master);
  const available = VOICE_END + 0.1 - offset;
  src.start(at, offset, Math.min(available, length * rate * 1.3));
  vibrato.start(at);
  vibrato.stop(at + length);
}

const GESTURES = {
  hum(at, v, pitch) {
    grain(at, {
      length: 0.5,
      rate: pitch * 0.88,
      bend: [1, 1.04, 0.97, 0.92],
      volume: v * 0.8,
      tone: 750,
      wobble: 12,
    });
    breath(at + 0.35, { length: 0.35, volume: v * 0.08, from: 900, to: 500 });
  },
  ah(at, v, pitch) {
    grain(at, {
      length: 0.42,
      rate: pitch * 1.04,
      bend: [0.94, 1.1, 1.04, 0.9],
      volume: v,
      tone: 3200,
    });
  },
  stutter(at, v, pitch) {
    const count = 2 + Math.round(Math.random());
    for (let i = 0; i < count; i += 1) {
      grain(at + i * 0.16, {
        length: 0.14,
        offset: 0.3,
        rate: pitch * (1 + i * 0.07),
        bend: [1, 1.06],
        volume: v * (0.85 + i * 0.1),
        tone: 3000,
      });
    }
    breath(at + count * 0.16, { length: 0.3, volume: v * 0.1 });
  },
  long(at, v, pitch) {
    grain(at, {
      length: 0.62,
      rate: pitch * 0.8,
      bend: [0.96, 1.08, 1.03, 0.9, 0.84],
      volume: v,
      tone: 1900,
      wobble: 32,
    });
  },
  gasp(at, v, pitch) {
    breath(at, { length: 0.22, volume: v * 0.18, from: 700, to: 2400 });
    grain(at + 0.18, {
      length: 0.2,
      offset: 0.28,
      rate: pitch * 1.22,
      bend: [1.05, 0.95],
      volume: v * 0.8,
      tone: 3400,
    });
  },
  sigh(at, v, pitch) {
    grain(at, {
      length: 0.45,
      rate: pitch * 0.92,
      bend: [1.06, 0.98, 0.8],
      volume: v * 0.75,
      tone: 1400,
    });
    breath(at + 0.3, { length: 0.5, volume: v * 0.12, from: 1300, to: 400 });
  },
};

const MOODS = [
  ["hum", "sigh", "hum"],
  ["ah", "long", "gasp", "hum", "sigh"],
  ["stutter", "ah", "gasp", "long"],
];

function ready() {
  return burst && ctx && ctx.state === "running";
}

export function playMoan(intensity, heat, gesture = null) {
  if (!ready()) return;
  const now = ctx.currentTime;
  if (now - lastMoan < 0.75) return;
  let name = gesture;
  if (!name) {
    const mood = MOODS[Math.min(2, Math.floor(intensity * 3))].filter(
      (g) => g !== lastGesture,
    );
    name = mood[Math.floor(Math.random() * mood.length)];
  }
  lastGesture = name;
  lastMoan = now;
  const pitch = 0.94 + heat * 0.2 + Math.random() * 0.1;
  GESTURES[name](now, 0.3 + intensity * 0.35, pitch);
}

export function playClimax(duration) {
  if (!ready()) return;
  const now = ctx.currentTime;
  lastMoan = now + duration + 0.6;
  let t = 0;
  let i = 0;
  while (t < duration) {
    const k = t / duration;
    grain(now + t, {
      length: 0.16 + (1 - k) * 0.08,
      offset: 0.3,
      rate: 0.98 + k * 0.32,
      bend: [1, 1.07],
      volume: 0.3 + k * 0.25,
      tone: 2400 + k * 1200,
    });
    t += 0.3 - k * 0.15 + (i % 2) * 0.03;
    i += 1;
  }
  grain(now + duration, {
    length: 0.7,
    rate: 1.2,
    bend: [1.1, 1.18, 1, 0.82],
    volume: 0.6,
    tone: 3400,
    wobble: 40,
  });
  breath(now + duration + 0.6, {
    length: 0.6,
    volume: 0.1,
    from: 1200,
    to: 350,
  });
}

export function playSquish(amount) {
  noiseHit(1100, 260, 0.13, 0.25 + amount * 0.3);
  noiseHit(2200, 700, 0.06, 0.12 + amount * 0.1);
}

export function playSnap(amount) {
  noiseHit(5200, 1400, 0.05, 0.5 + amount * 0.4, "highpass");
  if (slaps.length && ctx.state === "running") {
    const src = ctx.createBufferSource();
    src.buffer = slaps[Math.floor(Math.random() * slaps.length)];
    src.playbackRate.value = 1.35 + Math.random() * 0.15;
    const gain = ctx.createGain();
    gain.gain.value = 0.35 + amount * 0.35;
    src.connect(gain).connect(master);
    src.start(ctx.currentTime, AUDIO_CONFIG.silentOffset);
  }
}

export function playKiss() {
  noiseHit(3200, 1100, 0.05, 0.45);
  if (!ctx || ctx.state !== "running") return;
  const now = ctx.currentTime + 0.03;
  const osc = ctx.createOscillator();
  osc.frequency.setValueAtTime(900, now);
  osc.frequency.exponentialRampToValueAtTime(1600, now + 0.05);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
  osc.connect(gain).connect(master);
  osc.start(now);
  osc.stop(now + 0.08);
}

export function playHeartbeat(strength) {
  if (!ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;
  [
    [0, 1],
    [0.2, 0.7],
  ].forEach(([offset, level]) => {
    const at = now + offset;
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(95, at);
    osc.frequency.exponentialRampToValueAtTime(50, at + 0.18);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.16 * strength * level, at + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.24);
    osc.connect(gain).connect(master);
    osc.start(at);
    osc.stop(at + 0.26);
  });
}
