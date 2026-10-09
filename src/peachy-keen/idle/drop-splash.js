import { reducedMotion } from "../util";

const NS = "http://www.w3.org/2000/svg";
const SURFACE = 21;
const POINTS = 120;
const T = {
  lift: 90,
  fall0: 90,
  fall1: 270,
  collapse: 300,
  jet0: 330,
  pinch: 480,
  apex: 610,
  form: 860,
  clear0: 620,
  clear1: 740,
  end: 1320,
};
const JET_TOP = SURFACE - 7.6;

const clamp = (t) => Math.min(1, Math.max(0, t));
const span = (ms, a, b) => clamp((ms - a) / (b - a));
const outQuint = (t) => 1 - (1 - t) ** 5;
const outCubic = (t) => 1 - (1 - t) ** 3;
const inOutCubic = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const outBack = (t) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;

function svgEl(tag, attrs, parent) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  parent.appendChild(node);
  return node;
}

const cubic = (p0, p1, p2, p3) => (t) => {
  const u = 1 - t;
  return [0, 1].map(
    (i) =>
      u * u * u * p0[i] +
      3 * u * u * t * p1[i] +
      3 * u * t * t * p2[i] +
      t * t * t * p3[i],
  );
};

function resample(segments) {
  const dense = [];
  segments.forEach((at) => {
    for (let i = 0; i < 80; i += 1) dense.push(at(i / 80));
  });
  dense.push(dense[0]);
  const lengths = [0];
  for (let i = 1; i < dense.length; i += 1) {
    const [ax, ay] = dense[i - 1];
    const [bx, by] = dense[i];
    lengths.push(lengths[i - 1] + Math.hypot(bx - ax, by - ay));
  }
  const total = lengths[lengths.length - 1];
  const points = [];
  let j = 0;
  for (let i = 0; i < POINTS; i += 1) {
    const target = (total * i) / POINTS;
    while (lengths[j + 1] < target) j += 1;
    const k = (target - lengths[j]) / (lengths[j + 1] - lengths[j] || 1);
    points.push([
      dense[j][0] + (dense[j + 1][0] - dense[j][0]) * k,
      dense[j][1] + (dense[j + 1][1] - dense[j][1]) * k,
    ]);
  }
  return points;
}

// Same outline as the "juice" icon path, starting at the tip and going clockwise.
const DROP_POINTS = resample([
  cubic([12, 3], [12, 3], [18, 9.5], [18, 14]),
  (t) => [12 + 6 * Math.cos(Math.PI * t), 14 + 6 * Math.sin(Math.PI * t)],
  cubic([6, 14], [6, 9.5], [12, 3], [12, 3]),
]);
const BEAD_POINTS = resample([
  (t) => [
    12 + 0.5 * Math.sin(2 * Math.PI * t),
    10 - 0.5 * Math.cos(2 * Math.PI * t),
  ],
]);

const mix = (a, b, k) =>
  a.map(([x, y], i) => [x + (b[i][0] - x) * k, y + (b[i][1] - y) * k]);
const polyline = (points) =>
  `M${points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L")}`;

function dropHalfWidth(y) {
  let w = 0;
  DROP_POINTS.forEach((a, i) => {
    const b = DROP_POINTS[(i + 1) % POINTS];
    if ((a[1] - y) * (b[1] - y) > 0 || a[1] === b[1]) return;
    const x = a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0]);
    w = Math.max(w, Math.abs(x - 12));
  });
  return w;
}

// Positive dips below the water line, negative is the bump under the jet.
function craterDepth(ms) {
  if (ms < T.collapse) {
    const enter = span(ms, T.fall0, T.fall1);
    return 2.4 * Math.max(0, (enter - 0.12) / 0.88) ** 0.7;
  }
  if (ms < T.jet0 + 60) {
    return 2.4 - 3.1 * inOutCubic(span(ms, T.collapse, T.jet0 + 60));
  }
  const s = ms - T.jet0 - 60;
  return -0.7 * Math.exp(-s / 160) * Math.cos((2 * Math.PI * s) / 260);
}

function waterLine(ms) {
  const depth = craterDepth(ms);
  const r = ms - T.collapse;
  return (x) => {
    const d = Math.abs(x - 12);
    let y = SURFACE + depth * Math.exp(-((d / 3.1) ** 2));
    const front = 0.017 * r;
    if (r > 0 && d > 1 && d < front) {
      const edge = clamp((front - d) / 2) * clamp((d - 1) / 2);
      y +=
        0.75 *
        Math.exp(-r / 380) *
        (1 - d / 11) *
        edge *
        Math.sin((2 * Math.PI * (d - front)) / 4.4);
    }
    return y;
  };
}

