import { animate } from "./dom";

const at = (origin, frames) =>
  frames.map(([offset, transform, easing = "ease-in-out"]) => ({
    offset,
    transform,
    easing,
    transformOrigin: origin,
  }));

const MOTIONS = {
  hand: () => [
    at("50% 90%", [
      [0, "rotate(0)", "ease-out"],
      [0.1, "rotate(4deg)"],
      [0.3, "rotate(-16deg)"],
      [0.5, "rotate(12deg)"],
      [0.68, "rotate(-8deg)"],
      [0.84, "rotate(4deg)"],
      [1, "rotate(0)"],
    ]),
    { duration: 760 },
  ],
  recipe: () => [
    at("50% 100%", [
      [0, "none", "ease-out"],
      [0.15, "scale(1.08, 0.9)", "cubic-bezier(0.2, 0.6, 0.35, 1)"],
      [
        0.42,
        "translateY(-6px) scale(0.95, 1.06)",
        "cubic-bezier(0.55, 0, 1, 0.45)",
      ],
      [0.62, "translateY(0) scale(1.1, 0.88)", "ease-out"],
      [0.8, "translateY(-1px) scale(0.98, 1.03)"],
      [1, "none"],
    ]),
    { duration: 640 },
  ],
  blush: () => [
    at("50% 55%", [
      [0, "scale(1)", "ease-out"],
      [0.12, "scale(1.2)", "ease-in"],
      [0.26, "scale(0.97)", "ease-out"],
      [0.4, "scale(1.12)", "ease-in"],
      [0.6, "scale(0.99)"],
      [1, "scale(1)"],
    ]),
    { duration: 780 },
  ],
  trophy: () => [
    at("50% 90%", [
      [0, "none", "cubic-bezier(0.2, 0.7, 0.3, 1)"],
      [0.35, "translateY(-1.5px) scale(1.12)", "ease-in-out"],
      [0.65, "scale(0.97)"],
      [1, "none"],
    ]),
    { duration: 560 },
  ],
};

export default function tabMotion(name, icon) {
  const [frames, timing] = MOTIONS[name]();
  animate(icon, frames, timing);
}
