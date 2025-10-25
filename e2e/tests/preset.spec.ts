import { test, expect } from "../fixtures/testFixtures";
import { PresetPage } from "../pages/PresetPage";

test.describe("Preset Management", () => {
  let presetPage: PresetPage;

  test.beforeEach(async ({ page }) => {
    presetPage = new PresetPage(page);
  });

  test("should start with no preset loaded initially", async () => {
    // App starts with clean localStorage, no preset loaded
    await presetPage.expectPresetButtonText("Presets");
  });

  test("should display factory presets in dropdown", async () => {
    await presetPage.openPresetMenu();

    // Check that all factory presets are visible
    await presetPage.expectFactoryPresetExists("factory-init");
    await presetPage.expectFactoryPresetExists("factory-the-ending-world");
    await presetPage.expectFactoryPresetExists("factory-melody-memory");
    await presetPage.expectFactoryPresetExists("factory-rhythmic-pulsar");
  });

  test("should load a factory preset", async () => {
    // Load a factory preset
    await presetPage.loadFactoryPreset("factory-the-ending-world");

    // Verify the preset button shows the loaded preset name
    await presetPage.expectPresetButtonText("The Ending World");
    await presetPage.expectNoModifiedIndicator();
  });

  test("should disable save button when no preset is loaded", async () => {
    // When no preset is loaded, Save button should be disabled
    await presetPage.openPresetMenu();

    const saveButton = presetPage.saveButton;
    const isDisabled = await saveButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test("should enable save button when preset is loaded", async () => {
    // Load a preset first
    await presetPage.loadFactoryPreset("factory-init");

    await presetPage.openPresetMenu();

    const saveButton = presetPage.saveButton;
    const isDisabled = await saveButton.isDisabled();
    expect(isDisabled).toBe(false);
  });

  test("should not allow deleting factory presets", async () => {
    await presetPage.openPresetMenu();

    // Factory presets should not have delete buttons
    await expect(
      presetPage.getByTestId("preset-delete-factory-init")
    ).not.toBeVisible();
  });

  test("should apply effects bus send value when loading preset", async ({
    page,
  }) => {
    // Load a preset that has a specific bus send value
    await presetPage.loadFactoryPreset("factory-the-ending-world");

    // Get the effects bus send slider input
    const busSlider = page.getByLabel(/effects send/i);

    // The Ending World preset has bus send of -8
    // The slider uses logarithmic scale, so we need to transform the expected value
    const toLogarithmic = (value: number): number => {
      const sign = Math.sign(value);
      return sign * Math.log(Math.abs(value) + 1);
    };

    const expectedSliderValue = toLogarithmic(-8);

    // Get the actual slider value
    const actualSliderValue = await busSlider.inputValue();

    // The slider value should match the logarithmic transformation
    // Use precision of 2 to account for the 2-decimal-place rounding in Slider.tsx:45
    expect(parseFloat(actualSliderValue)).toBeCloseTo(expectedSliderValue, 2);
  });

  test("should show modified indicator when BPM changes", async ({ page }) => {
    // Load a preset
    await presetPage.loadFactoryPreset("factory-init");

    // Verify no modified indicator initially
    await presetPage.expectNoModifiedIndicator();

    // Change BPM
    const bpmSlider = page.getByLabel(/bpm/i);
    await bpmSlider.fill("140");

    // Modified indicator should appear
    await presetPage.expectModifiedIndicator();
  });

  test("should show modified indicator when sequence steps change", async ({
    page,
  }) => {
    // Load a preset
    await presetPage.loadFactoryPreset("factory-init");

    // Click first sequencer step (oscillator 0, step 0)
    const sequencerStep = page.getByTestId("step-0-0");

    // Ensure button is visible (oscillators section should be expanded by default)
    await sequencerStep.waitFor({ state: "visible", timeout: 5000 });

    // Click a sequencer step to modify the sequence
    await sequencerStep.click();

    // Modified indicator should appear
    await presetPage.expectModifiedIndicator();
  });

  test("should show modified indicator when effects parameters change", async ({
    page,
  }) => {
    // Load a preset
    await presetPage.loadFactoryPreset("factory-init");

    // Get the filter frequency slider
    const filterFreqSliders = page.getByLabel(/^Frequency$/i);
    const filterFreqSlider = filterFreqSliders.first();

    // Ensure effects section is expanded by checking if slider is visible
    // If not visible, click the heading to expand
    const isVisible = await filterFreqSlider.isVisible();
    if (!isVisible) {
      const effectsHeading = page.getByText("Effects", { exact: true });
      await effectsHeading.click();
      await filterFreqSlider.waitFor({ state: "visible" });
    }

    // Change filter frequency
    await filterFreqSlider.fill("500");

    // Modified indicator should appear
    await presetPage.expectModifiedIndicator();
  });

  test("should save and load BPM with user preset", async ({ page }) => {
    // Load a factory preset to start
    await presetPage.loadFactoryPreset("factory-init");

    // Change BPM to a custom value
    const bpmSlider = page.getByLabel(/bpm/i);
    await bpmSlider.fill("180");

    // Setup dialog handler for browser prompt
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("prompt");
      expect(dialog.message()).toContain("preset name");
      await dialog.accept("Test BPM Preset");
    });

    // Save as a new preset
    await presetPage.openPresetMenu();
    const saveAsButton = presetPage.saveAsButton;
    await saveAsButton.click();

    // Verify preset is loaded
    await presetPage.expectPresetButtonText("Test BPM Preset");

    // Change BPM to verify we can detect reload
    await bpmSlider.fill("120");

    // Setup dialog handler for unsaved changes confirmation
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");
      expect(dialog.message()).toContain("unsaved changes");
      await dialog.accept(); // Accept the dialog to proceed with loading
    });

    // Reload the preset
    await presetPage.openPresetMenu();
    const presetItem = page
      .getByTestId(/^preset-user-/)
      .filter({ hasText: "Test BPM Preset" });
    await presetItem.click();

    // Verify BPM is restored to 180 (using Playwright's built-in auto-waiting)
    await expect(bpmSlider).toHaveValue("180");
  });

  test("should load factory presets with correct BPM", async ({ page }) => {
    // Load factory preset
    await presetPage.loadFactoryPreset("factory-init");

    // Verify BPM is 120 (default)
    const bpmSlider = page.getByLabel(/bpm/i);
    const bpmValue = await bpmSlider.inputValue();
    expect(parseFloat(bpmValue)).toBe(120);
  });
});

