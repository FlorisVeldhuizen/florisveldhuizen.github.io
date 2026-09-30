import { reducedMotion } from "../util";

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

export function animate(node, frames, options) {
  const last = frames[frames.length - 1];
  return node.animate(reducedMotion.matches ? [last, last] : frames, options);
}
