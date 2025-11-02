import { Modal } from "../modal.js";
import { CartItem } from "../components/CartItem.js";

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
    const totalPrice = Number(this.#vievModel.totalPrice.toFixed(1));

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
      const cartItemEl = CartItem(item, (value) => {
        this.#vievModel.updateItem({
          id: item.id,
          quantity: value,
        });
      });
      return cartItemEl;
    });

    this.#cartList.innerHTML = "";
    this.#cartList.append(...itemsList);
  };
}
