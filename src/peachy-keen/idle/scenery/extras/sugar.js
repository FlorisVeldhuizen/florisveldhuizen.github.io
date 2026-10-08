import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  InstancedMesh,
  LatheGeometry,
  Matrix4,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  MeshPhysicalMaterial,
  Quaternion,
  RawShaderMaterial,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  Vector2,
  Vector3,
  WebGLRenderTarget,
} from "three";
import { softTexture, twinkleTexture } from "../shapes";
import { ringMaterial, showRing } from "../../../rings";
import { skinPose, skinSpot } from "../skin-jiggle";
import { beforeDraw, rider } from "./skin-layer";

const MAX = 40;
const SPARKS = 16;
const SIZE = 0.105;
const GRAVITY = -9;
const Y = new Vector3(0, 1, 0);
const TINTS = [0xffffff, 0xdfeaff, 0xffe2f0, 0xe6fff4];
const COIN_R = 0.2;
const COIN_TH = 0.026;
const X = new Vector3(1, 0, 0);
const Z = new Vector3(0, 0, 1);
const RESTITUTION = 0.8;
const MAX_BOUNCES = 1;
const RISE = 1.3;
const SETTLE = 1.2;
const LIFT = 0.72 * 0.6 + 0.02;

const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => Math.min(1, Math.max(0, t));

function gemGeometry() {
  const g = new LatheGeometry(
    [
      new Vector2(0, -0.72),
      new Vector2(1, -0.04),
      new Vector2(1, 0.04),
      new Vector2(0.58, 0.3),
      new Vector2(0, 0.3),
    ],
    10,
  ).toNonIndexed();
  g.computeVertexNormals();
  return g;
}

const GEM_VERTEX = `
  varying vec3 vN;
  varying vec3 vView;
  varying vec3 vFacet;
  void main() {
    mat4 world = modelMatrix;
    #ifdef USE_INSTANCING
      world = modelMatrix * instanceMatrix;
    #endif
    vec4 view = viewMatrix * world * vec4(position, 1.0);
    vN = normalize(mat3(viewMatrix) * mat3(world) * normal);
    vFacet = normal;
    vView = -view.xyz;
    gl_Position = projectionMatrix * view;
  }
`;

