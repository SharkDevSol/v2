import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './Dashboard.css';

function Dashboard({ credentials, onLogout }) {
  const [testNotification, setTestNotification] = useState('');

  const handleTestNotification = async () => {
    try {
      await invoke('show_notification', {
        title: 'Test Notification',
        body: testNotification || 'This is a test notification from Skoolific Admin'
      });
      setTestNotification('');
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Skoolific Admin</h1>
          <span className="branch-badge">Branch: {credentials.branch_code}</span>
        </div>
        <div className="header-right">
          <span className="user-info">Welcome, {credentials.username}</span>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome to Skoolific V2 Desktop App</h2>
          <p>This is the native desktop application for school administrators.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>🔐 Secure Credentials</h3>
            <p>Your credentials are stored securely in Windows Credential Manager</p>
            <p className="feature-status">✅ Active</p>
          </div>

          <div className="feature-card">
            <h3>🔔 Native Notifications</h3>
            <p>Receive desktop notifications for important events</p>
            <div className="notification-test">
              <input
                type="text"
                placeholder="Test notification message"
                value={testNotification}
                onChange={(e) => setTestNotification(e.target.value)}
              />
              <button onClick={handleTestNotification}>Send Test</button>
            </div>
          </div>

          <div className="feature-card">
            <h3>⚡ Offline Support</h3>
            <p>Work offline and sync when connection is restored</p>
            <p className="feature-status">🚧 Coming Soon</p>
          </div>

          <div className="feature-card">
            <h3>📊 Full System Access</h3>
            <p>Complete school management capabilities</p>
            <p className="feature-status">🚧 Coming Soon</p>
          </div>
        </div>

        <div className="info-section">
          <h3>Next Steps</h3>
          <ul>
            <li>✅ Tauri desktop app initialized</li>
            <li>✅ Secure credential storage implemented</li>
            <li>✅ Native notifications working</li>
            <li>🚧 Integrate with existing React admin app (APP/)</li>
            <li>🚧 Add system tray integration</li>
            <li>🚧 Implement auto-update mechanism</li>
          </ul>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>Skoolific V2.0.0 | Desktop Application</p>
      </footer>
    </div>
  );
}

export default Dashboard;
