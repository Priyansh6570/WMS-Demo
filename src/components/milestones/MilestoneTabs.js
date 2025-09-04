'use client';

import { useState } from 'react';
import MilestoneDetailsTab from './MilestoneDetailsTab';
import MilestoneEditHistoryTab from './MilestoneEditHistoryTab';
import ProofOfWorkTab from './ProofOfWorkTab';
import { Info, Image, FileText, Banknote, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import InspectionRecordTab from './InspectionRecordTab';
import BillRecordTab from './BillRecordTab';

export default function MilestoneTabs({ milestone, projectId, onUpdate }) {
    const [activeTab, setActiveTab] = useState('details');

    const proof = milestone.proofOfWork;
    const proofCount = (proof?.photos.before.length || 0) + (proof?.photos.during.length || 0) + (proof?.photos.after.length || 0) + (proof?.documents.length || 0);
    const billRecordCount = milestone.financial_record ? 1 : 0;

    const tabs = [
        { id: "details", label: "Details", icon: Info, count: null },
        { id: "proof_of_work", label: "Proof of Work", icon: Image, count: proofCount },
        { id: "inspection_record", label: "Inspection Record", icon: FileText, count: milestone.quality_manager_review?.length || 0 },
        { id: "bill_record", label: "Bill Record", icon: Banknote, count: billRecordCount },
        { id: "edit_history", label: "Edit History", icon: History, count: milestone.editHistory?.length || 0 }
    ];
    
    const renderTabContent = () => {
        switch(activeTab) {
            case 'details':
                return <MilestoneDetailsTab milestone={milestone} />;
            case 'proof_of_work':
                return <ProofOfWorkTab milestone={milestone} projectId={projectId} />;
            case 'edit_history':
                return <MilestoneEditHistoryTab milestone={milestone} />;
            case 'inspection_record':
                return <InspectionRecordTab milestone={milestone} projectId={projectId} onUpdate={onUpdate} />;
            case 'bill_record':
                return <BillRecordTab milestone={milestone} projectId={projectId} />;
            default:
                return (
                     <div className="py-12 text-center rounded-lg">
                        <Info className="w-12 h-12 mx-auto text-gray-300" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Feature Coming Soon</h3>
                        <p className="mt-1 text-sm text-gray-500">This section is currently under development.</p>
                    </div>
                );
        }
    };

    return (
        <div className="overflow-hidden text-gray-700 bg-white border border-gray-100 shadow-xl rounded-2xl">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <nav className="flex px-6">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center space-x-2 py-4 px-6 border-b-3 font-medium text-sm transition-all duration-200",
                                    activeTab === tab.id
                                        ? "border-blue-600 text-blue-600 bg-white/50"
                                        : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-white/30"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                                {tab.count !== null && (
                                    <span className={cn(
                                        'px-2 py-0.5 rounded-full text-xs font-bold',
                                        activeTab === tab.id
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-200 text-gray-600'
                                    )}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
            <div className="p-8">
                {renderTabContent()}
            </div>
        </div>
    );
}