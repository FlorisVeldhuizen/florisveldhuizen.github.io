import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DataTexture,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  WebGLRenderTarget,
} from "three";
import { usePeachShape } from "../sky";

export const smoother = (x) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

export const rand = (a, b) => a + Math.random() * (b - a);

// Borrows the moon's recipe: peach geometry without leaf and stem, centred, 2 units across.
function peachShape(peach) {
  const stub = {
    geometry: { dispose() {} },
    material: {
      uniforms: {
        uPeach: { value: null },
        uHasPeach: { value: 0 },
        uTint: { value: new Color() },
      },
    },
  };
  usePeachShape(stub, peach);
  return stub.geometry;
}

export function tone(
  ctx,
  {
    hz = 440,
    to = hz,
    type = "sine",
    length = 0.2,
    volume = 0.03,
    attack = 0.01,
    at = 0,
    cutoff = 2400,
  },
) {
  const ac = ctx.audio();
  if (!ac || ac.state !== "running") return;
  const t0 = ac.currentTime + at;
  const osc = ac.createOscillator();
  const filter = ac.createBiquadFilter();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(hz, t0);
  if (to !== hz)
    osc.frequency.exponentialRampToValueAtTime(to, t0 + length * 0.8);
  filter.type = "lowpass";
  filter.frequency.value = cutoff;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(volume, t0 + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + length);
  osc.connect(filter).connect(gain).connect(ctx.audioOut());
  osc.start(t0);
  osc.stop(t0 + length + 0.05);
}

const STAMP = 256;
const STAMP_SPAN = 2.3;
const STAMP_RANGE = 1.2;
const stamps = new WeakMap();

const nextFrame = () => new Promise(requestAnimationFrame);

// Runs rows [0, total) a few milliseconds per frame so the bake never stalls one frame.
async function rows(total, fn, reverse = false) {
  let start = performance.now();
  for (let r = 0; r < total; r += 1) {
    fn(reverse ? total - 1 - r : r);
    if (performance.now() - start > 4) {
      // eslint-disable-next-line no-await-in-loop
      await nextFrame();
      start = performance.now();
    }
  }
}

async function chamfer(inside, size) {
  const d = new Float32Array(size * size);
  for (let n = 0; n < d.length; n += 1) d[n] = inside[n] ? 0 : 1e9;
  const D = Math.SQRT2;
  await rows(size, (y) => {
    for (let x = 0; x < size; x += 1) {
      const n = y * size + x;
      if (x > 0) d[n] = Math.min(d[n], d[n - 1] + 1);
      if (y > 0) {
        d[n] = Math.min(d[n], d[n - size] + 1);
        if (x > 0) d[n] = Math.min(d[n], d[n - size - 1] + D);
        if (x < size - 1) d[n] = Math.min(d[n], d[n - size + 1] + D);
      }
    }
  });
  await rows(
    size,
    (y) => {
      for (let x = size - 1; x >= 0; x -= 1) {
        const n = y * size + x;
        if (x < size - 1) d[n] = Math.min(d[n], d[n + 1] + 1);
        if (y < size - 1) {
          d[n] = Math.min(d[n], d[n + size] + 1);
          if (x < size - 1) d[n] = Math.min(d[n], d[n + size + 1] + D);
          if (x > 0) d[n] = Math.min(d[n], d[n + size - 1] + D);
        }
      }
    },
    true,
  );
  return d;
}

