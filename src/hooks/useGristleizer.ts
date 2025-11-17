import * as Tone from "tone";
import { useRef, useEffect } from "react";
import { GristleizerMode, GristleizerWaveform } from "../types/GristleizerParams";

/**
 * Custom Gristleizer effect inspired by the legendary Throbbing Gristle VCA/VCF
 *
 * The Gristleizer has two modes:
 * - VCA: Amplitude modulation (tremolo) with gain/overdrive
 * - VCF: Bandpass filter modulation (auto-wah) with dry/wet mix
 *
 * Architecture:
 * - Input → Gain Node (GAIN control for overdrive) → Mode Router → Output
 *   - VCA path: Tremolo (LFO-controlled amplitude modulation)
 *   - VCF path: Bandpass Filter (LFO-controlled center frequency) → Filter Mix
 * - LFO with selectable waveform (triangle/sawtooth/square)
 */
export interface GristleizerEffect {
  input: Tone.ToneAudioNode;
  output: Tone.ToneAudioNode;

  // Main Gristleizer controls
  bias: Tone.Signal;
  gain: Tone.Signal;
  filterMix: Tone.Signal;
  freq: Tone.Signal;
  depth: Tone.Signal;
  level: Tone.Param<"gain">;
  wet: Tone.Signal;

  // Internal components
  lfo: Tone.LFO;
  gainNode: Tone.Gain;
  tremolo: Tone.Tremolo;
  filter: Tone.Filter;
  vcaDryWet: Tone.CrossFade;
  vcfDryWet: Tone.CrossFade;
  modeSelector: Tone.CrossFade;

  // Methods
  setMode: (mode: GristleizerMode) => void;
  setWaveform: (waveform: GristleizerWaveform) => void;
  dispose: () => void;

  // Audio node connection methods
  connect: (destination: Tone.InputNode, outputNum?: number, inputNum?: number) => void;
  disconnect: (destination?: Tone.InputNode, outputNum?: number, inputNum?: number) => void;
  toDestination: () => void;
}

