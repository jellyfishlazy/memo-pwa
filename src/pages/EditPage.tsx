import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getNoteById, updateNote, deleteNote } from '../db';
import type { Note, ChecklistItem } from '../types';
import { NoteEditor } from '../components/NoteEditor';
import { ChecklistEditor } from '../components/ChecklistEditor';
import { useDebounce } from '../hooks/useDebounce';
import { useToast } from '../components/Toast';

export function EditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const noteId = id ? parseInt(id, 10) : null;
  const { showToast } = useToast();

  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load note data
  useEffect(() => {
    const loadNote = async () => {
      if (noteId === null) {
        navigate('/');
        return;
      }

      try {
        const data = await getNoteById(noteId);
        if (!data) {
          showToast('找不到該筆記', 'warning');
          navigate('/');
          return;
        }
        
        setNote(data);
        setTitle(data.title);
        setContent(data.content || '');
        setItems(data.items || []);
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load note:', error);
        showToast('載入筆記失敗', 'error');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadNote();
  }, [noteId, navigate, showToast]);

  // Auto-save with debounce
  const saveNote = useCallback(async () => {
    if (!note || noteId === null || !isInitialized) return;

    setIsSaving(true);
    try {
      const updates: Partial<Note> = {
        title,
        content: note.type === 'note' ? content : undefined,
        items: note.type === 'checklist' ? items : undefined
      };
      
      await updateNote(noteId, updates);
    } catch (error) {
      console.error('Failed to save note:', error);
      showToast('儲存失敗，請重試', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [note, noteId, title, content, items, isInitialized, showToast]);

  const debouncedSave = useDebounce(saveNote, 500);

  useEffect(() => {
    if (isInitialized) {
      debouncedSave();
    }
  }, [title, content, items, debouncedSave, isInitialized]);

  const handleBack = () => {
    navigate('/');
  };

  const handleDelete = async () => {
    if (noteId === null) return;
    
    if (window.confirm('確定要刪除這個筆記嗎？')) {
      try {
        await deleteNote(noteId);
        showToast('筆記已刪除', 'success');
        navigate('/');
      } catch (error) {
        console.error('Failed to delete note:', error);
        showToast('刪除失敗，請重試', 'error');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="page edit-page">
        <div className="loading">載入中...</div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className="page edit-page">
      <header className="page-header">
        <button type="button" className="btn-back" onClick={handleBack}>
          ← 返回
        </button>
        <h1>{note.type === 'note' ? '編輯記事' : '編輯清單'}</h1>
        <div className="header-actions">
          <span className={`save-status ${isSaving ? 'saving' : ''}`}>
            {isSaving ? '儲存中...' : '已儲存'}
          </span>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
          >
            🗑️ 刪除
          </button>
        </div>
      </header>

      {note.type === 'note' ? (
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
