import * as Tone from "tone";

import Slider from "./Slider";

import { MutableRefObject, useState } from "react";

interface BitCrusherProps {
  bitCrusher: MutableRefObject<Tone.BitCrusher> | null;
}

function BitCrusher({ bitCrusher }: BitCrusherProps) {
  const [bits, setBits] = useState(5);
  const [wet, setWet] = useState(0);

  bitCrusher?.current?.set({
    bits,
    wet,
  });

  return (
    <div className="place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
      <div className="col-span-full mb-1">Bitcrusher</div>
      <Slider
        inputName="bits"
        min={2}
        max={8}
        value={bits}
        labelText="Bits"
        handleChange={(e) => setBits(parseFloat(e.target.value))}
      />
      <Slider
        inputName="wet"
        min={0}
        max={1}
        value={wet}
        step={0.01}
        labelText="Dry / Wet"
        handleChange={(e) => setWet(parseFloat(e.target.value))}
      />
    </div>
  );
}

export default BitCrusher;
