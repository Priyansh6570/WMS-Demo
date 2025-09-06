import { MapPin, ShieldCheck, Milestone, Info, Map, Camera } from 'lucide-react';
import { MONUMENT_CONDITIONS } from '@/lib/constants';
import ImageCarousel from './ImageCarousel';

export default function MonumentDetailView({ monument }) {
  const conditionInfo = MONUMENT_CONDITIONS[monument.currentStatus.condition];
  
  const DetailCard = ({ icon: Icon, title, value, description }) => (
    <div className="p-6 text-gray-700 transition-shadow border border-gray-100 shadow-sm bg-gradient-to-br from-white to-gray-50 rounded-xl hover:shadow-md">
      <div className="flex items-start space-x-4">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="mb-1 text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mb-2 leading-relaxed text-gray-700">{value}</p>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-8 text-gray-700 xl:grid-cols-3">
      {/* Image Carousel - Takes up 2/3 on large screens */}
      <div className="xl:col-span-2">
        <div className="p-6 shadow-lg bg-gradient-to-br  rounded-2xl">
          <div className="flex items-center mb-4 space-x-3">
            <Camera className="w-5 h-5 " />
            <h2 className="text-xl font-semibold text-white">Monument Gallery</h2>
            <span className="px-3 py-1 text-sm  rounded-full bg-gray-100 text-gray-800">
              {monument.photos?.length || 0} photos
            </span>
          </div>
          <ImageCarousel images={monument.photos} />
        </div>
      </div>
      
      {/* Details Panel - Takes up 1/3 on large screens */}
      <div className="space-y-6">
        <DetailCard
          icon={Info}
          title="Description"
          value={monument.description || 'No description provided.'}
          description="Historical and architectural details about this monument"
        />
        
        <DetailCard
          icon={MapPin}
          title="Location"
          value={monument.location.text}
          description="Physical address and coordinates"
        />
        
        <DetailCard
          icon={ShieldCheck}
          title="Current Condition"
          value={conditionInfo.label}
          description="Assessment based on latest inspection"
        />
        
        {/* Geofencing Card with Visual */}
        <div className="p-6 border border-blue-200 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
          <div className="flex items-start space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-200 rounded-xl">
              <Milestone className="w-6 h-6 text-blue-700" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="mb-1 text-lg font-semibold text-gray-900">Geofencing</h3>
              <p className="mb-4 text-gray-700">
                {monument.geoFenceRadius} meters monitoring radius
              </p>
              
              {/* Mini Geofence Visualization */}
              <div className="relative h-32 p-4 overflow-hidden rounded-lg bg-gradient-to-br from-green-100 to-blue-100">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-20">
                  <div className="grid w-full h-full grid-cols-6 grid-rows-4">
                    {[...Array(24)].map((_, i) => (
                      <div key={i} className="border border-gray-400"></div>
                    ))}
                  </div>
                </div>
                
                {/* Roads */}
                <div className="absolute left-0 right-0 h-1 transform -translate-y-1/2 bg-gray-400 top-1/2"></div>
                <div className="absolute top-0 bottom-0 w-1 transform -translate-x-1/2 bg-gray-400 left-1/2"></div>
                
                {/* Geofence Circle */}
                <div className="absolute w-20 h-20 transform -translate-x-1/2 -translate-y-1/2 bg-blue-200 border-2 border-blue-500 border-dashed rounded-full bg-opacity-30 top-1/2 left-1/2">
                  <div className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                    <div className="p-1 bg-red-500 rounded-full shadow-sm">
                      <MapPin className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-1 left-1 bg-white bg-opacity-90 rounded px-2 py-0.5 text-xs">
                  {monument.geoFenceRadius}m
                </div>
              </div>
              
              <p className="flex items-center mt-2 text-sm text-blue-700">
                <Map className="w-4 h-4 mr-1" />
                Photos must be taken within this boundary
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}