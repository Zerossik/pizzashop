import { pizzaData } from "../data/pizza.js";
import { PizzaCard } from "./pizza-card.js";

const productBox = document.getElementById("products-box-1");

const controllers = {
  resize: [],
};

// Додаю картки товару в контейнер, де вони повинні відображатися.
const cardList = `<ul class="products__list">${pizzaData
  .map(
    (pizza) => `<li class="products__list-item">${PizzaCard.render(pizza)}</li>`
  )
  .join(" ")}</ul>`;

productBox.insertAdjacentHTML("afterbegin", cardList);

//  Активую логіку для всіх карток на сайті.
document.querySelectorAll(".pizza-card").forEach((card) => {
  new PizzaCard(card);
});

document.querySelectorAll(".products").forEach((product) => {
  const resizeController = productControllers(product);
  controllers.resize.push(resizeController);
});

// Слухач подій
window.addEventListener("resize", () =>
  controllers.resize.forEach((controller) => controller())
);

// Функции контроллера.
function productControllers(el) {
  if (!el) return;

  const list = el.querySelector(".products__list");
  const controls = el.querySelector(".products__control");

  // Кнопки внутри control блок.
  const prevBtn = controls?.querySelector(".products__control-btn--prev");
  const nextBtn = controls?.querySelector(".products__control-btn--next");

  // Первая и последняя карта в блоке
  if (!list || list.length === 0) return;
  const firstCard = list.children[0];
  const lastCard = list.children[list.children.length - 1];

  let cardWidth; // ширина карточки. Пересчитывю при resize и при загрузке страниц

  // Наблюдатель. Відслідковує перший та останній слайд в слайдері. Якщо один з них видимий в контейнері, то блокуємо відповідну кнопку.
  const observerOptions = {
    root: list,
    threshold: 0.5,
  };

  const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
      const { target, isIntersecting } = entry;

      if (target === firstCard && prevBtn) {
        prevBtn.disabled = isIntersecting;
      }
      if (target === lastCard && nextBtn) {
        nextBtn.disabled = isIntersecting;
      }
    });
  };
  const observer = new IntersectionObserver(observerCallback, observerOptions);

  observer.observe(firstCard);
  observer.observe(lastCard);

  const changeScreenSize = () => {
    const gap = parseInt(getComputedStyle(list).gap) || 0;
    cardWidth = firstCard.clientWidth + gap;
    if (list.scrollWidth > list.clientWidth + cardWidth) {
      controls.style.display = "block";
    } else {
      controls.style.display = "none";
    }
  };

  if (prevBtn && nextBtn) {
    nextBtn.onclick = () => {
      list.scrollLeft += cardWidth;
    };

    prevBtn.onclick = () => {
      list.scrollLeft -= cardWidth;
    };
  }

  changeScreenSize();

  return changeScreenSize;
}
