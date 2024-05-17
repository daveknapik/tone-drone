import * as Tone from "tone";

import DroneSynth from "./components/DroneSynth";

import { useState } from "react";
import { useDarkMode } from "./hooks/useDarkMode";

function App() {
  const [isDarkMode, toggleDarkMode] = useDarkMode();
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
    <div className="text-pink-900 dark:text-sky-300">
      <div className="flex space-x-2 my-5 ml-5">
        <button
          className="border-2 rounded-md border-pink-500 dark:border-sky-300 px-2 py-1"
          onClick={toggleDarkMode}
        >
          Theme: {isDarkMode ? "Dark" : "Light"}
        </button>
      </div>
      <div className="m-4">
        <DroneSynth handleBrowserAudioStart={handleBrowserAudioStart} />
      </div>
    </div>
  );
}

export default App;
