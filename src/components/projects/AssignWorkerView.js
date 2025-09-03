'use client'

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dataManager } from '@/lib/data-manager';
import Button from '../ui/Button';
import Input from '../ui/Form/Input';
import { Users, UserPlus, Search, CheckSquare, Square, X, AlertTriangle } from 'lucide-react';

// Modal component for assigning and adding workers
const WorkerAssignmentModal = ({ project, onSave, onClose }) => {
    const { user } = useAuth();
    const [allWorkers, setAllWorkers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWorkerIds, setSelectedWorkerIds] = useState(() => project.workers?.map(w => w.id) || []);
    const [showAddNew, setShowAddNew] = useState(false);
    const [newWorkerName, setNewWorkerName] = useState('');
    const [newWorkerMobile, setNewWorkerMobile] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                setLoading(true);
                const users = await dataManager.getUsers();
                // Show all workers created by this contractor
                setAllWorkers(users.filter(u => u.role === 'worker' && u.createdBy === user?.id));
            } catch (err) {
                setError('Failed to load workers');
                console.error('Error fetching workers:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkers();
    }, [user?.id]);

    const filteredWorkers = useMemo(() => {
        if (!searchTerm.trim()) return allWorkers;
        const lowerSearch = searchTerm.toLowerCase();
        return allWorkers.filter(w => 
            w.name.toLowerCase().includes(lowerSearch) || 
            w.mobile.includes(lowerSearch)
        );
    }, [searchTerm, allWorkers]);

    const handleToggleWorker = (workerId) => {
        setSelectedWorkerIds(prev =>
            prev.includes(workerId) ? prev.filter(id => id !== workerId) : [...prev, workerId]
        );
    };

    const handleSelectAll = () => {
        if (selectedWorkerIds.length === filteredWorkers.length) {
            // Deselect all filtered workers
            setSelectedWorkerIds(prev => prev.filter(id => !filteredWorkers.some(w => w.id === id)));
        } else {
            // Select all filtered workers
            const filteredIds = filteredWorkers.map(w => w.id);
            setSelectedWorkerIds(prev => [...new Set([...prev, ...filteredIds])]);
        }
    };
    
    const handleAddNewWorker = async () => {
        if (!newWorkerName.trim() || !newWorkerMobile.trim()) {
            setError('Please fill in all fields for the new worker');
            return;
        }
        
        setIsSubmitting(true);
        setError('');
        
        try {
            const newWorker = await dataManager.addUser({
                name: newWorkerName.trim(),
                mobile: newWorkerMobile.trim(),
                role: 'worker',
                createdBy: user?.id,
            });
            setAllWorkers(prev => [newWorker, ...prev]);
            setSelectedWorkerIds(prev => [...prev, newWorker.id]);
            setShowAddNew(false);
            setNewWorkerName('');
            setNewWorkerMobile('');
        } catch (err) {
            setError(err.message || "Failed to create worker");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleAssignWorkers = async () => {
        setIsSubmitting(true);
        setError('');
        
        try {
            const workersToAssign = allWorkers.filter(w => selectedWorkerIds.includes(w.id));
            
            // 1. Update the project with the new list of workers
            const updatedProject = await dataManager.updateProject(project.id, {
                workers: workersToAssign.map(w => ({ id: w.id, name: w.name, mobile: w.mobile })),
            });

            // 2. Update each selected worker to include this project ID
            await Promise.all(workersToAssign.map(worker => {
                const updatedProjects = Array.isArray(worker.projects) ? [...worker.projects, project.id] : [project.id];
                // Remove duplicates in case it was already assigned
                const uniqueProjects = [...new Set(updatedProjects)];
                return dataManager.updateUser(worker.id, { projects: uniqueProjects });
            }));

            // Close modal and update parent immediately
            onSave(updatedProject);
            onClose();

        } catch (err) {
            setError(err.message || "Failed to assign workers");
            setIsSubmitting(false); // Only set to false on error, success case closes modal
        }
    };

    const isAssignButtonDisabled = selectedWorkerIds.length === 0 || isSubmitting;
    const isAddButtonDisabled = !newWorkerName.trim() || !newWorkerMobile.trim() || isSubmitting;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00000050]">
            <div className="w-full max-w-lg bg-white rounded-lg shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Manage Workers</h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Assign workers to "{project.name}"
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="flex items-center p-3 mb-4 text-red-700 border border-red-200 rounded-lg bg-red-50">
                            <AlertTriangle className="flex-shrink-0 w-5 h-5 mr-2" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                            <span className="ml-3 text-gray-600">Loading workers...</span>
                        </div>
                    ) : allWorkers.length > 0 ? (
                        <>
                            {/* Search Bar */}
                            <div className="relative mb-4">
                                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                <Input 
                                    placeholder="Search workers by name or mobile..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4"
                                />
                            </div>

                            {/* Select All Button */}
                            {filteredWorkers.length > 0 && (
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-600">
                                        {selectedWorkerIds.length} of {allWorkers.length} workers selected
                                    </span>
                                    <button
                                        onClick={handleSelectAll}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                    >
                                        {selectedWorkerIds.length === filteredWorkers.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                            )}

                            {/* Workers List */}
                            <div className="overflow-y-auto border border-gray-200 divide-y divide-gray-200 rounded-lg max-h-48">
                                {filteredWorkers.length > 0 ? filteredWorkers.map(worker => (
                                    <div 
                                        key={worker.id} 
                                        onClick={() => handleToggleWorker(worker.id)} 
                                        className="flex items-center p-4 transition-colors cursor-pointer hover:bg-gray-50"
                                    >
                                        {selectedWorkerIds.includes(worker.id) ? 
                                            <CheckSquare className="flex-shrink-0 w-5 h-5 mr-3 text-blue-600" /> : 
                                            <Square className="flex-shrink-0 w-5 h-5 mr-3 text-gray-400" />
                                        }
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{worker.name}</p>
                                            <p className="text-sm text-gray-500">{worker.mobile}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-4 text-center text-gray-500">
                                        <p>No workers match your search</p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="py-8 text-center">
                            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium text-gray-600">No Workers Available</p>
                            <p className="mt-1 text-sm text-gray-500">Create your first worker to get started</p>
                        </div>
                    )}

                    {/* Add New Worker Section */}
                    <div className="mt-6">
                        <Button 
                            variant="outline" 
                            onClick={() => setShowAddNew(!showAddNew)}
                            className="justify-center w-full"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            {showAddNew ? 'Cancel Adding Worker' : 'Add New Worker'}
                        </Button>
                    </div>
                    
                    {showAddNew && (
                        <div className="p-4 mt-4 border border-gray-200 rounded-lg bg-gray-50">
                            <h4 className="mb-3 font-medium text-gray-900">Create New Worker</h4>
                            <div className="space-y-3">
                                <Input 
                                    placeholder="Worker Name" 
                                    value={newWorkerName} 
                                    onChange={(e) => setNewWorkerName(e.target.value)}
                                />
                                <Input 
                                    placeholder="Mobile Number" 
                                    value={newWorkerMobile} 
                                    onChange={(e) => setNewWorkerMobile(e.target.value)}
                                />
                                <Button 
                                    onClick={handleAddNewWorker} 
                                    loading={isSubmitting}
                                    disabled={isAddButtonDisabled}
                                    className="w-full"
                                >
                                    Create and Select Worker
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 rounded-b-lg bg-gray-50">
                    <div className="text-sm text-gray-600">
                        {selectedWorkerIds.length} worker(s) selected
                    </div>
                    <div className="flex space-x-3">
                        <Button 
                            variant="outline" 
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleAssignWorkers} 
                            loading={isSubmitting}
                            disabled={isAssignButtonDisabled}
                        >
                            Assign Workers
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main component to display workers and the "Add" button
export default function AssignWorkerView({ project, onUpdate }) {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleModalSave = (updatedProject) => {
        if (onUpdate) {
            onUpdate(updatedProject);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-500">Workers</label>
                {user?.role === 'contractor' && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsModalOpen(true)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Manage Workers
                    </Button>
                )}
            </div>
            
            <div className="flex items-start">
                <Users className="flex-shrink-0 w-5 h-5 mt-1 mr-3 text-purple-600" />
                <div className="flex-1">
                    {project.workers && project.workers.length > 0 ? (
                        <div>
                            <p className="mb-2 font-medium text-gray-900">
                                {project.workers.length} worker{project.workers.length !== 1 ? 's' : ''} assigned
                            </p>
                            <div className="space-y-2 overflow-y-auto max-h-48">
                                {project.workers.map((worker) => (
                                    <div key={worker.id} className="flex items-center p-2 rounded-lg bg-gray-50">
                                        <div className="flex items-center justify-center w-8 h-8 mr-3 bg-purple-100 rounded-full">
                                            <span className="text-sm font-medium text-purple-600">
                                                {worker.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{worker.name}</p>
                                            <p className="text-xs text-gray-500">{worker.mobile}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="py-1">
                            {/* <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full">
                                <Users className="w-6 h-6 text-gray-400" />
                            </div> */}
                            <p className="text-sm text-gray-500">No workers assigned</p>
                            {user?.role === 'contractor' && (
                                <p className="mt-1 text-xs text-gray-400">
                                    Click "Manage Workers" to assign team members
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {isModalOpen && (
                <WorkerAssignmentModal 
                    project={project} 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleModalSave} 
                />
            )}
        </div>
    );
}