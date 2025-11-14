import * as Tone from "tone";

import Slider from "./Slider";

import { useEffect, useState, useImperativeHandle, useRef } from "react";
import OptionsSelector from "./OptionsSelector";
import { FilterHandle, FilterParams } from "../types/FilterParams";
import { useRampedParameter } from "../hooks/useRampedParameter";

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

  // Smooth ramped parameter updates (prevents clicking)
  const frequencyRamped = useRampedParameter(
    filter.current?.frequency,
    onParameterChange
  );
  const qRamped = useRampedParameter(filter.current?.Q, onParameterChange);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getParams: (): FilterParams => paramsRef.current,
    setParams: (params: FilterParams) => {
      // Apply audio parameters with smooth ramping (prevents clicks on preset load)
      frequencyRamped.rampTo(params.frequency);
      qRamped.rampTo(params.Q);
      // Update React state for UI
      setFrequency(params.frequency);
      setRolloff(params.rolloff);
      setQ(params.Q);
      setType(params.type);
    },
  }));

  // Apply initial parameter values on mount
  useEffect(() => {
    frequencyRamped.rampTo(frequency);
    qRamped.rampTo(Q);
  }, []); // Empty deps - only run on mount

  // Update properties that can't be ramped (non-AudioParams)
  useEffect(() => {
    if (filter.current) {
      filter.current.type = type;
      filter.current.rolloff = rolloff;
    }
  }, [filter, type, rolloff]);

  return (
    <div className="sm:place-items-center sm:border-2 sm:rounded sm:border-pink-500 dark:sm:border-sky-300 p-5">
      <div className="col-span-full mb-1 text-center">Filter</div>
      <Slider
        inputName="frequency"
        min={30}
        max={7000}
        value={frequency}
        labelText="Frequency"
        step={1}
        handleChange={(e) => {
          const newFrequency = parseFloat(e.target.value);
          frequencyRamped.rampTo(newFrequency); // Smooth audio update
          setFrequency(newFrequency); // UI state update
          frequencyRamped.markModified(); // Debounced preset marking
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
          const newQ = parseFloat(e.target.value);
          qRamped.rampTo(newQ); // Smooth audio update
          setQ(newQ); // UI state update
          qRamped.markModified(); // Debounced preset marking
        }}
      />

      <div className="mt-3 space-y-2">
        <OptionsSelector<BiquadFilterType>
          handleChange={(e) => {
            setType(e.target.value as BiquadFilterType);
            onParameterChange?.();
          }}
          value={type}
          options={["highpass", "lowpass", "bandpass", "notch"]}
          useDropdownOnSmall={true}
          label="Type"
        />
        <OptionsSelector<Tone.FilterRollOff>
          handleChange={(e) => {
            setRolloff(parseFloat(e.target.value) as Tone.FilterRollOff);
            onParameterChange?.();
          }}
          value={rolloff}
          options={[-12, -24, -48, -96]}
          useDropdownOnSmall={true}
          label="Rolloff"
        />
      </div>
    </div>
  );
}

export default Filter;
