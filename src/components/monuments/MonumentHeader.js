import { MapPin, Building2, Calendar, Eye } from 'lucide-react';
import { MONUMENT_CONDITIONS } from '@/lib/constants';

export default function MonumentHeader({ monument }) {
  const conditionInfo = MONUMENT_CONDITIONS[monument.currentStatus.condition];
  
  return (
    <div className="flex items-start space-x-6 text-gray-700">
      {/* Monument Icon with Gradient */}
      <div className="relative">
        <div className="flex items-center justify-center w-20 h-20 shadow-lg rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600">
          <Building2 className="w-10 h-10 text-white" />
        </div>
        {/* Status Indicator */}
        <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
          conditionInfo.condition === 'excellent' ? 'bg-green-500' :
          conditionInfo.condition === 'good' ? 'bg-blue-500' :
          conditionInfo.condition === 'fair' ? 'bg-yellow-500' :
          conditionInfo.condition === 'poor' ? 'bg-orange-500' : 'bg-red-500'
        }`}>
          {conditionInfo.label}
        </div>
      </div>
      
      {/* Monument Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center mb-2 space-x-3">
          <h1 className="text-4xl font-bold leading-tight text-gray-900">
            {monument.name}
          </h1>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Eye className="w-4 h-4" />
            <span>ID: {monument.id}</span>
          </div>
        </div>
        
        <div className="flex items-center mb-4 text-gray-600">
          <MapPin className="w-5 h-5 mr-2 text-gray-400" />
          <span className="text-lg">{monument.location.text}</span>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">
              Geofence: <span className="font-semibold text-gray-800">{monument.geoFenceRadius}m</span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              Added: <span className="font-semibold text-gray-800">
                {monument.createdAt ? new Date(monument.createdAt).toLocaleDateString() : 'Unknown'}
              </span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">
              Photos: <span className="font-semibold text-gray-800">{monument.photos?.length || 0}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}