// COMPONENTS/InitialRedirect.jsx
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getPermissionByKey } from '../config/adminPermissions';

// Total number of setup tasks
const TOTAL_TASKS = 7;

function InitialRedirect({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false); // Prevent multiple redirects

  useEffect(() => {
    // Only redirect if we're at the root path and haven't redirected yet
    if (location.pathname !== '/' || hasRedirected.current) {
      return;
    }

    // Mark as redirected to prevent multiple calls
    hasRedirected.current = true;

    const userType = localStorage.getItem('userType') || 'admin';

    if (userType === 'admin') {
      // Admin always goes to dashboard
      navigate('/dashboard', { replace: true });
    } else if (userType === 'sub-account') {
      // Sub-account goes to first permitted page
      let permissions = [];
      try {
        const storedPermissions = localStorage.getItem('userPermissions');
        if (storedPermissions) {
          permissions = JSON.parse(storedPermissions);
        }
      } catch (e) {
        console.error('Error parsing permissions:', e);
      }

      if (permissions.length > 0) {
        // Get the first permission's path
        const firstPermission = getPermissionByKey(permissions[0]);
        if (firstPermission && firstPermission.path) {
          navigate(firstPermission.path, { replace: true });
        } else {
          // Fallback to dashboard if permission not found
          navigate('/dashboard', { replace: true });
        }
      } else {
        // No permissions, stay at root (will show access denied or empty)
        navigate('/dashboard', { replace: true });
      }
    }
  }, []); // Empty dependency array - only run once on mount

  return children;
}

export default InitialRedirect;
