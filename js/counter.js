import { useState } from "./hooks/useState.js";

export class Counter {
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

  constructor(counter, onChange, baseSelector = "counter") {
    if (!counter) return;
    this.counter = counter;
    this.BASE_SELECTOR = baseSelector;
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
      onChange?.(this.value);
    });

    this.attachEvents();
    this.render();
  }

  attachEvents() {
    this.counter.addEventListener("click", this.handlerClick);
    this.counter.addEventListener("change", this.handlerChange);
  }

  handlerClick = (e) => {
    const clickedElement = e.target;
    const { BASE_SELECTOR } = this;

    if (clickedElement.matches(`.${BASE_SELECTOR}__increment`)) {
      this.increment();
    }

    if (clickedElement.matches(`.${BASE_SELECTOR}__decrement`)) {
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
    this.#currentValue.value++;
  }

  decrement() {
    if (this.#currentValue.value <= this.#minValue) return;
    this.#currentValue.value--;
  }
  get value() {
    return this.#currentValue.value;
  }
  render = () => {
    const counterValueElement =
      this.counter.children.namedItem("counter-value");

    counterValueElement.value = this.#currentValue.value;
  };
}
