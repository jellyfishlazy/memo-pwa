import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllNotes, searchNotes, deleteNote } from '../db';
import { NotePreview } from '../components/NotePreview';
import { useDebounceValue } from '../hooks/useDebounceValue';
import { useToast } from '../components/Toast';
import type { Note } from '../types';

export function ListPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const { showToast } = useToast();
  
  // Debounce 搜尋查詢，避免每次輸入都觸發搜尋
  const debouncedSearchQuery = useDebounceValue(searchQuery, 300);

  const loadNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = debouncedSearchQuery 
        ? await searchNotes(debouncedSearchQuery)
        : await getAllNotes();
      setNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
      showToast('載入筆記失敗，請重試', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, showToast]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteNote(id);
      showToast('筆記已刪除', 'success');
      await loadNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
      showToast('刪除失敗，請重試', 'error');
    }
  }, [loadNotes, showToast]);

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
          aria-label="搜尋筆記"
        />
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
              <p>點擊右下角的 + 按鈕開始新增！</p>
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

      {/* 浮動新增按鈕 */}
      <div className="fab-container">
        {showAddMenu && (
          <div className="fab-menu">
            <Link 
              to="/new?type=note" 
              className="fab-menu-item"
              onClick={() => setShowAddMenu(false)}
            >
              <span className="fab-menu-icon">📝</span>
              <span className="fab-menu-label">新增記事</span>
            </Link>
            <Link 
              to="/new?type=checklist" 
              className="fab-menu-item"
              onClick={() => setShowAddMenu(false)}
            >
              <span className="fab-menu-icon">☑️</span>
              <span className="fab-menu-label">新增清單</span>
            </Link>
          </div>
        )}
        <button
          type="button"
          className={`fab ${showAddMenu ? 'fab-active' : ''}`}
          onClick={() => setShowAddMenu(!showAddMenu)}
          aria-label="新增筆記"
          aria-expanded={showAddMenu}
        >
          <span className="fab-icon">+</span>
        </button>
      </div>

      {/* 背景遮罩 */}
      {showAddMenu && (
        <div 
          className="fab-overlay" 
          onClick={() => setShowAddMenu(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
