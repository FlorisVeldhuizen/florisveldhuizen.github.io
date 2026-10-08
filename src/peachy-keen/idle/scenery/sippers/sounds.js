function envelope(ac, out, at, peak, length) {
  const g = ac.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(peak, at + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, at + length);
  g.connect(out);
  return g;
}

function panned(ctx, pan, volume) {
  const ac = ctx.audio();
  const p = ac.createStereoPanner();
  p.pan.value = Math.max(-0.9, Math.min(0.9, pan));
  const v = ac.createGain();
  v.gain.value = volume;
  v.connect(p).connect(ctx.audioOut());
  setTimeout(() => {
    v.disconnect();
    p.disconnect();
  }, 2000);
  return v;
}

function noise(
  ctx,
  out,
  at,
  { hz, q = 1, type = "bandpass", peak, length, rate = 1 },
) {
  const ac = ctx.audio();
  const src = ac.createBufferSource();
  src.buffer = ctx.noiseBuffer();
  src.playbackRate.value = rate;
  const f = ac.createBiquadFilter();
  f.type = type;
  f.frequency.value = hz;
  f.Q.value = q;
  src.connect(f).connect(envelope(ac, out, at, peak, length));
  src.start(at, Math.random(), length + 0.05);
  return f;
}

function tone(ctx, out, at, { from, to, length, peak, type = "sine", mid }) {
  const o = ctx.audio().createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(from, at);
  if (mid) o.frequency.exponentialRampToValueAtTime(mid, at + length * 0.4);
  o.frequency.exponentialRampToValueAtTime(to, at + length);
  o.connect(envelope(ctx.audio(), out, at, peak, length));
  o.start(at);
  o.stop(at + length + 0.05);
}

const now = (ctx) => ctx.audio().currentTime + 0.01;

export function slurp(ctx, pan, volume = 1) {
  if (!ctx.game.state.options.castSound) return;
  const out = panned(ctx, pan, volume);
  const at = now(ctx);
  noise(ctx, out, at, {
    hz: 1300 + Math.random() * 900,
    q: 5,
    peak: 0.05,
    length: 0.07,
    rate: 0.6 + Math.random() * 0.5,
  });
  tone(ctx, out, at, {
    from: 560 + Math.random() * 160,
    to: 240,
    length: 0.06,
    peak: 0.025,
  });
}

export function whoosh(ctx, pan, volume = 1, hz = 700) {
  if (!ctx.game.state.options.castSound) return;
  const out = panned(ctx, pan, volume);
  noise(ctx, out, now(ctx), {
    hz: hz * (0.85 + Math.random() * 0.3),
    q: 0.8,
    peak: 0.05,
    length: 0.12,
    rate: 0.7,
  });
}

export function sparkle(ctx, pan, volume = 1, base = 1568) {
  if (!ctx.game.state.options.castSound) return;
  const out = panned(ctx, pan, volume);
  const at = now(ctx);
  [1, 1.26, 1.5, 2].forEach((r, n) =>
    tone(ctx, out, at + n * 0.06, {
      from: base * r,
      to: base * r * 1.01,
      length: 0.35,
      peak: 0.025,
    }),
  );
}
