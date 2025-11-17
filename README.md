# pizzashop

**Languages:**  
[Ukrainian](README.uk.md) | [English](README.md)

### [Pizzashop Live page](https://zerossik.github.io/pizzashop/)

<sub>Adaptive landing page for a small pizzeria. The website allows users to choose a pizza, select its size, and add extra ingredients, after which they can proceed to checkout.
The site is built using the following technologies: HTML, CSS (SASS), and JavaScript (ES6).
For product cards and the shopping cart, I used the MVVM (Model-View-ViewModel) and Observer patterns.
To track data changes, I created my own implementation of a useState hook based on ProxyObject.
The slider (for mobile and tablet versions of the site) is built with Swiper.js (Web Components).</sub>

---

## Hook: `useState`

Briefly: `useState` is a simple implementation of reactive state based on `Proxy`. It allows you to track changes in an object or array and call a callback when mutations happen.

- **File:** `js/hooks/useState.js`
- **Purpose:** create a proxy object that calls `onChange` when values are assigned or when mutable array methods are used.

Parameters:

- `initState` (any) — initial state. If a non-object value (a primitive) is passed, it will be wrapped in `{ value: initState }`.
- `onChange` (function) — optional callback that is called when changes happen.
- `onChange` receives the parameters `target, prop, value`

Returns:

- `Proxy` — a proxy version of the passed state. Nested objects are wrapped recursively using `useState`.

How it works (short version):

- A `WeakMap` (`proxyMap`) is used to store mapping from the original object (cache) → proxy, so the same object is not proxied more than once.
- In `set`, the previous value is compared with the new one (`prevState === value`). If they are equal, the callback is not called.
- For arrays, standard mutating methods (`push`, `pop`, `splice`, etc.) are intercepted, and `onChange` is called with their arguments.

Usage examples:

```javascript
import { useState } from "./js/hooks/useState.js";

// Object
const state = useState(
  { count: 0, user: { name: "Anna" } },
  (target, prop, value) => {
    console.log("changed", prop, value);
  }
);
state.count = 1; // -> onChange(target, 'count', 1)
state.user.name = "Ivan"; // nested object is also proxied automatically

// Array
const arr = useState([1, 2, 3], (target, prop, args) => {
  console.log("array", prop, args);
});
arr.push(4); // -> onChange(target, 'push', [4])
```

- `useState` returns the same proxy when it is called again with the same object (using `WeakMap`), which prevents duplicate proxying.
- The callback is called only when the value actually changes (by reference or by value).
- Non-mutating operations and property reads are not intercepted — only `set` and mutating array methods.
- When working with large data structures, keep in mind the cost of proxying nested objects.

---

## Cart Functionality: `CartModel`, `CartViewModel`, `CartView`

### CartModel (`js/Cart/CartModel.js`)

**Purpose:** manages cart data and persists it to LocalStorage.

**Main Methods:**

- `addItem(item)` — adds an item to the cart. If the item already exists, updates its quantity
- `updateItem(itemData)` — updates item data (quantity, size, etc.)
- `removeItem(id)` — removes an item from the cart
- `clearCart()` — empties the entire cart
- `getItemPriceById(id)` — calculates item price including size and added ingredients
- `totalPrice` (getter) — calculates the total price of all items in the cart
- `items` (getter) — returns an array of all items in the cart

**Validation:** the class ensures each item contains required properties (`id`, `title`, `image`, `ingredientPrices`, `optionPrices`, `pizzaSize`, `quantity`, `addedIngredients`).

**Persistence:** all changes are automatically synchronized with LocalStorage through the Observable pattern.

### CartViewModel (`js/Cart/CartViewModel.js`)

**Purpose:** acts as a bridge between the UI and the model, managing state and notifying about changes.

**Main Methods:**

- `addItem(item)` — delegates item addition to CartModel
- `removeItem(id)` — removes an item from the cart
- `updateItem(itemData)` — updates an item in the cart
- `clearCart()` — clears the cart
- `openCart()` — notifies subscribers about opening the cart modal
- `getItemPriceById(id)` — retrieves item price from the model
- `items` (getter) — returns the list of items from the model
- `totalPrice` (getter) — returns the total cart price

**Reactivity:** extends `Observable`, so any change in CartModel automatically notifies the UI.

### CartView (`js/Cart/CartView.js`)

**Purpose:** displays the cart UI and handles user interactions.

**Main Features:**

- `openCart()` — opens a modal window displaying the cart contents
- Dynamic rendering of cart items list
- Price updates when item quantity changes
- Item removal on delete button click
- Counter (quantity selector) management for each item
- Disables checkout button when cart is empty

**Internal Structure:**

- `#itemsInCart` (Map) — stores references to DOM elements and counter for each item
- `#createCartLayout()` — creates the cart HTML structure
- `#render()` — re-renders the cart on changes (add, remove, update items)
- `#attachEvents()` — attaches event handlers (open cart, remove item)

**Integration:** CartView subscribes to changes in CartViewModel and automatically updates the display whenever data changes.

---

## Counter (`js/counter.js`)

**Purpose:** manages a numeric counter for quantity selection with increment and decrement functionality.

**Constructor:**

```javascript
new Counter(counterElement);
```

- `counterElement` (HTMLElement) — HTML element of the counter, which should contain:
  - `data-min_value` — minimum value (default 1)
  - `data-max_value` — maximum value (default 99)
  - `data-init_value` — initial value (default equals minimum)
  - Child element `<input name="counter-value">` to display the current value

**Main Methods:**

- `increment()` — increases value by 1 (cannot exceed maximum)
- `decrement()` — decreases value by 1 (cannot be less than minimum)
- `updateValue(value)` — sets a new value with validation
  - Throws error if value is less than minimum or greater than maximum
  - Throws error if value is not a number
- `render()` — updates the display of the value in the input element
- `destroy()` — removes all event handlers and cleans up resources
- `value` (getter) — returns the current value

**Event Handling:**

- Clicks on `.counter__increment` — call `increment()`
- Clicks on `.counter__decrement` — call `decrement()`
- Changes to input field — call `handlerChange()`, which validates and sets the new value

**Reactivity:**

- Extends `Observable`, so it automatically notifies all subscribers when the value changes
- Uses `useState` to track value changes
- Value updates are performed using `requestAnimationFrame` for optimal performance

**Usage Example:**

```html
<div class="counter" data-min_value="1" data-max_value="10" data-init_value="1">
  <button class="counter__decrement">-</button>
  <input type="number" name="counter-value" />
  <button class="counter__increment">+</button>
</div>
```

```javascript
const counterElement = document.querySelector(".counter");
const counter = new Counter(counterElement);

// Subscribe to changes
counter.subscribe((value) => {
  console.log("New quantity:", value);
});

// Set a new value
counter.updateValue(5);
```

---
