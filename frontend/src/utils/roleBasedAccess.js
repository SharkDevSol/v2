/**
 * Role-Based Access Control Utility
 * Implements ROLE_FEATURES mapping as defined in the design document
 */

// Role-based feature access mapping
export const ROLE_FEATURES = {
  Teacher: [
    'mark-lists',
    'attendance',
    'exam-creation',
    'class-management',
    'schedule-view',
    'student-reports'
  ],
  Administrative: [
    'student-registration',
    'fee-management',
    'reports',
    'communication'
  ],
  Supportive: [
    'attendance-view',
    'schedule-view',
    'communication'
  ]
};

/**
 * Check if a user has access to a specific feature based on their staff type
 * @param {string} staffType - The staff type (Teacher, Administrative, Supportive)
 * @param {string} feature - The feature to check access for
 * @returns {boolean} - True if user has access, false otherwise
 */
export const hasFeatureAccess = (staffType, feature) => {
  if (!staffType || !feature) {
    return false;
  }
  
  // Normalize staffType to handle variations like "teacher", "Teacher", "TEACHER"
  const normalizedStaffType = staffType.charAt(0).toUpperCase() + staffType.slice(1).toLowerCase();
  
  // Get features for this staff type
  const allowedFeatures = ROLE_FEATURES[normalizedStaffType] || [];
  
  return allowedFeatures.includes(feature);
};

/**
 * Get all features available to a staff type
 * @param {string} staffType - The staff type
 * @returns {string[]} - Array of available features
 */
export const getAvailableFeatures = (staffType) => {
  if (!staffType) {
    return [];
  }
  
  const normalizedStaffType = staffType.charAt(0).toUpperCase() + staffType.slice(1).toLowerCase();
  return ROLE_FEATURES[normalizedStaffType] || [];
};

/**
 * Check if user is a teacher (has teacher role)
 * @param {string} staffType - The staff type
 * @returns {boolean} - True if user is a teacher
 */
export const isTeacher = (staffType) => {
  return hasFeatureAccess(staffType, 'mark-lists');
};

/**
 * Check if user has administrative privileges
 * @param {string} staffType - The staff type
 * @returns {boolean} - True if user has administrative access
 */
export const isAdministrative = (staffType) => {
  return hasFeatureAccess(staffType, 'student-registration');
};

/**
 * Check if user has supportive role
 * @param {string} staffType - The staff type
 * @returns {boolean} - True if user has supportive role
 */
export const isSupportive = (staffType) => {
  const normalizedStaffType = staffType?.charAt(0).toUpperCase() + staffType?.slice(1).toLowerCase();
  return normalizedStaffType === 'Supportive';
};