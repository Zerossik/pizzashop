import { useState } from "./hooks/useState.js";

export class Modal {
  #state;
  #modalInner;
  #content;
  constructor(selector = "modal", title = "") {
    if (typeof selector !== "string")
      throw new TypeError("selector must be a string");

    if (typeof title !== "string")
      throw new TypeError("title must be a string");

    this.BASE_SELECTOR = selector.replace(/[^a-zA-Z0-9_-]/g, "");

    const initialState = {
      isOpen: false,
      title: title,
    };

    this.#state = useState(initialState, (target, prop, value) => {
      this.#render(prop, value);
    });

    this.#createModal();

    //   ELEMENTS

    this.#modalInner = this.modal.querySelector(
      `.${this.BASE_SELECTOR}__inner`
    );
    this.modalTitle = this.modal.querySelector(`.${this.BASE_SELECTOR}__title`);

    this.modalRoot = document.querySelector("#modal-root");
    if (!this.modalRoot) {
      throw new Error(`Render target not found in DOM`);
    }
  }

  // Вешаю слушатели событий.
  #attachEvents() {
    // Вешаю обработчик кликов на модальное окно.
    this.modal.addEventListener("click", this.#handleClick);

    // Вешаю слушатель нажатия кнопок.
    document.addEventListener("keydown", this.#handleKeyPress);
  }

  // снимаю все слушатели событий
  #destroyEvent() {
    this.modal.removeEventListener("click", this.#handleClick);
    document.removeEventListener("keydown", this.#handleKeyPress);
  }

  // обработчик всех кликов.
  #handleClick = (e) => {
    const clickedElement = e.target;

    // Проверяю клик, если кнопка закрытия или backdrop, то закрываю модальное окно.
    if (
      clickedElement.matches(`.${this.BASE_SELECTOR}__close`) ||
      clickedElement.matches(`.${this.BASE_SELECTOR}__backdrop`)
    ) {
      console.log(clickedElement);
      this.#state.isOpen = false;
    }
  };

  // обработчик нажатий клавиш.
  #handleKeyPress = (e) => {
    const keyCode = e.code;

    if (keyCode === "Escape") {
      this.#state.isOpen = false;
    }
  };

  // Метод для отображения модального окна. Принимает HTMLElement. Если не передали, то модалка откроется пустая.
  show(htmlContent) {
    if (htmlContent && !(htmlContent instanceof HTMLElement))
      throw new TypeError("htmlContent must be an HTMLElement");
    this.#content = htmlContent;
    this.#attachEvents();
    this.#state.isOpen = true;
    return this;
  }

  // Метод закрытия модального окна.
  close() {
    this.#content = null;
    this.#state.isOpen = false;
  }

  // Метод для Изменения контента модального окна
  setContent(newContent, isClearMOdal = false) {
    if (!(newContent instanceof HTMLElement))
      throw new TypeError("Content must be HTMLElement");
    this.#content = newContent;
    this.#render();
  }

  // Создает модальное структуру модального окна.
  #createModal() {
    this.modal = document.createElement("div");
    this.modal.classList.add(this.BASE_SELECTOR);

    this.modal.innerHTML = `
      <div class="${this.BASE_SELECTOR}__backdrop">
        <div class="${this.BASE_SELECTOR}__content">
          <div class="${this.BASE_SELECTOR}__header">
            <p class="${this.BASE_SELECTOR}__title">${this.#state.title}</p>
              <button class="${this.BASE_SELECTOR}__close">
              <svg width="24" height="24">
                <use href="./images/icons.svg#icon-close" />
              </svg>
            </button>
            </div>
          <div class="${this.BASE_SELECTOR}__inner"></div>
        </div>
      </div>`;
  }

  // Сеттер для изменения заголовка модалки. Например modal.title = new Title
  set title(title) {
    if (!title || typeof title !== "string")
      throw new TypeError("title must be a string");
    this.#state.title = title;
  }

  // Вставляет модальное окно в ДОМ. Так же рендерит все изменения в UI
  #render(prop, value) {
    const { isOpen } = this.#state;

    if (prop === "title") {
      this.modalTitle.textContent = value;
      return;
    }

    if (isOpen) {
      if (this.#content instanceof HTMLElement) {
        this.#modalInner.replaceChild(this.#content);
      }
      if (!this.modalRoot.contains(this.modal)) {
        this.modalRoot.appendChild(this.modal);
        requestAnimationFrame(() => this.modal.classList.add("modal__show"));
        document.body.style.overflow = "hidden";
      }
    } else {
      this.modal.classList.remove("modal__show");
      document.body.style.removeProperty("overflow");
      this.#destroyEvent();
      setTimeout(() => this.modal.remove(), 200);
    }
  }
}

const modal = new Modal();

const btn = document.querySelector(".header__cart-btn");

btn.onclick = () => modal.show();
modal.title = "title";
