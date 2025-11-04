import { clsx } from "clsx";
import Heading from "./Heading";
import {
  useState,
  Fragment,
  useRef,
  useImperativeHandle,
  useEffect,
  useMemo,
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
import { OscillatorWithChannel } from "../types/OscillatorWithChannel";
import { ModulationConnectionManager } from "../utils/modulationConnectionManager";

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
  oscillators?: OscillatorWithChannel[]; // Pass oscillator objects for modulation
}

function ModulationMatrix({
  ref,
  onParameterChange,
  oscillators = [],
}: ModulationMatrixProps) {
  const [expandMatrix, setExpandMatrix] = useState(false);
  const [lfoParams, setLfoParams] = useState<LFOParams[]>(DEFAULT_LFOS);
  const [routes, setRoutes] = useState<ModulationRoute[]>(DEFAULT_ROUTES);

  const { lfos, signals, setPolarityMode } = useModulationLFOs();
  const stateRef = useRef<ModulationMatrixState>({
    lfos: lfoParams,
    routes: routes,
  });

  // Create connection manager and depth multipliers refs
  const connectionManager = useMemo(() => new ModulationConnectionManager(), []);
  const depthMultipliersRef = useRef<Tone.Multiply[]>([]);

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

  // Apply modulation routes whenever routes or oscillators change
  useEffect(() => {
    // Disconnect all previous connections
    connectionManager.disconnectAll();

    const depthMultipliers = depthMultipliersRef.current;

    // Ensure depth multipliers array matches routes
    while (depthMultipliers.length < routes.length) {
      depthMultipliers.push(new Tone.Multiply(1));
    }
    while (depthMultipliers.length > routes.length) {
      const removed = depthMultipliers.pop();
      removed?.dispose();
    }

    // Connect each route
    routes.forEach((route, routeIndex) => {
      if (route.destination === "none") return;

      const lfoSignal = signals[route.sourceIndex];
      const depthMultiplier = depthMultipliers[routeIndex];
      
      if (!lfoSignal || !depthMultiplier) {
        console.warn(`Missing LFO signal or depth multiplier for route ${routeIndex}`);
        return;
      }

      // Update depth multiplier value
      const now = Tone.now();
      depthMultiplier.factor.cancelScheduledValues(now);
      depthMultiplier.factor.setTargetAtTime(route.amount, now, 0.015);

      // Parse destination to get oscillator index and parameter type
      const destinationParts = route.destination.split("-");
      const oscIndexStr = destinationParts[0]?.replace("osc", "");
      const paramType = destinationParts[1];

      if (!oscIndexStr || !paramType) {
        console.warn(`Invalid destination format: ${route.destination}`);
        return;
      }

      const oscIndex = parseInt(oscIndexStr) - 1; // Convert 1-based to 0-based
      const oscillator = oscillators[oscIndex];

      if (!oscillator) {
        console.warn(`Oscillator ${oscIndex + 1} not found`);
        return;
      }

      const connectionId = `${route.sourceIndex}-${route.destination}`;
      const polarityMode = lfoParams[route.sourceIndex]?.polarityMode || "bipolar";

      try {
        if (paramType === "frequency") {
          connectionManager.connectFrequency(
            connectionId,
            lfoSignal,
            depthMultiplier,
            route.destination,
            oscillator.oscillator.detune as unknown as Tone.Param<"cents">
          );
        } else if (paramType === "volume") {
          connectionManager.connectVolume(
            connectionId,
            lfoSignal,
            depthMultiplier,
            route.destination,
            oscillator.oscillator,
            oscillator.channel,
            polarityMode
          );
        } else if (paramType === "pan") {
          connectionManager.connectPan(
            connectionId,
            lfoSignal,
            depthMultiplier,
            route.destination,
            oscillator.channel.pan
          );
        }
      } catch (error) {
        console.error(`Error connecting route ${connectionId}:`, error);
      }
    });

    // Cleanup function to disconnect all on unmount
    return () => {
      connectionManager.disconnectAll();
    };
  }, [routes, signals, oscillators, lfoParams, connectionManager]);

  // Update depth multipliers when route amounts change
  useEffect(() => {
    const depthMultipliers = depthMultipliersRef.current;
    routes.forEach((route, index) => {
      const depthMultiplier = depthMultipliers[index];
      if (depthMultiplier) {
        const now = Tone.now();
        depthMultiplier.factor.cancelScheduledValues(now);
        depthMultiplier.factor.setTargetAtTime(route.amount, now, 0.015);
      }
    });
  }, [routes]);

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
