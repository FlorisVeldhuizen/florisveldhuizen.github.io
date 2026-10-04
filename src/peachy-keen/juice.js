import {
  InstancedMesh,
  SphereGeometry,
  ShaderMaterial,
  Object3D,
  Vector2,
  Vector3,
  DynamicDrawUsage,
} from "three";

const MAX_PARTICLES = 300;
const RADIUS = 0.05;
const EXPLOSION_FORCE = 8;
const UPWARD_BIAS = 2;
const GRAVITY = 15;
const FADE_START = 1;
const FADE_DURATION = 0.8;

export const JUICE_LAYER = 1;

export function dropletPositionAt(drop, t, target) {
  target.copy(drop.position).addScaledVector(drop.velocity, t);
  target.y -= 0.5 * GRAVITY * t * t;
  return target;
}

const JUICE_VERTEX = `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    mat4 world = modelMatrix;
    #ifdef USE_INSTANCING
      world = modelMatrix * instanceMatrix;
    #endif
    vec4 view = viewMatrix * world * vec4(position, 1.0);
    vNormal = normalize(mat3(viewMatrix) * mat3(world) * normal);
    vView = -view.xyz;
    gl_Position = projectionMatrix * view;
  }
`;

const JUICE_FRAGMENT = `
  uniform sampler2D tBehind;
  uniform vec2 uResolution;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);
    float facing = max(dot(n, v), 0.0);
    vec2 uv = gl_FragCoord.xy / uResolution;
    vec3 juice = vec3(1.0, 0.66, 0.46);
    vec3 behind = texture2D(tBehind, uv - n.xy * 0.02).rgb;
    vec3 col = behind * mix(vec3(1.0), juice, 0.38 + (1.0 - facing) * 0.25);
    col *= 1.0 - pow(1.0 - facing, 3.0) * 0.18;
    float spec = pow(max(dot(n, normalize(vec3(-0.45, 0.6, 0.66))), 0.0), 120.0);
    float caustic = pow(max(dot(n, normalize(vec3(0.35, -0.7, 0.6))), 0.0), 8.0);
    col += spec * 1.2 + caustic * 0.18 * juice + juice * 0.05;
    #ifdef GLOW
      vec3 glow = vec3(1.0, 0.48, 0.16);
      col = mix(col, glow * (0.35 + 0.5 * caustic), 0.55);
      col += glow * pow(1.0 - facing, 2.0) * 0.4 + spec * 1.2;
    #endif
    gl_FragColor = vec4(col, 1.0);
  }
`;

export const juiceMaterial = new ShaderMaterial({
  uniforms: {
    tBehind: { value: null },
    uResolution: { value: new Vector2(1, 1) },
  },
  vertexShader: JUICE_VERTEX,
  fragmentShader: JUICE_FRAGMENT,
});

export const glowingJuiceMaterial = new ShaderMaterial({
  uniforms: {
    tBehind: { value: null },
    uResolution: { value: new Vector2(1, 1) },
  },
  vertexShader: JUICE_VERTEX,
  fragmentShader: JUICE_FRAGMENT,
  defines: { GLOW: "" },
});

export class Juice {
  constructor(scene) {
    this.mesh = new InstancedMesh(
      new SphereGeometry(RADIUS, 12, 8),
      juiceMaterial,
      MAX_PARTICLES,
    );
    this.mesh.layers.set(JUICE_LAYER);
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.particles = [];
    this.splatZ = Infinity;
    this.splatHalf = new Vector2();
    this.onSplat = null;
    this.dummy = new Object3D();
    this.ahead = new Vector3();
    scene.add(this.mesh);
  }

  isActive() {
    return this.particles.length > 0;
  }

  burst(
    mesh,
    {
      force = 1,
      flatten = 1,
      flying = 1,
      shape = null,
      limit = MAX_PARTICLES,
    } = {},
  ) {
    const positions = mesh.geometry.attributes.position;
    const step = Math.max(1, Math.ceil(positions.count / limit));
    const center = new Vector3();
    const jitter = new Vector3();
    this.particles = [];
    for (let i = 0; i < positions.count; i += step) {
      const position = new Vector3()
        .fromBufferAttribute(positions, i)
        .applyMatrix4(mesh.matrixWorld);
      center.add(position);
      this.particles.push({
        position,
        velocity: new Vector3(),
        size: 0.5 + Math.random() ** 2 * 1.4,
        lens: false,
        age: 0,
      });
    }
    center.divideScalar(this.particles.length);

    this.particles.forEach((p) => {
      jitter.set(Math.random(), Math.random(), Math.random()).subScalar(0.5);
      p.velocity
        .copy(p.position)
        .sub(center)
        .normalize()
        .addScaledVector(jitter, 0.5)
        .normalize()
        .multiplyScalar(EXPLOSION_FORCE * force * (0.7 + Math.random() * 0.6));
      p.velocity.y = p.velocity.y * flatten + UPWARD_BIAS * force;
      if (shape) shape(p.velocity);
      if (flatten < 1) {
        p.velocity.x /= flatten ** 0.5;
        p.velocity.z /= flatten ** 0.5;
      }
    });
    if (this.onSplat) {
      const count = Math.round((16 + Math.random() * 8) * flying);
      for (let k = 0; k < count; k += 1) {
        const p =
          this.particles[Math.floor(Math.random() * this.particles.length)];
        p.lens = true;
        p.velocity
          .set(
            (Math.random() * 2 - 1) * this.splatHalf.x * 0.85,
            (Math.random() * 2 - 1) * this.splatHalf.y * 0.85,
            this.splatZ + 0.2,
          )
          .sub(p.position)
          .normalize()
          .multiplyScalar(9 + Math.random() * 6);
      }
    }
    this.mesh.visible = true;
  }

