import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page object for FatOscillator functionality
 *
 * Handles interactions with oscillator type selection (basic/fat),
 * fat oscillator parameters (voices, detune), and related controls
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
    return section.getByRole("radio").and(section.locator("input[type='radio']")).first();
  }

  getOscillatorTypeRadio(index: number, type: "basic" | "fat"): Locator {
    // Get the specific radio button for basic or fat type
    const section = this.getOscillatorSection(index);
    return section.getByRole("radio", { name: new RegExp(`^${type}$`, "i") });
  }

  getVoicesSlider(index: number): Locator {
    // Only visible when oscillator type is "fat"
    const section = this.getOscillatorSection(index);
    return section.getByLabel(/voices/i);
  }

  getDetuneSlider(index: number): Locator {
    // Only visible when oscillator type is "fat"
    const section = this.getOscillatorSection(index);
    return section.getByLabel(/detune/i);
  }

  getWaveformSelector(index: number, waveform: "sine" | "square" | "triangle" | "sawtooth"): Locator {
    // Get the specific radio button for the waveform
    const section = this.getOscillatorSection(index);
    return section.getByRole("radio", { name: new RegExp(`^${waveform}$`, "i") });
  }

  // Actions
  async setOscillatorType(index: number, type: "basic" | "fat"): Promise<void> {
    const radio = this.getOscillatorTypeRadio(index, type);
    await radio.click();
    // Wait for the radio to be checked
    await expect(radio).toBeChecked();
  }

  async setWaveform(index: number, waveform: "sine" | "square" | "triangle" | "sawtooth"): Promise<void> {
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
  async expectOscillatorType(index: number, type: "basic" | "fat"): Promise<void> {
    const radio = this.getOscillatorTypeRadio(index, type);
    await expect(radio).toBeChecked();
  }

  async expectWaveform(index: number, waveform: "sine" | "square" | "triangle" | "sawtooth"): Promise<void> {
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

  async expectVoicesHidden(index: number): Promise<void> {
    const slider = this.getVoicesSlider(index);
    await expect(slider).not.toBeVisible();
  }

  async expectDetuneVisible(index: number): Promise<void> {
    const slider = this.getDetuneSlider(index);
    await expect(slider).toBeVisible();
  }

  async expectDetuneHidden(index: number): Promise<void> {
    const slider = this.getDetuneSlider(index);
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
