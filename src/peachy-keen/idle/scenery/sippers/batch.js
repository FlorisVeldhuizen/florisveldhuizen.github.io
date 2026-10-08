/* eslint-disable no-param-reassign */
import {
  BufferAttribute,
  BufferGeometry,
  DataTexture,
  DoubleSide,
  FloatType,
  InstancedMesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RGBAFormat,
} from "three";

const MAX = 12;
const HIDDEN = 31;

function merge(parts, extra) {
  let vertexCount = 0;
  let indexCount = 0;
  parts.forEach(({ geometry }) => {
    vertexCount += geometry.attributes.position.count;
    indexCount += geometry.index
      ? geometry.index.count
      : geometry.attributes.position.count;
  });
  const pos = new Float32Array(vertexCount * 3);
  const nor = new Float32Array(vertexCount * 3);
  const uv = new Float32Array(vertexCount * 2);
  const part = new Float32Array(vertexCount);
  const extras = Object.fromEntries(
    Object.entries(extra).map(([name, [size]]) => [
      name,
      new Float32Array(vertexCount * size),
    ]),
  );
  const index = new Uint32Array(indexCount);
  let v = 0;
  let i = 0;
  parts.forEach((p, n) => {
    const g = p.geometry;
    const { count } = g.attributes.position;
    pos.set(g.attributes.position.array.subarray(0, count * 3), v * 3);
    if (g.attributes.normal)
      nor.set(g.attributes.normal.array.subarray(0, count * 3), v * 3);
    if (g.attributes.uv)
      uv.set(g.attributes.uv.array.subarray(0, count * 2), v * 2);
    part.fill(n, v, v + count);
    Object.entries(extra).forEach(([name, [size, get]]) => {
      const values = get(p);
      for (let k = 0; k < count; k += 1)
        extras[name].set(values, (v + k) * size);
    });
    if (g.index)
      for (let k = 0; k < g.index.count; k += 1)
        index[i + k] = g.index.array[k] + v;
    else for (let k = 0; k < count; k += 1) index[i + k] = v + k;
    i += g.index ? g.index.count : count;
    v += count;
  });
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setAttribute("normal", new BufferAttribute(nor, 3));
  geo.setAttribute("uv", new BufferAttribute(uv, 2));
  geo.setAttribute("aPart", new BufferAttribute(part, 1));
  Object.entries(extra).forEach(([name, [size]]) =>
    geo.setAttribute(name, new BufferAttribute(extras[name], size)),
  );
  geo.setIndex(new BufferAttribute(index, 1));
  return geo;
}

function boneTexture(texelsPerRow) {
  const data = new Float32Array(texelsPerRow * MAX * 4);
  const tex = new DataTexture(data, texelsPerRow, MAX, RGBAFormat, FloatType);
  tex.needsUpdate = true;
  return tex;
}

const BONE_GLSL = (stride) => `
uniform sampler2D uBones;
varying float vMirror;
mat4 boneOf(float part) {
  int x = int(part + 0.5) * ${stride};
  int row = gl_InstanceID;
  return mat4(texelFetch(uBones, ivec2(x, row), 0), texelFetch(uBones, ivec2(x + 1, row), 0), texelFetch(uBones, ivec2(x + 2, row), 0), texelFetch(uBones, ivec2(x + 3, row), 0));
}
vec4 paramOf(float part, int k) {
  return texelFetch(uBones, ivec2(int(part + 0.5) * ${stride} + 4 + k, gl_InstanceID), 0);
}
`;

const bakeable = (o) =>
  !o.userData.dynamic &&
  o.parent &&
  (o.updateMatrix(), o.matrix.determinant() > 0);

function baked(o) {
  if (!bakeable(o)) return o.geometry;
  const g = o.geometry.clone();
  g.applyMatrix4(o.matrix);
  return g;
}

function instanced(geo, material, group) {
  const mesh = new InstancedMesh(geo, material, MAX);
  mesh.count = 0;
  mesh.frustumCulled = false;
  group.add(mesh);
  return mesh;
}