function readPeach(renderer, peach) {
  const geometry = peachShape(peach);
  const scene = new Scene();
  const material = new ShaderMaterial({
    vertexShader:
      "varying vec3 vN; void main() { vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `
      varying vec3 vN;
      void main() {
        vec3 n = normalize(vN);
        float shade = clamp(dot(n, normalize(vec3(-0.35, 0.55, 0.75))), 0.0, 1.0);
        gl_FragColor = vec4(1.0, shade, clamp(1.0 - n.z, 0.0, 1.0), 1.0);
      }
    `,
  });
  scene.add(new Mesh(geometry, material));
  const half = STAMP_SPAN / 2;
  const camera = new OrthographicCamera(-half, half, half, -half, 0.1, 20);
  camera.position.z = 8;
  const target = new WebGLRenderTarget(STAMP, STAMP);
  const previous = renderer.getRenderTarget();
  const clear = renderer.getClearColor(new Color());
  const alpha = renderer.getClearAlpha();
  renderer.setRenderTarget(target);
  renderer.setClearColor(0x000000, 0);
  renderer.clear();
  renderer.render(scene, camera);
  const pixels = new Uint8Array(STAMP * STAMP * 4);
  renderer.readRenderTargetPixels(target, 0, 0, STAMP, STAMP, pixels);
  renderer.setRenderTarget(previous);
  renderer.setClearColor(clear, alpha);
  target.dispose();
  material.dispose();
  geometry.dispose();
  return pixels;
}

async function bakeStamp(renderer, peach) {
  const pixels = readPeach(renderer, peach);
  const count = STAMP * STAMP;
  const inside = new Uint8Array(count);
  for (let n = 0; n < count; n += 1) inside[n] = pixels[n * 4] > 127 ? 1 : 0;
  const toInside = await chamfer(inside, STAMP);
  const toOutside = await chamfer(
    inside.map((v) => 1 - v),
    STAMP,
  );
  const unit = STAMP_SPAN / STAMP;
  let sd = new Float32Array(count);
  for (let n = 0; n < count; n += 1)
    sd[n] = (inside[n] ? -(toOutside[n] - 0.5) : toInside[n] - 0.5) * unit;
  for (let pass = 0; pass < 3; pass += 1) {
    const from = sd;
    const blurred = new Float32Array(count);
    // eslint-disable-next-line no-await-in-loop
    await rows(STAMP, (y) => {
      for (let x = 0; x < STAMP; x += 1) {
        let sum = 0;
        let w = 0;
        for (let j = -1; j <= 1; j += 1)
          for (let i = -1; i <= 1; i += 1) {
            const xx = x + i;
            const yy = y + j;
            if (xx >= 0 && yy >= 0 && xx < STAMP && yy < STAMP) {
              sum += from[yy * STAMP + xx];
              w += 1;
            }
          }
        blurred[y * STAMP + x] = sum / w;
      }
    });
    sd = blurred;
  }
  const data = new Uint8Array(count * 4);
  for (let n = 0; n < count; n += 1) {
    data[n * 4] = Math.round(
      Math.min(1, Math.max(0, 0.5 + sd[n] / STAMP_RANGE)) * 255,
    );
    data[n * 4 + 1] = pixels[n * 4 + 1];
    data[n * 4 + 2] = pixels[n * 4 + 2];
    data[n * 4 + 3] = 255;
  }
  const texture = new DataTexture(data, STAMP, STAMP, RGBAFormat);
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

// The real peach seen from the camera: R signed distance to the outline, G soft shading, B crease and rim.
export function peachStamp(ctx) {
  const { renderer } = ctx;
  if (!stamps.has(renderer))
    stamps.set(
      renderer,
      bakeStamp(renderer, ctx.peach).catch((error) => {
        stamps.delete(renderer);
        throw error;
      }),
    );
  return stamps.get(renderer);
}

export const STAMP_GLSL = `
  uniform sampler2D uStamp;
  vec3 peachAt(vec2 s) {
    vec2 uv = s / ${STAMP_SPAN.toFixed(2)} + 0.5;
    vec3 t = texture2D(uStamp, clamp(uv, 0.0, 1.0)).rgb;
    float d = (t.r - 0.5) * ${STAMP_RANGE.toFixed(2)};
    vec2 out_ = abs(uv - 0.5) - 0.5;
    d += max(max(out_.x, out_.y), 0.0) * ${STAMP_SPAN.toFixed(2)};
    return vec3(d, t.g, t.b);
  }
`;

// Vertex clustering: a light shell of the peach for effects that only need its shape.
export function coarseShell(source, cells) {
  const pos = source.attributes.position;
  const nor = source.attributes.normal;
  source.computeBoundingBox();
  const { min, max } = source.boundingBox;
  const step =
    Math.max(max.x - min.x, max.y - min.y, max.z - min.z) / cells || 1;
  const side = cells + 2;
  const slot = new Map();
  const remap = new Uint32Array(pos.count);
  const sums = [];
  for (let n = 0; n < pos.count; n += 1) {
    const x = pos.getX(n);
    const y = pos.getY(n);
    const z = pos.getZ(n);
    const key =
      Math.floor((x - min.x) / step) +
      side *
        (Math.floor((y - min.y) / step) +
          side * Math.floor((z - min.z) / step));
    let id = slot.get(key);
    if (id === undefined) {
      id = sums.length;
      slot.set(key, id);
      sums.push([0, 0, 0, 0, 0, 0, 0]);
    }
    const s = sums[id];
    s[0] += x;
    s[1] += y;
    s[2] += z;
    s[3] += nor.getX(n);
    s[4] += nor.getY(n);
    s[5] += nor.getZ(n);
    s[6] += 1;
    remap[n] = id;
  }
  const position = new Float32Array(sums.length * 3);
  const normal = new Float32Array(sums.length * 3);
  sums.forEach((s, id) => {
    const len = Math.hypot(s[3], s[4], s[5]) || 1;
    position.set([s[0] / s[6], s[1] / s[6], s[2] / s[6]], id * 3);
    normal.set([s[3] / len, s[4] / len, s[5] / len], id * 3);
  });
  const tris = [];
  const index = source.index?.array;
  const total = index ? index.length : pos.count;
  for (let t = 0; t < total; t += 3) {
    const a = remap[index ? index[t] : t];
    const b = remap[index ? index[t + 1] : t + 1];
    const c = remap[index ? index[t + 2] : t + 2];
    if (a !== b && b !== c && a !== c) tris.push(a, b, c);
  }
  const shell = new BufferGeometry();
  shell.setAttribute("position", new BufferAttribute(position, 3));
  shell.setAttribute("normal", new BufferAttribute(normal, 3));
  shell.setIndex(tris);
  return shell;
}