  emit(position, velocity, lens = false) {
    if (this.particles.length >= MAX_PARTICLES) return;
    this.particles.push({
      position: position.clone(),
      velocity: velocity.clone(),
      size: 0.5 + Math.random() ** 2 * 1.2,
      lens,
      age: 0,
    });
    this.mesh.visible = true;
  }

  update(delta) {
    if (this.particles.length === 0) return;
    const drag = Math.exp(-delta * 0.6);
    this.particles = this.particles.filter((p) => {
      if (p.lens && p.position.z > this.splatZ) {
        this.onSplat(p.position, p.velocity);
        return false;
      }
      p.age += delta;
      return p.age < FADE_START + FADE_DURATION;
    });
    if (this.particles.length === 0) {
      this.clear();
      return;
    }
    this.particles.forEach((p, i) => {
      if (!p.lens) p.velocity.y -= GRAVITY * delta;
      p.velocity.x *= drag;
      p.velocity.z *= drag;
      p.position.addScaledVector(p.velocity, delta);
      const stretch = 1 + Math.min(2, p.velocity.length() * 0.12);
      this.dummy.position.copy(p.position);
      this.dummy.lookAt(this.ahead.copy(p.position).add(p.velocity));
      const scale =
        p.age < FADE_START ? 1 : 1 - (p.age - FADE_START) / FADE_DURATION;
      const visible = p.lens ? 0 : scale * p.size;
      this.dummy.scale.set(visible, visible, visible * stretch);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    });
    this.mesh.count = this.particles.length;
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  clear() {
    this.particles.length = 0;
    this.mesh.count = 0;
    this.mesh.visible = false;
  }
}

const DROPLET_CAPACITY = 160;
const DROPLET_LIFE = 0.9;

export class Droplets {
  constructor(scene) {
    this.mesh = new InstancedMesh(
      new SphereGeometry(1, 12, 8),
      juiceMaterial,
      DROPLET_CAPACITY,
    );
    this.mesh.layers.set(JUICE_LAYER);
    this.mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.count = 0;
    this.drops = [];
    this.mesh.visible = false;
    this.dummy = new Object3D();
    this.ahead = new Vector3();
    scene.add(this.mesh);
  }

  spray(point, normal, direction, amount, lift = 1) {
    const start = this.drops.length;
    const count = Math.round(6 + amount * 16);
    for (let i = 0; i < count && this.drops.length < DROPLET_CAPACITY; i += 1) {
      const velocity = normal
        .clone()
        .multiplyScalar((1.5 + Math.random() * 2.5) * lift)
        .addScaledVector(direction, 1.5 + Math.random() * 2.5)
        .add(
          new Vector3(
            Math.random() - 0.5,
            Math.random() - 0.2,
            Math.random() - 0.5,
          ).multiplyScalar(2.5),
        );
      this.drops.push({
        position: point.clone().addScaledVector(normal, 0.05),
        velocity,
        size: 0.012 + Math.random() * 0.028,
        age: Math.random() * 0.1,
      });
    }
    return this.drops.slice(start);
  }

  isActive() {
    return this.drops.length > 0;
  }

  update(delta) {
    this.mesh.visible = this.drops.length > 0;
    if (this.drops.length === 0) return;
    this.drops = this.drops.filter((d) => {
      d.age += delta;
      return d.age < DROPLET_LIFE;
    });
    this.drops.forEach((d, i) => {
      d.velocity.y -= GRAVITY * delta;
      d.position.addScaledVector(d.velocity, delta);
      const t = d.age / DROPLET_LIFE;
      const size = d.size * (t > 0.6 ? 1 - (t - 0.6) / 0.4 : 1);
      const stretch = 1 + Math.min(2.5, d.velocity.length() * 0.25);
      this.dummy.position.copy(d.position);
      this.dummy.lookAt(this.ahead.copy(d.position).add(d.velocity));
      this.dummy.scale.set(size, size, size * stretch);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    });
    this.mesh.count = this.drops.length;
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
