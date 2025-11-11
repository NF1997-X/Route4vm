import { useState, useEffect, useRef } from "react";

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

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
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
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const getPlaceholder = () => {
    if (dataKey === 'latitude') {
      return "e.g. 3.139003";
    }
    if (dataKey === 'longitude') {
      return "e.g. 101.686855";
    }
    if (type === 'currency') {
      return "0.00";
    }
    if (type === 'number') {
      return "Enter number";
    }
    return "Enter text";
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type === 'number' || type === 'currency' ? 'number' : 'text'}
        step={type === 'currency' ? '0.01' : undefined}
        value={type === 'currency' ? editValue.toString().replace(/[^0-9.]/g, '') : editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        placeholder={getPlaceholder()}
        className="w-full h-6 px-2 py-1 text-sm bg-white border border-blue-300 rounded focus:outline-none focus:border-blue-500"
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 transition-colors"
    >
      {value}
    </span>
  );
}
