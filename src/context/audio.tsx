import * as Tone from "tone";

import { createContext, useState } from "react";

interface AudioContextInterface {
  handleBrowserAudioStart: () => Promise<void>;
  isTransportRunning: boolean;
  toggleTransport: () => void;
}

const AudioContext = createContext<AudioContextInterface | null>(null);

function AudioContextProvider({ children }: { children: React.ReactNode }) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isTransportRunning, setIsTransportRunning] = useState(false);

  const handleBrowserAudioStart = async () => {
    if (!isAudioEnabled) {
      try {
        await Tone.start();
      } catch {
        setIsAudioEnabled(false);
      } finally {
        setIsAudioEnabled(true);
      }
    }
  };

  const toggleTransport = () => {
    if (isTransportRunning) {
      Tone.getTransport().stop();
    } else {
      Tone.getTransport().start();
    }
    console.log("isTransportRunning", isTransportRunning);

    setIsTransportRunning(!isTransportRunning);
  };

  return (
    <AudioContext.Provider
      value={{
        handleBrowserAudioStart,
        isTransportRunning,
        toggleTransport,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export { AudioContextProvider };
export default AudioContext;
