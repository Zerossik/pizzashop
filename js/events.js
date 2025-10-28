import Swiper from "https://cdn.jsdelivr.net/npm/swiper@12/swiper-bundle.min.mjs";

const swiperEventsEl = document.getElementById("events-swiper-1");

const swiperEventsConfig = {
  slidesPerView: 1,
  spaceBetween: 8,

  navigation: {
    addIcons: false,
    nextEl: ".swiper-button-next", // Передаю класс на кастомну кнопку "Наступний слайд"
    prevEl: ".swiper-button-prev", // Передаю класс на кастомну кнопку "Попередній слайд"
  },
};

if (swiperEventsEl) {
  Object.assign(swiperEventsEl, swiperEventsConfig);
  swiperEventsEl.initialize();
}

// ---------------------------------------------------------------

const links = document.querySelectorAll(".events .event__link");

links.forEach((link) => linkHandler(link));

function linkHandler(link) {
  link.onclick = (e) => {
    e.preventDefault();
  };
}
