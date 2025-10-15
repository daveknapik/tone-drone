import * as Tone from "tone";
import Button from "./Button";
import Sequencer from "./Sequencer";
import Slider from "./Slider";
import OptionsSelector from "./OptionsSelector";
import { Sequence } from "../types/Sequence";

import { useState, useImperativeHandle, useRef, useEffect } from "react";

import { useAudioContext } from "../hooks/useAudioContext";
import { useKeyDown } from "../hooks/useKeyDown";
import { OscillatorHandle, OscillatorParams } from "../types/OscillatorParams";

interface OscillatorProps {
  channel: Tone.Channel;
  currentBeat: number;
  handleStepClick: (sequenceIndex: number, stepIndex: number) => void;
  maxFreq: number;
  minFreq: number;
  oscillator: Tone.Oscillator;
  panner: Tone.Panner;
  playPauseKey: string;
  sequence: Sequence;
  sequenceIndex: number;
  synth: Tone.Synth;
  updateSequenceFrequency: (sequenceIndex: number, frequency: number) => void;
  ref?: React.Ref<OscillatorHandle>;
  onParameterChange?: () => void;
}

function Oscillator({
  channel,
  currentBeat,
  handleStepClick,
  maxFreq,
  minFreq,
  oscillator,
  panner,
  playPauseKey,
  sequence,
  sequenceIndex,
  synth,
  updateSequenceFrequency,
  ref,
  onParameterChange,
}: OscillatorProps) {
  // Tone.Oscillator properties
  const [frequency, setFrequency] = useState(minFreq);
  const [waveform, setWaveform] = useState("sine");

  // Tone.Channel properties
  const [volume, setVolume] = useState(-5);
  const [pan, setPan] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);

  // Keep a ref with current state values for imperative access
  const paramsRef = useRef<OscillatorParams>({
    frequency,
    waveform,
    volume,
    pan,
  });

  // Update ref whenever state changes
  useEffect(() => {
    paramsRef.current = {
      frequency,
      waveform,
      volume,
      pan,
    };
  }, [frequency, waveform, volume, pan]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getParams: (): OscillatorParams => paramsRef.current,
    setParams: (params: OscillatorParams) => {
      setFrequency(params.frequency);
      setWaveform(params.waveform);
      setVolume(params.volume);
      setPan(params.pan);
    },
  }));

  const { handleBrowserAudioStart } = useAudioContext();

  const toggleAudio = (): void => {
    void handleBrowserAudioStart();

    if (isPlaying) {
      oscillator?.stop();
      setIsPlaying(false);
    } else {
      oscillator?.start();
      setIsPlaying(true);
    }
  };

  useKeyDown(() => {
    toggleAudio();
  }, [playPauseKey]);

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

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFrequency = parseFloat(e.target.value);
    setFrequency(newFrequency); // sets the frequency on the oscillator
    synth.frequency.setValueAtTime(newFrequency, 0.1); // sets the frequency on the synth, enabling pitch changes whilst playing
    updateSequenceFrequency(sequenceIndex, newFrequency); // updates the sequence frequency so future notes in the sequence play at the new frequency
  };

  return (
    <div>
      <Slider
        inputName="frequency"
        labelText="Freq (Hz)"
        min={minFreq}
        max={maxFreq}
        step={0.01}
        value={frequency}
        handleChange={handleFrequencyChange}
      />
      <Slider
        inputName="volume"
        labelText="Volume"
        min={-80}
        max={0}
        value={volume}
        step={0.01}
        logarithmic={true}
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
        value={pan}
        step={0.01}
        handleChange={(e) => {
          setPan(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
      <div className="justify-between mt-1">
        <OptionsSelector<OscillatorType>
          handleChange={(e) => {
            setWaveform(e.target.value);
            onParameterChange?.();
          }}
          justifyBetween={true}
          options={["sine", "square", "triangle", "sawtooth"]}
          value={waveform}
        />
      </div>
      <div className="text-center mt-2">
        <Sequencer
          currentBeat={currentBeat}
          handleStepClick={handleStepClick}
          pan={pan}
          panner={panner}
          sequence={sequence}
          sequenceIndex={sequenceIndex}
          synth={synth}
          volume={volume}
          waveform={waveform}
        />
      </div>
      <div className="text-center mt-2">
        <Button handleClick={toggleAudio} isActive={isPlaying}>
          {isPlaying ? "Stop" : "Start"}
        </Button>
      </div>
    </div>
  );
}

export default Oscillator;
