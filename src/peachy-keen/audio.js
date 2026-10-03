import { AUDIO_CONFIG } from "./config";
import { clamp } from "./util";

let ctx = null;
let master = null;
let loading = null;
const slaps = [];
const rubs = [];
const grabs = [];
const kisses = [];
const glugs = [];
const snaps = [];
const slices = [];
const pats = [];
const skinBodies = [];
const lastPlayed = new Map();
let burst = null;
let massageBank = null;
let massageMap = null;
let brown = null;
let noise = null;
let rub = null;
let drag = null;
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
    const sets = [
      [AUDIO_CONFIG.slapSounds, slaps],
      [AUDIO_CONFIG.rubSounds, rubs],
      [AUDIO_CONFIG.grabSounds, grabs],
      [AUDIO_CONFIG.kissSounds, kisses],
      [AUDIO_CONFIG.glugSounds, glugs],
      [AUDIO_CONFIG.snapSounds, snaps],
      [AUDIO_CONFIG.sliceSounds, slices],
      [AUDIO_CONFIG.patSounds, pats],
      [AUDIO_CONFIG.skinBodySounds, skinBodies],
    ];
    loading = Promise.all([
      ...sets.map(([urls, buffers]) =>
        Promise.all(urls.map(decode)).then((decoded) =>
          buffers.push(...decoded),
        ),
      ),
      decode(AUDIO_CONFIG.burstSound).then((buffer) => {
        burst = buffer;
      }),
      decode(AUDIO_CONFIG.massageBankSound).then((buffer) => {
        massageBank = buffer;
        massageMap = mapMassage(buffer);
      }),
    ]).catch((error) => {
      // eslint-disable-next-line no-console
      console.error("Could not load sounds:", error);
    });
  }
  return loading;
}

function unlockAudio() {
  const c = context();
  if (c.state !== "running") c.resume().catch(() => {});
  loadSounds();
}

const GESTURES = ["pointerdown", "pointerup", "touchend", "click", "keydown"];

// Mobile browsers suspend audio on background or interruption, and a touch pointerdown may not resume it.
export function keepAudioUnlocked() {
  GESTURES.forEach((type) =>
    window.addEventListener(type, unlockAudio, {
      capture: true,
      passive: true,
    }),
  );
}

export function setMuted(muted) {
  context();
  master.gain.setTargetAtTime(muted ? 0 : 1, ctx.currentTime, 0.02);
}

function cutLows(node, hz) {
  if (!hz) return node;
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = hz;
  filter.Q.value = 0.707;
  return node.connect(filter);
}

const onsets = new WeakMap();

function onset(buffer) {
  if (!onsets.has(buffer)) {
    const data = buffer.getChannelData(0);
    let peak = 0;
    for (let i = 0; i < data.length; i += 1)
      if (Math.abs(data[i]) > Math.abs(data[peak])) peak = i;
    const floor = Math.abs(data[peak]) * 0.1;
    let start = 0;
    const window = Math.round(buffer.sampleRate * 0.002);
    for (let i = peak; i > window; i -= 1) {
      let quiet = true;
      for (let j = i - window; j < i && quiet; j += 1)
        quiet = Math.abs(data[j]) < floor;
      if (quiet) {
        start = i;
        break;
      }
    }
    onsets.set(buffer, Math.max(0, start / buffer.sampleRate - 0.003));
  }
  return onsets.get(buffer);
}

let lastSlap = null;

export function cutSlap() {
  if (!running() || !lastSlap) return;
  lastSlap.gain.setTargetAtTime(0, ctx.currentTime, 0.02);
  lastSlap = null;
}

export function playSlap(intensity, heat, oil, pitch = 1, lowCut = 0) {
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
  cutLows(src.connect(tone), lowCut).connect(gain).connect(master);
  src.start(now, onset(src.buffer));
  lastSlap = gain;

  if (oil > 0.15)
    noiseHit(2400, 500, 0.14, 0.35 * intensity * oil, "bandpass", { q: 3 });
}

