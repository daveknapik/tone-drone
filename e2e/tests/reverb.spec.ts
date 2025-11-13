import { test, expect } from "../fixtures/testFixtures";
import { ReverbPage } from "../pages/ReverbPage";
import { PresetPage } from "../pages/PresetPage";

test.describe("Reverb Controls - Basic Rendering", () => {
  let reverbPage: ReverbPage;

  test.beforeEach(async ({ page }) => {
    reverbPage = new ReverbPage(page);
  });

  test("should display Reverb 1 controls", async () => {
    await reverbPage.expectReverb1Visible();
  });

  test("should display Reverb 2 controls", async () => {
    await reverbPage.expectReverb2Visible();
  });

  test("should display both reverbs with correct labels", async () => {
    await expect(reverbPage.reverb1Region).toContainText("Reverb 1");
    await expect(reverbPage.reverb2Region).toContainText("Reverb 2");
  });

  test("should start with default Reverb 1 values", async () => {
    await reverbPage.expectReverb1Defaults();
  });

  test("should start with default Reverb 2 values", async () => {
    await reverbPage.expectReverb2Defaults();
  });
});

test.describe("Reverb Controls - Reverb 1 Interaction", () => {
  let reverbPage: ReverbPage;

  test.beforeEach(async ({ page }) => {
    reverbPage = new ReverbPage(page);
  });

  test("should update Reverb 1 decay value", async () => {
    await reverbPage.setReverb1Decay(5.0);
    await reverbPage.expectReverb1Decay(5.0);
  });

  test("should update Reverb 1 pre-delay value", async () => {
    await reverbPage.setReverb1PreDelay(0.05);
    await reverbPage.expectReverb1PreDelay(0.05);
  });

  test("should update Reverb 1 wet value", async () => {
    await reverbPage.setReverb1Wet(0.7);
    await reverbPage.expectReverb1Wet(0.7);
  });

  test("should update all Reverb 1 parameters together", async () => {
    await reverbPage.setReverb1(8.0, 0.08, 0.9);
    await reverbPage.expectReverb1(8.0, 0.08, 0.9);
  });

  test("should handle Reverb 1 minimum decay value", async () => {
    await reverbPage.setReverb1Decay(0.1);
    await reverbPage.expectReverb1Decay(0.1);
  });

  test("should handle Reverb 1 maximum decay value", async () => {
    await reverbPage.setReverb1Decay(10);
    await reverbPage.expectReverb1Decay(10);
  });

  test("should handle Reverb 1 minimum pre-delay value", async () => {
    await reverbPage.setReverb1PreDelay(0);
    await reverbPage.expectReverb1PreDelay(0);
  });

  test("should handle Reverb 1 maximum pre-delay value", async () => {
    await reverbPage.setReverb1PreDelay(0.1);
    await reverbPage.expectReverb1PreDelay(0.1);
  });

  test("should handle Reverb 1 minimum wet value", async () => {
    await reverbPage.setReverb1Wet(0);
    await reverbPage.expectReverb1Wet(0);
  });

  test("should handle Reverb 1 maximum wet value", async () => {
    await reverbPage.setReverb1Wet(1);
    await reverbPage.expectReverb1Wet(1);
  });

  test("should maintain Reverb 1 values independently", async () => {
    // Set different values for each parameter
    await reverbPage.setReverb1Decay(3.5);
    await reverbPage.setReverb1PreDelay(0.03);
    await reverbPage.setReverb1Wet(0.6);

    // Verify all values are maintained
    await reverbPage.expectReverb1(3.5, 0.03, 0.6);
  });
});

