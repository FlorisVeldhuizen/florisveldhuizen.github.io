/* eslint-disable no-param-reassign -- card and hover state objects are updated in place each frame */
import {
  AdditiveBlending,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Sprite,
  SpriteMaterial,
  Vector3,
} from "three";
import { softTexture } from "../../shapes";
import { CARDS, makeDeck } from "./deck";
import createFrame from "./frame";
import goldDust from "./dust";
import peachRenderer from "./peach-shot";
import Impacts from "./impacts";
import { CARD_H, CARD_W, cardGeometry, cardMaterial } from "./card-mesh";
import {
  GlowPoints,
  chime,
  damp,
  easeInOut,
  easeOut,
  rand,
  sayLater,
  smooth,
} from "./fx";

const MAX = 5;
const ORIGIN = new Vector3();
const MIN_READ = 150;
const TOP_MARGIN = 27;
const EDGE = 24;
const TIMES = {
  lift: 1.3,
  flip: 1.5,
  hold: 2.6,
  dissolve: 1.9,
  gone: 0.7,
  enter: 1.5,
};
const FAN = { radius: 3.2, pivot: -0.85, step: 0.15, back: 1.1 };
const RAISED = new Set(["lift", "flip", "hold", "dissolve"]);

const backOut = (x) => {
  const t = Math.min(1, Math.max(0, x)) - 1;
  return 1 + 2.2 * t * t * t + 1.2 * t * t;
};

