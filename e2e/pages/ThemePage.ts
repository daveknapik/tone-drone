import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page object for theme functionality
 */
export class ThemePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators - Using semantic selectors
  get themeToggle() {
    // Button with text "Theme: Dark" or "Theme: Light"
    return this.page.getByRole("button", { name: /theme:/i });
  }

  // Actions
  async toggleTheme(): Promise<void> {
    await this.themeToggle.click();
  }

  async setDarkMode(): Promise<void> {
    const isDark = await this.isDarkMode();
    if (!isDark) {
      await this.toggleTheme();
    }
  }

  async setLightMode(): Promise<void> {
    const isDark = await this.isDarkMode();
    if (isDark) {
      await this.toggleTheme();
    }
  }

  // Assertions
  async expectDarkMode(): Promise<void> {
    await expect(this.themeToggle).toContainText("Dark");
    // Check that the html element has the dark class
    const htmlElement = this.page.locator("html");
    await expect(htmlElement).toHaveClass(/dark/);
  }

  async expectLightMode(): Promise<void> {
    await expect(this.themeToggle).toContainText("Light");
    // Check that the html element does not have the dark class
    const htmlElement = this.page.locator("html");
    await expect(htmlElement).not.toHaveClass(/dark/);
  }

  // Helpers
  async isDarkMode(): Promise<boolean> {
    const text = await this.themeToggle.textContent();
    return text?.includes("Dark") ?? false;
  }
}
