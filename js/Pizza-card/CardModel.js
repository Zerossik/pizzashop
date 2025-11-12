import { useState } from "../hooks/useState.js";
import { Observable } from "../helpers/Observable.js";
class CardModel extends Observable {
  #state = null;

  constructor(initialState = {}) {
    super();

    this.#state = useState(initialState, this.#onChange);
  }

  #onChange = () => {
    this.notify();
  };

  /**
   * @param {{id: string, image: string, ingredients: object, options: object, quantity: number, title: string}} newData
   */
  updateData(newData) {
    Object.assign(this.#state, newData);
  }

  /**
   * @param {string} value
   */
  addIngredient(value) {
    if (!value || typeof value !== "string")
      throw new TypeError("ingredient value must be a string");
    if (this.#state.addedIngredients.includes(value)) {
      return;
    }
    this.#state.addedIngredients.push(value);
  }

  removeIngredient(value) {
    const index = this.#state.addedIngredients.findIndex(
      (item) => item === value
    );
    if (index === -1) return;
    this.#state.addedIngredients.splice(index, 1);
  }

  getCardData() {
    return JSON.parse(JSON.stringify(this.#state));
  }

  get totalPrice() {
    const {
      pizzaSize,
      optionPrices,
      quantity,
      addedIngredients,
      ingredientPrices,
    } = this.#state;

    const ingredientsPrice = addedIngredients.reduce(
      (acc, el) => (acc += ingredientPrices[el]),
      0
    );
    return (optionPrices[pizzaSize] + ingredientsPrice) * quantity;
  }
  get basePrice() {
    const { pizzaSize, optionPrices } = this.#state;
    return optionPrices[pizzaSize];
  }
}

export default CardModel;
