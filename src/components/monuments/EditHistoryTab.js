'use client'
import { formatDate } from '@/lib/utils';
import { History, User, Calendar, Edit3, ArrowRight, FileText, MapPin, Settings } from 'lucide-react';

const getFieldIcon = (field) => {
  switch (field.toLowerCase()) {
    case 'name': return FileText;
    case 'description': return Edit3;
    case 'location': return MapPin;
    case 'condition': return Settings;
    case 'geofenceradius': return Settings;
    case 'photos': return FileText;
    default: return Edit3;
  }
};

const getFieldLabel = (field) => {
  const labels = {
    'name': 'Monument Name',
    'description': 'Description',
    'location': 'Location',
    'condition': 'Condition',
    'geoFenceRadius': 'Geofence Radius',
    'photos': 'Photos',
    'currentStatus': 'Status'
  };
  return labels[field] || field;
};

const formatFieldValue = (field, value) => {
  if (value === null || value === undefined) return 'Not set';
  
  switch (field.toLowerCase()) {
    case 'photos':
      if (Array.isArray(value)) {
        return `${value.length} photo${value.length !== 1 ? 's' : ''}`;
      }
      return String(value);
    case 'geofenceradius':
      return `${value}m`;
    case 'location':
      if (typeof value === 'object' && value.text) {
        return value.text;
      }
      return String(value);
    case 'currentstatus':
      if (typeof value === 'object' && value.condition) {
        return value.condition;
      }
      return String(value);
    default:
      return String(value);
  }
};

export default function EditHistoryTab({ history, monument, totalEntries, isFiltered }) {
  if (!history || history.length === 0) {
    return (
      <div className="py-12 text-center text-gray-700 border-2 border-gray-200 border-dashed bg-gray-50 rounded-xl">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full">
            <History className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {isFiltered ? 'No Matching History' : 'No Edit History'}
          </h3>
          <p className="text-gray-500">
            {isFiltered 
              ? 'No edit history entries match your search criteria.'
              : 'All changes to this monument will appear here for audit purposes.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Edit History</h3>
          <p className="text-sm text-gray-600">
            {isFiltered 
              ? `${history.length} of ${totalEntries} entries shown`
              : `${totalEntries} change${totalEntries !== 1 ? 's' : ''} recorded`
            }
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-8">
          {history.map((entry, index) => {
            const isLatest = index === 0;
            return (
              <div key={entry.id || index} className="relative flex items-start">
                {/* Timeline dot */}
                <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 ${
                  isLatest 
                    ? 'bg-blue-100 border-blue-500' 
                    : 'bg-white border-gray-300'
                }`}>
                  <History className={`w-6 h-6 ${
                    isLatest ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                </div>

                {/* Content */}
                <div className="flex-1 ml-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {entry.editedBy || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Made {entry.changes?.length || 0} change{entry.changes?.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(entry.editedAt)}
                      </div>
                    </div>
                  </div>

                  {/* Changes */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {entry.changes?.map((change, changeIndex) => {
                        const FieldIcon = getFieldIcon(change.field);
                        return (
                          <div key={changeIndex} className="flex items-start p-3 space-x-3 rounded-lg bg-gray-50">
                            <div className="flex items-center justify-center flex-shrink-0 w-6 h-6 mt-1 bg-white border border-gray-200 rounded-full">
                              <FieldIcon className="w-3 h-3 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="mb-1 text-sm font-medium text-gray-900">
                                {getFieldLabel(change.field)}
                              </p>
                              <div className="flex items-center space-x-2 text-sm">
                                <div className="flex-1 min-w-0">
                                  <span className="text-gray-500">From:</span>
                                  <span className="px-2 py-1 ml-1 font-mono text-xs text-red-700 break-all bg-red-100 rounded">
                                    {formatFieldValue(change.field, change.oldValue)}
                                  </span>
                                </div>
                                <ArrowRight className="flex-shrink-0 w-4 h-4 text-gray-400" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-gray-500">To:</span>
                                  <span className="px-2 py-1 ml-1 font-mono text-xs text-green-700 break-all bg-green-100 rounded">
                                    {formatFieldValue(change.field, change.newValue)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Edit ID: {entry.id || 'N/A'}</span>
                      <span>{formatDate(entry.editedAt, { includeTime: true })}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}