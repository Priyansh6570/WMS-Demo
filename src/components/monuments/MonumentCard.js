import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { MONUMENT_CONDITIONS } from '@/lib/constants';

export default function MonumentCard({ monument }) {
  const conditionInfo = MONUMENT_CONDITIONS[monument.currentStatus?.condition] || { label: 'Unknown', color: 'bg-gray-200 text-gray-800' };
  
  const coverImage = monument.photos?.[0] || '/images/placeholder.png';

  return (
    <Link 
      href={`/WMS/monuments/${monument.id}`} 
      className="block overflow-hidden text-gray-700 transition-all duration-300 group card hover:shadow-xl hover:-translate-y-1"
    >
      <div className="relative">
        <div className="h-40 bg-gray-200">
          <img 
            src={coverImage} 
            alt={`Image of ${monument.name}`} 
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        {/* FIX: Use the Tailwind class directly */}
        <div className={`absolute text-xs top-2 right-2 status-badge ${conditionInfo.color}`}>
          {conditionInfo.label}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-700 truncate">{monument.name}</h3>
        <p className="flex items-center mt-1 text-sm text-gray-700">
          <MapPin className="flex-shrink-0 w-4 h-4 mr-2" />
          <span className="truncate">{monument.location?.text || 'Location not specified'}</span>
        </p>
      </div>
    </Link>
  );
}