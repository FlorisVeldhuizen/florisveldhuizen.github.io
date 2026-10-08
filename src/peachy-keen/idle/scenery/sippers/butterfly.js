/* eslint-disable no-param-reassign */
import {
  DoubleSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  Group,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  RepeatWrapping,
  SRGBColorSpace,
  Shape,
  TubeGeometry,
  Vector3,
} from "three";
import { canvas, gloss, mesh, once } from "./parts";
import { sparkle } from "./sounds";
import paintMorpho from "./morpho-art";
import makeBatch from "./batch";

const OUTLINE = 96;
const RINGS = 7;
const rand = (a, b) => a + Math.random() * (b - a);

const FORMS = {
  morpho: {
    fore: { span: 0.3, back: 0.09, front: 0.16, root: [0.03, 0.5] },
    hind: { span: 0.25, back: 0.22, front: 0.03, root: [0.03, 0.86] },
    foreEdge: [
      [0.02, 0.6],
      [0.3, 0.84],
      [0.62, 0.97],
      [0.88, 1.0],
      [0.985, 0.93],
      [0.95, 0.74],
      [0.91, 0.52],
      [0.86, 0.3],
      [0.72, 0.1],
      [0.5, 0.02],
      [0.26, 0.12],
      [0.06, 0.36],
    ],
    hindEdge: [
      [0.03, 0.96],
      [0.38, 1.0],
      [0.72, 0.95],
      [0.92, 0.8],
      [1.0, 0.56],
      [0.95, 0.32],
      [0.82, 0.13],
      [0.6, 0.02],
      [0.36, 0.04],
      [0.16, 0.22],
      [0.03, 0.56],
    ],
    scallop: { hind: 0.022 },
  },
};

const LOOKS = {
  morpho: {
    form: "morpho",
    irid: 1,
    range: [360, 560],
    sheen: 0x6ab8ff,
    fur: 0x10121c,
    struct: [0.04, 0.3, 1.0],
  },
  sunset: {
    form: "morpho",
    irid: 0.6,
    range: [480, 700],
    sheen: 0xffb0c8,
    fur: 0x1c1014,
    struct: [1.0, 0.42, 0.55],
  },
};

function smoothOutline(pts, count = 120, scallop = 0, root = [0, 0.5]) {
  const shape = new Shape();
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(pts[pts.length - 1], pts[0]);
  shape.moveTo(start[0], start[1]);
  pts.forEach((a, n) => {
    const m = mid(a, pts[(n + 1) % pts.length]);
    shape.quadraticCurveTo(a[0], a[1], m[0], m[1]);
  });
  const edge = shape.getSpacedPoints(count).slice(0, count);
  if (scallop)
    edge.forEach((p, n) => {
      const k =
        1 +
        scallop *
          Math.max(0, Math.cos(n * 0.62)) *
          Math.min(1, Math.max(0, (p.x - 0.35) * 3));
      p.set(root[0] + (p.x - root[0]) * k, root[1] + (p.y - root[1]) * k);
    });
  return edge;
}

function wingGeometry(box, outline, scallop = 0) {
  const edge = smoothOutline(outline, OUTLINE, scallop, box.root);
  const [ru, rf] = box.root;
  const rings = RINGS;
  const pos = [];
  const uv = [];
  const index = [];
  const put = (u, f) => {
    pos.push((u - ru) * box.span, 0, (f - rf) * (box.back + box.front));
    uv.push(u, f);
  };
  put(ru, rf);
  edge.forEach((p) => {
    for (let k = 1; k <= rings; k += 1) {
      const t = (k / rings) ** 0.85;
      put(ru + (p.x - ru) * t, rf + (p.y - rf) * t);
    }
  });
  const at = (i, k) => (k === 0 ? 0 : 1 + (i % edge.length) * rings + (k - 1));
  for (let i = 0; i < edge.length; i += 1)
    for (let k = 0; k < rings; k += 1) {
      if (k === 0) index.push(0, at(i + 1, 1), at(i, 1));
      else
        index.push(
          at(i, k),
          at(i + 1, k),
          at(i, k + 1),
          at(i + 1, k),
          at(i + 1, k + 1),
          at(i, k + 1),
        );
    }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
  geo.setAttribute("uv", new BufferAttribute(new Float32Array(uv), 2));
  geo.setIndex(index);
  geo.computeVertexNormals();
  if (geo.attributes.normal.getY(0) < 0) {
    const ix = geo.index.array;
    for (let n = 0; n < ix.length; n += 3)
      [ix[n + 1], ix[n + 2]] = [ix[n + 2], ix[n + 1]];
    geo.computeVertexNormals();
  }
  return geo;
}

