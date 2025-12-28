const initLinkEffects = () => {
  const CONFIG = {
    REPULSION_RADIUS: 70,
    REPULSION_STRENGTH: 5,
    RESIZE_DEBOUNCE: 150,
    TOUCH_RESET_DELAY: 100,
  };

  const links = document.querySelectorAll(".container a");
  const allLetters = [];
  const letterPositions = [];
  let animationFrameId = null;
  let currentMouseX = 0;
  let currentMouseY = 0;
  let activeTouch = false;
  let resizeTimeout = null;

  const initializeLetters = () => {
    for (let i = 0; i < links.length; i += 1) {
      const link = links[i];
      const text = link.textContent;
      const fragment = document.createDocumentFragment();

      text.split("").forEach((char) => {
        const span = document.createElement("span");
        span.className = "letter";
        span.textContent = char;
        span.style.display = char === " " ? "inline" : "inline-block";
        fragment.appendChild(span);

        if (char !== " ") {
          allLetters.push(span);
        }
      });

      link.textContent = "";
      link.appendChild(fragment);
    }
  };

  const cacheLetterPositions = () => {
    letterPositions.length = 0;

    for (let i = 0; i < allLetters.length; i += 1) {
      const rect = allLetters[i].getBoundingClientRect();
      letterPositions.push({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
  };

  const applyRepulsion = () => {
    const { REPULSION_RADIUS, REPULSION_STRENGTH } = CONFIG;
    const mouseX = currentMouseX;
    const mouseY = currentMouseY;

    for (let i = 0; i < allLetters.length; i += 1) {
      const letter = allLetters[i];
      const pos = letterPositions[i];

      const deltaX = pos.x - mouseX;
      const deltaY = pos.y - mouseY;
      const distanceSquared = deltaX * deltaX + deltaY * deltaY;
      const radiusSquared = REPULSION_RADIUS * REPULSION_RADIUS;

      if (distanceSquared < radiusSquared) {
        const distance = Math.sqrt(distanceSquared);
        const force = (REPULSION_RADIUS - distance) / REPULSION_RADIUS;
        const pushX = (deltaX / distance) * force * REPULSION_STRENGTH;
        const pushY = (deltaY / distance) * force * REPULSION_STRENGTH;

        letter.style.transform = `translate(${pushX}px, ${pushY}px)`;
      } else {
        letter.style.transform = "translate(0, 0)";
      }
    }

    animationFrameId = null;
  };

  const scheduleUpdate = (x, y) => {
    currentMouseX = x;
    currentMouseY = y;

    if (animationFrameId === null) {
      animationFrameId = requestAnimationFrame(applyRepulsion);
    }
  };

  const resetLetters = () => {
    for (let i = 0; i < allLetters.length; i += 1) {
      allLetters[i].style.transform = "translate(0, 0)";
    }
  };

  const handleMouseMove = (e) => scheduleUpdate(e.clientX, e.clientY);

  const handleTouchStart = (e) => {
    activeTouch = true;
    if (e.touches.length > 0) {
      scheduleUpdate(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (activeTouch && e.touches.length > 0) {
      e.preventDefault();
      scheduleUpdate(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    activeTouch = false;
    setTimeout(resetLetters, CONFIG.TOUCH_RESET_DELAY);
  };

  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(cacheLetterPositions, CONFIG.RESIZE_DEBOUNCE);
  };

  initializeLetters();
  cacheLetterPositions();

  window.addEventListener("resize", handleResize);
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("touchstart", handleTouchStart, { passive: false });
  document.addEventListener("touchmove", handleTouchMove, { passive: false });
  document.addEventListener("touchend", handleTouchEnd);
  document.addEventListener("touchcancel", handleTouchEnd);
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLinkEffects);
} else {
  initLinkEffects();
}