test.describe("Reverb Controls - Reverb 2 Interaction", () => {
  let reverbPage: ReverbPage;

  test.beforeEach(async ({ page }) => {
    reverbPage = new ReverbPage(page);
  });

  test("should update Reverb 2 decay value", async () => {
    await reverbPage.setReverb2Decay(6.5);
    await reverbPage.expectReverb2Decay(6.5);
  });

  test("should update Reverb 2 pre-delay value", async () => {
    await reverbPage.setReverb2PreDelay(0.04);
    await reverbPage.expectReverb2PreDelay(0.04);
  });

  test("should update Reverb 2 wet value", async () => {
    await reverbPage.setReverb2Wet(0.8);
    await reverbPage.expectReverb2Wet(0.8);
  });

  test("should update all Reverb 2 parameters together", async () => {
    await reverbPage.setReverb2(7.5, 0.07, 0.85);
    await reverbPage.expectReverb2(7.5, 0.07, 0.85);
  });

  test("should handle Reverb 2 minimum decay value", async () => {
    await reverbPage.setReverb2Decay(0.1);
    await reverbPage.expectReverb2Decay(0.1);
  });

  test("should handle Reverb 2 maximum decay value", async () => {
    await reverbPage.setReverb2Decay(10);
    await reverbPage.expectReverb2Decay(10);
  });

  test("should handle Reverb 2 minimum pre-delay value", async () => {
    await reverbPage.setReverb2PreDelay(0);
    await reverbPage.expectReverb2PreDelay(0);
  });

  test("should handle Reverb 2 maximum pre-delay value", async () => {
    await reverbPage.setReverb2PreDelay(0.1);
    await reverbPage.expectReverb2PreDelay(0.1);
  });

  test("should handle Reverb 2 minimum wet value", async () => {
    await reverbPage.setReverb2Wet(0);
    await reverbPage.expectReverb2Wet(0);
  });

  test("should handle Reverb 2 maximum wet value", async () => {
    await reverbPage.setReverb2Wet(1);
    await reverbPage.expectReverb2Wet(1);
  });

  test("should maintain Reverb 2 values independently", async () => {
    // Set different values for each parameter
    await reverbPage.setReverb2Decay(4.5);
    await reverbPage.setReverb2PreDelay(0.06);
    await reverbPage.setReverb2Wet(0.75);

    // Verify all values are maintained
    await reverbPage.expectReverb2(4.5, 0.06, 0.75);
  });
});

test.describe("Reverb Controls - Independent Operation", () => {
  let reverbPage: ReverbPage;

  test.beforeEach(async ({ page }) => {
    reverbPage = new ReverbPage(page);
  });

  test("should configure Reverb 1 and Reverb 2 independently", async () => {
    // Set different values for each reverb
    await reverbPage.setReverb1(3.0, 0.02, 0.5);
    await reverbPage.setReverb2(7.0, 0.08, 0.8);

    // Verify both reverbs maintain their independent values
    await reverbPage.expectReverb1(3.0, 0.02, 0.5);
    await reverbPage.expectReverb2(7.0, 0.08, 0.8);
  });

  test("should not affect Reverb 2 when changing Reverb 1", async () => {
    // Set Reverb 2 to specific values
    await reverbPage.setReverb2(5.0, 0.05, 0.6);

    // Change Reverb 1
    await reverbPage.setReverb1(2.0, 0.01, 0.3);

    // Verify Reverb 2 is unchanged
    await reverbPage.expectReverb2(5.0, 0.05, 0.6);
  });

  test("should not affect Reverb 1 when changing Reverb 2", async () => {
    // Set Reverb 1 to specific values
    await reverbPage.setReverb1(4.0, 0.04, 0.7);

    // Change Reverb 2
    await reverbPage.setReverb2(9.0, 0.09, 0.95);

    // Verify Reverb 1 is unchanged
    await reverbPage.expectReverb1(4.0, 0.04, 0.7);
  });

  test("should handle extreme opposite values for both reverbs", async () => {
    // Set Reverb 1 to minimum values
    await reverbPage.setReverb1(0.1, 0, 0);

    // Set Reverb 2 to maximum values
    await reverbPage.setReverb2(10, 0.1, 1);

    // Verify both reverbs maintain their values
    await reverbPage.expectReverb1(0.1, 0, 0);
    await reverbPage.expectReverb2(10, 0.1, 1);
  });
});

