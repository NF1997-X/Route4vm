import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Check, 
  X, 
  Edit3, 
  Bold, 
  Italic, 
  Underline,
  List,
  ListOrdered,
  Link,
  Type
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineEditorProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  type?: "text" | "textarea" | "wysiwyg";
  className?: string;
  disabled?: boolean;
  multiline?: boolean;
}

export function InlineEditor({
  value,
  onSave,
  placeholder = "Click to edit",
  type = "text",
  className,
  disabled = false,
  multiline = false
}: InlineEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      if (type === "wysiwyg" && editorRef.current) {
        editorRef.current.focus();
      } else {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && type !== "textarea" && type !== "wysiwyg") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const applyFormatting = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const toggleBold = () => {
    applyFormatting("bold");
    setIsBold(!isBold);
  };

  const toggleItalic = () => {
    applyFormatting("italic");
    setIsItalic(!isItalic);
  };

  const toggleUnderline = () => {
    applyFormatting("underline");
    setIsUnderline(!isUnderline);
  };

  const insertList = () => {
    applyFormatting("insertUnorderedList");
  };

  const insertOrderedList = () => {
    applyFormatting("insertOrderedList");
  };

  const handleWysiwygInput = () => {
    if (editorRef.current) {
      setEditValue(editorRef.current.innerHTML);
    }
  };

  const displayValue = value || placeholder;
  const isEmpty = !value || value.trim() === "";

  if (disabled) {
    return (
      <span className={cn("inline-block", className)}>
        {displayValue}
      </span>
    );
  }

  if (!isEditing) {
    return (
      <div
        className={cn(
          "group inline-flex items-center gap-2 cursor-pointer glass-input border-transparent hover:border-glass-border transition-all duration-200 px-2 py-1 rounded-sm",
          isEmpty && "text-muted-foreground italic",
          className
        )}
        onClick={() => setIsEditing(true)}
      >
        <span className={cn(
          "min-w-0 break-words",
          type === "wysiwyg" && "prose prose-sm max-w-none"
        )}>
          {type === "wysiwyg" ? (
            <div dangerouslySetInnerHTML={{ __html: displayValue }} />
          ) : (
            displayValue
          )}
        </span>
        <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
      </div>
    );
  }

  if (type === "wysiwyg") {
    return (
      <div className="space-y-2">
        {/* Toolbar */}
        <div className="glass-card flex items-center gap-1 p-2 border border-glass-border rounded-sm">
          <Button
            size="sm"
            variant="ghost"
            className={cn("h-6 w-6 p-0", isBold && "bg-primary text-primary-foreground")}
            onClick={toggleBold}
            type="button"
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn("h-6 w-6 p-0", isItalic && "bg-primary text-primary-foreground")}
            onClick={toggleItalic}
            type="button"
          >
            <Italic className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn("h-6 w-6 p-0", isUnderline && "bg-primary text-primary-foreground")}
            onClick={toggleUnderline}
            type="button"
          >
            <Underline className="h-3 w-3" />
          </Button>
          <div className="w-px h-4 bg-border mx-1" />
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={insertList}
            type="button"
          >
            <List className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={insertOrderedList}
            type="button"
          >
            <ListOrdered className="h-3 w-3" />
          </Button>
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          className="glass-input min-h-[100px] p-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/50 prose prose-sm max-w-none"
          contentEditable
          dangerouslySetInnerHTML={{ __html: editValue }}
          onInput={handleWysiwygInput}
          onKeyDown={handleKeyDown}
          style={{ whiteSpace: 'pre-wrap' }}
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            className="glass-button h-7 px-3"
          >
            <Check className="h-3 w-3 mr-1" />
            {isLoading ? "Saving..." : "Save"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
            className="h-7 px-3"
          >
            <X className="h-3 w-3 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  const InputComponent = multiline || type === "textarea" ? Textarea : Input;

  return (
    <div className="space-y-2">
      <InputComponent
        ref={inputRef as any}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("glass-input", className)}
        rows={type === "textarea" ? 4 : undefined}
      />
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isLoading}
          className="glass-button h-7 px-3"
        >
          <Check className="h-3 w-3 mr-1" />
          {isLoading ? "Saving..." : "Save"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isLoading}
          className="h-7 px-3"
        >
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}

// Popover version for space-constrained areas
export function InlineEditorPopover({
  value,
  onSave,
  placeholder = "Click to edit",
  className,
  disabled = false,
  children
}: Omit<InlineEditorProps, 'type'> & { children?: React.ReactNode }) {
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [open]);

  const handleSave = async () => {
    if (editValue === value) {
      setOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(editValue);
      setOpen(false);
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setOpen(false);
  };

  const displayValue = value || placeholder;
  const isEmpty = !value || value.trim() === "";

  if (disabled) {
    return children || <span className={className}>{displayValue}</span>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <div className={cn(
            "group inline-flex items-center gap-2 cursor-pointer glass-input border-transparent hover:border-glass-border transition-all duration-200 px-2 py-1 rounded-sm",
            isEmpty && "text-muted-foreground italic",
            className
          )}>
            <span className="min-w-0 break-words">{displayValue}</span>
            <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
          </div>
        )}
      </PopoverTrigger>
      <PopoverContent className="glass-card w-80 p-3" align="start">
        <div className="space-y-3">
          <Textarea
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className="glass-input resize-none"
            rows={4}
          />
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isLoading}
              className="glass-button h-7 px-3 flex-1"
            >
              <Check className="h-3 w-3 mr-1" />
              {isLoading ? "Saving..." : "Save"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={isLoading}
              className="h-7 px-3"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}