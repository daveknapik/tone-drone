import * as Tone from "tone";

import Slider from "./Slider";

import { useState } from "react";

interface EffectsBusSendControlProps {
  bus: Tone.Channel | undefined;
}

function EffectsBusSendControl({ bus }: EffectsBusSendControlProps) {
  const [mainAudioEffectsBusVolume, setMainAudioEffectsBusVolume] =
    useState(-10);

  if (bus !== undefined) {
    bus.volume.value = mainAudioEffectsBusVolume;
  }

  return (
    <div className="col-start-1 md:col-start-1 md:col-end-3 place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
      <Slider
        inputName="bus"
        labelText="Effects Send"
        min={-80}
        max={0}
        value={mainAudioEffectsBusVolume}
        handleChange={(e) =>
          setMainAudioEffectsBusVolume(parseFloat(e.target.value))
        }
      />
    </div>
  );
}

export default EffectsBusSendControl;