export function playBurst() {
  if (!burst) return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = burst;
  src.playbackRate.value = 0.92 + Math.random() * 0.16;
  const gain = ctx.createGain();
  gain.gain.value = 0.85;
  src.connect(gain).connect(master);
  src.start(now);

  const thump = ctx.createOscillator();
  thump.frequency.setValueAtTime(160, now);
  thump.frequency.exponentialRampToValueAtTime(55, now + 0.08);
  const thumpGain = ctx.createGain();
  thumpGain.gain.setValueAtTime(0.3, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
  thump.connect(thumpGain).connect(master);
  thump.start(now);
  thump.stop(now + 0.21);
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

const HANN = Float32Array.from(
  { length: 32 },
  (_, n) => Math.sin((Math.PI * n) / 31) ** 2,
);

const TICK = Float32Array.from([0, 1, 0.62, 0.38, 0.22, 0.12, 0.06, 0.02, 0]);
const VELVET = {
  grain: 0.11,
  jump: 0.2,
  grit: 0.35,
  bright: 0.8,
  body: 1.3,
  skip: 0.45,
  lowCut: 1800,
  rate: 1,
  trim: 0.81,
};
const PULLED = {
  grain: 0.14,
  jump: 0.1,
  grit: 0.1,
  bright: 0.5,
  body: 1.4,
  skip: 0.5,
  lowCut: 1000,
  rate: 0.6,
  trim: 0.61,
};

function frameEnergy(data, hop, frames, measure) {
  const out = new Float32Array(frames);
  for (let f = 0; f < frames; f += 1) {
    let sum = 0;
    for (let i = f * hop; i < (f + 1) * hop; i += 1) sum += measure(data[i]);
    out[f] = sum / hop;
  }
  return out;
}

function blur(values, radius) {
  return values.map((_, f) => {
    let sum = 0;
    let n = 0;
    for (
      let k = Math.max(0, f - radius);
      k <= Math.min(values.length - 1, f + radius);
      k += 1
    ) {
      sum += values[k];
      n += 1;
    }
    return sum / n;
  });
}

function onePole(hz, sampleRate) {
  const a = Math.exp((-2 * Math.PI * hz) / sampleRate);
  let y = 0;
  return (x) => {
    y = (1 - a) * x + a * y;
    return y;
  };
}

// Oil-massage recordings slurp; frames heavy in 300–1800 Hz versus the hiss are the slurps.
function mapMassage(buffer) {
  const data = buffer.getChannelData(0);
  const sr = buffer.sampleRate;
  const hop = Math.round(sr * 0.01);
  const frames = Math.floor(data.length / hop);
  const env = blur(
    frameEnergy(data, hop, frames, (x) => x * x).map(Math.sqrt),
    4,
  );
  const median = Float32Array.from(env).sort()[Math.floor(frames / 2)];
  const lp300 = onePole(300, sr);
  const lp1800 = onePole(1800, sr);
  const lp3000 = onePole(3000, sr);
  const mid = new Float32Array(frames);
  const high = new Float32Array(frames);
  for (let f = 0; f < frames; f += 1) {
    for (let i = f * hop; i < (f + 1) * hop; i += 1) {
      const m = lp1800(data[i]) - lp300(data[i]);
      const h = data[i] - lp3000(data[i]);
      mid[f] += m * m;
      high[f] += h * h;
    }
  }
  const slurp = blur(
    mid.map((m, f) => m / (high[f] + 1e-9)),
    5,
  );
  const wetRank = new Float32Array(frames);
  Array.from(slurp.keys())
    .sort((a, b) => slurp[a] - slurp[b])
    .forEach((f, i) => {
      wetRank[f] = i / frames;
    });
  return { env, median, wetRank, ticks: findTicks(data, sr) };
}

function findTicks(data, sr) {
  const hop = Math.round(sr * 0.002);
  const energy = frameEnergy(
    data,
    hop,
    Math.floor(data.length / hop),
    (x) => x * x,
  );
  const wide = 20;
  const average = blur(energy, wide);
  const length = Math.round(sr * 0.008);
  let ticks = [];
  for (let ratio = 4; ticks.length < 300 && ratio > 1.6; ratio -= 0.4) {
    ticks = [];
    for (let f = wide; f < energy.length - wide; f += 1) {
      if (
        energy[f] > average[f] * ratio &&
        energy[f] >= energy[f - 1] &&
        energy[f] >= energy[f + 1]
      ) {
        const from = f * hop;
        let peak = 1e-4;
        let crossings = 0;
        for (let i = from; i < Math.min(data.length, from + length); i += 1) {
          peak = Math.max(peak, Math.abs(data[i]));
          if (i > from && data[i] >= 0 !== data[i - 1] >= 0) crossings += 1;
        }
        ticks.push({
          at: Math.max(0, (from - sr * 0.001) / sr),
          peak,
          crossings,
        });
        f += 4;
      }
    }
  }
  // Dull clicks in an oil recording are wet; keep the brighter half.
  const crossings = ticks.map((t) => t.crossings).sort((a, b) => a - b);
  const middle = crossings[Math.floor(crossings.length / 2)] ?? 0;
  return ticks.filter((t) => t.crossings >= middle);
}

function brownNoise() {
  if (!brown) {
    brown = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = brown.getChannelData(0);
    let last = 0;
    let sum = 0;
    for (let i = 0; i < data.length; i += 1) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = last;
      sum += last * last;
    }
    const scale = 0.3 / Math.sqrt(sum / data.length);
    for (let i = 0; i < data.length; i += 1) data[i] *= scale;
  }
  return brown;
}

function biquad(type, frequency, q, gain = 0) {
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  filter.Q.value = q;
  filter.gain.value = gain;
  return filter;
}

function velvetChain(settings) {
  const highpass = biquad("highpass", settings.lowCut, 0.7);
  const lowpass = biquad("lowpass", 4000, 0.5);
  const body = biquad("peaking", 400, 0.9);
  const shelf = biquad("highshelf", 9000, 0.7, -4);
  const glue = ctx.createDynamicsCompressor();
  glue.threshold.value = -30;
  glue.knee.value = 10;
  glue.ratio.value = 2.5;
  glue.attack.value = 0.01;
  glue.release.value = 0.15;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  const trim = ctx.createGain();
  trim.gain.value = settings.trim;
  highpass.connect(lowpass).connect(body).connect(shelf).connect(glue);
  glue.connect(gain).connect(trim).connect(master);

  const skin = ctx.createBufferSource();
  skin.buffer = brownNoise();
  skin.loop = true;
  const skinLowpass = biquad("lowpass", 200, 0.8);
  const skinGain = ctx.createGain();
  skinGain.gain.value = 0;
  skin
    .connect(skinLowpass)
    .connect(biquad("peaking", 130, 1, 4))
    .connect(skinGain)
    .connect(glue);
  skin.start(0, Math.random() * 2);

  const gritHighpass = biquad("highpass", 1500, 0.7);
  const gritLowpass = biquad("lowpass", 7000, 0.7);
  const gritGain = ctx.createGain();
  gritHighpass.connect(gritLowpass).connect(gritGain).connect(glue);

  return {
    settings,
    highpass,
    lowpass,
    body,
    gain,
    skin,
    skinLowpass,
    skinGain,
    gritHighpass,
    gritLowpass,
    gritGain,
    level: 0,
    smooth: null,
    heardAt: 0,
    lastAt: null,
    head: 1 + Math.random() * (massageBank.duration - 2),
    nextGrain: 0,
    nextTick: 0,
  };
}

function velvetGrain(at, offset, rate, length, gain, pan, dest, curve = HANN) {
  const src = ctx.createBufferSource();
  src.buffer = massageBank;
  src.playbackRate.value = rate;
  const envelope = ctx.createGain();
  envelope.gain.value = 0;
  envelope.gain.setValueCurveAtTime(
    curve.map((v) => v * gain),
    at,
    length,
  );
  const place = ctx.createStereoPanner();
  place.pan.value = Math.max(-1, Math.min(1, pan));
  src.connect(envelope).connect(place).connect(dest);
  const latest = massageBank.duration - length * rate - 0.005;
  src.start(at, Math.max(0, Math.min(latest, offset)), length * rate + 0.005);
}

function massageAt(values, position) {
  const frame = Math.floor(position * 100);
  return values[Math.max(0, Math.min(values.length - 1, frame))];
}

function usableMassage(chain, position) {
  return (
    massageAt(massageMap.env, position) >= massageMap.median * 0.3 &&
    massageAt(massageMap.wetRank, position) < 1 - chain.settings.skip
  );
}

function strokeGrain(chain, at, now, rate, length, oil, pan) {
  const end = massageBank.duration - 0.5;
  if (Math.random() < chain.settings.jump * 0.25)
    chain.head = 0.3 + Math.random() * (end - 0.5);
  if (chain.head > end) chain.head = 0.3;
  let position = chain.head + (at - now) * rate;
  for (
    let tries = 0;
    !usableMassage(chain, position) && tries < 400;
    tries += 1
  ) {
    chain.head = chain.head + 0.03 > end ? 0.3 : chain.head + 0.03;
    position = chain.head;
  }
  const level = Math.max(
    0.4,
    Math.min(2.5, massageMap.median / massageAt(massageMap.env, position)),
  );
  velvetGrain(
    at,
    position + (Math.random() - 0.5) * 0.004,
    (1 - oil * 0.05) * (0.99 + Math.random() * 0.02),
    length,
    level,
    pan + (Math.random() - 0.5) * 0.2,
    chain.highpass,
  );
}

function gritTick(chain, at, oil, pan) {
  const { ticks } = massageMap;
  const tick = ticks[Math.floor(Math.random() * ticks.length)];
  const size = 0.15 + 0.85 * Math.random() ** 4;
  velvetGrain(
    at,
    tick.at,
    0.9 + Math.random() * 0.25 - oil * 0.15,
    0.008 * (1 + oil * 0.6),
    (0.35 / tick.peak) * size,
    pan + (Math.random() - 0.5) * 0.5,
    chain.gritHighpass,
    TICK,
  );
}

function playVelvet(chain, now, amount, speed, oil, pan) {
  const { settings } = chain;
  const elapsed = chain.lastAt == null ? 0 : now - chain.lastAt;
  chain.lastAt = now;
  const cutoff = (3500 + speed * 7000 - oil * 2500) * settings.bright;
  chain.lowpass.frequency.setTargetAtTime(
    Math.max(800, Math.min(18000, cutoff)),
    now,
    0.05,
  );
  chain.body.gain.setTargetAtTime(2 + oil * 2, now, 0.1);
  chain.skinGain.gain.setTargetAtTime(
    0.2 * settings.body * (0.55 + oil * 0.3),
    now,
    0.08,
  );
  chain.skinLowpass.frequency.setTargetAtTime(
    170 + speed * 150 - oil * 40,
    now,
    0.1,
  );
  chain.gritHighpass.frequency.setTargetAtTime(1500 - oil * 900, now, 0.1);
  chain.gritLowpass.frequency.setTargetAtTime(
    (9000 - oil * 5500) * settings.bright,
    now,
    0.1,
  );
  chain.gritGain.gain.setTargetAtTime(
    settings.grit * (1 - oil * 0.4),
    now,
    0.05,
  );
  if (amount > 0) {
    chain.heardAt = now;
    const rate = Math.max(0.25, Math.min(2.2, speed * 1.6)) * settings.rate;
    chain.head += elapsed * rate;
    const length = settings.grain + oil * 0.04;
    chain.nextGrain = Math.max(chain.nextGrain, now + 0.01);
    while (chain.nextGrain < now + 0.06) {
      strokeGrain(chain, chain.nextGrain, now, rate, length, oil, pan);
      chain.nextGrain += (length / 2) * (0.9 + Math.random() * 0.2);
    }
    const ticksPerSecond = (20 + 260 * speed) * (1 - oil * 0.55);
    chain.nextTick = Math.max(chain.nextTick, now + 0.01);
    while (chain.nextTick < now + 0.06) {
      gritTick(chain, chain.nextTick, oil, pan);
      chain.nextTick += -Math.log(1 - Math.random()) / ticksPerSecond;
    }
    return true;
  }
  if (now - chain.heardAt <= 1) return true;
  chain.skin.stop();
  chain.gain.disconnect();
  return false;
}

export function setRub(amount, oil, pan = 0) {
  if (!running()) return;
  if (!rub) {
    if (amount <= 0 || !massageMap) return;
    rub = velvetChain(VELVET);
  }
  const now = ctx.currentTime;
  const smooth = rub.smooth ?? amount;
  rub.smooth = smooth + (amount - smooth) * (amount > smooth ? 0.2 : 0.1);
  const speed = rub.smooth / 0.6;
  const level = amount > 0 ? speed ** 1.6 * 0.36 * (0.1 + oil * 0.05) : 0;
  rub.gain.gain.setTargetAtTime(level, now, level > rub.level ? 0.08 : 0.06);
  rub.level = level;
  if (!playVelvet(rub, now, amount, speed, oil, pan)) rub = null;
}

export function setDrag(amount, oil) {
  if (!running()) return;
  if (!drag) {
    if (amount <= 0 || !massageMap) return;
    drag = velvetChain(PULLED);
  }
  const now = ctx.currentTime;
  const speed = amount / 0.6;
  const level = speed ** 0.8 * 0.04 * (1 + oil * 0.4);
  drag.gain.gain.setTargetAtTime(level, now, level > drag.level ? 0.12 : 0.04);
  drag.level = level;
  if (!playVelvet(drag, now, amount, speed, oil, 0)) drag = null;
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

const PAT = { volume: 0.35, brightness: 3500, range: 0.7, body: 0.25 };
const WOBBLE = {
  volume: 0.6,
  brightness: 4000,
  range: 0.8,
  body: 0.35,
  swings: 3,
  decay: 0.44,
};
const PAT_VARIETY = 0.6;
const lastPat = new Map();

function vary(amount) {
  return 1 + (Math.random() * 2 - 1) * amount * PAT_VARIETY;
}

function pickPat(buffers, weight, spread) {
  const clampIndex = (i) => clamp(i, 0, buffers.length - 1);
  let i = clampIndex(
    Math.round(weight * (buffers.length - 1) + (Math.random() - 0.5) * spread),
  );
  if (buffers.length > 1 && i === lastPat.get(buffers))
    i = clampIndex(
      i === buffers.length - 1 || (i > 0 && Math.random() < 0.5)
        ? i - 1
        : i + 1,
    );
  lastPat.set(buffers, i);
  return buffers[i];
}

function patLayer(at, buffer, { volume, cutoff, pan, skip = 0 }) {
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.playbackRate.value = vary(0.035);
  const soften = ctx.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = cutoff;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  const panner = ctx.createStereoPanner();
  panner.pan.value = pan;
  src.connect(soften).connect(gain).connect(panner).connect(master);
  src.start(at, onset(buffer) + skip);
}

function pat(at, weight, pan, oil, mix) {
  const { range } = mix;
  const heavy = clamp(0.5 + (clamp(weight, 0, 1) - 0.5) * range * 2, 0, 1);
  const volume =
    mix.volume * (1 - range + range * (0.2 + 0.8 * heavy ** 1.3)) * vary(0.25);
  const cutoff =
    mix.brightness *
    (1 - range * 0.5 + range * heavy) *
    (1 - oil * 0.4) *
    vary(0.3);
  const side = clamp(
    pan + (Math.random() * 2 - 1) * 0.25 * PAT_VARIETY,
    -0.8,
    0.8,
  );
  const spread = 1.2 + PAT_VARIETY * 2.4;
  patLayer(at, pickPat(pats, heavy, spread), {
    volume,
    cutoff,
    pan: side,
    skip: Math.random() * 0.003 * PAT_VARIETY,
  });
  if (heavy > 0.35 && Math.random() < 0.35 * PAT_VARIETY)
    patLayer(
      at + 0.008 + Math.random() * 0.014,
      pickPat(pats, heavy * 0.6, spread),
      {
        volume: volume * (0.25 + Math.random() * 0.2),
        cutoff: cutoff * 0.7,
        pan: -side * 0.5,
      },
    );
  if (skinBodies.length)
    patLayer(
      at + Math.random() * 0.006 * PAT_VARIETY,
      pickPat(skinBodies, Math.random(), spread),
      {
        volume:
          mix.body * volume * (0.3 + 0.7 * heavy) * (0.6 + Math.random() * 0.4),
        cutoff: cutoff * 0.6,
        pan: side * 0.6,
        skip: Math.random() * 0.004 * PAT_VARIETY,
      },
    );
}

export function playPat(weight, pan, oil) {
  if (!running() || !pats.length) return;
  pat(ctx.currentTime, weight, pan, oil, PAT);
}

export function playWobble(strength, swingSeconds, oil) {
  if (!running() || !pats.length) return;
  const now = ctx.currentTime;
  const swings = Math.max(
    1,
    Math.round(WOBBLE.swings * (0.35 + strength * 0.65)),
  );
  for (let k = 0; k < swings; k += 1) {
    const fade = WOBBLE.decay ** k;
    pat(
      now + 0.04 + swingSeconds * (k + 1),
      strength * fade,
      k % 2 ? 0.15 : -0.15,
      oil,
      {
        ...WOBBLE,
        volume: WOBBLE.volume * (0.5 + 0.5 * fade),
      },
    );
  }
}

export function playSettle() {
  noiseHit(500, 180, 0.12, 0.14, "lowpass");
}

export function playSlice() {
  playVariation(slices, {
    rate: 0.9 + Math.random() * 0.2,
    volume: 0.45 + Math.random() * 0.15,
  });
}

export function playSplash() {
  if (!running()) return;
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

let lastLensHit = 0;

function wetGrain(at, { from, to = from, q, length, volume }) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer();
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = q;
  filter.frequency.setValueAtTime(from, at);
  filter.frequency.exponentialRampToValueAtTime(to, at + length);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(
    volume,
    at + Math.min(0.01, length / 4),
  );
  gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
  src.connect(filter).connect(gain).connect(master);
  src.start(at, Math.random() * 0.5, length + 0.02);
}

export function playLensHit(amount) {
  if (!running() || ctx.currentTime - lastLensHit < 0.35) return;
  const now = ctx.currentTime;
  lastLensHit = now;
  // Grains closer than ~20 ms fuse into one wet event; spread wider they read as rain.
  const spread = 0.04 + amount * 0.05;
  const grains = 8 + Math.round(amount * 16);
  for (let n = 0; n < grains; n += 1) {
    const t = spread * Math.random() ** 2;
    wetGrain(now + t, {
      from: 700 + Math.random() * 2300,
      q: 0.8 + Math.random() * 0.8,
      length: 0.004 + Math.random() * 0.01,
      volume:
        (0.025 + amount * 0.06) *
        (1 - t / spread) ** 1.5 *
        (0.4 + Math.random() * 0.6),
    });
  }
  wetGrain(now + 0.004, {
    from: 500,
    to: 1500,
    q: 3,
    length: 0.06 + amount * 0.05,
    volume: 0.03 + amount * 0.07,
  });
  if (amount < 0.3) return;
  for (let n = 0; n < 5; n += 1) {
    const pitch = 800 + Math.random() * 1200;
    tone(now + 0.01 + Math.random() * spread, {
      from: pitch,
      to: pitch * 1.8,
      sweep: 0.015,
      length: 0.022,
      volume: 0.02 + amount * 0.035,
      attack: 0.002,
    });
  }
}

export function playSquish(amount) {
  noiseHit(1100, 260, 0.13, 0.25 + amount * 0.3);
  noiseHit(2200, 700, 0.06, 0.12 + amount * 0.1);
}

function pickVariation(buffers) {
  const last = lastPlayed.get(buffers) ?? -1;
  const next =
    (last + 1 + Math.floor(Math.random() * (buffers.length - 1))) %
    buffers.length;
  lastPlayed.set(buffers, next);
  return buffers[next];
}

function playVariation(buffers, { rate, volume, cutoff = 20000, lowCut = 0 }) {
  if (!running() || !buffers.length) return;
  const src = ctx.createBufferSource();
  src.buffer = pickVariation(buffers);
  src.playbackRate.value = rate;
  const soften = ctx.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = cutoff;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  cutLows(src.connect(soften), lowCut).connect(gain).connect(master);
  src.start();
}

export function playGrab(oil = 0) {
  if (!running() || !grabs.length) return;
  const now = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = pickVariation(grabs);
  const rate = (0.85 + Math.random() * 0.3) * (1 - oil * 0.1);
  src.playbackRate.value = rate;
  const soften = ctx.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = 12000 - oil * 6000;
  const gain = ctx.createGain();
  const length = Math.min(0.2, src.buffer.duration / rate);
  const attack = 0.008 / length;
  const volume = 0.34 + Math.random() * 0.06;
  const envelope = Float32Array.from({ length: 128 }, (_, n) => {
    const at = n / 127;
    const shape =
      at < attack
        ? Math.sin((Math.PI / 2) * (at / attack))
        : Math.cos((Math.PI / 2) * ((at - attack) / (1 - attack)));
    return volume * shape ** 2;
  });
  gain.gain.setValueCurveAtTime(envelope, now, length);
  src.connect(soften).connect(gain).connect(master);
  src.start(now);
  src.stop(now + length);
}

export function playKnead(oil, amount, cutoff = 9000 - oil * 5000) {
  if (!running() || !rubs.length) return;
  const src = ctx.createBufferSource();
  src.buffer = pickVariation(rubs);
  const rate = (0.94 + Math.random() * 0.12) * (1.06 - oil * 0.12);
  src.playbackRate.value = rate;
  const soften = ctx.createBiquadFilter();
  soften.type = "lowpass";
  soften.frequency.value = cutoff;
  const gain = ctx.createGain();
  const swell = Float32Array.from(
    { length: 32 },
    (_, n) => Math.min(1, Math.sin((Math.PI * n) / 31) * 1.4) * 0.13 * amount,
  );
  const now = ctx.currentTime;
  const length = (src.buffer.duration / rate) * 0.6;
  gain.gain.setValueCurveAtTime(swell, now, length);
  src.connect(soften).connect(gain).connect(master);
  src.start(now, 0, length * rate);
}

export function playKiss() {
  playVariation(kisses, {
    rate: 0.88 + Math.random() * 0.26,
    volume: 0.35 + Math.random() * 0.25,
    cutoff: 5000 + Math.random() * 15000,
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
  playVariation(glugs, {
    rate: 0.85 + Math.random() * 0.35,
    volume: 0.075 + amount * 0.125,
    cutoff: 6000,
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

function snapSlap(amount, crisp) {
  if (slaps.length) {
    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = slaps[Math.floor(Math.random() * slaps.length)];
    src.playbackRate.value = 1.1 + amount * 0.25 + Math.random() * 0.12;
    const soften = ctx.createBiquadFilter();
    soften.type = "lowpass";
    soften.frequency.value = 2500 + amount * 7000;
    const gain = ctx.createGain();
    gain.gain.value = crisp ? 0.35 : 0.12 + amount * 0.55;
    cutLows(src.connect(soften), crisp ? 250 : 0)
      .connect(gain)
      .connect(master);
    src.start(now, onset(src.buffer));
  }
}

export function playSnap(amount, crisp = false) {
  if (!running()) return;
  playVariation(snaps, {
    rate: 0.9 + amount * 0.2 + Math.random() * 0.1,
    volume: 0.1 + amount * 0.45,
    lowCut: crisp ? 300 : 0,
  });
  snapSlap(amount, crisp);
}

export function playFibre(amount) {
  if (!running()) return;
  noiseHit(
    2600 + amount * 1800,
    700,
    0.03 + amount * 0.03,
    0.12 + amount * 0.4,
  );
  snapSlap(amount, false);
}

export function playDing() {
  if (!running()) return;
  const now = ctx.currentTime;
  tone(now, { from: 1568, to: 1568, length: 0.25, volume: 0.1 });
  tone(now + 0.12, { from: 2093, to: 2093, length: 0.35, volume: 0.1 });
}

export function playNotes(
  notes,
  { gap = 0.08, length = 0.3, volume = 0.08 } = {},
) {
  if (!running()) return;
  const now = ctx.currentTime;
  notes.forEach((hz, n) =>
    tone(now + n * gap, { from: hz, to: hz, length, volume }),
  );
}

function pad(notes, type, cutoff) {
  const gain = ctx.createGain();
  gain.gain.value = 0;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = cutoff;
  filter.connect(gain).connect(master);
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 4.8;
  const depth = ctx.createGain();
  depth.gain.value = 2.5;
  lfo.connect(depth);
  lfo.start();
  notes.forEach((hz, n) => {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = hz;
    osc.detune.value = (n % 2 ? 1 : -1) * 6;
    depth.connect(osc.detune);
    osc.connect(filter);
    osc.start();
  });
  return gain;
}

function swell(now, period) {
  return Math.max(0, Math.sin((now / period) * 2 * Math.PI)) ** 2;
}

let choir = null;

export function setChoir(amount) {
  if (!running()) return;
  if (!choir) {
    if (amount <= 0) return;
    choir = pad([220, 277.18, 329.63, 440], "triangle", 1400);
  }
  const now = ctx.currentTime;
  choir.gain.setTargetAtTime(amount * 0.018 * swell(now, 37), now, 0.8);
}

let chant = null;

export function setChant(amount) {
  if (!running()) return;
  if (!chant) {
    if (amount <= 0) return;
    chant = pad([73.42, 110, 146.83], "sawtooth", 320);
  }
  const now = ctx.currentTime;
  const breathe = 0.7 + 0.3 * Math.sin(now * 0.8);
  chant.gain.setTargetAtTime(
    amount * 0.02 * breathe * swell(now, 29),
    now,
    0.4,
  );
}

export function playThump(amount = 1) {
  if (!running()) return;
  tone(ctx.currentTime, {
    from: 70,
    to: 38,
    sweep: 0.16,
    length: 0.22,
    volume: 0.1 * amount,
    attack: 0.005,
  });
}

export function playWhoosh(amount = 1) {
  noiseHit(3000, 600, 0.18, 0.12 * amount);
}

export function playBuy(pitch = 1) {
  if (!running()) return;
  const now = ctx.currentTime;
  tone(now, {
    from: 520 * pitch,
    to: 780 * pitch,
    sweep: 0.05,
    length: 0.12,
    volume: 0.07,
    attack: 0.004,
  });
}

let buzzer = null;

export function setBuzz(amount, contact = 0) {
  if (!running()) return;
  if (!buzzer) {
    if (amount <= 0) return;
    const src = ctx.createOscillator();
    src.type = "sawtooth";
    src.frequency.value = 120;
    const band = ctx.createBiquadFilter();
    band.type = "lowpass";
    band.frequency.value = 900;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(band).connect(gain).connect(master);
    src.start();
    buzzer = { src, band, gain, heardAt: ctx.currentTime };
  }
  const now = ctx.currentTime;
  buzzer.gain.gain.setTargetAtTime(amount * (0.05 + contact * 0.06), now, 0.02);
  buzzer.src.frequency.setTargetAtTime(
    (95 + amount * 60) * (1 - contact * 0.12),
    now,
    0.08,
  );
  buzzer.band.frequency.setTargetAtTime(
    (900 + amount * 1800) * (1 - contact * 0.7),
    now,
    0.05,
  );
  buzzer = expireLoop(buzzer, amount > 0);
}

export const DISCO_BPM = 100;
const STEP = 60 / DISCO_BPM / 4;
const SWING = 0.18;
export const DISCO_FADE = 2.8;
const DISCO_LEVEL = 0.42;
const MUFFLE_OPEN = 20000;
const MUFFLE_CLOSED = 220;
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
const ROOTS = [33, 38, 29, 28];
const CHORDS = [
  [55, 60, 64, 67, 71],
  [53, 57, 60, 64, 69],
  [57, 60, 64, 67, 71],
  [56, 59, 62, 67],
];
const STRINGS = [
  [64, 67, 71, 76],
  [65, 69, 72, 76],
  [64, 67, 72, 76],
  [64, 68, 71, 74],
];
const RUN = [69, 71, 72, 74, 76, 79, 81, 83];
const BASS_LINE = [
  [0, 0, 3, 1],
  [3, 12, 1, 0.45],
  [6, 7, 2, 0.8],
  [8, 0, 2, 0.9],
  [10, 12, 1, 0.55],
  [11, 10, 1, 0.7],
  [13, 7, 1, 0.6],
];
const COMP = [
  [0, 3, 1],
  [3, 1, 0.55],
  [7, 1, 0.65],
  [10, 4, 0.9],
];
const LEAD = {
  5: [
    [2, 76, 2],
    [4, 74, 1],
    [5, 72, 1],
    [6, 69, 5],
    [12, 72, 1],
    [13, 75, 1],
    [14, 76, 2],
  ],
  7: [
    [0, 79, 3],
    [4, 76, 2],
    [6, 74, 1],
    [7, 72, 1],
    [8, 69, 3],
    [11, 67, 1],
    [12, 69, 4],
  ],
};
let disco = null;

function route(
  node,
  { verb = 0, pan = 0, chorus = 0, echo = 0, sway = 0 } = {},
) {
  const side = Math.round(pan * 10) / 10;
  const key = [verb, side, chorus, echo, sway].join();
  let input = disco.routes.get(key);
  if (!input) {
    input = ctx.createGain();
    let out = input;
    if (side || sway) {
      const panner = ctx.createStereoPanner();
      panner.pan.value = side;
      if (sway) {
        const lfo = ctx.createOscillator();
        lfo.frequency.value = sway;
        const depth = ctx.createGain();
        depth.gain.value = 0.35;
        lfo.connect(depth).connect(panner.pan);
        lfo.start();
        disco.lfos.push(lfo);
      }
      out = input.connect(panner);
    }
    out.connect(disco.bus);
    [
      [verb, disco.verb],
      [chorus, disco.chorus],
      [echo, disco.echo],
    ].forEach(([amount, target]) => {
      if (!amount) return;
      const send = ctx.createGain();
      send.gain.value = amount;
      out.connect(send).connect(target);
    });
    disco.routes.set(key, input);
  }
  node.connect(input);
}

function envelope(at, attack, peak, hold, release) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + attack);
  gain.gain.setValueAtTime(peak, at + attack + hold);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + hold + release);
  return gain;
}

function oscillator(at, type, frequency, stop) {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, at);
  osc.start(at);
  osc.stop(stop);
  return osc;
}

function noiseAt(at, type, frequency, q, length, volume, sends) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer();
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  filter.Q.value = q;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + length);
  route(src.connect(filter).connect(gain), sends);
  src.start(at, Math.random() * 0.5, length + 0.02);
}

function kick(at) {
  const osc = oscillator(at, "sine", 115, at + 0.45);
  osc.frequency.exponentialRampToValueAtTime(44, at + 0.13);
  route(osc.connect(envelope(at, 0.003, 0.62, 0.03, 0.32)));
  noiseAt(at, "bandpass", 1800, 1, 0.012, 0.08);
}

function clap(at) {
  [
    [0, 1900, 0.16],
    [0.005, 2400, 0.1],
  ].forEach(([offset, f, v]) =>
    noiseAt(at + offset, "bandpass", f, 2.2, 0.1, v, {
      verb: 0.4,
      pan: offset ? 0.2 : -0.1,
    }),
  );
}

function bongo(at, high) {
  const f = high ? 390 : 250;
  const pan = high ? 0.35 : -0.3;
  const osc = oscillator(at, "sine", f, at + 0.2);
  osc.frequency.exponentialRampToValueAtTime(f * 0.78, at + 0.12);
  route(osc.connect(envelope(at, 0.002, 0.16, 0, 0.14)), { verb: 0.15, pan });
  noiseAt(at, "bandpass", 3000, 2, 0.015, 0.05, { pan });
}

function rhodes(at, frequency, length, velocity, pan) {
  const stop = at + length + 0.1;
  const out = ctx.createGain();
  out.gain.setValueAtTime(0.0001, at);
  out.gain.exponentialRampToValueAtTime(0.028 * velocity, at + 0.006);
  out.gain.exponentialRampToValueAtTime(0.012 * velocity, at + 0.6);
  out.gain.exponentialRampToValueAtTime(0.0001, at + length);
  [
    [0, 1, 1.6 + velocity, 0.9],
    [4, 14, 0.5 + velocity * 0.6, 0.06],
  ].forEach(([detune, ratio, index, decay]) => {
    const carrier = oscillator(at, "sine", frequency, stop);
    carrier.detune.value = detune;
    const modulator = oscillator(at, "sine", frequency * ratio, stop);
    const depth = ctx.createGain();
    depth.gain.setValueAtTime(frequency * index, at);
    depth.gain.exponentialRampToValueAtTime(frequency * 0.05, at + decay);
    modulator.connect(depth).connect(carrier.frequency);
    carrier.connect(out);
  });
  route(out, { verb: 0.3, chorus: 0.4, pan, sway: 3.4 });
}

function strings(at, notes, length, volume) {
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.5;
  filter.frequency.setValueAtTime(1400, at);
  filter.frequency.linearRampToValueAtTime(3200, at + length * 0.5);
  filter.frequency.linearRampToValueAtTime(1800, at + length);
  const high = ctx.createBiquadFilter();
  high.type = "highpass";
  high.frequency.value = 260;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.linearRampToValueAtTime(volume, at + 0.45);
  gain.gain.setValueAtTime(volume, at + length - 0.3);
  gain.gain.linearRampToValueAtTime(0.0001, at + length + 0.4);
  notes.forEach((n) =>
    [-11, 0, 11].forEach((cents) => {
      const osc = oscillator(at, "sawtooth", midi(n), at + length + 0.45);
      osc.detune.value = cents + (Math.random() - 0.5) * 4;
      osc.connect(high);
    }),
  );
  route(high.connect(filter).connect(gain), { verb: 0.5, chorus: 1 });
}

function stringRun(at) {
  RUN.forEach((n, k) => {
    const t = at + k * (STEP / 2);
    const gain = envelope(t, 0.02, 0.022, 0.03, 0.18);
    [-8, 8].forEach((cents) => {
      const osc = oscillator(t, "sawtooth", midi(n), t + 0.3);
      osc.detune.value = cents;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 3000;
      osc.connect(filter).connect(gain);
    });
    route(gain, { verb: 0.5, chorus: 0.8 });
  });
}

function wah(at, chord) {
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 6;
  filter.frequency.setValueAtTime(420, at);
  filter.frequency.exponentialRampToValueAtTime(1800, at + 0.08);
  filter.frequency.exponentialRampToValueAtTime(650, at + 0.16);
  const gain = envelope(at, 0.008, 0.035, 0.03, 0.1);
  chord.slice(0, 3).forEach((n) => {
    oscillator(at, "sawtooth", midi(n), at + 0.17).connect(filter);
  });
  route(filter.connect(gain), { verb: 0.15, pan: 0.3 });
}

const warmth = (() => {
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i += 1)
    curve[i] = Math.tanh(((i / 255) * 2 - 1) * 2.2);
  return curve;
})();

