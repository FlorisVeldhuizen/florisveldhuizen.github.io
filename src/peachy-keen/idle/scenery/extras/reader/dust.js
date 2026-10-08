/* eslint-disable no-param-reassign -- flake state objects are updated in place each frame */
import { Color, Vector3 } from "three";
import { CARD_H, CARD_W } from "./card-mesh";
import { skinPose, skinSpot } from "../../skin-jiggle";
import { chime, rand, smooth } from "./fx";

const GOLD = new Color(1, 0.84, 0.58);
const WARM = new Color(1, 0.93, 0.8);

export default function goldDust(ctx, { points, impacts }) {
  const flakes = Array.from({ length: 18 }, () => ({
    pos: new Vector3(),
    aim: new Vector3(),
    aimV: new Vector3(),
    push: 0,
    start: new Vector3(),
    pop: new Vector3(),
    spot: {},
    land: new Vector3(),
    hit: null,
    state: 0,
    t: 0,
    delay: 0,
    dur: 1,
    sway: 0,
    phase: 0,
    spin: 0,
    size: 0.08,
    leaf: false,
  }));
  const tmp = new Vector3();
  const n = new Vector3();
  const ray = new Vector3();
  const MARGIN = 0.05;
  let absorbed = 0;

  function clearance(p, r) {
    const cam = ctx.camera.position;
    ray.copy(p).sub(cam);
    const dist = ray.length();
    ray.divideScalar(dist);
    const rc = ctx.interaction.raycaster;
    rc.set(cam, ray);
    rc.far = dist + r + MARGIN;
    const hit = rc.intersectObject(ctx.peach.mesh, false)[0];
    rc.far = Infinity;
    return hit ? Math.max(0, dist + r + MARGIN - hit.distance) : 0;
  }

  function settle(f, dt) {
    const w = 32;
    const steps = Math.ceil(dt * 240);
    const h = dt / steps;
    for (let k = 0; k < steps; k += 1) {
      tmp
        .copy(f.land)
        .sub(f.aim)
        .multiplyScalar(w * w)
        .addScaledVector(f.aimV, -2 * w);
      f.aimV.addScaledVector(tmp, h);
      f.aim.addScaledVector(f.aimV, h);
    }
  }

  function guard(f, p, r, dt) {
    const need = clearance(p, r);
    f.push += (need - f.push) * (1 - Math.exp(-dt * (need > f.push ? 45 : 10)));
    if (f.push > 1e-4) {
      ray.copy(p).sub(ctx.camera.position).normalize();
      p.addScaledVector(ray, -Math.max(f.push, need * 0.85));
    }
  }

  let total = 0;
  let source = null;
  const sparkle = (f, k) => 0.5 + 0.5 * Math.sin(f.spin * k + f.phase);

  function finale(hit) {
    ctx.touch(hit, {
      jiggle: 0.02,
      radius: 1.3,
      heat: 1,
      wobble: 0.025,
      pop: false,
    });
    impacts.add(
      ctx
        .center()
        .clone()
        .setZ(ctx.center().z + 1.2),
      1.4,
      0.18,
    );
    chime(ctx, 1046.5, { volume: 0.012, decay: 2.2 });
    chime(ctx, 1568, { volume: 0.008, decay: 1.8, delay: 0.1 });
  }

  return {
    start(card, burn) {
      const centre = ctx.center();
      absorbed = 0;
      total = 0;
      source = card.mesh;
      flakes.forEach((f, k) => {
        const along = k / (flakes.length - 1);
        f.leaf = k % 5 === 2;
        f.start.set(
          rand(-0.44, 0.44) * CARD_W,
          (0.46 - along * 0.92) * CARD_H,
          0.02,
        );
        f.pop.set(rand(-0.5, 0.5), rand(0.1, 0.5), rand(0.2, 0.6));
        tmp.set(
          centre.x + rand(-1.6, 1.6),
          centre.y + rand(1.6, 2.6),
          centre.z + 3,
        );
        const hit = ctx.hitFrom(tmp);
        f.hit = hit;
        if (hit) {
          skinSpot(ctx.peach, hit, f.spot);
          total += 1;
        }
        f.delay = along * burn * 0.7 + rand(0, 0.05);
        f.dur = rand(1.0, 1.35);
        f.sway = rand(0.1, 0.22);
        f.phase = rand(0, 6.3);
        f.spin = rand(6, 10);
        f.size = f.leaf ? rand(0.15, 0.2) : rand(0.06, 0.11);
        f.state = 0;
        f.t = 0;
      });
    },
    update(dt, t) {
      flakes.forEach((f) => {
        if (!f.hit || f.state === 3) return;
        if (f.state === 0) {
          f.delay -= dt;
          if (f.delay > 0) return;
          source.updateMatrixWorld();
          f.start.applyMatrix4(source.matrixWorld);
          f.state = 1;
          f.t = 0;
          f.push = 0;
          f.aimV.set(0, 0, 0);
          f.aim.set(NaN, 0, 0);
        }
        skinPose(ctx.peach, f.spot, f.land, n);
        n.transformDirection(ctx.peach.mesh.matrixWorld);
        f.land
          .applyMatrix4(ctx.peach.mesh.matrixWorld)
          .addScaledVector(n, f.size * 0.65 + MARGIN);
        if (Number.isNaN(f.aim.x)) f.aim.copy(f.land);
        settle(f, dt);
        if (f.state === 1) {
          f.t += dt / f.dur;
          const popK = 1 - Math.exp(-f.t * f.dur * 7);
          const e = smooth(Math.max(0, (f.t - 0.1) / 0.9));
          tmp.copy(f.start).addScaledVector(f.pop, 0.3 * popK);
          f.pos.copy(tmp).lerp(f.aim, e);
          f.pos.x +=
            Math.sin(f.phase + f.t * 6) * f.sway * Math.sin(Math.PI * e);
          f.pos.z +=
            Math.cos(f.phase + f.t * 4) * f.sway * 0.4 * Math.sin(Math.PI * e);
          const glint = sparkle(f, t) ** 6;
          const birth = Math.exp(-f.t * f.dur * 5);
          const flat =
            0.45 + 0.55 * Math.abs(Math.cos(f.phase + t * f.spin * 0.5));
          guard(f, f.pos, f.size * 0.65, dt);
          points.push(
            f.pos,
            f.size * flat + birth * 0.25 + glint * (f.leaf ? 0.12 : 0.05),
            glint > 0.6 || birth > 0.3 ? WARM : GOLD,
            Math.min(1, f.t * 10) * (0.7 + 0.3 * glint),
          );
          if (f.t >= 1) {
            f.state = 2;
            f.t = 0;
            if (absorbed === 0) {
              ctx.touch(f.hit, { jiggle: 0.03, radius: 1, pop: true });
              chime(ctx, 1568, { volume: 0.006, decay: 1.4 });
            }
          }
        } else {
          f.t += dt / 0.25;
          const k = 1 - f.t;
          const size = f.size * 1.25 * k * k;
          tmp.copy(f.aim).addScaledVector(n, size * 0.5 - f.size * 0.65);
          guard(f, tmp, f.size * 0.65, dt);
          points.push(tmp, size, WARM, k);
          if (f.t >= 1) {
            f.state = 3;
            absorbed += 1;
            if (absorbed === total) finale(f.hit);
          }
        }
      });
    },
  };
}
