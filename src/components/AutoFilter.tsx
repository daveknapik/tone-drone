import * as Tone from "tone";

import Slider from "./Slider";

import { useEffect, useState, useImperativeHandle, useRef } from "react";
import OptionsSelector from "./OptionsSelector";
import { AutoFilterHandle, AutoFilterParams } from "../types/AutoFilterParams";

interface AutoFilterProps {
  filter: React.RefObject<Tone.AutoFilter>;
  ref?: React.Ref<AutoFilterHandle>;
  onParameterChange?: () => void;
}

function AutoFilter({ filter, ref, onParameterChange }: AutoFilterProps) {
  const [baseFrequency, setBaseFrequency] = useState(300);
  const [depth, setDepth] = useState(1);
  const [frequency, setFrequency] = useState(4);
  const [rolloff, setRolloff] = useState<Tone.FilterRollOff>(-12);
  const [Q, setQ] = useState(1);
  const [wet, setWet] = useState(0);
  const [type, setType] = useState<BiquadFilterType>("highpass");
  const [oscillatorType, setOscillatorType] = useState<OscillatorType>("sine");

  // Keep a ref with current state values for imperative access
  const paramsRef = useRef<AutoFilterParams>({
    baseFrequency,
    depth,
    frequency,
    rolloff,
    Q,
    wet,
    type,
    oscillatorType,
  });

  // Update ref whenever state changes
  useEffect(() => {
    paramsRef.current = {
      baseFrequency,
      depth,
      frequency,
      rolloff,
      Q,
      wet,
      type,
      oscillatorType,
    };
  }, [baseFrequency, depth, frequency, rolloff, Q, wet, type, oscillatorType]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getParams: (): AutoFilterParams => paramsRef.current,
    setParams: (params: AutoFilterParams) => {
      setBaseFrequency(params.baseFrequency);
      setDepth(params.depth);
      setFrequency(params.frequency);
      setRolloff(params.rolloff);
      setQ(params.Q);
      setWet(params.wet);
      setType(params.type);
      setOscillatorType(params.oscillatorType);
    },
  }));

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
        handleChange={(e) => {
          setBaseFrequency(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
      <Slider
        inputName="frequency"
        min={0}
        max={10}
        value={frequency}
        labelText="Speed"
        step={0.01}
        handleChange={(e) => {
          setFrequency(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
      <Slider
        inputName="q"
        min={0}
        max={9}
        value={Q}
        labelText="Q"
        step={0.01}
        handleChange={(e) => {
          setQ(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
      <Slider
        inputName="depth"
        min={0}
        max={1}
        value={depth}
        labelText="Depth"
        step={0.01}
        handleChange={(e) => {
          setDepth(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
      <Slider
        inputName="wet"
        min={0}
        max={1}
        value={wet}
        labelText="Dry / Wet"
        step={0.01}
        handleChange={(e) => {
          setWet(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
      <div className="mt-3">
        <OptionsSelector<BiquadFilterType>
          handleChange={(e) => {
            setType(e.target.value as BiquadFilterType);
            onParameterChange?.();
          }}
          value={type}
          options={["highpass", "lowpass", "bandpass", "notch"]}
        />
        <OptionsSelector<Tone.FilterRollOff>
          handleChange={(e) => {
            setRolloff(parseFloat(e.target.value) as Tone.FilterRollOff);
            onParameterChange?.();
          }}
          value={rolloff}
          options={[-12, -24, -48, -96]}
        />
        <OptionsSelector<OscillatorType>
          handleChange={(e) => {
            setOscillatorType(e.target.value as OscillatorType);
            onParameterChange?.();
          }}
          value={oscillatorType}
          options={["sine", "square", "triangle", "sawtooth"]}
        />
      </div>
    </div>
  );
}

export default AutoFilter;
