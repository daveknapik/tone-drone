import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page object for polysynth controls
 *
 * Handles interactions with the polysynth section, including:
 * - Expanding/collapsing the polysynth panel (contains 2 polysynths)
 * - Playing notes via individual Play Note buttons or keyboard shortcuts:
 *   - Polysynth 1 (left/top): 'o' key or Play Note button
 *   - Polysynth 2 (right/bottom): 'p' key or Play Note button
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
   * Opens/closes the collapsible polysynth panel (contains both polysynths)
   * Note: This is a clickable div, not a semantic button
   */
  get polySynthHeading() {
    return this.page.getByText(/^PolySynth$/i);
  }

  /**
   * All "Play Note" buttons inside the expanded polysynth section
   * There are now 2 buttons (one for each polysynth)
   * Used to trigger a note when polysynth is playing
   */
  get playNoteButtons() {
    return this.page.getByRole("button", { name: /play note/i });
  }

  /**
   * The first "Play Note" button (Polysynth 1)
   * Located on the left (desktop) or top (mobile)
   */
  get playNoteButton1() {
    return this.playNoteButtons.first();
  }

  /**
   * The second "Play Note" button (Polysynth 2)
   * Located on the right (desktop) or bottom (mobile)
   */
  get playNoteButton2() {
    return this.playNoteButtons.last();
  }

  /**
   * Actions
   */

  /**
   * Expands the polysynth section if not already expanded
   * Waits for both Play Note buttons to become visible
   */
  async expandPolySynth(): Promise<void> {
    const isExpanded = await this.playNoteButton1.isVisible().catch(() => false);

    if (!isExpanded) {
      await this.polySynthHeading.click();
      await this.playNoteButton1.waitFor({ state: "visible" });
      await this.playNoteButton2.waitFor({ state: "visible" });
    }
  }

  /**
   * Collapses the polysynth section if not already collapsed
   * Waits for both Play Note buttons to become hidden
   */
  async collapsePolySynth(): Promise<void> {
    const isExpanded = await this.playNoteButton1.isVisible().catch(() => false);

    if (isExpanded) {
      await this.polySynthHeading.click();
      await this.playNoteButton1.waitFor({ state: "hidden" });
      await this.playNoteButton2.waitFor({ state: "hidden" });
    }
  }

  /**
   * Plays a note on Polysynth 1 by clicking its Play Note button
   * Automatically expands the polysynth section first
   */
  async playNotePolysynth1(): Promise<void> {
    await this.expandPolySynth();
    await this.playNoteButton1.click();
  }

  /**
   * Plays a note on Polysynth 2 by clicking its Play Note button
   * Automatically expands the polysynth section first
   */
  async playNotePolysynth2(): Promise<void> {
    await this.expandPolySynth();
    await this.playNoteButton2.click();
  }

  /**
   * Triggers the Polysynth 1 'o' keyboard shortcut
   * This should work regardless of whether the polysynth is expanded
   */
  async pressOKey(): Promise<void> {
    await this.page.keyboard.press("o");
  }

  /**
   * Triggers the Polysynth 2 'p' keyboard shortcut
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
   * (Both Play Note buttons are visible)
   */
  async expectExpanded(): Promise<void> {
    await this.playNoteButton1.waitFor({ state: "visible" });
    await this.playNoteButton2.waitFor({ state: "visible" });
  }

  /**
   * Verifies that the polysynth section is collapsed
   * (Both Play Note buttons are hidden)
   */
  async expectCollapsed(): Promise<void> {
    await this.playNoteButton1.waitFor({ state: "hidden" });
    await this.playNoteButton2.waitFor({ state: "hidden" });
  }

  /**
   * Verifies that both Play Note buttons are visible
   */
  async expectPlayNoteButtonsVisible(): Promise<void> {
    await this.playNoteButton1.waitFor({ state: "visible" });
    await this.playNoteButton2.waitFor({ state: "visible" });
  }

  /**
   * Verifies that both Play Note buttons are hidden
   */
  async expectPlayNoteButtonsHidden(): Promise<void> {
    await this.playNoteButton1.waitFor({ state: "hidden" });
    await this.playNoteButton2.waitFor({ state: "hidden" });
  }

  /**
   * Verifies that exactly 2 Play Note buttons are visible
   */
  async expectBothPlayNoteButtonsPresent(): Promise<void> {
    const buttons = await this.playNoteButtons.count();
    if (buttons !== 2) {
      throw new Error(
        `Expected 2 Play Note buttons, but found ${buttons}`
      );
    }
    await this.playNoteButton1.waitFor({ state: "visible" });
    await this.playNoteButton2.waitFor({ state: "visible" });
  }
}
