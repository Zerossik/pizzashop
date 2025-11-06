// import { useState } from "./hooks/useState.js";
// import { Counter } from "./counter.js";
// import Cart from "./Cart/CartViewModel.js";

// export class PizzaCard {
//   /**
//    * @param {HTMLElement} card
//    * @param {typeof Counter} Counter
//    * @param {string} [baseSelector]
//    * */

//   #state;
//   // card is HTMLElement, Counter is Counter class. baseSelector is card's selector
//   constructor(card, Counter, cartInstanse, baseSelector = "pizza-card") {
//     if (!card) throw new Error("card is required");
//     if (!Counter) throw new Error("Counter is required");

//     this.BASE_SELECTOR = baseSelector;
//     this.card = card;
//     this.cardID = card.id;
//     this.initPrice = Number(this.card.dataset.price ?? 0);
//     this.cart = cartInstanse;

//     const initialState = {
//       basePrice: this.initPrice,
//       isFliped: false,
//       pizzaSize: "small",
//       quantity: 1,
//       ingredients: [],
//     };

//     this.#state = useState(initialState, this.stateHandler);

//     // ELEMENTS:
//     this.priceElements = this.card.querySelectorAll(".price");
//     this.counter = this.card.querySelector(".counter");
//     this.cardTitle = this.card.querySelector(
//       `.${baseSelector}__title`
//     )?.textContent;
//     this.cardImage = this.card
//       .querySelector(`.${this.BASE_SELECTOR}__image-wrap img`)
//       ?.getAttribute("src");

//     //init new counter for this pizza card
//     new Counter(this.counter, (value) => (this.#state.quantity = value));
//     this.attachEvents();
//     this.stateHandler();
//   }
//   // HANDLERS
//   stateHandler = (target, prop, value) => {
//     this.priceElements?.forEach((element) => {
//       const value = element.querySelector(".price__value");
//       value.textContent = this.totalPrice;
//     });

//     if (prop === "isFliped") {
//       this.card.classList.toggle(this.BASE_SELECTOR + "--fliped");
//     }
//   };

//   attachEvents() {
//     this.card.addEventListener("click", this.handleClick);

//     this.card.addEventListener("submit", this.handleSubmit);

//     this.card.addEventListener("change", this.handlerChange);
//   }

//   handleClick = (event) => {
//     const clickedElement = event.target;
//     if (clickedElement.matches(`.${this.BASE_SELECTOR}__ingredients-btn`)) {
//       this.#state.isFliped = true;
//     }

//     if (clickedElement.matches(`.${this.BASE_SELECTOR}__order-btn`)) {
//       const priceWithingredients = this.totalPrice / this.#state.quantity;

//       this.cart
//         .addItem({
//           id: this.cardID,
//           price: priceWithingredients,
//           pizzaSize: this.#state.pizzaSize,
//           quantity: this.#state.quantity,
//         })
//         .openCart();
//     }
//   };

//   handleSubmit = (event) => {
//     event.preventDefault();

//     this.#state.isFliped = false;
//   };

//   handlerChange = (event) => {
//     const changedElement = event.target;

//     if (changedElement.matches(`input.${this.BASE_SELECTOR}__options-radio`)) {
//       this.setPizzaSize(changedElement);
//     }

//     if (
//       changedElement.matches(
//         "input[type=checkbox][name=ingredient][data-price]"
//       )
//     ) {
//       const { ingredients } = this.#state;
//       const id = changedElement.id;
//       const ingredientPrice = Number(changedElement.dataset.price);
//       const ingredientName = changedElement.value;

//       if (!id || !ingredientPrice || !ingredientName) return;

//       if (changedElement.checked) {
//         this.#state.ingredients.push({ id, ingredientName, ingredientPrice });
//         return;
//       }

//       const index = ingredients.findIndex((el) => el.id === id);
//       this.#state.ingredients.splice(index, 1);
//     }
//   };

//   setPizzaSize(clickedElement) {
//     this.#state.pizzaSize = clickedElement.value;
//     this.#state.basePrice = clickedElement.dataset.price;
//   }

