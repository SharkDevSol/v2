import { useState, useEffect } from 'react';

/**
 * Custom hook to handle PWA installation prompt
 * @param {string} appType - Type of app (student, staff, guardian)
 * @returns {object} - Installation state and prompt function
 */
export const useInstallPrompt = (appType = 'student') => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed (running in standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = window.navigator.standalone === true;
    
    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true);
      setIsInstallable(false);
      return;
    }

    // Check if already installed via localStorage
    const installedKey = `pwa_installed_${appType}`;
    if (localStorage.getItem(installedKey) === 'true') {
      setIsInstalled(true);
      setIsInstallable(false);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Store in window for debugging
      window.deferredPrompt = e;
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('App installed successfully');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      
      // Mark as installed in localStorage
      const installedKey = `pwa_installed_${appType}`;
      localStorage.setItem(installedKey, 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if prompt was already captured before this component mounted
    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt);
      setIsInstallable(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [appType]);

  // Function to trigger the install prompt
  const promptInstall = async () => {
    if (!deferredPrompt) {
      console.warn('Install prompt not available');
      return false;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for the user's response
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
        setIsInstallable(false);
        
        // Mark as installed in localStorage
        const installedKey = `pwa_installed_${appType}`;
        localStorage.setItem(installedKey, 'true');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Clear the deferred prompt
      setDeferredPrompt(null);
      window.deferredPrompt = null;
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    promptInstall,
    deferredPrompt
  };
};

export default useInstallPrompt;