test.describe("Preset Browser", () => {
  let presetPage: PresetPage;

  test.beforeEach(async ({ page }) => {
    presetPage = new PresetPage(page);
  });

  test("should open preset browser modal", async () => {
    await presetPage.openPresetBrowser();

    // The menu should close
    await expect(presetPage.newButton).not.toBeVisible();
  });
});

test.describe("Preset Share", () => {
  let presetPage: PresetPage;

  test.beforeEach(async ({ page }) => {
    presetPage = new PresetPage(page);
  });

  test("should open share modal for current preset", async ({ page }) => {
    // Load a preset first (need one to share)
    await presetPage.loadFactoryPreset("factory-init");

    // Open share modal
    await presetPage.shareCurrentPreset();

    // Verify share modal is open by checking for the copy button
    await expect(
      page.getByRole("button", { name: /copy url to clipboard/i })
    ).toBeVisible();
  });

  test("should generate shareable URL", async ({ page }) => {
    // Load a preset
    await presetPage.loadFactoryPreset("factory-init");

    // Open share modal
    await presetPage.shareCurrentPreset();

    // Wait for URL to be generated and displayed
    const urlElement = page.getByTestId("share-url-display");
    await urlElement.waitFor({ state: "visible", timeout: 5000 });

    // The URL should be displayed
    const shareUrl = await urlElement.textContent();
    expect(shareUrl).toBeTruthy();
    expect(shareUrl).toContain("http");
    expect(shareUrl).toContain("tone-drone");
  });

  test("should preserve BPM when sharing via URL", async ({
    page,
    context,
  }) => {
    // Load a preset
    await presetPage.loadFactoryPreset("factory-init");

    // Change BPM to a custom value
    const bpmSlider = page.getByLabel(/bpm/i);
    await bpmSlider.fill("165");

    // Open share modal
    await presetPage.shareCurrentPreset();

    // Get the shareable URL
    const urlElement = page.getByTestId("share-url-display");
    await urlElement.waitFor({ state: "visible", timeout: 5000 });
    const shareUrl = await urlElement.textContent();

    // Close share modal
    const closeButton = page.getByRole("button", { name: /close/i });
    await closeButton.click();

    // Navigate to the shared URL in a new page
    const newPage = await context.newPage();
    await newPage.goto(shareUrl!);

    // Initialize audio context on new page (mimic test fixture)
    await newPage.click("body");

    // Wait for BPM slider to be visible (DOM-based wait, not networkidle)
    const newBpmSlider = newPage.getByLabel(/bpm/i);
    await newBpmSlider.waitFor({ state: "visible" });

    // Verify BPM is preserved (using Playwright's auto-retry)
    await expect(newBpmSlider).toHaveValue("165");

    await newPage.close();
  });
});
