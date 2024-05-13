import * as Tone from "tone";

import Oscillator from "./Oscillator";
import FrequencyRangeControl from "./FrequencyRangeControl";
import Slider from "./Slider";
import { useEffect, useState } from "react";

interface DroneSynthProps {
  oscillatorCount?: number;
}

function DroneSynth({ oscillatorCount = 6 }: DroneSynthProps) {
  const [oscillators, setOscillators] = useState<Tone.Oscillator[]>([]);
  const [channels, setChannels] = useState<Tone.Channel[]>([]);
  const [mainAudioEffectsBus, setMainAudioEffectsBus] =
    useState<Tone.Channel>();
  const [mainAudioEffectsBusVolume, setMainAudioEffectsBusVolume] =
    useState(-10);

  const [delay, setDelay] = useState<Tone.FeedbackDelay>();
  const [delayTime, setDelayTime] = useState(1);
  const [delayFeedback, setDelayFeedback] = useState(0.9);
  const [delayWet, setDelayWet] = useState(0.5);

  const [reverb, setReverb] = useState<Tone.Freeverb>();
  const [reverbDampening, setReverbDampening] = useState(3000);
  const [reverbRoomSize, setReverbRoomSize] = useState(0.95);
  const [reverbWet, setReverbWet] = useState(1);

  const [minFreq, setMinFreq] = useState(440);
  const [maxFreq, setMaxFreq] = useState(454);

  useEffect(() => {
    const newOscillators: Tone.Oscillator[] = [];
    const newChannels: Tone.Channel[] = [];

    // Create the effects
    const reverb = new Tone.Freeverb({
      dampening: 1000,
      roomSize: 0.5,
      wet: 1,
    });
    const delay = new Tone.FeedbackDelay({
      delayTime: delayTime,
      feedback: delayFeedback,
      maxDelay: 10,
      wet: delayWet,
    });

    const bus = new Tone.Channel({ volume: mainAudioEffectsBusVolume }).chain(
      delay,
      reverb,
      Tone.getDestination()
    );
    bus.receive("mainAudioEffectsBus");

    for (let i = 0; i < oscillatorCount; i++) {
      const oscillator = new Tone.Oscillator(minFreq, "sine");
      const channel = new Tone.Channel(-20, 0).toDestination();

      oscillator.connect(channel);

      channel.send("mainAudioEffectsBus");
      channel.connect(bus);

      newOscillators.push(oscillator);
      newChannels.push(channel);
    }
    setOscillators(newOscillators);
    setChannels(newChannels);
    setMainAudioEffectsBus(bus);
    setDelay(delay);
    setReverb(reverb);

    return () => {
      newOscillators.forEach((oscillator) => oscillator.dispose());
      newChannels.forEach((channel) => channel.dispose());
      bus.dispose();
      delay.dispose();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  delay?.set({
    delayTime: delayTime,
    feedback: delayFeedback,
    wet: delayWet,
  });

  reverb?.set({
    dampening: reverbDampening,
    roomSize: reverbRoomSize,
    wet: reverbWet,
  });

  if (mainAudioEffectsBus !== undefined) {
    mainAudioEffectsBus.volume.value = mainAudioEffectsBusVolume;
  }

  const createOscillator = () => {
    const oscillator = new Tone.Oscillator(minFreq, "sine");
    const channel = new Tone.Channel(-20, 0).toDestination();
    oscillator.connect(channel);
    if (mainAudioEffectsBus !== undefined) {
      channel.connect(mainAudioEffectsBus);
    }
    return oscillator;
  };

  const addOscillator = (): void => {
    setOscillators([...oscillators, createOscillator()]);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
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

  return (
    <div className="dark:text-sky-300">
      <div className="border-2 rounded border-pink-500 dark:border-sky-300 pt-2 px-3">
        <div className="grid grid-cols-2 gap-x-2 gap-y-3 sm:grid-cols-6">
          <div className="col-span-full">Drone Synth</div>
          <div className="col-start-7">
            <button onClick={addOscillator}>+</button>
          </div>
          <FrequencyRangeControl handleFormSubmit={handleFormSubmit} />
        </div>
        <div className="grid grid-cols-1 gap-x-2 gap-y-3 md:grid-cols-2 my-5 border-2 rounded border-pink-500 dark:border-sky-300 p-5">
          <div className="col-span-full">Effects</div>
          <div className="col-start-1 md:col-start-1 place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
            <div className="col-span-full mb-1">Delay</div>
            <Slider
              inputName="time"
              min={0}
              max={10}
              value={delayTime}
              step={0.01}
              handleChange={(e) => setDelayTime(parseFloat(e.target.value))}
            />
            <Slider
              inputName="feedback"
              min={0}
              max={1}
              value={delayFeedback}
              step={0.01}
              handleChange={(e) => setDelayFeedback(parseFloat(e.target.value))}
            />
            <Slider
              inputName="wet"
              min={0}
              max={1}
              value={delayWet}
              step={0.01}
              handleChange={(e) => setDelayWet(parseFloat(e.target.value))}
            />
          </div>
          <div className="col-start-1 md:col-start-2 place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
            <div className="col-span-full mb-1">Reverb</div>
            <Slider
              inputName="roomSize"
              min={0}
              max={1}
              value={reverbRoomSize}
              step={0.01}
              handleChange={(e) =>
                setReverbRoomSize(parseFloat(e.target.value))
              }
            />
            <Slider
              inputName="dampening"
              min={30}
              max={10000}
              value={reverbDampening}
              step={0.01}
              handleChange={(e) =>
                setReverbDampening(parseFloat(e.target.value))
              }
            />
            <Slider
              inputName="wet"
              min={0}
              max={1}
              value={reverbWet}
              step={0.01}
              handleChange={(e) => setReverbWet(parseFloat(e.target.value))}
            />
          </div>
          <div className="col-start-1 md:col-start-1 md:col-end-3 place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
            <Slider
              inputName="bus"
              min={-80}
              max={0}
              value={mainAudioEffectsBusVolume}
              step={0.01}
              handleChange={(e) =>
                setMainAudioEffectsBusVolume(parseFloat(e.target.value))
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 my-5 place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
          <div className="col-span-full mb-1 justify-self-start">
            Oscillators
          </div>
          {oscillators.map((oscillator, i) => (
            <Oscillator
              key={i}
              minFreq={minFreq}
              maxFreq={maxFreq}
              oscillator={oscillator}
              channel={channels[i]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default DroneSynth;
