import { AUDIO_CONFIG } from "./config";

let ctx = null;
let master = null;
let loading = null;
const slaps = [];
let burst = null;
let noise = null;
let rub = null;
let slide = null;

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

  if (oil > 0.15)
    noiseHit(2400, 500, 0.14, 0.35 * intensity * oil, "bandpass", { q: 3 });
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

function noiseLoop() {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer();
  src.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  const gain = ctx.createGain();
  gain.gain.value = 0;
  src.connect(band).connect(gain).connect(master);
  src.start();
  return { src, band, gain, heardAt: ctx.currentTime };
}

function expireLoop(loop, audible) {
  const now = ctx.currentTime;
  if (audible) loop.heardAt = now;
  if (now - loop.heardAt < 1) return loop;
  loop.src.stop();
  loop.src.disconnect();
  loop.gain.disconnect();
  return null;
}

export function setRub(amount, oil) {
  if (!running()) return;
  if (!rub) {
    if (amount <= 0) return;
    rub = noiseLoop();
  }
  const now = ctx.currentTime;
  rub.gain.gain.setTargetAtTime(amount * (0.05 + oil * 0.1), now, 0.05);
  rub.band.frequency.setTargetAtTime(700 + amount * 900 - oil * 300, now, 0.05);
  rub.band.Q.value = 1.5 + oil * 5;
  rub = expireLoop(rub, amount > 0);
}

function noiseHit(
  freqFrom,
  freqTo,
  length,
  volume,
  type = "bandpass",
  { q = 2, attack = 0 } = {},
) {
  if (!running()) return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer();
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(freqFrom, now);
  filter.frequency.exponentialRampToValueAtTime(freqTo, now + length);
  const gain = ctx.createGain();
  if (attack) {
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + attack);
  } else {
    gain.gain.setValueAtTime(volume, now);
  }
  gain.gain.exponentialRampToValueAtTime(0.001, now + length);
  src.connect(filter).connect(gain).connect(master);
  src.start(now, Math.random() * 0.5, length + 0.05);
}

export function playSlide(duration, from, to) {
  noiseHit(from, to, duration, 0.22, "bandpass", {
    q: 1.2,
    attack: duration * 0.4,
  });
}

export function setSlide(speed, height) {
  if (!running()) return;
  if (!slide) {
    if (speed <= 0) return;
    slide = noiseLoop();
    slide.band.Q.value = 1.2;
  }
  const now = ctx.currentTime;
  slide.gain.gain.setTargetAtTime(Math.min(1, speed) * 0.22, now, 0.02);
  slide.band.frequency.setTargetAtTime(900 + height * 2300, now, 0.02);
  slide = expireLoop(slide, speed > 0);
}

export function playSettle() {
  noiseHit(500, 180, 0.12, 0.14, "lowpass");
}

export function playSlice() {
  noiseHit(7000, 1800, 0.18, 0.5);
}

export function playTear(duration) {
  if (!running()) return;
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
  if (!running()) return;
  noiseHit(1800, 260, 0.38, 0.45, "lowpass");
  noiseHit(3200, 900, 0.12, 0.3);
  const now = ctx.currentTime;
  for (let n = 0; n < 7; n += 1) {
    const pitch = 900 + Math.random() * 1600;
    tone(now + 0.04 + Math.random() * 0.32, {
      from: pitch,
      to: pitch * 1.8,
      sweep: 0.03,
      length: 0.04,
      volume: 0.05 + Math.random() * 0.05,
      attack: 0.004,
    });
  }
}

export function playSquish(amount) {
  noiseHit(1100, 260, 0.13, 0.25 + amount * 0.3);
  noiseHit(2200, 700, 0.06, 0.12 + amount * 0.1);
}

export function playKiss() {
  noiseHit(3200, 1100, 0.05, 0.45);
  if (!running()) return;
  tone(ctx.currentTime + 0.03, {
    from: 900,
    to: 1600,
    sweep: 0.05,
    length: 0.07,
    volume: 0.12,
    attack: 0.008,
  });
}

export function playHeartbeat(strength) {
  if (!running()) return;
  const now = ctx.currentTime;
  [
    [0, 1],
    [0.2, 0.7],
  ].forEach(([offset, level]) =>
    tone(now + offset, {
      from: 95,
      to: 50,
      sweep: 0.18,
      length: 0.24,
      volume: 0.16 * strength * level,
      attack: 0.04,
    }),
  );
}

export function playGlug(amount) {
  if (!running()) return;
  const now = ctx.currentTime;
  const from = 180 + Math.random() * 120;
  tone(now, {
    from,
    to: from * 2.6,
    sweep: 0.07,
    length: 0.09,
    volume: 0.06 + amount * 0.08,
  });
}

export function playCork(open) {
  noiseHit(open ? 1800 : 900, open ? 600 : 400, 0.05, open ? 0.5 : 0.3);
  if (!running()) return;
  tone(ctx.currentTime, {
    from: open ? 520 : 380,
    to: open ? 260 : 300,
    sweep: 0.08,
    length: 0.1,
    volume: 0.18,
    attack: 0.005,
  });
}

function running() {
  return ctx && ctx.state === "running";
}

function tone(at, { from, to, sweep, length, volume, attack = 0.01 }) {
  const osc = ctx.createOscillator();
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(to, at + (sweep ?? length));
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  osc.connect(gain).connect(master);
  osc.start(at);
  osc.stop(at + length + 0.02);
}

export function playSnap(amount) {
  if (!running()) return;
  const now = ctx.currentTime;
  noiseHit(
    2600 + amount * 1800,
    700,
    0.03 + amount * 0.03,
    0.12 + amount * 0.4,
  );
  if (slaps.length) {
    const src = ctx.createBufferSource();
    src.buffer = slaps[Math.floor(Math.random() * slaps.length)];
    src.playbackRate.value = 1.1 + amount * 0.25 + Math.random() * 0.12;
    const soften = ctx.createBiquadFilter();
    soften.type = "lowpass";
    soften.frequency.value = 2500 + amount * 7000;
    const gain = ctx.createGain();
    gain.gain.value = 0.12 + amount * 0.55;
    src.connect(soften).connect(gain).connect(master);
    src.start(now, AUDIO_CONFIG.silentOffset);
  }
}

export function playDing() {
  if (!running()) return;
  const now = ctx.currentTime;
  tone(now, { from: 1568, to: 1568, length: 0.25, volume: 0.1 });
  tone(now + 0.12, { from: 2093, to: 2093, length: 0.35, volume: 0.1 });
}
