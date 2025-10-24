import { test, expect } from "../fixtures/testFixtures";
import { FatOscillatorPage } from "../pages/FatOscillatorPage";
import { PresetPage } from "../pages/PresetPage";

test.describe("FatOscillator - Parameter Visibility", () => {
  let fatOscPage: FatOscillatorPage;

  test.beforeEach(async ({ page }) => {
    fatOscPage = new FatOscillatorPage(page);
  });

  test("should display voices slider as always visible", async () => {
    // Arrange - page loads with default oscillators
    // Act & Assert - voices slider should always be visible
    await fatOscPage.expectVoicesVisible(0);
  });

  test("should disable detune slider when in basic mode (voices = 1)", async () => {
    // Arrange - oscillator starts in basic mode with voices = 1
    // Act & Assert - detune slider should be visible but disabled
    await fatOscPage.expectVoices(0, 1);
    await fatOscPage.expectDetuneDisabled(0);
  });

  test("should enable detune slider when in fat mode (voices > 1)", async () => {
    // Arrange & Act - increase voices to switch to fat mode
    await fatOscPage.setVoices(0, 3);

    // Assert - detune slider should be visible and enabled
    await fatOscPage.expectVoicesVisible(0);
    await fatOscPage.expectDetuneEnabled(0);
  });
});

test.describe("FatOscillator - Auto Type Switching", () => {
  let fatOscPage: FatOscillatorPage;

  test.beforeEach(async ({ page }) => {
    fatOscPage = new FatOscillatorPage(page);
  });

  test("should auto-switch to fat when voices > 1", async () => {
    // Arrange - starts in basic mode with voices = 1
    await fatOscPage.expectVoices(0, 1);

    // Act - increase voices to 3
    await fatOscPage.setVoices(0, 3);

    // Assert - should auto-switch to fat mode and detune should be enabled
    await fatOscPage.expectVoices(0, 3);
    await fatOscPage.expectDetuneEnabled(0);
  });

  test("should auto-switch to fat and enforce minimum detune when increasing voices", async () => {
    // Arrange - starts with sine waveform in basic mode with detune=0
    await fatOscPage.setWaveform(0, "sine");

    // Act - increase voices to 3 to switch to fat mode
    await fatOscPage.setVoices(0, 3);

    // Assert - should auto-switch to fat and enforce detune minimum
    // When fatCount changes from 1 to 3, oscillatorType auto-switches from basic to fat
    // Detune is bumped from 0 to 1 (minimum for fat mode to prevent silence)
    await fatOscPage.expectVoices(0, 3);
    await fatOscPage.expectDetune(0, 1); // bumped from 0 to minimum of 1
  });

  test("should auto-switch back to basic when voices = 1", async () => {
    // Arrange - switch to fat first
    await fatOscPage.setVoices(0, 3);
    await fatOscPage.expectDetuneEnabled(0);

    // Act - reduce voices back to 1
    await fatOscPage.setVoices(0, 1);

    // Assert - should auto-switch to basic and detune should be disabled
    await fatOscPage.expectVoices(0, 1);
    await fatOscPage.expectDetuneDisabled(0);
  });

  test("should enforce detune minimum of 1 when in fat mode", async () => {
    // Arrange - switch to fat with voices > 1
    await fatOscPage.setVoices(0, 3);

    // The detune should have been set to at least 1 (sine default is 12, but let's verify)
    // When switching from basic (detune=0) to fat, detune is bumped to 1 minimum
    const detune = await fatOscPage.getDetune(0);
    expect(detune).toBeGreaterThanOrEqual(1);
  });
});

