const menuBtn = document.querySelector(".header__menu-btn");
const nav = document.querySelector(".header__nav");
const closeBtn = document.querySelector(".header__nav-close");
const menuItems = document.querySelectorAll(".header__nav-link");

let isOpenMenu = false;

const resizeHandler = () => {
  if (window.innerWidth >= 1024) {
    closeMenu();
  }
};

const closeMenu = () => {
  nav.classList.remove("open");
  isOpenMenu = false;

  window.removeEventListener("resize", resizeHandler);
  menuItems.forEach((el) => el.removeEventListener("click", closeMenu));
};

const openMenu = () => {
  if (window.innerWidth >= 1024) return;
  nav.classList.add("open");
  isOpenMenu = true;

  window.addEventListener("resize", resizeHandler);
  menuItems.forEach((el) => el.addEventListener("click", closeMenu));
};

function toggleMenu() {
  isOpenMenu ? closeMenu() : openMenu();
}

if (menuBtn && nav && closeBtn) {
  menuBtn.addEventListener("click", toggleMenu);
  closeBtn.addEventListener("click", toggleMenu);
}
