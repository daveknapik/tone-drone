import * as Tone from "tone";

import Slider from "./Slider";

import { useState } from "react";

interface DelayProps {
  delay: Tone.FeedbackDelay | undefined;
}

function Delay({ delay }: DelayProps) {
  const [time, setTime] = useState(1);
  const [feedback, setFeedback] = useState(0.9);
  const [wet, setWet] = useState(0.5);

  delay?.set({
    delayTime: time,
    feedback: feedback,
    wet: wet,
  });

  return (
    <div>
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
