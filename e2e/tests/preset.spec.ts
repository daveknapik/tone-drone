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
    await presetPage.expectFactoryPresetExists("factory-deep-space-drone");
    await presetPage.expectFactoryPresetExists("factory-gentle-waves");
    await presetPage.expectFactoryPresetExists("factory-rhythmic-pulsar");
  });

  test("should load a factory preset", async () => {
    // Load a factory preset
    await presetPage.loadFactoryPreset("factory-deep-space-drone");

    // Verify the preset button shows the loaded preset name
    await presetPage.expectPresetButtonText("Deep Space Drone");
    await presetPage.expectNoModifiedIndicator();
  });

  test("should disable save button when no preset is loaded", async () => {
    // When no preset is loaded, Save button should be disabled
    await presetPage.openPresetMenu();

    const saveButton = presetPage.getByTestId("preset-save");
    const isDisabled = await saveButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test("should enable save button when preset is loaded", async () => {
    // Load a preset first
    await presetPage.loadFactoryPreset("factory-init");

    await presetPage.openPresetMenu();

    const saveButton = presetPage.getByTestId("preset-save");
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
});

test.describe("Preset Browser", () => {
  let presetPage: PresetPage;

  test.beforeEach(async ({ page }) => {
    presetPage = new PresetPage(page);
  });

  test("should open preset browser modal", async () => {
    await presetPage.openPresetBrowser();

    // The menu should close
    await expect(presetPage.getByTestId("preset-new")).not.toBeVisible();
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

    // Verify share modal is open
    await expect(page.getByTestId("share-copy-url")).toBeVisible();
  });

  test("should generate shareable URL", async ({ page }) => {
    // Load a preset
    await presetPage.loadFactoryPreset("factory-init");

    // Open share modal
    await presetPage.shareCurrentPreset();

    // Wait for URL to be generated and displayed
    const urlElement = page.locator(".font-mono");
    await urlElement.waitFor({ state: "visible", timeout: 5000 });

    // The URL should be displayed
    const shareUrl = await urlElement.textContent();
    expect(shareUrl).toBeTruthy();
    expect(shareUrl).toContain("http");
    expect(shareUrl).toContain("tone-drone");
  });

  test("should copy shareable URL to clipboard", async ({ page, context, browserName }) => {
    // Note: We test UI feedback (button text change) rather than actual clipboard content
    // This is more reliable across browsers and tests user-visible behavior

    // Grant clipboard permissions BEFORE clicking (Chromium-specific)
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-write", "clipboard-read"]);
    }

    // Load a preset
    await presetPage.loadFactoryPreset("factory-init");

    // Open share modal
    await presetPage.shareCurrentPreset();

    // Click copy button
    const copyButton = page.getByTestId("share-copy-url");
    await copyButton.click();

    // Verify success message (button text changes to "✓ Copied to Clipboard!")
    // This is the user-facing feedback that matters
    await expect(copyButton).toContainText("Copied to Clipboard!", { timeout: 5000 });

    // Optional: For Chromium, we can verify actual clipboard content
    if (browserName === "chromium") {
      const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
      expect(clipboardContent).toContain("http");
      expect(clipboardContent).toContain("tone-drone");
    }
  });
});