function paint(look, part, side) {
  const form = FORMS[LOOKS[look].form];
  const box = form[part];
  const edge = smoothOutline(
    form[`${part}Edge`],
    120,
    form.scallop?.[part] ?? 0,
    box.root,
  );
  const { root } = box;
  return paintMorpho(
    side === "top" ? 512 : 256,
    edge,
    root,
    part === "fore",
    look === "sunset",
    side,
    0,
  );
}

const ATLAS = {
  top: { w: 256, h: 256, fore: [0, 0, 256, 128], hind: [0, 128, 256, 128] },
  under: { w: 192, h: 96, fore: [0, 0, 96, 96], hind: [96, 0, 96, 96] },
};

function edgeAlpha(g, [x0, y0, w, h], outline) {
  const img = g.getImageData(x0, y0, w, h);
  const d = img.data;
  const pts = outline.map((p) => [p.x, p.y]);
  const STEP = 4;
  const lw = Math.ceil(w / STEP) + 1;
  const lh = Math.ceil(h / STEP) + 1;
  const low = new Float32Array(lw * lh);
  for (let ly = 0; ly < lh; ly += 1)
    for (let lx = 0; lx < lw; lx += 1) {
      const u = (lx * STEP + 0.5) / w;
      const f = 1 - (ly * STEP + 0.5) / h;
      let best = 1;
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i, i += 1) {
        const [ax, ay] = pts[j];
        const [bx, by] = pts[i];
        const dx = bx - ax;
        const dy = by - ay;
        const t = Math.max(
          0,
          Math.min(
            1,
            ((u - ax) * dx + (f - ay) * dy) / (dx * dx + dy * dy || 1),
          ),
        );
        best = Math.min(best, Math.hypot(u - ax - dx * t, f - ay - dy * t));
        if (ay > f !== by > f && u < ax + ((f - ay) * dx) / dy)
          inside = !inside;
      }
      // Signed so the interpolation stays linear across the outline.
      low[ly * lw + lx] = Math.min(2, best / 0.035) * (inside ? 1 : -1);
    }
  for (let py = 0; py < h; py += 1) {
    const gy = py / STEP;
    const y = Math.min(lh - 2, Math.floor(gy));
    const ty = gy - y;
    for (let px = 0; px < w; px += 1) {
      const gx = px / STEP;
      const x = Math.min(lw - 2, Math.floor(gx));
      const tx = gx - x;
      const k = y * lw + x;
      const top = low[k] + (low[k + 1] - low[k]) * tx;
      const bottom = low[k + lw] + (low[k + lw + 1] - low[k + lw]) * tx;
      d[(py * w + px) * 4 + 3] = Math.round(
        255 * (0.5 + 0.5 * Math.min(1, Math.abs(top + (bottom - top) * ty))),
      );
    }
  }
  g.putImageData(img, x0, y0);
}

function region(texture, side, part, jitter) {
  const spec = ATLAS[side];
  const [x, y, w, h] = spec[part];
  const t = texture.clone();
  t.repeat.set(w / spec.w, h / spec.h);
  t.offset.set(x / spec.w + jitter, 1 - (y + h) / spec.h - jitter * 0.6);
  t.needsUpdate = true;
  return t;
}

