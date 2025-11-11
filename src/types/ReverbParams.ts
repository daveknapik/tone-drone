export interface ReverbParams {
  decay: number; // 0.1 - 10 seconds (triggers IR regeneration when changed)
  preDelay: number; // 0 - 0.1 seconds (triggers IR regeneration when changed)
  wet: number; // 0 - 1 (real-time safe, modulatable)
}

export interface ReverbHandle {
  getParams: () => ReverbParams;
  setParams: (params: ReverbParams) => void;
}
