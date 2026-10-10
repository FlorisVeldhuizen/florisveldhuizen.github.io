/* eslint-disable no-param-reassign, no-continue */
import { Euler, Group, Matrix4, Quaternion, Vector3 } from "three";
import { viewHeight, viewWidth } from "../../../util";
import { skinPose, skinSpot } from "../skin-jiggle";
import { makeShared } from "./parts";
import Sparks from "./fx";
import { slurp, whoosh } from "./sounds";
import { BUTTERFLY } from "./butterfly";
import { createWingShadows } from "./shadows";
import { BUTTERFLY_HARVESTS, butterflySlots } from "../../data/orchard";

export const SHADOWS = true;
const SHARE = 0.05;
const UP = new Vector3(0, 1, 0);
const Z = new Vector3(0, 0, 1);
const MAX = 10;
const FLINCH = 0.008;
const smoother = (x) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const ease = (rate, dt) => 1 - Math.exp(-dt * rate);
const rand = (a, b) => a + Math.random() * (b - a);

export function createSippers(ctx) {
  const kind = BUTTERFLY;
  const { game } = ctx;
  const { camera, group, peach } = ctx;
  const shared = makeShared();
  const sparks = new Sparks(group);
  const shadows = SHADOWS ? createWingShadows(ctx) : null;
  const shadowItems = [];
  ctx.onDispose(() => shadows?.dispose());
  const list = [];
  const queue = [];
  const s = {
    speed: 1,
    size: 1,
    volume: 1,
    gap: [240, 480],
    touchy: 1,
    time: 0,
    next: 2,
    scale: 1,
  };
  const mw = new Matrix4();
  const inv = new Matrix4();
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  const P = new Vector3();
  const N = new Vector3();
  const F = new Vector3();
  const U = new Vector3();
  const lp = new Vector3();
  const ln = new Vector3();
  const basis = new Matrix4();
  const q = new Quaternion();
  const q2 = new Quaternion();
  const euler = new Euler();
  const proj = new Vector3();
  let quiet = false;

  const pxPerUnit = (at) =>
    viewHeight() /
    (2 *
      Math.tan((camera.fov * Math.PI) / 360) *
      camera.position.distanceTo(at));
  const screenOf = (v, out) => {
    proj.copy(v).project(camera);
    out.sx = (proj.x + 1) * 0.5 * viewWidth();
    out.sy = (1 - proj.y) * 0.5 * viewHeight();
    out.front = proj.z < 1;
  };
  const halfView = () => {
    const h =
      Math.tan((camera.fov * Math.PI) / 360) *
      (camera.position.z - ctx.center().z);
    return { w: h * camera.aspect, h };
  };
  const edgePoint = (out, side = Math.random() < 0.5 ? -1 : 1) => {
    const v = halfView();
    const ctr = ctx.center();
    return out.set(
      ctr.x + side * (v.w + 1),
      ctr.y + rand(-0.3, 0.9) * Math.min(v.h, 3),
      ctr.z + rand(0.2, 1.6),
    );
  };
  const panOf = (w) => ((w.sx / viewWidth()) * 2 - 1) * 0.8;
  const quietTouch = (hit, t) => {
    quiet = true;
    ctx.touch(hit, { pop: false, ...t });
    quiet = false;
  };

  function ride(spot) {
    skinPose(peach, spot, lp, ln);
    P.copy(lp).applyMatrix4(mw);
    N.copy(ln).transformDirection(mw);
    F.copy(spot.f).transformDirection(mw);
    F.addScaledVector(N, -F.dot(N));
    if (F.lengthSq() < 1e-6) F.set(1, 0, 0).addScaledVector(N, -N.x);
    F.normalize();
  }
  const down = new Vector3();
  const hitAlong = (origin, normal) => {
    down.copy(normal).negate();
    ctx.interaction.raycaster.set(origin, down);
    return (
      ctx.interaction.raycaster.intersectObject(peach.mesh, false)[0] ?? null
    );
  };
  const hitOf = () => ({ point: P.clone(), face: { normal: ln.clone() } });

  function spotFromHit(hit, towards) {
    const spot = skinSpot(peach, hit, {});
    a.copy(spot.normal).transformDirection(mw);
    b.copy(towards).addScaledVector(a, -towards.dot(a));
    if (b.lengthSq() < 1e-4) b.set(1, 0, 0).addScaledVector(a, -a.x);
    spot.f = b.clone().transformDirection(inv);
    return spot;
  }
  const reachOf = (w) =>
    (kind.wingSpan ? (kind.wingSpan + 0.01) * 2 : (kind.radius ?? 0.06) * 2) *
    (w.special ? kind.specialSize : kind.size) *
    s.size *
    w.sizeK;
  const spotFree = (local, self) =>
    list.every(
      (o) =>
        o === self ||
        o.dead ||
        !o.spot ||
        o.spot.local.distanceTo(local) * s.scale >
          Math.max(
            kind.spacing ?? 0.65,
            ((reachOf(o) + reachOf(self)) / 2) * 1.1,
          ),
    );

  function pickSpot(w) {
    const { yMin, yMax, zMin, upMin } = kind.spots;
    const ctr = ctx.center();
    for (let k = 0; k < 30; k += 1) {
      const wide = k >= 15;
      if (wide) {
        const ang = rand(-1.2, 1.2);
        a.set(
          ctr.x + Math.sin(ang) * 4.5,
          ctr.y + rand(yMin - 0.3, yMax),
          ctr.z + Math.cos(ang) * 4.5,
        );
      } else
        a.set(ctr.x + rand(-2.3, 2.3), ctr.y + rand(yMin, yMax), ctr.z + 4.5);
      const hit = ctx.hitFrom(a);
      if (!hit) continue;
      N.copy(hit.face.normal).transformDirection(mw);
      if (
        N.z < (wide ? 0.05 : zMin) ||
        N.y < (wide ? Math.min(upMin, -0.5) : upMin)
      )
        continue;
      c.copy(hit.point).applyMatrix4(inv);
      if (!spotFree(c, w)) continue;
      return spotFromHit(hit, b.copy(hit.point).sub(w.pos));
    }
    return null;
  }

  const batches = new Map();
  const batchRigs = [];
  ctx.onDispose(() => batches.forEach((batch) => batch.dispose()));
  const batchFor = (rig) => {
    if (!batches.has(rig.lookKey)) {
      batches.set(rig.lookKey, kind.makeBatch(rig, group));
      shadows?.attach(batches.get(rig.lookKey));
    }
    return batches.get(rig.lookKey);
  };
  let prep = kind.prepare?.() ?? null;
  let ready = !prep;
  async function warmBatches() {
    [false, true].forEach((special) => batchFor(kind.build(shared, special)));
    batches.forEach((batch) => {
      batch.minCount = 1;
    });
    await ctx.warm();
    batches.forEach((batch) => {
      batch.minCount = 0;
    });
    ready = true;
  }

  const finishPrep = () => {
    if (!prep) return;
    while (!prep.next().done);
    prep = null;
    warmBatches();
  };
  function make(special, from) {
    const rig = kind.build(shared, special);
    const k = kind.personality?.() ?? {};
    const holder = new Group();
    holder.add(rig.root);
    if (kind.makeBatch) holder.matrixWorldAutoUpdate = false;
    group.add(holder);
    if (kind.makeBatch) batchFor(rig).register(rig);
    const w = {
      kind,
      rig,
      holder,
      special,
      pos: from ? from.clone() : edgePoint(new Vector3()),
      vel: new Vector3(),
      acc: new Vector3(),
      quat: new Quaternion(),
      goal: new Vector3(),
      goalSpot: null,
      hover: 0.5,
      arrive: 0.25,
      onArrive: null,
      mode: "fly",
      t: 0,
      timer: 0,
      seed: Math.random() * 100,
      spot: null,
      from: new Vector3(),
      fromQ: new Quaternion(),
      walk: null,
      fill: 0,
      sipped: 0,
      appear: from ? 0 : 1,
      flinch: 0,
      sulk: 0,
      lag: new Vector3(),
      lagV: new Vector3(),
      prevP: new Vector3(),
      prevV: new Vector3(),
      tracked: false,
      sq: 0,
      sqV: 0,
      slurpIn: rand(0.4, 1),
      squirmIn: rand(3, 6),
      walkIn: rand(4, 9),
      relocate: rand(...(k.perch ?? [30, 50])),
      sizeK: k.size ?? 1,
      wanderK: k.wander ?? 1,
      noiseK: k.noise ?? 1,
      walkEvery: k.walkEvery ?? [5, 11],
      perch: k.perch ?? [30, 50],
      skinR: 0,
      skinIn: 0,
      clearIn: 0,
      sx: -999,
      sy: -999,
      front: false,
      p: {
        t: 0,
        dt: 0,
        speed: 0,
        landing: false,
        air: 1,
        sip: 0,
        fill: 0,
        flinch: 0,
        sulk: 0,
        walk: 0,
        blur: 1,
        seed: 0,
      },
      out: null,
      cruiseK: k.cruise ?? 1,
      pitchK: k.pitch ?? 1,
    };
    w.p.seed = w.seed;
    a.copy(ctx.center()).sub(w.pos).normalize();
    w.vel.copy(a).multiplyScalar(from ? 1 : 2);
    w.quat.setFromUnitVectors(Z, a);
    list.push(w);
    return w;
  }

  function kill(w) {
    w.dead = true;
    w.spot = null;
    group.remove(w.holder);
    w.holder.traverse((o) =>
      []
        .concat(o.material ?? [])
        .forEach((m) => !m.userData.keep && m.dispose()),
    );
  }

  const flyTo = (w, point, arrive, then) => {
    w.mode = "fly";
    w.goalSpot = null;
    w.goal.copy(point);
    w.arrive = arrive;
    w.onArrive = then;
  };
  const flyToSpot = (w, spot, then) => {
    w.mode = "fly";
    w.spot = spot;
    w.feet = null;
    w.goalSpot = spot;
    w.hover = 1.1;
    w.arrive = 0.35;
    w.onArrive = (x) => {
      x.hover = 0.42;
      x.arrive = kind.arrive ?? 0.14;
      x.onArrive = then;
    };
  };
  const roam = (w, then) => {
    const ctr = ctx.center();
    const v = halfView();
    a.set(rand(-1, 1), rand(-0.3, 1), rand(0.2, 1)).normalize();
    b.set(
      ctr.x + a.x * Math.min(2.6, v.w - 0.3),
      ctr.y + a.y * 2.6,
      ctr.z + 0.8 + a.z * 1.6,
    );
    flyTo(w, b, 0.5, then);
  };

  function beginLand(w) {
    w.mode = "land";
    w.bumped = false;
    w.timer = 0;
    w.from.copy(w.pos);
    w.fromQ.copy(w.quat);
    ride(w.spot);
    a.copy(P).sub(w.pos);
    a.addScaledVector(N, -a.dot(N));
    if (a.lengthSq() < 0.03 * 0.03) {
      a.copy(w.vel).addScaledVector(N, -w.vel.dot(N));
      if (a.lengthSq() < 1e-4)
        a.set(0, 0, 1).applyQuaternion(w.quat).addScaledVector(N, -N.z);
    }
    w.spot.f.copy(a.normalize()).transformDirection(inv);
  }

  function start(w) {
    if (!ctx.live) {
      roam(w, start);
      return;
    }
    const spot = pickSpot(w);
    if (!spot) {
      roam(w, start);
      return;
    }
    flyToSpot(w, spot, beginLand);
  }

  function takeOff(w, then) {
    w.mode = "lift";
    w.timer = 0;
    w.from.copy(w.pos);
    w.walk = null;
    w.onArrive = then;
  }

  const sway = new Vector3();
  const swayAxis = new Vector3();
  function sitPose(w, outPos, outQuat, dt = 0) {
    outPos.copy(P);
    U.copy(N);
    F.addScaledVector(U, -F.dot(U)).normalize();
    a.crossVectors(U, F);
    basis.makeBasis(a, U, F);
    outQuat.setFromRotationMatrix(basis);
    if (dt > 0) {
      if (w.walk) w.tracked = false;
      if (w.tracked) {
        sway.copy(P).sub(w.prevP).divideScalar(dt);
        swayAxis.copy(sway).sub(w.prevV);
        if (swayAxis.length() > 3) swayAxis.setLength(3);
        w.lagV.addScaledVector(swayAxis, -0.5);
        w.prevV.copy(sway);
      } else {
        w.prevV.set(0, 0, 0);
        w.tracked = true;
      }
      w.prevP.copy(P);
      w.lagV
        .addScaledVector(w.lag, -110 * dt)
        .multiplyScalar(Math.exp(-dt * 7));
      w.lag.addScaledVector(w.lagV, dt);
      if (w.lag.length() > 0.3) w.lag.setLength(0.3);
    }
    sway.copy(w.lag).addScaledVector(U, -w.lag.dot(U));
    const tilt = Math.min(
      kind.maxTilt ?? 0.55,
      sway.length() * 3.2 + Math.sin(w.t * 1.4 + w.seed) * 0.02,
    );
    if (sway.lengthSq() > 1e-8) {
      swayAxis.crossVectors(U, sway).normalize();
      outQuat.premultiply(q2.setFromAxisAngle(swayAxis, tilt));
    }
  }

  function keepOut(w, dt) {
    const ctr = ctx.center();
    w.skinIn -= dt;
    if (w.skinIn < 0 || !w.skinR) {
      w.skinIn = 0.08;
      const hit = ctx.hitFrom(w.pos);
      if (hit) w.skinR = hit.point.distanceTo(ctr);
      else if (!w.skinR) w.skinR = 1.2;
    }
    a.copy(w.pos).sub(ctr);
    const r = a.length();
    const wide =
      kind.wingSpan && (w.mode === "spiral" || w.mode === "escape")
        ? kind.wingSpan
        : 0;
    const clear =
      w.skinR + Math.max(kind.radius ?? 0.05, wide) * w.holder.scale.x + 0.08;
    if (r < clear && r > 1e-4) {
      s.pushes = (s.pushes ?? 0) + 1;
      a.multiplyScalar(1 / r);
      w.pos.addScaledVector(a, (clear - r) * Math.min(1, dt * 14));
      const hard = w.skinR + (kind.radius ?? 0.05) * w.holder.scale.x;
      if (w.pos.distanceTo(ctr) < hard)
        w.pos.copy(ctr).addScaledVector(a, hard);
      const inward = w.vel.dot(a);
      if (inward < 0) w.vel.addScaledVector(a, -inward * 1.2);
    }
  }

  function steer(w, dt) {
    const ctr = ctx.center();
    if (w.goalSpot) {
      ride(w.goalSpot);
      w.goal.copy(P).addScaledVector(N, w.hover);
    }
    a.copy(w.goal).sub(w.pos);
    const dist = a.length();
    const fl = kind.flight;
    const heavy = 1 + w.fill * 0.9;
    const speed = Math.min((fl.cruise * w.cruiseK) / heavy, dist * 2.4 + 0.05);
    a.multiplyScalar(speed / Math.max(dist, 1e-4));
    const t = (s.time + w.seed) * w.noiseK;
    const wobble =
      fl.wander * w.wanderK * Math.min(1, dist * 0.8 + 0.15) * ctx.still;
    a.x += (Math.sin(t * 1.3) + Math.sin(t * 2.9 + 1) * 0.5) * wobble;
    a.y +=
      (Math.sin(t * 1.1 + 2) * 0.8 + Math.sin(t * 3.7) * 0.4) * wobble -
      w.fill * 0.25;
    a.z += Math.sin(t * 0.9 + 4) * wobble * 0.7;
    if (dist > 0.7) {
      b.copy(w.pos).sub(ctr);
      b.x /= ctx.bounds.x + 0.15;
      b.y /= ctx.bounds.y + 0.15;
      b.z /= ctx.bounds.z + 0.15;
      const reach = b.length();
      if (reach < 1.12) {
        b.normalize();
        a.addScaledVector(b, (1.12 - reach) * 14);
        const inward = -a.dot(b);
        if (inward > 0)
          a.addScaledVector(c.set(-b.y, b.x, 0.3).normalize(), inward * 0.8);
      }
    }
    const finalGoal = w.goalSpot && w.hover < 0.6 && dist < 0.8;
    const clearance = w.skinR ? w.pos.distanceTo(ctr) - w.skinR : 9;
    c.copy(w.pos).sub(ctr).normalize();
    if (clearance < 0.45) {
      const into = a.dot(c);
      if (into < 0)
        a.addScaledVector(
          c,
          -into * (finalGoal ? 0.4 : 1) * smoother((0.45 - clearance) / 0.3),
        );
    }
    w.aheadIn = (w.aheadIn ?? 0) - dt;
    if (w.aheadIn < 0) {
      w.aheadIn = 0.1;
      const sp = w.vel.length();
      if (sp > 0.2 && !finalGoal) {
        const ray = ctx.interaction.raycaster;
        ray.set(w.pos, b.copy(w.vel).multiplyScalar(1 / sp));
        ray.far = sp * 0.4 + 0.15;
        const hit = ray.intersectObject(peach.mesh, false)[0];
        ray.far = Infinity;
        if (hit) {
          w.avoidN = (w.avoidN ?? new Vector3())
            .copy(hit.face.normal)
            .transformDirection(mw);
          w.avoidT = 0.35;
          w.avoidK = 1 - hit.distance / (sp * 0.4 + 0.15);
          s.dodges = (s.dodges ?? 0) + 1;
        }
      }
    }
    if (w.avoidT > 0) {
      w.avoidT -= dt;
      const into = a.dot(w.avoidN);
      if (into < 0) a.addScaledVector(w.avoidN, -into);
      a.addScaledVector(w.avoidN, w.avoidK * 1.2);
    }
    if (!finalGoal) {
      const mine = reachOf(w);
      for (let k = 0; k < list.length; k += 1) {
        const o = list[k];
        if (o === w || o.dead) continue;
        const need =
          (mine + reachOf(o)) *
          (o.mode === "perch" || o.mode === "land" ? 0.25 : 0.5);
        b.copy(w.pos).sub(o.pos);
        const d = b.length();
        if (d < need && d > 1e-4)
          a.addScaledVector(b, (((need - d) / need) * 4) / d);
      }
    }
    w.acc.copy(a).sub(w.vel).multiplyScalar(fl.agility);
    w.vel.addScaledVector(w.acc, dt);
    kind.flightForce?.(w.rig, w.vel, dt);
    w.pos.addScaledVector(w.vel, dt);
    keepOut(w, dt);
    return dist;
  }

  const fp = new Vector3();
  const side = new Vector3();
  function footprint(w, tips = true) {
    const scale = w.holder.scale.x;
    const [along, across] = kind.foot ?? [0.05, 0.04];
    side.crossVectors(N, F).normalize();
    const offsets = [
      [F, along],
      [F, -along],
      [side, across],
      [side, -across],
      [F, along * 0.5],
      [F, -along * 0.5],
    ];
    const spotAt = (dir, d) => {
      b.copy(P).addScaledVector(dir, d).addScaledVector(N, 0.6);
      const hit = hitAlong(b, N) ?? ctx.hitFrom(b);
      return hit ? skinSpot(peach, hit, {}) : null;
    };
    const P0 = P.clone();
    const N0 = N.clone();
    const F0 = F.clone();
    w.feet = offsets
      .map(([dir, d]) => spotAt(dir.clone(), d * scale))
      .filter(Boolean);
    const samples = w.rig.wingSamples;
    if (tips) {
      w.tipsIn = 0;
      w.tips = samples
        ? [1, -1].map((sg) =>
            samples.map(({ lat, lon, d }) => {
              b.copy(P0)
                .addScaledVector(side, sg * lat * scale)
                .addScaledVector(F0, lon * scale)
                .addScaledVector(N0, 0.6);
              const hit = hitAlong(b, N0) ?? ctx.hitFrom(b);
              return {
                spot: hit ? skinSpot(peach, hit, {}) : null,
                d: d * scale,
              };
            }),
          )
        : null;
    }
    P.copy(P0);
    N.copy(N0);
    F.copy(F0);
  }

  const P0 = new Vector3();
  const N0 = new Vector3();
  function skinLift(w, dt) {
    let lift = 0;
    P0.copy(P);
    N0.copy(N);
    const feet = w.feet ?? [];
    const fresh = w.footFor !== feet;
    if (fresh) {
      w.footFor = feet;
      w.footAt = feet.map(() => new Vector3());
    }
    w.footPhase = 1 - (w.footPhase ?? 0);
    feet.forEach((spot, k) => {
      // Half the feet per frame; the rest keep last frame's skin point.
      if (fresh || k % 2 === w.footPhase) skinPose(peach, spot, w.footAt[k]);
      fp.copy(w.footAt[k]).applyMatrix4(mw);
      lift = Math.max(lift, fp.sub(P0).dot(N0));
    });
    lift += 0.006 * w.holder.scale.x;
    if (w.tips) w.tipsIn = (w.tipsIn ?? 0) - dt;
    if (w.tips && w.tipsIn <= 0) {
      w.tipsIn = 0.1;
      const scale = w.holder.scale.x;
      const hinge = lift + (kind.stand + 0.006) * scale;
      w.tipsOpen ??= [-1, -1];
      w.tips.forEach((samples, n) => {
        let need = -1;
        samples.forEach(({ spot, d }) => {
          if (!spot) return;
          skinPose(peach, spot, fp);
          fp.applyMatrix4(mw);
          const rise = fp.sub(P0).dot(N0) - hinge;
          need = Math.max(
            need,
            Math.asin(Math.max(-1, Math.min(1, (rise + 0.13 * scale) / d))) +
              0.12,
          );
        });
        w.tipsOpen[n] = need;
      });
    }
    return lift;
  }

  const xAxis = new Vector3();
  const yAxis = new Vector3();
  const tip = new Vector3();
  function wingGuard(w) {
    const scale = w.holder.scale.x;
    const L = kind.wingSpan * 0.9 * scale;
    const ctr = ctx.center();
    xAxis.set(1, 0, 0).applyQuaternion(w.quat);
    yAxis.set(0, 1, 0).applyQuaternion(w.quat);
    w.guardOpen ??= [-1, -1];
    [1, -1].forEach((sideSign, n) => {
      let need = -1;
      [1, 0.55].forEach((frac) => {
        const reach = L * frac;
        tip.copy(w.pos).addScaledVector(xAxis, sideSign * reach);
        const hit = ctx.hitFrom(tip);
        const r0 = tip.distanceTo(ctr);
        if (!hit) {
          if (r0 < (w.skinR || 1.2)) need = 1.3;
          return;
        }
        const rS = hit.point.distanceTo(ctr) + 0.15;
        const k = tip.sub(ctr).normalize().dot(yAxis) * reach;
        if (r0 >= rS && k <= 0) return;
        need = Math.max(
          need,
          k > 0.02 ? Math.asin(Math.max(-1, Math.min(1, (rS - r0) / k))) : 1.3,
        );
      });
      w.guardOpen[n] = need;
    });
  }

  function hopSpot(w) {
    ride(w.spot);
    for (let k = 0; k < 6; k += 1) {
      a.set(rand(-1, 1), rand(-1, 1), rand(-1, 1));
      a.addScaledVector(N, -a.dot(N)).normalize();
      b.copy(P).addScaledVector(a, rand(0.4, 0.8)).addScaledVector(N, 0.6);
      const hit = ctx.hitFrom(b);
      if (!hit) continue;
      c.copy(hit.face.normal).transformDirection(mw);
      if (c.z < kind.spots.zMin) continue;
      if (!spotFree(c.copy(hit.point).applyMatrix4(inv), w)) continue;
      return spotFromHit(hit, a.clone());
    }
    return null;
  }

  const lookV = new Vector3();
  function faceFlight(w, dt, lookAt) {
    const speed = w.vel.length();
    a.copy(lookAt).sub(w.pos).normalize();
    b.copy(w.vel).multiplyScalar(1 / Math.max(speed, 1e-4));
    F.copy(a).lerp(b, smoother((speed - 0.25) / 0.8));
    if (w.skinR) {
      c.copy(w.pos).sub(ctx.center());
      const clearance = c.length() - w.skinR;
      c.normalize();
      const into = F.dot(c);
      if (clearance < 0.7 && into < 0)
        F.addScaledVector(c, -into * smoother((0.7 - clearance) / 0.4));
    }
    if (w.avoidT > 0) {
      const into = F.dot(w.avoidN);
      if (into < 0) F.addScaledVector(w.avoidN, -into);
    }
    F.y *= 0.55;
    if (F.lengthSq() < 1e-5) F.crossVectors(UP, c.lengthSq() ? c : Z);
    F.normalize();
    a.crossVectors(UP, F).normalize();
    b.crossVectors(F, a);
    basis.makeBasis(a, b, F);
    q.setFromRotationMatrix(basis);
    const fl = kind.flight;
    const roll = Math.max(-0.85, Math.min(0.85, -w.acc.dot(a) * fl.bank));
    const slow = 1 - smoother(speed / 1.5);
    const pitch =
      Math.max(-0.3, Math.min(0.45, w.acc.dot(F) * 0.03)) +
      fl.hoverPitch * slow +
      (w.sulk ? 0.3 : 0) +
      (w.pitch ?? 0);
    q.multiply(q2.setFromEuler(euler.set(pitch, 0, roll)));
    w.quat.slerp(q, ease(7, dt));
  }

  function startWalk(w) {
    ride(w.spot);
    a.copy(F).applyAxisAngle(N, rand(-0.8, 0.8));
    a.addScaledVector(N, -a.dot(N));
    if (a.lengthSq() < 1e-4) return;
    a.normalize();
    b.copy(P).addScaledVector(a, 0.15).addScaledVector(N, 0.5);
    const hit = hitAlong(b, N);
    if (!hit) return;
    const to = skinSpot(peach, hit, {});
    if (!spotFree(to.local, w)) return;
    w.walk = {
      l0: w.spot.local.clone(),
      n0: w.spot.normal.clone(),
      g0: w.spot.give,
      to,
      u: -0.5,
      f0: w.spot.f.clone(),
      f: a.clone().transformDirection(inv),
    };
  }

  function startle(w, dir) {
    ride(w.spot);
    const ctr = ctx.center();
    w.mode = "startle";
    w.timer = 0;
    w.walk = null;
    w.from.copy(w.pos);
    w.fromQ.copy(w.quat);
    w.escape = new Vector3().copy(N).multiplyScalar(1.2);
    a.copy(dir).addScaledVector(N, -dir.dot(N));
    w.escape.addScaledVector(a, -0.5);
    a.copy(w.pos).sub(ctr).setY(0);
    if (a.lengthSq() > 1e-4) w.escape.addScaledVector(a.normalize(), 0.5);
    w.escape.y += 0.6;
    w.escape.normalize();
    w.curve = Math.random() < 0.5 ? -1 : 1;
    w.flinch = 1;
    whoosh(ctx, panOf(w), s.volume * 0.4, 700);
  }

  function escapeFly(w, dt) {
    w.timer += dt;
    const t = w.timer;
    const turn = w.curve * t * 1.4;
    a.copy(w.escape).applyAxisAngle(UP, turn);
    a.y = Math.max(a.y, 0.25);
    const speed = 3.2 - Math.min(1.6, t * 1.6);
    a.normalize().multiplyScalar(speed);
    a.x += Math.sin(t * 9 + w.seed) * 0.5;
    a.y += Math.sin(t * 7.3 + w.seed * 2) * 0.35;
    w.vel.lerp(a, ease(5, dt));
    w.acc.copy(a).sub(w.vel);
    w.pos.addScaledVector(w.vel, dt);
    keepOut(w, dt);
    w.pitch = -0.55 * (1 - smoother(t / 0.9));
    faceFlight(w, dt, b.copy(w.pos).add(w.vel));
    if (t > 1.1) {
      w.pitch = 0;
      w.flinch = 0;
      const ctr = ctx.center();
      const v = halfView();
      const away = w.pos.x > ctr.x ? 1 : -1;
      flyTo(
        w,
        b.set(
          ctr.x + away * Math.min(2.3, v.w - 0.4),
          ctr.y + rand(0.8, 2),
          ctr.z + 1.6,
        ),
        0.7,
        start,
      );
    }
  }

  const origJiggle = peach.addJiggle;
  let wired = true;
  const wrapped = function wrappedJiggle(point, dir, amp, radius) {
    origJiggle.call(this, point, dir, amp, radius);
    if (!wired || quiet) return;
    list.forEach((w) => {
      if (w.dead || !w.spot || !(w.mode === "perch" || w.mode === "land"))
        return;
      ride(w.spot);
      const d = P.distanceTo(point) / Math.max(0.2, radius * 0.9);
      const e = amp * Math.exp(-d * d) * s.touchy;
      if (e > kind.knock) startle(w, dir);
      else if (e > FLINCH) {
        w.flinch = Math.min(1, w.flinch + e * 45);
        w.rig.flick = 1;
        w.hopV = (w.hopV ?? 0) + e * 14;
        w.lagV.addScaledVector(dir, e * 6);
      }
    });
  };
  peach.addJiggle = wrapped;
  ctx.onDispose(() => {
    wired = false;
    if (peach.addJiggle === wrapped) peach.addJiggle = origJiggle;
  });

  const api = {
    ctx,
    get volume() {
      return s.volume;
    },
    pan: panOf,
    rand3: (k) =>
      new Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(k),
    headWorld: (w, up) =>
      new Vector3(0, up, 0)
        .applyQuaternion(w.quat)
        .multiplyScalar(w.holder.scale.x)
        .add(w.pos),
  };
  function spray(w, amount) {
    ctx.droplets?.spray(
      api.headWorld(w, 0.1),
      new Vector3(0, 1, 0.3).normalize(),
      w.vel.clone().normalize(),
      amount,
      0.8,
    );
  }

  function payout(w, total, count) {
    game.gain(total, "sippers");
    const { popups } = ctx.room.toucher;
    if (w.special) popups.big(w.sx, w.sy - 40, "×3", kind.specialName);
    const part = total / count;
    for (let n = 0; n < count; n += 1) {
      const x = w.sx + rand(-36, 36);
      const y = w.sy + rand(-30, 10);
      queue.push({
        at: s.time + n * 0.08,
        fn: () => popups.juice(x, y, part, n === 0 ? "twerk" : "helper"),
      });
    }
  }

  function collect(w) {
    const total =
      Math.max(game.rate * 0.5, w.sipped * 1.1) * (w.special ? 3 : 1);
    payout(w, total, 2 + Math.round(w.fill * 4));
    if (w.spot && (w.mode === "perch" || w.mode === "land")) {
      ride(w.spot);
      quietTouch(hitOf(), { jiggle: 0.03 + w.fill * 0.03, radius: 0.45 });
    }
    spray(w, 0.2 + w.fill);
    const style = kind.collect(sparks, w, api);
    w.collected = true;
    w.fill = 0;
    w.spot = null;
    w.goalSpot = null;
    w.walk = null;
    w.mode = style;
    w.timer = 0;
    const lift = new Vector3(0, 1, 0).applyQuaternion(w.quat);
    w.out = {
      center: w.pos.clone().addScaledVector(lift, 0.18),
      angle: Math.atan2(w.pos.z - camera.position.z, w.pos.x),
      r: 0.05,
    };
  }

  function shoo(w) {
    w.collected = true;
    w.spot = null;
    w.goalSpot = null;
    w.walk = null;
    w.mode = "shoo";
    w.timer = 0;
    w.vel.set(
      (w.pos.x > ctx.center().x ? 1 : -1) * rand(3, 4.5),
      rand(1.5, 2.5),
      rand(-0.5, 0.5),
    );
  }

  const drinkers = [];
  // The game holds back SHARE of income per drinker; the pot is split among this frame's drinkers.
  function drink() {
    const { sip } = game;
    if (drinkers.length)
      drinkers.forEach((w) => {
        w.sipped += sip.pot / drinkers.length;
      });
    else game.gain(sip.pot, "helpers");
    sip.pot = 0;
    sip.share = SHARE * drinkers.length;
  }

  function updateSipper(w, dt) {
    w.t += dt;
    const { p } = w;
    const ctr = ctx.center();
    const size = (w.special ? kind.specialSize : kind.size) * s.size * w.sizeK;
    let air = 1;
    let sip = 0;
    if (w.appear < 1 && !w.collected) w.appear = Math.min(1, w.appear + dt * 2);
    if (w.mode !== w.skinMode) {
      w.skinMode = w.mode;
      w.skinIn = 0;
    }
    w.holder.scale.setScalar(Math.max(0.001, size * w.appear));

    if (!ctx.live && (w.mode === "perch" || w.mode === "land") && w.spot)
      takeOff(w, (x) => roam(x, start));

    if (w.mode === "fly") {
      const dist = steer(w, dt);
      faceFlight(w, dt, w.goalSpot ? lookV.copy(w.pos).add(F) : ctr);
      if (dist < w.arrive && w.onArrive) {
        const fn = w.onArrive;
        w.onArrive = null;
        fn(w);
      }
    } else if (w.mode === "land") {
      w.timer += dt;
      const raw = Math.min(1, w.timer / kind.landTime);
      const u = smoother(raw);
      ride(w.spot);
      sitPose(w, b, q);
      if (!w.feet) footprint(w);
      b.addScaledVector(N, skinLift(w, dt));
      air = 1 - smoother((u - 0.55) / 0.45);
      b.addScaledVector(N, kind.stand * w.holder.scale.x * air);
      c.copy(b).sub(w.from);
      const drop = c.dot(N);
      c.addScaledVector(N, -drop);
      w.pos
        .copy(w.from)
        .addScaledVector(c, 1 - (1 - raw) ** 2)
        .addScaledVector(N, drop * u);
      w.quat.copy(w.fromQ).slerp(q, smoother(raw / 0.6));
      w.vel.set(0, 0, 0);
      if (raw >= 1) {
        w.mode = "perch";
        w.tracked = false;
        w.lag.set(0, 0, 0);
        w.lagV.set(0, 0, 0);
        w.sqV = -2.4;
      }
    } else if (w.mode === "perch") {
      if (w.walk) {
        const wk = w.walk;
        wk.u = Math.min(1, wk.u + dt / 0.9);
        const u = smoother(wk.u);
        w.spot.local.copy(wk.l0).lerp(wk.to.local, u);
        w.spot.normal.copy(wk.n0).lerp(wk.to.normal, u).normalize();
        w.spot.give = wk.g0 + (wk.to.give - wk.g0) * u;
        w.spot.f
          .copy(wk.f0)
          .lerp(wk.f, smoother((wk.u + 0.5) / 0.45))
          .normalize();
        p.walk += (1 - p.walk) * ease(10, dt);
        if (wk.u >= 1) {
          w.walk = null;
          w.feet = null;
        }
      } else p.walk *= Math.exp(-dt * 8);
      ride(w.spot);
      sitPose(w, w.pos, w.quat, dt);
      if (w.feet && w.walk) w.feetIn = (w.feetIn ?? 0) - dt;
      if (!w.feet || (w.walk && w.feetIn <= 0)) {
        w.feetIn = 0.2;
        w.tipsTurn = !w.walk || !w.tipsTurn;
        footprint(w, w.tipsTurn);
      }
      w.pos.addScaledVector(N, skinLift(w, dt));
      if (w.hopV || w.hop) {
        w.hopV = (w.hopV ?? 0) - ((w.hop ?? 0) * 220 + w.hopV * 13) * dt;
        w.hop = Math.max(0, (w.hop ?? 0) + w.hopV * dt);
        w.pos.addScaledVector(N, w.hop * w.holder.scale.x);
      }
      air = 0;
      sip = w.flinch > 0.5 ? 0 : 1;
      w.fill = Math.min(1, w.fill + (dt * s.speed) / (w.special ? 60 : 45));
      drinkers.push(w);
      w.slurpIn -= dt;
      if (w.slurpIn < 0) {
        w.slurpIn = rand(0.5, 1.3);
        slurp(ctx, panOf(w), s.volume * (kind.slurp ?? 0.3));
      }
      w.squirmIn -= dt;
      if (w.squirmIn < 0) {
        w.squirmIn = rand(4, 7);
        quietTouch(hitOf(), { jiggle: 0.012 + w.fill * 0.025, radius: 0.45 });
      }
      w.walkIn -= dt;
      if (w.walkIn < 0) {
        w.walkIn = rand(...w.walkEvery);
        startWalk(w);
      }
      w.relocate -= dt * s.speed;
      if (w.relocate < 0 && !w.walk) {
        w.relocate = rand(...w.perch);
        const near = kind.hopNear && Math.random() < 0.7 ? hopSpot(w) : null;
        takeOff(
          w,
          near
            ? (x) => {
                flyToSpot(x, near, beginLand);
              }
            : start,
        );
      }
    } else if (w.mode === "lift") {
      w.timer += dt;
      const u = smoother(w.timer / 0.45);
      if (w.spot) {
        ride(w.spot);
        b.copy(P).addScaledVector(N, 0.55);
        w.pos.copy(w.from).lerp(b, u);
        w.vel.copy(N).multiplyScalar(1.2);
      }
      air = Math.min(1, 0.4 + u);
      if (u >= 1) {
        w.mode = "fly";
        w.spot = null;
        const fn = w.onArrive;
        w.onArrive = null;
        fn?.(w);
      }
    } else if (w.mode === "startle") {
      w.timer += dt;
      const u = smoother(w.timer / 0.16);
      if (w.spot) {
        ride(w.spot);
        const lift = w.feet ? skinLift(w, dt) : 0;
        // The nose-up pitch swings the abdomen down; lift by its drop.
        const tailDrop = 0.085 * Math.sin(0.5 * u + 0.22 * p.air);
        b.copy(P).addScaledVector(
          N,
          lift + (0.03 + u * 0.14 + tailDrop) * w.holder.scale.x,
        );
        w.pos.copy(w.from).lerp(b, u);
        const above = c.copy(w.pos).sub(P).dot(N);
        const floor = lift + (0.03 + tailDrop) * w.holder.scale.x;
        if (above < floor) w.pos.addScaledVector(N, floor - above);
        q.copy(w.fromQ).multiply(q2.setFromAxisAngle(a.set(1, 0, 0), -0.5 * u));
        w.quat.copy(q);
      }
      air = 1;
      if (w.timer >= 0.16) {
        w.spot = null;
        w.mode = "escape";
        w.timer = 0;
        w.vel.copy(w.escape).multiplyScalar(2.5);
      }
    } else if (w.mode === "escape") {
      escapeFly(w, dt);
    } else if (w.mode === "shoo") {
      w.timer += dt;
      w.vel.y += dt * 1.5;
      w.pos.addScaledVector(w.vel, dt);
      faceFlight(w, dt, ctr);
      w.appear = 1 - smoother((w.timer - 0.7) / 0.4);
      if (w.timer > 1.1) {
        kill(w);
        return;
      }
    } else if (w.mode === "spiral") {
      w.timer += dt;
      const o = w.out;
      o.angle += dt * (3 + w.timer * 2);
      o.r = Math.min(0.45, o.r + dt * 0.4);
      a.set(
        o.center.x + Math.cos(o.angle) * o.r,
        o.center.y + w.timer * w.timer * 0.9 + w.timer * 0.5,
        o.center.z + Math.sin(o.angle) * o.r,
      );
      w.vel.copy(a).sub(w.pos).divideScalar(Math.max(dt, 1e-3));
      w.pos.copy(a);
      b.copy(a);
      keepOut(w, dt);
      o.center.add(b.subVectors(w.pos, b));
      faceFlight(w, dt, a.set(o.center.x, w.pos.y + 1, o.center.z));
      w.starIn = (w.starIn ?? 0) - dt;
      if (w.starIn < 0) {
        w.starIn = 0.05;
        sparks.emit("twinkle", w.pos, api.rand3(0.15), {
          size: 0.06 + Math.random() * 0.05,
          life: 1,
          color: w.special ? 0x9ad0ff : 0xffd8b0,
        });
      }
      w.appear = 1 - smoother((w.timer - 1.5) / 0.6);
      if (w.timer > 2.1) {
        kill(w);
        return;
      }
    }

    if (w.dead) return;
    w.flinch *= Math.exp(-dt * 4);
    w.sulk = w.collected ? 1 : w.sulk * Math.exp(-dt * 2);
    w.sqV += (-w.sq * 160 - w.sqV * 9) * dt;
    w.sq += w.sqV * dt;
    p.air += (air - p.air) * ease(w.mode === "land" ? 30 : 9, dt);
    p.sip += (sip - p.sip) * ease(sip ? 3 : 8, dt);
    p.fill += (w.fill - p.fill) * ease(w.collected ? 7 : 2, dt);
    p.flinch = w.flinch;
    p.sulk = w.sulk;
    p.t = s.time + w.seed;
    p.blur = ctx.still;
    p.dt = dt;
    p.speed = w.mode === "perch" || w.mode === "land" ? 0 : w.vel.length();
    p.scale = w.holder.scale.x;
    p.burst = w.mode === "startle" || w.mode === "escape";
    p.nearSpot = w.mode === "perch" || w.mode === "startle";
    const guarded =
      kind.wingSpan && !p.nearSpot && p.clear < kind.wingSpan * p.scale + 0.3;
    if (guarded) {
      if (!w.guarded) w.guardIn = 0;
      w.guardIn = (w.guardIn ?? 0) - dt;
      if (w.guardIn <= 0) {
        w.guardIn = w.mode === "fly" || w.mode === "land" ? 0.08 : 0;
        wingGuard(w);
      }
      p.nearSpot = true;
    }
    w.guarded = guarded;
    const guard = guarded ? w.guardOpen : null;
    const tips =
      w.mode === "land" || w.mode === "perch" || w.mode === "startle"
        ? w.tipsOpen
        : null;
    w.rig.minOpen ??= [0, 0];
    const burstFloor = w.mode === "startle" ? 0.6 : -1;
    for (let n = 0; n < 2; n += 1)
      w.rig.minOpen[n] = Math.max(
        guard?.[n] ?? -1,
        tips?.[n] ?? -1,
        burstFloor,
      );
    if (w.mode === "land" && w.spot) p.clear = a.copy(w.pos).sub(P).dot(N);
    else if (w.mode === "perch") p.clear = 1;
    else p.clear = w.skinR ? w.pos.distanceTo(ctr) - w.skinR : 1;
    p.landing =
      w.mode === "land" ||
      (w.mode === "fly" && w.goalSpot && w.goal.distanceTo(w.pos) < 1.2);
    if (w.rig.flapped) {
      w.rig.flapped = false;
      const near = Math.max(
        0.3,
        Math.min(1, 1.6 - camera.position.distanceTo(w.pos) / 12),
      );
      if (kind.softFlap)
        whoosh(
          ctx,
          panOf(w),
          s.volume * kind.softFlap.volume * near,
          kind.softFlap.hz,
        );
    }
    w.holder.position.copy(w.pos);
    w.holder.quaternion.copy(w.quat);
    const squash = w.sq * 0.18;
    w.rig.root.scale.set(1 - squash * 0.5, 1 + squash, 1 - squash * 0.5);
    w.rig.root.position.y = kind.stand * (1 - p.air);
    kind.pose(w.rig, p);
    screenOf(w.pos, w);
  }

  ctx.onPointerDown((e) => {
    if (e.button > 0) return false;
    let best = null;
    let bestD = Infinity;
    list.forEach((w) => {
      if (w.dead || w.collected || !w.front) return;
      const reach = 40 + 0.15 * w.holder.scale.x * pxPerUnit(w.pos);
      const d = Math.hypot(w.sx - e.clientX, w.sy - e.clientY);
      if (d < reach && d < bestD) {
        bestD = d;
        best = w;
      }
    });
    if (!best) return false;
    collect(best);
    return true;
  });

  function send(special) {
    if (list.filter((w) => !w.dead).length >= MAX) return;
    finishPrep();
    const w = make(special);
    start(w);
  }

  ctx.onDispose(() => {
    sparks.dispose();
    shared.own.forEach((x) =>
      x.dispose ? x.dispose() : Object.values(x).forEach((v) => v?.dispose?.()),
    );
    [shared.sphere, shared.lowSphere, shared.rod].forEach((x) => x.dispose());
  });

  return {
    async prepare() {
      while (prep && !prep.next().done)
        // eslint-disable-next-line no-await-in-loop
        await new Promise(requestAnimationFrame);
      finishPrep();
    },
    update(dt, away = false) {
      s.time += dt;
      const { mesh } = peach;
      if (!mesh) return;
      mw.copy(mesh.matrixWorld);
      inv.copy(mw).invert();
      s.scale = mw.getMaxScaleOnAxis();
      for (let k = queue.length - 1; k >= 0; k -= 1) {
        if (queue[k].at <= s.time) queue.splice(k, 1)[0].fn();
      }
      if (prep && prep.next().done) {
        prep = null;
        warmBatches();
      }
      if (ready) s.next -= dt * s.speed;
      if (ready && s.next < 0 && !away) {
        s.next = rand(...s.gap);
        const active = list.filter((w) => !w.dead && !w.collected).length;
        const slots = butterflySlots(game.state);
        if (active < slots && ctx.live)
          send(slots === BUTTERFLY_HARVESTS.length && Math.random() < 0.05);
      }
      drinkers.length = 0;
      for (let k = list.length - 1; k >= 0; k -= 1) {
        const w = list[k];
        if (!w.dead) updateSipper(w, dt);
        if (w.dead) list.splice(k, 1);
      }
      drink();
      sparks.update(dt);
      if (shadows) {
        shadowItems.length = 0;
        list.forEach((w) => {
          if (w.dead) return;
          w.rig.shadow ??= {};
          const it = w.rig.shadow;
          const perched = w.mode === "perch";
          it.height = perched ? 0 : Math.max(0, w.p.clear ?? 1);
          it.alpha = w.appear;
          shadowItems.push(it);
        });
        shadows.update(shadowItems, dt);
      }
      batches.forEach((batch, key) => {
        batchRigs.length = 0;
        list.forEach(
          (w) => !w.dead && w.rig.lookKey === key && batchRigs.push(w.rig),
        );
        batch.write(batchRigs);
        shadows?.write(batch, batchRigs);
      });
      shadows?.render();
    },
    scatter() {
      list.forEach((w) => {
        if (w.dead || w.collected) return;
        game.gain(w.sipped, "sippers");
        // eslint-disable-next-line no-param-reassign
        w.sipped = 0;
        shoo(w);
      });
    },
    leave() {
      list.forEach((w) => {
        w.sipped = 0;
        if (!w.dead && !w.collected) shoo(w);
      });
      s.next = rand(...s.gap);
    },
    dispose() {
      list.forEach(
        (w) => !w.dead && !w.collected && game.gain(w.sipped, "sippers"),
      );
      game.sip.share = 0;
      game.gain(game.sip.pot, "helpers");
      game.sip.pot = 0;
    },
  };
}