function* atlasSteps(look, side, out) {
  const spec = ATLAS[side];
  const form = FORMS[LOOKS[look].form];
  const c = document.createElement("canvas");
  c.width = spec.w;
  c.height = spec.h;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.imageSmoothingQuality = "high";
  const parts = ["fore", "hind"];
  for (let k = 0; k < parts.length; k += 1) {
    const part = parts[k];
    const big = paint(look, part, side);
    const [x, y, w, h] = spec[part];
    g.drawImage(big.image, x, y, w, h);
    big.dispose();
    yield;
    if (side === "top") {
      edgeAlpha(
        g,
        spec[part],
        smoothOutline(
          form[`${part}Edge`],
          120,
          form.scallop?.[part] ?? 0,
          form[part].root,
        ),
      );
      yield;
    }
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  out[side] = t;
}

const LOOK_TEXTURES = new Map();

export function* bakeLook(lookName) {
  if (LOOK_TEXTURES.has(lookName)) return;
  const t = {};
  yield* atlasSteps(lookName, "top", t);
  yield* atlasSteps(lookName, "under", t);
  ["fore", "hind"].forEach((part) =>
    ["top", "under"].forEach((side) =>
      [false, true].forEach((left) => {
        t[`${part}-${side}${left ? "-L" : ""}`] = region(
          t[side],
          side,
          part,
          left ? 0.003 : 0,
        );
      }),
    ),
  );
  t.dispose = () =>
    Object.values(t).forEach((x) => x?.isTexture && x.dispose());
  if (LOOK_TEXTURES.has(lookName)) t.dispose();
  else LOOK_TEXTURES.set(lookName, t);
}

function lookTextures(lookName) {
  const steps = bakeLook(lookName);
  while (!steps.next().done);
  return LOOK_TEXTURES.get(lookName);
}

function wingMaterial(look, tex, bones, glsl) {
  const m = new MeshPhysicalMaterial({
    roughness: 0.55,
    iridescence: look.irid,
    iridescenceIOR: 1.8,
    iridescenceThicknessRange: look.range,
    side: DoubleSide,
  });
  const uniforms = {
    uBones: { value: bones },
    uTop: { value: tex.top },
    uUnder: { value: tex.under },
    uStruct: { value: new Color(...look.struct) },
  };
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>\nattribute float aPart;\nattribute vec2 aWingUv;\nvarying vec2 vWingUv;\nvarying vec4 vTopR;\nvarying vec4 vUnderR;\nvarying vec2 vRoot;\nvarying float vFill;\n${glsl}`,
      )
      .replace(
        "#include <beginnormal_vertex>",
        "mat4 boneM = boneOf(aPart);\nvec4 p0 = paramOf(aPart, 0);\nvec3 objectNormal = normalize(mat3(boneM) * normal);\nvMirror = determinant(mat3(boneM)) < 0.0 ? 1.0 : 0.0;\nvTopR = paramOf(aPart, 1);\nvUnderR = paramOf(aPart, 2);\nvRoot = paramOf(aPart, 3).xy;\nvFill = p0.w;\nvWingUv = aWingUv;",
      )
      .replace(
        "#include <begin_vertex>",
        "vec3 local = position;\nfloat spanAt = clamp(local.x / p0.z, 0.0, 1.0);\nlocal.y += p0.x * spanAt * spanAt * p0.z + p0.y * local.z * spanAt;\nvec3 transformed = (boneM * vec4(local, 1.0)).xyz;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform sampler2D uTop;\nuniform sampler2D uUnder;\nuniform vec3 uStruct;\nvarying vec2 vWingUv;\nvarying vec4 vTopR;\nvarying vec4 vUnderR;\nvarying vec2 vRoot;\nvarying float vFill;\nvarying float vMirror;",
      )
      .replace(
        "#include <map_fragment>",
        "bool topFace = gl_FrontFacing != (vMirror > 0.5);\nfloat faceTop = topFace ? 1.0 : 0.0;\nvec4 wingTexel = topFace ? texture2D(uTop, vWingUv * vTopR.zw + vTopR.xy) : texture2D(uUnder, vWingUv * vUnderR.zw + vUnderR.xy);\ndiffuseColor *= wingTexel;",
      )
      .replace(
        "#include <normal_fragment_begin>",
        "#include <normal_fragment_begin>\nif (vMirror > 0.5) normal = -normal;",
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float fringeOn = mix(0.6, 1.0, faceTop);
        float facing = clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0);
        vec2 rel = vWingUv - vRoot;
        float rr = length(rel) * 210.0;
        float aa = atan(rel.y, rel.x) * 80.0 + floor(rr) * 1.7;
        float scaleN = (sin(rr * 6.2831) * 0.5 + 0.5) * (sin(aa) * 0.5 + 0.5);
        float fade = clamp(1.0 - fwidth(rr) * 1.4, 0.0, 1.0);
        diffuseColor.rgb *= 1.0 + (scaleN - 0.3) * 0.14 * fade;
        float edgeD = clamp((diffuseColor.a - 0.5) * 2.0, 0.0, 1.0);
        float ang = atan(rel.y, rel.x);
        float fringeBand = (1.0 - smoothstep(0.0, 0.16, edgeD)) * fringeOn * faceTop;
        float hairs = 0.55 + 0.45 * sin(ang * 520.0);
        vec3 fringeCol = mix(vec3(0.07, 0.06, 0.07), vec3(0.82, 0.82, 0.84), step(0.5, fract(ang * 22.0)));
        diffuseColor.rgb = mix(diffuseColor.rgb, fringeCol, fringeBand * hairs * 0.6);
        float dust = fract(sin(dot(floor(vWingUv * 420.0), vec2(12.9898, 78.233))) * 43758.5453);
        diffuseColor.rgb *= 1.0 - step(0.93, dust) * 0.25 * fade * fringeOn;
        diffuseColor.a = 1.0;
        float structural = smoothstep(0.08, 0.35, max(diffuseColor.b, diffuseColor.r) - min(diffuseColor.g * 0.6, diffuseColor.b));
        totalEmissiveRadiance += uStruct * faceTop * structural * pow(facing, 1.6) * 0.22 * (1.0 + vFill * 0.6);
        totalEmissiveRadiance += diffuseColor.rgb * (pow(1.0 - facing, 2.5) * 0.05 + mix(0.2, 0.04, faceTop));
        if (length(uStruct) > 0.0 && topFace) diffuseColor.rgb *= mix(0.2, 1.0, smoothstep(0.0, 0.45, facing));`,
      )
      .replace(
        "#include <lights_physical_fragment>",
        "#include <lights_physical_fragment>\n#ifdef USE_IRIDESCENCE\nmaterial.iridescence *= mix(1.0, structural, step(0.001, length(uStruct))) * mix(0.4, 1.0, faceTop);\n#endif",
      );
  };
  m.customProgramCacheKey = () => "sipper-batch-wing";
  return m;
}

