import { Group, Vector3 } from "three";
import {
  audioContext,
  audioMaster,
  playSlap,
  playSquish,
  playKiss,
  playSnap,
  playThump,
  playWhoosh,
  playNotes,
  playGlug,
  playBloop,
  playPat,
} from "../../../audio";
import { reducedMotion } from "../../../util";

const UP = new Vector3(0, 1, 0.3).normalize();

const levelOf = (owned, full = 100) =>
  owned > 0 ? Math.min(1, Math.log10(1 + owned) / Math.log10(1 + full)) : 0;

// The game rebuilds its audio context after an interruption, so nodes are kept per context.
let out = null;
let noise = null;
let soundOn = true;
const audioOut = () => {
  const ac = audioContext();
  if (out?.context !== ac) {
    out = ac.createGain();
    out.gain.value = soundOn ? 1 : 0;
    out.connect(audioMaster());
  }
  return out;
};
const noiseBuffer = () => {
  const ac = audioContext();
  if (noise?.ac !== ac) {
    const buffer = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let n = 0; n < data.length; n += 1) data[n] = Math.random() * 2 - 1;
    noise = { ac, buffer };
  }
  return noise.buffer;
};
export function setExtrasSound(on) {
  if (on === soundOn) return;
  soundOn = on;
  if (out) out.gain.setTargetAtTime(on ? 1 : 0, out.context.currentTime, 0.05);
}

