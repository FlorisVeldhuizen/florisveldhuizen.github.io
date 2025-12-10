let sloth;
let slothMessage;
let patience;
let growth;
let isMoving = false;
let isHovering = false;
let hideMessageTimeout = null;
const responses = [
  "Ouch, stop pressing me!",
  "Hey, I warned you, quit it...",
  "Alright, now I am getting angry!",
  "I am going to get you!",
  "You're really testing my patience...",
  "Do you WANT me to be angry?!",
  "I'm a SLOTH, not a stress ball!",
  "That's it, I'm moving AGAIN!",
];

const hoverMessages = [
  "...",
  "What?",
  "Can I help you?",
  "Stop staring at me.",
  "This is awkward.",
  "Personal space, please.",
];

const movethatsloth = () => {
  // Hide any existing message
  if (hideMessageTimeout) {
    clearTimeout(hideMessageTimeout);
  }
  slothMessage.classList.remove("show");

  const maxTop = window.innerHeight - sloth.offsetHeight;
  const maxRight = window.innerWidth - sloth.offsetWidth;
  sloth.style.top = `${Math.max(0, Math.floor(Math.random() * maxTop))}px`;
  sloth.style.right = `${Math.max(0, Math.floor(Math.random() * maxRight))}px`;

  isMoving = true;
  sloth.style.pointerEvents = "none";

  setTimeout(() => {
    isMoving = false;
    sloth.style.pointerEvents = "auto";
  }, 800);
};

const showMessage = (text, duration = 2000) => {
  // Clear any existing timeout
  if (hideMessageTimeout) {
    clearTimeout(hideMessageTimeout);
  }

  slothMessage.classList.remove("show");

  setTimeout(() => {
    slothMessage.textContent = text;

    const rect = sloth.getBoundingClientRect();
    const messageWidth = 200;
    const messageHeight = 60;
    const offset = 15;

    // Center the message under the sloth (accounts for sloth's actual size)
    let left = rect.left + rect.width / 2 - messageWidth / 2;
    let top = rect.bottom + offset;

    // Keep message on screen
    if (left + messageWidth > window.innerWidth - 20) {
      left = window.innerWidth - messageWidth - 20;
    }
    if (left < 20) {
      left = 20;
    }
    if (top + messageHeight > window.innerHeight - 20) {
      top = rect.top - messageHeight - offset;
    }

    top = Math.max(20, top);

    slothMessage.style.left = `${left}px`;
    slothMessage.style.top = `${top}px`;
    slothMessage.classList.add("show");

    hideMessageTimeout = setTimeout(() => {
      slothMessage.classList.remove("show");
    }, duration);
  }, 50);
};

const stoptouching = (e) => {
  e.preventDefault();
  if (isMoving) return;

  // Add squish effect
  sloth.classList.add("squish");
  setTimeout(() => sloth.classList.remove("squish"), 300);

  // Grow the sloth
  if (patience > 1) {
    sloth.style.fontSize = `${Math.min(patience * growth, 150)}px`;
  }

  // Add rocking and red glow when getting angry (after 2+ clicks)
  if (patience > 2) {
    sloth.classList.add("angry");
  }

  // Move the sloth
  movethatsloth();

  // Show message AFTER sloth has moved (800ms transition)
  const messageIndex = Math.min(patience, responses.length - 1);
  setTimeout(() => {
    showMessage(responses[messageIndex]);
  }, 850);

  patience += 1;
};

const handleHover = () => {
  if (
    !isHovering &&
    !isMoving &&
    patience > 0 &&
    !slothMessage.classList.contains("show")
  ) {
    isHovering = true;
    const randomMessage =
      hoverMessages[Math.min(patience - 1, hoverMessages.length - 1)];
    showMessage(randomMessage, 2000); // Linger for 2 seconds
  }
};

const handleHoverOut = () => {
  isHovering = false;
};

window.onload = function initSloth() {
  patience = 0;
  growth = 20;
  sloth = document.getElementById("secretsloth");
  slothMessage = document.getElementById("sloth-message");

  sloth.addEventListener("click", stoptouching);
  sloth.addEventListener("mouseenter", handleHover);
  sloth.addEventListener("mouseleave", handleHoverOut);
  sloth.addEventListener("touchstart", (e) => {
    e.preventDefault();
    stoptouching(e);
  });
};
