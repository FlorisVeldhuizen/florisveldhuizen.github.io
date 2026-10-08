import {
  AdditiveBlending,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
  Vector4,
} from "three";
import { coarseShell, rand, smoother, tone } from "./fractal-kit";

const SCAN_VERTEX = `
  uniform vec4 uBounds;
  uniform float uPuff;
  varying vec3 vLocal;
  varying vec3 vNormalV;
  varying vec3 vView;
  void main() {
    vLocal = (position - uBounds.xyz) / uBounds.w;
    vec4 view = modelViewMatrix * vec4(position + normal * uPuff * uBounds.w, 1.0);
    vView = -view.xyz;
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * view;
  }
`;

const SCAN_FRAGMENT = `
  uniform float uScan;
  uniform float uOpacity;
  varying vec3 vLocal;
  varying vec3 vNormalV;
  varying vec3 vView;
  float wire(float v, float w) {
    float d = abs(fract(v) - 0.5);
    return smoothstep(0.5 - w - fwidth(v), 0.5 - w, d);
  }
  void main() {
    float rim = 1.0 - abs(dot(normalize(vNormalV), normalize(vView)));
    float lat = wire(vLocal.y * 16.0, 0.03);
    float lon = wire(atan(vLocal.z, vLocal.x) / 6.2831853 * 32.0, 0.03);
    float lines = max(lat, lon);
    float d = vLocal.y - uScan;
    float beam = exp(-d * d * 6000.0);
    float trail = smoothstep(-0.005, 0.01, d) * exp(-d * 22.0);
    vec3 cyan = vec3(0.45, 0.95, 1.0);
    vec3 pink = vec3(1.0, 0.45, 0.82);
    vec3 col = mix(pink, cyan, smoothstep(0.0, 0.06, d));
    float a = lines * trail * 0.35 * (0.4 + rim * 0.6) + beam * (0.35 + rim * 0.5);
    gl_FragColor = vec4(col * a * uOpacity, 1.0);
  }
`;

const FLOOR_VERTEX = `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const FLOOR_FRAGMENT = `
  uniform float uFade;
  uniform float uScroll;
  varying vec3 vWorld;
  float grid(vec2 p) {
    vec2 g = abs(fract(p - 0.5) - 0.5) / fwidth(p);
    return 1.0 - min(min(g.x, g.y), 1.0);
  }
  void main() {
    vec2 p = vWorld.xz;
    float lines = grid(vec2(p.x, p.y - uScroll) * 0.9);
    float depth = -p.y;
    float far = 1.0 - smoothstep(4.0, 12.0, depth);
    float near = smoothstep(7.0, 2.0, -depth);
    float side = 1.0 - smoothstep(4.5, 9.0, abs(p.x));
    vec3 pink = vec3(1.0, 0.35, 0.78);
    vec3 cyan = vec3(0.3, 0.92, 1.0);
    vec3 col = mix(cyan, pink, smoothstep(1.0, 12.0, depth));
    float a = lines * 0.5 * far * near * side * uFade;
    gl_FragColor = vec4(col * a, 1.0);
  }
`;

const TOP = 0.56;
const LOW = -0.5;

function drift(ctx) {
  const floorMaterial = new ShaderMaterial({
    uniforms: { uFade: { value: 0 }, uScroll: { value: 0 } },
    vertexShader: FLOOR_VERTEX,
    fragmentShader: FLOOR_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    extensions: { derivatives: true },
  });
  const floor = new Mesh(new PlaneGeometry(26, 32), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, -2.15, -6);
  floor.renderOrder = -1;
  ctx.group.add(floor);

  const scanMaterial = new ShaderMaterial({
    uniforms: {
      uBounds: {
        value: ctx.peach.uniforms?.uBounds?.value ?? new Vector4(0, 0, 0, 2),
      },
      uPuff: { value: 0.012 },
      uScan: { value: 2 },
      uOpacity: { value: 0 },
    },
    vertexShader: SCAN_VERTEX,
    fragmentShader: SCAN_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    extensions: { derivatives: true },
  });
  let ghost = null;
  const buildGhost = () => {
    if (ghost || !ctx.peach.mesh) return;
    ghost = new Mesh(coarseShell(ctx.peach.mesh.geometry, 36), scanMaterial);
    ghost.matrixAutoUpdate = false;
    ghost.frustumCulled = false;
    ghost.renderOrder = 18;
    ctx.group.add(ghost);
    ctx.warm();
  };
  buildGhost();
  if (!ghost) ctx.warm();

  const probe = new Vector3();
  let scroll = 0;
  let fade = 0;
  let timer = 1.5;
  let scan = -1;
  const sweep = () => {
    if (scan >= 0 || !ctx.live || !ghost) return;
    scan = 0;
    tone(ctx, { hz: 392, to: 784, length: 2.2, volume: 0.005, attack: 0.5 });
  };
  const land = () => {
    const centre = ctx.center();
    const hit = ctx.hitFrom(
      probe.set(centre.x + rand(-0.6, 0.6), centre.y - 3, centre.z + 1.2),
    );
    if (hit) ctx.touch(hit, { jiggle: 0.06, radius: 0.8, lift: 0.35 });
    [293.66, 440, 587.33].forEach((hz, n) =>
      tone(ctx, {
        hz,
        type: "triangle",
        length: 0.9,
        volume: 0.01,
        attack: 0.02,
        at: n * 0.05,
        cutoff: 1600,
      }),
    );
  };

  return {
    update(dt) {
      buildGhost();
      const level = ctx.level();
      fade = Math.min(1, fade + dt / 2.5);
      const f = smoother(fade);
      timer -= dt;
      if (timer <= 0) {
        timer = rand(8, 12) / (1 + level * 1.5);
        sweep();
      }
      let scanY = 2;
      if (scan >= 0) {
        scan += dt / 2.2;
        scanY = TOP + (LOW - TOP) * smoother(scan);
        if (scan >= 1) {
          scan = -1;
          land();
        }
      }
      scroll = (scroll + dt * 0.22 * ctx.still) % 1000;
      floorMaterial.uniforms.uFade.value = f * (0.3 + level * 0.12);
      floorMaterial.uniforms.uScroll.value = scroll;
      if (ghost) {
        ctx.peach.mesh.updateWorldMatrix(true, false);
        ghost.matrix.copy(ctx.peach.mesh.matrixWorld);
      }
      scanMaterial.uniforms.uScan.value = scanY;
      scanMaterial.uniforms.uOpacity.value =
        f * (scan >= 0 ? Math.min(1, Math.sin(Math.PI * scan) * 3) : 0);
    },
    dispose() {},
  };
}

export default {
  id: "exe",
  create: drift,
};
