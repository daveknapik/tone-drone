import * as Tone from "tone";
import { useEffect, useState } from "react";

import { Dispatch, SetStateAction } from "react";

export function useDroneSynth(
  oscillatorCount = 6
): [
  Tone.Oscillator[],
  Dispatch<SetStateAction<Tone.Oscillator[]>>,
  Tone.Channel[],
  Tone.Channel,
  Tone.FeedbackDelay,
  Tone.Freeverb
] {
  const [oscillators, setOscillators] = useState<Tone.Oscillator[]>([]);
  const [channels, setChannels] = useState<Tone.Channel[]>([]);
  const [mainAudioEffectsBus, setMainAudioEffectsBus] = useState<Tone.Channel>(
    new Tone.Channel()
  );
  const [delay, setDelay] = useState<Tone.FeedbackDelay>(
    new Tone.FeedbackDelay()
  );
  const [reverb, setReverb] = useState<Tone.Freeverb>(new Tone.Freeverb());

  useEffect(() => {
    const newOscillators: Tone.Oscillator[] = [];
    const newChannels: Tone.Channel[] = [];

    const delay = new Tone.FeedbackDelay({
      delayTime: 1,
      feedback: 0.9,
      maxDelay: 10,
      wet: 0.5,
    });

    const reverb = new Tone.Freeverb({
      dampening: 1000,
      roomSize: 0.5,
      wet: 1,
    });

    const bus = new Tone.Channel({ volume: -10 });
    bus.chain(delay, reverb, Tone.getDestination());

    bus.receive("mainAudioEffectsBus");
    // Create the oscillators and their channels and connect them to the effects bus
    for (let i = 0; i < oscillatorCount; i++) {
      const oscillator = new Tone.Oscillator(440, "sine");
      const channel = new Tone.Channel(-20, 0).toDestination();

      oscillator.connect(channel);

      channel.send("mainAudioEffectsBus");
      channel.connect(bus);

      newOscillators.push(oscillator);
      newChannels.push(channel);
    }

    setDelay(delay);
    setReverb(reverb);
    setOscillators(newOscillators);
    setChannels(newChannels);
    setMainAudioEffectsBus(bus);

    return () => {
      newOscillators.forEach((oscillator) => oscillator.dispose());
      newChannels.forEach((channel) => channel.dispose());
      if (bus !== undefined) {
        bus.dispose();
      }
      delay?.dispose();
      reverb.dispose();
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
