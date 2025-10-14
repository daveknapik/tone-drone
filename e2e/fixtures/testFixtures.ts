import { test as base } from "@playwright/test";
import { clearLocalStorage, startAudioContext } from "../utils/helpers";

/**
 * Custom test fixture that automatically:
 * - Clears localStorage before each test
 * - Navigates to the app
 * - Initializes audio context
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Setup: Navigate FIRST, then clear localStorage
    await page.goto("/");
    await clearLocalStorage(page);

    // Initialize audio context (required by Tone.js)
    await startAudioContext(page);

    // Run the test
    await use(page);

    // Teardown: Clear localStorage after test
    await clearLocalStorage(page);
  },
});

export { expect } from "@playwright/test";
