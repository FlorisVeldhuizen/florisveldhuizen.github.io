import {
  BufferGeometry,
  CanvasTexture,
  ConeGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  IcosahedronGeometry,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  QuadraticBezierCurve3,
  Quaternion,
  Scene,
  ShapeGeometry,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
  WebGLRenderTarget,
} from "three";
import { RIPE, ROTTEN } from "./data/orchard";

const PLANT_SIZE = 320;
const ICON_SIZE = 96;
const PER_FRAME = 2;
const UP = new Vector3(0, 1, 0);
const FORWARD = new Vector3(0, 0, 1);

function random(key) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function taperedTube(curve, r1, r2, segments = 10, radial = 7) {
  const frames = curve.computeFrenetFrames(segments, false);
  const positions = [];
  const index = [];
  const point = new Vector3();
  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    curve.getPointAt(t, point);
    const r = r1 + (r2 - r1) * t;
    for (let j = 0; j <= radial; j += 1) {
      const a = (j / radial) * Math.PI * 2;
      const n = frames.normals[i]
        .clone()
        .multiplyScalar(Math.cos(a))
        .add(frames.binormals[i].clone().multiplyScalar(Math.sin(a)));
      positions.push(point.x + n.x * r, point.y + n.y * r, point.z + n.z * r);
    }
  }
  for (let i = 0; i < segments; i += 1)
    for (let j = 0; j < radial; j += 1) {
      const a = i * (radial + 1) + j;
      const b = a + radial + 1;
      index.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

function leafGeometry(width) {
  const s = new Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(width, 0.4, 0, 1);
  s.quadraticCurveTo(-width, 0.4, 0, 0);
  const g = new ShapeGeometry(s, 6);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i += 1)
    p.setZ(i, Math.abs(p.getX(i)) * 0.6 - p.getY(i) * p.getY(i) * 0.15);
  g.computeVertexNormals();
  return g;
}

