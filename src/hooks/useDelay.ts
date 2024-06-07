import * as Tone from "tone";
import { useRef } from "react";

export function useDelay() {
  const delay = useRef<Tone.FeedbackDelay>(
    new Tone.FeedbackDelay({
      delayTime: 1,
      feedback: 0.95,
      maxDelay: 10,
      wet: 0,
    })
  );

  return delay;
}
