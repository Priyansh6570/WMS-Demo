'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Camera, FileText, PlusCircle, Maximize, X, Lock, ChevronLeft, ChevronRight, Download, File, MapPin } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

// Mock map component that generates a visual map with markers
const MapVisualization = ({ markers, showGeofence = true, width = 300, height = 200, className = "" }) => {
    // Generate SVG map with markers
    const generateMapSVG = () => {
        const geofenceRadius = 80;
        const centerX = width / 2;
        const centerY = height / 2;
        
        return (
            <svg width={width} height={height} className={`border rounded-lg ${className}`}>
                {/* Map background with grid pattern */}
                <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="#f9fafb"/>
                <rect width="100%" height="100%" fill="url(#grid)"/>
                
                {/* Roads/paths */}
                <path d="M0,60 Q150,40 300,80" stroke="#d1d5db" strokeWidth="8" fill="none"/>
                <path d="M50,0 Q100,100 150,200" stroke="#d1d5db" strokeWidth="6" fill="none"/>
                
                {/* Geofence area */}
                {showGeofence && (
                    <>
                        <circle 
                            cx={centerX} 
                            cy={centerY} 
                            r={geofenceRadius} 
                            fill="rgba(59, 130, 246, 0.1)" 
                            stroke="#3b82f6" 
                            strokeWidth="2" 
                            strokeDasharray="5,5"
                        />
                        <text x={centerX - 30} y={centerY - geofenceRadius - 10} fill="#3b82f6" fontSize="12" fontWeight="500">
                            Work Zone
                        </text>
                    </>
                )}
                
                {/* Markers */}
                {markers.map((marker, index) => (
                    <g key={index}>
                        <circle 
                            cx={marker.x} 
                            cy={marker.y} 
                            r="8" 
                            fill={marker.color}
                            stroke="white" 
                            strokeWidth="2"
                        />
                        <circle 
                            cx={marker.x} 
                            cy={marker.y} 
                            r="4" 
                            fill="white"
                        />
                    </g>
                ))}
            </svg>
        );
    };
    
    return generateMapSVG();
};

const ImageModal = ({ images, currentIndex, onClose, onPrevious, onNext }) => {
    const currentImage = images[currentIndex];
    
    // Mock marker data for the current image
    const getCurrentImageMarker = () => {
        const colors = {
            before: '#ef4444', // red
            during: '#f59e0b', // amber  
            after: '#22c55e'   // green
        };
        
        // Determine image type based on index or image data
        let type = 'during';
        if (currentImage.about?.toLowerCase().includes('before')) type = 'before';
        if (currentImage.about?.toLowerCase().includes('after')) type = 'after';
        
        return [{
            x: 150 + (Math.random() - 0.5) * 60,
            y: 100 + (Math.random() - 0.5) * 40,
            color: colors[type]
        }];
    };
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00000050]" onClick={onClose}>
            <div className="relative max-w-6xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
                <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden">
                    {/* Image and Map Row */}
                    <div className="flex">
                        {/* Image */}
                        <div className="relative flex-1 h-[70vh] bg-gray-100 flex items-center justify-center">
                            <img 
                                src={currentImage.path} 
                                alt={currentImage.about} 
                                className="max-w-full max-h-full object-contain"
                            />
                            
                            {/* Navigation arrows */}
                            {images.length > 1 && (
                                <>
                                    <button 
                                        onClick={onPrevious}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-lg transition-all"
                                    >
                                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                                    </button>
                                    <button 
                                        onClick={onNext}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-lg transition-all"
                                    >
                                        <ChevronRight className="w-6 h-6 text-gray-700" />
                                    </button>
                                </>
                            )}
                        </div>
                        
                        {/* Map */}
                        <div className="w-80 bg-gray-50 border-l flex flex-col">
                            <div className="p-4 border-b bg-white">
                                <h4 className="font-medium text-gray-900 flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                    Photo Location
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">Captured within work zone</p>
                            </div>
                            <div className="flex-1 p-4 flex items-center justify-center">
                                <MapVisualization 
                                    markers={getCurrentImageMarker()}
                                    width={300}
                                    height={240}
                                    showGeofence={true}
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Image info */}
                    <div className="p-4 bg-white border-t">
                        <p className="text-gray-800 font-medium">{currentImage.about}</p>
                        {images.length > 1 && (
                            <p className="text-sm text-gray-500 mt-1">
                                {currentIndex + 1} of {images.length}
                            </p>
                        )}
                    </div>
                </div>
                
                {/* Close button */}
                <button 
                    onClick={onClose} 
                    className="absolute -top-4 -right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-700" />
                </button>
            </div>
        </div>
    );
};

