import { test, expect } from "../fixtures/testFixtures";
import { ModulationMatrixPage } from "../pages/ModulationMatrixPage";
import { PresetPage } from "../pages/PresetPage";

test.describe("Modulation Matrix - Basic UI", () => {
  let modulationPage: ModulationMatrixPage;

  test.beforeEach(async ({ page }) => {
    modulationPage = new ModulationMatrixPage(page);
  });

  test("should expand and collapse modulation matrix", async () => {
    // Initially collapsed
    await modulationPage.expectModulationMatrixCollapsed();

    // Expand
    await modulationPage.expandModulationMatrix();
    await modulationPage.expectModulationMatrixExpanded();

    // Collapse
    await modulationPage.collapseModulationMatrix();
    await modulationPage.expectModulationMatrixCollapsed();
  });

  test("should display all 4 LFO controls when expanded", async () => {
    await modulationPage.expandModulationMatrix();

    // Verify all 4 LFOs have controls
    for (let i = 0; i < 4; i++) {
      await expect(modulationPage.getLfoRateSlider(i)).toBeVisible();
      await expect(modulationPage.getLfoAmplitudeSlider(i)).toBeVisible();
      await expect(modulationPage.getLfoPolarityButton(i)).toBeVisible();
    }
  });

  test("should show 'No modulation routes' message initially", async () => {
    await modulationPage.expandModulationMatrix();
    await modulationPage.expectRouteCount(0);
  });
});

