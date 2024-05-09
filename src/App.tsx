import { useEffect, useState } from "react";
import DroneSynth from "./components/DroneSynth";
import * as Tone from "tone";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedDarkModeSetting = localStorage.getItem("dark");

    // use the localStorage value if it exists, otherwise use false
    const initialValue: boolean = savedDarkModeSetting
      ? (JSON.parse(savedDarkModeSetting) as boolean)
      : false;
    return initialValue;
  });

  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("dark", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("dark", "false");
    }
  }, [isDarkMode]);

  const handleStart = async () => {
    try {
      await Tone.start();
    } catch {
      setIsAudioEnabled(false);
    } finally {
      setIsAudioEnabled(true);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className="text-pink-900 dark:text-sky-300">
      <div className="flex space-x-2 my-5 ml-5">
        <button
          className="border-2 rounded-md border-pink-500 dark:border-sky-300 px-2 py-1"
          onClick={() => {
            void handleStart();
          }}
        >
          Power: {isAudioEnabled ? "On" : "Off"}
        </button>
        <button
          className="border-2 rounded-md border-pink-500 dark:border-sky-300 px-2 py-1"
          onClick={toggleDarkMode}
        >
          Theme: {isDarkMode ? "Dark" : "Light"}
        </button>
      </div>
      <div className="m-4">
        <DroneSynth />
      </div>
    </div>
  );
}

export default App;
