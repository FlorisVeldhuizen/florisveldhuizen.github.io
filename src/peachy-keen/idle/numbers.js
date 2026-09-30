const SHORT = [
  "",
  "K",
  "M",
  "B",
  "T",
  "Qa",
  "Qi",
  "Sx",
  "Sp",
  "Oc",
  "No",
  "Dc",
  "UDc",
  "DDc",
  "TDc",
  "QaDc",
  "QiDc",
  "SxDc",
  "SpDc",
  "OcDc",
  "NoDc",
  "Vg",
];

const LONG = [
  "",
  "thousand",
  "million",
  "billion",
  "trillion",
  "quadrillion",
  "quintillion",
  "sextillion",
  "septillion",
  "octillion",
  "nonillion",
  "decillion",
  "undecillion",
  "duodecillion",
  "tredecillion",
  "quattuordecillion",
  "quindecillion",
  "sexdecillion",
  "septendecillion",
  "octodecillion",
  "novemdecillion",
  "vigintillion",
];

let notation = "short";

export function setNotation(name) {
  notation = name;
}

function trim(value, digits) {
  return value.toFixed(digits).replace(/\.0+$|(\.\d*[1-9])0+$/, "$1");
}

function mantissa(value) {
  if (value >= 100) return trim(value, 0);
  if (value >= 10) return trim(value, 1);
  return trim(value, 2);
}

export function format(value, { whole = false } = {}) {
  if (!Number.isFinite(value)) return value > 0 ? "∞" : "0";
  if (value < 0) return `-${format(-value, { whole })}`;
  if (value < 1000) {
    if (whole || value >= 100 || Number.isInteger(value))
      return String(Math.floor(value));
    return trim(value, value >= 10 ? 1 : 2);
  }
  const group = Math.floor(Math.log10(value) / 3);
  if (notation === "scientific" || group >= SHORT.length) {
    const exponent = Math.floor(Math.log10(value));
    return `${trim(value / 10 ** exponent, 2)}e${exponent}`;
  }
  const scaled = value / 1000 ** group;
  const names = notation === "long" ? LONG : SHORT;
  const gap = notation === "long" ? " " : "";
  return `${mantissa(scaled)}${gap}${names[group]}`;
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "forever";
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  if (s < 86400)
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  if (s < 86400 * 365)
    return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
  return `${format(s / (86400 * 365))} years`;
}

export function bulkCost(base, growth, owned, count) {
  return (base * growth ** owned * (growth ** count - 1)) / (growth - 1);
}

export function maxAffordable(base, growth, owned, funds) {
  if (funds <= 0) return 0;
  const n = Math.log((funds * (growth - 1)) / (base * growth ** owned) + 1);
  return Math.max(0, Math.floor(n / Math.log(growth) + 1e-9));
}
