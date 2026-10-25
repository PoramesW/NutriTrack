export const foodApi = {
  getAll: () => get("/food"),
  getSummary: () => get("/food/summary"),
  add: (data) => post("/food", data),
  delete: (id) => remove(`/food/${encodeURIComponent(id)}`),
};