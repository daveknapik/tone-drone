import * as Tone from "tone";
import {
  ModulationDestination,
  LFOPolarityMode,
} from "../types/ModulationMatrixParams";

/**
 * Tracks a single modulation connection including all intermediate nodes
 */
interface ModulationConnection {
  type: "frequency" | "volume" | "pan";
  source: Tone.ToneAudioNode; // LFO output node after polarity processing
  depthMultiplier: Tone.Multiply;
  destination: ModulationDestination;
  nodes: Tone.ToneAudioNode[]; // All intermediate nodes for cleanup
  cleanup: () => void;
}

/**
 * Special state for volume connections which require gain node insertion
 */
interface VolumeConnectionState {
  modulationGain: Tone.Gain;
  intermediateNodes: Tone.ToneAudioNode[]; // unity, add, scale nodes
}

/**
 * Manages all modulation connections for the modulation matrix
 * Handles proper signal routing for frequency, volume, and pan modulation
 */
export class ModulationConnectionManager {
  private connections = new Map<string, ModulationConnection>();
  private volumeStates = new Map<string, VolumeConnectionState>();

  /**
   * Connect an LFO to a frequency parameter (uses detune)
   *
   * @param connectionId Unique identifier for this connection
   * @param lfoSignal Output signal from LFO (after polarity processing)
   * @param depthMultiplier Depth control multiplier node
   * @param destination Modulation destination identifier
   * @param detuneParam The oscillator's detune parameter
   */
  connectFrequency(
    connectionId: string,
    lfoSignal: Tone.Signal,
    depthMultiplier: Tone.Multiply,
    destination: ModulationDestination,
    detuneParam: Tone.Param<"cents">
  ): void {
    // Create fresh frequency scaler for each connection (±100 cents range)
    const frequencyScaler = new Tone.Scale({ min: -100, max: 100 });

    // Connect: LFO signal → depth → scaler → detune
    lfoSignal.connect(depthMultiplier);
    depthMultiplier.connect(frequencyScaler);
    frequencyScaler.connect(detuneParam as unknown as Tone.ToneAudioNode);

    const cleanup = () => {
      lfoSignal.disconnect();
      depthMultiplier.disconnect();
      frequencyScaler.disconnect();
      frequencyScaler.dispose();
    };

    this.connections.set(connectionId, {
      type: "frequency",
      source: lfoSignal,
      depthMultiplier,
      destination,
      nodes: [frequencyScaler],
      cleanup,
    });
  }

  /**
   * Connect an LFO to a volume parameter (uses Tone.Gain architecture)
   *
   * IMPORTANT: Volume modulation requires inserting a Tone.Gain node into the
   * audio path and using base+modulation signal architecture to avoid baseline
   * shift and distortion.
   *
   * @param connectionId Unique identifier for this connection
   * @param lfoSignal Output signal from LFO (after polarity processing)
   * @param depthMultiplier Depth control multiplier node
   * @param destination Modulation destination identifier
   * @param audioSource The audio source node (oscillator)
   * @param audioDestination Where the audio should go (typically channel)
   * @param polarityMode Bipolar or unipolar (affects signal routing)
   */
  connectVolume(
    connectionId: string,
    lfoSignal: Tone.Signal,
    depthMultiplier: Tone.Multiply,
    destination: ModulationDestination,
    audioSource: Tone.ToneAudioNode,
    audioDestination: Tone.ToneAudioNode,
    polarityMode: LFOPolarityMode
  ): void {
    // Create gain node for modulation
    const modulationGain = new Tone.Gain(1);
    // Smoothing filter to prevent clicks on rate/amplitude/depth changes
    const smooth = new Tone.Filter({ type: "lowpass", frequency: 20, Q: 0 });

    // Reconnect audio path: source → modGain → destination
    audioSource.disconnect();
    audioSource.connect(modulationGain);
    modulationGain.connect(audioDestination);

    let intermediateNodes: Tone.ToneAudioNode[] = [];

    if (polarityMode === "unipolar") {
      // Unipolar: Direct modulation from 0 to 1 (full tremolo)
      // Route: LFO signal → depthMultiplier → smooth → modGain.gain
      lfoSignal.connect(depthMultiplier);
      depthMultiplier.connect(smooth);
      smooth.connect(modulationGain.gain);
      // CRITICAL: Zero AFTER connecting
      modulationGain.gain.value = 0;
    } else {
      // Bipolar: Base + modulation architecture (partial tremolo)
      // Build signal: 1.0 + (LFO * depth * 0.5)
      const unity = new Tone.Signal(1);
      const add = new Tone.Add();
      const scale = new Tone.Scale({ min: -0.5, max: 0.5 });

      // Connect signal chain
      unity.connect(add);
      lfoSignal.connect(depthMultiplier);
      depthMultiplier.connect(smooth);
      smooth.connect(scale);
      scale.connect(add);
      add.connect(modulationGain.gain);

      // CRITICAL: Zero AFTER connecting signal chain
      modulationGain.gain.value = 0;

      intermediateNodes = [unity, add, scale, smooth];
    }

    // Store volume-specific state for cleanup
    this.volumeStates.set(connectionId, {
      modulationGain,
      intermediateNodes,
    });

    const cleanup = () => {
      lfoSignal.disconnect();
      depthMultiplier.disconnect();

      // Restore original audio path
      audioSource.disconnect();
      audioSource.connect(audioDestination);

      // Dispose gain node and intermediate nodes
      modulationGain.disconnect();
      modulationGain.dispose();
      smooth.disconnect();
      smooth.dispose();

      intermediateNodes.forEach((node) => {
        node.disconnect();
        node.dispose();
      });

      this.volumeStates.delete(connectionId);
    };

    this.connections.set(connectionId, {
      type: "volume",
      source: lfoSignal,
      depthMultiplier,
      destination,
      nodes: [modulationGain, ...intermediateNodes],
      cleanup,
    });
  }

