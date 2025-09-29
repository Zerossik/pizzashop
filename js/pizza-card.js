const baseClass = ".pizza-card";

class PizzaCard {
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
}

document.querySelectorAll(baseClass).forEach((card) => {
  new PizzaCard(card);
});
