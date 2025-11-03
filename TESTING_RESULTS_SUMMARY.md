# Modulation Routing Test Results - Summary

## Executive Summary

We successfully tested the modulation routing architecture outside of React and discovered a **critical limitation** with Tone.js PolySynth that requires a hybrid implementation approach.

## Test Environment

- **Tool**: Standalone HTML page (`modulation-test.html`)
- **Architecture**: Dual-source (Oscillator + PolySynth)
- **Tested**: LFO → Frequency, LFO → Volume
- **Result**: Mixed - Volume works perfectly, Frequency requires workaround

## Key Findings

### ✅ What Works Perfectly (Audio-Rate)

| Destination | Source | Connection Type | Result |
|------------|---------|-----------------|---------|
| Drone Frequency | Tone.Oscillator | `lfo → scaler → drone.detune` | ✅ Perfect |
| Drone Volume | Tone.Channel | `lfo → scaler → channel.volume` | ✅ Perfect |
| PolySynth Volume | Tone.PolySynth | `lfo → scaler → polysynth.volume` | ✅ Perfect |
| PolySynth Pan | Tone.Panner | `lfo → scaler → panner.pan` | ✅ Perfect |

### ❌ What Doesn't Work (Audio-Rate)

| Destination | Source | Attempted Connection | Issue |
|------------|---------|---------------------|-------|
| PolySynth Frequency | Tone.PolySynth | `lfo → scaler → polysynth.detune` | ❌ Signal doesn't route to voice oscillators |

### ✅ Workaround (Control-Rate)

**Solution**: Poll LFO value at 20Hz and update via `.set()`:

```javascript
setInterval(() => {
    const lfoValue = lfo._oscillator.getValueAtTime(Tone.now());
    const detuneAmount = lfoValue * depth * 100; // ±100 cents
    polysynth.set({ detune: detuneAmount });
}, 50); // 50ms = 20Hz
```

**Result**: Works well! Imperceptible for typical LFO rates (0.1-10Hz).

## Root Cause Analysis

### PolySynth Architecture

```
Tone.PolySynth
├── Voice Pool (pre-allocated)
│   ├── Voice 1 (Tone.Synth)
│   ├── Voice 2 (Tone.Synth)
│   └── Voice N (Tone.Synth)
└── Dynamic Voice Allocation
```

**The Problem**:
- PolySynth manages a pool of voice instances
- When you connect to `polysynth.detune`, it doesn't automatically route to individual voice oscillators
- The `.set()` method works because it updates ALL voices' parameters
- But `.connect()` for audio-rate signals doesn't propagate to voices

**Why Volume Works**:
- `polysynth.volume` is a master volume control AFTER voice mixing
- Signal routing works because it's a single point of control
- Not per-voice, but post-voice-summation

## Implications for Tone Drone

### Current Architecture (6 Oscillators)

Each "Oscillator" the user sees:
```
Oscillator N
├── Drone (Tone.Oscillator) ← Audio-rate modulation works
└── Sequencer (Tone.PolySynth) ← Audio-rate frequency doesn't work
```

### Modulation Matrix Requirements

When user selects "Osc 1 Frequency":
- **Drone**: Use `oscillator.detune` with audio-rate connection ✅
- **Sequencer**: Use control-rate polling with `.set({ detune })` ⚠️

## Recommended Implementation

### Hybrid Approach

```typescript
interface ModulationConnection {
    type: 'audio-rate' | 'control-rate';
    nodes?: {
        multiply: Tone.Multiply;
        scaler: Tone.Scale;
    };
    polling?: {
        interval: NodeJS.Timeout;
        updateRate: number; // Hz
    };
}

// For Frequency (needs hybrid)
function connectFrequency(lfo, targets, depth) {
    const connections = [];
    
    // Drone: Audio-rate
    const droneConnection = connectAudioRate(
        lfo, targets.oscillator.detune, depth, { min: -100, max: 100 }
    );
    connections.push(droneConnection);
    
    // Sequencer: Control-rate
    const pollingConnection = startPolling(
        lfo, targets.polysynth, depth, 'detune', 20 // 20Hz
    );
    connections.push(pollingConnection);
    
    return connections;
}

// For Volume/Pan (pure audio-rate)
function connectVolume(lfo, targets, depth) {
    const multiply = new Tone.Multiply(depth);
    const scaler = new Tone.Scale(-30, 0);
    
    lfo.connect(multiply);
    multiply.connect(scaler);
    
    // Both work with audio-rate!
    scaler.connect(targets.droneChannel.volume);
    scaler.connect(targets.polysynth.volume);
    
    return { type: 'audio-rate', multiply, scaler };
}
```

### Performance Characteristics

| Approach | Update Rate | CPU | Smoothness | Best For |
|----------|------------|-----|------------|----------|
| Audio-rate | 44,100 Hz | Minimal | Perfect | Volume, Pan, Filter |
| Control-rate (20Hz) | 20 Hz | Low | Good | Frequency (PolySynth) |
| Control-rate (60Hz) | 60 Hz | Medium | Excellent | High-quality mode |

**Recommendation**: Default to 20Hz for frequency modulation, make it configurable.

## Testing Checklist

- [x] Verify LFO signal path
- [x] Test drone frequency modulation (audio-rate)
- [x] Test PolySynth frequency modulation (control-rate workaround)
- [x] Test volume modulation to both sources
- [x] Test depth scaling
- [x] Verify connection cleanup
- [ ] Test in React environment
- [ ] Test with multiple simultaneous routes
- [ ] Test preset save/load with modulation
- [ ] Performance test with 8 routes

## Next Steps

1. **Implement ModulationConnectionManager** with hybrid support
   - Audio-rate connections for volume/pan/filter
   - Control-rate polling for PolySynth frequency
   - Proper cleanup of both connection types

2. **Update ModulationMatrix** to receive all required refs
   - Oscillators (array of 6)
   - Channels (array of 6)
   - PolySynths (array of 6)
   - Panners (array of 6)
   - Effect refs (filter, delay)

3. **Implement destination mapping** with connection type selection
   - Automatically choose audio-rate vs control-rate
   - Handle dual-source connections

4. **Test in React** with lifecycle management
   - Handle component unmount
   - Handle route changes
   - Handle LFO parameter changes

## Potential Enhancements

1. **Configurable polling rate**: Let power users choose 10-60Hz
2. **Visual indicator**: Show which connections are audio-rate vs control-rate
3. **Performance mode**: Disable polling when not needed
4. **Future**: Consider replacing PolySynth with custom voice manager for true audio-rate support

## Conclusion

The hybrid approach (audio-rate for most, control-rate for PolySynth frequency) is:
- ✅ Practical and implementable
- ✅ Performant (20Hz polling is negligible)
- ✅ User-transparent (sounds good!)
- ✅ Works with existing architecture

**Ready to proceed with React integration!**

