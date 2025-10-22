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

    // Assert: Both Play Note buttons should be visible
    await polySynthPage.expectExpanded();
  });

  test("should collapse polysynth section when clicked", async () => {
    // Arrange: Expand the polysynth section first
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();

    // Act: Collapse the polysynth section
    await polySynthPage.collapsePolySynth();

    // Assert: Both Play Note buttons should be hidden
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

  test("should display both Play Note buttons when expanded", async () => {
    // Arrange: Polysynth is collapsed

    // Act: Expand the polysynth section
    await polySynthPage.expandPolySynth();

    // Assert: Verify exactly 2 Play Note buttons are present and visible
    await polySynthPage.expectBothPlayNoteButtonsPresent();
  });
});

test.describe("Polysynth Play Note Buttons", () => {
  let polySynthPage: PolySynthPage;

  test.beforeEach(async ({ page }) => {
    polySynthPage = new PolySynthPage(page);
  });

  test("should click Play Note button on Polysynth 1", async () => {
    // Arrange: Polysynth is collapsed

    // Act: Play a note on Polysynth 1
    await polySynthPage.playNotePolysynth1();

    // Assert: Both Play Note buttons should be visible
    await polySynthPage.expectPlayNoteButtonsVisible();
  });

  test("should click Play Note button on Polysynth 2", async () => {
    // Arrange: Polysynth is collapsed

    // Act: Play a note on Polysynth 2
    await polySynthPage.playNotePolysynth2();

    // Assert: Both Play Note buttons should be visible
    await polySynthPage.expectPlayNoteButtonsVisible();
  });

  test("should keep polysynth expanded after playing a note on Polysynth 1", async () => {
    // Arrange: Polysynth is collapsed

    // Act: Play a note on Polysynth 1
    await polySynthPage.playNotePolysynth1();

    // Assert: Polysynth should remain expanded
    await polySynthPage.expectExpanded();
  });

  test("should keep polysynth expanded after playing a note on Polysynth 2", async () => {
    // Arrange: Polysynth is collapsed

    // Act: Play a note on Polysynth 2
    await polySynthPage.playNotePolysynth2();

    // Assert: Polysynth should remain expanded
    await polySynthPage.expectExpanded();
  });

  test("should allow clicking Play Note button 1 multiple times", async () => {
    // Arrange: Expand polysynth
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();

    // Act & Assert: Click button 1 multiple times
    for (let i = 0; i < 3; i++) {
      await polySynthPage.playNoteButton1.click();
      // Verify the buttons are still accessible after each click
      await polySynthPage.expectPlayNoteButtonsVisible();
    }
  });

  test("should allow clicking Play Note button 2 multiple times", async () => {
    // Arrange: Expand polysynth
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();

    // Act & Assert: Click button 2 multiple times
    for (let i = 0; i < 3; i++) {
      await polySynthPage.playNoteButton2.click();
      // Verify the buttons are still accessible after each click
      await polySynthPage.expectPlayNoteButtonsVisible();
    }
  });

  test("should allow clicking both Play Note buttons alternately", async () => {
    // Arrange: Expand polysynth
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();

    // Act & Assert: Click buttons alternately
    for (let i = 0; i < 3; i++) {
      await polySynthPage.playNoteButton1.click();
      await polySynthPage.expectPlayNoteButtonsVisible();

      await polySynthPage.playNoteButton2.click();
      await polySynthPage.expectPlayNoteButtonsVisible();
    }
  });
});