function pickTick(ctx, hz, volume) {
  const ac = ctx.audio();
  if (ac.state !== "running") return;
  const t = ac.currentTime;
  const src = ac.createBufferSource();
  src.buffer = ctx.noiseBuffer();
  const band = ac.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = hz;
  band.Q.value = 3;
  const g = ac.createGain();
  g.gain.setValueAtTime(volume, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  src.connect(band).connect(g).connect(ctx.audioOut());
  src.start(t, Math.random());
  src.stop(t + 0.07);
}

function springTo(o, key, target, dt, w, z) {
  const v = `${key}V`;
  const steps = Math.ceil(dt / (1 / 120));
  const h = dt / steps;
  for (let n = 0; n < steps; n += 1) {
    o[v] += (w * w * (target - o[key]) - 2 * z * w * o[v]) * h;
    o[key] += o[v] * h;
  }
}

function reader(ctx) {
  const poses = peachRenderer(ctx);
  const deck = makeDeck(ctx.renderer, poses);
  let baked = false;
  let alive = true;
  ctx.onDispose(() => {
    alive = false;
    poses.dispose();
  });
  const idle = (fn) =>
    window.requestIdleCallback
      ? window.requestIdleCallback(fn, { timeout: 500 })
      : setTimeout(fn, 16);
  // One or two distinct materials per warm pass keeps each compile frame short.
  const warmUp = () => {
    const kids = [...ctx.group.children];
    const shown = kids.map((o) => o.visible);
    const seen = new Set();
    const batches = [];
    kids.forEach((o) => {
      const key = []
        .concat(o.material ?? [])
        .map(
          (m) => m.type + (m.isShaderMaterial ? m.fragmentShader.length : ""),
        )
        .join();
      if (seen.has(key)) return;
      seen.add(key);
      if (!batches.length || batches[batches.length - 1].length >= 2)
        batches.push([]);
      batches[batches.length - 1].push(o);
    });
    ctx.group.visible = true;
    const pass = (n) => {
      if (!alive) return;
      if (n >= batches.length) {
        kids.forEach((o, k) => {
          o.visible = shown[k];
        });
        baked = true;
        return;
      }
      kids.forEach((o) => {
        o.visible = batches[n].includes(o);
      });
      ctx.warm().then(() => pass(n + 1));
    };
    pass(0);
  };
  const step = () => {
    if (!alive) return;
    const job = deck.jobs.shift();
    if (job) {
      if (job() === false) deck.jobs.unshift(job);
      idle(step);
      return;
    }
    poses.dispose();
    warmUp();
  };
  idle(step);
  ctx.group.visible = false;

  ctx.onDispose(() => deck.dispose());
  const geometry = cardGeometry();
  const frame = createFrame(ctx);
  const glowMap = softTexture("rgba(255,214,170,1)", "rgba(255,150,190,0)");
  const shadowMap = softTexture("rgba(14,0,12,0.85)", "rgba(14,0,12,0)");
  ctx.onDispose(() => [glowMap, shadowMap].forEach((t) => t.dispose()));
  const halo = new Sprite(
    new SpriteMaterial({
      map: glowMap,
      blending: AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0,
    }),
  );
  ctx.group.add(halo);
  const shadowGeometry = new PlaneGeometry(1, 1);

  const used = new Set();
  const nextFace = () => {
    let f = Math.floor(Math.random() * CARDS.length);
    for (let k = 0; k < CARDS.length && used.has(f); k += 1)
      f = (f + 1) % CARDS.length;
    used.add(f);
    return f;
  };

  const cards = Array.from({ length: MAX }, () => {
    const material = cardMaterial(deck.style, deck.back);
    const mesh = new Mesh(geometry, material);
    mesh.renderOrder = 1;
    const shadow = new Mesh(
      shadowGeometry,
      new MeshBasicMaterial({
        map: shadowMap,
        transparent: true,
        depthWrite: false,
        opacity: 0,
      }),
    );
    shadow.renderOrder = 0;
    ctx.group.add(shadow, mesh);
    const face = nextFace();
    return {
      mesh,
      shadow,
      u: material.uniforms,
      face,
      theta: 0,
      thetaV: 0,
      rz: 0,
      rzV: 0,
      rx: 0,
      rxV: 0,
      w: [
        rand(0.85, 1.15) * 1.21,
        rand(0.85, 1.15) * 1.53,
        rand(0.85, 1.15) * 0.97,
      ],
      p: [rand(0, 6.3), rand(0, 6.3), rand(0, 6.3)],
      state: "enter",
      placed: false,
      age: 0,
      chimed: false,
    };
  });

  const points = new GlowPoints(200, { order: 25 });
  const impacts = new Impacts(ctx.group, 0xffcca8, 2);
  ctx.group.add(points);
  const rest = new Vector3();
  const anchor = { x: 0, y: 0, ready: false };
  const score = document.querySelector(".score");
  let fade = 0;
  let scoreBox = null;
  let scoreCheck = 0;
  const scoreText = score && document.createRange();
  scoreText?.selectNodeContents(score);
  const rate = document.getElementById("rate");
  const rateText = rate && document.createRange();
  let rateLine = 0;
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;top:0;height:env(safe-area-inset-top,0px);visibility:hidden;pointer-events:none";
  document.body.append(probe);
  const safeTop = probe.getBoundingClientRect().height;
  probe.remove();
  ctx.onDispose(() => {
    if (score) score.style.opacity = "";
  });
  const speak = sayLater(ctx, 12);
  const fortune = (card) =>
    ctx.interaction.talk?.level === "shy" ? card.shy : card.line;
  let wait = 2.5;
  let reading = null;
  let last = -1;
  let born = 0;
  let tempo = 1;

  let upcoming = null;
  function plan(count) {
    const options = cards
      .slice(0, count)
      .filter(
        (c, k) => (c.state === "rest" || c.state === "enter") && k !== last,
      );
    if (!options.length) return;
    upcoming = options[Math.floor(Math.random() * options.length)];
    deck.prepare(upcoming.face);
  }

  function begin(count) {
    // Card faces need every pose rendered and measured, which a slow phone may not have finished.
    if (!baked) return;
    const ok = (c, k) => c.state === "rest" && k !== last && k < count;
    if (!upcoming || !ok(upcoming, cards.indexOf(upcoming))) plan(count);
    if (!upcoming || !ok(upcoming, cards.indexOf(upcoming)) || !ctx.live)
      return;
    reading = upcoming;
    upcoming = null;
    last = cards.indexOf(reading);
    Object.assign(reading, { state: "lift", age: 0 });
    reading.u.tFront.value = deck.face(reading.face);
    chime(ctx, 523.3, { volume: 0.01, decay: 3 });
  }

  const hover = {
    on: false,
    over: false,
    s: 1,
    sV: 0,
    rx: 0,
    rxV: 0,
    ry: 0,
    ryV: 0,
    rz: 0,
    rzV: 0,
    amt: 0,
    amtV: 0,
    glare: 0,
    rect: null,
    x: -1,
    y: -1,
    mouse: false,
    down: false,
  };
  const inside = (x, y) => {
    const r = hover.rect;
    return !!r && Math.abs(x - r.x) < r.w / 2 && Math.abs(y - r.y) < r.h / 2;
  };
  const move = (e) => {
    hover.x = e.clientX;
    hover.y = e.clientY;
    hover.mouse = e.pointerType === "mouse";
  };
  const up = () => {
    hover.down = false;
  };
  window.addEventListener("pointermove", move, true);
  window.addEventListener("pointerup", up, true);
  window.addEventListener("pointercancel", up, true);
  ctx.onDispose(() => {
    window.removeEventListener("pointermove", move, true);
    window.removeEventListener("pointerup", up, true);
    window.removeEventListener("pointercancel", up, true);
  });
  ctx.onPointerDown((e) => {
    move(e);
    if (!inside(e.clientX, e.clientY)) return false;
    hover.down = true;
    return true;
  });

  function shiver() {
    const hit = ctx.randomHit();
    if (hit) ctx.touch(hit, { jiggle: 0.025, radius: 1.1, pop: false });
  }

  const dust = goldDust(ctx, { points, impacts });

  function release(card) {
    dust.start(card, TIMES.dissolve * tempo);
  }

  return {
    update(dt, t) {
      let live = false;
      const { still } = ctx;
      if (baked) born += dt;
      const level = ctx.level();
      tempo = 1 / (1 + level * 0.3);
      const count = 3 + Math.round(level * 2);

      frame.update(dt);
      const F = frame.safe;
      const depth = Math.max(1, ctx.camera.userData.baseZ ?? 18);
      const px1 = frame.unit(depth);
      frame.screenOf(ORIGIN, rest);
      const ease = anchor.ready ? damp(1.5, dt) : 1;
      anchor.x += (rest.x - anchor.x) * ease;
      anchor.y += (rest.y - anchor.y) * ease;
      anchor.ready = true;
      const peachY = anchor.y;
      const peachTop = peachY - 1.85 * px1;
      const tallest = Math.min(345, (F.w * 0.7) / 0.625);
      const below = peachTop - F.t - 12;
      const over = below < MIN_READ;
      let readTop = over ? TOP_MARGIN + safeTop : F.t + 4;
      const edgeW = (frame.width - 2 * EDGE) / 0.625;
      const fit = Math.max(100, Math.min(tallest, peachTop - readTop - 8));
      const wideMin = F.w > F.h ? F.h * 0.38 : 0;
      let readH = Math.min(
        F.b - readTop - EDGE + 10,
        edgeW,
        Math.max(fit * 1.36, wideMin),
      );
      // On phones the gap under the counter is too small, so a mid-size card hangs from the rate line instead of covering the count.
      const hang = over && F.w < F.h && rateLine > 0;
      if (hang) {
        readH = (Math.max(90, peachTop - F.t - 12) + readH) / 2;
        readTop = rateLine;
      }
      const readX = F.cx;
      const readY = readTop + readH / 2;
      const showing = RAISED.has(reading?.state) ? 1 : 0;
      scoreCheck -= dt;
      if (score && scoreCheck <= 0) {
        scoreCheck = 0.5;
        scoreBox = scoreText.getBoundingClientRect();
        // The rate text is rebuilt as it changes, so the range is pointed at it again before each read.
        rateText?.selectNodeContents(rate);
        rateLine = rateText?.getClientRects()[0]?.bottom ?? 0;
      }
      const halfW = (readH * (CARD_W / CARD_H)) / 2 + 8;
      const covers =
        !hang &&
        scoreBox &&
        readX - halfW < scoreBox.right &&
        readX + halfW > scoreBox.left &&
        readTop - 8 < scoreBox.bottom &&
        readTop + readH + 8 > scoreBox.top;
      fade += ((covers ? showing : 0) - fade) * damp(4, dt);
      if (score)
        score.style.opacity = fade > 0.001 ? String(1 - fade * 0.9) : "";
      if (!reading) {
        wait -= dt;
        if (wait <= 0) {
          begin(count);
          wait = rand(1.2, 2.6) / (1 + level);
        }
      }

      const out = (c) =>
        c.state === "lift" ||
        c.state === "flip" ||
        c.state === "hold" ||
        c.state === "dissolve" ||
        c.state === "gone";
      let slots = 0;
      cards.forEach((c, k) => {
        if (k < count && !out(c) && born > 0.3 + k * 0.25) slots += 1;
      });
      let slot = 0;
      cards.forEach((card, k) => {
        const T = (key) => TIMES[key] * tempo;
        const shown = k < count && born > 0.3 + k * 0.25;
        card.age += dt;
        if (!shown && card.state === "enter") card.age = 0;
        if (shown && !out(card)) {
          const want = (slot - (slots - 1) / 2) * FAN.step;
          card.layer = slot;
          slot += 1;
          if (!card.placed) {
            card.theta = want;
            card.placed = true;
          }
          springTo(card, "theta", want, dt, 3.2, 0.62);
        }
        let flip = 0;
        let lift = 0;
        let glow = 0;
        let flash = 0;
        let dissolve = 0;
        let settle = 0;
        let appear = shown ? 1 : 0;
        let enterScale = 1;
        let enterY = 0;
        let enterBack = 0;
        let enterYaw = 0;
        if (card.state === "enter") {
          const e = card.age / T("enter");
          const rise = easeOut(e);
          appear = shown ? smooth(e * 1.7) : 0;
          enterScale = 0.72 + 0.28 * backOut(e);
          enterY = -(1 - rise) * 0.7;
          enterBack = (1 - rise) * 1.2;
          enterYaw = (1 - smooth(e)) * Math.PI * 0.5;
          flash = Math.exp(-(((e - 0.6) / 0.07) ** 2)) * 0.35;
          glow = Math.exp(-(((e - 0.85) / 0.1) ** 2)) * 0.5;
          if (e >= 1) {
            card.state = "rest";
            if (card === reading) reading = null;
          }
        } else if (card.state === "lift") {
          lift = easeInOut(card.age / T("lift"));
          if (card.age > T("lift"))
            Object.assign(card, { state: "flip", age: 0, chimed: false });
        } else if (card.state === "flip") {
          lift = 1;
          flip = easeInOut(card.age / T("flip"));
          flash = Math.exp(-(((card.age / T("flip") - 0.55) / 0.12) ** 2));
          if (card.age > T("flip") * 0.5 && !card.chimed) {
            card.chimed = true;
            chime(ctx, 880, { volume: 0.02, decay: 3.2 });
            chime(ctx, 1108.7, { volume: 0.013, decay: 2.8, delay: 0.11 });
            chime(ctx, 1318.5, { volume: 0.009, decay: 2.6, delay: 0.22 });
            shiver();
          }
          if (card.age > T("flip")) {
            Object.assign(card, { state: "hold", age: 0 });
            speak(fortune(CARDS[card.face]), 0.75);
          }
        } else if (card.state === "hold") {
          if (hover.on) card.age = Math.min(card.age, T("hold") - 0.05);
          lift = 1;
          flip = 1;
          settle = Math.sin(card.age * 7) * Math.exp(-card.age * 4) * 0.1;
          glow =
            smooth(card.age / 0.8) * (0.85 + 0.15 * Math.sin(card.age * 3));
          if (card.age > T("hold")) {
            Object.assign(card, { state: "dissolve", age: 0 });
            card.mesh.updateMatrixWorld();
            release(card);
            chime(ctx, 659.3, { volume: 0.01, decay: 2.4 });
          }
        } else if (card.state === "dissolve") {
          lift = 1;
          flip = 1;
          glow = 1 - smooth(card.age / T("dissolve")) * 0.4;
          dissolve = smooth(card.age / T("dissolve"));
          if (card.age > T("dissolve"))
            Object.assign(card, { state: "gone", age: 0 });
        } else if (card.state === "gone") {
          appear = 0;
          if (card.age > T("gone")) {
            used.delete(card.face);
            card.u.tFront.value = deck.back;
            deck.release(card.face);
            card.face = nextFace();
            plan(3 + Math.round(ctx.level() * 2));
            Object.assign(card, { state: "enter", age: 0, placed: false });
          }
        }

        const { w, p } = card;
        const tau = Math.PI * 2;
        const hx = 0.045 * Math.sin((t * tau) / (5.3 * w[0]) + p[0]) * still;
        const hy = 0.06 * Math.sin((t * tau) / (4.1 * w[1]) + p[1]) * still;
        const vx =
          0.045 *
          (tau / (5.3 * w[0])) *
          Math.cos((t * tau) / (5.3 * w[0]) + p[0]) *
          still;
        const vy =
          0.06 *
          (tau / (4.1 * w[1])) *
          Math.cos((t * tau) / (4.1 * w[1]) + p[1]) *
          still;
        springTo(card, "rz", -vx * 1.4, dt, 2.6, 0.75);
        springTo(card, "rx", vy * 1.1, dt, 2.6, 0.75);
        const yawDrift =
          0.08 * Math.sin((t * tau) / (6.7 * w[2]) + p[2]) * still;

        const th = card.theta;
        const ux = Math.sin(th) * FAN.radius + hx;
        const uy = FAN.pivot + Math.cos(th) * FAN.radius + hy + enterY;
        const d0 =
          depth +
          0.7 +
          Math.abs(th) * FAN.back * 0.4 +
          Math.min(0.4, Math.abs(card.thetaV) * 1.5) +
          enterBack;
        const f = depth / d0;
        const arcX = anchor.x + ux * px1 * f;
        const arcY = anchor.y - uy * px1 * f;
        const m = card.mesh;
        // A hanging card overlaps the peach, so it reads in front of the peach's bulge.
        const dRead = depth - (hang ? 2.4 : 0.9);
        const sx = arcX + (readX - arcX) * lift;
        const sy = arcY + (readY + Math.sin(t * 1.1) * 2 * still - arcY) * lift;
        const mine = card === reading && lift > 0.99;
        const d = d0 + (dRead - d0) * lift - (mine ? hover.amt * 0.25 : 0);
        const behind = card.state === "enter" && card.age < T("enter") * 0.6;
        if (lift > 0) m.renderOrder = 20;
        else m.renderOrder = behind ? 1 : 2 + (card.layer ?? 0);
        frame.place(m.position, sx, sy, d);
        const restScale = 0.92 * enterScale;
        const readScale = readH / (CARD_H * frame.unit(dRead));
        const tilt = (-th + card.rz) * (1 - lift);
        frame.orient(
          m,
          card.rx * (1 - lift * 0.6) + (mine ? hover.rx : 0),
          Math.PI * (1 - flip) -
            enterYaw +
            (yawDrift * (1 - lift) +
              Math.sin(t * 0.7) *
                0.06 *
                lift *
                still *
                (mine ? 1 - hover.amt : 1)) +
            settle +
            (mine ? hover.ry : 0),
          tilt + flip * (1 - flip) * 0.35 + (mine ? hover.rz : 0),
        );
        m.scale.setScalar(
          (restScale + (readScale - restScale) * lift) * (mine ? hover.s : 1),
        );
        if (mine && (card.state === "hold" || card.state === "flip")) {
          const ph = m.scale.x * CARD_H * frame.unit(d);
          hover.rect = { x: sx, y: sy, w: ph * (CARD_W / CARD_H), h: ph };
          live = true;
        }
        const px = m.scale.x * CARD_H * frame.unit(d);
        const { u } = card;
        u.uAppear.value = appear;
        u.uGlow.value = glow + (mine ? hover.amt * 0.35 : 0);
        u.uGlare.value.set(
          mine
            ? 0.7 +
                Math.max(-0.5, Math.min(0.5, -hover.ry * 1.6 + hover.rx * 1.2))
            : 0,
          0,
          mine && flip > 0.9 ? hover.glare * 0.5 : 0,
        );
        u.uDim.value = !mine && reading && lift < 0.5 ? hover.amt * 0.28 : 0;
        u.uFlash.value = flash;
        u.uDissolve.value = dissolve;
        u.uTime.value = t;
        const sh = card.shadow;
        const lean = mine ? hover.amt : 0;
        frame.place(
          sh.position,
          sx + px * (0.03 - (mine ? hover.ry : 0) * 0.35),
          sy + px * (0.05 + lean * 0.05 + (mine ? hover.rx : 0) * 0.35),
          d + 0.18 + lean * 0.3,
        );
        frame.orient(sh, 0, 0, tilt);
        sh.scale.set(
          CARD_W * 1.9 * m.scale.x * (1 + lean * 0.12),
          CARD_H * 1.6 * m.scale.x * (1 + lean * 0.12),
          1,
        );
        sh.material.opacity = appear * (1 - dissolve) * (0.45 + lean * 0.25);
        if (card === reading && card.state !== "enter") {
          frame.place(halo.position, sx, sy, d + 0.25);
          halo.scale.set(CARD_W * 2.6 * m.scale.x, CARD_H * 2 * m.scale.x, 1);
          halo.material.opacity =
            (glow * (1 - dissolve * 0.3) * 0.32 + flash * 0.25 + lift * 0.06) *
            appear;
        }
      });
      if (!live) hover.rect = null;
      const hovering =
        !!hover.rect && (hover.mouse || hover.down) && inside(hover.x, hover.y);
      if (hovering && !hover.on) {
        hover.sV += 2.6;
        hover.rzV += (Math.random() < 0.5 ? -1 : 1) * 1.6;
        pickTick(ctx, rand(2100, 2500), 0.012);
      } else if (!hovering && hover.on) {
        hover.sV -= 0.8;
        pickTick(ctx, rand(1500, 1700), 0.006);
      }
      hover.on = hovering;
      let tx = 0;
      let ty = 0;
      if (hovering) {
        tx = Math.max(
          -1,
          Math.min(1, (hover.x - hover.rect.x) / (hover.rect.w / 2)),
        );
        ty = Math.max(
          -1,
          Math.min(1, (hover.y - hover.rect.y) / (hover.rect.h / 2)),
        );
      }
      springTo(hover, "s", hovering ? 1.07 : 1, dt, 16, 0.32);
      springTo(hover, "rz", 0, dt, 22, 0.22);
      springTo(hover, "ry", tx * 0.3, dt, 18, 0.42);
      springTo(hover, "rx", ty * 0.3, dt, 18, 0.42);
      springTo(hover, "amt", hovering ? 1 : 0, dt, 12, 0.6);
      hover.glare +=
        ((hovering ? 1 : 0) - hover.glare) * (1 - Math.exp(-dt / 0.05));
      if (!reading || reading.state === "gone" || reading.state === "enter")
        halo.material.opacity *= 1 - damp(1.6, dt);

      points.begin();
      dust.update(dt, t);
      points.end(ctx.renderer, ctx.camera);
      if (baked) impacts.update(dt);
    },
  };
}

export default {
  id: "reader",
  create: reader,
};
