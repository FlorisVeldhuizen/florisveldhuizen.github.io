const KEY = "peachy-tune-18";

const KNOBS = [
  {
    key: "turnFrom",
    label: "Wiggle pats: min pull swing (x reach)",
    min: 0.2,
    max: 1.6,
    step: 0.05,
    value: 0.6,
    low: "pats on tiny swings",
    high: "only big swings pat",
    subtle: 0.8,
    lively: 0.45,
  },
  {
    key: "turnPaceFull",
    label: "Wiggle pats: pull pace for full volume (x reach/s)",
    min: 6,
    max: 30,
    step: 1,
    value: 14,
    low: "slow moves already loud",
    high: "only fast moves loud",
    subtle: 20,
    lively: 10,
  },
  {
    key: "turnVolume",
    label: "Wiggle pats: volume",
    min: 0,
    max: 1.5,
    step: 0.05,
    value: 0.6,
    low: "quieter",
    high: "louder",
    subtle: 0.45,
    lively: 0.8,
  },
  {
    key: "wobbleFrom",
    label: "Settle wobble: from stretch",
    min: 0.2,
    max: 0.95,
    step: 0.05,
    value: 0.5,
    low: "wobble after small pulls",
    high: "wobble only after big stretches",
    subtle: 0.65,
    lively: 0.4,
  },
  {
    key: "wobbleVolume",
    label: "Settle wobble: volume",
    min: 0,
    max: 1.5,
    step: 0.05,
    value: 0.6,
    low: "quieter",
    high: "louder",
    subtle: 0.45,
    lively: 0.8,
  },
  {
    key: "grabHoldSway",
    label: "Grab: stop the idle sway while holding",
    value: true,
  },
  {
    key: "grabFromPress",
    label: "Grab: hold the spot you pressed",
    value: true,
  },
  {
    key: "grabFadePointer",
    label: "Grab: fade in the pointer when it is far",
    value: true,
  },
  {
    key: "grabFollow",
    label: "Grab: body follows past full stretch",
    min: 0,
    max: 1,
    step: 0.05,
    value: 0.3,
    low: "stays put",
    high: "follows far",
    subtle: 0.15,
    lively: 0.5,
  },
];

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export const tune = Object.fromEntries(KNOBS.map((k) => [k.key, k.value]));
Object.assign(tune, load());

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(tune));
  } catch {
    // Storage is optional for the dev panel.
  }
}

function panel() {
  const box = document.createElement("div");
  box.style.cssText =
    "position:fixed;top:8px;left:8px;z-index:99999;background:rgba(20,10,10,.88);color:#fff;font:12px system-ui;padding:10px;border-radius:8px;width:250px;max-height:90vh;overflow:auto;touch-action:auto";
  const row = (knob) => {
    const wrap = document.createElement("label");
    wrap.style.cssText = "display:block;margin:6px 0";
    const title = document.createElement("div");
    let input;
    if (knob.options) {
      input = document.createElement("select");
      knob.options.forEach((o) => input.add(new Option(o, o)));
      input.value = tune[knob.key];
      input.onchange = () => {
        tune[knob.key] = input.value;
        save();
      };
      title.textContent = knob.label;
    } else if (typeof knob.value === "boolean") {
      input = document.createElement("input");
      input.type = "checkbox";
      input.checked = tune[knob.key];
      input.onchange = () => {
        tune[knob.key] = input.checked;
        save();
      };
      title.textContent = knob.label;
    } else {
      input = document.createElement("input");
      input.type = "range";
      Object.assign(input, { min: knob.min, max: knob.max, step: knob.step });
      input.value = tune[knob.key];
      input.style.width = "100%";
      const show = () => {
        title.textContent = `${knob.label}: ${tune[knob.key]} (rec ${knob.value})`;
      };
      input.oninput = () => {
        tune[knob.key] = Number(input.value);
        show();
        save();
      };
      show();
    }
    wrap.append(title, input);
    if (knob.low) {
      const ends = document.createElement("div");
      ends.style.cssText =
        "display:flex;justify-content:space-between;gap:8px;opacity:.65;font-size:10px";
      ends.append(
        Object.assign(document.createElement("span"), {
          textContent: `← ${knob.low}`,
        }),
        Object.assign(document.createElement("span"), {
          textContent: `${knob.high} →`,
          style: "text-align:right",
        }),
      );
      wrap.append(ends);
    }
    return wrap;
  };
  KNOBS.forEach((k) => box.append(row(k)));
  const presets = document.createElement("div");
  presets.style.cssText = "display:flex;gap:6px;margin-top:6px";
  [
    ["Subtle", "subtle"],
    ["Recommended", "value"],
    ["Lively", "lively"],
  ].forEach(([name, field]) => {
    const button = document.createElement("button");
    button.textContent = name;
    button.onclick = () => {
      KNOBS.forEach((k) => {
        tune[k.key] = k[field] ?? k.value;
      });
      save();
      box.remove();
      panel();
    };
    presets.append(button);
  });
  box.append(presets);
  ["pointerdown", "pointermove", "pointerup", "touchstart", "wheel"].forEach(
    (type) => box.addEventListener(type, (e) => e.stopPropagation()),
  );
  logBox = document.createElement("pre");
  logBox.style.cssText =
    "margin:8px 0 0;font:11px ui-monospace,monospace;white-space:pre-wrap;min-height:8em";
  box.append(logBox);
  document.body.append(box);
}

const shown = [];
let logBox = null;

export function tuneLog(text) {
  if (!logBox) return;
  shown.unshift(`${(performance.now() / 1000).toFixed(1)}s ${text}`);
  shown.length = Math.min(shown.length, 8);
  logBox.textContent = shown.join("\n");
}

if (new URLSearchParams(window.location.search).has("tune")) {
  if (document.body) panel();
  else window.addEventListener("DOMContentLoaded", panel);
}
