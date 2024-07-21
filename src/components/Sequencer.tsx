import * as Tone from "tone";
import Step from "./Step";
import { Step as StepInterface } from "../types/Step";

import { MutableRefObject, useEffect, useRef, useState } from "react";

interface SequencerProps {
  frequency: number;
  oscillator: Tone.Oscillator;
  stepCount?: number;
  synth: Tone.Synth;
}

function Sequencer({ frequency, stepCount = 8, synth }: SequencerProps) {
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

  const beatRef: MutableRefObject<number> = useRef<number>(0);

  useEffect(() => {
    const loop = new Tone.Loop((time) => {
      const step = sequence[beatRef.current];
      console.log(beatRef.current);
      if (step.isActive) {
        console.log("triggering", step.frequency, "8n", time);
        synth.triggerAttackRelease(step.frequency, "8n", time);
      }
      beatRef.current = (beatRef.current + 1) % sequence.length;
    }, "8n").start(0);

    return () => {
      loop.stop();
      loop.dispose();
    };
  }, [sequence, synth]); // Re-run the effect if sequence or synth changes

  // useEffect(() => {
  //   const loop = new Tone.Loop((time) => {
  //     sequence.forEach((step, index) => {
  //       if (step.isActive) {
  //         console.log("triggering", step.frequency, "8n", `+${index}n`);
  //         synth.triggerAttackRelease(step.frequency, "8n", time);
  //       }
  //     });
  //   }, "8n").start(0);

  //   return () => {
  //     loop.stop();
  //     loop.dispose();
  //   };
  // }, [sequence, synth]); // Re-run the effect if sequence or synth changes

  /*
   *
   *
   *
   *
   */

  // let repeatId = 0;

  // useEffect(() => {
  //   Tone.Transport.clear(repeatId);
  //   const repeat = (time: number) => {
  //     const step = sequence[beat];
  //     console.log(sequence);
  //     console.log(beat);

  //     if (step.isActive) {
  //       console.log("triggering", step.frequency, "8n", beat);
  //       synth.triggerAttackRelease(step.frequency, "8n", time);
  //     }
  //     setBeat((currentBeat) => (currentBeat + 1) % sequence.length);
  //   };
  //   repeatId = Tone.Transport.scheduleRepeat(repeat, "8n");

  //   return () => {
  //     Tone.Transport.clear(repeatId);
  //   };
  // }, [sequence, synth]); // Re-run the effect if sequence or synth changes

  const handleStepClick = (clickedStep: StepInterface) => {
    const updatedSequence = sequence.map((step) => {
      if (step.index === clickedStep.index) {
        // Toggle isActive for the clicked step
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
