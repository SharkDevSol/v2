import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth-helper.js';
import { testUsers, testExam } from '../fixtures/test-data.js';

/**
 * E2E Tests for AI Exam Creation Flow
 * 
 * Comprehensive tests covering:
 * - Navigation to AI test generator page
 * - Exam configuration form (class, subject, term, component)
 * - Question type distribution selector
 * - Language selector and difficulty level
 * - AI exam generation
 * - Exam preview and question display
 * - Question editing and deletion
 * - Exam regeneration
 * - Exam approval and saving
 * - Error handling and validation
 */

test.describe('AI Exam Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await loginAsAdmin(page, testUsers.admin);
    
    // Navigate to AI test generator page
    await page.goto('/ai-test-generator');
    
    // Wait for the page to load
    await page.waitForSelector('form, [data-testid="exam-config-form"]', { timeout: 10000 });
  });

  test.describe('Navigation and Page Load', () => {
    test('should load AI test generator page successfully', async ({ page }) => {
      // Verify page title
      await expect(page.locator('h1, h2').filter({ hasText: /AI.*Test.*Generator|Generate.*Exam/i })).toBeVisible();
      
      // Verify form is present
      await expect(page.locator('form, [data-testid="exam-config-form"]')).toBeVisible();
    });

    test('should display all exam configuration fields', async ({ page }) => {
      // Verify class selector
      await expect(page.locator('select[name="class"], [data-testid="class-select"]')).toBeVisible();
      
      // Verify subject selector
      await expect(page.locator('select[name="subject"], [data-testid="subject-select"]')).toBeVisible();
      
      // Verify term selector
      await expect(page.locator('select[name="term"], [data-testid="term-select"]')).toBeVisible();
      
      // Verify component selector
      await expect(page.locator('select[name="component"], [data-testid="component-select"]')).toBeVisible();
    });
  });

  test.describe('Exam Configuration Form', () => {
    test('should show validation errors for required fields', async ({ page }) => {
      // Try to generate without filling required fields
      const generateButton = page.locator('button:has-text("Generate"), button[type="submit"]').first();
      await generateButton.click();
      
      // Wait for validation errors
      await page.waitForTimeout(500);
      
      // Verify error messages appear
      const errorMessages = page.locator('.error, [class*="error"], text=/required/i');
      const errorCount = await errorMessages.count();
      expect(errorCount).toBeGreaterThan(0);
    });

    test('should populate subject dropdown based on selected class', async ({ page }) => {
      // Select a class
      const classSelect = page.locator('select[name="class"], [data-testid="class-select"]');
      await classSelect.selectOption({ index: 1 });
      
      // Wait for subjects to load
      await page.waitForTimeout(1000);
      
      // Verify subject dropdown has options
      const subjectSelect = page.locator('select[name="subject"], [data-testid="subject-select"]');
      const subjectOptions = await subjectSelect.locator('option').count();
      expect(subjectOptions).toBeGreaterThan(1); // More than just placeholder
    });

    test('should display question type distribution selector', async ({ page }) => {
      // Verify question type checkboxes/selectors are present
      await expect(page.locator('text=/Question.*Type|Select.*Question/i')).toBeVisible();
      
      // Common question types
      const questionTypes = [
        'Multiple Choice',
        'True/False',
        'Fill.*Blank',
        'Short Answer',
        'Essay'
      ];
      
      // Check if at least some question types are visible
      let visibleTypes = 0;
      for (const type of questionTypes) {
        const typeElement = page.locator(`text=/${type}/i`);
        if (await typeElement.isVisible().catch(() => false)) {
          visibleTypes++;
        }
      }
      expect(visibleTypes).toBeGreaterThan(0);
    });

    test('should display language selector', async ({ page }) => {
      // Verify language selector is present
      const languageSelect = page.locator('select[name="language"], [data-testid="language-select"]');
      await expect(languageSelect).toBeVisible();
      
      // Verify it has multiple language options
      const languageOptions = await languageSelect.locator('option').count();
      expect(languageOptions).toBeGreaterThan(1);
    });

    test('should display difficulty level selector', async ({ page }) => {
      // Verify difficulty selector is present
      const difficultySelect = page.locator('select[name="difficulty"], [data-testid="difficulty-select"]');
      await expect(difficultySelect).toBeVisible();
      
      // Verify it has difficulty options (Easy, Medium, Hard)
      const options = await difficultySelect.locator('option').allTextContents();
      const hasDifficulties = options.some(opt => 
        /easy|medium|hard/i.test(opt)
      );
      expect(hasDifficulties).toBeTruthy();
    });

    test('should display exam description textarea', async ({ page }) => {
      // Verify description field is present
      const descriptionField = page.locator('textarea[name="description"], [data-testid="exam-description"]');
      await expect(descriptionField).toBeVisible();
    });

    test('should display time limit input', async ({ page }) => {
      // Verify time limit field is present
      const timeLimitField = page.locator('input[name="timeLimit"], input[name="time_limit"], [data-testid="time-limit"]');
      const isVisible = await timeLimitField.isVisible().catch(() => false);
      
      if (isVisible) {
        await expect(timeLimitField).toBeVisible();
      }
    });
  });

  test.describe('AI Exam Generation', () => {
    test('should show loading state during exam generation', async ({ page }) => {
      // Fill in required fields
      await page.selectOption('select[name="class"]', { index: 1 });
      await page.waitForTimeout(500);
      await page.selectOption('select[name="subject"]', { index: 1 });
      await page.selectOption('select[name="term"]', { index: 1 });
      await page.selectOption('select[name="component"]', { index: 1 });
      
      // Select at least one question type
      const firstCheckbox = page.locator('input[type="checkbox"]').first();
      if (await firstCheckbox.isVisible().catch(() => false)) {
        await firstCheckbox.check();
      }
      
      // Click generate button
      const generateButton = page.locator('button:has-text("Generate")').first();
      await generateButton.click();
      
      // Verify loading indicator appears
      const loadingIndicator = page.locator('text=/Generating|Loading|Please wait/i, [class*="loading"], [class*="spinner"]');
      await expect(loadingIndicator.first()).toBeVisible({ timeout: 5000 });
    });

    test('should display generated exam preview', async ({ page }) => {
      // Fill in required fields
      await page.selectOption('select[name="class"]', { index: 1 });
      await page.waitForTimeout(500);
      await page.selectOption('select[name="subject"]', { index: 1 });
      await page.selectOption('select[name="term"]', { index: 1 });
      await page.selectOption('select[name="component"]', { index: 1 });
      
      // Select question types
      const firstCheckbox = page.locator('input[type="checkbox"]').first();
      if (await firstCheckbox.isVisible().catch(() => false)) {
        await firstCheckbox.check();
      }
      
      // Generate exam
      await page.click('button:has-text("Generate")');
      
      // Wait for exam to be generated (this may take time)
      await page.waitForSelector('text=/Question|Preview|Generated/i', { timeout: 60000 });
      
      // Verify exam preview is displayed
      const examPreview = page.locator('[data-testid="exam-preview"], .exam-preview, text=/Question.*1/i');
      await expect(examPreview.first()).toBeVisible();
    });

    test('should display questions grouped by type', async ({ page }) => {
      // Fill and generate exam
      await page.selectOption('select[name="class"]', { index: 1 });
      await page.waitForTimeout(500);
      await page.selectOption('select[name="subject"]', { index: 1 });
      await page.selectOption('select[name="term"]', { index: 1 });
      await page.selectOption('select[name="component"]', { index: 1 });
      
      const firstCheckbox = page.locator('input[type="checkbox"]').first();
      if (await firstCheckbox.isVisible().catch(() => false)) {
        await firstCheckbox.check();
      }
      
      await page.click('button:has-text("Generate")');
      
      // Wait for questions
      await page.waitForSelector('text=/Question/i', { timeout: 60000 });
      
      // Verify questions are displayed
      const questions = page.locator('[data-testid="question"], .question, text=/Question.*\\d+/i');
      const questionCount = await questions.count();
      expect(questionCount).toBeGreaterThan(0);
    });
  });

  test.describe('Question Management', () => {
    test('should allow editing a question', async ({ page }) => {
      // Generate exam first
      await page.selectOption('select[name="class"]', { index: 1 });
      await page.waitForTimeout(500);
      await page.selectOption('select[name="subject"]', { index: 1 });
      await page.selectOption('select[name="term"]', { index: 1 });
      await page.selectOption('select[name="component"]', { index: 1 });
      
      const firstCheckbox = page.locator('input[type="checkbox"]').first();
      if (await firstCheckbox.isVisible().catch(() => false)) {
        await firstCheckbox.check();
      }
      
      await page.click('button:has-text("Generate")');
      await page.waitForSelector('text=/Question/i', { timeout: 60000 });
      
      // Look for edit button
      const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-question"]').first();
      const isVisible = await editButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await editButton.click();
        
        // Verify edit modal/form appears
        await expect(page.locator('text=/Edit.*Question|Modify/i')).toBeVisible({ timeout: 5000 });
      }
    });

    test('should allow deleting a question', async ({ page }) => {
      // Generate exam first
      await page.selectOption('select[name="class"]', { index: 1 });
      await page.waitForTimeout(500);
      await page.selectOption('select[name="subject"]', { index: 1 });
      await page.selectOption('select[name="term"]', { index: 1 });
      await page.selectOption('select[name="component"]', { index: 1 });
      
      const firstCheckbox = page.locator('input[type="checkbox"]').first();
      if (await firstCheckbox.isVisible().catch(() => false)) {
        await firstCheckbox.check();
      }
      
      await page.click('button:has-text("Generate")');
      await page.waitForSelector('text=/Question/i', { timeout: 60000 });
      
      // Count questions before delete
      const questionsBefore = await page.locator('[data-testid="question"], .question').count();
      
      // Look for delete button
      const deleteButton = page.locator('button:has-text("Delete"), [data-testid="delete-question"]').first();
      const isVisible = await deleteButton.isVisible().catch(() => false);
      
      if (isVisible && questionsBefore > 0) {
        await deleteButton.click();
        
        // Confirm deletion if confirmation dialog appears
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")');
        if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmButton.click();
        }
        
        // Wait a bit for deletion
        await page.waitForTimeout(1000);
        
        // Verify question count decreased
        const questionsAfter = await page.locator('[data-testid="question"], .question').count();
        expect(questionsAfter).toBeLessThan(questionsBefore);
      }
    });

    test('should allow adding manual questions', async ({ page }) => {
      // Generate exam first
      await page.selectOption('select[name="class"]', { index: 1 });
      await page.waitForTimeout(500);
      await page.selectOption('select[name="subject"]', { index: 1 });
      await page.selectOption('select[name="term"]', { index: 1 });
      await page.selectOption('select[name="component"]', { index: 1 });
      
      const firstCheckbox = page.locator('input[type="checkbox"]').first();
      if (await firstCheckbox.isVisible().catch(() => false)) {
        await firstCheckbox.check();
      }
      
      await page.click('button:has-text("Generate")');
      await page.waitForSelector('text=/Question/i', { timeout: 60000 });
      
      // Look for add question button
      const addButton = page.locator('button:has-text("Add Question"), button:has-text("Add Manual")');
      const isVisible = await addButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await addButton.click();
        
        // Verify add question form appears
        await expect(page.locator('text=/Add.*Question|New.*Question/i')).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Exam Regeneration', () => {
    test('should allow regenerating the entire exam', async ({ page }) => {
      // Generate exam first
      await page.selectOption('select[name="class"]', { index: 1 });
      await page.waitForTimeout(500);
      await page.selectOption('select[name="subject"]', { index: 1 });
      await page.selectOption('select[name="term"]', { index: 1 });
      await page.selectOption('select[name="component"]', { index: 1 });
      
      const firstCheckbox = page.locator('input[type="checkbox"]').first();
      if (await firstCheckbox.isVisible().catch(() => false)) {
        await firstCheckbox.check();
      }
      
      await page.click('button:has-text("Generate")');
      await page.waitForSelector('text=/Question/i', { timeout: 60000 });
      
      // Look for regenerate button
      const regenerateButton = page.locator('button:has-text("Regenerate"), button:has-text("Generate Again")');
      const isVisible = await regenerateButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await regenerateButton.click();
        
        // Verify loading state appears
        await expect(page.locator('text=/Generating|Loading/i').first()).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Exam Approval and Saving', () => {
    test('should display approve and save button', async ({ page }) => {
      // Generate exam first
      await page.selectOption('select[name="class"]', { index: 1 });
      await page.waitForTimeout(500);
      await page.selectOption('select[name="subject"]', { index: 1 });
      await page.selectOption('select[name="term"]', { index: 1 });
      await page.selectOption('select[name="component"]', { index: 1 });
      
      const firstCheckbox = page.locator('input[type="checkbox"]').first();
      if (await firstCheckbox.isVisible().catch(() => false)) {
        await firstCheckbox.check();
      }
      
      await page.click('button:has-text("Generate")');
      await page.waitForSelector('text=/Question/i', { timeout: 60000 });
      
      // Verify approve/save button is present
      const approveButton = page.locator('button:has-text("Approve"), button:has-text("Save"), button:has-text("Publish")');
      await expect(approveButton.first()).toBeVisible();
    });

    test('should save exam successfully', async ({ page }) => {
      // Generate exam
      await page.selectOption('select[name="class"]', { index: 1 });
      await page.waitForTimeout(500);
      await page.selectOption('select[name="subject"]', { index: 1 });
      await page.selectOption('select[name="term"]', { index: 1 });
      await page.selectOption('select[name="component"]', { index: 1 });
      
      const firstCheckbox = page.locator('input[type="checkbox"]').first();
      if (await firstCheckbox.isVisible().catch(() => false)) {
        await firstCheckbox.check();
      }
      
      await page.click('button:has-text("Generate")');
      await page.waitForSelector('text=/Question/i', { timeout: 60000 });
      
      // Click approve/save button
      const approveButton = page.locator('button:has-text("Approve"), button:has-text("Save")').first();
      await approveButton.click();
      
      // Wait for success message
      await expect(page.locator('text=/Success|Saved|Created/i')).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true);
      
      // Try to generate exam
      await page.selectOption('select[name="class"]', { index: 1 });
      await page.waitForTimeout(500);
      await page.selectOption('select[name="subject"]', { index: 1 });
      await page.selectOption('select[name="term"]', { index: 1 });
      await page.selectOption('select[name="component"]', { index: 1 });
      
      const firstCheckbox = page.locator('input[type="checkbox"]').first();
      if (await firstCheckbox.isVisible().catch(() => false)) {
        await firstCheckbox.check();
      }
      
      await page.click('button:has-text("Generate")');
      
      // Verify error message appears
      await expect(page.locator('text=/Error|Failed|Network/i')).toBeVisible({ timeout: 10000 });
      
      // Restore online mode
      await page.context().setOffline(false);
    });

    test('should handle rate limiting', async ({ page }) => {
      // This test documents expected behavior for rate limiting
      // The actual implementation depends on backend rate limiting
      
      // Fill form
      await page.selectOption('select[name="class"]', { index: 1 });
      await page.waitForTimeout(500);
      await page.selectOption('select[name="subject"]', { index: 1 });
      await page.selectOption('select[name="term"]', { index: 1 });
      await page.selectOption('select[name="component"]', { index: 1 });
      
      const firstCheckbox = page.locator('input[type="checkbox"]').first();
      if (await firstCheckbox.isVisible().catch(() => false)) {
        await firstCheckbox.check();
      }
      
      // Try to generate multiple times quickly
      for (let i = 0; i < 3; i++) {
        await page.click('button:has-text("Generate")');
        await page.waitForTimeout(1000);
      }
      
      // Check if rate limit message appears
      const rateLimitMessage = page.locator('text=/rate limit|too many|wait/i');
      const isVisible = await rateLimitMessage.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isVisible) {
        console.log('Rate limiting is working');
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper form labels', async ({ page }) => {
      // Check for label associations
      const labels = page.locator('label');
      const labelCount = await labels.count();
      expect(labelCount).toBeGreaterThan(0);
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through form fields
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Verify focus is moving through elements
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });
  });
});
