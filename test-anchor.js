// Quick test script to verify anchor functionality
// Run with: node test-anchor.js

import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to the app
  await page.goto('http://localhost:5174/tone-drone/');

  console.log('Waiting for app to load...');
  await page.waitForTimeout(2000);

  // Click to start audio context
  const playButton = page.locator('button').filter({ hasText: /play/i }).first();
  await playButton.click();
  console.log('Started audio context');

  await page.waitForTimeout(1000);

  // Expand Effects section
  const effectsHeading = page.locator('h2').filter({ hasText: /effects/i });
  await effectsHeading.click();
  console.log('Expanded Effects');

  await page.waitForTimeout(500);

  // Set filter frequency to 300 Hz (should be a slider)
  const filterFreqSlider = page.locator('input[type="range"]').filter({ hasText: /frequency/i }).or(
    page.locator('label').filter({ hasText: /frequency/i }).locator('..').locator('input[type="range"]')
  ).first();

  // Get the filter frequency control
  const filterSection = page.locator('text=Filter').locator('..');
  const frequencyInput = filterSection.locator('input[type="number"]').first();

  if (await frequencyInput.isVisible()) {
    await frequencyInput.fill('300');
    console.log('Set filter frequency to 300 Hz');
  }

  await page.waitForTimeout(500);

  // Expand Modulation Matrix
  const modMatrixHeading = page.locator('h2').filter({ hasText: /modulation matrix/i });
  await modMatrixHeading.click();
  console.log('Expanded Modulation Matrix');

  await page.waitForTimeout(500);

  // Add a modulation route for filter-frequency
  const addRouteButton = page.locator('button').filter({ hasText: /add route/i }).or(
    page.locator('button').filter({ hasText: /\+/i })
  );

  if (await addRouteButton.isVisible()) {
    await addRouteButton.click();
    console.log('Added a route');

    await page.waitForTimeout(500);

    // Select filter-frequency as destination
    const destinationSelect = page.locator('select').last();
    await destinationSelect.selectOption({ label: /filter.*frequency/i });
    console.log('Selected filter-frequency destination');

    await page.waitForTimeout(500);

    // Click Anchor button
    const anchorButton = page.locator('button').filter({ hasText: /anchor/i }).last();
    if (await anchorButton.isVisible()) {

      // Open browser console to see debug logs
      page.on('console', msg => console.log('BROWSER:', msg.text()));

      await anchorButton.click();
      console.log('Clicked Anchor button');

      await page.waitForTimeout(2000);

      // Check if the center value was set correctly
      const centerInput = page.locator('input[type="number"]').filter({ hasText: /center/i }).or(
        page.locator('label').filter({ hasText: /center/i }).locator('..').locator('input[type="number"]')
      );

      if (await centerInput.isVisible()) {
        const centerValue = await centerInput.inputValue();
        console.log('Center value after anchor:', centerValue);

        if (centerValue === '300' || centerValue === '300.0') {
          console.log('✓ SUCCESS: Anchor worked correctly! Center is 300 Hz');
        } else {
          console.log('✗ FAILED: Center should be 300 but is', centerValue);
        }
      }
    }
  }

  console.log('\nTest complete. Browser will stay open for manual inspection.');
  console.log('Press Ctrl+C to close.');

  // Keep browser open for inspection
  await page.waitForTimeout(30000);

  await browser.close();
})();
