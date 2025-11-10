import { useCallback } from "react";
import * as Tone from "tone";
import { ModulationRoute, LFOParams } from "../types/ModulationMatrixParams";
import { OscillatorWithChannel } from "../types/OscillatorWithChannel";

interface UseModulationDepthProps {
  routes: ModulationRoute[];
  oscillators: OscillatorWithChannel[];
  lfoParams: LFOParams[];
  depthMultipliersRef: React.RefObject<Tone.Multiply[]>;
  hasConnectedRef: React.RefObject<boolean>;
}

/**
 * Hook to manage real-time modulation depth updates
 * Handles immediate depth changes for tremolo/autopanner effects and depth multipliers
 */
export function useModulationDepth({
  routes,
  oscillators,
  lfoParams,
  depthMultipliersRef,
  hasConnectedRef,
}: UseModulationDepthProps) {
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
      const depthMultiplier = depthMultipliersRef.current?.[routeIndex];
      if (depthMultiplier && hasConnectedRef.current) {
        depthMultiplier.factor.rampTo(amount, 0.02);
      }
    },
    [routes, oscillators, lfoParams, depthMultipliersRef, hasConnectedRef]
  );

  return {
    updateDepth,
  };
}
