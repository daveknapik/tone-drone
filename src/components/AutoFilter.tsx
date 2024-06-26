import * as Tone from "tone";

import Slider from "./Slider";

import { MutableRefObject, useEffect, useState } from "react";
import OptionsSelector from "./OptionsSelector";

interface AutoFilterProps {
  filter: MutableRefObject<Tone.AutoFilter>;
}

function AutoFilter({ filter }: AutoFilterProps) {
  const [baseFrequency, setBaseFrequency] = useState(300);
  const [depth, setDepth] = useState(1);
  const [frequency, setFrequency] = useState(4);
  const [rolloff, setRolloff] = useState<Tone.FilterRollOff>(-12);
  const [Q, setQ] = useState(1);
  const [wet, setWet] = useState(0);
  const [type, setType] = useState<BiquadFilterType>("highpass");
  const [oscillatorType, setOscillatorType] = useState<OscillatorType>("sine");

  filter.current.set({
    baseFrequency,
    depth,
    frequency,
    wet,
    filter: { type, Q },
    type: oscillatorType,
  });

  // rolloff can't go via the set method or it makes the filter stutter and glitch, but this works
  useEffect(() => {
    filter.current.filter.rolloff = rolloff;
  }, [filter, rolloff]);

  return (
    <div className="place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
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
        inputName="q"
        min={0}
        max={9}
        value={Q}
        labelText="Q"
        step={0.01}
        handleChange={(e) => setQ(parseFloat(e.target.value))}
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
      <div className="mt-3">
        <OptionsSelector<BiquadFilterType>
          handleChange={(e) => setType(e.target.value as BiquadFilterType)}
          value={type}
          options={["highpass", "lowpass", "bandpass", "notch"]}
        />
        <OptionsSelector<Tone.FilterRollOff>
          handleChange={(e) =>
            setRolloff(parseFloat(e.target.value) as Tone.FilterRollOff)
          }
          value={rolloff}
          options={[-12, -24, -48, -96]}
        />
        <OptionsSelector<OscillatorType>
          handleChange={(e) =>
            setOscillatorType(e.target.value as OscillatorType)
          }
          value={oscillatorType}
          options={["sine", "square", "triangle", "sawtooth"]}
        />
      </div>
    </div>
  );
}

export default AutoFilter;
