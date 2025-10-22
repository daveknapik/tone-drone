import { test } from "../fixtures/testFixtures";
import { PolySynthPage } from "../pages/PolySynthPage";

test.describe("Polysynth Controls", () => {
  let polySynthPage: PolySynthPage;

  test.beforeEach(async ({ page }) => {
    polySynthPage = new PolySynthPage(page);
  });

  test("should start with polysynth collapsed", async () => {
    // Arrange: PolySynthPage is initialized

    // Act & Assert: The polysynth section should be collapsed initially
    await polySynthPage.expectCollapsed();
  });

  test("should expand polysynth section when clicked", async () => {
    // Arrange: Polysynth is collapsed

    // Act: Expand the polysynth section
    await polySynthPage.expandPolySynth();

    // Assert: The Play Note button should be visible
    await polySynthPage.expectExpanded();
  });

  test("should collapse polysynth section when clicked", async () => {
    // Arrange: Expand the polysynth section first
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();

    // Act: Collapse the polysynth section
    await polySynthPage.collapsePolySynth();

    // Assert: The Play Note button should be hidden
    await polySynthPage.expectCollapsed();
  });

  test("should toggle polysynth expansion on repeated clicks", async () => {
    // Arrange: Polysynth is collapsed

    // Act & Assert: Expand
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();

    // Act & Assert: Collapse
    await polySynthPage.collapsePolySynth();
    await polySynthPage.expectCollapsed();

    // Act & Assert: Expand again
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();
  });
});

test.describe("Polysynth Play Note Button", () => {
  let polySynthPage: PolySynthPage;

  test.beforeEach(async ({ page }) => {
    polySynthPage = new PolySynthPage(page);
  });

  test("should click Play Note button", async () => {
    // Arrange: Polysynth is collapsed

    // Act: Play a note (this will expand and click the button)
    await polySynthPage.playNote();

    // Assert: The Play Note button should still be visible and clickable
    await polySynthPage.expectPlayNoteButtonVisible();
  });

  test("should keep polysynth expanded after playing a note", async () => {
    // Arrange: Polysynth is collapsed

    // Act: Play a note
    await polySynthPage.playNote();

    // Assert: Polysynth should remain expanded
    await polySynthPage.expectExpanded();
  });

  test("should allow clicking Play Note button multiple times", async () => {
    // Arrange: Expand polysynth
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();

    // Act & Assert: Click multiple times
    for (let i = 0; i < 3; i++) {
      await polySynthPage.playNoteButton.click();
      // Verify the button is still accessible after each click
      await polySynthPage.expectPlayNoteButtonVisible();
    }
  });
});

test.describe("Polysynth Keyboard Shortcut", () => {
  let polySynthPage: PolySynthPage;

  test.beforeEach(async ({ page }) => {
    polySynthPage = new PolySynthPage(page);
  });

  test("should trigger polysynth with 'p' key when expanded", async () => {
    // Arrange: Expand the polysynth section
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();

    // Act: Press the 'p' key
    await polySynthPage.pressPKey();

    // Assert: The page should still be in a valid state (no errors)
    // Note: We can't directly assert that audio was produced, but we can
    // verify that the UI is still responsive
    await polySynthPage.expectPlayNoteButtonVisible();
  });

  test("should trigger polysynth with 'p' key when collapsed", async () => {
    // Arrange: Verify polysynth is collapsed
    await polySynthPage.expectCollapsed();

    // Act: Press the 'p' key (keyboard shortcut should work globally)
    await polySynthPage.pressPKey();

    // Assert: The polysynth should still be collapsed (keyboard shortcut
    // triggers audio, not UI changes), and the page should be responsive
    await polySynthPage.expectCollapsed();
  });

  test("should allow multiple presses of 'p' key", async () => {
    // Arrange: Polysynth is collapsed (keyboard shortcuts work globally)

    // Act: Press 'p' key multiple times
    for (let i = 0; i < 3; i++) {
      await polySynthPage.pressPKey();
    }

    // Assert: The page should still be responsive and in a valid state
    // Verify we can still interact with the polysynth
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();
  });

  test("should work with 'p' key even after expanding/collapsing", async () => {
    // Arrange: Expand the polysynth
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();

    // Act: Collapse it
    await polySynthPage.collapsePolySynth();
    await polySynthPage.expectCollapsed();

    // Act: Press 'p' key while collapsed
    await polySynthPage.pressPKey();

    // Assert: Polysynth should still be collapsed, page should be responsive
    await polySynthPage.expectCollapsed();

    // Act: Expand again and press 'p'
    await polySynthPage.expandPolySynth();
    await polySynthPage.pressPKey();

    // Assert: Should still be expanded and responsive
    await polySynthPage.expectExpanded();
  });

  test("'p' key should not conflict with other interactions", async () => {
    // Arrange: Expand polysynth
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();

    // Act: Mix keyboard shortcuts and button clicks
    await polySynthPage.pressPKey();
    await polySynthPage.playNoteButton.click();
    await polySynthPage.pressPKey();

    // Assert: UI should still be responsive
    await polySynthPage.expectPlayNoteButtonVisible();

    // Act: Collapse and use keyboard shortcut
    await polySynthPage.collapsePolySynth();
    await polySynthPage.pressPKey();

    // Assert: Should remain collapsed
    await polySynthPage.expectCollapsed();
  });
});
