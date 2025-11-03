# Tone.js Gain Node Solution for Volume Modulation

## The Breakthrough Discovery

After extensive testing, the user discovered that **even when the LFO is stopped**, the volume stays loud. This critical observation revealed that the issue is NOT the LFO oscillation itself, but a **fundamental mismatch between parameter types**.

## Root Cause: dB vs Linear Value Mismatch

### The Problem

```javascript
// Tone.js channel.volume is in DECIBELS (logarithmic)
droneChannel.volume.value = -5;  // -5 dB

// But connected signals are LINEAR values!
Tone.Signal(-5) → channel.volume  // Adds -5 (linear) not -5 dB!
```

**The core issue**: `Tone.js` volume parameters expect **dB values** when set via `.value`, but when you `.connect()` a signal to them, the Web Audio API treats those signals as **LINEAR gain values**.

### Why base+modulation Didn't Work

```javascript
// We tried:
droneChannel.volume.value = 0;  // 0 dB
const baseSignal = new Tone.Signal(-5);  // Signal with value -5
baseSignal.connect(volume);  // Web Audio adds: 0 + (-5 linear) = ???

// The -5 is interpreted as LINEAR, not dB!
// This causes unexpected loudness and distortion
```

## The Solution: Use Tone.Gain Nodes

Instead of modulating `channel.volume` (dB parameter), we insert `Tone.Gain` nodes and modulate their `.gain` parameter (linear parameter).

### Architecture

```
BEFORE (direct connection):
drone → droneChannel → destination
synth → synthChannel → destination

AFTER (with modulation gain):
drone → Tone.Gain (modulated) → droneChannel → destination
synth → Tone.Gain (modulated) → synthChannel → destination
                ↑
         LFO modulation
```

### Why This Works

1. **`Tone.Gain.gain` is LINEAR** - Matches the linear nature of connected signals
2. **No dB conversion** - Everything stays in linear space
3. **Channel volume preserved** - Original dB settings remain unchanged
4. **Clean insertion/removal** - Gain nodes can be inserted and removed from signal path

## Implementation

### Step 1: Create and Insert Gain Nodes

```javascript
// Create gain nodes (linear space, unity gain = 1.0)
const droneModGain = new Tone.Gain(1);  // Start at unity
const synthModGain = new Tone.Gain(1);

// Disconnect original routing
drone.disconnect(droneChannel);
polysynth.disconnect(synthChannel);

// Insert gain nodes
drone.connect(droneModGain);
polysynth.connect(synthModGain);
droneModGain.connect(droneChannel);
synthModGain.connect(synthChannel);
```

### Step 2: Set Up base+modulation in LINEAR Space

```javascript
// Set gain params to 0 (Web Audio additive behavior)
droneModGain.gain.value = 0;
synthModGain.gain.value = 0;

// Create constant signals for unity gain (1.0 = 0 dB)
const droneUnity = new Tone.Signal(1);
const synthUnity = new Tone.Signal(1);

// Create Add nodes to sum: 1.0 + modulation
const droneGainAdd = new Tone.Add();
const synthGainAdd = new Tone.Add();

// Scale LFO to reasonable range: ±0.5 around unity
// At depth=1.0, gain will be: 1.0 ± 0.5 = 0.5 to 1.5 (±50%)
const gainScale = new Tone.Scale(-0.5, 0.5);

// Connect: unity (1.0) + modulation → gain.param
droneUnity.connect(droneGainAdd);
synthUnity.connect(synthGainAdd);

lfo.connect(depthMultiplier);      // Depth control (0 to 1)
depthMultiplier.connect(gainScale); // Scale: depth * (±0.5)
gainScale.connect(droneGainAdd);   // Add to unity
gainScale.connect(synthGainAdd);

droneGainAdd.connect(droneModGain.gain);  // Final: 0 + (1 + mod)
synthGainAdd.connect(synthModGain.gain);
```

### Step 3: Clean Disconnection

```javascript
function disconnectAll() {
    // Disconnect and dispose gain nodes
    droneModGain.disconnect();
    synthModGain.disconnect();
    droneModGain.dispose();
    synthModGain.dispose();
    
    // Restore original routing
    drone.disconnect();
    polysynth.disconnect();
    drone.connect(droneChannel);
    polysynth.connect(synthChannel);
    
    // Dispose signal nodes
    droneUnity.disconnect();
    synthUnity.disconnect();
    droneUnity.dispose();
    synthUnity.dispose();
    
    droneGainAdd.disconnect();
    synthGainAdd.disconnect();
    droneGainAdd.dispose();
    synthGainAdd.dispose();
    
    gainScale.disconnect();
    gainScale.dispose();
}
```

