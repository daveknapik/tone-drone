# PolySynth Modulation Testing Results

## Summary
Through extensive testing, we've confirmed that **`Tone.PolySynth` has fundamental architectural limitations that prevent reliable audio-rate modulation**, particularly for frequency and pan parameters.

## Test Methodology
Created a standalone test page (`modulation-test.html`) that tests modulation on three types of audio sources:
1. **Continuous Drone** (`Tone.Oscillator`)
2. **PolySynth** (`Tone.PolySynth(Tone.Synth)`)
3. **Regular Synth** (`Tone.Synth`)

## Results

### ✅ Drone (Tone.Oscillator) - WORKS PERFECTLY
| Parameter | Works? | Notes |
|-----------|--------|-------|
| Frequency | ✅ Yes | Audio-rate modulation via `detune` parameter |
| Volume    | ✅ Yes | Using `Tone.Gain` nodes with base+modulation architecture |
| Pan       | ✅ Yes | Audio-rate modulation via `Channel.pan` |

**Verdict**: Drones are excellent modulation targets. All three parameters work reliably.

---

### ❌ PolySynth (Tone.PolySynth) - MAJOR LIMITATIONS
| Parameter | Works? | Notes |
|-----------|--------|-------|
| Frequency | ❌ No  | Control-rate polling workaround doesn't work reliably. PolySynth architecture doesn't support audio-rate modulation of dynamically created voices. |
| Volume    | ✅ Yes | Works with `Tone.Gain` approach when `synthPanner` is kept in signal path |
| Pan       | ⚠️ Barely | Technically works but effect is extremely subtle/inaudible |

**Verdict**: PolySynth is NOT suitable as a primary modulation target. Only volume works reliably.

### Root Cause - PolySynth Architecture
`Tone.PolySynth` dynamically creates voices as notes are triggered. Modulation signals connected to the PolySynth's parameters don't reliably affect:
- **Individual voices** created after connection
- **The detune parameter** across all voices
- **Pan on individual notes** (single notes don't pan noticeably anyway)

The control-rate polling workaround (`setInterval` + `polysynth.set()`) proved unreliable in practice.

---

### ✅ Regular Synth (Tone.Synth) - WORKS WELL
| Parameter | Works? | Notes |
|-----------|--------|-------|
| Frequency | ✅ Yes | **Audio-rate modulation works perfectly!** This proves the issue is PolySynth-specific. |
| Volume    | ✅ Yes | Works with `Tone.Gain` approach |
| Pan       | ⚠️ Subtle | Technically works but hard to perceive on single notes (psychoacoustic limitation) |

**Verdict**: Regular `Tone.Synth` supports proper audio-rate modulation. The issue is definitely PolySynth-specific.

---

## Pan Perception Issue
Pan modulation on **single synth notes** is extremely subtle compared to continuous drones due to:
1. **Psychoacoustic factors** - Single transient sounds don't convey spatial movement as clearly as sustained sounds
2. **Haas effect** - Rapid panning can be perceived as timbre changes rather than spatial movement
3. **Monophonic sources** - A single oscillator has less stereo "width" to modulate

**Conclusion**: Pan modulation is most effective on continuous, rich sounds (like drones).

---

## Recommendations for `tone-drone` Implementation

### ✅ Include as Modulation Destinations
1. **Drone Oscillators (6x)** - Frequency, Volume, Pan (all work perfectly)
2. **Effect Parameters** - Delay time, reverb mix, filter cutoff, etc.

### ❌ Exclude from Modulation
1. **PolySynth voices** - Unreliable frequency/pan modulation
2. **Sequenced notes** - Architecture doesn't support it

### Implementation Strategy
Focus modulation matrix on:
- **6 Drone Oscillators** → Frequency, Volume, Pan (18 potential destinations)
- **Effects Chain** → Delay, Reverb, Filter parameters (~6-12 destinations)
- **Total**: ~24-30 modulation destinations that actually work reliably

This provides plenty of sonic possibilities while avoiding the PolySynth limitations entirely.

---

## Technical Details

### Successful Volume Modulation Architecture
```javascript
// Use Tone.Gain nodes in signal path
const modGain = new Tone.Gain(1);
source.connect(modGain).connect(destination);

// Build modulation signal: 1.0 + (LFO * depth * 0.5)
const unity = new Tone.Signal(1);
const add = new Tone.Add();
const scale = new Tone.Scale(-0.5, 0.5);

unity.connect(add);
lfo.connect(depthMultiplier).connect(scale).connect(add);
add.connect(modGain.gain);
modGain.gain.value = 0; // Let modulation signal control it
```

### Successful Frequency Modulation
```javascript
// Connect to detune parameter (±100 cents range)
const frequencyScaler = new Tone.Scale(-100, 100);
lfo.connect(depthMultiplier).connect(frequencyScaler).connect(drone.detune);
```

### Successful Pan Modulation
```javascript
// Connect directly to pan parameter (-1 to +1 range)
lfo.connect(depthMultiplier).connect(channel.pan);
```

---

## Files
- **Test page**: `modulation-test.html` - Standalone testing environment
- **Documentation**: See CLAUDE.md for modulation matrix architecture documentation

