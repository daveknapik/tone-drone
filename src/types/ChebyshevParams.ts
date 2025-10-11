/**
 * Parameters for the Chebyshev effect that should be persisted in presets
 */
export interface ChebyshevParams {
  order: number;
  wet: number;
}

/**
 * Handle interface for Chebyshev component
 * Allows parent components to read and write Chebyshev state imperatively
 */
export interface ChebyshevHandle {
  getParams: () => ChebyshevParams;
  setParams: (params: ChebyshevParams) => void;
}
