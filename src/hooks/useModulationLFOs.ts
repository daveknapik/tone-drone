import * as Tone from "tone";
import { useRef, useEffect, useCallback } from "react";
import { LFOParams, LFOPolarityMode } from "../types/ModulationMatrixParams";

const DEFAULT_LFO_PARAMS: LFOParams[] = [
  { frequency: 0.5, type: "sine", amplitude: 1, polarityMode: "bipolar" },
  { frequency: 1, type: "triangle", amplitude: 1, polarityMode: "bipolar" },
  { frequency: 2, type: "square", amplitude: 1, polarityMode: "bipolar" },
  { frequency: 4, type: "sawtooth", amplitude: 1, polarityMode: "bipolar" },
];

/**
 * Internal state for each LFO with polarity processing
 */
interface LFOState {
  lfo: Tone.LFO;
  polarityMode: LFOPolarityMode;
  unipolarScaler: Tone.Scale; // Converts bipolar [-1,1] to unipolar [0,1]
  outputSignal: Tone.Signal;  // Final output after polarity processing
}

/**
 * Hook to manage 4 LFOs for the modulation matrix
 * Each LFO can be set to bipolar (-1 to +1) or unipolar (0 to +1) mode
 */
export function useModulationLFOs() {
  const lfoStatesRef = useRef<LFOState[]>([]);

  useEffect(() => {
    // Create 4 LFOs with polarity processing chains
    DEFAULT_LFO_PARAMS.forEach((params, i) => {
      // Create base LFO (always bipolar internally)
      const lfo = new Tone.LFO({
        frequency: params.frequency,
        type: params.type,
        amplitude: params.amplitude,
        min: -1,
        max: 1,
      }).start();

      // Create unipolar scaler: maps [-1,1] to [0,1]
      const unipolarScaler = new Tone.Scale({ min: 0, max: 1 });

      // Create output signal
      const outputSignal = new Tone.Signal(0);

      // Initial routing based on polarity mode
      const polarityMode = params.polarityMode ?? "bipolar";
      if (polarityMode === "unipolar") {
        // Route: LFO -> Scaler -> Output
        lfo.connect(unipolarScaler);
        unipolarScaler.connect(outputSignal);
      } else {
        // Route: LFO -> Output (direct)
        lfo.connect(outputSignal);
      }

      lfoStatesRef.current[i] = {
        lfo,
        polarityMode,
        unipolarScaler,
        outputSignal,
      };
    });

    // Cleanup on unmount
    return () => {
      lfoStatesRef.current.forEach((state) => {
        state.lfo.stop();
        state.lfo.disconnect();
        state.lfo.dispose();
        state.unipolarScaler.disconnect();
        state.unipolarScaler.dispose();
        state.outputSignal.dispose();
      });
      lfoStatesRef.current = [];
    };
  }, []);

  /**
   * Switch an LFO's polarity mode
   * Uses smooth transitions to prevent audio artifacts
   */
  const setPolarityMode = useCallback((lfoIndex: number, mode: LFOPolarityMode) => {
    const state = lfoStatesRef.current[lfoIndex];
    if (!state || state.polarityMode === mode) return;

    const now = Tone.now();

    // Smooth fade-out the output
    state.outputSignal.linearRampToValueAtTime(0, now + 0.05);

    // After fade-out at audio time, reconfigure routing (audio-time scheduled for determinism)
    Tone.Draw.schedule(() => {
      // Disconnect all
      state.lfo.disconnect();
      state.unipolarScaler.disconnect();

      // Reconnect based on new mode
      if (mode === "unipolar") {
        // Route: LFO -> Scaler -> Output
        state.lfo.connect(state.unipolarScaler);
        state.unipolarScaler.connect(state.outputSignal);
      } else {
        // Route: LFO -> Output (direct)
        state.lfo.connect(state.outputSignal);
      }

      state.polarityMode = mode;

      // Fade back in (signal will resume automatically)
    }, now + 0.06); // Slightly longer than fade-out time
  }, []);

  /**
   * Get the current polarity mode for an LFO
   */
  const getPolarityMode = useCallback((lfoIndex: number): LFOPolarityMode => {
    return lfoStatesRef.current[lfoIndex]?.polarityMode ?? "bipolar";
  }, []);

  return {
    lfos: lfoStatesRef.current.map((state) => state.lfo),
    signals: lfoStatesRef.current.map((state) => state.outputSignal),
    setPolarityMode,
    getPolarityMode,
  };
}

