import { test, expect } from "../fixtures/testFixtures";
import { TransportPage } from "../pages/TransportPage";

test.describe("Transport Controls", () => {
  let transportPage: TransportPage;

  test.beforeEach(async ({ page }) => {
    transportPage = new TransportPage(page);
  });

  test("should start in paused state", async () => {
    await transportPage.expectPaused();
  });

  test("should play sequencer when play button is clicked", async () => {
    await transportPage.play();
    await transportPage.expectPlaying();
  });

  test("should pause sequencer when pause button is clicked", async () => {
    // Start playing first
    await transportPage.play();
    await transportPage.expectPlaying();

    // Then pause
    await transportPage.pause();
    await transportPage.expectPaused();
  });

  test("should toggle play/pause", async () => {
    // Initial state: paused
    await transportPage.expectPaused();

    // Toggle to play
    await transportPage.toggle();
    await transportPage.expectPlaying();

    // Toggle back to pause
    await transportPage.toggle();
    await transportPage.expectPaused();
  });

  test("should toggle play/pause with spacebar", async () => {
    // Initial state: paused
    await transportPage.expectPaused();

    // Press spacebar to play
    await transportPage.pressSpaceBar();
    await transportPage.expectPlaying();

    // Press spacebar again to pause
    await transportPage.pressSpaceBar();
    await transportPage.expectPaused();
  });

  test("should change BPM with slider", async () => {
    // Set BPM to 140
    await transportPage.setBpm(140);

    // Verify BPM is set (getBpm will wait for the value to be stable)
    const bpm = await transportPage.getBpm();
    expect(bpm).toBe(140);
  });

  test("should maintain BPM when toggling play/pause", async () => {
    // Set custom BPM
    await transportPage.setBpm(160);

    // Play
    await transportPage.play();
    await transportPage.expectPlaying();

    // BPM should still be 160
    const bpm1 = await transportPage.getBpm();
    expect(bpm1).toBe(160);

    // Pause
    await transportPage.pause();

    // BPM should still be 160
    const bpm2 = await transportPage.getBpm();
    expect(bpm2).toBe(160);
  });

  test("should handle very low BPM", async () => {
    await transportPage.setBpm(30);
    const bpm = await transportPage.getBpm();
    expect(bpm).toBe(30);
  });

  test("should handle very high BPM", async () => {
    await transportPage.setBpm(300);
    const bpm = await transportPage.getBpm();
    expect(bpm).toBe(300);
  });
});

test.describe("BPM Control", () => {
  let transportPage: TransportPage;

  test.beforeEach(async ({ page }) => {
    transportPage = new TransportPage(page);
  });

  test("should start with default BPM of 120", async () => {
    const bpm = await transportPage.getBpm();
    expect(bpm).toBe(120);
  });

  test("should update BPM in real-time while playing", async () => {
    // Start playing
    await transportPage.play();
    await transportPage.expectPlaying();

    // Change BPM while playing
    await transportPage.setBpm(180);

    // Verify BPM changed
    const bpm = await transportPage.getBpm();
    expect(bpm).toBe(180);

    // Transport should still be playing
    await transportPage.expectPlaying();
  });
});