const GEM_FRAGMENT = `
  uniform float uTime;
  varying vec3 vN;
  varying vec3 vView;
  varying vec3 vFacet;
  float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
  void main() {
    vec3 n = normalize(vN);
    vec3 v = normalize(vView);
    vec3 r = reflect(-v, n);
    vec3 cell = floor(vFacet * 8.0 + 0.5);
    float h = hash(cell);
    vec3 own = normalize(vec3(hash(cell + 1.7), hash(cell + 3.1), hash(cell + 5.3)) * 2.0 - 1.0 + vec3(0.0, 0.6, 0.9));
    float sky = smoothstep(-0.4, 0.8, r.y * 0.5 + r.x * 0.2 + 0.2);
    vec3 col = mix(vec3(0.42, 0.46, 0.6), vec3(1.0, 0.99, 1.0), clamp(sky * 0.55 + h * 0.6, 0.0, 1.0));
    vec3 fire = 0.55 + 0.45 * cos(6.2832 * (h * 1.7 + dot(r, vec3(0.7, 0.4, 0.2)) + vec3(0.0, 0.33, 0.67)));
    col = mix(col, fire, 0.3 * step(0.55, h));
    float glint = pow(max(dot(r, own), 0.0), 28.0);
    float key = pow(max(dot(r, normalize(vec3(-0.4, 0.6, 0.7))), 0.0), 40.0);
    float flick = pow(0.5 + 0.5 * sin(uTime * (2.0 + h * 3.0) + h * 30.0), 8.0) * step(0.8, h);
    col += vec3(1.0) * (glint * 1.3 + key * 1.5 + flick * 0.45);
    col += vec3(0.6, 0.75, 1.0) * pow(1.0 - max(dot(n, v), 0.0), 3.0) * 0.35;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const STAMP_VERTEX = `
  precision highp float;
  attribute vec3 position;
  attribute vec3 color;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  varying vec3 vColor;
  varying vec2 vUv;
  void main() {
    vColor = color;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const STAMP_FRAGMENT = `
  precision mediump float;
  uniform sampler2D map;
  uniform float useMap;
  varying vec3 vColor;
  varying vec2 vUv;
  void main() {
    vec3 c = useMap > 0.5 ? texture2D(map, vUv).rgb : vColor;
    gl_FragColor = vec4(c, 1.0);
  }
`;

function stampBack(bump) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const g = canvas.getContext("2d");
  const s = 128;
  const c = s / 2;
  if (bump) {
    g.fillStyle = "#808080";
  } else {
    const base = g.createRadialGradient(c * 0.7, c * 0.6, 4, c, c, c);
    base.addColorStop(0, "#fff2c2");
    base.addColorStop(1, "#e8b04e");
    g.fillStyle = base;
  }
  g.fillRect(0, 0, s, s);
  g.strokeStyle = bump ? "rgb(40,0,0)" : "rgba(120,70,10,0.85)";
  g.lineWidth = s * 0.03;
  g.beginPath();
  g.arc(c, c, c - s * 0.05, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = bump ? "rgb(230,0,0)" : "rgba(255,236,170,0.8)";
  g.lineWidth = s * 0.012;
  g.beginPath();
  g.arc(c, c, c - s * 0.085, 0, Math.PI * 2);
  g.stroke();
  const t = new CanvasTexture(canvas);
  if (!bump) t.colorSpace = SRGBColorSpace;
  return t;
}

const idle = () =>
  new Promise((done) => {
    if (window.requestIdleCallback) requestIdleCallback(done, { timeout: 500 });
    else setTimeout(done, 50);
  });

async function bakeStamp(peach, renderer, targets) {
  await idle();
  const crease = peach.uniforms.uCrease.value;
  const side = new Vector3(crease.x, crease.y, crease.z).normalize();
  const up = new Vector3(0, 1, 0).addScaledVector(side, -side.y).normalize();
  const view = new Vector3().crossVectors(side, up);
  if (view.clone().transformDirection(peach.mesh.matrixWorld).z < 0) {
    view.negate();
    side.negate();
  }
  const geo = peach.mesh.geometry;
  if (!geo.boundingBox) geo.computeBoundingBox();
  const box = geo.boundingBox;
  const toStamp = new Matrix4().makeBasis(side, up, view).transpose();
  const lo = new Vector2(Infinity, Infinity);
  const hi = new Vector2(-Infinity, -Infinity);
  const p = new Vector3();
  const corner = new Vector2();
  for (let n = 0; n < 8; n += 1) {
    p.set(
      n % 2 ? box.max.x : box.min.x,
      Math.floor(n / 2) % 2 ? box.max.y : box.min.y,
      n >= 4 ? box.max.z : box.min.z,
    ).applyMatrix4(toStamp);
    lo.min(corner.set(p.x, p.y));
    hi.max(corner.set(p.x, p.y));
  }
  const k = 1.3 / Math.max(hi.x - lo.x, hi.y - lo.y);
  const mid = lo.add(hi).multiplyScalar(0.5);

  const normals = geo.attributes.normal.array;
  const spots = geo.attributes.position.array;
  const cn = Math.hypot(crease.x, crease.y, crease.z);
  const groove = 0.03 / k;
  const plant = geo.attributes.plant?.array;
  const count = normals.length / 3;
  const shade = new Float32Array(count * 3);
  const relief = new Float32Array(count * 3);
  const e = toStamp.elements;
  for (let n = 0; n < count; n += 1) {
    const x = normals[n * 3];
    const y = normals[n * 3 + 1];
    const z = normals[n * 3 + 2];
    const nx = e[0] * x + e[4] * y + e[8] * z;
    const ny = e[1] * x + e[5] * y + e[9] * z;
    const nz = e[2] * x + e[6] * y + e[10] * z;
    const gap =
      Math.abs(
        (spots[n * 3] * crease.x +
          spots[n * 3 + 1] * crease.y +
          spots[n * 3 + 2] * crease.z) /
          cn -
          crease.w / cn,
      ) / groove;
    const fold = 0.45 + 0.55 * Math.min(1, gap * gap);
    const lit = Math.max(0, nx * -0.45 + ny * 0.55 + nz * 0.7) * fold;
    shade[n * 3] = ((150 + 105 * lit) / 255) ** 2.2;
    shade[n * 3 + 1] = ((90 + 120 * lit) / 255) ** 2.2;
    shade[n * 3 + 2] = ((20 + 90 * lit * lit) / 255) ** 2.2;
    relief[n * 3] = Math.min(
      1,
      Math.max(
        0,
        0.5 +
          (nz - 0.6) * 0.9 +
          (nx * -0.4 + ny * 0.4) * 0.5 -
          (1 - fold) * 0.6,
      ),
    );
  }
  const src = geo.index.array;
  const kept = new Uint32Array(src.length);
  let m = 0;
  for (let f = 0; f < src.length; f += 3) {
    if (
      !plant ||
      plant[src[f]] + plant[src[f + 1]] + plant[src[f + 2]] <= 0.5
    ) {
      kept[m] = src[f];
      kept[m + 1] = src[f + 1];
      kept[m + 2] = src[f + 2];
      m += 3;
    }
  }
  const flat = new BufferGeometry();
  flat.setAttribute("position", geo.attributes.position);
  flat.setIndex(new BufferAttribute(kept.subarray(0, m), 1));
  const shadeAttr = new BufferAttribute(shade, 3);
  const reliefAttr = new BufferAttribute(relief, 3);

  const backs = [stampBack(false), stampBack(true)];
  const plane = new PlaneGeometry(2, 2);
  plane.setAttribute(
    "color",
    new BufferAttribute(new Float32Array(12).fill(1), 3),
  );
  const map = { value: backs[0] };
  const paint = (useMap, depthWrite) =>
    new RawShaderMaterial({
      uniforms: { map, useMap: { value: useMap } },
      vertexShader: STAMP_VERTEX,
      fragmentShader: STAMP_FRAGMENT,
      depthWrite,
    });
  const back = new Mesh(plane, paint(1, false));
  back.position.z = -5;
  flat.setAttribute("uv", geo.attributes.uv);
  const body = new Mesh(flat, paint(0, true));
  body.matrix
    .makeScale(k, k, k)
    .multiply(
      new Matrix4().makeTranslation(-mid.x, -mid.y, 0).multiply(toStamp),
    );
  body.matrix.decompose(body.position, body.quaternion, body.scale);
  body.renderOrder = 1;
  const scene = new Scene();
  scene.add(back, body);
  const cam = new OrthographicCamera(-1, 1, 1, -1, 0.01, 20);
  cam.position.z = 10;
  flat.setAttribute("color", shadeAttr);
  for (let n = 0; n < 2; n += 1) {
    // eslint-disable-next-line no-await-in-loop
    await idle();
    map.value = backs[n];
    flat.setAttribute("color", n ? reliefAttr : shadeAttr);
    const before = renderer.getRenderTarget();
    renderer.setRenderTarget(targets[n]);
    renderer.clear();
    renderer.render(scene, cam);
    renderer.setRenderTarget(before);
  }
  backs.forEach((t) => t.dispose());
  back.geometry.dispose();
  back.material.dispose();
  body.material.dispose();
  flat.deleteAttribute("position");
  flat.deleteAttribute("uv");
  flat.dispose();
}

let stampCache = null;
function coinStamp(peach, renderer) {
  if (stampCache) return stampCache;
  const targets = [0, 1].map(
    () =>
      new WebGLRenderTarget(256, 256, {
        depthBuffer: true,
        generateMipmaps: false,
        samples: 4,
      }),
  );
  stampCache = { map: targets[0].texture, bump: targets[1].texture };
  bakeStamp(peach, renderer, targets);
  return stampCache;
}

function sounds(ctx) {
  const ping = (hz, length, volume, delay = 0) => {
    const ac = ctx.audio();
    const t = ac.currentTime + delay;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.frequency.value = hz;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(volume, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + length);
    o.connect(g).connect(ctx.audioOut());
    o.start(t);
    o.stop(t + length + 0.02);
  };
  const tick = (volume, hz) => {
    const ac = ctx.audio();
    const t = ac.currentTime;
    const s = ac.createBufferSource();
    s.buffer = ctx.noiseBuffer();
    const f = ac.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = hz;
    const g = ac.createGain();
    g.gain.setValueAtTime(volume, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);
    s.connect(f).connect(g).connect(ctx.audioOut());
    s.start(t, Math.random(), 0.02);
  };
  return {
    tink() {
      ping(4400 + Math.random() * 1200, 0.12, 0.008);
    },
    tink2(pitch = 1, volume = 1) {
      tick(0.04 * volume, 7000);
      ping(4186 * pitch, 0.22, 0.026 * volume);
      ping(6272 * pitch * 1.006, 0.12, 0.012 * volume, 0.001);
      ping(8372 * pitch, 0.05, 0.006 * volume, 0.002);
    },
  };
}

function build(ctx) {
  const { peach, camera, interaction: i } = ctx;
  const audio = sounds(ctx);
  const ride = rider(ctx);
  ride.follow();

  const material = new ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: GEM_VERTEX,
    fragmentShader: GEM_FRAGMENT,
  });
  const geometry = gemGeometry();
  const air = new InstancedMesh(geometry, material, MAX);
  const skin = new InstancedMesh(geometry, material, MAX);
  air.frustumCulled = false;
  skin.frustumCulled = false;
  ctx.group.add(air);
  ride.add(skin);

  const stamp = coinStamp(peach, ctx.renderer);
  const gold = {
    metalness: 0.6,
    roughness: 0.22,
    envMapIntensity: 1.8,
    emissive: 0xffffff,
    emissiveIntensity: 0.32,
  };
  const face = new MeshPhysicalMaterial({
    ...gold,
    color: 0xffffff,
    map: stamp.map,
    bumpMap: stamp.bump,
    bumpScale: 2,
    emissiveMap: stamp.map,
  });
  const edge = new MeshPhysicalMaterial({
    ...gold,
    color: 0xf0b850,
    emissive: 0x9a6a10,
    emissiveIntensity: 0.6,
  });
  const coin = new Mesh(new CylinderGeometry(COIN_R, COIN_R, COIN_TH, 40), [
    edge,
    face,
    face,
  ]);
  coin.visible = false;
  ctx.group.add(coin);

  const twinkleMap = twinkleTexture();
  const bloomMap = softTexture("rgba(255,244,210,0.95)", "rgba(255,200,120,0)");
  ctx.onDispose(() => {
    twinkleMap.dispose();
    bloomMap.dispose();
  });
  const sprite = (map) => {
    const s = new Sprite(
      new SpriteMaterial({
        map,
        blending: AdditiveBlending,
        depthWrite: false,
        transparent: true,
        opacity: 0,
      }),
    );
    s.visible = false;
    ctx.group.add(s);
    return s;
  };
  const sparks = Array.from({ length: SPARKS }, () => ({
    s: sprite(twinkleMap),
    age: 9,
    life: 0.6,
    size: 0.3,
    vel: new Vector3(),
    fall: 0,
  }));
  const glint = { s: sprite(bloomMap), age: 9, size: 1 };
  const glintStar = sprite(twinkleMap);

  const gems = Array.from({ length: MAX }, (_, n) => ({
    state: "wait",
    wait: n * 0.12 + Math.random() * 0.8,
    pos: new Vector3(),
    vel: new Vector3(),
    quat: new Quaternion(),
    spin: new Vector3(),
    spot: { local: new Vector3(), normal: new Vector3(), give: 1 },
    target: false,
    first: true,
    age: 0,
    life: 0,
    scale: 1,
    twist: 0,
  }));

  const m = new Matrix4();
  const q = new Quaternion();
  const q2 = new Quaternion();
  const v = new Vector3();
  const s = new Vector3();
  const world = new Vector3();
  const nWorld = new Vector3();
  const pose = new Vector3();
  const poseN = new Vector3();
  const stuck = [];
  const flying = [];

  const halfAt = (z) =>
    Math.tan((camera.fov * Math.PI) / 360) * (camera.position.z - z);
  const below = (p) => p.y < camera.position.y - halfAt(p.z) - 0.6;
  const onPeach = () => i.phase === "live" || i.phase === "charging";
  let liveFor = 0;
  const settled = () => ctx.live && liveFor > SETTLE;
  const spotWorld = (spot, target, normal) => {
    skinPose(peach, spot, target, normal);
    if (normal) normal.transformDirection(peach.mesh.matrixWorld);
    return target.applyMatrix4(peach.mesh.matrixWorld);
  };

  const frontHit = (up = 0.05) => {
    for (let tries = 0; tries < 12; tries += 1) {
      const h = ctx.randomHit();
      if (h) {
        nWorld.copy(h.face.normal).transformDirection(peach.mesh.matrixWorld);
        if (nWorld.z > 0.3 && nWorld.y > up) return h;
      }
    }
    return null;
  };

  const spark = (point, size, tint = 0xffffff, burst = 0) => {
    const t = sparks.reduce((a, b) =>
      b.age / b.life > a.age / a.life ? b : a,
    );
    t.s.position.copy(point);
    t.s.material.color.set(tint);
    t.age = 0;
    t.life = burst ? 0.45 + Math.random() * 0.35 : 0.6;
    t.size = size;
    t.fall = burst ? 1 : 0;
    t.vel.set(0, 0, 0);
    if (burst)
      t.vel
        .set(Math.random() - 0.5, Math.random() * 0.8, Math.random() * 0.5)
        .normalize()
        .multiplyScalar(burst * (0.6 + Math.random()));
    t.s.material.rotation = Math.random();
    t.s.visible = true;
  };

  const flash = (point, size = 1) => {
    glint.age = 0;
    glint.size = size;
    glint.s.position.copy(point);
    glint.s.visible = true;
    glintStar.position.copy(point);
    glintStar.visible = true;
    glintStar.material.rotation = Math.random();
  };

  const spawn = (g) => {
    const c = ctx.center();
    const h = Math.random() < 0.4 ? frontHit() : null;
    /* eslint-disable no-param-reassign */
    g.target = !!h;
    if (h) {
      skinSpot(peach, h, g.spot);
      g.pos.set(h.point.x + (Math.random() - 0.5) * 0.6, 0, h.point.z + 0.25);
    } else {
      const z =
        c.z +
        (Math.random() < 0.5
          ? -1.2 - Math.random()
          : 0.9 + Math.random() * 0.8);
      g.pos.set(
        c.x + (Math.random() * 2 - 1) * halfAt(z) * camera.aspect * 0.95,
        0,
        z,
      );
    }
    const top = camera.position.y + halfAt(g.pos.z);
    g.pos.y = g.first
      ? c.y + ctx.bounds.y + Math.random() * (top - c.y - ctx.bounds.y)
      : top + 0.3 + Math.random() * 0.4;
    g.first = false;
    g.vel.set(0, -0.55 - Math.random() * 0.2, 0);
    g.quat.setFromAxisAngle(
      v.set(Math.random(), Math.random(), Math.random()).normalize(),
      Math.random() * 6,
    );
    g.spin
      .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      .multiplyScalar(1.8);
    g.scale = 0.7 + Math.random() * 0.6;
    g.tint = TINTS[Math.floor(Math.random() * TINTS.length)];
    g.age = 0;
    g.state = "air";
    /* eslint-enable no-param-reassign */
  };

  const fling = (g) => {
    /* eslint-disable no-param-reassign */
    const c = ctx.center();
    spotWorld(g.spot, g.pos, nWorld);
    v.copy(g.pos).sub(c).normalize();
    g.vel
      .copy(nWorld)
      .multiplyScalar(2 + Math.random() * 2.5)
      .addScaledVector(v, 1.5 + Math.random() * 1.5)
      .add(
        s.set(
          (Math.random() - 0.5) * 1.2,
          1.5 + Math.random() * 1.5,
          0.6 + Math.random(),
        ),
      );
    q.setFromUnitVectors(Y, nWorld);
    g.quat.copy(q);
    g.spin
      .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
      .multiplyScalar(18);
    g.state = "scatter";
    g.age = 0;
    g.target = false;
    /* eslint-enable no-param-reassign */
  };

  const tok = {
    state: "wait",
    wait: 2.5,
    age: 0,
    bounces: 0,
    vel: new Vector3(),
    spin: new Vector3(),
    quat: new Quaternion(),
  };
  const prev = new Vector3();
  const step = new Vector3();
  const ray = new Vector3();
  const axis = new Vector3();
  const reach = new Vector3();
  const contactSpot = { local: new Vector3(), normal: new Vector3(), give: 1 };
  const hitAt = { point: new Vector3(), face: { normal: new Vector3() } };
  const ring = new Mesh(new PlaneGeometry(1, 1), ringMaterial(0xffe2a8));
  ring.visible = false;
  ring.renderOrder = 7;
  ctx.group.add(ring);
  let ringAge = 9;
  let twinkleTimer = 0;

  const castPeach = (origin, dir, far) => {
    i.raycaster.set(origin, dir);
    i.raycaster.far = far;
    const h = i.raycaster.intersectObject(peach.mesh, false)[0] || null;
    i.raycaster.far = Infinity;
    return h;
  };

  const support = (n) => {
    axis.copy(Y).applyQuaternion(coin.quaternion);
    const along = axis.dot(n);
    reach.copy(n).addScaledVector(axis, -along);
    const flat = reach.length();
    reach
      .multiplyScalar(flat > 1e-4 ? -COIN_R / flat : 0)
      .addScaledVector(axis, along > 0 ? -COIN_TH / 2 : COIN_TH / 2);
    return COIN_R * flat + (COIN_TH / 2) * Math.abs(along);
  };

  const ndc = new Vector3();
  const atTop = (ndcX, z, target) => {
    ndc.set(ndcX, 1, 0.5).unproject(camera).sub(camera.position);
    return target
      .copy(camera.position)
      .addScaledVector(ndc, (z - camera.position.z) / ndc.z);
  };
  const offScreen = (p) => {
    ndc.copy(p).project(camera);
    return Math.abs(ndc.x) > 1.1 || ndc.y < -1.1;
  };

  const drop = () => {
    const c = ctx.center();
    let h = null;
    let best = 0.9;
    const side = Math.random() < 0.75 ? 1 : -1;
    for (let tries = 0; tries < 14; tries += 1) {
      const x = c.x + side * (0.5 + Math.random() * 0.45);
      const found = castPeach(
        prev.set(x, c.y + 5, c.z + Math.random() * 0.6),
        ray.set(0, -1, 0),
        20,
      );
      if (found)
        nWorld
          .copy(found.face.normal)
          .transformDirection(peach.mesh.matrixWorld);
      if (found && nWorld.y > best && nWorld.z > 0) {
        best = nWorld.y;
        h = found;
      }
    }
    if (!h) return;
    ndc.copy(h.point).project(camera);
    atTop(ndc.x, h.point.z, coin.position);
    coin.position.x = h.point.x;
    coin.position.y += COIN_R * 2 + 0.25;
    tok.quat
      .setFromAxisAngle(X, 0.3 + Math.random() * 0.4)
      .premultiply(q.setFromAxisAngle(Y, Math.random() * 6));
    coin.quaternion.copy(tok.quat);
    tok.vel.set(0, 0, 0);
    tok.spin.set(3 + Math.random() * 3, 0, (Math.random() - 0.5) * 2);
    tok.state = "fly";
    tok.age = 0;
    tok.bounces = 0;
    coin.visible = true;
  };

  const sim = new Vector3();
  const simVel = new Vector3();
  const clearPath = (start, vel) => {
    sim.copy(start);
    simVel.copy(vel);
    for (let n = 0; n < 240; n += 1) {
      prev.copy(sim);
      simVel.y += GRAVITY / 60;
      sim.addScaledVector(simVel, 1 / 60);
      if (n > 2) {
        step.subVectors(sim, prev);
        const len = step.length();
        if (
          castPeach(prev, ray.copy(step).divideScalar(len), len + COIN_R * 1.2)
        )
          return false;
        ray.copy(ctx.center()).sub(sim);
        if (castPeach(sim, ray.normalize(), COIN_R * 1.2)) return false;
      }
      if (offScreen(sim)) return true;
    }
    return true;
  };

  const impact = (p, surface) => {
    const speed = -tok.vel.dot(surface);
    const c = ctx.center();
    const out = Math.sign(p.x - c.x) || 1;
    const room = atTop(0, p.z, v).y - 0.55 - COIN_R - p.y;
    const rise = Math.min(
      RESTITUTION * speed,
      Math.sqrt(-2 * GRAVITY * Math.min(RISE, Math.max(0.6, room))),
    );
    const lift = Math.max(
      rise,
      Math.sqrt(-2 * GRAVITY * Math.min(0.9, Math.max(0.3, room))),
    );
    tok.vel.set(out * (1.5 + Math.random() * 0.5), lift, 0.35);
    for (
      let n = 0;
      n < 8 && !clearPath(p.clone().addScaledVector(surface, COIN_R), tok.vel);
      n += 1
    )
      tok.vel.x += out * 0.45;
    tok.spin.set(
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 4,
      -out * (12 + Math.random() * 5),
    );
    tok.bounces += 1;
    tok.log?.push(+speed.toFixed(2));
    const k = clamp01(speed / 7);
    hitAt.point.copy(p);
    if (ctx.live)
      ctx.touch(hitAt, {
        jiggle: 0.05,
        radius: 0.45,
        lift: 0.25,
        value: ctx.rate() * 3,
      });
    audio.tink2(1.04, 0.5 + 0.5 * k);
    ring.position.copy(p).addScaledVector(surface, 0.01);
    ring.quaternion.setFromUnitVectors(Z, surface);
    ringAge = 0;
    ring.userData.size = 0.5 + 0.6 * k;
    flash(p, 0.45 + 0.4 * k);
    for (let n = 0; n < 3 + Math.round(3 * k); n += 1)
      spark(p, 0.15 + Math.random() * 0.15, 0xffe0a0, 1 + 1.6 * k);
  };

  const knock = (power = 1) => {
    if (tok.state !== "fly") return;
    tok.vel.add(v.set((Math.random() - 0.5) * 2 * power, 1.5 * power, 0.6));
    tok.spin.add(
      v
        .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
        .multiplyScalar(20 * power),
    );
    tok.bounces = Math.max(tok.bounces, MAX_BOUNCES);
  };

  const scatter = () => {
    gems.forEach((g) => g.state === "skin" && fling(g));
    knock(1.4);
  };
  ctx.on("burst", scatter);
  ctx.on("smack", () => knock(1));

  const collide = () => {
    if (tok.bounces >= MAX_BOUNCES || !onPeach()) return;
    const c = ctx.center();
    step.subVectors(coin.position, prev);
    const len = step.length();
    let h =
      len > 1e-5
        ? castPeach(prev, ray.copy(step).divideScalar(len), len + COIN_R + 0.05)
        : null;
    if (!h)
      h = castPeach(
        coin.position,
        ray.copy(c).sub(coin.position).normalize(),
        COIN_R + 0.2,
      );
    if (!h) return;
    skinSpot(peach, h, contactSpot);
    spotWorld(contactSpot, hitAt.point, nWorld);
    const gap =
      step.copy(coin.position).sub(hitAt.point).dot(nWorld) - support(nWorld);
    if (gap > 0.002) return;
    coin.position.addScaledVector(nWorld, -gap);
    tok.clearance = Math.min(
      tok.clearance ?? 9,
      step.copy(coin.position).sub(hitAt.point).dot(nWorld) - support(nWorld),
    );
    if (tok.vel.dot(nWorld) < 0) impact(hitAt.point, nWorld);
  };

  const updateCoin = (dt) => {
    if (tok.state === "wait") {
      tok.wait -= dt;
      if (tok.wait <= 0 && settled()) {
        drop();
        if (tok.state === "wait") tok.wait = 1;
      }
      return;
    }
    tok.age += dt;
    prev.copy(coin.position);
    tok.vel.y += GRAVITY * dt;
    coin.position.addScaledVector(tok.vel, dt);
    v.copy(tok.spin).multiplyScalar(dt);
    const a = v.length();
    if (a > 0) tok.quat.premultiply(q.setFromAxisAngle(v.divideScalar(a), a));
    coin.quaternion.copy(tok.quat);
    collide();
    if (
      (tok.bounces > 0 && offScreen(coin.position)) ||
      below(coin.position) ||
      tok.age > 8
    ) {
      coin.visible = false;
      tok.state = "wait";
      tok.wait = (4 * (0.8 + Math.random() * 0.4)) / (1 + ctx.level() * 1.2);
    }
  };

  const updateRing = (dt) => {
    ringAge += dt;
    const t = ringAge / 0.35;
    showRing(ring, Math.min(1, t), 0.1, ring.userData.size || 0.6, 0.8);
  };

  const gprev = new Vector3();
  const land = (g) => {
    /* eslint-disable no-param-reassign */
    g.state = "skin";
    g.target = false;
    g.age = 0;
    g.life = 6 + Math.random() * 5;
    g.twist = Math.random() * Math.PI * 2;
    spark(spotWorld(g.spot, world), 0.4, g.tint);
    if (Math.random() < 0.5) audio.tink();
    /* eslint-enable no-param-reassign */
  };

  let due = false;
  const placeSkin = () => {
    if (!due) return;
    due = false;
    ride.follow();
    const ps = peach.worldScale();
    stuck.forEach((g, k) => {
      skinPose(peach, g.spot, pose, poseN);
      q.setFromUnitVectors(Y, poseN);
      q2.setFromAxisAngle(Y, g.twist);
      q.multiply(q2);
      const sz = g.size / ps;
      pose.addScaledVector(poseN, sz * LIFT + 0.003 / ps);
      m.compose(pose, q, s.set(sz, sz * 0.6, sz));
      skin.setMatrixAt(k, m);
    });
    skin.count = stuck.length;
    skin.instanceMatrix.needsUpdate = true;
  };
  ctx.onDispose(beforeDraw(ctx.scene, placeSkin));

  const update = (dt) => {
    peach.mesh.updateWorldMatrix(true, false);
    ride.follow();
    const lvl = ctx.level();
    material.uniforms.uTime.value = ctx.time;
    const active = Math.round(12 + (MAX - 12) * lvl);
    const holding = onPeach();
    liveFor = ctx.live ? liveFor + dt : 0;
    const ready = settled();
    const c = ctx.center();
    let a = 0;
    stuck.length = 0;
    flying.length = 0;
    gems.forEach((g, n) => {
      /* eslint-disable no-param-reassign */
      if (g.state === "wait") {
        g.wait -= dt;
        if (g.wait <= 0 && n < active && ready) spawn(g);
        return;
      }
      g.age += dt;
      if (g.state === "skin" && !holding) fling(g);
      if (g.state === "air" || g.state === "scatter") {
        if (g.state === "scatter") g.vel.y += GRAVITY * dt;
        gprev.copy(g.pos);
        g.pos.addScaledVector(g.vel, dt * (g.state === "air" ? ctx.still : 1));
        v.copy(g.spin).multiplyScalar(dt * ctx.still);
        q.setFromAxisAngle(s.copy(v).normalize(), v.length());
        g.quat.multiply(q);
        if (g.target && g.state === "air") {
          if (!ready) g.target = false;
          else {
            spotWorld(g.spot, world);
            const gap = g.pos.y - world.y;
            const pull = clamp01(1 - gap / 1.6);
            g.pos.x += (world.x - g.pos.x) * Math.min(1, pull * pull * dt * 6);
            g.pos.z += (world.z + 0.02 - g.pos.z) * Math.min(1, pull * dt * 5);
            if (gap <= SIZE * g.scale * LIFT) land(g);
          }
        }
        if (g.state === "air" && g.pos.distanceTo(c) < 2.8) {
          step.subVectors(g.pos, gprev);
          const len = step.length();
          const h =
            len > 1e-5
              ? castPeach(
                  gprev,
                  ray.copy(step).divideScalar(len),
                  len + SIZE * g.scale * 0.75,
                )
              : null;
          if (h && ready) {
            skinSpot(peach, h, g.spot);
            land(g);
          } else if (h) {
            nWorld
              .copy(h.face.normal)
              .transformDirection(peach.mesh.matrixWorld);
            g.pos.copy(gprev);
            g.vel
              .reflect(nWorld)
              .multiplyScalar(0.5)
              .addScaledVector(nWorld, 1);
            g.state = "scatter";
            g.target = false;
          }
        }
        if (below(g.pos)) {
          g.state = "wait";
          g.wait = Math.random() * 1.5;
          return;
        }
        if (g.state !== "skin") {
          const grow = g.state === "air" ? smooth(clamp01(g.age / 0.5)) : 1;
          m.compose(g.pos, g.quat, s.setScalar(SIZE * g.scale * grow));
          air.setMatrixAt(a, m);
          flying.push(g);
          a += 1;
          return;
        }
      }
      const settle = clamp01(g.age / 0.3);
      const pop = 1 + 0.3 * Math.sin(settle * Math.PI) * (1 - settle);
      const fade = 1 - smooth(clamp01((g.age - g.life) / 0.8));
      if (fade <= 0) {
        spark(spotWorld(g.spot, world), 0.3, g.tint);
        g.state = "wait";
        g.wait = 0.5 + Math.random() * 2;
        return;
      }
      g.size = SIZE * g.scale * fade * pop;
      stuck.push(g);
      /* eslint-enable no-param-reassign */
    });
    air.count = a;
    air.instanceMatrix.needsUpdate = true;
    due = true;

    twinkleTimer -= dt;
    if (twinkleTimer <= 0) {
      twinkleTimer = 0.2 + Math.random() * 0.3;
      if (stuck.length && Math.random() < 0.6) {
        const g = stuck[Math.floor(Math.random() * stuck.length)];
        spark(spotWorld(g.spot, world), 0.3 + Math.random() * 0.25, g.tint);
      } else if (flying.length) {
        const g = flying[Math.floor(Math.random() * flying.length)];
        spark(
          g.pos,
          g.state === "scatter" ? 0.45 : 0.3 + Math.random() * 0.3,
          g.tint,
        );
      }
    }
    sparks.forEach((t) => {
      /* eslint-disable no-param-reassign */
      t.age += dt;
      const f = t.age / t.life;
      const glow = t.age < 0.07 ? t.age / 0.07 : Math.max(0, 1 - f) ** 1.5;
      if (t.fall) {
        t.vel.y += GRAVITY * 0.35 * dt;
        t.vel.multiplyScalar(Math.exp(-dt * 1.5));
        t.s.position.addScaledVector(t.vel, dt);
      }
      t.s.material.opacity = glow;
      t.s.scale.setScalar(t.size * (0.35 + glow));
      t.s.material.rotation += dt * 0.8;
      t.s.visible = f < 1;
      /* eslint-enable no-param-reassign */
    });
    glint.age += dt;
    const shine =
      glint.age < 0.04 ? glint.age / 0.04 : Math.exp(-(glint.age - 0.04) * 9);
    glint.s.material.opacity = shine * 0.9;
    glint.s.scale.set(
      1.1 * glint.size * (0.5 + shine),
      0.5 * glint.size * (0.5 + shine),
      1,
    );
    glintStar.material.opacity = shine;
    glintStar.scale.setScalar(0.8 * glint.size * (0.4 + shine));
    glint.s.visible = glint.age < 0.6;
    glintStar.visible = glint.s.visible;

    updateCoin(dt);
    updateRing(dt);
  };

  const unseen = [];
  ctx.group.traverse((o) => {
    if (!o.visible || (o.isInstancedMesh && o.count === 0)) unseen.push(o);
  });
  ctx.warm(unseen);
  return update;
}

export default {
  id: "sugar",
  create(ctx) {
    let step = null;
    return {
      update(dt) {
        if (!step && ctx.peach.mesh && ctx.peach.material) step = build(ctx);
        step?.(dt);
      },
      dispose() {},
    };
  },
};
