import { Page, expect } from "@playwright/test";

/**
 * Helper to clear localStorage before tests
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear());
}

/**
 * Helper to wait for audio context to be ready
 * Tone.js requires user interaction to start audio context
 */
export async function startAudioContext(page: Page): Promise<void> {
  // Click anywhere on the page to initialize audio context
  await page.click("body");
  // Wait for app to be ready by checking that transport controls are visible
  await expect(page.getByRole("button", { name: /sequences/i })).toBeVisible();
}

/**
 * Helper to check if an element is visible
 */
export async function expectVisible(page: Page, testId: string): Promise<void> {
  await expect(page.getByTestId(testId)).toBeVisible();
}

/**
 * Helper to check if an element is hidden
 */
export async function expectHidden(page: Page, testId: string): Promise<void> {
  await expect(page.getByTestId(testId)).toBeHidden();
}

/**
 * Helper to get localStorage item
 */
export async function getLocalStorageItem(
  page: Page,
  key: string
): Promise<string | null> {
  return await page.evaluate((k) => localStorage.getItem(k), key);
}

/**
 * Helper to set localStorage item
 */
export async function setLocalStorageItem(
  page: Page,
  key: string,
  value: string
): Promise<void> {
  await page.evaluate(({ k, v }) => localStorage.setItem(k, v), {
    k: key,
    v: value,
  });
}
