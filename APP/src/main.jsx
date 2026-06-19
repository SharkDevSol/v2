import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/fonts.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { LanguageSelectionProvider } from './context/LanguageSelectionContext.jsx'
import axios from 'axios'
import './config/axios.config'   // Register global interceptors (auth token + branch code)

// Patch global fetch to add auth + branch headers (for pages using raw fetch())
const origFetch = window.fetch;
window.fetch = function(input, init) {
  init = init || {};
  init.headers = init.headers || {};
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (token) init.headers['Authorization'] = 'Bearer ' + token;
  const branchCode = (localStorage.getItem('branchCode') || sessionStorage.getItem('branchCode') || '').toUpperCase();
  if (branchCode) init.headers['X-Branch-Code'] = branchCode;
  return origFetch.call(window, input, init);
};

// Configure axios defaults from environment variable
axios.defaults.baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
console.log('🌐 Axios configured with baseURL:', axios.defaults.baseURL);

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  // Clear all old caches first
  caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Fix: passive event listener warning from third-party libraries (antd, framer-motion)
const originalAddEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function (type, listener, options) {
  if (type === 'touchstart' || type === 'touchmove' || type === 'wheel' || type === 'mousewheel') {
    if (options === undefined || options === false) {
      options = { passive: true };
    } else if (typeof options === 'object' && options.passive === undefined) {
      options = { ...options, passive: true };
    }
  }
  return originalAddEventListener.call(this, type, listener, options);
};

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppProvider>
      <LanguageSelectionProvider>
        <App />
      </LanguageSelectionProvider>
    </AppProvider>
  </BrowserRouter>,
)
