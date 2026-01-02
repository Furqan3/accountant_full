"use client";

import { useEffect, useState } from "react";
import { X, ZoomIn, ZoomOut, Download, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{ url: string; name: string }>;
  initialIndex: number;
}

export default function ImageLightbox({
  isOpen,
  onClose,
  images,
  initialIndex,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState<"fit" | "fill" | "zoom">("fit");

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, images.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = images[currentIndex].url;
    link.download = images[currentIndex].name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleZoom = () => {
    if (zoomLevel === "fit") setZoomLevel("fill");
    else if (zoomLevel === "fill") setZoomLevel("zoom");
    else setZoomLevel("fit");
  };

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
        aria-label="Close lightbox"
      >
        <X size={32} />
      </button>

      {/* Controls Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/50 px-4 py-2 rounded-lg z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleZoom();
          }}
          className="text-white hover:text-gray-300 transition-colors flex items-center gap-2"
          aria-label="Toggle zoom"
        >
          {zoomLevel === "zoom" ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
          <span className="text-sm capitalize">{zoomLevel}</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          className="text-white hover:text-gray-300 transition-colors"
          aria-label="Download image"
        >
          <Download size={20} />
        </button>
        {images.length > 1 && (
          <span className="text-white text-sm">
            {currentIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={48} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={48} />
          </button>
        </>
      )}

      {/* Image */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
      >
        <img
          src={currentImage.url}
          alt={currentImage.name}
          className={`
            ${zoomLevel === "fit" && "max-w-full max-h-[90vh] object-contain"}
            ${zoomLevel === "fill" && "w-screen h-screen object-cover"}
            ${zoomLevel === "zoom" && "w-auto h-auto max-w-none"}
          `}
        />
      </div>

      {/* Image Name */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-lg">
        <p className="text-white text-sm">{currentImage.name}</p>
      </div>
    </div>
  );
}
