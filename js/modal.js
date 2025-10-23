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
      clickedElement.matches(`.${this.BASE_SELECTOR}__close-btn`) ||
      clickedElement.matches(`.${this.BASE_SELECTOR}__backdrop`)
    ) {
      this.close();
    }
  };

  // обработчик нажатий клавиш.
  #handleKeyPress = (e) => {
    const keyCode = e.code;

    if (keyCode === "Escape") {
      this.close();
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
    this.#destroyEvent();
    this.modal.remove();
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
              <button class="${this.BASE_SELECTOR}__close-btn">X</button>
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
  #render() {
    this.modalTitle.textContent = this.#state.title;

    if (this.#content instanceof HTMLElement) {
      this.#modalInner.appendChild(this.#content);
    }

    if (this.#state.isOpen && !this.modalRoot.contains(this.modal)) {
      this.modalRoot.innerHTML = "";
      this.modalRoot.appendChild(this.modal);
    }

    this.#state.isOpen
      ? (document.body.style.overflow = "hidden")
      : document.body.style.removeProperty("overflow");
  }
}
