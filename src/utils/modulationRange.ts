import * as Tone from "tone";
import type { ModulationDestination, ModulationRoute } from "../types/ModulationMatrixParams";

export type UnitKind = "time" | "frequency" | "normal";

export function coerceParamToNumber(value: unknown, kind: UnitKind): number {
  // 1) Fast paths for primitives
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string") {
    try {
      if (kind === "time") {
        return new (Tone as any).Time(value).toSeconds();
      }
      if (kind === "frequency") {
        return new (Tone as any).Frequency(value).toFrequency();
      }
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    } catch {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    }
  }

  // 2) Handle common Tone.js wrappers and Params
  if (value && typeof value === "object") {
    const anyVal = value as any;

    // Try getValueAtTime first (for Tone.Param objects)
    // This is the most reliable way to read Tone.Param values
    if (typeof anyVal.getValueAtTime === "function") {
      try {
        const ctx = (Tone as any).getContext?.();
        const t = ctx?.currentTime ?? 0;
        const v = anyVal.getValueAtTime(t);
        // The result should be a number, so use "normal" kind
        return coerceParamToNumber(v, "normal");
      } catch {
        // fall through to other methods
      }
    }

    // Time/Frequency-like instances expose conversion methods directly
    if (kind === "time" && typeof anyVal.toSeconds === "function") {
      try {
        return anyVal.toSeconds();
      } catch {
        // fall through
      }
    }
    if (kind === "frequency" && typeof anyVal.toFrequency === "function") {
      try {
        return anyVal.toFrequency();
      } catch {
        // fall through
      }
    }

    // Param/Signal-like: has a .value field (could be number or nested object)
    if ("value" in anyVal) {
      // Recursively process .value, preserving the kind in case it's a nested unit object
      return coerceParamToNumber(anyVal.value, kind);
    }
  }

  // 3) Fallback to Tone converters or numeric cast
  try {
    if (kind === "time") {
      return new (Tone as any).Time(value as any).toSeconds();
    }
    if (kind === "frequency") {
      return new (Tone as any).Frequency(value as any).toFrequency();
    }
  } catch {
    // ignore and fall through
  }
  const n = Number((value as any) ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export interface RangeDefaults {
  min: number;
  max: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeRouteRange(
  _destination: ModulationDestination,
  route: ModulationRoute,
  defaults: RangeDefaults,
  applyDepth = false
): [number, number] {
  const { min: defMin, max: defMax } = defaults;
  const mode = route.rangeMode ?? "center";
  const depth = applyDepth ? Math.max(0, Math.min(1, route.amount)) : 1;

  if (mode === "center") {
    const center = typeof route.center === "number" ? route.center : (defMin + defMax) / 2;
    let amount = typeof route.rangeAmount === "number" ? route.rangeAmount : (defMax - defMin) / 4;
    if (amount < 0) amount = 0;
    // Apply depth to the amount when applyDepth=true (for audio-rate Scale nodes)
    const effectiveAmount = amount * depth;
    const min = clamp(center - effectiveAmount, defMin, defMax);
    const max = clamp(center + effectiveAmount, defMin, defMax);
    return [min, max];
  }
  // For min/max mode, interpolate between center and extremes based on depth
  const minVal = typeof route.min === "number" ? route.min : defMin;
  const maxVal = typeof route.max === "number" ? route.max : defMax;
  const center = (minVal + maxVal) / 2;
  const min = clamp(center - (center - minVal) * depth, defMin, defMax);
  const max = clamp(center + (maxVal - center) * depth, defMin, defMax);
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



