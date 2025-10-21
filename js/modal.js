import { useState } from "./hooks/useState.js";

export class Modal {
  #state;
  #modalInner;
  #content;

  constructor(title = "", selector = ".modal") {
    this.BASE_SELECTOR = selector;

    const initialState = {
      isOpen: false,
      title: title,
    };

    this.#state = useState(initialState, (target, prop, value) => {
      this.#render();
    });

    this.#createModal();

    //   ELEMENTS
    this.#modalInner = this.modal.querySelector(`${this.BASE_SELECTOR}__inner`);
    this.title = this.modal.querySelector(`${this.BASE_SELECTOR}__title`);
    this.modalRoot = document.getElementById("modal-root");
  }

  attachEvents() {
    this.modal.addEventListener("click", this.#handleClick);
  }

  #handleClick = (e) => {
    const clickedElement = e.target;

    if (clickedElement.matches(".modal__close-btn")) {
      console.log(clickedElement);
      this.close();
    }
  };

  show(htmlContent) {
    if (htmlContent) this.#content = htmlContent;
    this.#state.isOpen = true;
    return this.#state.isOpen;
  }

  close() {
    this.modal.remove();

    return this.#state.isOpen;
  }

  #createModal() {
    this.modal = document.createElement("div");
    this.modal.classList.add(this.BASE_SELECTOR);
    this.attachEvents();

    this.modal.innerHTML = `
      <div class="modal__backdrop">
        <div class="modal__content">
          <div class="modal__header">
            <p class="modal__title">${this.#state.title}</p>
            <button class="modal__close-btn">X</button>
          </div>
          <div class="modal__inner"></div>
        </div>
      </div>`;
  }

  #render() {
    if (this.#content instanceof HTMLElement) {
      this.#modalInner.appendChild(this.#content);
    }

    this.modalRoot.appendChild(this.modal);
  }
}

const modal = new Modal();
const div = document.createElement("div");
div.innerHTML = "HELLO";
modal.show(div);
