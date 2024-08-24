import * as Tone from "tone";
import { clsx } from "clsx";

import { useState, MutableRefObject, Fragment, useEffect, useRef } from "react";

import BpmControl from "./BpmControl";
import FrequencyRangeControl from "./FrequencyRangeControl";
import Heading from "./Heading";
import Oscillator from "./Oscillator";

import { OscillatorWithChannel } from "../types/OscillatorWithChannel";
import { Sequence } from "../types/Sequence";

import { useConnectChannelsToBus } from "../hooks/useConnectChannelsToBus";
import { useOscillators } from "../hooks/useOscillators";
import { useSequences } from "../hooks/useSequences";
import { useSynths } from "../hooks/useSynths";
import { SynthWithPanner } from "../types/SynthWithPanner";

interface OscillatorsProps {
  bus: MutableRefObject<Tone.Channel>;
  oscillatorCount?: number;
  stepCount?: number;
}

function Oscillators({
  bus,
  oscillatorCount = 6,
  stepCount = 16,
}: OscillatorsProps) {
  const [minFreq, setMinFreq] = useState(440);
  const [maxFreq, setMaxFreq] = useState(454);
  const [playKeys] = useState<string[]>(["q", "w", "a", "s", "z", "x"]);
  const [expandOscillators, setExpandOscillators] = useState(true);

  const [oscillators, setOscillators] = useOscillators(oscillatorCount);
  const [synths, setSynths] = useSynths(oscillatorCount);
  const [sequences, setSequences] = useSequences(oscillatorCount, stepCount);

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
      beat.current = (beat.current + 1) % stepCount;
    }, "8n").start(0);

    return () => {
      loop.stop();
      loop.dispose();
    };
  }, [sequences, stepCount, synths]);

  useEffect(() => {
    setSequences((prevSequences) => {
      const newSequences = prevSequences.map((sequence) => {
        if (sequence.frequency < minFreq) {
          return { ...sequence, frequency: minFreq };
        } else if (sequence.frequency > maxFreq) {
          return { ...sequence, frequency: maxFreq };
        }
        return sequence;
      });
      return newSequences;
    });
  }, [minFreq, maxFreq, setSequences]);

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
    // Create new oscillator and add to oscillators
    setOscillators((prevOscillators: OscillatorWithChannel[]) => [
      ...prevOscillators,
      createOscillator(),
    ]);

    // Create new synth and add to synths
    setSynths((prevSynths: SynthWithPanner[]) => [
      ...prevSynths,
      createSynth(),
    ]);

    // Create new sequence with steps and add to sequences
    const sequence: Sequence = {
      frequency: 440,
      steps: [],
    };

    for (let i = 0; i < stepCount; i++) {
      sequence.steps.push({
        isActive: false,
      });
    }

    setSequences((prevSequences: Sequence[]) => [...prevSequences, sequence]);
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
          <div>
            <FrequencyRangeControl handleFormSubmit={updateFrequencyRange} />
            <BpmControl />
          </div>
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
