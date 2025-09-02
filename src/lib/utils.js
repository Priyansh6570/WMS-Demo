import { clsx } from 'clsx';

// Utility function for conditional classes
export function cn(...inputs) {
  return clsx(inputs);
}

// Generate unique ID
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Format currency
export function formatCurrency(amount, currency = '₹') {
  return `${currency}${amount?.toLocaleString('en-IN') || '0'}`;
}

// Format date
export function formatDate(dateString, options = {}) {
  if (!dateString) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Date(dateString).toLocaleDateString('en-IN', defaultOptions);
}

// Format date and time
export function formatDateTime(dateString) {
  if (!dateString) return '';
  
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Get time ago
export function getTimeAgo(dateString) {
  if (!dateString) return '';
  
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(dateString);
}

// Validate mobile number (Indian format)
export function validateMobile(mobile) {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile);
}

// Validate OTP (6 digits)
export function validateOTP(otp) {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
}

// Calculate project progress
export function calculateProgress(milestones) {
  if (!milestones || milestones.length === 0) return 0;
  
  const completedMilestones = milestones.filter(m => 
    m.status === 'completed' || m.status === 'approved'
  ).length;
  
  return Math.round((completedMilestones / milestones.length) * 100);
}

// Truncate text
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Capitalize first letter
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Sort array by field
export function sortBy(array, field, direction = 'asc') {
  return [...array].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];
    
    if (direction === 'desc') {
      return aValue < bValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });
}

// Filter array by search term
export function filterBySearch(array, searchTerm, fields = []) {
  if (!searchTerm) return array;
  
  const lowerSearchTerm = searchTerm.toLowerCase();
  
  return array.filter(item => {
    return fields.some(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], item);
      return value?.toString().toLowerCase().includes(lowerSearchTerm);
    });
  });
}

// Group array by field
export function groupBy(array, field) {
  return array.reduce((groups, item) => {
    const key = item[field];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}