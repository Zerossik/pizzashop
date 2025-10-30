export const useData = async (path) => {
  const res = await fetch(path);
  if (!res.ok) throw new Error("Data not found");
  const data = await res.json();
  return data;
};
