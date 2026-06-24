import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const API_BASE = 'http://localhost:5052';
const WEB_ADMIN_URL = 'http://localhost:5053';

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await onLogin(username, password, branchCode);
    if (!result.success) setError(result.error);
    setLoading(false);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Skoolific</h1>
        <p className="login-subtitle">Admin Portal</p>
        <form onSubmit={handleSubmit}>
          <input placeholder="Branch Code" value={branchCode} onChange={e => setBranchCode(e.target.value)} disabled={loading} />
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} disabled={loading} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [webviewUrl, setWebviewUrl] = useState(null);

  const openWebAdmin = () => {
    const token = user?.token || '';
    const branch = user?.branchCode || '';
    setWebviewUrl(`${WEB_ADMIN_URL}?token=${token}&branch=${branch}&auto=1`);
  };

  if (webviewUrl) {
    return (
      <div className="webview-screen">
        <div className="webview-header">
          <button onClick={() => setWebviewUrl(null)} className="back-btn">← Back</button>
          <span className="webview-title">Skoolific Admin</span>
          <button onClick={() => window.open(webviewUrl, '_system')} className="external-btn">↗</button>
        </div>
        <iframe src={webviewUrl} className="webview-iframe" title="Skoolific Admin" />
      </div>
    );
  }

  return (
    <div className="dashboard-screen">
      <div className="dash-header">
        <div>
          <h2>Welcome, {user?.username}</h2>
          <p className="branch-label">Branch: {user?.branchCode}</p>
        </div>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
      <div className="dash-body">
        <div className="welcome-card">
          <h3>Skoolific Admin Mobile</h3>
          <p>Access all school management features through the web admin interface.</p>
          <button onClick={openWebAdmin} className="launch-btn">Launch Web Admin</button>
        </div>
        <div className="features-grid">
          {[
            { icon: '📊', label: 'Dashboard', color: '#6366f1' },
            { icon: '👨‍🎓', label: 'Students', color: '#22c55e' },
            { icon: '👥', label: 'Staff', color: '#f59e0b' },
            { icon: '💰', label: 'Finance', color: '#10b981' },
            { icon: '📅', label: 'Schedule', color: '#3b82f6' },
            { icon: '📋', label: 'Marks', color: '#ec4899' },
          ].map((f, i) => (
            <div key={i} className="feature-item" style={{ borderTopColor: f.color }}>
              <span className="feature-icon">{f.icon}</span>
              <span className="feature-label">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Skoolific Admin...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  return <Dashboard user={user} onLogout={() => {}} />;
}

function App() {
  return (
    <AuthProvider apiBaseUrl={API_BASE}>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
