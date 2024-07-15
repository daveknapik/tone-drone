import * as Tone from "tone";

import Slider from "./Slider";

import { MutableRefObject, useState } from "react";

interface EffectsBusSendControlProps {
  bus: MutableRefObject<Tone.Channel>;
}

function EffectsBusSendControl({ bus }: EffectsBusSendControlProps) {
  const [mainAudioEffectsBusVolume, setMainAudioEffectsBusVolume] =
    useState(-15);

  bus.current.volume.setTargetAtTime(mainAudioEffectsBusVolume, 0, 0.01);

  return (
    <div className="col-start-1 md:col-start-1 md:col-end-3 place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
      <Slider
        inputName="bus"
        labelText="Effects Send"
        min={-80}
        max={0}
        step={0.01}
        logarithmic={true}
        value={mainAudioEffectsBusVolume}
        handleChange={(e) =>
          setMainAudioEffectsBusVolume(parseFloat(e.target.value))
        }
      />
    </div>
  );
}

export default EffectsBusSendControl;
