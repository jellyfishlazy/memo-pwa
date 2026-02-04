import { useEffect, useState, useRef } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useToast } from './Toast';

interface SpeechButtonProps {
  onTranscript: (text: string) => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  permission: '請允許麥克風權限以使用語音輸入',
  'no-speech': '未偵測到語音，請再試一次',
  network: '網路連線問題，請檢查網路狀態',
  'not-allowed': '麥克風權限被拒絕，請在瀏覽器設定中開啟',
  unknown: '發生未知錯誤，請重試'
};

export function SpeechButton({ onTranscript }: SpeechButtonProps) {
  const { 
    isSupported, 
    isListening, 
    transcript, 
    permissionState,
    error,
    startListening, 
    stopListening, 
    resetTranscript 
  } = useSpeechRecognition();
  
  const { showToast } = useToast();
  const [showPermissionHint, setShowPermissionHint] = useState(false);
  
  // 追蹤上一次的錯誤，避免重複顯示
  const lastErrorRef = useRef<string | null>(null);

  // 處理轉錄結果
  useEffect(() => {
    if (transcript && !isListening) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, isListening, onTranscript, resetTranscript]);

  // 處理錯誤 - 只在錯誤改變時顯示一次
  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      const message = ERROR_MESSAGES[error] || ERROR_MESSAGES.unknown;
      showToast(message, error === 'no-speech' ? 'warning' : 'error');
    } else if (!error) {
      lastErrorRef.current = null;
    }
  }, [error, showToast]);

  // 關閉提示視窗
  const closePermissionHint = () => {
    setShowPermissionHint(false);
  };

  // 顯示提示視窗
  const openPermissionHint = () => {
    setShowPermissionHint(true);
  };

  // 處理點擊
  const handleClick = async () => {
    if (isListening) {
      stopListening();
      return;
    }

    // 如果權限被拒絕，只顯示 Toast，讓使用者點擊「?」按鈕查看詳細說明
    if (permissionState === 'denied') {
      showToast('麥克風權限被拒絕，點擊 ? 查看如何開啟', 'warning');
      return;
    }

    // 開始語音辨識（會自動請求權限）
    await startListening();
  };

  // 不支援的瀏覽器
  if (!isSupported) {
    return (
      <button 
        type="button" 
        className="speech-btn speech-btn-disabled" 
        disabled
        title="此瀏覽器不支援語音輸入（建議使用 Chrome 或 Edge）"
        aria-label="語音輸入不支援"
      >
        🎤
      </button>
    );
  }

  // 取得按鈕狀態
  const getButtonState = () => {
    if (isListening) {
      return {
        className: 'speech-btn speech-btn-active',
        icon: '🔴',
        title: '點擊停止錄音'
      };
    }
    if (permissionState === 'denied') {
      return {
        className: 'speech-btn speech-btn-denied',
        icon: '🎤',
        title: '麥克風權限被拒絕'
      };
    }
    return {
      className: 'speech-btn',
      icon: '🎤',
      title: '點擊開始語音輸入'
    };
  };

  const buttonState = getButtonState();

  return (
    <div className="speech-btn-container">
      <button
        type="button"
        className={buttonState.className}
        onClick={handleClick}
        title={buttonState.title}
        aria-label={buttonState.title}
        aria-pressed={isListening}
      >
        {buttonState.icon}
      </button>
      
      {/* 權限被拒絕時顯示幫助按鈕 */}
      {permissionState === 'denied' && (
        <button
          type="button"
          className="speech-help-btn"
          onClick={openPermissionHint}
          title="查看如何開啟麥克風權限"
          aria-label="查看如何開啟麥克風權限"
        >
          ?
        </button>
      )}
      
      {/* 權限說明視窗 - 獨立控制顯示 */}
      {showPermissionHint && (
        <div 
          className="permission-hint-overlay" 
          onClick={closePermissionHint}
          role="dialog"
          aria-modal="true"
          aria-labelledby="permission-hint-title"
        >
          <div className="permission-hint" onClick={e => e.stopPropagation()}>
            <button 
              type="button"
              className="permission-hint-close"
              onClick={closePermissionHint}
              aria-label="關閉"
            >
              ✕
            </button>
            <h3 id="permission-hint-title">如何開啟麥克風權限</h3>
            <div className="permission-hint-content">
              <p><strong>Android Chrome：</strong></p>
              <ol>
                <li>點擊網址列左側的 🔒 圖示</li>
                <li>選擇「網站設定」</li>
                <li>找到「麥克風」並設為「允許」</li>
                <li>重新整理頁面</li>
              </ol>
              <p><strong>iOS Safari：</strong></p>
              <ol>
                <li>前往「設定」→「Safari」</li>
                <li>選擇「麥克風」</li>
                <li>允許此網站使用麥克風</li>
              </ol>
              <p><strong>電腦瀏覽器：</strong></p>
              <ol>
                <li>點擊網址列左側的 🔒 圖示</li>
                <li>找到「麥克風」權限</li>
                <li>選擇「允許」</li>
              </ol>
            </div>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={closePermissionHint}
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
