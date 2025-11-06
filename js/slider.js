import { useData } from "./hooks/useData.js";
import { Counter } from "./counter.js";
import CartViewModel from "./Cart/CartViewModel.js";

const swiperEl = document.querySelector("#swiper-container-1");
const swiper2 = document.querySelector("#swiper-container-2");

// Функція, яка перевіряє, чи потрібні контроллери.
const handlerResize = (swiper) => {
  const {
    params: { slidesPerView },
    slides,
  } = swiper;
  if (slides.length > slidesPerView) {
    swiper.hostEl
      .querySelector(".menu .swiper-container__controllers")
      .classList.add("swiper-container__controllers--visible");
  } else {
    swiper.hostEl
      .querySelector(".menu .swiper-container__controllers")
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

if (swiperEl && swiper2) {
  Object.assign(swiperEl, swiperConfig); // Передаю об'єкт налаштувань
  Object.assign(swiper2, swiperConfig);

  swiperEl.initialize(); // ініціалізую swiper
  swiper2.initialize();
}
