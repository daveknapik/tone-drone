import { useEffect, useState } from "react";
import DroneSynth from "./components/DroneSynth";
import * as Tone from "tone";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedDarkModeSetting = localStorage.getItem("dark");

    // use the localStorage value if it exists, otherwise use false
    const initialValue: boolean = savedDarkModeSetting
      ? JSON.parse(savedDarkModeSetting)
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
    } finally {
      setIsAudioEnabled(true);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className="dark:text-sky-300">
      <div className="flex space-x-2 my-5 ml-5">
        <button className="border-2 rounded-md px-2 py-1" onClick={handleStart}>
          Power: {isAudioEnabled ? "On" : "Off"}
        </button>
        <button
          className="border-2 rounded-md px-2 py-1"
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
