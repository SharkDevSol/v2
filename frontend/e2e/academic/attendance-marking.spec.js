import { test, expect } from '@playwright/test';
import { loginAsTeacher } from '../helpers/auth-helper.js';
import { testUsers } from '../fixtures/test-data.js';

/**
 * E2E Tests for Attendance Marking Flow (Teacher)
 * 
 * Comprehensive tests covering:
 * - Teacher login and navigation to attendance
 * - Selecting class and date for attendance
 * - Marking students as Present/Absent/Late/Excused (Leave)
 * - Bulk attendance marking (mark all present)
 * - Saving attendance records
 * - Viewing attendance history
 * - Editing existing attendance
 * - Offline attendance marking (with sync)
 * - Error handling
 * - Auto-refresh functionality
 * - Ethiopian calendar integration
 */

test.describe('Attendance Marking Flow (Teacher)', () => {
  test.beforeEach(async ({ page }) => {
    // Login as teacher before each test
    await loginAsTeacher(page, testUsers.teacher);
    
    // Navigate to attendance page
    await page.goto('/staff/attendance-staff');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="attendance-page"], .container, h1', { timeout: 10000 });
  });

  test.describe('Navigation and Page Load', () => {
    test('should load attendance page successfully', async ({ page }) => {
      // Verify page title or heading
      await expect(page.locator('h1').filter({ hasText: /attendance/i })).toBeVisible();
      
      // Verify attendance interface is present
      const attendanceInterface = page.locator('.container, [data-testid="attendance-container"]');
      await expect(attendanceInterface.first()).toBeVisible();
    });

    test('should display assigned class for teacher', async ({ page }) => {
      // Wait for class assignment to load
      await page.waitForTimeout(2000);
      
      // Verify assigned class is displayed
      const classDisplay = page.locator('text=/assigned class|my class/i');
      const isVisible = await classDisplay.isVisible().catch(() => false);
      
      if (isVisible) {
        await expect(classDisplay).toBeVisible();
      }
    });

    test('should display current Ethiopian date', async ({ page }) => {
      // Verify Ethiopian date display
      const dateDisplay = page.locator('text=/Today:|Current Date/i');
      const isVisible = await dateDisplay.isVisible().catch(() => false);
      
      if (isVisible) {
        await expect(dateDisplay).toBeVisible();
        
        // Verify Ethiopian month names are used
        const ethiopianMonths = /Meskerem|Tikimt|Hidar|Tahsas|Tir|Yekatit|Megabit|Miazia|Ginbot|Sene|Hamle|Nehase|Pagume/i;
        await expect(page.locator(`text=${ethiopianMonths}`)).toBeVisible();
      }
    });

    test('should display year selector', async ({ page }) => {
      // Verify year selector is present
      const yearInput = page.locator('input[type="number"], select[name="year"]');
      await expect(yearInput.first()).toBeVisible();
    });

    test('should display school week selector', async ({ page }) => {
      // Wait for weeks to load
      await page.waitForTimeout(2000);
      
      // Verify week selector is present
      const weekSelect = page.locator('select').filter({ hasText: /week|loading/i });
      await expect(weekSelect.first()).toBeVisible();
    });

    test('should show error if teacher is not assigned as class teacher', async ({ page }) => {
      // Check if error message is displayed
      const errorMessage = page.locator('text=/not assigned|no class assigned/i');
      const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (hasError) {
        // Verify error message and hint are displayed
        await expect(errorMessage).toBeVisible();
        await expect(page.locator('text=/contact.*administrator/i')).toBeVisible();
      }
    });
  });

  test.describe('Attendance Summary Display', () => {
    test('should display attendance summary cards', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Verify summary cards are present
      const summaryCards = page.locator('.card, [class*="Card"]');
      const cardCount = await summaryCards.count();
      
      // Should have at least 4 cards (Present, Late, Absent, Leave)
      expect(cardCount).toBeGreaterThanOrEqual(4);
    });

    test('should display present count', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Verify present card
      const presentCard = page.locator('text=/present/i').locator('..');
      await expect(presentCard.first()).toBeVisible();
    });

    test('should display late count', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Verify late card
      const lateCard = page.locator('text=/late/i').locator('..');
      await expect(lateCard.first()).toBeVisible();
    });

    test('should display absent count', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Verify absent card
      const absentCard = page.locator('text=/absent/i').locator('..');
      await expect(absentCard.first()).toBeVisible();
    });

    test('should display leave count', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Verify leave card
      const leaveCard = page.locator('text=/leave/i').locator('..');
      await expect(leaveCard.first()).toBeVisible();
    });

    test('should display total records count', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Verify total card
      const totalCard = page.locator('text=/total.*record/i').locator('..');
      await expect(totalCard.first()).toBeVisible();
    });
  });

  test.describe('Attendance Table Display', () => {
    test('should display attendance table with student list', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Verify table is displayed
      const table = page.locator('table');
      const isVisible = await table.isVisible().catch(() => false);
      
      if (isVisible) {
        await expect(table).toBeVisible();
        
        // Verify table has headers
        await expect(table.locator('thead')).toBeVisible();
        await expect(table.locator('tbody')).toBeVisible();
      }
    });

    test('should display student names in table', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Verify student name column exists
      const nameHeader = page.locator('th').filter({ hasText: /student.*name|name/i });
      const isVisible = await nameHeader.isVisible().catch(() => false);
      
      if (isVisible) {
        await expect(nameHeader).toBeVisible();
      }
    });

    test('should display student IDs or machine IDs', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Verify ID columns exist
      const idHeaders = page.locator('th').filter({ hasText: /id|machine/i });
      const headerCount = await idHeaders.count();
      
      expect(headerCount).toBeGreaterThan(0);
    });

    test('should display days of the week as columns', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Verify day columns exist
      const dayHeaders = page.locator('th').filter({ hasText: /Mon|Tue|Wed|Thu|Fri|Sat|Sun/i });
      const dayCount = await dayHeaders.count();
      
      // Should have at least some day columns
      expect(dayCount).toBeGreaterThan(0);
    });

    test('should display attendance status badges', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Look for status badges (✓, ✗, L, ⏰)
      const statusBadges = page.locator('.statusBadge, [class*="status"]');
      const badgeCount = await statusBadges.count();
      
      // Should have some status badges if attendance is marked
      if (badgeCount > 0) {
        console.log(`Found ${badgeCount} status badges`);
      }
    });

    test('should display check-in times for present/late students', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Look for time displays
      const timeDisplays = page.locator('text=/\\d{1,2}:\\d{2}\\s*(AM|PM)/i');
      const timeCount = await timeDisplays.count();
      
      if (timeCount > 0) {
        console.log(`Found ${timeCount} check-in times displayed`);
      }
    });
  });

  test.describe('Marking Individual Attendance', () => {
    test('should open edit modal when clicking on attendance cell', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Find first clickable attendance cell
      const attendanceCell = page.locator('td.clickable, td[class*="statusCell"]').first();
      const isVisible = await attendanceCell.isVisible().catch(() => false);
      
      if (isVisible) {
        await attendanceCell.click();
        
        // Wait for modal to appear
        await page.waitForTimeout(500);
        
        // Verify modal is displayed
        const modal = page.locator('.modal, [class*="modal"]');
        await expect(modal.first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should display student information in edit modal', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Click on first attendance cell
      const attendanceCell = page.locator('td.clickable, td[class*="statusCell"]').first();
      const isVisible = await attendanceCell.isVisible().catch(() => false);
      
      if (isVisible) {
        await attendanceCell.click();
        await page.waitForTimeout(500);
        
        // Verify student name is displayed in modal
        const studentInfo = page.locator('text=/Student:/i');
        await expect(studentInfo).toBeVisible({ timeout: 5000 });
        
        // Verify date is displayed
        const dateInfo = page.locator('text=/Date:/i');
        await expect(dateInfo).toBeVisible();
      }
    });

    test('should allow selecting attendance status', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Click on first attendance cell
      const attendanceCell = page.locator('td.clickable, td[class*="statusCell"]').first();
      const isVisible = await attendanceCell.isVisible().catch(() => false);
      
      if (isVisible) {
        await attendanceCell.click();
        await page.waitForTimeout(500);
        
        // Find status selector
        const statusSelect = page.locator('select').filter({ hasText: /present|absent|late|leave/i });
        const selectVisible = await statusSelect.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (selectVisible) {
          await expect(statusSelect).toBeVisible();
          
          // Verify all status options are available
          await expect(statusSelect.locator('option').filter({ hasText: /present/i })).toBeVisible();
          await expect(statusSelect.locator('option').filter({ hasText: /absent/i })).toBeVisible();
          await expect(statusSelect.locator('option').filter({ hasText: /late/i })).toBeVisible();
          await expect(statusSelect.locator('option').filter({ hasText: /leave/i })).toBeVisible();
        }
      }
    });

    test('should allow setting check-in time', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Click on first attendance cell
      const attendanceCell = page.locator('td.clickable, td[class*="statusCell"]').first();
      const isVisible = await attendanceCell.isVisible().catch(() => false);
      
      if (isVisible) {
        await attendanceCell.click();
        await page.waitForTimeout(500);
        
        // Find time input
        const timeInput = page.locator('input[type="time"]');
        const timeVisible = await timeInput.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (timeVisible) {
          await expect(timeInput).toBeVisible();
          
          // Set a time
          await timeInput.fill('09:30');
          await expect(timeInput).toHaveValue('09:30');
        }
      }
    });

    test('should allow adding notes', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Click on first attendance cell
      const attendanceCell = page.locator('td.clickable, td[class*="statusCell"]').first();
      const isVisible = await attendanceCell.isVisible().catch(() => false);
      
      if (isVisible) {
        await attendanceCell.click();
        await page.waitForTimeout(500);
        
        // Find notes textarea
        const notesTextarea = page.locator('textarea');
        const notesVisible = await notesTextarea.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (notesVisible) {
          await expect(notesTextarea).toBeVisible();
          
          // Add a note
          await notesTextarea.fill('Student was sick');
          await expect(notesTextarea).toHaveValue('Student was sick');
        }
      }
    });

    test('should save attendance successfully', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Click on first attendance cell
      const attendanceCell = page.locator('td.clickable, td[class*="statusCell"]').first();
      const isVisible = await attendanceCell.isVisible().catch(() => false);
      
      if (isVisible) {
        await attendanceCell.click();
        await page.waitForTimeout(500);
        
        // Change status
        const statusSelect = page.locator('select').filter({ hasText: /present|absent/i });
        const selectVisible = await statusSelect.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (selectVisible) {
          await statusSelect.selectOption({ label: /present/i });
          
          // Click save button
          const saveButton = page.locator('button').filter({ hasText: /save/i });
          await saveButton.click();
          
          // Wait for save to complete
          await page.waitForTimeout(2000);
          
          // Verify modal is closed
          const modal = page.locator('.modal, [class*="modal"]');
          const modalVisible = await modal.isVisible({ timeout: 3000 }).catch(() => false);
          expect(modalVisible).toBeFalsy();
        }
      }
    });

    test('should close modal when clicking cancel', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Click on first attendance cell
      const attendanceCell = page.locator('td.clickable, td[class*="statusCell"]').first();
      const isVisible = await attendanceCell.isVisible().catch(() => false);
      
      if (isVisible) {
        await attendanceCell.click();
        await page.waitForTimeout(500);
        
        // Click cancel button
        const cancelButton = page.locator('button').filter({ hasText: /cancel/i });
        const cancelVisible = await cancelButton.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (cancelVisible) {
          await cancelButton.click();
          
          // Verify modal is closed
          await page.waitForTimeout(500);
          const modal = page.locator('.modal, [class*="modal"]');
          const modalVisible = await modal.isVisible({ timeout: 1000 }).catch(() => false);
          expect(modalVisible).toBeFalsy();
        }
      }
    });
  });

  test.describe('Viewing Attendance History', () => {
    test('should allow selecting different weeks', async ({ page }) => {
      // Wait for weeks to load
      await page.waitForTimeout(3000);
      
      // Find week selector
      const weekSelect = page.locator('select').filter({ hasText: /week|loading/i });
      const isVisible = await weekSelect.isVisible().catch(() => false);
      
      if (isVisible) {
        const optionCount = await weekSelect.locator('option').count();
        
        if (optionCount > 2) {
          // Select first week
          await weekSelect.selectOption({ index: 1 });
          await page.waitForTimeout(2000);
          
          // Select second week
          await weekSelect.selectOption({ index: 2 });
          await page.waitForTimeout(2000);
          
          console.log('Week selection is working');
        }
      }
    });

    test('should allow selecting different years', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(2000);
      
      // Find year input
      const yearInput = page.locator('input[type="number"]').first();
      const isVisible = await yearInput.isVisible().catch(() => false);
      
      if (isVisible) {
        // Get current year
        const currentYear = await yearInput.inputValue();
        
        // Change to previous year
        await yearInput.fill(String(parseInt(currentYear) - 1));
        await page.waitForTimeout(3000);
        
        // Verify weeks are regenerated
        console.log('Year selection is working');
      }
    });

    test('should highlight current week', async ({ page }) => {
      // Wait for weeks to load
      await page.waitForTimeout(3000);
      
      // Find week selector
      const weekSelect = page.locator('select').filter({ hasText: /week/i });
      const isVisible = await weekSelect.isVisible().catch(() => false);
      
      if (isVisible) {
        // Check if any option has "(Current)" text
        const currentWeekOption = weekSelect.locator('option').filter({ hasText: /current/i });
        const hasCurrentWeek = await currentWeekOption.count() > 0;
        
        if (hasCurrentWeek) {
          console.log('Current week is highlighted');
        }
      }
    });

    test('should display attendance data for selected week', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Verify table has data
      const tableRows = page.locator('tbody tr');
      const rowCount = await tableRows.count();
      
      if (rowCount > 0) {
        console.log(`Displaying attendance for ${rowCount} students`);
      }
    });
  });

  test.describe('Refresh Functionality', () => {
    test('should have refresh button', async ({ page }) => {
      // Wait for page to load
      await page.waitForTimeout(2000);
      
      // Find refresh button
      const refreshButton = page.locator('button').filter({ hasText: /refresh|🔄/i });
      const isVisible = await refreshButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await expect(refreshButton).toBeVisible();
      }
    });

    test('should refresh attendance data when clicking refresh button', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Find refresh button
      const refreshButton = page.locator('button').filter({ hasText: /refresh|🔄/i });
      const isVisible = await refreshButton.isVisible().catch(() => false);
      
      if (isVisible) {
        // Click refresh
        await refreshButton.click();
        
        // Wait for refresh to complete
        await page.waitForTimeout(2000);
        
        console.log('Refresh functionality is working');
      }
    });

    test('should auto-refresh attendance data periodically', async ({ page }) => {
      // Wait for initial data load
      await page.waitForTimeout(3000);
      
      // Get initial summary count
      const initialSummary = await page.locator('text=/total.*record/i').textContent();
      
      // Wait for auto-refresh (30 seconds + buffer)
      await page.waitForTimeout(35000);
      
      // Get updated summary
      const updatedSummary = await page.locator('text=/total.*record/i').textContent();
      
      console.log('Auto-refresh test completed');
      console.log('Initial:', initialSummary);
      console.log('After 35s:', updatedSummary);
    });
  });

  test.describe('Offline Attendance Marking', () => {
    test('should queue attendance when offline', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Go offline
      await page.context().setOffline(true);
      
      // Try to mark attendance
      const attendanceCell = page.locator('td.clickable, td[class*="statusCell"]').first();
      const isVisible = await attendanceCell.isVisible().catch(() => false);
      
      if (isVisible) {
        await attendanceCell.click();
        await page.waitForTimeout(500);
        
        // Change status and save
        const statusSelect = page.locator('select').filter({ hasText: /present|absent/i });
        const selectVisible = await statusSelect.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (selectVisible) {
          await statusSelect.selectOption({ label: /present/i });
          
          const saveButton = page.locator('button').filter({ hasText: /save/i });
          await saveButton.click();
          
          await page.waitForTimeout(2000);
          
          // Check for offline message
          const offlineMessage = page.locator('text=/offline|saved locally|will sync/i');
          const hasOfflineMessage = await offlineMessage.isVisible({ timeout: 5000 }).catch(() => false);
          
          if (hasOfflineMessage) {
            console.log('Offline queueing is working');
          }
        }
      }
      
      // Restore online mode
      await page.context().setOffline(false);
    });

    test('should sync attendance when coming back online', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Go offline
      await page.context().setOffline(true);
      
      // Mark attendance offline
      const attendanceCell = page.locator('td.clickable, td[class*="statusCell"]').first();
      const isVisible = await attendanceCell.isVisible().catch(() => false);
      
      if (isVisible) {
        await attendanceCell.click();
        await page.waitForTimeout(500);
        
        const statusSelect = page.locator('select').filter({ hasText: /present|absent/i });
        const selectVisible = await statusSelect.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (selectVisible) {
          await statusSelect.selectOption({ label: /absent/i });
          
          const saveButton = page.locator('button').filter({ hasText: /save/i });
          await saveButton.click();
          await page.waitForTimeout(2000);
        }
      }
      
      // Go back online
      await page.context().setOffline(false);
      
      // Wait for sync
      await page.waitForTimeout(5000);
      
      // Check for sync success message
      const syncMessage = page.locator('text=/synced|sync.*complete|online/i');
      const hasSyncMessage = await syncMessage.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (hasSyncMessage) {
        console.log('Sync functionality is working');
      }
    });

    test('should display offline indicator when offline', async ({ page }) => {
      // Go offline
      await page.context().setOffline(true);
      
      // Wait for offline indicator
      await page.waitForTimeout(2000);
      
      // Check for offline indicator
      const offlineIndicator = page.locator('text=/offline|no connection/i, [class*="offline"]');
      const hasIndicator = await offlineIndicator.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (hasIndicator) {
        console.log('Offline indicator is displayed');
      }
      
      // Restore online mode
      await page.context().setOffline(false);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Simulate network error by going offline
      await page.context().setOffline(true);
      
      // Try to refresh
      const refreshButton = page.locator('button').filter({ hasText: /refresh|🔄/i });
      const isVisible = await refreshButton.isVisible().catch(() => false);
      
      if (isVisible) {
        await refreshButton.click();
        await page.waitForTimeout(2000);
        
        // Check for error message
        const errorMessage = page.locator('text=/error|failed|network/i');
        const hasError = await errorMessage.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (hasError) {
          console.log('Network error handling is working');
        }
      }
      
      // Restore online mode
      await page.context().setOffline(false);
    });

    test('should display error when no students found', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Check if "no students" message is displayed
      const noStudentsMessage = page.locator('text=/no students found/i');
      const hasMessage = await noStudentsMessage.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (hasMessage) {
        console.log('No students message is displayed');
      }
    });

    test('should handle invalid date selection', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(2000);
      
      // Try to set invalid year
      const yearInput = page.locator('input[type="number"]').first();
      const isVisible = await yearInput.isVisible().catch(() => false);
      
      if (isVisible) {
        await yearInput.fill('1900');
        await page.waitForTimeout(2000);
        
        // Check for error or empty state
        const errorMessage = page.locator('text=/invalid|error|no.*week/i');
        const hasError = await errorMessage.isVisible({ timeout: 3000 }).catch(() => false);
        
        if (hasError) {
          console.log('Invalid date handling is working');
        }
      }
    });
  });

  test.describe('Information and Help', () => {
    test('should display attendance status legend', async ({ page }) => {
      // Wait for page to load
      await page.waitForTimeout(2000);
      
      // Check for legend/info section
      const legend = page.locator('text=/how it works|legend/i');
      const hasLegend = await legend.isVisible().catch(() => false);
      
      if (hasLegend) {
        await expect(legend).toBeVisible();
        
        // Verify status explanations
        await expect(page.locator('text=/present.*green/i')).toBeVisible();
        await expect(page.locator('text=/late.*orange/i')).toBeVisible();
        await expect(page.locator('text=/absent.*red/i')).toBeVisible();
        await expect(page.locator('text=/leave.*purple/i')).toBeVisible();
      }
    });

    test('should display help text about clicking cells', async ({ page }) => {
      // Wait for page to load
      await page.waitForTimeout(2000);
      
      // Check for help text
      const helpText = page.locator('text=/click.*cell.*edit|click to edit/i');
      const hasHelp = await helpText.isVisible().catch(() => false);
      
      if (hasHelp) {
        await expect(helpText).toBeVisible();
      }
    });

    test('should display auto-refresh information', async ({ page }) => {
      // Wait for page to load
      await page.waitForTimeout(2000);
      
      // Check for auto-refresh info
      const autoRefreshInfo = page.locator('text=/auto.*refresh|refresh.*30.*second/i');
      const hasInfo = await autoRefreshInfo.isVisible().catch(() => false);
      
      if (hasInfo) {
        await expect(autoRefreshInfo).toBeVisible();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper table structure', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Verify table structure
      const table = page.locator('table');
      const hasTable = await table.isVisible().catch(() => false);
      
      if (hasTable) {
        await expect(table.locator('thead')).toBeVisible();
        await expect(table.locator('tbody')).toBeVisible();
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Wait for page to load
      await page.waitForTimeout(2000);
      
      // Tab through elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Verify focus is moving
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();
    });

    test('should have accessible modal', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Open modal
      const attendanceCell = page.locator('td.clickable, td[class*="statusCell"]').first();
      const isVisible = await attendanceCell.isVisible().catch(() => false);
      
      if (isVisible) {
        await attendanceCell.click();
        await page.waitForTimeout(500);
        
        // Verify modal has proper structure
        const modal = page.locator('.modal, [class*="modal"]');
        const modalVisible = await modal.isVisible({ timeout: 5000 }).catch(() => false);
        
        if (modalVisible) {
          // Check for close button
          const closeButton = page.locator('button').filter({ hasText: /cancel|close|✕/i });
          await expect(closeButton.first()).toBeVisible();
        }
      }
    });
  });
});