const PhotoSlider = ({ title, photos, onImageClick, allImages, startIndex, stageType }) => {
    // Generate mock markers for the overview map
    const generateMarkers = (count, type) => {
        const colors = {
            before: '#ef4444', // red
            during: '#f59e0b', // amber
            after: '#22c55e'   // green
        };
        
        return Array.from({ length: count }, (_, i) => ({
            x: 150 + (Math.random() - 0.5) * 120,
            y: 100 + (Math.random() - 0.5) * 80,
            color: colors[type]
        }));
    };

    const stageMarkers = generateMarkers(photos.length, stageType);
    
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                    {title}
                    <span className="ml-2 text-sm text-gray-500 font-normal">({photos.length} photos)</span>
                </h3>
            </div>
            
            <div className="flex gap-6">
                {/* Photos Grid */}
                <div className="flex-1">
                    {photos.length === 0 ? (
                        <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <Camera className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">No photos uploaded for this stage yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {photos.map((photo, index) => (
                                <div 
                                    key={photo.id} 
                                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                                    onClick={() => onImageClick(allImages, startIndex + index)}
                                >
                                    <img 
                                        src={photo.path} 
                                        alt={photo.about} 
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute bottom-2 left-2 right-2">
                                            <p className="text-white text-xs font-medium line-clamp-2">{photo.about}</p>
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <div className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                                                <Maximize className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Stage Map */}
                {photos.length > 0 && (
                    <div className="w-80 flex-shrink-0">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center mb-3">
                                <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                                <h4 className="font-medium text-gray-900">{title} Locations</h4>
                            </div>
                            <MapVisualization 
                                markers={stageMarkers}
                                width={272}
                                height={180}
                                showGeofence={true}
                            />
                            <div className="mt-3 flex items-center justify-center">
                                <div className="flex items-center text-sm text-gray-600">
                                    <div 
                                        className="w-3 h-3 rounded-full mr-2" 
                                        style={{ backgroundColor: stageMarkers[0]?.color }}
                                    ></div>
                                    {photos.length} photo{photos.length !== 1 ? 's' : ''} in this stage
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const DocumentCard = ({ doc }) => {
    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['pdf'].includes(ext)) return '📄';
        if (['doc', 'docx'].includes(ext)) return '📝';
        if (['xls', 'xlsx'].includes(ext)) return '📊';
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
        return '📁';
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                            {getFileIcon(doc.name)}
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-sm text-gray-500">Document</p>
                    </div>
                </div>
                <a 
                    href={doc.path} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                    <Download className="w-5 h-5" />
                </a>
            </div>
        </div>
    );
};

export default function ProofOfWorkTab({ milestone, projectId }) {
    const { user } = useAuth();
    const [selectedImages, setSelectedImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    const proof = milestone.proofOfWork;
    const canAddProof = user?.role === 'worker' || user?.role === 'contractor';

    // Combine all images for modal navigation
    const allImages = [
        ...(proof?.photos?.before || []),
        ...(proof?.photos?.during || []),
        ...(proof?.photos?.after || [])
    ];

    const handleImageClick = (images, index) => {
        setSelectedImages(images);
        setCurrentImageIndex(index);
    };

    const handlePrevious = () => {
        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : selectedImages.length - 1));
    };

    const handleNext = () => {
        setCurrentImageIndex((prev) => (prev < selectedImages.length - 1 ? prev + 1 : 0));
    };

    const closeModal = () => {
        setSelectedImages([]);
        setCurrentImageIndex(0);
    };

    // Generate overview map with all markers
    const generateOverviewMarkers = () => {
        const allMarkers = [];
        const colors = {
            before: '#ef4444',
            during: '#f59e0b', 
            after: '#22c55e'
        };
        
        ['before', 'during', 'after'].forEach(stage => {
            const photos = proof?.photos?.[stage] || [];
            photos.forEach((photo, index) => {
                allMarkers.push({
                    x: 150 + (Math.random() - 0.5) * 120,
                    y: 100 + (Math.random() - 0.5) * 80,
                    color: colors[stage]
                });
            });
        });
        
        return allMarkers;
    };

    if (milestone.status === 'pending') {
        return (
            <div className="py-16 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border">
                <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <Lock className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Milestone Not Started</h3>
                    <p className="text-gray-600">
                        The contractor must start this milestone before proofs of work can be added or viewed.
                    </p>
                </div>
            </div>
        );
    }

    const overviewMarkers = generateOverviewMarkers();

    return (
        <div className="space-y-8">
            {/* Header with Add Proof button */}
            {canAddProof && (
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Proof of Work</h1>
                        <p className="text-gray-600">Documentation and evidence of completed work</p>
                    </div>
                    <Link href={`/WMS/projects/${projectId}/milestones/${milestone.id}/add-proof`} passHref>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <PlusCircle className="w-4 h-4 mr-2" /> 
                            Add Proof
                        </Button>
                    </Link>
                </div>
            )}

            {/* Overview Map */}
            {allImages.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <MapPin className="w-6 h-6 text-purple-600"/>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Work Site Overview</h2>
                            <p className="text-gray-500">All photo locations across project timeline</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-6">
                        <div className="flex-1">
                            <MapVisualization 
                                markers={overviewMarkers}
                                width={600}
                                height={300}
                                showGeofence={true}
                                className="w-full"
                            />
                        </div>
                        <div className="w-48 space-y-3">
                            <h4 className="font-medium text-gray-900 mb-3">Legend</h4>
                            <div className="flex items-center text-sm text-gray-600">
                                <div className="w-3 h-3 rounded-full mr-3 bg-red-500"></div>
                                Before Work ({(proof?.photos?.before || []).length})
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <div className="w-3 h-3 rounded-full mr-3 bg-amber-500"></div>
                                During Work ({(proof?.photos?.during || []).length})
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <div className="w-3 h-3 rounded-full mr-3 bg-green-500"></div>
                                After Work ({(proof?.photos?.after || []).length})
                            </div>
                            <div className="pt-3 border-t border-gray-200">
                                <div className="text-sm text-gray-500">
                                    Total: {allImages.length} photos
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Photos Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Camera className="w-6 h-6 text-blue-600"/>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Photos</h2>
                        <p className="text-gray-500">Visual documentation of work progress</p>
                    </div>
                </div>
                
                <PhotoSlider 
                    title="Before Work" 
                    photos={proof?.photos?.before || []} 
                    onImageClick={handleImageClick}
                    allImages={allImages}
                    startIndex={0}
                    stageType="before"
                />
                
                <PhotoSlider 
                    title="During Work" 
                    photos={proof?.photos?.during || []} 
                    onImageClick={handleImageClick}
                    allImages={allImages}
                    startIndex={(proof?.photos?.before || []).length}
                    stageType="during"
                />
                
                <PhotoSlider 
                    title="After Work" 
                    photos={proof?.photos?.after || []} 
                    onImageClick={handleImageClick}
                    allImages={allImages}
                    startIndex={(proof?.photos?.before || []).length + (proof?.photos?.during || []).length}
                    stageType="after"
                />
            </div>

            {/* Documents Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <FileText className="w-6 h-6 text-green-600"/>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Documents</h2>
                        <p className="text-gray-500">Supporting files and documentation</p>
                    </div>
                </div>
                
                {proof?.documents?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {proof.documents.map(doc => (
                            <DocumentCard key={doc.id} doc={doc} />
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No documents submitted as proof yet.</p>
                    </div>
                )}
            </div>

            {/* Image Modal */}
            {selectedImages.length > 0 && (
                <ImageModal 
                    images={selectedImages}
                    currentIndex={currentImageIndex}
                    onClose={closeModal}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                />
            )}
        </div>
    );
}