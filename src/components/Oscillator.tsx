import * as Tone from "tone";
import Button from "./Button";
import Sequencer from "./Sequencer";
import Slider from "./Slider";
import OptionsSelector from "./OptionsSelector";
import { Sequence } from "../types/Sequence";

import { useState, useImperativeHandle, useRef, useEffect } from "react";

import { useAudioContext } from "../hooks/useAudioContext";
import { useKeyDown } from "../hooks/useKeyDown";
import { OscillatorHandle, OscillatorParams } from "../types/OscillatorParams";

interface OscillatorProps {
  channel: Tone.Channel;
  currentBeat: number;
  handleStepClick: (sequenceIndex: number, stepIndex: number) => void;
  maxFreq: number;
  minFreq: number;
  oscillator: Tone.Oscillator | Tone.FatOscillator;
  panner: Tone.Panner;
  playPauseKey: string;
  sequence: Sequence;
  sequenceIndex: number;
  synth: Tone.Synth;
  updateSequenceFrequency: (sequenceIndex: number, frequency: number) => void;
  ref?: React.Ref<OscillatorHandle>;
  onParameterChange?: () => void;
  onOscillatorTypeChange?: (type: "basic" | "fat") => void;
}

function hasCancelScheduledValues(
  x: unknown
): x is { cancelScheduledValues: (time: number) => void } {
  return (
    !!x &&
    typeof (x as Record<string, unknown>).cancelScheduledValues === "function"
  );
}

