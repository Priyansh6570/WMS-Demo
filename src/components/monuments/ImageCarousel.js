"use client";
import { useState, useEffect, useCallback } from "react";
import { ChevronRight, Play, Pause, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function ImageCarousel({ images = [], autoSlideInterval = 4000 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Always move forward - when reaching the end, jump to beginning
  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  // Auto-slide functionality
  useEffect(() => {
    if (autoSlideInterval && images.length > 1 && isPlaying) {
      const slideInterval = setInterval(goToNext, autoSlideInterval);
      return () => clearInterval(slideInterval);
    }
  }, [goToNext, autoSlideInterval, images.length, isPlaying]);

  // Handle image loading
  useEffect(() => {
    if (images.length > 0) {
      const img = new window.Image();
      img.onload = () => setIsLoading(false);
      img.src = images[0];
    }
  }, [images]);

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full text-gray-400 border-2 border-gray-300 border-dashed h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl">
        <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No images available</p>
        <p className="text-sm">Upload photos to see them here</p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden bg-black shadow-2xl rounded-xl group">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900">
          <div className="w-12 h-12 border-b-2 border-white rounded-full animate-spin"></div>
        </div>
      )}

      {/* Main Image Container */}
      <div className="relative overflow-hidden h-96">
        <div className="flex h-full transition-transform duration-700 ease-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {images.map((url, index) => (
            <div key={`${url}-${index}`} className="relative flex-shrink-0 w-full h-full">
              <div className="relative w-full h-full">
                <Image src={url} alt={`Monument Image ${index + 1}`} loading={index === 0 ? "eager" : "lazy"} fill className="object-cover" />
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls Overlay */}
      <div className="absolute inset-0 flex items-center justify-between p-4 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
        {/* Next Button (Only Forward) */}
        <div className="flex justify-end flex-1">
          <button onClick={goToNext} className="p-3 text-white transition-all duration-200 rounded-full shadow-lg bg-white/20 backdrop-blur-sm hover:bg-white/30 hover:scale-110" aria-label="Next image">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          {/* Image Counter & Info */}
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 text-sm font-medium text-white rounded-full bg-black/30 backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </span>

            {/* Play/Pause Button */}
            {images.length > 1 && (
              <button onClick={togglePlayPause} className="flex items-center px-3 py-1 space-x-2 text-sm text-white transition-colors rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/40">
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Play</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Dot Indicators */}
          <div className="flex space-x-2">
            {images.map((_, index) => (
              <button key={index} onClick={() => goToSlide(index)} className={cn("w-3 h-3 rounded-full transition-all duration-300 hover:scale-125", currentIndex === index ? "bg-white shadow-lg" : "bg-white/40 hover:bg-white/60")} aria-label={`Go to image ${index + 1}`} />
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {/* {images.length > 1 && isPlaying && (
          <div className="w-full h-1 mt-3 overflow-hidden rounded-full bg-white/20">
            <div 
              className="h-full transition-all duration-100 ease-out bg-white rounded-full"
              style={{
                animation: `progress ${autoSlideInterval}ms linear infinite`
              }}
            />
          </div>
        )} */}
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
