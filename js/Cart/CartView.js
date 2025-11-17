import { Modal } from "../modal.js";
import { CartItem } from "../components/CartItem.js";
import { Counter } from "../counter.js";

export class CartView {
  #vievModel = null;
  #modal = null;
  #cartLayout = null;
  #cartList = null;
  #itemsInCart = new Map();

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

    // Удаление.
    [...this.#itemsInCart.keys()].forEach((itemId) => {
      const result = items.find(({ id }) => id === itemId);
      if (!result) {
        const { element, counter } = this.#itemsInCart.get(itemId);
        counter.destroy();
        element.closest("li").remove();
        this.#itemsInCart.delete(itemId);
        return undefined;
      }
    });

    items.forEach((item) => {
      const { id } = item;
      // Обновление.
      const existingItem = this.#itemsInCart.get(id);
      if (existingItem) {
        const { counter, element, item: oldItem } = existingItem;

        if (JSON.stringify(oldItem) === JSON.stringify(item)) return;
        element.querySelector(".price__value").textContent = this.#vievModel
          .getItemPriceById(id)
          .toFixed(1);

        this.#itemsInCart.set(id, {
          item,
          element,
          counter,
        });

        counter.updateValue(item.quantity);
        return undefined;
      }

      // Добавление.
      const listItem = document.createElement("li");
      const itemPrice = this.#vievModel.getItemPriceById(item.id);
      const card = CartItem({ ...item, price: itemPrice });
      const counterEl = card.querySelector(".counter");
      const counterInstance = new Counter(counterEl);
      counterInstance.subscribe((counterValue) => {
        this.#vievModel.updateItem({ id: item.id, quantity: counterValue });
      });

      listItem.appendChild(card);
      this.#cartList.appendChild(listItem);
      this.#itemsInCart.set(id, {
        item,
        element: card,
        counter: counterInstance,
      });
    });
  };
}
