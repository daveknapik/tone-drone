import * as Tone from "tone";

import Slider from "./Slider";

import { useState, useImperativeHandle, useRef, useEffect } from "react";
import { BitCrusherHandle, BitCrusherParams } from "../types/BitCrusherParams";
import { useRampedParameter } from "../hooks/useRampedParameter";

interface BitCrusherProps {
  bitCrusher: React.RefObject<Tone.BitCrusher>;
  ref?: React.Ref<BitCrusherHandle>;
  onParameterChange?: () => void;
}

function BitCrusher({ bitCrusher, ref, onParameterChange }: BitCrusherProps) {
  const [bits, setBits] = useState(5);
  const [wet, setWet] = useState(0);

  // Keep a ref with current state values for imperative access
  const paramsRef = useRef<BitCrusherParams>({
    bits,
    wet,
  });

  // Update ref whenever state changes
  useEffect(() => {
    paramsRef.current = {
      bits,
      wet,
    };
  }, [bits, wet]);

  // Smooth ramped parameter updates (prevents clicking)
  // Note: bits is not an AudioParam, so it's set directly via useEffect
  const wetRamped = useRampedParameter(
    bitCrusher.current?.wet,
    onParameterChange
  );

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getParams: (): BitCrusherParams => paramsRef.current,
    setParams: (params: BitCrusherParams) => {
      // Apply wet with smooth ramping (prevents clicks on preset load)
      wetRamped.rampTo(params.wet);
      // Update React state for UI
      setBits(params.bits);
      setWet(params.wet);
    },
  }));

  // Apply initial wet value on mount
  useEffect(() => {
    wetRamped.rampTo(wet);
  }, []); // Empty deps - only run on mount

  // Update bits via set() method (not an AudioParam, can't be ramped)
  useEffect(() => {
    if (bitCrusher.current) {
      bitCrusher.current.set({ bits });
    }
  }, [bitCrusher, bits]);

  return (
    <div className="sm:place-items-center sm:border-2 sm:rounded sm:border-pink-500 dark:sm:border-sky-300 p-5">
      <div className="col-span-full mb-1 text-center">Bitcrusher</div>
      <Slider
        inputName="bits"
        min={2}
        max={8}
        value={bits}
        labelText="Bits"
        handleChange={(e) => {
          const newBits = parseFloat(e.target.value);
          setBits(newBits); // UI state update (useEffect handles Tone.js)
          onParameterChange?.(); // Mark preset modified
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
          wetRamped.rampTo(newWet); // Smooth audio update
          setWet(newWet); // UI state update
          wetRamped.markModified(); // Debounced preset marking
        }}
      />
    </div>
  );
}

export default BitCrusher;