test.describe("Modulation Matrix - LFO Parameters", () => {
  let modulationPage: ModulationMatrixPage;

  test.beforeEach(async ({ page }) => {
    modulationPage = new ModulationMatrixPage(page);
    await modulationPage.expandModulationMatrix();
  });

  test("should start with default LFO parameters", async () => {
    // LFO 1: 0.5 Hz, sine, amplitude 1, bipolar
    await modulationPage.expectLfoRate(0, 0.5);
    await modulationPage.expectLfoAmplitude(0, 1);
    await modulationPage.expectLfoPolarityMode(0, "bipolar");

    // LFO 2: 1 Hz, triangle, amplitude 1, bipolar
    await modulationPage.expectLfoRate(1, 1);
    await modulationPage.expectLfoAmplitude(1, 1);
    await modulationPage.expectLfoPolarityMode(1, "bipolar");

    // LFO 3: 2 Hz, square, amplitude 1, bipolar
    await modulationPage.expectLfoRate(2, 2);
    await modulationPage.expectLfoAmplitude(2, 1);
    await modulationPage.expectLfoPolarityMode(2, "bipolar");

    // LFO 4: 4 Hz, sawtooth, amplitude 1, bipolar
    await modulationPage.expectLfoRate(3, 4);
    await modulationPage.expectLfoAmplitude(3, 1);
    await modulationPage.expectLfoPolarityMode(3, "bipolar");
  });

  test("should update LFO rate", async () => {
    await modulationPage.setLfoRate(0, 5.5);
    await modulationPage.expectLfoRate(0, 5.5);
  });

  test("should update LFO amplitude", async () => {
    await modulationPage.setLfoAmplitude(0, 0.75);
    await modulationPage.expectLfoAmplitude(0, 0.75);
  });

  test("should update LFO waveform", async () => {
    // LFO 1 starts with sine, change to square
    await modulationPage.setLfoWaveform(0, "square");

    // Verify by checking the selector value
    const selector = modulationPage.getLfoWaveformSelector(0);
    const tagName = await selector.evaluate((el) => el.tagName.toLowerCase());

    if (tagName === "select") {
      await expect(selector).toHaveValue("square");
    } else {
      // Radio group - verify the square radio is checked
      const lfoContainer = modulationPage.page
        .locator(".border-2")
        .filter({ hasText: "LFO 1" })
        .first();
      const squareRadio = lfoContainer.getByRole("radio", { name: /square/i });
      await expect(squareRadio).toBeChecked();
    }
  });

  test("should toggle LFO polarity mode", async () => {
    // Start as bipolar
    await modulationPage.expectLfoPolarityMode(0, "bipolar");

    // Toggle to unipolar
    await modulationPage.toggleLfoPolarity(0);
    await modulationPage.expectLfoPolarityMode(0, "unipolar");

    // Toggle back to bipolar
    await modulationPage.toggleLfoPolarity(0);
    await modulationPage.expectLfoPolarityMode(0, "bipolar");
  });

  test("should update all LFO parameters independently", async () => {
    // Set different values for each LFO
    await modulationPage.setLfoRate(0, 0.25);
    await modulationPage.setLfoAmplitude(0, 0.8);
    await modulationPage.setLfoPolarityMode(0, "unipolar");

    await modulationPage.setLfoRate(1, 3.5);
    await modulationPage.setLfoAmplitude(1, 0.6);
    await modulationPage.setLfoPolarityMode(1, "unipolar");

    await modulationPage.setLfoRate(2, 7);
    await modulationPage.setLfoAmplitude(2, 0.4);

    await modulationPage.setLfoRate(3, 10);
    await modulationPage.setLfoAmplitude(3, 0.2);

    // Verify all values are maintained
    await modulationPage.expectLfoRate(0, 0.25);
    await modulationPage.expectLfoAmplitude(0, 0.8);
    await modulationPage.expectLfoPolarityMode(0, "unipolar");

    await modulationPage.expectLfoRate(1, 3.5);
    await modulationPage.expectLfoAmplitude(1, 0.6);
    await modulationPage.expectLfoPolarityMode(1, "unipolar");

    await modulationPage.expectLfoRate(2, 7);
    await modulationPage.expectLfoAmplitude(2, 0.4);
    await modulationPage.expectLfoPolarityMode(2, "bipolar");

    await modulationPage.expectLfoRate(3, 10);
    await modulationPage.expectLfoAmplitude(3, 0.2);
    await modulationPage.expectLfoPolarityMode(3, "bipolar");
  });

  test("should handle minimum and maximum LFO rates", async () => {
    // Minimum rate (0.01)
    await modulationPage.setLfoRate(0, 0.01);
    await modulationPage.expectLfoRate(0, 0.01);

    // Maximum rate (20)
    await modulationPage.setLfoRate(0, 20);
    await modulationPage.expectLfoRate(0, 20);
  });

  test("should handle minimum and maximum LFO amplitudes", async () => {
    // Minimum amplitude (0)
    await modulationPage.setLfoAmplitude(0, 0);
    await modulationPage.expectLfoAmplitude(0, 0);

    // Maximum amplitude (1)
    await modulationPage.setLfoAmplitude(0, 1);
    await modulationPage.expectLfoAmplitude(0, 1);
  });
});