test.describe("Reverb Controls - Preset Integration", () => {
  let reverbPage: ReverbPage;
  let presetPage: PresetPage;

  test.beforeEach(async ({ page }) => {
    reverbPage = new ReverbPage(page);
    presetPage = new PresetPage(page);
  });

  test.skip("should save Reverb 1 settings in preset", async () => {
    // Set custom Reverb 1 values
    await reverbPage.setReverb1(4.5, 0.045, 0.65);

    // Save as new preset
    await presetPage.saveAsPreset("Reverb1 Test Preset");
    await presetPage.expectPresetButtonText("Reverb1 Test Preset");

    // Reset to defaults
    await presetPage.createNewPreset();
    await reverbPage.expectReverb1Defaults();

    // Load the saved preset
    await presetPage.loadUserPreset("Reverb1 Test Preset");

    // Verify Reverb 1 was restored
    await reverbPage.expectReverb1(4.5, 0.045, 0.65);

    // Cleanup
    await presetPage.deleteUserPreset("Reverb1 Test Preset");
  });

  test.skip("should save Reverb 2 settings in preset", async () => {
    // Set custom Reverb 2 values
    await reverbPage.setReverb2(6.8, 0.072, 0.88);

    // Save as new preset
    await presetPage.saveAsPreset("Reverb2 Test Preset");
    await presetPage.expectPresetButtonText("Reverb2 Test Preset");

    // Reset to defaults
    await presetPage.createNewPreset();
    await reverbPage.expectReverb2Defaults();

    // Load the saved preset
    await presetPage.loadUserPreset("Reverb2 Test Preset");

    // Verify Reverb 2 was restored
    await reverbPage.expectReverb2(6.8, 0.072, 0.88);

    // Cleanup
    await presetPage.deleteUserPreset("Reverb2 Test Preset");
  });

  test.skip("should save both reverb settings in preset", async () => {
    // Set custom values for both reverbs
    const reverb1Config = { decay: 3.2, preDelay: 0.032, wet: 0.55 };
    const reverb2Config = { decay: 8.7, preDelay: 0.089, wet: 0.92 };

    await reverbPage.setReverb1(
      reverb1Config.decay,
      reverb1Config.preDelay,
      reverb1Config.wet
    );
    await reverbPage.setReverb2(
      reverb2Config.decay,
      reverb2Config.preDelay,
      reverb2Config.wet
    );

    // Save preset
    await presetPage.saveAsPreset("Both Reverbs");

    // Create new preset (resets to defaults)
    await presetPage.createNewPreset();
    await reverbPage.expectReverb1Defaults();
    await reverbPage.expectReverb2Defaults();

    // Load saved preset
    await presetPage.loadUserPreset("Both Reverbs");

    // Verify both reverbs were restored
    await reverbPage.expectReverb1(
      reverb1Config.decay,
      reverb1Config.preDelay,
      reverb1Config.wet
    );
    await reverbPage.expectReverb2(
      reverb2Config.decay,
      reverb2Config.preDelay,
      reverb2Config.wet
    );

    // Cleanup
    await presetPage.deleteUserPreset("Both Reverbs");
  });

  test("should handle old presets without reverb data gracefully", async () => {
    // Load a factory preset (may have old single-reverb or no reverb data)
    await presetPage.loadFactoryPreset("factory-init");

    // Should fallback to default reverb values
    // Note: This might fail if factory-init has reverb data. Adjust based on actual behavior.
    await reverbPage.expectReverb1Defaults();
    await reverbPage.expectReverb2Defaults();
  });

  test("should mark preset as modified when Reverb 1 changes", async () => {
    // Load a preset
    await presetPage.loadFactoryPreset("factory-init");

    // Initially should not be modified
    await presetPage.expectNoModifiedIndicator();

    // Change Reverb 1 decay
    await reverbPage.setReverb1Decay(5.5);

    // Preset should now be marked as modified
    await presetPage.expectModifiedIndicator();
  });

  test("should mark preset as modified when Reverb 2 changes", async () => {
    // Load a preset
    await presetPage.loadFactoryPreset("factory-init");

    // Initially should not be modified
    await presetPage.expectNoModifiedIndicator();

    // Change Reverb 2 wet
    await reverbPage.setReverb2Wet(0.75);

    // Preset should now be marked as modified
    await presetPage.expectModifiedIndicator();
  });

  test.skip("should not mark preset as modified when setting same reverb values", async () => {
    // Set reverb values
    await reverbPage.setReverb1(2.5, 0.01, 0);
    await reverbPage.setReverb2(2.5, 0.01, 0);

    // Save preset
    await presetPage.saveAsPreset("Unchanged Reverbs");

    // Should not be modified
    await presetPage.expectNoModifiedIndicator();

    // Set same values again
    await reverbPage.setReverb1(2.5, 0.01, 0);
    await reverbPage.setReverb2(2.5, 0.01, 0);

    // Still should not be modified
    await presetPage.expectNoModifiedIndicator();

    // Cleanup
    await presetPage.deleteUserPreset("Unchanged Reverbs");
  });
});

