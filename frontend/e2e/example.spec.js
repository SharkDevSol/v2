import { test, expect } from '@playwright/test';

/**
 * Example E2E Test
 * 
 * This is a simple example test to verify Playwright is working correctly.
 * You can run this test to ensure your setup is complete.
 */

test.describe('Playwright Setup Verification', () => {
  test('should load the application homepage', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Verify the page title or a key element
    // Note: Update this selector based on your actual homepage
    const pageTitle = page.locator('h1, h2, [data-testid="app-title"]').first();
    
    // Check if the page loaded successfully
    await expect(pageTitle).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Playwright is working correctly!');
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page has a title
    const title = await page.title();
    expect(title).toBeTruthy();
    
    console.log(`Page title: ${title}`);
  });

  test('should be responsive', async ({ page }) => {
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ Application is responsive!');
  });
});
