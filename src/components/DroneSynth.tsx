import Oscillator from "./Oscillator";

interface DroneSynthProps {
  oscillatorCount: number;
}

function DroneSynth({ oscillatorCount }: DroneSynthProps) {
  const oscillators = Array.from({ length: oscillatorCount }, (_, index) => (
    <Oscillator key={index} />
  ));

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 place-items-center">
      {oscillators}
    </div>
  );
}

export default DroneSynth;
