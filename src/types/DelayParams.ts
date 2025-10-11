/**
 * Parameters for the Delay effect that should be persisted in presets
 */
export interface DelayParams {
  time: number;
  feedback: number;
  wet: number;
}

/**
 * Handle interface for Delay component
 * Allows parent components to read and write Delay state imperatively
 */
export interface DelayHandle {
  getParams: () => DelayParams;
  setParams: (params: DelayParams) => void;
}
