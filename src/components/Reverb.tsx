import * as Tone from "tone";

import Slider from "./Slider";

import { useState, useImperativeHandle, useRef, useEffect } from "react";
import { ReverbHandle, ReverbParams } from "../types/ReverbParams";

interface ReverbProps {
  reverb: React.RefObject<Tone.Reverb>;
  label?: string;
  ref?: React.Ref<ReverbHandle>;
  onParameterChange?: () => void;
}

function Reverb({
  reverb,
  label = "Reverb",
  ref,
  onParameterChange,
}: ReverbProps) {
  const [decay, setDecay] = useState(2.5);
  const [preDelay, setPreDelay] = useState(0.01);
  const [wet, setWet] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Keep a ref with current state values for imperative access
  const paramsRef = useRef<ReverbParams>({
    decay,
    preDelay,
    wet,
  });

  // Update ref whenever state changes
  useEffect(() => {
    paramsRef.current = {
      decay,
      preDelay,
      wet,
    };
  }, [decay, preDelay, wet]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getParams: (): ReverbParams => paramsRef.current,
    setParams: (params: ReverbParams) => {
      setDecay(params.decay);
      setPreDelay(params.preDelay);
      setWet(params.wet);
    },
  }));

  // Handle decay changes with async IR regeneration
  const handleDecayChange = async (newDecay: number) => {
    setDecay(newDecay);
    setIsUpdating(true);
    reverb.current.decay = newDecay;
    await reverb.current.ready;
    setIsUpdating(false);
    onParameterChange?.();
  };

  // Handle preDelay changes with async IR regeneration
  const handlePreDelayChange = async (newPreDelay: number) => {
    setPreDelay(newPreDelay);
    setIsUpdating(true);
    reverb.current.preDelay = newPreDelay;
    await reverb.current.ready;
    setIsUpdating(false);
    onParameterChange?.();
  };

  // Only update wet via .set() to avoid conflicts with modulation
  // (decay/preDelay handled separately due to async IR generation)
  reverb.current.set({ wet });

  return (
    <div className="sm:place-items-center sm:border-2 sm:rounded sm:border-pink-500 dark:sm:border-sky-300 p-5">
      <div className="col-span-full mb-1 text-center">
        {label}
        {isUpdating && (
          <span className="ml-2 text-xs opacity-60">(updating...)</span>
        )}
      </div>
      <Slider
        inputName="decay"
        min={0.1}
        max={10}
        value={decay}
        labelText="Decay"
        step={0.1}
        handleChange={(e) => {
          handleDecayChange(parseFloat(e.target.value));
        }}
      />
      <Slider
        inputName="preDelay"
        min={0}
        max={0.1}
        value={preDelay}
        labelText="Pre-Delay"
        step={0.001}
        handleChange={(e) => {
          handlePreDelayChange(parseFloat(e.target.value));
        }}
      />
      <Slider
        inputName="wet"
        min={0}
        max={1}
        value={wet}
        step={0.01}
        labelText="Dry / Wet"
        handleChange={(e) => {
          setWet(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
    </div>
  );
}

export default Reverb;