test.describe("Reverb Controls - Edge Cases", () => {
  let reverbPage: ReverbPage;

  test.beforeEach(async ({ page }) => {
    reverbPage = new ReverbPage(page);
  });

  test("should handle rapid consecutive Reverb 1 changes", async () => {
    // Rapidly change decay multiple times
    await reverbPage.setReverb1Decay(1.0);
    await reverbPage.setReverb1Decay(3.0);
    await reverbPage.setReverb1Decay(7.0);
    await reverbPage.setReverb1Decay(9.5);

    // Final value should be set correctly
    await reverbPage.expectReverb1Decay(9.5);
  });

  test("should handle rapid consecutive Reverb 2 changes", async () => {
    // Rapidly change wet multiple times
    await reverbPage.setReverb2Wet(0.2);
    await reverbPage.setReverb2Wet(0.5);
    await reverbPage.setReverb2Wet(0.8);
    await reverbPage.setReverb2Wet(1.0);

    // Final value should be set correctly
    await reverbPage.expectReverb2Wet(1.0);
  });

  test("should handle all Reverb 1 parameters at minimum", async () => {
    await reverbPage.setReverb1(0.1, 0, 0);
    await reverbPage.expectReverb1(0.1, 0, 0);
  });

  test("should handle all Reverb 1 parameters at maximum", async () => {
    await reverbPage.setReverb1(10, 0.1, 1);
    await reverbPage.expectReverb1(10, 0.1, 1);
  });

  test("should handle all Reverb 2 parameters at minimum", async () => {
    await reverbPage.setReverb2(0.1, 0, 0);
    await reverbPage.expectReverb2(0.1, 0, 0);
  });

  test("should handle all Reverb 2 parameters at maximum", async () => {
    await reverbPage.setReverb2(10, 0.1, 1);
    await reverbPage.expectReverb2(10, 0.1, 1);
  });

  test("should handle decimal precision for Reverb 1", async () => {
    await reverbPage.setReverb1(4.73, 0.047, 0.63);
    await reverbPage.expectReverb1(4.73, 0.047, 0.63);
  });

  test("should handle decimal precision for Reverb 2", async () => {
    await reverbPage.setReverb2(6.89, 0.068, 0.79);
    await reverbPage.expectReverb2(6.89, 0.068, 0.79);
  });

  test("should maintain both reverbs with different precision values", async () => {
    // Reverb 1 with step 0.1 precision for decay, 0.001 for preDelay, 0.01 for wet
    await reverbPage.setReverb1(3.7, 0.037, 0.47);

    // Reverb 2 with different precision values
    await reverbPage.setReverb2(8.3, 0.083, 0.93);

    // Verify both maintain precision
    await reverbPage.expectReverb1(3.7, 0.037, 0.47);
    await reverbPage.expectReverb2(8.3, 0.083, 0.93);
  });

  test.skip("should maintain reverb settings during page refresh", async ({ page }) => {
    // Set custom reverb values
    await reverbPage.setReverb1(5.5, 0.055, 0.66);
    await reverbPage.setReverb2(9.2, 0.092, 0.88);

    // Save preset
    const presetPage = new PresetPage(page);
    await presetPage.saveAsPreset("Refresh Test Reverb");

    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Reverbs should be restored from last loaded preset
    await reverbPage.expectReverb1(5.5, 0.055, 0.66);
    await reverbPage.expectReverb2(9.2, 0.092, 0.88);

    // Cleanup
    await presetPage.deleteUserPreset("Refresh Test Reverb");
  });

  test("should handle switching between very different decay values", async () => {
    // Start with short decay
    await reverbPage.setReverb1Decay(0.1);
    await reverbPage.expectReverb1Decay(0.1);

    // Switch to long decay
    await reverbPage.setReverb1Decay(10);
    await reverbPage.expectReverb1Decay(10);

    // Switch back to short decay
    await reverbPage.setReverb1Decay(0.1);
    await reverbPage.expectReverb1Decay(0.1);
  });

  test("should handle micro pre-delay adjustments", async () => {
    // Test very small pre-delay values (step is 0.001)
    await reverbPage.setReverb2PreDelay(0.001);
    await reverbPage.expectReverb2PreDelay(0.001);

    await reverbPage.setReverb2PreDelay(0.002);
    await reverbPage.expectReverb2PreDelay(0.002);

    await reverbPage.setReverb2PreDelay(0.005);
    await reverbPage.expectReverb2PreDelay(0.005);
  });

  test("should handle wet slider precision at different points", async () => {
    // Test wet at various points (step is 0.01)
    const wetValues = [0, 0.01, 0.25, 0.5, 0.75, 0.99, 1];

    for (const wet of wetValues) {
      await reverbPage.setReverb1Wet(wet);
      await reverbPage.expectReverb1Wet(wet);
    }
  });
});
