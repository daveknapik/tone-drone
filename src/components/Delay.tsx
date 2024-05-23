import * as Tone from "tone";

import Slider from "./Slider";

import { MutableRefObject, useState } from "react";

interface DelayProps {
  delay: MutableRefObject<Tone.FeedbackDelay | null>;
}

function Delay({ delay }: DelayProps) {
  const [time, setTime] = useState(1);
  const [feedback, setFeedback] = useState(0.95);
  const [wet, setWet] = useState(0);

  delay?.current?.set({
    delayTime: time,
    feedback: feedback,
    wet: wet,
  });

  return (
    <div className="place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
      <div className="col-span-full mb-1">Delay</div>
      <Slider
        inputName="time"
        min={0}
        max={10}
        value={time}
        labelText="Time"
        step={0.01}
        handleChange={(e) => setTime(parseFloat(e.target.value))}
      />
      <Slider
        inputName="feedback"
        min={0}
        max={1}
        value={feedback}
        labelText="Feedback"
        step={0.01}
        handleChange={(e) => setFeedback(parseFloat(e.target.value))}
      />
      <Slider
        inputName="wet"
        min={0}
        max={1}
        value={wet}
        step={0.01}
        labelText="Dry / Wet"
        handleChange={(e) => setWet(parseFloat(e.target.value))}
      />
    </div>
  );
}

export default Delay;
