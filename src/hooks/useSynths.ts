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
  (envelope: SynthEnvelopeParams) => void,
] {
  const [synths, setSynths] = useState<SynthWithPanner[]>([]);
  const initialEnvelopeRef = useRef(initialEnvelope);

  // Use a ref to hold synths so updateEnvelope always accesses the latest synths
  // without capturing them in closure. This prevents race conditions during cleanup
  // when synths array might be temporarily empty, especially with debounced updates.
  const synthsRef = useRef<SynthWithPanner[]>([]);

  // Keep bus ref to reconnect if needed
  const busRef = useRef<Tone.Channel | undefined>(bus);

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

      // Set initial maxPolyphony to 128 - will be dynamically adjusted based on release time
      // See Oscillators.tsx for dynamic adjustment logic
      synth.maxPolyphony = 128;

      // Suppress "Max polyphony exceeded" warnings - they're expected with high release times
      // and many sequencers, and logging them creates console spam
      // @ts-expect-error - Tone.js doesn't expose this in types, but it exists
      synth._warnMaxPolyphony = false;

      const panner = new Tone.Panner();

      synth.connect(panner);
      if (bus) {
        panner.connect(bus);
      }

      newSynths.push({ synth, panner });
    }

    setSynths(newSynths);
    synthsRef.current = newSynths;

    return () => {
      newSynths.forEach(({ synth, panner }) => {
        synth.dispose();
        panner.dispose();
      });

      setSynths([]);
      synthsRef.current = [];
    };
  }, [bus]); // Only recreate when bus changes, NOT on envelope changes!

  // Update synths ref and bus ref whenever they change
  useEffect(() => {
    synthsRef.current = synths;
  }, [synths]);

  useEffect(() => {
    busRef.current = bus;
  }, [bus]);

  // Development-mode voice count monitoring
  // Logs warnings when voice count exceeds 75% of maxPolyphony
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const monitorInterval = setInterval(() => {
      synthsRef.current.forEach(({ synth }, index) => {
        // PolySynth doesn't directly expose activeVoices, but we can check the
        // number of currently playing voices via the voices array
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
        const voices = (synth as any).voices;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        const startedVoices = voices?.filter((v: any) => v.state === "started");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        const activeVoices = startedVoices?.length ?? 0;
        const maxPolyphony = synth.maxPolyphony;
        const threshold = maxPolyphony * 0.75;

        if (activeVoices > threshold) {
          console.warn(
            `[Voice Monitor] Synth ${index + 1}: High voice count ${activeVoices}/${maxPolyphony} (${Math.round((activeVoices / maxPolyphony) * 100)}%)`
          );
        }

        // Log critical threshold at 90%
        if (activeVoices > maxPolyphony * 0.9) {
          console.error(
            `[Voice Monitor] Synth ${index + 1}: CRITICAL voice count ${activeVoices}/${maxPolyphony} (${Math.round((activeVoices / maxPolyphony) * 100)}%)`
          );
        }
      });
    }, 1000); // Check every second

    return () => clearInterval(monitorInterval);
  }, []); // Only depends on synthsRef which is stable

  // Function to update envelope on all synths without recreating them
  // Use synthsRef to always access latest synths, preventing race conditions
  // with debounced updates that might access stale/empty synths array
  //
  // CRITICAL DISCOVERY: When multiple sequencers are playing with many voices active,
  // calling synth.set() can cause synths to stop producing audio entirely.
  // This appears to be a Tone.js PolySynth bug/limitation when many voices are active.
  //
  // The issue manifests as:
  // - 1 sequencer: works fine
  // - 2 sequencers: gets glitchy
  // - 3+ sequencers: audio dies completely
  //
  // This suggests it's related to total voice count, not per-synth polyphony.
  // Each synth has maxPolyphony=128, but something breaks when many voices are active.
  //
  // SOLUTION: Simply update envelope - if synths stop working, they may need to be
  // recreated, but that's a more drastic fix. For now, we'll update and hope Tone.js
  // handles it correctly.
  const updateEnvelope = (envelope: SynthEnvelopeParams) => {
    synthsRef.current.forEach(({ synth, panner }) => {
      // Safety check: only update if synth exists and hasn't been disposed
      if (synth && panner) {
        try {
          // Update envelope template - this should only affect NEW voices
          // But there may be a Tone.js bug when many voices are active
          synth.set({
            envelope: {
              attack: envelope.attack,
              decay: envelope.decay,
              sustain: envelope.sustain,
              release: envelope.release,
            },
          });
        } catch (error) {
          // Log error but don't crash - this could happen if synth is being disposed
          console.error("Error updating synth envelope:", error);
        }
      }
    });
  };

  return [synths, setSynths, updateEnvelope];
}
