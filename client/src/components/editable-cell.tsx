import { useState, useEffect, useRef } from "react";
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
  const selectRef = useRef<HTMLSelectElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // If editing a delivery cell and the stored value is empty, default to 'None'
  useEffect(() => {
    if (isEditing && (dataKey === 'delivery' || dataKey === 'route' || type === 'select')) {
      if (value === null || value === undefined || value === '') {
        setEditValue(options?.[0] || 'None');
      }
    }
  }, [isEditing, dataKey, type, value, options]);

  useEffect(() => {
    if (isEditing) {
      if (inputRef.current) {
        inputRef.current.focus();
        if (inputRef.current.select && typeof inputRef.current.select === 'function') {
          inputRef.current.select();
        }
      } else if (selectRef.current) {
        selectRef.current.focus();
      } else if (textareaRef.current) {
        textareaRef.current.focus();
        // Move cursor to end
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }
  }, [isEditing]);

  // Click outside to cancel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditing]);

  const handleSave = () => {
    try {
      let processedValue = editValue;
      
      if (editValue === null || editValue === undefined || editValue === '') {
        if (type === 'number' || type === 'currency') {
          processedValue = 0;
        } else {
          processedValue = '';
        }
      } else if (type === 'number') {
        processedValue = parseInt(editValue) || 0;
      } else if (type === 'currency') {
        processedValue = parseFloat(editValue.toString().replace(/[^0-9.]/g, '')) || 0;
        processedValue = processedValue.toFixed(2);
      }
      
      onSave(processedValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // For textarea, Ctrl+Enter to save, Escape to cancel, Enter adds newline
    if (type === 'textarea') {
      if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
      // Allow Enter key to add newlines naturally
    } else {
      // For other inputs, Enter to save, Escape to cancel
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    }
  };

  const getPlaceholder = () => {
    if (dataKey === 'latitude') return "e.g. 3.139003";
    if (dataKey === 'longitude') return "e.g. 101.686855";
    if (type === 'currency') return "0.00";
    if (type === 'number') return "Enter number";
    if (type === 'textarea') return "Enter text... (Ctrl+Enter to save)";
    return "Enter text";
  };

  const displayValue = type === 'currency' && value 
    ? `RM ${parseFloat(value).toFixed(2)}`
    : value || '—';

  if (isEditing) {
    const isSelect = dataKey === 'delivery' || dataKey === 'route' || type === 'select';
    const isTextarea = type === 'textarea';
    const selectOptions = options || ['None', 'Daily', 'Weekday', 'Alt 1', 'Alt 2'];

    return (
      <div 
        ref={containerRef}
        className="relative inline-flex items-start gap-1 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300"
      >
        {isSelect ? (
          <select
            ref={selectRef}
            value={editValue ?? selectOptions[0]}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-7 px-2 py-1 text-[10px] text-center bg-white dark:bg-gray-900 border-2 border-gray-400 dark:border-gray-600 rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all duration-200 hover:border-gray-500 focus:scale-105"
            autoFocus
          >
            {selectOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : isTextarea ? (
          <textarea
            ref={textareaRef}
            value={editValue || ''}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            rows={7}
            className="min-w-[200px] max-w-[400px] px-3 py-2 text-[11px] bg-white dark:bg-gray-900 border-2 border-gray-400 dark:border-gray-600 rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500/50 resize-y transition-all duration-200 hover:border-gray-500 focus:scale-105"
            style={{ whiteSpace: 'pre-wrap' }}
          />
        ) : (
          <input
            ref={inputRef}
            type={type === 'number' || type === 'currency' ? 'number' : 'text'}
            step={type === 'currency' ? '0.01' : undefined}
            value={type === 'currency' ? editValue.toString().replace(/[^0-9.]/g, '') : editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            className="h-7 px-2 py-1 w-auto text-[10px] text-center bg-white dark:bg-gray-900 border-2 border-gray-400 dark:border-gray-600 rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all duration-200 hover:border-gray-500 focus:scale-105"
            style={{ width: type === 'number' ? '60px' : type === 'currency' ? '80px' : '100px' }}
          />
        )}
        
        {/* Action Buttons - X-editable style */}
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            className="h-7 w-7 flex items-center justify-center bg-transparent hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 border-transparent transition-all duration-200 ease-in-out hover:scale-125 active:scale-95 hover:rotate-12"
            title={isTextarea ? "Save (Ctrl+Enter)" : "Save (Enter)"}
          >
            <Check className="w-4 h-4 transition-transform duration-200" />
          </button>
          <button
            onClick={handleCancel}
            className="h-7 w-7 flex items-center justify-center bg-transparent hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border-transparent transition-all duration-200 ease-in-out hover:scale-125 active:scale-95 hover:rotate-12"
            title="Cancel (Esc)"
          >
            <X className="w-4 h-4 transition-transform duration-200" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-gray-800/30 dark:hover:bg-gray-700/30 hover:text-gray-100 dark:hover:text-gray-200 rounded px-2 py-1 transition-all duration-300 ease-in-out text-center block border border-transparent hover:border-gray-600 dark:hover:border-gray-500 hover:shadow-sm hover:scale-105 active:scale-95"
      style={{ fontSize: '10px' }}
      title="Click to edit"
    >
      {displayValue}
    </span>
  );
}
