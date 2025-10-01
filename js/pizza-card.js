const baseClass = ".pizza-card";

export class PizzaCard {
  constructor(card) {
    this.card = card;

    this.state = {
      pizzaSize: null,
      quantity: 1,
    };

    this.attachEvents();
  }

  attachEvents() {
    this.card.addEventListener("click", this.handleClick);
  }

  handleClick = (event) => {
    const clickedElement = event.target;

    if (clickedElement.matches(baseClass + "__options-btn")) {
      // метод matches проверяет, соответствует ли елемент указаному селектору. Вернет boolean

      this.setPizzaSize(clickedElement);
    }

    if (clickedElement.matches(baseClass + "__counter-btn[data-action]")) {
      // метод matches проверяет, соответствует ли елемент указаному селектору. Вернет boolean
      this.setQuantity(clickedElement);
    }
  };

  setPizzaSize(clickedElement) {
    if (clickedElement.dataset.size === this.state.pizzaSize) return;

    const options = this.card.querySelectorAll(
      baseClass + "__options-btn--active"
    );
    options.forEach((option) =>
      option.classList.remove("pizza-card__options-btn--active")
    );

    clickedElement.classList.add("pizza-card__options-btn--active");

    this.state.pizzaSize = clickedElement.dataset.size;
  }

  setQuantity(clickedElement) {
    const action = clickedElement.dataset.action;
    const counterValue = this.card.querySelector(baseClass + "__counter-value");

    if (action === "increment" && counterValue) {
      this.state.quantity++;
    } else if (
      action === "decrement" &&
      counterValue &&
      this.state.quantity !== 1
    ) {
      this.state.quantity--;
    }

    counterValue.textContent = this.state.quantity;
  }

  static render(data) {
    if (!data) return;

    return `<div class="pizza-card" data-price=${data.price || 0}>
      <div class="pizza-card__inner">
        <picture class="pizza-card__image-wrap">
          <img
            src=${data.img || ""}
            alt="pizza image"
            class="pizza-card__image"
        /></picture>

        <h3 class="pizza-card__title">${data.title || ""}</h3>
        <p class="pizza-card__desc">
         ${data.desc || ""}
        </p>
        <div class="pizza-card__actions">
          <ul class="pizza-card__options-list">
            <li class="pizza-card__option-item">
              <button class="pizza-card__options-btn" data-size="small">
                22
              </button>
            </li>
            <!-- pizza-card__options-btn--active -->
            <li class="pizza-card__option-item">
              <button class="pizza-card__options-btn" data-size="medium">
                28
              </button>
            </li>
            <li class="pizza-card__option-item">
              <button class="pizza-card__options-btn" data-size="large">
                33
              </button>
            </li>
          </ul>
          <button class="pizza-card__ingredients-btn">+ ingredients</button>
          <div class="pizza-card__price-wrap">
            <p class="pizza-card__price">${data.price || 0}<sup>$</sup></p>
            <div class="pizza-card__counter">
              <button class="pizza-card__counter-btn" data-action="decrement">
                -
              </button>
              <span class="pizza-card__counter-value">1</span>
              <button class="pizza-card__counter-btn" data-action="increment">
                +
              </button>
            </div>
          </div>
          <button class="pizza-card__order-btn">Order Now</button>
        </div>
      </div>
    </div>`;
  }
}
