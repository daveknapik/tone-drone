import * as Tone from "tone";

import Slider from "./Slider";

import { MutableRefObject, useState } from "react";
import OptionsSelector from "./OptionsSelector";

interface AutoFilterProps {
  filter: MutableRefObject<Tone.AutoFilter>;
}

// TODO
// - Add bypass control

function AutoFilter({ filter }: AutoFilterProps) {
  const [baseFrequency, setBaseFrequency] = useState(300);
  const [depth, setDepth] = useState(1);
  const [frequency, setFrequency] = useState(4);
  const [wet, setWet] = useState(0);
  const [type, setType] = useState<BiquadFilterType>("highpass");

  filter.current.set({
    baseFrequency,
    depth,
    frequency,
    wet,
    filter: { type },
  });

  return (
    <div className="col-start-1 md:col-start-1 place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
      <div className="col-span-full mb-1">Filter</div>
      <Slider
        inputName="baseFrequency"
        min={30}
        max={7000}
        value={baseFrequency}
        labelText="Base Freq"
        step={1}
        handleChange={(e) => setBaseFrequency(parseFloat(e.target.value))}
      />
      <Slider
        inputName="frequency"
        min={0}
        max={10}
        value={frequency}
        labelText="Speed"
        step={0.01}
        handleChange={(e) => setFrequency(parseFloat(e.target.value))}
      />
      <Slider
        inputName="depth"
        min={0}
        max={1}
        value={depth}
        labelText="Depth"
        step={0.01}
        handleChange={(e) => setDepth(parseFloat(e.target.value))}
      />
      <Slider
        inputName="wet"
        min={0}
        max={1}
        value={wet}
        labelText="Dry / Wet"
        step={0.01}
        handleChange={(e) => setWet(parseFloat(e.target.value))}
      />
      <OptionsSelector<BiquadFilterType>
        handleChange={(e) => setType(e.target.value as BiquadFilterType)}
        value={type}
        options={["highpass", "lowpass"]}
      />
    </div>
  );
}

export default AutoFilter;