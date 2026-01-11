const initLinkEffects = () => {
  const CONFIG = {
    REPULSION_RADIUS: 70,
    REPULSION_STRENGTH: 5,
    RESIZE_DEBOUNCE: 150,
    TOUCH_RESET_DELAY: 100,
    IDLE_FLOAT_SPEED: 0.0006,
    IDLE_FLOAT_AMPLITUDE: 0.4,
    IDLE_DRIFT_AMPLITUDE: 0.3,
  };

  const RADIUS_SQUARED = CONFIG.REPULSION_RADIUS * CONFIG.REPULSION_RADIUS;
  const DRIFT_SPEED = CONFIG.IDLE_FLOAT_SPEED * 0.7;
  const TWO_PI = Math.PI * 2;

  const links = document.querySelectorAll(".container a");
  const allLetters = [];
  const letterPositions = [];
  const letterOffsets = [];
  let currentMouseX = 0;
  let currentMouseY = 0;
  let activeTouch = false;
  let resizeTimeout = null;
  let time = 0;
  let isAnimating = true;

  const initializeLetters = () => {
    for (let i = 0; i < links.length; i += 1) {
      const link = links[i];
      const text = link.textContent;
      const fragment = document.createDocumentFragment();
      const linkPhase = Math.random() * TWO_PI;

      const chars = text.split("");
      for (let j = 0; j < chars.length; j += 1) {
        const char = chars[j];
        const span = document.createElement("span");
        span.className = "letter";
        span.textContent = char;

        if (char === " ") {
          span.style.display = "inline";
        } else {
          span.style.display = "inline-block";
          allLetters.push(span);
          letterOffsets.push({
            phase: linkPhase + Math.random() * 0.5,
            amplitude: 0.8 + Math.random() * 0.4,
            halfPhase: (linkPhase + Math.random() * 0.5) * 0.5,
          });
        }
        fragment.appendChild(span);
      }

      link.textContent = "";
      link.appendChild(fragment);
    }
  };

  const cacheLetterPositions = () => {
    letterPositions.length = 0;

    for (let i = 0; i < allLetters.length; i += 1) {
      const rect = allLetters[i].getBoundingClientRect();
      letterPositions.push({
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.5,
      });
    }
  };

  const animate = (timestamp) => {
    if (!isAnimating) return;

    time = timestamp;
    const mouseX = currentMouseX;
    const mouseY = currentMouseY;
    const timeFloat = time * CONFIG.IDLE_FLOAT_SPEED;
    const timeDrift = time * DRIFT_SPEED;

    for (let i = 0; i < allLetters.length; i += 1) {
      const letter = allLetters[i];
      const pos = letterPositions[i];
      const offset = letterOffsets[i];

      // Calculate repulsion
      const deltaX = pos.x - mouseX;
      const deltaY = pos.y - mouseY;
      const distanceSquared = deltaX * deltaX + deltaY * deltaY;

      let pushX = 0;
      let pushY = 0;

      if (distanceSquared < RADIUS_SQUARED && distanceSquared > 0) {
        const distance = Math.sqrt(distanceSquared);
        const force =
          (CONFIG.REPULSION_RADIUS - distance) / CONFIG.REPULSION_RADIUS;
        const normalizedForce = (force * CONFIG.REPULSION_STRENGTH) / distance;
        pushX = deltaX * normalizedForce;
        pushY = deltaY * normalizedForce;
      }

      // Calculate idle animation
      const floatY =
        Math.sin(timeFloat + offset.phase) *
        CONFIG.IDLE_FLOAT_AMPLITUDE *
        offset.amplitude;
      const driftX =
        Math.cos(timeDrift + offset.halfPhase) *
        CONFIG.IDLE_DRIFT_AMPLITUDE *
        offset.amplitude;

      letter.style.transform = `translate(${pushX + driftX}px, ${pushY + floatY}px)`;
    }

    requestAnimationFrame(animate);
  };

  const updateMousePosition = (x, y) => {
    currentMouseX = x;
    currentMouseY = y;
  };

  const resetLetters = () => {
    const len = allLetters.length;
    for (let i = 0; i < len; i += 1) {
      allLetters[i].style.transform = "translate(0, 0)";
    }
  };

  const handleMouseMove = (e) => updateMousePosition(e.clientX, e.clientY);

  const handleTouchStart = (e) => {
    activeTouch = true;
    if (e.touches.length > 0) {
      updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (activeTouch && e.touches.length > 0) {
      e.preventDefault();
      updateMousePosition(e.touches[0].clientX, e.touches[0].clientY);
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

  window.addEventListener("resize", handleResize, { passive: true });
  document.addEventListener("mousemove", handleMouseMove, { passive: true });
  document.addEventListener("touchstart", handleTouchStart, { passive: false });
  document.addEventListener("touchmove", handleTouchMove, { passive: false });
  document.addEventListener("touchend", handleTouchEnd, { passive: true });
  document.addEventListener("touchcancel", handleTouchEnd, { passive: true });

  requestAnimationFrame(animate);

  return () => {
    isAnimating = false;
    window.removeEventListener("resize", handleResize);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("touchstart", handleTouchStart);
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
    document.removeEventListener("touchcancel", handleTouchEnd);
  };
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLinkEffects);
} else {
  initLinkEffects();
}
