import constantsData from '../data/constants.json';

export const ROLES = constantsData.roles;
export const PROJECT_STATUS = constantsData.projectStatus;
export const MILESTONE_STATUS = constantsData.milestoneStatus;
export const DOCUMENT_CATEGORIES = constantsData.documentCategories;
export const ISSUE_TYPES = constantsData.issueTypes;
export const PRIORITY = constantsData.priority;
export const MONUMENT_CONDITIONS = constantsData.monumentConditions;

// Demo OTP for all users
export const DEMO_OTP = '123456';

// Routes that don't require authentication
export const PUBLIC_ROUTES = ['/', '/WMS/login'];

// Role-based navigation items
export const getNavigationItems = (role) => {
  const baseItems = [
    { name: 'Dashboard', href: '/WMS/dashboard', icon: 'LayoutDashboard' }
  ];

  const roleSpecificItems = {
    super_admin: [
      { name: 'Users', href: '/WMS/users', icon: 'Users' },
      { name: 'Monuments', href: '/WMS/monuments', icon: 'Building' },
      { name: 'Projects', href: '/WMS/projects', icon: 'FolderOpen' }
    ],
    admin: [
      { name: 'Users', href: '/WMS/users', icon: 'Users' },
      { name: 'Monuments', href: '/WMS/monuments', icon: 'Building' },
      { name: 'Projects', href: '/WMS/projects', icon: 'FolderOpen' }
    ],
    quality_manager: [
      { name: 'Projects', href: '/WMS/projects', icon: 'FolderOpen' }
    ],
    financial_officer: [
      { name: 'Projects', href: '/WMS/projects', icon: 'FolderOpen' }
    ],
    contractor: [
      { name: 'Users', href: '/WMS/users', icon: 'Users' },
      { name: 'Projects', href: '/WMS/projects', icon: 'FolderOpen' }
    ],
    worker: [
      { name: 'Projects', href: '/WMS/projects', icon: 'FolderOpen' }
    ]
  };

  return [...baseItems, ...(roleSpecificItems[role] || [])];
};

// Check if user has permission
export const hasPermission = (userRole, permission) => {
  if (userRole === 'super_admin') return true;
  const rolePermissions = ROLES[userRole]?.permissions || [];
  return rolePermissions.includes(permission) || rolePermissions.includes('all');
};

// Get role display info
export const getRoleInfo = (role) => {
  return ROLES[role] || { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
};

// Get status display info
export const getStatusInfo = (status, type = 'project') => {
  const statusMap = type === 'milestone' ? MILESTONE_STATUS : PROJECT_STATUS;
  return statusMap[status] || { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
};