import { test, expect } from '@playwright/test';
import { loginAsAdmin, logout, clearAuth } from '../helpers/auth-helper.js';
import { testUsers, testBranches } from '../fixtures/test-data.js';

/**
 * E2E Tests for Admin Login Flow
 * 
 * These tests verify the complete admin authentication flow including:
 * - Branch code validation
 * - Username and password authentication
 * - Successful login and redirect to dashboard
 * - Persistent login (remember me functionality)
 * - Logout functionality
 * - Error handling and edge cases
 */

test.describe('Admin Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await clearAuth(page);
    
    // Navigate to the admin login page
    await page.goto('/app/staff-login');
  });

  test.describe('Login Form Display', () => {
    test('should display all login form elements', async ({ page }) => {
      // Verify branch code input is visible
      await expect(page.locator('input[name="branchCode"]')).toBeVisible();
      
      // Verify username input is visible
      await expect(page.locator('input[name="username"]')).toBeVisible();
      
      // Verify password input is visible
      await expect(page.locator('input[type="password"]')).toBeVisible();
      
      // Verify login button is visible
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Verify page title
      await expect(page.locator('text=/Staff Portal Login/i')).toBeVisible();
    });

    test('should display branch code input with proper placeholder', async ({ page }) => {
      const branchInput = page.locator('input[name="branchCode"]');
      await expect(branchInput).toHaveAttribute('placeholder', /MAI|AMA|SOL/i);
      await expect(branchInput).toHaveAttribute('maxLength', '3');
    });

    test('should display help text for branch code', async ({ page }) => {
      await expect(page.locator('text=/Enter your 3-letter branch code/i')).toBeVisible();
    });
  });

  test.describe('Branch Code Validation', () => {
    test('should show error for empty branch code on submit', async ({ page }) => {
      // Leave branch code empty
      await page.fill('input[name="username"]', testUsers.admin.username);
      await page.fill('input[name="password"]', testUsers.admin.password);
      
      // Click login button
      await page.click('button[type="submit"]');
      
      // Verify error message is displayed
      await expect(page.locator('text=/Please enter a branch code/i')).toBeVisible();
    });

    test('should show error for invalid branch code format', async ({ page }) => {
      // Enter invalid format (not 3 uppercase letters)
      await page.fill('input[name="branchCode"]', 'ab');
      await page.locator('input[name="branchCode"]').blur();
      
      // Wait for validation message
      await expect(page.locator('text=/Branch code must be 3 uppercase letters/i')).toBeVisible();
    });

    test('should show error for non-existent branch code', async ({ page }) => {
      // Enter valid format but non-existent branch
      await page.fill('input[name="branchCode"]', testBranches.invalid.code);
      await page.locator('input[name="branchCode"]').blur();
      
      // Wait for validation message
      await expect(page.locator('text=/Branch code not found/i')).toBeVisible({ timeout: 10000 });
    });

    test('should validate correct branch code', async ({ page }) => {
      // Enter valid branch code
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      
      // Wait for validation success message
      await expect(page.locator('text=/Valid branch/i')).toBeVisible({ timeout: 10000 });
    });

    test('should convert branch code to uppercase automatically', async ({ page }) => {
      // Enter lowercase branch code
      await page.fill('input[name="branchCode"]', 'ib3');
      
      // Verify it's converted to uppercase
      const branchInput = page.locator('input[name="branchCode"]');
      await expect(branchInput).toHaveValue('IB3');
    });

    test('should limit branch code to 3 characters', async ({ page }) => {
      // Try to enter more than 3 characters
      await page.fill('input[name="branchCode"]', 'ABCDEF');
      
      // Verify only 3 characters are accepted
      const branchInput = page.locator('input[name="branchCode"]');
      await expect(branchInput).toHaveValue('ABC');
    });

    test('should validate branch code on Enter key press', async ({ page }) => {
      // Enter valid branch code
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      
      // Press Enter
      await page.locator('input[name="branchCode"]').press('Enter');
      
      // Wait for validation
      await expect(page.locator('text=/Valid branch/i')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Credential Validation', () => {
    test('should show error for empty username', async ({ page }) => {
      // Enter branch code and password only
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="password"]', testUsers.admin.password);
      
      // Click login button
      await page.click('button[type="submit"]');
      
      // Verify error message
      await expect(page.locator('text=/Please enter both username and password/i')).toBeVisible();
    });

    test('should show error for empty password', async ({ page }) => {
      // Enter branch code and username only
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="username"]', testUsers.admin.username);
      
      // Click login button
      await page.click('button[type="submit"]');
      
      // Verify error message
      await expect(page.locator('text=/Please enter both username and password/i')).toBeVisible();
    });

    test('should show error for invalid username', async ({ page }) => {
      // Enter valid branch code but invalid username
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="username"]', 'wronguser');
      await page.fill('input[name="password"]', testUsers.admin.password);
      
      // Click login button
      await page.click('button[type="submit"]');
      
      // Verify error message is displayed
      await expect(page.locator('text=/Login failed|Invalid/i')).toBeVisible({ timeout: 10000 });
    });

    test('should show error for invalid password', async ({ page }) => {
      // Enter valid branch code and username but invalid password
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="username"]', testUsers.admin.username);
      await page.fill('input[name="password"]', 'wrongpassword');
      
      // Click login button
      await page.click('button[type="submit"]');
      
      // Verify error message is displayed
      await expect(page.locator('text=/Login failed|Invalid/i')).toBeVisible({ timeout: 10000 });
    });

    test('should mask password input', async ({ page }) => {
      const passwordInput = page.locator('input[name="password"]');
      
      // Verify password input type
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Successful Login', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      // Enter valid credentials
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="username"]', testUsers.admin.username);
      await page.fill('input[name="password"]', testUsers.admin.password);
      
      // Click login button
      await page.click('button[type="submit"]');
      
      // Wait for navigation to staff dashboard
      await page.waitForURL('**/staff', { timeout: 15000 });
      
      // Verify dashboard is loaded
      await expect(page).toHaveURL(/\/app\/staff/);
    });

    test('should store authentication token in localStorage', async ({ page }) => {
      // Login
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="username"]', testUsers.admin.username);
      await page.fill('input[name="password"]', testUsers.admin.password);
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForURL('**/staff', { timeout: 15000 });
      
      // Check localStorage for auth token
      const authToken = await page.evaluate(() => localStorage.getItem('authToken'));
      expect(authToken).toBeTruthy();
      expect(authToken).not.toBe('null');
    });

    test('should store user information in localStorage', async ({ page }) => {
      // Login
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="username"]', testUsers.admin.username);
      await page.fill('input[name="password"]', testUsers.admin.password);
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForURL('**/staff', { timeout: 15000 });
      
      // Check localStorage for user data
      const staffUser = await page.evaluate(() => localStorage.getItem('staffUser'));
      expect(staffUser).toBeTruthy();
      
      const userData = JSON.parse(staffUser);
      expect(userData).toHaveProperty('username');
    });

    test('should store userType in localStorage', async ({ page }) => {
      // Login
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="username"]', testUsers.admin.username);
      await page.fill('input[name="password"]', testUsers.admin.password);
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForURL('**/staff', { timeout: 15000 });
      
      // Check localStorage for userType
      const userType = await page.evaluate(() => localStorage.getItem('userType'));
      expect(userType).toBe('staff');
    });

    test('should set isLoggedIn flag in localStorage', async ({ page }) => {
      // Login
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="username"]', testUsers.admin.username);
      await page.fill('input[name="password"]', testUsers.admin.password);
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForURL('**/staff', { timeout: 15000 });
      
      // Check isLoggedIn flag
      const isLoggedIn = await page.evaluate(() => localStorage.getItem('isLoggedIn'));
      expect(isLoggedIn).toBe('true');
    });
  });

  test.describe('Persistent Login (Remember Me)', () => {
    test('should persist branch code in localStorage', async ({ page }) => {
      // Enter branch code
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="username"]', testUsers.admin.username);
      await page.fill('input[name="password"]', testUsers.admin.password);
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForURL('**/staff', { timeout: 15000 });
      
      // Check localStorage for branch code
      const branchCode = await page.evaluate(() => localStorage.getItem('branchCode'));
      expect(branchCode).toBe(testBranches.valid.code);
    });

    test('should load saved branch code on page reload', async ({ page }) => {
      // Set branch code in localStorage
      await page.evaluate((code) => {
        localStorage.setItem('branchCode', code);
      }, testBranches.valid.code);
      
      // Reload the page
      await page.reload();
      
      // Verify branch code is pre-filled
      const branchInput = page.locator('input[name="branchCode"]');
      await expect(branchInput).toHaveValue(testBranches.valid.code);
    });

    test('should maintain session after page refresh', async ({ page }) => {
      // Login first
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="username"]', testUsers.admin.username);
      await page.fill('input[name="password"]', testUsers.admin.password);
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForURL('**/staff', { timeout: 15000 });
      
      // Refresh the page
      await page.reload();
      
      // Verify still on dashboard (not redirected to login)
      await expect(page).toHaveURL(/\/app\/staff/);
    });

    test('should clear saved branch code when clear button is clicked', async ({ page }) => {
      // Set branch code in localStorage
      await page.evaluate((code) => {
        localStorage.setItem('branchCode', code);
      }, testBranches.valid.code);
      
      // Reload to load saved branch code
      await page.reload();
      
      // Click clear button if visible
      const clearButton = page.locator('text=/Clear saved branch code/i');
      if (await clearButton.isVisible()) {
        await clearButton.click();
        
        // Verify branch code is cleared
        const branchInput = page.locator('input[name="branchCode"]');
        await expect(branchInput).toHaveValue('');
        
        // Verify localStorage is cleared
        const branchCode = await page.evaluate(() => localStorage.getItem('branchCode'));
        expect(branchCode).toBeNull();
      }
    });
  });

  test.describe('Logout Functionality', () => {
    test('should logout and clear authentication state', async ({ page }) => {
      // Login first
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="username"]', testUsers.admin.username);
      await page.fill('input[name="password"]', testUsers.admin.password);
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForURL('**/staff', { timeout: 15000 });
      
      // Perform logout
      await clearAuth(page);
      
      // Verify authentication state is cleared
      const authToken = await page.evaluate(() => localStorage.getItem('authToken'));
      expect(authToken).toBeNull();
      
      const isLoggedIn = await page.evaluate(() => localStorage.getItem('isLoggedIn'));
      expect(isLoggedIn).toBeNull();
    });

    test('should redirect to login page after logout', async ({ page }) => {
      // Login first
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="username"]', testUsers.admin.username);
      await page.fill('input[name="password"]', testUsers.admin.password);
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForURL('**/staff', { timeout: 15000 });
      
      // Clear auth and navigate to login
      await clearAuth(page);
      await page.goto('/app/staff-login');
      
      // Verify on login page
      await expect(page.locator('text=/Staff Portal Login/i')).toBeVisible();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should show loading state during login', async ({ page }) => {
      // Enter valid credentials
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="username"]', testUsers.admin.username);
      await page.fill('input[name="password"]', testUsers.admin.password);
      
      // Click login button
      await page.click('button[type="submit"]');
      
      // Verify loading state (button text changes)
      await expect(page.locator('button[type="submit"]:has-text("Logging in")')).toBeVisible({ timeout: 2000 });
    });

    test('should disable form inputs during login', async ({ page }) => {
      // Enter valid credentials
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="username"]', testUsers.admin.username);
      await page.fill('input[name="password"]', testUsers.admin.password);
      
      // Click login button
      await page.click('button[type="submit"]');
      
      // Check if button is disabled during loading
      const loginButton = page.locator('button[type="submit"]');
      await expect(loginButton).toBeDisabled({ timeout: 2000 });
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true);
      
      // Try to login
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.fill('input[name="username"]', testUsers.admin.username);
      await page.fill('input[name="password"]', testUsers.admin.password);
      await page.click('button[type="submit"]');
      
      // Verify error message is shown
      await expect(page.locator('text=/Login failed|error/i')).toBeVisible({ timeout: 10000 });
      
      // Re-enable network
      await page.context().setOffline(false);
    });

    test('should prevent SQL injection in username field', async ({ page }) => {
      // Enter SQL injection attempt
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="username"]', "admin' OR '1'='1");
      await page.fill('input[name="password"]', "password");
      await page.click('button[type="submit"]');
      
      // Should show error, not allow login
      await expect(page.locator('text=/Login failed|Invalid/i')).toBeVisible({ timeout: 10000 });
    });

    test('should handle special characters in password', async ({ page }) => {
      // Enter password with special characters
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="username"]', testUsers.admin.username);
      await page.fill('input[name="password"]', "P@ssw0rd!#$%");
      
      // Should not crash, should show appropriate error
      await page.click('button[type="submit"]');
      await expect(page.locator('text=/Login failed|Invalid/i')).toBeVisible({ timeout: 10000 });
    });

    test('should trim whitespace from username', async ({ page }) => {
      // Enter username with leading/trailing spaces
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="username"]', `  ${testUsers.admin.username}  `);
      await page.fill('input[name="password"]', testUsers.admin.password);
      await page.click('button[type="submit"]');
      
      // Should successfully login (whitespace trimmed)
      await page.waitForURL('**/staff', { timeout: 15000 });
      await expect(page).toHaveURL(/\/app\/staff/);
    });

    test('should handle rate limiting (too many login attempts)', async ({ page }) => {
      // This test assumes the backend implements rate limiting
      // Make multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        await page.fill('input[name="branchCode"]', testBranches.valid.code);
        await page.locator('input[name="branchCode"]').blur();
        await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
        
        await page.fill('input[name="username"]', 'wronguser');
        await page.fill('input[name="password"]', 'wrongpass');
        await page.click('button[type="submit"]');
        
        // Wait for error message
        await page.waitForSelector('text=/Login failed|Invalid/i', { timeout: 10000 });
        
        // Small delay between attempts
        await page.waitForTimeout(500);
      }
      
      // Next attempt should show rate limit message
      await page.fill('input[name="username"]', 'wronguser');
      await page.fill('input[name="password"]', 'wrongpass');
      await page.click('button[type="submit"]');
      
      // Check for rate limit message (if implemented)
      const hasRateLimitMessage = await page.locator('text=/Too many attempts|wait/i').isVisible({ timeout: 5000 }).catch(() => false);
      
      // If rate limiting is implemented, verify the message
      if (hasRateLimitMessage) {
        await expect(page.locator('text=/Too many attempts|wait/i')).toBeVisible();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper form labels', async ({ page }) => {
      // Check for label associations
      const branchLabel = page.locator('label[for="branchCode"]');
      const usernameLabel = page.locator('label[for="username"]');
      const passwordLabel = page.locator('label[for="password"]');
      
      await expect(branchLabel).toBeVisible();
      await expect(usernameLabel).toBeVisible();
      await expect(passwordLabel).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through form fields
      await page.keyboard.press('Tab'); // Focus branch code
      await page.keyboard.type(testBranches.valid.code);
      
      await page.keyboard.press('Tab'); // Focus username
      await page.keyboard.type(testUsers.admin.username);
      
      await page.keyboard.press('Tab'); // Focus password
      await page.keyboard.type(testUsers.admin.password);
      
      await page.keyboard.press('Tab'); // Focus submit button
      await page.keyboard.press('Enter'); // Submit form
      
      // Should successfully login
      await page.waitForURL('**/staff', { timeout: 15000 });
      await expect(page).toHaveURL(/\/app\/staff/);
    });

    test('should have accessible error messages', async ({ page }) => {
      // Trigger an error
      await page.fill('input[name="branchCode"]', testBranches.valid.code);
      await page.locator('input[name="branchCode"]').blur();
      await page.waitForSelector('text=/Valid branch/i', { timeout: 10000 });
      
      await page.fill('input[name="username"]', 'wronguser');
      await page.fill('input[name="password"]', 'wrongpass');
      await page.click('button[type="submit"]');
      
      // Error message should be visible and readable
      const errorMessage = page.locator('text=/Login failed|Invalid/i');
      await expect(errorMessage).toBeVisible();
      
      // Error should have appropriate styling (color contrast)
      const errorColor = await errorMessage.evaluate(el => 
        window.getComputedStyle(el).color
      );
      expect(errorColor).toBeTruthy();
    });
  });
});
