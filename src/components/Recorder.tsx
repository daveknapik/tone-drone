import * as Tone from "tone";
import { useState, MutableRefObject, Fragment } from "react";

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
      <div className="flex items-center align-items-center">
        <button
          onClick={() => void handleRecord()}
          className="mr-3 border-2 rounded border-pink-500 dark:border-sky-300 px-3"
        >
          {isRecording ? "Stop" : "Start"}
        </button>
        {url && !isRecording && (
          <Fragment>
            <audio preload="none" src={url} className="mr-3"></audio>

            <a
              download={`tone-drone-recording${Date.now().toString()}`}
              href={url}
              className="mr-3 border-2 rounded border-pink-500 dark:border-sky-300 px-3"
            >
              Download
            </a>
          </Fragment>
        )}
      </div>
      {url && !isRecording && (
        <div className="text-sm mt-2">
          Note: If you start a new recording, you will lose the current one.
          Please download it first.
        </div>
      )}
    </div>
  );
}

export default Recorder;