function bass(at, frequency, length, velocity) {
  const stop = at + length + 0.05;
  const sub = oscillator(at, "sine", frequency, stop);
  const subGain = envelope(
    at,
    0.006,
    0.34 * velocity,
    length * 0.5,
    length * 0.5,
  );
  route(sub.connect(subGain));
  const mid = oscillator(at, "sawtooth", frequency, stop);
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 3;
  filter.frequency.setValueAtTime(500 + velocity * 900, at);
  filter.frequency.exponentialRampToValueAtTime(
    260,
    at + Math.min(length, 0.2),
  );
  const high = ctx.createBiquadFilter();
  high.type = "highpass";
  high.frequency.value = 110;
  const shaper = ctx.createWaveShaper();
  shaper.curve = warmth;
  const midGain = envelope(
    at,
    0.006,
    0.09 * velocity,
    length * 0.4,
    length * 0.5,
  );
  route(mid.connect(filter).connect(shaper).connect(high).connect(midGain));
}

const VOWELS = {
  ooh: [
    [300, 1],
    [870, 0.35],
    [2250, 0.08],
  ],
  aah: [
    [730, 1],
    [1090, 0.5],
    [2440, 0.15],
  ],
};

function voice(at, note, length, from) {
  const f = midi(note);
  const stop = at + length + 0.6;
  const source = oscillator(at, "sawtooth", from ? midi(from) : f, stop);
  source.frequency.exponentialRampToValueAtTime(f, at + 0.06);
  const vibrato = oscillator(at, "sine", 5.3, stop);
  const depth = ctx.createGain();
  depth.gain.setValueAtTime(0, at);
  depth.gain.linearRampToValueAtTime(f * 0.012, at + Math.min(length, 0.4));
  vibrato.connect(depth).connect(source.frequency);
  const gain = envelope(at, 0.07, 0.11, length * 0.7, 0.45);
  VOWELS.ooh.forEach(([freq, level], k) => {
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 9;
    band.frequency.setValueAtTime(freq, at);
    band.frequency.linearRampToValueAtTime(VOWELS.aah[k][0], at + length);
    const amount = ctx.createGain();
    amount.gain.value = level;
    source.connect(band).connect(amount).connect(gain);
  });
  route(gain, { verb: 0.5, pan: -0.1 });
  noiseAt(at, "bandpass", 1400, 1.2, length * 0.8, 0.006, { verb: 0.4 });
}

