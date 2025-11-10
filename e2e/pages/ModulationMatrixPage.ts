import { Page, expect, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page object for modulation matrix functionality
 */
export class ModulationMatrixPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Main Heading and Expand/Collapse
  get modulationMatrixHeading() {
    return this.page.getByRole("button", { name: /modulation matrix/i });
  }

  // LFO Controls (4 LFOs)
  getLfoRateSlider(lfoIndex: number): Locator {
    return this.page.locator(`input[name="lfo${lfoIndex}-frequency"]`);
  }

  getLfoAmplitudeSlider(lfoIndex: number): Locator {
    return this.page.locator(`input[name="lfo${lfoIndex}-amplitude"]`);
  }

  getLfoWaveformSelector(lfoIndex: number): Locator {
    // The OptionsSelector uses radio inputs with name pattern option-{id}
    // On small screens it's a select, on large screens it's radio buttons
    // We'll return the first radio input for the sine wave option as our locator
    const lfoContainer = this.page.getByTestId(`lfo-${lfoIndex}`);
    // Try to find the select first (mobile), then radio group (desktop)
    return lfoContainer.locator('select, input[type="radio"][value="sine"]').first();
  }

  getLfoPolarityButton(lfoIndex: number): Locator {
    // Polarity button is within the LFO container
    const lfoContainer = this.page.getByTestId(`lfo-${lfoIndex}`);
    return lfoContainer.getByRole("button", { name: /bipolar|unipolar/i });
  }

  // Routing Grid Controls
  get addRouteButton() {
    return this.page.getByRole("button", { name: /add route/i });
  }

  getRouteContainer(routeIndex: number): Locator {
    return this.page.getByTestId(`modulation-route-${routeIndex}`);
  }

  getRouteHeader(routeIndex: number): Locator {
    // Route headers are clickable divs with the route label
    return this.page.getByTestId(`route-header-${routeIndex}`);
  }

  getRemoveRouteButton(routeIndex: number): Locator {
    // Remove button is the "×" button within the route header
    return this.getRouteHeader(routeIndex).getByRole("button", {
      name: /remove route/i,
    });
  }

  getSourceSelector(routeIndex: number): Locator {
    // Within expanded route details
    return this.getRouteContainer(routeIndex)
      .getByRole("combobox")
      .first();
  }

  getDestinationSelector(routeIndex: number): Locator {
    // Within expanded route details - second combobox
    return this.getRouteContainer(routeIndex)
      .getByRole("combobox")
      .nth(1);
  }

  getDepthSlider(routeIndex: number): Locator {
    return this.page.locator(`input[name="route${routeIndex}-amount"]`);
  }

  getRangeModeSelector(routeIndex: number): Locator {
    // Third combobox in expanded route
    return this.getRouteContainer(routeIndex)
      .getByRole("combobox")
      .nth(2);
  }

  getCenterInput(routeIndex: number): Locator {
    // Input labeled "Center" within route details
    const routeContainer = this.getRouteContainer(routeIndex);
    return routeContainer.getByRole("spinbutton").filter({ has: this.page.locator('label:has-text("Center")') }).or(
      routeContainer.locator('input[type="number"]').nth(0)
    );
  }

  getRangeAmountInput(routeIndex: number): Locator {
    // Input labeled "Amount" within route details (not the depth slider)
    const routeContainer = this.getRouteContainer(routeIndex);
    return routeContainer.locator('input[type="number"]').nth(1);
  }

  getMinInput(routeIndex: number): Locator {
    // Input labeled "Min" within route details
    const routeContainer = this.getRouteContainer(routeIndex);
    return routeContainer.locator('input[type="number"]').nth(0);
  }

  getMaxInput(routeIndex: number): Locator {
    // Input labeled "Max" within route details
    const routeContainer = this.getRouteContainer(routeIndex);
    return routeContainer.locator('input[type="number"]').nth(1);
  }

  getAnchorToCurrentButton(routeIndex: number): Locator {
    const routeContainer = this.getRouteContainer(routeIndex);
    return routeContainer.getByRole("button", { name: /anchor to current/i });
  }

  // Actions
  async expandModulationMatrix(): Promise<void> {
    // Check if already expanded by looking for LFO Sources heading
    const lfoHeading = this.page.getByRole("heading", { name: /lfo sources/i });
    const isExpanded = await lfoHeading.isVisible().catch(() => false);

    if (!isExpanded) {
      await this.modulationMatrixHeading.click();
      await expect(lfoHeading).toBeVisible();
    }
  }

  async collapseModulationMatrix(): Promise<void> {
    // Check if already collapsed
    const lfoHeading = this.page.getByRole("heading", { name: /lfo sources/i });
    const isExpanded = await lfoHeading.isVisible().catch(() => false);

    if (isExpanded) {
      await this.modulationMatrixHeading.click();
      await expect(lfoHeading).not.toBeVisible();
    }
  }

  async setLfoRate(lfoIndex: number, rate: number): Promise<void> {
    const slider = this.getLfoRateSlider(lfoIndex);
    await slider.fill(rate.toString());
    await expect(slider).toHaveValue(rate.toString());
  }

  async setLfoAmplitude(lfoIndex: number, amplitude: number): Promise<void> {
    const slider = this.getLfoAmplitudeSlider(lfoIndex);
    await slider.fill(amplitude.toString());
    await expect(slider).toHaveValue(amplitude.toString());
  }

  async setLfoWaveform(lfoIndex: number, waveform: string): Promise<void> {
    const lfoContainer = this.page.getByTestId(`lfo-${lfoIndex}`);

    // Try select first (mobile view)
    const selectElement = lfoContainer.locator('select');
    const hasSelect = await selectElement.count() > 0 && await selectElement.isVisible().catch(() => false);

    if (hasSelect) {
      await selectElement.selectOption(waveform);
    } else {
      // Use radio buttons (desktop view)
      const radioInput = lfoContainer.locator(`input[type="radio"][value="${waveform}"]`);
      await radioInput.click();
    }
  }

  async toggleLfoPolarity(lfoIndex: number): Promise<void> {
    const button = this.getLfoPolarityButton(lfoIndex);
    await button.click();
  }

  async setLfoPolarityMode(lfoIndex: number, mode: "bipolar" | "unipolar"): Promise<void> {
    const button = this.getLfoPolarityButton(lfoIndex);
    const currentText = await button.textContent();
    const currentMode = currentText?.includes("Bipolar") ? "bipolar" : "unipolar";

    if (currentMode !== mode) {
      await button.click();
    }
  }

  async addRoute(): Promise<void> {
    await this.addRouteButton.click();
  }

  async removeRoute(routeIndex: number): Promise<void> {
    const removeButton = this.getRemoveRouteButton(routeIndex);
    await removeButton.click();
  }

  async expandRoute(routeIndex: number): Promise<void> {
    const header = this.getRouteHeader(routeIndex);
    // Check if route is already expanded by looking for source selector
    const sourceSelector = this.getSourceSelector(routeIndex);
    const isExpanded = await sourceSelector.isVisible().catch(() => false);

    if (!isExpanded) {
      await header.click();
      await expect(sourceSelector).toBeVisible();
    }
  }

  async collapseRoute(routeIndex: number): Promise<void> {
    const header = this.getRouteHeader(routeIndex);
    const sourceSelector = this.getSourceSelector(routeIndex);
    const isExpanded = await sourceSelector.isVisible().catch(() => false);

    if (isExpanded) {
      await header.click();
      // When collapsed, React removes the element from DOM entirely, so check count instead of visibility
      await expect(sourceSelector).toHaveCount(0);
    }
  }

  async setRouteSource(routeIndex: number, lfoIndex: number): Promise<void> {
    await this.expandRoute(routeIndex);
    const selector = this.getSourceSelector(routeIndex);
    await selector.selectOption(lfoIndex.toString());
  }

  async setRouteDestination(routeIndex: number, destination: string): Promise<void> {
    await this.expandRoute(routeIndex);
    const selector = this.getDestinationSelector(routeIndex);
    await selector.selectOption(destination);
  }

  async setRouteDepth(routeIndex: number, depth: number): Promise<void> {
    await this.expandRoute(routeIndex);
    const slider = this.getDepthSlider(routeIndex);
    await slider.fill(depth.toString());
  }

  async setRangeMode(routeIndex: number, mode: "center" | "minmax"): Promise<void> {
    await this.expandRoute(routeIndex);
    const selector = this.getRangeModeSelector(routeIndex);
    await selector.selectOption(mode);
  }

  async setCenterAmount(routeIndex: number, center: number, amount: number): Promise<void> {
    await this.expandRoute(routeIndex);
    await this.setRangeMode(routeIndex, "center");

    const centerInput = this.getCenterInput(routeIndex);
    const amountInput = this.getRangeAmountInput(routeIndex);

    await centerInput.fill(center.toString());
    await amountInput.fill(amount.toString());
  }

  async setMinMax(routeIndex: number, min: number, max: number): Promise<void> {
    await this.expandRoute(routeIndex);
    await this.setRangeMode(routeIndex, "minmax");

    const minInput = this.getMinInput(routeIndex);
    const maxInput = this.getMaxInput(routeIndex);

    await minInput.fill(min.toString());
    await maxInput.fill(max.toString());
  }

  async anchorToCurrent(routeIndex: number): Promise<void> {
    await this.expandRoute(routeIndex);
    const button = this.getAnchorToCurrentButton(routeIndex);
    await button.click();
  }

  // Assertions
  async expectModulationMatrixExpanded(): Promise<void> {
    const lfoHeading = this.page.getByRole("heading", { name: /lfo sources/i });
    await expect(lfoHeading).toBeVisible();
  }

  async expectModulationMatrixCollapsed(): Promise<void> {
    const lfoHeading = this.page.getByRole("heading", { name: /lfo sources/i });
    await expect(lfoHeading).not.toBeVisible();
  }

  async expectLfoRate(lfoIndex: number, rate: number): Promise<void> {
    const slider = this.getLfoRateSlider(lfoIndex);
    await expect(slider).toHaveValue(rate.toString());
  }

  async expectLfoAmplitude(lfoIndex: number, amplitude: number): Promise<void> {
    const slider = this.getLfoAmplitudeSlider(lfoIndex);
    await expect(slider).toHaveValue(amplitude.toString());
  }

  async expectLfoPolarityMode(lfoIndex: number, mode: "bipolar" | "unipolar"): Promise<void> {
    const button = this.getLfoPolarityButton(lfoIndex);
    const expectedText = mode === "bipolar" ? /bipolar/i : /unipolar/i;
    await expect(button).toContainText(expectedText);
  }

  async expectRouteCount(count: number): Promise<void> {
    if (count === 0) {
      const emptyMessage = this.page.getByText(/no modulation routes/i);
      await expect(emptyMessage).toBeVisible();
    } else {
      // Count routes by test ID prefix
      const routes = this.page.locator('[data-testid^="modulation-route-"]');
      await expect(routes).toHaveCount(count);
    }
  }

  async expectRouteLabel(routeIndex: number, expectedLabel: RegExp | string): Promise<void> {
    const header = this.getRouteHeader(routeIndex);
    await expect(header).toContainText(expectedLabel);
  }

  async expectRouteDepth(routeIndex: number, depth: number): Promise<void> {
    await this.expandRoute(routeIndex);
    const slider = this.getDepthSlider(routeIndex);
    await expect(slider).toHaveValue(depth.toString());
  }

  async expectRangeMode(routeIndex: number, mode: "center" | "minmax"): Promise<void> {
    await this.expandRoute(routeIndex);
    const selector = this.getRangeModeSelector(routeIndex);
    await expect(selector).toHaveValue(mode);
  }

  async expectCenterAmount(routeIndex: number, center: number, amount: number): Promise<void> {
    await this.expandRoute(routeIndex);
    const centerInput = this.getCenterInput(routeIndex);
    const amountInput = this.getRangeAmountInput(routeIndex);

    await expect(centerInput).toHaveValue(center.toString());
    await expect(amountInput).toHaveValue(amount.toString());
  }

  async expectMinMax(routeIndex: number, min: number, max: number): Promise<void> {
    await this.expandRoute(routeIndex);
    const minInput = this.getMinInput(routeIndex);
    const maxInput = this.getMaxInput(routeIndex);

    await expect(minInput).toHaveValue(min.toString());
    await expect(maxInput).toHaveValue(max.toString());
  }

  async expectRouteExpanded(routeIndex: number): Promise<void> {
    const sourceSelector = this.getSourceSelector(routeIndex);
    await expect(sourceSelector).toBeVisible();
  }

  async expectRouteCollapsed(routeIndex: number): Promise<void> {
    const sourceSelector = this.getSourceSelector(routeIndex);
    await expect(sourceSelector).not.toBeVisible();
  }

  // Helper methods
  async getLfoRate(lfoIndex: number): Promise<number> {
    const slider = this.getLfoRateSlider(lfoIndex);
    const value = await slider.inputValue();
    return parseFloat(value);
  }

  async getLfoAmplitude(lfoIndex: number): Promise<number> {
    const slider = this.getLfoAmplitudeSlider(lfoIndex);
    const value = await slider.inputValue();
    return parseFloat(value);
  }

  async getRouteDepth(routeIndex: number): Promise<number> {
    await this.expandRoute(routeIndex);
    const slider = this.getDepthSlider(routeIndex);
    const value = await slider.inputValue();
    return parseFloat(value);
  }
}
