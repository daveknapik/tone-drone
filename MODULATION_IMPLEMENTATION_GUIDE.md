# Modulation Matrix Implementation Guide

## Overview
This document contains everything needed to implement modulation in tone-drone, based on extensive testing and prototyping.

---

## Decision: Focus on Drones + Effects Only

After comprehensive testing, we determined that:
- ✅ **Drone oscillators** support reliable audio-rate modulation
- ✅ **Effects parameters** can be modulated effectively
- ❌ **PolySynth voices** have architectural limitations preventing reliable modulation

### Test Results Summary

| Source Type | Frequency | Volume | Pan | Verdict |
|-------------|-----------|--------|-----|---------|
| **Drone (Tone.Oscillator)** | ✅ Perfect | ✅ Perfect | ✅ Perfect | **Use for modulation** |
| **Regular Synth** | ✅ Works | ✅ Works | ⚠️ Subtle | Possible but not priority |
| **PolySynth** | ❌ Unreliable | ✅ Works | ❌ Inaudible | **Skip for modulation** |

**Root Cause**: `Tone.PolySynth` dynamically creates voices. Audio-rate signals connected to PolySynth parameters don't reliably affect individual voices created after connection. Control-rate polling workarounds proved unreliable.

---

## Recommended Modulation Destinations

### 6 Drone Oscillators × 3 Parameters Each
1. **Frequency** (via `detune` parameter)
2. **Volume** (via `Tone.Gain` nodes)
3. **Pan** (via `Channel.pan`)

= **18 oscillator destinations**

### Effects Parameters (Examples)
- Delay: time, feedback, wet/dry
- Reverb: roomSize, dampening, wet/dry
- Filter: frequency, Q/resonance
- Distortion: amount
- etc.

= **~8-12 effect destinations**

**Total: ~26-30 reliable modulation destinations**

---

## Technical Implementation Details

### 1. Frequency Modulation (Detune)

**Approach**: Connect LFO to oscillator's `detune` parameter via scaling node.

```typescript
// Scale LFO output (-1 to +1) to ±100 cents
const frequencyScaler = new Tone.Scale(-100, 100);

// Connect: LFO → depth → scaler → oscillator.detune
lfo.connect(depthMultiplier);
depthMultiplier.connect(frequencyScaler);
frequencyScaler.connect(oscillator.detune);
```

**Key Points**:
- Audio-rate modulation (smooth, sample-accurate)
- ±100 cents provides ~2 semitones of vibrato at full depth
- Works perfectly on `Tone.Oscillator` and `Tone.FatOscillator`

---

### 2. Volume Modulation (Tone.Gain Nodes)

**Critical Discovery**: Web Audio parameters use **additive modulation** (signals ADD to parameter values, not multiply).

**WRONG Approach** ❌:
```typescript
// Don't modulate Tone.Channel.volume directly!
lfo.connect(droneChannel.volume); // Causes baseline shift + distortion
```

**CORRECT Approach** ✅:
```typescript
// Insert Tone.Gain node into signal path
const modulationGain = new Tone.Gain(1);
oscillator.disconnect();
oscillator.connect(modulationGain);
modulationGain.connect(channel);

// Build modulation signal: 1.0 + (LFO * depth * 0.5)
const unitySignal = new Tone.Signal(1.0);
const addNode = new Tone.Add();
const scaler = new Tone.Scale(-0.5, 0.5); // ±0.5 modulation

unitySignal.connect(addNode);
lfo.connect(depthMultiplier);
depthMultiplier.connect(scaler);
scaler.connect(addNode);

// Connect modulation signal to gain.gain parameter
addNode.connect(modulationGain.gain);

// CRITICAL: Zero the parameter AFTER connecting signal chain
modulationGain.gain.value = 0; // Signal now provides value (1.0 ± 0.5)
```

**Why This Works**:
- `Tone.Gain.gain` parameter is **linear** (not dB like volume)
- Base value = 1.0 (unity gain)
- Modulation range = 0.5 to 1.5 (50% to 150% volume)
- No baseline shift, no distortion
- Clean tremolo effect

