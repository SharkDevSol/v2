import { Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { hasPathPermission } from '../utils/permissionUtils';
import { verifyToken } from '../utils/api';

const ProtectedRoute = ({ children, requiredPermission }) => {
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const authToken = localStorage.getItem('authToken');
  const userType = localStorage.getItem('userType');
  const hasValidated = useRef(false); // Prevent multiple validations
  
  // Validate token on mount
  useEffect(() => {
    // Prevent multiple validations
    if (hasValidated.current) {
      return;
    }
    
    const validateToken = async () => {
      if (!isLoggedIn || !authToken) {
        setIsValidating(false);
        setIsTokenValid(false);
        hasValidated.current = true;
        return;
      }
      
      try {
        const isValid = await verifyToken();
        setIsTokenValid(isValid);
        
        if (!isValid) {
          // Clear invalid auth data
          localStorage.removeItem('authToken');
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('adminUser');
          localStorage.removeItem('staffUser');
          localStorage.removeItem('userType');
          localStorage.removeItem('staffProfile');
          localStorage.removeItem('userPermissions');
        }
      } catch (error) {
        console.error('Token validation error:', error);
        setIsTokenValid(false);
        
        // Clear auth data on validation error
        localStorage.removeItem('authToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('staffUser');
        localStorage.removeItem('userType');
        localStorage.removeItem('staffProfile');
        localStorage.removeItem('userPermissions');
      } finally {
        setIsValidating(false);
        hasValidated.current = true;
      }
    };
    
    validateToken();
  }, []); // Empty dependency array - only run once on mount
  
  // Get permissions from localStorage
  let permissions = [];
  try {
    const storedPermissions = localStorage.getItem('userPermissions');
    if (storedPermissions) {
      permissions = JSON.parse(storedPermissions);
    }
  } catch (e) {
    console.error('❌ ProtectedRoute - Error parsing permissions:', e);
  }

  // Show loading state while validating token - removed to prevent flash on refresh
  // Token validation happens in background, user sees content immediately
  if (isValidating) {
    // Don't show loading screen, let content render
    // If token is invalid, user will be redirected after validation completes
  }

  // Debug logging
  console.log('🛡️ ProtectedRoute Check:', {
    isLoggedIn,
    isTokenValid,
    userType,
    currentPath: location.pathname,
    permissionCount: permissions.length
  });

  if (!isLoggedIn || (!isValidating && !isTokenValid)) {
    // Redirect to login page, but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Primary admins and staff have full access - no permission checking needed
  if (userType === 'admin' || userType === 'staff') {
    console.log('✅ Admin/Staff user - full access granted');
    return children;
  }

  // If userType is not set but user is logged in, assume primary admin (backward compatibility)
  if (!userType) {
    console.log('⚠️ No userType found, assuming primary admin');
    return children;
  }

  // Check permission for sub-accounts ONLY
  if (userType === 'sub-account') {
    const currentPath = location.pathname;
    
    console.log('🔒 Sub-account permission check:', {
      currentPath,
      permissions,
      permissionCount: permissions.length
    });
    
    // Always allow access to root path
    if (currentPath === '/' || currentPath === '') {
      console.log('✅ Root path - access granted');
      return children;
    }
    
    // Check if user has permission for this path
    const hasAccess = hasPathPermission(permissions, currentPath, userType);
    console.log(`${hasAccess ? '✅' : '❌'} Permission check result:`, hasAccess);
    
    if (!hasAccess) {
      console.log('❌ Access denied for sub-account');
      // Show access denied and offer to go back to login
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '60vh',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h2 style={{ color: '#d93025', marginBottom: '16px' }}>Access Denied</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            You don't have permission to access this page.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <a 
              href="/" 
              style={{ 
                color: '#667eea', 
                textDecoration: 'none',
                padding: '10px 20px',
                border: '1px solid #667eea',
                borderRadius: '6px',
                background: 'white'
              }}
            >
              Go to Home
            </a>
            <a 
              href="/login" 
              onClick={() => {
                localStorage.clear();
              }}
              style={{ 
                color: 'white',
                background: '#667eea',
                textDecoration: 'none',
                padding: '10px 20px',
                border: '1px solid #667eea',
                borderRadius: '6px'
              }}
            >
              Back to Login
            </a>
          </div>
        </div>
      );
    }
    
    console.log('✅ Sub-account has permission');
  }

  return children;
};

export default ProtectedRoute;
