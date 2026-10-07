// One pill glides under the picked option and can be dragged across, like chesspath's settings toggles.
export default function slideToggle(group) {
  const thumb = document.createElement("span");
  thumb.className = "toggle-thumb";
  thumb.setAttribute("aria-hidden", "true");
  group.prepend(thumb);
  group.classList.add("toggle-track");
  const options = () => [...group.querySelectorAll("button")];
  let seated = false;

  const sync = () => {
    const active = group.querySelector('button[aria-pressed="true"]');
    if (!active || !active.offsetWidth) return;
    // The first placement seats it; later picks slide.
    if (!seated) thumb.style.transition = "none";
    thumb.style.left = `${active.offsetLeft}px`;
    thumb.style.width = `${active.offsetWidth}px`;
    if (!seated) {
      seated = true;
      requestAnimationFrame(() => {
        thumb.style.transition = "";
      });
    }
  };
  new ResizeObserver(sync).observe(group);
  new MutationObserver(sync).observe(group, {
    attributes: true,
    attributeFilter: ["aria-pressed"],
    subtree: true,
  });

  let pointer = -1;
  let startX = 0;
  let startLeft = 0;
  let dragging = false;
  let swallowClick = false;
  group.addEventListener("pointerdown", (e) => {
    if (!e.isPrimary) return;
    swallowClick = false;
    pointer = e.pointerId;
    startX = e.clientX;
    startLeft = thumb.offsetLeft;
    dragging = false;
  });
  group.addEventListener("pointermove", (e) => {
    if (e.pointerId !== pointer) return;
    if (e.buttons === 0) {
      pointer = -1;
      return;
    }
    if (!dragging) {
      if (Math.abs(e.clientX - startX) < 6) return;
      dragging = true;
      group.setPointerCapture(pointer);
      thumb.style.transition = "none";
    }
    const all = options();
    const last = all[all.length - 1];
    const min = all[0].offsetLeft;
    const max = last.offsetLeft + last.offsetWidth - thumb.offsetWidth;
    const left = Math.min(Math.max(startLeft + e.clientX - startX, min), max);
    thumb.style.left = `${left}px`;
  });
  const endDrag = (e) => {
    if (e.pointerId !== pointer) return;
    pointer = -1;
    if (!dragging) return;
    dragging = false;
    thumb.style.transition = "";
    const centre = thumb.offsetLeft + thumb.offsetWidth / 2;
    const nearest = options().reduce((best, b) =>
      Math.abs(b.offsetLeft + b.offsetWidth / 2 - centre) <
      Math.abs(best.offsetLeft + best.offsetWidth / 2 - centre)
        ? b
        : best,
    );
    // The browser sends its own click after the release; only the pick below should count.
    swallowClick = true;
    nearest.click();
    sync();
  };
  group.addEventListener("pointerup", endDrag);
  group.addEventListener("pointercancel", endDrag);
  group.addEventListener(
    "click",
    (e) => {
      if (!swallowClick || !e.isTrusted) return;
      swallowClick = false;
      e.preventDefault();
      e.stopPropagation();
    },
    true,
  );
  return sync;
}