function scratch(at, chord, open) {
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 3;
  filter.frequency.value = open ? 1500 : 1100;
  const gain = envelope(at, 0.003, open ? 0.03 : 0.018, 0, open ? 0.09 : 0.035);
  chord.slice(1, 3).forEach((n) => {
    oscillator(at, "square", midi(n + 12), at + 0.12).connect(filter);
  });
  route(filter.connect(gain), { verb: 0.1, pan: 0.45 });
}

function bell(at, frequency) {
  const carrier = oscillator(at, "sine", frequency, at + 1.6);
  const modulator = oscillator(at, "sine", frequency * 3.5, at + 1.6);
  const depth = ctx.createGain();
  depth.gain.setValueAtTime(frequency * 1.2, at);
  depth.gain.exponentialRampToValueAtTime(frequency * 0.02, at + 0.8);
  modulator.connect(depth).connect(carrier.frequency);
  route(carrier.connect(envelope(at, 0.004, 0.018, 0, 1.4)), {
    verb: 0.6,
    echo: 0.2,
    pan: (Math.random() - 0.5) * 0.8,
  });
}

function discoStep(index, at) {
  const step = index % 16;
  const bar8 = Math.floor(index / 16) % 8;
  const bar = bar8 % CHORDS.length;
  const chord = CHORDS[bar];
  const root = ROOTS[bar];
  if (step % 4 === 0) kick(at);
  const shaker = [0.04, 0.016, 0.032, 0.022][step % 4];
  noiseAt(at, "bandpass", 6500, 1.4, 0.05, shaker, { pan: 0.2 });
  if (step % 4 === 2)
    noiseAt(at, "highpass", 8000, 1, 0.16, 0.032, { verb: 0.1, pan: -0.2 });
  if (step === 4 || step === 12) clap(at);
  if (step === 7 || step === 9) bongo(at, true);
  if (step === 15 || (bar % 2 && step === 3)) bongo(at, false);
  if (step === 2 || step === 10) wah(at, chord);
  if (step % 2 === 1) scratch(at, chord, step % 4 === 3);
  if (bar8 >= 4 && (step === 0 || step === 6 || step === 11))
    bell(at, midi(chord[(step + bar8) % chord.length] + 24));
  BASS_LINE.forEach(([s, offset, length, velocity]) => {
    if (s === step) bass(at, midi(root + offset), length * STEP, velocity);
  });
  if (step === 14) {
    const next = ROOTS[(bar + 1) % ROOTS.length];
    bass(at, midi(next + (next > root ? -1 : 1)), 2 * STEP, 0.75);
  }
  if (step === 0) strings(at, STRINGS[bar], STEP * 16, 0.0075);
  if (bar8 === 7 && step === 12) stringRun(at);
  COMP.forEach(([s, length, velocity]) => {
    if (s !== step) return;
    chord.forEach((n, k) =>
      rhodes(at, midi(n), length * STEP + 0.4, velocity, k % 2 ? 0.25 : -0.25),
    );
  });
  const phrase = LEAD[bar8];
  const position = phrase ? phrase.findIndex(([s]) => s === step) : -1;
  if (position >= 0) {
    const [, note, length] = phrase[position];
    voice(at, note, length * STEP, position > 0 ? phrase[position - 1][1] : 0);
  }
}

