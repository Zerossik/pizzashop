import { Notify } from "./notify.js";

const video = document.querySelector(".video");

if (video) {
  video.addEventListener("click", handlerClick);
  const notify = new Notify();

  function handlerClick(e) {
    const clickedEl = e.target;

    if (clickedEl.classList.contains("video__play-btn")) {
      notify.show(
        "The video will be available soon. Thank you for your patience!"
      );
    }
  }
}
