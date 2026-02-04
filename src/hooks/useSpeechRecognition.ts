import { useState, useCallback, useRef, useEffect } from 'react';

type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';
type ErrorType = 'permission' | 'no-speech' | 'network' | 'not-allowed' | 'unknown' | null;

interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  permissionState: PermissionState;
  error: ErrorType;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
  requestPermission: () => Promise<boolean>;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');
  const [error, setError] = useState<ErrorType>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // 檢查瀏覽器支援度
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setPermissionState('unsupported');
      return;
    }

    setIsSupported(true);

    // 初始化 SpeechRecognition
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'zh-TW';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
      } else if (interimTranscript) {
        setTranscript(interimTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      
      // 根據錯誤類型設定狀態
      switch (event.error) {
        case 'not-allowed':
        case 'permission-denied':
          setPermissionState('denied');
          setError('permission');
          break;
        case 'no-speech':
          setError('no-speech');
          break;
        case 'network':
          setError('network');
          break;
        default:
          setError('unknown');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current = recognition;

    // 檢查現有的麥克風權限狀態
    checkPermissionState();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // 檢查麥克風權限狀態
  const checkPermissionState = useCallback(async () => {
    try {
      // 使用 Permissions API 檢查（如果支援）
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setPermissionState(result.state as PermissionState);
        
        // 監聽權限變更
        result.addEventListener('change', () => {
          setPermissionState(result.state as PermissionState);
        });
      }
    } catch {
      // Permissions API 不支援 microphone 查詢（例如 Firefox）
      // 保持 'prompt' 狀態，讓使用者嘗試
    }
  }, []);

  // 請求麥克風權限
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      // 使用 getUserMedia 請求麥克風權限
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // 取得權限後立即停止所有音軌
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionState('granted');
      setError(null);
      return true;
    } catch (err) {
      const error = err as DOMException;
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionState('denied');
        setError('permission');
      } else {
        setError('unknown');
      }
      return false;
    }
  }, []);

  // 開始語音辨識
  const startListening = useCallback(async () => {
    if (!recognitionRef.current || isListening) return;

    setTranscript('');
    setError(null);

    // 如果權限尚未授予，先請求權限
    if (permissionState !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }

    try {
      recognitionRef.current.start();
    } catch {
      // 可能已經在執行中，嘗試重新開始
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          recognitionRef.current?.start();
        }, 100);
      } catch {
        setError('unknown');
      }
    }
  }, [isListening, permissionState, requestPermission]);

  // 停止語音辨識
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  // 重置轉錄文字
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    permissionState,
    error,
    startListening,
    stopListening,
    resetTranscript,
    requestPermission
  };
}