function Oscillator({
  channel,
  currentBeat,
  handleStepClick,
  maxFreq,
  minFreq,
  oscillator,
  panner,
  playPauseKey,
  sequence,
  sequenceIndex,
  synth,
  updateSequenceFrequency,
  ref,
  onParameterChange,
  onOscillatorTypeChange,
}: OscillatorProps) {
  // Tone.Oscillator properties
  const [frequency, setFrequency] = useState(minFreq);
  const [waveform, setWaveform] = useState("sine");

  // Tone.Channel properties
  const [volume, setVolume] = useState(-5);
  const [pan, setPan] = useState(0);

  // Oscillator type and Fat parameters
  const [oscillatorType, setOscillatorType] = useState<"basic" | "fat">(
    "basic"
  );
  const [fatCount, setFatCount] = useState(1);
  const [fatSpread, setFatSpread] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const freqRafIdRef = useRef<number | null>(null);
  const pendingFreqRef = useRef<number | null>(null);

  // Keep a ref with current state values for imperative access
  const paramsRef = useRef<OscillatorParams>({
    frequency,
    waveform,
    volume,
    pan,
    oscillatorType,
    fatCount,
    fatSpread,
  });

  // Update ref whenever state changes
  useEffect(() => {
    paramsRef.current = {
      frequency,
      waveform,
      volume,
      pan,
      oscillatorType,
      fatCount,
      fatSpread,
    };
  }, [frequency, waveform, volume, pan, oscillatorType, fatCount, fatSpread]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    getParams: (): OscillatorParams => paramsRef.current,
    setParams: (params: OscillatorParams) => {
      setFrequency(params.frequency);
      setWaveform(params.waveform);
      setVolume(params.volume);
      setPan(params.pan);
      setOscillatorType(params.oscillatorType ?? "basic");
      setFatCount(params.fatCount ?? 1);
      setFatSpread(params.fatSpread ?? 0);
    },
  }));

  const { handleBrowserAudioStart } = useAudioContext();

  const toggleAudio = (): void => {
    void handleBrowserAudioStart();
    setIsPlaying((prev) => !prev);
  };

  useKeyDown(() => {
    toggleAudio();
  }, [playPauseKey]);

  // Clamp frequency within the min/max range
  useEffect(() => {
    if (frequency < minFreq) {
      setFrequency(minFreq);
    } else if (frequency > maxFreq) {
      setFrequency(maxFreq);
    }
    // Only respond to boundary changes or external frequency shifts
  }, [minFreq, maxFreq]);

  // Apply channel properties when they change
  useEffect(() => {
    const now = Tone.now();
    const volParam = (channel as unknown as { volume: unknown }).volume;
    const panParam = (channel as unknown as { pan: unknown }).pan;
    if (hasCancelScheduledValues(volParam)) {
      volParam.cancelScheduledValues(now);
    }
    if (hasCancelScheduledValues(panParam)) {
      panParam.cancelScheduledValues(now);
    }
    channel?.volume.setTargetAtTime(volume, now, 0.015);
    channel?.pan.setTargetAtTime(pan, now, 0.015);
  }, [channel, volume, pan]);

  // Apply oscillator properties when instance or params change (no start/stop here)
  useEffect(() => {
    const now = Tone.now();
    const freqParam = (oscillator as unknown as { frequency: unknown })
      .frequency;
    if (hasCancelScheduledValues(freqParam)) {
      freqParam.cancelScheduledValues(now);
    }
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.type = waveform as Tone.ToneOscillatorType;

    if (oscillator instanceof Tone.FatOscillator) {
      oscillator.count = fatCount;
      oscillator.spread = fatSpread;
    }
  }, [oscillator, frequency, waveform, fatCount, fatSpread]);

  // Safari-safe start/stop scheduling (avoid same-time scheduling errors)
  const lastStartAtRef = useRef<number>(0);
  useEffect(() => {
    if (!oscillator) return;
    const now = Tone.now();
    if (isPlaying) {
      const startAt = Math.max(now + 0.01, lastStartAtRef.current + 0.01);
      oscillator.start(startAt);
      lastStartAtRef.current = startAt;
    } else {
      const stopAt = Math.max(now + 0.01, lastStartAtRef.current + 0.015);
      oscillator.stop(stopAt);
    }
  }, [oscillator, isPlaying]);

  // Cleanup any pending rAF on unmount
  useEffect(() => {
    return () => {
      if (freqRafIdRef.current != null) {
        cancelAnimationFrame(freqRafIdRef.current);
        freqRafIdRef.current = null;
      }
    };
  }, []);

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFrequency = parseFloat(e.target.value);
    pendingFreqRef.current = newFrequency;

    freqRafIdRef.current ??= requestAnimationFrame(() => {
      const f = pendingFreqRef.current;
      if (typeof f === "number") {
        setFrequency(f); // update oscillator target
        const now = Tone.now();
        const synthFreq = (synth as unknown as { frequency: unknown })
          .frequency;
        if (hasCancelScheduledValues(synthFreq)) {
          synthFreq.cancelScheduledValues(now);
        }
        synth.frequency.setValueAtTime(f, now);
        updateSequenceFrequency(sequenceIndex, f);
        onParameterChange?.();
        pendingFreqRef.current = null;
      }
      freqRafIdRef.current = null;
    });
  };

  return (
    <div data-testid={`osc-${sequenceIndex}-type`}>
      <Slider
        inputName="frequency"
        labelText="Freq (Hz)"
        min={minFreq}
        max={maxFreq}
        step={0.01}
        value={frequency}
        handleChange={handleFrequencyChange}
      />
      <Slider
        inputName="volume"
        labelText="Volume"
        min={-80}
        max={0}
        value={volume}
        step={0.01}
        logarithmic={true}
        handleChange={(e) => {
          setVolume(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
      <Slider
        inputName="pan"
        labelText="Pan"
        min={-1}
        max={1}
        value={pan}
        step={0.01}
        handleChange={(e) => {
          setPan(parseFloat(e.target.value));
          onParameterChange?.();
        }}
      />
      <div className="justify-between mt-1">
        <OptionsSelector
          handleChange={(e) => {
            const newWaveform = e.target.value;
            setWaveform(newWaveform);
            onParameterChange?.();
          }}
          justifyBetween={true}
          options={["sine", "square", "triangle", "sawtooth"]}
          value={waveform}
        />
      </div>
      <div className="mt-4">
        <Slider
          inputName="fatCount"
          labelText="Voices"
          min={1}
          max={10}
          step={1}
          value={fatCount}
          handleChange={(e) => {
            const newCount = parseInt(e.target.value);
            setFatCount(newCount);

            // Auto-switch oscillator type based on voice count
            const newType = newCount === 1 ? "basic" : "fat";
            if (newType !== oscillatorType) {
              setOscillatorType(newType);
              onOscillatorTypeChange?.(newType);
            }

            // Enforce detune rules based on voices
            // - Voices === 1 => Detune 0
            // - Voices  > 1 => Detune must be >= 1 (bump from 0 to 1)
            setFatSpread((prev) => {
              if (newCount === 1) return 0;
              if (prev === 0) return 1;
              return prev;
            });

            onParameterChange?.();
          }}
        />
        <Slider
          inputName="fatSpread"
          labelText="Detune"
          min={fatCount === 1 ? 0 : 1}
          max={100}
          step={1}
          value={fatSpread}
          disabled={fatCount === 1}
          handleChange={(e) => {
            const requested = parseInt(e.target.value);
            // Clamp based on voices
            if (fatCount === 1) {
              setFatSpread(0);
            } else {
              setFatSpread(Math.max(1, requested));
            }
            onParameterChange?.();
          }}
        />
      </div>
      <div className="text-center mt-4">
        <Sequencer
          currentBeat={currentBeat}
          handleStepClick={handleStepClick}
          pan={pan}
          panner={panner}
          sequence={sequence}
          sequenceIndex={sequenceIndex}
          synth={synth}
          volume={volume}
          waveform={waveform}
        />
      </div>
      <div className="text-center mt-2">
        <Button handleClick={toggleAudio} isActive={isPlaying}>
          {isPlaying ? "Stop" : "Start"}
        </Button>
      </div>
    </div>
  );
}

export default Oscillator;