  /**
   * Connect an LFO to a pan parameter
   *
   * @param connectionId Unique identifier for this connection
   * @param lfoSignal Output signal from LFO (after polarity processing)
   * @param depthMultiplier Depth control multiplier node
   * @param destination Modulation destination identifier
   * @param panParam The channel's pan parameter
   */
  connectPan(
    connectionId: string,
    lfoSignal: Tone.ToneAudioNode,
    depthMultiplier: Tone.Multiply,
    destination: ModulationDestination,
    panParam: Tone.Param<"audioRange">
  ): void {
    // Direct connection: LFO signal → depth → pan
    // LFO range (-1 to +1) matches pan range perfectly
    lfoSignal.connect(depthMultiplier);
    depthMultiplier.connect(panParam);

    const cleanup = () => {
      lfoSignal.disconnect();
      depthMultiplier.disconnect();
    };

    this.connections.set(connectionId, {
      type: "pan",
      source: lfoSignal,
      depthMultiplier,
      destination,
      nodes: [],
      cleanup,
    });
  }

  /** Connect to Filter Q (0..9) using unipolar depth */
  connectFilterQ(
    connectionId: string,
    lfoSignal: Tone.Signal,
    depthMultiplier: Tone.Multiply,
    destination: ModulationDestination,
    filter: Tone.Filter
  ): void {
    const scale = new Tone.Scale({ min: 0, max: 9 });
    lfoSignal.connect(depthMultiplier);
    depthMultiplier.connect(scale);
    scale.connect(filter.Q as unknown as Tone.ToneAudioNode);

    const cleanup = () => {
      lfoSignal.disconnect();
      depthMultiplier.disconnect();
      scale.disconnect();
      scale.dispose();
    };

    this.connections.set(connectionId, {
      type: "volume",
      source: lfoSignal as unknown as Tone.ToneAudioNode,
      depthMultiplier,
      destination,
      nodes: [scale],
      cleanup,
    });
  }

  /** Connect to Delay Feedback (0..0.95) using unipolar depth */
  connectDelayFeedback(
    connectionId: string,
    lfoSignal: Tone.Signal,
    depthMultiplier: Tone.Multiply,
    destination: ModulationDestination,
    delay: Tone.FeedbackDelay
  ): void {
    const scale = new Tone.Scale({ min: 0, max: 0.95 });
    lfoSignal.connect(depthMultiplier);
    depthMultiplier.connect(scale);
    scale.connect(delay.feedback as unknown as Tone.ToneAudioNode);

    const cleanup = () => {
      lfoSignal.disconnect();
      depthMultiplier.disconnect();
      scale.disconnect();
      scale.dispose();
    };

    this.connections.set(connectionId, {
      type: "volume",
      source: lfoSignal as unknown as Tone.ToneAudioNode,
      depthMultiplier,
      destination,
      nodes: [scale],
      cleanup,
    });
  }