export default function makeBatch(template, group) {
  const solid = [];
  const shells = [];
  const wings = [];
  template.root.traverse((o) => {
    if (!o.isMesh) return;
    if (o.userData.wingTop) wings.push(o);
    else if (o.userData.shellCut !== undefined) shells.push(o);
    else solid.push(o);
  });
  const kindOf = (o) => {
    if (o.material === template.mats.eye) return 1;
    return o.material === template.mats.dark ? 2 : 0;
  };

  const solidTex = boneTexture(solid.length * 4 + 1);
  const solidGeo = merge(
    solid.map((o) => ({ geometry: baked(o), o })),
    {
      color: [3, ({ o }) => o.material.color.toArray()],
      aKind: [1, ({ o }) => [kindOf(o)]],
    },
  );
  const solidMat = new MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.9,
    sheen: 1,
    sheenColor: template.mats.fur.sheenColor.clone(),
    sheenRoughness: 0.6,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    side: DoubleSide,
  });
  const furGlow = template.mats.fur.emissive.clone();
  solidMat.onBeforeCompile = (shader) => {
    shader.uniforms.uBones = { value: solidTex };
    shader.uniforms.uFurGlow = { value: furGlow };
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>\nattribute float aPart;\nattribute float aKind;\nvarying float vKind;\nvarying float vFill;\n${BONE_GLSL(4)}`,
      )
      .replace(
        "#include <beginnormal_vertex>",
        `mat4 boneM = boneOf(aPart);\nvec3 objectNormal = normalize(mat3(boneM) * normal);\nvMirror = determinant(mat3(boneM)) < 0.0 ? 1.0 : 0.0;\nvKind = aKind;\nvFill = texelFetch(uBones, ivec2(${solid.length * 4}, gl_InstanceID), 0).x;`,
      )
      .replace(
        "#include <begin_vertex>",
        "vec3 transformed = (boneM * vec4(position, 1.0)).xyz;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying float vKind;\nvarying float vFill;\nvarying float vMirror;\nuniform vec3 uFurGlow;",
      )
      .replace(
        "#include <normal_fragment_begin>",
        "#include <normal_fragment_begin>\nif (vMirror > 0.5) normal = -normal;",
      )
      .replace(
        "#include <roughnessmap_fragment>",
        "#include <roughnessmap_fragment>\nroughnessFactor = vKind > 1.5 ? 0.4 : vKind > 0.5 ? 0.06 : 0.9;",
      )
      .replace(
        "#include <emissivemap_fragment>",
        "#include <emissivemap_fragment>\ntotalEmissiveRadiance += uFurGlow * vFill * 0.25 * step(vKind, 0.5);",
      )
      .replace(
        "#include <lights_physical_fragment>",
        "#include <lights_physical_fragment>\nmaterial.clearcoat *= step(0.5, vKind);\nmaterial.sheenColor *= 1.0 - step(0.5, vKind);",
      );
  };
  solidMat.customProgramCacheKey = () => "sipper-batch-solid";
  const solidMesh = instanced(solidGeo, solidMat, group);

  const shellTex = boneTexture(shells.length * 4);
  const shellGeo = merge(
    shells.map((o) => ({ geometry: baked(o), o })),
    { aCut: [1, ({ o }) => [o.userData.shellCut]] },
  );
  const shellMat = new MeshStandardMaterial({
    color: shells[0]?.material.color ?? 0xffffff,
    alphaMap: shells[0]?.material.alphaMap ?? null,
    roughness: 1,
  });
  shellMat.onBeforeCompile = (shader) => {
    shader.uniforms.uBones = { value: shellTex };
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>\nattribute float aPart;\nattribute float aCut;\nvarying float vCut;\n${BONE_GLSL(4)}`,
      )
      .replace(
        "#include <beginnormal_vertex>",
        "mat4 boneM = boneOf(aPart);\nvec3 objectNormal = normalize(mat3(boneM) * normal);\nvCut = aCut;\nvMirror = 0.0;",
      )
      .replace(
        "#include <begin_vertex>",
        "vec3 transformed = (boneM * vec4(position, 1.0)).xyz;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying float vCut;\nvarying float vMirror;",
      )
      .replace(
        "#include <alphatest_fragment>",
        "if (diffuseColor.a < vCut) discard;",
      );
  };
  shellMat.customProgramCacheKey = () => "sipper-batch-shell";
  const shellMesh = shells.length ? instanced(shellGeo, shellMat, group) : null;

  const WING = 8;
  const wingTex = boneTexture(wings.length * WING);
  const wingGeo = merge(
    wings.map((o) => ({ geometry: o.geometry, o })),
    { aWingUv: [2, () => [0, 0]] },
  );
  wingGeo.attributes.aWingUv.array.set(wingGeo.attributes.uv.array);
  const wingMat = template.wingMaterial(wingTex, BONE_GLSL(WING));
  const wingMesh = instanced(wingGeo, wingMat, group);

  const meshes = [solidMesh, shellMesh, wingMesh].filter(Boolean);
  const boneOf = (o) => (bakeable(o) ? o.parent : o);
  const hide = (rig) =>
    rig.root.traverse((o) => {
      if (o.isMesh) o.layers.set(HIDDEN);
    });
  hide(template);

  return {
    hide,
    minCount: 0,
    shadowSource: { solidGeo, solidTex, wingGeo, wingTex, wingStride: WING },
    write(rigs) {
      const count = Math.min(MAX, rigs.length);
      const sd = solidTex.image.data;
      const hd = shellTex.image.data;
      const wd = wingTex.image.data;
      const sRow = (solid.length * 4 + 1) * 4;
      const hRow = shells.length * 16;
      const wRow = wings.length * WING * 4;
      for (let r = 0; r < count; r += 1) {
        const rig = rigs[r];
        const parts = rig.batchParts;
        const holder = rig.root.parent;
        holder.updateMatrix();
        holder.matrixWorld.multiplyMatrices(
          holder.parent.matrixWorld,
          holder.matrix,
        );
        parts.chain.forEach((o) => {
          if (o.matrixAutoUpdate) o.updateMatrix();
          o.matrixWorld.multiplyMatrices(o.parent.matrixWorld, o.matrix);
        });
        parts.solidBones.forEach((o, k) =>
          sd.set(o.matrixWorld.elements, r * sRow + k * 16),
        );
        sd[r * sRow + solid.length * 16] = rig.fillValue ?? 0;
        parts.shellBones.forEach((o, k) =>
          hd.set(o.matrixWorld.elements, r * hRow + k * 16),
        );
        parts.wings.forEach((o, k) => {
          const base = r * wRow + k * WING * 4;
          wd.set(o.matrixWorld.elements, base);
          const info = o.userData.wingTop;
          const b = info.bend;
          wd[base + 16] = b.uBend.value;
          wd[base + 17] = b.uTwist.value;
          wd[base + 18] = b.uSpan.value;
          wd[base + 19] = info.fill.value;
          wd.set(info.top, base + 20);
          wd.set(info.under, base + 24);
          [wd[base + 28], wd[base + 29]] = info.root;
        });
      }
      solidTex.needsUpdate = true;
      shellTex.needsUpdate = true;
      wingTex.needsUpdate = true;
      meshes.forEach((m) => {
        m.count = Math.max(count, this.minCount);
      });
    },
    register(rig) {
      const parts = { solid: [], shells: [], wings: [] };
      rig.root.traverse((o) => {
        if (!o.isMesh) return;
        if (o.userData.wingTop) parts.wings.push(o);
        else if (o.userData.shellCut !== undefined) parts.shells.push(o);
        else parts.solid.push(o);
      });
      rig.root.traverse((o) => {
        if (!o.isMesh || o.userData.dynamic) return;
        o.updateMatrix();
        o.matrixAutoUpdate = false;
      });
      parts.solidBones = parts.solid.map(boneOf);
      parts.shellBones = parts.shells.map(boneOf);
      const needed = new Set();
      [...parts.solidBones, ...parts.shellBones, ...parts.wings].forEach(
        (o) => {
          for (let x = o; x !== rig.root.parent; x = x.parent) needed.add(x);
        },
      );
      parts.chain = [];
      rig.root.traverse((o) => needed.has(o) && parts.chain.push(o));
      rig.batchParts = parts;
      hide(rig);
    },
    dispose() {
      meshes.forEach((m) => {
        group.remove(m);
        m.geometry.dispose();
        m.material.dispose();
      });
      [solidTex, shellTex, wingTex].forEach((t) => t.dispose());
    },
  };
}
