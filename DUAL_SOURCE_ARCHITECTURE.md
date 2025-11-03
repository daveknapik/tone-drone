# Dual-Source Oscillator Architecture Challenge

## The Problem

Each "Oscillator" (1-6) as presented to the user is actually **TWO independent sound sources**:

1. **Continuous Drone**: `Tone.Oscillator` or `Tone.FatOscillator`
   - Runs continuously when playing
   - User controls frequency, waveform, volume, pan
   - Created by `useOscillators` hook

2. **Sequenced Notes**: `Tone.PolySynth`
   - Triggers notes on 16-step sequencer
   - Up to 40 voices of polyphony
   - Created by `useSynths` hook

### Current Audio Path

```
Oscillator 1 (as user sees it):
├── Drone:     oscillator -> channel (volume+pan) -> bus
└── Sequencer: polysynth -> panner -> bus
```

From `Oscillator.tsx` component props:
- `oscillator`: Tone.Oscillator | Tone.FatOscillator
- `channel`: Tone.Channel (for drone)
- `synth`: Tone.PolySynth
- `panner`: Tone.Panner (for synth)

### The Challenge

When user selects "Osc 1 Frequency" for modulation:
- ❌ Modulating just `oscillator.frequency` only affects the drone
- ❌ Modulating just the synth only affects sequenced notes
- ✅ **Need to modulate BOTH simultaneously**

## Solutions

### Solution 1: Dual Connection (Recommended)

Connect the LFO to **both** sources for each destination:

```typescript
function connectModulation(
  lfo: Tone.LFO,
  destination: "osc1-frequency",
  depth: number,
  targets: {
    oscillator: Tone.Oscillator,
    synth: Tone.PolySynth,
    channel: Tone.Channel,
    panner: Tone.Panner
  }
) {
  // Create scaling chain
  const depthMult = new Tone.Multiply(depth);
  const scaler = new Tone.Scale(-100, 100); // ±100 cents

  lfo.connect(depthMult);
  depthMult.connect(scaler);

  // Connect to BOTH sources
  scaler.connect(targets.oscillator.detune);  // Drone
  scaler.connect(targets.synth.detune);       // Sequencer

  return { depthMult, scaler };
}
```

### Solution 2: Global Detune Parameter

For frequency modulation specifically, both Oscillator and PolySynth have a `detune` parameter that works globally:

```typescript
// Frequency modulation via detune (in cents)
lfo.connect(scaler);
scaler.connect(oscillator.detune);  // Affects drone
scaler.connect(synth.detune);        // Affects ALL synth voices
```

**Pros**:
- Detune is additive - doesn't override base frequency
- Works consistently for both mono oscillators and polysynth voices
- Measured in cents (musical cents, 100 = 1 semitone)

**Cons**:
- Limited to ±2400 cents (±2 octaves) typically
- Can't do exponential frequency sweeps easily

### Solution 3: Master Channel Approach

Route BOTH sources through a single master channel per oscillator:

```
New architecture:
Oscillator 1:
├── Drone:     oscillator -> masterChannel
└── Sequencer: polysynth -> masterChannel
                masterChannel -> bus
```

**Pros**:
- Single point of control for volume/pan
- Cleaner modulation routing
- Matches user's mental model

**Cons**:
- Requires significant refactoring
- Changes existing audio path
- May affect current presets

## Implementation Strategy

### Phase 1: Frequency Modulation (Detune)

**Target**: `detune` parameter (exists on both Oscillator and PolySynth)

```typescript
interface FrequencyModulationTarget {
  oscillator: Tone.Oscillator | Tone.FatOscillator;
  synth: Tone.PolySynth;
}

function connectFrequencyModulation(
  lfo: Tone.LFO,
  target: FrequencyModulationTarget,
  depth: number
): ModulationConnection {
  const multiply = new Tone.Multiply(depth);
  const scale = new Tone.Scale(-100, 100); // cents range

  // Chain: LFO -> multiply(depth) -> scale(range)
  lfo.connect(multiply);
  multiply.connect(scale);

  // Connect to both detune parameters
  scale.connect(target.oscillator.detune);
  scale.connect(target.synth.detune);

  return { multiply, scale, connections: [
    { source: scale, target: target.oscillator.detune },
    { source: scale, target: target.synth.detune }
  ]};
}
```

### Phase 2: Volume Modulation

**Target**: Volume parameters on Channel (drone) and PolySynth (sequencer)

```typescript
interface VolumeModulationTarget {
  channel: Tone.Channel;  // Drone volume
  synth: Tone.PolySynth;  // Synth volume
}

function connectVolumeModulation(
  lfo: Tone.LFO,
  target: VolumeModulationTarget,
  depth: number
): ModulationConnection {
  const multiply = new Tone.Multiply(depth);
  const scale = new Tone.Scale(-30, 0); // dB range

  lfo.connect(multiply);
  multiply.connect(scale);

  // Connect to both volume parameters
  scale.connect(target.channel.volume);
  scale.connect(target.synth.volume);

  return { multiply, scale, connections: [
    { source: scale, target: target.channel.volume },
    { source: scale, target: target.synth.volume }
  ]};
}
```

