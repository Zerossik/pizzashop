import { Observable } from "../helpers/Observable.js";

const itemInterface = {
  id: "string",
  title: "string",
  image: "string",
  ingredientPrices: "object",
  optionPrices: "object",
  pizzaSize: "string",
  quantity: "number",
  addedIngredients: "object",
};

class CartModel extends Observable {
  #items = new Map(Object.entries(this.#getItemsFromLocalStorage()));

  constructor() {
    super();
    this.subscribe(this.#onChange);
  }

  #onChange = () => {
    this.#setItemsToLocalStorage(Object.fromEntries(this.#items));
  };

  /**
   * @param {{id: string, quantity: number, pizzaSize: string }} item
   */
  addItem(item) {
    //   Валидация объекта item
    this.#validateItem(item);

    // Если такой товар уже есть в корзине, обновляем его
    const existingItem = this.#items.get(item.id);
    if (existingItem) {
      const quantity = existingItem.quantity + item.quantity;
      return this.updateItem({ ...item, quantity });
    }

    // Добавляем
    this.#items.set(item.id, item);
    this.notify();
    return item;
  }

  /**
   * @param {{id: string, price: number, pizzaSize: string, quantity: number}} itemData
   */
  updateItem(itemData) {
    const { id } = itemData;
    if (typeof id !== "string") throw new TypeError("id must be a string");

    const oldItem = this.#items.get(id);
    if (!oldItem) throw new Error(`item with ${id} not found`);

    const newItem = { ...oldItem, ...itemData };
    this.#validateItem(newItem);

    this.#items.set(id, newItem);
    this.notify();

    return newItem;
  }

  /**
   * @param {string} id
   */
  removeItem(id) {
    if (typeof id !== "string") throw new TypeError("id must be a string");
    this.#items.delete(id);
    this.notify();
  }

  clearCart() {
    this.#items.clear();
    this.notify();
  }

  #setItemsToLocalStorage(items) {
    localStorage.setItem("items", JSON.stringify(items));
  }

  #getItemsFromLocalStorage() {
    return JSON.parse(localStorage.getItem("items")) ?? {};
  }

  get items() {
    return [...this.#items.values()];
  }

  getItemPriceById(id) {
    const item = this.#items.get(id);
    if (!item) throw new Error(`item with ${id} not found`);

    const {
      addedIngredients,
      ingredientPrices,
      optionPrices,
      pizzaSize,
      quantity,
    } = item;

    const ingredientsPrice = addedIngredients.reduce(
      (acc, item) => (acc += ingredientPrices[item]),
      0
    );
    return (optionPrices[pizzaSize] + ingredientsPrice) * quantity;
  }

  get totalPrice() {
    const result = [...this.#items.values()].reduce(
      (acc, item) => (acc += this.getItemPriceById(item.id)),
      0
    );
    return result;
  }

  #validateItem(item) {
    Object.keys(itemInterface).forEach((key) => {
      if (!(key in item)) throw new Error(`${key} is required`);

      if (typeof item[key] !== itemInterface[key])
        throw new TypeError(`${key} must be a ${itemInterface[key]}`);
    });

    Object.keys(item).forEach((key) => {
      if (!(key in itemInterface))
        throw new Error(`The property ${key} is not declared inside the item.`);
    });
  }
}

export default new CartModel();
