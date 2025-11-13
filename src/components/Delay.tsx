import * as Tone from "tone";

import Slider from "./Slider";

import { useState, useImperativeHandle, useRef, useEffect } from "react";
import { DelayHandle, DelayParams } from "../types/DelayParams";
import { useRampedParameter } from "../hooks/useRampedParameter";

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

  // Smooth ramped parameter updates (prevents clicking)
  const timeRamped = useRampedParameter(
    delay.current?.delayTime,
    onParameterChange
  );
  const feedbackRamped = useRampedParameter(
    delay.current?.feedback,
    onParameterChange
  );
  const wetRamped = useRampedParameter(delay.current?.wet, onParameterChange);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getParams: (): DelayParams => paramsRef.current,
    setParams: (params: DelayParams) => {
      // Apply audio parameters with smooth ramping (prevents clicks on preset load)
      timeRamped.rampTo(params.time);
      feedbackRamped.rampTo(params.feedback);
      wetRamped.rampTo(params.wet);
      // Update React state for UI
      setTime(params.time);
      setFeedback(params.feedback);
      setWet(params.wet);
    },
  }));

  // Apply initial parameter values on mount
  useEffect(() => {
    timeRamped.rampTo(time);
    feedbackRamped.rampTo(feedback);
    wetRamped.rampTo(wet);
  }, []); // Empty deps - only run on mount

  return (
    <div className="sm:place-items-center sm:border-2 sm:rounded sm:border-pink-500 dark:sm:border-sky-300 p-5">
      <div className="col-span-full mb-1 text-center">{label}</div>
      <Slider
        inputName="time"
        min={0}
        max={maxTime}
        value={time}
        labelText="Time"
        step={0.01}
        handleChange={(e) => {
          const newTime = parseFloat(e.target.value);
          timeRamped.rampTo(newTime); // Smooth audio update
          setTime(newTime); // UI state update
          timeRamped.markModified(); // Debounced preset marking
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
          const newFeedback = parseFloat(e.target.value);
          feedbackRamped.rampTo(newFeedback); // Smooth audio update
          setFeedback(newFeedback); // UI state update
          feedbackRamped.markModified(); // Debounced preset marking
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
          const newWet = parseFloat(e.target.value);
          wetRamped.rampTo(newWet); // Smooth audio update
          setWet(newWet); // UI state update
          wetRamped.markModified(); // Debounced preset marking
        }}
      />
    </div>
  );
}

export default Delay;
