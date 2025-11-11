import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check, X } from "lucide-react";

interface EditableCellProps {
  value: any;
  type: string;
  onSave: (value: any) => void;
  options?: string[];
  dataKey?: string;
}

export function EditableCell({ value, type, onSave, options, dataKey }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      const timeout = setTimeout(() => {
        if (shouldUseTextarea() && textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.select();
        } else if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
      
      return () => clearTimeout(timeout);
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing) {
      // Prevent body scroll when any editing is active
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isEditing]);

  // Check if should use popup textarea (for longer text content)
  const shouldUseTextarea = () => {
    if (type === 'text' && (
      dataKey === 'info' || 
      dataKey === 'location' || 
      dataKey === 'delivery' || 
      (typeof value === 'string' && value.length > 50)
    )) {
      return true;
    }
    return false;
  };  const handleSave = () => {
    let processedValue = editValue;
    
    if (type === 'number') {
      processedValue = parseInt(editValue) || 0;
    } else if (type === 'currency') {
      processedValue = parseFloat(editValue.toString().replace(/[^0-9.]/g, '')) || 0;
      processedValue = processedValue.toFixed(2);
    }
    
    onSave(processedValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  // Add click outside to close popup
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (shouldUseTextarea()) {
      // For popup input, save on Enter, cancel on Escape
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    } else {
      // For inline input, save on Enter, cancel on Escape
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    }
  };

  const getPlaceholder = () => {
    if (dataKey === 'latitude') {
      return "e.g. 3.139003 (decimal degrees)";
    }
    if (dataKey === 'longitude') {
      return "e.g. 101.686855 (decimal degrees)";
    }
    if (type === 'currency') {
      return "0.00";
    }
    if (type === 'number') {
      return "Enter number";
    }
    return undefined;
  };

  if (isEditing) {
    if (type === 'select' && options) {
      return (
        <Select 
          value={editValue} 
          onValueChange={(newValue) => {
            setEditValue(newValue);
            onSave(newValue);
            setIsEditing(false);
          }}
        >
          <SelectTrigger className="w-full h-6 px-2 py-1 text-sm bg-transparent border-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // For longer text content, show popup
    if (shouldUseTextarea()) {
      return (
        <>
          {/* This stays in the table cell - minimal height */}
          <div className="text-xs text-gray-500 italic py-1">
            Editing...
          </div>
          
          {/* Fixed position popup - locked to viewport, ignores scroll */}
          <div 
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999
            }}
          >
            <div className="glass-card p-4 w-80 rounded shadow-2xl border border-white/20 animate-in fade-in-0 zoom-in-95 duration-200"
                 style={{ 
                   position: 'fixed',
                   top: '50vh',
                   left: '50vw',
                   transform: 'translate(-50%, -50%)',
                   zIndex: 10000,
                   margin: 0
                 }}
                 onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3">
                <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Editing {dataKey === 'info' ? 'Description' : dataKey === 'location' ? 'Location' : 'Field'}
                </h3>
              </div>
              
              <Input
                ref={inputRef}
                value={editValue || ''}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsEditing(false);
                    setEditValue(value);
                  } else if (e.key === 'Enter') {
                    handleSave();
                  }
                }}
                placeholder={getPlaceholder()}
                className="glass-input w-full text-sm mb-4 ring-2 ring-blue-500/30 focus:ring-blue-500/50 border-white/20 rounded-lg"
                data-testid="input-editable-cell-popup"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="btn-glass h-8 px-3 text-xs border-white/20 hover:bg-white/10"
                  data-testid="button-cancel-edit"
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="btn-glass h-8 px-3 text-xs bg-blue-600/90 backdrop-blur text-white hover:bg-blue-700/90 border border-blue-500/30 shadow-lg shadow-blue-500/25"
                  data-testid="button-save-edit"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </div>
              
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Enter</kbd> to save, <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd> to cancel
              </div>
            </div>
          </div>
        </>
      );
    }

    // Inline editing for normal text
    return (
      <div className="flex items-center gap-1 w-full">
        <Input
          ref={inputRef}
          value={editValue || ''}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          className="glass-input flex-1 text-xs h-6 px-2 py-1 border border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          autoFocus
        />
        <Button
          size="sm"
          onClick={handleSave}
          className="h-6 w-6 p-0 bg-green-500 hover:bg-green-600 text-white border-none"
        >
          <Check className="w-3 h-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          className="h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white border-none"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );    return (
      <Input
        ref={inputRef}
        type={type === 'number' || type === 'currency' ? 'number' : 'text'}
        step={type === 'currency' ? '0.01' : undefined}
        value={type === 'currency' ? editValue.toString().replace(/[^0-9.]/g, '') : editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={getPlaceholder()}
        className="w-full h-6 px-2 py-1 text-sm cell-editing glass-input border-none"
        data-testid="input-editable-cell"
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 transition-colors"
      data-testid="text-editable-cell"
    >
      {value}
    </span>
  );
}
