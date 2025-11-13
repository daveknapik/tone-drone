import * as Tone from "tone";

import Slider from "./Slider";

import { useState, useImperativeHandle, useRef, useEffect } from "react";
import { ChebyshevHandle, ChebyshevParams } from "../types/ChebyshevParams";
import { useRampedParameter } from "../hooks/useRampedParameter";

interface ChebyshevProps {
  chebyshev: React.RefObject<Tone.Chebyshev>;
  ref?: React.Ref<ChebyshevHandle>;
  onParameterChange?: () => void;
}

function Chebyshev({ chebyshev, ref, onParameterChange }: ChebyshevProps) {
  const [order, setOrder] = useState(1);
  const [wet, setWet] = useState(0);

  // Keep a ref with current state values for imperative access
  const paramsRef = useRef<ChebyshevParams>({
    order,
    wet,
  });

  // Update ref whenever state changes
  useEffect(() => {
    paramsRef.current = {
      order,
      wet,
    };
  }, [order, wet]);

  // Smooth ramped parameter updates (prevents clicking)
  // Note: order is not an AudioParam, so it's set directly via useEffect
  const wetRamped = useRampedParameter(
    chebyshev.current?.wet,
    onParameterChange
  );

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getParams: (): ChebyshevParams => paramsRef.current,
    setParams: (params: ChebyshevParams) => {
      // Apply wet with smooth ramping (prevents clicks on preset load)
      wetRamped.rampTo(params.wet);
      // Update React state for UI
      setOrder(params.order);
      setWet(params.wet);
    },
  }));

  // Apply initial wet value on mount
  useEffect(() => {
    wetRamped.rampTo(wet);
  }, []); // Empty deps - only run on mount

  // Update order directly (not an AudioParam, can't be ramped)
  useEffect(() => {
    if (chebyshev.current) {
      chebyshev.current.order = order;
    }
  }, [chebyshev, order]);

  return (
    <div className="sm:place-items-center sm:border-2 sm:rounded sm:border-pink-500 dark:sm:border-sky-300 p-5">
      <div className="col-span-full mb-1 text-center">Chebyshev</div>
      <Slider
        handleChange={(e) => {
          const newOrder = parseInt(e.target.value);
          setOrder(newOrder); // UI state update (useEffect handles Tone.js)
          onParameterChange?.(); // Mark preset modified
        }}
        inputName="order"
        labelText="Order"
        max={100}
        min={1}
        value={order}
      />
      <Slider
        handleChange={(e) => {
          const newWet = parseFloat(e.target.value);
          wetRamped.rampTo(newWet); // Smooth audio update
          setWet(newWet); // UI state update
          wetRamped.markModified(); // Debounced preset marking
        }}
        inputName="wet"
        labelText="Dry / Wet"
        max={1}
        min={0}
        step={0.01}
        value={wet}
      />
    </div>
  );
}

export default Chebyshev;
