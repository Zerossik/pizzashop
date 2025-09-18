export const useState = (initState) => {
  let state = initState;
  const listeners = [];

  const setState = (newState) => {
    if (state === newState) return;
    state = newState;
    listeners.forEach((el) => el());
  };

  const subscribe = (fn) => listeners.push(fn);

  return [state, setState, subscribe];
};