  /** Connect to Delay Time (0..1s) using unipolar depth */
  connectDelayTime(
    connectionId: string,
    lfoSignal: Tone.Signal,
    depthMultiplier: Tone.Multiply,
    destination: ModulationDestination,
    delay: Tone.FeedbackDelay
  ): void {
    const scale = new Tone.Scale({ min: 0, max: 1 });
    lfoSignal.connect(depthMultiplier);
    depthMultiplier.connect(scale);
    scale.connect(delay.delayTime as unknown as Tone.ToneAudioNode);

    const cleanup = () => {
      lfoSignal.disconnect();
      depthMultiplier.disconnect();
      scale.disconnect();
      scale.dispose();
    };

    this.connections.set(connectionId, {
      type: "volume",
      source: lfoSignal as unknown as Tone.ToneAudioNode,
      depthMultiplier,
      destination,
      nodes: [scale],
      cleanup,
    });
  }

  /**
   * Disconnect a specific modulation connection
   *
   * @param connectionId Unique identifier for the connection to disconnect
   */
  disconnect(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.cleanup();
      this.connections.delete(connectionId);
    }
  }

  /**
   * Disconnect all modulation connections and clean up all resources
   */
  disconnectAll(): void {
    this.connections.forEach((connection) => {
      connection.cleanup();
    });
    this.connections.clear();
    this.volumeStates.clear();
  }

  /**
   * Check if a connection exists
   */
  hasConnection(connectionId: string): boolean {
    return this.connections.has(connectionId);
  }

  /**
   * Get count of active connections
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Get all active connection IDs
   */
  getConnectionIds(): string[] {
    return Array.from(this.connections.keys());
  }

  /**
   * Use a pre-inserted Tremolo for volume modulation to avoid clicks.
   */
  connectVolumeEffect(
    connectionId: string,
    lfo: Tone.LFO,
    initialDepth: number,
    destination: ModulationDestination,
    tremolo: Tone.Tremolo
  ): void {
    // Configure tremolo from LFO UI params
    tremolo.frequency.value = lfo.frequency.value;
    // Apply perceptual depth mapping: small floor + scale up
    const mapped = Math.max(0, Math.min(1, 0.05 + initialDepth * 1.25));
    tremolo.depth.value = mapped;
    // Oscillator type is a string union in Tone; cast through string to satisfy TS
    // Tremolo.type expects ToneOscillatorType; cast through unknown to satisfy TS
    tremolo.type = lfo.type as unknown as Tone.ToneOscillatorType;
    tremolo.spread = 0;

    const cleanup = () => {
      tremolo.depth.value = 0;
    };

    this.connections.set(connectionId, {
      type: "volume",
      // dummy fields to satisfy interface; not used in effect mode
      source: tremolo as unknown as Tone.ToneAudioNode,
      depthMultiplier: new Tone.Multiply(1),
      destination,
      nodes: [tremolo],
      cleanup,
    });
  }

  /**
   * Use a pre-inserted AutoPanner for pan modulation to avoid clicks.
   */
  connectPanEffect(
    connectionId: string,
    lfo: Tone.LFO,
    initialDepth: number,
    destination: ModulationDestination,
    autoPanner: Tone.AutoPanner
  ): void {
    autoPanner.frequency.value = lfo.frequency.value;
    autoPanner.depth.value = initialDepth;
    // Map waveform type if available on AutoPanner in this Tone version
    const ap = autoPanner as unknown as { type?: string };
    const lt = lfo as unknown as { type?: string };
    if (ap.type !== undefined && lt.type !== undefined) {
      ap.type = lt.type;
    }

    const cleanup = () => {
      autoPanner.depth.value = 0;
    };

    this.connections.set(connectionId, {
      type: "pan",
      source: autoPanner as unknown as Tone.ToneAudioNode,
      depthMultiplier: new Tone.Multiply(1),
      destination,
      nodes: [autoPanner],
      cleanup,
    });
  }
}
