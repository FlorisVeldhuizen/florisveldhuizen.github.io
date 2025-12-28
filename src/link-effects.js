// Sophisticated link letter repulsion effect
const initLinkEffects = () => {
  const links = document.querySelectorAll(".container a");
  const allLetters = [];
  let activeTouch = false;

  // Split text into individual letters for all links
  links.forEach((link) => {
    const text = link.textContent;
    link.textContent = "";

    text.split("").forEach((char) => {
      const span = document.createElement("span");
      span.className = "letter";
      span.textContent = char;
      span.style.display = char === " " ? "inline" : "inline-block";
      link.appendChild(span);

      if (char !== " ") {
        allLetters.push(span);
      }
    });
  });

  // Repulsion calculation function
  const applyRepulsion = (x, y) => {
    allLetters.forEach((letter) => {
      const letterRect = letter.getBoundingClientRect();
      const letterCenterX = letterRect.left + letterRect.width / 2;
      const letterCenterY = letterRect.top + letterRect.height / 2;

      const deltaX = letterCenterX - x;
      const deltaY = letterCenterY - y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Only apply effect within a certain radius
      const maxDistance = 70;
      if (distance < maxDistance) {
        const force = (maxDistance - distance) / maxDistance;
        const pushX = (deltaX / distance) * force * 5;
        const pushY = (deltaY / distance) * force * 5;

        letter.style.transform = `translate(${pushX}px, ${pushY}px)`;
      } else {
        letter.style.transform = "translate(0, 0)";
      }
    });
  };

  // Reset all letters
  const resetLetters = () => {
    allLetters.forEach((letter) => {
      letter.style.transform = "translate(0, 0)";
    });
  };

  // Mouse move handler
  const handleGlobalMouseMove = (e) => {
    applyRepulsion(e.clientX, e.clientY);
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    activeTouch = true;
    if (e.touches.length > 0) {
      applyRepulsion(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (activeTouch && e.touches.length > 0) {
      e.preventDefault(); // Prevent scrolling while interacting
      applyRepulsion(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    activeTouch = false;
    // Smooth reset after touch ends
    setTimeout(resetLetters, 100);
  };

  // Attach listeners
  document.addEventListener("mousemove", handleGlobalMouseMove);
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
