# Persistent Volume Issue at Depth=0

## The Problem

Even with all our fixes, when connecting LFO to volume **at depth=0**, the audio is **still louder** than with no LFO connected at all.

**Expected**: At depth=0, multiply by 0 should output 0, adding 0 to volume should not change it.

**Actual**: Volume increases when LFO is connected, even at depth=0.

## What We've Tried

1. ✅ Use ±20 dB symmetric range (not -30 to 0)
2. ✅ Create fresh Scale nodes per connection
3. ✅ Set depthMultiplier to slider value before connecting
4. ✅ Proper AudioParam reactive control
5. ❌ Still louder!

## Investigating the Root Cause

### Theory 1: Web Audio Parameter Behavior

When you `.connect()` to an AudioParam in Web Audio, signals are **ADDED** to the parameter's current value:

```javascript
// Base volume: -5 dB
// Modulation signal: varies around 0
// Final: -5 + modulation

// At depth=0:
// LFO (-1 to +1) × 0 = 0
// Scale(0) = 0
// Final: -5 + 0 = -5 dB ✓ (should be correct!)
```

But somehow it's not working as expected...

### Theory 2: Tone.js Internal Behavior

Maybe Tone.Channel or Tone.LFO have internal gain compensation or DC offset correction that's interfering?

### Theory 3: Numerical Precision

Even multiply by exactly 0 might not output exactly 0 due to floating point precision?

### Theory 4: Multiple Signal Paths

Are we accidentally connecting the same signal multiple times?

## Diagnostic Steps

### Test 1: Check Multiply(0) Output

Let's verify that Multiply(0) actually outputs 0:

```javascript
const testMult = new Tone.Multiply(0);
const testSignal = new Tone.Signal(0.5); // Constant 0.5

testSignal.connect(testMult);

// Read output - should be 0
// How do we check this in Web Audio?
```

### Test 2: Disconnect Test

Compare these scenarios:
1. Drone only (no LFO) - **baseline volume**
2. Drone + LFO connected at depth=0 - **louder?**
3. Drone + LFO disconnected - should match #1

### Test 3: Bypass Depth Multiplier

Try connecting directly with no depth control:

```javascript
// Connect LFO directly to volume (no depth multiply)
lfo.amplitude.value = 0; // Use LFO amplitude as depth
lfo.connect(volume);
```

## Alternative Approaches

### Option 1: Don't Connect at Depth=0

Most elegant solution - don't make the connection at all:

```javascript
function connect(depth) {
    if (depth === 0) {
        // Don't connect anything!
        log('Depth is 0 - no connection made');
        return;
    }

    // Normal connection for depth > 0
    lfo.connect(depthMultiplier);
    depthMultiplier.connect(scaler);
    scaler.connect(target);
}
```

**Pros**:
- Guaranteed no effect at depth=0
- Clean and simple
- No mystery audio artifacts

**Cons**:
- Need to reconnect when depth changes from 0
- Slight latency when enabling modulation

### Option 2: Use LFO Amplitude for Depth

Instead of external multiply node, use LFO's built-in amplitude:

```javascript
// Set LFO amplitude to depth value
lfo.amplitude.value = depth;

// Connect directly
lfo.connect(scaler);
scaler.connect(target);
```

**Pros**:
- LFO amplitude is designed for this
- One less node in the chain
- May avoid the mystery issue

**Cons**:
- Can't share LFO across multiple routes with different depths
- Less flexible architecture

### Option 3: Use Tone.Gain Instead of Tone.Multiply

Maybe Gain behaves better than Multiply for this?

```javascript
// Instead of Multiply
const depthGain = new Tone.Gain(depth);

lfo.connect(depthGain);
depthGain.connect(scaler);
scaler.connect(target);

// Update depth
depthGain.gain.value = newDepth;
```

**Pros**:
- Gain is the "standard" way to control audio level
- May have better numerical precision

**Cons**:
- Essentially the same as Multiply conceptually

### Option 4: Route Through Offline Analysis

Use Tone.Analyser to verify the actual signal values:

```javascript
const analyser = new Tone.Analyser('waveform', 256);

lfo.connect(depthMultiplier);
depthMultiplier.connect(analyser); // Tap the signal
depthMultiplier.connect(scaler);

// Read actual values
const values = analyser.getValue();
log(`Signal values: ${values}`);
```

## Recommended Next Step

**Try Option 1** first - don't connect at depth=0:

```javascript
function connectModulation(lfo, target, depth) {
    if (depth <= 0.001) { // Small threshold
        log('Depth effectively 0 - skipping connection');
        return { type: 'bypassed' };
    }

    // Normal connection
    const scale = new Tone.Scale(-20, 20);
    lfo.connect(depthMultiplier);
    depthMultiplier.connect(scale);
    scale.connect(target);

    return { type: 'connected', scale };
}
```

Then update when depth changes:

```javascript
function updateDepth(newDepth) {
    if (newDepth <= 0.001 && wasConnected) {
        // Disconnect
        disconnectAll();
        log('Depth → 0: Disconnected modulation');
    } else if (newDepth > 0.001 && !wasConnected) {
        // Reconnect
        connect();
        log('Depth > 0: Reconnected modulation');
    } else {
        // Just update the multiplier
        depthMultiplier.factor.value = newDepth;
    }
}
```

## Debug Checklist

When testing, check:
- [ ] Debug panel shows Depth Multiplier: 0.000
- [ ] LFO State: started
- [ ] Active Connections: > 0
- [ ] Compare drone volume with/without connection
- [ ] Listen for timbral changes (brightness = distortion)
- [ ] Try different LFO rates (does it affect the loudness?)

## Questions to Answer

1. **Does the loudness change vary with LFO rate?**
   - If yes → might be rectification (LFO is being "detected" somehow)
   - If no → probably a DC offset issue

2. **Does it happen with pan too?**
   - If only volume → problem is specific to volume parameter
   - If both → problem is in the signal chain before targets

3. **Does it happen with frequency modulation?**
   - If yes → fundamental issue with our approach
   - If no → volume parameter behaves differently

## Potential Workaround for React

If we can't solve this, we can:
1. Show warning in UI: "Note: Slight volume increase when modulation is active"
2. Add compensating gain: reduce channel volume slightly when modulation connected
3. Use Option 1: Don't connect at depth=0

For now, let's implement Option 1 in the test page and see if it resolves the issue!

