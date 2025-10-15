import { useRef } from "react";
import DroneSynthLite, { DroneSynthLiteHandle } from "./components/DroneSynthLite";
import ThemeControls from "./components/ThemeControls";
import PresetManager, { PresetManagerHandle } from "./components/PresetManager";
import { AudioContextProvider } from "./context/audio";

function App() {
  const droneSynthRef = useRef<DroneSynthLiteHandle>(null);
  const presetManagerRef = useRef<PresetManagerHandle>(null);

  return (
    <AudioContextProvider>
      <div className="text-pink-900 dark:text-sky-300">
        <div className="flex justify-between items-center space-x-2 my-5 mx-5">
          <ThemeControls />
          <PresetManager droneSynthRef={droneSynthRef} ref={presetManagerRef} />
        </div>
        <div className="m-4">
          <DroneSynthLite
            ref={droneSynthRef}
            onParameterChange={() => presetManagerRef.current?.markAsModified()}
          />
        </div>
      </div>
    </AudioContextProvider>
  );
}

export default App;
