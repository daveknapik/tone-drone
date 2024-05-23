import * as Tone from "tone";
import { useEffect, useRef, MutableRefObject } from "react";

export function useDelay() {
  const delay = useRef<Tone.FeedbackDelay>(
    null
  ) as MutableRefObject<Tone.FeedbackDelay>;

  useEffect(() => {
    delay.current = new Tone.FeedbackDelay({
      delayTime: 1,
      feedback: 0.95,
      maxDelay: 10,
      wet: 0,
    });

    return () => {
      delay.current.dispose();
    };
  }, []);

  return delay;
}
