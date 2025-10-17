import { pizzaData } from "../data/pizza.js";
import { PizzaCard } from "./pizza-card.js";
import { Counter } from "./counter.js";

const swiperEl = document.querySelector("#swiper-container-1");
const swiper2 = document.querySelector("#swiper-container-2");
const fragment = document.createDocumentFragment();
const fragment2 = document.createDocumentFragment();

// Цей код потрібен, якщо HTML не приходить з серверу. Тут ми просто рендеримо картки.
pizzaData.forEach((pizza) => {
  const slide = document.createElement("swiper-slide");
  const card = document.createElement("div");
  card.innerHTML = PizzaCard.render(pizza);
  new PizzaCard(card.firstElementChild, Counter);
  slide.appendChild(card.firstElementChild);
  slide.classList.add("swiper-slide");
  fragment.appendChild(slide);

  const slide2 = document.createElement("swiper-slide");
  const card2 = document.createElement("div");
  card2.innerHTML = PizzaCard.render(pizza);
  new PizzaCard(card2.firstElementChild, Counter);
  slide2.appendChild(card2.firstElementChild);
  slide2.classList.add("swiper-slide");
  fragment2.appendChild(slide2);
});
swiperEl.appendChild(fragment);
swiper2.appendChild(fragment2);

// Якщо HTML прийшов з сервера, потрібно найти всі картки + додати логіку.

// Функція, яка перевіряє, чи потрібні контроллери.
const handlerResize = (swiper) => {
  const {
    params: { slidesPerView },
    slides,
  } = swiper;

  if (slides.length > slidesPerView) {
    swiper.hostEl
      .querySelector(".swiper-container__controllers")
      .classList.add("swiper-container__controllers--visible");
  } else {
    swiper.hostEl
      .querySelector(".swiper-container__controllers")
      .classList.remove("swiper-container__controllers--visible");
  }
};

// Конфіг swiper
const swiperConfig = {
  slidesPerView: 2, // Встановлюємо кількість відображаємих слайдів.

  spaceBetween: 8, // Відступи між слайдами.

  //   Налаштування навігації
  navigation: {
    addIcons: false,
    nextEl: ".swiper-button-next", // Передаю класс на кастомну кнопку "Наступний слайд"
    prevEl: ".swiper-button-prev", // Передаю класс на кастомну кнопку "Попередній слайд"
  },

  //   Налаштування слайдеру в залежності від розміру екрана.
  breakpoints: {
    768: {
      slidesPerView: 3,
    },
    1024: {
      slidesPerView: 4,
    },
  },
  //   Налаштування слухачів.
  on: {
    init: handlerResize, // Функція яка буде виконуватися при ініціалізації.
    resize: handlerResize, // Функція яка буде виконуватися при зміні розміру еркана.
  },
};

Object.assign(swiperEl, swiperConfig); // Передаю об'єкт налаштувань
Object.assign(swiper2, swiperConfig);

swiperEl.initialize(); // ініціалізую swiper
swiper2.initialize();