test.describe("Modulation Matrix - Routing", () => {
  let modulationPage: ModulationMatrixPage;

  test.beforeEach(async ({ page }) => {
    modulationPage = new ModulationMatrixPage(page);
    await modulationPage.expandModulationMatrix();
  });

  test("should add a modulation route", async () => {
    await modulationPage.expectRouteCount(0);

    await modulationPage.addRoute();
    await modulationPage.expectRouteCount(1);
  });

  test("should auto-expand new route when added", async () => {
    await modulationPage.addRoute();
    await modulationPage.expectRouteExpanded(0);
  });

  test("should have default route settings", async () => {
    await modulationPage.addRoute();

    // Default: LFO 1 → None, depth 0.5
    await modulationPage.expectRouteLabel(0, /LFO 1 → None/);
    await modulationPage.expectRouteDepth(0, 0.5);
  });

  test("should configure route source", async () => {
    await modulationPage.addRoute();

    // Change from LFO 1 to LFO 3
    await modulationPage.setRouteSource(0, 2);
    await modulationPage.expectRouteLabel(0, /LFO 3 → None/);
  });

  test("should configure route destination", async () => {
    await modulationPage.addRoute();

    // Change destination to filter frequency
    await modulationPage.setRouteDestination(0, "filter-frequency");
    await modulationPage.expectRouteLabel(0, /LFO 1 → Filter Frequency/);
  });

  test("should configure route depth", async () => {
    await modulationPage.addRoute();

    await modulationPage.setRouteDepth(0, 0.75);
    await modulationPage.expectRouteDepth(0, 0.75);
  });

  test("should create complete modulation route", async () => {
    await modulationPage.addRoute();

    // Configure: LFO 2 → Osc 1 Volume, depth 0.8
    await modulationPage.setRouteSource(0, 1);
    await modulationPage.setRouteDestination(0, "osc1-volume");
    await modulationPage.setRouteDepth(0, 0.8);

    await modulationPage.expectRouteLabel(0, /LFO 2 → Osc 1 Volume/);
    await modulationPage.expectRouteDepth(0, 0.8);
  });

  test("should remove a route", async () => {
    await modulationPage.addRoute();
    await modulationPage.expectRouteCount(1);

    await modulationPage.removeRoute(0);
    await modulationPage.expectRouteCount(0);
  });

  test.skip("should expand and collapse route details", async () => {
    await modulationPage.addRoute();

    // Auto-expanded initially
    await modulationPage.expectRouteExpanded(0);

    // Collapse
    await modulationPage.collapseRoute(0);
    await modulationPage.expectRouteCollapsed(0);

    // Expand again
    await modulationPage.expandRoute(0);
    await modulationPage.expectRouteExpanded(0);
  });

  test("should create multiple routes", async () => {
    // Add 3 routes
    await modulationPage.addRoute();
    await modulationPage.addRoute();
    await modulationPage.addRoute();

    await modulationPage.expectRouteCount(3);

    // Configure each route differently
    await modulationPage.setRouteDestination(0, "osc1-volume");
    await modulationPage.setRouteDestination(1, "filter-frequency");
    await modulationPage.setRouteDestination(2, "delay-time");

    await modulationPage.expectRouteLabel(0, /LFO 1 → Osc 1 Volume/);
    await modulationPage.expectRouteLabel(1, /LFO 1 → Filter Frequency/);
    await modulationPage.expectRouteLabel(2, /LFO 1 → Delay Time/);
  });

  test("should limit routes to maximum of 8", async () => {
    // Add 8 routes
    for (let i = 0; i < 8; i++) {
      await modulationPage.addRoute();
    }

    await modulationPage.expectRouteCount(8);

    // Add route button should be disabled
    await expect(modulationPage.addRouteButton).toBeDisabled();
  });

  test("should remove specific route from multiple routes", async () => {
    // Add 3 routes with different destinations
    await modulationPage.addRoute();
    await modulationPage.setRouteDestination(0, "osc1-volume");

    await modulationPage.addRoute();
    await modulationPage.setRouteDestination(1, "filter-frequency");

    await modulationPage.addRoute();
    await modulationPage.setRouteDestination(2, "delay-time");

    // Remove middle route
    await modulationPage.removeRoute(1);
    await modulationPage.expectRouteCount(2);

    // Verify remaining routes
    await modulationPage.expectRouteLabel(0, /LFO 1 → Osc 1 Volume/);
    await modulationPage.expectRouteLabel(1, /LFO 1 → Delay Time/);
  });
});

