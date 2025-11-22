import { GripVertical, X, Grip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableColumn } from "@shared/schema";

interface ColumnHeaderProps {
  column: TableColumn;
  dragHandleProps: any;
  onDelete: () => void;
  isAuthenticated?: boolean;
  editMode?: boolean;
}

export function ColumnHeader({ column, dragHandleProps, onDelete, isAuthenticated = false, editMode = false }: ColumnHeaderProps) {
  // Core columns that cannot be deleted (based on dataKey)
  const coreColumnDataKeys = ['id', 'no', 'route', 'code', 'location', 'delivery', 'tngRoute', 'info', 'images', 'kilometer', 'tollPrice'];
  const isCoreColumn = coreColumnDataKeys.includes(column.dataKey);
  
  return (
    <div className="flex items-center justify-center w-full mx-auto relative group/header">
      {editMode && (
        <div {...dragHandleProps} className="absolute left-0 opacity-0 group-hover/header:opacity-60 hover:opacity-100 transition-opacity cursor-move">
          <Grip className="w-3 h-3 text-primary" />
        </div>
      )}
      <div className="text-center flex-1">
        <span className="font-semibold text-foreground tracking-wide uppercase" style={{fontSize: '9px', letterSpacing: '0.5px'}}>{column.name}</span>
      </div>
      {!isCoreColumn && editMode && (
        <div className="absolute right-0 flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            className={`h-auto p-0.5 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 rounded ${!isAuthenticated ? 'opacity-50 cursor-not-allowed text-muted-foreground' : 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'}`}
            onClick={() => isAuthenticated && onDelete()}
            disabled={!isAuthenticated}
            title={!isAuthenticated ? "Authentication required to delete columns" : "Delete column"}
            data-testid={`button-delete-column-${column.dataKey}`}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
