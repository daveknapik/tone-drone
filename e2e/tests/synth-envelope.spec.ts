import { test, expect } from "../fixtures/testFixtures";
import { SynthEnvelopePage } from "../pages/SynthEnvelopePage";
import { PresetPage } from "../pages/PresetPage";

test.describe("Synth Envelope Controls", () => {
  let envelopePage: SynthEnvelopePage;

  test.beforeEach(async ({ page }) => {
    envelopePage = new SynthEnvelopePage(page);
  });

  test("should display envelope controls", async () => {
    await envelopePage.expectEnvelopeControlsVisible();
  });

  test("should start with default envelope values", async () => {
    await envelopePage.expectDefaultEnvelope();
  });

  test("should update attack value", async () => {
    await envelopePage.setAttack(0.5);
    await envelopePage.expectAttack(0.5);
  });

  test("should update decay value", async () => {
    await envelopePage.setDecay(0.3);
    await envelopePage.expectDecay(0.3);
  });

  test("should update sustain value", async () => {
    await envelopePage.setSustain(0.7);
    await envelopePage.expectSustain(0.7);
  });

  test("should update release value", async () => {
    await envelopePage.setRelease(2.5);
    await envelopePage.expectRelease(2.5);
  });

  test("should update all envelope parameters together", async () => {
    await envelopePage.setEnvelope(1.0, 0.8, 0.6, 3.0);
    await envelopePage.expectEnvelope(1.0, 0.8, 0.6, 3.0);
  });

  test("should handle minimum attack value", async () => {
    await envelopePage.setAttack(0);
    await envelopePage.expectAttack(0);
  });

  test("should handle maximum attack value", async () => {
    await envelopePage.setAttack(2);
    await envelopePage.expectAttack(2);
  });

  test("should handle minimum sustain value", async () => {
    await envelopePage.setSustain(0);
    await envelopePage.expectSustain(0);
  });

  test("should handle maximum sustain value", async () => {
    await envelopePage.setSustain(1);
    await envelopePage.expectSustain(1);
  });

  test("should handle maximum release value", async () => {
    await envelopePage.setRelease(5);
    await envelopePage.expectRelease(5);
  });

  test("should maintain envelope values independently", async () => {
    // Set different values for each parameter
    await envelopePage.setAttack(0.2);
    await envelopePage.setDecay(0.4);
    await envelopePage.setSustain(0.8);
    await envelopePage.setRelease(1.5);

    // Verify all values are maintained
    await envelopePage.expectEnvelope(0.2, 0.4, 0.8, 1.5);
  });
});

