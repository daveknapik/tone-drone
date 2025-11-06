import { clsx } from "clsx";
import Heading from "./Heading";
import {
  useState,
  Fragment,
  useRef,
  useImperativeHandle,
  useEffect,
  useMemo,
  useCallback,
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
  effects?: {
    filter?: React.RefObject<Tone.Filter>;
    delay?: React.RefObject<Tone.FeedbackDelay>;
    micro?: React.RefObject<Tone.FeedbackDelay>;
    bitCrusher?: React.RefObject<Tone.BitCrusher>;
    chebyshev?: React.RefObject<Tone.Chebyshev>;
  };
}

function ModulationMatrix({
  ref,
  onParameterChange,
  oscillators = [],
  effects,
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
  const connectionManager = useMemo(
    () => new ModulationConnectionManager(),
    []
  );
  const depthMultipliersRef = useRef<Tone.Multiply[]>([]);

  // Track route structure separately from amounts to avoid unnecessary reconnections
  const routeStructureRef = useRef<string>("");
  const hasConnectedRef = useRef<boolean>(false);
  const getRouteStructure = (routes: ModulationRoute[]): string => {
    return routes.map((r) => `${r.sourceIndex}-${r.destination}`).join("|");
  };

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

  // Apply modulation routes ONLY when route structure changes (not amounts!)
  useEffect(() => {
    const currentStructure = getRouteStructure(routes);

    // Skip if structure unchanged AND we've already connected with current oscillators
    const structureUnchanged = currentStructure === routeStructureRef.current;
    const hasOscillators = oscillators.length > 0;

    if (structureUnchanged && hasConnectedRef.current && hasOscillators) {
      return; // Skip reconnection, structure hasn't changed and we're already connected
    }

    // If no oscillators yet, wait for them
    if (!hasOscillators) {
      hasConnectedRef.current = false;
      return;
    }

    routeStructureRef.current = currentStructure;

    // Disconnect all previous connections
    connectionManager.disconnectAll();
    hasConnectedRef.current = false;

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
        console.warn(
          `Missing LFO signal or depth multiplier for route ${routeIndex}`
        );
        return;
      }

      // Set initial depth multiplier value
      depthMultiplier.factor.value = route.amount;

      const connectionId = `${route.sourceIndex}-${route.destination}`;

      try {
        // Oscillator destinations
        const re = /^osc(\d+)-(frequency|volume|pan)$/;
        const m = re.exec(route.destination);
        if (m) {
          const oscIndex = parseInt(m[1]) - 1;
          const paramType = m[2] as "frequency" | "volume" | "pan";
          const oscillator = oscillators[oscIndex];
          if (!oscillator) {
            console.warn(`Oscillator ${oscIndex + 1} not found`);
            return;
          }
          if (paramType === "frequency") {
            connectionManager.connectFrequency(
              connectionId,
              lfoSignal as unknown as Tone.Signal,
              depthMultiplier,
              route.destination,
              oscillator.oscillator.detune as unknown as Tone.Param<"cents">
            );
            return;
          }
          if (paramType === "volume") {
            const lfoObj = lfos[route.sourceIndex];
            const initialDepth =
              (lfoParams[route.sourceIndex]?.amplitude ?? 1) * route.amount;
            connectionManager.connectVolumeEffect(
              connectionId,
              lfoObj,
              initialDepth,
              route.destination,
              oscillator.tremolo
            );
            return;
          }
          if (paramType === "pan") {
            const lfoObj = lfos[route.sourceIndex];
            const initialDepth =
              (lfoParams[route.sourceIndex]?.amplitude ?? 1) * route.amount;
            connectionManager.connectPanEffect(
              connectionId,
              lfoObj,
              initialDepth,
              route.destination,
              oscillator.autoPanner
            );
            return;
          }
        }

        // Effect destinations
        if (route.destination === "filter-q" && effects?.filter?.current) {
          connectionManager.connectFilterQ(
            connectionId,
            lfoSignal as unknown as Tone.Signal,
            depthMultiplier,
            route.destination,
            effects.filter.current
          );
          return;
        }
        if (
          route.destination === "filter-frequency" &&
          effects?.filter?.current
        ) {
          connectionManager.connectFilterFrequency(
            connectionId,
            lfoSignal as unknown as Tone.Signal,
            depthMultiplier,
            route.destination,
            effects.filter.current
          );
          return;
        }
        if (route.destination === "micro-time" && effects?.micro?.current) {
          connectionManager.connectDelayTime(
            connectionId,
            lfoSignal as unknown as Tone.Signal,
            depthMultiplier,
            route.destination,
            effects.micro.current
          );
          return;
        }
        if (route.destination === "micro-feedback" && effects?.micro?.current) {
          connectionManager.connectDelayFeedback(
            connectionId,
            lfoSignal as unknown as Tone.Signal,
            depthMultiplier,
            route.destination,
            effects.micro.current
          );
          return;
        }
        // wet destinations removed to preserve manual control
        if (
          route.destination === "bitcrusher-bits" &&
          effects?.bitCrusher?.current
        ) {
          connectionManager.connectBitCrusherBits(
            connectionId,
            lfoSignal as unknown as Tone.Signal,
            depthMultiplier,
            route.destination,
            effects.bitCrusher.current
          );
          return;
        }
        // Chebyshev order is not an AudioParam; skip audio-rate modulation to avoid runtime errors
        if (route.destination === "delay-feedback" && effects?.delay?.current) {
          connectionManager.connectDelayFeedback(
            connectionId,
            lfoSignal as unknown as Tone.Signal,
            depthMultiplier,
            route.destination,
            effects.delay.current
          );
          return;
        }
        if (route.destination === "delay-time" && effects?.delay?.current) {
          connectionManager.connectDelayTime(
            connectionId,
            lfoSignal as unknown as Tone.Signal,
            depthMultiplier,
            route.destination,
            effects.delay.current
          );
          return;
        }

        console.warn(`Unsupported destination: ${route.destination}`);
      } catch (error) {
        console.error(`Error connecting route ${connectionId}:`, error);
      }
    });

    // Mark as connected after successful setup
    hasConnectedRef.current = true;

    // Cleanup function to disconnect all on unmount
    return () => {
      connectionManager.disconnectAll();
      hasConnectedRef.current = false;
    };
  }, [routes, signals, oscillators, lfoParams, connectionManager]);

  // Direct immediate updates - exactly like modulation-reference.html
  const updateDepth = useCallback(
    (routeIndex: number, amount: number) => {
      const route = routes[routeIndex];
      if (!route) return;
      const re = /^osc(\d+)-(frequency|volume|pan)$/;
      const exec = re.exec(route.destination);
      const paramType = exec?.[2];
      const oscIndex = exec ? parseInt(exec[1]) - 1 : -1;
      const oscillator = oscillators[oscIndex];

      if (paramType === "volume" && oscillator) {
        const lfoAmp = lfoParams[route.sourceIndex]?.amplitude ?? 1;
        const target = Math.max(0, Math.min(1, 0.05 + amount * lfoAmp * 1.25));
        oscillator.tremolo.depth.rampTo(target, 0.05);
        return;
      }
      if (paramType === "pan" && oscillator) {
        const lfoAmp = lfoParams[route.sourceIndex]?.amplitude ?? 1;
        const target = amount * lfoAmp;
        oscillator.autoPanner.depth.rampTo(target, 0.05);
        return;
      }

      // Frequency route: use depth multiplier
      const depthMultiplier = depthMultipliersRef.current[routeIndex];
      if (depthMultiplier && hasConnectedRef.current) {
        depthMultiplier.factor.rampTo(amount, 0.02);
      }
    },
    [routes, oscillators, lfoParams, hasConnectedRef.current]
  );

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
                initialPolarityMode={lfoParams[i]?.polarityMode ?? "bipolar"}
                onFrequencyChange={(freq) => {
                  handleLfoParamsUpdate(i, { frequency: freq });
                  // Sync effect LFOs for volume/pan routes from this LFO
                  routes.forEach((route) => {
                    if (route.sourceIndex !== i) return;
                    const re = /^osc(\d+)-(frequency|volume|pan)$/;
                    const m = re.exec(route.destination);
                    if (!m) return;
                    const paramType = m[2];
                    const oscIndex = parseInt(m[1]) - 1;
                    const oscillator = oscillators[oscIndex];
                    if (!oscillator) return;
                    if (paramType === "volume") {
                      oscillator.tremolo.frequency.value = freq;
                    } else if (paramType === "pan") {
                      oscillator.autoPanner.frequency.value = freq;
                    }
                  });
                }}
                onTypeChange={(type) => {
                  handleLfoParamsUpdate(i, { type });
                  routes.forEach((route) => {
                    if (route.sourceIndex !== i) return;
                    const re = /^osc(\d+)-(frequency|volume|pan)$/;
                    const m = re.exec(route.destination);
                    if (!m) return;
                    const paramType = m[2];
                    const oscIndex = parseInt(m[1]) - 1;
                    const oscillator = oscillators[oscIndex];
                    if (!oscillator) return;
                    if (paramType === "volume") {
                      (oscillator.tremolo as unknown as { type: string }).type =
                        type as unknown as string;
                    } else if (paramType === "pan") {
                      const ap = oscillator.autoPanner as unknown as {
                        type?: string;
                      };
                      if (ap.type !== undefined) {
                        ap.type = type as unknown as string;
                      }
                    }
                  });
                }}
                onAmplitudeChange={(amp) => {
                  handleLfoParamsUpdate(i, { amplitude: amp });
                  routes.forEach((route) => {
                    if (route.sourceIndex !== i) return;
                    const re = /^osc(\d+)-(frequency|volume|pan)$/;
                    const m = re.exec(route.destination);
                    if (!m) return;
                    const paramType = m[2];
                    const oscIndex = parseInt(m[1]) - 1;
                    const oscillator = oscillators[oscIndex];
                    if (!oscillator) return;
                    const target = Math.max(
                      0,
                      Math.min(1, 0.05 + (route.amount ?? 0) * amp * 1.25)
                    );
                    if (paramType === "volume") {
                      oscillator.tremolo.depth.rampTo(target, 0.05);
                    } else if (paramType === "pan") {
                      oscillator.autoPanner.depth.rampTo(
                        (route.amount ?? 0) * amp,
                        0.05
                      );
                    }
                  });
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
          onDepthChange={updateDepth}
        />
      </div>
    </Fragment>
  );
}

export default ModulationMatrix;