function createGristleizer(): GristleizerEffect {
  // Create LFO (internal modulation source)
  const lfo = new Tone.LFO({
    frequency: 4,
    min: 0,
    max: 1,
    type: "triangle",
  }).start();

  // Create gain node (GAIN control - applies to both modes)
  // Higher gain values will overdrive/distort the signal
  const gainNode = new Tone.Gain(1); // Start at unity gain (1 = no distortion)

  // VCA MODE: Tremolo effect
  const tremolo = new Tone.Tremolo({
    frequency: 4,
    depth: 0,
    type: "triangle",
    spread: 0,
    wet: 1,
  }).start();

  // VCF MODE: Bandpass filter with LFO modulation
  const filter = new Tone.Filter({
    type: "bandpass",
    frequency: 1000,
    Q: 2,
  });

  // VCA dry/wet crossfade
  const vcaDryWet = new Tone.CrossFade(1); // Start at 100% wet (effect on)

  // VCF dry/wet crossfade (FILTER MIX control)
  const vcfDryWet = new Tone.CrossFade(0); // Start at 0% (100% filtered signal)

  // Mode selector crossfade (VCA vs VCF)
  const modeSelector = new Tone.CrossFade(0); // 0 = VCA, 1 = VCF

  // Level control (output gain)
  const level = new Tone.Gain(1);

  // Overall wet/dry control
  const wetDryMix = new Tone.CrossFade(0); // Start at 0% (dry)

  // Create signal controls
  const biasSignal = new Tone.Signal(0.5);
  const gainSignal = new Tone.Signal(0);
  const filterMixSignal = new Tone.Signal(0);
  const freqSignal = new Tone.Signal(4);
  const depthSignal = new Tone.Signal(0);
  const wetSignal = new Tone.Signal(0);

  // Connect LFO frequency control
  freqSignal.connect(lfo.frequency);
  freqSignal.connect(tremolo.frequency);

  // Connect depth to tremolo
  depthSignal.connect(tremolo.depth);

  // Connect gain signal to gain node
  // This allows dynamic control of the gain/overdrive amount
  gainSignal.connect(gainNode.gain);

  // Connect filter mix to VCF dry/wet
  filterMixSignal.connect(vcfDryWet.fade);

  // Connect wet signal to overall dry/wet
  wetSignal.connect(wetDryMix.fade);

  // VCA signal path: Input → Gain → VCA DryWet (Tremolo) → Mode Selector (A)
  const vcaInput = new Tone.Gain(1);
  const vcaWet = new Tone.Gain(1);

  vcaInput.connect(vcaDryWet.a); // Dry path
  vcaInput.connect(tremolo);
  tremolo.connect(vcaWet);
  vcaWet.connect(vcaDryWet.b); // Wet path
  vcaDryWet.connect(modeSelector.a);

  // VCF signal path: Input → Gain → VCF DryWet (Filter) → Mode Selector (B)
  const vcfInput = new Tone.Gain(1);
  const vcfWet = new Tone.Gain(1);

  vcfInput.connect(vcfDryWet.a); // Dry path
  vcfInput.connect(filter);
  filter.connect(vcfWet);
  vcfWet.connect(vcfDryWet.b); // Wet path
  vcfDryWet.connect(modeSelector.b);

  // Main signal routing
  const mainInput = new Tone.Gain(1);
  const afterGain = new Tone.Gain(1);

  mainInput.connect(gainNode);
  gainNode.connect(afterGain);
  afterGain.connect(vcaInput); // To VCA path
  afterGain.connect(vcfInput); // To VCF path

  // Mode selector → Level → Wet/Dry → Output
  const beforeWetDry = new Tone.Gain(1);
  const output = new Tone.Gain(1);

  modeSelector.connect(level);
  level.connect(beforeWetDry);

  mainInput.connect(wetDryMix.a); // Dry path (bypass entire effect)
  beforeWetDry.connect(wetDryMix.b); // Wet path (processed signal)
  wetDryMix.connect(output);

  // Create the effect object
  const effect: GristleizerEffect = {
    input: mainInput,
    output: output,

    bias: biasSignal,
    gain: gainSignal,
    filterMix: filterMixSignal,
    freq: freqSignal,
    depth: depthSignal,
    level: level.gain,
    wet: wetSignal,

    lfo,
    gainNode,
    tremolo,
    filter,
    vcaDryWet,
    vcfDryWet,
    modeSelector,

    setMode: (mode: GristleizerMode) => {
      // CrossFade: 0 = A (VCA), 1 = B (VCF)
      modeSelector.fade.rampTo(mode === "vcf" ? 1 : 0, 0.05);
    },

    setWaveform: (waveform: GristleizerWaveform) => {
      lfo.type = waveform;
      tremolo.type = waveform;
    },

    dispose: () => {
      lfo.dispose();
      gainNode.dispose();
      tremolo.dispose();
      filter.dispose();
      vcaDryWet.dispose();
      vcfDryWet.dispose();
      modeSelector.dispose();
      level.dispose();
      wetDryMix.dispose();
      biasSignal.dispose();
      gainSignal.dispose();
      filterMixSignal.dispose();
      freqSignal.dispose();
      depthSignal.dispose();
      wetSignal.dispose();
      vcaInput.dispose();
      vcaWet.dispose();
      vcfInput.dispose();
      vcfWet.dispose();
      mainInput.dispose();
      afterGain.dispose();
      beforeWetDry.dispose();
      output.dispose();
    },

    // Audio node connection methods
    connect: (destination: Tone.InputNode, outputNum?: number, inputNum?: number) => {
      output.connect(destination, outputNum, inputNum);
    },
    disconnect: (destination?: Tone.InputNode, outputNum?: number, inputNum?: number) => {
      output.disconnect(destination, outputNum, inputNum);
    },
    toDestination: () => {
      output.toDestination();
    },
  };

  // Set up BIAS control (context-dependent parameter)
  // This needs special handling - for now, leave it as a signal
  // The component will handle mapping bias to the appropriate destination

  return effect;
}

export function useGristleizer() {
  const gristleizer = useRef<GristleizerEffect | null>(null);

  // Lazy initialization - create on first access if not already created
  gristleizer.current ??= createGristleizer();

  useEffect(() => {
    return () => {
      if (gristleizer.current) {
        gristleizer.current.dispose();
        gristleizer.current = null;
      }
    };
  }, []);

  return gristleizer;
}
