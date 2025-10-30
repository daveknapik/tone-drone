import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page object for Randomize Frequency functionality
 *
 * Handles interactions with the randomize frequency button and verification
 * of oscillator frequency changes.
 */
export class RandomizeFrequencyPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators
  getRandomizeButton(): Locator {
    return this.getByTestId("randomize-frequency-button");
  }

  getFrequencySlider(oscillatorIndex: number): Locator {
    const section = this.getByTestId(`osc-${oscillatorIndex}-type`);
    return section.getByLabel(/freq.*hz/i);
  }

  // Actions
  async clickRandomize(): Promise<void> {
    const button = this.getRandomizeButton();
    await button.click();
  }

  // Helpers
  async getFrequency(oscillatorIndex: number): Promise<number> {
    const slider = this.getFrequencySlider(oscillatorIndex);
    const value = await slider.inputValue();
    return parseFloat(value);
  }

  /**
   * Get all 6 oscillator frequencies
   */
  async getAllFrequencies(): Promise<number[]> {
    const frequencies: number[] = [];
    for (let i = 0; i < 6; i++) {
      frequencies.push(await this.getFrequency(i));
    }
    return frequencies;
  }

  // Assertions
  async expectRandomizeButtonVisible(): Promise<void> {
    const button = this.getRandomizeButton();
    await expect(button).toBeVisible();
  }

  async expectFrequenciesChanged(beforeFrequencies: number[]): Promise<void> {
    const afterFrequencies = await this.getAllFrequencies();

    // At least some frequencies should have changed
    // (extremely unlikely all 6 random frequencies match the previous 6)
    const hasChanged = afterFrequencies.some(
      (freq, index) => freq !== beforeFrequencies[index]
    );

    expect(hasChanged).toBe(true);
  }

  async expectFrequenciesInRange(
    minFreq: number,
    maxFreq: number
  ): Promise<void> {
    const frequencies = await this.getAllFrequencies();

    frequencies.forEach((freq, index) => {
      expect(
        freq,
        `Oscillator ${index} frequency ${freq} should be between ${minFreq} and ${maxFreq}`
      ).toBeGreaterThanOrEqual(minFreq);

      expect(
        freq,
        `Oscillator ${index} frequency ${freq} should be between ${minFreq} and ${maxFreq}`
      ).toBeLessThanOrEqual(maxFreq);
    });
  }
}
