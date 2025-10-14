import { Page, Locator, expect } from "@playwright/test";

/**
 * Base page object with common functionality
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
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Wait for element to be visible
   */
  async waitForVisible(testId: string): Promise<void> {
    await expect(this.getByTestId(testId)).toBeVisible();
  }

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(testId: string): Promise<void> {
    await expect(this.getByTestId(testId)).toBeHidden();
  }

  /**
   * Click an element by test ID
   */
  async clickByTestId(testId: string): Promise<void> {
    await this.getByTestId(testId).click();
  }

  /**
   * Fill an input by test ID
   */
  async fillByTestId(testId: string, value: string): Promise<void> {
    await this.getByTestId(testId).fill(value);
  }

  /**
   * Get text content by test ID
   */
  async getTextByTestId(testId: string): Promise<string> {
    return (await this.getByTestId(testId).textContent()) ?? "";
  }

  /**
   * Check if element is visible
   */
  async isVisible(testId: string): Promise<boolean> {
    return await this.getByTestId(testId).isVisible();
  }
}
