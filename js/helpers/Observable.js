export class Observable {
  #subscribers = new Set();

  subscribe = (fn) => {
    if (typeof fn !== "function")
      throw new TypeError("subscriber must be a function");

    this.#subscribers.add(fn);
    return () => this.#subscribers.delete(fn);
  };

  notify() {
    this.#subscribers.forEach((fn) => fn());
  }
}
