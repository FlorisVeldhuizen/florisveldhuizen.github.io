import {
  CanvasTexture,
  CylinderGeometry,
  Mesh,
  MeshPhysicalMaterial,
  SphereGeometry,
  SRGBColorSpace,
} from "three";

export function canvas(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export const mesh = (
  geo,
  mat,
  parent,
  [x, y, z] = [0, 0, 0],
  [sx, sy, sz] = [1, 1, 1],
) => {
  const o = new Mesh(geo, mat);
  o.position.set(x, y, z);
  o.scale.set(sx, sy, sz);
  parent.add(o);
  return o;
};

export const gloss = (color, extra = {}) =>
  new MeshPhysicalMaterial({
    color,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    ...extra,
  });

export function makeShared() {
  return {
    sphere: new SphereGeometry(1, 24, 16),
    lowSphere: new SphereGeometry(1, 12, 8),
    rod: new CylinderGeometry(1, 1, 1, 8, 1),
    own: [],
    cache: {},
  };
}

export function once(shared, key, make) {
  if (!shared.cache[key]) {
    // eslint-disable-next-line no-param-reassign
    shared.cache[key] = make();
    shared.own.push(shared.cache[key]);
  }
  return shared.cache[key];
}
