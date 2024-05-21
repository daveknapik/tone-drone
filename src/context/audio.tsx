import * as Tone from "tone";

import { createContext, useState } from "react";

interface AudioContextInterface {
  handleBrowserAudioStart: () => Promise<void>;
}

const AudioContext = createContext<AudioContextInterface | null>(null);

function AudioContextProvider({ children }: { children: React.ReactNode }) {
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

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

  return (
    <AudioContext.Provider value={{ handleBrowserAudioStart }}>
      {children}
    </AudioContext.Provider>
  );
}

export { AudioContextProvider };
export default AudioContext;
