import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="offline-indicator">
      <span className="offline-icon">📴</span>
      <span>目前處於離線狀態</span>
    </div>
  );
}
