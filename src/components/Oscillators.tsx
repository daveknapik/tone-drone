import * as Tone from "tone";
import { clsx } from "clsx";

import { useState, MutableRefObject, Fragment, useEffect, useRef } from "react";

import FrequencyRangeControl from "./FrequencyRangeControl";
import Heading from "./Heading";
// import SequenceManager from "./SequenceManager.tsx";
import Oscillator from "./Oscillator";

import { OscillatorWithChannel } from "../types/OscillatorWithChannel";

import { useConnectChannelsToBus } from "../hooks/useConnectChannelsToBus";
import { useOscillators } from "../hooks/useOscillators";
import { useSequences } from "../hooks/useSequences";
import { useSynths } from "../hooks/useSynths";
import { SynthWithPanner } from "../types/SynthWithPanner";

interface OscillatorsProps {
  bus: MutableRefObject<Tone.Channel>;
  oscillatorCount?: number;
}

function Oscillators({ bus, oscillatorCount = 6 }: OscillatorsProps) {
  const [minFreq, setMinFreq] = useState(440);
  const [maxFreq, setMaxFreq] = useState(454);
  const [playKeys] = useState<string[]>(["q", "w", "a", "s", "z", "x"]);
  const [expandOscillators, setExpandOscillators] = useState(true);

  const [oscillators, setOscillators] = useOscillators(oscillatorCount);
  const [synths, setSynths] = useSynths(oscillatorCount);
  const [sequences, setSequences] = useSequences(oscillatorCount, 8);

  useConnectChannelsToBus(
    [
      ...oscillators.map((osc) => osc.channel),
      ...synths.map((synth) => synth.panner),
    ],
    bus.current
  );

  const beat: MutableRefObject<number> = useRef<number>(0);
  const [currentBeat, setCurrentBeat] = useState(0);

  useEffect(() => {
    const loop = new Tone.Loop((time) => {
      setCurrentBeat(beat.current);

      // Sound the active notes on each synth
      sequences.forEach((sequence, i) => {
        if (sequence.steps[beat.current].isActive) {
          synths[i].synth.triggerAttackRelease(sequence.frequency, "8n", time);
        }
      });
      beat.current = (beat.current + 1) % 8; // Ensure stepCount is defined or replace with a constant
    }, "8n").start(0);

    return () => {
      loop.stop();
      loop.dispose();
    };
  }, [synths, sequences]);

  const handleStepClick = (sequenceIndex: number, stepIndex: number) => {
    const newSequences = sequences.map((sequence, i) => {
      if (i === sequenceIndex) {
        return {
          ...sequence,
          steps: sequence.steps.map((step, j) => {
            if (j === stepIndex) {
              return { ...step, isActive: !step.isActive };
            }
            return { ...step };
          }),
        };
      }
      return sequence;
    });

    setSequences(newSequences);
  };

  const updateSequenceFrequency = (
    sequenceIndex: number,
    frequency: number
  ) => {
    const newSequences = sequences.map((sequence, i) => {
      if (i === sequenceIndex) {
        return { ...sequence, frequency };
      }
      return sequence;
    });

    setSequences(newSequences);
  };

  const createOscillator = (): OscillatorWithChannel => {
    const oscillator = new Tone.Oscillator(minFreq, "sine");
    const channel = new Tone.Channel(-5, 0);
    oscillator.connect(channel);
    channel.connect(bus.current);

    return { oscillator, channel };
  };

  const createSynth = (): SynthWithPanner => {
    const synth = new Tone.Synth();
    const panner = new Tone.Panner();

    synth.connect(panner);
    panner.connect(bus.current);

    return { synth, panner };
  };

  const addOscillator = (): void => {
    setOscillators((prevOscillators: OscillatorWithChannel[]) => [
      ...prevOscillators,
      createOscillator(),
    ]);

    setSynths((prevSynths: SynthWithPanner[]) => [
      ...prevSynths,
      createSynth(),
    ]);

    // Todo: Create new sequence and add to sequences
  };

  const updateFrequencyRange = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const min = Number(formData.get("minFreq"));
    const max = Number(formData.get("maxFreq"));

    if (min && max) {
      if (min > max) {
        setMinFreq(min);
        setMaxFreq(min + 10);
      } else {
        setMinFreq(min);
        setMaxFreq(max);
      }
    }
  };

  const toggleExpandOscillators = (): void => {
    setExpandOscillators((prev) => !prev);
  };

  return (
    <Fragment>
      <Heading
        expanded={expandOscillators}
        toggleExpanded={toggleExpandOscillators}
      >
        Oscillators
      </Heading>
      <div
        className={clsx(
          "border-2 rounded border-pink-500 dark:border-sky-300 p-5 mb-3",
          !expandOscillators && "hidden"
        )}
      >
        <div className="flex items-start justify-between">
          <FrequencyRangeControl handleFormSubmit={updateFrequencyRange} />
          <button onClick={addOscillator}>+</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8 mb-3 place-items-center">
          {oscillators.map((oscillator, i) => (
            <Oscillator
              channel={oscillator.channel}
              currentBeat={currentBeat}
              handleStepClick={handleStepClick}
              key={i}
              maxFreq={maxFreq}
              minFreq={minFreq}
              oscillator={oscillator.oscillator}
              panner={synths[i].panner}
              playPauseKey={playKeys[i]}
              sequence={sequences[i]}
              sequenceIndex={i}
              synth={synths[i].synth}
              updateSequenceFrequency={updateSequenceFrequency}
            />
          ))}
        </div>
      </div>
    </Fragment>
  );
}

export default Oscillators;
