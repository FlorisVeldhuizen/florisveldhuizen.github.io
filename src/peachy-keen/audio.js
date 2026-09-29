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

export function playSlide(duration, from, to) {
  if (!ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer();
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(from, now);
  filter.frequency.exponentialRampToValueAtTime(to, now + duration);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + duration * 0.4);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  src.connect(filter).connect(gain).connect(master);
  src.start(now, Math.random() * 0.5, duration + 0.05);
}

export function playSettle() {
  noiseHit(500, 180, 0.12, 0.14, "lowpass");
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

export function playGlug(amount) {
  if (!ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;
  const from = 180 + Math.random() * 120;
  const osc = ctx.createOscillator();
  osc.frequency.setValueAtTime(from, now);
  osc.frequency.exponentialRampToValueAtTime(from * 2.6, now + 0.07);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.06 + amount * 0.08, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
  osc.connect(gain).connect(master);
  osc.start(now);
  osc.stop(now + 0.1);
}

export function playCork(open) {
  noiseHit(open ? 1800 : 900, open ? 600 : 400, 0.05, open ? 0.5 : 0.3);
  if (!ctx || ctx.state !== "running") return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.frequency.setValueAtTime(open ? 520 : 380, now);
  osc.frequency.exponentialRampToValueAtTime(open ? 260 : 300, now + 0.08);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
  osc.connect(gain).connect(master);
  osc.start(now);
  osc.stop(now + 0.12);
}

function running() {
  return ctx && ctx.state === "running";
}

function tone(at, { type = "sine", from, to, length, volume, filter }) {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(to, at + length);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(volume, at + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  let out = osc;
  if (filter) {
    const lowpass = ctx.createBiquadFilter();
    lowpass.frequency.value = filter;
    out = osc.connect(lowpass);
  }
  out.connect(gain).connect(master);
  osc.start(at);
  osc.stop(at + length + 0.02);
  return osc;
}

export function playDing() {
  if (!running()) return;
  const now = ctx.currentTime;
  tone(now, { from: 1568, to: 1568, length: 0.25, volume: 0.1 });
  tone(now + 0.12, { from: 2093, to: 2093, length: 0.35, volume: 0.1 });
}
