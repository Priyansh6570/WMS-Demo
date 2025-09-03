'use client'

import { useState, useEffect, useMemo } from 'react';
import { dataManager } from '@/lib/data-manager';
import { useAuth } from '@/context/AuthContext';
import { Search, UserPlus, X } from 'lucide-react';
import Input from '../ui/Form/Input';
import Button from '../ui/Button';

export default function ContractorSelector({ onContractorSelect }) {
  const { user: currentUser } = useAuth();
  const [allContractors, setAllContractors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newContractorName, setNewContractorName] = useState('');
  const [newContractorMobile, setNewContractorMobile] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const users = await dataManager.getUsers();
        setAllContractors(users.filter(u => u.role === 'contractor'));
      } catch (error) {
        console.error("Failed to fetch contractors:", error);
      }
    };
    fetchContractors();
  }, []);

  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    const lowerSearch = searchTerm.toLowerCase();
    return allContractors.filter(c =>
      c.name.toLowerCase().includes(lowerSearch) ||
      c.mobile.includes(lowerSearch)
    );
  }, [searchTerm, allContractors]);

  const handleSelect = (contractor) => {
    setSelectedContractor(contractor);
    setSearchTerm(contractor.name); // Display the name in the input
    onContractorSelect({ id: contractor.id, name: contractor.name });
  };
  
  const handleAddNewContractor = async () => {
    if (!newContractorName || !newContractorMobile) return;
    setIsCreating(true);
    try {
      const newContractor = await dataManager.addUser({
        name: newContractorName,
        mobile: newContractorMobile,
        role: 'contractor',
        createdBy: currentUser.id,
      });
      setAllContractors(prev => [...prev, newContractor]);
      handleSelect(newContractor);
      setShowAddNew(false);
    } catch (error) {
      console.error("Failed to add contractor:", error);
    } finally {
        setIsCreating(false);
    }
  };
  
  if (selectedContractor) {
    return (
      <div className="text-gray-700 form-group">
        <label className="form-label">Contractor</label>
        <div className="flex items-center justify-between p-2 border rounded-md bg-gray-50">
          <span>{selectedContractor.name} ({selectedContractor.mobile})</span>
          <Button variant="ghost" size="sm" onClick={() => {
              setSelectedContractor(null);
              setSearchTerm('');
              onContractorSelect(null);
          }}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-gray-700 form-group">
      <label className="form-label">Search Contractor</label>
      <div className="relative">
        <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
        <Input
          type="text"
          placeholder="Search by name or mobile..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border rounded-md shadow-lg max-h-60">
            {searchResults.map(contractor => (
              <div key={contractor.id} onClick={() => handleSelect(contractor)} className="px-4 py-2 cursor-pointer hover:bg-gray-100">
                <p className="font-medium">{contractor.name}</p>
                <p className="text-sm text-gray-500">{contractor.mobile}</p>
              </div>
            ))}
            {searchResults.length === 0 && !showAddNew && (
                <div className="p-4 text-sm text-center text-gray-500">
                    No contractors found.
                    <Button variant="ghost" className="ml-2" onClick={() => setShowAddNew(true)}>
                        <UserPlus className="w-4 h-4 mr-2" /> Add New
                    </Button>
                </div>
            )}
          </div>
        )}
      </div>
      {showAddNew && (
          <div className="p-4 mt-2 space-y-4 border rounded-md bg-gray-50">
              <h4 className="font-medium">Add New Contractor</h4>
              <Input placeholder="New Contractor Name" value={newContractorName} onChange={(e) => setNewContractorName(e.target.value)} />
              <Input placeholder="New Contractor Mobile" value={newContractorMobile} onChange={(e) => setNewContractorMobile(e.target.value)} />
              <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowAddNew(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleAddNewContractor} loading={isCreating}>Save Contractor</Button>
              </div>
          </div>
      )}
    </div>
  );
}