/**
 * Authentication Helper Functions for E2E Tests
 * 
 * These helpers provide reusable authentication flows for different user types.
 */

/**
 * Login as admin user
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} credentials - User credentials
 * @param {string} credentials.branchCode - Branch code
 * @param {string} credentials.username - Username
 * @param {string} credentials.password - Password
 */
export async function loginAsAdmin(page, credentials) {
  await page.goto('/');
  
  // Fill in branch code
  await page.fill('input[name="branchCode"]', credentials.branchCode);
  
  // Fill in username
  await page.fill('input[name="username"]', credentials.username);
  
  // Fill in password
  await page.fill('input[name="password"]', credentials.password);
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

/**
 * Login as teacher user
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} credentials - User credentials
 */
export async function loginAsTeacher(page, credentials) {
  await page.goto('/staff-login');
  
  await page.fill('input[name="branchCode"]', credentials.branchCode);
  await page.fill('input[name="username"]', credentials.username);
  await page.fill('input[name="password"]', credentials.password);
  
  await page.click('button[type="submit"]');
  
  // Wait for staff dashboard
  await page.waitForURL('**/staff/dashboard', { timeout: 10000 });
}

/**
 * Login as student user
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} credentials - User credentials
 */
export async function loginAsStudent(page, credentials) {
  await page.goto('/student-login');
  
  await page.fill('input[name="branchCode"]', credentials.branchCode);
  await page.fill('input[name="username"]', credentials.username);
  await page.fill('input[name="password"]', credentials.password);
  
  await page.click('button[type="submit"]');
  
  // Wait for student dashboard
  await page.waitForURL('**/student/dashboard', { timeout: 10000 });
}

/**
 * Login as guardian user
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} credentials - User credentials
 */
export async function loginAsGuardian(page, credentials) {
  await page.goto('/guardian-login');
  
  await page.fill('input[name="branchCode"]', credentials.branchCode);
  await page.fill('input[name="username"]', credentials.username);
  await page.fill('input[name="password"]', credentials.password);
  
  await page.click('button[type="submit"]');
  
  // Wait for guardian dashboard
  await page.waitForURL('**/guardian/dashboard', { timeout: 10000 });
}

/**
 * Login as super admin user
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {Object} credentials - User credentials
 */
export async function loginAsSuperAdmin(page, credentials) {
  await page.goto('/super-admin-login');
  
  // Super admin doesn't need branch code (has access to all branches)
  await page.fill('input[name="username"]', credentials.username);
  await page.fill('input[name="password"]', credentials.password);
  
  await page.click('button[type="submit"]');
  
  // Wait for super admin dashboard
  await page.waitForURL('**/super-admin/dashboard', { timeout: 15000 });
}

/**
 * Logout current user
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
export async function logout(page) {
  // Click on user menu or logout button
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  
  // Wait for redirect to login page
  await page.waitForURL('**/login', { timeout: 5000 });
}

/**
 * Check if user is authenticated
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {Promise<boolean>} True if authenticated
 */
export async function isAuthenticated(page) {
  const token = await page.evaluate(() => localStorage.getItem('authToken'));
  return !!token;
}

/**
 * Clear authentication state
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
export async function clearAuth(page) {
  try {
    await page.evaluate(() => {
      try {
        localStorage.removeItem('authToken');
        localStorage.removeItem('branchCode');
        localStorage.removeItem('user');
      } catch (e) {
        // Ignore localStorage errors when on about:blank
      }
    });
  } catch (err) {
    // Ignore evaluation error
  }
}
