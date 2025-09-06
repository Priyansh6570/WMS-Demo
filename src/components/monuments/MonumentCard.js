import Link from "next/link";
import { MapPin, Eye, Camera, Calendar, TrendingUp } from "lucide-react";
import { MONUMENT_CONDITIONS } from "@/lib/constants";
import Image from "next/image";

export default function MonumentCard({ monument }) {
  const conditionInfo = MONUMENT_CONDITIONS[monument.currentStatus?.condition] || { 
    label: "Unknown", 
    color: "bg-gray-100 text-gray-600" 
  };
  
  const coverImage = monument.photos?.[0] || "/images/placeholder.png";
  
  // Enhanced condition color mapping
  const enhancedConditionColors = {
    excellent: "bg-green-100 text-green-800 border-green-200",
    good: "bg-blue-100 text-blue-800 border-blue-200", 
    fair: "bg-yellow-100 text-yellow-800 border-yellow-200",
    poor: "bg-red-100 text-red-800 border-red-200",
    unknown: "bg-gray-100 text-gray-600 border-gray-200"
  };

  const conditionClass = enhancedConditionColors[monument.currentStatus?.condition] || enhancedConditionColors.unknown;

  // Format date if available
  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Date not available";
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <Link href={`/WMS/monuments/${monument.id}`} className="block">
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          <Image 
            src={coverImage} 
            alt={`Heritage site: ${monument.name}`} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Condition Badge */}
          <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold border ${conditionClass} backdrop-blur-sm`}>
            {conditionInfo.label}
          </div>

          {/* Photo Count Badge */}
          {monument.photos && monument.photos.length > 0 && (
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1 text-xs font-medium text-gray-700">
              <Camera className="w-3 h-3" />
              <span>{monument.photos.length}</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Title */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {monument.name}
            </h3>
            
            {/* Location */}
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span className="text-sm truncate">
                {monument.location?.text || "Location not specified"}
              </span>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-2 mb-4">
            {/* Last Updated */}
            {monument.updatedAt && (
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1.5" />
                <span>Updated {formatDate(monument.updatedAt)}</span>
              </div>
            )}

            {/* Projects Count */}
            {monument.projectsCount !== undefined && (
              <div className="flex items-center text-xs text-gray-500">
                <TrendingUp className="w-3 h-3 mr-1.5" />
                <span>{monument.projectsCount} active projects</span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="text-xs text-blue-600 group-hover:text-blue-800 font-medium flex items-center">
              <Eye className="w-3 h-3 mr-1" />
              View Details
            </div>
            
            {/* Status Indicator */}
            <div className={`w-2 h-2 rounded-full ${
              monument.currentStatus?.condition === 'excellent' ? 'bg-green-500' :
              monument.currentStatus?.condition === 'good' ? 'bg-blue-500' :
              monument.currentStatus?.condition === 'fair' ? 'bg-yellow-500' :
              monument.currentStatus?.condition === 'poor' ? 'bg-red-500' :
              'bg-gray-400'
            }`} />
          </div>
        </div>
      </Link>
    </div>
  );
}