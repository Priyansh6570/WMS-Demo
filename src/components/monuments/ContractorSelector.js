'use client'

import { useState, useEffect, useMemo, useRef } from 'react';
import { dataManager } from '@/lib/data-manager';
import { useAuth } from '@/context/AuthContext';
import { 
  Search, 
  UserPlus, 
  X, 
  User, 
  Phone, 
  CheckCircle,
  Plus,
  Building2
} from 'lucide-react';
import Input from '../ui/Form/Input';
import Button from '../ui/Button';

export default function ContractorSelector({ onContractorSelect, selectedContractor = null }) {
  const { user: currentUser } = useAuth();
  const [allContractors, setAllContractors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [localSelectedContractor, setLocalSelectedContractor] = useState(selectedContractor);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newContractorName, setNewContractorName] = useState('');
  const [newContractorMobile, setNewContractorMobile] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        setLoading(true);
        const users = await dataManager.getUsers();
        setAllContractors(users.filter(u => u.role === 'contractor'));
      } catch (error) {
        console.error("Failed to fetch contractors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContractors();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowAddNew(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchResults = useMemo(() => {
    if (!searchTerm) return allContractors.slice(0, 10); // Show first 10 when no search
    const lowerSearch = searchTerm.toLowerCase();
    return allContractors.filter(c =>
      c.name.toLowerCase().includes(lowerSearch) ||
      c.mobile.includes(lowerSearch)
    );
  }, [searchTerm, allContractors]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);
    setShowAddNew(false);
    
    // If user clears the input, also clear selection
    if (!value && localSelectedContractor) {
      setLocalSelectedContractor(null);
      onContractorSelect(null);
    }
  };

  const handleSelect = (contractor) => {
    setLocalSelectedContractor(contractor);
    setSearchTerm(contractor.name);
    setShowDropdown(false);
    setShowAddNew(false);
    onContractorSelect({ id: contractor.id, name: contractor.name });
  };

  const handleClearSelection = () => {
    setLocalSelectedContractor(null);
    setSearchTerm('');
    setShowDropdown(false);
    onContractorSelect(null);
    inputRef.current?.focus();
  };
  
  const handleAddNewContractor = async () => {
    if (!newContractorName.trim() || !newContractorMobile.trim()) return;
    
    setIsCreating(true);
    try {
      const newContractor = await dataManager.addUser({
        name: newContractorName.trim(),
        mobile: newContractorMobile.trim(),
        role: 'contractor',
        createdBy: currentUser.id,
      });
      
      setAllContractors(prev => [newContractor, ...prev]);
      handleSelect(newContractor);
      
      // Reset form
      setNewContractorName('');
      setNewContractorMobile('');
    } catch (error) {
      console.error("Failed to add contractor:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  if (localSelectedContractor) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Selected Contractor
        </label>
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900">{localSelectedContractor.name}</h4>
                <p className="text-sm text-green-700 flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  {localSelectedContractor.mobile}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearSelection}
              className="text-green-700 hover:text-green-900 hover:bg-green-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3" ref={dropdownRef}>
      <label className="flex items-center text-sm font-semibold text-gray-700">
        <User className="w-4 h-4 mr-2" />
        Search & Select Contractor
      </label>
      
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder={loading ? "Loading contractors..." : "Search by name or mobile number..."}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            disabled={loading}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && !loading && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-hidden">
            
            {/* Search Results */}
            <div className="max-h-64 overflow-y-auto">
              {searchResults.length > 0 ? (
                <>
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      {searchTerm ? `Search Results (${searchResults.length})` : `Available Contractors (${searchResults.length})`}
                    </p>
                  </div>
                  {searchResults.map(contractor => (
                    <div 
                      key={contractor.id} 
                      onClick={() => handleSelect(contractor)} 
                      className="px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{contractor.name}</p>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {contractor.mobile}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="p-6 text-center">
                  <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-700 mb-1">No contractors found</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    {searchTerm 
                      ? `No contractors match "${searchTerm}"`
                      : "No contractors available"
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Add New Section */}
            {!showAddNew && (
              <div className="border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowAddNew(true)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserPlus className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Add New Contractor</p>
                      <p className="text-xs text-gray-600">Create a new contractor profile</p>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add New Form */}
        {showAddNew && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl p-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Add New Contractor</h4>
                  <p className="text-sm text-gray-600">Create a new contractor profile</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Contractor Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={newContractorName}
                    onChange={(e) => setNewContractorName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={newContractorMobile}
                    onChange={(e) => setNewContractorMobile(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowAddNew(false);
                    setNewContractorName('');
                    setNewContractorMobile('');
                  }}
                  className="text-gray-600"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleAddNewContractor} 
                  loading={isCreating}
                  disabled={!newContractorName.trim() || !newContractorMobile.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Contractor
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        Search for existing contractors or add a new one if not found
      </p>
    </div>
  );
}