const MORPHO = {
  normal: "morpho",
  special: "sunset",
  flap: [4.5, 6.5],
  glide: [1.8, 3],
  amp: 1.12,
  glideAngle: 0.18,
  bodyK: [1.25, 0.88],
};

function build(shared, special) {
  const variant = MORPHO;
  const lookName = special ? variant.special : variant.normal;
  const look = LOOKS[lookName];
  const form = FORMS[look.form];
  const tex = lookTextures(lookName);
  once(shared, `bf-gpu-${lookName}`, () => ({ dispose: tex.dispose }));
  const geos = once(shared, `bf-geo-${look.form}`, () => ({
    fore: wingGeometry(form.fore, form.foreEdge, form.scallop?.fore ?? 0),
    hind: wingGeometry(form.hind, form.hindEdge, form.scallop?.hind ?? 0),
    dispose() {
      this.fore.dispose();
      this.hind.dispose();
    },
  }));
  const wingPair = (part, parent, left, stand) => {
    const bend = {
      uBend: { value: 0 },
      uTwist: { value: 0 },
      uSpan: { value: form[part].span },
    };
    const fill = { value: 0 };
    const L = left ? "-L" : "";
    const area = (t) => [t.offset.x, t.offset.y, t.repeat.x, t.repeat.y];
    const topMesh = mesh(geos[part], stand, parent);
    topMesh.userData.wingTop = {
      bend,
      fill,
      top: area(tex[`${part}-top${L}`]),
      under: area(tex[`${part}-under${L}`]),
      root: form[part].root,
    };
    return { bend, fill };
  };

  const fur = new MeshPhysicalMaterial({
    color: look.fur,
    roughness: 0.9,
    sheen: 1,
    sheenColor: new Color(look.sheen),
    sheenRoughness: 0.6,
    emissive: new Color(0x3a70ff),
    emissiveIntensity: 0,
  });
  const furShell = once(shared, `bf-furshell-${lookName}`, () => {
    const hair = canvas(64, 64, (g, w, h) => {
      g.fillStyle = "#000";
      g.fillRect(0, 0, w, h);
      for (let k = 0; k < 900; k += 1) {
        const v = 120 + Math.floor(Math.random() * 135);
        g.fillStyle = `rgb(${v},${v},${v})`;
        g.fillRect(Math.random() * w, Math.random() * h, 1, 1);
      }
    });
    hair.wrapS = RepeatWrapping;
    hair.wrapT = RepeatWrapping;
    hair.repeat.set(3, 3);
    const mats = [0.35, 0.6, 0.85].map((cut) => {
      const m = new MeshStandardMaterial({
        color: look.fur,
        alphaMap: hair,
        alphaTest: cut,
        roughness: 1,
        transparent: false,
      });
      m.userData.keep = true;
      return m;
    });
    return { mats, dispose: () => [hair, ...mats].forEach((x) => x.dispose()) };
  });
  const eye = gloss(0x08060a, { roughness: 0.06 });
  const dark = gloss(0x140c10, { roughness: 0.4 });
  const [thick, long] = variant.bodyK;

  const root = new Group();
  const body = new Group();
  root.add(body);
  const thorax = mesh(
    shared.sphere,
    fur,
    body,
    [0, 0, 0.016],
    [0.0085 * thick, 0.0085 * thick, 0.017],
  );
  furShell.mats.forEach((m, k) => {
    const shell = mesh(
      shared.lowSphere,
      m,
      body,
      [0, 0, 0.016],
      [
        0.0085 * thick + 0.0012 * (k + 1),
        0.0085 * thick + 0.0012 * (k + 1),
        0.017 + 0.0012 * (k + 1),
      ],
    );
    shell.userData.shellCut = m.alphaTest;
  });
  const segments = [];
  let seg = new Group();
  seg.position.set(0, -0.001, 0.0);
  body.add(seg);
  for (let k = 0; k < 7; k += 1) {
    const r = 0.0058 * thick * (1 - k * 0.075);
    const len = 0.0105 * long;
    const m = mesh(
      shared.lowSphere,
      fur,
      seg,
      [0, 0, -len * 0.55],
      [r, r, len * 0.62],
    );
    m.userData.dynamic = true;
    segments.push({ group: seg, mesh: m, r, len });
    const next = new Group();
    next.position.z = -len;
    seg.add(next);
    seg = next;
  }
  const head = new Group();
  head.position.set(0, 0.001, 0.036);
  body.add(head);
  mesh(shared.lowSphere, fur, head, [0, 0, 0], [0.0056, 0.0054, 0.0056]);
  [1, -1].forEach((s) =>
    mesh(
      shared.lowSphere,
      eye,
      head,
      [s * 0.0043, 0.0012, 0.0022],
      [0.0034, 0.004, 0.0038],
    ),
  );
  const antenna = once(
    shared,
    "bf-antenna",
    () =>
      new TubeGeometry(
        new CatmullRomCurve3([
          new Vector3(0, 0, 0),
          new Vector3(0.007, 0.022, 0.025),
          new Vector3(0.015, 0.035, 0.062),
        ]),
        16,
        0.0006,
        4,
      ),
  );
  const antennae = [1, -1].map((s) => {
    const a = new Group();
    a.position.set(s * 0.002, 0.0045, 0.003);
    a.scale.x = s;
    head.add(a);
    mesh(antenna, dark, a);
    mesh(
      shared.lowSphere,
      dark,
      a,
      [0.015, 0.035, 0.062],
      [0.0016, 0.0016, 0.0042],
    );
    return {
      group: a,
      twitch: 0,
      twitchV: 0,
      phase: Math.random() * 6,
      rate: rand(0.8, 1.4),
    };
  });
  const proboscis = [];
  let link = new Group();
  link.position.set(0, -0.0036, 0.0036);
  head.add(link);
  for (let k = 0; k < 12; k += 1) {
    mesh(shared.rod, dark, link, [0, -0.0018, 0], [0.0005, 0.0036, 0.0005]);
    proboscis.push(link);
    const next = new Group();
    next.position.y = -0.0036;
    link.add(next);
    link = next;
  }
  const legs = [];
  [1, -1].forEach((s) =>
    [0, 1, 2].forEach((n) => {
      const hip = new Group();
      hip.position.set(s * 0.0035, -0.005, 0.022 - n * 0.006);
      body.add(hip);
      mesh(shared.rod, dark, hip, [0, -0.01, 0], [0.0008, 0.02, 0.0008]);
      const knee = new Group();
      knee.position.y = -0.02;
      hip.add(knee);
      mesh(shared.rod, dark, knee, [0, -0.011, 0], [0.0006, 0.022, 0.0006]);
      legs.push({ hip, knee, s, n, shift: 0, shiftV: 0 });
    }),
  );

  const wings = [1, -1].map((s) => {
    const side = new Group();
    side.position.set(s * 0.0055 * thick, 0.0045 * thick, 0.016);
    side.scale.x = s;
    body.add(side);
    const foreHinge = new Group();
    const hindHinge = new Group();
    foreHinge.position.set(0, 0, 0.007);
    hindHinge.position.set(0, -0.002, -0.005);
    foreHinge.rotation.order = "ZYX";
    hindHinge.rotation.order = "ZYX";
    side.add(foreHinge, hindHinge);
    return {
      foreHinge,
      hindHinge,
      f: wingPair("fore", foreHinge, s < 0, dark),
      h: wingPair("hind", hindHinge, s < 0, dark),
    };
  });
  const wingSamples = [];
  const yaw = -0.14;
  [
    ["fore", wings[0].foreHinge],
    ["hind", wings[0].hindHinge],
  ].forEach(([part, hinge]) => {
    const pos = geos[part].attributes.position;
    const latH = wings[0].foreHinge.parent.position.x;
    for (let i = 3; i < OUTLINE; i += 11) {
      const idx = 1 + i * RINGS + RINGS - 1;
      const x = pos.getX(idx);
      const z = pos.getZ(idx);
      const xr = x * Math.cos(yaw) + z * Math.sin(yaw);
      const zr = -x * Math.sin(yaw) + z * Math.cos(yaw);
      if (xr >= 0.02)
        wingSamples.push({
          lat: latH + xr,
          lon: wings[0].foreHinge.parent.position.z + hinge.position.z + zr,
          d: xr,
        });
    }
  });
  return {
    lookKey: lookName,
    mats: { fur, eye, dark },
    wingMaterial: (bones, glsl) => wingMaterial(look, tex, bones, glsl),
    fillValue: 0,
    wingSamples,
    root,
    body,
    thorax,
    segments,
    fur,
    head,
    antennae,
    proboscis,
    legs,
    wings,
    look: { yaw: 0, target: 0, next: rand(1, 3) },
    unroll: 0,
    minOpen: [0, 0],
    spanRatio: form.hind.span / form.fore.span,
    bodyK: variant.bodyK,
    phase: Math.random() * 6,
    hzBase: rand(...variant.flap),
    ampK: variant.amp,
    glideAngle: variant.glideAngle,
    hz: 10,
    amp: 1,
    beats: 3,
    glideK: rand(...variant.glide),
    breathe: rand(4, 9),
    flickRate: rand(3, 10),
    glide: 0,
    angle: 1.4,
    prevAngle: 1.4,
    bend: 0,
    lift: 0,
    sink: 0,
    jolt: 0.5,
    perchT: 0,
    flick: 0,
    flickIn: rand(2, 6),
  };
}