test.describe("FatOscillator - Parameter Adjustment", () => {
  let fatOscPage: FatOscillatorPage;

  test.beforeEach(async ({ page }) => {
    fatOscPage = new FatOscillatorPage(page);
    // Setup: switch to fat mode by increasing voices
    await fatOscPage.setVoices(0, 3);
  });

  test("should adjust voices slider (minimum value 1 for basic mode)", async () => {
    // Act - set voices to minimum
    await fatOscPage.setVoices(0, 1);

    // Assert
    await fatOscPage.expectVoices(0, 1);
  });

  test("should adjust voices slider (minimum value 2 for fat mode)", async () => {
    // Act - set voices to 2 (minimum for fat with multiple voices)
    await fatOscPage.setVoices(0, 2);

    // Assert
    await fatOscPage.expectVoices(0, 2);
  });

  test("should adjust voices slider (maximum value 10)", async () => {
    // Act - set voices to maximum
    await fatOscPage.setVoices(0, 10);

    // Assert
    await fatOscPage.expectVoices(0, 10);
  });

  test("should adjust voices slider (mid-range value)", async () => {
    // Act - set voices to middle value
    await fatOscPage.setVoices(0, 6);

    // Assert
    await fatOscPage.expectVoices(0, 6);
  });

  test("should adjust detune slider (minimum value 1 in fat mode)", async () => {
    // Detune minimum is 1 (not 0) when voices > 1 to prevent silence
    // Act - set detune to minimum
    await fatOscPage.setDetune(0, 1);

    // Assert
    await fatOscPage.expectDetune(0, 1);
  });

  test("should adjust detune slider (maximum value 100)", async () => {
    // Act - set detune to maximum
    await fatOscPage.setDetune(0, 100);

    // Assert
    await fatOscPage.expectDetune(0, 100);
  });

  test("should adjust detune slider (mid-range value)", async () => {
    // Act - set detune to middle value
    await fatOscPage.setDetune(0, 50);

    // Assert
    await fatOscPage.expectDetune(0, 50);
  });

  test("should persist fat parameter values through voice changes", async () => {
    // Arrange - set custom values on oscillator 0 in fat mode
    await fatOscPage.setVoices(0, 7);
    await fatOscPage.setDetune(0, 45);

    // Store the values
    const voices0 = await fatOscPage.getVoices(0);
    const detune0 = await fatOscPage.getDetune(0);

    // Act - change voices then change back (staying in fat mode)
    await fatOscPage.setVoices(0, 4);
    await fatOscPage.setVoices(0, 7);

    // Assert - custom voice value should be restored
    const voicesAfter = await fatOscPage.getVoices(0);
    expect(voicesAfter).toBe(voices0);

    // Detune should remain stable when changing voices
    const detuneAfter = await fatOscPage.getDetune(0);
    expect(detuneAfter).toBe(detune0);
  });
});

test.describe("FatOscillator - Waveform-Specific Defaults", () => {
  let fatOscPage: FatOscillatorPage;

  test.beforeEach(async ({ page }) => {
    fatOscPage = new FatOscillatorPage(page);
  });

  test("should maintain voices when changing waveform in fat mode", async () => {
    // Arrange - switch to fat mode with sine
    await fatOscPage.setWaveform(0, "sine");
    const voicesCount = 5;
    await fatOscPage.setVoices(0, voicesCount);

    // Act - change waveform to sawtooth
    await fatOscPage.setWaveform(0, "sawtooth");

    // Assert - voices count should remain the same
    // Note: In the current implementation, waveform changes do NOT apply defaults
    await fatOscPage.expectWaveform(0, "sawtooth");
    await fatOscPage.expectVoices(0, voicesCount);
  });

  test("should support all waveforms while in fat mode", async () => {
    // Arrange - switch to fat mode
    await fatOscPage.setVoices(0, 4);

    // Act & Assert - test that we can set each waveform without issues
    const waveforms = ["sine", "square", "triangle", "sawtooth"] as const;
    for (const waveform of waveforms) {
      await fatOscPage.setWaveform(0, waveform);
      await fatOscPage.expectWaveform(0, waveform);
      // Voices should remain at 4 for all waveforms
      await fatOscPage.expectVoices(0, 4);
    }
  });

  test("should maintain detune when changing waveform in fat mode", async () => {
    // Arrange - switch to fat with custom detune
    await fatOscPage.setVoices(0, 3);
    await fatOscPage.setDetune(0, 45);

    // Act - change waveform to sawtooth
    await fatOscPage.setWaveform(0, "sawtooth");

    // Assert - detune should remain at 45 (not switch to sawtooth default of 30)
    await fatOscPage.expectDetune(0, 45);
  });

  test("should allow manual voices adjustment for each waveform", async () => {
    // Test that voices can be manually set to any value for any waveform
    // (waveform-specific defaults only apply on initial fat mode activation)
    const testCases = [
      { waveform: "sine", voices: 4 },
      { waveform: "square", voices: 6 },
      { waveform: "triangle", voices: 7 },
      { waveform: "sawtooth", voices: 3 },
    ] as const;

    // Arrange - switch to fat
    await fatOscPage.setVoices(0, 3);

    // Act & Assert - set different voices for each waveform
    for (const { waveform, voices } of testCases) {
      await fatOscPage.setWaveform(0, waveform);
      await fatOscPage.setVoices(0, voices);
      await fatOscPage.expectWaveform(0, waveform);
      await fatOscPage.expectVoices(0, voices);
    }
  });
});

