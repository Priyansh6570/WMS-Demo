'use client';

import React from 'react';

// This is a named export, as expected by the page component.
export const StatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
         return 'bg-cyan-100 text-cyan-800';
      case 'on_hold':
      case 'paused':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format the status text for better readability
  const formattedStatus = status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';

  return (
    <span
      className={`inline-flex items-center px-5 py-3 rounded-full text-xs font-medium ${getStatusStyles()}`}
    >
      {formattedStatus}
    </span>
  );
};