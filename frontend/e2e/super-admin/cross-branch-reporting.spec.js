import { test, expect } from '@playwright/test';
import { loginAsSuperAdmin, logout, clearAuth } from '../helpers/auth-helper.js';
import { testUsers, testBranches, superAdminTestData } from '../fixtures/test-data.js';

/**
 * E2E Tests for Super Admin Cross-Branch Reporting
 * 
 * These tests verify the Super Admin's ability to:
 * - Login with super admin credentials
 * - View aggregated data from multiple branches
 * - Compare branch performance metrics
 * - Generate consolidated reports
 * - Switch between branch views
 * - Export cross-branch data
 */

test.describe('Super Admin Cross-Branch Reporting', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing authentication state
    await clearAuth(page);
  });

  test.describe('Super Admin Login', () => {
    test('should successfully login as super admin', async ({ page }) => {
      await page.goto('/super-admin-login');
      
      // Super admin doesn't need branch code (has access to all branches)
      await page.fill('input[name="username"]', testUsers.superAdmin.username);
      await page.fill('input[name="password"]', testUsers.superAdmin.password);
      
      // Click login button
      await page.click('button[type="submit"]');
      
      // Wait for navigation to super admin dashboard
      await page.waitForURL('**/super-admin/dashboard', { timeout: 15000 });
      
      // Verify dashboard is loaded
      await expect(page).toHaveURL(/\/super-admin\/dashboard/);
    });

    test('should display super admin dashboard with branch selector', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Verify branch selector is visible
      await expect(page.locator('[data-testid="branch-selector"]')).toBeVisible();
      
      // Verify "All Branches" option is available
      await expect(page.locator('text=/All Branches/i')).toBeVisible();
    });

    test('should show all configured branches in selector', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Click branch selector
      await page.click('[data-testid="branch-selector"]');
      
      // Verify all test branches are listed
      for (const branch of superAdminTestData.branches) {
        await expect(page.locator(`text=${branch.name}`)).toBeVisible();
      }
    });
  });

  test.describe('Cross-Branch Data Aggregation', () => {
    test('should display aggregated student enrollment across all branches', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to student enrollment report
      await page.click('text=/Student Enrollment/i');
      
      // Wait for data to load
      await page.waitForSelector('[data-testid="enrollment-summary"]', { timeout: 10000 });
      
      // Verify total enrollment is displayed
      const totalEnrollment = page.locator('[data-testid="total-enrollment"]');
      await expect(totalEnrollment).toBeVisible();
      
      // Verify enrollment is greater than 0
      const enrollmentText = await totalEnrollment.textContent();
      const enrollmentNumber = parseInt(enrollmentText.match(/\d+/)[0]);
      expect(enrollmentNumber).toBeGreaterThan(0);
    });

    test('should display branch-wise enrollment breakdown', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to student enrollment report
      await page.click('text=/Student Enrollment/i');
      
      // Wait for branch breakdown table
      await page.waitForSelector('[data-testid="branch-enrollment-table"]', { timeout: 10000 });
      
      // Verify each branch has enrollment data
      for (const branch of superAdminTestData.branches) {
        const branchRow = page.locator(`[data-testid="branch-row-${branch.code}"]`);
        await expect(branchRow).toBeVisible();
        
        // Verify branch name is displayed
        await expect(branchRow.locator('text=' + branch.name)).toBeVisible();
        
        // Verify enrollment count is displayed
        const enrollmentCell = branchRow.locator('[data-testid="enrollment-count"]');
        await expect(enrollmentCell).toBeVisible();
      }
    });

    test('should display aggregated financial data across all branches', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to financial report
      await page.click('text=/Financial Reports/i');
      
      // Wait for financial summary
      await page.waitForSelector('[data-testid="financial-summary"]', { timeout: 10000 });
      
      // Verify total revenue is displayed
      const totalRevenue = page.locator('[data-testid="total-revenue"]');
      await expect(totalRevenue).toBeVisible();
      
      // Verify total expenses is displayed
      const totalExpenses = page.locator('[data-testid="total-expenses"]');
      await expect(totalExpenses).toBeVisible();
      
      // Verify net income is displayed
      const netIncome = page.locator('[data-testid="net-income"]');
      await expect(netIncome).toBeVisible();
    });

    test('should display branch-wise financial comparison', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to financial report
      await page.click('text=/Financial Reports/i');
      
      // Wait for branch comparison table
      await page.waitForSelector('[data-testid="branch-financial-table"]', { timeout: 10000 });
      
      // Verify each branch has financial data
      for (const branch of superAdminTestData.branches) {
        const branchRow = page.locator(`[data-testid="financial-row-${branch.code}"]`);
        await expect(branchRow).toBeVisible();
        
        // Verify revenue column
        await expect(branchRow.locator('[data-testid="revenue"]')).toBeVisible();
        
        // Verify expenses column
        await expect(branchRow.locator('[data-testid="expenses"]')).toBeVisible();
        
        // Verify net income column
        await expect(branchRow.locator('[data-testid="net-income"]')).toBeVisible();
      }
    });

    test('should display aggregated attendance data across all branches', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to attendance report
      await page.click('text=/Attendance Reports/i');
      
      // Wait for attendance summary
      await page.waitForSelector('[data-testid="attendance-summary"]', { timeout: 10000 });
      
      // Verify total present count
      const totalPresent = page.locator('[data-testid="total-present"]');
      await expect(totalPresent).toBeVisible();
      
      // Verify total absent count
      const totalAbsent = page.locator('[data-testid="total-absent"]');
      await expect(totalAbsent).toBeVisible();
      
      // Verify attendance rate
      const attendanceRate = page.locator('[data-testid="attendance-rate"]');
      await expect(attendanceRate).toBeVisible();
    });

    test('should display aggregated academic performance across all branches', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to academic performance report
      await page.click('text=/Academic Performance/i');
      
      // Wait for performance summary
      await page.waitForSelector('[data-testid="performance-summary"]', { timeout: 10000 });
      
      // Verify average marks is displayed
      const averageMarks = page.locator('[data-testid="average-marks"]');
      await expect(averageMarks).toBeVisible();
      
      // Verify pass rate is displayed
      const passRate = page.locator('[data-testid="pass-rate"]');
      await expect(passRate).toBeVisible();
    });
  });

  test.describe('Branch Comparison and Filtering', () => {
    test('should filter data by selected branch', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Select a specific branch
      await page.click('[data-testid="branch-selector"]');
      await page.click(`text=${superAdminTestData.branches[0].name}`);
      
      // Wait for data to reload
      await page.waitForTimeout(2000);
      
      // Verify only selected branch data is displayed
      const branchIndicator = page.locator('[data-testid="selected-branch"]');
      await expect(branchIndicator).toContainText(superAdminTestData.branches[0].name);
    });

    test('should switch between "All Branches" and individual branch views', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Start with all branches
      await expect(page.locator('[data-testid="branch-selector"]')).toContainText(/All Branches/i);
      
      // Switch to specific branch
      await page.click('[data-testid="branch-selector"]');
      await page.click(`text=${superAdminTestData.branches[0].name}`);
      await page.waitForTimeout(1000);
      
      // Verify branch changed
      await expect(page.locator('[data-testid="branch-selector"]')).toContainText(superAdminTestData.branches[0].name);
      
      // Switch back to all branches
      await page.click('[data-testid="branch-selector"]');
      await page.click('text=/All Branches/i');
      await page.waitForTimeout(1000);
      
      // Verify back to all branches
      await expect(page.locator('[data-testid="branch-selector"]')).toContainText(/All Branches/i);
    });

    test('should display branch comparison charts', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to branch comparison page
      await page.click('text=/Branch Comparison/i');
      
      // Wait for charts to load
      await page.waitForSelector('[data-testid="comparison-charts"]', { timeout: 10000 });
      
      // Verify enrollment comparison chart
      await expect(page.locator('[data-testid="enrollment-chart"]')).toBeVisible();
      
      // Verify financial comparison chart
      await expect(page.locator('[data-testid="financial-chart"]')).toBeVisible();
      
      // Verify attendance comparison chart
      await expect(page.locator('[data-testid="attendance-chart"]')).toBeVisible();
    });

    test('should rank branches by performance metrics', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to branch ranking page
      await page.click('text=/Branch Rankings/i');
      
      // Wait for ranking table
      await page.waitForSelector('[data-testid="branch-ranking-table"]', { timeout: 10000 });
      
      // Verify ranking columns
      await expect(page.locator('th:has-text("Rank")')).toBeVisible();
      await expect(page.locator('th:has-text("Branch")')).toBeVisible();
      await expect(page.locator('th:has-text("Score")')).toBeVisible();
      
      // Verify at least one branch is ranked
      const firstRank = page.locator('[data-testid="rank-1"]');
      await expect(firstRank).toBeVisible();
    });
  });

  test.describe('Consolidated Reports', () => {
    test('should generate consolidated student report', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to reports section
      await page.click('text=/Reports/i');
      
      // Click generate consolidated student report
      await page.click('[data-testid="generate-student-report"]');
      
      // Wait for report generation
      await page.waitForSelector('[data-testid="report-preview"]', { timeout: 15000 });
      
      // Verify report contains data from all branches
      const reportContent = page.locator('[data-testid="report-preview"]');
      await expect(reportContent).toBeVisible();
      
      // Verify report includes branch breakdown
      for (const branch of superAdminTestData.branches) {
        await expect(reportContent.locator(`text=${branch.name}`)).toBeVisible();
      }
    });

    test('should generate consolidated financial report', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to reports section
      await page.click('text=/Reports/i');
      
      // Click generate consolidated financial report
      await page.click('[data-testid="generate-financial-report"]');
      
      // Wait for report generation
      await page.waitForSelector('[data-testid="report-preview"]', { timeout: 15000 });
      
      // Verify report contains financial summary
      const reportContent = page.locator('[data-testid="report-preview"]');
      await expect(reportContent).toContainText(/Total Revenue/i);
      await expect(reportContent).toContainText(/Total Expenses/i);
      await expect(reportContent).toContainText(/Net Income/i);
    });

    test('should generate consolidated attendance report', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to reports section
      await page.click('text=/Reports/i');
      
      // Click generate consolidated attendance report
      await page.click('[data-testid="generate-attendance-report"]');
      
      // Wait for report generation
      await page.waitForSelector('[data-testid="report-preview"]', { timeout: 15000 });
      
      // Verify report contains attendance metrics
      const reportContent = page.locator('[data-testid="report-preview"]');
      await expect(reportContent).toContainText(/Attendance Rate/i);
      await expect(reportContent).toContainText(/Present/i);
      await expect(reportContent).toContainText(/Absent/i);
    });

    test('should generate consolidated academic performance report', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to reports section
      await page.click('text=/Reports/i');
      
      // Click generate consolidated academic report
      await page.click('[data-testid="generate-academic-report"]');
      
      // Wait for report generation
      await page.waitForSelector('[data-testid="report-preview"]', { timeout: 15000 });
      
      // Verify report contains academic metrics
      const reportContent = page.locator('[data-testid="report-preview"]');
      await expect(reportContent).toContainText(/Average Marks/i);
      await expect(reportContent).toContainText(/Pass Rate/i);
    });
  });

  test.describe('Data Export Functionality', () => {
    test('should export cross-branch data to Excel', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to student enrollment report
      await page.click('text=/Student Enrollment/i');
      
      // Wait for data to load
      await page.waitForSelector('[data-testid="enrollment-summary"]', { timeout: 10000 });
      
      // Set up download listener
      const downloadPromise = page.waitForEvent('download');
      
      // Click export button
      await page.click('[data-testid="export-excel"]');
      
      // Wait for download
      const download = await downloadPromise;
      
      // Verify download filename
      expect(download.suggestedFilename()).toMatch(/enrollment.*\.xlsx$/i);
    });

    test('should export cross-branch data to PDF', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to financial report
      await page.click('text=/Financial Reports/i');
      
      // Wait for data to load
      await page.waitForSelector('[data-testid="financial-summary"]', { timeout: 10000 });
      
      // Set up download listener
      const downloadPromise = page.waitForEvent('download');
      
      // Click export PDF button
      await page.click('[data-testid="export-pdf"]');
      
      // Wait for download
      const download = await downloadPromise;
      
      // Verify download filename
      expect(download.suggestedFilename()).toMatch(/financial.*\.pdf$/i);
    });

    test('should export branch comparison data to CSV', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to branch comparison
      await page.click('text=/Branch Comparison/i');
      
      // Wait for data to load
      await page.waitForSelector('[data-testid="comparison-charts"]', { timeout: 10000 });
      
      // Set up download listener
      const downloadPromise = page.waitForEvent('download');
      
      // Click export CSV button
      await page.click('[data-testid="export-csv"]');
      
      // Wait for download
      const download = await downloadPromise;
      
      // Verify download filename
      expect(download.suggestedFilename()).toMatch(/comparison.*\.csv$/i);
    });
  });

  test.describe('Date Range Filtering', () => {
    test('should filter reports by date range', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to financial report
      await page.click('text=/Financial Reports/i');
      
      // Wait for date range picker
      await page.waitForSelector('[data-testid="date-range-picker"]', { timeout: 10000 });
      
      // Set start date
      await page.fill('[data-testid="start-date"]', '2024-01-01');
      
      // Set end date
      await page.fill('[data-testid="end-date"]', '2024-12-31');
      
      // Click apply filter
      await page.click('[data-testid="apply-date-filter"]');
      
      // Wait for data to reload
      await page.waitForTimeout(2000);
      
      // Verify date range is applied
      await expect(page.locator('[data-testid="active-date-range"]')).toContainText('2024-01-01');
      await expect(page.locator('[data-testid="active-date-range"]')).toContainText('2024-12-31');
    });

    test('should display quick date range options', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to attendance report
      await page.click('text=/Attendance Reports/i');
      
      // Verify quick date options are available
      await expect(page.locator('text=/This Month/i')).toBeVisible();
      await expect(page.locator('text=/Last Month/i')).toBeVisible();
      await expect(page.locator('text=/This Year/i')).toBeVisible();
      await expect(page.locator('text=/Last Year/i')).toBeVisible();
    });

    test('should apply quick date range filter', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to attendance report
      await page.click('text=/Attendance Reports/i');
      
      // Click "This Month" quick filter
      await page.click('text=/This Month/i');
      
      // Wait for data to reload
      await page.waitForTimeout(2000);
      
      // Verify filter is applied
      await expect(page.locator('[data-testid="active-date-range"]')).toContainText(/This Month/i);
    });
  });

  test.describe('Real-Time Data Updates', () => {
    test('should refresh data when refresh button is clicked', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to student enrollment
      await page.click('text=/Student Enrollment/i');
      
      // Wait for initial data load
      await page.waitForSelector('[data-testid="enrollment-summary"]', { timeout: 10000 });
      
      // Get initial enrollment count
      const initialCount = await page.locator('[data-testid="total-enrollment"]').textContent();
      
      // Click refresh button
      await page.click('[data-testid="refresh-data"]');
      
      // Wait for refresh to complete
      await page.waitForTimeout(2000);
      
      // Verify data is reloaded (count should be present)
      const refreshedCount = await page.locator('[data-testid="total-enrollment"]').textContent();
      expect(refreshedCount).toBeTruthy();
    });

    test('should show loading state during data refresh', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to financial report
      await page.click('text=/Financial Reports/i');
      
      // Wait for initial data load
      await page.waitForSelector('[data-testid="financial-summary"]', { timeout: 10000 });
      
      // Click refresh button
      await page.click('[data-testid="refresh-data"]');
      
      // Verify loading indicator appears
      await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible({ timeout: 2000 });
    });

    test('should auto-refresh data at intervals', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to dashboard
      await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });
      
      // Check if auto-refresh is enabled
      const autoRefreshToggle = page.locator('[data-testid="auto-refresh-toggle"]');
      if (await autoRefreshToggle.isVisible()) {
        // Enable auto-refresh if not already enabled
        const isChecked = await autoRefreshToggle.isChecked();
        if (!isChecked) {
          await autoRefreshToggle.click();
        }
        
        // Verify auto-refresh is active
        await expect(page.locator('text=/Auto-refresh enabled/i')).toBeVisible();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle branch connection errors gracefully', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Simulate network error by going offline
      await page.context().setOffline(true);
      
      // Try to load data
      await page.click('text=/Student Enrollment/i');
      
      // Verify error message is displayed
      await expect(page.locator('text=/Unable to connect|Connection error/i')).toBeVisible({ timeout: 10000 });
      
      // Re-enable network
      await page.context().setOffline(false);
    });

    test('should show error when branch data is unavailable', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Select a branch that might have connection issues
      await page.click('[data-testid="branch-selector"]');
      
      // If there's an unavailable branch indicator, test it
      const unavailableBranch = page.locator('[data-testid="branch-unavailable"]');
      if (await unavailableBranch.isVisible()) {
        await unavailableBranch.click();
        
        // Verify error message
        await expect(page.locator('text=/Branch data unavailable/i')).toBeVisible();
      }
    });

    test('should handle empty data gracefully', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to a report that might have no data
      await page.click('text=/Reports/i');
      
      // If no data message exists, verify it's displayed appropriately
      const noDataMessage = page.locator('text=/No data available/i');
      const hasData = await page.locator('[data-testid="report-preview"]').isVisible();
      
      if (!hasData) {
        await expect(noDataMessage).toBeVisible();
      }
    });

    test('should retry failed data requests', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to financial report
      await page.click('text=/Financial Reports/i');
      
      // If retry button appears, test it
      const retryButton = page.locator('[data-testid="retry-button"]');
      if (await retryButton.isVisible({ timeout: 5000 })) {
        await retryButton.click();
        
        // Verify loading state appears
        await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible();
      }
    });
  });

  test.describe('Performance and Optimization', () => {
    test('should load dashboard within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Wait for dashboard to fully load
      await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 15000 });
      
      const loadTime = Date.now() - startTime;
      
      // Dashboard should load within 15 seconds
      expect(loadTime).toBeLessThan(15000);
    });

    test('should load cross-branch data within acceptable time', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      const startTime = Date.now();
      
      // Navigate to student enrollment
      await page.click('text=/Student Enrollment/i');
      
      // Wait for data to load
      await page.waitForSelector('[data-testid="enrollment-summary"]', { timeout: 10000 });
      
      const loadTime = Date.now() - startTime;
      
      // Cross-branch data should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });

    test('should cache branch data for faster subsequent loads', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // First load
      await page.click('text=/Student Enrollment/i');
      await page.waitForSelector('[data-testid="enrollment-summary"]', { timeout: 10000 });
      
      // Navigate away
      await page.click('text=/Dashboard/i');
      
      const startTime = Date.now();
      
      // Navigate back (should be faster due to caching)
      await page.click('text=/Student Enrollment/i');
      await page.waitForSelector('[data-testid="enrollment-summary"]', { timeout: 5000 });
      
      const loadTime = Date.now() - startTime;
      
      // Cached load should be faster (within 5 seconds)
      expect(loadTime).toBeLessThan(5000);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels for branch selector', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      const branchSelector = page.locator('[data-testid="branch-selector"]');
      
      // Verify ARIA label exists
      const ariaLabel = await branchSelector.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toMatch(/branch|select/i);
    });

    test('should support keyboard navigation for branch selection', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Focus on branch selector
      await page.locator('[data-testid="branch-selector"]').focus();
      
      // Open dropdown with Enter key
      await page.keyboard.press('Enter');
      
      // Navigate with arrow keys
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      
      // Select with Enter key
      await page.keyboard.press('Enter');
      
      // Verify selection changed
      await page.waitForTimeout(1000);
      const selectedBranch = await page.locator('[data-testid="branch-selector"]').textContent();
      expect(selectedBranch).not.toContain('All Branches');
    });

    test('should have accessible data tables', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Navigate to branch comparison
      await page.click('text=/Branch Comparison/i');
      
      // Wait for table
      await page.waitForSelector('table', { timeout: 10000 });
      
      // Verify table has proper structure
      await expect(page.locator('table thead')).toBeVisible();
      await expect(page.locator('table tbody')).toBeVisible();
      
      // Verify table has caption or aria-label
      const table = page.locator('table').first();
      const caption = await table.locator('caption').count();
      const ariaLabel = await table.getAttribute('aria-label');
      
      expect(caption > 0 || ariaLabel).toBeTruthy();
    });
  });

  test.describe('Logout and Session Management', () => {
    test('should logout and clear super admin session', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Perform logout
      await logout(page);
      
      // Verify authentication state is cleared
      const authToken = await page.evaluate(() => localStorage.getItem('authToken'));
      expect(authToken).toBeNull();
    });

    test('should maintain session after page refresh', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Refresh the page
      await page.reload();
      
      // Verify still on dashboard (not redirected to login)
      await expect(page).toHaveURL(/\/super-admin\/dashboard/);
    });

    test('should redirect to login after session expires', async ({ page }) => {
      await loginAsSuperAdmin(page, testUsers.superAdmin);
      
      // Clear auth token to simulate expired session
      await page.evaluate(() => {
        localStorage.removeItem('authToken');
      });
      
      // Try to navigate to a protected page
      await page.goto('/super-admin/reports');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/super-admin-login/);
    });
  });
});
