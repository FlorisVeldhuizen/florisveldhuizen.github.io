import { el, animate } from "./dom";

export class Modal {
  constructor() {
    this.root = el("div", "ui modal", document.body);
    this.root.hidden = true;
    this.card = el("div", "modal-card", this.root);
    this.card.setAttribute("role", "dialog");
    this.card.setAttribute("aria-modal", "true");
    this.title = el("h2", "modal-title", this.card);
    this.title.id = "modal-title";
    this.card.setAttribute("aria-labelledby", this.title.id);
    this.text = el("p", "modal-text", this.card);
    this.actions = el("div", "modal-actions", this.card);
    this.root.addEventListener("click", (e) => {
      if (e.target === this.root) this.close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !this.root.hidden) this.close();
    });
    this.queue = [];
  }

  show({ title, text, buttons }) {
    if (!this.root.hidden) {
      this.queue.push({ title, text, buttons });
      return;
    }
    this.returnFocus = document.activeElement;
    this.title.textContent = title;
    this.text.textContent = text;
    this.actions.replaceChildren();
    buttons.forEach(({ label, primary, danger, onClick }) => {
      const b = el(
        "button",
        `modal-button${primary ? " is-primary" : ""}${danger ? " is-danger" : ""}`,
        this.actions,
      );
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", () => {
        this.close();
        onClick?.();
      });
    });
    this.root.hidden = false;
    animate(
      this.card,
      [
        { opacity: 0, transform: "translateY(12px) scale(0.97)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 260, easing: "cubic-bezier(.2,.9,.3,1.2)" },
    );
    this.actions.lastElementChild?.focus();
  }

  close() {
    if (this.root.hidden) return;
    this.root.hidden = true;
    this.returnFocus?.focus?.();
    const next = this.queue.shift();
    if (next) this.show(next);
  }

  confirm({ title, text, yes, danger = false, onYes }) {
    this.show({
      title,
      text,
      buttons: [
        { label: "Not yet" },
        { label: yes, primary: !danger, danger, onClick: onYes },
      ],
    });
  }

  info(title, text, label = "Lovely") {
    this.show({ title, text, buttons: [{ label, primary: true }] });
  }
}
