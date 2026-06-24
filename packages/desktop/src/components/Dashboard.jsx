import { useState } from 'react';
import './Dashboard.css';

const MODULES = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard', color: '#6366f1' },
  { id: 'students', label: 'Students', icon: '👨‍🎓', path: '/list-student', color: '#22c55e' },
  { id: 'staff', label: 'Staff', icon: '👥', path: '/list-staff', color: '#f59e0b' },
  { id: 'finance', label: 'Finance', icon: '💰', path: '/finance', color: '#10b981' },
  { id: 'hr', label: 'HR', icon: '👔', path: '/hr', color: '#8b5cf6' },
  { id: 'schedule', label: 'Schedule', icon: '📅', path: '/schedule', color: '#3b82f6' },
  { id: 'marks', label: 'Mark Lists', icon: '📋', path: '/create-mark-list', color: '#ec4899' },
  { id: 'ai', label: 'AI Tools', icon: '🤖', path: '/ai-lesson', color: '#14b8a6' },
  { id: 'reports', label: 'Reports', icon: '📈', path: '/reports/students', color: '#f97316' },
  { id: 'tasks', label: 'Setup Tasks', icon: '⚙️', path: '/tasks', color: '#6b7280' },
];

function Dashboard({ credentials, session, onLogout }) {
  const [activeModule, setActiveModule] = useState(null);
  const webUrl = `http://localhost:5053${activeModule?.path || '/dashboard'}?token=${session?.token || ''}&branch=${credentials?.branch_code || ''}&auto=1`;

  const openInBrowser = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Skoolific Admin</h1>
          <span className="branch-badge">Branch: {credentials?.branch_code}</span>
        </div>
        <div className="header-right">
          <span className="user-info">{credentials?.username}</span>
          <button onClick={onLogout} className="logout-button">Logout</button>
        </div>
      </header>

      <div className="dashboard-body">
        <nav className="sidebar">
          <h3 className="sidebar-title">Modules</h3>
          {MODULES.map(mod => (
            <button
              key={mod.id}
              className={`module-btn ${activeModule?.id === mod.id ? 'active' : ''}`}
              onClick={() => setActiveModule(mod)}
              style={{ '--accent': mod.color }}
            >
              <span className="module-icon">{mod.icon}</span>
              <span className="module-label">{mod.label}</span>
            </button>
          ))}
          <div className="sidebar-spacer" />
          <p className="sidebar-hint">
            Modules open in your browser for full functionality.
          </p>
        </nav>

        <main className="dashboard-main">
          {activeModule ? (
            <div className="module-view">
              <div className="module-header">
                <h2>{activeModule.icon} {activeModule.label}</h2>
                <button
                  className="open-browser-btn"
                  onClick={() => openInBrowser(webUrl)}
                >
                  ↗ Open in Browser
                </button>
              </div>
              <iframe
                src={webUrl}
                className="module-iframe"
                title={activeModule.label}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              />
            </div>
          ) : (
            <div className="welcome-section">
              <h2>Welcome to Skoolific V2 Desktop</h2>
              <p>Select a module from the sidebar to get started.</p>
              <div className="quick-grid">
                {MODULES.slice(0, 6).map(mod => (
                  <button
                    key={mod.id}
                    className="quick-card"
                    onClick={() => setActiveModule(mod)}
                    style={{ '--accent': mod.color }}
                  >
                    <span className="quick-icon">{mod.icon}</span>
                    <span className="quick-label">{mod.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
