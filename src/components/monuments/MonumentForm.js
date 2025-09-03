'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { dataManager } from '@/lib/data-manager';
import { useAuth } from '@/context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Form/Input';
import ImageUpload from '../ui/Form/ImageUpload';
import { MONUMENT_CONDITIONS } from '@/lib/constants';
import { MapPin, CircleDotDashed, Info, Camera, Map, Settings } from 'lucide-react';

// Helper function to deep compare objects and track changes
const trackChanges = (oldData, newData, excludeFields = ['id', 'createdAt', 'updatedAt']) => {
  const changes = [];
  
  const compareValues = (key, oldVal, newVal, path = key) => {
    // Skip excluded fields
    if (excludeFields.includes(key)) return;
    
    // Handle arrays (like photos)
    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: path,
          oldValue: oldVal,
          newValue: newVal
        });
      }
      return;
    }
    
    // Handle objects (like location, currentStatus)
    if (typeof oldVal === 'object' && typeof newVal === 'object' && oldVal !== null && newVal !== null) {
      Object.keys({...oldVal, ...newVal}).forEach(subKey => {
        compareValues(subKey, oldVal[subKey], newVal[subKey], `${path}.${subKey}`);
      });
      return;
    }
    
    // Handle primitive values
    if (oldVal !== newVal) {
      changes.push({
        field: path,
        oldValue: oldVal,
        newValue: newVal
      });
    }
  };
  
  // Compare all fields
  Object.keys({...oldData, ...newData}).forEach(key => {
    compareValues(key, oldData[key], newData[key]);
  });
  
  return changes;
};

