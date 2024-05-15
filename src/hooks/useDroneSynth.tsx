import * as Tone from "tone";
import { MutableRefObject, useEffect, useState } from "react";

import { useDelay } from "./useDelay";
import { useReverb } from "./useReverb";
import { Dispatch, SetStateAction } from "react";
import { useAudioEffectsBus } from "./useAudioEffectsBus";

export function useDroneSynth(
  oscillatorCount = 6
): [
  Tone.Oscillator[],
  Dispatch<SetStateAction<Tone.Oscillator[]>>,
  Tone.Channel[],
  MutableRefObject<Tone.Channel>,
  MutableRefObject<Tone.FeedbackDelay>,
  MutableRefObject<Tone.Freeverb>
] {
  const [oscillators, setOscillators] = useState<Tone.Oscillator[]>([]);
  const [channels, setChannels] = useState<Tone.Channel[]>([]);

  const delay = useDelay();
  const reverb = useReverb();
  const mainAudioEffectsBus = useAudioEffectsBus();

  useEffect(() => {
    const newOscillators: Tone.Oscillator[] = [];
    const newChannels: Tone.Channel[] = [];

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

      newOscillators.push(oscillator);
      newChannels.push(channel);
    }

    setOscillators(newOscillators);
    setChannels(newChannels);

    return () => {
      newOscillators.forEach((oscillator) => oscillator.dispose());
      newChannels.forEach((channel) => channel.dispose());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [
    oscillators,
    setOscillators,
    channels,
    mainAudioEffectsBus,
    delay,
    reverb,
  ];
}
