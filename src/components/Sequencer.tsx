import * as Tone from "tone";
import Step from "./Step";
import { Sequence } from "../types/Sequence";

interface SequencerProps {
  currentBeat: number;
  handleStepClick: (sequenceIndex: number, stepIndex: number) => void;
  pan: number;
  panner: Tone.Panner;
  sequence: Sequence;
  sequenceIndex: number;
  stepCount?: number;
  synth: Tone.Synth;
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
  stepCount = 8,
  synth,
  volume,
  waveform,
}: SequencerProps) {
  synth.volume.setTargetAtTime(volume, 0, 0.01);
  panner?.pan.setTargetAtTime(pan, 0, 0.01);

  synth.set({ oscillator: { type: waveform as OscillatorType } });

  return (
    <div>
      Sequencer {stepCount}
      {sequence.steps.map((_step, i) => (
        <Step
          handleClick={() => handleStepClick(sequenceIndex, i)}
          isCurrentBeat={currentBeat === i}
          key={i}
          step={sequence.steps[i]}
        />
      ))}
    </div>
  );
}

export default Sequencer;
