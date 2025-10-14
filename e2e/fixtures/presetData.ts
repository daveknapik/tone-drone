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
      volume: -10,
      pan: 0,
    },
    effects: {
      autoFilter: {
        enabled: false,
        frequency: 1,
        depth: 1,
        wet: 1,
      },
      bitCrusher: {
        enabled: false,
        bits: 4,
        wet: 1,
      },
      chebyshev: {
        enabled: false,
        order: 50,
        wet: 1,
      },
      microlooper: {
        enabled: false,
        delayTime: 0.5,
        feedback: 0.7,
        wet: 1,
      },
      afterFilter: {
        enabled: false,
        frequency: 1000,
        rolloff: -12,
        Q: 1,
        type: "lowpass",
        wet: 1,
      },
      delay: {
        enabled: false,
        delayTime: 0.25,
        feedback: 0.5,
        wet: 1,
      },
    },
    effectsBusSend: 0.5,
  },
};

export const customPresetData = {
  name: "Custom E2E Preset",
  oscillatorFrequency: 523.25, // C5
  volume: -15,
  pan: 0.5,
};
