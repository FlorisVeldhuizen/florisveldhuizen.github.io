import {
  Group,
  Mesh,
  LatheGeometry,
  SphereGeometry,
  CylinderGeometry,
  MeshPhysicalMaterial,
  Vector2,
  Vector3,
  Plane,
  Color,
  DoubleSide,
  CanvasTexture,
  SRGBColorSpace,
  AdditiveBlending,
} from "three";

function arc(cx, cy, radius, from, to, steps) {
  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    points.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)]);
  }
  return points;
}

function cubic(a, b, c, d, steps) {
  const points = [];
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const u = 1 - t;
    points.push([
      u ** 3 * a[0] +
        3 * u * u * t * b[0] +
        3 * u * t * t * c[0] +
        t ** 3 * d[0],
      u ** 3 * a[1] +
        3 * u * u * t * b[1] +
        3 * u * t * t * c[1] +
        t ** 3 * d[1],
    ]);
  }
  return points;
}

function labelTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  const draw = () => {
    const c = canvas.getContext("2d");
    c.fillStyle = "#f3e2d2";
    c.fillRect(0, 0, 1024, 256);
    c.strokeStyle = "#8a2f45";
    c.lineWidth = 3;
    c.strokeRect(340, 26, 344, 204);
    c.lineWidth = 1.5;
    c.strokeRect(352, 38, 320, 180);
    c.fillStyle = "#8a2f45";
    c.textAlign = "center";
    c.font = "italic 600 76px Fraunces, Georgia, serif";
    c.fillText("Peach", 512, 138);
    c.font = "500 22px Fraunces, Georgia, serif";
    c.letterSpacing = "6px";
    c.fillText("MASSAGE OIL", 515, 186);
    texture.needsUpdate = true;
  };
  draw();
  document.fonts?.ready.then(draw);
  return texture;
}

const lathe = (points, segments) =>
  new LatheGeometry(
    points.map(([r, y]) => new Vector2(Math.max(0, r), y)),
    segments,
  );

function vialProfile(shrink = 0) {
  const radius = 0.28 - shrink;
  const neck = 0.05 - shrink * 0.4;
  const body = arc(0, -0.2, radius, -90, 20, 14);
  const [r, y] = body[body.length - 1];
  return [
    ...body,
    ...cubic([r, y], [r * 0.8, 0.05], [neck + 0.01, 0.14], [neck, 0.26], 12),
    [neck, 0.4 - shrink],
  ];
}

function roundProfile(shrink = 0) {
  const r = 0.21 - shrink;
  return [
    [0, -0.5 + shrink],
    [r - 0.04, -0.5 + shrink],
    ...arc(r - 0.04, -0.46 + shrink, 0.04, -90, 0, 5).slice(1),
    [r, 0.12],
    ...cubic(
      [r, 0.12],
      [r, 0.22],
      [0.1, 0.24],
      [0.065 - shrink * 0.4, 0.27],
      10,
    ),
    [0.065 - shrink * 0.4, 0.38 - shrink],
  ];
}

function decanterProfile(shrink = 0) {
  return [
    [0, -0.5 + shrink],
    [0.12 - shrink, -0.5 + shrink],
    [0.26 - shrink, -0.36],
    [0.28 - shrink, -0.2],
    [0.2 - shrink, 0.05],
    [0.07 - shrink * 0.4, 0.18],
    [0.06 - shrink * 0.4, 0.22],
    [0.06 - shrink * 0.4, 0.3 - shrink],
  ];
}

const lip = (neck, top) => [
  [neck, top - 0.03],
  [neck + 0.02, top - 0.025],
  [neck + 0.022, top - 0.005],
  [neck + 0.008, top],
  [0, top],
];

function glass(tint, extra = {}) {
  const rim = new Color(tint);
  const material = new MeshPhysicalMaterial({
    color: 0x000000,
    roughness: 0.02,
    metalness: 0,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    specularIntensity: 1,
    envMapIntensity: 1.3,
    clearcoat: 0.4,
    clearcoatRoughness: 0.03,
    ...extra,
  });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, { uRim: { value: rim } });
    // eslint-disable-next-line no-param-reassign
    shader.fragmentShader = shader.fragmentShader
      .replace("void main() {", "uniform vec3 uRim;\nvoid main() {")
      .replace(
        "#include <opaque_fragment>",
        `#include <opaque_fragment>
        float facing = abs(dot(normalize(vViewPosition), normal));
        gl_FragColor = vec4(outgoingLight + uRim * (0.015 + pow(1.0 - facing, 3.0) * 0.28), 1.0);`,
      );
  };
  return material;
}

function oil(color, glow) {
  return new MeshPhysicalMaterial({
    color: new Color(color),
    roughness: 0.06,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    emissive: new Color(glow),
    emissiveIntensity: 0.5,
    envMapIntensity: 2,
    side: DoubleSide,
    transparent: true,
    opacity: 0.55,
  });
}

