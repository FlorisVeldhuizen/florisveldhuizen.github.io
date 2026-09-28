const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

export class UI {
  constructor() {
    this.count = document.getElementById("count");
    this.countUnit = document.getElementById("count-unit");
    this.bursts = document.getElementById("bursts");
    this.meters = document.getElementById("meters");
    this.heatFill = document.getElementById("heat-fill");
    this.oilFill = document.getElementById("oil-fill");
    this.hintSwipe = document.getElementById("hint-swipe");
    this.hintRub = document.getElementById("hint-rub");
    this.hintGrab = document.getElementById("hint-grab");
    this.cursor = document.getElementById("cursor");
    this.ring = this.cursor.firstElementChild;
    this.comboLayer = document.getElementById("combos");
    this.vignette = document.getElementById("vignette");
    this.shownTension = 0;
    this.shownVignette = -1;
    this.shownHeat = -1;
    this.shownOil = -1;
    this.cursorState = undefined;
    this.cursorVisible = false;
    this.cursorVx = 0;
    this.cursorVy = 0;
    this.cursorStretched = false;
  }

  onSmack(total, combo, x, y) {
    this.count.textContent = total;
    this.countUnit.textContent = total === 1 ? "smack" : "smacks";
    this.meters.classList.add("is-visible");
    if (total >= 4) this.hintSwipe.classList.add("is-learned");
    if (!reducedMotion.matches) {
      this.count.animate(
        [{ transform: "scale(1.12)" }, { transform: "scale(1)" }],
        { duration: 260, easing: "cubic-bezier(.2,.9,.3,1.4)" },
      );
      this.ring.animate(
        [
          { transform: "scale(0.5)", borderWidth: "12px" },
          { transform: "scale(1)" },
        ],
        { duration: 220, easing: "ease-out" },
      );
    }
    if (combo >= 2) this.popCombo(x, y, combo);
  }

  popCombo(x, y, combo) {
    const label = document.createElement("span");
    label.className = "combo";
    label.textContent = `×${combo}`;
    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
    label.style.fontSize = `${Math.min(64, 22 + combo * 3)}px`;
    this.comboLayer.appendChild(label);
    const lift = reducedMotion.matches ? 0 : -48;
    label
      .animate(
        [
          { opacity: 0, transform: "translate(-50%, -30%) scale(0.7)" },
          {
            opacity: 1,
            transform: "translate(-50%, -80%) scale(1)",
            offset: 0.2,
          },
          {
            opacity: 0,
            transform: `translate(-50%, calc(-80% + ${lift}px)) scale(1)`,
          },
        ],
        { duration: 800, easing: "ease-out" },
      )
      .finished.then(() => label.remove());
  }

  onGrab() {
    this.hintGrab.classList.add("is-learned");
  }

  setGrabTension(tension) {
    const rounded = Math.round(tension * 50) / 50;
    if (rounded === this.shownTension) return;
    this.shownTension = rounded;
    this.cursor.style.setProperty("--tension", rounded);
  }

  onSnapback(x, y, amount) {
    if (reducedMotion.matches) return;
    this.ring.animate(
      [
        { transform: "scale(0.4)", borderWidth: "10px" },
        { transform: "scale(1)" },
      ],
      { duration: 280, easing: "cubic-bezier(.2,.9,.3,1.4)" },
    );
    const shock = document.createElement("span");
    shock.className = "shock";
    shock.style.left = `${x}px`;
    shock.style.top = `${y}px`;
    this.comboLayer.appendChild(shock);
    const size = 1.5 + amount * 3;
    shock
      .animate(
        [
          { opacity: 0.9, transform: "translate(-50%, -50%) scale(0.3)" },
          { opacity: 0, transform: `translate(-50%, -50%) scale(${size})` },
        ],
        { duration: 420, easing: "cubic-bezier(.1,.7,.3,1)" },
      )
      .finished.then(() => shock.remove());
  }

  onCharge() {
    this.meters.classList.add("is-visible");
    if (reducedMotion.matches) return;
    this.heatFill.parentElement.animate(
      [
        { scale: "1 5", filter: "brightness(2.2)" },
        { scale: "1 1", filter: "brightness(1)" },
      ],
      { duration: 480, easing: "cubic-bezier(.2,.9,.3,1.4)" },
    );
    this.meters.animate(
      [
        { transform: "translateX(-4px)" },
        { transform: "translateX(4px)" },
        { transform: "translateX(-2px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 240, easing: "ease-out" },
    );
  }

  onBurst(total) {
    this.bursts.textContent = total === 1 ? "1 burst" : `${total} bursts`;
    this.bursts.hidden = false;
  }

  setVignette(amount) {
    if (Math.abs(amount - this.shownVignette) < 0.01) return;
    this.shownVignette = amount;
    this.vignette.style.opacity = amount;
  }

  setTool(name) {
    this.cursor.dataset.tool = name;
  }

  onHeartbeat() {
    if (reducedMotion.matches) return;
    this.heatFill.parentElement.animate([{ scaleY: "1" }, { scaleY: "1.4" }, { scaleY: "1" }], {
      duration: 320,
      easing: "ease-in-out",
    });
  }

  onRub() {
    this.hintRub.classList.add("is-learned");
  }

  setMeters(heat, oil) {
    if (Math.abs(heat - this.shownHeat) > 0.004) {
      this.shownHeat = heat;
      this.heatFill.style.transform = `scaleX(${heat})`;
      this.meters.classList.toggle("is-hot", heat > 0.7);
    }
    if (Math.abs(oil - this.shownOil) > 0.004) {
      this.shownOil = oil;
      this.oilFill.style.transform = `scaleX(${oil})`;
      if (oil > 0) this.meters.classList.add("is-visible");
    }
  }

  placeCursor(x, y) {
    this.cursor.style.translate = `${x}px ${y}px`;
  }

  shapeCursor(vx, vy, visible, delta) {
    if (visible !== this.cursorVisible) {
      this.cursorVisible = visible;
      this.cursor.classList.toggle("is-visible", visible);
    }
    const ease = 1 - Math.exp(-delta * 14);
    this.cursorVx += (vx - this.cursorVx) * ease;
    this.cursorVy += (vy - this.cursorVy) * ease;
    const speed = Math.hypot(this.cursorVx, this.cursorVy);
    const stretch = 1 + Math.min(0.45, Math.max(0, speed - 0.6) * 0.12);
    if (stretch < 1.005) {
      if (this.cursorStretched) {
        this.cursorStretched = false;
        this.cursor.style.scale = "1";
      }
      return;
    }
    this.cursorStretched = true;
    const angle = Math.atan2(this.cursorVy, this.cursorVx);
    this.cursor.style.rotate = `${angle}rad`;
    this.cursor.style.scale = `${stretch} ${1 / stretch}`;
  }

  setCursorState(state) {
    if (state === this.cursorState) return;
    this.cursorState = state;
    this.cursor.dataset.state = state || "";
  }
}
