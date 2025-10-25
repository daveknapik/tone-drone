import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page object for recording functionality
 */
export class RecorderPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Locators - Using semantic selectors
  get recorderToggle() {
    // Button with aria-label "Start Recording" or "Stop Recording"
    return this.page.getByRole("button", { name: /(start|stop) recording/i });
  }

  get downloadLink() {
    // Link with text "Download"
    return this.page.getByRole("link", { name: /download/i });
  }

  // Actions
  async startRecording(): Promise<void> {
    const isRecording = await this.isRecording();
    if (!isRecording) {
      await this.recorderToggle.click();
      // Wait for aria-label to change to "Stop Recording"
      await expect(this.recorderToggle).toHaveAttribute(
        "aria-label",
        "Stop Recording"
      );
    }
  }

  async stopRecording(): Promise<void> {
    const isRecording = await this.isRecording();
    if (isRecording) {
      await this.recorderToggle.click();
      // Wait for aria-label to change to "Start Recording" and download link to appear
      await expect(this.recorderToggle).toHaveAttribute(
        "aria-label",
        "Start Recording"
      );
      await expect(this.downloadLink).toBeVisible();
    }
  }

  async toggleRecording(): Promise<void> {
    const wasRecording = await this.isRecording();
    await this.recorderToggle.click();
    // Wait for aria-label to change
    const expectedLabel = wasRecording ? "Start Recording" : "Stop Recording";
    await expect(this.recorderToggle).toHaveAttribute(
      "aria-label",
      expectedLabel
    );
  }

  async recordFor(durationMs: number): Promise<void> {
    await this.startRecording();
    // Note: This waitForTimeout is intentional - we're recording audio for a specific duration
    await this.page.waitForTimeout(durationMs);
    await this.stopRecording();
  }

  // Assertions
  async expectRecording(): Promise<void> {
    await expect(this.recorderToggle).toHaveAttribute(
      "aria-label",
      "Stop Recording"
    );
  }

  async expectNotRecording(): Promise<void> {
    await expect(this.recorderToggle).toHaveAttribute(
      "aria-label",
      "Start Recording"
    );
  }

  async expectDownloadAvailable(): Promise<void> {
    await expect(this.downloadLink).toBeVisible();
  }

  async expectDownloadNotAvailable(): Promise<void> {
    await expect(this.downloadLink).not.toBeVisible();
  }

  // Helpers
  async isRecording(): Promise<boolean> {
    const ariaLabel = await this.recorderToggle.getAttribute("aria-label");
    return ariaLabel?.includes("Stop Recording") ?? false;
  }
}
