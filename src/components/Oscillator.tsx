import { useEffect, useState } from "react";
import * as Tone from "tone";
import Slider from "./Slider";
import WaveformSelector from "./WaveformSelector";

interface OscillatorProps {
  minFreq: number;
  maxFreq: number;
}

function Oscillator({ minFreq, maxFreq }: OscillatorProps) {
  // a Tone.Oscillator and its property
  const [osc, setOsc] = useState<Tone.Oscillator | undefined>();
  const [frequency, setFrequency] = useState(minFreq);
  const [waveform, setWaveform] = useState("sine");

  // a Tone.Channel and its properties
  const [channel, setChannel] = useState<Tone.Channel | undefined>();
  const [volume, setVolume] = useState(-20);
  const [pan, setPan] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const o = new Tone.Oscillator(
      frequency,
      waveform as Tone.ToneOscillatorType
    );
    setOsc(o);

    const c = new Tone.Channel(volume, 0).toDestination();
    setChannel(c);

    o.connect(c);

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ensure the frequency is within the min and max range
  if (frequency < minFreq) {
    setFrequency(minFreq);
  } else if (frequency > maxFreq) {
    setFrequency(maxFreq);
  }

  // update channel properties with state changes
  if (channel !== undefined) {
    channel.volume.setTargetAtTime(volume, 0, 0.01);
    channel && channel.pan.setTargetAtTime(pan, 0, 0.01);
  }

  // update osc properties with state changes
  if (osc !== undefined) {
    osc && osc.frequency.setValueAtTime(frequency, 0.1);
    osc && (osc.type = waveform as Tone.ToneOscillatorType);
  }

  return (
    <div>
      <Slider
        inputName="frequency"
        min={minFreq}
        max={maxFreq}
        value={frequency}
        handleChange={(e) => setFrequency(parseFloat(e.target.value))}
      />
      <Slider
        inputName="volume"
        min={-80}
        max={0}
        value={volume}
        handleChange={(e) => setVolume(parseFloat(e.target.value))}
      />
      <Slider
        inputName="pan"
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
