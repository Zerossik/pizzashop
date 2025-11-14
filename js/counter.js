import { useState } from "./hooks/useState.js";
import { Observable } from "./helpers/Observable.js";

export class Counter extends Observable {
  /**
   *
   * @param {HTMLElement} counter
   * @param {(value: number)=> void} onChange
   * @param {string} baseSelector
   */

  #minValue;
  #maxValue;
  #initValue;
  #currentValue;

  constructor(counter) {
    if (!counter) return;
    super();
    this.counter = counter;
    const { min_value, max_value, init_value } = this.counter.dataset;

    const min = parseInt(min_value);
    const max = parseInt(max_value);
    const init = parseInt(init_value);

    if (Number.isNaN(min))
      throw new TypeError('"data-min_value" must be a number.');

    if (Number.isNaN(max))
      throw new TypeError('"data-max_value" must be a number.');

    if (Number.isNaN(init))
      throw new TypeError('"data-init_value" must be a number.');

    this.#minValue = min || 1;
    this.#maxValue = max || 99;
    this.#initValue = init || this.#minValue;

    this.#currentValue = useState(this.#initValue, () => {
      this.render();
      this.notify(this.#currentValue.value);
    });

    this.attachEvents();
    this.render();
  }

  attachEvents() {
    this.counter.addEventListener("click", this.handlerClick);
    this.counter.addEventListener("change", this.handlerChange);
  }

  destroy() {
    this.counter.removeEventListener("click", this.handlerClick);
    this.counter.removeEventListener("change", this.handlerChange);
    this.counter = null;
  }

  handlerClick = (e) => {
    const clickedElement = e.target;

    if (clickedElement.matches(`.counter__increment`)) {
      this.increment();
    }

    if (clickedElement.matches(`.counter__decrement`)) {
      this.decrement();
    }
  };

  handlerChange = (e) => {
    const changedElement = e.target;
    let value = parseInt(changedElement.value);
    if (Number.isNaN(value)) value = this.#currentValue.value;
    if (value > this.#maxValue) value = this.#maxValue;
    if (value < this.#minValue) value = this.#minValue;

    changedElement.value = value;
    this.#currentValue.value = value;
  };

  increment() {
    if (this.#currentValue.value >= this.#maxValue) return;
    requestAnimationFrame(() => this.#currentValue.value++);
  }

  decrement() {
    if (this.#currentValue.value <= this.#minValue) return;
    requestAnimationFrame(() => this.#currentValue.value--);
  }
  get value() {
    return this.#currentValue.value;
  }

  /**
   *
   * @param {number} value
   * @returns {number} - new Value
   */
  updateValue(value) {
    if (typeof value !== "number" || isNaN(value))
      throw new TypeError("counter value must be a number");
    if (value < this.#minValue)
      throw new Error(`counter value can not be less than ${this.#minValue}`);
    if (value > this.#maxValue)
      throw new Error(`counter value can not be more than ${this.#maxValue}`);

    this.#currentValue.value = value;
    return value;
  }

  render = () => {
    const counterValueElement =
      this.counter.children.namedItem("counter-value");

    counterValueElement.value = this.#currentValue.value;
  };
}
