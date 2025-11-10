# Architecture Guide

This document provides a technical deep dive into Tone Drone's architecture, audio routing, state management, and component hierarchy.

## Table of Contents

- [Overview](#overview)
- [Audio Architecture](#audio-architecture)
- [Component Hierarchy](#component-hierarchy)
- [State Management](#state-management)
- [Hooks System](#hooks-system)
- [Type System](#type-system)
- [Audio Graph](#audio-graph)

## Overview

Tone Drone is built on a modular architecture that separates concerns between UI components, audio processing, and state management. The app uses React for the UI layer and Tone.js for all audio synthesis and processing.

### Key Principles

1. **Separation of Concerns**: UI components are separate from audio logic
2. **Hook-Based Audio**: Each audio component (oscillators, effects, synths) has a dedicated custom hook
3. **Immutable State**: React state is updated immutably, while Tone.js objects are managed via refs
4. **Proper Cleanup**: All Tone.js objects are disposed of in useEffect cleanup functions
5. **Centralized Routing**: All audio sources route through a shared effects bus

## Audio Architecture

### Audio Context

The audio context is managed by `src/context/audio.tsx`, which provides:

- Global audio context initialization (requires user gesture)
- Tone.js Transport control (start/stop/BPM)
- Audio context state to all child components

```typescript
// Simplified structure
const AudioContextProvider = ({ children }) => {
  const [started, setStarted] = useState(false);
  const [bpm, setBpm] = useState(120);

  const start = async () => {
    await Tone.start();
    Tone.getTransport().start();
    setStarted(true);
  };

  return (
    <AudioContext.Provider value={{ started, start, bpm, setBpm }}>
      {children}
    </AudioContext.Provider>
  );
};
```

### Effects Bus Architecture

All audio sources (oscillators and synths) connect to a central effects bus managed by `useAudioEffectsBus`. This creates a linear effects chain:

```
[Audio Sources] → [Effects Bus] → [Destination]
                      ↓
    [AutoFilter → BitCrusher → Chebyshev →
     Microlooper → Filter → Delay → Compressor]
```

The effects bus provides:

- Linear signal chain through all effects
- Centralized audio routing
- Send level control for the effects chain

### Audio Object Lifecycle

Every Tone.js object follows this lifecycle:

1. **Creation**: Objects are created in custom hooks using `useRef`
2. **Connection**: Objects are connected to the audio graph
3. **Usage**: Objects are controlled via their properties/methods
4. **Cleanup**: Objects are disposed of in useEffect cleanup

Example from `useOscillators`:

```typescript
useEffect(() => {
  const newOscillators = Array.from({ length: OSCILLATOR_COUNT }, () => {
    const oscillator = new Tone.Oscillator(440, "sine");
    const channel = new Tone.Channel(-5, 0);
    oscillator.connect(channel);
    oscillator.start();
    return { oscillator, channel };
  });

  setOscillators(newOscillators);

  return () => {
    newOscillators.forEach(({ oscillator, channel }) => {
      oscillator.stop();
      oscillator.dispose();
      channel.dispose();
    });
  };
}, []);
```

## Component Hierarchy

```
App
└── AudioContextProvider
    └── DroneSynth
        ├── Recorder
        ├── Effects (collapsible)
        │   ├── AutoFilter
        │   ├── BitCrusher
        │   ├── Chebyshev
        │   ├── Delay (Microlooper)
        │   ├── Filter
        │   ├── Delay
        │   └── EffectsBusSendControl
        ├── PolySynths (collapsible)
        │   ├── Polysynth 1 (left/top, 'o' key)
        │   └── Polysynth 2 (right/bottom, 'p' key)
        └── Oscillators (collapsible)
            ├── FrequencyRangeControl
            ├── BpmControl
            ├── PlayPauseSequencerButton
            └── Oscillator (x6)
                ├── Sequencer (16 steps)
                └── Controls (volume, pan, frequency)
```

### Component Responsibilities

#### DroneSynth

Main synthesizer component that:

- Creates the effects chain
- Instantiates the effects bus
- Manages polysynths
- Passes bus reference to child components

#### Oscillators

Container component that:

- Creates 6 oscillators, synths, and sequences
- Handles step sequencer loop timing
- Controls frequency range boundaries
- Manages BPM settings
- Routes all audio to the effects bus

#### Oscillator (individual)

Single oscillator component that:

- Displays step grid (16 steps)
- Shows current beat position
- Controls oscillator frequency, volume, pan
- Handles keyboard shortcuts
- Manages individual oscillator on/off state

#### Effects

Container for all effects with collapsible UI. Each effect component controls a single Tone.js effect instance.

## State Management

### React State

Used for UI state that triggers re-renders:

- Component expanded/collapsed states
- BPM value
- Frequency ranges
- Step patterns
- Current beat position
- Recording state

### Refs

Used for Tone.js objects to avoid unnecessary re-renders:

- Audio oscillators
- Effect processors
- Synths and channels
- The sequencer loop
- Recorder instance

### Local Storage

Persisted state via `useLocalStorage`:

- Dark mode preference
- Frequency range settings
- Step sequences (planned)
- Effect settings (planned)

## Hooks System

### Audio Hooks

All audio-related hooks follow a similar pattern:

```typescript
const useAudioEffect = () => {
  const effectRef = useRef<Tone.Effect>(null);

  useEffect(() => {
    effectRef.current = new Tone.Effect(/* params */);

    return () => {
      effectRef.current?.dispose();
      effectRef.current = null;
    };
  }, []);

  return effectRef;
};
```

### Key Hooks

#### useOscillators

- Creates and manages 6 Tone.Oscillator instances (fixed count)
- Pairs each oscillator with a Tone.Channel for volume/pan
- Returns array of 6 `OscillatorWithChannel` objects
- Handles cleanup on unmount

#### useSynths

- Creates 6 monophonic Tone.Synth instances for the step sequencer (fixed count)
- Pairs each synth with a Tone.Panner
- Returns array of 6 `SynthWithPanner` objects
- Used for triggered notes on each step (not continuous drones)

#### usePolysynths

- Creates polyphonic Tone.PolySynth instances
- Returns array of `Tone.PolySynth` objects
- Creates 2 polysynths with independent controls:
  - PolySynth 1: 'o' key, default 666 Hz
  - PolySynth 2: 'p' key, default 999 Hz (perfect fifth)

#### useSequences

- Manages 6 step patterns for the sequencer (fixed count)
- Each sequence has a frequency and array of boolean steps
- Persists to local storage
- Returns sequences and setter function

#### useAudioEffectsBus

- Creates a Tone.Channel as the main bus
- Connects all effects in series
- Returns ref to the bus channel
- Manages effects bus send level

#### useConnectChannelsToBus

- Utility hook for automatic connection management
- Connects an array of channels/panners to a bus
- Handles disconnection on unmount
- Prevents connection errors

#### Effect Hooks

- `useAutoFilter`: Manages Tone.AutoFilter
- `useBitCrusher`: Manages Tone.BitCrusher
- `useChebyshev`: Manages Tone.Chebyshev
- `useDelay`: Manages Tone.FeedbackDelay
- `useFilter`: Manages Tone.Filter

#### useRecorder

- Manages Tone.Recorder for audio capture
- Handles start/stop recording
- Generates downloadable files

## Type System

### Core Types

#### OscillatorWithChannel

```typescript
interface OscillatorWithChannel {
  oscillator: Tone.Oscillator;
  channel: Tone.Channel;
}
```

Pairs an oscillator with its dedicated channel for volume/pan control.

#### SynthWithPanner

```typescript
interface SynthWithPanner {
  synth: Tone.Synth;
  panner: Tone.Panner;
}
```

Pairs a synth with a panner for stereo positioning.

#### Sequence

```typescript
interface Sequence {
  frequency: number;
  steps: boolean[];
}
```

Represents a step sequencer pattern with a base frequency and array of active/inactive steps.

#### AudioEffect

```typescript
interface AudioEffect {
  effect: Tone.Effect;
  bypass: boolean;
}
```

Base interface for audio effects with bypass capability.

#### Step

```typescript
interface Step {
  isActive: boolean;
  isCurrent: boolean;
}
```

Represents a single sequencer step's state.

## Audio Graph

### Signal Flow Diagram

```
Per‑Oscillator Chains (x6):
  Oscillator → Channel → Tremolo (spread=0) → AutoPanner → Effects Bus

Global Routing:
  Effects Bus → [Effects Chain] → Destination
  Recorder (tap): after Effects Bus output

Notes:
  - The per‑oscillator chain FEEDS the Effects Bus (the bus does not feed Tremolo)
  - Tremolo is after Channel and uses spread=0 so amplitude modulation is in‑phase L/R
  - AutoPanner is after Channel as well to pan the final stereo signal
```

#### Modulation Matrix Routing (click‑free)

- Volume (AM): pre‑inserted `Tone.Tremolo` per oscillator, positioned AFTER `Tone.Channel` with `tremolo.spread = 0` so both channels modulate in‑phase. LFO UI drives tremolo `frequency`, `depth`, and `type`.
- Pan: pre‑inserted `Tone.AutoPanner` per oscillator, positioned AFTER `Tone.Channel`. LFO UI drives `frequency`, `depth`, and (if supported) `type`.
- Frequency: LFO → depth multiplier → scale (±cents) → `detune`.

### Detailed Effects Chain

```
Input Signal
    ↓
Auto Filter (modulates filter frequency)
    ↓
Bit Crusher (lo-fi digital reduction)
    ↓
Chebyshev (waveshaping distortion)
    ↓
Microlooper (short delay for texture)
    ↓
Filter (lowpass/highpass with resonance)
    ↓
Delay (feedback delay)
    ↓
Compressor (dynamic range control)
    ↓
Output
```

### Connection Management

1. **Oscillators**: Each oscillator connects to its own channel, which connects to the effects bus
2. **Synths**: Each synth (for step sequencer) connects to its own panner, which connects to the effects bus
3. **PolySynths**: Each of the 2 polysynths connects directly to the effects bus
4. **Effects**: Chained in series through the effects bus channel
5. **Bus Send**: Controls the level going into the effects chain (all audio routes through the effects bus)
6. **Recorder**: Taps the master output for recording

## Performance Considerations

### Optimization Strategies

1. **Ref-based Audio Objects**: Tone.js objects stored in refs to avoid re-renders
2. **Debounced Frequency Updates**: Frequency changes debounced by 500ms to reduce updates
3. **Callback Refs for Loop**: Sequencer loop callback stored in ref to avoid recreating the loop
4. **Memoized Callbacks**: Event handlers wrapped in useCallback where appropriate
5. **Lazy State Updates**: UI state updates are batched to minimize renders

### Audio Graph Efficiency

- Audio objects are only created once and reused
- Connections are established once and maintained
- Effects bypass functionality prevents processing when not in use
- Compressor at the end prevents clipping

## Testing Strategy

### Unit Tests

- Hook tests using `@testing-library/react-hooks`
- Component tests using `@testing-library/react`
- Mock Tone.js objects for isolated testing

### Integration Tests

- Audio context initialization
- Sequencer loop timing
- Effect chain routing
- Recording functionality

### Manual Testing

- Audio quality verification
- Browser compatibility
- Mobile device testing
- Performance profiling

## Modulation Matrix Architecture

The modulation matrix is a complex feature that allows routing 4 LFOs to 26 different synthesis parameters in real-time. The system uses a **hybrid architecture** with three different modulation approaches, each optimized for specific parameter types.

### Design Overview

**Purpose**: Create evolving, dynamic sounds by modulating synthesis parameters with LFOs.

**Scope**:
- 4 independent LFOs (configurable rate, waveform, amplitude, polarity)
- 26 modulation destinations (6 oscillators × 3 params + 8 effect params)
- Per-route range controls (center/amount or min/max)
- Full preset integration

**Key Challenge**: Different parameter types in Tone.js require different modulation approaches due to technical limitations in the Web Audio API and Tone.js implementation.

### Hybrid Modulation Architecture

The system uses **three different modulation techniques** depending on the destination parameter:

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODULATION APPROACHES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. AUDIO-RATE (via Tone.Scale nodes)                          │
│     • Sample-accurate, smooth modulation                       │
│     • Used for: oscillator detune, delay time/feedback         │
│     • Why: These are proper AudioParams that support           │
│       audio-rate signals                                       │
│                                                                 │
│  2. PRE-INSERTED EFFECTS (Tremolo/AutoPanner)                  │
│     • Avoids clicks when changing LFO parameters               │
│     • Used for: oscillator volume and pan                      │
│     • Why: Direct LFO parameter modulation causes clicks;      │
│       pre-inserted effects allow click-free updates            │
│                                                                 │
│  3. CONTROL-RATE (RAF polling at ~60Hz)                        │
│     • Lower resolution but stable                              │
│     • Used for: filter frequency/Q, BitCrusher bits,           │
│       Chebyshev order                                          │
│     • Why: Audio-rate caused stuck values (filter) or          │
│       parameters aren't AudioParams (BitCrusher/Chebyshev)     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Component and Hook Architecture

The modulation matrix was refactored from a 1078-line monolithic component to a clean separation of concerns:

**Main Component** (`ModulationMatrix.tsx` - 435 lines):
- UI orchestration
- State management (LFO params, routes)
- Imperative handle for preset system
- Delegates all complex logic to hooks

**Three Core Hooks**:

1. **`useModulationLFOs`** (130 lines)
   - Creates 4 LFOs with polarity processing chains
   - Manages bipolar/unipolar mode switching
   - Returns LFO objects and processed signals

2. **`useModulationRouting`** (498 lines)
   - Handles all audio graph connections
   - Reconciles connections (only changes what's different)
   - Manages audio-rate Scale nodes and control-rate routes
   - Provides cleanup and parameter restoration

3. **`useControlRateModulation`** (74 lines)
   - RAF-based modulation loop (~60Hz)
   - LFO phase tracking for control-rate sampling
   - Calls update functions from routing hook

4. **`useModulationDepth`** (61 lines)
   - Handles real-time depth updates
   - Updates tremolo/autopanner depths immediately
   - Updates depth multipliers for audio-rate routes

**Utility Modules**:

- `ModulationConnectionManager` (612 lines): Audio graph connection management
- `modulationRange.ts` (157 lines): Parameter coercion and range computation

### Signal Flow Diagrams

#### LFO Signal Processing

```
┌─────────────────────────────────────────────────────────────┐
│                    LFO POLARITY PROCESSING                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BIPOLAR MODE (-1 to +1):                                  │
│    Tone.LFO → outputSignal                                 │
│    (direct connection)                                     │
│                                                             │
│  UNIPOLAR MODE (0 to +1):                                  │
│    Tone.LFO → Tone.Scale(0,1) → outputSignal              │
│    (converts -1..+1 to 0..+1)                              │
│                                                             │
│  Mode Switching:                                           │
│    • Smooth fade-out (50ms)                                │
│    • Reconfigure routing                                   │
│    • Automatic fade-in                                     │
│    • Prevents audio clicks                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Audio-Rate Modulation (Oscillator Frequency)

```
┌─────────────────────────────────────────────────────────────┐
│           AUDIO-RATE: OSCILLATOR FREQUENCY                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LFO Signal (polarity-processed)                           │
│       ↓                                                     │
│  Tone.Multiply (depth multiplier, route.amount)            │
│       ↓                                                     │
│  Tone.Scale (±cents range, from route settings)            │
│       ↓                                                     │
│  Oscillator.detune (AudioParam)                            │
│                                                             │
│  • Sample-accurate modulation                              │
│  • Scale node min/max updated live when range changes      │
│  • Depth changes update multiplier factor                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Pre-Inserted Effect Modulation (Volume/Pan)

```
┌─────────────────────────────────────────────────────────────┐
│        PRE-INSERTED EFFECTS: VOLUME AND PAN                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  OSCILLATOR SIGNAL CHAIN:                                  │
│    Oscillator → Channel → Tremolo → AutoPanner → Bus       │
│                             ↑           ↑                   │
│                             └───────────┘                   │
│                         Pre-inserted at creation            │
│                                                             │
│  MODULATION CONTROL:                                        │
│    LFO UI parameters directly set effect properties:       │
│    • tremolo.frequency = lfo.frequency                     │
│    • tremolo.depth = route.amount × lfo.amplitude          │
│    • tremolo.type = lfo.type                               │
│    • tremolo.spread = 0 (in-phase L/R)                     │
│                                                             │
│    Same for AutoPanner:                                    │
│    • autoPanner.frequency = lfo.frequency                  │
│    • autoPanner.depth = route.amount × lfo.amplitude       │
│    • autoPanner.type = lfo.type (if available)             │
│                                                             │
│  WHY THIS APPROACH:                                         │
│    • Changing LFO rate/type/amplitude doesn't reconnect    │
│      audio graph                                           │
│    • No clicks when adjusting LFO parameters               │
│    • Effects are always in chain (depth=0 when unused)     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Control-Rate Modulation (Filter Parameters)

```
┌─────────────────────────────────────────────────────────────┐
│       CONTROL-RATE: FILTER FREQUENCY AND Q                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  RAF Loop (~60Hz):                                          │
│    1. Update LFO phases based on frequency                 │
│       phase[i] = (phase[i] + freq * dt) % 1                │
│                                                             │
│    2. Sample LFO waveform at current phase:                │
│       • sine: Math.sin(phase × 2π)                         │
│       • triangle: 1 - 4|round(phase-0.25) - (phase-0.25)|  │
│       • square: phase < 0.5 ? 1 : -1                       │
│       • sawtooth: 2(phase - floor(phase + 0.5))            │
│                                                             │
│    3. Apply route range and depth:                         │
│       unipolar = (sample + 1) × 0.5                        │
│       value = min + unipolar × (max - min)                 │
│                                                             │
│    4. Set parameter directly:                              │
│       filter.frequency.value = value                       │
│                                                             │
│  WHY CONTROL-RATE FOR FILTERS:                             │
│    • Audio-rate modulation caused stuck/glitchy values     │
│    • Filter needs parameter restoration + biquad refresh   │
│      on disconnect                                         │
│    • 60Hz update rate is smooth enough for filter sweeps   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Connection Reconciliation

The modulation routing hook uses a **reconciliation strategy** to minimize audio graph changes:

```typescript
// Track route structure separately from amounts
const routeStructure = routes.map(r => `${r.sourceIndex}-${r.destination}`).join('|');

// Only reconnect when structure changes (not when depth/range changes)
useEffect(() => {
  // Compute new connection IDs
  const newIds = new Set(routes.map(r => `${r.sourceIndex}-${r.destination}`));

  // Disconnect only removed connections
  lastConnectionIds.forEach(id => {
    if (!newIds.has(id)) {
      connectionManager.disconnect(id);
      // CRITICAL: Restore parameter to current UI value
      restoreParameter(id);
    }
  });

  // Connect only new routes, leave existing untouched
  routes.forEach(route => {
    const id = `${route.sourceIndex}-${route.destination}`;
    if (!connectionManager.hasConnection(id)) {
      connectRoute(route);
    }
  });

  lastConnectionIds = newIds;
}, [routeStructure]); // NOT routes! Only when structure changes
```

**Benefits**:
- Depth/range slider changes don't trigger reconnections
- Existing connections remain stable
- Reduces audio artifacts from reconnection

### Connection Management

`ModulationConnectionManager` tracks all audio graph connections:

**Key Responsibilities**:
1. Create and wire audio nodes for each connection type
2. Track intermediate nodes (Scale, Multiply, Add, etc.) for cleanup
3. Provide type-specific connection methods
4. Safe disconnection with proper cleanup
5. Live range updates for Scale nodes

**Connection Storage**:
```typescript
interface ModulationConnection {
  type: "frequency" | "volume" | "pan";
  source: Tone.ToneAudioNode;
  depthMultiplier: Tone.Multiply;
  destination: ModulationDestination;
  nodes: Tone.ToneAudioNode[];  // For cleanup
  cleanup: () => void;
}

private connections = new Map<string, ModulationConnection>();
private scaleNodes = new Map<string, Tone.Scale>(); // For live range updates
```

**Type-Specific Methods**:
- `connectFrequency()`: LFO → Multiply → Scale(±cents) → detune
- `connectVolumeEffect()`: Configures pre-inserted Tremolo
- `connectPanEffect()`: Configures pre-inserted AutoPanner
- `connectDelayTime()`: LFO → Multiply → Scale(0-1s) → delayTime
- `connectDelayFeedback()`: LFO → Multiply → Scale(0-0.95) → feedback
- Control-rate: Tracked in separate array, no audio connections

### Parameter Coercion

Tone.js parameters can be:
- Plain numbers (`440`)
- Tone.Param objects (with `.value`, `getValueAtTime()`, etc.)
- Tone.Time objects (with `.toSeconds()`)
- Tone.Frequency objects (with `.toFrequency()`)
- Strings (`"4n"`, `"C4"`)

`coerceParamToNumber()` handles all cases:

```typescript
export function coerceParamToNumber(value: unknown, kind: UnitKind): number {
  // 1. Fast paths for primitives
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    // Convert via Tone.Time or Tone.Frequency if needed
  }

  // 2. Handle Tone.js wrappers
  if (value && typeof value === "object") {
    // Try getValueAtTime first (most reliable for Tone.Param)
    if (anyVal.getValueAtTime) {
      return coerceParamToNumber(anyVal.getValueAtTime(currentTime), "normal");
    }
    // Try conversion methods
    if (kind === "time" && anyVal.toSeconds) return anyVal.toSeconds();
    if (kind === "frequency" && anyVal.toFrequency) return anyVal.toFrequency();
    // Recursively process .value field
    if ("value" in anyVal) return coerceParamToNumber(anyVal.value, kind);
  }

  // 3. Fallback to Tone converters
  return 0;
}
```

**Why This Matters**:
- Reading modulated AudioParams returns 0 when LFO is connected
- Must read from component state instead (via imperative handles)
- "Anchor To Current" feature needs accurate current values

### Range Computation

Routes support two range modes:

**1. Center ± Amount Mode**:
```
center = 500Hz, amount = 200Hz
→ modulates from 300Hz to 700Hz
```

**2. Min...Max Mode**:
```
min = 100Hz, max = 1000Hz
→ modulates from 100Hz to 1000Hz
```

Both modes support **depth scaling** for audio-rate Scale nodes:

```typescript
export function computeRouteRange(
  destination: ModulationDestination,
  route: ModulationRoute,
  defaults: RangeDefaults,
  applyDepth = false  // true for audio-rate Scale nodes
): [number, number] {
  const depth = applyDepth ? route.amount : 1;

  if (route.rangeMode === "center") {
    const effectiveAmount = route.rangeAmount * depth;
    return [center - effectiveAmount, center + effectiveAmount];
  } else {
    // Interpolate based on depth
    const span = (maxVal - minVal) * depth;
    return [center - span/2, center + span/2];
  }
}
```

**When depth is applied**:
- Audio-rate Scale nodes: depth is baked into min/max
- Pre-inserted effects: depth is applied to effect.depth parameter
- Control-rate: depth is applied in the sampling calculation

### Critical Technical Decisions

#### 1. Why Control-Rate for Filters?

**Problem**: Audio-rate modulation of filter frequency/Q caused stuck, glitchy values.

**Root Cause**: Tone.js filter implementation has state that doesn't update properly with rapid audio-rate changes.

**Solution**:
- Use RAF-based control-rate updates (~60Hz)
- On disconnect, restore parameters AND cancel scheduled values
- "Nudge" filter type/rolloff to refresh internal biquad state

```typescript
// Restore and refresh filter on disconnect
effects.filter.current.set({ frequency, Q, type });
effects.filter.current.rolloff = rolloff;
effects.filter.current.frequency.cancelScheduledValues(0);
effects.filter.current.Q.cancelScheduledValues(0);

// Nudge biquad to refresh internal state
const prevType = effects.filter.current.type;
effects.filter.current.type = prevType === "lowpass" ? "highpass" : "lowpass";
effects.filter.current.type = prevType;
```

#### 2. Why Pre-Inserted Effects for Volume/Pan?

**Problem**: Changing LFO rate/type/amplitude during active modulation caused clicks.

**Root Cause**: Reconnecting audio graph nodes causes brief discontinuities.

**Solution**:
- Insert Tremolo and AutoPanner into oscillator signal chain at creation time
- Effects always present (depth=0 when inactive)
- LFO parameter changes update effect properties, not audio graph
- Tremolo uses spread=0 for in-phase L/R amplitude modulation

#### 3. Web Audio Additive Modulation Limitation

**Important**: Web Audio parameters use **additive** modulation (signals ADD to parameter values):

```
finalValue = parameter.value + sum(connectedSignals)
```

This is why:
- Volume modulation uses Tone.Gain nodes with unity signal + LFO
- Cannot directly connect LFO to Tone.Channel.volume (causes baseline shift)
- Modulation happens in linear gain space, not dB space (asymmetric perception)

Pre-inserted Tremolo/AutoPanner avoid this entirely by using internal amplitude modulation.

#### 4. Polarity Mode Architecture

**Two modes**:
- **Bipolar** (-1 to +1): Oscillates equally above/below center. Best for frequency (vibrato), pan.
- **Unipolar** (0 to +1): Starts from zero, rises to max. Best for volume (tremolo), filter cutoff.

**Implementation**:
- LFO always produces bipolar internally
- Unipolar mode routes through Tone.Scale(-1→1 to 0→1)
- Mode switching uses smooth transitions:
  1. Fade output signal to 0 (50ms)
  2. Reconfigure routing
  3. Automatic fade-in

### Type Safety Strategy

`src/types/tone.d.ts` uses TypeScript **declaration merging** to augment Tone.js types:

```typescript
export interface ToneParam {
  value: number;
  cancelScheduledValues(time: number): ToneParam;
  rampTo(value: number, rampTime: number): ToneParam;
}

declare module 'tone' {
  interface Filter {
    frequency: ToneParam;
    Q: ToneParam;
    type: BiquadFilterType;
    rolloff: Tone.FilterRollOff;
  }

  interface LFO {
    frequency: ToneParam;
    amplitude: ToneParam;
    type: 'sine' | 'square' | 'triangle' | 'sawtooth';
  }

  // ... more interfaces
}
```

**Benefits**:
- Eliminates type casts throughout codebase
- Proper autocomplete for Tone.js properties
- Compile-time safety for parameter access

### Preset Integration

Modulation matrix state is fully integrated with the preset system:

```typescript
interface ModulationMatrixState {
  lfos: LFOParams[];      // 4 LFOs with frequency, type, amplitude, polarityMode
  routes: ModulationRoute[]; // All active modulation routes
}

interface ModulationRoute {
  sourceIndex: number;           // Which LFO (0-3)
  destination: ModulationDestination; // Where to route
  amount: number;                // Modulation depth (0-1)
  rangeMode?: "center" | "minmax";
  center?: number;               // For center mode
  rangeAmount?: number;          // For center mode
  min?: number;                  // For minmax mode
  max?: number;                  // For minmax mode
}
```

**Imperative Handle**:
```typescript
useImperativeHandle(ref, () => ({
  getState: (): ModulationMatrixState => stateRef.current,
  setState: (state: ModulationMatrixState) => {
    setLfoParams(state.lfos);
    setRoutes(state.routes);

    // Sync LFO objects with parameters
    state.lfos.forEach((params, i) => {
      if (lfos[i]) {
        lfos[i].frequency.value = params.frequency;
        lfos[i].type = params.type;
        lfos[i].amplitude.value = params.amplitude;
        setPolarityMode(i, params.polarityMode);
      }
    });
  }
}));
```

### Performance Considerations

**Optimizations**:
1. **Reconciliation**: Only reconnect changed routes, not all routes
2. **Separate structure from amounts**: Route structure tracked separately to avoid reconnects on depth changes
3. **Scale node reuse**: Update min/max properties instead of recreating nodes
4. **Control-rate throttling**: RAF provides natural ~60Hz throttling
5. **Smooth transitions**: All depth/range changes use rampTo() to avoid clicks

**Memory Management**:
- All Tone.js nodes tracked for cleanup
- Disposal on route removal prevents memory leaks
- Connection manager handles cascading cleanup

### Testing Considerations

**Unit Tests**:
- `modulationRange.ts`: Coercion logic, range computation
- Hook isolation (if needed): Mock Tone.js objects

**Integration Tests**:
- Route connection/disconnection cycles
- Parameter restoration after disconnect
- Range updates on existing connections
- Polarity mode switching

**Manual Testing Checklist**:
- [ ] Audio-rate modulation smooth and click-free
- [ ] LFO parameter changes don't cause clicks (volume/pan)
- [ ] Filter modulation stable (no stuck values)
- [ ] Preset save/load preserves all modulation state
- [ ] "Anchor To Current" reads correct values
- [ ] Range changes apply immediately without reconnection
- [ ] Depth slider provides instant feedback

### Lessons Learned

**1. Filter Modulation Instability**:
- Audio-rate modulation caused stuck values
- Solution: Control-rate + parameter restoration + biquad nudge
- Lesson: Not all AudioParams are suitable for audio-rate modulation

**2. Pre-Inserted Effects for Click-Free Updates**:
- Reconnecting audio graph causes clicks
- Solution: Pre-insert effects, update properties instead
- Lesson: Minimize audio graph changes during live performance

**3. Additive Modulation in Web Audio**:
- Parameters ADD connected signals, don't multiply
- Can't directly modulate volume with LFO
- Lesson: Use dedicated modulation effects (Tremolo, AutoPanner)

**4. Connection Reconciliation**:
- Initial implementation disconnected all routes on any change
- Caused unnecessary audio artifacts
- Lesson: Track structure separately, only change what's different

**5. Reading Modulated Parameters**:
- AudioParams return 0 when signal is connected
- Must read from component state via imperative handles
- Lesson: Maintain parallel state for UI-facing values

## Future Enhancements

### Planned Features

1. **MIDI Support**: Control parameters via MIDI controllers
2. **Advanced Routing**: Flexible audio routing options
3. **More Effects**: Chorus, phaser, etc.
4. **Visualization**: Waveform and spectrum displays
5. **Undo/Redo**: State history for sequencer patterns

### Architecture Changes

1. **Effect Bypass**: Proper bypass for all effects
2. **Parallel Effects**: Support for parallel effect chains
3. **Send/Return Buses**: Multiple effect buses
4. **Audio Worker**: Move processing to AudioWorklet for better performance
