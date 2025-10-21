import { Modal } from "./modal.js";
import { useState } from "./hooks/useState.js";

class Cart {
  #state;
  constructor(Modal) {
    if (Cart.instance) return Cart.instance;
    Cart.instance = this;

    this.modal = new Modal();
    const initialState = { isOpen: false, items: [] };

    this.#state = useState(initialState, (target, prop, value) => {});

    this.attachEvents();
  }

  attachEvents() {}

  openCart() {}

  addItem(item) {
    if (typeof item !== "object")
      throw new TypeError(
        "item must be an object with fields: title: string, pizzaSize: string, price: number, quantity: number, ingredients: array"
      );
    const requiredFields = [
      "title",
      "pizzaSize",
      "price",
      "quantity",
      "ingredients",
    ];
    requiredFields.forEach((field) => {
      if (!item[field]) throw new Error(`${field} is requred`);
    });

    this.#state.items.push(item);
  }

  removeItem(itemId) {}
}

const cart = new Cart(Modal);

const btn = document.querySelector(".header__cart-btn");

btn.onclick = (e) => {
  cart.openCart();
};

export default cart;
