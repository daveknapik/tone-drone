# Modulation Routing Implementation Plan

## Overview

This document outlines the complete plan for implementing actual audio routing in the modulation matrix, based on Tone.js architecture and the vue-synth reference implementation.

## Current State

✅ **Completed:**
- 4 LFOs created and managed (useModulationLFOs hook)
- UI for LFO controls (rate, amplitude, waveform)
- Routing grid UI (source, destination, depth selection)
- Preset save/load integration
- State management for routes and LFO parameters

🚧 **To Implement:**
- Actual audio connections between LFOs and target parameters
- Modulation depth scaling
- Connection cleanup/management
- Parameter range mapping

## Tone.js Modulation Architecture

### Key Concepts

1. **LFO Output**: `Tone.LFO` has an `output` property that can connect to AudioParams
2. **Connection**: Use `lfo.connect(targetParam)` to establish modulation
3. **Scaling**: Modulation depth is controlled by scaling the LFO's amplitude or using Tone.Scale
4. **Disconnection**: Must call `lfo.disconnect(targetParam)` to remove modulation

### LFO Configuration

```typescript
const lfo = new Tone.LFO({
  frequency: 0.5,    // Hz - rate of modulation
  amplitude: 1,       // 0-1 - modulation intensity
  min: -1,           // minimum output value
  max: 1,            // maximum output value
  type: "sine"       // waveform shape
});
```

### Connection Pattern

```typescript
// Direct connection (LFO controls full range)
lfo.connect(oscillator.frequency);

// Scaled connection (using intermediate scaling node)
const scale = new Tone.Scale(min, max);
lfo.connect(scale);
scale.connect(targetParam);

// Multiply for depth control
const multiply = new Tone.Multiply(depth);
lfo.connect(multiply);
multiply.connect(targetParam);
```

## Implementation Architecture

### Phase 1: Connection Manager

Create a new module: `src/utils/modulationConnectionManager.ts`

```typescript
interface ModulationConnection {
  lfo: Tone.LFO;
  destination: ModulationDestination;
  targetParam: Tone.Param | AudioParam;
  scaler?: Tone.Scale;      // For range mapping
  multiplier?: Tone.Multiply; // For depth control
}

class ModulationConnectionManager {
  private connections: Map<string, ModulationConnection>;
  
  connect(
    lfo: Tone.LFO,
    destination: ModulationDestination,
    targetParam: Tone.Param | AudioParam,
    depth: number,
    paramRange: { min: number; max: number }
  ): void;
  
  disconnect(connectionId: string): void;
  
  disconnectAll(): void;
  
  updateDepth(connectionId: string, depth: number): void;
}
```

### Phase 2: Parameter Access

Update `ModulationMatrix` to receive refs to all modulatable components:

```typescript
interface ModulationMatrixProps {
  ref?: React.Ref<ModulationMatrixHandle>;
  onParameterChange?: () => void;
  
  // Oscillator access
  oscillatorChannels?: Tone.Channel[];
  oscillators?: (Tone.Oscillator | Tone.FatOscillator)[];
  
  // Effect access
  filterRef?: React.RefObject<Tone.Filter>;
  delayRef?: React.RefObject<Tone.FeedbackDelay>;
  
  // Panner access for oscillators
  panners?: Tone.Panner[];
}
```

### Phase 3: Destination Mapping

Create mapping from destination strings to actual Tone.js parameters:

```typescript
type ParamAccessor = {
  param: Tone.Param | AudioParam;
  range: { min: number; max: number };
  scalingMode: "additive" | "multiplicative";
};

function getTargetParam(
  destination: ModulationDestination,
  refs: ModulationTargetRefs
): ParamAccessor | null {
  switch (destination) {
    case "osc1-volume":
      return {
        param: refs.oscillatorChannels[0].volume,
        range: { min: -60, max: 0 },    // dB range
        scalingMode: "additive"
      };
    
    case "osc1-frequency":
      return {
        param: refs.oscillators[0].frequency,
        range: { min: -100, max: 100 },  // cents detune
        scalingMode: "additive"
      };
    
    case "osc1-pan":
      return {
        param: refs.panners[0].pan,
        range: { min: -1, max: 1 },
        scalingMode: "additive"
      };
    
    case "filter-frequency":
      return {
        param: refs.filter.current.frequency,
        range: { min: 20, max: 20000 }, // Hz
        scalingMode: "multiplicative"
      };
    
    // ... other destinations
  }
}
```

### Phase 4: Routing Implementation

Update the `useEffect` in `ModulationMatrix.tsx`:

```typescript
useEffect(() => {
  // Disconnect all previous connections
  connectionManager.disconnectAll();
  
  // Create new connections for each route
  routes.forEach((route, index) => {
    if (route.destination === "none") return;
    
    const lfo = lfos[route.sourceIndex];
    if (!lfo) return;
    
    // Get the target parameter
    const target = getTargetParam(route.destination, {
      oscillatorChannels,
      oscillators,
      panners,
      filter: filterRef,
      delay: delayRef,
    });
    
    if (!target) return;
    
    // Create scaled connection with depth control
    connectionManager.connect(
      lfo,
      route.destination,
      target.param,
      route.amount,
      target.range
    );
  });
  
  return () => {
    connectionManager.disconnectAll();
  };
}, [routes, lfos, oscillatorChannels, /* ... other deps */]);
```

