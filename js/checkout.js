import cartViewModel from "./Cart/CartViewModel.js";
import { CartItem } from "./components/CartItem.js";
import { Modal } from "./modal.js";
import { isFormEmpty } from "./helpers/isFormEmpty.js";
import { Counter } from "./counter.js";
class CheckOutView {
  #cartViewModel = null;
  #itemsList = new Map();
  constructor(rootElement, cartViewModel) {
    if (!rootElement) throw new Error("root Element is required");
    if (!cartViewModel) throw new Error(" cartViewModel is required");
    this.#cartViewModel = cartViewModel;
    this.#cartViewModel.subscribe(this.#onChange);
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
      const items = this.#cartViewModel.items;

      this.elements.submitButtonEl.disabled =
        !items.length || !isFormEmpty(this.elements.checkoutForm);
    });
  }

  #clickHandler = (e) => {
    const clickedElement = e.target;

    if (clickedElement.matches("button.cart__item-remove")) {
      const itemID = clickedElement.closest(".cart__list-item").id;
      this.#cartViewModel.removeItem(itemID);
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
    this.#cartViewModel.clearCart();
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
    const items = this.#cartViewModel.items;
    this.elements.totalPriceElement.textContent =
      this.#cartViewModel.totalPrice.toFixed(1);
    if (!items.length) this.elements.submitButtonEl.disabled = true;

    // Удаление.
    [...this.#itemsList.keys()].forEach((itemId) => {
      const result = items.find(({ id }) => id === itemId);
      if (!result) {
        const { element, counter } = this.#itemsList.get(itemId);
        counter.destroy();
        element.closest("li").remove();
        this.#itemsList.delete(itemId);
        return undefined;
      }
    });
    // Добавление / обновление
    items.forEach((item) => {
      const { id } = item;
      const existingItem = this.#itemsList.get(id);
      if (existingItem) {
        const { counter, element, item: oldItem } = existingItem;
        if (JSON.stringify(oldItem) === JSON.stringify(item)) return;

        element.querySelector(".price__value").textContent = this.#cartViewModel
          .getItemPriceById(id)
          .toFixed(1);

        this.#itemsList.set(id, {
          item,
          element,
          counter,
        });

        return undefined;
      }

      const listItem = document.createElement("li");
      const itemPrice = this.#cartViewModel.getItemPriceById(item.id);
      const card = CartItem({ ...item, price: itemPrice });
      const counterEl = card.querySelector(".counter");
      const counterInstance = new Counter(counterEl);
      counterInstance.subscribe((counterValue) => {
        this.#cartViewModel.updateItem({ id: item.id, quantity: counterValue });
      });
      listItem.appendChild(card);
      this.elements.itemsList.appendChild(listItem);

      this.#itemsList.set(id, {
        item,
        element: card,
        counter: counterInstance,
      });
    });
  }
}

const checkotEl = document.querySelector(".checkout__inner");

if (checkotEl) new CheckOutView(checkotEl, cartViewModel);
