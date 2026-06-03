import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const API_BASE = 'http://localhost:5050/api/super-admin';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('skoolific_super_admin_session');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        if (session.token && session.user) {
          setUser({ ...session.user, token: session.token });
          setIsAuthenticated(true);
        }
      } catch (e) {
        localStorage.removeItem('skoolific_super_admin_session');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = async (username, password, rememberMe) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }

    const data = await res.json();
    const userData = { ...data.user, token: data.token };

    if (rememberMe) {
      localStorage.setItem('skoolific_super_admin_session', JSON.stringify({
        token: data.token,
        user: data.user
      }));
    }

    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('skoolific_super_admin_session');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading Skoolific Super Admin...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard credentials={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
