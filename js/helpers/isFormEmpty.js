export const isFormEmpty = (form) => {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  for (const key in data) {
    const input = form.querySelector(`[name="${key}"]`);
    if (!input.value) return false;
  }

  return true;
};
