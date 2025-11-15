import * as Tone from "tone";
import { useEffect } from "react";
import Step from "./Step";
import { Sequence } from "../types/Sequence";

interface SequencerProps {
  currentBeat: number;
  handleStepClick: (sequenceIndex: number, stepIndex: number) => void;
  pan: number;
  panner: Tone.Panner;
  sequence: Sequence;
  sequenceIndex: number;
  synth: Tone.PolySynth<Tone.Synth>;
  volume: number;
  waveform: string;
}

function Sequencer({
  currentBeat,
  handleStepClick,
  pan,
  panner,
  sequence,
  sequenceIndex,
  synth,
  volume,
  waveform,
}: SequencerProps) {
  // Update synth oscillator type only when waveform changes
  // Moving synth.set() out of render prevents clicks/glitches during playback
  useEffect(() => {
    // TypeScript can't properly infer synth.set oscillator type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    synth.set({ oscillator: { type: waveform as any } });
  }, [synth, waveform]);

  // Update volume and pan smoothly (setTargetAtTime is safe to call frequently)
  useEffect(() => {
    synth.volume.setTargetAtTime(volume, 0, 0.01);
  }, [synth, volume]);

  useEffect(() => {
    panner?.pan.setTargetAtTime(pan, 0, 0.01);
  }, [panner, pan]);

  return (
    <div className="grid grid-cols-8 gap-2">
      {sequence.steps.map((_step, i) => (
        <Step
          handleClick={() => handleStepClick(sequenceIndex, i)}
          isCurrentBeat={currentBeat === i}
          key={i}
          step={sequence.steps[i]}
          oscIndex={sequenceIndex}
          stepIndex={i}
        />
      ))}
    </div>
  );
}

export default Sequencer;
