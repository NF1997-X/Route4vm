import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TableRow } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface BulkColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: TableRow[];
}

export function BulkColorModal({ isOpen, onClose, rows }: BulkColorModalProps) {
  const [bulkColorRoute, setBulkColorRoute] = useState("");
  const [bulkColor, setBulkColor] = useState("#3b82f6");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get unique routes for dropdown
  const routeOptions = Array.from(new Set(rows.map(row => row.route).filter(Boolean))).sort();

  // Bulk update marker color by route mutation
  const bulkUpdateColorMutation = useMutation({
    mutationFn: async (data: { route: string; color: string }) => {
      const response = await apiRequest("PUT", `/api/table-rows/bulk-update-color`, data);
      if (!response.ok) {
        throw new Error("Failed to update marker colors");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/table-rows"] });
      setBulkColorRoute("");
      setBulkColor("#3b82f6");
      onClose();
      toast({
        title: "Marker colors updated!",
        description: "All locations in the selected route have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update marker colors. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle bulk color update
  const handleBulkColorUpdate = () => {
    if (!bulkColorRoute) {
      toast({
        title: "Select a route",
        description: "Please select a route to update marker colors.",
        variant: "destructive",
      });
      return;
    }

    bulkUpdateColorMutation.mutate({
      route: bulkColorRoute,
      color: bulkColor,
    });
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setBulkColorRoute("");
      setBulkColor("#3b82f6");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass-modal">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
            🎨 Bulk Edit Marker Color
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 p-1">
          {/* Route Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Select Route
            </label>
            <select
              value={bulkColorRoute}
              onChange={(e) => setBulkColorRoute(e.target.value)}
              className="w-full px-3 py-3 text-sm bg-white/80 dark:bg-black/40 border-0 rounded-xl font-medium shadow-sm transition-all backdrop-blur-sm focus:bg-white/90 dark:focus:bg-black/50 focus:ring-2 focus:ring-purple-500/30"
            >
              <option value="">-- Select Route --</option>
              {routeOptions.map((route) => (
                <option key={route} value={route}>
                  {route}
                </option>
              ))}
            </select>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span>New Color</span>
              {bulkColorRoute && (() => {
                const currentRow = rows.find(r => r.route === bulkColorRoute);
                const currentColor = currentRow?.markerColor || '#3b82f6';
                return (
                  <span className="flex items-center gap-1 text-xs font-normal text-gray-600 dark:text-gray-400">
                    (Current: 
                    <span 
                      className="inline-block w-3 h-3 rounded-sm border border-gray-400 dark:border-gray-500"
                      style={{ backgroundColor: currentColor }}
                      title={currentColor}
                    />)
                  </span>
                );
              })()}
            </label>
            <input
              type="color"
              value={bulkColor}
              onChange={(e) => setBulkColor(e.target.value)}
              className="h-12 w-full rounded-xl border-2 border-purple-300/50 dark:border-purple-700/50 cursor-pointer shadow-sm hover:scale-105 transition-all backdrop-blur-sm"
            />
          </div>

          {/* Info Box */}
          <div className="px-4 py-3 bg-purple-100/50 dark:bg-purple-900/20 rounded-xl backdrop-blur-sm">
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
              {bulkColorRoute 
                ? `✓ Will update marker colors for ALL locations in route "${bulkColorRoute}"`
                : "💡 Select a route above to bulk update marker colors for all locations in that route"
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 glass-button"
              disabled={bulkUpdateColorMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkColorUpdate}
              disabled={!bulkColorRoute || bulkUpdateColorMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {bulkUpdateColorMutation.isPending ? "Updating..." : "🎨 Update Color"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}