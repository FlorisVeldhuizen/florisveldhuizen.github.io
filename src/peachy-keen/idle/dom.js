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
  const key = [title, ...lines].join("\n");
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

const HOLD_MS = 450;

export function onHold(node, fire) {
  let timer = null;
  let start = null;
  const cancel = () => {
    clearTimeout(timer);
    timer = null;
    node.classList.remove("is-holding");
  };
  node.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse" || !e.isPrimary) return;
    start = { x: e.clientX, y: e.clientY };
    node.classList.add("is-holding");
    timer = setTimeout(() => {
      cancel();
      fire();
    }, HOLD_MS);
  });
  node.addEventListener("pointermove", (e) => {
    if (timer && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8)
      cancel();
  });
  ["pointerup", "pointercancel", "pointerleave"].forEach((type) =>
    node.addEventListener(type, cancel),
  );
  node.addEventListener("contextmenu", (e) => e.preventDefault());
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
