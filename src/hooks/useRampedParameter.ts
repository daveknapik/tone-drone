import { useCallback } from "react";
import { useDebounceCallback } from "usehooks-ts";

/**
 * Hook for smooth, click-free audio parameter updates.
 *
 * Based on the pattern from ModulationLFO.tsx that successfully eliminated
 * clicking by using rampTo() for smooth parameter transitions.
 *
 * @param param - The Tone.js Param to update (e.g., delay.delayTime, filter.frequency)
 * @param onParameterChange - Callback to mark preset as modified (called after debounce)
 * @param rampTime - Ramp duration in seconds (default: 0.08s, barely perceptible; use longer for effects like reverb)
 * @param debounceTime - Debounce delay for state persistence in ms (default: 500ms)
 *
 * @returns Object with:
 *   - rampTo: Function to immediately ramp the parameter to a new value
 *   - markModified: Debounced function to mark preset as modified
 *
 * @example
 * ```typescript
 * // Standard usage (0.08s ramp)
 * const { rampTo, markModified } = useRampedParameter(
 *   delay.current.delayTime,
 *   onParameterChange
 * );
 *
 * // Longer ramp for sensitive parameters (e.g., reverb wet)
 * const wetRamped = useRampedParameter(
 *   reverb.current.wet,
 *   onParameterChange,
 *   0.3 // 300ms ramp time for smoother transitions
 * );
 *
 * // In handleChange:
 * handleChange={(e) => {
 *   const newTime = parseFloat(e.target.value);
 *   rampTo(newTime);        // Immediate smooth audio update
 *   setTime(newTime);       // React state update
 *   markModified();         // Debounced preset marking
 * }}
 * ```
 */
// Type for Tone.js parameters that support ramping
// Uses structural typing (duck typing) to accept any object with a rampTo method
type RampableParam = {
  rampTo: (value: number, rampTime: number) => void;
} | undefined;

export function useRampedParameter(
  param: RampableParam,
  onParameterChange?: () => void,
  rampTime = 0.08,
  debounceTime = 500
) {
  // Immediate update function with smooth ramping (prevents clicks)
  const rampTo = useCallback(
    (value: number) => {
      if (param) {
        if (typeof param.rampTo === 'function') {
          // Using augmented Tone.js types from src/types/tone.d.ts
          param.rampTo(value, rampTime);
        } else if (typeof param === 'object' && param !== null && 'value' in param) {
          // Fallback for parameters that don't support rampTo but have a value property
          (param as { value: number }).value = value;
        }
      }
    },
    [param, rampTime]
  );

  // Debounced callback for state persistence (preset modification marking)
  const markModified = useDebounceCallback(() => {
    onParameterChange?.();
  }, debounceTime);

  return { rampTo, markModified };
}