// This is now a shared component for creating and editing
export default function MonumentForm({ monument }) {
  const router = useRouter();
  const { user } = useAuth();
  const isEditing = !!monument;

  const [formData, setFormData] = useState({
    name: monument?.name || '',
    description: monument?.description || '',
    location: monument?.location?.text || '',
    condition: monument?.currentStatus?.condition || 'good',
    geoFenceRadius: monument?.geoFenceRadius || 500,
    photos: monument?.photos || [],
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (paths) => {
    setFormData(prev => ({ ...prev, photos: paths }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
        const payload = {
            name: formData.name,
            description: formData.description,
            location: { text: formData.location },
            currentStatus: { condition: formData.condition },
            geoFenceRadius: Number(formData.geoFenceRadius),
            photos: formData.photos,
        };

      if (isEditing) {
        // Track changes for edit history
        const changes = trackChanges(monument, payload);
        
        if (changes.length > 0) {
          // Add edit history entry
          const editHistoryEntry = {
            id: `edit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            editedAt: new Date().toISOString(),
            editedBy: user?.name || user?.email || 'Unknown User',
            userId: user?.id,
            changes: changes
          };

          // Include edit history in the payload
          const existingHistory = monument.editHistory || [];
          payload.editHistory = [editHistoryEntry, ...existingHistory];
        }
        
        const updatedMonument = await dataManager.updateMonument(monument.id, payload);
        router.push(`/WMS/monuments/${updatedMonument.id}`);
      } else {
        // For new monuments, initialize empty edit history
        payload.editHistory = [];
        const newMonument = await dataManager.addMonument(payload);
        router.push(`/WMS/monuments/${newMonument.id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err.message || 'An error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl p-6 mx-auto text-gray-700 bg-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          {isEditing ? 'Edit Monument' : 'Create New Monument'}
        </h1>
        <p className="text-gray-600">
          {isEditing ? 'Update monument information and settings' : 'Add a new monument to the monitoring system'}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Form - Left Side */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="p-6 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Input 
                    label="Monument Name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    placeholder="Enter monument name"
                    className="text-base"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    className="w-full h-32 px-4 py-3 text-base border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="Describe the monument, its historical significance, architectural features..."
                  />
                </div>
              </div>
            </div>

            {/* Location & Status Section */}
            <div className="p-6 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Location & Status</h2>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Input 
                    label="Location" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleChange} 
                    required 
                    placeholder="Enter address or coordinates"
                    className="text-base"
                  />
                  <p className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                    <Info className="w-4 h-4" />
                    In production, this will use Google Places API for accuracy
                  </p>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Current Condition
                  </label>
                  <select 
                    name="condition" 
                    value={formData.condition} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 text-base bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(MONUMENT_CONDITIONS).map(([key, {label}]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Photos Section */}
            <div className="p-6 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Monument Photos</h2>
              </div>
              <ImageUpload onUploadComplete={handlePhotoUpload} initialFiles={formData.photos} />
            </div>

            {/* Geofencing Section */}
            <div className="p-6 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <CircleDotDashed className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Geofencing Settings</h2>
              </div>
              
              <div className="max-w-md">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Geofence Radius (meters)
                </label>
                <Input 
                  type="number" 
                  name="geoFenceRadius" 
                  value={formData.geoFenceRadius} 
                  onChange={handleChange} 
                  required 
                  min="50"
                  max="2000"
                  step="10"
                  className="text-base"
                />
                <p className="mt-2 text-sm text-gray-600">
                  Photo uploads will be validated within this radius from the monument location.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <p className="font-medium text-red-700">{error}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => router.back()}
                className="px-6 py-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={isSubmitting} 
                disabled={isSubmitting}
                className="px-8 py-2"
              >
                {isEditing ? 'Save Changes' : 'Create Monument'}
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar - Right Side */}
        <div className="lg:col-span-1">
          {/* Geofencing Demo */}
          <div className="sticky p-6 bg-white border rounded-lg top-6">
            <div className="flex items-center gap-2 mb-4">
              <Map className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Geofencing Preview</h3>
            </div>
            
            {/* Demo Map */}
            <div className="relative h-64 p-6 overflow-hidden rounded-lg bg-gradient-to-br from-green-100 to-blue-100">
              {/* Map Grid Background */}
              <div className="absolute inset-0 opacity-20">
                <div className="grid w-full h-full grid-cols-8 grid-rows-8">
                  {[...Array(64)].map((_, i) => (
                    <div key={i} className="border border-gray-400"></div>
                  ))}
                </div>
              </div>
              
              {/* Roads */}
              <div className="absolute left-0 right-0 h-2 transform -translate-y-1/2 bg-gray-400 top-1/2"></div>
              <div className="absolute top-0 bottom-0 w-2 transform -translate-x-1/2 bg-gray-400 left-1/2"></div>
              
              {/* Geofence Circle */}
              <div 
                className="absolute bg-blue-100 border-4 border-blue-500 border-dashed rounded-full bg-opacity-30"
                style={{
                  width: `${Math.min(formData.geoFenceRadius / 10, 200)}px`,
                  height: `${Math.min(formData.geoFenceRadius / 10, 200)}px`,
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {/* Monument Marker */}
                <div className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                  <div className="p-2 bg-red-500 rounded-full shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Scale indicators */}
              <div className="absolute px-2 py-1 text-xs font-medium bg-white rounded bottom-2 left-2 bg-opacity-90">
                {formData.geoFenceRadius}m radius
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-4 h-4 bg-red-500 rounded-full">
                  <MapPin className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700">Monument Location</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 border-2 border-blue-500 border-dashed"></div>
                <span className="text-gray-700">Geofence Boundary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border-2 border-blue-200 rounded"></div>
                <span className="text-gray-700">Valid Upload Zone</span>
              </div>
            </div>
            
            {/* Info Box */}
            <div className="p-3 mt-4 rounded-lg bg-blue-50">
              <div className="flex gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="mb-1 font-medium">How Geofencing Works:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Photos must be taken within the boundary</li>
                    <li>• GPS coordinates are verified automatically</li>
                    <li>• Helps ensure authentic monitoring data</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}