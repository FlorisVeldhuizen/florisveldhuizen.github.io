import { el, slideOn, toggle } from "./dom";
import { iconSvg } from "./icons";
import { reducedMotion } from "../util";

export default function toolTrack(parent, picker, choose) {
  const row = el("div", "tool-row", parent);
  const head = el("div", "tool-head", row);
  el("span", "tool-label", head, picker.label);
  const group = el("div", "track", row);
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", picker.label);
  const ink = el("span", "track-ink", el("span", "track-thumb", group));
  const icons = picker.options.some(([, , hint]) => hint);
  toggle(group, "is-icons", icons);
  const options = picker.options.map(([id, label, hint]) => {
    const button = el("button", "", group, icons ? iconSvg(id) : label);
    button.type = "button";
    if (icons) button.setAttribute("aria-label", label);
    button.addEventListener("click", () => choose(id));
    const mark = el("span", "", ink, button.innerHTML);
    return { id, label, hint, button, mark };
  });
  const name = icons ? el("span", "tool-pick", head) : null;
  const use = icons ? el("span", "tool-use", head) : null;
  let shownName = null;
  const say = (o) => {
    if (!name || !o) return;
    if (shownName === o) return;
    const from = shownName;
    shownName = o;
    name.textContent = o.label;
    use.textContent = o.hint;
    if (!from || reducedMotion.matches) return;
    const flip = [
      { transform: "perspective(200px) rotateX(-80deg)", opacity: 0 },
      { transform: "none", opacity: 1 },
    ];
    const timing = { duration: 300, easing: "cubic-bezier(.2,.8,.2,1)" };
    name.animate(flip, timing);
    use.animate(flip, { ...timing, delay: 40, fill: "backwards" });
  };
  const shownAt = (k) => options.filter((o) => !o.button.hidden)[k];
  slideOn(
    group,
    (k) => shownAt(k) && choose(shownAt(k).id),
    (k) => say(shownAt(k)),
  );
  let look = "";
  return {
    row,
    update(picked, owned) {
      let count = 0;
      let at = 0;
      options.forEach(({ id, button, mark }) => {
        const has = owned(id);
        if (button.hidden === has) {
          /* eslint-disable no-param-reassign */
          button.hidden = !has;
          mark.hidden = !has;
          /* eslint-enable no-param-reassign */
        }
        const pressed = String(id === picked);
        if (button.getAttribute("aria-pressed") !== pressed)
          button.setAttribute("aria-pressed", pressed);
        if (id === picked) at = count;
        if (has) count += 1;
      });
      row.hidden = count < 2;
      const next = `${count}:${at}:${picked}`;
      if (next === look) return;
      look = next;
      group.style.setProperty("--n", count);
      group.style.setProperty("--i", at);
      say(options.find((o) => o.id === picked));
    },
  };
}
