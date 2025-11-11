import { useEffect, useRef, useMemo, useCallback } from "react";
import * as Tone from "tone";
import { ModulationRoute, LFOParams } from "../types/ModulationMatrixParams";
import { OscillatorWithChannel } from "../types/OscillatorWithChannel";
import { FilterHandle } from "../types/FilterParams";
import { DelayHandle } from "../types/DelayParams";
import { ModulationConnectionManager } from "../utils/modulationConnectionManager";
import { computeRouteRange, defaultsForDestination } from "../utils/modulationRange";
import { DEBUG_AUDIO } from "../utils/debug";

interface ControlRateRoute {
  lfoIndex: number;
  dest:
    | "filter-frequency"
    | "filter-q"
    | "bitcrusher-bits"
    | "chebyshev-order";
  amount: number;
  route: ModulationRoute;
  node: Tone.Filter | Tone.BitCrusher | Tone.Chebyshev;
}

interface UseModulationRoutingProps {
  routes: ModulationRoute[];
  routeStructure: string;
  signals: Tone.Signal[];
  lfos: Tone.LFO[];
  lfoParams: LFOParams[];
  oscillators: OscillatorWithChannel[];
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
  };
  sampleLfo: (lfoIdx: number, type: string) => number;
}

/**
 * Hook to manage modulation routing connections
 * Handles audio graph connections, disconnections, and route reconciliation
 */
