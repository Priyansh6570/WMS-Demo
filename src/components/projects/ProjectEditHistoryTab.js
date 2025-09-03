'use client'
import { formatDate } from '@/lib/utils';
import { History, User, Calendar, Edit3, ArrowRight, FileText, MapPin, Settings, DollarSign, Clock, Flag } from 'lucide-react';

const getFieldIcon = (field) => {
  const iconMap = {
    'name': FileText,
    'description': Edit3,
    'budget': DollarSign,
    'priority': Flag,
    'documents': FileText,
    'timeline.start': Calendar,
    'timeline.end': Calendar,
    'timeline.expectedduration': Clock,
  };
  
  const normalizedField = field.toLowerCase().replace(/\./g, '');
  return iconMap[normalizedField] || Edit3;
};

const getFieldLabel = (field) => {
  const labels = {
    'name': 'Project Name',
    'description': 'Description',
    'budget': 'Budget',
    'timeline.start': 'Start Date',
    'timeline.end': 'End Date',
    'timeline.expectedDuration': 'Expected Duration',
    'priority': 'Priority',
    'documents': 'Documents',
  };
  return labels[field] || field.split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const formatFieldValue = (field, value) => {
  if (value === null || value === undefined || value === '') return 'Not set';

  if (field === 'budget' && typeof value === 'number') {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      minimumFractionDigits: 0 
    }).format(value);
  }
  
  if (field.includes('Date') || field.includes('start') || field.includes('end')) {
    return formatDate(value);
  }

  if (field === 'documents') return value;

  if (field === 'timeline.expectedDuration') {
    const months = parseInt(value);
    if (months === 1) return '1 month';
    if (months < 12) return `${months} months`;
    const years = months / 12;
    return years === 1 ? '1 year' : `${years} years`;
  }

  if (field === 'priority') {
    const priorityColors = {
      low: 'Low Priority',
      medium: 'Medium Priority', 
      high: 'High Priority',
      urgent: 'Urgent Priority'
    };
    return priorityColors[value] || String(value);
  }

  return String(value);
};

const getPriorityColor = (value) => {
  const colors = {
    low: 'text-green-700 bg-green-50',
    medium: 'text-yellow-700 bg-yellow-50',
    high: 'text-orange-700 bg-orange-50', 
    urgent: 'text-red-700 bg-red-50'
  };
  return colors[value] || 'text-gray-700 bg-gray-50';
};

export default function ProjectEditHistoryTab({ project }) {
  const history = project?.editHistory || [];

  if (history.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full">
            <History className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="mb-3 text-xl font-semibold text-gray-900">No Edit History</h3>
          <p className="leading-relaxed text-gray-600">
            All changes to this project will appear here for audit and tracking purposes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Edit History</h3>
          <p className="mt-1 text-gray-600">
            {history.length} change{history.length !== 1 ? 's' : ''} recorded for this project
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-gray-200 to-gray-200"></div>
        
        <div className="space-y-10">
          {history.map((entry, index) => {
            const isLatest = index === 0;
            return (
              <div key={entry.id || index} className="relative flex items-start">
                {/* Enhanced Timeline dot */}
                <div className={`relative z-10 flex items-center justify-center w-18 h-18 rounded-full border-4 shadow-lg ${
                  isLatest 
                    ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-500 shadow-blue-200' 
                    : 'bg-white border-gray-300 shadow-gray-200'
                }`}>
                  <History className={`w-8 h-8 ${
                    isLatest ? 'text-blue-600' : 'text-gray-500'
                  }`} />
                </div>

                {/* Enhanced Content Card */}
                <div className="flex-1 ml-8 overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
                  {/* Header with gradient */}
                  <div className={`px-8 py-6 ${isLatest ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                          isLatest ? 'bg-blue-100' : 'bg-white border border-gray-200'
                        }`}>
                          <User className={`w-6 h-6 ${isLatest ? 'text-blue-600' : 'text-gray-600'}`} />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900">
                            {entry.editedBy || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Modified {entry.changes?.length || 0} field{entry.changes?.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center px-4 py-2 rounded-lg ${
                        isLatest ? 'bg-white/70' : 'bg-white'
                      }`}>
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {formatDate(entry.editedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Changes Section */}
                  <div className="p-8">
                    <div className="space-y-6">
                      {entry.changes?.map((change, changeIndex) => {
                        const FieldIcon = getFieldIcon(change.field);
                        const isValueChange = change.field !== 'priority';
                        
                        return (
                          <div key={changeIndex} className="group">
                            <div className="flex items-start p-5 space-x-4 transition-all duration-200 border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-md bg-gray-50/50 hover:bg-white">
                              <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mt-1 transition-colors duration-200 bg-white border-2 border-gray-200 rounded-full group-hover:border-gray-300">
                                <FieldIcon className="w-5 h-5 text-gray-600 group-hover:text-gray-700" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <p className="mb-3 text-base font-semibold text-gray-900">
                                  {getFieldLabel(change.field)}
                                </p>
                                
                                <div className="flex items-start space-x-4">
                                  {/* From Value */}
                                  <div className="flex-1 min-w-0">
                                    <span className="block mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                                      Previous Value
                                    </span>
                                    <div className={`inline-block px-3 py-2 text-sm font-medium rounded-lg border ${
                                      change.field === 'priority' && change.oldValue 
                                        ? getPriorityColor(change.oldValue) + ' border-current/20'
                                        : 'text-red-700 bg-red-50 border-red-200'
                                    }`}>
                                      {formatFieldValue(change.field, change.oldValue)}
                                    </div>
                                  </div>
                                  
                                  {/* Arrow */}
                                  <div className="flex items-center pt-6">
                                    <ArrowRight className="w-5 h-5 text-gray-400" />
                                  </div>
                                  
                                  {/* To Value */}
                                  <div className="flex-1 min-w-0">
                                    <span className="block mb-2 text-xs font-medium tracking-wide text-gray-500 uppercase">
                                      New Value
                                    </span>
                                    <div className={`inline-block px-3 py-2 text-sm font-medium rounded-lg border ${
                                      change.field === 'priority' && change.newValue 
                                        ? getPriorityColor(change.newValue) + ' border-current/20'
                                        : 'text-green-700 bg-green-50 border-green-200'
                                    }`}>
                                      {formatFieldValue(change.field, change.newValue)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-8 py-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="font-medium">Edit ID: {entry.id || 'N/A'}</span>
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