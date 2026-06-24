import { useOnlineStatus } from '../../hooks/useOnlineStatus';

const OfflineBanner = () => {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#f59e0b', color: '#fff', padding: '10px 16px',
      textAlign: 'center', fontSize: 14, fontWeight: 600, zIndex: 9999
    }}>
      You are offline. Changes will be saved and synced when connection is restored.
    </div>
  );
};

export default OfflineBanner;
