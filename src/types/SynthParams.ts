/**
 * Envelope parameters for step sequencer synths
 */
export interface SynthEnvelopeParams {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

/**
 * Handle interface for synth envelope component
 */
export interface SynthEnvelopeHandle {
  getParams: () => SynthEnvelopeParams;
  setParams: (params: SynthEnvelopeParams) => void;
}
