'use client'
import { useState } from 'react';
import { cn } from '@/lib/utils';
import ProjectDetailView from './ProjectDetailView.js';
import ProjectMilestonesTab from './ProjectMilestonesTab';
import ProjectEditHistoryTab from './ProjectEditHistoryTab';
import { Info, Target, History } from 'lucide-react';

export default function ProjectDetailTabs({ project, monument, onUpdate }) {
  const [activeTab, setActiveTab] = useState('details');

  const tabs = [
    {
      id: 'details',
      label: 'Details',
      icon: Info,
      count: null
    },
    {
      id: 'milestones',
      label: 'Milestones',
      icon: Target,
      count: project.milestones?.length || 0
    },
    {
      id: 'history',
      label: 'Edit History',
      icon: History,
      count: project.editHistory?.length || 0
    },
  ];

  return (
    <div className="overflow-hidden bg-white border border-gray-100 shadow-xl rounded-2xl">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
        <nav className="flex px-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center space-x-2 py-4 px-6 border-b-3 font-medium text-sm transition-all duration-200',
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-white/50'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-white/30'
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

      {/* Tab Content */}
      <div className="p-8 text-gray-700">
        {activeTab === 'details' && (
          <ProjectDetailView project={project} monument={monument} onUpdate={onUpdate} />
        )}
        
        {activeTab === 'milestones' && (
          <ProjectMilestonesTab project={project} onUpdate={onUpdate} />
        )}
        
        {activeTab === 'history' && (
          <ProjectEditHistoryTab project={project} />
        )}
      </div>
    </div>
  );
}