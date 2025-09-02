// In-memory data storage for demo purposes
let appData = {
  users: [],
  monuments: [],
  projects: [],
  milestones: [],
  documents: [],
  issues: [],
  notifications: [],
  auditLog: []
};

// Load initial data
async function loadInitialData() {
  try {
    // Load users data
    const usersModule = await import('../data/users.json');
    appData.users = usersModule.default.users || usersModule.users || [];
    
    // Initialize other collections if they exist
    try {
      const monumentsModule = await import('../data/monuments.json');
      appData.monuments = monumentsModule.default?.monuments || monumentsModule.monuments || [];
    } catch (e) {
      appData.monuments = [];
    }
    
    try {
      const projectsModule = await import('../data/projects.json');
      appData.projects = projectsModule.default?.projects || projectsModule.projects || [];
    } catch (e) {
      appData.projects = [];
    }
    
    try {
      const milestonesModule = await import('../data/milestones.json');
      appData.milestones = milestonesModule.default?.milestones || milestonesModule.milestones || [];
    } catch (e) {
      appData.milestones = [];
    }
    
    console.log('Initial data loaded:', appData);
  } catch (error) {
    console.error('Error loading initial data:', error);
  }
}

// Initialize data on first import
loadInitialData();

// Generic CRUD operations
export const dataManager = {
  // Get all items from a collection
  getAll: (collection) => {
    return appData[collection] || [];
  },

  // Get item by ID
  getById: (collection, id) => {
    const items = appData[collection] || [];
    return items.find(item => item.id === id);
  },

  // Get items by field value
  getByField: (collection, field, value) => {
    const items = appData[collection] || [];
    return items.filter(item => item[field] === value);
  },

  // Add new item
  add: (collection, item) => {
    if (!appData[collection]) {
      appData[collection] = [];
    }
    
    const newItem = {
      ...item,
      id: item.id || generateId(collection.slice(0, -1)), // Remove 's' from collection name
      createdAt: item.createdAt || new Date().toISOString(),
    };
    
    appData[collection].push(newItem);
    console.log(`Added to ${collection}:`, newItem);
    return newItem;
  },

  // Update item
  update: (collection, id, updates) => {
    const items = appData[collection] || [];
    const index = items.findIndex(item => item.id === id);
    
    if (index !== -1) {
      const oldItem = { ...items[index] };
      items[index] = {
        ...items[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Add to audit log
      dataManager.addAuditLog('update', collection, id, updates, oldItem);
      console.log(`Updated ${collection} ${id}:`, items[index]);
      return items[index];
    }
    return null;
  },

  // Delete item
  delete: (collection, id) => {
    const items = appData[collection] || [];
    const index = items.findIndex(item => item.id === id);
    
    if (index !== -1) {
      const deletedItem = items.splice(index, 1)[0];
      dataManager.addAuditLog('delete', collection, id, {}, deletedItem);
      console.log(`Deleted from ${collection}:`, deletedItem);
      return deletedItem;
    }
    return null;
  },

  // Add audit log entry
  addAuditLog: (action, entityType, entityId, changes, oldData) => {
    const logEntry = {
      id: generateId('audit'),
      action,
      entityType,
      entityId,
      changes,
      oldData,
      timestamp: new Date().toISOString(),
      userId: getCurrentUserId() // You'll implement this
    };
    
    if (!appData.auditLog) {
      appData.auditLog = [];
    }
    appData.auditLog.push(logEntry);
  },

  // Search and filter
  search: (collection, searchTerm, fields = []) => {
    const items = appData[collection] || [];
    if (!searchTerm) return items;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return items.filter(item => {
      return fields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return value?.toString().toLowerCase().includes(lowerSearchTerm);
      });
    });
  },

  // Get filtered and sorted data
  getFiltered: (collection, filters = {}, sortBy = null, sortOrder = 'asc') => {
    let items = [...(appData[collection] || [])];
    
    // Apply filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        items = items.filter(item => {
          if (Array.isArray(filters[key])) {
            return filters[key].includes(item[key]);
          }
          return item[key] === filters[key];
        });
      }
    });
    
    // Apply sorting
    if (sortBy) {
      items.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        
        // Handle dates
        if (sortBy.includes('Date') || sortBy.includes('At')) {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }
        
        if (sortOrder === 'desc') {
          return aVal < bVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }
    
    return items;
  },

  // Get dashboard statistics
  getStats: () => {
    return {
      totalUsers: appData.users?.length || 0,
      totalMonuments: appData.monuments?.length || 0,
      totalProjects: appData.projects?.length || 0,
      activeProjects: appData.projects?.filter(p => p.status === 'active').length || 0,
      totalMilestones: appData.milestones?.length || 0,
      pendingMilestones: appData.milestones?.filter(m => m.status === 'pending' || m.status === 'under_review').length || 0,
      completedMilestones: appData.milestones?.filter(m => m.status === 'completed' || m.status === 'approved').length || 0,
    };
  },

  // Debug: Get all data
  getAllData: () => appData,
  
  // Debug: Reset data
  resetData: () => {
    appData = {
      users: [],
      monuments: [],
      projects: [],
      milestones: [],
      documents: [],
      issues: [],
      notifications: [],
      auditLog: []
    };
    loadInitialData();
  }
};

// Helper function to generate IDs
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to get current user ID (you'll implement this with auth)
function getCurrentUserId() {
  // This will be implemented when you add authentication
  if (typeof window !== 'undefined') {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      return JSON.parse(currentUser).id;
    }
  }
  return 'system';
}

export default dataManager;