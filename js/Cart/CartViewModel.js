import { useData } from "../hooks/useData.js";
import { Observable } from "../helpers/Observable.js";
import { useState } from "../hooks/useState.js";
import { CartView } from "./CartView.js";

class CartModel extends Observable {
  #state = null;

  constructor() {
    super();
    this.#state = useState(
      { items: this.#getItemsFromLocalStorage() },
      this.#onChange
    );
  }

  #onChange = () => {
    this.#setItemsToLocalStorage(this.#state.items);
    this.notify();
  };

  /**
   * @param {{id: string, price: number, quantity: number, pizzaSize: string }} item
   */
  addItem(item) {
    const itemInterface = {
      id: "string",
      price: "number",
      quantity: "number",
      pizzaSize: "string",
    };
    //   Валидация объекта item
    Object.keys(itemInterface).forEach((key) => {
      if (!item[key]) throw new Error(`${key} is required`);
      if (typeof item[key] !== itemInterface[key])
        throw new TypeError(`${key} must be a ${itemInterface[key]}`);
    });

    const { id, price, quantity } = item;
    //   Проверяю, добавлен ли item в корзину. Если да, то обновляю данные, если нет, добавляю.
    const index = this.#state.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      const oldItem = this.#state.items[index];
      const newItem = {
        ...item,
        quantity: oldItem.quantity + quantity,
      };
      return (this.#state.items[index] = newItem);
    }
    // Добавляю в корзину
    this.#state.items.push(item);
  }

  /**
   * @param {{id: string, price: number, pizzaSize: string, quantity: number}} itemData
   */
  updateItem(itemData) {
    // Указываю тип полей itemData
    const itemDataInterface = {
      id: "string",
      price: "number",
      pizzaSize: "string",
      quantity: "number",
    };
    // Перебираю поля, и если тип не тот, выбрасываю оишбку.
    Object.keys(itemDataInterface).forEach((field) => {
      if (
        field === "id" &&
        (!itemData[field] ||
          typeof itemData[field] !== itemDataInterface[field])
      )
        throw new Error("id must be a string");

      if (
        itemData[field] &&
        typeof itemData[field] !== itemDataInterface[field]
      )
        throw new TypeError(`${field} must be a ${itemDataInterface[field]}`);
    });
    // После пройденной валидации обновляю item
    const { id } = itemData;
    const index = this.#state.items.findIndex((itemID) => itemID.id === id);
    if (index === -1) throw new Error(`item with ID - ${id} not found`);
    const updatedItem = { ...this.#state.items[index], ...itemData };
    this.#state.items.splice(index, 1, updatedItem);
  }

  /**
   * @param {string} id
   */
  removeItem(id) {
    if (typeof id !== "string") throw new TypeError("id must be a string");

    this.#state.items = this.#state.items.filter((item) => item.id !== id);
  }

  clearCart() {
    this.#state.items = [];
  }

  #setItemsToLocalStorage(items) {
    localStorage.setItem("items", JSON.stringify(items));
  }

  #getItemsFromLocalStorage() {
    return JSON.parse(localStorage.getItem("items")) ?? [];
  }

  get items() {
    return this.#state.items;
  }

  get totalPrice() {
    return this.#state.items.reduce(
      (acc, el) => (acc += el.price * el.quantity),
      0
    );
  }
}

export class CartViewModel extends Observable {
  #model = null;

  #data = [];
  constructor(model) {
    super();
    this.#model = model;

    this.#model.subscribe(this.#onChange);
    this.#updateData();
  }

  #onChange = () => {
    this.notify();
  };

  /**
   * @param {{id: string, price: number, quantity: number, pizzaSize: string }} item
   */
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

  #updateData = async () => {
    this.#data = await useData("./data/pizza.json");
    this.notify();
  };

  get items() {
    const result = this.#model.items.reduce((acc, item) => {
      const itemFullInfo = this.#data.find(
        ({ id }) => id.toString() === item.id
      );
      if (itemFullInfo) acc.push({ ...itemFullInfo, ...item });
      return acc;
    }, []);

    return result;
  }

  get totalPrice() {
    return Number(this.#model.totalPrice.toFixed(1));
  }
}

const Cart = new CartViewModel(new CartModel());
new CartView(Cart);
export default Cart;
