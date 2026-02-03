import { useState, useCallback } from 'react';
import { SpeechButton } from './SpeechButton';
import type { ChecklistItem } from '../types';

interface ChecklistEditorProps {
  title: string;
  items: ChecklistItem[];
  onTitleChange: (title: string) => void;
  onItemsChange: (items: ChecklistItem[]) => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function ChecklistEditor({ title, items, onTitleChange, onItemsChange }: ChecklistEditorProps) {
  const [newItemText, setNewItemText] = useState('');

  const addItem = useCallback((text: string) => {
    if (!text.trim()) return;
    
    const newItem: ChecklistItem = {
      id: generateId(),
      text: text.trim(),
      checked: false,
      order: items.length
    };
    
    onItemsChange([...items, newItem]);
    setNewItemText('');
  }, [items, onItemsChange]);

  const handleAddItem = useCallback(() => {
    addItem(newItemText);
  }, [newItemText, addItem]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  }, [handleAddItem]);

  const toggleItem = useCallback((id: string) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    onItemsChange(updatedItems);
  }, [items, onItemsChange]);

  const deleteItem = useCallback((id: string) => {
    const updatedItems = items
      .filter(item => item.id !== id)
      .map((item, index) => ({ ...item, order: index }));
    onItemsChange(updatedItems);
  }, [items, onItemsChange]);

  const moveItem = useCallback((id: string, direction: 'up' | 'down') => {
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[newIndex];
    newItems[newIndex] = temp;
    
    const reorderedItems = newItems.map((item, i) => ({ ...item, order: i }));
    onItemsChange(reorderedItems);
  }, [items, onItemsChange]);

  const handleSpeechTranscript = useCallback((text: string) => {
    addItem(text);
  }, [addItem]);

  const updateItemText = useCallback((id: string, text: string) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, text } : item
    );
    onItemsChange(updatedItems);
  }, [items, onItemsChange]);

  return (
    <div className="editor checklist-editor">
      <div className="form-group">
        <label htmlFor="title">標題</label>
        <input
          type="text"
          id="title"
          className="input"
          placeholder="輸入標題..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>
          項目清單
          <SpeechButton onTranscript={handleSpeechTranscript} />
        </label>
        
        <div className="checklist-items">
          {items.map((item, index) => (
            <div key={item.id} className="checklist-item">
              <button
                type="button"
                className={`checkbox ${item.checked ? 'checked' : ''}`}
                onClick={() => toggleItem(item.id)}
                aria-label={item.checked ? '取消勾選' : '勾選'}
              >
                {item.checked ? '✓' : ''}
              </button>
              <input
                type="text"
                className={`checklist-item-text ${item.checked ? 'checked' : ''}`}
                value={item.text}
                onChange={(e) => updateItemText(item.id, e.target.value)}
              />
              <div className="checklist-item-actions">
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => moveItem(item.id, 'up')}
                  disabled={index === 0}
                  aria-label="上移"
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => moveItem(item.id, 'down')}
                  disabled={index === items.length - 1}
                  aria-label="下移"
                >
                  ▼
                </button>
                <button
                  type="button"
                  className="btn-icon btn-delete"
                  onClick={() => deleteItem(item.id)}
                  aria-label="刪除"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="add-item-row">
          <input
            type="text"
            className="input"
            placeholder="新增項目..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAddItem}
          >
            新增
          </button>
        </div>
      </div>
    </div>
  );
}
