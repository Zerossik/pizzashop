import { useState } from "./hooks/useState.js";

export class Modal {
  #defaultOptions = { title: "", closeBtn: null, renderTarget: "#modal-root" };
  #state;
  #modalInner;
  #content;
  constructor(selector = "modal", options) {
    this.BASE_SELECTOR = selector.replace(/[^a-zA-Z0-9_-]/g, "");
    // ТУТ должна вызваться виладатор настройки
    this.options = Object.assign(this.#defaultOptions, options);

    const initialState = {
      isOpen: false,
      title: this.options.title,
    };

    this.#state = useState(initialState, (target, prop, value) => {
      this.#render();
    });

    this.#createModal();
    this.attachEvents();

    //   ELEMENTS

    this.#modalInner = this.modal.querySelector(
      `.${this.BASE_SELECTOR}__inner`
    );
    this.modalTitle = this.modal.querySelector(`.${this.BASE_SELECTOR}__title`);

    this.modalRoot = document.querySelector(this.options.renderTarget);
    if (!this.modalRoot) {
      throw new Error(
        `Render target ${this.options.renderTarget} not found in DOM`
      );
    }
  }

  attachEvents() {
    this.modal.addEventListener("click", this.#handleClick);
  }

  #handleClick = (e) => {
    const clickedElement = e.target;
    if (clickedElement.matches(`.${this.BASE_SELECTOR}__close-btn`)) {
      this.close();
    }
  };

  show(htmlContent) {
    if (htmlContent && !(htmlContent instanceof HTMLElement))
      throw new TypeError("htmlContent must be an HTMLElement");
    this.#content = htmlContent;
    this.#state.isOpen = true;
    return this;
  }

  close() {
    this.#content = null;
    this.#state.isOpen = false;
    this.modal.remove();
  }

  setContent(newContent, isClearMOdal = false) {
    if (!(newContent instanceof HTMLElement))
      throw new TypeError("Content must be HTMLElement");

    this.#content = newContent;
    this.#render();
  }

  #createModal() {
    this.modal = document.createElement("div");
    this.modal.classList.add(this.BASE_SELECTOR);

    this.modal.innerHTML = `
      <div class="${this.BASE_SELECTOR}__backdrop">
        <div class="${this.BASE_SELECTOR}__content">
          <div class="${this.BASE_SELECTOR}__header">
            <p class="${this.BASE_SELECTOR}__title">${this.#state.title}</p>
              <button class="${this.BASE_SELECTOR}__close-btn">X</button>
            </div>
          <div class="${this.BASE_SELECTOR}__inner"></div>
        </div>
      </div>`;
  }

  set title(title) {
    if (!title || typeof title !== "string")
      throw new TypeError("title must be a string");
    this.#state.title = title;
  }

  #render() {
    this.modalTitle.textContent = this.#state.title;

    if (this.#content instanceof HTMLElement) {
      this.#modalInner.appendChild(this.#content);
    }

    if (this.#state.isOpen && !this.modalRoot.contains(this.modal)) {
      this.#modalInner.innerHTML = "";
      this.modalRoot.appendChild(this.modal);
    }
  }
}
