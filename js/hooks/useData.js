export const useData = async (path) => {
  const baseURL =
    window.location.hostname === "https://zerossik.github.io"
      ? "https://zerossik.github.io"
      : "";
  console.log(baseURL + path);

  const res = await fetch(baseURL + path);
  if (!res.ok) throw new Error("Data not found");
  const data = await res.json();
  return data;
};
