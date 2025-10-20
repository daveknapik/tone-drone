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
    const currentBpm = Tone.getTransport().bpm.value;
    setBpm(currentBpm);
  }, []);

  const updateBpm = (bpm: number): void => {
    Tone.getTransport().bpm.value = bpm;
    setBpm(bpm);
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
      max={999}
      value={bpm}
      labelText="bpm"
      step={0.01}
      handleChange={(e) => updateBpm(parseFloat(e.target.value))}
      testId="bpm-slider"
    />
  );
}

export default BpmControl;
