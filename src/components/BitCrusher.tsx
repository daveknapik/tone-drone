import * as Tone from "tone";

import Slider from "./Slider";

import { useState, useImperativeHandle, useRef, useEffect } from "react";
import { BitCrusherHandle, BitCrusherParams } from "../types/BitCrusherParams";

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

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getParams: (): BitCrusherParams => paramsRef.current,
    setParams: (params: BitCrusherParams) => {
      setBits(params.bits);
      setWet(params.wet);
    },
  }));

  bitCrusher.current.set({
    bits,
    wet,
  });

  return (
    <div className="place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
      <div className="col-span-full mb-1">Bitcrusher</div>
      <Slider
        inputName="bits"
        min={2}
        max={8}
        value={bits}
        labelText="Bits"
        handleChange={(e) => {
          setBits(parseFloat(e.target.value));
          onParameterChange?.();
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

export default BitCrusher;
