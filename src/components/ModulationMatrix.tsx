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
import { FilterHandle } from "../types/FilterParams";
import { DelayHandle } from "../types/DelayParams";
import { BitCrusherHandle } from "../types/BitCrusherParams";
import { ChebyshevHandle } from "../types/ChebyshevParams";
import { ModulationConnectionManager } from "../utils/modulationConnectionManager";
import {
  coerceParamToNumber,
  defaultsForDestination,
  computeRouteRange,
} from "../utils/modulationRange";

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

  // Create connection manager and depth multipliers refs
  const connectionManager = useMemo(
    () => new ModulationConnectionManager(),
    []
  );
  const depthMultipliersRef = useRef<Tone.Multiply[]>([]);
  // Control-rate routes for non-AudioParams
  const controlRoutesRef = useRef<
    {
      lfoIndex: number;
      dest: "bitcrusher-bits" | "chebyshev-order";
      amount: number;
      update: () => void;
    }[]
  >([]);
  const lfoPhaseRef = useRef<number[]>([0, 0, 0, 0]);
  const lastUpdateTimeRef = useRef<number>(0);

  // Track route structure separately from amounts to avoid unnecessary reconnections
  const routeStructureRef = useRef<string>("");
  const hasConnectedRef = useRef<boolean>(false);
  const routesRef = useRef<ModulationRoute[]>(routes);
  const [routeStructure, setRouteStructure] = useState<string>("");
  const lastConnectionIdsRef = useRef<Set<string>>(new Set());

  const getRouteStructure = (routes: ModulationRoute[]): string => {
    return routes.map((r) => `${r.sourceIndex}-${r.destination}`).join("|");
  };

  // Update route structure state only when it actually changes
  useEffect(() => {
    routesRef.current = routes;
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

  // Live-apply per-route ranges to audio-rate routes by updating Scale nodes
  useEffect(() => {
    routes.forEach((route) => {
      const dest = route.destination;
      const def = defaultsForDestination(dest);
      if (!def) {
        return;
      }
      // Only destinations handled via audio-rate Scale nodes:
      const isAudioScale =
        dest === "delay-time" ||
        dest === "delay-feedback" ||
        dest === "micro-time" ||
        dest === "micro-feedback";
      if (!isAudioScale) return;
      const connectionId = `${route.sourceIndex}-${route.destination}`;
      const hasConn = connectionManager.hasConnection(connectionId);
      if (!hasConn) return;
      // Apply depth to the range for audio-rate Scale nodes
      const [min, max] = computeRouteRange(dest, route, def, true);
      connectionManager.updateScaleRange(connectionId, min, max);
    });
  }, [routes, connectionManager]);

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
          // Narrow to expected LFO waveform type
          const wave = params.type as unknown as
            | "sine"
            | "square"
            | "triangle"
            | "sawtooth";
          (
            lfos[i] as unknown as {
              type: "sine" | "square" | "triangle" | "sawtooth";
            }
          ).type = wave;
          lfos[i].amplitude.value = params.amplitude;
          if (params.polarityMode) {
            setPolarityMode(i, params.polarityMode);
          }
        }
      });
    },
  }));

  // Capture parameter values when destinations are first set, BEFORE LFO connections override them
  // Auto-capture useEffect removed - user prefers manual range entry

  // Apply modulation routes ONLY when route structure changes (not amounts!)
  useEffect(() => {
    const routes = routesRef.current;
    const currentStructure = routeStructure;

    const hasOscillators = oscillators.length > 0;
    if (!hasOscillators) {
      hasConnectedRef.current = false;
      return;
    }

    // Reconcile: compute new set of connection IDs
    const newIds = new Set<string>();
    routes.forEach((r) => {
      if (r.destination !== "none")
        newIds.add(`${r.sourceIndex}-${r.destination}`);
    });

    // Disconnect only those that no longer exist
    lastConnectionIdsRef.current.forEach((id) => {
      if (!newIds.has(id)) {
        connectionManager.disconnect(id);
        // After disconnect, restore target param to current UI value to avoid stale/extreme values
        const [, dest] = id.split("-");
        try {
          if (
            dest === "filter-frequency" &&
            effects?.filter?.current &&
            effectRefs?.filterRef?.current
          ) {
            const p = effectRefs.filterRef.current.getParams();
            effects.filter.current.set({
              frequency: p.frequency,
              Q: p.Q,
              type: p.type,
            });
            effects.filter.current.rolloff = p.rolloff;
            (
              effects.filter.current.frequency as unknown as {
                cancelScheduledValues?: (t: number) => void;
              }
            ).cancelScheduledValues?.(0);
            (
              effects.filter.current.Q as unknown as {
                cancelScheduledValues?: (t: number) => void;
              }
            ).cancelScheduledValues?.(0);
            // Nudge underlying biquad to ensure state is refreshed
            const prevType = effects.filter.current.type;
            effects.filter.current.type =
              prevType === "lowpass" ? "highpass" : "lowpass";
            effects.filter.current.type = prevType;
            const prevRolloff = effects.filter.current.rolloff;
            effects.filter.current.rolloff = -24;
            effects.filter.current.rolloff = prevRolloff;
          } else if (
            dest === "filter-q" &&
            effects?.filter?.current &&
            effectRefs?.filterRef?.current
          ) {
            const p = effectRefs.filterRef.current.getParams();
            effects.filter.current.set({
              frequency: p.frequency,
              Q: p.Q,
              type: p.type,
            });
            effects.filter.current.rolloff = p.rolloff;
            (
              effects.filter.current.Q as unknown as {
                cancelScheduledValues?: (t: number) => void;
              }
            ).cancelScheduledValues?.(0);
            (
              effects.filter.current.frequency as unknown as {
                cancelScheduledValues?: (t: number) => void;
              }
            ).cancelScheduledValues?.(0);
            // Nudge underlying biquad to ensure state is refreshed
            const prevType = effects.filter.current.type;
            effects.filter.current.type =
              prevType === "lowpass" ? "highpass" : "lowpass";
            effects.filter.current.type = prevType;
            const prevRolloff = effects.filter.current.rolloff;
            effects.filter.current.rolloff = -24;
            effects.filter.current.rolloff = prevRolloff;
          } else if (
            dest === "delay-time" &&
            effects?.delay?.current &&
            effectRefs?.delayRef?.current
          ) {
            const p = effectRefs.delayRef.current.getParams();
            effects.delay.current.delayTime.value = p.time as unknown as number;
            effects.delay.current.feedback.value =
              p.feedback as unknown as number;
            (
              effects.delay.current.delayTime as unknown as {
                cancelScheduledValues?: (t: number) => void;
              }
            ).cancelScheduledValues?.(0);
            (
              effects.delay.current.feedback as unknown as {
                cancelScheduledValues?: (t: number) => void;
              }
            ).cancelScheduledValues?.(0);
          } else if (
            dest === "delay-feedback" &&
            effects?.delay?.current &&
            effectRefs?.delayRef?.current
          ) {
            const p = effectRefs.delayRef.current.getParams();
            effects.delay.current.delayTime.value = p.time as unknown as number;
            effects.delay.current.feedback.value =
              p.feedback as unknown as number;
            (
              effects.delay.current.feedback as unknown as {
                cancelScheduledValues?: (t: number) => void;
              }
            ).cancelScheduledValues?.(0);
            (
              effects.delay.current.delayTime as unknown as {
                cancelScheduledValues?: (t: number) => void;
              }
            ).cancelScheduledValues?.(0);
          } else if (
            dest === "micro-time" &&
            effects?.micro?.current &&
            effectRefs?.microRef?.current
          ) {
            const p = effectRefs.microRef.current.getParams();
            effects.micro.current.delayTime.value = p.time as unknown as number;
            effects.micro.current.feedback.value =
              p.feedback as unknown as number;
            (
              effects.micro.current.delayTime as unknown as {
                cancelScheduledValues?: (t: number) => void;
              }
            ).cancelScheduledValues?.(0);
            (
              effects.micro.current.feedback as unknown as {
                cancelScheduledValues?: (t: number) => void;
              }
            ).cancelScheduledValues?.(0);
          } else if (
            dest === "micro-feedback" &&
            effects?.micro?.current &&
            effectRefs?.microRef?.current
          ) {
            const p = effectRefs.microRef.current.getParams();
            effects.micro.current.delayTime.value = p.time as unknown as number;
            effects.micro.current.feedback.value =
              p.feedback as unknown as number;
            (
              effects.micro.current.feedback as unknown as {
                cancelScheduledValues?: (t: number) => void;
              }
            ).cancelScheduledValues?.(0);
            (
              effects.micro.current.delayTime as unknown as {
                cancelScheduledValues?: (t: number) => void;
              }
            ).cancelScheduledValues?.(0);
          }
        } catch {
          // noop: defensive only
        }
      }
    });

    routeStructureRef.current = currentStructure;

    const depthMultipliers = depthMultipliersRef.current;

    // Ensure depth multipliers array matches routes
    while (depthMultipliers.length < routes.length) {
      depthMultipliers.push(new Tone.Multiply(1));
    }
    while (depthMultipliers.length > routes.length) {
      const removed = depthMultipliers.pop();
      removed?.dispose();
    }

    // Reset control routes
    controlRoutesRef.current = [];

    hasConnectedRef.current = true;

    // Connect any missing routes, leave existing ones intact
    routes.forEach((route, routeIndex) => {
      if (route.destination === "none") {
        return;
      }

      const lfoSignal = signals[route.sourceIndex];
      const depthMultiplier = depthMultipliers[routeIndex];

      if (!lfoSignal || !depthMultiplier) {
        console.warn(
          `Missing LFO signal or depth multiplier for route ${routeIndex}`
        );
        return;
      }

      const isAudioScaleDest =
        route.destination === "filter-q" ||
        route.destination === "filter-frequency" ||
        route.destination === "delay-time" ||
        route.destination === "delay-feedback" ||
        route.destination === "micro-time" ||
        route.destination === "micro-feedback";

      // Set depth multiplier value: 1 for audio-rate Scale destinations, route.amount for others
      depthMultiplier.factor.value = isAudioScaleDest ? 1 : route.amount;

      const connectionId = `${route.sourceIndex}-${route.destination}`;
      const alreadyConnected = connectionManager.hasConnection(connectionId);
      if (alreadyConnected) return; // keep existing wiring

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
          const lfoIdx = route.sourceIndex;
          const amount = route.amount;
          const node = effects.filter.current;
          let lastLogMs = 0;
          controlRoutesRef.current.push({
            lfoIndex: lfoIdx,
            dest: "chebyshev-order", // unused here, but keep shape
            amount,
            update: () => {
              const r: ModulationRoute = route;
              const lp = lfoParams[lfoIdx];
              const amp = lp?.amplitude ?? 1;
              const depth = Math.max(0, Math.min(1, amount * amp));
              const sample = sampleLfo(lfoIdx, (lp?.type ?? "sine") as string);
              const unipolar = (sample + 1) * 0.5;
              const defMin = 0;
              const defMax = 9;
              let valNum: number;
              if ((r.rangeMode ?? "center") === "center") {
                const centerVal =
                  typeof r.center === "number"
                    ? r.center
                    : (defMin + defMax) / 2;
                let amountRangeVal =
                  typeof r.rangeAmount === "number"
                    ? r.rangeAmount
                    : (defMax - defMin) / 4;
                if (amountRangeVal < 0) amountRangeVal = 0;
                const bipolar = sample * depth;
                valNum = centerVal + bipolar * amountRangeVal;
              } else {
                const minVal = typeof r.min === "number" ? r.min : defMin;
                const maxVal = typeof r.max === "number" ? r.max : defMax;
                let span = maxVal - minVal;
                if (span < 0) span = 0;
                valNum = minVal + unipolar * depth * span;
              }
              const v = Math.max(defMin, Math.min(defMax, valNum));
              node.Q.value = v;
              const now =
                typeof performance !== "undefined"
                  ? performance.now()
                  : Date.now();
              if (now - lastLogMs > 100) {
                lastLogMs = now;
              }
            },
          });
          return;
        }
        if (
          route.destination === "filter-frequency" &&
          effects?.filter?.current
        ) {
          const lfoIdx = route.sourceIndex;
          const amount = route.amount;
          const node = effects.filter.current;
          let lastLogMs = 0;
          controlRoutesRef.current.push({
            lfoIndex: lfoIdx,
            dest: "chebyshev-order", // unused here, but keep shape
            amount,
            update: () => {
              const r: ModulationRoute = route;
              const lp = lfoParams[lfoIdx];
              const amp = lp?.amplitude ?? 1;
              const depth = Math.max(0, Math.min(1, amount * amp));
              const sample = sampleLfo(lfoIdx, (lp?.type ?? "sine") as string);
              const unipolar = (sample + 1) * 0.5;
              const defMin = 30;
              const defMax = 7000;
              let valNum: number;
              if ((r.rangeMode ?? "center") === "center") {
                const centerVal =
                  typeof r.center === "number"
                    ? r.center
                    : (defMin + defMax) / 2;
                let amountRangeVal =
                  typeof r.rangeAmount === "number"
                    ? r.rangeAmount
                    : (defMax - defMin) / 4;
                if (amountRangeVal < 0) amountRangeVal = 0;
                const bipolar = sample * depth;
                valNum = centerVal + bipolar * amountRangeVal;
              } else {
                const minVal = typeof r.min === "number" ? r.min : defMin;
                const maxVal = typeof r.max === "number" ? r.max : defMax;
                let span = maxVal - minVal;
                if (span < 0) span = 0;
                valNum = minVal + unipolar * depth * span;
              }
              const v = Math.max(defMin, Math.min(defMax, valNum));
              node.frequency.value = v;
              const now =
                typeof performance !== "undefined"
                  ? performance.now()
                  : Date.now();
              if (now - lastLogMs > 100) {
                lastLogMs = now;
              }
            },
          });
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
        if (
          route.destination === "bitcrusher-bits" &&
          effects?.bitCrusher?.current
        ) {
          const lfoIdx = route.sourceIndex;
          const amount = route.amount;
          const node = effects.bitCrusher.current;
          let lastLogMs = 0;
          controlRoutesRef.current.push({
            lfoIndex: lfoIdx,
            dest: "bitcrusher-bits",
            amount,
            update: () => {
              const r: ModulationRoute = route;
              const lp = lfoParams[lfoIdx];
              const amp = lp?.amplitude ?? 1;
              const depth = Math.max(0, Math.min(1, amount * amp));
              const sample = sampleLfo(lfoIdx, (lp?.type ?? "sine") as string);
              const unipolar = (sample + 1) * 0.5;
              let valNum: number;
              if ((r.rangeMode ?? "center") === "center") {
                const centerVal = typeof r.center === "number" ? r.center : 8.5;
                let amountRangeVal =
                  typeof r.rangeAmount === "number" ? r.rangeAmount : 4;
                if (amountRangeVal < 0) amountRangeVal = 0;
                const bipolar = sample * depth;
                valNum = centerVal + bipolar * amountRangeVal;
              } else {
                const minVal = typeof r.min === "number" ? r.min : 1;
                const maxVal = typeof r.max === "number" ? r.max : 16;
                let span = maxVal - minVal;
                if (span < 0) span = 0;
                valNum = minVal + unipolar * depth * span;
              }
              let val = Math.round(valNum);
              if (val < 1) val = 1;
              if (val > 16) val = 16;
              node.bits.value = val;
              const now =
                typeof performance !== "undefined"
                  ? performance.now()
                  : Date.now();
              if (now - lastLogMs > 100) {
                console.log(
                  `[ModMatrix] LFO ${lfoIdx + 1} → BitCrusher bits:`,
                  val
                );
                lastLogMs = now;
              }
            },
          });
          return;
        }
        if (
          route.destination === "chebyshev-order" &&
          effects?.chebyshev?.current
        ) {
          const lfoIdx = route.sourceIndex;
          const amount = route.amount;
          const node = effects.chebyshev.current;
          let lastLogMs = 0;
          controlRoutesRef.current.push({
            lfoIndex: lfoIdx,
            dest: "chebyshev-order",
            amount,
            update: () => {
              const r: ModulationRoute = route;
              const lp = lfoParams[lfoIdx];
              const amp = lp?.amplitude ?? 1;
              const depth = Math.max(0, Math.min(1, amount * amp));
              const sample = sampleLfo(lfoIdx, (lp?.type ?? "sine") as string);
              const unipolar = (sample + 1) * 0.5;
              let valNum: number;
              if ((r.rangeMode ?? "center") === "center") {
                const centerVal = typeof r.center === "number" ? r.center : 50;
                let amountRangeVal =
                  typeof r.rangeAmount === "number" ? r.rangeAmount : 20;
                if (amountRangeVal < 0) amountRangeVal = 0;
                const bipolar = sample * depth;
                valNum = centerVal + bipolar * amountRangeVal;
              } else {
                const minVal = typeof r.min === "number" ? r.min : 1;
                const maxVal = typeof r.max === "number" ? r.max : 100;
                let span = maxVal - minVal;
                if (span < 0) span = 0;
                valNum = minVal + unipolar * depth * span;
              }
              let rounded = Math.round(valNum);
              if (rounded < 1) rounded = 1;
              if (rounded > 100) rounded = 100;
              node.order = rounded;
              const now =
                typeof performance !== "undefined"
                  ? performance.now()
                  : Date.now();
              if (now - lastLogMs > 100) {
                console.log(
                  `[ModMatrix] LFO ${lfoIdx + 1} → Chebyshev order:`,
                  rounded
                );
                lastLogMs = now;
              }
            },
          });
          return;
        }
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

    // Update active connection IDs after reconciliation
    lastConnectionIdsRef.current = newIds;
  }, [routeStructure, signals, oscillators, lfoParams, connectionManager]);

  // On unmount only: disconnect all
  useEffect(() => {
    return () => {
      connectionManager.disconnectAll();
      hasConnectedRef.current = false;
      lastConnectionIdsRef.current.clear();
    };
  }, [connectionManager]);

  // (computeControlValue removed; custom per-route mapping is used directly)

  // Sample LFO at control-rate using stored phase
  const sampleLfo = useCallback((lfoIdx: number, type: string): number => {
    const phase = lfoPhaseRef.current[lfoIdx] ?? 0;
    const x = phase * 2 * Math.PI;
    switch (type) {
      case "sine":
        return Math.sin(x);
      case "triangle": {
        const t = phase % 1;
        return 1 - 4 * Math.abs(Math.round(t - 0.25) - (t - 0.25));
      }
      case "square":
        return phase % 1 < 0.5 ? 1 : -1;
      case "sawtooth": {
        const t = phase % 1;
        return 2 * (t - Math.floor(t + 0.5));
      }
      default:
        return Math.sin(x);
    }
  }, []);

  // Control-rate updater (~60Hz) + Debug logging for audio-rate params
  useEffect(() => {
    let rafId = 0;
    const tick = (nowMs: number) => {
      const now = nowMs / 1000;
      const last = lastUpdateTimeRef.current || now;
      const dt = Math.max(0, now - last);
      lastUpdateTimeRef.current = now;
      // advance LFO phases
      for (let i = 0; i < lfoPhaseRef.current.length; i++) {
        const freq = lfoParams[i]?.frequency ?? 0;
        lfoPhaseRef.current[i] = (lfoPhaseRef.current[i] + freq * dt) % 1;
      }
      // update control-rate targets
      controlRoutesRef.current.forEach((r) => r.update());

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [lfoParams, routes, effects]);

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
          onAnchorToCurrent={(routeIndex: number) => {
            const route = routes[routeIndex];
            if (!route) return;
            const dest = route.destination;
            // Control-rate destinations
            if (dest === "bitcrusher-bits" && effects?.bitCrusher?.current) {
              const current = coerceParamToNumber(
                effects.bitCrusher.current.bits.value,
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
            if (dest === "chebyshev-order" && effects?.chebyshev?.current) {
              const current = coerceParamToNumber(
                effects.chebyshev.current.order,
                "normal"
              );
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
            }
          }}
        />
      </div>
    </Fragment>
  );
}

export default ModulationMatrix;
