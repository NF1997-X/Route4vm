import React, { useEffect, useRef, useState } from 'react';

interface EditableRichTextProps {
  value: string; // HTML
  onSave: (newHtml: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
}

export function EditableRichText({ value, onSave, onCancel, placeholder = 'Enter text...', className = '' }: EditableRichTextProps) {
  const [editing, setEditing] = useState(false);
  const [html, setHtml] = useState(value || '');
  const editorRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setHtml(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!editing) return;
      if (editorRef.current && !editorRef.current.contains(e.target as Node) && toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        // click outside -> cancel edit
        handleCancel();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editing]);

  const startEdit = () => {
    setEditing(true);
    // focus next tick
    setTimeout(() => {
      editorRef.current?.focus();
      placeCaretAtEnd(editorRef.current);
    }, 0);
  };

  const handleSave = () => {
    const content = editorRef.current?.innerHTML ?? html;
    setHtml(content);
    onSave(content);
    setEditing(false);
  };

  const handleCancel = () => {
    // restore original value
    if (editorRef.current) editorRef.current.innerHTML = value || '';
    setHtml(value || '');
    setEditing(false);
    onCancel?.();
  };

  const exec = (command: string, valueParam?: string) => {
    // execCommand is deprecated but still widely supported; for a small inline editor it's acceptable
    document.execCommand(command, false, valueParam);
    // update state
    setHtml(editorRef.current?.innerHTML ?? '');
  };

  const insertLink = () => {
    const url = prompt('Enter URL', 'https://');
    if (url) {
      exec('createLink', url);
    }
  };

  return (
    <div className={`editable-rich-text ${className}`}>
      {!editing ? (
        <div onClick={startEdit} className="cursor-text">
          {html ? (
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <div className="text-muted-foreground italic">{placeholder}</div>
          )}
        </div>
      ) : (
        <div className="relative">
          <div ref={toolbarRef} className="flex gap-2 mb-2 items-center bg-transparent">
            <button type="button" className="btn-glass p-2 text-sm" onClick={() => exec('bold')} title="Bold"><strong>B</strong></button>
            <button type="button" className="btn-glass p-2 text-sm" onClick={() => exec('italic')} title="Italic"><em>I</em></button>
            <button type="button" className="btn-glass p-2 text-sm" onClick={() => exec('underline')} title="Underline"><u>U</u></button>
            <button type="button" className="btn-glass p-2 text-sm" onClick={() => exec('insertUnorderedList')} title="Bullet list">• List</button>
            <button type="button" className="btn-glass p-2 text-sm" onClick={() => exec('insertOrderedList')} title="Numbered list">1. List</button>
            <button type="button" className="btn-glass p-2 text-sm" onClick={insertLink} title="Insert link">🔗</button>
            <button type="button" className="btn-glass p-2 text-sm" onClick={() => exec('formatBlock', '<H3>')} title="Heading">H</button>
            <div className="ml-auto flex gap-2">
              <button type="button" className="btn-glass p-2 text-sm" onClick={handleCancel}>Cancel</button>
              <button type="button" className="btn-glass p-2 text-sm bg-blue-600 text-white" onClick={handleSave}>Save</button>
            </div>
          </div>

          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="glass-input min-h-[80px] p-3 prose max-w-none overflow-auto"
            onInput={() => setHtml(editorRef.current?.innerHTML ?? '')}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
    </div>
  );
}

function placeCaretAtEnd(el: HTMLElement | null) {
  if (!el) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

export default EditableRichText;