function scheduleDisco() {
  const now = ctx.currentTime;
  while (disco.start + disco.next * STEP < now + 0.12) {
    const beatAt = disco.start + disco.next * STEP;
    const at = beatAt + (disco.next % 2 ? SWING * STEP : 0);
    if (beatAt >= now - 0.01) discoStep(disco.next, Math.max(at, now));
    disco.next += 1;
  }
}

function reverb() {
  const length = Math.floor(ctx.sampleRate * 2.6);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let c = 0; c < 2; c += 1) {
    const data = impulse.getChannelData(c);
    for (let i = 0; i < length; i += 1)
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3.4;
  }
  const convolver = ctx.createConvolver();
  convolver.buffer = impulse;
  return convolver;
}

function ensemble(out, lfos) {
  const input = ctx.createGain();
  [
    [0.012, 0.47, -0.7],
    [0.017, 0.61, 0.7],
    [0.022, 0.29, 0],
  ].forEach(([base, rate, pan]) => {
    const delay = ctx.createDelay(0.05);
    delay.delayTime.value = base;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = rate;
    const depth = ctx.createGain();
    depth.gain.value = 0.0035;
    lfo.connect(depth).connect(delay.delayTime);
    lfo.start();
    lfos.push(lfo);
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    const level = ctx.createGain();
    level.gain.value = 0.45;
    input.connect(delay).connect(level).connect(panner).connect(out);
  });
  return input;
}

