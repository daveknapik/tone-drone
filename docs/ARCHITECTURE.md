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
- Send/return architecture for wet/dry mixing
- Centralized audio routing

### Audio Object Lifecycle

Every Tone.js object follows this lifecycle:

1. **Creation**: Objects are created in custom hooks using `useRef`
2. **Connection**: Objects are connected to the audio graph
3. **Usage**: Objects are controlled via their properties/methods
4. **Cleanup**: Objects are disposed of in useEffect cleanup

Example from `useOscillators`:

```typescript
useEffect(() => {
  const newOscillators = Array.from({ length: count }, () => {
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
}, [count]);
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
        ├── PolySynths
        │   └── Polysynth (x1)
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

- Manages oscillator count (default 6)
- Creates oscillators, synths, and sequences
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

- Creates and manages Tone.Oscillator instances
- Pairs each oscillator with a Tone.Channel for volume/pan
- Returns array of `OscillatorWithChannel` objects
- Handles cleanup on unmount

#### useSynths

- Creates polyphonic synthesizers for the sequencer
- Pairs each synth with a Tone.Panner
- Returns array of `SynthWithPanner` objects
- Used for triggered notes (not continuous drones)

#### useSequences

- Manages step patterns for the sequencer
- Each sequence has a frequency and array of boolean steps
- Persists to local storage
- Returns sequences and setter function

#### useAudioEffectsBus

- Creates a Tone.Channel as the main bus
- Connects all effects in series
- Returns ref to the bus channel
- Manages wet/dry send control

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
Oscillator 1 ──┐
Oscillator 2 ──┤
Oscillator 3 ──┤
Oscillator 4 ──┼──→ Effects Bus ──→ Destination
Oscillator 5 ──┤         ↓               ↓
Oscillator 6 ──┤    [Effects]       [Recorder]
Synths ────────┘
```

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
2. **Synths**: Each synth connects to its own panner, which connects to the effects bus
3. **Effects**: Chained in series through the effects bus channel
4. **Bus Send**: Controls wet/dry mix for the entire effects chain
5. **Recorder**: Taps the master output for recording

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

## Future Enhancements

### Planned Features

1. **Modulation Matrix**: Route any modulator to any parameter
2. **MIDI Support**: Control parameters via MIDI controllers
3. **Advanced Routing**: Flexible audio routing options
4. **More Effects**: Chorus, phaser, etc.
5. **Visualization**: Waveform and spectrum displays
6. **Undo/Redo**: State history for sequencer patterns

### Architecture Changes

1. **Effect Bypass**: Proper bypass for all effects
2. **Parallel Effects**: Support for parallel effect chains
3. **Send/Return Buses**: Multiple effect buses
4. **Audio Worker**: Move processing to AudioWorklet for better performance
