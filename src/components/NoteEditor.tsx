import { useCallback } from 'react';
import { SpeechButton } from './SpeechButton';

interface NoteEditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
}

export function NoteEditor({ title, content, onTitleChange, onContentChange }: NoteEditorProps) {
  const handleSpeechTranscript = useCallback((text: string) => {
    onContentChange(content + (content ? '\n' : '') + text);
  }, [content, onContentChange]);

  return (
    <div className="editor note-editor">
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
        <label htmlFor="content">
          內容
          <SpeechButton onTranscript={handleSpeechTranscript} />
        </label>
        <textarea
          id="content"
          className="textarea"
          placeholder="輸入內容..."
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          rows={12}
        />
      </div>
    </div>
  );
}