test.describe("Polysynth 1 Keyboard Shortcut ('o' key)", () => {
  let polySynthPage: PolySynthPage;

  test.beforeEach(async ({ page }) => {
    polySynthPage = new PolySynthPage(page);
  });

  test("should trigger polysynth 1 with 'o' key when expanded", async () => {
    // Arrange: Expand the polysynth section
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();

    // Act: Press the 'o' key
    await polySynthPage.pressOKey();

    // Assert: The page should still be in a valid state (no errors)
    // Note: We can't directly assert that audio was produced, but we can
    // verify that the UI is still responsive
    await polySynthPage.expectPlayNoteButtonsVisible();
  });

  test("should trigger polysynth 1 with 'o' key when collapsed", async () => {
    // Arrange: Verify polysynth is collapsed
    await polySynthPage.expectCollapsed();

    // Act: Press the 'o' key (keyboard shortcut should work globally)
    await polySynthPage.pressOKey();

    // Assert: The polysynth should still be collapsed (keyboard shortcut
    // triggers audio, not UI changes), and the page should be responsive
    await polySynthPage.expectCollapsed();
  });

  test("should allow multiple presses of 'o' key", async () => {
    // Arrange: Polysynth is collapsed (keyboard shortcuts work globally)

    // Act: Press 'o' key multiple times
    for (let i = 0; i < 3; i++) {
      await polySynthPage.pressOKey();
    }

    // Assert: The page should still be responsive and in a valid state
    // Verify we can still interact with the polysynth
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();
  });

  test("should work with 'o' key even after expanding/collapsing", async () => {
    // Arrange: Expand the polysynth
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();

    // Act: Collapse it
    await polySynthPage.collapsePolySynth();
    await polySynthPage.expectCollapsed();

    // Act: Press 'o' key while collapsed
    await polySynthPage.pressOKey();

    // Assert: Polysynth should still be collapsed, page should be responsive
    await polySynthPage.expectCollapsed();

    // Act: Expand again and press 'o'
    await polySynthPage.expandPolySynth();
    await polySynthPage.pressOKey();

    // Assert: Should still be expanded and responsive
    await polySynthPage.expectExpanded();
  });

  test("'o' key should not conflict with other interactions", async () => {
    // Arrange: Expand polysynth
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();

    // Act: Mix keyboard shortcuts and button clicks
    await polySynthPage.pressOKey();
    await polySynthPage.playNoteButton1.click();
    await polySynthPage.pressOKey();

    // Assert: UI should still be responsive
    await polySynthPage.expectPlayNoteButtonsVisible();

    // Act: Collapse and use keyboard shortcut
    await polySynthPage.collapsePolySynth();
    await polySynthPage.pressOKey();

    // Assert: Should remain collapsed
    await polySynthPage.expectCollapsed();
  });
});

test.describe("Polysynth 2 Keyboard Shortcut ('p' key)", () => {
  let polySynthPage: PolySynthPage;

  test.beforeEach(async ({ page }) => {
    polySynthPage = new PolySynthPage(page);
  });

  test("should trigger polysynth 2 with 'p' key when expanded", async () => {
    // Arrange: Expand the polysynth section
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();

    // Act: Press the 'p' key
    await polySynthPage.pressPKey();

    // Assert: The page should still be in a valid state (no errors)
    // Note: We can't directly assert that audio was produced, but we can
    // verify that the UI is still responsive
    await polySynthPage.expectPlayNoteButtonsVisible();
  });

  test("should trigger polysynth 2 with 'p' key when collapsed", async () => {
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
    await polySynthPage.playNoteButton2.click();
    await polySynthPage.pressPKey();

    // Assert: UI should still be responsive
    await polySynthPage.expectPlayNoteButtonsVisible();

    // Act: Collapse and use keyboard shortcut
    await polySynthPage.collapsePolySynth();
    await polySynthPage.pressPKey();

    // Assert: Should remain collapsed
    await polySynthPage.expectCollapsed();
  });
});

test.describe("Polysynth Keyboard Shortcuts Separation", () => {
  let polySynthPage: PolySynthPage;

  test.beforeEach(async ({ page }) => {
    polySynthPage = new PolySynthPage(page);
  });

  test("should trigger 'o' and 'p' keys independently", async () => {
    // Arrange: Expand polysynth
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();

    // Act: Press both keys in sequence
    await polySynthPage.pressOKey();
    await polySynthPage.pressPKey();
    await polySynthPage.pressOKey();

    // Assert: UI should still be responsive
    await polySynthPage.expectPlayNoteButtonsVisible();
  });

  test("should handle rapid alternating 'o' and 'p' presses", async () => {
    // Arrange: Polysynth is collapsed

    // Act: Rapidly press 'o' and 'p' alternately
    for (let i = 0; i < 5; i++) {
      await polySynthPage.pressOKey();
      await polySynthPage.pressPKey();
    }

    // Assert: Page should still be responsive
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();
  });

  test("should work with both keyboard shortcuts when expanded", async () => {
    // Arrange: Expand the polysynth
    await polySynthPage.expandPolySynth();
    await polySynthPage.expectExpanded();

    // Act: Use both keyboard shortcuts with button clicks
    await polySynthPage.pressOKey();
    await polySynthPage.playNoteButton1.click();
    await polySynthPage.pressPKey();
    await polySynthPage.playNoteButton2.click();

    // Assert: UI should still be responsive with both buttons visible
    await polySynthPage.expectPlayNoteButtonsVisible();
  });

  test("should work with both keyboard shortcuts when collapsed", async () => {
    // Arrange: Verify polysynth is collapsed
    await polySynthPage.expectCollapsed();

    // Act: Use both keyboard shortcuts while collapsed
    await polySynthPage.pressOKey();
    await polySynthPage.pressPKey();

    // Assert: Polysynth should remain collapsed
    await polySynthPage.expectCollapsed();

    // Act: Expand and verify both buttons are there
    await polySynthPage.expandPolySynth();

    // Assert: Both buttons should be visible for the keyboard shortcuts
    await polySynthPage.expectPlayNoteButtonsVisible();
  });
});
