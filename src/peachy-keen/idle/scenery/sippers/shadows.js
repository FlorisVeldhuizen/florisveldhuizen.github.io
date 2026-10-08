/* eslint-disable no-param-reassign, no-continue */
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  InstancedMesh,
  LinearFilter,
  LinearMipmapLinearFilter,
  Matrix4,
  OrthographicCamera,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderTarget,
} from "three";

const NEAR = 1;
const SIZE = 512;
const PEAK = 0.75;
// Turns the shadow a quarter toward the camera so it starts at the butterfly, not off to the side.
const BEND = 0.25;
const MAX = 12;
const BIAS = new Matrix4().set(
  0.5,
  0,
  0,
  0.5,
  0,
  0.5,
  0,
  0.5,
  0,
  0,
  0.5,
  0.5,
  0,
  0,
  0,
  1,
);

const casterVertex = (wingStride) => /* glsl */ `
uniform sampler2D uSolid;
uniform sampler2D uWing;
uniform float uAlpha[${MAX}];
uniform int uRow[${MAX}];
attribute float aPart;
attribute float aWing;
varying float vAlpha;
varying float vBody;
mat4 fetch(sampler2D tex, int x, int row) {
  return mat4(texelFetch(tex, ivec2(x, row), 0), texelFetch(tex, ivec2(x + 1, row), 0), texelFetch(tex, ivec2(x + 2, row), 0), texelFetch(tex, ivec2(x + 3, row), 0));
}
void main() {
  int row = uRow[gl_InstanceID];
  int part = int(aPart + 0.5);
  vec3 world;
  if (aWing > 0.5) {
    int x = part * ${wingStride};
    vec4 p0 = texelFetch(uWing, ivec2(x + 4, row), 0);
    vec3 local = position;
    float spanAt = clamp(local.x / p0.z, 0.0, 1.0);
    local.y += p0.x * spanAt * spanAt * p0.z + p0.y * local.z * spanAt;
    world = (fetch(uWing, x, row) * vec4(local, 1.0)).xyz;
  } else {
    world = (fetch(uSolid, part * 4, row) * vec4(position, 1.0)).xyz;
  }
  vAlpha = uAlpha[gl_InstanceID];
  vBody = aWing > 0.5 ? 0.0 : vAlpha;
  gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
}`;

const casterFragment = /* glsl */ `
varying float vAlpha;
varying float vBody;
void main() {
  gl_FragColor = vec4(1.0, gl_FragCoord.z, vAlpha, vBody);
}`;

const RECEIVER_VERTEX = /* glsl */ `
uniform mat4 uBfsMatrix;
varying vec3 vBfs;`;

const RECEIVER_FRAGMENT = /* glsl */ `
uniform sampler2D uBfsMap;
uniform vec3 uBfsInfo;
varying vec3 vBfs;
const vec3 BFS_WARM = vec3(0.58, 0.32, 0.36);
const vec2 BFS_DISC[12] = vec2[12](
  vec2(-0.326, -0.406), vec2(-0.840, -0.074), vec2(-0.696, 0.457), vec2(-0.203, 0.621),
  vec2(0.962, -0.195), vec2(0.473, -0.480), vec2(0.519, 0.767), vec2(0.185, -0.893),
  vec2(0.507, 0.064), vec2(0.896, 0.412), vec2(-0.322, -0.933), vec2(-0.792, -0.598));
float bfsDisc(float radius) {
  float turn = 6.2831853 * fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  mat2 spin = mat2(cos(turn), sin(turn), -sin(turn), cos(turn)) * (radius * uBfsInfo.z);
  float sum = 0.0;
  for (int i = 0; i < 12; i++) {
    vec4 t = textureLod(uBfsMap, vBfs.xy + spin * BFS_DISC[i], 0.0);
    sum += t.b * smoothstep(-0.05, 0.0, (vBfs.z - t.g / max(t.r, 0.001)) * uBfsInfo.y);
  }
  return sum / 12.0;
}
vec3 bfsShade() {
  if (uBfsInfo.x <= 0.0 || vBfs.x < 0.0 || vBfs.y < 0.0 || vBfs.x > 1.0 || vBfs.y > 1.0) return vec3(1.0);
  vec4 wide = textureLod(uBfsMap, vBfs.xy, 4.5);
  if (wide.r < 0.003) return vec3(1.0);
  float gap = (vBfs.z - wide.g / wide.r) * uBfsInfo.y;
  float high = smoothstep(0.0, 1.5, gap);
  float s = bfsDisc(mix(0.008, 0.14, high)) * mix(1.0, 0.4, high) * (1.0 - smoothstep(1.2, 1.9, gap));
  float body = textureLod(uBfsMap, vBfs.xy, 3.5).a;
  s = max(s, smoothstep(0.0, 0.3, body) * 0.9 * (1.0 - smoothstep(0.02, 0.25, gap)));
  return mix(vec3(1.0), BFS_WARM, s * uBfsInfo.x);
}`;