## Signal Flow Diagram

```
LFO (-1 to +1)
    ↓
depthMultiplier (0 to 1)
    ↓
depthMultiplier.factor (reactive AudioParam)
    ↓
gainScale (-0.5 to +0.5)  ← scaled by depth
    ↓
    ├────────────┐
    ↓            ↓
droneGainAdd  synthGainAdd
    ↑            ↑
droneUnity   synthUnity
  (1.0)        (1.0)
    ↓            ↓
droneModGain.gain  synthModGain.gain
  (param=0)        (param=0)
    ↓            ↓
Result: 0 + (1.0 + modulation) = 1.0 ± (depth * 0.5)
```

## Benefits

### ✅ Type Consistency
- Everything operates in LINEAR space
- No dB/linear conversion issues
- Signals match parameter expectations

### ✅ Preserved Settings
- Channel volume settings (dB) remain unchanged
- Original signal routing can be restored
- No parameter pollution

### ✅ Predictable Behavior
- Unity gain (1.0) = no volume change
- Depth=0: gain = 1.0 (no modulation)
- Depth=1.0: gain = 0.5 to 1.5 (50% tremolo)

### ✅ Clean Architecture
- Gain nodes are temporary, disposable
- Easy to insert and remove
- No side effects on other parameters

## Modulation Depth Ranges

At **full depth (1.0)**:

| Depth | Min Gain | Max Gain | Effect |
|-------|----------|----------|--------|
| 0.0   | 1.0      | 1.0      | No modulation |
| 0.25  | 0.875    | 1.125    | Subtle tremolo (±12.5%) |
| 0.5   | 0.75     | 1.25     | Moderate tremolo (±25%) |
| 1.0   | 0.5      | 1.5      | Strong tremolo (±50%) |

## Testing Checklist

After implementing this approach, verify:

1. **Depth=0 Test**:
   - Connect LFO with depth=0
   - Volume should be **identical** to unmodulated
   - No loudness increase
   - No character/brightness change

2. **Depth Control Test**:
   - Slowly increase depth from 0 to 1
   - Tremolo should smoothly increase
   - Depth should be reactive (real-time changes)

3. **LFO Stop Test**:
   - Connect with depth=0
   - Stop the LFO
   - Volume should remain at original level
   - No "stuck loud" issue

4. **Disconnect Test**:
   - Connect, then disconnect
   - Original signal routing restored
   - No leftover gain nodes
   - Volume returns to pre-modulation level

## Application to Other Parameters

### When to Use Gain Node Approach

**Use for parameters with NON-ZERO baselines**:
- ✅ Volume (channel.volume in dB)
- ✅ Filter cutoff (frequency in Hz)
- ✅ Delay time (time in seconds)

**NOT needed for**:
- ❌ Detune (already additive, defaults to 0 cents)
- ❌ Pan (range matches LFO output ±1)
- ❌ Parameters naturally centered at 0

### General Pattern

For any parameter with a non-zero baseline:

1. Insert a `Tone.Gain` node BEFORE the target
2. Modulate the gain node's `.gain` parameter
3. Use base (1.0) + scaled modulation
4. Remove gain node on disconnect

## Key Learnings

1. **Tone.js volume is in dB space** (logarithmic)
2. **Connected signals are linear** (Web Audio API behavior)
3. **Don't mix dB control with linear signals**
4. **Use Tone.Gain for volume modulation** (linear → linear)
5. **Channel volume for static control** (dB → dB)

## References

- [Web Audio API - AudioParam](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam)
- [Tone.js - Gain](https://tonejs.github.io/docs/latest/classes/Gain)
- [Tone.js - Signal](https://tonejs.github.io/docs/latest/classes/Signal)
- WEB_AUDIO_ADDITIVE_MODULATION.md (previous approach)

## Next Steps

1. **Test in `modulation-test.html`** - Verify the fix works
2. **Apply to drone/synth individual volume** - Use same pattern
3. **Identify other dB parameters** - Filter cutoff, etc.
4. **Port to ModulationConnectionManager** - Implement in React app
5. **Document which destinations need gain nodes** - Create lookup table

---

**Status**: Experimental - awaiting user testing confirmation

