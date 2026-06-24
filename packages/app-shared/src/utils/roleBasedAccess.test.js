/**
 * Test file for role-based access control
 * Run with: npm test roleBasedAccess.test.js
 */

import { hasFeatureAccess, getAvailableFeatures, isTeacher, isAdministrative, isSupportive, ROLE_FEATURES } from './roleBasedAccess';

describe('Role-Based Access Control', () => {
  
  describe('hasFeatureAccess', () => {
    test('Teacher should have access to mark-lists', () => {
      expect(hasFeatureAccess('Teacher', 'mark-lists')).toBe(true);
      expect(hasFeatureAccess('teacher', 'mark-lists')).toBe(true);
      expect(hasFeatureAccess('TEACHER', 'mark-lists')).toBe(true);
    });

    test('Administrative should NOT have access to mark-lists', () => {
      expect(hasFeatureAccess('Administrative', 'mark-lists')).toBe(false);
      expect(hasFeatureAccess('administrative', 'mark-lists')).toBe(false);
    });

    test('Supportive should NOT have access to mark-lists', () => {
      expect(hasFeatureAccess('Supportive', 'mark-lists')).toBe(false);
      expect(hasFeatureAccess('supportive', 'mark-lists')).toBe(false);
    });

    test('Administrative should have access to student-registration', () => {
      expect(hasFeatureAccess('Administrative', 'student-registration')).toBe(true);
    });

    test('Teacher should NOT have access to student-registration', () => {
      expect(hasFeatureAccess('Teacher', 'student-registration')).toBe(false);
    });

    test('Should return false for invalid inputs', () => {
      expect(hasFeatureAccess(null, 'mark-lists')).toBe(false);
      expect(hasFeatureAccess('Teacher', null)).toBe(false);
      expect(hasFeatureAccess('', 'mark-lists')).toBe(false);
      expect(hasFeatureAccess('Teacher', '')).toBe(false);
      expect(hasFeatureAccess('InvalidRole', 'mark-lists')).toBe(false);
    });
  });

  describe('getAvailableFeatures', () => {
    test('Should return correct features for Teacher', () => {
      const features = getAvailableFeatures('Teacher');
      expect(features).toContain('mark-lists');
      expect(features).toContain('attendance');
      expect(features).toContain('exam-creation');
      expect(features).not.toContain('student-registration');
    });

    test('Should return correct features for Administrative', () => {
      const features = getAvailableFeatures('Administrative');
      expect(features).toContain('student-registration');
      expect(features).toContain('fee-management');
      expect(features).not.toContain('mark-lists');
    });

    test('Should return empty array for invalid role', () => {
      expect(getAvailableFeatures('InvalidRole')).toEqual([]);
      expect(getAvailableFeatures(null)).toEqual([]);
    });
  });

  describe('Role helper functions', () => {
    test('isTeacher should work correctly', () => {
      expect(isTeacher('Teacher')).toBe(true);
      expect(isTeacher('Administrative')).toBe(false);
      expect(isTeacher('Supportive')).toBe(false);
    });

    test('isAdministrative should work correctly', () => {
      expect(isAdministrative('Administrative')).toBe(true);
      expect(isAdministrative('Teacher')).toBe(false);
      expect(isAdministrative('Supportive')).toBe(false);
    });

    test('isSupportive should work correctly', () => {
      expect(isSupportive('Supportive')).toBe(true);
      expect(isSupportive('Teacher')).toBe(false);
      expect(isSupportive('Administrative')).toBe(false);
    });
  });

  describe('ROLE_FEATURES constant', () => {
    test('Should have all required roles defined', () => {
      expect(ROLE_FEATURES).toHaveProperty('Teacher');
      expect(ROLE_FEATURES).toHaveProperty('Administrative');
      expect(ROLE_FEATURES).toHaveProperty('Supportive');
    });

    test('Teacher role should have mark-lists feature', () => {
      expect(ROLE_FEATURES.Teacher).toContain('mark-lists');
    });

    test('Administrative and Supportive should NOT have mark-lists', () => {
      expect(ROLE_FEATURES.Administrative).not.toContain('mark-lists');
      expect(ROLE_FEATURES.Supportive).not.toContain('mark-lists');
    });
  });
});

// Manual test function for browser console
window.testRoleAccess = function() {
  console.log('=== Role-Based Access Control Test ===');
  
  // Test Teacher access
  console.log('Teacher access to mark-lists:', hasFeatureAccess('Teacher', 'mark-lists')); // Should be true
  console.log('Teacher access to student-registration:', hasFeatureAccess('Teacher', 'student-registration')); // Should be false
  
  // Test Administrative access
  console.log('Administrative access to mark-lists:', hasFeatureAccess('Administrative', 'mark-lists')); // Should be false
  console.log('Administrative access to student-registration:', hasFeatureAccess('Administrative', 'student-registration')); // Should be true
  
  // Test Supportive access
  console.log('Supportive access to mark-lists:', hasFeatureAccess('Supportive', 'mark-lists')); // Should be false
  console.log('Supportive access to communication:', hasFeatureAccess('Supportive', 'communication')); // Should be true
  
  console.log('=== Test Complete ===');
};