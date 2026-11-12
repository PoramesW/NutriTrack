
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "nutritrack_token";

// Shared API request
async function apiRequest(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// Authentication API
export const authApi = {
  login: (email, password) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, password) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  me: () => apiRequest("/auth/me"),
};

// Food Tracking API
export const foodApi = {
  getAll: () => apiRequest("/food"),

  getSummary: () => apiRequest("/food/summary"),

  add: (data) =>
    apiRequest("/food", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    apiRequest(`/food/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};

// Food Catalog API
export const catalogApi = {
  async searchIngredients(query = "") {
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set("q", query.trim());
    }

    const response = await fetch(
      `${API_URL}/catalog/ingredients?${params.toString()}`
    );

    const data = await response.json().catch(() => []);

    if (!response.ok) {
      throw new Error(data.message || "Unable to search food catalog");
    }

    return data;
  },

  async calculate(id, quantity) {
    const response = await fetch(`${API_URL}/catalog/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, quantity }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Unable to calculate nutrition");
    }

    return data;
  },
};

export { TOKEN_KEY };
