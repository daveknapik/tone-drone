import * as Tone from "tone";

import Slider from "./Slider";

import { useState, useImperativeHandle, useRef, useEffect } from "react";
import { ReverbHandle, ReverbParams } from "../types/ReverbParams";

interface ReverbProps {
  reverb: React.RefObject<Tone.Reverb>;
  label?: string;
  ref?: React.Ref<ReverbHandle>;
  onParameterChange?: () => void;
  isReady?: boolean;
}

function Reverb({
  reverb,
  label = "Reverb",
  ref,
  onParameterChange,
  isReady,
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
      if (!params) return; // Guard against undefined params
      setDecay(params.decay);
      setPreDelay(params.preDelay);
      setWet(params.wet);
      // Apply params to reverb instance
      reverb.current.set({ wet: params.wet });
      reverb.current.decay = params.decay;
      reverb.current.preDelay = params.preDelay;
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

  // Apply current UI params when the reverb instance becomes ready
  useEffect(() => {
    if (isReady && reverb.current) {
      // Set wet via .set() to avoid conflicts with modulation
      reverb.current.set({ wet });
      // Apply decay/preDelay which may regenerate IR
      reverb.current.decay = decay;
      reverb.current.preDelay = preDelay;
    }
  }, [isReady, reverb, decay, preDelay, wet]);

  return (
    <div className="sm:place-items-center sm:border-2 sm:rounded sm:border-pink-500 dark:sm:border-sky-300 p-5">
      <div className="col-span-full mb-1 text-center">
        {label}
        {!isReady && (
          <span className="ml-2 text-xs opacity-60">(initializing...)</span>
        )}
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
          void handleDecayChange(parseFloat(e.target.value));
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
          void handlePreDelayChange(parseFloat(e.target.value));
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
          const newWet = parseFloat(e.target.value);
          setWet(newWet);
          reverb.current.set({ wet: newWet });
          onParameterChange?.();
        }}
      />
    </div>
  );
}

export default Reverb;