**Order of Operations**:
1. Connect all signal chain nodes first
2. Then connect signal to `gain.gain` parameter
3. **THEN** set `gain.gain.value = 0`
4. If you zero it too early, audio will cut out!

---

### 3. Pan Modulation

**Approach**: Connect LFO directly to pan parameter (already -1 to +1 range).

```typescript
// LFO output range (-1 to +1) matches pan range perfectly
lfo.connect(depthMultiplier);
depthMultiplier.connect(channel.pan);
```

**Key Points**:
- Audio-rate stereo modulation
- -1 = full left, +1 = full right, 0 = center
- Most effective on continuous, rich sounds (like drones)
- Single transient notes may sound subtle due to psychoacoustics

---

### 4. Depth Control (Reactive & Smooth)

**Approach**: Use `Tone.Multiply` node with `factor` as AudioParam.

```typescript
const depthMultiplier = new Tone.Multiply(initialDepth);
lfo.connect(depthMultiplier);
// depthMultiplier.connect(...rest of chain)

// Update depth dynamically with smoothing
const updateDepth = (newDepth: number) => {
  const now = Tone.now();
  depthMultiplier.factor.cancelScheduledValues(now);
  depthMultiplier.factor.setTargetAtTime(newDepth, now, 0.015);
};
```

**Why `Tone.Multiply` not `new Tone.Multiply(depth)`**:
- `depthMultiplier.factor` is an **AudioParam** - updates in real-time
- `new Tone.Multiply(depth)` creates a static node - depth captured at creation
- Use `setTargetAtTime()` for smooth, exponential ramps (prevents clicks)

**Debouncing** (optional for sliders):
```typescript
let debounceTimer: NodeJS.Timeout;
const handleDepthChange = (value: number) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    updateDepth(value);
  }, 10); // 10ms debounce
};
```

---

### 5. LFO Polarity Modes (Unipolar vs Bipolar)

**Overview**: LFOs can output either bipolar (-1 to +1) or unipolar (0 to +1) signals. The polarity mode affects both the LFO signal range AND the resulting modulation behavior.

#### When to Use Each Mode

| Polarity | LFO Signal Range | Volume Result | Best For | Why |
|----------|------------------|---------------|----------|-----|
| **Bipolar** | -1 to +1 | 0.5 → 1.5 gain | Frequency (vibrato), Pan, Pitch | Oscillates equally above/below center value |
| **Unipolar** | 0 to +1 | 0 → 1.0 gain | Volume (tremolo), Filter cutoff, Effect mix | Starts from zero, prevents negative values |

**Key Distinction**:
- **LFO Signal Range**: What the LFO outputs (the raw modulation signal)
- **Volume Result**: How that signal affects audio volume after processing
- The volume modulation architecture transforms the LFO signal (see Volume Modulation section above)

#### Implementation

**Architecture**: Base LFO always generates bipolar signal, transform to unipolar when needed.

```typescript
// Create LFO (always bipolar internally)
const lfo = new Tone.LFO({
  frequency: 2,
  amplitude: 1,
  min: -1,
  max: 1
});

// Create unipolar transformer
const unipolarScaler = new Tone.Scale(-1, 1, 0, 1);  // Maps [-1,1] → [0,1]

// Route based on polarity mode
if (polarityMode === 'unipolar') {
  // LFO → unipolarScaler → [rest of chain]
  lfo.connect(unipolarScaler);
  unipolarScaler.connect(depthMultiplier);
} else {
  // LFO → [rest of chain] (direct)
  lfo.connect(depthMultiplier);
}
```

#### Seamless Mode Switching