test.describe("Modulation Matrix - Range Controls", () => {
  let modulationPage: ModulationMatrixPage;

  test.beforeEach(async ({ page }) => {
    modulationPage = new ModulationMatrixPage(page);
    await modulationPage.expandModulationMatrix();
    await modulationPage.addRoute();
  });

  test("should start in center mode by default", async () => {
    await modulationPage.expectRangeMode(0, "center");
  });

  test("should set center and amount in center mode", async () => {
    await modulationPage.setCenterAmount(0, 500, 200);
    await modulationPage.expectCenterAmount(0, 500, 200);
  });

  test("should switch to min/max mode", async () => {
    await modulationPage.setRangeMode(0, "minmax");
    await modulationPage.expectRangeMode(0, "minmax");
  });

  test("should set min and max in minmax mode", async () => {
    await modulationPage.setMinMax(0, 100, 1000);
    await modulationPage.expectMinMax(0, 100, 1000);
  });

  test("should switch between range modes", async () => {
    // Start in center mode
    await modulationPage.setCenterAmount(0, 500, 200);

    // Switch to minmax mode
    await modulationPage.setRangeMode(0, "minmax");
    await modulationPage.setMinMax(0, 100, 1000);
    await modulationPage.expectMinMax(0, 100, 1000);

    // Switch back to center mode
    await modulationPage.setRangeMode(0, "center");
    await modulationPage.expectRangeMode(0, "center");
  });

  test("should allow clearing range inputs", async () => {
    // Set values first
    await modulationPage.setCenterAmount(0, 500, 200);

    // Clear center input
    const centerInput = modulationPage.getCenterInput(0);
    await centerInput.clear();
    await expect(centerInput).toHaveValue("");

    // Clear amount input
    const amountInput = modulationPage.getRangeAmountInput(0);
    await amountInput.clear();
    await expect(amountInput).toHaveValue("");
  });
});

test.describe("Modulation Matrix - Anchor To Current", () => {
  let modulationPage: ModulationMatrixPage;

  test.beforeEach(async ({ page }) => {
    modulationPage = new ModulationMatrixPage(page);
    await modulationPage.expandModulationMatrix();
  });

  test("should anchor filter frequency to current value", async ({ page }) => {
    // Set filter frequency to a known value
    const filterFreqSlider = page.getByLabel(/^Frequency$/i).first();

    // Expand effects section if needed
    const isVisible = await filterFreqSlider.isVisible().catch(() => false);
    if (!isVisible) {
      const effectsHeading = page.getByText("Effects", { exact: true });
      await effectsHeading.click();
      await filterFreqSlider.waitFor({ state: "visible" });
    }

    await filterFreqSlider.fill("800");

    // Create route to filter frequency
    await modulationPage.addRoute();
    await modulationPage.setRouteDestination(0, "filter-frequency");

    // Anchor to current
    await modulationPage.anchorToCurrent(0);

    // Verify center is set to current filter frequency (800)
    const centerInput = modulationPage.getCenterInput(0);
    const centerValue = await centerInput.inputValue();
    expect(parseFloat(centerValue)).toBeCloseTo(800, 0);
  });

  test.skip("should anchor filter Q to current value", async ({ page }) => {
    // Set filter Q to a known value
    const filterQSliders = page.getByLabel(/^Q$/i);
    const filterQSlider = filterQSliders.first();

    // Expand effects section if needed
    const isVisible = await filterQSlider.isVisible().catch(() => false);
    if (!isVisible) {
      const effectsHeading = page.getByText("Effects", { exact: true });
      await effectsHeading.click();
      await filterQSlider.waitFor({ state: "visible" });
    }

    await filterQSlider.fill("5");
    // Wait for the value to be committed to the component state
    await page.waitForTimeout(100);

    // Create route to filter Q
    await modulationPage.addRoute();
    await modulationPage.setRouteDestination(0, "filter-q");

    // Anchor to current
    await modulationPage.anchorToCurrent(0);

    // Verify center is set to current filter Q (should be close to 5, but may not be exact due to rounding)
    const centerInput = modulationPage.getCenterInput(0);
    const centerValue = await centerInput.inputValue();
    const actualValue = parseFloat(centerValue);
    // Filter Q has default of 1, so if anchor worked it should be > 2
    expect(actualValue).toBeGreaterThan(2);
    expect(actualValue).toBeLessThan(10);
  });

  test("should anchor with different range modes", async ({ page }) => {
    // Set filter frequency
    const filterFreqSlider = page.getByLabel(/^Frequency$/i).first();
    const isVisible = await filterFreqSlider.isVisible().catch(() => false);
    if (!isVisible) {
      const effectsHeading = page.getByText("Effects", { exact: true });
      await effectsHeading.click();
    }
    await filterFreqSlider.fill("1000");

    // Create route
    await modulationPage.addRoute();
    await modulationPage.setRouteDestination(0, "filter-frequency");

    // Anchor in center mode
    await modulationPage.anchorToCurrent(0);
    const centerInput = modulationPage.getCenterInput(0);
    const centerValue = await centerInput.inputValue();
    expect(parseFloat(centerValue)).toBeCloseTo(1000, 0);

    // Switch to minmax mode
    await modulationPage.setRangeMode(0, "minmax");

    // Anchor in minmax mode
    await modulationPage.anchorToCurrent(0);
    const minInput = modulationPage.getMinInput(0);
    const maxInput = modulationPage.getMaxInput(0);

    const minValue = parseFloat(await minInput.inputValue());
    const maxValue = parseFloat(await maxInput.inputValue());

    // Min should be slightly less than 1000, max should be slightly more
    expect(minValue).toBeLessThan(1000);
    expect(maxValue).toBeGreaterThan(1000);
  });
});

