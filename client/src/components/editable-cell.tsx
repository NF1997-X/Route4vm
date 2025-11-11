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

  // If editing a delivery cell and the stored value is empty, default to 'None'
  useEffect(() => {
    if (isEditing && (dataKey === 'delivery' || type === 'select')) {
      if (value === null || value === undefined || value === '') {
        setEditValue('None');
      }
    }
  }, [isEditing, dataKey, type, value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Only call select() if it's an input element, not a select dropdown
      if (inputRef.current.select && typeof inputRef.current.select === 'function') {
        inputRef.current.select();
      }
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
    // Special handling for delivery column with select dropdown
    if (dataKey === 'delivery' || type === 'select') {
      const deliveryOptions = options || ['None', 'Daily', 'Weekday', 'Alt 1', 'Alt 2'];

      return (
        <select
          ref={inputRef as any}
          value={editValue ?? 'None'}
          onChange={(e) => {
            setEditValue(e.target.value);
            handleSave();
          }}
          onKeyDown={handleKeyDown}
          className="w-full h-6 px-2 py-1 text-center bg-transparent border border-blue-300 rounded focus:outline-none focus:border-blue-500"
          style={{ fontSize: '10px' }}
          autoFocus
        >
          {deliveryOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

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
        className="w-full h-6 px-2 py-1 text-center bg-transparent border border-blue-300 rounded focus:outline-none focus:border-blue-500"
        style={{ fontSize: '10px' }}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 transition-colors text-center block"
      style={{ fontSize: '10px' }}
    >
      {value}
    </span>
  );
}
