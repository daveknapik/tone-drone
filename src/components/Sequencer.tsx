import * as Tone from "tone";
import Step from "./Step";
import { Step as StepInterface } from "../types/Step";

import { MutableRefObject, useEffect, useRef, useState } from "react";

interface SequencerProps {
  frequency: number;
  pan: number;
  panner: Tone.Panner;
  stepCount?: number;
  synth: Tone.Synth;
  volume: number;
  waveform: string;
}

function Sequencer({
  frequency,
  pan,
  panner,
  stepCount = 8,
  synth,
  volume,
  waveform,
}: SequencerProps) {
  const [sequence, setSequence] = useState<StepInterface[]>(() => {
    const steps = [];

    for (let i = 0; i < stepCount; i++) {
      steps.push({
        frequency: frequency,
        index: i,
        isActive: false,
      });
    }

    return steps;
  });

  const beat: MutableRefObject<number> = useRef<number>(0);

  synth.volume.setTargetAtTime(volume, 0, 0.01);
  panner?.pan.setTargetAtTime(pan, 0, 0.01);

  synth.set({ oscillator: { type: waveform as OscillatorType } });

  useEffect(() => {
    const loop = new Tone.Loop((time) => {
      const step = sequence[beat.current];
      console.log(beat.current);
      if (step.isActive) {
        console.log(frequency);

        console.log("triggering", frequency, "8n", time);
        synth.triggerAttackRelease(frequency, "8n", time);
      }
      beat.current = (beat.current + 1) % sequence.length;
    }, "8n").start(0);

    return () => {
      loop.stop();
      loop.dispose();
    };
  }, [frequency, sequence, synth]);

  const handleStepClick = (clickedStep: StepInterface) => {
    const updatedSequence = sequence.map((step) => {
      if (step.index === clickedStep.index) {
        return { ...step, isActive: !step.isActive };
      }
      return { ...step };
    });

    setSequence(updatedSequence);
  };

  return (
    <div>
      Sequencer {stepCount}
      {sequence.map((step, i) => (
        <Step key={i} step={step} handleClick={() => handleStepClick(step)} />
      ))}
    </div>
  );
}

export default Sequencer;