function waterPath(ms, y, entry) {
  const half = 9 * outQuint(span(ms, 0, T.fall0 + 70));
  const gap = Math.max(entry, 9.3 * outCubic(span(ms, T.clear0, T.clear1)));
  if (half - gap < 0.05) return "";
  const side = (s) => {
    const points = [];
    for (let d = gap; d <= half + 0.001; d += 0.25) {
      points.push([12 + s * d, y(12 + s * d)]);
    }
    return points;
  };
  const left = side(-1).reverse();
  const right = side(1);
  if (gap < 0.05) return polyline([...left, ...right.slice(1)]);
  return polyline(left) + polyline(right);
}

function crownSheets(parent) {
  const sheets = [];
  [-1, 1].forEach((s) => {
    const lag = s > 0 ? 16 : 0;
    sheets.push(
      {
        p0: [12 + s * 5.4, SURFACE],
        c: [12 + s * 5.7, SURFACE - 3.8],
        p1: [12 + s * 8, SURFACE - 4.6],
        at: 190 + lag,
        width: 1.6,
        speck: { vx: s * 6, vy: -7, at: 330 + lag },
      },
      {
        p0: [12 + s * 6.6, SURFACE],
        c: [12 + s * 7.7, SURFACE - 1.9],
        p1: [12 + s * 9.8, SURFACE - 2.1],
        at: 215 + lag,
        width: 1.4,
      },
    );
  });
  sheets.forEach((sheet) => {
    const { p0, c, p1 } = sheet;
    Object.assign(sheet, {
      path: svgEl(
        "path",
        { d: `M${p0}Q${c} ${p1}`, pathLength: 1, visibility: "hidden" },
        parent,
      ),
      line: sheet.speck && svgEl("line", { visibility: "hidden" }, parent),
    });
  });
  return sheets;
}

function drawSheet(sheet, ms) {
  const local = ms - sheet.at;
  const head = outQuint(clamp(local / 150));
  const tail = inOutCubic(clamp((local - 100) / 260));
  const shown = local >= 0 && head - tail >= 0.002;
  sheet.path.setAttribute("visibility", shown ? "visible" : "hidden");
  if (shown) {
    sheet.path.setAttribute("stroke-dasharray", `${head - tail} 3`);
    sheet.path.setAttribute("stroke-dashoffset", -tail);
    sheet.path.setAttribute("stroke-width", sheet.width - 0.7 * tail);
  }
  if (!sheet.speck) return;
  const { vx, vy, at } = sheet.speck;
  const t = (ms - at) / 380;
  sheet.line.setAttribute(
    "visibility",
    t >= 0 && t <= 1 ? "visible" : "hidden",
  );
  if (t < 0 || t > 1) return;
  const s = (ms - at) / 1000;
  const x = sheet.p1[0] + vx * s;
  const y = sheet.p1[1] + vy * s + 30 * s * s;
  const speed = vy + 60 * s;
  sheet.line.setAttribute("x1", x - vx * 0.03);
  sheet.line.setAttribute("y1", y - speed * 0.03);
  sheet.line.setAttribute("x2", x);
  sheet.line.setAttribute("y2", y);
  sheet.line.setAttribute("stroke-width", 1.4 * (1 - 0.6 * t));
  sheet.line.setAttribute("opacity", t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3);
}

function drawDrop(drop, holder, clipShape, ms, y) {
  if (ms < T.fall1) {
    const lifting = ms < T.lift;
    const u = lifting ? outCubic(ms / T.lift) : span(ms, T.fall0, T.fall1);
    const ty = lifting ? -1.3 * u : -1.3 + 20.5 * u * u;
    const sy = lifting ? 1 + 0.06 * u : 1.06 + 0.12 * u;
    const sx = 1 / Math.sqrt(sy);
    drop.setAttribute(
      "transform",
      `translate(12 ${20 + ty}) scale(${sx} ${sy}) translate(-12 -20)`,
    );
    const edge = [];
    for (let x = 22; x >= 2; x -= 0.5) edge.push(`${x} ${y(x).toFixed(2)}`);
    clipShape.setAttribute(
      "d",
      `M-20 -40H44V${y(22).toFixed(2)}L${edge.join("L")}H-20z`,
    );
    const widthAt = (level) => sx * dropHalfWidth(20 + (level - 20 - ty) / sy);
    return widthAt(y(12 + widthAt(SURFACE)));
  }
  drop.setAttribute("visibility", ms < T.apex ? "hidden" : "visible");
  if (ms < T.apex) return 0;
  holder.removeAttribute("clip-path");
  if (ms < T.form) {
    const k = outBack(span(ms, T.apex, T.form));
    drop.setAttribute("d", `${polyline(mix(BEAD_POINTS, DROP_POINTS, k))}Z`);
    drop.removeAttribute("transform");
  } else {
    drop.setAttribute("d", drop.dataset.d);
    const s = (ms - T.form) / 1000;
    const w = 0.05 * Math.exp(-s / 0.09) * Math.sin((2 * Math.PI * s) / 0.2);
    drop.setAttribute(
      "transform",
      `translate(12 20) scale(${1 + w} ${1 - w}) translate(-12 -20)`,
    );
  }
  return 0;
}

