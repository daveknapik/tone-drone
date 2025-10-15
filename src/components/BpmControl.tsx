import * as Tone from "tone";

import { useState } from "react";

import Slider from "./Slider";

interface BpmControlProps {
  onParameterChange?: () => void;
}

function BpmControl({ onParameterChange }: BpmControlProps) {
  const [bpm, setBpm] = useState<number>(120);

  const updateBpm = (bpm: number): void => {
    Tone.getTransport().bpm.value = bpm;
    setBpm(bpm);
    onParameterChange?.();
  };

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
