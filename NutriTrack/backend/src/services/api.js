// Dashboard API
export const dashboardApi = {
  get: () => apiRequest("/analytics/dashboard"),

  updateWeight: (weight) =>
    apiRequest("/analytics/weight", {
      method: "POST",
      body: JSON.stringify({ weight }),
    }),
};

// Analytics API
export const analyzationApi = {
  get: (period = "7") =>
    apiRequest(`/analyzation?period=${encodeURIComponent(period)}`),
};