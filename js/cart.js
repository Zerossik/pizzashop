import { Modal } from "./modal.js";
import { useState } from "./hooks/useState.js";
import { Counter } from "./counter.js";

class Cart {
  #state = null;
  #cartLayout = null;
  #cartList = null;

  constructor(Modal, Counter) {
    // использовал патерн СИНГЛТОН
    if (Cart.instance) return Cart.instance;

    // Инициализация модального окна для корзины с заголовком - Cart
    this.modal = new Modal("Cart");
    const initialState = { items: [] };
    // инициализация состояния. При его изменении будет перерисовка позиций корзины
    this.#state = useState(initialState, (target, prop, value) => {
      this.#render();
      this.#setItemstoLocalCtorage(target);
    });

    // ELEMENTS
    const [cartContainer, cartList] = this.#createCartLayout();
    this.#cartLayout = cartContainer;
    this.#cartList = cartList;

    this.#attachEvents();

    Cart.instance = this;
  }

  #attachEvents() {
    this.#cartLayout.addEventListener("click", this.#handleClick);
  }

  #handleClick = (e) => {
    const clickedElement = e.target;

    if (clickedElement.matches("button.cart__item-remove")) {
      const itemID = event.target.closest(".cart__list-item").id;
      this.removeItem(itemID);
    }
  };

  openCart() {
    this.modal.show(this.#cartLayout);
  }

  /**
   *
   * @param {{id: string, title: string, pizzaSize: string, price: number, quantity: number }} item
   * Метод добавления нового item
   */
  addItem(item) {
    if (typeof item !== "object" || item === null || Array.isArray(item))
      throw new TypeError("item must be an object");
    const requiredFields = ["id", "title", "pizzaSize", "price", "quantity"];

    // ищу в корзине item. findIndex вернет -1 если єлемента нет и индекс, если есть.

    const index = this.#state.items.findIndex((el) => el.id === item.id);

    if (index !== -1) {
      // если есть, обновляем количество
      this.#state.items[index] = {
        ...this.#state.items[index],
        quantity: this.#state.items[index].quantity + item.quantity,
        price: (this.#state.items[index].price = item.price),
      };
    } else {
      // если нет, добавляем новый
      this.#state.items.push(item);
    }
    return this;
  }

  /**
   *
   * @param {string} itemId
   * метод для удаления item из корзины
   */
  removeItem(itemId) {
    const newItems = this.#state.items.filter(({ id }) => id !== itemId);
    this.#state.items = newItems;
  }

  // Метод создаем контейнер корзины.
  #createCartLayout() {
    // Главный контейнер корзины.
    const cartContainer = document.createElement("div");
    cartContainer.classList.add("cart");

    // Список для items. В этот список будут рендериться items
    const cartList = document.createElement("ul");
    cartList.classList.add("cart__list");
    cartList.innerHTML = `<li class="cart__list-title">Your Cart is empty</li>`;

    cartContainer.append(cartList);
    // Возращаю елементы
    return [cartContainer, cartList];
  }

  // Метод, который записывает items в localStorage
  #setItemstoLocalCtorage(items) {
    localStorage.setItem("items", JSON.stringify(items));
  }

  // Метод выполняется каждый раз при изменении списка items.
  #render() {
    const { items } = this.#state;

    // Если корзина пуста, сообщаем об этом в виде заголовка.
    if (!items.length) {
      this.#cartList.innerHTML = `<li class="cart__list-title">Your Cart is empty</li>`;
      return;
    }

    // перебираем весь массив и создаем новую разметку + активируем счетчик...
    const itemsList = items.map((item) => {
      const { title, pizzaSize, price, quantity, id } = item;

      const listItem = document.createElement("li");
      listItem.classList.add("cart__list-item");
      listItem.id = id;

      listItem.innerHTML = `<div class="cart__title-wrap">
  <img src="" alt="" />
  <p class="cart__item-title">${title}</p>
  <p class="cart__pizza-size">${pizzaSize}</p>
</div>

<div class="cart__price-wrap">
  <div
    class="counter"
    data-min_value="1"
    data-max_value="99"
    data-init_value="${quantity}"
  >
    <button class="counter__decrement">-</button>
    <input
      type="number"
      class="counter__value"
      value="1"
      name="counter-value"
    />
    <button class="counter__increment">+</button>
  </div>
  <div class="price">
    <span class="price__value">${(price * quantity).toFixed(1)}</span
    ><sup>$</sup>
  </div>
</div>
<button class="cart__item-remove">D</button>
`;
      const counterEl = listItem.querySelector(".counter");
      if (counterEl) {
        new Counter(counterEl, (value) => {
          // обновляем количество через новый массив, чтобы useState отследил изменение
          this.#state.items = this.#state.items.map((it) => {
            return it.id === id ? { ...it, quantity: value } : it;
          });
        });
      }
      return listItem;
    });

    // очищаем предыдущий список и вставляем новый.
    this.#cartList.innerHTML = "";
    this.#cartList.append(...itemsList);
  }
}

const cart = new Cart(Modal);

const btn = document.querySelector(".header__cart-btn");

btn.onclick = (e) => {
  cart.openCart();
};

export default cart;
