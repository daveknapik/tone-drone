import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page object for preset management functionality
 */
export class PresetPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators - Mix of semantic and data-testid
  get presetButton() {
    // Button with text "Presets" or preset name, has aria-haspopup
    return this.page.getByRole("button", { expanded: false }).or(this.page.getByRole("button", { expanded: true })).filter({ hasText: /preset|▾/i }).first();
  }

  get newButton() {
    return this.page.getByRole("button", { name: "New Preset" });
  }

  get saveButton() {
    return this.page.getByRole("button", { name: "Save", exact: true });
  }

  get saveAsButton() {
    return this.page.getByRole("button", { name: "Save As..." });
  }

  get shareButton() {
    return this.page.getByRole("button", { name: "Share Current Preset" });
  }

  get browseAllButton() {
    return this.page.getByRole("button", { name: /browse all presets/i });
  }

  // Actions
  async openPresetMenu(): Promise<void> {
    await this.presetButton.click();
    // Wait for dropdown to open by checking aria-expanded attribute
    await expect(this.presetButton).toHaveAttribute("aria-expanded", "true");
  }

  async createNewPreset(): Promise<void> {
    await this.openPresetMenu();
    await this.newButton.click();
  }

  async savePreset(): Promise<void> {
    await this.openPresetMenu();
    await this.saveButton.click();
  }

  async saveAsPreset(name: string): Promise<void> {
    await this.openPresetMenu();

    // Set up dialog handler BEFORE clicking the button
    const dialogPromise = this.page.waitForEvent("dialog", { timeout: 5000 });
    await this.saveAsButton.click();

    const dialog = await dialogPromise;
    expect(dialog.type()).toBe("prompt");
    await dialog.accept(name);

    // Wait for menu to close by checking that the menu button is no longer expanded
    await expect(this.newButton).not.toBeVisible();
  }

  async loadFactoryPreset(presetId: string): Promise<void> {
    await this.openPresetMenu();
    await this.getByTestId(`preset-factory-${presetId}`).click();
  }

  async loadUserPreset(presetId: string): Promise<void> {
    await this.openPresetMenu();
    await this.getByTestId(`preset-user-${presetId}`).click();
  }

  async deleteUserPreset(presetId: string): Promise<void> {
    await this.openPresetMenu();

    // Set up dialog handler BEFORE clicking delete
    const dialogPromise = this.page.waitForEvent("dialog");
    await this.getByTestId(`preset-delete-${presetId}`).click();

    const dialog = await dialogPromise;
    expect(dialog.type()).toBe("confirm");
    expect(dialog.message()).toContain("Delete this preset?");
    await dialog.accept();

    // Wait for menu to close by checking that the menu button is no longer expanded
    await expect(this.newButton).not.toBeVisible();
  }

  async shareCurrentPreset(): Promise<void> {
    await this.openPresetMenu();
    await this.shareButton.click();
  }

  async openPresetBrowser(): Promise<void> {
    await this.openPresetMenu();
    await this.browseAllButton.click();
  }

  // Assertions
  async expectPresetButtonText(text: string): Promise<void> {
    await expect(this.presetButton).toContainText(text);
  }

  async expectModifiedIndicator(): Promise<void> {
    await expect(this.presetButton).toContainText("*");
  }

  async expectNoModifiedIndicator(): Promise<void> {
    const text = await this.presetButton.textContent();
    expect(text).not.toContain("*");
  }

  async expectFactoryPresetExists(presetId: string): Promise<void> {
    await expect(this.getByTestId(`preset-factory-${presetId}`)).toBeVisible();
  }

  async expectUserPresetExists(presetId: string): Promise<void> {
    await expect(this.getByTestId(`preset-user-${presetId}`)).toBeVisible();
  }

  async expectUserPresetNotExists(presetId: string): Promise<void> {
    await expect(this.getByTestId(`preset-user-${presetId}`)).not.toBeVisible();
  }
}
