import { Modal } from "../modal.js";
import { CartItem } from "../components/CartItem.js";
import { Counter } from "../counter.js";

export class CartView {
  #vievModel = null;
  #modal = null;
  #cartLayout = null;
  #cartList = null;
  #counters = new Map();

  constructor(cartVievModel) {
    this.#vievModel = cartVievModel;
    this.#vievModel.subscribe(this.#onChange);
    this.#modal = new Modal("Cart");

    const [cartContainer, cartList] = this.#createCartLayout();
    this.#cartLayout = cartContainer;
    this.#cartList = cartList;

    this.elements = {
      openCartButtons: document.querySelectorAll(".open-cart"),
      totalPrice: this.#cartLayout.querySelector(
        ".price.total-price .price__value"
      ),
      toCheckoutBtn: this.#cartLayout.querySelector(".cart__to-checkout-link"),
    };

    this.#attachEvents();
    this.#render();
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
    this.elements.openCartButtons.forEach(
      (button) =>
        (button.onclick = (e) => {
          this.openCart();
        })
    );
  }

  #handleClick = (e) => {
    const clickedElement = e.target;
    if (clickedElement.matches("button.cart__item-remove")) {
      const itemID = clickedElement.closest(".cart__list-item")?.id;
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

    const emptyText = document.createElement("p");
    emptyText.classList.add("cart__empty-text");
    emptyText.textContent = "Your Cart is empty";

    const actionContainer = document.createElement("div");
    actionContainer.classList.add("cart__action-wrap");
    actionContainer.innerHTML = `
    <div class="price total-price" data-price="">
       <span class="price__value">0</span><sup>$</sup>
      </div>
      <div class="cart__to-checkout-link" data-disabled="true">
      <a href="./checkout.html">Proceed to checkout</a>
    </div>`;

    cartContainer.append(emptyText, cartList, actionContainer);

    return [cartContainer, cartList];
  }

  #render = () => {
    const items = this.#vievModel.items;
    const totalPrice = Number(this.#vievModel.totalPrice.toFixed(1));
    this.elements.totalPrice.textContent = totalPrice;

    this.elements.toCheckoutBtn.dataset.disabled = !items.length;

    const listItems = Array.from(this.#cartList.children);

    listItems.forEach((item) => {
      const itemID = item.querySelector(".cart__list-item")?.id;
      const findedEl = items.find((el) => el.id === itemID);
      if (!findedEl) {
        const counter = this.#counters.get(itemID);
        if (counter) {
          counter.destroy();
          this.#counters.delete(itemID);
        }
        item.remove();
        return;
      }
    });

    items.forEach((item) => {
      const counterUpdate = (value) => {
        this.#vievModel.updateItem({ id: item.id, quantity: value });
      };
      const { price, quantity } = item;
      const existingEl = this.#cartList.querySelector(
        `.cart__list-item[id="${item.id}"]`
      );

      if (existingEl) {
        existingEl.querySelector(".price__value").textContent = (
          price * quantity
        ).toFixed(1);

        const counter = this.#counters.get(item.id);
        counter.updateValue(item.quantity);
        return;
      }

      const cartItemEl = CartItem(item);
      const counterEl = cartItemEl.querySelector(".counter");
      if (counterEl) {
        const counter = new Counter(counterEl);
        const unsubscribe = counter.subscribe(counterUpdate);
        counter.unsubscribe = unsubscribe;
        this.#counters.set(item.id, counter);
      }

      this.#cartList.appendChild(cartItemEl);
    });
  };
}
