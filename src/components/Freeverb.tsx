import * as Tone from "tone";

import Slider from "./Slider";

import { MutableRefObject, useState } from "react";

interface FreeverbProps {
  freeverb: MutableRefObject<Tone.Freeverb>;
}

function Freeverb({ freeverb }: FreeverbProps) {
  const [roomSize, setRoomSize] = useState(0.95);
  const [wet, setWet] = useState(0);

  freeverb.current.set({
    roomSize,
    wet,
  });

  return (
    <div className="place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
      <div className="col-span-full mb-1">Reverb</div>
      <Slider
        handleChange={(e) => setRoomSize(parseFloat(e.target.value))}
        inputName="roomSize"
        labelText="Size"
        max={1}
        min={0}
        step={0.01}
        value={roomSize}
      />
      <Slider
        handleChange={(e) => setWet(parseFloat(e.target.value))}
        inputName="wet"
        labelText="Dry / Wet"
        max={1}
        min={0}
        step={0.01}
        value={wet}
      />
    </div>
  );
}

export default Freeverb;
