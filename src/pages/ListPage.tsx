import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllNotes, searchNotes, deleteNote } from '../db';
import { NotePreview } from '../components/NotePreview';
import type { Note } from '../types';

export function ListPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = searchQuery 
        ? await searchNotes(searchQuery)
        : await getAllNotes();
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteNote(id);
      await loadNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }, [loadNotes]);

  return (
    <div className="page list-page">
      <header className="page-header">
        <h1>📒 我的筆記</h1>
      </header>

      <div className="search-bar">
        <input
          type="search"
          className="input search-input"
          placeholder="搜尋筆記..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="add-buttons">
        <Link to="/new?type=note" className="btn btn-primary btn-large">
          📝 新增記事
        </Link>
        <Link to="/new?type=checklist" className="btn btn-secondary btn-large">
          ☑️ 新增清單
        </Link>
      </div>

      {isLoading ? (
        <div className="loading">載入中...</div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          {searchQuery ? (
            <p>找不到符合「{searchQuery}」的筆記</p>
          ) : (
            <>
              <p>還沒有任何筆記</p>
              <p>點擊上方按鈕開始新增！</p>
            </>
          )}
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map(note => (
            <NotePreview
              key={note.id}
              note={note}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
