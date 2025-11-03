import cartViewModel from "./Cart/CartViewModel.js";
import { CartItem } from "./components/CartItem.js";
import { Modal } from "./modal.js";

class CheckOutView {
  #cart = null;
  constructor(cartViewModel) {
    this.#cart = cartViewModel;
    this.#cart.subscribe(this.#onChange);

    // ELEMENTS
    this.modal = new Modal();
    this.itemsContainer = document.querySelector(".products-list");
    if (!this.itemsContainer) throw new Error("itemsContainer not found");

    this.userInfoForm = document.querySelector(".checkout__form");
    if (!this.userInfoForm) throw new Error("userInfoForm not found");

    this.totalPriceElement = document.querySelector(
      ".checkout__product-wrap .price__value"
    );
    if (!this.totalPriceElement) throw new Error("totalPriceElement not found");

    this.#attachEvent();
  }

  #onChange = () => {
    this.render();
  };
  #attachEvent() {
    this.itemsContainer.addEventListener("click", this.#clickHandler);
    this.userInfoForm.addEventListener("submit", this.#submitHandler);
  }

  #clickHandler = (e) => {
    const clickedElement = e.target;

    if (clickedElement.matches("button.cart__item-remove")) {
      const itemID = clickedElement.closest(".cart__list-item").id;
      this.#cart.removeItem(itemID);
    }
  };

  #submitHandler = async (e) => {
    e.preventDefault();
    const infoElement = document.createElement("p");
    infoElement.textContent =
      "Thank you for your order! Our manager will contact you shortly.";
    this.modal.show(infoElement);
    this.#formReset(e);
  };

  #formReset(e) {
    const form = e.target;
    const fromData = new FormData(form);
    const data = Object.fromEntries(fromData.entries());
    for (const key in data) {
      const input = form.querySelector(`[name="${key}"]`);
      if (input) input.value = "";
    }
  }

  render() {
    console.log("This is checkout");
    const items = this.#cart.items;
    this.totalPriceElement.textContent = this.#cart.totalPrice;

    if (!items.length) {
      this.itemsContainer.innerHTML = `<li class="cart__list-title">Your Cart is empty</li>`;
      return;
    }

    const itemsList = items.map((item) =>
      CartItem(item, (counterValue) => {
        this.#cart.updateItem({
          id: item.id,
          quantity: counterValue,
        });
      })
    );
    this.itemsContainer.innerHTML = "";
    this.itemsContainer.append(...itemsList);
    // ------------------------
  }
}

new CheckOutView(cartViewModel);
