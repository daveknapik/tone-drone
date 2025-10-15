import * as Tone from "tone";

import Slider from "./Slider";

import { useState, useImperativeHandle, useRef, useEffect } from "react";
import { DelayHandle, DelayParams } from "../types/DelayParams";

interface DelayProps {
  delay: React.RefObject<Tone.FeedbackDelay>;
  label?: string;
  maxTime?: number;
  minFeedback?: number;
  ref?: React.Ref<DelayHandle>;
  onParameterChange?: () => void;
}

function Delay({
  delay,
  label = "Delay",
  maxTime = 10,
  minFeedback = 0,
  ref,
  onParameterChange,
}: DelayProps) {
  const [time, setTime] = useState(1);
  const [feedback, setFeedback] = useState(0.95);
  const [wet, setWet] = useState(0);

  // Keep a ref with current state values for imperative access
  const paramsRef = useRef<DelayParams>({
    time,
    feedback,
    wet,
  });

  // Update ref whenever state changes
  useEffect(() => {
    paramsRef.current = {
      time,
      feedback,
      wet,
    };
  }, [time, feedback, wet]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getParams: (): DelayParams => paramsRef.current,
    setParams: (params: DelayParams) => {
      setTime(params.time);
      setFeedback(params.feedback);
      setWet(params.wet);
    },
  }));

  delay.current.set({
    delayTime: time,
    feedback: feedback,
    wet: wet,
  });

  return (
    <div className="place-items-center border-2 rounded border-pink-500 dark:border-sky-300 p-5">
      <div className="col-span-full mb-1">{label}</div>
      <Slider
        inputName="time"
        min={0}
        max={maxTime}
        value={time}
        labelText="Time"
        step={0.01}
        handleChange={(e) => {
          setTime(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
      <Slider
        inputName="feedback"
        min={minFeedback}
        max={1}
        value={feedback}
        labelText="Feedback"
        step={0.01}
        handleChange={(e) => {
          setFeedback(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
      <Slider
        inputName="wet"
        min={0}
        max={1}
        value={wet}
        step={0.01}
        labelText="Dry / Wet"
        handleChange={(e) => {
          setWet(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
    </div>
  );
}

export default Delay;