function casterGeometry(solidGeo, wingGeo) {
  const geos = [solidGeo, wingGeo];
  const count = geos.reduce((s, g) => s + g.attributes.position.count, 0);
  const pos = new Float32Array(count * 3);
  const part = new Float32Array(count);
  const wing = new Float32Array(count);
  const index = [];
  let v = 0;
  geos.forEach((g, n) => {
    const c = g.attributes.position.count;
    pos.set(g.attributes.position.array.subarray(0, c * 3), v * 3);
    part.set(g.attributes.aPart.array.subarray(0, c), v);
    wing.fill(n, v, v + c);
    for (let k = 0; k < g.index.count; k += 1) index.push(g.index.array[k] + v);
    v += c;
  });
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(pos, 3));
  geo.setAttribute("aPart", new BufferAttribute(part, 1));
  geo.setAttribute("aWing", new BufferAttribute(wing, 1));
  geo.setIndex(new BufferAttribute(new Uint32Array(index), 1));
  return geo;
}

function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

let receiver = null;

// Patched once before the game's start-up compile, so the peach never recompiles when butterflies arrive.
export function patchPeach(peach) {
  if (receiver || !peach.material) return;
  const target = new WebGLRenderTarget(SIZE, SIZE, {
    minFilter: LinearMipmapLinearFilter,
    magFilter: LinearFilter,
    generateMipmaps: true,
  });
  const uniforms = {
    uBfsMap: { value: target.texture },
    uBfsMatrix: { value: new Matrix4() },
    uBfsInfo: { value: new Vector3(0, 1, 1) },
  };
  receiver = { target, uniforms };
  const { material } = peach;
  const original = material.onBeforeCompile;
  // Clones of the skin material call this with the shader only; three passes the renderer too.
  material.onBeforeCompile = function patched(shader, withRenderer) {
    original.call(this, shader, withRenderer);
    if (!withRenderer) return;
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${RECEIVER_VERTEX}`)
      .replace(
        "#include <fog_vertex>",
        "vBfs = (uBfsMatrix * modelMatrix * vec4(transformed, 1.0)).xyz;\n#include <fog_vertex>",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${RECEIVER_FRAGMENT}`)
      .replace(
        "#include <opaque_fragment>",
        "outgoingLight *= bfsShade();\n#include <opaque_fragment>",
      );
  };
  material.needsUpdate = true;
}

