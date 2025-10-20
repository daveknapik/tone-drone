import { Page, Locator } from "@playwright/test";

/**
 * Base page object with common functionality
 *
 * Provides:
 * - Access to the Playwright page object
 * - getByTestId helper for dynamic elements (e.g., list items with IDs)
 *
 * Note: Prefer semantic locators (getByRole, getByLabel, etc.) over test IDs
 * when possible. Only use getByTestId for dynamic elements where semantic
 * locators aren't reliable or unique.
 */
export class BasePage {
  constructor(public page: Page) {}

  /**
   * Navigate to the application
   */
  async goto(): Promise<void> {
    await this.page.goto("/");
  }

  /**
   * Get a locator by test ID
   *
   * Use sparingly - only for dynamic elements like list items with IDs.
   * Prefer semantic locators (getByRole, getByLabel, etc.) when possible.
   *
   * Examples of appropriate use:
   * - this.getByTestId(`preset-user-${id}`)
   * - this.getByTestId(`step-${oscIndex}-${stepIndex}`)
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }
}
