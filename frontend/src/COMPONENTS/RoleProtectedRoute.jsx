import React from 'react';
import { Navigate } from 'react-router-dom';
import { hasFeatureAccess } from '../utils/roleBasedAccess';

/**
 * Role-based protected route component
 * Redirects users who don't have access to the required feature
 */
const RoleProtectedRoute = ({ children, requiredFeature, redirectTo = '/app/staff' }) => {
  // Get user data from localStorage
  const storedUser = localStorage.getItem('staffUser');
  
  if (!storedUser) {
    // No user data, redirect to login
    return <Navigate to="/app/staff-login" replace />;
  }

  try {
    const userData = JSON.parse(storedUser);
    
    // Check if user has access to the required feature
    if (!hasFeatureAccess(userData.staffType, requiredFeature)) {
      console.log(`Access denied: User ${userData.username} (${userData.staffType}) does not have access to feature: ${requiredFeature}`);
      return <Navigate to={redirectTo} replace />;
    }

    // User has access, render the component
    return children;
  } catch (error) {
    console.error('RoleProtectedRoute: Error parsing user data:', error);
    return <Navigate to="/app/staff-login" replace />;
  }
};

export default RoleProtectedRoute;