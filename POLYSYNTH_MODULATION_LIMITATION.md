# PolySynth Modulation Limitation - Critical Finding

## The Problem

**TL;DR**: PolySynth does NOT support audio-rate modulation for frequency/detune parameters. Volume modulation works, but frequency modulation requires a workaround.

### What Works ✅

```javascript
// Volume modulation - Audio-rate signal works!
lfo.connect(scaler);
scaler.connect(polysynth.volume);  // ✅ Works perfectly
```

### What Doesn't Work ❌

```javascript
// Frequency modulation - Audio-rate signal does NOT work
lfo.connect(scaler);
scaler.connect(polysynth.detune);  // ❌ Does not affect triggered notes
```

## Why This Happens

`Tone.PolySynth` manages a pool of voice instances that are created dynamically:
- When you call `triggerAttackRelease()`, it allocates a voice from the pool
- Each voice is an independent `Tone.Synth` (or whatever instrument you specified)
- Connecting to `polysynth.detune` doesn't route the signal to individual voice oscillators
- The `detune` parameter can be SET statically with `.set({ detune: 100 })`, but can't receive audio-rate signals

From Tone.js documentation:
> "PolySynth is not a synthesizer by itself, it merely manages voices"

## Impact on Tone Drone

Each "Oscillator" (1-6) has TWO sound sources:
1. **Drone** (Tone.Oscillator) - ✅ Audio-rate modulation works fine
2. **Sequencer** (Tone.PolySynth) - ❌ Audio-rate frequency modulation doesn't work

### Affected Destinations

| Destination | Drone | Sequencer | Status |
|-------------|-------|-----------|--------|
| Frequency | ✅ Works | ❌ Doesn't work | **NEEDS WORKAROUND** |
| Volume | ✅ Works | ✅ Works | **OK** |
| Pan | ✅ Works | ✅ Works | **OK** |

## Workarounds

### Solution 1: Control-Rate Polling (Implemented in test page)

Poll the LFO value at control-rate (e.g., 20Hz) and update PolySynth via `.set()`:

```javascript
const updateInterval = setInterval(() => {
    // Read LFO output value
    const lfoValue = lfo._oscillator.getValueAtTime(Tone.now());
    const depth = 0.5; // modulation depth
    const detuneAmount = lfoValue * depth * 100; // ±100 cents
    
    // Update all voices
    polysynth.set({ detune: detuneAmount });
}, 50); // 50ms = 20Hz update rate
```

**Pros**:
- Simple to implement
- Works with existing architecture
- User probably won't notice the difference

**Cons**:
- Not true audio-rate (20Hz vs 44.1kHz)
- Slight CPU overhead from polling
- Can sound "steppy" with very fast LFOs
- Latency between LFO and audible effect

### Solution 2: Use Tone.Players Instead of PolySynth

Replace PolySynth with pre-created oscillators that can receive audio-rate signals:

```javascript
// Instead of PolySynth
const voices = Array(40).fill(null).map(() => {
    const osc = new Tone.Oscillator();
    const env = new Tone.AmplitudeEnvelope();
    osc.connect(env);
    return { osc, env };
});

// Connect LFO to all voices
voices.forEach(voice => {
    lfo.connect(voice.osc.detune);
});
```

**Pros**:
- True audio-rate modulation
- No polling overhead
- Smoother sound

**Cons**:
- **MAJOR REFACTORING REQUIRED**
- Need to manage voice allocation manually
- Higher memory usage (all voices pre-allocated)
- Complex voice management logic

### Solution 3: Hybrid Approach (Recommended)

- Use audio-rate for volume and pan (these work!)
- Use control-rate polling ONLY for frequency modulation

```javascript
function connectModulation(lfo, destination, polysynth, depth) {
    if (destination === 'frequency') {
        // Use control-rate polling for frequency
        return startFrequencyPolling(lfo, polysynth, depth);
    } else {
        // Use audio-rate for volume/pan
        const scaler = new Tone.Scale(min, max);
        lfo.connect(scaler);
        scaler.connect(polysynth[destination]);
        return { type: 'audio-rate', scaler };
    }
}
```

