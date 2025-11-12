import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, X, Image as ImageIcon, Upload, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImageData {
  url: string;
  type: string;
  caption: string;
}

interface ImageManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rowId: string;
  location: string;
  images: ImageData[];
  onSave: (rowId: string, images: ImageData[]) => Promise<void>;
}

export function ImageManagerModal({ 
  open, 
  onOpenChange, 
  rowId, 
  location, 
  images: initialImages,
  onSave 
}: ImageManagerModalProps) {
  const [images, setImages] = useState<ImageData[]>(initialImages);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageCaption, setNewImageCaption] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const MAX_IMAGES = 10;

  // Convert File to base64 data URL
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Convert image to base64 and return immediately (fast display)
  // Backend will handle ImgBB upload in background for download feature
  const uploadViaServer = async (file: File): Promise<string> => {
    // Convert to base64 data URL - this is instant and stored in DB
    const dataUrl = await fileToDataURL(file);
    
    // Return base64 immediately - no need to wait for ImgBB upload
    // Backend will upload to ImgBB in background and update imgbbUrl field
    return dataUrl;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Check total images limit
    const totalImages = images.length + files.length;
    if (totalImages > MAX_IMAGES) {
      toast({
        title: "Too Many Images",
        description: `You can only upload up to ${MAX_IMAGES} images. Currently: ${images.length}, Trying to add: ${files.length}`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const uploadedImages: ImageData[] = [];
    let successCount = 0;
    let failCount = 0;

    try {
      // Upload files sequentially to avoid rate limits
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          failCount++;
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File Too Large",
            description: `${file.name} exceeds 5MB limit`,
            variant: "destructive",
          });
          failCount++;
          continue;
        }

        try {
          const url = await uploadViaServer(file);
          uploadedImages.push({
            url,
            type: "image",
            caption: "",
          });
          successCount++;
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          console.error(`Failed to upload ${file.name}:`, errorMsg);
          
          // Check for API key error
          if (errorMsg.includes('401') || errorMsg.includes('Invalid') || errorMsg.includes('key')) {
            toast({
              title: "Upload Service Error",
              description: "Image upload service is not properly configured. Please contact administrator.",
              variant: "destructive",
            });
            setIsUploading(false);
            event.target.value = '';
            return;
          }
          failCount++;
        }
      }

      if (uploadedImages.length > 0) {
        setImages([...images, ...uploadedImages]);
      }

      if (successCount > 0) {
        toast({
          title: "Upload Complete",
          description: `Successfully uploaded ${successCount} image${successCount > 1 ? 's' : ''}${failCount > 0 ? `, ${failCount} failed` : ''}`,
        });
      } else if (failCount > 0) {
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${failCount} image${failCount > 1 ? 's' : ''}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter an image URL",
        variant: "destructive",
      });
      return;
    }

    // Check images limit
    if (images.length >= MAX_IMAGES) {
      toast({
        title: "Limit Reached",
        description: `Maximum ${MAX_IMAGES} images allowed`,
        variant: "destructive",
      });
      return;
    }

    const newImage: ImageData = {
      url: newImageUrl.trim(),
      type: "image",
      caption: newImageCaption.trim() || "",
    };

    setImages([...images, newImage]);
    setNewImageUrl("");
    setNewImageCaption("");

    toast({
      title: "Image Added",
      description: "Image has been added to the list",
    });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    
    toast({
      title: "Image Removed",
      description: "Image has been removed from the list",
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(rowId, images);
      toast({
        title: "Success",
        description: "Images updated successfully",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update images",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setImages(initialImages);
    setNewImageUrl("");
    setNewImageCaption("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white/80 dark:bg-black/70 backdrop-blur-2xl border border-white/30 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40 rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/10 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent pointer-events-none rounded-xl"></div>
        
        <div className="relative z-10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Manage Images - {location}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-200px)] pr-2">
            {/* Add New Image Section with Tabs */}
            <div className="space-y-3 p-4 rounded-lg bg-white/50 dark:bg-black/30 border border-white/30 dark:border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Add Images</h3>
                <span className="text-xs text-slate-500">
                  {images.length} / {MAX_IMAGES} images
                </span>
              </div>
              
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="text-xs">
                    <Upload className="w-3 h-3 mr-1" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="url" className="text-xs">
                    <LinkIcon className="w-3 h-3 mr-1" />
                    URL
                  </TabsTrigger>
                </TabsList>

                {/* Upload from Gallery */}
                <TabsContent value="upload" className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="file-upload" className="text-xs">
                      Select Images from Gallery (Max 10, up to 5MB each)
                    </Label>
                    <div className="relative">
                      <Input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        disabled={isUploading || images.length >= MAX_IMAGES}
                        className="h-9 text-sm cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                      />
                    </div>
                    {isUploading && (
                      <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                        Uploading images...
                      </div>
                    )}
                    <p className="text-xs text-slate-500">
                      Selected images will be automatically uploaded to cloud storage
                    </p>
                  </div>
                </TabsContent>

                {/* Add by URL */}
                <TabsContent value="url" className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="image-url" className="text-xs">Image URL</Label>
                    <Input
                      id="image-url"
                      placeholder="https://example.com/image.jpg"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      disabled={images.length >= MAX_IMAGES}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image-caption" className="text-xs">Caption (Optional)</Label>
                    <Textarea
                      id="image-caption"
                      placeholder="Enter image caption..."
                      value={newImageCaption}
                      onChange={(e) => setNewImageCaption(e.target.value)}
                      disabled={images.length >= MAX_IMAGES}
                      className="min-h-[60px] text-sm resize-none"
                      rows={2}
                    />
                  </div>

                  <Button 
                    onClick={handleAddImage}
                    size="sm"
                    disabled={images.length >= MAX_IMAGES}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Image URL
                  </Button>
                </TabsContent>
              </Tabs>
            </div>

            {/* Current Images List */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Current Images ({images.length})
              </h3>
              
              {images.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                  No images added yet
                </div>
              ) : (
                <div className="space-y-2">
                  {images.map((image, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-black/30 border border-white/30 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-500/30 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-700">
                        <img 
                          src={image.url} 
                          alt={image.caption || `Image ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23ddd"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999">No Image</text></svg>';
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate font-mono">
                          {image.url}
                        </p>
                        {image.caption && image.caption.trim() && (
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            {image.caption}
                          </p>
                        )}
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveImage(index)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white text-xs"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
