import * as Tone from "tone";

import Slider from "./Slider";

import { useState, useImperativeHandle, useRef, useEffect } from "react";

interface EffectsBusSendControlProps {
  bus: React.RefObject<Tone.Channel>;
  ref?: React.Ref<{ value: number }>;
}

function EffectsBusSendControl({ bus, ref }: EffectsBusSendControlProps) {
  const [mainAudioEffectsBusVolume, setMainAudioEffectsBusVolume] =
    useState(-15);

  const valueRef = useRef({ value: mainAudioEffectsBusVolume });

  useEffect(() => {
    valueRef.current.value = mainAudioEffectsBusVolume;
  }, [mainAudioEffectsBusVolume]);

  useImperativeHandle(ref, () => valueRef.current);

  bus.current?.volume.setTargetAtTime(mainAudioEffectsBusVolume, 0, 0.01);

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
