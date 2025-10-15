import * as Tone from "tone";

import Slider from "./Slider";

import { useState, useImperativeHandle, useRef, useEffect } from "react";
import { ChebyshevHandle, ChebyshevParams } from "../types/ChebyshevParams";

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

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getParams: (): ChebyshevParams => paramsRef.current,
    setParams: (params: ChebyshevParams) => {
      setOrder(params.order);
      setWet(params.wet);
    },
  }));

  chebyshev.current.set({
    order,
    wet,
  });

  return (
    <div className="place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
      <div className="col-span-full mb-1">Chebyshev</div>
      <Slider
        handleChange={(e) => {
          setOrder(parseInt(e.target.value));
          onParameterChange?.();
        }}
        inputName="order"
        labelText="Order"
        max={100}
        min={1}
        value={order}
      />
      <Slider
        handleChange={(e) => {
          setWet(parseFloat(e.target.value));
          onParameterChange?.();
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