```typescript
const setPolarityMode = (lfoIndex: number, mode: 'bipolar' | 'unipolar') => {
  const state = lfoStates[lfoIndex];
  if (state.polarityMode === mode) return;

  const now = Tone.now();

  // Smooth fade-out
  state.outputSignal.linearRampToValueAtTime(0, now + 0.05);

  // Reconfigure routing after fade-out
  setTimeout(() => {
    state.lfo.disconnect();
    state.unipolarScaler.disconnect();

    if (mode === 'unipolar') {
      state.lfo.connect(state.unipolarScaler);
      state.unipolarScaler.connect(state.outputSignal);
    } else {
      state.lfo.connect(state.outputSignal);
    }

    state.polarityMode = mode;
  }, 60);  // Slightly longer than fade time
};
```

#### Per-LFO State Management

```typescript
interface LFOState {
  lfo: Tone.LFO;
  polarityMode: 'bipolar' | 'unipolar';
  unipolarScaler: Tone.Scale;  // Always created, conditionally inserted
  outputSignal: Tone.Signal;    // Final output after polarity processing
}
```

#### UI Considerations

- **Button/Toggle**: Allow users to switch modes
- **Visual Indicator**: Show current mode (e.g., ± for bipolar, + for unipolar)
- **Color Coding**: Different colors help distinguish modes
- **Tooltips**: Explain what each mode does and when to use it

#### Example Use Cases & Signal Flow

**Example 1: Tremolo (Unipolar Volume Modulation)**:
```typescript
// LFO Configuration: Sine wave, 4Hz, unipolar mode
// Signal Flow:
//   1. LFO outputs: 0 → +1 → 0 → +1 (sine wave)
//   2. After depth (0.8): 0 → 0.8 → 0 → 0.8
//   3. Applied to Tone.Gain: gain ranges from 0 to 0.8
// Result: Volume pulses from silence to 80%, dramatic tremolo effect
```

**Example 2: Subtle Tremolo (Bipolar Volume Modulation)**:
```typescript
// LFO Configuration: Sine wave, 4Hz, bipolar mode
// Signal Flow:
//   1. LFO outputs: -1 → +1 → -1 → +1 (sine wave)
//   2. After depth (0.8) and scale (×0.5): -0.4 → +0.4
//   3. After adding base (1.0): 0.6 → 1.4
//   4. Applied to Tone.Gain: gain ranges from 0.6 to 1.4
// Result: Volume pulses from 60% to 140%, never goes silent, gentle tremolo
```

**Example 3: Vibrato (Bipolar Frequency Modulation)**:
```typescript
// LFO Configuration: Sine wave, 5Hz, bipolar mode
// Signal Flow:
//   1. LFO outputs: -1 → +1 → -1 → +1 (sine wave)
//   2. After depth (0.5): -0.5 → +0.5
//   3. After frequency scaling (×100): -50 → +50 cents
//   4. Applied to oscillator.detune: ±50 cents from base frequency
// Result: Pitch oscillates smoothly around center frequency
```

---

## Connection Management

### ModulationConnectionManager Class

```typescript
interface ModulationConnection {
  lfoId: string;
  destination: string; // e.g., "osc1-frequency", "delay-time"
  nodes: Tone.ToneAudioNode[]; // Track all intermediate nodes
  cleanup: () => void;
}

class ModulationConnectionManager {
  private connections = new Map<string, ModulationConnection>();

  connect(
    lfo: Tone.LFO,
    depthMultiplier: Tone.Multiply,
    destination: string,
    targetParam: Tone.Param
  ): string {
    const id = `${lfo.toString()}-${destination}`;

    // Build appropriate signal chain based on destination type
    if (destination.includes('volume')) {
      this.connectVolume(lfo, depthMultiplier, targetParam);
    } else if (destination.includes('frequency')) {
      this.connectFrequency(lfo, depthMultiplier, targetParam);
    } else if (destination.includes('pan')) {
      this.connectPan(lfo, depthMultiplier, targetParam);
    }

    return id;
  }

  disconnect(connectionId: string): void {
    const conn = this.connections.get(connectionId);
    if (conn) {
      conn.cleanup();
      this.connections.delete(connectionId);
    }
  }

  disconnectAll(): void {
    this.connections.forEach(conn => conn.cleanup());
    this.connections.clear();
  }
}
```

