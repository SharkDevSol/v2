import { useState, useEffect } from 'react';
import { tauriInvoke } from './tauri';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const API_BASE = 'http://localhost:5052';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkSavedCredentials(); }, []);

  const checkSavedCredentials = async () => {
    try {
      const savedUsername = localStorage.getItem('skoolific_username');
      if (savedUsername) {
        const creds = await tauriInvoke('get_credentials', { username: savedUsername });
        if (creds) {
          setCredentials({ username: creds.username, branch_code: creds.branch_code });
        }
      }
    } catch (error) {
      console.error('Error checking saved credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username, password, branchCode, rememberMe) => {
    const response = await fetch(`${API_BASE}/api/v2/branches/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, branchCode }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Login failed');
    }
    const data = await response.json();

    if (rememberMe) {
      await tauriInvoke('save_credentials', { username, password, branch_code: branchCode });
      localStorage.setItem('skoolific_username', username);
    }

    setSession({ token: data.token, user: data.user || data });
    setCredentials({ username, branch_code: branchCode });
    setIsAuthenticated(true);

    await tauriInvoke('show_notification', {
      title: 'Login Successful',
      body: `Welcome, ${username}!`
    });
  };

  const handleLogout = async () => {
    localStorage.removeItem('skoolific_username');
    setSession(null);
    setCredentials(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading Skoolific Admin...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard credentials={credentials} session={session} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
