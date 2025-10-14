import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page object for transport controls (play/pause, BPM)
 */
export class TransportPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators - Using semantic selectors
  get playPauseButton() {
    // Button text changes between "Play Sequences" and "Pause Sequences"
    return this.page.getByRole("button", { name: /sequences/i });
  }

  get bpmSlider() {
    // Slider has a label "bpm"
    return this.page.getByLabel(/bpm/i);
  }

  // Actions
  async play(): Promise<void> {
    const isPlaying = await this.isPlaying();
    if (!isPlaying) {
      await this.playPauseButton.click();
      // Wait for UI to update to "Pause Sequences"
      await expect(this.playPauseButton).toContainText("Pause Sequences");
    }
  }

  async pause(): Promise<void> {
    const isPlaying = await this.isPlaying();
    if (isPlaying) {
      await this.playPauseButton.click();
      // Wait for UI to update to "Play Sequences"
      await expect(this.playPauseButton).toContainText("Play Sequences");
    }
  }

  async toggle(): Promise<void> {
    const wasPlaying = await this.isPlaying();
    await this.playPauseButton.click();
    // Wait for button text to change
    const expectedText = wasPlaying ? "Play Sequences" : "Pause Sequences";
    await expect(this.playPauseButton).toContainText(expectedText);
  }

  async setBpm(bpm: number): Promise<void> {
    await this.bpmSlider.fill(bpm.toString());
    // Wait for the value to be set in the input
    await expect(this.bpmSlider).toHaveValue(bpm.toString());
  }

  async pressSpaceBar(): Promise<void> {
    const wasPlaying = await this.isPlaying();
    await this.page.keyboard.press("Space");
    // Wait for button text to toggle
    const expectedText = wasPlaying ? "Play Sequences" : "Pause Sequences";
    await expect(this.playPauseButton).toContainText(expectedText);
  }

  // Assertions
  async expectPlaying(): Promise<void> {
    await expect(this.playPauseButton).toContainText("Pause Sequences");
  }

  async expectPaused(): Promise<void> {
    await expect(this.playPauseButton).toContainText("Play Sequences");
  }

  async expectBpm(bpm: number): Promise<void> {
    await expect(this.bpmSlider).toHaveValue(bpm.toString());
  }

  // Helpers
  async isPlaying(): Promise<boolean> {
    const text = await this.playPauseButton.textContent();
    return text?.includes("Pause Sequences") ?? false;
  }

  async getBpm(): Promise<number> {
    const value = await this.bpmSlider.inputValue();
    return parseFloat(value);
  }
}
