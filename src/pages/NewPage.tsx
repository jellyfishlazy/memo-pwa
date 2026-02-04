import { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createNote, updateNote } from '../db';
import type { NoteType, ChecklistItem, Note } from '../types';
import { NoteEditor } from '../components/NoteEditor';
import { ChecklistEditor } from '../components/ChecklistEditor';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../components/Toast';

export function NewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') as NoteType | null;
  const { showToast } = useToast();
  
  const [type, setType] = useState<NoteType>(typeParam || 'note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [noteId, setNoteId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // 用於追蹤是否正在儲存中，避免重複儲存
  const isSavingRef = useRef(false);

  // Auto-save with debounce - 不再導航，改為背景更新
  const saveNote = useCallback(async () => {
    // 避免重複儲存
    if (isSavingRef.current) return;
    
    const hasContent = type === 'note' 
      ? (title || content)
      : (title || items.length > 0);
    
    if (!hasContent) return;

    isSavingRef.current = true;
    setIsSaving(true);
    
    try {
      const now = new Date();
      
      if (noteId === null) {
        // 首次儲存：建立新筆記
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
        
        // 更新 URL 但不觸發導航（保持鍵盤開啟）
        window.history.replaceState(null, '', `/edit/${id}`);
      } else {
        // 後續儲存：更新現有筆記
        const updates: Partial<Note> = {
          title,
          content: type === 'note' ? content : undefined,
          items: type === 'checklist' ? items : undefined
        };
        
        await updateNote(noteId, updates);
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      showToast('儲存筆記失敗，請重試', 'error');
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
  }, [type, title, content, items, noteId, showToast]);

  const debouncedSave = useDebounce(saveNote, 1000); // 增加到 1 秒

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
        {isSaving && (
          <span className="save-status saving">儲存中...</span>
        )}
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