export function createWingShadows(ctx) {
  const { peach, renderer } = ctx;
  const { key } = ctx.lights;
  patchPeach(peach);
  const { target, uniforms } = receiver;
  const lightMatrix = uniforms.uBfsMatrix.value;
  const casters = new Map();
  const casterScene = new Scene();
  casterScene.matrixWorldAutoUpdate = false;
  const cam = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  const L = new Vector3();
  const C = new Vector3();
  const V = new Vector3();
  const clear = new Color();
  let near = false;

  function drawCasters() {
    const previous = renderer.getRenderTarget();
    const { autoClear } = renderer;
    renderer.autoClear = true;
    renderer.setRenderTarget(target);
    renderer.getClearColor(clear);
    const clearAlpha = renderer.getClearAlpha();
    renderer.setClearColor(0x000000, 0);
    renderer.render(casterScene, cam);
    renderer.setClearColor(clear, clearAlpha);
    renderer.setRenderTarget(previous);
    renderer.autoClear = autoClear;
  }

  function attach(batch) {
    const src = batch.shadowSource;
    if (!src || casters.has(batch)) return;
    const casterUniforms = {
      uSolid: { value: src.solidTex },
      uWing: { value: src.wingTex },
      uAlpha: { value: new Float32Array(MAX) },
      uRow: { value: new Int32Array(MAX) },
    };
    const mat = new ShaderMaterial({
      vertexShader: casterVertex(src.wingStride),
      fragmentShader: casterFragment,
      uniforms: casterUniforms,
      side: DoubleSide,
    });
    const mesh = new InstancedMesh(
      casterGeometry(src.solidGeo, src.wingGeo),
      mat,
      MAX,
    );
    mesh.count = 0;
    mesh.frustumCulled = false;
    mesh.matrixAutoUpdate = false;
    casterScene.add(mesh);
    casters.set(batch, { mesh, uniforms: casterUniforms });
    mesh.count = 1;
    drawCasters();
    mesh.count = 0;
  }

  function fit() {
    const geo = peach.mesh.geometry;
    if (!geo.boundingSphere) geo.computeBoundingSphere();
    const mw = peach.mesh.matrixWorld;
    C.copy(geo.boundingSphere.center).applyMatrix4(mw);
    const r = geo.boundingSphere.radius * mw.getMaxScaleOnAxis() + 0.15;
    L.copy(key.position).sub(key.target.position).normalize();
    V.copy(ctx.camera.position).sub(C).normalize();
    L.lerp(V, BEND).normalize();
    cam.left = -r;
    cam.right = r;
    cam.top = r;
    cam.bottom = -r;
    cam.near = NEAR;
    cam.far = NEAR + r * 2 + 1.5;
    cam.position.copy(C).addScaledVector(L, r + NEAR + 1.5);
    cam.up.set(0, 1, 0);
    cam.lookAt(C);
    cam.updateMatrixWorld();
    cam.updateProjectionMatrix();
    lightMatrix
      .multiplyMatrices(BIAS, cam.projectionMatrix)
      .multiply(cam.matrixWorldInverse);
    uniforms.uBfsInfo.value.y = cam.far - cam.near;
    uniforms.uBfsInfo.value.z = 1 / (2 * r);
  }

  return {
    attach,
    update(items) {
      near = false;
      for (let k = 0; k < items.length; k += 1) {
        const it = items[k];
        if (it.alpha > 0.01 && it.height < 1.1) near = true;
      }
    },
    write(batch, rigs) {
      const c = casters.get(batch);
      if (!c) return;
      const count = Math.min(MAX, rigs.length);
      const alpha = c.uniforms.uAlpha.value;
      const row = c.uniforms.uRow.value;
      let n = 0;
      for (let r = 0; r < count; r += 1) {
        const it = rigs[r].shadow;
        const a = it ? it.alpha * (1 - smoothstep(0.7, 1.1, it.height)) : 0;
        if (a <= 0.004) continue;
        alpha[n] = a;
        row[n] = r;
        n += 1;
      }
      c.mesh.count = n;
    },
    render() {
      const on = near && ctx.live && peach.mesh;
      uniforms.uBfsInfo.value.x = on ? PEAK : 0;
      if (!on) return;
      fit();
      drawCasters();
    },
    dispose() {
      uniforms.uBfsInfo.value.x = 0;
      casters.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      casters.clear();
    },
  };
}
