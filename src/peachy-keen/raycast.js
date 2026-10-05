import { Matrix4, Ray, Sphere, Triangle, Vector3 } from "three";

const inverse = new Matrix4();
const localRay = new Ray();
const sphere = new Sphere();
const a = new Vector3();
const b = new Vector3();
const c = new Vector3();
const CHUNK = 64;
const chunkBoxes = new WeakMap();

function boxesFor(geometry) {
  let boxes = chunkBoxes.get(geometry);
  if (boxes) return boxes;
  const p = geometry.attributes.position.array;
  const index = geometry.index.array;
  const chunks = Math.ceil(index.length / 3 / CHUNK);
  boxes = new Float32Array(chunks * 6);
  for (let n = 0; n < chunks; n += 1) {
    const box = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
    const end = Math.min(index.length, (n + 1) * CHUNK * 3);
    for (let t = n * CHUNK * 3; t < end; t += 1) {
      const v = index[t] * 3;
      for (let axis = 0; axis < 3; axis += 1) {
        box[axis] = Math.min(box[axis], p[v + axis]);
        box[axis + 3] = Math.max(box[axis + 3], p[v + axis]);
      }
    }
    boxes.set(box, n * 6);
  }
  chunkBoxes.set(geometry, boxes);
  return boxes;
}

export function raycastNearest(raycaster, intersects) {
  const { geometry, matrixWorld } = this;
  if (!geometry.boundingSphere) geometry.computeBoundingSphere();
  sphere.copy(geometry.boundingSphere).applyMatrix4(matrixWorld);
  if (!raycaster.ray.intersectsSphere(sphere)) return;
  localRay.copy(raycaster.ray).applyMatrix4(inverse.copy(matrixWorld).invert());

  const p = geometry.attributes.position.array;
  const index = geometry.index.array;
  const plant = geometry.attributes.plant?.array;
  const { x: ox, y: oy, z: oz } = localRay.origin;
  const { x: dx, y: dy, z: dz } = localRay.direction;
  const boxes = boxesFor(geometry);
  const ix = 1 / dx;
  const iy = 1 / dy;
  const iz = 1 / dz;
  let nearest = Infinity;
  let face = -1;
  for (let n = 0; n < boxes.length / 6; n += 1) {
    const o = n * 6;
    const x1 = (boxes[o] - ox) * ix;
    const x2 = (boxes[o + 3] - ox) * ix;
    const y1 = (boxes[o + 1] - oy) * iy;
    const y2 = (boxes[o + 4] - oy) * iy;
    const z1 = (boxes[o + 2] - oz) * iz;
    const z2 = (boxes[o + 5] - oz) * iz;
    const enter = Math.max(
      Math.min(x1, x2),
      Math.min(y1, y2),
      Math.min(z1, z2),
    );
    const exit = Math.min(Math.max(x1, x2), Math.max(y1, y2), Math.max(z1, z2));
    if (exit < 0 || enter > exit || enter > nearest) continue;
    const end = Math.min(index.length, (n + 1) * CHUNK * 3);
    for (let t = n * CHUNK * 3; t < end; t += 3) {
      if (plant && plant[index[t]] > 0.5) continue;
      const i = index[t] * 3;
      const j = index[t + 1] * 3;
      const k = index[t + 2] * 3;
      const ax = p[i];
      const ay = p[i + 1];
      const az = p[i + 2];
      const e1x = p[j] - ax;
      const e1y = p[j + 1] - ay;
      const e1z = p[j + 2] - az;
      const e2x = p[k] - ax;
      const e2y = p[k + 1] - ay;
      const e2z = p[k + 2] - az;
      const px = dy * e2z - dz * e2y;
      const py = dz * e2x - dx * e2z;
      const pz = dx * e2y - dy * e2x;
      const det = e1x * px + e1y * py + e1z * pz;
      if (det > -1e-12 && det < 1e-12) continue;
      const inv = 1 / det;
      const tx = ox - ax;
      const ty = oy - ay;
      const tz = oz - az;
      const u = (tx * px + ty * py + tz * pz) * inv;
      if (u < 0 || u > 1) continue;
      const qx = ty * e1z - tz * e1y;
      const qy = tz * e1x - tx * e1z;
      const qz = tx * e1y - ty * e1x;
      const v = (dx * qx + dy * qy + dz * qz) * inv;
      if (v < 0 || u + v > 1) continue;
      const distance = (e2x * qx + e2y * qy + e2z * qz) * inv;
      if (distance > 0 && distance < nearest) {
        nearest = distance;
        face = t;
      }
    }
  }
  if (face < 0) return;

  const point = localRay.at(nearest, new Vector3()).applyMatrix4(matrixWorld);
  const distance = raycaster.ray.origin.distanceTo(point);
  if (distance < raycaster.near || distance > raycaster.far) return;
  const [ia, ib, ic] = [index[face], index[face + 1], index[face + 2]];
  const normal = Triangle.getNormal(
    a.fromArray(p, ia * 3),
    b.fromArray(p, ib * 3),
    c.fromArray(p, ic * 3),
    new Vector3(),
  );
  intersects.push({
    distance,
    point,
    object: this,
    face: { a: ia, b: ib, c: ic, normal, materialIndex: 0 },
    faceIndex: face / 3,
  });
}
