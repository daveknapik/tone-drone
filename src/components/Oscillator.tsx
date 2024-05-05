import { useEffect, useState } from "react";
import * as Tone from "tone";

function Oscillator() {
  const [osc, setOsc] = useState<Tone.Oscillator | undefined>();
  const [channel, setChannel] = useState<Tone.Channel | undefined>();
  const [frequency, setFrequency] = useState(440);
  const [volume, setVolume] = useState(-20);
  const [pan, setPan] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const o = new Tone.Oscillator(frequency, "sine");
    setOsc(o);

    const c = new Tone.Channel(volume, 0).toDestination();
    setChannel(c);

    o.connect(c);
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

  return (
    <div>
      <div className="flex items-center space-x-2">
        <label htmlFor="frequency">F</label>
        <input
          name="frequency"
          type="range"
          min="440"
          max="880"
          value={frequency}
          onChange={(e) => {
            setFrequency(parseFloat(e.target.value));
            osc?.frequency.setValueAtTime(frequency, 0.1);
          }}
        />
      </div>
      <div className="flex items-center space-x-2">
        <label htmlFor="volume">V</label>
        <input
          name="volume"
          type="range"
          min="-80"
          max="0"
          value={volume}
          onChange={(e) => {
            setVolume(parseFloat(e.target.value));
            if (channel) {
              channel.volume.setTargetAtTime(volume, 0, 0.01);
            }
          }}
        />
      </div>
      <div className="flex items-center space-x-2">
        <label htmlFor="pan">P</label>
        <input
          name="pan"
          type="range"
          min="-1"
          max="1"
          value={pan}
          step="0.01"
          onChange={(e) => {
            setPan(parseFloat(e.target.value));
            if (channel) {
              channel.pan.setTargetAtTime(pan, 0, 0.01);
            }
          }}
        />
      </div>
      <div className="text-center">
        <button onClick={toggleAudio}>{isPlaying ? "Stop" : "Start"}</button>
      </div>
    </div>
  );
}

export default Oscillator;
