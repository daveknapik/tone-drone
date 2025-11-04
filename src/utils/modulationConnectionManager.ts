import * as Tone from "tone";
import { ModulationDestination, LFOPolarityMode } from "../types/ModulationMatrixParams";

/**
 * Tracks a single modulation connection including all intermediate nodes
 */
interface ModulationConnection {
  type: "frequency" | "volume" | "pan";
  source: Tone.Signal; // LFO output signal after polarity processing
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
    (frequencyScaler as any).connect(detuneParam);

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

    // Reconnect audio path: source → modGain → destination
    audioSource.disconnect();
    audioSource.connect(modulationGain);
    modulationGain.connect(audioDestination);

    let intermediateNodes: Tone.ToneAudioNode[] = [];

    if (polarityMode === "unipolar") {
      // Unipolar: Direct modulation from 0 to 1 (full tremolo)
      // Route: LFO signal → depthMultiplier → modGain.gain
      lfoSignal.connect(depthMultiplier);
      depthMultiplier.connect(modulationGain.gain);

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
      depthMultiplier.connect(scale);
      scale.connect(add);
      add.connect(modulationGain.gain);

      // CRITICAL: Zero AFTER connecting signal chain
      modulationGain.gain.value = 0;

      intermediateNodes = [unity, add, scale];
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
    lfoSignal: Tone.Signal,
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
}

