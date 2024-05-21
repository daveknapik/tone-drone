import DroneSynth from "./components/DroneSynth";
import { AudioContextProvider } from "./context/audio";

import { useDarkMode } from "./hooks/useDarkMode";

function App() {
  const [isDarkMode, toggleDarkMode] = useDarkMode();

  return (
    <AudioContextProvider>
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
          <DroneSynth />
        </div>
      </div>
    </AudioContextProvider>
  );
}

export default App;