//   get totalPrice() {
//     const { ingredients } = this.#state;
//     const ingredientsPrice = ingredients.reduce((acc, { ingredientPrice }) => {
//       return acc + ingredientPrice;
//     }, 0);

//     const totalPrice =
//       (Number(this.#state.basePrice) + ingredientsPrice) * this.#state.quantity;
//     return parseFloat(totalPrice).toFixed(1);
//   }

//   // UI METHODS:

//   static render = (data) => {
//     if (!data) return;

//     const { small, medium, large } = data.options.reduce(
//       (acc, { value, price }) => {
//         acc[value] = parseFloat(price).toFixed(1);

//         return acc;
//       },
//       {}
//     );

//     return `<div class="pizza-card" data-price=${small} id=${data.id}>
//           <div class="pizza-card__wrap">
//             <div class="pizza-card__inner">
//               <picture class="pizza-card__image-wrap">
//                 <img
//                   src="${data.img}"
//                   alt="pizza image"
//                   class="pizza-card__image"
//               /></picture>
//               <div class="pizza-card__front">
//                 <h3 class="pizza-card__title">${data.title}</h3>
//                 <p class="pizza-card__desc">
//                   Filling: onion, potato, tomato, mushrooms, cheese, olives,
//                   meat
//                 </p>
//                 <div class="pizza-card__actions">
//                   <form class="pizza-card__options">
//                     <label>
//                       <input
//                         type="radio"
//                         name="pizza-card__option"
//                         class="pizza-card__options-radio"
//                         id="pizza-card__option-small"
//                         value="small"
//                         data-price=${small}
//                         checked
//                       />22</label
//                     >

//                     <!-- pizza-card__options-btn--active -->

//                     <label>
//                       <input
//                         type="radio"
//                         name="pizza-card__option"
//                         class="pizza-card__options-radio"
//                         id="pizza-card__option-medium"
//                         value="medium"
//                         data-price=${medium}
//                       />28</label
//                     >
//                     <label>
//                       <input
//                         type="radio"
//                         name="pizza-card__option"
//                         class="pizza-card__options-radio"
//                         id="pizza-card__option-large"
//                         value="large"
//                         data-price=${large}
//                       />33</label
//                     >
//                   </form>
//                   <div class="pizza-card__ingredients-btn-wrap">
//                   <button class="pizza-card__ingredients-btn">
//                     + ingredients
//                   </button></div>
//                   <div class="pizza-card__price-wrap">
//                     <div class="price"><span class="price__value">0</span><sup>$</sup></div>
//                    <div
//           class="counter"
//           data-min_value="1"
//           data-max_value="99"
//           data-init_value="1"
//         >
//           <button class="counter__decrement">-</button>
//           <input
//             type="number"
//             class="counter__value"
//             value="1"
//             name="counter-value"
//           />
//           <button class="counter__increment">+</button>
//         </div>
//                   </div>
//                   <button class="pizza-card__order-btn">Order Now</button>
//                 </div>
//               </div>
//                 <div class="pizza-card__back">
//                   <p class="pizza-card__title-back">Choose ingredients:</p>
//                 <form class="pizza-card__ingredients-form">
//                   <div class="pizza-card__form-items-wrap">
//                     ${data.toppings
//                       .map(
//                         ({ id, name, price }) => `
//                       <div class="pizza-card__form-item-wrap">

//                             <input type="checkbox" name="ingredient" data-price=${price} value=${name} id=ingredient-${data.id}-${id}  />
//                             <label for=ingredient-${data.id}-${id} >${name}</label>
//                        <span>${price}<sup>$</sup></span>

//                       </div>
//                     `
//                       )
//                       .join(" ")}

//                   </div>
//                   <div>
//                   <div class="pizza-card__price-wrap">
//             <div class="price"><span class="price__value">0</span><sup>$</sup></div>
//                       </div>
//                       <div class="pizza-card__ingredients-btn-wrap">
//                   <button class="pizza-card__back-btn-submit">OK</button>
//                   </div
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>`;
//   };
// }

// // document
// //   .querySelectorAll(".pizza-card")
// //   .forEach((card) => new PizzaCard(card, Counter, Cart));
