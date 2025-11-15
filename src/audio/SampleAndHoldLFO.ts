import * as Tone from "tone";

/**
 * Sample-and-Hold LFO that generates random stepped values at regular intervals.
 *
 * Unlike standard LFOs (sine, triangle, square, sawtooth), this generates
 * random values and holds them until the next update, creating a stepped
 * random modulation effect similar to classic analog synthesizer S&H circuits.
 *
 * Implementation uses Tone.Loop to schedule random value updates at a rate
 * determined by the frequency parameter. Output range is bipolar [-1, 1],
 * matching standard Tone.LFO behavior.
 */
export class SampleAndHoldLFO {
  /** Frequency parameter (Hz) - controls how often new random values are generated */
  public frequency: Tone.Signal<"frequency">;

  /** Amplitude parameter (0-1) - scales the output range */
  public amplitude: Tone.Signal<"normalRange">;

  /** Output signal - connect this to modulation destinations */
  public output: Tone.Signal<"number">;

  private loop: Tone.Loop;
  private isStarted = false;
  private updateInterval = 1; // seconds between updates (inverse of frequency)

  /**
   * Create a new Sample-and-Hold LFO
   * @param frequency - Update rate in Hz (default: 1 Hz = 1 update per second)
   * @param amplitude - Output scaling 0-1 (default: 1 = full range)
   */
  constructor(frequency = 1, amplitude = 1) {
    // Create parameter controls (matching Tone.LFO interface)
    this.frequency = new Tone.Signal(frequency, "frequency");
    this.amplitude = new Tone.Signal(amplitude, "normalRange");
    this.output = new Tone.Signal(0);

    // Calculate initial interval
    this.updateInterval = 1 / frequency;

    // Create loop that triggers at the specified frequency
    this.loop = new Tone.Loop((time) => {
      // Generate random value in bipolar range [-1, 1]
      const randomValue = (Math.random() * 2 - 1) * this.amplitude.value;

      // Set immediately at scheduled time (no ramping for stepped effect)
      this.output.setValueAtTime(randomValue, time);
    }, this.updateInterval);

    // Monitor frequency changes and update loop interval
    this.frequency.value = frequency;
    this.updateFrequencyMonitor();
  }

  /**
   * Monitor frequency parameter for changes and update loop interval
   * This allows real-time frequency changes without recreating the loop
   */
  private updateFrequencyMonitor(): void {
    // Use a repeating callback to check frequency and update interval
    // We can't directly connect frequency to loop.interval because
    // Loop expects a time value, not a frequency signal
    const checkInterval = setInterval(() => {
      if (this.loop && !this.loop.disposed) {
        const currentFreq = Number(this.frequency.value);
        const newInterval = currentFreq > 0 ? 1 / currentFreq : 1;

        // Only update if changed to avoid unnecessary loop restarts
        if (Math.abs(newInterval - this.updateInterval) > 0.001) {
          this.updateInterval = newInterval;
          this.loop.interval = newInterval;
        }
      } else {
        // Clean up monitor if loop is disposed
        clearInterval(checkInterval);
      }
    }, 100); // Check every 100ms
  }

  /**
   * Start the LFO
   * @param time - When to start (default: now)
   */
  start(time?: Tone.Unit.Time): this {
    if (!this.isStarted) {
      this.loop.start(time);
      this.isStarted = true;
    }
    return this;
  }

  /**
   * Stop the LFO
   * @param time - When to stop (default: now)
   */
  stop(time?: Tone.Unit.Time): this {
    if (this.isStarted) {
      this.loop.stop(time);
      this.isStarted = false;
    }
    return this;
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    this.loop.dispose();
    this.frequency.dispose();
    this.amplitude.dispose();
    this.output.dispose();
  }

  /**
   * Connect the output to a destination
   * @param destination - Tone.js node to connect to
   */
  connect(destination: Tone.InputNode): this {
    this.output.connect(destination);
    return this;
  }

  /**
   * Disconnect the output
   */
  disconnect(): this {
    this.output.disconnect();
    return this;
  }
}
