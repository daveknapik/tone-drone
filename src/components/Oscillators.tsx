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
import SynthEnvelopeControl from "./SynthEnvelopeControl";

// import { useConnectChannelsToBus } from "../hooks/useConnectChannelsToBus";
import {
  DEFAULT_OSCILLATOR_PARAMS,
  DEFAULT_OSCILLATORS_STATE,
  DEFAULT_SYNTH_ENVELOPE_PARAMS,
} from "../utils/presetDefaults";
import { useOscillators } from "../hooks/useOscillators";
import { useSequences } from "../hooks/useSequences";
import { useSynths } from "../hooks/useSynths";
import {
  OscillatorsHandle,
  OscillatorsState,
} from "../types/OscillatorsParams";
import { OscillatorHandle, OscillatorParams } from "../types/OscillatorParams";
import { BpmControlHandle } from "../types/BpmParams";
import { SynthEnvelopeHandle, SynthEnvelopeParams } from "../types/SynthParams";

import PlayPauseSequencerButton from "../components/PlayPauseSequencerButton";
import RandomizeFrequencyButton from "../components/RandomizeFrequencyButton";
import RandomizeAllPatternsButton from "../components/RandomizeAllPatternsButton";
import PatternDensitySlider from "../components/PatternDensitySlider";
import { randomizeToScale } from "../utils/musicTheory";
import { randomizePattern, clearPattern } from "../utils/patternUtils";

const OSCILLATOR_COUNT = 6;

interface OscillatorsProps {
  bus: React.RefObject<Tone.Channel>;
  stepCount?: number;
  ref?: React.Ref<OscillatorsHandle>;
  onParameterChange?: () => void;
  bpmControlRef?: React.RefObject<BpmControlHandle | null>;
}

