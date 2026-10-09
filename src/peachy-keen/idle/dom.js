import { reducedMotion, viewHeight } from "../util";

export function el(tag, className = "", parent = null, html = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html) node.innerHTML = html;
  parent?.appendChild(node);
  return node;
}

export function setText(node, text) {
  const value = String(text);
  // eslint-disable-next-line no-param-reassign
  if (node.textContent !== value) node.textContent = value;
}

export function toggle(node, name, on) {
  if (node.classList.contains(name) !== on) node.classList.toggle(name, on);
}

export function setDetail(node, title, lines = []) {
  toggle(node, "is-hidden", false);
  const key = [title, ...lines.map((l) => l.textContent ?? l)].join("\n");
  if (node.dataset.key === key) return;
  // eslint-disable-next-line no-param-reassign
  node.dataset.key = key;
  node.replaceChildren();
  if (title) el("b", "detail-title", node).append(title);
  lines.forEach((line, n) =>
    el("span", n ? "detail-line" : "", node).append(line),
  );
}

export const sidePanel = window.matchMedia(
  "(min-width: 900px), (orientation: landscape) and (min-width: 640px)",
);

export function floatBeside(detail, anchor) {
  if (!sidePanel.matches) return;
  const r = anchor.getBoundingClientRect();
  const h = detail.offsetHeight;
  const top = Math.min(
    Math.max(r.top + r.height / 2 - h / 2, 12),
    viewHeight() - h - 12,
  );
  // eslint-disable-next-line no-param-reassign
  detail.style.top = `${Math.round(top)}px`;
}

export function clearOnLeave(area, detail, onClear) {
  const clear = () => {
    onClear?.();
    toggle(detail, "is-hidden", true);
  };
  area.addEventListener("pointerleave", (e) => {
    if (e.pointerType === "mouse") clear();
  });
  area.addEventListener("focusout", (e) => {
    if (!area.contains(e.relatedTarget)) clear();
  });
}

// The inline detail on phones would push rows around under a moving mouse, so hover shows it beside the panel only.
export function inspectOn(button, show) {
  button.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse" && sidePanel.matches) show();
  });
  button.addEventListener("focus", () => {
    if (button.matches(":focus-visible")) show();
  });
}

export function animate(node, frames, options) {
  const last = frames[frames.length - 1];
  return node.animate(reducedMotion.matches ? [last, last] : frames, options);
}

export function keepFocus(list, rebuild) {
  const at = [...list.querySelectorAll("button")].indexOf(
    document.activeElement,
  );
  rebuild();
  if (at < 0) return;
  const buttons = list.querySelectorAll("button");
  (buttons[at] || buttons[buttons.length - 1])?.focus();
}

export function nudge(node) {
  animate(
    node,
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-4px)" },
      { transform: "translateX(4px)" },
      { transform: "translateX(-2px)" },
      { transform: "translateX(0)" },
    ],
    { duration: 280, easing: "ease-out" },
  );
}

export function slideOn(track, pick, preview = () => {}) {
  let drag = null;
  let lit = -1;
  const light = (k) => {
    if (k === lit) return;
    lit = k;
    if (k >= 0) {
      navigator.vibrate?.(4);
      preview(k);
    }
  };
  let slidAt = -1e9;
  const n = () => Number(track.style.getPropertyValue("--n")) || 1;
  track.addEventListener("pointerdown", (e) => {
    if (e.isPrimary) drag = { x: e.clientX, id: e.pointerId, moved: false };
  });
  track.addEventListener("pointermove", (e) => {
    if (!drag) return;
    if (!drag.moved) {
      if (Math.abs(e.clientX - drag.x) < 6) return;
      drag.moved = true;
      track.setPointerCapture(drag.id);
      track.classList.add("is-sliding");
    }
    const r = track.getBoundingClientRect();
    const at = ((e.clientX - r.left) / r.width) * n() - 0.5;
    const i = Math.min(n() - 1, Math.max(0, at));
    track.style.setProperty("--i", i);
    light(Math.round(i));
  });
  const end = () => {
    if (!drag) return;
    const { moved } = drag;
    drag = null;
    if (!moved) return;
    slidAt = performance.now();
    track.classList.remove("is-sliding");
    const k = Math.round(Number(track.style.getPropertyValue("--i")));
    track.style.setProperty("--i", k);
    light(-1);
    pick(k);
  };
  track.addEventListener("pointerup", end);
  track.addEventListener("pointercancel", end);
  track.addEventListener(
    "click",
    (e) => {
      if (performance.now() - slidAt < 300) e.stopPropagation();
    },
    true,
  );
}
