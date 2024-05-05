import DroneSynth from "./components/DroneSynth";
import * as Tone from "tone";

function App() {
  const start = async () => {
    try {
      await Tone.start();
    } finally {
      console.log("started");
    }
  };

  return (
    <div>
      <div className="my-5 ml-5">
        <button onClick={start}>Power On</button>
      </div>
      <div>
        <DroneSynth oscillatorCount={6} />
      </div>
    </div>
  );
}

export default App;
