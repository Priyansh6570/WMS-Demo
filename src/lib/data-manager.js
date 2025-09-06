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
  // --- Dashboard Stats API ---
  getDashboardStats: () => apiRequest("/api/stats"),
  getContractorDashboardStats: (contractorId) => apiRequest(`/api/contractor?contractorId=${contractorId}`),
  getWorkerDashboardStats: (workerId) => apiRequest(`/api/worker?workerId=${workerId}`),

  // --- Users API ---
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

  // --- Milestones API ---
  getMilestoneById: async (projectId, milestoneId) => {
    const project = await apiRequest(`/api/projects/${projectId}`);
    if (!project || !project.milestones) {
      throw new Error("Project or milestones not found");
    }
    const milestone = project.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new Error("Milestone not found");
    }
    return { ...milestone, projectName: project.name, monumentId: project.monumentId };
  },
  startMilestone: (projectId, milestoneId, userName) =>
    apiRequest(`/api/projects/${projectId}/milestones/${milestoneId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName }),
    }),

  submitMilestoneForInspection: (projectId, milestoneId, userName) =>
    apiRequest(`/api/projects/${projectId}/milestones/${milestoneId}/submit-inspection`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName }),
    }),

    addInspectionRecord: (projectId, milestoneId, inspectionData) =>
    apiRequest(`/api/projects/${projectId}/milestones/${milestoneId}/add-inspection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inspectionData),
    }),

  forwardInspectionToAdmin: (projectId, milestoneId, userName) =>
    apiRequest(`/api/projects/${projectId}/milestones/${milestoneId}/forward-inspection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName }),
    }),

  approveMilestoneInspection: (projectId, milestoneId, userName) =>
    apiRequest(`/api/projects/${projectId}/milestones/${milestoneId}/approve-inspection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName }),
    }),
    
  addBillRecord: (projectId, milestoneId, billData) =>
    apiRequest(`/api/projects/${projectId}/milestones/${milestoneId}/add-bill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(billData),
    }),
};