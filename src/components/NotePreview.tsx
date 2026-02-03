import { Link } from 'react-router-dom';
import type { Note } from '../types';

interface NotePreviewProps {
  note: Note;
  onDelete: (id: number) => void;
}

function formatDate(date: Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getPreviewTitle(note: Note): string {
  if (note.title) return note.title;
  
  if (note.type === 'note' && note.content) {
    return note.content.substring(0, 20) + (note.content.length > 20 ? '...' : '');
  }
  
  if (note.type === 'checklist' && note.items && note.items.length > 0) {
    const firstItem = note.items[0].text;
    return firstItem.substring(0, 20) + (firstItem.length > 20 ? '...' : '');
  }
  
  return '無標題';
}

function getPreviewContent(note: Note): string {
  if (note.type === 'note') {
    const content = note.content || '';
    return content.substring(0, 50) + (content.length > 50 ? '...' : '');
  }
  
  if (note.type === 'checklist' && note.items) {
    const completed = note.items.filter(item => item.checked).length;
    const total = note.items.length;
    return `已完成 ${completed}/${total} 項`;
  }
  
  return '';
}

export function NotePreview({ note, onDelete }: NotePreviewProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (note.id !== undefined && window.confirm('確定要刪除這個筆記嗎？')) {
      onDelete(note.id);
    }
  };

  return (
    <Link to={`/edit/${note.id}`} className="note-card">
      <div className="note-card-header">
        <span className={`note-type-badge ${note.type}`}>
          {note.type === 'note' ? '📝 記事' : '☑️ 清單'}
        </span>
        <button
          type="button"
          className="btn-delete-card"
          onClick={handleDelete}
          aria-label="刪除筆記"
        >
          🗑️
        </button>
      </div>
      <h3 className="note-card-title">{getPreviewTitle(note)}</h3>
      <p className="note-card-preview">{getPreviewContent(note)}</p>
      <time className="note-card-time">{formatDate(note.updatedAt)}</time>
    </Link>
  );
}
