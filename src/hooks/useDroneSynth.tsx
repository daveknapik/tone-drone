import * as Tone from "tone";
import { MutableRefObject, useEffect, useState } from "react";

import { useDelay } from "./useDelay";
import { useReverb } from "./useReverb";
import { Dispatch, SetStateAction } from "react";
import { useAudioEffectsBus } from "./useAudioEffectsBus";
import { OscillatorWithChannel } from "../interfaces/OscillatorWithChannel";

export function useDroneSynth(
  oscillatorCount = 6
): [
  OscillatorWithChannel[],
  Dispatch<SetStateAction<OscillatorWithChannel[]>>,
  MutableRefObject<Tone.Channel>,
  MutableRefObject<Tone.FeedbackDelay>,
  MutableRefObject<Tone.Freeverb>
] {
  const [oscillators, setOscillators] = useState<OscillatorWithChannel[]>([]);

  const delay = useDelay();
  const reverb = useReverb();
  const mainAudioEffectsBus = useAudioEffectsBus();

  useEffect(() => {
    const newOscillators: OscillatorWithChannel[] = [];

    mainAudioEffectsBus.current.chain(
      delay.current,
      reverb.current,
      Tone.getDestination()
    );

    // Create the oscillators and their channels and connect them to the effects bus
    for (let i = 0; i < oscillatorCount; i++) {
      const oscillator = new Tone.Oscillator(440, "sine");
      const channel = new Tone.Channel(-20, 0).toDestination();

      oscillator.connect(channel);

      channel.send("mainAudioEffectsBus");
      channel.connect(mainAudioEffectsBus.current);

      newOscillators.push({ oscillator, channel });
    }

    setOscillators(newOscillators);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [oscillators, setOscillators, mainAudioEffectsBus, delay, reverb];
}
