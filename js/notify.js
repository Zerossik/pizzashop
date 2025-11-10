import { useState } from "./hooks/useState.js";

export class Notify {
  #state = null;
  #content = null;
  constructor() {
    this.#state = useState({ isOpen: false, content: "" }, this.#onChange);
    this.timeoutID = null;

    //   elements
    this.notifyEl = document.querySelector(".notify");

    if (!this.notifyEl || !(this.notifyEl instanceof HTMLElement))
      throw new TypeError("rootElement must be an HTMLElement");

    this.elements = {
      notifyContentEl: this.notifyEl.querySelector(".notify__content"),
    };

    this.#attachEvent();
  }

  #onChange = () => {
    this.render();
  };

  #attachEvent() {
    this.notifyEl.addEventListener("click", this.#handlerClick);
  }
  #handlerClick = (e) => {
    const clickedEl = e.target;

    if (clickedEl.classList.contains("notify__close")) {
      this.close();
    }
  };

  show(content) {
    if (!content || typeof content !== "string")
      throw new TypeError("content must be a string");
    if (this.timeoutID) {
      clearTimeout(this.timeoutID);
      this.timeoutID = null;
      this.#closeWithDelay();
    }
    this.#state.content = content;
    this.#state.isOpen = true;
  }

  close() {
    this.#state.isOpen = false;
  }

  #closeWithDelay() {
    if (this.timeoutID) return;
    this.timeoutID = setTimeout(() => {
      this.#state.isOpen = false;
      this.timeoutID = null;
    }, 3000);
  }

  render() {
    console.log("render");
    const { isOpen, content } = this.#state;

    if (isOpen) {
      this.elements.notifyContentEl.textContent = content;
      this.notifyEl.classList.add("notify--show");
      this.#closeWithDelay();
      return;
    }

    this.notifyEl.classList.remove("notify--show");
  }
}
