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

  // Initialize BPM from Tone.js transport on mount
  useEffect(() => {
    const transport = Tone.getTransport();
    const currentBpm = transport.bpm.value;
    setBpm(currentBpm);
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
    <div title="Beats per minute (0-300 BPM). Capped at 300 to prevent audio glitches with high BPM and long release times.">
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
    </div>
  );
}

export default BpmControl;
