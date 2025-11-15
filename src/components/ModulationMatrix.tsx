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
import { useModulationRouting } from "../hooks/useModulationRouting";
import { useControlRateModulation } from "../hooks/useControlRateModulation";
import { useModulationDepth } from "../hooks/useModulationDepth";
import {
  ModulationMatrixState,
  ModulationMatrixHandle,
  ModulationRoute,
  LFOParams,
} from "../types/ModulationMatrixParams";
import { OscillatorWithChannel } from "../types/OscillatorWithChannel";
import { FilterHandle } from "../types/FilterParams";
import { DelayHandle } from "../types/DelayParams";
import { BitCrusherHandle } from "../types/BitCrusherParams";
import { ChebyshevHandle } from "../types/ChebyshevParams";
import { coerceParamToNumber } from "../utils/modulationRange";

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
  effectRefs?: {
    filterRef?: React.RefObject<FilterHandle | null>;
    delayRef?: React.RefObject<DelayHandle | null>;
    microRef?: React.RefObject<DelayHandle | null>;
    bitCrusherRef?: React.RefObject<BitCrusherHandle | null>;
    chebyshevRef?: React.RefObject<ChebyshevHandle | null>;
  };
}

function ModulationMatrix({
  ref,
  onParameterChange,
  oscillators = [],
  effects,
  effectRefs,
}: ModulationMatrixProps) {
  const [expandMatrix, setExpandMatrix] = useState(false);
  const [lfoParams, setLfoParams] = useState<LFOParams[]>(DEFAULT_LFOS);
  const [routes, setRoutes] = useState<ModulationRoute[]>(DEFAULT_ROUTES);

  const { lfos, signals, setPolarityMode } = useModulationLFOs();
  const stateRef = useRef<ModulationMatrixState>({
    lfos: lfoParams,
    routes: routes,
  });

  // Track route structure separately from amounts to avoid unnecessary reconnections
  const [routeStructure, setRouteStructure] = useState<string>("");

  const getRouteStructure = (routes: ModulationRoute[]): string => {
    return routes.map((r) => `${r.sourceIndex}-${r.destination}`).join("|");
  };

  // Update route structure state only when it actually changes
  useEffect(() => {
    const newStructure = getRouteStructure(routes);
    if (newStructure !== routeStructure) {
      setRouteStructure(newStructure);
    }
  }, [routes, routeStructure]);

  // Update ref whenever state changes
  useEffect(() => {
    stateRef.current = {
      lfos: lfoParams,
      routes: routes,
    };
  }, [lfoParams, routes]);

  // Control-rate modulation hook (provides sampleLfo function)
  const { sampleLfo } = useControlRateModulation({
    lfoParams,
    getControlRateUpdaters: () => buildControlRateUpdaters(),
  });

  // Modulation routing hook (handles all audio graph connections)
  const { depthMultipliersRef, hasConnectedRef, buildControlRateUpdaters } =
    useModulationRouting({
      routes,
      routeStructure,
      signals,
      lfos,
      lfoParams,
      oscillators,
      effects,
      effectRefs,
      sampleLfo,
    });

  // Modulation depth hook (handles real-time depth updates)
  const { updateDepth } = useModulationDepth({
    routes,
    oscillators,
    lfoParams,
    depthMultipliersRef,
    hasConnectedRef,
  });

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getState: (): ModulationMatrixState => stateRef.current,
    setState: (state: ModulationMatrixState) => {
      setLfoParams(state.lfos);
      setRoutes(state.routes);

      // Update LFO parameters
      // Using augmented Tone.js types from src/types/tone.d.ts
      state.lfos.forEach((params, i) => {
        if (lfos[i]) {
          lfos[i].frequency.value = params.frequency;
          // Only set type if the LFO has a type property (Tone.LFO does, SampleAndHoldLFO doesn't)
          if ('type' in lfos[i] && params.type !== "sampleandhold") {
            lfos[i].type = params.type;
          }
          lfos[i].amplitude.value = params.amplitude;
          if (params.polarityMode) {
            setPolarityMode(i, params.polarityMode);
          }
        }
      });
    },
  }));

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

                  // Skip updating Tremolo/AutoPanner for sample-and-hold
                  // (those effects don't support custom waveforms)
                  if (type === "sampleandhold") {
                    return;
                  }

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
          onAnchorToCurrent={(routeIndex: number) => {
            const route = routes[routeIndex];
            if (!route) return;
            const dest = route.destination;
            // Control-rate destinations
            if (dest === "bitcrusher-bits") {
              const bitCrusher = effects?.bitCrusher?.current;
              if (!bitCrusher) return;
              const current = coerceParamToNumber(
                (bitCrusher.bits as { value: unknown }).value,
                "normal"
              );
              const updated: Partial<ModulationRoute> =
                (route.rangeMode ?? "center") === "center"
                  ? { center: Math.max(1, Math.min(16, Math.round(current))) }
                  : {
                      min: Math.max(1, Math.round(current - 2)),
                      max: Math.min(16, Math.round(current + 2)),
                    };
              const newRoutes: ModulationRoute[] = routes.map((rt, i) =>
                i === routeIndex ? { ...rt, ...updated } : rt
              );
              setRoutes(newRoutes);
              return;
            }
            if (dest === "chebyshev-order") {
              const chebyshev = effects?.chebyshev?.current;
              if (!chebyshev) return;
              const current = coerceParamToNumber(chebyshev.order, "normal");
              const updated: Partial<ModulationRoute> =
                (route.rangeMode ?? "center") === "center"
                  ? { center: Math.max(1, Math.min(100, Math.round(current))) }
                  : {
                      min: Math.max(1, Math.round(current - 10)),
                      max: Math.min(100, Math.round(current + 10)),
                    };
              const newRoutes: ModulationRoute[] = routes.map((rt, i) =>
                i === routeIndex ? { ...rt, ...updated } : rt
              );
              setRoutes(newRoutes);
              return;
            }
            // Effect AudioParams - read from component state, not Tone.js params
            // (Tone.js params show 0 when LFO is connected)
            if (dest === "filter-frequency" && effectRefs?.filterRef?.current) {
              const params = effectRefs.filterRef.current.getParams();
              const current = params.frequency;
              const clamp = (v: number) => Math.max(30, Math.min(7000, v));
              const updated: Partial<ModulationRoute> =
                (route.rangeMode ?? "center") === "center"
                  ? { center: clamp(current) }
                  : {
                      min: clamp(current * 0.9),
                      max: clamp(current * 1.1),
                    };
              const newRoutes: ModulationRoute[] = routes.map((rt, i) =>
                i === routeIndex ? { ...rt, ...updated } : rt
              );
              setRoutes(newRoutes);
              return;
            }
            if (dest === "filter-q" && effectRefs?.filterRef?.current) {
              const params = effectRefs.filterRef.current.getParams();
              const current = params.Q;
              const clamp = (v: number) => Math.max(0, Math.min(9, v));
              const updated: Partial<ModulationRoute> =
                (route.rangeMode ?? "center") === "center"
                  ? { center: clamp(current) }
                  : {
                      min: clamp(current - 0.5),
                      max: clamp(current + 0.5),
                    };
              const newRoutes: ModulationRoute[] = routes.map((rt, i) =>
                i === routeIndex ? { ...rt, ...updated } : rt
              );
              setRoutes(newRoutes);
              return;
            }
            if (dest === "delay-time" && effectRefs?.delayRef?.current) {
              const params = effectRefs.delayRef.current.getParams();
              const current = params.time;
              const clamp = (v: number) => Math.max(0, Math.min(1, v));
              const updated: Partial<ModulationRoute> =
                (route.rangeMode ?? "center") === "center"
                  ? { center: clamp(current) }
                  : {
                      min: clamp(current - 0.05),
                      max: clamp(current + 0.05),
                    };
              const newRoutes: ModulationRoute[] = routes.map((rt, i) =>
                i === routeIndex ? { ...rt, ...updated } : rt
              );
              setRoutes(newRoutes);
              return;
            }
            if (dest === "delay-feedback" && effectRefs?.delayRef?.current) {
              const params = effectRefs.delayRef.current.getParams();
              const current = params.feedback;
              const clamp = (v: number) => Math.max(0, Math.min(0.95, v));
              const updated: Partial<ModulationRoute> =
                (route.rangeMode ?? "center") === "center"
                  ? { center: clamp(current) }
                  : {
                      min: clamp(current - 0.1),
                      max: clamp(current + 0.1),
                    };
              const newRoutes: ModulationRoute[] = routes.map((rt, i) =>
                i === routeIndex ? { ...rt, ...updated } : rt
              );
              setRoutes(newRoutes);
              return;
            }
            if (dest === "micro-time" && effectRefs?.microRef?.current) {
              const params = effectRefs.microRef.current.getParams();
              const current = params.time;
              const clamp = (v: number) => Math.max(0, Math.min(1, v));
              const updated: Partial<ModulationRoute> =
                (route.rangeMode ?? "center") === "center"
                  ? { center: clamp(current) }
                  : {
                      min: clamp(current - 0.05),
                      max: clamp(current + 0.05),
                    };
              const newRoutes: ModulationRoute[] = routes.map((rt, i) =>
                i === routeIndex ? { ...rt, ...updated } : rt
              );
              setRoutes(newRoutes);
              return;
            }
            if (dest === "micro-feedback" && effectRefs?.microRef?.current) {
              const params = effectRefs.microRef.current.getParams();
              const current = params.feedback;
              const clamp = (v: number) => Math.max(0, Math.min(0.95, v));
              const updated: Partial<ModulationRoute> =
                (route.rangeMode ?? "center") === "center"
                  ? { center: clamp(current) }
                  : {
                      min: clamp(current - 0.1),
                      max: clamp(current + 0.1),
                    };
              const newRoutes: ModulationRoute[] = routes.map((rt, i) =>
                i === routeIndex ? { ...rt, ...updated } : rt
              );
              setRoutes(newRoutes);
              return;
            }
          }}
        />
      </div>
    </Fragment>
  );
}

export default ModulationMatrix;
