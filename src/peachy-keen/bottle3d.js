import {
  Group,
  Mesh,
  LatheGeometry,
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

const WINE = "#8a2f45";
const LABEL_FONTS = [
  "italic 600 118px Fraunces",
  "500 34px Fraunces",
  "italic 400 30px Fraunces",
];

function paperNoise(canvas, count) {
  const c = canvas.getContext("2d");
  const { width, height } = canvas;
  for (let i = 0; i < count; i += 1) {
    c.fillStyle =
      Math.random() < 0.5
        ? "rgba(120, 70, 40, 0.07)"
        : "rgba(255, 255, 255, 0.1)";
    c.fillRect(
      Math.random() * width,
      Math.random() * height,
      1 + Math.random() * 2,
      1 + Math.random() * 2,
    );
  }
}

function drawPeach(canvas, x, y, size) {
  const c = canvas.getContext("2d");
  const skin = c.createRadialGradient(
    x - size * 0.4,
    y - size * 0.4,
    size * 0.1,
    x,
    y,
    size * 1.4,
  );
  skin.addColorStop(0, "#ffc39a");
  skin.addColorStop(0.55, "#f0876a");
  skin.addColorStop(1, "#c4475a");
  c.fillStyle = skin;
  c.beginPath();
  c.arc(x - size * 0.42, y, size * 0.72, 0, Math.PI * 2);
  c.arc(x + size * 0.42, y, size * 0.72, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = "rgba(138, 47, 69, 0.55)";
  c.lineWidth = size * 0.07;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(x, y - size * 0.45);
  c.quadraticCurveTo(x + size * 0.06, y + size * 0.1, x, y + size * 0.62);
  c.stroke();
  c.fillStyle = "#6f8a3c";
  c.beginPath();
  c.moveTo(x + size * 0.05, y - size * 0.55);
  c.quadraticCurveTo(
    x + size * 0.3,
    y - size * 1.25,
    x + size * 0.95,
    y - size * 1.05,
  );
  c.quadraticCurveTo(
    x + size * 0.6,
    y - size * 0.5,
    x + size * 0.05,
    y - size * 0.55,
  );
  c.fill();
}

function drawLabel(canvas) {
  const c = canvas.getContext("2d");
  const { width, height } = canvas;
  const mid = width / 2;
  const paper = c.createLinearGradient(0, 0, 0, height);
  paper.addColorStop(0, "#f8eadc");
  paper.addColorStop(1, "#ecd4bf");
  c.fillStyle = paper;
  c.fillRect(0, 0, width, height);
  paperNoise(canvas, 5000);

  c.fillStyle = WINE;
  c.fillRect(0, 0, width, 20);
  c.fillRect(0, height - 20, width, 20);
  c.strokeStyle = "#c9964f";
  c.lineWidth = 3;
  [30, height - 30].forEach((y) => {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(width, y);
    c.stroke();
  });

  c.strokeStyle = WINE;
  c.lineWidth = 3;
  c.beginPath();
  c.roundRect(mid - 250, 52, 500, height - 104, 60);
  c.stroke();
  c.lineWidth = 1.5;
  c.beginPath();
  c.roundRect(mid - 236, 66, 472, height - 132, 48);
  c.stroke();

  drawPeach(canvas, mid, 136, 40);

  c.fillStyle = WINE;
  c.textAlign = "center";
  c.textBaseline = "alphabetic";
  c.font = `${LABEL_FONTS[0]}, Georgia, serif`;
  c.fillText("Peach", mid, 298);
  c.fillRect(mid - 150, 330, 110, 2);
  c.fillRect(mid + 40, 330, 110, 2);
  c.beginPath();
  c.moveTo(mid, 321);
  c.lineTo(mid + 10, 331);
  c.lineTo(mid, 341);
  c.lineTo(mid - 10, 331);
  c.fill();
  c.font = `${LABEL_FONTS[1]}, Georgia, serif`;
  c.letterSpacing = "10px";
  c.fillText("MASSAGE OIL", mid + 5, 390);
  c.font = "500 20px Fraunces, Georgia, serif";
  c.letterSpacing = "5px";
  c.globalAlpha = 0.7;
  c.fillText("WARMING · Nº 69 · 100 ML", mid + 3, 426);
  c.globalAlpha = 1;
  c.letterSpacing = "0px";

  c.font = `${LABEL_FONTS[2]}, Georgia, serif`;
  c.globalAlpha = 0.8;
  c.textAlign = "right";
  [
    "Sweet almond",
    "Apricot kernel",
    "Warm vanilla",
    "& a little mischief",
  ].forEach((line, i) => c.fillText(line, mid - 310, 170 + i * 52));
  c.textAlign = "left";
  ["Apply generously.", "Rub in slow", "circles.", "Repeat."].forEach(
    (line, i) => c.fillText(line, mid + 310, 170 + i * 52),
  );
  c.globalAlpha = 1;
}

function labelTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1840;
  canvas.height = 512;
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  const draw = () => {
    drawLabel(canvas);
    texture.needsUpdate = true;
  };
  draw();
  if (document.fonts)
    Promise.all(LABEL_FONTS.map((font) => document.fonts.load(font))).then(
      draw,
    );
  return texture;
}

function corkTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const c = canvas.getContext("2d");
  c.fillStyle = "#c99b6a";
  c.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i += 1) {
    const dark = Math.random() < 0.6;
    c.fillStyle = dark
      ? `rgba(90, 50, 25, ${0.15 + Math.random() * 0.35})`
      : "rgba(255, 225, 185, 0.35)";
    c.beginPath();
    c.ellipse(
      Math.random() * 256,
      Math.random() * 256,
      0.6 + Math.random() * 2.4,
      0.6 + Math.random() * 1.4,
      Math.random() * Math.PI,
      0,
      Math.PI * 2,
    );
    c.fill();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

const lathe = (points, segments) =>
  new LatheGeometry(
    points.map(([r, y]) => new Vector2(Math.max(0, r), y)),
    segments,
  );

function roundProfile(shrink = 0) {
  const r = 0.212 - shrink;
  const bottom = -0.5 + shrink * 1.6;
  const neck = 0.064 - shrink * 0.4;
  return [
    [0, bottom + 0.012],
    [0.1, bottom],
    ...arc(r - 0.05, bottom + 0.05, 0.05, -90, 0, 8).slice(1),
    [r + 0.002, -0.2],
    [r, 0.07],
    ...cubic(
      [r, 0.07],
      [r, 0.2],
      [neck + 0.03, 0.205],
      [neck + 0.004, 0.28],
      14,
    ),
    [neck, 0.3],
    [neck, 0.37 - shrink],
  ];
}

const collar = (neck) => [
  [neck + 0.01, 0.366],
  [neck + 0.014, 0.376],
  [neck + 0.01, 0.386],
  [neck, 0.39],
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

const APOTHECARY = {
  spout: 0.43,
  build() {
    const outer = [
      ...roundProfile(),
      ...collar(0.064),
      [0.064, 0.4],
      [0.082, 0.406],
      [0.084, 0.424],
      [0.072, 0.43],
      [0.05, 0.428],
      [0.048, 0.36],
    ];
    const body = new Mesh(lathe(outer, 72), glass(0xfff4ec));
    body.material.side = DoubleSide;
    const liquid = new Mesh(
      lathe([...roundProfile(0.022), [0, 0.35]], 64),
      oil(0xe8922c, 0x6a2608),
    );
    const cork = corkTexture();
    const stopper = new Mesh(
      lathe(
        [
          [0, -0.075],
          [0.044, -0.075],
          [0.05, -0.068],
          [0.056, 0.02],
          [0.074, 0.028],
          [0.08, 0.04],
          [0.078, 0.062],
          [0.07, 0.07],
          [0, 0.072],
        ],
        40,
      ),
      new MeshPhysicalMaterial({
        map: cork,
        bumpMap: cork,
        bumpScale: 2,
        roughness: 0.9,
        sheen: 0.4,
        sheenColor: new Color(0xffe0c0),
      }),
    );
    stopper.position.y = 0.43;
    const label = new Mesh(
      new CylinderGeometry(0.2145, 0.2145, 0.27, 96, 1, true, -2.2, 4.4),
      new MeshPhysicalMaterial({
        map: labelTexture(),
        roughness: 0.7,
        sheen: 0.35,
        sheenColor: new Color(0xfff2e6),
      }),
    );
    label.position.y = -0.17;
    const ribbon = new Mesh(
      new CylinderGeometry(0.0685, 0.0685, 0.022, 48, 1, true),
      new MeshPhysicalMaterial({
        color: 0x8a2f45,
        roughness: 0.35,
        sheen: 1,
        sheenColor: new Color(0xff9ab4),
        side: DoubleSide,
      }),
    );
    ribbon.position.y = 0.325;
    body.add(label, ribbon);
    return { body, liquid, stopper, level: 0.02 };
  },
};

const worldCenter = new Vector3();
const normal = new Vector3();

export class BottleModel {
  constructor() {
    this.spec = APOTHECARY;
    this.group = new Group();
    const { body, liquid, stopper, level } = APOTHECARY.build();
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
