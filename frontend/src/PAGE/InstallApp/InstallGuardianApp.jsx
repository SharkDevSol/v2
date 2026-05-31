import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './InstallApp.module.css';
import { FiDownload, FiArrowLeft, FiCheck } from 'react-icons/fi';

const InstallGuardianApp = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  useEffect(() => {
    // Set the correct manifest for Guardian App
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      manifestLink.href = '/manifest-guardian.json';
    } else {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest-guardian.json';
      document.head.appendChild(link);
    }

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else {
      setShowManualGuide(true);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.installCard}>
        <div className={styles.appIcon} style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
          <span style={{ fontSize: '48px' }}>👨‍👩‍👧</span>
        </div>

        <h1 className={styles.appTitle}>Guardian App</h1>
        <p className={styles.appDescription}>
          Monitor your child's progress, attendance, and payments from anywhere.
        </p>

        <div className={styles.features}>
          <div className={styles.feature}>
            <FiCheck /> Track Attendance
          </div>
          <div className={styles.feature}>
            <FiCheck /> View Grades
          </div>
          <div className={styles.feature}>
            <FiCheck /> Make Payments
          </div>
          <div className={styles.feature}>
            <FiCheck /> Get Notifications
          </div>
        </div>

        {isInstalled ? (
          <div className={styles.installedMessage}>
            <FiCheck /> App Already Installed
          </div>
        ) : (
          <>
            <button 
              className={styles.installBtn}
              onClick={handleInstall}
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              <FiDownload /> Install Guardian App
            </button>
            
            {showManualGuide && (
              <div className={styles.manualGuide}>
                <h4>📱 Follow these steps:</h4>
                <div className={styles.step}>
                  <span className={styles.stepNumber}>1</span>
                  <p>Tap the menu button <strong>(⋮)</strong> at the top right of Chrome</p>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNumber}>2</span>
                  <p>Select <strong>"Add to Home screen"</strong></p>
                </div>
                <div className={styles.step}>
                  <span className={styles.stepNumber}>3</span>
                  <p>Tap <strong>"Add"</strong> to confirm</p>
                </div>
                <div className={styles.successNote}>
                  ✅ The app will appear on your home screen!
                </div>
              </div>
            )}
          </>
        )}

        <div className={styles.instructions}>
          <h3>How to Install:</h3>
          <ol>
            <li>Open this page in Chrome (Android) or Safari (iOS)</li>
            <li>Click the "Install Guardian App" button above</li>
            <li>Follow the prompts to add to your home screen</li>
            <li>Launch the app from your home screen</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default InstallGuardianApp;
