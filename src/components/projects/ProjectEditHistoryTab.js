'use client'
import { useState } from 'react';
import { History, User, Calendar, Edit, Plus, Trash2, RefreshCw, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const getActionIcon = (action) => {
  switch (action) {
    case 'created': return Plus;
    case 'updated': return Edit;
    case 'deleted': return Trash2;
    case 'status_changed': return RefreshCw;
    case 'viewed': return Eye;
    default: return Edit;
  }
};

const getActionColor = (action) => {
  switch (action) {
    case 'created': return 'text-green-600 bg-green-100';
    case 'updated': return 'text-blue-600 bg-blue-100';
    case 'deleted': return 'text-red-600 bg-red-100';
    case 'status_changed': return 'text-purple-600 bg-purple-100';
    case 'viewed': return 'text-gray-600 bg-gray-100';
    default: return 'text-blue-600 bg-blue-100';
  }
};

const formatActionDescription = (entry) => {
  const { action, field, oldValue, newValue, description } = entry;
  
  if (description) return description;
  
  switch (action) {
    case 'created':
      return 'Project was created';
    case 'updated':
      if (field && oldValue && newValue) {
        return `Updated ${field} from "${oldValue}" to "${newValue}"`;
      }
      return 'Project details were updated';
    case 'status_changed':
      return `Status changed from "${oldValue}" to "${newValue}"`;
    case 'deleted':
      return 'Project was deleted';
    case 'viewed':
      return 'Project was viewed';
    default:
      return 'Project was modified';
  }
};

export default function ProjectEditHistoryTab({ project }) {
  const [expandedEntries, setExpandedEntries] = useState(new Set());
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');

  const editHistory = project.editHistory || [];
  
  // Get unique actions and users for filters
  const uniqueActions = [...new Set(editHistory.map(entry => entry.action))];
  const uniqueUsers = [...new Set(editHistory.map(entry => entry.userId))];

  // Filter history entries
  const filteredHistory = editHistory.filter(entry => {
    if (filterAction !== 'all' && entry.action !== filterAction) return false;
    if (filterUser !== 'all' && entry.userId !== filterUser) return false;
    return true;
  });

  // Sort by timestamp (newest first)
  const sortedHistory = [...filteredHistory].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  const toggleExpanded = (entryId) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const clearFilters = () => {
    setFilterAction('all');
    setFilterUser('all');
  };

  if (editHistory.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full">
            <History className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">No Edit History</h3>
          <p className="text-gray-500">
            No edit history is available for this project yet. Changes and updates will be tracked here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Edit History</h3>
          <p className="mt-1 text-gray-600">
            {editHistory.length} change(s) recorded for this project
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium text-gray-700">Filter by Action</label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {action.charAt(0).toUpperCase() + action.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium text-gray-700">Filter by User</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              {uniqueUsers.map(userId => (
                <option key={userId} value={userId}>
                  {userId}
                </option>
              ))}
            </select>
          </div>
          
          {(filterAction !== 'all' || filterUser !== 'all') && (
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 transition-colors border border-gray-300 rounded-md hover:text-gray-800 hover:bg-white"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
        
        {(filterAction !== 'all' || filterUser !== 'all') && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {sortedHistory.length} of {editHistory.length} entries
          </div>
        )}
      </div>

      {/* History Timeline */}
      {sortedHistory.length > 0 ? (
        <div className="space-y-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-6">
              {sortedHistory.map((entry, index) => {
                const ActionIcon = getActionIcon(entry.action);
                const isExpanded = expandedEntries.has(entry.id);
                const hasDetails = entry.details || entry.changes || entry.metadata;
                
                return (
                  <div key={entry.id || index} className="relative flex items-start">
                    {/* Timeline dot */}
                    <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${getActionColor(entry.action)}`}>
                      <ActionIcon className="w-5 h-5" />
                    </div>
                    
                    {/* Entry content */}
                    <div className="flex-1 ml-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div 
                        className={`p-4 ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                        onClick={hasDetails ? () => toggleExpanded(entry.id) : undefined}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center mb-1 space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(entry.action)}`}>
                                {entry.action.charAt(0).toUpperCase() + entry.action.slice(1).replace('_', ' ')}
                              </span>
                              <span className="text-sm text-gray-500">
                                by {entry.userName || entry.userId}
                              </span>
                            </div>
                            
                            <p className="mb-1 font-medium text-gray-900">
                              {formatActionDescription(entry)}
                            </p>
                            
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>{formatDate(entry.timestamp)}</span>
                              {entry.ipAddress && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>IP: {entry.ipAddress}</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {hasDetails && (
                            <button className="p-1 rounded hover:bg-gray-100">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Expanded details */}
                      {isExpanded && hasDetails && (
                        <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                          <div className="pt-4 space-y-3">
                            {/* Changes */}
                            {entry.changes && entry.changes.length > 0 && (
                              <div>
                                <h5 className="mb-2 text-sm font-medium text-gray-700">Changes Made:</h5>
                                <div className="space-y-2">
                                  {entry.changes.map((change, idx) => (
                                    <div key={idx} className="p-3 text-sm bg-white border rounded">
                                      <div className="font-medium text-gray-900">{change.field}</div>
                                      <div className="grid grid-cols-1 gap-2 mt-1 md:grid-cols-2">
                                        <div>
                                          <span className="font-medium text-red-600">From: </span>
                                          <span className="text-gray-600">{change.oldValue || 'N/A'}</span>
                                        </div>
                                        <div>
                                          <span className="font-medium text-green-600">To: </span>
                                          <span className="text-gray-600">{change.newValue || 'N/A'}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Additional details */}
                            {entry.details && (
                              <div>
                                <h5 className="mb-2 text-sm font-medium text-gray-700">Additional Details:</h5>
                                <div className="p-3 text-sm text-gray-600 bg-white border rounded">
                                  {entry.details}
                                </div>
                              </div>
                            )}
                            
                            {/* Metadata */}
                            {entry.metadata && (
                              <div>
                                <h5 className="mb-2 text-sm font-medium text-gray-700">Metadata:</h5>
                                <div className="p-3 text-sm text-gray-600 bg-white border rounded">
                                  <pre className="whitespace-pre-wrap">
                                    {JSON.stringify(entry.metadata, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center border border-gray-200 rounded-lg bg-gray-50">
          <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h4 className="mb-2 text-lg font-medium text-gray-900">No Matching History</h4>
          <p className="text-gray-500">
            No edit history entries match your current filters. Try adjusting the filters above.
          </p>
        </div>
      )}
    </div>
  );
}