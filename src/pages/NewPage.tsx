import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createNote } from '../db';
import type { NoteType, ChecklistItem } from '../types';
import { NoteEditor } from '../components/NoteEditor';
import { ChecklistEditor } from '../components/ChecklistEditor';
import { useDebounce } from '../hooks/useDebounce';

export function NewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') as NoteType | null;
  
  const [type, setType] = useState<NoteType>(typeParam || 'note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [noteId, setNoteId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save with debounce
  const saveNote = useCallback(async () => {
    if (noteId !== null) return; // Already saved, will redirect
    
    const hasContent = type === 'note' 
      ? (title || content)
      : (title || items.length > 0);
    
    if (!hasContent) return;

    setIsSaving(true);
    try {
      const now = new Date();
      const newNote = {
        type,
        title,
        content: type === 'note' ? content : undefined,
        items: type === 'checklist' ? items : undefined,
        createdAt: now,
        updatedAt: now
      };
      
      const id = await createNote(newNote);
      setNoteId(id);
      navigate(`/edit/${id}`, { replace: true });
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  }, [type, title, content, items, noteId, navigate]);

  const debouncedSave = useDebounce(saveNote, 500);

  useEffect(() => {
    debouncedSave();
  }, [title, content, items, debouncedSave]);

  useEffect(() => {
    if (typeParam && (typeParam === 'note' || typeParam === 'checklist')) {
      setType(typeParam);
    }
  }, [typeParam]);

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="page edit-page">
      <header className="page-header">
        <button type="button" className="btn-back" onClick={handleBack}>
          ← 返回
        </button>
        <h1>{type === 'note' ? '新增記事' : '新增清單'}</h1>
        <span className={`save-status ${isSaving ? 'saving' : ''}`}>
          {isSaving ? '儲存中...' : ''}
        </span>
      </header>

      {!typeParam && (
        <div className="type-selector">
          <button
            type="button"
            className={`type-btn ${type === 'note' ? 'active' : ''}`}
            onClick={() => setType('note')}
          >
            📝 記事
          </button>
          <button
            type="button"
            className={`type-btn ${type === 'checklist' ? 'active' : ''}`}
            onClick={() => setType('checklist')}
          >
            ☑️ 清單
          </button>
        </div>
      )}

      {type === 'note' ? (
        <NoteEditor
          title={title}
          content={content}
          onTitleChange={setTitle}
          onContentChange={setContent}
        />
      ) : (
        <ChecklistEditor
          title={title}
          items={items}
          onTitleChange={setTitle}
          onItemsChange={setItems}
        />
      )}
    </div>
  );
}
