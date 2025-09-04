'use client';

import { formatDate } from '@/lib/utils';
import { History, User, Calendar, Edit3, ArrowRight, FileText, DollarSign, Clock, ShieldCheck } from 'lucide-react';

const getFieldIcon = (field) => {
    const iconMap = {
        name: FileText,
        description: Edit3,
        budget: DollarSign,
        timeline: Clock,
        clearanceChecklist: ShieldCheck,
        document: FileText,
    };
    return iconMap[field] || Edit3;
};

const getFieldLabel = (field) => {
    const labels = {
        name: 'Milestone Name',
        description: 'Description',
        budget: 'Budget',
        timeline: 'Timeline',
        clearanceChecklist: 'Checklist',
        document: 'Document',
    };
    return labels[field] || field;
};

const formatFieldValue = (field, value) => {
    if (value === null || value === undefined || value === 'Not set') return 'Not set';
    try {
        if (field === 'budget') return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(value);
        if (field === 'timeline') return `${formatDate(value.start)} to ${formatDate(value.end)}`;
        if (field === 'clearanceChecklist') return `${value.length} item(s)`;
        if (field === 'document' && value.name) return value.name;
        if (typeof value === 'object') return JSON.stringify(value);
    } catch (e) {
        return 'Invalid value';
    }
    return String(value);
};

export default function MilestoneEditHistoryTab({ milestone }) {
    const history = milestone?.editHistory || [];

    if (history.length === 0) {
        return (
            <div className="py-16 text-center">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full">
                        <History className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-gray-900">No Edit History</h3>
                    <p className="leading-relaxed text-gray-600">
                        Changes to this milestone will appear here for audit and tracking.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="relative">
                <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-gray-200 to-gray-200"></div>
                <div className="space-y-10">
                    {history.map((entry, index) => {
                        const isLatest = index === 0;
                        return (
                            <div key={entry.id || index} className="relative flex items-start">
                                <div className={`relative z-10 flex items-center justify-center w-18 h-18 rounded-full border-4 shadow-lg ${isLatest ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-500 shadow-blue-200' : 'bg-white border-gray-300 shadow-gray-200'}`}>
                                    <History className={`w-8 h-8 ${isLatest ? 'text-blue-600' : 'text-gray-500'}`} />
                                </div>
                                <div className="flex-1 ml-8 overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
                                    <div className={`px-8 py-6 ${isLatest ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-gray-50'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${isLatest ? 'bg-blue-100' : 'bg-white border'}`}><User className={`w-6 h-6 ${isLatest ? 'text-blue-600' : 'text-gray-600'}`} /></div>
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-900">{entry.editedBy || 'Unknown'}</p>
                                                    <p className="text-sm text-gray-600">Modified {entry.changes?.length || 0} field(s)</p>
                                                </div>
                                            </div>
                                            <div className={`flex items-center px-4 py-2 rounded-lg ${isLatest ? 'bg-white/70' : 'bg-white'}`}>
                                                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                                                <span className="text-sm font-medium text-gray-700">{formatDate(entry.editedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <div className="space-y-6">
                                            {entry.changes?.map((change, changeIndex) => {
                                                const FieldIcon = getFieldIcon(change.field);
                                                return (
                                                    <div key={changeIndex} className="group">
                                                        <div className="flex items-start p-5 space-x-4 transition-all duration-200 border border-gray-100 rounded-xl hover:shadow-md bg-gray-50/50 hover:bg-white">
                                                            <div className="flex items-center justify-center w-10 h-10 mt-1 bg-white border-2 rounded-full"><FieldIcon className="w-5 h-5 text-gray-600" /></div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="mb-3 text-base font-semibold text-gray-900">{getFieldLabel(change.field)}</p>
                                                                <div className="flex items-start space-x-4">
                                                                    <div className="flex-1 min-w-0"><span className="block mb-2 text-xs font-medium text-gray-500 uppercase">Previous</span><div className="inline-block px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg">{formatFieldValue(change.field, change.oldValue)}</div></div>
                                                                    <div className="flex items-center pt-6"><ArrowRight className="w-5 h-5 text-gray-400" /></div>
                                                                    <div className="flex-1 min-w-0"><span className="block mb-2 text-xs font-medium text-gray-500 uppercase">New</span><div className="inline-block px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg">{formatFieldValue(change.field, change.newValue)}</div></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
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