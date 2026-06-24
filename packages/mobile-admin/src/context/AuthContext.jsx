import { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/AuthService';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children, apiBaseUrl = 'http://localhost:5052' }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  async function initializeAuth() {
    try {
      setIsLoading(true);
      const result = await AuthService.autoLogin(async (credentials) => {
        const response = await fetch(`${apiBaseUrl}/api/v2/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
            branchCode: credentials.branchCode,
          }),
        });
        if (!response.ok) throw new Error('Authentication failed');
        const data = await response.json();
        return { ...data.user, token: data.token };
      });

      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auto-login error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(username, password, branchCode, rememberMe = true) {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/v2/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, branchCode }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Login failed');
      }

      const data = await response.json();

      if (rememberMe) {
        await AuthService.saveCredentials(username, password, branchCode);
      }

      setUser({ ...data.user, token: data.token });
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  }

  async function logout(clearCredentials = true) {
    try {
      setIsLoading(true);
      if (clearCredentials) await AuthService.clearCredentials();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const value = { user, isAuthenticated, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