test.describe("FatOscillator - Preset Integration", () => {
  let fatOscPage: FatOscillatorPage;
  let presetPage: PresetPage;

  test.beforeEach(async ({ page }) => {
    fatOscPage = new FatOscillatorPage(page);
    presetPage = new PresetPage(page);
  });

  test("should save and load fat oscillator settings in preset", async ({ page }) => {
    // Arrange - load a factory preset to have a starting state
    await presetPage.loadFactoryPreset("factory-init");

    // Switch oscillator 0 to fat with custom values
    await fatOscPage.setVoices(0, 7);
    await fatOscPage.setWaveform(0, "square");
    await fatOscPage.setDetune(0, 55);

    // Act - save as new preset
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("prompt");
      await dialog.accept("Fat Oscillator Test");
    });

    await presetPage.openPresetMenu();
    await presetPage.saveAsButton.click();

    // Wait for menu to close
    await expect(presetPage.newButton).not.toBeVisible();

    // Assert - verify saved state
    await fatOscPage.expectVoices(0, 7);
    await fatOscPage.expectWaveform(0, "square");
    await fatOscPage.expectDetune(0, 55);
  });

  test("should reload fat oscillator settings from saved preset", async ({ page }) => {
    // Arrange - create and save a preset with fat oscillator settings
    await presetPage.loadFactoryPreset("factory-init");
    await fatOscPage.setWaveform(0, "sawtooth");
    await fatOscPage.setVoices(0, 8);
    await fatOscPage.setDetune(0, 65);

    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("prompt");
      await dialog.accept("Fat Osc Reload Test");
    });

    await presetPage.openPresetMenu();
    await presetPage.saveAsButton.click();
    await expect(presetPage.newButton).not.toBeVisible();

    // Act - change values to different settings
    await fatOscPage.setVoices(0, 3);
    await fatOscPage.setDetune(0, 25);

    // Verify they changed
    await fatOscPage.expectVoices(0, 3);
    await fatOscPage.expectDetune(0, 25);

    // Reload the preset
    page.once("dialog", async (dialog) => {
      // This is the "unsaved changes" confirmation dialog
      expect(dialog.type()).toBe("confirm");
      await dialog.accept();
    });

    await presetPage.openPresetMenu();
    const presetItem = page.getByTestId(/^preset-user-/).filter({ hasText: "Fat Osc Reload Test" });
    await presetItem.click();

    // Assert - original values should be restored
    await fatOscPage.expectVoices(0, 8);
    await fatOscPage.expectDetune(0, 65);
  });

  test("should default to basic mode when loading old preset without fat settings", async () => {
    // Arrange - load a factory preset (doesn't have fat oscillator data)
    await presetPage.loadFactoryPreset("factory-init");

    // Act & Assert - oscillator should be in basic mode with voices = 1
    await fatOscPage.expectVoices(0, 1);
    await fatOscPage.expectDetuneDisabled(0);
  });

  test("should support mix of basic and fat oscillators in same preset", async ({ page }) => {
    // Arrange - load factory preset
    await presetPage.loadFactoryPreset("factory-init");

    // Set up: oscillator 0 as fat, oscillator 1 as basic
    await fatOscPage.setWaveform(0, "sine");
    await fatOscPage.setVoices(0, 6);
    await fatOscPage.setDetune(0, 25);

    // Oscillator 1 stays basic (voices = 1)
    await fatOscPage.expectVoices(1, 1);
    await fatOscPage.expectDetuneDisabled(1);

    // Act - save preset
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("prompt");
      await dialog.accept("Mixed Osc Types");
    });

    await presetPage.openPresetMenu();
    await presetPage.saveAsButton.click();
    await expect(presetPage.newButton).not.toBeVisible();

    // Assert - verify mixed states are preserved
    await fatOscPage.expectVoices(0, 6);
    await fatOscPage.expectDetune(0, 25);

    await fatOscPage.expectVoices(1, 1);
    await fatOscPage.expectDetuneDisabled(1);
  });

  test("should handle multiple oscillators with different fat settings", async ({ page }) => {
    // Arrange - load factory preset
    await presetPage.loadFactoryPreset("factory-init");

    // Configure multiple oscillators with different settings
    // Oscillator 0: fat with sine defaults
    await fatOscPage.setWaveform(0, "sine");
    await fatOscPage.setVoices(0, 4);
    await fatOscPage.setDetune(0, 16);

    // Oscillator 1: fat with sawtooth
    await fatOscPage.setWaveform(1, "sawtooth");
    await fatOscPage.setVoices(1, 7);
    await fatOscPage.setDetune(1, 40);

    // Act - save preset
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("prompt");
      await dialog.accept("Multi Fat Osc");
    });

    await presetPage.openPresetMenu();
    await presetPage.saveAsButton.click();
    await expect(presetPage.newButton).not.toBeVisible();

    // Assert - verify all settings preserved
    await fatOscPage.expectWaveform(0, "sine");
    await fatOscPage.expectVoices(0, 4);
    await fatOscPage.expectDetune(0, 16);

    await fatOscPage.expectWaveform(1, "sawtooth");
    await fatOscPage.expectVoices(1, 7);
    await fatOscPage.expectDetune(1, 40);
  });
});

