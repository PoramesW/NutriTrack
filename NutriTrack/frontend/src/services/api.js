export const foodApi = {
  getAll: () => get("/food"),
  getSummary: () => get("/food/summary"),
  add: (data) => post("/food", data),
  delete: (id) => remove(`/food/${encodeURIComponent(id)}`),
};

const CATALOG_API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const catalogApi = {
  async searchIngredients(query = "") {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    const response = await fetch(
      `${CATALOG_API_URL}/catalog/ingredients?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("ไม่สามารถค้นหารายการอาหารได้");
    }

    return response.json();
  },

  async calculate(id, quantity) {
    const response = await fetch(
      `${CATALOG_API_URL}/catalog/calculate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id, quantity })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "คำนวณสารอาหารไม่สำเร็จ");
    }

    return data;
  }
};