export function makeContext(id, world, clock) {
  const { game, interaction: i, room, scene, camera, renderer } = world;
  const group = new Group();
  scene.add(group);
  const disposers = [];
  let alive = true;
  let warming = 0;
  let shownBeforeWarm = true;
  let lastTouch = room.toucher.time;
  const sounding = () => game.state.options.castSound;
  const quiet =
    (play) =>
    (...args) =>
      sounding() && play(...args);
  const earned = () => {
    const value =
      (game.model.totals[id] || 0) * (room.toucher.time - lastTouch);
    lastTouch = room.toucher.time;
    return value;
  };
  const ctx = {
    id,
    scene,
    camera,
    renderer,
    interaction: i,
    peach: i.peach,
    room,
    game,
    backdrop: world.backdrop,
    lens: world.lens,
    juice: world.juice,
    droplets: world.droplets,
    lights: world.lights,
    mood: world.mood,
    wild: world.wild,
    group,
    get still() {
      return reducedMotion.matches ? 0.15 : 1;
    },
    get time() {
      return clock.time;
    },
    get owned() {
      return game.state.helpers[id] || 0;
    },
    level: (full = 100) => levelOf(game.state.helpers[id] || 0, full),
    center: () => i.group.position,
    bounds: room.bounds,
    away: false,
    get live() {
      return i.phase === "live" && !this.away;
    },
    randomHit: () => room.toucher.randomHit(),
    hitFrom: (position) => room.toucher.hitFrom(position),
    hitAtScreen: (x, y) => i.raycastAt(x, y),
    toScreen: (v) => i.toScreen(v),
    touch(hit, t = {}) {
      const dir = new Vector3();
      if (hit) dir.copy(i.group.position).sub(hit.point);
      dir.z = Math.min(dir.z, -0.4);
      dir.normalize();
      if (hit)
        i.peach.addJiggle(hit.point, dir, t.jiggle ?? 0.06, t.radius ?? 0.8);
      if (t.knock) i.velocity.addScaledVector(dir, t.knock);
      if (t.lift) {
        i.velocity.y += t.lift;
        i.squashVelocity.x += 0.8;
        i.squashAxis.set(0, 1);
      }
      if (t.clap)
        [1, -1].forEach((side) => {
          const cheek = i.cheekPoint(side, -0.3);
          if (cheek)
            i.peach.addJiggle(cheek.point, UP, t.jiggle ?? 0.1, t.radius ?? 1);
        });
      if (t.squash) {
        i.squashVelocity.x += t.squash;
        i.squashAxis.set(Math.abs(dir.x), Math.abs(dir.y));
      }
      if (t.wobble) i.wobbleAll(t.wobble);
      if (t.spin) i.spin.y += t.spin * (Math.random() < 0.5 ? -1 : 1);
      if (t.sway) i.velocity.x += t.sway * (Math.random() < 0.5 ? -1 : 1);
      if (t.heat) i.addHeat(t.heat);
      if (hit && t.print) ctx.print(hit, t.print);
      if (hit && t.pop !== false) ctx.popJuice(hit.point, t.value);
      return dir;
    },
    print(hit, { size = 1, strength = 0.5, kind = 0, tilt } = {}) {
      if (!hit || !i.settings.handprints) return;
      i.peach.addHandprint(
        hit.point,
        hit.face.normal,
        tilt ?? (Math.random() - 0.5) * 1.2,
        Math.random() < 0.5,
        strength,
        0.04,
        size,
        kind,
      );
    },
    popJuice(point, value) {
      const v = value ?? earned();
      if (!(v > 0)) return;
      const at = i.toScreen(point);
      room.toucher.popups.juice(at.x, at.y, v, "helper");
    },
    rate: () => game.model.totals[id] || 0,
    say(line) {
      if (world.talk.level === "off" || game.craving) return;
      world.talk.show(line);
    },
    sound: {
      slap: quiet((a = 0.4) => playSlap(a, i.heat / 100, i.oil, 1.1)),
      squish: quiet((a = 0.2) => playSquish(a)),
      kiss: quiet(() => playKiss()),
      snap: quiet((a = 0.3) => playSnap(a)),
      thump: quiet((a = 1) => playThump(a)),
      whoosh: quiet((a = 1) => playWhoosh(a)),
      notes: quiet((list, opts) => playNotes(list, opts)),
      glug: quiet((a = 0.3) => playGlug(a)),
      bloop: quiet((hz) => playBloop(hz)),
      pat: quiet((w = 0.5) => playPat(w, 0, i.oil)),
    },
    audio: audioContext,
    audioOut,
    noiseBuffer,
    on(name, fn) {
      const listener = (e) => alive && fn(e);
      i.on(name, listener);
      disposers.push(() => {
        const list = i.listeners[name];
        const at = list?.indexOf(listener) ?? -1;
        if (at >= 0) list.splice(at, 1);
      });
    },
    onPointerDown(fn) {
      const handler = (e) => {
        if (!alive || e.target !== renderer.domElement) return;
        if (fn(e) === true) {
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      };
      window.addEventListener("pointerdown", handler, true);
      disposers.push(() =>
        window.removeEventListener("pointerdown", handler, true),
      );
    },
    // ANGLE on Metal builds programs on first draw, so each light and shadow variant is drawn into one pixel.
    async warm(include = []) {
      if (warming === 0) shownBeforeWarm = group.visible;
      warming += 1;
      group.visible = false;
      const extra = [
        world.mood.candle,
        world.mood.halo,
        ...world.wild.disco.lights,
      ];
      const variants = [
        [false, false],
        [true, false],
        [false, true],
        [true, true],
      ];
      for (let v = 0; v < variants.length; v += 1) {
        const [shadows, lit] = variants[v];
        // eslint-disable-next-line no-await-in-loop
        await new Promise(requestAnimationFrame);
        if (!alive) return;
        const shownLights = extra.map((l) => l.visible);
        const hidden = [];
        scene.children.forEach((o) => {
          if (o !== group && !o.isLight && o.visible) {
            hidden.push(o);
            // eslint-disable-next-line no-param-reassign
            o.visible = false;
          }
        });
        const wasShadows = renderer.shadowMap.enabled;
        renderer.shadowMap.enabled = shadows;
        extra.forEach((l) => {
          // eslint-disable-next-line no-param-reassign
          l.visible = lit;
        });
        group.traverse(({ material }) => {
          [].concat(material ?? []).forEach((m) => {
            // eslint-disable-next-line no-param-reassign
            m.needsUpdate = true;
          });
        });
        const parts = include.map((o) => [o, o.visible, o.count]);
        include.forEach((o) => {
          // eslint-disable-next-line no-param-reassign
          o.visible = true;
          // eslint-disable-next-line no-param-reassign
          if (o.isInstancedMesh) o.count = Math.max(o.count, 1);
        });
        group.visible = true;
        renderer.setScissor(0, 0, 1, 1);
        renderer.setScissorTest(true);
        renderer.render(scene, camera);
        renderer.setScissorTest(false);
        group.visible = false;
        parts.forEach(([o, visible, count]) => {
          // eslint-disable-next-line no-param-reassign
          o.visible = visible;
          // eslint-disable-next-line no-param-reassign
          if (o.isInstancedMesh) o.count = count;
        });
        renderer.shadowMap.enabled = wasShadows;
        extra.forEach((l, n) => {
          // eslint-disable-next-line no-param-reassign
          l.visible = shownLights[n];
        });
        hidden.forEach((o) => {
          // eslint-disable-next-line no-param-reassign
          o.visible = true;
        });
      }
      warming -= 1;
      if (warming === 0) group.visible = shownBeforeWarm;
    },
    onDispose: (fn) => disposers.push(fn),
    dispose() {
      alive = false;
      disposers.forEach((fn) => fn());
      scene.remove(group);
      group.traverse((o) => {
        o.geometry?.dispose?.();
        [].concat(o.material ?? []).forEach((m) => m.dispose?.());
      });
    },
  };
  return ctx;
}
