'use client'
import { useState, useEffect, useMemo, useCallback } from 'react';
import { dataManager } from '@/lib/data-manager';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import MonumentCard from '@/components/monuments/MonumentCard';
import { 
  PlusCircle, 
  Search, 
  Building, 
  MapPin, 
  Filter, 
  RefreshCw, 
  Download,
  Eye,
  TrendingUp,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { MONUMENT_CONDITIONS } from '@/lib/constants';

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color]} shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm font-semibold text-gray-700">{title}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

// Section Header Component
const SectionHeader = ({ icon: Icon, title, description }) => (
  <div className="flex items-center space-x-4 mb-6">
    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

export default function MonumentsPage() {
  const { user } = useAuth();
  const [monuments, setMonuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');

  const canAddOrEdit = user?.role === 'super_admin' || user?.role === 'admin';

  const fetchMonuments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await dataManager.getMonuments();
      setMonuments(data);
    } catch (err) {
      setError('Failed to load monuments. Please try again.');
      console.error('Monuments fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonuments();
  }, [fetchMonuments]);

  const filteredMonuments = useMemo(() => {
    return monuments
      .filter(m => (conditionFilter ? m.currentStatus?.condition === conditionFilter : true))
      .filter(m => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          m.name.toLowerCase().includes(lowerSearch) ||
          (m.location?.text && m.location.text.toLowerCase().includes(lowerSearch))
        );
      });
  }, [monuments, searchTerm, conditionFilter]);

  // Calculate monument statistics
  const monumentStats = useMemo(() => {
    const conditionCount = monuments.reduce((acc, monument) => {
      const condition = monument.currentStatus?.condition || 'unknown';
      acc[condition] = (acc[condition] || 0) + 1;
      return acc;
    }, {});

    return {
      total: monuments.length,
      excellent: conditionCount.excellent || 0,
      good: conditionCount.good || 0,
      fair: conditionCount.fair || 0,
      poor: conditionCount.poor || 0,
    };
  }, [monuments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-700">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Heritage Monuments</h1>
              <p className="text-gray-600 mt-1">Archaeological sites and monuments under departmental management</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export List</span>
              </button>
              <button 
                onClick={fetchMonuments}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              {canAddOrEdit && (
                <Link href="/WMS/monuments/create">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Monument</span>
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Building}
            title="Total Monuments"
            value={monumentStats.total}
            subtitle="Heritage sites"
            color="blue"
          />
          <StatsCard
            icon={TrendingUp}
            title="Excellent Condition"
            value={monumentStats.excellent}
            subtitle="Well preserved sites"
            color="green"
          />
          <StatsCard
            icon={Activity}
            title="Good Condition"
            value={monumentStats.good}
            subtitle="Maintained sites"
            color="yellow"
          />
          <StatsCard
            icon={AlertTriangle}
            title="Need Attention"
            value={monumentStats.fair + monumentStats.poor}
            subtitle="Fair & poor condition"
            color="red"
          />
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Filter & Search</h2>
              <p className="text-sm text-gray-600">Find monuments by name, location, or condition</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or location..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Condition Filter */}
            <div className="relative">
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
              >
                <option value="">All Conditions</option>
                {Object.entries(MONUMENT_CONDITIONS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-center">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setConditionFilter('');
                }}
                className="px-4 py-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
              <div className="ml-4 text-sm text-gray-600">
                Showing {filteredMonuments.length} of {monuments.length} monuments
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-red-800 font-semibold">Error Loading Monuments</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Monuments Grid */}
        {!error && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <SectionHeader 
                icon={Building} 
                title="Monuments Directory" 
                description="Complete catalog of heritage sites and monuments"
              />
            </div>
            
            {filteredMonuments.length > 0 ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMonuments.map(monument => (
                    <MonumentCard key={monument.id} monument={monument} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Monuments Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || conditionFilter 
                    ? "No monuments match your current filters. Try adjusting your search criteria."
                    : "Get started by adding your first monument to the system."
                  }
                </p>
                {!searchTerm && !conditionFilter && canAddOrEdit && (
                  <Link href="/WMS/monuments/create">
                    <button className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto">
                      <PlusCircle className="w-4 h-4" />
                      <span>Add First Monument</span>
                    </button>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}