import * as Tone from "tone";

import { useState, useImperativeHandle, useEffect } from "react";

import Slider from "./Slider";
import { BpmControlHandle } from "../types/BpmParams";

interface BpmControlProps {
  onParameterChange?: () => void;
  ref?: React.Ref<BpmControlHandle>;
}

function BpmControl({ onParameterChange, ref }: BpmControlProps) {
  const [bpm, setBpm] = useState<number>(120);

  // Initialize BPM from Tone.js transport on mount and listen for external changes
  useEffect(() => {
    const transport = Tone.getTransport();
    const currentBpm = transport.bpm.value;
    setBpm(currentBpm);

    // Listen for BPM changes from external sources (e.g., preset loading)
    const updateBpmFromTransport = () => {
      setBpm(transport.bpm.value);
    };

    transport.on("bpm", updateBpmFromTransport);

    return () => {
      transport.off("bpm", updateBpmFromTransport);
    };
  }, []);

  const updateBpm = (bpm: number): void => {
    // Cap BPM at 300 to prevent audio glitches with high BPM + long release times
    const cappedBpm = Math.min(bpm, 300);
    Tone.getTransport().bpm.value = cappedBpm;
    setBpm(cappedBpm);
    onParameterChange?.();
  };

  // Expose imperative handle for preset manager
  useImperativeHandle(ref, () => ({
    getValue: () => bpm,
    setValue: (newBpm: number) => {
      updateBpm(newBpm);
    },
  }));

  return (
    <Slider
      inputName="bpm"
      min={0}
      max={300}
      value={bpm}
      labelText="bpm"
      step={0.01}
      handleChange={(e) => updateBpm(parseFloat(e.target.value))}
      testId="bpm-slider"
    />
  );
}

export default BpmControl;
