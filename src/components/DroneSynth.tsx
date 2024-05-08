import { useState } from "react";
import Oscillator from "./Oscillator";

function DroneSynth() {
  const [oscillatorCount, setOscillatorCount] = useState(6);

  const oscillators = Array.from({ length: oscillatorCount }, (_, index) => (
    <Oscillator key={index} freqMax={454} />
  ));

  const addOscillator = (): void => {
    setOscillatorCount((prev) => prev + 1);
  };

  return (
    <div className="border-2 rounded">
      <div className="grid grid-cols-2">
        <div className="justify-self-start pt-2 pl-3">Drone Synth</div>
        <div className="justify-self-end pt-2 pr-3">
          <button onClick={addOscillator}>+</button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 my-5 place-items-center">
        {oscillators}
      </div>
    </div>
  );
}

export default DroneSynth;
