const proxyMap = new WeakMap();

/**
 *
 * @param {*} initState
 * @param {(target: object, prop: any, value: any) => void} onChange
 * @returns {Proxy}
 */
export const useState = (initState, onChange) => {
  if (proxyMap.has(initState)) return proxyMap.get(initState);

  if (typeof initState !== "object" || initState === null) {
    return useState({ value: initState }, onChange);
  }

  const arrayMethods = [
    "push",
    "pop",
    "shift",
    "unshift",
    "splice",
    "sort",
    "reverse",
    "fill",
    "copyWithin",
    "concat",
  ];

  const proxy = new Proxy(initState, {
    set(target, prop, value) {
      const prevState = target[prop];

      if (prevState === value) return true;
      const result = Reflect.set(target, prop, value);
      onChange?.(target, prop, value);
      return result;
    },

    get(target, prop) {
      const value = Reflect.get(target, prop);

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(target)
      ) {
        return useState(value, onChange);
      }

      if (Array.isArray(target) && arrayMethods.includes(prop)) {
        return (...args) => {
          const result = Array.prototype[prop].apply(target, args);

          onChange?.(target, prop, args);
          return result;
        };
      }
      return value;
    },
  });

  proxyMap.set(initState, proxy);
  return proxy;
};
