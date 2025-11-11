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
      }, 100); // Increased delay for better reliability
      
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

  // Global escape key handler for better UX
  useEffect(() => {
    if (isEditing) {
      const handleEscapeKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          handleCancel();
        }
      };

      document.addEventListener('keydown', handleEscapeKey, true);
      return () => document.removeEventListener('keydown', handleEscapeKey, true);
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

  // Enhanced click outside to close popup
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking on the backdrop itself, not on child elements
    if (e.target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
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
          {/* This stays in the table cell - shows editing status */}
          <div className="text-xs text-blue-600 dark:text-blue-400 italic py-1 animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
            Editing...
          </div>
          
          {/* Fixed position popup - professional modal design */}
          <div 
            className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={handleBackdropClick}
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="glass-card p-6 w-full max-w-md mx-auto rounded-xl shadow-2xl border border-white/20 animate-in fade-in-0 zoom-in-95 duration-300 max-h-[80vh] overflow-hidden flex flex-col"
                 style={{ 
                   position: 'relative',
                   zIndex: 9999,
                   minWidth: '280px'
                 }}
                 onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Editing {dataKey === 'info' ? 'Description' : dataKey === 'location' ? 'Location' : dataKey ? dataKey.charAt(0).toUpperCase() + dataKey.slice(1) : 'Field'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Make your changes and press Enter to save
                </p>
              </div>
              
              
              {/* Smart input/textarea detection */}
              {dataKey === 'info' || dataKey === 'location' || (typeof value === 'string' && value.length > 50) ? (
                <Textarea
                  ref={textareaRef}
                  value={editValue || ''}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Escape') {
                      handleCancel();
                    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  placeholder={getPlaceholder()}
                  className="glass-textarea w-full text-sm mb-4 min-h-[120px] resize-none ring-2 ring-blue-500/30 focus:ring-blue-500/50 border-white/20 rounded-xl py-3 px-4 transition-all duration-200"
                  data-testid="textarea-editable-cell-popup"
                  autoFocus
                />
              ) : (
                <Input
                  ref={inputRef}
                  value={editValue || ''}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Escape') {
                      handleCancel();
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  placeholder={getPlaceholder()}
                  className="glass-input w-full text-sm mb-4 ring-2 ring-blue-500/30 focus:ring-blue-500/50 border-white/20 rounded-xl py-3 px-4 transition-all duration-200"
                  data-testid="input-editable-cell-popup"
                  autoFocus
                />
              )}
              
              {/* Action buttons */}
              <div className="flex gap-3 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  className="glass-button h-9 px-4 text-sm border-red-200/40 hover:bg-red-50/80 dark:border-red-800/40 dark:hover:bg-red-950/80 hover:border-red-300/60 transition-all"
                  data-testid="button-cancel-edit"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="h-9 px-4 text-sm bg-blue-600 backdrop-blur text-white hover:bg-blue-700 border border-blue-500/40 shadow-lg shadow-blue-500/25 transition-all"
                  data-testid="button-save-edit"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
              
              {/* Keyboard shortcuts help */}
              <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200/30 dark:border-blue-800/30">
                <div className="flex items-center justify-center gap-4 text-xs text-blue-600 dark:text-blue-400">
                  {dataKey === 'info' || dataKey === 'location' || (typeof value === 'string' && value.length > 50) ? (
                    <>
                      <div className="flex items-center gap-1">
                        <kbd className="px-2 py-1 bg-white/80 dark:bg-black/40 rounded text-xs font-mono border border-blue-200 dark:border-blue-800">Ctrl+↵</kbd>
                        <span>Save</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <kbd className="px-2 py-1 bg-white/80 dark:bg-black/40 rounded text-xs font-mono border border-blue-200 dark:border-blue-800">Esc</kbd>
                        <span>Cancel</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <kbd className="px-2 py-1 bg-white/80 dark:bg-black/40 rounded text-xs font-mono border border-blue-200 dark:border-blue-800">↵</kbd>
                        <span>Save</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <kbd className="px-2 py-1 bg-white/80 dark:bg-black/40 rounded text-xs font-mono border border-blue-200 dark:border-blue-800">Esc</kbd>
                        <span>Cancel</span>
                      </div>
                    </>
                  )}
                </div>
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
