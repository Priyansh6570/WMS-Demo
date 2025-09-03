// Enhanced apiRequest function with better logging
async function apiRequest(url, options = {}) {
  console.log(`[DATA_MANAGER] Making request: ${options.method || "GET"} ${url}`);

  try {
    const response = await fetch(url, options);
    console.log(`[DATA_MANAGER] Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[DATA_MANAGER] Error response body:`, errorBody);

      try {
        const errorJson = JSON.parse(errorBody);
        throw new Error(errorJson.message || `HTTP error! status: ${response.status}`);
      } catch {
        throw new Error(`HTTP error! status: ${response.status} - ${errorBody}`);
      }
    }

    if (response.status === 204) {
      // No Content
      console.log(`[DATA_MANAGER] No content response`);
      return null;
    }

    const responseData = await response.json();
    console.log(`[DATA_MANAGER] Response data:`, responseData);
    return responseData;
  } catch (error) {
    console.error(`[DATA_MANAGER] API Request Failed: ${options.method || "GET"} ${url}`);
    console.error(`[DATA_MANAGER] Error:`, error);
    throw error;
  }
}

export const dataManager = {
  getDashboardStats: () => apiRequest("/api/stats"),
  getUsers: () => apiRequest("/api/users"),
  getUserById: (id) => apiRequest(`/api/users/${id}`),
  addUser: (userData) =>
    apiRequest("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    }),
  updateUser: (id, updates) =>
    apiRequest(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }),
  deleteUser: (id) => apiRequest(`/api/users/${id}`, { method: "DELETE" }),

  // --- Monuments API ---
  getMonuments: () => apiRequest("/api/monuments"),
  getMonumentById: (id) => apiRequest(`/api/monuments/${id}`),
  addMonument: (monumentData) =>
    apiRequest("/api/monuments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(monumentData),
    }),
  updateMonument: (id, updates) =>
    apiRequest(`/api/monuments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }),

  // --- Projects API ---
  getProjects: () => apiRequest("/api/projects"),
  getProjectById: (id) => apiRequest(`/api/projects/${id}`),
  addProject: (projectData) => {
    console.log("[DATA_MANAGER] addProject called with:", projectData);
    return apiRequest("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    });
  },
  updateProject: (id, updates) =>
    apiRequest(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }),
};
