import { Observable } from "../helpers/Observable.js";

class CardViewModel extends Observable {
  #model = null;
  constructor(model) {
    if (!model) throw new Error("CardModel not found");
    super();
    this.#model = model;
    this.#model.subscribe(this.#onChange);
  }

  #onChange = () => {
    this.notify();
  };

  updateData(newData) {
    this.#model.updateData(newData);
  }
  addIngredient(value) {
    this.#model.addIngredient(value);
  }

  removeIngredient(value) {
    this.#model.removeIngredient(value);
  }

  getCardData() {
    return this.#model.getCardData();
  }

  get totalPrice() {
    return this.#model.totalPrice;
  }
  get basePrice() {
    return this.#model.basePrice;
  }
}

export default CardViewModel;
