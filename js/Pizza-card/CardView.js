import CardModel from "./CardModel.js";
import CardViewModel from "./CardViewModel.js";
import { Counter } from "../counter.js";
import CartViewModel from "../Cart/CartViewModel.js";

/**
 * @param {HTMLElement} card
 */

class CardView {
  #elements = {};
  #cart;
  constructor(rootElement, CardViewModel, CartViewModel) {
    this.card = rootElement;
    this.viewModel = CardViewModel;
    this.#cart = CartViewModel;
    this.viewModel.subscribe(this.#onChange);
    this.isFliped = false;

    this.#elements = {
      counter: this.card.querySelector(".counter"),
      prices: this.card.querySelectorAll(".price__value"),
    };
    //   Here will be a fn with walidatio

    this.counter = new Counter(this.#elements.counter);
    this.counter.subscribe(this.#onCaunter);

    this.#attachEvent();
    this.render();
  }
  #onChange = () => {
    this.render();
  };
  #onCaunter = (value) => {
    this.viewModel.updateData({ quantity: value });
  };
  #attachEvent() {
    this.card.addEventListener("click", this.#handlerClick);
    this.card.addEventListener("submit", this.#handlerSubmit);
    this.card.addEventListener("change", this.#handlerChange);
  }

  #handlerClick = (e) => {
    const clickedEl = e.target;
    if (clickedEl.classList.contains("pizza-card__ingredients-btn")) {
      this.card.classList.add("pizza-card--fliped");
    }
    if (clickedEl.classList.contains("pizza-card__order-btn")) {
      const cardData = this.viewModel.getCardData();
      const offerID = `${cardData.id}-${cardData.pizzaSize}`;

      const item = {
        ...cardData,
        id: offerID,
      };
      this.#cart.addItem(item).openCart();
    }
  };
  #handlerSubmit = (e) => {
    const submitEl = e.target;
    e.preventDefault();
    this.card.classList.remove("pizza-card--fliped");
  };

  #handlerChange = (event) => {
    const changedElement = event.target;

    if (changedElement.matches(`input.pizza-card__options-radio`)) {
      this.viewModel.updateData({ pizzaSize: changedElement.value });
    }

    if (
      changedElement.matches(".pizza-card__form-item-wrap input[type=checkbox]")
    ) {
      const ingredientName = changedElement.value;

      if (changedElement.checked) {
        this.viewModel.addIngredient(ingredientName);
        return;
      }
      this.viewModel.removeIngredient(ingredientName);
    }
  };
  render() {
    this.#elements.prices.forEach(
      (price) => (price.textContent = this.viewModel.totalPrice.toFixed(1))
    );
  }
}

function initCard(card) {
  if (!(card instanceof HTMLElement))
    throw new TypeError("card must be an HTMLElement");
  const { title, options, ingredients } = card.dataset;

  const initialState = {
    id: card.id,
    title,
    optionPrices: JSON.parse(options),
    ingredientPrices: JSON.parse(ingredients),
    image: card.querySelector(".pizza-card__image")?.getAttribute("src"),
    quantity: Number(card.querySelector(".counter")?.dataset.init_value),
    pizzaSize: card.querySelector("input.pizza-card__options-radio[checked]")
      ?.value,
    addedIngredients: [],
  };

  const model = new CardModel(initialState);
  const viewModel = new CardViewModel(model);
  new CardView(card, viewModel, CartViewModel);
}

document.querySelectorAll(".pizza-card").forEach((card) => initCard(card));
