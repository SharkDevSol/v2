/**
 * Jest Configuration for Backend Testing
 * Skoolific V2 - School Management System
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'utils/**/*.js',
    'services/**/*.js',
    'middleware/**/*.js',
    'database/V1toV2Migration.js',
    'database/MigrationRunner.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/*.test.js',
    '!**/*.spec.js'
  ],

  // Coverage thresholds (80%+ target)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Module paths
  moduleDirectories: ['node_modules', '<rootDir>'],

  // Transform files
  transform: {},

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/'
  ],

  // Verbose output
  verbose: true,

  // Test timeout (10 seconds)
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Detect open handles
  detectOpenHandles: true,
  forceExit: true,

  // Max workers for parallel testing
  maxWorkers: '50%'
};