### Phase 3: Pan Modulation

**Target**: Pan parameters

```typescript
interface PanModulationTarget {
  channel: Tone.Channel;  // Drone has pan on channel
  panner: Tone.Panner;    // Synth has dedicated panner
}

function connectPanModulation(
  lfo: Tone.LFO,
  target: PanModulationTarget,
  depth: number
): ModulationConnection {
  const multiply = new Tone.Multiply(depth);

  lfo.connect(multiply);

  // Pan range is already -1 to 1, so just apply depth
  multiply.connect(target.channel.pan);
  multiply.connect(target.panner.pan);

  return { multiply, connections: [
    { source: multiply, target: target.channel.pan },
    { source: multiply, target: target.panner.pan }
  ]};
}
```

## Parameter Reference Table

| Destination | Drone Target | Sequencer Target | Range | Scaling |
|------------|-------------|------------------|-------|---------|
| Frequency | `oscillator.detune` | `synth.detune` | ±100 cents | Additive |
| Volume | `channel.volume` | `synth.volume` | ±30 dB | Additive |
| Pan | `channel.pan` | `panner.pan` | -1 to 1 | Additive |

## Code Organization

### Updated ModulationMatrix Props

```typescript
interface OscillatorModulationTargets {
  oscillator: Tone.Oscillator | Tone.FatOscillator;
  channel: Tone.Channel;
  synth: Tone.PolySynth;
  panner: Tone.Panner;
}

interface ModulationMatrixProps {
  ref?: React.Ref<ModulationMatrixHandle>;
  onParameterChange?: () => void;

  // Array of 6 oscillator targets
  oscillatorTargets?: OscillatorModulationTargets[];

  // Effect targets
  filterRef?: React.RefObject<Tone.Filter>;
  delayRef?: React.RefObject<Tone.FeedbackDelay>;
}
```

### Gathering Targets from Oscillators Component

In `Oscillators.tsx`, we need to expose the oscillator targets:

```typescript
// Add to OscillatorsHandle interface
export interface OscillatorsHandle {
  getState: () => OscillatorsState;
  setState: (state: OscillatorsState) => void;
  getModulationTargets: () => OscillatorModulationTargets[];
}

// Implementation
const getModulationTargets = (): OscillatorModulationTargets[] => {
  return oscillators.map((osc, i) => ({
    oscillator: osc.oscillator,
    channel: osc.channel,
    synth: synths[i].synth,
    panner: synths[i].panner
  }));
};
```

## Testing Strategy

1. **Test with standalone page** (`modulation-test.html`)
   - Verify dual connections work
   - Test frequency modulation with detune
   - Test volume modulation
   - Confirm no audio glitches

2. **Test in React with single oscillator**
   - Connect modulation to Osc 1 only
   - Verify both drone and sequencer are affected
   - Test with different LFO settings

3. **Test multiple simultaneous routes**
   - Modulate Osc 1 frequency + Osc 2 volume simultaneously
   - Verify no cross-talk or interference

4. **Test preset save/load**
   - Create preset with modulation routes
   - Save and reload
   - Verify connections restore correctly

## React Integration Considerations

### Component Lifecycle

```typescript
useEffect(() => {
  // Get fresh targets each time routes change
  const targets = oscillatorsRef.current?.getModulationTargets();
  if (!targets) return;

  // Clear old connections
  connectionManager.disconnectAll();

  // Create new connections
  routes.forEach(route => {
    if (route.destination === "none") return;

    const oscIndex = getOscillatorIndex(route.destination);
    if (oscIndex !== null && targets[oscIndex]) {
      connectModulation(
        lfos[route.sourceIndex],
        route.destination,
        targets[oscIndex],
        route.amount
      );
    }
  });

  return () => {
    connectionManager.disconnectAll();
  };
}, [routes, lfos]);
```

### Avoiding Double Connections in React Strict Mode

```typescript
const connectionsRef = useRef<Set<string>>(new Set());

function connectWithTracking(id: string, connectFn: () => void) {
  if (connectionsRef.current.has(id)) {
    return; // Already connected
  }

  connectFn();
  connectionsRef.current.add(id);
}
```

## Next Steps

1. ✅ Create standalone test page
2. ⏳ Test dual connection approach with Tone.js
3. ⏳ Update OscillatorsHandle to expose modulation targets
4. ⏳ Implement connection manager with dual-source support
5. ⏳ Integrate into React components
6. ⏳ Test and refine

## Key Insights

- **Detune is your friend**: Use `detune` parameter for frequency modulation - it's additive and works for both sources
- **Always connect to both**: Every modulation route must connect to both the drone and sequencer
- **Track connections carefully**: Need to disconnect both connections when changing routes
- **Test outside React first**: Verify Tone.js routing works before dealing with React lifecycle

