import { Modal } from "./modal.js";
import { useState } from "./hooks/useState.js";
import { Counter } from "./counter.js";
import { useData } from "./hooks/useData.js";

class CartModel {
  #items = [];
  /**
   * @param {{id: string, price: number, quantity: number }} item
   */
  addItem(item) {
    const itemInterface = {
      id: "string",
      price: "number",
      quantity: "number",
    };
    //   Валидация объекта item
    Object.keys(itemInterface).forEach((key) => {
      if (!item[key]) throw new Error(`${key} is required`);
      if (typeof item[key] !== itemInterface[key])
        throw new TypeError(`${key} must be a ${itemInterface[key]}`);
    });

    const { id, price, quantity } = item;
    //   Проверяю, добавлен ли item в корзину. Если да, то обновляю данные, если нет, добавляю.
    const index = this.#items.findIndex((item) => item.id === id);
    if (index !== -1) {
      const oldItem = this.#items[index];
      const newItem = {
        ...this.#items[index],
        quantity: oldItem.quantity + quantity,
        price: price,
      };
      return (this.#items[index] = newItem);
    }
    // Добавляю в корзину
    this.#items.push(item);
  }

  /**
   * @param {string} id
   */
  removeItem(id) {
    if (typeof id !== "string") throw new TypeError("id must be a string");

    this.#items = this.#items.filter((item) => item.id !== id);
  }

  get items() {
    return this.#items;
  }

  get totalPrice() {
    return this.#items.reduce((acc, el) => (acc += el.price * el.quantity), 0);
  }
}

class CartViewModel {
  #model = null;
  #subscribers = new Set();
  #data = [];
  constructor(model) {
    this.#model = model;

    this.#updateData();
  }

  addItem(item) {
    this.#model.addItem(item);
    this.#updateData();
  }

  removeItem(id) {
    this.#model.removeItem(id);
    this.#updateData();
  }

  #updateData = async () => {
    this.#data = await useData("./data/pizza.json");
    this.#notify();
  };

  get items() {
    const itemsID = this.#model.items.map(({ id }) => id);

    return itemsID.map((itemID) =>
      this.#data.find(({ id }) => id.toString() === itemID)
    );
  }

  get totalPrice() {
    return this.#model.totalPrice;
  }

  // Добавляю подписчика в список. Возращаю фкнцию, которая отписывает
  subscribe = (fn) => {
    if (typeof fn !== "function")
      throw new TypeError("subscriber must be a function");

    this.#subscribers.add(fn);
    return () => this.#subscribers.delete(fn);
  };

  // Вызываю все подписчики
  #notify() {
    this.#subscribers.forEach((fn) => fn());
  }
}

// -------------------------------------------------------------

class CartView {
  #vievModel = null;
  #modal = null;
  #cartLayout = null;
  #cartList = null;
  constructor(cartVievModel) {
    this.#vievModel = cartVievModel;
    this.#vievModel.subscribe(this.#render);
    this.#modal = new Modal("Cart");

    const [cartContainer, cartList] = this.#createCartLayout();
    this.#cartLayout = cartContainer;
    this.#cartList = cartList;
  }

  openCart() {
    this.#modal.show(this.#cartLayout);
  }

  #createCartLayout() {
    // Главный контейнер корзины.
    const cartContainer = document.createElement("div");
    cartContainer.classList.add("cart");

    // Список для items. В этот список будут рендериться items
    const cartList = document.createElement("ul");
    cartList.classList.add("cart__list");
    // cartList.innerHTML = `<li class="cart__list-title">Your Cart is empty</li>`;

    const actionContainer = document.createElement("div");
    actionContainer.classList.add("cart__action-wrap");
    actionContainer.innerHTML = `
    <div class="price total-price" data-price="">
       <span class="price__value">0</span><sup>$</sup>
      </div>
      <div class="cart__to-checkout-link" data-disabled="true">
      <a href="./checkout.html">Proceed to checkout</a>
    </div>`;

    cartContainer.append(cartList, actionContainer);
    // Возращаю елементы
    return [cartContainer, cartList];
  }

  #render = () => {
    const items = this.#vievModel.items;
    const totalPrice = this.#vievModel.totalPrice;

    const totalPriceEl = this.#cartLayout.querySelector(
      ".price.total-price .price__value"
    );
    if (!totalPriceEl) throw new Error("totalPriceEl not Found");
    totalPriceEl.textContent = totalPrice;

    const toCheckoutBtn = this.#cartLayout.querySelector(
      ".cart__to-checkout-link"
    );
    if (toCheckoutBtn) toCheckoutBtn.dataset.disabled = !items.length;

    if (!items.length) {
      this.#cartList.innerHTML = `<li class="cart__list-title">Your Cart is empty</li>`;
      return;
    }
  };
}
const cartModel = new CartModel();
const cartViewModel = new CartViewModel(cartModel);
const cart = new CartView(cartViewModel);

const btn = document.querySelector(".header__cart-btn");

btn.onclick = (e) => {
  cart.openCart();
};
