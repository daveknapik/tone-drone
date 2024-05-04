import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import * as Tone from "tone";

interface OscillatorProps {
  frequency: number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function Oscillator({ frequency, onChange }: OscillatorProps) {
  const [osc, setOsc] = useState<Tone.Oscillator | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setOsc(new Tone.Oscillator(660, "sine").toDestination());
  }, []);

  const toggleAudio = (): void => {
    if (isPlaying) {
      osc?.stop();
      setIsPlaying(false);
    } else {
      osc?.start();
      setIsPlaying(true);
    }
  };

  const updateOscillatorFrequency = () => {
    osc?.frequency.setValueAtTime(frequency, 0.1);
  };

  const debouncedUpdateOscillatorFrequency = useDebouncedCallback(
    updateOscillatorFrequency,
    10
  );

  return (
    <div className="App">
      <input
        type="range"
        min="440"
        max="880"
        value={frequency}
        onChange={(e) => {
          debouncedUpdateOscillatorFrequency();
          onChange(e);
        }}
      />
      <button onClick={toggleAudio}>Start / Stop</button>
    </div>
  );
}

export default Oscillator;