function drawJet(jet, bead, ms, y) {
  const shown = ms >= T.jet0 && ms < T.apex;
  jet.setAttribute("visibility", "hidden");
  bead.setAttribute("visibility", shown ? "visible" : "hidden");
  if (!shown) return;
  let beadY;
  let beadR;
  let jetTop;
  if (ms < T.pinch) {
    const u = outCubic(span(ms, T.jet0, T.pinch));
    beadY = SURFACE - 7.6 * u;
    beadR = 0.15 + 0.35 * u;
    jetTop = beadY + 0.9;
  } else {
    const u = span(ms, T.pinch, T.apex);
    beadY = JET_TOP + (10 - JET_TOP) * outCubic(u);
    beadR = 0.5;
    jetTop = JET_TOP + 0.9 + (y(12) - JET_TOP - 0.9) * outCubic(u);
  }
  const base = y(12);
  if (jetTop < base - 0.3) jet.setAttribute("visibility", "visible");
  jet.setAttribute("y1", base);
  jet.setAttribute("y2", jetTop);
  jet.setAttribute(
    "stroke-width",
    ms < T.pinch ? 1.6 - 0.4 * span(ms, T.jet0, T.pinch) : 1.2,
  );
  bead.setAttribute("cy", beadY);
  bead.setAttribute("r", beadR + 0.8);
}

const running = new WeakMap();

export default function splashDrop(icon) {
  if (reducedMotion.matches) return;
  if (!running.has(icon)) {
    const drop = icon.querySelector("path");
    drop.dataset.d = drop.getAttribute("d");
    const holder = svgEl("g", {}, icon);
    holder.appendChild(drop);
    running.set(icon, { drop, holder, fx: svgEl("g", {}, icon), run: 0 });
  }
  const parts = running.get(icon);
  parts.run += 1;
  const { run, drop, holder, fx } = parts;
  fx.replaceChildren();
  drop.setAttribute("d", drop.dataset.d);
  drop.removeAttribute("visibility");

  const id = `drop-splash-${Math.random().toString(36).slice(2)}`;
  const clipShape = svgEl("path", {}, svgEl("clipPath", { id }, fx));
  holder.setAttribute("clip-path", `url(#${id})`);
  const water = svgEl("path", {}, fx);
  const jet = svgEl("line", { x1: 12, x2: 12, visibility: "hidden" }, fx);
  const solid = { cx: 12, fill: "currentColor", stroke: "none" };
  const bead = svgEl("circle", solid, fx);
  const satellite = svgEl(
    "circle",
    { ...solid, r: 0.55, visibility: "hidden" },
    fx,
  );
  const sheets = crownSheets(fx);

  const start = performance.now();
  const frame = (now) => {
    if (parts.run !== run) return;
    const ms = now - start;
    if (ms >= T.end) {
      drop.removeAttribute("transform");
      holder.removeAttribute("clip-path");
      fx.replaceChildren();
      return;
    }
    const y = waterLine(ms);
    const entry = drawDrop(drop, holder, clipShape, ms, y);
    water.setAttribute("d", waterPath(ms, y, entry));
    drawJet(jet, bead, ms, y);
    const fallen = (ms - T.pinch) / 1000;
    const satY = JET_TOP + 1.9 - 3 * fallen + 325 * fallen * fallen;
    const falling = fallen > 0 && satY < y(12);
    satellite.setAttribute("visibility", falling ? "visible" : "hidden");
    satellite.setAttribute("cy", satY);
    sheets.forEach((sheet) => drawSheet(sheet, ms));
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
