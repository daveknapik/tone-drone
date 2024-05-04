import { useState } from "react";
import Oscillator from "./components/Oscillator";
import * as Tone from "tone";

function App() {
  const [frequency, setFrequency] = useState(440);

  const start = async () => {
    try {
      await Tone.start();
    } finally {
      console.log("started");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFrequency(parseFloat(event.target.value));
  };

  return (
    <div className="App">
      <div>
        <button onClick={start}>Power On</button>
      </div>
      <Oscillator frequency={frequency} onChange={handleChange} />
    </div>
  );
}

export default App;
