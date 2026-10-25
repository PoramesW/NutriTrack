
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      result.message || `Request failed: ${response.status}`
    );
  }

  return result;
}

function get(endpoint) {
  return apiRequest(endpoint);
}

function post(endpoint, data) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

function remove(endpoint) {
  return apiRequest(endpoint, {
    method: "DELETE",
  });
}

export const authApi = {
  register: (data) => post("/auth/register", data),
  login: (data) => post("/auth/login", data),
};

export const foodApi = {
  getAll: () => get("/food"),
  getSummary: () => get("/food/summary"),
  add: (data) => post("/food", data),
  delete: (id) => remove(`/food/${encodeURIComponent(id)}`),
};

export const nutritionApi = {
  calculate: (foods, goals) =>
    post("/nutrition/calculate", { foods, goals }),
};

export const analyticsApi = {
  getDashboard: (foods, exercises = [], goals) =>
    post("/analytics/dashboard", { foods, exercises, goals }),
};

export const analyzationApi = {
  analyze: (history, goals) =>
    post("/analyzation", { history, goals }),
};

export const workoutApi = {
  getAll: () => get("/workouts"),
  getSummary: () => get("/workouts/summary"),
  add: (data) => post("/workouts", data),
  delete: (id) => remove(`/workouts/${encodeURIComponent(id)}`),
};
