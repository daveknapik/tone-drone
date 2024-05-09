import Oscillator from "./Oscillator";
import { useState } from "react";

function DroneSynth() {
  const [oscillatorCount, setOscillatorCount] = useState(6);
  const [minFreq, setMinFreq] = useState(440);
  const [maxFreq, setMaxFreq] = useState(454);

  const oscillators = Array.from({ length: oscillatorCount }, (_, index) => (
    <Oscillator key={index} minFreq={minFreq} maxFreq={maxFreq} />
  ));

  const addOscillator = (): void => {
    setOscillatorCount((prev) => prev + 1);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const min = Number(formData.get("minFreq"));
    const max = Number(formData.get("maxFreq"));

    if (min && max) {
      if (min > max) {
        setMinFreq(min);
        setMaxFreq(min + 10);
      } else {
        setMinFreq(min);
        setMaxFreq(max);
      }
    }
  };

  return (
    <div className="dark:text-sky-300">
      <div className="border-2 rounded pt-2 px-3">
        <div className="grid grid-cols-2">
          <div className="justify-self-start">Drone Synth</div>
          <div className="justify-self-end">
            <button onClick={addOscillator}>+</button>
          </div>
        </div>
        <div className="dark:text-green-700">
          <form onSubmit={handleFormSubmit}>
            <input name="minFreq" type="number" />
            <input name="maxFreq" type="number" />
            <input type="submit" name="Submit" />
          </form>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 my-5 place-items-center">
          {oscillators}
        </div>
      </div>
    </div>
  );
}
export default DroneSynth;