function makeEcho(out) {
  const input = ctx.createGain();
  const delay = ctx.createDelay(1);
  delay.delayTime.value = STEP * 3;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.22;
  const damp = ctx.createBiquadFilter();
  damp.type = "lowpass";
  damp.frequency.value = 2400;
  input.connect(delay).connect(damp).connect(feedback).connect(delay);
  damp.connect(out);
  return input;
}

function freeze(param, now) {
  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  return param;
}

export function startDisco() {
  if (disco) {
    if (!disco.stopping) return;
    clearTimeout(disco.stopping);
    disco.stopping = null;
    const now = ctx.currentTime;
    freeze(disco.bus.gain, now).linearRampToValueAtTime(DISCO_LEVEL, now + 0.4);
    freeze(disco.muffle.frequency, now).exponentialRampToValueAtTime(
      MUFFLE_OPEN,
      now + 0.4,
    );
    return;
  }
  context();
  const bus = ctx.createGain();
  bus.gain.value = DISCO_LEVEL;
  const muffle = ctx.createBiquadFilter();
  muffle.type = "lowpass";
  muffle.frequency.value = MUFFLE_OPEN;
  muffle.Q.value = 1.5;
  const glue = ctx.createDynamicsCompressor();
  glue.threshold.value = -16;
  glue.knee.value = 10;
  glue.ratio.value = 3;
  glue.attack.value = 0.01;
  glue.release.value = 0.2;
  bus.connect(muffle).connect(glue).connect(master);
  const lfos = [];
  const verb = reverb();
  const wet = ctx.createGain();
  wet.gain.value = 0.55;
  verb.connect(wet).connect(bus);
  disco = {
    start: ctx.currentTime + 0.1,
    next: 0,
    bus,
    muffle,
    stopping: null,
    verb,
    chorus: ensemble(bus, lfos),
    echo: makeEcho(bus),
    lfos,
    routes: new Map(),
  };
  disco.timer = setInterval(scheduleDisco, 25);
  scheduleDisco();
}

export function stopDisco() {
  if (!disco || disco.stopping) return;
  const fading = disco;
  const now = ctx.currentTime;
  freeze(fading.bus.gain, now).linearRampToValueAtTime(0, now + DISCO_FADE);
  freeze(fading.muffle.frequency, now).exponentialRampToValueAtTime(
    MUFFLE_CLOSED,
    now + DISCO_FADE,
  );
  fading.stopping = setTimeout(
    () => {
      clearInterval(fading.timer);
      fading.lfos.forEach((lfo) => lfo.stop());
      fading.bus.disconnect();
      if (disco === fading) disco = null;
    },
    DISCO_FADE * 1000 + 100,
  );
}

export function discoBeat() {
  if (!disco || !running()) return null;
  return ((ctx.currentTime - disco.start) * DISCO_BPM) / 60;
}
