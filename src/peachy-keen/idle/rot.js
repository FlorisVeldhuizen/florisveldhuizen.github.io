import {
  BufferAttribute,
  CanvasTexture,
  Color,
  SRGBColorSpace,
  Vector3,
} from "three";
import { sampleTexture } from "../peach";

const CORE = new Color(0x4e2a18);
const WITHERED = new Color(0x5e4a22);
const RIPE_DARK = new Color(0x7c2a24);
const BRUISE = new Color(0x8a5236);

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const hash = (x, y, z) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
};
const noise = (v, f) => {
  const [x, y, z] = [v.x * f, v.y * f, v.z * f];
  const [ix, iy, iz] = [Math.floor(x), Math.floor(y), Math.floor(z)];
  const ease = (t) => t * t * (3 - 2 * t);
  const [u, w, q] = [ease(x - ix), ease(y - iy), ease(z - iz)];
  const mix = (a, b, t) => a + (b - a) * t;
  const h = (a, b, c) => hash(ix + a, iy + b, iz + c);
  return mix(
    mix(mix(h(0, 0, 0), h(1, 0, 0), u), mix(h(0, 1, 0), h(1, 1, 0), u), w),
    mix(mix(h(0, 0, 1), h(1, 0, 1), u), mix(h(0, 1, 1), h(1, 1, 1), u), w),
    q,
  );
};

export function rotGeometry(source, facing, map) {
  const geometry = source.clone();
  geometry.computeBoundingSphere();
  const { radius, center } = geometry.boundingSphere;
  const { position, normal, uv } = geometry.attributes;
  const sample = sampleTexture(map);
  const front = facing.clone().normalize();
  const tilt = new Vector3(0.6, -0.5, 0.3).normalize();
  const spots = [
    front,
    front.clone().add(tilt.clone().multiplyScalar(0.9)).normalize(),
    front.clone().sub(tilt.clone().multiplyScalar(0.8)).normalize(),
    new Vector3(-front.x, front.y * 0.3 - 0.4, front.z).normalize(),
  ];
  const colors = new Float32Array(position.count * 3);
  const p = new Vector3();
  const n = new Vector3();
  const dir = new Vector3();
  const color = new Color();
  for (let i = 0; i < position.count; i += 1) {
    p.fromBufferAttribute(position, i);
    n.fromBufferAttribute(normal, i);
    dir.copy(p).sub(center).normalize();
    const [r, g, b] = sample(uv.getX(i), uv.getY(i));
    color.setRGB(r, g, b);
    const leaf = g - r > 0.07 || (Math.max(r, g, b) < 0.5 && g >= 0.6 * r);
    let dent = 0;
    if (leaf) color.lerp(WITHERED, 0.25);
    else {
      const blotch = noise(dir, 3.2);
      color.lerp(RIPE_DARK, smooth(0.2, 0.9, blotch + 0.2 - dir.y * 0.3) * 0.7);
      color.lerp(CORE, smooth(0.75, 0.95, blotch + 0.1) * 0.6);
      dent = smooth(0.5, 1, blotch) * 0.03 + Math.max(0, -dir.y) * 0.05;
      spots.forEach((spot, k) => {
        const size = k === 0 ? 0.32 : 0.18 + k * 0.03;
        const d = dir.angleTo(spot) / size + (blotch - 0.5) * 0.5;
        const soft = 1 - smooth(0.55, 1, d);
        color.lerp(BRUISE, soft * 0.8);
        color.lerp(CORE, (1 - smooth(0.2, 0.7, d)) * 0.35);
        dent += soft * 0.03;
      });
    }
    p.addScaledVector(n, -dent * radius);
    position.setXYZ(i, p.x, p.y, p.z);
    colors.set([color.r, color.g, color.b], i * 3);
  }
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function flyTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const g = canvas.getContext("2d");
  g.fillStyle = "rgba(235, 240, 255, 0.55)";
  g.beginPath();
  g.ellipse(11, 11, 6, 3.5, -0.6, 0, Math.PI * 2);
  g.ellipse(21, 11, 6, 3.5, 0.6, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#1c0e0a";
  g.beginPath();
  g.ellipse(16, 18, 4, 5.5, 0, 0, Math.PI * 2);
  g.fill();
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}
