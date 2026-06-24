import { useState } from 'react';
import { tauriInvoke } from './tauri';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const API_BASE = 'http://localhost:5052';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [session, setSession] = useState(null);
  const [credentials, setCredentials] = useState(null);

  const handleLogin = async (username, password, branchCode) => {
    const response = await fetch(`${API_BASE}/api/v2/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, branchCode }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'Login failed');
    }
    const data = await response.json();
    setSession({ token: data.token, user: data.user || data });
    setCredentials({ username, branch_code: branchCode });
    setIsAuthenticated(true);

    await tauriInvoke('show_notification', {
      title: 'Login Successful',
      body: `Welcome, ${username}!`
    });
  };

  const handleLogout = () => {
    setSession(null);
    setCredentials(null);
    setIsAuthenticated(false);
  };

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
