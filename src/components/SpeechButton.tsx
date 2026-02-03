import { useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface SpeechButtonProps {
  onTranscript: (text: string) => void;
}

export function SpeechButton({ onTranscript }: SpeechButtonProps) {
  const { isSupported, isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, onTranscript, resetTranscript]);

  if (!isSupported) {
    return (
      <button 
        type="button" 
        className="speech-btn speech-btn-disabled" 
        disabled
        title="此瀏覽器不支援語音輸入"
      >
        🎤
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`speech-btn ${isListening ? 'speech-btn-active' : ''}`}
      onClick={isListening ? stopListening : startListening}
      title={isListening ? '點擊停止' : '點擊開始語音輸入'}
    >
      {isListening ? '🔴' : '🎤'}
    </button>
  );
}
