import { useData } from "../hooks/useData.js";
import { Observable } from "../helpers/Observable.js";
import { useState } from "../hooks/useState.js";
import { CartView } from "./CartView.js";
import CartModel from "./CartModel.js";

export class CartViewModel extends Observable {
  #model = null;
  constructor(model) {
    super();
    this.#model = model;
    this.#model.subscribe(this.#onChange);
  }

  #onChange = () => {
    this.notify();
  };

  addItem(item) {
    this.#model.addItem(item);
    return this;
  }
  /**
   * @param {string} id
   */
  removeItem(id) {
    this.#model.removeItem(id);
  }

  /**
   * @param {{id: string, price: number, pizzaSize: string, quantity: number}} itemData
   */
  updateItem(itemData) {
    this.#model.updateItem(itemData);
  }

  clearCart() {
    this.#model.clearCart();
  }

  openCart() {
    this.notify("open-cart");
  }
  getItemPriceById(id) {
    return this.#model.getItemPriceById(id);
  }

  get items() {
    return this.#model.items;
  }

  get totalPrice() {
    return Number(this.#model.totalPrice.toFixed(1));
  }
}

const Cart = new CartViewModel(CartModel);
new CartView(Cart);
export default Cart;
