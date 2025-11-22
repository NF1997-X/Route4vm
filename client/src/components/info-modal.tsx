import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, ListChecks, QrCode, ExternalLink, CheckCircle, Save, X, FileText, Loader2, Upload, FolderOpen } from "lucide-react";
import { SiGooglemaps, SiWaze } from "react-icons/si";
import { MiniMap } from "@/components/mini-map";
import { SlidingDescription } from "@/components/sliding-description";
import { EditableDescriptionList } from "@/components/editable-description-list";
import { ImagePreview, ImageLightbox } from "@/components/image-lightbox";
import QrScanner from "qr-scanner";
import { MediaWithCaption } from "shared/schema";

interface InfoModalProps {
  info: string;
  rowId: string;
  code?: string;
  route?: string;
  location?: string;
  latitude?: string;
  longitude?: string;
  qrCode?: string;
  images?: MediaWithCaption[];
  no?: number;
  markerColor?: string;
  onUpdateRow?: (updates: any) => void;
  editMode?: boolean;
  allRows?: any[];
  iconType?: 'info' | 'filetext';
}

export function InfoModal({ info, rowId, code, route, location, latitude, longitude, qrCode, images = [], no, markerColor, onUpdateRow, editMode = false, allRows = [], iconType = 'info' }: InfoModalProps) {
  const [open, setOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [scannedResult, setScannedResult] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [showChecklistConfirm, setShowChecklistConfirm] = useState(false);
  const [showNavigationConfirm, setShowNavigationConfirm] = useState(false);
  const [navigationType, setNavigationType] = useState<'google' | 'waze'>('google');
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showUrlConfirm, setShowUrlConfirm] = useState(false);
  const [urlToOpen, setUrlToOpen] = useState<string>("");
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // State for tracking edits
  const [originalData, setOriginalData] = useState({ info: "", qrCode: "", latitude: "", longitude: "", markerColor: "" });
  const [currentData, setCurrentData] = useState({ info: "", qrCode: "", latitude: "", longitude: "", markerColor: "" });
  
  // Initialize data when modal opens
  useEffect(() => {
    if (open) {
      const data = {
        info: info || "",
        qrCode: qrCode || "",
        latitude: latitude || "",
        longitude: longitude || "",
        markerColor: markerColor || "#3388ff"
      };
      setOriginalData(data);
      setCurrentData(data);
    }
  }, [open, info, qrCode, latitude, longitude, markerColor]);
  
  // Check if there are any changes
  const hasChanges = () => {
    return (
      currentData.info !== originalData.info ||
      currentData.qrCode !== originalData.qrCode ||
      currentData.latitude !== originalData.latitude ||
      currentData.longitude !== originalData.longitude ||
      currentData.markerColor !== originalData.markerColor
    );
  };

  // Format code to 4 digits with leading zeros
  const formatCode = (codeValue?: string) => {
    if (!codeValue) return '0000';
    const numericCode = parseInt(codeValue.replace(/\D/g, ''), 10) || 0;
    return numericCode.toString().padStart(4, '0');
  };

  const handleEditClick = () => {
    setShowChecklistConfirm(true);
  };

  const handleConfirmEditClick = () => {
    const formattedCode = formatCode(code);
    const editUrl = `https://fmvending.web.app/refill-service/M${formattedCode}`;
    window.open(editUrl, '_blank');
    setShowChecklistConfirm(false);
  };

  const handleDirectionClick = () => {
    setNavigationType('google');
    setShowNavigationConfirm(true);
  };

  const handleConfirmDirectionClick = () => {
    if (latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      window.open(directionsUrl, '_blank');
    }
    setShowNavigationConfirm(false);
  };

  const handleWazeClick = () => {
    setNavigationType('waze');
    setShowNavigationConfirm(true);
  };

  const handleConfirmWazeClick = () => {
    if (latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
      const wazeUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
      window.open(wazeUrl, '_blank');
    }
    setShowNavigationConfirm(false);
  };

  const handleQrCodeClick = async () => {
    if (!qrCode) return;

    setIsScanning(true);
    try {
      let imageSource: string | Blob = qrCode;

      // If it's a remote URL, use our proxy to avoid CORS issues
      if (qrCode.startsWith('http')) {
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(qrCode)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.statusText}`);
        }
        imageSource = await response.blob();
      }

      // Try to decode QR code from the image
      const result = await QrScanner.scanImage(imageSource, { returnDetailedScanResult: true });
      setScannedResult(result.data);
      setShowConfirmDialog(true);
    } catch (error) {
      console.error("QR scanning error:", error);
      // Show error toast instead of incorrect navigation
      alert("Could not read QR code from the image. Please check if the image contains a valid QR code.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmNavigation = () => {
    if (scannedResult) {
      // Check if it's a valid URL, if not, treat it as a search query
      let targetUrl = scannedResult;
      
      // If it doesn't start with http/https, assume it's a search or add https
      if (!scannedResult.match(/^https?:\/\//)) {
        // If it looks like a URL without protocol, add https
        if (scannedResult.includes('.') && !scannedResult.includes(' ')) {
          targetUrl = `https://${scannedResult}`;
        } else {
          // Otherwise, search on Google
          targetUrl = `https://www.google.com/search?q=${encodeURIComponent(scannedResult)}`;
        }
      }
      
      window.open(targetUrl, '_blank');
    }
    setShowConfirmDialog(false);
    setScannedResult("");
  };

  const handleCancelNavigation = () => {
    setShowConfirmDialog(false);
    setScannedResult("");
  };

  const handleUrlClick = (url: string) => {
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
    }
    setUrlToOpen(targetUrl);
    setShowUrlConfirm(true);
  };

  const handleConfirmUrlOpen = () => {
    if (urlToOpen) {
      window.open(urlToOpen, '_blank');
    }
    setShowUrlConfirm(false);
    setUrlToOpen("");
  };
  
  const handleSaveClick = () => {
    if (hasChanges()) {
      setShowSaveConfirm(true);
    }
  };

  const handleConfirmSave = async () => {
    setShowSaveConfirm(false);
    setIsSaving(true);
    
    try {
      if (hasChanges() && onUpdateRow) {
        const updates: any = {};
        
        if (currentData.info !== originalData.info) {
          updates.info = currentData.info;
        }
        if (currentData.qrCode !== originalData.qrCode) {
          updates.qrCode = currentData.qrCode || null;
        }
        if (currentData.latitude !== originalData.latitude) {
          updates.latitude = currentData.latitude ? parseFloat(currentData.latitude) : null;
        }
        if (currentData.longitude !== originalData.longitude) {
          updates.longitude = currentData.longitude ? parseFloat(currentData.longitude) : null;
        }
        if (currentData.markerColor !== originalData.markerColor) {
          updates.markerColor = currentData.markerColor;
        }
        
        await onUpdateRow(updates);
        
        // Update original data to reflect saved changes
        setOriginalData(currentData);
        
        // Show success message (keep modal open so user can see changes in the map)
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    // Revert to original data
    setCurrentData(originalData);
  };

  // Handle image preview click to open lightbox
  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-1 bg-transparent border-transparent hover:bg-transparent hover:border-transparent text-blue-400 hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-400"
          data-testid={`button-info-${rowId}`}
        >
          {editMode ? (
            <Info className="w-4 h-4" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-lg overflow-hidden flex flex-col bg-transparent backdrop-blur-2xl border border-gray-200/50 dark:border-gray-800/50 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/40 transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-100 data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4 duration-300 ease-out"
        style={{
          maxHeight: 'min(90vh, calc(100dvh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 40px))',
          touchAction: 'pan-y',
        }}
      >
        {/* Premium Glass Layer with Apple-style gradient */}
        <div 
          className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-white/60 via-gray-50/40 to-white/60 dark:from-gray-900/60 dark:via-gray-950/40 dark:to-gray-900/60 border-0" 
          style={{
            backdropFilter: 'blur(80px) saturate(180%)',
            WebkitBackdropFilter: 'blur(80px) saturate(180%)',
          }}
        />
        <DialogHeader 
          className="pb-5 border-b border-gray-200/60 dark:border-gray-800/60 flex-shrink-0 relative"
          style={{ paddingTop: 'max(1.25rem, env(safe-area-inset-top))' }}
        >
          {/* Apple-style Close Button - Small, Transparent */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 right-3 h-5 w-5 p-0 rounded-full bg-transparent hover:bg-gray-200/50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-all duration-200 hover:scale-110 active:scale-90 z-10"
            onClick={() => setOpen(false)}
            data-testid="button-smart-close"
            title="Close"
          >
            <X className="w-3 h-3" />
          </Button>
          
          <DialogTitle className="font-semibold text-center text-gray-900 dark:text-white tracking-tight" style={{fontSize: '17px', letterSpacing: '-0.02em'}}>
            {location || 'Location'}
          </DialogTitle>
          <div className="text-center text-gray-500 dark:text-gray-400 pt-1.5 font-medium" style={{fontSize: '13px'}}>
            {code || ''}
          </div>
        </DialogHeader>
        
        <div 
          className="py-4 space-y-4 overflow-y-auto flex-1"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          {/* Mini Map Section */}
          {latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude)) && (
            <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl p-5 space-y-4 shadow-sm border border-gray-200/40 dark:border-gray-800/40">
              <div className="flex items-center justify-center">
                <h4 className="font-semibold text-gray-900 dark:text-white text-center tracking-tight" style={{fontSize: '15px', letterSpacing: '-0.01em'}}>Location Map</h4>
              </div>
              <MiniMap 
                locations={(() => {
                  const currentLocation = {
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                    label: location || 'Location',
                    code: route || code,
                    isCurrent: true,
                    markerColor: currentData.markerColor || markerColor
                  };
                  
                  // For fullscreen: collect all locations from allRows with valid coordinates
                  const allLocations = allRows
                    .filter(row => 
                      row.latitude && 
                      row.longitude && 
                      !isNaN(parseFloat(String(row.latitude))) && 
                      !isNaN(parseFloat(String(row.longitude)))
                    )
                    .map(row => ({
                      latitude: parseFloat(String(row.latitude)),
                      longitude: parseFloat(String(row.longitude)),
                      label: row.location || 'Location',
                      code: row.route || row.code,
                      isCurrent: row.id === rowId,
                      markerColor: row.markerColor
                    }));
                  
                  // For mini view, show only current location
                  // For fullscreen, it will show all locations
                  return allLocations.length > 1 ? allLocations : [currentLocation];
                })()}
                height="160px"
                showFullscreenButton={true}
              />
              
              {/* Full Address Caption */}
              <div className="mt-3 pt-3 border-t border-blue-200/50 dark:border-white/10">
                <SlidingDescription
                  value={(() => {
                    const infoValue = currentData.info || "";
                    if (!infoValue) return "";
                    if (infoValue.includes("|||DESCRIPTION|||")) {
                      return infoValue.split("|||DESCRIPTION|||")[0] || "";
                    }
                    return infoValue;
                  })()}
                  onSave={(value) => {
                    const currentInfo = currentData.info || "";
                    let newInfo = value;
                    
                    // Preserve description if it exists
                    if (currentInfo.includes("|||DESCRIPTION|||")) {
                      const description = currentInfo.split("|||DESCRIPTION|||")[1] || "";
                      if (description.trim()) {
                        newInfo = `${value}|||DESCRIPTION|||${description}`;
                      }
                    }
                    
                    setCurrentData(prev => ({ ...prev, info: newInfo }));
                  }}
                  isEditable={editMode}
                />
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl p-5 space-y-4 shadow-sm border border-gray-200/40 dark:border-gray-800/40">
            <div className="flex items-center justify-center">
              <h4 className="font-semibold text-gray-900 dark:text-white text-center tracking-tight" style={{fontSize: '15px', letterSpacing: '-0.01em'}}>Description</h4>
            </div>
            <EditableDescriptionList
              value={(() => {
                const infoValue = currentData.info || "";
                if (!infoValue) return "";
                if (infoValue.includes("|||DESCRIPTION|||")) {
                  const withDescription = infoValue.split("|||DESCRIPTION|||")[1] || "";
                  if (withDescription.includes("|||URL|||")) {
                    return withDescription.split("|||URL|||")[0] || "";
                  }
                  return withDescription;
                }
                return "";
              })()}
              onSave={(value) => {
                const currentInfo = currentData.info || "";
                let address = "";
                let url = "";
                
                // Parse current info to extract address and URL
                if (currentInfo.includes("|||DESCRIPTION|||")) {
                  address = currentInfo.split("|||DESCRIPTION|||")[0] || "";
                  const descriptionPart = currentInfo.split("|||DESCRIPTION|||")[1] || "";
                  if (descriptionPart.includes("|||URL|||")) {
                    url = descriptionPart.split("|||URL|||")[1] || "";
                  }
                } else {
                  // If no description separator, check for URL separator
                  if (currentInfo.includes("|||URL|||")) {
                    address = currentInfo.split("|||URL|||")[0] || "";
                    url = currentInfo.split("|||URL|||")[1] || "";
                  } else {
                    address = currentInfo;
                  }
                }
                
                // Rebuild info with updated description
                let newInfo = address.trim();
                
                // Add description if it has content
                if (value.trim()) {
                  newInfo += `|||DESCRIPTION|||${value.trim()}`;
                }
                
                // Add URL if it exists
                if (url.trim()) {
                  // If we have description, append URL to it
                  if (value.trim()) {
                    newInfo += `|||URL|||${url.trim()}`;
                  } else {
                    // If no description but have URL, add it directly
                    newInfo += `|||DESCRIPTION||||||URL|||${url.trim()}`;
                  }
                }
                
                setCurrentData(prev => ({ ...prev, info: newInfo }));
              }}
              isEditable={editMode}
            />
          </div>

          {/* URL Section - Only show in edit mode */}
          {editMode && (
            <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl p-5 space-y-4 shadow-sm border border-gray-200/40 dark:border-gray-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <ExternalLink className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white tracking-tight" style={{fontSize: '15px', letterSpacing: '-0.01em'}}>Website URL</h4>
              </div>
              <SlidingDescription
                value={(() => {
                  const infoValue = currentData.info || "";
                  if (!infoValue) return "";
                  if (infoValue.includes("|||URL|||")) {
                    return infoValue.split("|||URL|||").pop() || "";
                  }
                  return "";
                })()}
                onSave={(value) => {
                  const currentInfo = currentData.info || "";
                  let address = "";
                  let description = "";
                  
                  // Parse current info
                  if (currentInfo.includes("|||DESCRIPTION|||")) {
                    address = currentInfo.split("|||DESCRIPTION|||")[0] || "";
                    const descriptionPart = currentInfo.split("|||DESCRIPTION|||")[1] || "";
                    if (descriptionPart.includes("|||URL|||")) {
                      description = descriptionPart.split("|||URL|||")[0] || "";
                    } else {
                      description = descriptionPart;
                    }
                  } else {
                    address = currentInfo;
                  }
                  
                  // Combine with new URL
                  let newInfo = address;
                  if (description.trim() || value.trim()) {
                    newInfo += `|||DESCRIPTION|||${description}`;
                    if (value.trim()) {
                      newInfo += `|||URL|||${value}`;
                    }
                  }
                  
                  setCurrentData(prev => ({ ...prev, info: newInfo }));
                }}
                isEditable={editMode}
              />
            </div>
          )}

          {/* QR Code URL Section - Only show in edit mode */}
          {editMode && (
            <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl p-5 space-y-4 shadow-sm border border-gray-200/40 dark:border-gray-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-full flex items-center justify-center shadow-sm">
                  <QrCode className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white tracking-tight" style={{fontSize: '15px', letterSpacing: '-0.01em'}}>QR Code Image</h4>
              </div>
              <div className="space-y-2">
                {/* Show current QR preview if exists */}
                {currentData.qrCode && (
                  <div className="relative group">
                    <img 
                      src={currentData.qrCode} 
                      alt="QR Code" 
                      className="w-32 h-32 object-contain border border-purple-200 dark:border-purple-800 rounded-lg mx-auto"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setCurrentData(prev => ({ ...prev, qrCode: "" }))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                {/* Upload button */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          // Convert to base64
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64 = reader.result as string;
                            setCurrentData(prev => ({ ...prev, qrCode: base64 }));
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload QR Code
                  </Button>
                </div>
                
                {/* URL input alternative */}
                <div className="relative">
                  <Input
                    value={currentData.qrCode.startsWith('data:') ? '' : currentData.qrCode}
                    onChange={(e) => setCurrentData(prev => ({ ...prev, qrCode: e.target.value }))}
                    placeholder="Or paste image URL..."
                    style={{fontSize: '10px'}}
                    data-testid="input-qr-code"
                  />
                </div>
                <p className="text-muted-foreground" style={{fontSize: '10px'}}>Upload QR code image or enter URL</p>
              </div>
            </div>
          )}

          {/* Images Section - Show image preview if images exist */}
          {images && images.length > 0 && (
            <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl p-5 space-y-4 shadow-sm border border-gray-200/40 dark:border-gray-800/40">
              <div className="flex items-center justify-center">
                <h4 className="font-semibold text-gray-900 dark:text-white text-center tracking-tight" style={{fontSize: '15px', letterSpacing: '-0.01em'}}>Images ({images.filter(m => m.type === 'image').length})</h4>
              </div>
              <ImagePreview 
                images={images} 
                maxVisible={2}
                onImageClick={handleImageClick}
              />
            </div>
          )}

          {/* Location Coordinates Section - Only show in edit mode */}
          {editMode && (
            <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-xl rounded-2xl p-5 space-y-4 shadow-sm border border-gray-200/40 dark:border-gray-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm">📍</span>
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white tracking-tight" style={{fontSize: '15px', letterSpacing: '-0.01em'}}>Coordinates</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-gray-700 dark:text-gray-300 font-medium" style={{fontSize: '13px'}}>Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={currentData.latitude}
                    onChange={(e) => setCurrentData(prev => ({ ...prev, latitude: e.target.value }))}
                    placeholder="e.g., 3.1390"
                    className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500/20"
                    style={{fontSize: '13px'}}
                    data-testid="input-latitude"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-gray-700 dark:text-gray-300 font-medium" style={{fontSize: '13px'}}>Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={currentData.longitude}
                    onChange={(e) => setCurrentData(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder="e.g., 101.6869"
                    className="rounded-xl border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500/20"
                    style={{fontSize: '13px'}}
                    data-testid="input-longitude"
                  />
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400" style={{fontSize: '12px'}}>GPS coordinates for map location</p>
              
              {/* Marker Color Picker */}
              <div className="space-y-2.5 pt-4">
                <Label htmlFor="markerColor" className="text-gray-700 dark:text-gray-300 font-medium" style={{fontSize: '13px'}}>🎨 Marker Color</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="markerColor"
                    type="color"
                    value={currentData.markerColor}
                    onChange={(e) => setCurrentData(prev => ({ ...prev, markerColor: e.target.value }))}
                    className="w-20 h-11 cursor-pointer rounded-xl border-gray-200 dark:border-gray-800"
                    data-testid="input-marker-color"
                  />
                  <Input
                    type="text"
                    value={currentData.markerColor}
                    onChange={(e) => setCurrentData(prev => ({ ...prev, markerColor: e.target.value }))}
                    placeholder="#3b82f6"
                    className="flex-1 rounded-xl border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-blue-500/20"
                    style={{fontSize: '13px'}}
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
                <p className="text-gray-500 dark:text-gray-400" style={{fontSize: '12px'}}>Custom color for map marker pin</p>
              </div>
              
              {/* Save/Cancel Buttons - Right below coordinates */}
              <div className="flex justify-end gap-2.5 pt-5 border-t border-gray-200/60 dark:border-gray-800/60">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentData(originalData);
                    setOpen(false);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-0 rounded-xl px-5 py-2 font-medium transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{fontSize: '13px'}}
                  data-testid="button-cancel-info"
                >
                  <X className="w-4 h-4 mr-1.5" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveClick}
                  disabled={isSaving || !hasChanges()}
                  className={hasChanges() ? 'bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 border-0 rounded-xl px-5 py-2 font-medium transition-all duration-200 hover:scale-105 active:scale-95' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed border-0 rounded-xl px-5 py-2'}
                  style={{fontSize: '13px'}}
                  data-testid="button-save-info"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

        </div>
        <DialogFooter 
          className="pt-5 mt-0 border-t border-gray-200/60 dark:border-gray-800/60 bg-white/90 dark:bg-gray-950/90 backdrop-blur-2xl rounded-b-3xl -mx-6 -mb-6 px-6 relative overflow-hidden transition-all duration-300"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        >
          {/* Main Grid Button - Apple Style */}
          <div className={`flex justify-center items-center w-full transition-all duration-300 my-2 ${showActionsMenu ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <Button
              variant="ghost"
              className="h-11 w-11 p-0 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-200 rounded-2xl"
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              data-testid="button-actions-menu"
            >
              <FolderOpen className="w-5 h-5 text-white" />
            </Button>
          </div>

          {/* Sliding Actions Menu - Apple Style */}
          <div 
            className={`absolute left-0 right-0 bottom-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl border-t border-gray-200/60 dark:border-gray-800/60 transition-all duration-300 ease-out rounded-t-3xl ${
              showActionsMenu 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-full opacity-0 pointer-events-none'
            }`}
            style={{ 
              paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
            }}
          >
            {/* Close Button */}
            <div className="absolute top-3 right-3 z-50">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 touch-auto pointer-events-auto active:scale-90 transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActionsMenu(false);
                }}
                data-testid="button-close-actions-menu"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Actions Grid - Apple Style with Horizontal Scroll */}
            <div className="overflow-x-auto overflow-y-hidden px-6 pt-6 pb-3">
              <div className="flex gap-3 min-w-max justify-center">
              {location !== "QL Kitchen" && (
                <div className="flex items-center justify-center animate-in slide-in-from-right-10 duration-300" style={{animationDelay: '50ms'}}>
                  <Button
                    variant="ghost"
                    className="h-10 w-10 p-0 bg-transparent hover:bg-green-500/10 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 rounded-xl border border-green-500/30"
                    onClick={() => {
                      handleEditClick();
                      setShowActionsMenu(false);
                    }}
                    data-testid={`button-edit-${rowId}`}
                  >
                    <ListChecks className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </Button>
                </div>
              )}
              
              {qrCode && (
                <div className="flex items-center justify-center animate-in slide-in-from-right-10 duration-300" style={{animationDelay: '100ms'}}>
                  <Button
                    variant="ghost"
                    className="h-10 w-10 p-0 bg-transparent hover:bg-purple-500/10 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 rounded-xl disabled:opacity-50 border border-purple-500/30"
                    onClick={() => {
                      handleQrCodeClick();
                      setShowActionsMenu(false);
                    }}
                    disabled={isScanning}
                    data-testid={`button-qrcode-${rowId}`}
                  >
                    <QrCode className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </Button>
                </div>
              )}
              
              {(() => {
                const url = (() => {
                  if (!info) return "";
                  if (info.includes("|||URL|||")) {
                    return info.split("|||URL|||").pop() || "";
                  }
                  return "";
                })();
                
                return url.trim() ? (
                  <div className="flex items-center justify-center animate-in slide-in-from-right-10 duration-300" style={{animationDelay: '150ms'}}>
                    <Button
                      variant="ghost"
                      className="h-10 w-10 p-0 bg-transparent hover:bg-cyan-500/10 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 rounded-xl border border-cyan-500/30"
                      onClick={() => {
                        handleUrlClick(url);
                        setShowActionsMenu(false);
                      }}
                      data-testid={`button-open-url-${rowId}`}
                    >
                      <ExternalLink className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </Button>
                  </div>
                ) : null;
              })()}
              
              {latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude)) && (
                <>
                  <div className="flex items-center justify-center animate-in slide-in-from-right-10 duration-300" style={{animationDelay: '200ms'}}>
                    <Button
                      variant="ghost"
                      className="h-10 w-10 p-0 bg-transparent hover:bg-red-500/10 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 rounded-xl border border-red-500/30"
                      onClick={() => {
                        handleDirectionClick();
                        setShowActionsMenu(false);
                      }}
                      data-testid={`button-direction-${rowId}`}
                    >
                      <SiGooglemaps className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-center animate-in slide-in-from-right-10 duration-300" style={{animationDelay: '250ms'}}>
                    <Button
                      variant="ghost"
                      className="h-10 w-10 p-0 bg-transparent hover:bg-sky-500/10 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 rounded-xl border border-sky-500/30"
                      onClick={() => {
                        handleWazeClick();
                        setShowActionsMenu(false);
                      }}
                      data-testid={`button-waze-${rowId}`}
                    >
                      <SiWaze className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    </Button>
                  </div>
                </>
              )}
              </div>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
      
      {/* QR Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={handleCancelNavigation}>
        <DialogContent className="max-w-md animate-in zoom-in-95 duration-200 bg-white/80 dark:bg-black/70 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40 rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent pointer-events-none rounded-xl"></div>
          <div className="relative z-10">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
              <CheckCircle className="w-5 h-5" />
              QR Code Detected
            </DialogTitle>
            <DialogDescription>
              A QR code was scanned and contains a link.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Detected content:</p>
                  <div className="bg-background/50 dark:bg-black/50 p-2 rounded text-sm font-mono break-all">
                    {scannedResult}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Do you want to navigate to this link? It will open in a new tab.
            </p>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancelNavigation}
              data-testid="button-cancel-qr-navigation"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmNavigation}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-qr-navigation"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Link
            </Button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Checklist Confirmation Dialog */}
      <Dialog open={showChecklistConfirm} onOpenChange={setShowChecklistConfirm}>
        <DialogContent className="max-w-md animate-in zoom-in-95 duration-200 bg-white/80 dark:bg-black/70 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40 rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent pointer-events-none rounded-xl"></div>
          <div className="relative z-10">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
              <ListChecks className="w-5 h-5" />
              Open Checklist
            </DialogTitle>
            <DialogDescription>
              Access the refill service checklist for this location.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">External Link:</p>
                  <div className="bg-background/50 dark:bg-black/50 p-2 rounded text-sm font-mono break-all">
                    https://fmvending.web.app/refill-service/M{formatCode(code)}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Do you want to open the refill service checklist? It will open in a new tab.
            </p>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowChecklistConfirm(false)}
              data-testid="button-cancel-checklist"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmEditClick}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-checklist"
            >
              <ListChecks className="w-4 h-4 mr-2" />
              Open Checklist
            </Button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Navigation Confirmation Dialog */}
      <Dialog open={showNavigationConfirm} onOpenChange={setShowNavigationConfirm}>
        <DialogContent className="max-w-md animate-in zoom-in-95 duration-200 bg-white/80 dark:bg-black/70 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40 rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent pointer-events-none rounded-xl"></div>
          <div className="relative z-10">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
              {navigationType === 'google' ? (
                <SiGooglemaps className="w-5 h-5" />
              ) : (
                <SiWaze className="w-5 h-5" />
              )}
              Open Navigation
            </DialogTitle>
            <DialogDescription>
              Navigate to this location using {navigationType === 'google' ? 'Google Maps' : 'Waze'}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Navigation to:</p>
                  <div className="bg-background/50 dark:bg-black/50 p-2 rounded text-sm">
                    {location || 'Location'} ({latitude}, {longitude})
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Using {navigationType === 'google' ? 'Google Maps' : 'Waze'}</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Do you want to open navigation to this location? It will open in a new tab.
            </p>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowNavigationConfirm(false)}
              data-testid="button-cancel-navigation"
            >
              Cancel
            </Button>
            <Button 
              onClick={navigationType === 'google' ? handleConfirmDirectionClick : handleConfirmWazeClick}
              className={navigationType === 'google' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
              data-testid="button-confirm-navigation"
            >
              {navigationType === 'google' ? (
                <SiGooglemaps className="w-4 h-4 mr-2" />
              ) : (
                <SiWaze className="w-4 h-4 mr-2" />
              )}
              Open {navigationType === 'google' ? 'Google Maps' : 'Waze'}
            </Button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* URL Confirmation Dialog */}
      <Dialog open={showUrlConfirm} onOpenChange={setShowUrlConfirm}>
        <DialogContent className="max-w-md animate-in zoom-in-95 duration-200 bg-white/80 dark:bg-black/70 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40 rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent pointer-events-none rounded-xl"></div>
          <div className="relative z-10">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
              <ExternalLink className="w-5 h-5" />
              Open External Link
            </DialogTitle>
            <DialogDescription>
              This will open a website in a new tab.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Website URL:</p>
                  <div className="bg-background/50 dark:bg-black/50 p-2 rounded text-sm font-mono break-all">
                    {urlToOpen}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Do you want to open this external link? It will open in a new tab and may use your data.
            </p>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowUrlConfirm(false)}
              data-testid="button-cancel-url"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmUrlOpen}
              className="bg-cyan-600 hover:bg-cyan-700"
              data-testid="button-confirm-url"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Link
            </Button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <DialogContent className="max-w-md animate-in zoom-in-95 duration-200 bg-white/80 dark:bg-black/70 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40 rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent pointer-events-none rounded-xl"></div>
          <div className="relative z-10">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
              <Save className="w-5 h-5" />
              Save Changes
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to save these changes to the location information?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-green-50/50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">Changes to be saved:</p>
                  <ul className="text-sm space-y-1">
                    {currentData.info !== originalData.info && (
                      <li className="text-green-700 dark:text-green-300">• Location details updated</li>
                    )}
                    {currentData.qrCode !== originalData.qrCode && (
                      <li className="text-green-700 dark:text-green-300">• QR code URL updated</li>
                    )}
                    {currentData.latitude !== originalData.latitude && (
                      <li className="text-green-700 dark:text-green-300">• Latitude updated</li>
                    )}
                    {currentData.longitude !== originalData.longitude && (
                      <li className="text-green-700 dark:text-green-300">• Longitude updated</li>
                    )}
                    {currentData.markerColor !== originalData.markerColor && (
                      <li className="text-green-700 dark:text-green-300">• Marker color updated</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowSaveConfirm(false)}
              data-testid="button-cancel-save"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmSave}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-confirm-save"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-2 duration-300">
          <Alert className="bg-green-600 text-white border-green-700 shadow-lg">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <strong>Success!</strong> Information saved successfully.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Image Lightbox */}
      <ImageLightbox
        images={images}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        initialIndex={lightboxIndex}
      />
    </Dialog>
  );
}