import * as Tone from "tone";

import Slider from "./Slider";
import OptionsSelector from "./OptionsSelector";

import { useState } from "react";

import { useAudioContext } from "../hooks/useAudioContext";

interface PolysynthProps {
  polySynth: Tone.PolySynth;
}

function PolySynth({ polySynth }: PolysynthProps) {
  const [frequency, setFrequency] = useState(666);
  const [waveform, setWaveform] = useState<OscillatorType>("sine");
  const [volume, setVolume] = useState(-5);
  const [attack, setAttack] = useState(0.5);
  const [decay, setDecay] = useState(0.7);
  const [sustain, setSustain] = useState(1);
  const [release, setRelease] = useState(1);

  const { handleBrowserAudioStart } = useAudioContext();

  polySynth.volume.setTargetAtTime(volume, 0, 0.01);

  const playNote = (): void => {
    void handleBrowserAudioStart();
    polySynth.triggerAttackRelease(frequency, release);
  };

  polySynth.set({
    oscillator: { type: waveform },
    envelope: {
      attack,
      attackCurve: "linear",
      decay,
      decayCurve: "linear",
      release,
      releaseCurve: "linear",
      sustain,
    },
  });

  return (
    <div>
      <Slider
        inputName="volume"
        labelText="Volume"
        min={-80}
        max={0}
        value={volume}
        handleChange={(e) => setVolume(parseFloat(e.target.value))}
      />
      <Slider
        inputName="frequency"
        labelText="Freq (Hz)"
        min={30}
        max={7000}
        value={frequency}
        handleChange={(e) => setFrequency(parseFloat(e.target.value))}
      />
      <Slider
        inputName="attack"
        min={0}
        max={2}
        step={0.01}
        value={attack}
        handleChange={(e) => setAttack(parseFloat(e.target.value))}
      />
      <Slider
        inputName="decay"
        min={0}
        max={1}
        step={0.01}
        value={decay}
        handleChange={(e) => setDecay(parseFloat(e.target.value))}
      />
      <Slider
        inputName="sustain"
        min={0}
        max={1}
        step={0.01}
        value={sustain}
        handleChange={(e) => setSustain(parseFloat(e.target.value))}
      />
      <Slider
        inputName="release"
        min={0}
        max={60}
        step={0.01}
        value={release}
        handleChange={(e) => setRelease(parseFloat(e.target.value))}
      />
      <OptionsSelector<OscillatorType>
        handleChange={(e) => setWaveform(e.target.value as OscillatorType)}
        value={waveform}
        options={["sine", "square", "triangle", "sawtooth"]}
      />
      <div className="text-center">
        <button onClick={playNote}>Play Note</button>
      </div>
    </div>
  );
}

export default PolySynth;
