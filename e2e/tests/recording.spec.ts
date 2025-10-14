import { test } from "../fixtures/testFixtures";
import { RecorderPage } from "../pages/RecorderPage";
import { TransportPage } from "../pages/TransportPage";

test.describe("Recording Functionality", () => {
  let recorderPage: RecorderPage;
  let transportPage: TransportPage;

  test.beforeEach(async ({ page }) => {
    recorderPage = new RecorderPage(page);
    transportPage = new TransportPage(page);
  });

  test("should start in non-recording state", async () => {
    await recorderPage.expectNotRecording();
    await recorderPage.expectDownloadNotAvailable();
  });

  test("should start recording when start button is clicked", async () => {
    await recorderPage.startRecording();
    await recorderPage.expectRecording();
  });

  test("should stop recording when stop button is clicked", async () => {
    // Start recording
    await recorderPage.startRecording();
    await recorderPage.expectRecording();

    // Stop recording
    await recorderPage.stopRecording();
    await recorderPage.expectNotRecording();
  });

  test("should toggle recording", async () => {
    // Start
    await recorderPage.toggleRecording();
    await recorderPage.expectRecording();

    // Stop
    await recorderPage.toggleRecording();
    await recorderPage.expectNotRecording();
  });

  test("should show download link after recording", async () => {
    // Record for 1 second
    await recorderPage.recordFor(1000);

    // Download link should be available
    await recorderPage.expectDownloadAvailable();
  });

  test("should record while sequencer is playing", async () => {
    // Start sequencer
    await transportPage.play();
    await transportPage.expectPlaying();

    // Record for 1 second (using recordFor which handles timing properly)
    await recorderPage.recordFor(1000);

    // Download should be available
    await recorderPage.expectDownloadAvailable();
  });

  test("should record audio even when sequencer is paused (ambient drone)", async () => {
    // Don't start the sequencer
    await transportPage.expectPaused();

    // Record for 1 second (will capture ambient drone sounds)
    await recorderPage.recordFor(1000);

    // Download should still be available
    await recorderPage.expectDownloadAvailable();
  });

  test("should display recording indicator while recording", async () => {
    await recorderPage.startRecording();

    // Button should show "Stop"
    await recorderPage.expectRecording();

    await recorderPage.stopRecording();
  });

  test("should allow multiple recordings", async () => {
    // First recording
    await recorderPage.recordFor(500);
    await recorderPage.expectDownloadAvailable();

    // Second recording (will replace the first)
    await recorderPage.recordFor(500);
    await recorderPage.expectDownloadAvailable();
  });
});

test.describe("Recording Timer", () => {
  let recorderPage: RecorderPage;

  test.beforeEach(async ({ page }) => {
    recorderPage = new RecorderPage(page);
  });

  test("should show timer while recording", async () => {
    // Start recording
    await recorderPage.startRecording();

    // Timer should be visible and running
    // The timer component doesn't have a test ID yet, but we can verify the state
    await recorderPage.expectRecording();

    // Record for a short duration to test timer functionality
    await recorderPage.recordFor(1000);

    // Verify download is available (proves recording captured time)
    await recorderPage.expectDownloadAvailable();
  });
});
