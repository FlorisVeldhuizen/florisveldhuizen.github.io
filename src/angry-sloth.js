let sloth;
let slothMessage;
let patience;
let currentScale = 1;
let isMoving = false;
let isHovering = false;
let hideMessageTimeout = null;
let typewriterTimeout = null;
const maxScale = 10;
const responses = [
  "Ouch, stop pressing me!",
  "Hey, I warned you, quit it...",
  "Alright, now I am getting angry!",
  "I am going to get you!",
  "You're really testing my patience...",
  "Do you WANT me to be angry?!",
  "I'm a SLOTH, not a stress ball!",
  "That's it, I'm moving AGAIN!",
  "Seriously, what the hell is wrong with you?!",
  "You're being a real pain in my furry ass!",
  "I'm going to lick all your spoons and put them back!",
  "I'm going to breathe on all your glasses and mirrors!",
  "I'm going to hide all your left socks, forever!",
  "I'll slightly loosen every jar in your house!",
  "I'll unplug your phone charger RIGHT before it hits 100%!",
  "I'll warm up both sides of your pillow, permanently!",
  "I'll subscribe you to 47 different email lists!",
  "I'm going to make all your bananas ripen at the same time!",
  "I'll eat the last bite of everything in your fridge!",
  "I'm going to swap your salt and sugar containers!",
  "I'll make your tea always slightly too hot or too cold!",
  "I'm going to replace your shampoo with mayonnaise!",
  "I'll set all your alarms to 3AM, watch me!",
  "I'm going to make your coffee taste like dirty feet!",
  "I'll make your toilet paper roll backwards forever!",
  "I'll make sure every USB you use takes 3 tries to plug in!",
  "I'll program your autocorrect to always say 'moist'!",
  "I'll make your headphones tangle EVERY. SINGLE. TIME.",
  "I'll make all your pens run out of ink mid-sentence!",
  "I'll desync the audio on every video you watch!",
  "I'll ensure every traffic light turns red as you approach!",
  "I'll make every shopping cart you use have a wonky wheel!",
  "I'll reorganize your apps while you sleep, enjoy!",
  "I'm going to spoil every movie plot twist before you see it!",
  "I'll put a single popcorn kernel in every shoe you own!",
  "I'll hide tiny Legos in your carpet, you monster!",
  "I'm going to hide small amounts of glitter everywhere you own!",
  "I'm going to move all your furniture 2 inches to the left!",
  "I'm going to take a shit on your pillow while you sleep!",
  "YOU AND THE TREE YOU HANG FROM ARE ON MY LIST!",
];

const hoverMessages = [
  "...",
  "What?",
  "Can I help you?",
  "This is awkward.",
  "Do you mind?",
  "Stop staring at me.",
  "Personal space, please.",
  "This is my personal bubble.",
  "Dude, seriously?",
  "What do you want?",
  "I can feel you staring.",
  "I'm not a zoo animal.",
  "Take a picture, it'll last longer.",
  "You're creeping me out...",
  "Stop hovering, weirdo!",
  "Why are you like this?",
  "I'm judging your mouse movement.",
  "Your cursor smells like cheese.",
  "I'm going to breathe on your screen.",
  "I'll remember your cursor position forever.",
  "I'm telling the other pixels about you.",
  "Are we gonna have a problem?",
  "I'm too slow to deal with this.",
];

const movethatsloth = () => {
  // Hide any existing message and stop typing
  if (hideMessageTimeout) {
    clearTimeout(hideMessageTimeout);
  }
  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout);
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

const typeWriter = (text, element, callback) => {
  const chars = text.split("");
  let currentCharIndex = 0;

  // Clear any existing typewriter
  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout);
  }

  const messageElement = element;
  messageElement.textContent = "";

  const typeNextChar = () => {
    if (currentCharIndex < chars.length) {
      messageElement.textContent += chars[currentCharIndex];
      currentCharIndex += 1;

      // Slothy speed - slower when calm, faster as sloth gets angrier
      let baseDelay = 50;
      if (patience >= 15) {
        baseDelay = 20;
      } else if (patience >= 5) {
        baseDelay = 30;
      }

      // Add slight randomness for natural feel
      const delay = baseDelay + Math.random() * 15;

      typewriterTimeout = setTimeout(typeNextChar, delay);
    } else if (callback) {
      callback();
    }
  };

  typeNextChar();
};

const showMessage = (text, duration = 2000) => {
  // Clear any existing timeouts
  if (hideMessageTimeout) {
    clearTimeout(hideMessageTimeout);
  }
  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout);
  }

  slothMessage.classList.remove("show");

  setTimeout(() => {
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

    // Type out the message word by word
    typeWriter(text, slothMessage, () => {
      // After typing is done, wait before hiding
      hideMessageTimeout = setTimeout(() => {
        slothMessage.classList.remove("show");
      }, duration);
    });
  }, 50);
};

const stoptouching = (e) => {
  e.preventDefault();
  if (isMoving) return;

  // Add squish effect
  sloth.classList.add("squish");
  setTimeout(() => sloth.classList.remove("squish"), 300);

  // Grow the sloth using scale instead of fontSize for better mobile performance
  if (patience >= 1) {
    currentScale = Math.min(1 + patience * 0.4, maxScale); // Grows from 1x to 3x
    sloth.style.setProperty("--sloth-scale", currentScale);
    sloth.style.transform = `scale(${currentScale})`;
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
    const maxIndex = Math.min(patience - 1, hoverMessages.length - 1);
    const randomIndex = Math.floor(Math.random() * (maxIndex + 1));
    const randomMessage = hoverMessages[randomIndex];
    showMessage(randomMessage, 2000); // Linger for 2 seconds
  }
};

const handleHoverOut = () => {
  isHovering = false;
};

window.onload = function initSloth() {
  patience = 0;
  currentScale = 1;
  sloth = document.getElementById("secretsloth");
  slothMessage = document.getElementById("sloth-message");

  // Initialize CSS variable for scale
  sloth.style.setProperty("--sloth-scale", currentScale);

  sloth.addEventListener("click", stoptouching);
  sloth.addEventListener("mouseenter", handleHover);
  sloth.addEventListener("mouseleave", handleHoverOut);
  sloth.addEventListener("touchstart", (e) => {
    e.preventDefault();
    stoptouching(e);
  });
};
