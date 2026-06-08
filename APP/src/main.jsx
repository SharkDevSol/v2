import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/fonts.css'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import { LanguageSelectionProvider } from './context/LanguageSelectionContext.jsx'
import axios from 'axios'
import './config/axios.config'   // Register global interceptors (auth token + branch code)

// Configure axios defaults from environment variable
axios.defaults.baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
console.log('🌐 Axios configured with baseURL:', axios.defaults.baseURL);

// Unregister all service workers and clear caches to force fresh load
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
  });
  caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
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
