import * as Tone from "tone";

import Slider from "./Slider";

import { useState } from "react";

interface ChebyshevProps {
  chebyshev: React.RefObject<Tone.Chebyshev>;
}

function Chebyshev({ chebyshev }: ChebyshevProps) {
  const [order, setOrder] = useState(1);
  const [wet, setWet] = useState(0);

  chebyshev.current.set({
    order,
    wet,
  });

  return (
    <div className="place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
      <div className="col-span-full mb-1">Chebyshev</div>
      <Slider
        handleChange={(e) => setOrder(parseInt(e.target.value))}
        inputName="order"
        labelText="Order"
        max={100}
        min={1}
        value={order}
      />
      <Slider
        handleChange={(e) => setWet(parseFloat(e.target.value))}
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
