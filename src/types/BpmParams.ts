/**
 * Handle interface for BPM control component
 * Allows parent components to read and write BPM state imperatively
 */
export interface BpmControlHandle {
  getValue: () => number;
  setValue: (bpm: number) => void;
}
