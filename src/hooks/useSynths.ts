import * as Tone from "tone";

import { Dispatch, SetStateAction, useEffect, useState, useRef } from "react";
import { SynthWithPanner } from "../types/SynthWithPanner";
import { SynthEnvelopeParams } from "../types/SynthParams";
import { DEFAULT_SYNTH_ENVELOPE_PARAMS } from "../utils/presetDefaults";

const SYNTH_COUNT = 6;

export function useSynths(
  bus?: Tone.Channel,
  initialEnvelope: SynthEnvelopeParams = DEFAULT_SYNTH_ENVELOPE_PARAMS
): [
  SynthWithPanner[],
  Dispatch<SetStateAction<SynthWithPanner[]>>,
  (envelope: SynthEnvelopeParams) => void
] {
  const [synths, setSynths] = useState<SynthWithPanner[]>([]);
  const initialEnvelopeRef = useRef(initialEnvelope);

  // Create synths only once on mount or when bus changes
  // DO NOT recreate on envelope changes - use updateEnvelope instead!
  useEffect(() => {
    const newSynths: SynthWithPanner[] = [];

    for (let i = 0; i < SYNTH_COUNT; i++) {
      // Use PolySynth to prevent clicks/pops from overlapping notes
      const synth = new Tone.PolySynth(Tone.Synth, {
        envelope: {
          attack: initialEnvelopeRef.current.attack,
          decay: initialEnvelopeRef.current.decay,
          sustain: initialEnvelopeRef.current.sustain,
          release: initialEnvelopeRef.current.release,
          attackCurve: "linear",
          decayCurve: "exponential",
          releaseCurve: "exponential",
        },
      });

      // Set maxPolyphony to 8 - allows safe handling of up to 1.0s release times at 120 BPM
      synth.maxPolyphony = 8;

      const panner = new Tone.Panner();

      synth.connect(panner);
      if (bus) {
        panner.connect(bus);
      }

      newSynths.push({ synth, panner });
    }

    setSynths(newSynths);

    return () => {
      newSynths.forEach(({ synth, panner }) => {
        synth.dispose();
        panner.dispose();
      });

      setSynths([]);
    };
  }, [bus]); // Only recreate when bus changes, NOT on envelope changes!

  // Function to update envelope on all synths without recreating them
  const updateEnvelope = (envelope: SynthEnvelopeParams) => {
    synths.forEach(({ synth }) => {
      synth.set({
        envelope: {
          attack: envelope.attack,
          decay: envelope.decay,
          sustain: envelope.sustain,
          release: envelope.release,
        },
      });
    });
  };

  return [synths, setSynths, updateEnvelope];
}
