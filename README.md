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

## Modal (`js/modal.js`)

**Purpose:** displays modal windows with customizable content, titles, and closing mechanisms.

**Constructor:**

```javascript
new Modal(title);
```

- `title` (string) — the title displayed in the modal header (required)
- Throws `TypeError` if title is not a string
- Requires `#modal-root` element in the DOM to render the modal

**Main Methods:**

- `show(htmlContent)` — opens the modal with specified HTML content
  - `htmlContent` (HTMLElement, optional) — the content to display inside the modal
  - Attaches event handlers when the modal is shown
  - Returns `this` for method chaining
- `close()` — closes the modal
  - Removes content and detaches event handlers
  - Triggered by closing animation timeout
- `setContent(newContent, isClearModal)` — updates the modal content after it's opened
  - `newContent` (HTMLElement) — the new content to display
  - Throws `TypeError` if content is not an HTMLElement

**Properties & Setters:**

- `title` (setter) — updates the modal title dynamically
  - Updates the DOM element and internal state
  - Throws `TypeError` if title is not a string
- `modal` — the root modal DOM element
- `modalRoot` — the DOM node where modals are rendered (must have id `modal-root`)
- `modalTitle` — the title element inside the modal

**Event Handling:**

- Clicks on `.modal__close` button — close the modal
- Clicks on `.modal__backdrop` (the overlay) — close the modal
- `Escape` key press — close the modal
- All events are properly cleaned up on modal close

**Internal Structure:**

- `#state` (reactive) — tracks `isOpen` and `title` state using `useState`
- `#modalInner` — container for the modal content
- `#createModal()` — creates the modal HTML structure with header, close button, and content area
- `#render()` — manages modal display/hide with animations and DOM manipulation
- `#attachEvents()` — attaches all event listeners
- `#destroyEvent()` — removes all event listeners

**Reactivity & Animation:**

- Uses `useState` to track state changes
- Modal insertion/removal is handled reactively based on `isOpen` state
- Opening animation: modal is added to DOM and `.modal__show` class is applied via `requestAnimationFrame`
- Closing animation: `.modal__show` class is removed, then modal is removed from DOM after 200ms delay
- Body overflow is hidden when modal is open, restored when closed

**Usage Example:**

```html
<div id="modal-root"></div>
```

```javascript
const modal = new Modal("Cart");

// Show modal with content
const content = document.createElement("div");
content.innerHTML = "<p>Your cart items here</p>";
modal.show(content);

// Update title
modal.title = "Shopping Cart";

// Update content after showing
const newContent = document.createElement("div");
newContent.innerHTML = "<p>Updated cart</p>";
modal.setContent(newContent);

// Close modal
modal.close();
```

---
