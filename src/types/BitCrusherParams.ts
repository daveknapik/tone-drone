/**
 * Parameters for the BitCrusher effect that should be persisted in presets
 */
export interface BitCrusherParams {
  bits: number;
  wet: number;
}

/**
 * Handle interface for BitCrusher component
 * Allows parent components to read and write BitCrusher state imperatively
 */
export interface BitCrusherHandle {
  getParams: () => BitCrusherParams;
  setParams: (params: BitCrusherParams) => void;
}
