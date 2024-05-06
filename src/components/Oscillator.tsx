import { useId, useEffect, useState } from "react";
import * as Tone from "tone";

interface OscillatorProps {
  freqMin?: number;
  freqMax?: number;
}

function Oscillator({ freqMin = 440, freqMax = 880 }: OscillatorProps) {
  // a Tone.Oscillator and its property
  const [osc, setOsc] = useState<Tone.Oscillator | undefined>();
  const [frequency, setFrequency] = useState(440);
  const [waveform, setWaveform] = useState("sine");

  // a Tone.Channel and its properties
  const [channel, setChannel] = useState<Tone.Channel | undefined>();
  const [volume, setVolume] = useState(-20);
  const [pan, setPan] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);

  const id = useId();

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

  // update volume on the channel
  useEffect(() => {
    channel && channel.volume.setTargetAtTime(volume, 0, 0.01);
  }, [channel, volume]);

  // update pan on the channel
  useEffect(() => {
    channel && channel.pan.setTargetAtTime(pan, 0, 0.01);
  }, [channel, pan]);

  // update frequency on the osc
  useEffect(() => {
    osc && osc.frequency.setValueAtTime(frequency, 0.1);
  }, [osc, frequency]);

  // update waveform on the osc
  useEffect(() => {
    osc && (osc.type = waveform as Tone.ToneOscillatorType);
  }, [osc, waveform]);

  const toggleAudio = (): void => {
    if (isPlaying) {
      osc?.stop();
      setIsPlaying(false);
    } else {
      osc?.start();
      setIsPlaying(true);
    }
  };

  return (
    <div>
      <div className="flex items-center space-x-2">
        <label htmlFor="frequency">F</label>
        <input
          name="frequency"
          type="range"
          className="w-48"
          min={freqMin}
          max={freqMax}
          value={frequency}
          onChange={(e) => setFrequency(parseFloat(e.target.value))}
        />
        <div>{frequency}</div>
      </div>
      <div className="flex items-center space-x-2">
        <label htmlFor="volume">V</label>
        <input
          name="volume"
          type="range"
          className="w-48"
          min="-80"
          max="0"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
        />
        <div>{volume}</div>
      </div>
      <div className="flex items-center space-x-2">
        <label htmlFor="pan">P</label>
        <input
          name="pan"
          type="range"
          className="w-48"
          min="-1"
          max="1"
          value={pan}
          step="0.01"
          onChange={(e) => setPan(parseFloat(e.target.value))}
        />
        <div>{pan}</div>
      </div>
      <div className="flex items-center space-x-2">
        <input
          name={`waveform-${id}`}
          type="radio"
          id={`waveform-sine-${id}`}
          value="sine"
          checked={waveform === "sine"}
          onChange={(e) => setWaveform(e.target.value)}
        />
        <label htmlFor={`waveform-sine-${id}`}>Sine</label>

        <input
          name={`waveform-${id}`}
          type="radio"
          id={`waveform-square-${id}`}
          value="square"
          checked={waveform === "square"}
          onChange={(e) => setWaveform(e.target.value)}
        />
        <label htmlFor={`waveform-square-${id}`}>Square</label>

        <input
          name={`waveform-${id}`}
          type="radio"
          id={`waveform-triangle-${id}`}
          value="triangle"
          checked={waveform === "triangle"}
          onChange={(e) => setWaveform(e.target.value)}
        />
        <label htmlFor={`waveform-triangle-${id}`}>Triangle</label>

        <input
          name={`waveform-${id}`}
          type="radio"
          id={`waveform-sawtooth-${id}`}
          value="sawtooth"
          checked={waveform === "sawtooth"}
          onChange={(e) => setWaveform(e.target.value)}
        />
        <label htmlFor={`waveform-sawtooth-${id}`}>Saw</label>
      </div>
      <div className="text-center">
        <button onClick={toggleAudio}>{isPlaying ? "Stop" : "Start"}</button>
      </div>
    </div>
  );
}

export default Oscillator;