test.describe("Modulation Matrix - Preset Integration", () => {
  let modulationPage: ModulationMatrixPage;
  let presetPage: PresetPage;

  test.beforeEach(async ({ page }) => {
    modulationPage = new ModulationMatrixPage(page);
    presetPage = new PresetPage(page);
  });

  test.skip("should save modulation state in preset", async () => {
    // Configure modulation
    await modulationPage.expandModulationMatrix();

    // Set LFO parameters
    await modulationPage.setLfoRate(0, 3.5);
    await modulationPage.setLfoAmplitude(0, 0.75);
    await modulationPage.setLfoPolarityMode(0, "unipolar");

    // Add route
    await modulationPage.addRoute();
    await modulationPage.setRouteSource(0, 0);
    await modulationPage.setRouteDestination(0, "osc1-volume");
    await modulationPage.setRouteDepth(0, 0.6);
    await modulationPage.setCenterAmount(0, 0.5, 0.3);

    // Save preset
    await presetPage.saveAsPreset("Mod Matrix Test");
    await presetPage.expectPresetButtonText("Mod Matrix Test");

    // Create new preset (resets state)
    await presetPage.createNewPreset();

    // Verify reset to defaults
    await modulationPage.expandModulationMatrix();
    await modulationPage.expectLfoRate(0, 0.5);
    await modulationPage.expectRouteCount(0);

    // Load saved preset
    await presetPage.loadUserPreset("Mod Matrix Test");

    // Verify modulation state restored
    await modulationPage.expandModulationMatrix();
    await modulationPage.expectLfoRate(0, 3.5);
    await modulationPage.expectLfoAmplitude(0, 0.75);
    await modulationPage.expectLfoPolarityMode(0, "unipolar");

    await modulationPage.expectRouteCount(1);
    await modulationPage.expectRouteLabel(0, /LFO 1 → Osc 1 Volume/);
    await modulationPage.expectRouteDepth(0, 0.6);
    await modulationPage.expectCenterAmount(0, 0.5, 0.3);

    // Cleanup
    await presetPage.deleteUserPreset("Mod Matrix Test");
  });

  test.skip("should save multiple routes in preset", async () => {
    await modulationPage.expandModulationMatrix();

    // Create multiple routes
    await modulationPage.addRoute();
    await modulationPage.setRouteDestination(0, "osc1-volume");
    await modulationPage.setRouteDepth(0, 0.5);

    await modulationPage.addRoute();
    await modulationPage.setRouteSource(1, 1);
    await modulationPage.setRouteDestination(1, "filter-frequency");
    await modulationPage.setRouteDepth(1, 0.7);

    await modulationPage.addRoute();
    await modulationPage.setRouteSource(2, 2);
    await modulationPage.setRouteDestination(2, "delay-time");
    await modulationPage.setRouteDepth(2, 0.3);

    // Save preset
    await presetPage.saveAsPreset("Multi Route Test");

    // Create new preset
    await presetPage.createNewPreset();
    await modulationPage.expandModulationMatrix();
    await modulationPage.expectRouteCount(0);

    // Load saved preset
    await presetPage.loadUserPreset("Multi Route Test");

    // Verify all routes restored
    await modulationPage.expandModulationMatrix();
    await modulationPage.expectRouteCount(3);

    await modulationPage.expectRouteLabel(0, /LFO 1 → Osc 1 Volume/);
    await modulationPage.expectRouteDepth(0, 0.5);

    await modulationPage.expectRouteLabel(1, /LFO 2 → Filter Frequency/);
    await modulationPage.expectRouteDepth(1, 0.7);

    await modulationPage.expectRouteLabel(2, /LFO 3 → Delay Time/);
    await modulationPage.expectRouteDepth(2, 0.3);

    // Cleanup
    await presetPage.deleteUserPreset("Multi Route Test");
  });

  test("should mark preset as modified when modulation changes", async () => {
    // Load a preset first
    await presetPage.loadFactoryPreset("factory-init");
    await presetPage.expectNoModifiedIndicator();

    // Change modulation
    await modulationPage.expandModulationMatrix();
    await modulationPage.setLfoRate(0, 5);

    // Preset should be marked as modified
    await presetPage.expectModifiedIndicator();
  });

  test("should mark preset as modified when route is added", async () => {
    await presetPage.loadFactoryPreset("factory-init");
    await presetPage.expectNoModifiedIndicator();

    await modulationPage.expandModulationMatrix();
    await modulationPage.addRoute();

    await presetPage.expectModifiedIndicator();
  });

  test("should handle old presets without modulation data", async () => {
    // Load a factory preset (which may not have modulation data)
    await presetPage.loadFactoryPreset("factory-init");

    // Should show default modulation state
    await modulationPage.expandModulationMatrix();
    await modulationPage.expectLfoRate(0, 0.5);
    await modulationPage.expectRouteCount(0);
  });
});

