// Sophisticated link letter repulsion effect
const initLinkEffects = () => {
  const links = document.querySelectorAll(".container a");
  const allLetters = [];

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

  // Global mouse move handler - affects all links simultaneously
  const handleGlobalMouseMove = (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    allLetters.forEach((letter) => {
      const letterRect = letter.getBoundingClientRect();
      const letterCenterX = letterRect.left + letterRect.width / 2;
      const letterCenterY = letterRect.top + letterRect.height / 2;

      const deltaX = letterCenterX - mouseX;
      const deltaY = letterCenterY - mouseY;
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

  // Attach global listener
  document.addEventListener("mousemove", handleGlobalMouseMove);
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLinkEffects);
} else {
  initLinkEffects();
}