export function useModulationRouting({
  routes,
  routeStructure,
  signals,
  lfos,
  lfoParams,
  oscillators,
  effects,
  effectRefs,
  sampleLfo,
}: UseModulationRoutingProps) {
  const connectionManager = useMemo(
    () => new ModulationConnectionManager(),
    []
  );
  const depthMultipliersRef = useRef<Tone.Multiply[]>([]);
  const hasConnectedRef = useRef<boolean>(false);
  const routesRef = useRef<ModulationRoute[]>(routes);
  const lastConnectionIdsRef = useRef<Set<string>>(new Set());
  const controlRoutesRef = useRef<ControlRateRoute[]>([]);

  // Update routes ref whenever routes change
  useEffect(() => {
    routesRef.current = routes;
  }, [routes]);

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
        dest === "micro-feedback" ||
        dest === "reverb-wet";
      if (!isAudioScale) return;
      const connectionId = `${route.sourceIndex}-${route.destination}`;
      const hasConn = connectionManager.hasConnection(connectionId);
      if (!hasConn) return;
      // Apply depth to the range for audio-rate Scale nodes
      const [min, max] = computeRouteRange(dest, route, def, true);
      connectionManager.updateScaleRange(connectionId, min, max);
    });
  }, [routes, connectionManager]);

  // Apply modulation routes ONLY when route structure changes (not amounts!)
  useEffect(() => {
    const routes = routesRef.current;

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
            effects.filter.current.frequency.cancelScheduledValues(0);
            effects.filter.current.Q.cancelScheduledValues(0);
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
            effects.filter.current.Q.cancelScheduledValues(0);
            effects.filter.current.frequency.cancelScheduledValues(0);
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
            effects.delay.current.delayTime.value = p.time;
            effects.delay.current.feedback.value = p.feedback;
            effects.delay.current.delayTime.cancelScheduledValues(0);
            effects.delay.current.feedback.cancelScheduledValues(0);
          } else if (
            dest === "delay-feedback" &&
            effects?.delay?.current &&
            effectRefs?.delayRef?.current
          ) {
            const p = effectRefs.delayRef.current.getParams();
            effects.delay.current.delayTime.value = p.time;
            effects.delay.current.feedback.value = p.feedback;
            effects.delay.current.feedback.cancelScheduledValues(0);
            effects.delay.current.delayTime.cancelScheduledValues(0);
          } else if (
            dest === "micro-time" &&
            effects?.micro?.current &&
            effectRefs?.microRef?.current
          ) {
            const p = effectRefs.microRef.current.getParams();
            effects.micro.current.delayTime.value = p.time;
            effects.micro.current.feedback.value = p.feedback;
            effects.micro.current.delayTime.cancelScheduledValues(0);
            effects.micro.current.feedback.cancelScheduledValues(0);
          } else if (
            dest === "micro-feedback" &&
            effects?.micro?.current &&
            effectRefs?.microRef?.current
          ) {
            const p = effectRefs.microRef.current.getParams();
            effects.micro.current.delayTime.value = p.time;
            effects.micro.current.feedback.value = p.feedback;
            effects.micro.current.feedback.cancelScheduledValues(0);
            effects.micro.current.delayTime.cancelScheduledValues(0);
          } else if (
            dest === "reverb-wet" &&
            effects?.reverb?.current &&
            effectRefs?.reverbRef?.current
          ) {
            const p = effectRefs.reverbRef.current.getParams();
            effects.reverb.current.wet.value = p.wet;
            effects.reverb.current.wet.cancelScheduledValues(0);
          }
        } catch {
          // noop: defensive only
        }
      }
    });

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

      // Audio-rate destinations wired via Tone.Scale nodes (filters are handled at control-rate)
      const isAudioScaleDest =
        route.destination === "delay-time" ||
        route.destination === "delay-feedback" ||
        route.destination === "micro-time" ||
        route.destination === "micro-feedback" ||
        route.destination === "reverb-wet";

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

        // Effect destinations - control-rate
        if (route.destination === "filter-q" && effects?.filter?.current) {
          controlRoutesRef.current.push({
            lfoIndex: route.sourceIndex,
            dest: "filter-q",
            amount: route.amount,
            route,
            node: effects.filter.current,
          });
          return;
        }
        if (
          route.destination === "filter-frequency" &&
          effects?.filter?.current
        ) {
          controlRoutesRef.current.push({
            lfoIndex: route.sourceIndex,
            dest: "filter-frequency",
            amount: route.amount,
            route,
            node: effects.filter.current,
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
          controlRoutesRef.current.push({
            lfoIndex: route.sourceIndex,
            dest: "bitcrusher-bits",
            amount: route.amount,
            route,
            node: effects.bitCrusher.current,
          });
          return;
        }
        if (
          route.destination === "chebyshev-order" &&
          effects?.chebyshev?.current
        ) {
          controlRoutesRef.current.push({
            lfoIndex: route.sourceIndex,
            dest: "chebyshev-order",
            amount: route.amount,
            route,
            node: effects.chebyshev.current,
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
        if (route.destination === "reverb-wet" && effects?.reverb?.current) {
          connectionManager.connectReverbWet(
            connectionId,
            lfoSignal as unknown as Tone.Signal,
            depthMultiplier,
            route.destination,
            effects.reverb.current
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
  }, [routeStructure, signals, oscillators, lfoParams, connectionManager, lfos, effects, effectRefs, sampleLfo]);

  // On unmount only: disconnect all
  useEffect(() => {
    return () => {
      connectionManager.disconnectAll();
      hasConnectedRef.current = false;
      lastConnectionIdsRef.current.clear();
    };
  }, [connectionManager]);

  // Build update functions for control-rate routes
  const buildControlRateUpdaters = useCallback(() => {
    return controlRoutesRef.current.map((cr) => {
      let lastLogMs = 0;
      return {
        ...cr,
        update: () => {
          const sample = sampleLfo(cr.lfoIndex, (lfoParams[cr.lfoIndex]?.type ?? "sine") as string);
          const unipolar = (sample + 1) * 0.5;
          const def = defaultsForDestination(cr.dest)!;
          const [min, max] = computeRouteRange(cr.dest, cr.route, def, true);
          const mode = cr.route.rangeMode ?? "center";
          const center = (min + max) / 2;
          const span = max - min;
          const amountAroundCenter = max - center;

          if (cr.dest === "filter-q") {
            const v =
              mode === "center"
                ? Math.max(def.min, Math.min(def.max, center + sample * amountAroundCenter))
                : Math.max(def.min, Math.min(def.max, min + unipolar * span));
            (cr.node as Tone.Filter).Q.value = v;
          } else if (cr.dest === "filter-frequency") {
            const v =
              mode === "center"
                ? Math.max(def.min, Math.min(def.max, center + sample * amountAroundCenter))
                : Math.max(def.min, Math.min(def.max, min + unipolar * span));
            (cr.node as Tone.Filter).frequency.value = v;
          } else if (cr.dest === "bitcrusher-bits") {
            const continuous =
              mode === "center" ? center + sample * amountAroundCenter : min + unipolar * span;
            const val = Math.round(Math.max(def.min, Math.min(def.max, continuous)));
            (cr.node as Tone.BitCrusher).bits.value = val;
            if (DEBUG_AUDIO) {
              const now =
                typeof performance !== "undefined"
                  ? performance.now()
                  : Date.now();
              if (now - lastLogMs > 100) {
                console.log(
                  `[ModMatrix] LFO ${cr.lfoIndex + 1} → BitCrusher bits:`,
                  val
                );
                lastLogMs = now;
              }
            }
          } else if (cr.dest === "chebyshev-order") {
            const continuous =
              mode === "center" ? center + sample * amountAroundCenter : min + unipolar * span;
            const rounded = Math.round(Math.max(def.min, Math.min(def.max, continuous)));
            (cr.node as Tone.Chebyshev).order = rounded;
            if (DEBUG_AUDIO) {
              const now =
                typeof performance !== "undefined"
                  ? performance.now()
                  : Date.now();
              if (now - lastLogMs > 100) {
                console.log(
                  `[ModMatrix] LFO ${cr.lfoIndex + 1} → Chebyshev order:`,
                  rounded
                );
                lastLogMs = now;
              }
            }
          }
        },
      };
    });
  }, [sampleLfo, lfoParams]);

  return {
    connectionManager,
    depthMultipliersRef,
    hasConnectedRef,
    buildControlRateUpdaters,
  };
}
