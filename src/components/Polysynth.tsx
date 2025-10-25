import * as Tone from "tone";

import Button from "./Button";
import Slider from "./Slider";
import OptionsSelector from "./OptionsSelector";

import { useState, useImperativeHandle, useRef, useEffect } from "react";

import { useAudioContext } from "../hooks/useAudioContext";
import { useKeyDown } from "../hooks/useKeyDown";
import { PolySynthHandle, PolySynthParams } from "../types/PolySynthParams";

interface PolysynthProps {
  polySynth: Tone.PolySynth;
  panner: Tone.Panner;
  keyboardShortcuts: string[];
  initialParams?: PolySynthParams;
  ref?: React.Ref<PolySynthHandle>;
  onParameterChange?: () => void;
}

function PolySynth({
  polySynth,
  panner,
  keyboardShortcuts,
  initialParams,
  ref,
  onParameterChange,
}: PolysynthProps) {
  const [frequency, setFrequency] = useState(initialParams?.frequency ?? 666);
  const [waveform, setWaveform] = useState<OscillatorType>(
    initialParams?.waveform ?? "sine"
  );
  const [volume, setVolume] = useState(initialParams?.volume ?? -5);
  const [pan, setPan] = useState(initialParams?.pan ?? 0);
  const [attack, setAttack] = useState(initialParams?.attack ?? 0.5);
  const [decay, setDecay] = useState(initialParams?.decay ?? 0.7);
  const [sustain, setSustain] = useState(initialParams?.sustain ?? 1);
  const [release, setRelease] = useState(initialParams?.release ?? 3);

  const { handleBrowserAudioStart } = useAudioContext();

  // Keep a ref with current state values for imperative access
  const paramsRef = useRef<PolySynthParams>({
    frequency,
    waveform,
    volume,
    pan,
    attack,
    decay,
    sustain,
    release,
  });

  // Update ref whenever state changes
  useEffect(() => {
    paramsRef.current = {
      frequency,
      waveform,
      volume,
      pan,
      attack,
      decay,
      sustain,
      release,
    };
  }, [frequency, waveform, volume, pan, attack, decay, sustain, release]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getParams: (): PolySynthParams => paramsRef.current,
    setParams: (params: PolySynthParams) => {
      setFrequency(params.frequency);
      setWaveform(params.waveform);
      setVolume(params.volume);
      setPan(params.pan);
      setAttack(params.attack);
      setDecay(params.decay);
      setSustain(params.sustain);
      setRelease(params.release);
    },
  }));

  polySynth.volume.setTargetAtTime(volume, 0, 0.01);
  panner.pan.setTargetAtTime(pan, 0, 0.01);

  const playNote = (): void => {
    void handleBrowserAudioStart();
    polySynth.triggerAttackRelease(frequency, release);
  };

  // Keyboard shortcut to play note
  useKeyDown(() => {
    playNote();
  }, keyboardShortcuts);

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
        step={0.01}
        logarithmic={true}
        value={volume}
        handleChange={(e) => {
          setVolume(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
      <Slider
        inputName="pan"
        labelText="Pan"
        min={-1}
        max={1}
        step={0.01}
        value={pan}
        handleChange={(e) => {
          setPan(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
      <Slider
        inputName="frequency"
        labelText="Freq (Hz)"
        min={30}
        max={7000}
        value={frequency}
        handleChange={(e) => {
          setFrequency(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
      <Slider
        inputName="attack"
        labelText="Attack"
        min={0}
        max={2}
        step={0.01}
        value={attack}
        handleChange={(e) => {
          setAttack(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
      <Slider
        inputName="decay"
        labelText="Decay"
        min={0}
        max={1}
        step={0.01}
        value={decay}
        handleChange={(e) => {
          setDecay(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
      <Slider
        inputName="sustain"
        labelText="Sustain"
        min={0}
        max={1}
        step={0.01}
        value={sustain}
        handleChange={(e) => {
          setSustain(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
      <Slider
        inputName="release"
        labelText="Release"
        min={0}
        max={15}
        step={0.01}
        value={release}
        handleChange={(e) => {
          setRelease(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
      <OptionsSelector<OscillatorType>
        handleChange={(e) => {
          setWaveform(e.target.value as OscillatorType);
          onParameterChange?.();
        }}
        value={waveform}
        options={["sine", "square", "triangle", "sawtooth"]}
      />
      <div className="text-center mt-2">
        <Button handleClick={playNote}>Play Note</Button>
      </div>
    </div>
  );
}

export default PolySynth;
