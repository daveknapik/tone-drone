import { clsx } from "clsx";
import Heading from "./Heading";
import {
  useState,
  Fragment,
  useRef,
  useImperativeHandle,
  useEffect,
} from "react";
import * as Tone from "tone";
import ModulationLFO from "./ModulationLFO";
import ModulationMatrixGrid from "./ModulationMatrixGrid";
import { useModulationLFOs } from "../hooks/useModulationLFOs";
import {
  ModulationMatrixState,
  ModulationMatrixHandle,
  ModulationRoute,
  LFOParams,
} from "../types/ModulationMatrixParams";

const DEFAULT_LFOS: LFOParams[] = [
  { frequency: 0.5, type: "sine", amplitude: 1, polarityMode: "bipolar" },
  { frequency: 1, type: "triangle", amplitude: 1, polarityMode: "bipolar" },
  { frequency: 2, type: "square", amplitude: 1, polarityMode: "bipolar" },
  { frequency: 4, type: "sawtooth", amplitude: 1, polarityMode: "bipolar" },
];

const DEFAULT_ROUTES: ModulationRoute[] = [];

interface ModulationMatrixProps {
  ref?: React.Ref<ModulationMatrixHandle>;
  onParameterChange?: () => void;
  oscillatorChannels?: Tone.Channel[]; // Pass oscillator channels for routing
}

function ModulationMatrix({
  ref,
  onParameterChange,
  oscillatorChannels = [],
}: ModulationMatrixProps) {
  const [expandMatrix, setExpandMatrix] = useState(false);
  const [lfoParams, setLfoParams] = useState<LFOParams[]>(DEFAULT_LFOS);
  const [routes, setRoutes] = useState<ModulationRoute[]>(DEFAULT_ROUTES);

  const { lfos, signals, setPolarityMode, getPolarityMode } = useModulationLFOs();
  const stateRef = useRef<ModulationMatrixState>({
    lfos: lfoParams,
    routes: routes,
  });

  // Update ref whenever state changes
  useEffect(() => {
    stateRef.current = {
      lfos: lfoParams,
      routes: routes,
    };
  }, [lfoParams, routes]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getState: (): ModulationMatrixState => stateRef.current,
    setState: (state: ModulationMatrixState) => {
      setLfoParams(state.lfos);
      setRoutes(state.routes);

      // Update LFO parameters
      state.lfos.forEach((params, i) => {
        if (lfos[i]) {
          lfos[i].frequency.value = params.frequency;
          lfos[i].type = params.type;
          lfos[i].amplitude.value = params.amplitude;
          if (params.polarityMode) {
            setPolarityMode(i, params.polarityMode);
          }
        }
      });
    },
  }));

  // Apply modulation routes
  useEffect(() => {
    // For now, this is a placeholder for actual routing logic
    // In a full implementation, you would:
    // 1. Disconnect all previous connections
    // 2. Connect LFO signals to their destinations based on routes
    // 3. Scale the signal by the amount parameter

    routes.forEach((route) => {
      if (route.destination === "none") return;

      const lfoSignal = signals[route.sourceIndex];
      if (!lfoSignal) return;

      // Example routing logic (would need to be expanded)
      // This would connect the LFO to the appropriate parameter
      // based on the destination string

      // TODO: Implement actual routing to oscillator parameters
      console.log(
        `Route: LFO ${route.sourceIndex} -> ${route.destination} (${route.amount})`
      );
    });
  }, [routes, signals, oscillatorChannels]);

  const toggleExpandMatrix = (): void => {
    setExpandMatrix((prev) => !prev);
  };

  const handleLfoParamsUpdate = (
    index: number,
    updates: Partial<LFOParams>
  ): void => {
    const newParams = [...lfoParams];
    newParams[index] = { ...newParams[index], ...updates };
    setLfoParams(newParams);
  };

  return (
    <Fragment>
      <Heading expanded={expandMatrix} toggleExpanded={toggleExpandMatrix}>
        Modulation Matrix
      </Heading>
      <div
        className={clsx(
          "sm:border-2 sm:rounded sm:border-pink-500 dark:sm:border-sky-300 p-5 mb-3",
          !expandMatrix && "hidden"
        )}
      >
        {/* LFO Controls */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-pink-500 dark:text-sky-300">
            LFO Sources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {lfos.map((lfo, i) => (
              <ModulationLFO
                key={i}
                lfo={lfo}
                lfoIndex={i}
                initialFrequency={lfoParams[i]?.frequency}
                initialType={lfoParams[i]?.type}
                initialAmplitude={lfoParams[i]?.amplitude}
                initialPolarityMode={lfoParams[i]?.polarityMode || "bipolar"}
                onFrequencyChange={(freq) => {
                  handleLfoParamsUpdate(i, { frequency: freq });
                }}
                onTypeChange={(type) => {
                  handleLfoParamsUpdate(i, { type });
                }}
                onAmplitudeChange={(amp) => {
                  handleLfoParamsUpdate(i, { amplitude: amp });
                }}
                onPolarityModeChange={(mode) => {
                  setPolarityMode(i, mode);
                  handleLfoParamsUpdate(i, { polarityMode: mode });
                }}
                onParameterChange={onParameterChange}
              />
            ))}
          </div>
        </div>

        <hr className="my-6 border-pink-500 dark:border-sky-300" />

        {/* Modulation Routing Grid */}
        <ModulationMatrixGrid
          routes={routes}
          onRoutesChange={setRoutes}
          onParameterChange={onParameterChange}
        />
      </div>
    </Fragment>
  );
}

export default ModulationMatrix;
