import { HELPERS } from "./data/helpers";

const PATHS = {
  hand: "M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V5.5a1.5 1.5 0 0 1 3 0V13M17 13v-1.5a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-7 7h-1a7 7 0 0 1-5.6-2.8L4 16a1.5 1.5 0 0 1 2.4-1.8L8 16",
  heat: "M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8a7 7 0 0 0 7 7z",
  play: "M12 4c-4 0-8 3-8 8 0 4 3 8 8 8s8-4 8-8c0-5-4-8-8-8zM12 4v16",
  golden:
    "M12 3c-5 1-8 5-8 10 0 4 4 8 8 8s8-4 8-8c0-5-3-9-8-10zM12 3c1-1 3-1 4 0M12 8v12",
  recipe:
    "M4 11h16l-1.5 8a2 2 0 0 1-2 1.6h-9a2 2 0 0 1-2-1.6zM8 11c0-3 2-5 4-5s4 2 4 5M12 6V3",
  blush:
    "M12 21s-8-4.8-8-11a4.4 4.4 0 0 1 8-2.5A4.4 4.4 0 0 1 20 10c0 6.2-8 11-8 11zM9 11h.01M15 11h.01",
  juice: "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z",
  pit: "M12 3c4 0 7 4 7 9s-3 9-7 9-7-4-7-9 3-9 7-9zM12 7c-1 2-1 8 0 10M9 9c1 1 1 5 0 6M15 9c-1 1-1 5 0 6",
  nectar:
    "M8 3h8M9 3v4l-4 7a5 5 0 0 0 4.4 7.4h5.2A5 5 0 0 0 19 14l-4-7V3M7 14h10",
  trophy:
    "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4",
  lock: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z",
  close: "M6 6l12 12M18 6L6 18",
  seed: "M12 21V11M12 11c0-4 3-7 7-7 0 4-3 7-7 7zM12 14c0-3-2.5-5-6-5 0 3 2.5 5 6 5z",
};

HELPERS.forEach((h) => {
  PATHS[h.id] = h.icon;
});

let thumbs = {};
let style = "room";

export function setThumbnails(map) {
  thumbs = map;
}

export function setIconStyle(name) {
  style = name;
}

export function iconKey() {
  return `${style}${Object.keys(thumbs).length}`;
}

export function rowIcon(name) {
  if (style === "props" && thumbs[name])
    return `<img class="thumb" src="${thumbs[name]}" alt="" width="46" height="46">`;
  return iconSvg(name);
}

export function iconSvg(name, className = "icon") {
  const d = PATHS[name] || PATHS.juice;
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
}
