import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page object for FatOscillator functionality
 *
 * Handles interactions with oscillator type switching (automatic based on voices slider),
 * fat oscillator parameters (voices, detune), and related controls.
 *
 * NOTE: The oscillator type is determined automatically:
 * - Voices = 1 → Basic oscillator (Tone.Oscillator)
 * - Voices > 1 → Fat oscillator (Tone.FatOscillator)
 * - Voices slider (1-10) is ALWAYS visible
 * - Detune slider is ALWAYS visible but DISABLED when Voices = 1
 * - When Voices > 1, Detune minimum is 1 (not 0) to prevent silence
 */
export class FatOscillatorPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators - Get oscillator controls within a specific oscillator section
  getOscillatorSection(index: number): Locator {
    // Each oscillator is in a div with data-testid=osc-{index}-type
    return this.getByTestId(`osc-${index}-type`);
  }

  getWaveformRadios(index: number): Locator {
    // Waveform selector - radio buttons within the oscillator section
    // The waveform options come first
    const section = this.getOscillatorSection(index);
    return section
      .getByRole("radio")
      .and(section.locator("input[type='radio']"))
      .first();
  }

  getVoicesSlider(index: number): Locator {
    // Voices slider - ALWAYS visible, ranges from 1 to 10
    // Controls the number of detuned oscillator voices
    const section = this.getOscillatorSection(index);
    return section.getByLabel(/voices/i);
  }

  getDetuneSlider(index: number): Locator {
    // Detune slider - ALWAYS visible but disabled when voices = 1
    // When voices > 1, minimum is 1 (not 0) to prevent silence
    const section = this.getOscillatorSection(index);
    return section.getByLabel(/detune/i);
  }

  getWaveformSelector(
    index: number,
    waveform: "sine" | "square" | "triangle" | "sawtooth"
  ): Locator {
    // Get the specific radio button for the waveform
    const section = this.getOscillatorSection(index);
    return section.getByRole("radio", {
      name: new RegExp(`^${waveform}$`, "i"),
    });
  }

  // Actions
  async setWaveform(
    index: number,
    waveform: "sine" | "square" | "triangle" | "sawtooth"
  ): Promise<void> {
    const radio = this.getWaveformSelector(index, waveform);
    await radio.click();
    // Wait for the radio to be checked
    await expect(radio).toBeChecked();
  }

  async setVoices(index: number, voices: number): Promise<void> {
    const slider = this.getVoicesSlider(index);
    await slider.fill(voices.toString());
    // Wait for the value to be set
    await expect(slider).toHaveValue(voices.toString());
  }

  async setDetune(index: number, detune: number): Promise<void> {
    const slider = this.getDetuneSlider(index);
    await slider.fill(detune.toString());
    // Wait for the value to be set
    await expect(slider).toHaveValue(detune.toString());
  }

  // Assertions
  /**
   * Assert oscillator type based on voices value
   * Voices = 1 → "basic", Voices > 1 → "fat"
   */
  async expectOscillatorType(
    index: number,
    type: "basic" | "fat"
  ): Promise<void> {
    const voices = await this.getVoices(index);
    const expectedVoices = type === "basic" ? 1 : voices > 1 ? voices : 2;
    await this.expectVoices(index, expectedVoices);
  }

  async expectWaveform(
    index: number,
    waveform: "sine" | "square" | "triangle" | "sawtooth"
  ): Promise<void> {
    const radio = this.getWaveformSelector(index, waveform);
    await expect(radio).toBeChecked();
  }

  async expectVoices(index: number, voices: number): Promise<void> {
    const slider = this.getVoicesSlider(index);
    await expect(slider).toHaveValue(voices.toString());
  }

  async expectDetune(index: number, detune: number): Promise<void> {
    const slider = this.getDetuneSlider(index);
    await expect(slider).toHaveValue(detune.toString());
  }

  async expectVoicesVisible(index: number): Promise<void> {
    const slider = this.getVoicesSlider(index);
    await expect(slider).toBeVisible();
  }

  /**
   * Voices slider is ALWAYS visible in the new UI
   * This assertion is kept for API compatibility but will always pass
   */
  async expectVoicesHidden(index: number): Promise<void> {
    const slider = this.getVoicesSlider(index);
    // Voices are always visible, so this check will always fail
    // For compatibility with old tests, we check it's NOT visible
    // but this is expected to fail since voices are always shown
    await expect(slider).not.toBeVisible();
  }

  /**
   * Assert detune slider is enabled (not disabled)
   * Detune is enabled when voices > 1
   */
  async expectDetuneEnabled(index: number): Promise<void> {
    const slider = this.getDetuneSlider(index);
    await expect(slider).toBeEnabled();
  }

  /**
   * Assert detune slider is disabled
   * Detune is disabled when voices = 1
   */
  async expectDetuneDisabled(index: number): Promise<void> {
    const slider = this.getDetuneSlider(index);
    await expect(slider).toBeDisabled();
  }

  /**
   * Assert detune slider is visible
   * Detune slider is always visible but may be disabled
   */
  async expectDetuneVisible(index: number): Promise<void> {
    const slider = this.getDetuneSlider(index);
    await expect(slider).toBeVisible();
  }

  /**
   * Assert detune slider is hidden
   * In the new UI, detune is always visible, so this will fail
   */
  async expectDetuneHidden(index: number): Promise<void> {
    const slider = this.getDetuneSlider(index);
    // Detune is always visible, so this check will always fail
    await expect(slider).not.toBeVisible();
  }

  // Helpers
  async getVoices(index: number): Promise<number> {
    const slider = this.getVoicesSlider(index);
    const value = await slider.inputValue();
    return parseInt(value);
  }

  async getDetune(index: number): Promise<number> {
    const slider = this.getDetuneSlider(index);
    const value = await slider.inputValue();
    return parseInt(value);
  }
}
