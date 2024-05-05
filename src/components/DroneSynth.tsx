import Oscillator from "./Oscillator";

interface DroneSynthProps {
  oscillatorCount: number;
}

function DroneSynth({ oscillatorCount }: DroneSynthProps) {
  const oscillators = Array.from({ length: oscillatorCount }, (_, index) => (
    <Oscillator key={index} freqMax={454} />
  ));

  return (
    <div className="border-2 rounded">
      <div className="my-5 ml-5">Drone Synth</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 place-items-center">
        {oscillators}
      </div>
    </div>
  );
}

export default DroneSynth;
