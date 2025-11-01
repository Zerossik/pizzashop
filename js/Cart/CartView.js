import { Modal } from "../modal.js";
import { Counter } from "../counter.js";

export class CartView {
  #vievModel = null;
  #modal = null;
  #cartLayout = null;
  #cartList = null;
  #openCartButtons = [];
  constructor(cartVievModel) {
    this.#vievModel = cartVievModel;
    this.#vievModel.subscribe(this.#onChange);
    this.#modal = new Modal("Cart");

    const [cartContainer, cartList] = this.#createCartLayout();
    this.#cartLayout = cartContainer;
    this.#cartList = cartList;
    this.#openCartButtons = document.querySelectorAll(".open-cart");

    this.#attachEvents();
  }

  #onChange = (event) => {
    if (event === "open-cart") {
      this.openCart();
      return;
    }
    this.#render();
  };

  #attachEvents() {
    this.#cartLayout.addEventListener("click", this.#handleClick);
    this.#openCartButtons.forEach(
      (button) =>
        (button.onclick = (e) => {
          this.openCart();
        })
    );
  }

  #handleClick = (e) => {
    const clickedElement = e.target;
    if (clickedElement.matches("button.cart__item-remove")) {
      const itemID = clickedElement.closest(".cart__list-item").id;
      this.#vievModel.removeItem(itemID);
    }
  };

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
    console.log("THIS IS RENDER");
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

    const itemsList = items.map((item) => {
      const { title, pizzaSize, price, quantity, id, img } = item;

      const listItem = document.createElement("li");
      listItem.classList.add("cart__list-item");
      listItem.id = id;
      listItem.innerHTML = `<div class="cart__title-wrap">
        <img src="${img}" loading="lazy" width="50" height="50" alt="pizza-${title}" class="cart__item-image"/>
        <div>
        <p class="cart__item-title">${title}</p>
        <p class="cart__pizza-size">${pizzaSize}</p>
        </div>
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
            value="${quantity}"
            name="counter-value"
          />
          <button class="counter__increment">+</button>
        </div>
        <div class="price">
          <span class="price__value">${(price * quantity).toFixed(1)}</span
          ><sup>$</sup>
        </div>
      </div>
      <button class="cart__item-remove"><svg width="24" height="24">
                      <use href="./images/icons.svg#icon-trash"></use>
                    </svg></button>
      `;
      const counterEl = listItem.querySelector(".counter");
      if (counterEl) {
        new Counter(counterEl, (value) => {
          // обновляем количество через новый массив, чтобы useState отследил изменение
          console.log(typeof item.id);
          this.#vievModel.update(item.id, { quantity: value });
        });
      }
      return listItem;
    });

    this.#cartList.innerHTML = "";
    this.#cartList.append(...itemsList);
  };
}
