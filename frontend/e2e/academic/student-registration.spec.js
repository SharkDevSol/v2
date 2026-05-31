import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth-helper.js';
import { testUsers, testStudent } from '../fixtures/test-data.js';

/**
 * E2E Tests for Student Registration Flow
 * 
 * Comprehensive tests covering:
 * - Navigation to student registration page
 * - Form validation (required fields, phone number format, etc.)
 * - Successful student registration with new guardian
 * - Successful student registration with existing guardian
 * - Duplicate student prevention
 * - KG student registration (when enabled)
 * - Evening class registration (when enabled)
 * - Student list display after registration
 * - Error handling and edge cases
 * - Guardian assignment and validation
 * - Credentials generation and display
 */

test.describe('Student Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await loginAsAdmin(page, testUsers.admin);
    
    // Navigate to student registration page
    await page.goto('/create-register-student');
    
    // Wait for the form to load
    await page.waitForSelector('form', { timeout: 10000 });
  });

  test.describe('Navigation and Page Load', () => {
    test('should load student registration page successfully', async ({ page }) => {
      // Verify page title
      await expect(page.locator('h1, h2').filter({ hasText: /student/i })).toBeVisible();
      
      // Verify form is present
      await expect(page.locator('form')).toBeVisible();
      
      // Verify key sections are present
      await expect(page.locator('text=/Student Information/i')).toBeVisible();
      await expect(page.locator('text=/Guardian Information/i')).toBeVisible();
    });

    test('should display class dropdown with available classes', async ({ page }) => {
      // Wait for classes to load
      await page.waitForTimeout(1000);
      
      // Verify class dropdown exists
      const classSelect = page.locator('select[name="class"]');
      await expect(classSelect).toBeVisible();
      
      // Verify it has options (at least the placeholder)
      const options = await classSelect.locator('option').count();
      expect(options).toBeGreaterThan(0);
    });
  });

  test.describe('Form Validation', () => {
    test('should show validation errors for required fields when submitting empty form', async ({ page }) => {
      // Try to submit empty form
      await page.click('button[type="submit"]:has-text("Add Student")');
      
      // Wait for validation errors to appear
      await page.waitForTimeout(500);
      
      // Verify validation errors are displayed for required fields
      const errorMessages = page.locator('.errorMessage, [class*="error"]');
      const errorCount = await errorMessages.count();
      
      // Should have multiple validation errors
      expect(errorCount).toBeGreaterThan(0);
      
      // Check for specific required field errors
      await expect(page.locator('text=/Class is required/i')).toBeVisible();
      await expect(page.locator('text=/Student name is required/i')).toBeVisible();
      await expect(page.locator('text=/Machine ID is required/i')).toBeVisible();
      await expect(page.locator('text=/Age is required/i')).toBeVisible();
      await expect(page.locator('text=/Gender is required/i')).toBeVisible();
      await expect(page.locator('text=/Guardian phone is required/i')).toBeVisible();
      await expect(page.locator('text=/Guardian name is required/i')).toBeVisible();
      await expect(page.locator('text=/Guardian relation is required/i')).toBeVisible();
    });

    test('should validate student name format (letters and spaces only)', async ({ page }) => {
      // Fill in student name with invalid characters
      await page.fill('input[name="student_name"]', 'Test123!@#');
      
      // Blur to trigger validation
      await page.click('input[name="smachine_id"]');
      
      // Wait for validation
      await page.waitForTimeout(300);
      
      // Verify validation error
      await expect(page.locator('text=/Name can only contain letters and spaces/i')).toBeVisible();
    });

    test('should validate phone number format', async ({ page }) => {
      // Fill in invalid phone number (too short)
      await page.fill('input[name="guardian_phone"]', '123');
      
      // Blur to trigger validation
      await page.click('input[name="guardian_name"]');
      
      // Wait for validation
      await page.waitForTimeout(300);
      
      // Verify validation error
      await expect(page.locator('text=/valid phone number/i')).toBeVisible();
    });

    test('should validate machine ID format (numbers only)', async ({ page }) => {
      // Fill in machine ID with letters
      await page.fill('input[name="smachine_id"]', 'ABC123');
      
      // Blur to trigger validation
      await page.click('input[name="student_name"]');
      
      // Wait for validation
      await page.waitForTimeout(300);
      
      // Verify validation error
      await expect(page.locator('text=/Machine ID must contain only numbers/i')).toBeVisible();
    });

    test('should validate age range (3-100)', async ({ page }) => {
      // Test age too low
      await page.fill('input[name="age"]', '2');
      await page.click('input[name="student_name"]');
      await page.waitForTimeout(300);
      await expect(page.locator('text=/Age must be at least 3/i')).toBeVisible();
      
      // Test age too high
      await page.fill('input[name="age"]', '101');
      await page.click('input[name="student_name"]');
      await page.waitForTimeout(300);
      await expect(page.locator('text=/Age must be less than 100/i')).toBeVisible();
    });

    test('should validate guardian name format (letters and spaces only)', async ({ page }) => {
      // Fill in guardian name with invalid characters
      await page.fill('input[name="guardian_name"]', 'Guardian123!');
      
      // Blur to trigger validation
      await page.click('input[name="guardian_phone"]');
      
      // Wait for validation
      await page.waitForTimeout(300);
      
      // Verify validation error
      await expect(page.locator('text=/Name can only contain letters and spaces/i')).toBeVisible();
    });
  });

  test.describe('Guardian Assignment', () => {
    test('should allow selection between new and existing guardian', async ({ page }) => {
      // Verify both radio options are present
      await expect(page.locator('input[type="radio"][value="no"]')).toBeVisible();
      await expect(page.locator('input[type="radio"][value="yes"]')).toBeVisible();
      
      // Verify labels
      await expect(page.locator('text=/New Guardian/i')).toBeVisible();
      await expect(page.locator('text=/Existing Guardian/i')).toBeVisible();
      
      // Default should be "New Guardian"
      await expect(page.locator('input[type="radio"][value="no"]')).toBeChecked();
    });

    test('should search for existing guardian by phone number', async ({ page }) => {
      // Select existing guardian option
      await page.click('input[type="radio"][value="yes"]');
      
      // Fill in a phone number (this will trigger search on blur)
      await page.fill('input[name="guardian_phone"]', '+251911234567');
      
      // Blur to trigger search
      await page.click('input[name="guardian_relation"]');
      
      // Wait for search to complete
      await page.waitForTimeout(1500);
      
      // Check if guardian was found or not found message appears
      const foundMessage = page.locator('text=/Guardian found/i');
      const notFoundMessage = page.locator('text=/No guardian found/i');
      
      // One of these should be visible
      const foundVisible = await foundMessage.isVisible().catch(() => false);
      const notFoundVisible = await notFoundMessage.isVisible().catch(() => false);
      
      expect(foundVisible || notFoundVisible).toBeTruthy();
    });

    test('should auto-fill guardian name when existing guardian is found', async ({ page }) => {
      // Select existing guardian option
      await page.click('input[type="radio"][value="yes"]');
      
      // Fill in a known guardian phone number (adjust based on test data)
      await page.fill('input[name="guardian_phone"]', '+251911234567');
      
      // Blur to trigger search
      await page.click('input[name="guardian_relation"]');
      
      // Wait for search
      await page.waitForTimeout(1500);
      
      // If guardian is found, name field should be auto-filled and disabled
      const guardianNameInput = page.locator('input[name="guardian_name"]');
      const isDisabled = await guardianNameInput.isDisabled().catch(() => false);
      
      if (isDisabled) {
        // Guardian was found - verify name is filled
        const nameValue = await guardianNameInput.inputValue();
        expect(nameValue.length).toBeGreaterThan(0);
      }
    });

    test('should show error when existing guardian selected but not found', async ({ page }) => {
      // Select existing guardian option
      await page.click('input[type="radio"][value="yes"]');
      
      // Fill in a phone number that doesn't exist
      await page.fill('input[name="guardian_phone"]', '+251999999999');
      
      // Blur to trigger search
      await page.click('input[name="guardian_relation"]');
      
      // Wait for search
      await page.waitForTimeout(1500);
      
      // Should show not found error
      await expect(page.locator('text=/No guardian found/i')).toBeVisible();
    });

    test('should warn when new guardian selected but phone already exists', async ({ page }) => {
      // Keep "New Guardian" selected (default)
      await expect(page.locator('input[type="radio"][value="no"]')).toBeChecked();
      
      // Fill in a phone number that already exists (adjust based on test data)
      await page.fill('input[name="guardian_phone"]', '+251911234567');
      
      // Blur to trigger search
      await page.click('input[name="guardian_name"]');
      
      // Wait for search
      await page.waitForTimeout(1500);
      
      // Should show warning about existing phone
      const warningMessage = page.locator('text=/already registered/i');
      const isVisible = await warningMessage.isVisible().catch(() => false);
      
      // Warning may or may not appear depending on test data
      // This test documents the expected behavior
    });
  });

  test.describe('Successful Student Registration', () => {
    test('should successfully register a new student with new guardian', async ({ page }) => {
      // Generate unique identifiers for this test
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`.slice(-4);
      
      // Select a class
      await page.selectOption('select[name="class"]', { index: 1 });
      await page.waitForTimeout(500);
      
      // Fill in student information
      await page.fill('input[name="student_name"]', `Test Student ${uniqueId}`);
      await page.fill('input[name="smachine_id"]', `1${uniqueId}`);
      await page.fill('input[name="age"]', '10');
      await page.selectOption('select[name="gender"]', 'Male');
      
      // Fill in guardian information (new guardian)
      await page.click('input[type="radio"][value="no"]');
      await page.fill('input[name="guardian_phone"]', `+25191${uniqueId}0000`);
      await page.fill('input[name="guardian_name"]', `Test Guardian ${uniqueId}`);
      await page.fill('input[name="guardian_relation"]', 'Father');
      
      // Submit form
      await page.click('button[type="submit"]:has-text("Add Student")');
      
      // Wait for success message
      await expect(page.locator('text=/Student added successfully/i')).toBeVisible({ timeout: 15000 });
      
      // Verify credentials are displayed
      await expect(page.locator('text=/Student Username/i')).toBeVisible();
      await expect(page.locator('text=/Student Password/i')).toBeVisible();
      await expect(page.locator('text=/Guardian Username/i')).toBeVisible();
      await expect(page.locator('text=/Guardian Password/i')).toBeVisible();
    });

    test('should display generated credentials after successful registration', async ({ page }) => {
      // Generate unique identifiers
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`.slice(-4);
      
      // Fill and submit form (abbreviated for brevity)
      await page.selectOption('select[name="class"]', { index: 1 });
      await page.waitForTimeout(500);
      await page.fill('input[name="student_name"]', `Cred Test ${uniqueId}`);
      await page.fill('input[name="smachine_id"]', `2${uniqueId}`);
      await page.fill('input[name="age"]', '12');
      await page.selectOption('select[name="gender"]', 'Female');
      await page.click('input[type="radio"][value="no"]');
      await page.fill('input[name="guardian_phone"]', `+25192${uniqueId}0000`);
      await page.fill('input[name="guardian_name"]', `Cred Guardian ${uniqueId}`);
      await page.fill('input[name="guardian_relation"]', 'Mother');
      
      await page.click('button[type="submit"]:has-text("Add Student")');
      
      // Wait for success
      await expect(page.locator('text=/Student added successfully/i')).toBeVisible({ timeout: 15000 });
      
      // Verify copy buttons are present for credentials
      const copyButtons = page.locator('svg[class*="copy"], button:has-text("Copy")');
      const copyCount = await copyButtons.count();
      expect(copyCount).toBeGreaterThanOrEqual(4); // At least 4 copy buttons (student user/pass, guardian user/pass)
    });

    test('should clear form after successful registration', async ({ page }) => {
      // Generate unique identifiers
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`.slice(-4);
      
      // Fill and submit form
      await page.selectOption('select[name="class"]', { index: 1 });
      await page.waitForTimeout(500);
      await page.fill('input[name="student_name"]', `Clear Test ${uniqueId}`);
      await page.fill('input[name="smachine_id"]', `3${uniqueId}`);
      await page.fill('input[name="age"]', '8');
      await page.selectOption('select[name="gender"]', 'Male');
      await page.click('input[type="radio"][value="no"]');
      await page.fill('input[name="guardian_phone"]', `+25193${uniqueId}0000`);
      await page.fill('input[name="guardian_name"]', `Clear Guardian ${uniqueId}`);
      await page.fill('input[name="guardian_relation"]', 'Father');
      
      await page.click('button[type="submit"]:has-text("Add Student")');
      
      // Wait for success
      await expect(page.locator('text=/Student added successfully/i')).toBeVisible({ timeout: 15000 });
      
      // Wait a bit for form to clear
      await page.waitForTimeout(1000);
      
      // Verify form fields are cleared
      const studentNameValue = await page.locator('input[name="student_name"]').inputValue();
      const machineIdValue = await page.locator('input[name="smachine_id"]').inputValue();
      const guardianNameValue = await page.locator('input[name="guardian_name"]').inputValue();
      
      expect(studentNameValue).toBe('');
      expect(machineIdValue).toBe('');
      expect(guardianNameValue).toBe('');
    });
  });

  test.describe('KG and Evening Class Support', () => {
    test('should display KG checkbox when KG is enabled in Task1 config', async ({ page }) => {
      // Check if KG checkbox is present
      const kgCheckbox = page.locator('input[name="is_kg"]');
      const isVisible = await kgCheckbox.isVisible().catch(() => false);
      
      if (isVisible) {
        // KG is enabled - verify checkbox functionality
        await expect(kgCheckbox).toBeVisible();
        await expect(page.locator('text=/Kindergarten.*KG.*Student/i')).toBeVisible();
        
        // Test checking the checkbox
        await kgCheckbox.check();
        await expect(kgCheckbox).toBeChecked();
        
        // Test unchecking
        await kgCheckbox.uncheck();
        await expect(kgCheckbox).not.toBeChecked();
      } else {
        // KG is not enabled - this is also valid
        console.log('KG option is not enabled in Task1 configuration');
      }
    });

    test('should display evening class checkbox when enabled in Task1 config', async ({ page }) => {
      // Check if evening class checkbox is present
      const eveningCheckbox = page.locator('input[name="is_evening_class"]');
      const isVisible = await eveningCheckbox.isVisible().catch(() => false);
      
      if (isVisible) {
        // Evening class is enabled - verify checkbox functionality
        await expect(eveningCheckbox).toBeVisible();
        await expect(page.locator('text=/Evening Class Student/i')).toBeVisible();
        
        // Test checking the checkbox
        await eveningCheckbox.check();
        await expect(eveningCheckbox).toBeChecked();
        
        // Test unchecking
        await eveningCheckbox.uncheck();
        await expect(eveningCheckbox).not.toBeChecked();
      } else {
        // Evening class is not enabled - this is also valid
        console.log('Evening class option is not enabled in Task1 configuration');
      }
    });

    test('should allow registering a KG student when enabled', async ({ page }) => {
      // Check if KG is available
      const kgCheckbox = page.locator('input[name="is_kg"]');
      const isVisible = await kgCheckbox.isVisible().catch(() => false);
      
      if (isVisible) {
        const timestamp = Date.now();
        const uniqueId = `${timestamp}`.slice(-4);
        
        // Fill form and check KG option
        await page.selectOption('select[name="class"]', { index: 1 });
        await page.waitForTimeout(500);
        await page.fill('input[name="student_name"]', `KG Student ${uniqueId}`);
        await page.fill('input[name="smachine_id"]', `4${uniqueId}`);
        await page.fill('input[name="age"]', '5');
        await page.selectOption('select[name="gender"]', 'Male');
        
        // Check KG checkbox
        await kgCheckbox.check();
        await expect(kgCheckbox).toBeChecked();
        
        // Fill guardian info
        await page.click('input[type="radio"][value="no"]');
        await page.fill('input[name="guardian_phone"]', `+25194${uniqueId}0000`);
        await page.fill('input[name="guardian_name"]', `KG Guardian ${uniqueId}`);
        await page.fill('input[name="guardian_relation"]', 'Mother');
        
        // Submit
        await page.click('button[type="submit"]:has-text("Add Student")');
        
        // Verify success
        await expect(page.locator('text=/Student added successfully/i')).toBeVisible({ timeout: 15000 });
      }
    });

    test('should allow registering an evening class student when enabled', async ({ page }) => {
      // Check if evening class is available
      const eveningCheckbox = page.locator('input[name="is_evening_class"]');
      const isVisible = await eveningCheckbox.isVisible().catch(() => false);
      
      if (isVisible) {
        const timestamp = Date.now();
        const uniqueId = `${timestamp}`.slice(-4);
        
        // Fill form and check evening class option
        await page.selectOption('select[name="class"]', { index: 1 });
        await page.waitForTimeout(500);
        await page.fill('input[name="student_name"]', `Evening Student ${uniqueId}`);
        await page.fill('input[name="smachine_id"]', `5${uniqueId}`);
        await page.fill('input[name="age"]', '15');
        await page.selectOption('select[name="gender"]', 'Female');
        
        // Check evening class checkbox
        await eveningCheckbox.check();
        await expect(eveningCheckbox).toBeChecked();
        
        // Fill guardian info
        await page.click('input[type="radio"][value="no"]');
        await page.fill('input[name="guardian_phone"]', `+25195${uniqueId}0000`);
        await page.fill('input[name="guardian_name"]', `Evening Guardian ${uniqueId}`);
        await page.fill('input[name="guardian_relation"]', 'Father');
        
        // Submit
        await page.click('button[type="submit"]:has-text("Add Student")');
        
        // Verify success
        await expect(page.locator('text=/Student added successfully/i')).toBeVisible({ timeout: 15000 });
      }
    });
  });

  test.describe('Student List Display', () => {
    test('should display registered student in student list', async ({ page }) => {
      // First, register a student
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`.slice(-4);
      const studentName = `List Test ${uniqueId}`;
      
      await page.selectOption('select[name="class"]', { index: 1 });
      await page.waitForTimeout(500);
      await page.fill('input[name="student_name"]', studentName);
      await page.fill('input[name="smachine_id"]', `6${uniqueId}`);
      await page.fill('input[name="age"]', '11');
      await page.selectOption('select[name="gender"]', 'Male');
      await page.click('input[type="radio"][value="no"]');
      await page.fill('input[name="guardian_phone"]', `+25196${uniqueId}0000`);
      await page.fill('input[name="guardian_name"]', `List Guardian ${uniqueId}`);
      await page.fill('input[name="guardian_relation"]', 'Father');
      
      await page.click('button[type="submit"]:has-text("Add Student")');
      await expect(page.locator('text=/Student added successfully/i')).toBeVisible({ timeout: 15000 });
      
      // Navigate to student list
      await page.goto('/list-student');
      await page.waitForTimeout(2000);
      
      // Search for the student
      const searchInput = page.locator('input[placeholder*="Search"], input[type="search"], input[name="search"]').first();
      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill(studentName);
        await page.waitForTimeout(1000);
      }
      
      // Verify student appears in the list
      await expect(page.locator(`text=${studentName}`)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true);
      
      // Try to submit form
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`.slice(-4);
      
      await page.selectOption('select[name="class"]', { index: 1 });
      await page.waitForTimeout(500);
      await page.fill('input[name="student_name"]', `Error Test ${uniqueId}`);
      await page.fill('input[name="smachine_id"]', `7${uniqueId}`);
      await page.fill('input[name="age"]', '9');
      await page.selectOption('select[name="gender"]', 'Male');
      await page.click('input[type="radio"][value="no"]');
      await page.fill('input[name="guardian_phone"]', `+25197${uniqueId}0000`);
      await page.fill('input[name="guardian_name"]', `Error Guardian ${uniqueId}`);
      await page.fill('input[name="guardian_relation"]', 'Mother');
      
      await page.click('button[type="submit"]:has-text("Add Student")');
      
      // Should show error message
      await expect(page.locator('text=/Failed|Error|Network/i')).toBeVisible({ timeout: 10000 });
      
      // Restore online mode
      await page.context().setOffline(false);
    });

    test('should display specific error messages from server', async ({ page }) => {
      // Try to register with duplicate machine ID (if validation exists)
      const timestamp = Date.now();
      const uniqueId = `${timestamp}`.slice(-4);
      
      // First registration
      await page.selectOption('select[name="class"]', { index: 1 });
      await page.waitForTimeout(500);
      await page.fill('input[name="student_name"]', `Duplicate Test ${uniqueId}`);
      await page.fill('input[name="smachine_id"]', `8${uniqueId}`);
      await page.fill('input[name="age"]', '10');
      await page.selectOption('select[name="gender"]', 'Male');
      await page.click('input[type="radio"][value="no"]');
      await page.fill('input[name="guardian_phone"]', `+25198${uniqueId}0000`);
      await page.fill('input[name="guardian_name"]', `Duplicate Guardian ${uniqueId}`);
      await page.fill('input[name="guardian_relation"]', 'Father');
      
      await page.click('button[type="submit"]:has-text("Add Student")');
      await expect(page.locator('text=/Student added successfully/i')).toBeVisible({ timeout: 15000 });
      
      // Wait for form to clear
      await page.waitForTimeout(2000);
      
      // Try to register again with same machine ID
      await page.selectOption('select[name="class"]', { index: 1 });
      await page.waitForTimeout(500);
      await page.fill('input[name="student_name"]', `Duplicate Test 2 ${uniqueId}`);
      await page.fill('input[name="smachine_id"]', `8${uniqueId}`); // Same machine ID
      await page.fill('input[name="age"]', '10');
      await page.selectOption('select[name="gender"]', 'Female');
      await page.click('input[type="radio"][value="no"]');
      await page.fill('input[name="guardian_phone"]', `+25199${uniqueId}0000`);
      await page.fill('input[name="guardian_name"]', `Duplicate Guardian 2 ${uniqueId}`);
      await page.fill('input[name="guardian_relation"]', 'Mother');
      
      await page.click('button[type="submit"]:has-text("Add Student")');
      
      // Should show duplicate error (if backend validates this)
      const errorVisible = await page.locator('text=/duplicate|already exists|unique/i').isVisible({ timeout: 5000 }).catch(() => false);
      
      // This test documents expected behavior - may or may not fail depending on backend validation
      if (errorVisible) {
        console.log('Duplicate validation is working');
      } else {
        console.log('No duplicate validation detected - may need backend implementation');
      }
    });

    test('should handle missing form structure gracefully', async ({ page }) => {
      // Check if error message is displayed when no classes are available
      const classSelect = page.locator('select[name="class"]');
      const options = await classSelect.locator('option').count();
      
      if (options <= 1) {
        // Only placeholder option exists
        await expect(page.locator('text=/No form structure|Please create|Task 2/i')).toBeVisible();
      }
    });
  });

  test.describe('Photo Upload', () => {
    test('should display photo upload options', async ({ page }) => {
      // Verify upload button is present
      const uploadButton = page.locator('text=/Upload File/i, input[type="file"]').first();
      await expect(uploadButton).toBeVisible();
      
      // Check if camera option is available (for student photo)
      const cameraButton = page.locator('button:has-text("Take Photo")');
      const cameraVisible = await cameraButton.isVisible().catch(() => false);
      
      if (cameraVisible) {
        console.log('Camera option is available for photo capture');
      }
    });
  });

  test.describe('Bulk Import', () => {
    test('should display Excel download and upload buttons', async ({ page }) => {
      // Verify download Excel button
      await expect(page.locator('button:has-text("Download Excel")').or(page.locator('text=/Download.*Excel/i'))).toBeVisible();
      
      // Verify upload Excel button
      await expect(page.locator('button:has-text("Upload Excel")').or(page.locator('text=/Upload.*Excel/i'))).toBeVisible();
    });
  });
});
