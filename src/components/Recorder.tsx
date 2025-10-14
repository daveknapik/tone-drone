import * as Tone from "tone";
import { clsx } from "clsx";

import Heading from "./Heading";
import Timer from "./Timer";

import { useState, Fragment } from "react";

interface RecorderProps {
  recorder: React.RefObject<Tone.Recorder | null>;
}

function Recorder({ recorder }: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [expandRecording, setExpandRecording] = useState(true);
  const [url, setUrl] = useState("");

  const toggleExpandRecording = (): void => {
    setExpandRecording((prev) => !prev);
  };

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
    <Fragment>
      <Heading
        expanded={expandRecording}
        toggleExpanded={toggleExpandRecording}
      >
        Recording
      </Heading>
      <div
        className={clsx(
          "my-5 border-2 rounded border-pink-500 dark:border-sky-300 p-5",
          !expandRecording && "hidden"
        )}
      >
        <div>
          <div className="flex items-center align-items-center">
            <button
              onClick={() => void handleRecord()}
              className="mr-3 border-2 rounded border-pink-500 dark:border-sky-300 px-3"
              aria-label={isRecording ? "Stop Recording" : "Start Recording"}
              data-testid="recorder-toggle"
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
                  data-testid="recorder-download"
                >
                  Download
                </a>
              </Fragment>
            )}
            <Timer shouldRun={isRecording} />
          </div>
          {url && !isRecording && (
            <div className="text-sm mt-2">
              Note: If you start a new recording, you will lose the current one.
              Please download it first.
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
}

export default Recorder;
