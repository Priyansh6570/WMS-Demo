'use client'
import { useState } from 'react';
import Button from '../ui/Button';
import AddPastProjectForm from './AddPastProjectForm';
import { PlusCircle, Calendar, IndianRupee, User, FileText, ExternalLink } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function PastProjectsTab({ projects, monumentId, onUpdate }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 text-gray-700">
      {/* Header with Action Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Past Projects</h3>
          <p className="text-sm text-gray-600">
            {projects.length} completed project{projects.length !== 1 ? 's' : ''} archived for this monument
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Archive Past Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {projects.map(project => (
            <div key={project.id} className="transition-shadow duration-200 bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
              {/* Project Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="mb-2 text-lg font-semibold text-gray-900">{project.name}</h4>
                    <p className="text-sm leading-relaxed text-gray-600 line-clamp-2">
                      {project.description || 'No description provided'}
                    </p>
                  </div>
                  <span className="flex-shrink-0 px-3 py-1 ml-4 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                    Completed
                  </span>
                </div>
              </div>

              {/* Project Details */}
              <div className="p-6 space-y-4">
                {/* Budget */}
                {project.budget && (
                  <div className="flex items-center text-sm">
                    <div className="flex items-center justify-center w-8 h-8 mr-3 bg-green-100 rounded-lg">
                      <IndianRupee className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <span className="text-gray-500">Final Budget:</span>
                      <span className="ml-2 font-medium text-gray-900">{formatCurrency(project.budget)}</span>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {project.timeline?.start && project.timeline?.end && (
                  <div className="flex items-center text-sm">
                    <div className="flex items-center justify-center w-8 h-8 mr-3 bg-blue-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {formatDate(project.timeline.start)} - {formatDate(project.timeline.end)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Contractor */}
                {project.contractorName && (
                  <div className="flex items-center text-sm">
                    <div className="flex items-center justify-center w-8 h-8 mr-3 bg-purple-100 rounded-lg">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-gray-500">Contractor:</span>
                      <span className="ml-2 font-medium text-gray-900">{project.contractorName}</span>
                    </div>
                  </div>
                )}

                {/* Documents */}
                {project.documents && project.documents.length > 0 && (
                  <div className="flex items-start text-sm">
                    <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg mr-3 mt-0.5">
                      <FileText className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-500">Documents:</span>
                      <div className="mt-1 space-y-1">
                        {project.documents.slice(0, 3).map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                            <span className="text-xs font-medium text-gray-700 truncate">
                              {doc.name}
                            </span>
                            <a 
                              href={doc.path} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex-shrink-0 ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                        {project.documents.length > 3 && (
                          <p className="mt-2 text-xs text-gray-500">
                            +{project.documents.length - 3} more document{project.documents.length - 3 !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Archived on {formatDate(project.createdAt)}</span>
                  <span>Project ID: {project.id.slice(-8).toUpperCase()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center border-2 border-gray-200 border-dashed bg-gray-50 rounded-xl">
          <div className="max-w-sm mx-auto">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full">
              <PlusCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">No Past Projects</h3>
            <p className="mb-6 text-gray-500">
              Archive completed projects to maintain a comprehensive record of monument conservation work.
            </p>
            <Button 
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Archive Your First Project
            </Button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <AddPastProjectForm
          monumentId={monumentId}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            onUpdate();
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}