**Pros**:
- Best of both worlds
- Minimal CPU overhead
- Works with existing architecture

**Cons**:
- Frequency modulation not perfectly smooth
- Complexity in connection manager

## Implementation for Tone Drone

### Recommended Approach: Hybrid with Configurable Update Rate

```typescript
interface PolySynthModulationConfig {
    useControlRate: boolean;  // true for frequency, false for volume/pan
    updateRate?: number;      // Hz (default: 20)
}

class ModulationConnectionManager {
    private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
    
    connectToPolySynth(
        lfo: Tone.LFO,
        destination: 'detune' | 'volume' | 'pan',
        polysynth: Tone.PolySynth,
        depth: number,
        config: PolySynthModulationConfig
    ) {
        if (config.useControlRate && destination === 'detune') {
            // Control-rate polling for frequency
            const updateRate = config.updateRate || 20; // Hz
            const interval = setInterval(() => {
                const lfoValue = this.getLFOValue(lfo);
                const amount = lfoValue * depth * 100; // cents
                polysynth.set({ detune: amount });
            }, 1000 / updateRate);
            
            const id = `polysynth-${destination}`;
            this.pollingIntervals.set(id, interval);
            
            return { type: 'control-rate', id };
        } else {
            // Audio-rate connection for volume/pan
            const multiply = new Tone.Multiply(depth);
            const scale = new Tone.Scale(-30, 0); // dB for volume
            
            lfo.connect(multiply);
            multiply.connect(scale);
            scale.connect(polysynth[destination]);
            
            return { type: 'audio-rate', multiply, scale };
        }
    }
    
    disconnect(connection: any) {
        if (connection.type === 'control-rate') {
            const interval = this.pollingIntervals.get(connection.id);
            if (interval) {
                clearInterval(interval);
                this.pollingIntervals.delete(connection.id);
            }
        } else {
            connection.multiply?.disconnect();
            connection.scale?.disconnect();
        }
    }
}
```

### Update Rate Considerations

| Update Rate | Latency | CPU Usage | Smoothness | Use Case |
|------------|---------|-----------|------------|----------|
| 10 Hz | 100ms | Very Low | Steppy | Not recommended |
| 20 Hz | 50ms | Low | Acceptable | **Default** |
| 30 Hz | 33ms | Medium | Good | For faster LFOs |
| 60 Hz | 16ms | High | Very smooth | High-quality mode |

**Recommendation**: Default to 20Hz, make it configurable for power users.

## Testing Results

From `modulation-test.html`:

✅ **Works**:
- Drone frequency modulation (audio-rate via detune)
- PolySynth volume modulation (audio-rate)
- PolySynth frequency modulation (control-rate polling at 20Hz)

❌ **Doesn't Work**:
- PolySynth frequency modulation (direct audio-rate connection)

## Alternative: Different Synth Architecture

If we want true audio-rate frequency modulation for sequenced notes, we could:

1. **Use Monophonic Synths with manual voice management**
   - Pre-create N monosynths
   - Connect LFO to all of them
   - Manage note allocation ourselves

2. **Use Tone.Instrument with custom voice implementation**
   - Create custom instrument that supports audio-rate modulation
   - More complex but more flexible

3. **Accept the limitation**
   - Volume and pan work perfectly with audio-rate
   - Frequency uses control-rate polling
   - For most musical applications, 20Hz is sufficient

## Conclusion

**Recommended Path Forward**:
1. Implement hybrid approach (audio-rate for volume/pan, control-rate for frequency)
2. Default to 20Hz update rate for frequency modulation
3. Document the limitation clearly in UI/docs
4. Consider making update rate configurable (10-60Hz)

**Why This Works**:
- 20Hz is fast enough for musical LFO rates (0.1-10Hz typically)
- Most users won't notice it's not audio-rate
- Avoids massive refactoring of the sequencer architecture
- Volume and pan still get smooth audio-rate modulation

**Future Enhancement**:
- Add option to increase update rate to 60Hz for "high quality" mode
- Consider replacing PolySynth in a future major version

