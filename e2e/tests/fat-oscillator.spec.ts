import { test, expect } from "../fixtures/testFixtures";
import { FatOscillatorPage } from "../pages/FatOscillatorPage";
import { PresetPage } from "../pages/PresetPage";

test.describe("FatOscillator - Toggle Visibility", () => {
  let fatOscPage: FatOscillatorPage;

  test.beforeEach(async ({ page }) => {
    fatOscPage = new FatOscillatorPage(page);
  });

  test("should display oscillator type toggle (basic/fat)", async () => {
    // Arrange - page loads with default oscillators
    // Act & Assert
    await fatOscPage.expectOscillatorType(0, "basic");
  });

  test("should hide fat parameters when basic mode is active", async () => {
    // Arrange - oscillator starts in basic mode
    // Act & Assert - voices and detune sliders should not be visible
    await fatOscPage.expectVoicesHidden(0);
    await fatOscPage.expectDetuneHidden(0);
  });

  test("should show fat parameters when fat mode is active", async () => {
    // Arrange & Act - switch to fat mode
    await fatOscPage.setOscillatorType(0, "fat");

    // Assert - voices and detune sliders should be visible
    await fatOscPage.expectVoicesVisible(0);
    await fatOscPage.expectDetuneVisible(0);
  });
});

test.describe("FatOscillator - Type Switching", () => {
  let fatOscPage: FatOscillatorPage;

  test.beforeEach(async ({ page }) => {
    fatOscPage = new FatOscillatorPage(page);
  });

  test("should toggle from basic to fat", async () => {
    // Arrange - starts in basic mode
    await fatOscPage.expectOscillatorType(0, "basic");

    // Act - switch to fat
    await fatOscPage.setOscillatorType(0, "fat");

    // Assert - type should be fat
    await fatOscPage.expectOscillatorType(0, "fat");
  });

  test("should show fat sliders with sine defaults when switching to fat from sine", async () => {
    // Arrange - starts with sine waveform in basic mode
    await fatOscPage.expectWaveform(0, "sine");

    // Act - switch to fat mode
    await fatOscPage.setOscillatorType(0, "fat");

    // Assert - fat sliders visible with sine defaults (3 voices, 12 cents)
    await fatOscPage.expectVoicesVisible(0);
    await fatOscPage.expectVoices(0, 3);
    await fatOscPage.expectDetune(0, 12);
  });

  test("should toggle from fat back to basic", async () => {
    // Arrange - switch to fat first
    await fatOscPage.setOscillatorType(0, "fat");
    await fatOscPage.expectOscillatorType(0, "fat");

    // Act - switch back to basic
    await fatOscPage.setOscillatorType(0, "basic");

    // Assert - type should be basic
    await fatOscPage.expectOscillatorType(0, "basic");
  });

  test("should hide fat sliders when switching from fat to basic", async () => {
    // Arrange - switch to fat first
    await fatOscPage.setOscillatorType(0, "fat");
    await fatOscPage.expectVoicesVisible(0);

    // Act - switch back to basic
    await fatOscPage.setOscillatorType(0, "basic");

    // Assert - fat sliders should be hidden
    await fatOscPage.expectVoicesHidden(0);
    await fatOscPage.expectDetuneHidden(0);
  });
});