## Parameter Ranges & Scaling

### Volume (dB)
- **Range**: -60 to 0 dB
- **LFO Output**: -1 to 1
- **Scaling**: `depth * lfoOutput * 30` (±30 dB at full depth)
- **Mode**: Additive

### Frequency (Hz or Cents)
- **For Oscillators**: Use detune in cents
  - **Range**: ±100 cents (±1 semitone) at full depth
  - **LFO Output**: -1 to 1
  - **Scaling**: `depth * lfoOutput * 100`
  - **Mode**: Additive to detune parameter

- **For Filter**: Multiply frequency
  - **Range**: 0.5x to 2x (one octave each way) at full depth
  - **LFO Output**: -1 to 1 normalized to 0-1
  - **Scaling**: `baseFreq * (1 + depth * normalizedLfo)`
  - **Mode**: Multiplicative

### Pan
- **Range**: -1 to 1 (left to right)
- **LFO Output**: -1 to 1
- **Scaling**: `depth * lfoOutput`
- **Mode**: Additive

### Filter Q
- **Range**: 0.1 to 20
- **LFO Output**: -1 to 1 normalized to 0-1
- **Scaling**: `baseQ + (depth * normalizedLfo * 10)`
- **Mode**: Additive

### Delay Time
- **Range**: Current time ± 50% at full depth
- **LFO Output**: -1 to 1
- **Scaling**: `baseTime * (1 + depth * lfoOutput * 0.5)`
- **Mode**: Multiplicative

### Delay Feedback
- **Range**: 0 to 1
- **LFO Output**: -1 to 1 normalized to 0-1  
- **Scaling**: `depth * normalizedLfo`
- **Mode**: Additive (clamped 0-0.95 for safety)

## Data Flow

```
User Adjusts UI
    ↓
State Updates (routes, lfoParams)
    ↓
useEffect Triggers
    ↓
Disconnect Old Connections
    ↓
For Each Route:
  - Get LFO source
  - Get target parameter
  - Calculate scaling
  - Create connection with intermediate nodes
    ↓
Audio Signal Flow:
  LFO → Multiply(depth) → Scale(range) → Target Parameter
```

## Implementation Steps

### Step 1: Create Connection Manager
- [  ] Create `src/utils/modulationConnectionManager.ts`
- [  ] Implement connection tracking
- [  ] Implement connection/disconnection logic
- [  ] Add cleanup on disconnect

### Step 2: Update ModulationMatrix Props
- [  ] Add oscillator refs to props
- [  ] Add effect refs to props
- [  ] Update DroneSynth to pass refs

### Step 3: Create Parameter Mapping
- [  ] Create `getTargetParam` function
- [  ] Define ranges for all destinations
- [  ] Handle missing refs gracefully

### Step 4: Implement Routing Logic
- [  ] Update useEffect in ModulationMatrix
- [  ] Create connections with proper scaling
- [  ] Test each destination type
- [  ] Add error handling

### Step 5: Optimize & Polish
- [  ] Debounce depth changes to avoid clicking
- [  ] Add visual indicators when modulation is active
- [  ] Test with multiple simultaneous routes
- [  ] Performance testing with all 8 routes active

## Key Challenges & Solutions

### Challenge 1: Parameter Overriding
**Issue**: When an LFO connects to a parameter, it can override manual parameter values.

**Solution**: Use additive modulation where possible. For critical parameters, use Tone.Scale to add modulation on top of base value rather than replacing it.

### Challenge 2: Polyphony
**Issue**: Oscillators in step sequencer use PolySynth, which creates multiple voice instances.

**Solution**: Connect LFO to the master oscillator/channel parameters that affect all voices, not individual voice parameters.

### Challenge 3: Connection Cleanup
**Issue**: Old connections must be fully cleaned up to avoid memory leaks and audio glitches.

**Solution**: Track all connection objects (Scale, Multiply nodes) and dispose them properly when disconnecting.

### Challenge 4: Parameter Type Mismatches
**Issue**: Some parameters are AudioParam (native Web Audio), others are Tone.Param.

**Solution**: Use Tone.js's `.connect()` method which handles both types automatically.

## Testing Strategy

1. **Unit Tests**: Test connection manager in isolation
2. **Integration Tests**: Test each destination type individually
3. **UI Tests**: Verify parameter changes trigger routing updates
4. **Audio Tests**: Listen and verify modulation sounds correct
5. **Performance Tests**: Ensure no audio clicks or CPU spikes with 8 routes

## References

- [Tone.js LFO Documentation](https://tonejs.github.io/docs/latest/classes/LFO.html)
- [Tone.js Signal Documentation](https://tonejs.github.io/docs/latest/classes/Signal.html)
- [Web Audio API AudioParam](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam)
- [Vue-Synth Modulation Implementation](https://github.com/Razz21/vue-synth/tree/master/src)

## Future Enhancements

1. **Bipolar vs Unipolar**: Add mode switch for LFOs (0-1 vs -1 to 1)
2. **Modulation Visualization**: Show real-time modulation amount in UI
3. **LFO Phase Reset**: Sync LFO phases on note trigger
4. **Tempo Sync**: Allow LFOs to sync to BPM
5. **Envelope Followers**: Add envelope sources in addition to LFOs
6. **Modulation of Modulation**: Allow LFOs to modulate other LFO parameters
7. **Curve Shaping**: Add adjustable response curves for non-linear modulation

