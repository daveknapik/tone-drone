/**
 * Pattern manipulation utilities for sequencer patterns
 */

/**
 * Generate a random sequencer pattern based on density
 * @param stepCount - Number of steps in the sequence (typically 16)
 * @param density - Percentage (0-100) of steps that should be active
 * @returns Array of booleans representing the pattern
 */
export function randomizePattern(
  stepCount: number,
  density: number
): boolean[] {
  // Clamp density to valid range
  const clampedDensity = Math.max(0, Math.min(100, density));
  const probability = clampedDensity / 100;

  return Array.from({ length: stepCount }, () => Math.random() < probability);
}

/**
 * Create an empty pattern with all steps inactive
 * @param stepCount - Number of steps in the sequence (typically 16)
 * @returns Array of false values
 */
export function clearPattern(stepCount: number): boolean[] {
  return Array(stepCount).fill(false) as boolean[];
}
