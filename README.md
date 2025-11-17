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
