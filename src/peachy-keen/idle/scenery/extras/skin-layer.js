import { Group, Mesh, MeshMatcapMaterial, NormalBlending } from "three";

const jobs = new Set();
let hooked = null;

// Runs after the frame's own updates (peach, mood) and before lights are set up for drawing.
export function beforeDraw(scene, job) {
  if (hooked !== scene) {
    const prior = scene.onBeforeRender;
    // eslint-disable-next-line no-param-reassign
    scene.onBeforeRender = (...args) => {
      prior.apply(scene, args);
      jobs.forEach((run) => {
        try {
          run();
        } catch (error) {
          jobs.delete(run);
          // eslint-disable-next-line no-console
          console.error(error);
        }
      });
    };
    hooked = scene;
  }
  jobs.add(job);
  return () => jobs.delete(job);
}

export function rider(ctx) {
  const group = new Group();
  group.matrixAutoUpdate = false;
  ctx.group.add(group);
  group.follow = () => {
    const { mesh } = ctx.peach;
    if (!mesh) return false;
    group.matrix.copy(mesh.matrixWorld);
    group.updateMatrixWorld(true);
    return true;
  };
  return group;
}

export function skinLayer(
  ctx,
  parent,
  {
    key,
    uniforms = {},
    header = "",
    body = "",
    after = "",
    maps = {},
    blending = NormalBlending,
  },
) {
  const { peach } = ctx;
  const material = new MeshMatcapMaterial({
    transparent: true,
    depthWrite: false,
    blending,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -4,
    ...maps,
  });
  peach.followSurface(material);
  const follow = material.onBeforeCompile;
  material.onBeforeCompile = (shader) => {
    const { fragmentShader } = shader;
    follow(shader);
    Object.assign(shader.uniforms, uniforms);
    // eslint-disable-next-line no-param-reassign
    shader.fragmentShader = fragmentShader
      .replace(
        "#include <common>",
        `#include <common>\nvarying vec3 vRestPosition;\n${header}`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>\n${body}`,
      )
      .replace(
        "#include <opaque_fragment>",
        `${after}\n#include <opaque_fragment>`,
      );
  };
  material.customProgramCacheKey = () => `skin-${key}`;
  const mesh = new Mesh(peach.mesh.geometry, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 3;
  parent.add(mesh);
  // The peach geometry is shared, so it leaves the group before the group is disposed.
  ctx.onDispose(() => {
    parent.remove(mesh);
    material.dispose();
  });
  return mesh;
}
