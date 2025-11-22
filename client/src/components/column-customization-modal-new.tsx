import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GripVertical, RotateCcw, X, CheckCheck, Columns3 } from "lucide-react";
import { TableColumn } from "@shared/schema";

interface ColumnCustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: TableColumn[];
  visibleColumns: string[];
  onApplyChanges: (visibleColumns: string[], columnOrder: string[]) => void;
  editMode?: boolean;
}

interface ColumnItem {
  id: string;
  name: string;
  dataKey: string;
  visible: boolean;
  isCore: boolean;
}

export function ColumnCustomizationModal({
  open,
  onOpenChange,
  columns,
  visibleColumns,
  onApplyChanges,
  editMode = false,
}: ColumnCustomizationModalProps) {
  const [localColumns, setLocalColumns] = useState<ColumnItem[]>([]);
  const [originalColumns, setOriginalColumns] = useState<ColumnItem[]>([]);

  // Core columns that cannot be hidden
  const coreColumnNames = ['ID', 'No', 'Route', 'Code', 'Location', 'Delivery', 'Destination'];

  useEffect(() => {
    if (columns.length > 0) {
      const columnsToHide = editMode 
        ? ['longitude', 'latitude', 'tollPrice']
        : ['longitude', 'latitude', 'info', 'tollPrice'];
      
      // Deprecated columns to completely exclude from the modal
      const deprecatedColumns = ['tripTun', 'tripLama', 'trip_tun', 'trip_lama', 'trip', 'Trip'];
      
      const columnItems: ColumnItem[] = columns
        .filter(column => !columnsToHide.includes(column.dataKey))
        .filter(column => !deprecatedColumns.includes(column.dataKey))
        .filter(column => !deprecatedColumns.some(dep => column.name.toLowerCase().includes(dep.toLowerCase())))
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(column => ({
          id: column.id,
          name: column.name,
          dataKey: column.dataKey,
          visible: visibleColumns.includes(column.id),
          isCore: coreColumnNames.includes(column.name),
        }));
      setLocalColumns(columnItems);
      setOriginalColumns(columnItems);
    }
  }, [columns, visibleColumns, editMode]);

  const handleToggleVisibility = (columnId: string) => {
    setLocalColumns(prev =>
      prev.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedColumns = Array.from(localColumns);
    const [reorderedItem] = reorderedColumns.splice(result.source.index, 1);
    reorderedColumns.splice(result.destination.index, 0, reorderedItem);

    setLocalColumns(reorderedColumns);
  };

  const handleApply = () => {
    const visibleIds = localColumns.filter(col => col.visible).map(col => col.id);
    const columnOrder = localColumns.map(col => col.id);
    onApplyChanges(visibleIds, columnOrder);
    onOpenChange(false);
  };

  const handleReset = () => {
    const columnsToHide = editMode 
      ? ['longitude', 'latitude', 'tollPrice']
      : ['longitude', 'latitude', 'info', 'tollPrice'];
    
    const resetColumns = columns
      .filter(column => !columnsToHide.includes(column.dataKey))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(column => ({
        id: column.id,
        name: column.name,
        dataKey: column.dataKey,
        visible: true,
        isCore: coreColumnNames.includes(column.name),
      }));
    setLocalColumns(resetColumns);
  };

  const visibleCount = localColumns.filter(col => col.visible).length;

  const hasChanges = () => {
    if (localColumns.length !== originalColumns.length) return true;
    if (originalColumns.length === 0) return false;
    
    for (const currentCol of localColumns) {
      const originalCol = originalColumns.find(col => col.id === currentCol.id);
      if (!originalCol || originalCol.visible !== currentCol.visible) {
        return true;
      }
    }
    
    const originalOrder = originalColumns.map(col => col.id);
    const currentOrder = localColumns.map(col => col.id);
    
    if (originalOrder.length !== currentOrder.length) return true;
    
    for (let i = 0; i < originalOrder.length; i++) {
      if (originalOrder[i] !== currentOrder[i]) {
        return true;
      }
    }
    
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white/85 dark:bg-black/50 backdrop-blur-3xl border border-white/30 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)_inset] rounded-3xl animate-in fade-in-0 zoom-in-95 duration-300">
        {/* iOS Frosted Glass Layer with subtle gradient */}
        <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-white/60 via-white/40 to-blue-50/30 dark:from-black/40 dark:via-black/20 dark:to-blue-950/20 backdrop-blur-3xl" />
        <div className="absolute inset-0 -z-10 rounded-3xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]" />
        
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
              <Columns3 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Customize Columns
              </span>
              <span className="text-xs text-muted-foreground font-normal mt-0.5">
                {visibleCount} of {localColumns.length} visible
              </span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground/80">
            Drag to reorder • Toggle to show/hide columns
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="column-customization">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-600"
                >
                  {localColumns.map((column, index) => (
                    <Draggable
                      key={column.id}
                      draggableId={column.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`group flex items-center justify-between p-3.5 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
                            snapshot.isDragging 
                              ? 'shadow-[0_8px_30px_rgba(59,130,246,0.25),0_0_0_1px_rgba(59,130,246,0.1)_inset] border-blue-500/60 dark:border-blue-400/60 bg-white/95 dark:bg-gray-900/95 scale-[1.02] rotate-1' 
                              : 'border-white/50 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 hover:bg-white/90 dark:hover:bg-gray-900/70 hover:shadow-lg hover:border-blue-400/30 dark:hover:border-blue-500/30'
                          } ${!column.visible ? 'opacity-40 hover:opacity-60' : ''}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50"
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <Label
                              htmlFor={`column-${column.id}`}
                              className={`text-sm font-medium cursor-pointer select-none transition-colors ${
                                column.visible 
                                  ? 'text-gray-900 dark:text-gray-100' 
                                  : 'text-gray-500 dark:text-gray-500'
                              }`}
                            >
                              {column.name}
                              {column.isCore && (
                                <span className="ml-2 text-xs px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-normal">Core</span>
                              )}
                            </Label>
                          </div>
                          <Switch
                            id={`column-${column.id}`}
                            checked={column.visible}
                            onCheckedChange={() => handleToggleVisibility(column.id)}
                            disabled={column.isCore && column.visible && visibleCount <= 1}
                            data-testid={`switch-column-${column.dataKey}`}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="text-xs bg-gradient-to-r from-blue-50/80 to-cyan-50/80 dark:from-blue-950/40 dark:to-cyan-950/40 p-3 rounded-xl border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-semibold shrink-0">💡</span>
              <p className="text-blue-900/80 dark:text-blue-100/80 leading-relaxed">
                At least one column must remain visible. Core columns are essential for the best experience.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-center pt-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              size="sm"
              className="h-9 px-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-white/50 dark:border-white/10 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200"
              data-testid="button-reset-columns"
              title="Reset to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              <span className="text-xs font-medium">Reset</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              size="sm"
              className="h-9 px-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-white/50 dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
              data-testid="button-cancel-customize"
              title="Close without saving"
            >
              <X className="w-3.5 h-3.5 mr-1.5" />
              <span className="text-xs font-medium">Cancel</span>
            </Button>
            <Button 
              onClick={handleApply} 
              size="sm" 
              disabled={!hasChanges()}
              className={`h-9 px-4 backdrop-blur-xl transition-all duration-200 ${
                hasChanges() 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25 border-0' 
                  : 'bg-white/40 dark:bg-gray-900/40 border border-white/30 dark:border-white/10 text-muted-foreground cursor-not-allowed'
              }`} 
              data-testid="button-apply-customize" 
              title={hasChanges() ? 'Save changes' : 'No changes to apply'}
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
              <span className="text-xs font-semibold">Apply</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
