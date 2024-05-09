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
      <div className="border-2 rounded border-pink-500 dark:border-sky-300 pt-2 px-3">
        <div className="grid grid-cols-2 gap-y-3 sm:grid-cols-6">
          <div className="col-span-1">Drone Synth</div>
          <div className="col-start-7">
            <button onClick={addOscillator}>+</button>
          </div>
          <form className="col-span-6" onSubmit={handleFormSubmit}>
            <input
              className="w-20 mr-2 rounded-md border-0 px-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              name="minFreq"
              type="number"
            />
            <input
              className="w-20 mr-2 rounded-md border-0 px-1 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              name="maxFreq"
              type="number"
            />
            <input
              className="rounded-md bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              type="submit"
              value="freq!"
            />
          </form>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 my-5 place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
          {oscillators}
        </div>
      </div>
    </div>
  );
}
export default DroneSynth;
