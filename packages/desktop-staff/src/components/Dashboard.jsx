import { useState } from 'react';
import './Dashboard.css';

const STAFF_MODULES = [
  { id: 'profile', label: 'My Profile', icon: '👤', path: '/app/staff', color: '#6366f1' },
  { id: 'marks', label: 'Mark Lists', icon: '📋', path: '/staff/mark-list-staff', color: '#ec4899' },
  { id: 'attendance', label: 'Attendance', icon: '✅', path: '/staff/attendance-staff', color: '#22c55e' },
  { id: 'exam', label: 'Exam Creation', icon: '📝', path: '/staff/exam-creation-staff', color: '#f59e0b' },
  { id: 'evaluation', label: 'Evaluation', icon: '📊', path: '/staff/evaluation-staff-control', color: '#8b5cf6' },
  { id: 'communication', label: 'Communication', icon: '💬', path: '/staff/communication-staff', color: '#3b82f6' },
  { id: 'posts', label: 'Posts', icon: '📰', path: '/staff/post-staff-new', color: '#10b981' },
  { id: 'schedule', label: 'Schedule', icon: '📅', path: '/schedule', color: '#14b8a6' },
];

function Dashboard({ credentials, session, onLogout }) {
  const [activeModule, setActiveModule] = useState(null);

  const webUrl = activeModule
    ? `http://localhost:5053${activeModule.path}?token=${session?.token || ''}&branch=${credentials?.branch_code || ''}&auto=1`
    : null;

  const openInBrowser = (url) => window.open(url, '_blank');

  return (
    <div className="dash-container">
      <header className="dash-header">
        <div className="header-left">
          <h1>Skoolific Staff</h1>
          <span className="branch-badge">{credentials?.branch_code}</span>
        </div>
        <div className="header-right">
          <span>{credentials?.username}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dash-body">
        <nav className="side-nav">
          <h4 className="nav-title">Modules</h4>
          {STAFF_MODULES.map(mod => (
            <button
              key={mod.id}
              className={`nav-btn ${activeModule?.id === mod.id ? 'active' : ''}`}
              onClick={() => setActiveModule(mod)}
              style={{ '--accent': mod.color }}
            >
              <span>{mod.icon}</span>
              <span>{mod.label}</span>
            </button>
          ))}
        </nav>

        <main className="dash-main">
          {activeModule ? (
            <div className="module-view">
              <div className="module-header">
                <h2>{activeModule.icon} {activeModule.label}</h2>
                <button className="browser-btn" onClick={() => openInBrowser(webUrl)}>↗ Open in Browser</button>
              </div>
              <iframe src={webUrl} className="module-frame" title={activeModule.label} />
            </div>
          ) : (
            <div className="welcome-screen">
              <h2>Welcome to Skoolific Staff</h2>
              <p>Select a module from the sidebar.</p>
              <div className="quick-grid">
                {STAFF_MODULES.slice(0, 6).map(mod => (
                  <button key={mod.id} className="quick-card" onClick={() => setActiveModule(mod)} style={{ '--accent': mod.color }}>
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