function pose(rig, p) {
  const { t, dt, air, sip, fill, flinch } = p;
  let lagAngle;
  if (air > 0.5) {
    rig.perchT = 0;
    if (p.burst) rig.glide = 0;
    if (rig.glide > 0 && !p.landing) {
      rig.glide -= dt;
      rig.sink = 0.7;
      rig.angle += (rig.glideAngle - rig.angle) * (1 - Math.exp(-dt * 10));
      lagAngle = rig.angle - 0.05;
      if (rig.glide <= 0) {
        rig.beats = 2 + Math.floor(Math.random() * 5);
        rig.hz = rig.hzBase * rand(0.85, 1.15);
        rig.phase = Math.PI * 0.05;
      }
    } else {
      rig.sink = 0;
      let hz = p.landing ? 6 : rig.hz;
      if (p.burst) hz = rig.hzBase * 1.9;
      const before = rig.phase;
      rig.phase += dt * hz * Math.PI * 2;
      if (Math.sin(rig.phase) > 0)
        rig.lift += dt * rig.amp * (p.landing ? 2 : 4.5);
      if (
        Math.floor(rig.phase / (Math.PI * 2)) !==
        Math.floor(before / (Math.PI * 2))
      ) {
        rig.beats -= 1;
        rig.amp = rand(0.72, 1.1);
        rig.flapped = rig.beats % 2 === 0;
        if (rig.beats <= 0 && !p.burst) {
          if (!p.landing && Math.random() < 0.75)
            rig.glide = rand(0.12, 0.35) * rig.glideK;
          else rig.beats = 2 + Math.floor(Math.random() * 4);
        }
      }
      const amp = p.burst ? 1.15 : rig.amp * (p.landing ? 0.75 : 1);
      rig.angle = 0.55 + Math.cos(rig.phase) * 0.92 * amp * rig.ampK;
      lagAngle =
        0.55 + Math.cos(rig.phase - 0.45 * rig.ampK) * 0.88 * amp * rig.ampK;
    }
  } else {
    rig.perchT += dt;
    rig.sink = 0;
    rig.flickIn -= dt;
    if (rig.flickIn < 0) {
      rig.flickIn = rig.flickRate * rand(0.6, 1.4);
      rig.flick = 1;
    }
    rig.flick = Math.max(0, rig.flick - dt * 2.6);
    const flick = Math.sin(rig.flick * Math.PI) * 0.4;
    const cycle =
      0.5 -
      0.5 *
        Math.cos(Math.max(0, rig.perchT - 1.4) * ((Math.PI * 2) / rig.breathe));
    const target = 1.48 - cycle * 1.1 + flick - flinch * 0.4;
    rig.angle +=
      (target - rig.angle) * (1 - Math.exp(-dt * (rig.perchT < 1 ? 6 : 3.5)));
    lagAngle = rig.angle;
  }
  const floor = -Math.asin(
    Math.max(0, Math.min(1, ((p.clear ?? 1) - 0.1) / (0.28 * (p.scale ?? 1)))),
  );
  rig.angle = Math.max(rig.angle, floor);
  lagAngle = Math.max(lagAngle, floor);
  const speed = (rig.angle - rig.prevAngle) / Math.max(dt, 1e-3);
  rig.prevAngle = rig.angle;
  rig.bend +=
    (Math.max(-0.3, Math.min(0.3, -speed * 0.013)) - rig.bend) *
    (1 - Math.exp(-dt * 22));
  rig.wings.forEach((w, n) => {
    const low = Math.min(
      1.44,
      Math.max(floor, p.nearSpot ? rig.minOpen[n] : floor),
    );
    const fore = Math.min(1.52, Math.max(low + 0.06, rig.angle));
    w.foreHinge.rotation.z = fore;
    w.hindHinge.rotation.z = Math.max(low, Math.min(fore - 0.06, lagAngle));
    w.foreHinge.rotation.y = -0.04 - (1 - air) * 0.1;
    w.hindHinge.rotation.y = w.foreHinge.rotation.y;
    const span = w.f.bend.uSpan.value;
    const room =
      (0.0025 + span * Math.cos(fore)) /
      (span * Math.max(0.05, Math.sin(fore)));
    let bend = rig.bend - 0.02 * air;
    let twist = rig.bend * 0.45 * air;
    const reach = bend + Math.abs(twist) * 0.6;
    if (reach > room) {
      const k = Math.max(0, room) / reach;
      bend *= k;
      twist *= k;
    }
    w.f.bend.uBend.value = bend;
    w.f.bend.uTwist.value = twist;
    w.h.bend.uBend.value = bend * rig.spanRatio;
    w.h.bend.uTwist.value = twist * rig.spanRatio;
    w.f.fill.value = fill;
    w.h.fill.value = fill;
  });
  const stroke = air > 0.5 && rig.glide <= 0 ? Math.sin(rig.phase) : 0;
  rig.body.rotation.x = air * (-0.22 + stroke * 0.16) + (1 - air) * -0.03;
  rig.body.position.y = air * stroke * 0.004;
  rig.fur.emissiveIntensity = fill * 0.25;
  rig.fillValue = fill;
  rig.tick = !rig.tick;
  if (rig.tick) {
    const dt2 = dt * 2;
    rig.segments.forEach((sg, k) => {
      const pulse = 1 + Math.sin(t * 2.3 - k * 0.7) * 0.035 * (0.4 + sip);
      const swell = 1 + fill * 0.45 * Math.sin(((k + 1) / 8) * Math.PI);
      sg.mesh.scale.set(
        sg.r * swell * pulse,
        sg.r * swell * pulse,
        sg.len * 0.62,
      );
      sg.group.rotation.x =
        k === 0
          ? -0.04 + air * 0.08 * Math.sin(rig.phase - 1)
          : sip * 0.05 +
            Math.sin(t * 0.9 + k * 0.5) * 0.012 +
            air * 0.025 * Math.sin(rig.phase - 1 - k * 0.4);
      sg.group.rotation.y = Math.sin(t * 0.6 + k * 0.4) * 0.01 * (1 - air);
    });
    const lk = rig.look;
    lk.next -= dt2;
    if (lk.next < 0) {
      lk.next = rand(1.5, 4.5);
      lk.target = (Math.random() - 0.5) * 0.5;
    }
    lk.yaw += (lk.target - lk.yaw) * (1 - Math.exp(-dt2 * 3));
    rig.head.rotation.set(
      sip * 0.18 + Math.sin(t * 0.7) * 0.03,
      lk.yaw * (1 - sip * 0.6),
      Math.sin(t * 0.5) * 0.03,
    );
    rig.antennae.forEach((a, s) => {
      if (Math.random() < dt2 * 0.5) a.twitchV += (Math.random() - 0.5) * 9;
      a.twitchV += (-a.twitch * 120 - a.twitchV * 9) * dt2;
      a.twitch += a.twitchV * dt2;
      a.group.rotation.x =
        Math.sin(t * a.rate + a.phase) * 0.07 -
        air * 0.18 +
        a.twitch * 0.25 +
        sip * 0.1;
      a.group.rotation.z =
        Math.sin(t * 0.7 * a.rate + s * 2 + a.phase) * 0.05 + a.twitch * 0.1;
    });
  }
  const target = Math.min(1, sip * 1.2);
  rig.unroll += (target - rig.unroll) * (1 - Math.exp(-dt * 2.2));
  if (Math.abs(rig.unroll - (rig.unrollDrawn ?? -1)) > 0.002) {
    rig.unrollDrawn = rig.unroll;
    rig.proboscis.forEach((l, k) => {
      const open = Math.max(0, Math.min(1, rig.unroll * 1.6 - (k / 12) * 0.6));
      const coil = 1 - open;
      l.rotation.x =
        k === 0 ? coil * 0.8 - open * 0.9 : coil * 0.62 - open * 0.02;
    });
  }
  rig.legs.forEach((l) => {
    if (air < 0.5 && Math.random() < dt * 0.08)
      l.shiftV += (Math.random() - 0.5) * 4;
    l.shiftV += (-l.shift * 90 - l.shiftV * 10) * dt;
    l.shift += l.shiftV * dt;
    const key = air * 7 + p.walk * 13 + l.shift * 17;
    if (p.walk < 0.001 && Math.abs(key - (l.key ?? -9)) < 1e-4) return;
    l.key = key;
    const walk =
      p.walk * Math.sin(t * 14 + l.n * 2 + (l.s > 0 ? 0 : Math.PI)) * 0.3;
    l.hip.rotation.set(
      (l.n - 1) * -0.5 * (1 - air) + air * 0.9 + walk + l.shift * 0.4,
      0,
      l.s * (0.9 * (1 - air) + 0.25 * air) - Math.abs(l.shift) * 0.3 * l.s,
    );
    l.knee.rotation.z = l.s * (-1.3 * (1 - air) - 0.3 * air);
  });
}

