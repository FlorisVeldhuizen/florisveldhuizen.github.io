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
    this.text.id = "modal-text";
    this.card.setAttribute("aria-describedby", this.text.id);
    this.body = el("div", "modal-body", this.card);
    this.actions = el("div", "modal-actions", this.card);
    this.root.addEventListener("click", (e) => {
      if (e.target === this.root) this.leave();
    });
    document.addEventListener("keydown", (e) => {
      if (this.root.hidden) return;
      if (e.key === "Escape") this.leave();
      if (e.key === "Tab") this.trap(e);
    });
    this.queue = [];
  }

  show(options) {
    if (!this.root.hidden) {
      this.queue.push(options);
      return;
    }
    const { title, text, body, variant, buttons, onShow } = options;
    this.returnFocus = document.activeElement;
    this.card.className = `modal-card${variant ? ` is-${variant}` : ""}`;
    this.title.textContent = title;
    this.text.textContent = text || "";
    this.text.hidden = !text;
    this.body.replaceChildren(...(body ? [body] : []));
    this.body.hidden = !body;
    this.actions.replaceChildren();
    let first = null;
    buttons.forEach(({ label, primary, danger, onClick }) => {
      const b = el(
        "button",
        `modal-button${primary ? " is-primary" : ""}${danger ? " is-danger" : ""}`,
        this.actions,
      );
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", () => {
        animate(
          b,
          [{ scale: 1 }, { scale: 0.9 }, { scale: 1.06 }, { scale: 1 }],
          { duration: 280, easing: "ease-out" },
        );
        this.leave(onClick, 110);
      });
      if (primary) first = b;
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
    (first || this.actions.firstElementChild)?.focus();
    onShow?.();
  }

  trap(e) {
    const buttons = [...this.actions.children];
    const at = buttons.indexOf(document.activeElement);
    const step = e.shiftKey ? -1 : 1;
    e.preventDefault();
    buttons[(at + step + buttons.length) % buttons.length]?.focus();
  }

  leave(then, delay = 0) {
    if (this.root.hidden || this.leaving) return;
    this.leaving = true;
    const timing = {
      duration: 200,
      delay,
      easing: "ease-in",
      fill: "forwards",
    };
    const fades = [
      animate(this.root, [{ opacity: 1 }, { opacity: 0 }], timing),
      animate(
        this.card,
        [{ transform: "none" }, { transform: "translateY(-10px) scale(0.96)" }],
        timing,
      ),
    ];
    fades[0].finished.then(() => {
      this.leaving = false;
      this.close();
      fades.forEach((fade) => fade.cancel());
      then?.();
    });
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