test.describe("FatOscillator - Modified Indicator", () => {
  let fatOscPage: FatOscillatorPage;
  let presetPage: PresetPage;

  test.beforeEach(async ({ page }) => {
    fatOscPage = new FatOscillatorPage(page);
    presetPage = new PresetPage(page);
  });

  test("should show modified indicator when changing voices (switching to fat)", async () => {
    // Arrange - load a preset
    await presetPage.loadFactoryPreset("factory-init");
    await presetPage.expectNoModifiedIndicator();

    // Act - change voices to switch to fat mode
    await fatOscPage.setVoices(0, 3);

    // Assert - modified indicator should appear
    await presetPage.expectModifiedIndicator();
  });

  test("should show modified indicator when changing voices (staying in fat)", async () => {
    // Arrange - load a preset
    await presetPage.loadFactoryPreset("factory-init");
    await fatOscPage.setVoices(0, 3); // Initial switch to fat
    await presetPage.expectModifiedIndicator();

    // Act - change voices further (should keep modified indicator)
    await fatOscPage.setVoices(0, 7);

    // Assert - modified indicator should still be showing
    await presetPage.expectModifiedIndicator();
  });

  test("should show modified indicator when changing detune", async () => {
    // Arrange - load a preset and switch to fat
    await presetPage.loadFactoryPreset("factory-init");
    await fatOscPage.setVoices(0, 3);

    // Clear the modified state by loading another preset
    await presetPage.loadFactoryPreset("factory-melody-memory");
    await fatOscPage.setVoices(0, 3);
    await presetPage.expectModifiedIndicator();

    // Wait for the page to stabilize
    await fatOscPage.expectVoicesVisible(0);

    // Act - change detune
    await fatOscPage.setDetune(0, 50);

    // Assert - modified indicator should still be present
    await presetPage.expectModifiedIndicator();
  });
});

