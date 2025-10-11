import { useState } from "./hooks/useState.js";

export class PizzaCard {
  constructor(card, baseSelector = "pizza-card") {
    this.card = card;

    this.BASE_SELECTOR = baseSelector;

    this.initPrice = Number(this.card.dataset.price);

    const initialState = {
      basePrice: this.initPrice,
      isFliped: false,
      pizzaSize: "small",
      quantity: 1,
      ingredients: [],
    };

    this._state = useState(initialState, this.stateHandler);

    // ELEMENTS:
    this.priceElements = this.card.querySelectorAll(".price");

    this.quantityValue = this.card.querySelector(
      `.${this.BASE_SELECTOR}__counter-value`
    );

    this.attachEvents();
    this.stateHandler();
  }
  // HANDLERS
  stateHandler = (target, prop, value) => {
    this.quantityValue.textContent = this._state.quantity;
    this.priceElements.forEach((element) => {
      const value = element.querySelector(".price__value");
      value.textContent = this.totalPrice;
    });

    if (prop === "isFliped") {
      this.card.classList.toggle(this.BASE_SELECTOR + "--fliped");
    }
  };

  attachEvents() {
    this.card.addEventListener("click", this.handleClick);

    this.card.addEventListener("submit", this.handleSubmit);

    this.card.addEventListener("change", this.handlerChange);
  }

  handleClick = (event) => {
    const clickedElement = event.target;

    if (clickedElement.matches("." + this.BASE_SELECTOR + "__counter-btn")) {
      // метод matches проверяет, соответствует ли елемент указаному селектору. Вернет boolean
      this.setQuantity(clickedElement);
    }

    if (clickedElement.matches(`.${this.BASE_SELECTOR}__ingredients-btn`)) {
      this._state.isFliped = true;
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();

    this._state.isFliped = false;
  };

  handlerChange = (event) => {
    const changedElement = event.target;

    if (changedElement.matches(`input.${this.BASE_SELECTOR}__options-radio`)) {
      this.setPizzaSize(changedElement);
    }

    if (
      changedElement.matches(
        "input[type=checkbox][name=ingredient][data-price]"
      )
    ) {
      const { ingredients } = this._state;
      const id = changedElement.id;
      const ingredientPrice = Number(changedElement.dataset.price);
      const ingredientName = changedElement.value;

      if (!id || !ingredientPrice || !ingredientName) return;

      if (changedElement.checked) {
        this._state.ingredients.push({ id, ingredientName, ingredientPrice });

        return;
      }

      const index = ingredients.findIndex((el) => el.id === id);
      this._state.ingredients.splice(index, 1);
    }
  };

  setPizzaSize(clickedElement) {
    this._state.pizzaSize = clickedElement.value;
    this._state.basePrice = clickedElement.dataset.price;
  }

  setQuantity(clickedElement) {
    const action = clickedElement.dataset.action;

    switch (action) {
      case "increment":
        this._state.quantity++;
        break;
      case "decrement":
        if (this._state.quantity > 1) this._state.quantity--;
        break;
      default:
        new TypeError("action is wrong");
    }
  }

  get totalPrice() {
    const { ingredients } = this._state;
    const ingredientsPrice = ingredients.reduce((acc, { ingredientPrice }) => {
      return acc + ingredientPrice;
    }, 0);

    const totalPrice =
      (Number(this._state.basePrice) + ingredientsPrice) * this._state.quantity;
    return parseFloat(totalPrice).toFixed(1);
  }

  // UI METHODS:

  static render = (data) => {
    if (!data) return;

    const { small, medium, large } = data.options.reduce(
      (acc, { value, price }) => {
        acc[value] = parseFloat(price).toFixed(1);

        return acc;
      },
      {}
    );

    return `<div class="pizza-card" data-price=${small}>
          <div class="pizza-card__wrap">
            <div class="pizza-card__inner">
              <picture class="pizza-card__image-wrap">
                <img
                  src="./images/pizza-1.png"
                  alt="pizza image"
                  class="pizza-card__image"
              /></picture>
              <div class="pizza-card__front">
                <h3 class="pizza-card__title">Italian</h3>
                <p class="pizza-card__desc">
                  Filling: onion, potato, tomato, mushrooms, cheese, olives,
                  meat
                </p>
                <div class="pizza-card__actions">
                  <form class="pizza-card__options">
                    <label>
                      <input
                        type="radio"
                        name="pizza-card__option"
                        class="pizza-card__options-radio"
                        id="pizza-card__option-small"
                        value="small"
                        data-price=${small}
                        checked
                      />22</label
                    >

                    <!-- pizza-card__options-btn--active -->

                    <label>
                      <input
                        type="radio"
                        name="pizza-card__option"
                        class="pizza-card__options-radio"
                        id="pizza-card__option-medium"
                        value="medium"
                        data-price=${medium}
                      />28</label
                    >
                    <label>
                      <input
                        type="radio"
                        name="pizza-card__option"
                        class="pizza-card__options-radio"
                        id="pizza-card__option-large"
                        value="large"
                        data-price=${large}
                      />33</label
                    >
                  </form>
                  <button class="pizza-card__ingredients-btn">
                    + ingredients
                  </button>
                  <div class="pizza-card__price-wrap">
                    <div class="price"><span class="price__value">0</span><sup>$</sup></div>
                    <div class="pizza-card__counter">
                      <button
                        class="pizza-card__counter-btn"
                        data-action="decrement"
                      >
                        -
                      </button>
                      <span class="pizza-card__counter-value">1</span>
                      <button
                        class="pizza-card__counter-btn"
                        data-action="increment"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button class="pizza-card__order-btn">Order Now</button>
                </div>
              </div>
                <div class="pizza-card__back">
                  <p class="pizza-card__title-back">Choose ingredients:</p>
                <form class="pizza-card__form">
                  <div class="pizza-card__form-items-wrap">
                    ${data.toppings
                      .map(
                        ({ id, name, price }) => `
                        <div class="pizza-card__form-item-wrap">
                        <label>
                      <input type="checkbox" name="ingredient" data-price=${price} value=${name} id=${id} />
                      ${name}</label> <span>${price}<sup>$</sup></span></div>
                    `
                      )
                      .join(" ")}

                  </div>
                  <div>
                  <div class="pizza-card__price-wrap">
            <div class="price"><span class="price__value">0</span><sup>$</sup></div>
                      </div>
                  <button class="pizza-card__back-btn-submit">OK</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>`;
  };
}
