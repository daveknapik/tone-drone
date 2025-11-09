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

  // Update Params - direct .value assignment works for Tone.Signal params
  // This ensures Anchor To Current can read the correct values
  useEffect(() => {
    const node = filter.current;
    if (!node) return;
    // Frequency (Tone.Param-like) if present
    const freqParam = (node as unknown as { frequency?: { value: number } }).frequency;
    if (freqParam) {
      freqParam.value = frequency;
    }
    // Q (Tone.Param-like) if present
    const qParam = (node as unknown as { Q?: { value: number } }).Q;
    if (qParam) {
      qParam.value = Q;
    }
    // Type (property) if present
    if ("type" in node) {
      (node as unknown as { type: BiquadFilterType }).type = type;
    }
  }, [filter, frequency, Q, type]);

  // rolloff can't go via the set method or it makes the filter stutter and glitch, but this works
  useEffect(() => {
    const node = filter.current;
    if (!node) return;
    if ("rolloff" in node) {
      (node as unknown as { rolloff: Tone.FilterRollOff }).rolloff = rolloff;
    }
  }, [filter, rolloff]);

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