---

## Architecture: Dual-Source Challenge (Solved)

**Original Problem**: Each "oscillator" in tone-drone is actually TWO sources:
1. **Drone** - Continuous `Tone.Oscillator` or `Tone.FatOscillator`
2. **Sequencer** - `Tone.PolySynth` for sequenced notes

**Original Goal**: Modulate both as if they were one unit.

**Solution**: Focus modulation on drones only.
- Drones provide the continuous, modulation-rich foundation
- Sequenced notes remain clean and rhythmic
- This separation actually enhances the musical distinction
- Avoids PolySynth architectural limitations entirely

---

## Common Pitfalls & Solutions

### ❌ Problem: Volume modulation causes baseline shift
**Solution**: Use `Tone.Gain` nodes with base+modulation architecture (1.0 + LFO)

### ❌ Problem: Depth slider doesn't affect modulation
**Solution**: Use `Tone.Multiply.factor` AudioParam, not static value

### ❌ Problem: Clicking/popping when changing depth
**Solution**: Use `setTargetAtTime()` with debouncing

### ❌ Problem: Audio cuts out when connecting modulation
**Solution**: Connect signal chain fully BEFORE zeroing parameter value

### ❌ Problem: PolySynth frequency modulation doesn't work
**Solution**: Don't modulate PolySynth - use drones only

---

## Testing Checklist

When implementing modulation, verify:

- [ ] **Frequency modulation**
  - [ ] Smooth vibrato at various depths
  - [ ] No pitch drift (returns to center)
  - [ ] Works on all 6 oscillators

- [ ] **Volume modulation**
  - [ ] Clean tremolo, no distortion
  - [ ] Baseline volume unchanged at 0 depth
  - [ ] Full depth provides audible but not extreme pulsing

- [ ] **Pan modulation**
  - [ ] Clear left/right movement in stereo
  - [ ] Returns to center between cycles
  - [ ] No perceived timbre changes

- [ ] **Depth control**
  - [ ] Real-time updates without audio artifacts
  - [ ] 0 depth = no modulation
  - [ ] Full depth provides strong but musical effect

- [ ] **Multiple routes**
  - [ ] Can run 8+ routes simultaneously without performance issues
  - [ ] Each route independent and clean

- [ ] **Connect/disconnect**
  - [ ] No clicks or pops
  - [ ] Clean transitions
  - [ ] Audio state properly restored on disconnect

---

## File Structure

### React Components
- `src/components/ModulationMatrix.tsx` - Main container
- `src/components/ModulationLFO.tsx` - Individual LFO controls
- `src/components/ModulationMatrixGrid.tsx` - Routing grid

### Utilities
- `src/utils/modulationConnectionManager.ts` - Connection management class

### Types
- `src/types/ModulationMatrixParams.ts` - TypeScript interfaces

### Hooks
- `src/hooks/useModulationLFOs.ts` - LFO instance management

---

## Next Implementation Steps

1. Create `ModulationConnectionManager` class
2. Update `ModulationMatrix` to receive oscillator refs (not PolySynth)
3. Implement routing logic for frequency, volume, pan
4. Test with single oscillator first
5. Extend to all 6 oscillators
6. Add effects parameters
7. Performance test with all routes active

---

## References

- **Tone.js Documentation**: https://tonejs.github.io/
- **Web Audio API Spec**: https://webaudio.github.io/web-audio-api/
- **Key Discovery**: Web Audio uses additive modulation (signals add to parameters)
- **Testing**: All approaches validated in standalone HTML prototype

---

## Conclusion

By focusing on **drones + effects** and using the proven **Tone.Gain architecture for volume**, we can implement a robust, reliable modulation matrix with ~26-30 destinations that all work perfectly.

The PolySynth limitation is not a compromise - it's an architectural decision that actually improves the design by maintaining clear sonic roles: drones provide evolving, modulated textures while sequenced notes stay crisp and rhythmic.

