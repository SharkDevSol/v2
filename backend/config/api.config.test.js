/**
 * Test Suite for Backend API Configuration
 * 
 * This file tests the centralized API configuration system to ensure:
 * - Config file loads without errors
 * - Helper functions work correctly
 * - Endpoints are properly defined
 * - Environment switching works
 */

const apiConfig = require('./api.config');

describe('Backend API Configuration', () => {
  const {
    ENV,
    BASE_URLS,
    API_ENDPOINTS,
    getBaseURL,
    getEndpoint,
    getEndpointPath,
    hasEndpoint,
    getModuleEndpoints
  } = apiConfig;

  test('Config file loads successfully', () => {
    expect(ENV).toBeDefined();
    expect(BASE_URLS).toBeDefined();
    expect(API_ENDPOINTS).toBeDefined();
  });

  test('BASE_URLS structure is valid', () => {
    const requiredEnvs = ['development', 'production', 'test'];
    const requiredServices = ['backend', 'frontend'];

    requiredEnvs.forEach(env => {
      expect(BASE_URLS[env]).toBeDefined();
      requiredServices.forEach(service => {
        expect(BASE_URLS[env][service]).toBeDefined();
      });
    });
  });

  test('API_ENDPOINTS structure is valid', () => {
    const requiredModules = [
      'HEALTH', 'AUTH', 'ADMIN', 'STUDENTS', 'STAFF', 'GUARDIANS',
      'ATTENDANCE', 'ACADEMIC', 'FINANCE', 'HR', 'COMMUNICATION'
    ];

    requiredModules.forEach(module => {
      expect(API_ENDPOINTS[module]).toBeDefined();
    });
  });

  test('getBaseURL() function works correctly', () => {
    expect(getBaseURL()).toBeDefined();
    expect(getBaseURL('frontend')).toBeDefined();
    expect(getBaseURL('backend', 'production')).toBeDefined();
  });

  test('getEndpoint() function works correctly', () => {
    expect(getEndpoint('AUTH.LOGIN')).toBeDefined();
    expect(getEndpoint('STUDENTS.LIST')).toBeDefined();
    expect(getEndpoint('STUDENTS.BY_ID', { id: 123 })).toContain('123');
  });

  test('getEndpointPath() function works correctly', () => {
    expect(getEndpointPath('AUTH.LOGIN')).toBeDefined();
    expect(getEndpointPath('STUDENTS.BY_ID', { id: 456 })).toContain('456');
  });

  test('hasEndpoint() function works correctly', () => {
    expect(hasEndpoint('AUTH.LOGIN')).toBe(true);
    expect(hasEndpoint('INVALID.ENDPOINT')).toBe(false);
  });

  test('getModuleEndpoints() function works correctly', () => {
    const authEndpoints = getModuleEndpoints('AUTH');
    expect(Object.keys(authEndpoints).length).toBeGreaterThan(0);
  });

  test('Dynamic endpoint functions work correctly', () => {
    expect(typeof API_ENDPOINTS.STUDENTS.BY_ID).toBe('function');
    expect(API_ENDPOINTS.STUDENTS.BY_ID(789)).toContain('789');
  });

  test('Environment switching works correctly', () => {
    const devURL = getBaseURL('backend', 'development');
    const prodURL = getBaseURL('backend', 'production');
    expect(devURL).not.toBe(prodURL);
  });
});
