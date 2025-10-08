import * as Tone from "tone";

import Slider from "./Slider";

import { useState } from "react";

interface ReverbProps {
  reverb: React.RefObject<Tone.Reverb>;
}

function Reverb({ reverb }: ReverbProps) {
  const [decay, setDecay] = useState(1.5);
  const [preDelay, setPreDelay] = useState(0.01);
  const [wet, setWet] = useState(0);

  reverb.current.set({
    decay,
    preDelay,
    wet,
  });

  return (
    <div className="place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
      <div className="col-span-full mb-1">Reverb</div>
      <Slider
        handleChange={(e) => setDecay(parseFloat(e.target.value))}
        inputName="decay"
        labelText="Decay"
        max={60}
        min={0.25}
        step={0.25}
        value={decay}
      />
      <Slider
        handleChange={(e) => setPreDelay(parseFloat(e.target.value))}
        inputName="predelay"
        labelText="Predelay"
        max={2}
        min={0}
        step={0.01}
        value={preDelay}
      />
      <Slider
        handleChange={(e) => setWet(parseFloat(e.target.value))}
        inputName="wet"
        labelText="Dry / Wet"
        max={1}
        min={0}
        step={0.01}
        value={wet}
      />
    </div>
  );
}

export default Reverb;
