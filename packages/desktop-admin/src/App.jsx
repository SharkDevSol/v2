import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { getTauri } from './tauri';
import './App.css';

// Shared pages from @skoolific/app-shared
import Login from '@skoolific/app-shared/src/pages/Login/Login';
import ModernDashboard from '@skoolific/app-shared/src/pages/Dashboard/ModernDashboard';
import Home from '@skoolific/app-shared/src/pages/Home';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5052';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkSavedCredentials(); }, []);

  const checkSavedCredentials = async () => {
    try {
      const tauri = await getTauri();
      if (tauri) {
        const creds = await tauri.invoke('get_credentials');
        if (creds) setCredentials(creds);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleLogin = async (username, password, branchCode, rememberMe) => {
    const res = await fetch(`${API_BASE}/api/v2/branches/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, branchCode }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Login failed');
    const data = await res.json();

    if (rememberMe) {
      const tauri = await getTauri();
      if (tauri) await tauri.invoke('save_credentials', { username, password, branch_code: branchCode });
    }

    setSession({ token: data.token, user: data.user || data });
    setCredentials({ username, branch_code: branchCode });
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    setSession(null);
    setCredentials(null);
    setIsAuthenticated(false);
  };

  if (loading) return <div className="app-loading"><div className="spinner"></div><p>Loading...</p></div>;

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  return (
    <div className="app">
      <Routes>
        <Route path="*" element={
          <Home credentials={credentials} session={session} onLogout={handleLogout} />
        } />
      </Routes>
    </div>
  );
}

export default App;
