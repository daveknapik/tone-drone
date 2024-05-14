import * as Tone from "tone";

import Slider from "./Slider";

import { useState } from "react";

interface ReverbProps {
  reverb: Tone.Freeverb | undefined;
}

function Reverb({ reverb }: ReverbProps) {
  const [roomSize, setRoomSize] = useState(0.95);
  const [wet, setWet] = useState(1);

  reverb?.set({
    roomSize: roomSize,
    wet: wet,
  });

  return (
    <div>
      <div className="col-span-full mb-1">Reverb</div>
      <Slider
        inputName="roomSize"
        min={0}
        max={1}
        value={roomSize}
        step={0.01}
        handleChange={(e) => setRoomSize(parseFloat(e.target.value))}
      />
      <Slider
        inputName="wet"
        min={0}
        max={1}
        value={wet}
        step={0.01}
        handleChange={(e) => setWet(parseFloat(e.target.value))}
      />
    </div>
  );
}

export default Reverb;
