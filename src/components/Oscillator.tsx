import { useState } from "react";
import * as Tone from "tone";
import Slider from "./Slider";
import WaveformSelector from "./WaveformSelector";

interface OscillatorProps {
  minFreq: number;
  maxFreq: number;
  oscillator: Tone.Oscillator;
  channel: Tone.Channel;
}

function Oscillator({
  minFreq,
  maxFreq,
  oscillator,
  channel,
}: OscillatorProps) {
  // Tone.Oscillator properties
  const [frequency, setFrequency] = useState(minFreq);
  const [waveform, setWaveform] = useState("sine");

  // Tone.Channel properties
  const [volume, setVolume] = useState(-20);
  const [pan, setPan] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);

  const toggleAudio = (): void => {
    if (isPlaying) {
      oscillator?.stop();
      setIsPlaying(false);
    } else {
      oscillator?.start();
      setIsPlaying(true);
    }
  };

  // ensure the frequency is within the min and max range
  if (frequency < minFreq) {
    setFrequency(minFreq);
  } else if (frequency > maxFreq) {
    setFrequency(maxFreq);
  }

  // update channel properties with state changes
  channel?.volume.setTargetAtTime(volume, 0, 0.01);
  channel?.pan.setTargetAtTime(pan, 0, 0.01);

  // update osc properties with state changes
  oscillator.frequency.setValueAtTime(frequency, 0.1);
  oscillator.type = waveform as Tone.ToneOscillatorType;

  return (
    <div>
      <Slider
        inputName="frequency"
        labelText="Freq (Hz)"
        min={minFreq}
        max={maxFreq}
        value={frequency}
        handleChange={(e) => setFrequency(parseFloat(e.target.value))}
      />
      <Slider
        inputName="volume"
        labelText="Volume"
        min={-80}
        max={0}
        value={volume}
        handleChange={(e) => setVolume(parseFloat(e.target.value))}
      />
      <Slider
        inputName="pan"
        labelText="Pan"
        min={-1}
        max={1}
        value={pan}
        step={0.01}
        handleChange={(e) => setPan(parseFloat(e.target.value))}
      />
      <WaveformSelector
        handleChange={(e) => setWaveform(e.target.value)}
        value={waveform}
        waveforms={["sine", "square", "triangle", "sawtooth"]}
      />
      <div className="text-center">
        <button onClick={toggleAudio}>{isPlaying ? "Stop" : "Start"}</button>
      </div>
    </div>
  );
}

export default Oscillator;
