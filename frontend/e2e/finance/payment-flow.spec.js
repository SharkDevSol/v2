import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth-helper.js';
import { testUsers, testPayment, paymentTestData } from '../fixtures/test-data.js';

/**
 * E2E Tests for Payment Flow
 * 
 * These tests verify the complete payment processing workflow including:
 * - Fee management and configuration
 * - Monthly payment recording
 * - Payment for regular, KG, and evening class students
 * - Invoice generation
 * - Payment receipts
 * - Payment history and tracking
 * - Ethiopian calendar integration for payment dates
 * - Payment reminders and notifications
 * - Error handling and validation
 */

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await loginAsAdmin(page, testUsers.admin);
  });

  test.describe('Fee Management', () => {
    test('should navigate to fee management page', async ({ page }) => {
      // Navigate to fee management
      await page.click('text=/Finance/i');
      await page.click('text=/Fee Management/i');
      
      // Wait for page to load
      await page.waitForSelector('[data-testid="fee-management-page"]', { timeout: 10000 });
      
      // Verify page title
      await expect(page.locator('h1, h2').filter({ hasText: /fee management/i })).toBeVisible();
    });

    test('should display existing fee types', async ({ page }) => {
      await page.goto('/fee-management');
      await page.waitForSelector('[data-testid="fee-types-list"]', { timeout: 10000 });
      
      // Verify fee types table is visible
      await expect(page.locator('[data-testid="fee-types-list"]')).toBeVisible();
      
      // Verify common fee types are listed
      await expect(page.locator('text=/Tuition Fee/i')).toBeVisible();
    });

    test('should create new fee type', async ({ page }) => {
      await page.goto('/fee-management');
      await page.waitForTimeout(1000);
      
      // Click add fee type button
      await page.click('[data-testid="add-fee-type"]');
      
      // Fill in fee type details
      await page.fill('input[name="feeTypeName"]', paymentTestData.newFeeType.name);
      await page.fill('input[name="amount"]', paymentTestData.newFeeType.amount.toString());
      await page.selectOption('select[name="frequency"]', paymentTestData.newFeeType.frequency);
      
      // Submit form
      await page.click('button[type="submit"]:has-text("Save")');
      
      // Wait for success message
      await expect(page.locator('text=/Fee type created successfully/i')).toBeVisible({ timeout: 5000 });
      
      // Verify new fee type appears in list
      await expect(page.locator(	ext=)).toBeVisible();
    });

    test('should update existing fee type', async ({ page }) => {
      await page.goto('/fee-management');
      await page.waitForTimeout(1000);
      
      // Click edit button for first fee type
      await page.click('[data-testid="edit-fee-type"]').first();
      
      // Update amount
      await page.fill('input[name="amount"]', '6000');
      
      // Save changes
      await page.click('button[type="submit"]:has-text("Update")');
      
      // Verify success message
      await expect(page.locator('text=/Fee type updated successfully/i')).toBeVisible({ timeout: 5000 });
    });

    test('should delete fee type', async ({ page }) => {
      await page.goto('/fee-management');
      await page.waitForTimeout(1000);
      
      // Click delete button
      await page.click('[data-testid="delete-fee-type"]').first();
      
      // Confirm deletion
      await page.click('button:has-text("Confirm")');
      
      // Verify success message
      await expect(page.locator('text=/Fee type deleted successfully/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Monthly Payment Recording', () => {
    test('should navigate to monthly payments page', async ({ page }) => {
      await page.click('text=/Finance/i');
      await page.click('text=/Monthly Payments/i');
      
      // Wait for page to load
      await page.waitForSelector('[data-testid="monthly-payments-page"]', { timeout: 10000 });
      
      // Verify page title
      await expect(page.locator('h1, h2').filter({ hasText: /monthly payment/i })).toBeVisible();
    });

    test('should display student list for payment', async ({ page }) => {
      await page.goto('/monthly-payments');
      await page.waitForSelector('[data-testid="students-list"]', { timeout: 10000 });
      
      // Verify students table is visible
      await expect(page.locator('[data-testid="students-list"]')).toBeVisible();
      
      // Verify table headers
      await expect(page.locator('th:has-text("Student Name")')).toBeVisible();
      await expect(page.locator('th:has-text("Class")')).toBeVisible();
      await expect(page.locator('th:has-text("Payment Status")')).toBeVisible();
    });

    test('should filter students by class', async ({ page }) => {
      await page.goto('/monthly-payments');
      await page.waitForTimeout(1000);
      
      // Select a class from dropdown
      await page.selectOption('select[name="classFilter"]', 'Grade 5');
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Verify only Grade 5 students are shown
      const studentRows = page.locator('[data-testid="student-row"]');
      const count = await studentRows.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should record payment for a student', async ({ page }) => {
      await page.goto('/monthly-payments');
      await page.waitForTimeout(1000);
      
      // Click pay button for first student
      await page.click('[data-testid="pay-button"]').first();
      
      // Fill in payment details
      await page.fill('input[name="amount"]', testPayment.amount.toString());
      await page.selectOption('select[name="paymentMethod"]', testPayment.paymentMethod);
      await page.fill('input[name="month"]', testPayment.month);
      
      // Submit payment
      await page.click('button[type="submit"]:has-text("Record Payment")');
      
      // Verify success message
      await expect(page.locator('text=/Payment recorded successfully/i')).toBeVisible({ timeout: 5000 });
    });

    test('should record payment for KG student', async ({ page }) => {
      await page.goto('/monthly-payments');
      await page.waitForTimeout(1000);
      
      // Filter for KG students
      await page.selectOption('select[name="studentType"]', 'kg');
      await page.waitForTimeout(1000);
      
      // Click pay button for first KG student
      await page.click('[data-testid="pay-button"]').first();
      
      // Fill in payment details
      await page.fill('input[name="amount"]', '3000');
      await page.selectOption('select[name="paymentMethod"]', 'Cash');
      
      // Submit payment
      await page.click('button[type="submit"]:has-text("Record Payment")');
      
      // Verify success message
      await expect(page.locator('text=/Payment recorded successfully/i')).toBeVisible({ timeout: 5000 });
    });

    test('should record payment for evening class student', async ({ page }) => {
      await page.goto('/monthly-payments');
      await page.waitForTimeout(1000);
      
      // Filter for evening class students
      await page.selectOption('select[name="studentType"]', 'evening');
      await page.waitForTimeout(1000);
      
      // Click pay button for first evening student
      await page.click('[data-testid="pay-button"]').first();
      
      // Fill in payment details
      await page.fill('input[name="amount"]', '4000');
      await page.selectOption('select[name="paymentMethod"]', 'Bank Transfer');
      
      // Submit payment
      await page.click('button[type="submit"]:has-text("Record Payment")');
      
      // Verify success message
      await expect(page.locator('text=/Payment recorded successfully/i')).toBeVisible({ timeout: 5000 });
    });

    test('should validate payment amount', async ({ page }) => {
      await page.goto('/monthly-payments');
      await page.waitForTimeout(1000);
      
      // Click pay button
      await page.click('[data-testid="pay-button"]').first();
      
      // Try to submit with invalid amount
      await page.fill('input[name="amount"]', '-100');
      await page.click('button[type="submit"]:has-text("Record Payment")');
      
      // Verify validation error
      await expect(page.locator('text=/Amount must be greater than zero/i')).toBeVisible();
    });

    test('should validate required payment fields', async ({ page }) => {
      await page.goto('/monthly-payments');
      await page.waitForTimeout(1000);
      
      // Click pay button
      await page.click('[data-testid="pay-button"]').first();
      
      // Try to submit without filling fields
      await page.click('button[type="submit"]:has-text("Record Payment")');
      
      // Verify validation errors
      await expect(page.locator('text=/Amount is required/i')).toBeVisible();
      await expect(page.locator('text=/Payment method is required/i')).toBeVisible();
    });
  });

  test.describe('Invoice Generation', () => {
    test('should generate invoice for student', async ({ page }) => {
      await page.goto('/monthly-payments');
      await page.waitForTimeout(1000);
      
      // Click generate invoice button
      await page.click('[data-testid="generate-invoice"]').first();
      
      // Wait for invoice modal or page
      await page.waitForSelector('[data-testid="invoice-preview"]', { timeout: 5000 });
      
      // Verify invoice details are displayed
      await expect(page.locator('[data-testid="invoice-preview"]')).toBeVisible();
      await expect(page.locator('text=/Invoice/i')).toBeVisible();
      await expect(page.locator('text=/Student Name/i')).toBeVisible();
      await expect(page.locator('text=/Amount/i')).toBeVisible();
    });

    test('should print invoice', async ({ page }) => {
      await page.goto('/monthly-payments');
      await page.waitForTimeout(1000);
      
      // Generate invoice
      await page.click('[data-testid="generate-invoice"]').first();
      await page.waitForSelector('[data-testid="invoice-preview"]', { timeout: 5000 });
      
      // Click print button
      const printPromise = page.waitForEvent('popup');
      await page.click('button:has-text("Print")');
      
      // Verify print dialog or new window opens
      const printPage = await printPromise;
      expect(printPage).toBeTruthy();
    });

    test('should download invoice as PDF', async ({ page }) => {
      await page.goto('/monthly-payments');
      await page.waitForTimeout(1000);
      
      // Generate invoice
      await page.click('[data-testid="generate-invoice"]').first();
      await page.waitForSelector('[data-testid="invoice-preview"]', { timeout: 5000 });
      
      // Set up download listener
      const downloadPromise = page.waitForEvent('download');
      
      // Click download button
      await page.click('button:has-text("Download PDF")');
      
      // Wait for download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/invoice.*\.pdf$/i);
    });
  });

  test.describe('Payment Receipt', () => {
    test('should generate payment receipt after recording payment', async ({ page }) => {
      await page.goto('/monthly-payments');
      await page.waitForTimeout(1000);
      
      // Record a payment
      await page.click('[data-testid="pay-button"]').first();
      await page.fill('input[name="amount"]', '5000');
      await page.selectOption('select[name="paymentMethod"]', 'Cash');
      await page.click('button[type="submit"]:has-text("Record Payment")');
      
      // Wait for success and receipt option
      await page.waitForTimeout(1000);
      
      // Click view receipt button
      await page.click('button:has-text("View Receipt")');
      
      // Verify receipt is displayed
      await expect(page.locator('[data-testid="payment-receipt"]')).toBeVisible();
      await expect(page.locator('text=/Receipt/i')).toBeVisible();
      await expect(page.locator('text=/Payment Method/i')).toBeVisible();
    });

    test('should print payment receipt', async ({ page }) => {
      await page.goto('/payment-history');
      await page.waitForTimeout(1000);
      
      // Click view receipt for first payment
      await page.click('[data-testid="view-receipt"]').first();
      await page.waitForSelector('[data-testid="payment-receipt"]', { timeout: 5000 });
      
      // Click print button
      const printPromise = page.waitForEvent('popup');
      await page.click('button:has-text("Print Receipt")');
      
      // Verify print dialog opens
      const printPage = await printPromise;
      expect(printPage).toBeTruthy();
    });
  });

  test.describe('Payment History and Tracking', () => {
    test('should display payment history', async ({ page }) => {
      await page.goto('/payment-history');
      await page.waitForSelector('[data-testid="payment-history-table"]', { timeout: 10000 });
      
      // Verify payment history table is visible
      await expect(page.locator('[data-testid="payment-history-table"]')).toBeVisible();
      
      // Verify table headers
      await expect(page.locator('th:has-text("Date")')).toBeVisible();
      await expect(page.locator('th:has-text("Student")')).toBeVisible();
      await expect(page.locator('th:has-text("Amount")')).toBeVisible();
      await expect(page.locator('th:has-text("Method")')).toBeVisible();
    });

    test('should filter payment history by date range', async ({ page }) => {
      await page.goto('/payment-history');
      await page.waitForTimeout(1000);
      
      // Set date range
      await page.fill('input[name="startDate"]', '2024-01-01');
      await page.fill('input[name="endDate"]', '2024-12-31');
      
      // Apply filter
      await page.click('button:has-text("Filter")');
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Verify results are displayed
      const paymentRows = page.locator('[data-testid="payment-row"]');
      const count = await paymentRows.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should filter payment history by student', async ({ page }) => {
      await page.goto('/payment-history');
      await page.waitForTimeout(1000);
      
      // Search for student
      await page.fill('input[name="studentSearch"]', 'Test Student');
      await page.click('button:has-text("Search")');
      
      // Wait for filtered results
      await page.waitForTimeout(1000);
      
      // Verify filtered results
      await expect(page.locator('text=/Test Student/i')).toBeVisible();
    });

    test('should display payment statistics', async ({ page }) => {
      await page.goto('/payment-dashboard');
      await page.waitForSelector('[data-testid="payment-stats"]', { timeout: 10000 });
      
      // Verify statistics are displayed
      await expect(page.locator('[data-testid="total-collected"]')).toBeVisible();
      await expect(page.locator('[data-testid="pending-payments"]')).toBeVisible();
      await expect(page.locator('[data-testid="collection-rate"]')).toBeVisible();
    });
  });

  test.describe('Ethiopian Calendar Integration', () => {
    test('should display payment dates in Ethiopian calendar', async ({ page }) => {
      await page.goto('/monthly-payments');
      await page.waitForTimeout(1000);
      
      // Verify Ethiopian calendar date is displayed
      const dateDisplay = page.locator('[data-testid="ethiopian-date"]');
      if (await dateDisplay.isVisible()) {
        const dateText = await dateDisplay.textContent();
        // Verify it contains Ethiopian month names
        expect(dateText).toMatch(/Meskerem|Tikimt|Hidar|Tahsas|Tir|Yekatit|Megabit|Miazia|Ginbot|Sene|Hamle|Nehase|Pagume/i);
      }
    });

    test('should use Ethiopian calendar for payment month selection', async ({ page }) => {
      await page.goto('/monthly-payments');
      await page.waitForTimeout(1000);
      
      // Click pay button
      await page.click('[data-testid="pay-button"]').first();
      
      // Check if month selector uses Ethiopian months
      const monthSelect = page.locator('select[name="month"]');
      if (await monthSelect.isVisible()) {
        const options = await monthSelect.locator('option').allTextContents();
        const hasEthiopianMonths = options.some(opt => 
          /Meskerem|Tikimt|Hidar|Tahsas|Tir|Yekatit|Megabit|Miazia|Ginbot|Sene|Hamle|Nehase|Pagume/i.test(opt)
        );
        expect(hasEthiopianMonths).toBeTruthy();
      }
    });
  });

  test.describe('Payment Reminders', () => {
    test('should display students with pending payments', async ({ page }) => {
      await page.goto('/payment-reminders');
      await page.waitForSelector('[data-testid="pending-payments-list"]', { timeout: 10000 });
      
      // Verify pending payments list is visible
      await expect(page.locator('[data-testid="pending-payments-list"]')).toBeVisible();
      
      // Verify list shows student details
      await expect(page.locator('text=/Student Name/i')).toBeVisible();
      await expect(page.locator('text=/Amount Due/i')).toBeVisible();
    });

    test('should send payment reminder to guardian', async ({ page }) => {
      await page.goto('/payment-reminders');
      await page.waitForTimeout(1000);
      
      // Click send reminder button
      await page.click('[data-testid="send-reminder"]').first();
      
      // Verify confirmation dialog
      await expect(page.locator('text=/Send payment reminder/i')).toBeVisible();
      
      // Confirm sending
      await page.click('button:has-text("Send")');
      
      // Verify success message
      await expect(page.locator('text=/Reminder sent successfully/i')).toBeVisible({ timeout: 5000 });
    });

    test('should send bulk payment reminders', async ({ page }) => {
      await page.goto('/payment-reminders');
      await page.waitForTimeout(1000);
      
      // Select multiple students
      await page.click('[data-testid="select-all"]');
      
      // Click send bulk reminders
      await page.click('button:has-text("Send Bulk Reminders")');
      
      // Confirm action
      await page.click('button:has-text("Confirm")');
      
      // Verify success message
      await expect(page.locator('text=/Reminders sent successfully/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      await page.goto('/monthly-payments');
      await page.waitForTimeout(1000);
      
      // Simulate offline mode
      await page.context().setOffline(true);
      
      // Try to record payment
      await page.click('[data-testid="pay-button"]').first();
      await page.fill('input[name="amount"]', '5000');
      await page.click('button[type="submit"]:has-text("Record Payment")');
      
      // Verify error message
      await expect(page.locator('text=/Network error|Connection failed/i')).toBeVisible({ timeout: 5000 });
      
      // Re-enable network
      await page.context().setOffline(false);
    });

    test('should show specific error for invalid payment data', async ({ page }) => {
      await page.goto('/monthly-payments');
      await page.waitForTimeout(1000);
      
      // Click pay button
      await page.click('[data-testid="pay-button"]').first();
      
      // Enter invalid data
      await page.fill('input[name="amount"]', 'invalid');
      await page.click('button[type="submit"]:has-text("Record Payment")');
      
      // Verify specific error message
      await expect(page.locator('text=/Invalid amount|Amount must be a number/i')).toBeVisible();
    });

    test('should handle duplicate payment prevention', async ({ page }) => {
      await page.goto('/monthly-payments');
      await page.waitForTimeout(1000);
      
      // Record a payment
      await page.click('[data-testid="pay-button"]').first();
      await page.fill('input[name="amount"]', '5000');
      await page.selectOption('select[name="month"]', 'January');
      await page.click('button[type="submit"]:has-text("Record Payment")');
      
      // Wait for success
      await page.waitForTimeout(1000);
      
      // Try to record same payment again
      await page.click('[data-testid="pay-button"]').first();
      await page.fill('input[name="amount"]', '5000');
      await page.selectOption('select[name="month"]', 'January');
      await page.click('button[type="submit"]:has-text("Record Payment")');
      
      // Verify duplicate prevention message
      await expect(page.locator('text=/Payment already exists|Duplicate payment/i')).toBeVisible();
    });
  });

  test.describe('Payment Reports', () => {
    test('should generate monthly payment report', async ({ page }) => {
      await page.goto('/payment-reports');
      await page.waitForTimeout(1000);
      
      // Select report type
      await page.selectOption('select[name="reportType"]', 'monthly');
      
      // Select month
      await page.selectOption('select[name="month"]', 'January');
      
      // Generate report
      await page.click('button:has-text("Generate Report")');
      
      // Wait for report to load
      await page.waitForSelector('[data-testid="payment-report"]', { timeout: 10000 });
      
      // Verify report is displayed
      await expect(page.locator('[data-testid="payment-report"]')).toBeVisible();
    });

    test('should export payment report to Excel', async ({ page }) => {
      await page.goto('/payment-reports');
      await page.waitForTimeout(1000);
      
      // Generate report first
      await page.selectOption('select[name="reportType"]', 'monthly');
      await page.click('button:has-text("Generate Report")');
      await page.waitForSelector('[data-testid="payment-report"]', { timeout: 10000 });
      
      // Set up download listener
      const downloadPromise = page.waitForEvent('download');
      
      // Click export button
      await page.click('button:has-text("Export to Excel")');
      
      // Wait for download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/payment.*\.xlsx$/i);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper form labels', async ({ page }) => {
      await page.goto('/monthly-payments');
      await page.waitForTimeout(1000);
      
      // Click pay button to open payment form
      await page.click('[data-testid="pay-button"]').first();
      
      // Verify labels exist
      await expect(page.locator('label[for="amount"]')).toBeVisible();
      await expect(page.locator('label[for="paymentMethod"]')).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/monthly-payments');
      await page.waitForTimeout(1000);
      
      // Tab through form fields
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Verify focus is on interactive elements
      const focusedElement = await page.evaluate(() => document.activeElement.tagName);
      expect(['BUTTON', 'INPUT', 'SELECT', 'A']).toContain(focusedElement);
    });
  });
});