function flightForce(rig, vel, dt) {
  vel.y += rig.lift * 0.9;
  rig.lift = 0;
  vel.y -= rig.sink * dt;
  rig.jolt -= dt;
  if (rig.jolt < 0) {
    rig.jolt = rand(0.3, 0.9);
    vel.x += (Math.random() - 0.5) * 1.1;
    vel.z += (Math.random() - 0.5) * 0.6;
    vel.y += (Math.random() - 0.4) * 0.6;
  }
}

function collect(fx, w, api) {
  const center = w.pos.clone();
  for (let k = 0; k < 16; k += 1) {
    const at = api.headWorld(w, 0).add(api.rand3(0.12));
    fx.emit("twinkle", at, api.rand3(0.6).setY(1 + Math.random()), {
      size: rand(0.08, 0.16),
      life: rand(1.4, 2),
      drag: 0.6,
      swirl: 6,
      center,
      color: 0xffe8d8,
    });
  }
  sparkle(api.ctx, api.pan(w), api.volume * 0.6, w.special ? 1175 : 1568);
  return "spiral";
}

export const BUTTERFLY = {
  size: 1.55,
  specialSize: 1.66,
  specialName: "Sunset morpho",
  stand: 0.026,
  radius: 0.08,
  maxTilt: 0.1,
  foot: [0.1, 0.025],
  wingSpan: FORMS.morpho.fore.span,
  walk: true,
  hopNear: true,
  startle: true,
  knock: 0.1,
  landTime: 1.6,
  arrive: 0.3,
  spots: { yMin: -0.4, yMax: 2.2, zMin: 0.35, upMin: -0.4 },
  flight: {
    cruise: 1.15,
    wander: 0.5,
    agility: 2.4,
    hoverPitch: -0.1,
    bank: 0.05,
  },
  personality: () => ({
    size: rand(0.85, 1.15),
    wander: rand(0.6, 1.5),
    noise: rand(0.7, 1.4),
    cruise: rand(0.85, 1.2),
    perch: [rand(20, 30), rand(45, 70)],
    walkEvery: [rand(8, 14), rand(16, 26)],
  }),
  softFlap: { hz: 260, volume: 0.04 },
  slurp: 0.15,
  build,
  *prepare() {
    yield* bakeLook(MORPHO.normal);
    yield* bakeLook(MORPHO.special);
  },
  makeBatch,
  pose,
  flightForce,
  collect,
};
