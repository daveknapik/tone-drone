import * as Tone from "tone";
import { useRef, useEffect } from "react";
import { LFOParams } from "../types/ModulationMatrixParams";

const DEFAULT_LFO_PARAMS: LFOParams[] = [
  { frequency: 0.5, type: "sine", amplitude: 1 },
  { frequency: 1, type: "triangle", amplitude: 1 },
  { frequency: 2, type: "square", amplitude: 1 },
  { frequency: 4, type: "sawtooth", amplitude: 1 },
];

/**
 * Hook to manage 4 LFOs for the modulation matrix
 */
export function useModulationLFOs() {
  const lfosRef = useRef<Tone.LFO[]>([]);
  const signalsRef = useRef<Tone.Signal[]>([]);

  useEffect(() => {
    // Create 4 LFOs with default parameters
    DEFAULT_LFO_PARAMS.forEach((params, i) => {
      const lfo = new Tone.LFO({
        frequency: params.frequency,
        type: params.type,
        amplitude: params.amplitude,
        min: -1,
        max: 1,
      }).start();

      // Create a signal to capture the LFO output
      const signal = new Tone.Signal(0);
      lfo.connect(signal);

      lfosRef.current[i] = lfo;
      signalsRef.current[i] = signal;
    });

    // Cleanup on unmount
    return () => {
      lfosRef.current.forEach((lfo) => {
        lfo.stop();
        lfo.dispose();
      });
      signalsRef.current.forEach((signal) => {
        signal.dispose();
      });
      lfosRef.current = [];
      signalsRef.current = [];
    };
  }, []);

  return {
    lfos: lfosRef.current,
    signals: signalsRef.current,
  };
}

