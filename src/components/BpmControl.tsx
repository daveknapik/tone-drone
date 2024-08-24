import * as Tone from "tone";

import { useState } from "react";

import Slider from "./Slider";

function BpmControl() {
  const [bpm, setBpm] = useState<number>(120);

  const updateBpm = (bpm: number): void => {
    Tone.getTransport().bpm.value = bpm;
    setBpm(bpm);
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
    />
  );
}

export default BpmControl;