test.describe("Synth Envelope Preset Integration", () => {
  let envelopePage: SynthEnvelopePage;
  let presetPage: PresetPage;

  test.beforeEach(async ({ page }) => {
    envelopePage = new SynthEnvelopePage(page);
    presetPage = new PresetPage(page);
  });

  test("should save envelope settings in preset", async () => {
    // Set custom envelope
    await envelopePage.setEnvelope(0.3, 0.5, 0.7, 2.0);

    // Save as new preset
    await presetPage.openSaveAsDialog();
    await presetPage.typePresetName("Envelope Test Preset");
    await presetPage.confirmSaveAs();
    await presetPage.expectPresetButtonText("Envelope Test Preset");

    // Reset to defaults
    await presetPage.createNewPreset();
    await envelopePage.expectDefaultEnvelope();

    // Load the saved preset
    await presetPage.loadUserPreset("Envelope Test Preset");

    // Verify envelope was restored
    await envelopePage.expectEnvelope(0.3, 0.5, 0.7, 2.0);

    // Cleanup
    await presetPage.deleteUserPreset("Envelope Test Preset");
  });

  test("should restore envelope settings when loading preset", async () => {
    // Set custom envelope values
    const customEnvelope = {
      attack: 1.2,
      decay: 0.6,
      sustain: 0.4,
      release: 3.5,
    };

    await envelopePage.setEnvelope(
      customEnvelope.attack,
      customEnvelope.decay,
      customEnvelope.sustain,
      customEnvelope.release
    );

    // Save preset
    await presetPage.openSaveAsDialog();
    await presetPage.typePresetName("Custom Envelope");
    await presetPage.confirmSaveAs();

    // Create new preset (resets to defaults)
    await presetPage.createNewPreset();
    await envelopePage.expectDefaultEnvelope();

    // Load saved preset
    await presetPage.loadUserPreset("Custom Envelope");

    // Verify envelope was restored
    await envelopePage.expectEnvelope(
      customEnvelope.attack,
      customEnvelope.decay,
      customEnvelope.sustain,
      customEnvelope.release
    );

    // Cleanup
    await presetPage.deleteUserPreset("Custom Envelope");
  });

  test("should handle old presets without envelope data gracefully", async () => {
    // Load a factory preset (which won't have envelope data initially)
    await presetPage.loadFactoryPreset("factory-init");

    // Should fallback to default envelope values
    await envelopePage.expectDefaultEnvelope();
  });

  test("should include envelope in shared preset URL", async () => {
    // Set custom envelope
    await envelopePage.setEnvelope(0.15, 0.25, 0.85, 2.5);

    // Share preset
    await presetPage.sharePreset();

    // Get the shared URL
    const sharedUrl = await presetPage.getSharedUrl();
    expect(sharedUrl).toBeTruthy();

    // Create new preset to reset state
    await presetPage.createNewPreset();
    await envelopePage.expectDefaultEnvelope();

    // Navigate to shared URL
    await presetPage.page.goto(sharedUrl);

    // Wait for preset to load from URL
    await presetPage.page.waitForLoadState("networkidle");

    // Verify envelope was restored from URL
    await envelopePage.expectEnvelope(0.15, 0.25, 0.85, 2.5);
  });

  test("should mark preset as modified when envelope changes", async () => {
    // Load a preset
    await presetPage.loadFactoryPreset("factory-init");

    // Initially should not be modified
    await presetPage.expectNotModified();

    // Change envelope
    await envelopePage.setAttack(0.5);

    // Preset should now be marked as modified
    await presetPage.expectModified();
  });

  test("should not mark preset as modified when setting same envelope values", async () => {
    // Set envelope values
    await envelopePage.setEnvelope(0.01, 0.1, 0.5, 0.1);

    // Save preset
    await presetPage.openSaveAsDialog();
    await presetPage.typePresetName("Unchanged Envelope");
    await presetPage.confirmSaveAs();

    // Should not be modified
    await presetPage.expectNotModified();

    // Set same values again
    await envelopePage.setEnvelope(0.01, 0.1, 0.5, 0.1);

    // Still should not be modified
    await presetPage.expectNotModified();

    // Cleanup
    await presetPage.deleteUserPreset("Unchanged Envelope");
  });
});

test.describe("Synth Envelope Edge Cases", () => {
  let envelopePage: SynthEnvelopePage;

  test.beforeEach(async ({ page }) => {
    envelopePage = new SynthEnvelopePage(page);
  });

  test("should handle rapid consecutive changes", async () => {
    // Rapidly change attack multiple times
    await envelopePage.setAttack(0.1);
    await envelopePage.setAttack(0.5);
    await envelopePage.setAttack(1.0);
    await envelopePage.setAttack(1.5);

    // Final value should be set correctly
    await envelopePage.expectAttack(1.5);
  });

  test("should handle all parameters at minimum", async () => {
    await envelopePage.setEnvelope(0, 0, 0, 0);
    await envelopePage.expectEnvelope(0, 0, 0, 0);
  });

  test("should handle all parameters at maximum", async () => {
    await envelopePage.setEnvelope(2, 2, 1, 5);
    await envelopePage.expectEnvelope(2, 2, 1, 5);
  });

  test("should handle decimal precision", async () => {
    await envelopePage.setEnvelope(0.12, 0.34, 0.56, 1.78);
    await envelopePage.expectEnvelope(0.12, 0.34, 0.56, 1.78);
  });

  test("should maintain envelope during page refresh", async ({ page }) => {
    // Set custom envelope
    await envelopePage.setEnvelope(0.4, 0.6, 0.8, 2.2);

    // Save preset
    const presetPage = new PresetPage(page);
    await presetPage.openSaveAsDialog();
    await presetPage.typePresetName("Refresh Test");
    await presetPage.confirmSaveAs();

    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Envelope should be restored from last loaded preset
    await envelopePage.expectEnvelope(0.4, 0.6, 0.8, 2.2);

    // Cleanup
    await presetPage.deleteUserPreset("Refresh Test");
  });
});
