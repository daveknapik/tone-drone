import * as Tone from "tone";

import Slider from "./Slider";

import { useEffect, useState, useImperativeHandle, useRef } from "react";
import OptionsSelector from "./OptionsSelector";
import { FilterHandle, FilterParams } from "../types/FilterParams";

interface FilterProps {
  filter: React.RefObject<Tone.Filter>;
  ref?: React.Ref<FilterHandle>;
  onParameterChange?: () => void;
}

function Filter({ filter, ref, onParameterChange }: FilterProps) {
  const [frequency, setFrequency] = useState(300);
  const [rolloff, setRolloff] = useState<Tone.FilterRollOff>(-12);
  const [Q, setQ] = useState(1);
  const [type, setType] = useState<BiquadFilterType>("highpass");

  // Keep a ref with current state values for imperative access
  const paramsRef = useRef<FilterParams>({
    frequency,
    rolloff,
    Q,
    type,
  });

  // Update ref whenever state changes
  useEffect(() => {
    paramsRef.current = {
      frequency,
      rolloff,
      Q,
      type,
    };
  }, [frequency, rolloff, Q, type]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getParams: (): FilterParams => paramsRef.current,
    setParams: (params: FilterParams) => {
      setFrequency(params.frequency);
      setRolloff(params.rolloff);
      setQ(params.Q);
      setType(params.type);
    },
  }));

  filter.current.set({
    frequency,
    Q,
    type,
  });

  // rolloff can't go via the set method or it makes the filter stutter and glitch, but this works
  useEffect(() => {
    filter.current.rolloff = rolloff;
  }, [filter, rolloff]);

  return (
    <div className="place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
      <div className="col-span-full mb-1">Filter</div>
      <Slider
        inputName="frequency"
        min={30}
        max={7000}
        value={frequency}
        labelText="Frequency"
        step={1}
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
      </div>
    </div>
  );
}

export default Filter;
