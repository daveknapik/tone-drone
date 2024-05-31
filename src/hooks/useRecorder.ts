import * as Tone from "tone";
import { useEffect, useRef, MutableRefObject } from "react";

export function useRecorder() {
  const recorder = useRef<Tone.Recorder>(
    null
  ) as MutableRefObject<Tone.Recorder>;

  useEffect(() => {
    if (MediaRecorder.isTypeSupported("audio/webm")) {
      recorder.current = new Tone.Recorder({
        mimeType: "audio/webm",
      });
    } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
      recorder.current = new Tone.Recorder({
        mimeType: "audio/mp4",
      });
    } else {
      console.error("no suitable mimetype found for this device");
    }

    return () => {
      recorder.current.dispose();
    };
  }, []);

  return recorder;
}
