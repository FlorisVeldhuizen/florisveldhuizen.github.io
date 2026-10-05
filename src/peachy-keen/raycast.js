import { Matrix4, Ray, Sphere, Triangle, Vector3 } from "three";

const inverse = new Matrix4();
const localRay = new Ray();
const sphere = new Sphere();
const a = new Vector3();
const b = new Vector3();
const c = new Vector3();
const CHUNK = 64;
const BITS = 10;
const chunkBoxes = new WeakMap();

function curveKey(cell) {
  let key = 0;
  for (let bit = 0; bit < BITS; bit += 1) {
    for (let axis = 0; axis < 3; axis += 1) {
      key += (Math.floor(cell[axis] / 2 ** bit) % 2) * 2 ** (bit * 3 + axis);
    }
  }
  return key;
}

// Triangles are sorted along a space-filling curve so each chunk box stays tight.
function spatialOrder(p, index) {
  const lo = [Infinity, Infinity, Infinity];
  const hi = [-Infinity, -Infinity, -Infinity];
  for (let v = 0; v < p.length; v += 3) {
    for (let axis = 0; axis < 3; axis += 1) {
      lo[axis] = Math.min(lo[axis], p[v + axis]);
      hi[axis] = Math.max(hi[axis], p[v + axis]);
    }
  }
  const count = index.length / 3;
  const keys = new Float64Array(count);
  const cell = [0, 0, 0];
  for (let f = 0; f < count; f += 1) {
    for (let axis = 0; axis < 3; axis += 1) {
      const centre =
        (p[index[f * 3] * 3 + axis] +
          p[index[f * 3 + 1] * 3 + axis] +
          p[index[f * 3 + 2] * 3 + axis]) /
        3;
      cell[axis] = Math.floor(
        ((centre - lo[axis]) / (hi[axis] - lo[axis] || 1)) * (2 ** BITS - 1),
      );
    }
    keys[f] = curveKey(cell);
  }
  const order = new Uint32Array(count).map((_, f) => f);
  order.sort((f, g) => keys[f] - keys[g]);
  return order.map((f) => f * 3);
}

export function boxesFor(geometry) {
  let found = chunkBoxes.get(geometry);
  if (found) return found;
  const p = geometry.attributes.position.array;
  const index = geometry.index.array;
  const order = spatialOrder(p, index);
  const chunks = Math.ceil(order.length / CHUNK);
  const boxes = new Float32Array(chunks * 6);
  for (let n = 0; n < chunks; n += 1) {
    const box = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
    const end = Math.min(order.length, (n + 1) * CHUNK);
    for (let f = n * CHUNK; f < end; f += 1) {
      for (let corner = 0; corner < 3; corner += 1) {
        const v = index[order[f] + corner] * 3;
        for (let axis = 0; axis < 3; axis += 1) {
          box[axis] = Math.min(box[axis], p[v + axis]);
          box[axis + 3] = Math.max(box[axis + 3], p[v + axis]);
        }
      }
    }
    boxes.set(box, n * 6);
  }
  found = { boxes, order };
  chunkBoxes.set(geometry, found);
  return found;
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
  const { boxes, order } = boxesFor(geometry);
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
    const end = Math.min(order.length, (n + 1) * CHUNK);
    for (let f = n * CHUNK; f < end; f += 1) {
      const t = order[f];
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
