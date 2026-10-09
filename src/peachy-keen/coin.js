import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  OrthographicCamera,
  PlaneGeometry,
  RawShaderMaterial,
  SRGBColorSpace,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderTarget,
} from "three";

export const COIN_R = 0.2;
export const COIN_TH = 0.026;

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

export function coinGeometry(scale = 1) {
  return new CylinderGeometry(
    COIN_R * scale,
    COIN_R * scale,
    COIN_TH * scale,
    40,
  );
}

export function coinMaterials(peach, renderer) {
  const stamp = coinStamp(peach, renderer);
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
  return [edge, face, face];
}

export function coinSounds(ctx) {
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
