export const CartItem = (data) => {
  const { title, pizzaSize, price, quantity, id, image } = data;
  const listItem = document.createElement("li");

  listItem.innerHTML = `
  <div class="cart__list-item" id="${id}">
    <div class="cart__title-wrap">
        <img
        src="${image}"
        loading="lazy"
        width="50"
        height="50"
        alt="pizza-${title}"
        class="cart__item-image"
        />
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
    <button class="cart__item-remove">
        <svg width="24" height="24">
        <use href="./images/icons.svg#icon-trash"></use>
        </svg>
    </button>
</div>
`;

  return listItem;
};