test.describe("Modulation Matrix - Edge Cases", () => {
  let modulationPage: ModulationMatrixPage;

  test.beforeEach(async ({ page }) => {
    modulationPage = new ModulationMatrixPage(page);
    await modulationPage.expandModulationMatrix();
  });

  test("should handle multiple routes to same destination", async () => {
    // Create two routes both targeting osc1-volume
    await modulationPage.addRoute();
    await modulationPage.setRouteSource(0, 0);
    await modulationPage.setRouteDestination(0, "osc1-volume");

    await modulationPage.addRoute();
    await modulationPage.setRouteSource(1, 1);
    await modulationPage.setRouteDestination(1, "osc1-volume");

    await modulationPage.expectRouteCount(2);
    await modulationPage.expectRouteLabel(0, /LFO 1 → Osc 1 Volume/);
    await modulationPage.expectRouteLabel(1, /LFO 2 → Osc 1 Volume/);
  });

  test("should handle removing route while expanded", async () => {
    await modulationPage.addRoute();
    await modulationPage.expectRouteExpanded(0);

    await modulationPage.removeRoute(0);
    await modulationPage.expectRouteCount(0);
  });

  test.skip("should handle removing route while collapsed", async () => {
    await modulationPage.addRoute();
    await modulationPage.collapseRoute(0);

    await modulationPage.removeRoute(0);
    await modulationPage.expectRouteCount(0);
  });

  test("should handle rapid LFO parameter changes", async () => {
    // Rapidly change rate multiple times
    await modulationPage.setLfoRate(0, 1);
    await modulationPage.setLfoRate(0, 5);
    await modulationPage.setLfoRate(0, 10);
    await modulationPage.setLfoRate(0, 7.5);

    // Final value should be set correctly
    await modulationPage.expectLfoRate(0, 7.5);
  });

  test("should handle rapid route depth changes", async () => {
    await modulationPage.addRoute();

    // Rapidly change depth
    await modulationPage.setRouteDepth(0, 0.2);
    await modulationPage.setRouteDepth(0, 0.5);
    await modulationPage.setRouteDepth(0, 0.8);
    await modulationPage.setRouteDepth(0, 0.6);

    await modulationPage.expectRouteDepth(0, 0.6);
  });

  test("should maintain state when collapsing and expanding matrix", async () => {
    // Set some state
    await modulationPage.setLfoRate(0, 8);
    await modulationPage.addRoute();
    await modulationPage.setRouteDestination(0, "filter-frequency");

    // Collapse
    await modulationPage.collapseModulationMatrix();

    // Expand
    await modulationPage.expandModulationMatrix();

    // Verify state maintained
    await modulationPage.expectLfoRate(0, 8);
    await modulationPage.expectRouteCount(1);
    await modulationPage.expectRouteLabel(0, /Filter Frequency/);
  });

  test("should handle all LFO polarity modes", async () => {
    // Set all LFOs to unipolar
    for (let i = 0; i < 4; i++) {
      await modulationPage.setLfoPolarityMode(i, "unipolar");
      await modulationPage.expectLfoPolarityMode(i, "unipolar");
    }

    // Set all back to bipolar
    for (let i = 0; i < 4; i++) {
      await modulationPage.setLfoPolarityMode(i, "bipolar");
      await modulationPage.expectLfoPolarityMode(i, "bipolar");
    }
  });

  test("should handle extreme LFO rate values", async () => {
    // Very slow LFO
    await modulationPage.setLfoRate(0, 0.01);
    await modulationPage.expectLfoRate(0, 0.01);

    // Very fast LFO
    await modulationPage.setLfoRate(0, 20);
    await modulationPage.expectLfoRate(0, 20);

    // Mid-range
    await modulationPage.setLfoRate(0, 10.5);
    await modulationPage.expectLfoRate(0, 10.5);
  });

  test("should handle zero amplitude LFO", async () => {
    await modulationPage.setLfoAmplitude(0, 0);
    await modulationPage.expectLfoAmplitude(0, 0);

    // Add route with zero amplitude LFO
    await modulationPage.addRoute();
    await modulationPage.setRouteDestination(0, "osc1-volume");
    await modulationPage.setRouteDepth(0, 0.5);

    // Should still work, just no audible effect
    await modulationPage.expectRouteCount(1);
  });

  test("should handle all destination types", async () => {
    const destinations = [
      { value: "osc1-volume", label: /Osc 1 Volume/ },
      { value: "osc1-frequency", label: /Osc 1 Frequency/ },
      { value: "osc1-pan", label: /Osc 1 Pan/ },
      { value: "filter-frequency", label: /Filter Frequency/ },
      { value: "filter-q", label: /Filter Q/ },
      { value: "delay-time", label: /Delay Time/ },
      { value: "delay-feedback", label: /Delay Feedback/ },
      { value: "micro-time", label: /Microlooper Time/ },
      { value: "micro-feedback", label: /Microlooper Feedback/ },
      { value: "bitcrusher-bits", label: /BitCrusher Bits/ },
      { value: "chebyshev-order", label: /Chebyshev Order/ },
    ];

    // Test each destination type
    for (let i = 0; i < Math.min(destinations.length, 8); i++) {
      await modulationPage.addRoute();
      await modulationPage.setRouteDestination(i, destinations[i].value);
      await modulationPage.expectRouteLabel(i, destinations[i].label);
    }
  });
});