test.describe("FatOscillator - Edge Cases", () => {
  let fatOscPage: FatOscillatorPage;

  test.beforeEach(async ({ page }) => {
    fatOscPage = new FatOscillatorPage(page);
  });

  test("should handle rapid voice switching between basic and fat", async () => {
    // Act - rapidly toggle between basic (voices=1) and fat (voices>1)
    for (let i = 0; i < 5; i++) {
      await fatOscPage.setVoices(0, 3); // Switch to fat
      await fatOscPage.expectVoices(0, 3);
      await fatOscPage.expectDetuneEnabled(0);

      await fatOscPage.setVoices(0, 1); // Switch to basic
      await fatOscPage.expectVoices(0, 1);
      await fatOscPage.expectDetuneDisabled(0);
    }

    // Assert - should end in basic mode
    await fatOscPage.expectVoices(0, 1);
    await fatOscPage.expectDetuneDisabled(0);
  });

  test("should maintain custom parameters when changing waveform in fat mode", async () => {
    // Arrange - switch to fat and set custom values
    await fatOscPage.setVoices(0, 8);
    await fatOscPage.setDetune(0, 70);

    // Act - change waveforms multiple times
    await fatOscPage.setWaveform(0, "square");
    await fatOscPage.setWaveform(0, "triangle");
    await fatOscPage.setWaveform(0, "sawtooth");

    // Assert - voices and detune should remain at user-set values
    // Waveform changes do NOT apply defaults in the current implementation
    await fatOscPage.expectVoices(0, 8);
    await fatOscPage.expectDetune(0, 70);
  });

  test("should maintain fat mode when changing waveform", async () => {
    // Arrange - switch to fat
    await fatOscPage.setVoices(0, 5);
    await fatOscPage.expectDetuneEnabled(0);

    // Act - change waveform
    await fatOscPage.setWaveform(0, "square");

    // Assert - should still be in fat mode with detune enabled
    // Voices should remain at 5 (not change to square default of 3)
    await fatOscPage.expectVoices(0, 5);
    await fatOscPage.expectDetuneEnabled(0);
  });

  test("should properly handle voices slider boundary values", async () => {
    // Arrange - switch to fat
    await fatOscPage.setVoices(0, 3);

    // Test low end in fat mode
    await fatOscPage.setVoices(0, 2);
    await fatOscPage.expectVoices(0, 2);

    // Test maximum
    await fatOscPage.setVoices(0, 10);
    await fatOscPage.expectVoices(0, 10);

    // Test back to low end
    await fatOscPage.setVoices(0, 2);
    await fatOscPage.expectVoices(0, 2);

    // Test basic mode (voices = 1)
    await fatOscPage.setVoices(0, 1);
    await fatOscPage.expectVoices(0, 1);
  });

  test("should properly handle detune slider boundary values in fat mode", async () => {
    // Arrange - switch to fat
    await fatOscPage.setVoices(0, 3);

    // Test minimum in fat mode (1, not 0)
    await fatOscPage.setDetune(0, 1);
    await fatOscPage.expectDetune(0, 1);

    // Test maximum
    await fatOscPage.setDetune(0, 100);
    await fatOscPage.expectDetune(0, 100);

    // Test back to minimum
    await fatOscPage.setDetune(0, 1);
    await fatOscPage.expectDetune(0, 1);
  });

  test("should disable detune slider when reverting to basic mode", async () => {
    // Arrange - start in fat mode
    await fatOscPage.setVoices(0, 5);
    await fatOscPage.setDetune(0, 50);

    // Act - revert to basic mode
    await fatOscPage.setVoices(0, 1);

    // Assert - detune should be disabled and value should be 0
    await fatOscPage.expectDetuneDisabled(0);
    await fatOscPage.expectDetune(0, 0);
  });
});