export const BOTTLE_STYLES = {
  vial: {
    name: "Vial",
    spout: 0.445,
    build() {
      const outer = [...vialProfile(), ...lip(0.05, 0.445)];
      const body = new Mesh(
        lathe(outer, 72),
        glass(0xffc4dc, {
          iridescence: 0.7,
          iridescenceIOR: 1.35,
          iridescenceThicknessRange: [180, 520],
        }),
      );
      const liquid = new Mesh(
        lathe([...vialProfile(0.03), [0, 0.37]], 64),
        oil(0xf2b04e, 0x7a2a10),
      );
      const stopper = new Group();
      const pearl = new Mesh(
        new SphereGeometry(0.075, 48, 24),
        new MeshPhysicalMaterial({
          color: 0xfff2f6,
          roughness: 0.22,
          sheen: 1,
          sheenColor: new Color(0xffc2d8),
          iridescence: 1,
          iridescenceIOR: 1.6,
          clearcoat: 1,
          envMapIntensity: 1.4,
        }),
      );
      pearl.position.y = 0.52;
      const plug = new Mesh(
        new CylinderGeometry(0.038, 0.034, 0.08, 24),
        pearl.material,
      );
      plug.position.y = 0.44;
      stopper.add(pearl, plug);
      return { body, liquid, stopper, level: -0.08 };
    },
  },
  apothecary: {
    name: "Apothecary",
    spout: 0.43,
    build() {
      const outer = [...roundProfile(), ...lip(0.065, 0.43)];
      const body = new Mesh(lathe(outer, 72), glass(0xfff4ec));
      const liquid = new Mesh(
        lathe([...roundProfile(0.025), [0, 0.35]], 64),
        oil(0xe8922c, 0x6a2608),
      );
      const stopper = new Mesh(
        new CylinderGeometry(0.07, 0.058, 0.13, 32),
        new MeshPhysicalMaterial({
          color: 0xc79a6c,
          roughness: 0.85,
          sheen: 0.4,
          sheenColor: new Color(0xffe0c0),
        }),
      );
      stopper.position.y = 0.46;
      const label = new Mesh(
        new CylinderGeometry(0.2135, 0.2135, 0.24, 72, 1, true),
        new MeshPhysicalMaterial({
          map: labelTexture(),
          roughness: 0.75,
          sheen: 0.3,
          sheenColor: new Color(0xffffff),
        }),
      );
      label.position.y = -0.14;
      label.rotation.y = Math.PI;
      body.add(label);
      return { body, liquid, stopper, level: 0.02 };
    },
  },
  decanter: {
    name: "Decanter",
    spout: 0.34,
    build() {
      const outer = [...decanterProfile(), ...lip(0.06, 0.34)];
      const body = new Mesh(
        lathe(outer, 9),
        glass(0xff8fb0, {
          flatShading: true,
          ior: 1.9,
          attenuationDistance: 1.4,
        }),
      );
      const liquid = new Mesh(
        lathe([...decanterProfile(0.025), [0, 0.27]], 9),
        oil(0xf5b456, 0x7a2a10),
      );
      liquid.material.flatShading = true;
      const stopper = new Mesh(
        lathe(
          [
            [0, 0.3],
            [0.035, 0.31],
            [0.035, 0.35],
            [0.1, 0.44],
            [0.075, 0.53],
            [0, 0.57],
          ],
          8,
        ),
        new MeshPhysicalMaterial({
          color: 0xffa6c0,
          roughness: 0.04,
          flatShading: true,
          clearcoat: 1,
          iridescence: 0.6,
          envMapIntensity: 2.2,
        }),
      );
      return { body, liquid, stopper, level: -0.12 };
    },
  },
};

const worldCenter = new Vector3();
const normal = new Vector3();

export class BottleModel {
  constructor(style = "vial") {
    const spec = BOTTLE_STYLES[style] || BOTTLE_STYLES.vial;
    this.spec = spec;
    this.group = new Group();
    const { body, liquid, stopper, level } = spec.build();
    this.body = body;
    this.liquid = liquid;
    this.stopper = stopper;
    this.level = level;
    this.fill = 1;
    this.surface = new Plane(new Vector3(0, -1, 0), 0);
    liquid.material.clippingPlanes = [this.surface];
    liquid.renderOrder = 0;
    body.renderOrder = 1;
    this.group.add(liquid, body, stopper);
  }

  updateLiquid(slosh = 0) {
    this.group.updateMatrixWorld();
    this.group.getWorldPosition(worldCenter);
    const scale = this.group.getWorldScale(new Vector3()).y;
    const up = Math.cos(this.group.rotation.z);
    const height = (this.level - (1 - this.fill) * 0.3) * up;
    worldCenter.y += height * scale;
    this.surface.setFromNormalAndCoplanarPoint(
      normal.set(Math.sin(slosh) * 0.6, -1, 0).normalize(),
      worldCenter,
    );
  }

  spoutWorld(target) {
    return this.group.localToWorld(target.set(0, this.spec.spout, 0));
  }
}
