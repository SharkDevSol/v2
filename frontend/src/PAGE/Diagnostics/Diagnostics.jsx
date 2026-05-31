import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  runFullDiagnostics, 
  getDiagnosticInfo, 
  clearAuthAndRedirect,
  checkServerConnection,
  verifyAuthToken 
} from '../../utils/apiDiagnostics';
import styles from './Diagnostics.module.css';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

const Diagnostics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    // Load initial diagnostic info
    setInfo(getDiagnosticInfo());
  }, []);

  const handleRunDiagnostics = async () => {
    setLoading(true);
    try {
      const results = await runFullDiagnostics();
      setDiagnostics(results);
      setInfo(results.info);
    } catch (error) {
      console.error('Diagnostics failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAuth = () => {
    if (window.confirm('This will clear all authentication data and redirect you to login. Continue?')) {
      clearAuthAndRedirect();
    }
  };

  const StatusIcon = ({ success }) => {
    if (success === null || success === undefined) {
      return <Info size={20} color="#6B7280" />;
    }
    return success ? 
      <CheckCircle size={20} color="#10B981" /> : 
      <XCircle size={20} color="#EF4444" />;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>API Diagnostics</h1>
        <p>Check your authentication status and server connection</p>
      </div>

      <div className={styles.actions}>
        <button 
          className={styles.btnPrimary} 
          onClick={handleRunDiagnostics}
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? styles.spinning : ''} />
          {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </button>
        <button 
          className={styles.btnSecondary} 
          onClick={handleClearAuth}
        >
          Clear Auth & Re-login
        </button>
        <button 
          className={styles.btnSecondary} 
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </button>
      </div>

      {info && (
        <div className={styles.section}>
          <h2>Session Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Has Token:</span>
              <span className={info.hasToken ? styles.success : styles.error}>
                {info.hasToken ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Token Preview:</span>
              <span className={styles.value}>{info.tokenPreview}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Is Logged In:</span>
              <span className={info.isLoggedIn ? styles.success : styles.error}>
                {info.isLoggedIn ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>User Type:</span>
              <span className={styles.value}>{info.userType}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Has User Data:</span>
              <span className={info.hasUserData ? styles.success : styles.error}>
                {info.hasUserData ? 'Yes' : 'No'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>API URL:</span>
              <span className={styles.value}>{info.apiUrl}</span>
            </div>
          </div>
        </div>
      )}

      {diagnostics && (
        <>
          <div className={styles.section}>
            <h2>Server Connection</h2>
            <div className={styles.resultCard}>
              <StatusIcon success={diagnostics.serverCheck.success} />
              <div className={styles.resultContent}>
                <p className={styles.resultMessage}>{diagnostics.serverCheck.message}</p>
                {diagnostics.serverCheck.details && (
                  <p className={styles.resultDetails}>{diagnostics.serverCheck.details}</p>
                )}
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Token Verification</h2>
            <div className={styles.resultCard}>
              <StatusIcon success={diagnostics.tokenCheck.success} />
              <div className={styles.resultContent}>
                <p className={styles.resultMessage}>{diagnostics.tokenCheck.message}</p>
                {diagnostics.tokenCheck.details && (
                  <p className={styles.resultDetails}>{diagnostics.tokenCheck.details}</p>
                )}
                {diagnostics.tokenCheck.action && (
                  <p className={styles.resultAction}>
                    <AlertTriangle size={16} />
                    Action: {diagnostics.tokenCheck.action}
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <div className={styles.section}>
        <h2>Common Issues & Solutions</h2>
        <div className={styles.solutionsList}>
          <div className={styles.solutionItem}>
            <h3>403 Forbidden Errors</h3>
            <p>If you're seeing 403 errors, it usually means:</p>
            <ul>
              <li>Your authentication token is invalid or expired</li>
              <li>The token was generated by a different server instance (JWT secret mismatch)</li>
              <li>You don't have permission to access certain resources</li>
            </ul>
            <p><strong>Solution:</strong> Click "Clear Auth & Re-login" above to log in again with a fresh token.</p>
          </div>

          <div className={styles.solutionItem}>
            <h3>Server Connection Failed</h3>
            <p>If the server connection check fails:</p>
            <ul>
              <li>Make sure the backend server is running</li>
              <li>Check that the API URL in .env matches your backend server</li>
              <li>Verify there are no firewall or network issues</li>
            </ul>
            <p><strong>Current API URL:</strong> {info?.apiUrl}</p>
          </div>

          <div className={styles.solutionItem}>
            <h3>Token Signature Mismatch</h3>
            <p>This happens when the backend server's JWT secret has changed:</p>
            <ul>
              <li>The server was restarted with a different JWT_SECRET</li>
              <li>You're connecting to a different server instance</li>
              <li>The backend configuration was updated</li>
            </ul>
            <p><strong>Solution:</strong> Simply log in again to get a new token from the current server.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;