function Oscillators({
  bus,
  stepCount = 16,
  ref,
  onParameterChange,
  bpmControlRef,
}: OscillatorsProps) {
  const [minFreq, setMinFreq] = useState(DEFAULT_OSCILLATORS_STATE.minFreq);
  const [maxFreq, setMaxFreq] = useState(DEFAULT_OSCILLATORS_STATE.maxFreq);
  const [playKeys] = useState<string[]>(["q", "w", "a", "s", "z", "x"]);
  const [muteKeys] = useState<string[]>(["e", "r", "d", "f", "c", "v"]);
  const [expandOscillators, setExpandOscillators] = useState(true);
  const [patternDensity, setPatternDensity] = useState(50);
  const [mutedSequences, setMutedSequences] = useState<boolean[]>(
    DEFAULT_OSCILLATORS_STATE.mutedSequences ??
      Array(OSCILLATOR_COUNT).fill(false)
  );
  const [synthEnvelope, setSynthEnvelope] = useState<SynthEnvelopeParams>(
    DEFAULT_SYNTH_ENVELOPE_PARAMS
  );

  const [oscillators, , setOscillatorTypes] = useOscillators(
    undefined,
    bus.current ?? undefined
  );
  const [synths, , updateSynthEnvelope] = useSynths(
    bus.current ?? undefined,
    synthEnvelope
  );
  const [sequences, setSequences] = useSequences(stepCount);

  const beat = useRef(0);
  const [currentBeat, setCurrentBeat] = useState(0);
  const loopRef = useRef<Tone.Loop | null>(null);
  const callbackRef = useRef<((time: number) => void) | undefined>(undefined);

  // Create refs for each oscillator component
  const oscillatorRefs = useRef<(OscillatorHandle | null)[]>([]);
  const synthEnvelopeRef = useRef<SynthEnvelopeHandle | null>(null);

  // Expose state to parent via ref
  useImperativeHandle(ref, () => ({
    getState: (): OscillatorsState => {
      // Get params from each oscillator child component
      const oscillatorParams: OscillatorParams[] = oscillatorRefs.current.map(
        (oscRef) => oscRef?.getParams() ?? DEFAULT_OSCILLATOR_PARAMS
      );

      return {
        minFreq,
        maxFreq,
        oscillators: oscillatorParams,
        sequences,
        mutedSequences,
        synthEnvelope:
          synthEnvelopeRef.current?.getParams() ??
          DEFAULT_SYNTH_ENVELOPE_PARAMS,
      };
    },
    setState: (state: OscillatorsState) => {
      setMinFreq(state.minFreq);
      setMaxFreq(state.maxFreq);
      setSequences(state.sequences);
      setMutedSequences(
        state.mutedSequences ?? Array(OSCILLATOR_COUNT).fill(false)
      );

      // Set synth envelope (fallback to default for backward compatibility)
      const envelope = state.synthEnvelope ?? DEFAULT_SYNTH_ENVELOPE_PARAMS;
      synthEnvelopeRef.current?.setParams(envelope);
      setSynthEnvelope(envelope);
      updateSynthEnvelope(envelope);

      // Set params on each oscillator child component
      state.oscillators.forEach((oscParams, index) => {
        oscillatorRefs.current[index]?.setParams(oscParams);
      });
    },
  }));

  // Explicitly connect panners in createSynth; oscillators are wired at creation

  const getActiveSteps = useCallback(() => {
    return sequences
      .map((sequence, i) => ({
        frequency: sequence.frequency,
        isActive: sequence.steps[beat.current],
        synthIndex: i,
        isMuted: mutedSequences[i],
      }))
      .filter(({ isActive, isMuted }) => isActive && !isMuted);
  }, [sequences, mutedSequences]);

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
      onParameterChange?.();
    },
    [setSequences, onParameterChange]
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
      onParameterChange?.();
    },
    [sequences, setSequences, onParameterChange]
  );

  const updateSequenceFrequencyDebounced = useDebounceCallback(
    updateSequenceFrequency,
    500
  );

  // Debounce Tone.js synth envelope updates to reduce excessive set() calls during slider drags
  const updateSynthEnvelopeDebounced = useDebounceCallback(
    updateSynthEnvelope,
    50 // 50ms provides responsive feel while avoiding excessive Tone.js updates
  );

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

  const handleRandomizeFrequencies = (): void => {
    const result = randomizeToScale(minFreq, maxFreq, OSCILLATOR_COUNT);

    // Update each oscillator's frequency via refs
    result.frequencies.forEach((frequency, index) => {
      if (oscillatorRefs.current[index]) {
        const currentParams = oscillatorRefs.current[index].getParams();
        oscillatorRefs.current[index].setParams({
          ...currentParams,
          frequency,
        });
      }
    });

    // Update all sequences at once (can't call updateSequenceFrequency in a loop
    // because React batches state updates and they overwrite each other)
    setSequences((prevSequences) =>
      prevSequences.map((sequence, index) => ({
        ...sequence,
        frequency: result.frequencies[index],
      }))
    );

    // Trigger parameter change callback to mark preset as modified
    onParameterChange?.();

    // Log the scale for debugging/future display
    console.log(`Randomized to ${result.scaleName}`);
  };

  const handleRandomizeAllPatterns = (): void => {
    setSequences((prevSequences) =>
      prevSequences.map((sequence) => ({
        ...sequence,
        steps: randomizePattern(stepCount, patternDensity),
      }))
    );
    onParameterChange?.();
  };

  const handleRandomizePattern = (index: number): void => {
    setSequences((prevSequences) => {
      const newSequences = [...prevSequences];
      newSequences[index] = {
        ...newSequences[index],
        steps: randomizePattern(stepCount, patternDensity),
      };
      return newSequences;
    });
    onParameterChange?.();
  };

  const handleClearPattern = (index: number): void => {
    setSequences((prevSequences) => {
      const newSequences = [...prevSequences];
      newSequences[index] = {
        ...newSequences[index],
        steps: clearPattern(stepCount),
      };
      return newSequences;
    });
    onParameterChange?.();
  };

  const handleMuteSequence = (index: number): void => {
    setMutedSequences((prevMuted) => {
      const newMuted = [...prevMuted];
      newMuted[index] = !newMuted[index];
      return newMuted;
    });
    onParameterChange?.();
  };

  const handleEnvelopeChange = (envelope: SynthEnvelopeParams): void => {
    setSynthEnvelope(envelope); // Update UI state immediately for responsive feel
    updateSynthEnvelopeDebounced(envelope); // Debounce Tone.js updates to avoid churn
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
          "sm:border-2 sm:rounded sm:border-pink-500 dark:sm:border-sky-300 p-5 mb-3",
          !expandOscillators && "hidden"
        )}
      >
        <div className="space-y-3">
          <FrequencyRangeControl
            handleFormSubmit={updateFrequencyRange}
            maxFreq={maxFreq}
            minFreq={minFreq}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-3 items-stretch">
            <fieldset className="p-3 border-2 rounded border-pink-500 dark:border-sky-300 min-w-0 flex flex-col justify-center">
              <legend className="px-2 text-pink-500 dark:text-sky-300">
                Sequencers
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_3fr] items-center gap-2 mt-2 min-w-0">
                <PlayPauseSequencerButton />
                <div className="min-w-0">
                  <BpmControl
                    onParameterChange={onParameterChange}
                    ref={bpmControlRef}
                  />
                </div>
              </div>

              <div className="mt-8">
                <h4 className="mb-2 text-pink-500 dark:text-sky-300">
                  Note Envelope
                </h4>
                <SynthEnvelopeControl
                  initialParams={synthEnvelope}
                  onChange={handleEnvelopeChange}
                  onParameterChange={onParameterChange}
                  ref={synthEnvelopeRef}
                />
              </div>
            </fieldset>
            <fieldset className="p-3 border-2 rounded border-pink-500 dark:border-sky-300 min-w-0">
              <legend className="px-2 text-pink-500 dark:text-sky-300">
                Randomization
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-2 mt-2 min-w-0">
                <RandomizeFrequencyButton
                  onClick={handleRandomizeFrequencies}
                />
                <div className="hidden sm:block"></div>
                <RandomizeAllPatternsButton
                  onClick={handleRandomizeAllPatterns}
                />
                <div className="min-w-0">
                  <PatternDensitySlider
                    value={patternDensity}
                    onChange={setPatternDensity}
                  />
                </div>
              </div>
            </fieldset>
          </div>
        </div>
        <hr className="mt-8 border-pink-500 dark:border-sky-300 " />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8 mb-3 place-items-center">
          {oscillators.map((oscillator, i) => {
            // Safety check: only render if we have corresponding sequence and synth
            if (!sequences[i] || !synths[i]) return null;

            return (
              <Fragment key={i}>
                <Oscillator
                  channel={oscillator.channel}
                  currentBeat={currentBeat}
                  handleStepClick={handleStepClick}
                  maxFreq={maxFreq}
                  minFreq={minFreq}
                  oscillator={oscillator.oscillator}
                  panner={synths[i].panner}
                  playPauseKey={playKeys[i]}
                  muteSequenceKey={muteKeys[i]}
                  sequence={sequences[i]}
                  sequenceIndex={i}
                  synth={synths[i].synth}
                  updateSequenceFrequency={updateSequenceFrequencyDebounced}
                  ref={(el) => {
                    oscillatorRefs.current[i] = el;
                  }}
                  onParameterChange={onParameterChange}
                  onOscillatorTypeChange={(type) => {
                    setOscillatorTypes((prev) => {
                      const newTypes = [...prev];
                      newTypes[i] = type;
                      return newTypes;
                    });
                  }}
                  isSequenceMuted={mutedSequences[i]}
                  onMuteSequence={() => handleMuteSequence(i)}
                  onClearPattern={() => handleClearPattern(i)}
                  onRandomizePattern={() => handleRandomizePattern(i)}
                />
                {i < oscillators.length - 1 && (
                  <hr className="sm:hidden w-full border-pink-500 dark:border-sky-300" />
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
    </Fragment>
  );
}

export default Oscillators;
