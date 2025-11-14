import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page object for synth envelope controls (ADSR)
 */
export class SynthEnvelopePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators - Using name attributes to differentiate from PolySynth envelope controls
  get attackSlider() {
    return this.page.locator('input[name="synth-attack"]');
  }

  get decaySlider() {
    return this.page.locator('input[name="synth-decay"]');
  }

  get sustainSlider() {
    return this.page.locator('input[name="synth-sustain"]');
  }

  get releaseSlider() {
    return this.page.locator('input[name="synth-release"]');
  }

  get envelopeHeading() {
    return this.page.getByText("Note Envelope");
  }

  // Actions
  async setAttack(value: number): Promise<void> {
    await this.attackSlider.fill(value.toString());
    await expect(this.attackSlider).toHaveValue(value.toString());
  }

  async setDecay(value: number): Promise<void> {
    await this.decaySlider.fill(value.toString());
    await expect(this.decaySlider).toHaveValue(value.toString());
  }

  async setSustain(value: number): Promise<void> {
    await this.sustainSlider.fill(value.toString());
    await expect(this.sustainSlider).toHaveValue(value.toString());
  }

  async setRelease(value: number): Promise<void> {
    await this.releaseSlider.fill(value.toString());
    await expect(this.releaseSlider).toHaveValue(value.toString());
  }

  async setEnvelope(
    attack: number,
    decay: number,
    sustain: number,
    release: number
  ): Promise<void> {
    await this.setAttack(attack);
    await this.setDecay(decay);
    await this.setSustain(sustain);
    await this.setRelease(release);
  }

  // Assertions
  async expectAttack(value: number): Promise<void> {
    await expect(this.attackSlider).toHaveValue(value.toString());
  }

  async expectDecay(value: number): Promise<void> {
    await expect(this.decaySlider).toHaveValue(value.toString());
  }

  async expectSustain(value: number): Promise<void> {
    await expect(this.sustainSlider).toHaveValue(value.toString());
  }

  async expectRelease(value: number): Promise<void> {
    await expect(this.releaseSlider).toHaveValue(value.toString());
  }

  async expectEnvelope(
    attack: number,
    decay: number,
    sustain: number,
    release: number
  ): Promise<void> {
    await this.expectAttack(attack);
    await this.expectDecay(decay);
    await this.expectSustain(sustain);
    await this.expectRelease(release);
  }

  async expectEnvelopeControlsVisible(): Promise<void> {
    await expect(this.envelopeHeading).toBeVisible();
    await expect(this.attackSlider).toBeVisible();
    await expect(this.decaySlider).toBeVisible();
    await expect(this.sustainSlider).toBeVisible();
    await expect(this.releaseSlider).toBeVisible();
  }

  async expectDefaultEnvelope(): Promise<void> {
    // Default values from DEFAULT_SYNTH_ENVELOPE_PARAMS
    await this.expectAttack(0.01);
    await this.expectDecay(0.1);
    await this.expectSustain(0.25);
    await this.expectRelease(0.5);
  }

  // Helpers
  async getAttack(): Promise<number> {
    const value = await this.attackSlider.inputValue();
    return parseFloat(value);
  }

  async getDecay(): Promise<number> {
    const value = await this.decaySlider.inputValue();
    return parseFloat(value);
  }

  async getSustain(): Promise<number> {
    const value = await this.sustainSlider.inputValue();
    return parseFloat(value);
  }

  async getRelease(): Promise<number> {
    const value = await this.releaseSlider.inputValue();
    return parseFloat(value);
  }

  async getEnvelope(): Promise<{
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  }> {
    return {
      attack: await this.getAttack(),
      decay: await this.getDecay(),
      sustain: await this.getSustain(),
      release: await this.getRelease(),
    };
  }
}
