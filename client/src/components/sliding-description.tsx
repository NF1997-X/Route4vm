import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import EditableRichText from "./editable-rich-text";
import { ChevronDown, ChevronRight } from "lucide-react";

interface SlidingDescriptionProps {
  value: string;
  onSave: (newValue: string) => void;
  isEditable?: boolean;
}

export function SlidingDescription({ value, onSave, isEditable = true }: SlidingDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editValue, setEditValue] = useState(value);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleChange = (newValue: string) => {
    setEditValue(newValue);
    onSave(newValue);
  };

  const displayValue = value || "No information available";
  const shouldShowToggle = displayValue.length > 50;
  const truncatedValue = shouldShowToggle && !isExpanded 
    ? displayValue.substring(0, 50) + "..." 
    : displayValue;

  if (!isEditable) {
    return (
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          {shouldShowToggle && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 flex-shrink-0 mt-0.5"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid="button-toggle-description"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          )}
          
          <div className="flex-1 min-w-0">
            <div 
              className="flex-1 cursor-pointer transition-all duration-300 ease-in-out opacity-90"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {(() => {
                const lines = (isExpanded ? displayValue : truncatedValue)
                  .split('\n')
                  .map(line => line.trim())
                  .filter(line => line.length > 0);
                
                // If multiple lines, display as description list
                if (lines.length > 1) {
                  return (
                    <dl className="space-y-2" style={{fontSize: '10px'}}>
                      {lines.map((line, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <dt className="w-20 flex-shrink-0 font-semibold text-blue-600 dark:text-blue-400">
                            Item {index + 1}
                          </dt>
                          <dd className="flex-1 text-gray-700 dark:text-gray-300 m-0">
                            {line}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  );
                }
                
                // Single line or no content
                return (
                  <div className="whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300" style={{fontSize: '10px'}}>
                    {isExpanded ? displayValue : truncatedValue}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
        {/* Sliding animation container */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {shouldShowToggle && isExpanded && (
            <div className="pl-8 text-muted-foreground" style={{fontSize: '10px'}}>
              Click to collapse
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <EditableRichText
        value={editValue}
        onSave={(newHtml) => {
          // store as HTML string (preserve simple formatting)
          setEditValue(newHtml);
          onSave(newHtml);
        }}
        onCancel={() => {
          // reset local value to prop
          setEditValue(value);
        }}
        placeholder="Enter information..."
        className="text-sm"
      />
    </div>
  );
}