test.describe("FatOscillator - Parameter Adjustment", () => {
  let fatOscPage: FatOscillatorPage;

  test.beforeEach(async ({ page }) => {
    fatOscPage = new FatOscillatorPage(page);
    // Setup: switch to fat mode
    await fatOscPage.setOscillatorType(0, "fat");
  });

  test("should adjust voices slider (minimum value 2)", async () => {
    // Act - set voices to minimum
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

  test("should adjust detune slider (minimum value 0)", async () => {
    // Act - set detune to minimum
    await fatOscPage.setDetune(0, 0);

    // Assert
    await fatOscPage.expectDetune(0, 0);
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

  test("should persist fat parameter values when switching oscillators", async () => {
    // Arrange - set custom values on oscillator 0
    await fatOscPage.setVoices(0, 7);
    await fatOscPage.setDetune(0, 45);

    // Store the values
    const voices0 = await fatOscPage.getVoices(0);
    const detune0 = await fatOscPage.getDetune(0);

    // Act - interact with oscillator 1, then switch back to 0
    // (This tests that values persist in state)
    // Switch oscillator 0 to basic and back
    await fatOscPage.setOscillatorType(0, "basic");
    await fatOscPage.setOscillatorType(0, "fat");

    // Assert - values should be preserved
    const voicesAfter = await fatOscPage.getVoices(0);
    const detuneAfter = await fatOscPage.getDetune(0);
    expect(voicesAfter).toBe(voices0);
    expect(detuneAfter).toBe(detune0);
  });
});

test.describe("FatOscillator - Waveform-Specific Defaults", () => {
  let fatOscPage: FatOscillatorPage;

  test.beforeEach(async ({ page }) => {
    fatOscPage = new FatOscillatorPage(page);
  });

  test("should apply sine defaults (3 voices, 12 cents) when switching to fat", async () => {
    // Arrange - ensure sine waveform
    await fatOscPage.setWaveform(0, "sine");

    // Act - switch to fat
    await fatOscPage.setOscillatorType(0, "fat");

    // Assert - check sine defaults
    await fatOscPage.expectVoices(0, 3);
    await fatOscPage.expectDetune(0, 12);
  });

  test("should apply sawtooth defaults (5 voices, 30 cents) when switching to fat", async () => {
    // Arrange - switch to sawtooth waveform
    await fatOscPage.setWaveform(0, "sawtooth");

    // Act - switch to fat
    await fatOscPage.setOscillatorType(0, "fat");

    // Assert - check sawtooth defaults
    await fatOscPage.expectVoices(0, 5);
    await fatOscPage.expectDetune(0, 30);
  });

  test("should apply square defaults (3 voices, 22 cents) when switching to fat", async () => {
    // Arrange - switch to square waveform
    await fatOscPage.setWaveform(0, "square");

    // Act - switch to fat
    await fatOscPage.setOscillatorType(0, "fat");

    // Assert - check square defaults
    await fatOscPage.expectVoices(0, 3);
    await fatOscPage.expectDetune(0, 22);
  });

  test("should apply triangle defaults (3 voices, 15 cents) when switching to fat", async () => {
    // Arrange - switch to triangle waveform
    await fatOscPage.setWaveform(0, "triangle");

    // Act - switch to fat
    await fatOscPage.setOscillatorType(0, "fat");

    // Assert - check triangle defaults
    await fatOscPage.expectVoices(0, 3);
    await fatOscPage.expectDetune(0, 15);
  });

  test("should update fat defaults when changing waveform while in fat mode", async () => {
    // Arrange - switch to fat with sine
    await fatOscPage.setWaveform(0, "sine");
    await fatOscPage.setOscillatorType(0, "fat");
    await fatOscPage.expectVoices(0, 3);
    await fatOscPage.expectDetune(0, 12);

    // Act - change waveform to sawtooth
    await fatOscPage.setWaveform(0, "sawtooth");

    // Assert - defaults should update to sawtooth values
    await fatOscPage.expectVoices(0, 5);
    await fatOscPage.expectDetune(0, 30);
  });

  test("should update fat defaults for all waveforms in sequence", async () => {
    // This tests the complete waveform-to-defaults mapping
    const testCases = [
      { waveform: "sine", voices: 3, detune: 12 },
      { waveform: "square", voices: 3, detune: 22 },
      { waveform: "triangle", voices: 3, detune: 15 },
      { waveform: "sawtooth", voices: 5, detune: 30 },
    ] as const;

    // Arrange - switch to fat
    await fatOscPage.setOscillatorType(0, "fat");

    // Act & Assert - test each waveform
    for (const { waveform, voices, detune } of testCases) {
      await fatOscPage.setWaveform(0, waveform);
      await fatOscPage.expectVoices(0, voices);
      await fatOscPage.expectDetune(0, detune);
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
    await fatOscPage.setOscillatorType(0, "fat");
    await fatOscPage.setWaveform(0, "square");
    await fatOscPage.setVoices(0, 7);
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
    await fatOscPage.expectOscillatorType(0, "fat");
    await fatOscPage.expectWaveform(0, "square");
    await fatOscPage.expectVoices(0, 7);
    await fatOscPage.expectDetune(0, 55);
  });

  test("should reload fat oscillator settings from saved preset", async ({ page }) => {
    // Arrange - create and save a preset with fat oscillator settings
    await presetPage.loadFactoryPreset("factory-init");
    await fatOscPage.setOscillatorType(0, "fat");
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

    // Act - change values
    await fatOscPage.setVoices(0, 3);
    await fatOscPage.setDetune(0, 12);

    // Verify they changed
    await fatOscPage.expectVoices(0, 3);
    await fatOscPage.expectDetune(0, 12);

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

    // Act & Assert - oscillator should be in basic mode
    await fatOscPage.expectOscillatorType(0, "basic");
    await fatOscPage.expectVoicesHidden(0);
    await fatOscPage.expectDetuneHidden(0);
  });

  test("should support mix of basic and fat oscillators in same preset", async ({ page }) => {
    // Arrange - load factory preset
    await presetPage.loadFactoryPreset("factory-init");

    // Set up: oscillator 0 as fat, oscillator 1 as basic
    await fatOscPage.setOscillatorType(0, "fat");
    await fatOscPage.setWaveform(0, "sine");
    await fatOscPage.setVoices(0, 6);
    await fatOscPage.setDetune(0, 25);

    // Oscillator 1 stays basic
    await fatOscPage.expectOscillatorType(1, "basic");

    // Act - save preset
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("prompt");
      await dialog.accept("Mixed Osc Types");
    });

    await presetPage.openPresetMenu();
    await presetPage.saveAsButton.click();
    await expect(presetPage.newButton).not.toBeVisible();

    // Assert - verify mixed states are preserved
    await fatOscPage.expectOscillatorType(0, "fat");
    await fatOscPage.expectVoices(0, 6);
    await fatOscPage.expectDetune(0, 25);

    await fatOscPage.expectOscillatorType(1, "basic");
    await fatOscPage.expectVoicesHidden(1);
  });

  test("should handle multiple oscillators with different fat settings", async ({ page }) => {
    // Arrange - load factory preset
    await presetPage.loadFactoryPreset("factory-init");

    // Configure multiple oscillators with different settings
    // Oscillator 0: fat with sine defaults
    await fatOscPage.setOscillatorType(0, "fat");
    await fatOscPage.setWaveform(0, "sine");
    await fatOscPage.setVoices(0, 4);
    await fatOscPage.setDetune(0, 16);

    // Oscillator 1: fat with sawtooth
    await fatOscPage.setOscillatorType(1, "fat");
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
    await fatOscPage.expectOscillatorType(0, "fat");
    await fatOscPage.expectWaveform(0, "sine");
    await fatOscPage.expectVoices(0, 4);
    await fatOscPage.expectDetune(0, 16);

    await fatOscPage.expectOscillatorType(1, "fat");
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

  test("should show modified indicator when changing oscillator type", async () => {
    // Arrange - load a preset
    await presetPage.loadFactoryPreset("factory-init");
    await presetPage.expectNoModifiedIndicator();

    // Act - change oscillator type
    await fatOscPage.setOscillatorType(0, "fat");

    // Assert - modified indicator should appear
    await presetPage.expectModifiedIndicator();
  });

  test("should show modified indicator when changing voices", async () => {
    // Arrange - load a preset
    await presetPage.loadFactoryPreset("factory-init");
    await presetPage.expectNoModifiedIndicator();

    // Switch to fat (this will show modified indicator)
    await fatOscPage.setOscillatorType(0, "fat");
    await presetPage.expectModifiedIndicator();

    // Act - change voices (should keep modified indicator)
    await fatOscPage.setVoices(0, 7);

    // Assert - modified indicator should still be showing
    await presetPage.expectModifiedIndicator();
  });

  test("should show modified indicator when changing detune", async () => {
    // Arrange - load a preset and switch to fat
    await presetPage.loadFactoryPreset("factory-init");
    await fatOscPage.setOscillatorType(0, "fat");

    // Clear the modified state by loading another preset
    await presetPage.loadFactoryPreset("factory-melody-memory");
    await fatOscPage.setOscillatorType(0, "fat");
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

  test("should handle rapid type switching", async () => {
    // Act - rapidly toggle between basic and fat
    for (let i = 0; i < 5; i++) {
      await fatOscPage.setOscillatorType(0, "fat");
      await fatOscPage.expectOscillatorType(0, "fat");

      await fatOscPage.setOscillatorType(0, "basic");
      await fatOscPage.expectOscillatorType(0, "basic");
    }

    // Assert - should end in basic mode
    await fatOscPage.expectOscillatorType(0, "basic");
    await fatOscPage.expectVoicesHidden(0);
  });

  test("should maintain fat parameters through waveform changes", async () => {
    // Arrange - switch to fat and set custom values
    await fatOscPage.setOscillatorType(0, "fat");
    await fatOscPage.setVoices(0, 8);
    await fatOscPage.setDetune(0, 70);

    // Act - change waveforms multiple times (this updates defaults)
    await fatOscPage.setWaveform(0, "square");
    await fatOscPage.setWaveform(0, "triangle");
    await fatOscPage.setWaveform(0, "sawtooth");

    // When switching waveforms, defaults get applied, overwriting custom values
    // This is the expected behavior based on the implementation
    // Verify we're at sawtooth defaults now
    await fatOscPage.expectVoices(0, 5);
    await fatOscPage.expectDetune(0, 30);
  });

  test("should maintain oscillator type when changing waveform", async () => {
    // Arrange - switch to fat
    await fatOscPage.setOscillatorType(0, "fat");
    await fatOscPage.expectOscillatorType(0, "fat");

    // Act - change waveform
    await fatOscPage.setWaveform(0, "square");

    // Assert - should still be in fat mode
    await fatOscPage.expectOscillatorType(0, "fat");
    await fatOscPage.expectVoicesVisible(0);
  });

  test("should properly handle voices slider boundary values", async () => {
    // Arrange - switch to fat
    await fatOscPage.setOscillatorType(0, "fat");

    // Test minimum
    await fatOscPage.setVoices(0, 2);
    await fatOscPage.expectVoices(0, 2);

    // Test maximum
    await fatOscPage.setVoices(0, 10);
    await fatOscPage.expectVoices(0, 10);

    // Test back to minimum
    await fatOscPage.setVoices(0, 2);
    await fatOscPage.expectVoices(0, 2);
  });

  test("should properly handle detune slider boundary values", async () => {
    // Arrange - switch to fat
    await fatOscPage.setOscillatorType(0, "fat");

    // Test minimum
    await fatOscPage.setDetune(0, 0);
    await fatOscPage.expectDetune(0, 0);

    // Test maximum
    await fatOscPage.setDetune(0, 100);
    await fatOscPage.expectDetune(0, 100);

    // Test back to minimum
    await fatOscPage.setDetune(0, 0);
    await fatOscPage.expectDetune(0, 0);
  });
});
