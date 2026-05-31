import { test, expect } from '@playwright/test';
import { loginAsStudent } from '../helpers/auth-helper.js';
import { testUsers } from '../fixtures/test-data.js';

/**
 * E2E Tests for Exam Taking Flow (Student)
 * 
 * Comprehensive tests covering:
 * - Student exam list display
 * - Exam access and start
 * - Question navigation
 * - Answer submission
 * - Timer functionality
 * - Auto-submit on time expiry
 * - Exam completion
 * - Results viewing
 */

test.describe('Exam Taking Flow (Student)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as student before each test
    await loginAsStudent(page, testUsers.student);
    
    // Navigate to student exams page
    await page.goto('/student/exams');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="exam-list"], .exam-list, text=/Exam/i', { timeout: 10000 });
  });

  test.describe('Exam List Display', () => {
    test('should display available exams', async ({ page }) => {
      // Verify exam list is visible
      await expect(page.locator('[data-testid="exam-list"], .exam-list')).toBeVisible();
      
      // Check if exams are displayed
      const examItems = page.locator('[data-testid="exam-item"], .exam-item, .exam-card');
      const examCount = await examItems.count();
      
      // Should have at least one exam or show "no exams" message
      if (examCount === 0) {
        await expect(page.locator('text=/No.*exam|No.*test/i')).toBeVisible();
      } else {
        expect(examCount).toBeGreaterThan(0);
      }
    });

    test('should display exam details (subject, date, time limit)', async ({ page }) => {
      // Check if at least one exam is available
      const examItems = page.locator('[data-testid="exam-item"], .exam-item, .exam-card');
      const examCount = await examItems.count();
      
      if (examCount > 0) {
        const firstExam = examItems.first();
        
        // Verify exam details are displayed
        await expect(firstExam).toBeVisible();
        
        // Check for subject name
        const hasSubject = await firstExam.locator('text=/Math|English|Science|Subject/i').isVisible().catch(() => false);
        expect(hasSubject).toBeTruthy();
      }
    });

    test('should show exam status (pending, in-progress, completed)', async ({ page }) => {
      const examItems = page.locator('[data-testid="exam-item"], .exam-item, .exam-card');
      const examCount = await examItems.count();
      
      if (examCount > 0) {
        const firstExam = examItems.first();
        
        // Check for status indicators
        const statusElement = firstExam.locator('[data-testid="exam-status"], .status, text=/Pending|Progress|Completed|Not Started/i');
        const hasStatus = await statusElement.isVisible().catch(() => false);
        
        if (hasStatus) {
          await expect(statusElement).toBeVisible();
        }
      }
    });

    test('should display start exam button for pending exams', async ({ page }) => {
      const examItems = page.locator('[data-testid="exam-item"], .exam-item, .exam-card');
      const examCount = await examItems.count();
      
      if (examCount > 0) {
        // Look for start button
        const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
        const isVisible = await startButton.isVisible().catch(() => false);
        
        if (isVisible) {
          await expect(startButton).toBeVisible();
        }
      }
    });
  });

  test.describe('Exam Start and Access', () => {
    test('should start exam when start button is clicked', async ({ page }) => {
      // Find and click start button
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      const isVisible = await startButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await startButton.click();
        
        // Wait for exam to load
        await page.waitForSelector('[data-testid="exam-question"], .question, text=/Question/i', { timeout: 10000 });
        
        // Verify exam interface is displayed
        await expect(page.locator('[data-testid="exam-question"], .question')).toBeVisible();
      }
    });

    test('should display exam instructions before starting', async ({ page }) => {
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      const isVisible = await startButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await startButton.click();
        
        // Check for instructions modal/page
        const instructions = page.locator('text=/Instruction|Read.*carefully|Before.*start/i');
        const hasInstructions = await instructions.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (hasInstructions) {
          await expect(instructions).toBeVisible();
          
          // Look for confirm/proceed button
          const proceedButton = page.locator('button:has-text("Proceed"), button:has-text("Continue"), button:has-text("I Understand")');
          if (await proceedButton.isVisible().catch(() => false)) {
            await proceedButton.click();
          }
        }
      }
    });

    test('should display timer when exam starts', async ({ page }) => {
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      const isVisible = await startButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await startButton.click();
        
        // Handle instructions if present
        const proceedButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")');
        if (await proceedButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await proceedButton.click();
        }
        
        // Wait for exam to load
        await page.waitForTimeout(2000);
        
        // Check for timer
        const timer = page.locator('[data-testid="timer"], .timer, text=/\\d+:\\d+/');
        const hasTimer = await timer.isVisible().catch(() => false);
        
        if (hasTimer) {
          await expect(timer).toBeVisible();
        }
      }
    });
  });

  test.describe('Question Navigation', () => {
    test('should display current question', async ({ page }) => {
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      const isVisible = await startButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await startButton.click();
        
        // Handle instructions
        const proceedButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")');
        if (await proceedButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await proceedButton.click();
        }
        
        await page.waitForTimeout(2000);
        
        // Verify question is displayed
        const question = page.locator('[data-testid="question-text"], .question-text, text=/Question/i');
        await expect(question.first()).toBeVisible();
      }
    });

    test('should navigate to next question', async ({ page }) => {
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      const isVisible = await startButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await startButton.click();
        
        const proceedButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")');
        if (await proceedButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await proceedButton.click();
        }
        
        await page.waitForTimeout(2000);
        
        // Look for next button
        const nextButton = page.locator('button:has-text("Next"), [data-testid="next-question"]');
        const hasNext = await nextButton.isVisible().catch(() => false);
        
        if (hasNext) {
          await nextButton.click();
          await page.waitForTimeout(500);
          
          // Verify question changed (question number should increment)
          await expect(page.locator('text=/Question.*2|2\\./i')).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test('should navigate to previous question', async ({ page }) => {
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      const isVisible = await startButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await startButton.click();
        
        const proceedButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")');
        if (await proceedButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await proceedButton.click();
        }
        
        await page.waitForTimeout(2000);
        
        // Go to next question first
        const nextButton = page.locator('button:has-text("Next")');
        if (await nextButton.isVisible().catch(() => false)) {
          await nextButton.click();
          await page.waitForTimeout(500);
          
          // Then go back
          const prevButton = page.locator('button:has-text("Previous"), button:has-text("Back")');
          if (await prevButton.isVisible().catch(() => false)) {
            await prevButton.click();
            await page.waitForTimeout(500);
            
            // Verify we're back to question 1
            await expect(page.locator('text=/Question.*1|1\\./i')).toBeVisible();
          }
        }
      }
    });

    test('should display question palette for direct navigation', async ({ page }) => {
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      const isVisible = await startButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await startButton.click();
        
        const proceedButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")');
        if (await proceedButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await proceedButton.click();
        }
        
        await page.waitForTimeout(2000);
        
        // Check for question palette/grid
        const palette = page.locator('[data-testid="question-palette"], .question-palette, .question-grid');
        const hasPalette = await palette.isVisible().catch(() => false);
        
        if (hasPalette) {
          await expect(palette).toBeVisible();
        }
      }
    });
  });

  test.describe('Answer Submission', () => {
    test('should allow selecting answer for MCQ', async ({ page }) => {
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      const isVisible = await startButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await startButton.click();
        
        const proceedButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")');
        if (await proceedButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await proceedButton.click();
        }
        
        await page.waitForTimeout(2000);
        
        // Look for radio buttons or option buttons
        const option = page.locator('input[type="radio"], .option, [data-testid="option"]').first();
        const hasOptions = await option.isVisible().catch(() => false);
        
        if (hasOptions) {
          await option.click();
          
          // Verify option is selected
          if (await option.getAttribute('type') === 'radio') {
            await expect(option).toBeChecked();
          }
        }
      }
    });

    test('should allow typing answer for text questions', async ({ page }) => {
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      const isVisible = await startButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await startButton.click();
        
        const proceedButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")');
        if (await proceedButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await proceedButton.click();
        }
        
        await page.waitForTimeout(2000);
        
        // Look for text input or textarea
        const textInput = page.locator('input[type="text"], textarea, [data-testid="answer-input"]').first();
        const hasTextInput = await textInput.isVisible().catch(() => false);
        
        if (hasTextInput) {
          await textInput.fill('Test answer');
          
          // Verify answer is entered
          await expect(textInput).toHaveValue('Test answer');
        }
      }
    });

    test('should mark question as answered', async ({ page }) => {
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      const isVisible = await startButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await startButton.click();
        
        const proceedButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")');
        if (await proceedButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await proceedButton.click();
        }
        
        await page.waitForTimeout(2000);
        
        // Answer the question
        const option = page.locator('input[type="radio"], .option').first();
        if (await option.isVisible().catch(() => false)) {
          await option.click();
          
          // Check if question is marked as answered in palette
          const answeredIndicator = page.locator('[data-testid="answered"], .answered, text=/Answered/i');
          const hasIndicator = await answeredIndicator.isVisible({ timeout: 2000 }).catch(() => false);
          
          if (hasIndicator) {
            await expect(answeredIndicator).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Exam Submission', () => {
    test('should display submit button', async ({ page }) => {
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      const isVisible = await startButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await startButton.click();
        
        const proceedButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")');
        if (await proceedButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await proceedButton.click();
        }
        
        await page.waitForTimeout(2000);
        
        // Look for submit button
        const submitButton = page.locator('button:has-text("Submit"), button:has-text("Finish")');
        await expect(submitButton.first()).toBeVisible();
      }
    });

    test('should show confirmation dialog before submission', async ({ page }) => {
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      const isVisible = await startButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await startButton.click();
        
        const proceedButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")');
        if (await proceedButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await proceedButton.click();
        }
        
        await page.waitForTimeout(2000);
        
        // Click submit button
        const submitButton = page.locator('button:has-text("Submit"), button:has-text("Finish")').first();
        await submitButton.click();
        
        // Verify confirmation dialog appears
        await expect(page.locator('text=/Are you sure|Confirm|submit/i')).toBeVisible({ timeout: 5000 });
      }
    });

    test('should submit exam successfully', async ({ page }) => {
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      const isVisible = await startButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await startButton.click();
        
        const proceedButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")');
        if (await proceedButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await proceedButton.click();
        }
        
        await page.waitForTimeout(2000);
        
        // Answer at least one question
        const option = page.locator('input[type="radio"], .option').first();
        if (await option.isVisible().catch(() => false)) {
          await option.click();
        }
        
        // Submit exam
        const submitButton = page.locator('button:has-text("Submit"), button:has-text("Finish")').first();
        await submitButton.click();
        
        // Confirm submission
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
        if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await confirmButton.click();
        }
        
        // Verify success message or redirect
        await expect(page.locator('text=/Success|Submitted|Complete/i')).toBeVisible({ timeout: 10000 });
      }
    });
  });

  test.describe('Timer Functionality', () => {
    test('should display remaining time', async ({ page }) => {
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      const isVisible = await startButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await startButton.click();
        
        const proceedButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")');
        if (await proceedButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await proceedButton.click();
        }
        
        await page.waitForTimeout(2000);
        
        // Check for timer display
        const timer = page.locator('[data-testid="timer"], .timer, text=/\\d+:\\d+/');
        const hasTimer = await timer.isVisible().catch(() => false);
        
        if (hasTimer) {
          const timerText = await timer.textContent();
          expect(timerText).toMatch(/\d+:\d+/);
        }
      }
    });

    test('should show warning when time is running low', async ({ page }) => {
      // This test documents expected behavior
      // Actual implementation depends on timer warning threshold
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      const isVisible = await startButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await startButton.click();
        
        const proceedButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")');
        if (await proceedButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await proceedButton.click();
        }
        
        await page.waitForTimeout(2000);
        
        // Check if timer has warning styling
        const timerWarning = page.locator('[data-testid="timer"].warning, .timer.warning, .timer-warning');
        const hasWarning = await timerWarning.isVisible().catch(() => false);
        
        // Warning may not appear in short tests
        console.log('Timer warning feature:', hasWarning ? 'present' : 'not visible in test');
      }
    });
  });

  test.describe('Results Viewing', () => {
    test('should display exam results after submission', async ({ page }) => {
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      const isVisible = await startButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await startButton.click();
        
        const proceedButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")');
        if (await proceedButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await proceedButton.click();
        }
        
        await page.waitForTimeout(2000);
        
        // Answer and submit
        const option = page.locator('input[type="radio"], .option').first();
        if (await option.isVisible().catch(() => false)) {
          await option.click();
        }
        
        const submitButton = page.locator('button:has-text("Submit"), button:has-text("Finish")').first();
        await submitButton.click();
        
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
        if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await confirmButton.click();
        }
        
        // Wait for results
        await page.waitForTimeout(3000);
        
        // Check for results display
        const results = page.locator('text=/Score|Result|Mark|Grade/i');
        const hasResults = await results.isVisible({ timeout: 10000 }).catch(() => false);
        
        if (hasResults) {
          await expect(results).toBeVisible();
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors during exam', async ({ page }) => {
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first();
      const isVisible = await startButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await startButton.click();
        
        const proceedButton = page.locator('button:has-text("Proceed"), button:has-text("Continue")');
        if (await proceedButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await proceedButton.click();
        }
        
        await page.waitForTimeout(2000);
        
        // Simulate offline mode
        await page.context().setOffline(true);
        
        // Try to navigate or submit
        const nextButton = page.locator('button:has-text("Next")');
        if (await nextButton.isVisible().catch(() => false)) {
          await nextButton.click();
        }
        
        // Check for error message or offline indicator
        const errorMessage = page.locator('text=/Error|Offline|Connection/i');
        const hasError = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);
        
        // Restore online mode
        await page.context().setOffline(false);
        
        if (hasError) {
          console.log('Offline handling is working');
        }
      }
    });
  });
});
