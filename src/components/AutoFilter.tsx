import * as Tone from "tone";

import Slider from "./Slider";

import { useEffect, useState, useImperativeHandle, useRef } from "react";
import OptionsSelector from "./OptionsSelector";
import { AutoFilterHandle, AutoFilterParams } from "../types/AutoFilterParams";
import { useRampedParameter } from "../hooks/useRampedParameter";
import { StandardWaveformType } from "../types/OscillatorParams";

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
  const [oscillatorType, setOscillatorType] = useState<StandardWaveformType>("sine");

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

  // Smooth ramped parameter updates (prevents clicking)
  // Type assertions needed for AutoFilter's Frequency types
  const baseFrequencyRamped = useRampedParameter(
    filter.current?.baseFrequency as unknown as { rampTo: (value: number, rampTime: number) => void } | undefined,
    onParameterChange
  );
  const depthRamped = useRampedParameter(filter.current?.depth, onParameterChange);
  const frequencyRamped = useRampedParameter(
    filter.current?.frequency as unknown as { rampTo: (value: number, rampTime: number) => void } | undefined,
    onParameterChange
  );
  const qRamped = useRampedParameter(filter.current?.filter.Q, onParameterChange);
  const wetRamped = useRampedParameter(filter.current?.wet, onParameterChange);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getParams: (): AutoFilterParams => paramsRef.current,
    setParams: (params: AutoFilterParams) => {
      // Apply audio parameters with smooth ramping (prevents clicks on preset load)
      baseFrequencyRamped.rampTo(params.baseFrequency);
      depthRamped.rampTo(params.depth);
      frequencyRamped.rampTo(params.frequency);
      qRamped.rampTo(params.Q);
      wetRamped.rampTo(params.wet);
      // Update React state for UI
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

  // Apply initial parameter values on mount
  useEffect(() => {
    baseFrequencyRamped.rampTo(baseFrequency);
    depthRamped.rampTo(depth);
    frequencyRamped.rampTo(frequency);
    qRamped.rampTo(Q);
    wetRamped.rampTo(wet);
  }, []); // Empty deps - only run on mount

  // Update properties that can't be ramped (non-AudioParams)
  useEffect(() => {
    if (filter.current) {
      filter.current.filter.type = type;
      filter.current.type = oscillatorType;
      filter.current.filter.rolloff = rolloff;
    }
  }, [filter, type, oscillatorType, rolloff]);

  return (
    <div className="sm:place-items-center sm:border-2 sm:rounded sm:border-pink-500 dark:sm:border-sky-300 p-5">
      <div className="col-span-full mb-1 text-center">Filter</div>
      <Slider
        inputName="baseFrequency"
        min={30}
        max={7000}
        value={baseFrequency}
        labelText="Base Freq"
        step={1}
        handleChange={(e) => {
          const newBaseFrequency = parseFloat(e.target.value);
          baseFrequencyRamped.rampTo(newBaseFrequency); // Smooth audio update
          setBaseFrequency(newBaseFrequency); // UI state update
          baseFrequencyRamped.markModified(); // Debounced preset marking
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
      <Slider
        inputName="depth"
        min={0}
        max={1}
        value={depth}
        labelText="Depth"
        step={0.01}
        handleChange={(e) => {
          const newDepth = parseFloat(e.target.value);
          depthRamped.rampTo(newDepth); // Smooth audio update
          setDepth(newDepth); // UI state update
          depthRamped.markModified(); // Debounced preset marking
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
          const newWet = parseFloat(e.target.value);
          wetRamped.rampTo(newWet); // Smooth audio update
          setWet(newWet); // UI state update
          wetRamped.markModified(); // Debounced preset marking
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
        <OptionsSelector<StandardWaveformType>
          handleChange={(e) => {
            setOscillatorType(e.target.value as StandardWaveformType);
            onParameterChange?.();
          }}
          value={oscillatorType}
          options={["sine", "square", "triangle", "sawtooth"]}
          useDropdownOnSmall={true}
          label="Wave"
        />
      </div>
    </div>
  );
}

export default AutoFilter;
