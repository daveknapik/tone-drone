import * as Tone from "tone";
import type { ModulationDestination, ModulationRoute } from "../types/ModulationMatrixParams";

export type UnitKind = "time" | "frequency" | "normal";

export function coerceParamToNumber(value: unknown, kind: UnitKind): number {
  switch (kind) {
    case "time": {
      // Accept number or string-ish Time; default to 0 on failure
      try {
        return new Tone.Time(value as any).toSeconds();
      } catch {
        return 0;
      }
    }
    case "frequency": {
      try {
        return new Tone.Frequency(value as any).toFrequency();
      } catch {
        return 0;
      }
    }
    case "normal": {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    }
  }
}

export interface RangeDefaults {
  min: number;
  max: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeRouteRange(
  destination: ModulationDestination,
  route: ModulationRoute,
  defaults: RangeDefaults
): [number, number] {
  const { min: defMin, max: defMax } = defaults;
  const mode = route.rangeMode ?? "center";
  if (mode === "center") {
    const center = typeof route.center === "number" ? route.center : (defMin + defMax) / 2;
    let amount = typeof route.rangeAmount === "number" ? route.rangeAmount : (defMax - defMin) / 4;
    if (amount < 0) amount = 0;
    const min = clamp(center - amount, defMin, defMax);
    const max = clamp(center + amount, defMin, defMax);
    return [min, max];
  }
  const min = clamp(typeof route.min === "number" ? route.min : defMin, defMin, defMax);
  const max = clamp(typeof route.max === "number" ? route.max : defMax, defMin, defMax);
  if (max < min) return [min, min];
  return [min, max];
}

export function defaultsForDestination(destination: ModulationDestination): RangeDefaults | null {
  switch (destination) {
    case "filter-q":
      return { min: 0, max: 9 };
    case "filter-frequency":
      return { min: 30, max: 7000 };
    case "delay-time":
    case "micro-time":
      return { min: 0, max: 1 };
    case "delay-feedback":
    case "micro-feedback":
      return { min: 0, max: 0.95 };
    case "bitcrusher-bits":
      return { min: 1, max: 16 };
    case "chebyshev-order":
      return { min: 1, max: 100 };
    default:
      return null;
  }
}


