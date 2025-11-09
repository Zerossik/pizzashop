import cartViewModel from "./Cart/CartViewModel.js";
import { CartItem } from "./components/CartItem.js";
import { Modal } from "./modal.js";
import { isFormEmpty } from "./helpers/isFormEmpty.js";
import { Counter } from "./counter.js";
class CheckOutView {
  #cart = null;

  constructor(rootElement, cartViewModel) {
    if (!rootElement) throw new Error("root Element is required");
    if (!cartViewModel) throw new Error(" cartViewModel is required");
    this.#cart = cartViewModel;
    this.#cart.subscribe(this.#onChange);
    this.modal = new Modal();

    // ELEMENTS
    this.rootElement = rootElement;

    this.elements = {
      checkoutForm: this.rootElement.querySelector(".checkout__form"),
      itemsList: this.rootElement.querySelector(".products-list"),
      totalPriceElement: this.rootElement.querySelector(
        ".checkout__product-wrap .price__value"
      ),
      formInputs: this.rootElement.querySelectorAll("input[required]"),
      submitButtonEl: this.rootElement.querySelector(".checkout__submit"),
    };

    this.#attachEvent();
    this.render();
  }

  #onChange = () => {
    this.render();
  };
  #attachEvent() {
    this.rootElement.addEventListener("click", this.#clickHandler);
    this.rootElement.addEventListener("submit", this.#submitHandler);
    this.elements.checkoutForm.addEventListener("input", (e) => {
      const items = this.#cart.items;

      this.elements.submitButtonEl.disabled =
        !items.length || !isFormEmpty(this.elements.checkoutForm);
    });
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
    infoElement.classList.add("checkout__empty-informer");
    infoElement.textContent =
      "Thank you for your order! Our manager will contact you shortly.";
    this.modal.show(infoElement);
    this.#formReset(e);
    this.#cart.clearCart();
    const url = window.location.hostname.includes("zerossik.github.io")
      ? "https://zerossik.github.io/pizzashop"
      : "";
    setTimeout(() => window.location.replace(`${url}/index.html`), 2000);
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
    const items = this.#cart.items;

    this.elements.totalPriceElement.textContent =
      this.#cart.totalPrice.toFixed(1);
    if (!items.length) this.elements.submitButtonEl.disabled = true;

    // Удаление.
    const itemsInCart = Array.from(this.elements.itemsList.children);
    itemsInCart.forEach((item) => {
      const itemID = item.querySelector(".cart__list-item")?.id;
      const findedEl = items.find((el) => el.id === itemID);
      if (!findedEl) {
        item.remove();
        return;
      }
    });

    // Добавление / обновление
    items.forEach((item) => {
      const existingEl = this.elements.itemsList.querySelector(
        `.cart__list-item[id="${item.id}"]`
      );
      if (existingEl) {
        // обновляем елемент.
        console.log(item);
        existingEl.querySelector(".price__value").textContent = (
          item.price * item.quantity
        ).toFixed(1);
        return;
      }

      const newItem = CartItem(item);
      if (newItem) {
        const counterEl = newItem.querySelector(".counter");
        new Counter(counterEl).subscribe((value) =>
          this.#cart.updateItem({ id: item.id, quantity: value })
        );
        this.elements.itemsList.appendChild(newItem);
      }
    });
  }
}

const checkotEl = document.querySelector(".checkout__inner");

if (checkotEl) new CheckOutView(checkotEl, cartViewModel);
