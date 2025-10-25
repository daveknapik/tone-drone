import type { Preset } from "../../src/types/Preset";

/**
 * Test preset data for e2e tests
 */

export const testPreset: Preset = {
  version: 1,
  metadata: {
    id: "test-preset-1",
    name: "Test Preset",
    description: "A test preset for e2e tests",
    created: new Date().toISOString(),
  },
  state: {
    oscillators: {
      minFreq: 440,
      maxFreq: 880,
      oscillators: [
        {
          frequency: 440,
          waveform: "sine",
          volume: -10,
          pan: 0,
          oscillatorType: "basic",
          fatCount: 1,
          fatSpread: 0,
        },
      ],
      sequences: [
        {
          frequency: 440,
          steps: [
            true,
            false,
            false,
            false,
            true,
            false,
            false,
            false,
            true,
            false,
            false,
            false,
            true,
            false,
            false,
            false,
          ],
        },
      ],
    },
    polysynths: {
      polysynths: [
        {
          frequency: 666,
          waveform: "sine",
          volume: -10,
          pan: 0,
          attack: 0.5,
          decay: 0.7,
          sustain: 1,
          release: 3,
        },
        {
          frequency: 999,
          waveform: "sine",
          volume: -10,
          pan: 0,
          attack: 0.5,
          decay: 0.7,
          sustain: 1,
          release: 3,
        },
      ],
    },
    effects: {
      autoFilter: {
        baseFrequency: 300,
        depth: 1,
        frequency: 1,
        rolloff: -12,
        Q: 1,
        wet: 0,
        type: "lowpass",
        oscillatorType: "sine",
      },
      bitCrusher: {
        bits: 4,
        wet: 0,
      },
      chebyshev: {
        order: 50,
        wet: 0,
      },
      microlooper: {
        time: 0.5,
        feedback: 0.7,
        wet: 0,
      },
      afterFilter: {
        frequency: 1000,
        rolloff: -12,
        Q: 1,
        type: "lowpass",
      },
      delay: {
        time: 0.25,
        feedback: 0.5,
        wet: 0,
      },
    },
    effectsBusSend: 0.5,
    bpm: 120,
  },
};

export const customPresetData = {
  name: "Custom E2E Preset",
  oscillatorFrequency: 523.25, // C5
  volume: -15,
  pan: 0.5,
};
