import DroneSynthLite from "./components/DroneSynthLite";
import ThemeControls from "./components/ThemeControls";
import { AudioContextProvider } from "./context/audio";

function App() {
  return (
    <AudioContextProvider>
      <div className="text-pink-900 dark:text-sky-300">
        <div className="flex space-x-2 my-5 ml-5">
          <ThemeControls />
        </div>
        <div className="m-4">
          <DroneSynthLite />
        </div>
      </div>
    </AudioContextProvider>
  );
}

export default App;
