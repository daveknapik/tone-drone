import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page object for polysynth controls
 *
 * Handles interactions with the polysynth section, including:
 * - Expanding/collapsing the polysynth panel
 * - Playing notes via the Play Note button or 'p' keyboard shortcut
 * - Verifying polysynth state
 */
export class PolySynthPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Locators
   */

  /**
   * The polysynth section toggle heading
   * Opens/closes the collapsible polysynth panel
   * Note: This is a clickable div, not a semantic button
   */
  get polySynthHeading() {
    return this.page.getByText(/^PolySynth$/i);
  }

  /**
   * The "Play Note" button inside the expanded polysynth section
   * Used to trigger a note when polysynth is playing
   */
  get playNoteButton() {
    return this.page.getByRole("button", { name: /play note/i });
  }

  /**
   * Actions
   */

  /**
   * Expands the polysynth section if not already expanded
   * Waits for the Play Note button to become visible
   */
  async expandPolySynth(): Promise<void> {
    const isExpanded = await this.playNoteButton.isVisible().catch(() => false);

    if (!isExpanded) {
      await this.polySynthHeading.click();
      await this.playNoteButton.waitFor({ state: "visible" });
    }
  }

  /**
   * Collapses the polysynth section if not already collapsed
   * Waits for the Play Note button to become hidden
   */
  async collapsePolySynth(): Promise<void> {
    const isExpanded = await this.playNoteButton.isVisible().catch(() => false);

    if (isExpanded) {
      await this.polySynthHeading.click();
      await this.playNoteButton.waitFor({ state: "hidden" });
    }
  }

  /**
   * Plays a note by clicking the Play Note button
   * Automatically expands the polysynth section first
   */
  async playNote(): Promise<void> {
    await this.expandPolySynth();
    await this.playNoteButton.click();
  }

  /**
   * Triggers the polysynth 'p' keyboard shortcut
   * This should work regardless of whether the polysynth is expanded
   */
  async pressPKey(): Promise<void> {
    await this.page.keyboard.press("p");
  }

  /**
   * Assertions
   */

  /**
   * Verifies that the polysynth section is expanded
   * (Play Note button is visible)
   */
  async expectExpanded(): Promise<void> {
    await this.playNoteButton.waitFor({ state: "visible" });
  }

  /**
   * Verifies that the polysynth section is collapsed
   * (Play Note button is hidden)
   */
  async expectCollapsed(): Promise<void> {
    await this.playNoteButton.waitFor({ state: "hidden" });
  }

  /**
   * Verifies that the Play Note button is visible
   */
  async expectPlayNoteButtonVisible(): Promise<void> {
    await this.playNoteButton.waitFor({ state: "visible" });
  }
}
