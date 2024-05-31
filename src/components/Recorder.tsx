import * as Tone from "tone";
import { useState, MutableRefObject } from "react";

interface RecorderProps {
  recorder: MutableRefObject<Tone.Recorder | null>;
}

function Recorder({ recorder }: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [url, setUrl] = useState("");

  const handleRecord = async () => {
    if (isRecording) {
      const recording = await recorder?.current?.stop();
      if (recording) {
        setUrl(URL.createObjectURL(recording));
      }
      setIsRecording(false);
    } else {
      void recorder?.current?.start();
      setIsRecording(true);
    }
  };

  return (
    <div>
      <button onClick={() => void handleRecord()}>
        {isRecording ? "Stop" : "Start"}
      </button>
      <audio controls preload="none" src={url}></audio>
      {url && !isRecording && (
        <a download={`tone-drone-recording${Date.now().toString()}`} href={url}>
          Download
        </a>
      )}
    </div>
  );
}

export default Recorder;
