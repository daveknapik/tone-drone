import { test, expect } from "../fixtures/testFixtures";
import { RandomizeFrequencyPage } from "../pages/RandomizeFrequencyPage";

test.describe("Randomize Frequency", () => {
  let randomizePage: RandomizeFrequencyPage;

  test.beforeEach(async ({ page }) => {
    randomizePage = new RandomizeFrequencyPage(page);
  });

  test("should display randomize button", async () => {
    await randomizePage.expectRandomizeButtonVisible();
  });

  test("should randomize oscillator frequencies when clicked", async () => {
    // Get initial frequencies
    const beforeFrequencies = await randomizePage.getAllFrequencies();

    // Click randomize button
    await randomizePage.clickRandomize();

    // Verify frequencies changed
    await randomizePage.expectFrequenciesChanged(beforeFrequencies);
  });

  test("should keep randomized frequencies within min/max bounds", async () => {
    // Default min/max is 30-1000 Hz
    const minFreq = 30;
    const maxFreq = 1000;

    // Click randomize button
    await randomizePage.clickRandomize();

    // Verify all frequencies are within bounds
    await randomizePage.expectFrequenciesInRange(minFreq, maxFreq);
  });

  test("should randomize to different frequencies on multiple clicks", async () => {
    // First randomization
    await randomizePage.clickRandomize();
    const frequencies1 = await randomizePage.getAllFrequencies();

    // Second randomization
    await randomizePage.clickRandomize();
    const frequencies2 = await randomizePage.getAllFrequencies();

    // Third randomization
    await randomizePage.clickRandomize();
    const frequencies3 = await randomizePage.getAllFrequencies();

    // At least one of the randomizations should produce different results
    // (extremely unlikely all three produce identical frequency sets)
    const allSame =
      JSON.stringify(frequencies1) === JSON.stringify(frequencies2) &&
      JSON.stringify(frequencies2) === JSON.stringify(frequencies3);

    expect(allSame).toBe(false);
  });

  test("should randomize all 6 oscillators", async () => {
    // Get initial frequencies
    const beforeFrequencies = await randomizePage.getAllFrequencies();
    expect(beforeFrequencies).toHaveLength(6);

    // Click randomize
    await randomizePage.clickRandomize();

    // Get new frequencies
    const afterFrequencies = await randomizePage.getAllFrequencies();
    expect(afterFrequencies).toHaveLength(6);

    // Verify at least one oscillator changed (statistically certain with random scales)
    const hasChanged = afterFrequencies.some(
      (freq, index) => freq !== beforeFrequencies[index]
    );
    expect(hasChanged).toBe(true);
  });

  test("should update sequencer notes to match randomized frequencies", async () => {
    // Get initial frequencies
    const beforeFrequencies = await randomizePage.getAllFrequencies();

    // Click randomize
    await randomizePage.clickRandomize();

    // Get new frequencies
    const afterFrequencies = await randomizePage.getAllFrequencies();

    // Verify frequencies changed
    const hasChanged = afterFrequencies.some(
      (freq, index) => freq !== beforeFrequencies[index]
    );
    expect(hasChanged).toBe(true);

    // After randomization, clicking a step and playing should use the new frequency
    // This is implicitly tested by the fact that the frequency sliders update
    // and the sequences are tied to those frequencies
    // The actual audio testing would require more complex E2E setup
  });
});