function smoothMin(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

function canopyRadius(centre, lobes, reach) {
  const k = reach * 0.06;
  const point = new Vector3();
  const field = (p) =>
    lobes.reduce((d, l) => {
      const dx = (p.x - l.at.x) / l.wide;
      const dy = p.y - l.at.y;
      const dz = (p.z - l.at.z) / 0.9;
      return smoothMin(d, Math.hypot(dx, dy, dz) - l.r, k);
    }, Infinity);
  return (dir) => {
    let lo = 0;
    let hi = reach * 2.2;
    for (let n = 0; n < 22; n += 1) {
      const mid = (lo + hi) / 2;
      point.copy(centre).addScaledVector(dir, mid);
      if (field(point) < 0) lo = mid;
      else hi = mid;
    }
    return lo;
  };
}

function canopyGeometry(lobes, rand, centre, reach) {
  const positions = [];
  const colors = [];
  const low = centre.y - reach;
  const high = centre.y + reach * 1.2;
  lobes.forEach((l) => {
    const g = new IcosahedronGeometry(1, 1);
    const p = g.attributes.position;
    const jitter = new Map();
    const v = new Vector3();
    for (let i = 0; i < p.count; i += 1) {
      v.set(p.getX(i), p.getY(i), p.getZ(i));
      const key = `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
      if (!jitter.has(key)) jitter.set(key, 0.9 + rand() * 0.18);
      v.multiplyScalar(jitter.get(key) * l.r);
      positions.push(
        l.at.x + v.x * l.wide,
        l.at.y + v.y * 0.92,
        l.at.z + v.z * 0.9,
      );
    }
    g.dispose();
  });
  for (let f = 0; f < positions.length / 9; f += 1) {
    const y =
      (positions[f * 9 + 1] + positions[f * 9 + 4] + positions[f * 9 + 7]) / 3;
    const lift = Math.min(1, Math.max(0, (y - low) / (high - low)));
    const shade = (0.5 + 0.5 * lift) * (0.9 + rand() * 0.18);
    for (let k = 0; k < 3; k += 1) colors.push(shade, shade, shade);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(positions, 3));
  g.setAttribute("color", new Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

function lowPoly(detail, rand, amount) {
  const g = new IcosahedronGeometry(1, detail);
  const p = g.attributes.position;
  const jitter = new Map();
  for (let i = 0; i < p.count; i += 1) {
    const key = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
    if (!jitter.has(key)) jitter.set(key, 1 - amount + rand() * amount * 2);
    const k = jitter.get(key);
    p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k);
  }
  const colors = [];
  for (let f = 0; f < p.count / 3; f += 1) {
    const v = 0.85 + rand() * 0.25;
    colors.push(v, v, v, v, v, v, v, v, v);
  }
  g.setAttribute("color", new Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

function shadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(0,0,0,0.75)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new CanvasTexture(canvas);
}

export class Renders {
  constructor() {
    this.cache = new Map();
    this.queue = [];
    this.waiting = new Map();
    this.materials = new Map();
  }

  setup(renderer, environment) {
    this.renderer = renderer;
    this.scene = new Scene();
    this.scene.environment = environment;
    this.scene.add(new HemisphereLight(0xffe4ea, 0x7a3060, 1.1));
    const key = new DirectionalLight(0xffd6b8, 2.4);
    key.position.set(-2.5, 4, 4);
    this.scene.add(key);
    const rim = new DirectionalLight(0xff4f9a, 1.8);
    rim.position.set(3, 1.2, -2.5);
    this.scene.add(rim);
    this.plantCamera = new PerspectiveCamera(27, 1, 0.1, 30);
    this.plantCamera.position.set(0, 1.25, 6.4);
    this.plantCamera.lookAt(0, 0.92, 0);
    this.iconCamera = new PerspectiveCamera(24, 1, 0.1, 20);
    this.iconCamera.position.set(0, 0, 5);
    this.iconCamera.lookAt(0, 0, 0);
    this.shared = {
      leaf: leafGeometry(0.3),
      round: leafGeometry(0.5),
      sphere: new SphereGeometry(1, 32, 24),
      shadow: new MeshBasicMaterial({
        map: shadowTexture(),
        transparent: true,
        depthWrite: false,
      }),
      plane: new PlaneGeometry(1, 1),
      depthOnly: new MeshBasicMaterial({ colorWrite: false }),
      wood: new MeshPhysicalMaterial({
        color: 0x6b3a28,
        roughness: 0.85,
        flatShading: true,
      }),
      rot: new MeshPhysicalMaterial({
        color: 0x4a3420,
        roughness: 0.95,
        flatShading: true,
      }),
      soil: new MeshPhysicalMaterial({
        color: 0x5a3020,
        roughness: 1,
        flatShading: true,
        vertexColors: true,
      }),
      stone: new MeshPhysicalMaterial({
        color: 0x8a7a70,
        roughness: 0.9,
        flatShading: true,
        vertexColors: true,
      }),
      grass: new MeshPhysicalMaterial({
        color: 0x6a9a40,
        roughness: 0.8,
        flatShading: true,
      }),
      grassLight: new MeshPhysicalMaterial({
        color: 0x94bc58,
        roughness: 0.8,
        flatShading: true,
      }),
      lawn: new MeshPhysicalMaterial({
        color: 0x4a6a2c,
        roughness: 0.95,
        flatShading: true,
        vertexColors: true,
      }),
      blade: new ConeGeometry(0.016, 0.1, 3),
      bloom: new MeshPhysicalMaterial({
        color: 0xffc2d6,
        vertexColors: true,
        flatShading: true,
        roughness: 0.8,
        sheen: 0.4,
        sheenRoughness: 0.5,
        sheenColor: new Color(0xffffff),
      }),
      withered: new MeshPhysicalMaterial({
        color: 0x7a5a30,
        vertexColors: true,
        flatShading: true,
        roughness: 0.95,
      }),
      unripe: new MeshPhysicalMaterial({
        flatShading: true,
        color: 0x9cc25a,
        roughness: 0.5,
        sheen: 0.6,
        sheenColor: new Color(0xe6f2a8),
      }),
    };
    this.ready = true;
  }

  target(size) {
    if (this.targets?.[size]) return this.targets[size];
    this.targets = this.targets || {};
    const target = new WebGLRenderTarget(size, size, { samples: 4 });
    target.texture.colorSpace = SRGBColorSpace;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    this.targets[size] = {
      target,
      canvas,
      ctx: canvas.getContext("2d"),
      pixels: new Uint8Array(size * size * 4),
    };
    return this.targets[size];
  }

  snapshot(object, camera, size) {
    const r = this.renderer;
    const slot = this.target(size);
    const width = size;
    const height = size;
    const previous = r.getRenderTarget();
    const clear = r.getClearColor(new Color());
    const alpha = r.getClearAlpha();
    const shadows = r.shadowMap.enabled;
    r.shadowMap.enabled = false;
    r.setClearColor(0x000000, 0);
    this.scene.add(object);
    r.setRenderTarget(slot.target);
    r.clear();
    r.render(this.scene, camera);
    r.readRenderTargetPixels(slot.target, 0, 0, width, height, slot.pixels);
    this.scene.remove(object);
    r.setRenderTarget(previous);
    r.setClearColor(clear, alpha);
    r.shadowMap.enabled = shadows;
    const image = slot.ctx.createImageData(width, height);
    for (let y = 0; y < height; y += 1) {
      const row = (height - 1 - y) * width * 4;
      image.data.set(slot.pixels.subarray(row, row + width * 4), y * width * 4);
    }
    slot.ctx.putImageData(image, 0, 0);
    return slot.canvas.toDataURL();
  }

  request(key, build, done) {
    if (this.cache.has(key)) {
      done(this.cache.get(key));
      return;
    }
    if (this.waiting.has(key)) {
      this.waiting.get(key).push(done);
      return;
    }
    this.waiting.set(key, [done]);
    this.queue.push({ key, build });
  }

  update() {
    if (!this.ready) return;
    for (let n = 0; n < PER_FRAME && this.queue.length; n += 1) {
      const { key, build } = this.queue.shift();
      const url = build();
      this.cache.set(key, url);
      this.waiting.get(key).forEach((done) => done(url));
      this.waiting.delete(key);
    }
  }

  plant(stage, seed, variant, done) {
    const key = `plant:${seed.id}:${stage}:${variant}`;
    this.request(
      key,
      () => {
        const { base, top, pivot } = this.buildPlant(stage, seed, variant);
        const shot = (group) => {
          const url = this.snapshot(group, this.plantCamera, PLANT_SIZE);
          group.traverse((o) => {
            if (o.geometry && !Object.values(this.shared).includes(o.geometry))
              o.geometry.dispose();
          });
          return url;
        };
        const onScreen = (point) => {
          const at = point.clone().project(this.plantCamera);
          return `${((at.x + 1) * 50).toFixed(1)}% ${((1 - at.y) * 50).toFixed(1)}%`;
        };
        const root = onScreen(new Vector3());
        return {
          base: shot(base),
          top: top ? shot(top) : null,
          origin: pivot ? onScreen(pivot) : root,
          root,
        };
      },
      done,
    );
  }

  seedMaterials(seed) {
    if (this.materials.has(seed.id)) return this.materials.get(seed.id);
    const leaf = new Color(seed.leaf || "#5f9a45");
    const fruit = new Color(seed.color);
    const shape = seed.shape;
    const m = {
      leaf: new MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.55,
        sheen: 0.4,
        sheenColor: leaf.clone().lerp(new Color(0xfff2b8), 0.5),
        side: DoubleSide,
      }),
      leafColor: leaf,
      canopy: new MeshPhysicalMaterial({
        color: leaf,
        vertexColors: true,
        flatShading: true,
        roughness: 0.75,
        sheen: 0.3,
        sheenRoughness: 0.5,
        sheenColor: leaf.clone().lerp(new Color(0xfff2b8), 0.55),
      }),
      fruit: new MeshPhysicalMaterial({
        flatShading: true,
        color: fruit,
        roughness: shape === "shiny" ? 0.18 : 0.5,
        clearcoat: shape === "shiny" ? 1 : 0,
        sheen: shape === "shiny" ? 0 : 1,
        sheenRoughness: 0.5,
        sheenColor: new Color(0xffd6c8),
        vertexColors: true,
        emissive:
          shape === "glow" || shape === "cosmic" ? fruit : new Color(0x000000),
        emissiveIntensity: shape === "glow" ? 0.45 : 0.3,
        transparent: shape === "ghost",
        opacity: shape === "ghost" ? 0.62 : 1,
      }),
      ring: new MeshPhysicalMaterial({
        color: 0xffd98a,
        metalness: 0.6,
        roughness: 0.3,
      }),
    };
    this.materials.set(seed.id, m);
    return m;
  }

  peachGeometry(seed) {
    const g = new IcosahedronGeometry(1, 1);
    const p = g.attributes.position;
    const colors = [];
    const base = new Color(seed.color);
    const blush = base.clone().lerp(new Color(0xc81838), 0.75);
    const ghost = seed.shape === "ghost" || seed.shape === "cosmic";
    for (let i = 0; i < p.count; i += 1) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      const cleft = Math.exp(-((x - 0.05) ** 2) * 40) * Math.max(0, z) * 0.06;
      const lobe = 1 + 0.04 * Math.abs(x) - cleft;
      const tip = y > 0.85 ? (y - 0.85) * 0.5 : 0;
      p.setXYZ(
        i,
        x * lobe,
        y * (seed.shape === "donut" ? 0.62 : 1) + tip,
        z * lobe,
      );
      const sun = Math.max(0, -x * 0.6 + y * 0.5 + z * 0.4);
      const c = ghost ? base : base.clone().lerp(blush, Math.min(1, sun * 0.9));
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }

  bed(variant, done) {
    this.request(
      `bed:${variant}`,
      () => {
        const { group } = this.buildBed(random(`bed:${variant}`));
        const url = this.snapshot(group, this.plantCamera, PLANT_SIZE);
        group.traverse((o) => {
          if (o.geometry && !Object.values(this.shared).includes(o.geometry))
            o.geometry.dispose();
        });
        return url;
      },
      done,
    );
  }

  buildBed(rand) {
    const s = this.shared;
    const group = new Group();
    const lawn = new Mesh(lowPoly(1, rand, 0.08), s.lawn);
    lawn.scale.set(0.86, 0.04, 0.58);
    lawn.position.y = -0.03;
    group.add(lawn);
    const soil = new Mesh(lowPoly(1, rand, 0.14), s.soil);
    soil.scale.set(0.5, 0.14, 0.33);
    soil.position.y = -0.03;
    group.add(soil);
    [
      [-0.34, 0.14, 0.045],
      [0.3, 0.2, 0.04],
      [0.1, 0.27, 0.03],
    ].forEach(([x, z, r]) => {
      const stone = new Mesh(lowPoly(0, rand, 0.2), s.stone);
      stone.scale.set(r * 1.2, r * 0.8, r);
      stone.position.set(x, 0.06, z);
      stone.rotation.set(rand() * 3, rand() * 3, 0);
      group.add(stone);
    });
    const tufts = 22;
    for (let k = 0; k < tufts; k += 1) {
      const a = (k / tufts) * Math.PI * 2 + (rand() - 0.5) * 0.25;
      const reach = 0.56 + rand() * 0.2;
      const x = Math.cos(a) * reach;
      const z = Math.sin(a) * reach * 0.66;
      const tall = 0.7 + rand() * 0.7;
      for (let n = 0; n < 3; n += 1) {
        const blade = new Mesh(s.blade, n === 1 ? s.grassLight : s.grass);
        blade.position.set(x + (n - 1) * 0.02, 0.035 + 0.05 * tall, z);
        blade.rotation.set((rand() - 0.5) * 0.4, rand() * 3, (n - 1) * 0.4);
        blade.scale.set(1, tall, 1);
        group.add(blade);
      }
    }
    const shade = new Mesh(s.plane, s.shadow);
    shade.rotation.x = -Math.PI / 2;
    shade.position.set(0.18, 0.02, 0.1);
    group.add(shade);
    return { group, shade };
  }

  buildPlant(stage, seed, variant) {
    const s = this.shared;
    const m = this.seedMaterials(seed);
    const rand = random(`${seed.id}:${variant}`);
    const { group, shade } = this.buildBed(random(`bed:${variant}`));
    group.children.forEach((o) => {
      if (o === shade) return;
      // The bed is its own image under the plant; here it only hides what sits behind the grass.
      Object.assign(o, { material: s.depthOnly, renderOrder: -1 });
    });
    const leaves = [];
    const addLeaf = (
      at,
      normal,
      droop,
      size,
      color,
      geometry = s.leaf,
      flat = false,
    ) => leaves.push({ at, normal, droop, size, color, geometry, flat });

    if (stage < 2) {
      shade.scale.set(1, 0.7, 1);
      const height = stage === 0 ? 0.28 : 1.05;
      const stem = new QuadraticBezierCurve3(
        new Vector3(0, 0, 0),
        new Vector3(0.04, height * 0.5, 0),
        new Vector3(-0.01, height, 0),
      );
      group.add(
        new Mesh(taperedTube(stem, stage ? 0.022 : 0.012, 0.006), s.wood),
      );
      if (stage === 0) {
        [-1, 1].forEach((k) =>
          addLeaf(
            stem.getPoint(1),
            new Vector3(k, 0.6, 0.3),
            -0.2,
            0.16,
            1.05,
            s.round,
          ),
        );
        addLeaf(stem.getPoint(1), new Vector3(0.2, 1, 0.4), 0.2, 0.12, 1);
      } else {
        for (let n = 0; n < 11; n += 1) {
          const t = 0.25 + (n / 11) * 0.75;
          const az = n * 2.4;
          addLeaf(
            stem.getPoint(t),
            new Vector3(Math.cos(az), 0.35, Math.sin(az)),
            0.5,
            0.34 * (1.1 - t * 0.5),
            0.9 + rand() * 0.2,
          );
        }
      }
      this.addLeaves(group, leaves, m);
      return { base: group, top: null };
    }

    const top = new Group();
    const young = stage === 2;
    const ripe = stage === RIPE;
    const dead = stage === ROTTEN;
    const bloom = stage === 3;
    const height = young ? 0.78 : 1.1;
    const reach = young ? 0.46 : 0.7;
    const lean = (rand() - 0.5) * 0.16;
    const centre = new Vector3(lean * 1.6, height + reach * 0.1, 0);
    const vary = () => 0.95 + rand() * 0.1;
    const tilt = (rand() - 0.5) * 0.12;
    const lobes = [
      [0, 0, 0.04, 0.8 * vary(), 1.12],
      [-0.58, -0.1, 0.02, 0.54 * vary(), 1],
      [0.58, -0.06, 0.02, 0.54 * vary(), 1],
      [-0.2, 0.52, -0.02, 0.52 * vary(), 1],
      [0.26, 0.46, 0.06, 0.48 * vary(), 1],
    ].map(([x, y, z, r, wide]) => ({
      wide,
      at: centre
        .clone()
        .add(
          new Vector3(x * reach, y * reach, z * reach).applyAxisAngle(
            FORWARD,
            tilt,
          ),
        ),
      r: r * reach * (dead ? 0.78 : 1),
    }));
    if (dead) lobes.forEach((l) => l.at.setY(l.at.y - 0.1));
    const surface = canopyRadius(centre, lobes, reach);

    const fork = new Vector3(lean, height - reach * 0.75, 0);
    const trunk = new QuadraticBezierCurve3(
      new Vector3(0, 0, 0),
      new Vector3(-lean * 0.8, fork.y * 0.5, 0),
      fork,
    );
    const wood = dead ? s.rot : s.wood;
    group.add(
      new Mesh(taperedTube(trunk, reach * 0.22, reach * 0.15, 6, 7), wood),
    );
    const flare = new Mesh(s.sphere, wood);
    flare.scale.set(reach * 0.26, reach * 0.08, reach * 0.22);
    group.add(flare);
    lobes.forEach((b) => {
      const limb = new QuadraticBezierCurve3(
        fork,
        fork
          .clone()
          .lerp(b.at, 0.5)
          .add(new Vector3(0, -0.05, 0)),
        b.at,
      );
      group.add(
        new Mesh(taperedTube(limb, reach * 0.12, reach * 0.06, 5, 6), wood),
      );
    });
    shade.scale.set(reach * 3.4, reach * 2.2, 1);

    const canopy = dead ? s.withered : bloom ? s.bloom : m.canopy;
    top.add(new Mesh(canopyGeometry(lobes, rand, centre, reach), canopy));

    if (dead) {
      [-0.5, 0.58].forEach((x) => {
        const f = new Mesh(s.sphere, s.rot);
        f.scale.set(0.1, 0.06, 0.09);
        f.position.set(x, 0.05, 0.25);
        group.add(f);
      });
      return { base: group, top, pivot: fork };
    }
    if (young || bloom) return { base: group, top, pivot: fork };

    const geometry = this.peachGeometry(
      ripe ? seed : { ...seed, shape: "round" },
    );
    const count = ripe ? 5 : 6;
    const turn = rand() * Math.PI * 2;
    for (let n = 0; n < count; n += 1) {
      const a = turn + n * 2.39996 + (rand() - 0.5) * 0.3;
      const r = Math.sqrt((n + 0.5) / count) * (0.92 + rand() * 0.08);
      const dir = new Vector3(
        Math.cos(a) * r * 0.85,
        Math.sin(a) * r * 0.62 - 0.04,
        0.85,
      ).normalize();
      const size = reach * (ripe ? 0.2 : 0.11) * (0.9 + rand() * 0.2);
      const at = centre
        .clone()
        .addScaledVector(dir, surface(dir) + size * 0.55);
      const f = new Mesh(geometry, ripe ? m.fruit : s.unripe);
      f.scale.setScalar(size);
      f.position.copy(at);
      f.rotation.set(0.2, 0.6 + rand() * 0.4, (rand() - 0.5) * 0.4);
      top.add(f);
      if (ripe && seed.shape === "ring") {
        const ring = new Mesh(new TorusGeometry(1.5, 0.07, 8, 40), m.ring);
        ring.scale.setScalar(size);
        ring.position.copy(at);
        ring.rotation.set(1.25, 0, 0.25);
        top.add(ring);
      }
    }
    return { base: group, top, pivot: fork };
  }

  addLeaves(group, leaves, m) {
    const byGeometry = new Map();
    leaves.forEach((l) => {
      if (!byGeometry.has(l.geometry)) byGeometry.set(l.geometry, []);
      byGeometry.get(l.geometry).push(l);
    });
    const dummy = new Object3D();
    const q = new Quaternion();
    byGeometry.forEach((list, geometry) => {
      const mesh = new InstancedMesh(geometry, m.leaf, list.length);
      list.forEach((l, i) => {
        const out = l.normal.clone().normalize();
        if (l.flat) {
          const across = new Vector3().crossVectors(UP, out);
          if (across.lengthSq() < 1e-4) across.set(1, 0, 0);
          const down = new Vector3().crossVectors(across, out).normalize();
          out
            .multiplyScalar(0.35)
            .addScaledVector(down, l.droop)
            .addScaledVector(across.normalize(), (i % 3) - 1);
        } else {
          out.y -= l.droop * 0.6;
        }
        out.normalize();
        q.setFromUnitVectors(UP, out);
        dummy.position.copy(l.at);
        dummy.quaternion.copy(q);
        dummy.rotateY(i * 1.7);
        dummy.scale.setScalar(l.size);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        mesh.setColorAt(i, m.leafColor.clone().multiplyScalar(l.color));
      });
      group.add(mesh);
    });
  }

  fruitIcon(seed, done) {
    this.request(
      `fruit:${seed.id}`,
      () => {
        const m = this.seedMaterials(seed);
        const group = new Group();
        const geometry = this.peachGeometry(seed);
        const fruit = new Mesh(geometry, m.fruit);
        fruit.rotation.set(0.25, 0.7, 0.15);
        fruit.scale.setScalar(0.82);
        group.add(fruit);
        const url = this.snapshot(group, this.iconCamera, ICON_SIZE);
        geometry.dispose();
        return url;
      },
      done,
    );
  }

  seedIcon(seed, done) {
    this.request(
      `seed:${seed.id}`,
      () => {
        const g = lowPoly(2, random(seed.id), 0.05);
        const p = g.attributes.position;
        for (let i = 0; i < p.count; i += 1) {
          const x = p.getX(i);
          const y = p.getY(i);
          const z = p.getZ(i);
          const groove = 1 - 0.07 * Math.abs(Math.sin(y * 9 + x * 5));
          const tip = y > 0 ? 1 - y * 0.25 : 1;
          p.setXYZ(i, x * 0.62 * groove * tip, y, z * 0.42 * groove);
        }
        g.computeVertexNormals();
        const material = new MeshPhysicalMaterial({
          color: new Color(0x8a5634).lerp(new Color(seed.color), 0.35),
          roughness: 0.7,
          clearcoat: 0.3,
          flatShading: true,
          vertexColors: true,
        });
        const pit = new Mesh(g, material);
        pit.rotation.set(0.3, 0.5, -0.5);
        pit.scale.setScalar(0.78);
        const url = this.snapshot(pit, this.iconCamera, ICON_SIZE);
        g.dispose();
        material.dispose();
        return url;
      },
      done,
    );
  }
}

export const renders = new Renders();
