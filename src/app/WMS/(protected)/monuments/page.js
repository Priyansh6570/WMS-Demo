'use client'

import { useState, useEffect, useMemo, useCallback } from 'react';
import { dataManager } from '@/lib/data-manager';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import MonumentCard from '@/components/monuments/MonumentCard';
import MonumentForm from '@/components/monuments/MonumentForm';
import { PlusCircle, Search } from 'lucide-react';
import { MONUMENT_CONDITIONS } from '@/lib/constants';

export default function MonumentsPage() {
  const { user } = useAuth();
  const [monuments, setMonuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMonument, setEditingMonument] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');

  const canAddOrEdit = user?.role === 'super_admin' || user?.role === 'admin';

  const fetchMonuments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dataManager.getMonuments();
      setMonuments(data);
    } catch (err) {
      setError('Failed to load monuments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonuments();
  }, [fetchMonuments]);

  const handleOpenModal = (monument = null) => {
    setEditingMonument(monument);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMonument(null);
  };

  const filteredMonuments = useMemo(() => {
    return monuments
      .filter(m => (conditionFilter ? m.currentStatus?.condition === conditionFilter : true))
      .filter(m => {
          const lowerSearch = searchTerm.toLowerCase();
          return (
            m.name.toLowerCase().includes(lowerSearch) ||
            (m.location?.text && m.location.text.toLowerCase().includes(lowerSearch))
          )
        }
      );
  }, [monuments, searchTerm, conditionFilter]);

  return (
    <div className="text-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-700">Monuments</h1>
        {canAddOrEdit && (
          <Link href="/WMS/monuments/create" className="btn btn-primary">
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Monument
          </Link>
        )}
      </div>

      <div className="p-4 mb-6 card">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search by name or location..."
              className="pl-10 input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="input"
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
          >
            <option value="">All Conditions</option>
            {Object.entries(MONUMENT_CONDITIONS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p>Loading monuments...</p>}
      {error && <p className="text-red-600">{error}</p>}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMonuments.map(monument => (
            <MonumentCard key={monument.id} monument={monument} />
          ))}
        </div>
      )}

      {isModalOpen && (
        <MonumentForm
          monument={editingMonument}
          onClose={handleCloseModal}
          onSave={fetchMonuments}
        />
      )}
    </div>
  );
}