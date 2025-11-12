import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download, Share2 } from "lucide-react";
import { MediaWithCaption } from "shared/schema";

interface ImageLightboxProps {
  images: MediaWithCaption[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export function ImageLightbox({ images, isOpen, onClose, initialIndex = 0 }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchDistance, setTouchDistance] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter only images for lightbox
  const imageSlides = images.filter(media => media.type === 'image');

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, currentIndex]);

  useEffect(() => {
    // Reset transform when image changes with smooth animation
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setIsLoading(true);
    
    // Add slight delay for smooth transition between images
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentIndex]);

  if (!isOpen || imageSlides.length === 0) {
    return null;
  }

  const currentImage = imageSlides[currentIndex];
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        handleClose();
        break;
      case 'ArrowLeft':
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
        else if (imageSlides.length > 1) setCurrentIndex(imageSlides.length - 1);
        break;
      case 'ArrowRight':
        if (currentIndex < imageSlides.length - 1) setCurrentIndex(currentIndex + 1);
        else if (imageSlides.length > 1) setCurrentIndex(0);
        break;
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (imageSlides.length > 1) {
      setCurrentIndex(imageSlides.length - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < imageSlides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (imageSlides.length > 1) {
      setCurrentIndex(0);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (e.touches.length === 1) {
      setTouchStart({ x: touch.clientX, y: touch.clientY });
      if (scale > 1) {
        setIsDragging(true);
        setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
      }
    } else if (e.touches.length === 2) {
      // Pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch1.clientX - touch2.clientX, 2) +
        Math.pow(touch1.clientY - touch2.clientY, 2)
      );
      setTouchDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && isDragging && scale > 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    } else if (e.touches.length === 2 && touchDistance > 0) {
      // Pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch1.clientX - touch2.clientX, 2) +
        Math.pow(touch1.clientY - touch2.clientY, 2)
      );
      
      const scaleChange = distance / touchDistance;
      const newScale = Math.min(Math.max(scale * scaleChange, 0.25), 3);
      setScale(newScale);
      setTouchDistance(distance);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      setTouchDistance(0);
      
      // Handle swipe navigation
      if (!isDragging && scale === 1) {
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStart.x;
        const deltaY = Math.abs(touch.clientY - touchStart.y);
        
        // Only trigger swipe if horizontal movement is greater than vertical
        if (Math.abs(deltaX) > 50 && deltaY < 100) {
          if (deltaX > 0) {
            handlePrev();
          } else {
            handleNext();
          }
        }
      }
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleDownload = async () => {
    try {
      // Use ImgBB URL for download if available (better quality, permanent link)
      const downloadUrl = currentImage.imgbbUrl || currentImage.url;
      
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = currentImage.caption || `image-${currentIndex + 1}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: try to open in new tab
      window.open(currentImage.imgbbUrl || currentImage.url, '_blank');
    }
  };

  const handleShare = async () => {
    // Use ImgBB URL for sharing if available (permanent, shareable link)
    const shareUrl = currentImage.imgbbUrl || currentImage.url;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentImage.caption || 'Shared Image',
          url: shareUrl
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        // Show toast notification
        alert('Link copied to clipboard!');
      } catch (error) {
        console.error('Copy failed:', error);
      }
    }
  };

  const lightboxContent = (
    <div 
      className={`lightbox-overlay fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md transition-all duration-500 ease-out ${
        isClosing ? 'animate-out fade-out zoom-out-95 duration-300' : 'animate-in fade-in zoom-in-95 duration-500'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {/* Top toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3 text-white">
            <span className="text-sm font-medium">
              {currentIndex + 1} / {imageSlides.length}
            </span>
            {currentImage.caption && (
              <span className="text-sm text-white/80 max-w-md truncate">
                {currentImage.caption}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={scale <= 0.25}
              className="text-white hover:bg-white/20"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={scale >= 3}
              className="text-white hover:bg-white/20"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRotate}
              className="text-white hover:bg-white/20"
            >
              <RotateCw className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-white hover:bg-white/20 text-xs"
            >
              Reset
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-white hover:bg-white/20"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-white/20 transition-all duration-200 hover:scale-110 active:scale-95"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Image container */}
      <div 
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center p-16 pt-20 pb-16"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imageRef}
          src={currentImage.url}
          alt={currentImage.caption || `Image ${currentIndex + 1}`}
          onLoad={handleImageLoad}
          className={`max-w-full max-h-full object-contain transition-all duration-700 ease-out select-none ${
            isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-default'
          } ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500'}`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          draggable={false}
        />
      </div>

      {/* Navigation arrows */}
      {imageSlides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="lg"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/30 active:bg-white/40 w-14 h-14 rounded-full bg-black/30 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 border border-white/10 shadow-lg hover:shadow-white/20"
          >
            <ChevronLeft className="w-7 h-7" />
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/30 active:bg-white/40 w-14 h-14 rounded-full bg-black/30 backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 border border-white/10 shadow-lg hover:shadow-white/20"
          >
            <ChevronRight className="w-7 h-7" />
          </Button>
        </>
      )}

      {/* Bottom caption */}
      {currentImage.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent">
          <div className="p-6 text-center">
            <p className="text-white text-sm leading-relaxed max-w-2xl mx-auto">
              {currentImage.caption}
            </p>
          </div>
        </div>
      )}

      {/* Thumbnail strip */}
      {imageSlides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 max-w-md overflow-x-auto lightbox-thumbnails">
          {imageSlides.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-110 flex-shrink-0 ${
                index === currentIndex 
                  ? 'border-white shadow-lg' 
                  : 'border-white/30 opacity-60 hover:opacity-80'
              }`}
            >
              <img
                src={image.url}
                alt={image.caption || `Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Mobile zoom indicator */}
      {scale !== 1 && (
        <div className="absolute top-20 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white text-sm">{Math.round(scale * 100)}%</span>
        </div>
      )}
    </div>
  );

  // Render in portal to ensure it appears on top of everything
  return createPortal(lightboxContent, document.body);
}

// Preview component untuk menampilkan thumbnail gambar kecil
interface ImagePreviewProps {
  images: MediaWithCaption[];
  maxVisible?: number;
  onImageClick?: (index: number) => void;
}

export function ImagePreview({ images, maxVisible = 2, onImageClick }: ImagePreviewProps) {
  const imageMedia = images.filter(media => media.type === 'image');
  
  if (imageMedia.length === 0) {
    return null;
  }

  const visibleImages = imageMedia.slice(0, maxVisible);
  const remainingCount = imageMedia.length - maxVisible;

  return (
    <div className="flex items-center gap-3 mt-4">
      <div className="flex items-center gap-2">
        {visibleImages.map((image, index) => (
          <div
            key={index}
            className="relative cursor-pointer group overflow-hidden rounded border border-border/30 hover:border-border/60 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            onClick={() => onImageClick?.(index)}
          >
            <div className="w-16 h-16 relative overflow-hidden bg-muted/20">
              <img
                src={image.url}
                alt={image.caption || `Image ${index + 1}`}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                loading="lazy"
              />
              
              {/* Overlay dengan icon zoom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <div className="bg-white/90 dark:bg-black/90 rounded-full p-1.5 transform scale-75 group-hover:scale-100 transition-transform duration-200">
                  <ZoomIn className="h-3 w-3 text-gray-700 dark:text-gray-300" />
                </div>
              </div>
              
              {/* Caption preview */}
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-xs truncate">{image.caption}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {remainingCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onImageClick?.(maxVisible)}
          className="h-16 px-4 rounded flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 border-dashed border-border/50 hover:border-border/80 transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center gap-1 text-muted-foreground">
            <span className="text-sm font-semibold">+{remainingCount}</span>
          </div>
          <span className="text-xs text-muted-foreground/80">more</span>
        </Button>
      )}
      
      {/* Quick stats */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>{imageMedia.length} image{imageMedia.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
