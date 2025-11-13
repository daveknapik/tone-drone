import { Page, expect, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page object for Reverb 1 and Reverb 2 controls
 *
 * The app has two independent reverb effects:
 * - Reverb 1: Early in effects chain (can be distorted)
 * - Reverb 2: End of effects chain (clean ambience)
 *
 * Each reverb has three controls:
 * - Decay: 0.1-10 seconds
 * - Pre-Delay: 0-0.1 seconds
 * - Dry / Wet: 0-1
 */
export class ReverbPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators - Use semantic locators with scoping to differentiate Reverb 1 vs Reverb 2
  get reverb1Region(): Locator {
    // Find the region containing "Reverb 1" heading
    return this.page.locator('div:has(div:text-is("Reverb 1"))');
  }

  get reverb2Region(): Locator {
    // Find the region containing "Reverb 2" heading
    return this.page.locator('div:has(div:text-is("Reverb 2"))');
  }

  // Reverb 1 Sliders (scoped within Reverb 1 region)
  get reverb1DecaySlider(): Locator {
    return this.reverb1Region.locator('input[name="decay"]');
  }

  get reverb1PreDelaySlider(): Locator {
    return this.reverb1Region.locator('input[name="preDelay"]');
  }

  get reverb1WetSlider(): Locator {
    return this.reverb1Region.locator('input[name="wet"]');
  }

  // Reverb 2 Sliders (scoped within Reverb 2 region)
  get reverb2DecaySlider(): Locator {
    return this.reverb2Region.locator('input[name="decay"]');
  }

  get reverb2PreDelaySlider(): Locator {
    return this.reverb2Region.locator('input[name="preDelay"]');
  }

  get reverb2WetSlider(): Locator {
    return this.reverb2Region.locator('input[name="wet"]');
  }

  // ============================================================================
  // Actions - Reverb 1
  // ============================================================================

  async setReverb1Decay(value: number): Promise<void> {
    await this.reverb1DecaySlider.fill(value.toString());
  }

  async setReverb1PreDelay(value: number): Promise<void> {
    await this.reverb1PreDelaySlider.fill(value.toString());
  }

  async setReverb1Wet(value: number): Promise<void> {
    await this.reverb1WetSlider.fill(value.toString());
  }

  async setReverb1(
    decay: number,
    preDelay: number,
    wet: number
  ): Promise<void> {
    await this.setReverb1Decay(decay);
    await this.setReverb1PreDelay(preDelay);
    await this.setReverb1Wet(wet);
  }

  // ============================================================================
  // Actions - Reverb 2
  // ============================================================================

  async setReverb2Decay(value: number): Promise<void> {
    await this.reverb2DecaySlider.fill(value.toString());
  }

  async setReverb2PreDelay(value: number): Promise<void> {
    await this.reverb2PreDelaySlider.fill(value.toString());
  }

  async setReverb2Wet(value: number): Promise<void> {
    await this.reverb2WetSlider.fill(value.toString());
  }

  async setReverb2(
    decay: number,
    preDelay: number,
    wet: number
  ): Promise<void> {
    await this.setReverb2Decay(decay);
    await this.setReverb2PreDelay(preDelay);
    await this.setReverb2Wet(wet);
  }

  // ============================================================================
  // Assertions - Reverb 1
  // ============================================================================

  async expectReverb1Visible(): Promise<void> {
    await expect(this.reverb1Region).toBeVisible();
    await expect(this.reverb1DecaySlider).toBeVisible();
    await expect(this.reverb1PreDelaySlider).toBeVisible();
    await expect(this.reverb1WetSlider).toBeVisible();
  }

  async expectReverb1Decay(value: number): Promise<void> {
    await expect(this.reverb1DecaySlider).toHaveValue(value.toString());
  }

  async expectReverb1PreDelay(value: number): Promise<void> {
    await expect(this.reverb1PreDelaySlider).toHaveValue(value.toString());
  }

  async expectReverb1Wet(value: number): Promise<void> {
    await expect(this.reverb1WetSlider).toHaveValue(value.toString());
  }

  async expectReverb1(
    decay: number,
    preDelay: number,
    wet: number
  ): Promise<void> {
    await this.expectReverb1Decay(decay);
    await this.expectReverb1PreDelay(preDelay);
    await this.expectReverb1Wet(wet);
  }

  async expectReverb1Defaults(): Promise<void> {
    // Default values from Reverb component state
    await this.expectReverb1Decay(2.5);
    await this.expectReverb1PreDelay(0.01);
    await this.expectReverb1Wet(0);
  }

  // ============================================================================
  // Assertions - Reverb 2
  // ============================================================================

  async expectReverb2Visible(): Promise<void> {
    await expect(this.reverb2Region).toBeVisible();
    await expect(this.reverb2DecaySlider).toBeVisible();
    await expect(this.reverb2PreDelaySlider).toBeVisible();
    await expect(this.reverb2WetSlider).toBeVisible();
  }

  async expectReverb2Decay(value: number): Promise<void> {
    await expect(this.reverb2DecaySlider).toHaveValue(value.toString());
  }

  async expectReverb2PreDelay(value: number): Promise<void> {
    await expect(this.reverb2PreDelaySlider).toHaveValue(value.toString());
  }

  async expectReverb2Wet(value: number): Promise<void> {
    await expect(this.reverb2WetSlider).toHaveValue(value.toString());
  }

  async expectReverb2(
    decay: number,
    preDelay: number,
    wet: number
  ): Promise<void> {
    await this.expectReverb2Decay(decay);
    await this.expectReverb2PreDelay(preDelay);
    await this.expectReverb2Wet(wet);
  }

  async expectReverb2Defaults(): Promise<void> {
    // Default values from Reverb component state
    await this.expectReverb2Decay(2.5);
    await this.expectReverb2PreDelay(0.01);
    await this.expectReverb2Wet(0);
  }

  // ============================================================================
  // Helpers - Reverb 1
  // ============================================================================

  async getReverb1Decay(): Promise<number> {
    const value = await this.reverb1DecaySlider.inputValue();
    return parseFloat(value);
  }

  async getReverb1PreDelay(): Promise<number> {
    const value = await this.reverb1PreDelaySlider.inputValue();
    return parseFloat(value);
  }

  async getReverb1Wet(): Promise<number> {
    const value = await this.reverb1WetSlider.inputValue();
    return parseFloat(value);
  }

  async getReverb1(): Promise<{
    decay: number;
    preDelay: number;
    wet: number;
  }> {
    return {
      decay: await this.getReverb1Decay(),
      preDelay: await this.getReverb1PreDelay(),
      wet: await this.getReverb1Wet(),
    };
  }

  // ============================================================================
  // Helpers - Reverb 2
  // ============================================================================

  async getReverb2Decay(): Promise<number> {
    const value = await this.reverb2DecaySlider.inputValue();
    return parseFloat(value);
  }

  async getReverb2PreDelay(): Promise<number> {
    const value = await this.reverb2PreDelaySlider.inputValue();
    return parseFloat(value);
  }

  async getReverb2Wet(): Promise<number> {
    const value = await this.reverb2WetSlider.inputValue();
    return parseFloat(value);
  }

  async getReverb2(): Promise<{
    decay: number;
    preDelay: number;
    wet: number;
  }> {
    return {
      decay: await this.getReverb2Decay(),
      preDelay: await this.getReverb2PreDelay(),
      wet: await this.getReverb2Wet(),
    };
  }
}
