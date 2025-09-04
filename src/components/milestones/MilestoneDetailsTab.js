'use client';

import { ShieldCheck, Banknote, FileText, Check, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function MilestoneDetailsTab({ milestone }) {
    return (
        <div className="p-8 bg-white">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Left Column */}
                <div className="md:col-span-2">
                    <h3 className="mb-4 text-xl font-semibold text-gray-800">Milestone Details</h3>
                    <p className="mb-6 text-gray-600">{milestone.description}</p>
                    
                     <div className="p-4 rounded-lg bg-gray-50">
                        <h4 className="flex items-center mb-4 font-medium text-gray-700">
                            <ShieldCheck className="w-5 h-5 mr-2 text-gray-400" />
                            Clearance Checklist
                        </h4>
                        <ul className="space-y-3">
                            {milestone.clearanceChecklist.map(item => (
                                <li key={item.id} className="flex items-center text-sm">
                                    <div className={`flex items-center justify-center w-5 h-5 mr-3 rounded-full ${item.completed ? 'bg-green-100 text-green-600' : 'border'}`}>
                                       {item.completed && <Check className="w-3 h-3" />}
                                    </div>
                                    <span className={item.completed ? 'line-through text-gray-500' : 'text-gray-800'}>{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div>
                        <h4 className="flex items-center mb-2 font-medium text-gray-700">
                            <Banknote className="w-5 h-5 mr-2 text-gray-400" />
                            Budget
                        </h4>
                        <p className="text-2xl font-semibold text-gray-900">₹{milestone.budget.toLocaleString('en-IN')}</p>
                    </div>
                    
                    <div>
                        <h4 className="flex items-center mb-2 font-medium text-gray-700">
                            <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                            Timeline
                        </h4>
                        <div className="text-sm">
                            <p><span className="font-semibold text-gray-800">Start Date:</span> {formatDate(milestone.timeline.start)}</p>
                            <p><span className="font-semibold text-gray-800">End Date:</span> {formatDate(milestone.timeline.end)}</p>
                            <p><span className="font-semibold text-gray-800">Created:</span> {formatDate(milestone.createdAt)}</p>
                        </div>
                    </div>

                     {milestone.document && (
                        <div>
                            <h4 className="flex items-center mb-2 font-medium text-gray-700">
                                <FileText className="w-5 h-5 mr-2 text-gray-400" />
                                Document
                            </h4>
                            <a href={milestone.document.path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 transition-colors bg-blue-100 rounded-md hover:bg-blue-200">
                                {milestone.document.name}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}