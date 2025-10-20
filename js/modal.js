import { useState } from "./hooks/useState.js";
export class Modal {
  #state;
  #modalInner;
  constructor(selector = ".modal") {
    this.modal = document.querySelector(selector);
    this.BASE_SELECTOR = selector;
    if (!this.modal) throw new Error("Modal element not found");

    const initialState = {
      isOpen: Boolean(this.modal.dataset.is_open),
    };

    this.#state = useState(initialState, (target, prop, value) => {
      this.render();
    });

    //   ELEMENTS
    this.#modalInner = this.modal.querySelector(`${this.BASE_SELECTOR}__inner`);

    this.attachEvents();
  }

  attachEvents() {
    this.modal.addEventListener("click", this.#handleClick);
  }

  #handleClick = (e) => {
    const clickedElement = e.target;

    if (clickedElement.matches(".modal .modal__close-btn")) {
      this.close();
    }
  };

  open() {
    this.#state.isOpen = true;
  }

  close() {
    this.#state.isOpen = false;
  }

  render(htmlContent) {
    this.modal.dataset.is_open = this.#state.isOpen;

    if (htmlContent instanceof HTMLElement) {
      this.#modalInner.appendChild(htmlContent);
    }

    if (htmlContent && typeof htmlContent === "string") {
      this.#modalInner.innerHTML = htmlContent;
    }
    return;
  }
}
