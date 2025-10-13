import * as Tone from "tone";
import { clsx } from "clsx";

import {
  useCallback,
  useState,
  Fragment,
  useEffect,
  useRef,
  useImperativeHandle,
} from "react";
import { useDebounceCallback } from "usehooks-ts";

import BpmControl from "./BpmControl";
import FrequencyRangeControl from "./FrequencyRangeControl";
import Heading from "./Heading";
import Oscillator from "./Oscillator";

import { OscillatorWithChannel } from "../types/OscillatorWithChannel";
import { Sequence } from "../types/Sequence";

import { useConnectChannelsToBus } from "../hooks/useConnectChannelsToBus";
import {
  DEFAULT_OSCILLATOR_PARAMS,
  DEFAULT_SEQUENCE,
} from "../utils/presetDefaults";
import { useOscillators } from "../hooks/useOscillators";
import { useSequences } from "../hooks/useSequences";
import { useSynths } from "../hooks/useSynths";
import { SynthWithPanner } from "../types/SynthWithPanner";
import { OscillatorsHandle, OscillatorsState } from "../types/OscillatorsParams";
import { OscillatorHandle } from "../types/OscillatorParams";

import PlayPauseSequencerButton from "../components/PlayPauseSequencerButton";

interface OscillatorsProps {
  bus: React.RefObject<Tone.Channel>;
  oscillatorCount?: number;
  stepCount?: number;
  ref?: React.Ref<OscillatorsHandle>;
}

function Oscillators({
  bus,
  oscillatorCount = 6,
  stepCount = 16,
  ref,
}: OscillatorsProps) {
  const [minFreq, setMinFreq] = useState(440);
  const [maxFreq, setMaxFreq] = useState(454);
  const [playKeys] = useState<string[]>(["q", "w", "a", "s", "z", "x"]);
  const [expandOscillators, setExpandOscillators] = useState(true);

  const [oscillators, setOscillators] = useOscillators(oscillatorCount);
  const [synths, setSynths] = useSynths(oscillatorCount);
  const [sequences, setSequences] = useSequences(oscillatorCount, stepCount);

  const beat = useRef(0);
  const [currentBeat, setCurrentBeat] = useState(0);
  const loopRef = useRef<Tone.Loop | null>(null);
  const callbackRef = useRef<((time: number) => void) | undefined>(undefined);

  // Create refs for each oscillator component
  const oscillatorRefs = useRef<(OscillatorHandle | null)[]>([]);

  // Expose state to parent via ref
  useImperativeHandle(ref, () => ({
    getState: (): OscillatorsState => {
      // Get params from each oscillator child component
      const oscillatorParams = oscillatorRefs.current.map((oscRef) =>
        oscRef?.getParams() ?? DEFAULT_OSCILLATOR_PARAMS
      );

      return {
        minFreq,
        maxFreq,
        oscillators: oscillatorParams,
        sequences,
      };
    },
    setState: (state: OscillatorsState) => {
      setMinFreq(state.minFreq);
      setMaxFreq(state.maxFreq);
      setSequences(state.sequences);

      // Set params on each oscillator child component
      state.oscillators.forEach((oscParams, index) => {
        oscillatorRefs.current[index]?.setParams(oscParams);
      });
    },
  }));

  useConnectChannelsToBus(
    [
      ...oscillators.map((osc) => osc.channel),
      ...synths.map((synth) => synth.panner),
    ],
    bus.current
  );

  const getActiveSteps = useCallback(() => {
    return sequences
      .map((sequence, i) => ({
        frequency: sequence.frequency,
        isActive: sequence.steps[beat.current],
        synthIndex: i,
      }))
      .filter(({ isActive }) => isActive);
  }, [sequences]);

  // set up the loop on first render
  useEffect(() => {
    loopRef.current ??= new Tone.Loop((time) => {
      if (callbackRef.current) {
        callbackRef.current(time);
      }
    }, "16n").start(0);

    return () => {
      if (loopRef.current) {
        loopRef.current.stop();
        loopRef.current.dispose();
        loopRef.current = null;
      }
    };
  }, []);

  // set current beat and redefine the loop's callback when steps change
  useEffect(() => {
    callbackRef.current = (time) => {
      setCurrentBeat(beat.current);

      // Sound the active notes on each synth
      getActiveSteps().forEach(({ frequency, synthIndex }) => {
        synths[synthIndex].synth.triggerAttackRelease(
          frequency,
          "16n",
          time,
          1.5
        );
      });

      beat.current = (beat.current + 1) % stepCount;
    };
  }, [getActiveSteps, stepCount, synths]);

  // update the frequency of the out of range oscillators when min or max freq changes
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

  const handleStepClick = useCallback(
    (sequenceIndex: number, stepIndex: number) => {
      setSequences((prevSequences) => {
        const newSequences = [...prevSequences];
        const sequence = newSequences[sequenceIndex];
        const newSteps = [...sequence.steps];
        newSteps[stepIndex] = !newSteps[stepIndex];
        newSequences[sequenceIndex] = { ...sequence, steps: newSteps };
        return newSequences;
      });
    },
    [setSequences]
  );

  const updateSequenceFrequency = useCallback(
    (sequenceIndex: number, frequency: number) => {
      const newSequences = sequences.map((sequence, i) => {
        if (i === sequenceIndex) {
          return { ...sequence, frequency };
        }
        return sequence;
      });

      setSequences(newSequences);
    },
    [sequences, setSequences]
  );

  const updateSequenceFrequencyDebounced = useDebounceCallback(
    updateSequenceFrequency,
    500
  );

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
      ...DEFAULT_SEQUENCE,
      steps: Array(stepCount).fill(false) as boolean[],
    };

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
          <div className="space-y-3">
            <FrequencyRangeControl
              handleFormSubmit={updateFrequencyRange}
              maxFreq={maxFreq}
              minFreq={minFreq}
            />
            <BpmControl />
            <PlayPauseSequencerButton />
          </div>
          <button onClick={addOscillator}>+</button>
        </div>
        <hr className="mt-8 border-pink-500 dark:border-sky-300 " />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8 mb-3 place-items-center">
          {oscillators.map((oscillator, i) => {
            // Safety check: only render if we have corresponding sequence and synth
            if (!sequences[i] || !synths[i]) return null;

            return (
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
                updateSequenceFrequency={updateSequenceFrequencyDebounced}
                ref={(el) => {
                  oscillatorRefs.current[i] = el;
                }}
              />
            );
          })}
        </div>
      </div>
    </Fragment>
  );
}

export default Oscillators;
