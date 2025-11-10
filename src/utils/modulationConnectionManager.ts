import * as Tone from "tone";
import {
  ModulationDestination,
  LFOPolarityMode,
} from "../types/ModulationMatrixParams";
import { DEBUG_AUDIO } from "./debug";

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
  // Track Scale nodes per connection for live range updates
  private scaleNodes = new Map<string, Tone.Scale>();

  /**
   * Connect an LFO to a frequency parameter (uses detune)
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
      try {
        // Disconnect only this path; do not sever other LFO routes
        (
          lfoSignal as unknown as {
            disconnect: (dest?: Tone.ToneAudioNode) => void;
          }
        ).disconnect(depthMultiplier as unknown as Tone.ToneAudioNode);
      } catch {
        /* noop */
      }
      depthMultiplier.disconnect();
      frequencyScaler.disconnect();
      frequencyScaler.dispose();
    };

    this.connections.set(connectionId, {
      type: "frequency",
      source: lfoSignal as unknown as Tone.ToneAudioNode,
      depthMultiplier,
      destination,
      nodes: [frequencyScaler],
      cleanup,
    });
  }

  /**
   * Connect an LFO to a volume parameter (uses Tone.Gain architecture)
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
      source: lfoSignal as unknown as Tone.ToneAudioNode,
      depthMultiplier,
      destination,
      nodes: [modulationGain, ...intermediateNodes],
      cleanup,
    });
  }

  /**
   * Connect an LFO to a pan parameter
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
    this.scaleNodes.set(connectionId, scale);

    const cleanup = () => {
      try {
        (
          lfoSignal as unknown as {
            disconnect: (dest?: Tone.ToneAudioNode) => void;
          }
        ).disconnect(depthMultiplier as unknown as Tone.ToneAudioNode);
      } catch {
        /* noop */
      }
      depthMultiplier.disconnect();
      scale.disconnect();
      scale.dispose();
      this.scaleNodes.delete(connectionId);
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

  /** Connect to Filter Frequency (30..7000 Hz) using unipolar depth */
  connectFilterFrequency(
    connectionId: string,
    lfoSignal: Tone.Signal,
    depthMultiplier: Tone.Multiply,
    destination: ModulationDestination,
    filter: Tone.Filter
  ): void {
    const scale = new Tone.Scale({ min: 30, max: 7000 });
    lfoSignal.connect(depthMultiplier);
    depthMultiplier.connect(scale);
    scale.connect(filter.frequency as unknown as Tone.ToneAudioNode);
    this.scaleNodes.set(connectionId, scale);

    const cleanup = () => {
      try {
        (
          lfoSignal as unknown as {
            disconnect: (dest?: Tone.ToneAudioNode) => void;
          }
        ).disconnect(depthMultiplier as unknown as Tone.ToneAudioNode);
      } catch {
        /* noop */
      }
      depthMultiplier.disconnect();
      scale.disconnect();
      scale.dispose();
      this.scaleNodes.delete(connectionId);
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
    this.scaleNodes.set(connectionId, scale);

    const cleanup = () => {
      try {
        (
          lfoSignal as unknown as {
            disconnect: (dest?: Tone.ToneAudioNode) => void;
          }
        ).disconnect(depthMultiplier as unknown as Tone.ToneAudioNode);
      } catch {
        /* noop */
      }
      depthMultiplier.disconnect();
      scale.disconnect();
      scale.dispose();
      this.scaleNodes.delete(connectionId);
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
    this.scaleNodes.set(connectionId, scale);

    const cleanup = () => {
      try {
        // Disconnect only this path; do not sever other LFO routes
        (
          lfoSignal as unknown as {
            disconnect: (dest?: Tone.ToneAudioNode) => void;
          }
        ).disconnect(depthMultiplier as unknown as Tone.ToneAudioNode);
      } catch {
        /* noop */
      }
      depthMultiplier.disconnect();
      scale.disconnect();
      scale.dispose();
      this.scaleNodes.delete(connectionId);
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

  /** Connect to BitCrusher bits (2..8) */
  connectBitCrusherBits(
    connectionId: string,
    lfoSignal: Tone.Signal,
    depthMultiplier: Tone.Multiply,
    destination: ModulationDestination,
    bitCrusher: Tone.BitCrusher
  ): void {
    const scale = new Tone.Scale({ min: 1, max: 16 });
    // Seed scale output to mid before connecting to Param (avoid 0)
    const seed = new Tone.Signal(0.5);
    seed.connect(scale);
    scale.connect(bitCrusher.bits as unknown as Tone.ToneAudioNode);
    // Live path: Convert bipolar (-1..+1) to unipolar (0..1): (x + 1) * 0.5
    const add = new Tone.Add();
    const one = new Tone.Signal(1);
    const half = new Tone.Multiply(0.5);
    lfoSignal.connect(depthMultiplier);
    depthMultiplier.connect(add);
    one.connect(add);
    add.connect(half);
    half.connect(scale);
    this.scaleNodes.set(connectionId, scale);
    // Remove seed after wiring
    seed.disconnect();
    seed.dispose();

    const cleanup = () => {
      try {
        (
          lfoSignal as unknown as {
            disconnect: (dest?: Tone.ToneAudioNode) => void;
          }
        ).disconnect(depthMultiplier as unknown as Tone.ToneAudioNode);
      } catch {
        /* noop */
      }
      depthMultiplier.disconnect();
      // dispose wiring
      one.disconnect();
      add.disconnect();
      half.disconnect();
      scale.disconnect();
      add.dispose();
      half.dispose();
      scale.dispose();
      one.dispose();
      this.scaleNodes.delete(connectionId);
    };

    this.connections.set(connectionId, {
      type: "volume",
      source: lfoSignal as unknown as Tone.ToneAudioNode,
      depthMultiplier,
      destination,
      nodes: [one, add, half, scale],
      cleanup,
    });
  }

  /** Connect to Chebyshev order (1..100) */
  connectChebyshevOrder(
    connectionId: string,
    lfoSignal: Tone.Signal,
    depthMultiplier: Tone.Multiply,
    destination: ModulationDestination,
    chebyshev: Tone.Chebyshev
  ): void {
    const scale = new Tone.Scale({ min: 1, max: 100 });
    lfoSignal.connect(depthMultiplier);
    depthMultiplier.connect(scale);
    scale.connect(chebyshev.order as unknown as Tone.ToneAudioNode);
    this.scaleNodes.set(connectionId, scale);

    const cleanup = () => {
      try {
        (
          lfoSignal as unknown as {
            disconnect: (dest?: Tone.ToneAudioNode) => void;
          }
        ).disconnect(depthMultiplier as unknown as Tone.ToneAudioNode);
      } catch {
        /* noop */
      }
      depthMultiplier.disconnect();
      scale.disconnect();
      scale.dispose();
      this.scaleNodes.delete(connectionId);
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
   */
  disconnect(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.cleanup();
      this.connections.delete(connectionId);
      this.scaleNodes.delete(connectionId);
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
    this.scaleNodes.clear();
  }

  /** Check if a connection exists */
  hasConnection(connectionId: string): boolean {
    const exists = this.connections.has(connectionId);
    if (DEBUG_AUDIO) {
      console.log(
        `[ConnectionManager] hasConnection(${connectionId}): ${exists}, total connections: ${this.connections.size}, all IDs: [${Array.from(this.connections.keys()).join(", ")}]`
      );
    }
    return exists;
  }

  /** Get count of active connections */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /** Get all active connection IDs */
  getConnectionIds(): string[] {
    return Array.from(this.connections.keys());
  }

  /** Update range (min/max) for connections that use a Scale node */
  updateScaleRange(connectionId: string, min: number, max: number): void {
    const scale = this.scaleNodes.get(connectionId);
    if (!scale) {
      if (DEBUG_AUDIO) {
        console.warn(
          `[ConnectionManager] No scale node found for ${connectionId}`
        );
      }
      return;
    }
    if (DEBUG_AUDIO) {
      const beforeMin = (scale as unknown as { min: number }).min;
      const beforeMax = (scale as unknown as { max: number }).max;
      console.log(
        `[ConnectionManager] updateScaleRange(${connectionId}): ${beforeMin}→${min}, ${beforeMax}→${max}`
      );
    }
    // Tone.Scale exposes min/max as properties in v15
    (scale as unknown as { min: number }).min = min;
    (scale as unknown as { max: number }).max = max;
    if (DEBUG_AUDIO) {
      const afterMin = (scale as unknown as { min: number }).min;
      const afterMax = (scale as unknown as { max: number }).max;
      console.log(
        `[ConnectionManager] updateScaleRange(${connectionId}): CONFIRMED min=${afterMin} max=${afterMax}`
      );
    }
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
    // Map waveform type if available on Tremolo in this Tone version
    const tr = tremolo as unknown as { type?: string };
    const lt = lfo as unknown as { type?: string };
    if (tr.type !== undefined && lt.type !== undefined) {
      tr.type = lt.type;
    }
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
    // Coerce LFO frequency to number in case it's a Frequency object
    const lfoFreqValue = typeof lfo.frequency.value === 'number'
      ? lfo.frequency.value
      : Number(lfo.frequency.value);
    autoPanner.frequency.value = lfoFreqValue;
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
