import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for saved credentials on app start
  useEffect(() => {
    checkSavedCredentials();
  }, []);

  const checkSavedCredentials = async () => {
    try {
      // Try to get saved username from localStorage
      const savedUsername = localStorage.getItem('skoolific_username');
      
      if (savedUsername) {
        // Check if credentials exist in keyring
        const hasCredentials = await invoke('has_credentials', { username: savedUsername });
        
        if (hasCredentials) {
          // Retrieve credentials
          const creds = await invoke('get_credentials', { username: savedUsername });
          setCredentials(creds);
          setIsAuthenticated(true);
          
          // Show welcome notification
          await invoke('show_notification', {
            title: 'Welcome Back!',
            body: `Logged in as ${creds.username}`
          });
        }
      }
    } catch (error) {
      console.error('Error checking saved credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username, password, branchCode, rememberMe) => {
    try {
      // TODO: Validate credentials with backend API
      // For now, we'll just save them
      
      if (rememberMe) {
        // Save credentials to keyring
        await invoke('save_credentials', {
          username,
          password,
          branchCode
        });
        
        // Save username to localStorage for auto-login check
        localStorage.setItem('skoolific_username', username);
      }
      
      setCredentials({ username, password, branch_code: branchCode });
      setIsAuthenticated(true);
      
      // Show success notification
      await invoke('show_notification', {
        title: 'Login Successful',
        body: `Welcome, ${username}!`
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('skoolific_username');
      
      // Optionally delete credentials from keyring
      // await invoke('delete_credentials', { username: credentials.username });
      
      setCredentials(null);
      setIsAuthenticated(false);
      
      // Show logout notification
      await invoke('show_notification', {
        title: 'Logged Out',
        body: 'You have been logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
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
        <Dashboard credentials={credentials} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
