import { useEffect, useRef, useCallback } from "react";
import { LFOParams } from "../types/ModulationMatrixParams";

interface ControlRateUpdate {
  update: () => void;
}

interface UseControlRateModulationProps {
  lfoParams: LFOParams[];
  getControlRateUpdaters: () => ControlRateUpdate[];
}

/**
 * Hook to manage control-rate modulation updates (RAF-based)
 * Handles LFO phase tracking and calls update functions from routing hook
 */
export function useControlRateModulation({
  lfoParams,
  getControlRateUpdaters,
}: UseControlRateModulationProps) {
  const lfoPhaseRef = useRef<number[]>([0, 0, 0, 0]);
  const lastUpdateTimeRef = useRef<number>(0);

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

  // Control-rate updater (~60Hz)
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
      const updaters = getControlRateUpdaters();
      updaters.forEach((updater) => updater.update());

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [lfoParams, getControlRateUpdaters]);

  return {
    sampleLfo,
  };
}
