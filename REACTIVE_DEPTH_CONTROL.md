# Reactive Depth Control - The Correct Solution

## The Problem (Again!)

My "fix" for the baseline shift broke depth control:

```javascript
// WRONG - Static value!
const volumeMult = new Tone.Multiply(depthMultiplier.factor.value);
```

This captures the depth value **at connection time**, but when you move the depth slider, nothing happens because the Multiply node was created with a static value.

## Why This Is Tricky

Tone.js `Multiply` node has a `.factor` parameter which IS an AudioParam and can be changed:

```javascript
const mult = new Tone.Multiply(0.5);  // Created with 0.5
mult.factor.value = 0.8;              // Can be changed!
```

BUT, you can't easily connect another AudioParam to modulate it continuously.

## The Correct Solution: Shared Reactive Node

Use a **single shared `depthMultiplier`** that's reactive, but create **fresh Scale nodes** per connection:

```javascript
// Signal flow:
LFO
  → depthMultiplier (SHARED, reactive via AudioParam)
  → volScale (FRESH per connection, for range mapping)
  → target
```

### Why This Works

1. **`depthMultiplier` is reactive**:
   - It's a `Tone.Multiply` node
   - Its `.factor` property is an AudioParam
   - When you do `depthMultiplier.factor.value = 0.8`, it updates immediately
   - The audio signal flowing through it changes in real-time

2. **Each connection gets its own Scaler**:
   - Volume needs `Scale(-20, 20)` for ±20 dB
   - Frequency needs `Scale(-100, 100)` for ±100 cents
   - Pan doesn't need scaling (already -1 to +1)

3. **Clean disconnect**:
   - Disconnect the scaler
   - Disconnect shared nodes at the end
   - No interference between connections

## Code Examples

### Volume Modulation (Correct)

```javascript
case 'both-volume':
    const volScale = new Tone.Scale(-20, 20);  // Fresh scaler

    lfo.connect(depthMultiplier);      // Shared, reactive!
    depthMultiplier.connect(volScale); // Connect to fresh scaler
    volScale.connect(droneChannel.volume);
    volScale.connect(synthChannel.volume);

    // Depth slider updates depthMultiplier.factor.value
    // Change propagates automatically through the chain!
    break;
```

### Pan Modulation (Correct)

```javascript
case 'both-pan':
    // Pan is -1 to +1, LFO is -1 to +1
    // Just need depth multiplier, no scaling!

    lfo.connect(depthMultiplier);      // Shared, reactive
    depthMultiplier.connect(droneChannel.pan);
    depthMultiplier.connect(synthPanner.pan);

    // Moving depth slider immediately affects pan amount
    break;
```

### Depth Slider Handler

```javascript
document.getElementById('modDepth').addEventListener('input', (e) => {
    const depth = e.target.value;

    // Update the shared multiplier's factor
    // This AudioParam change propagates to ALL active connections!
    depthMultiplier.factor.value = depth;

    // No need to reconnect anything!
    log(`Modulation depth updated to ${depth}`);
});
```

## AudioParam vs Static Value

### AudioParam (Reactive) ✅

```javascript
const mult = new Tone.Multiply(0.5);

// Later, you can change it:
mult.factor.value = 0.8;  // Updates immediately!

// The audio flowing through mult now uses 0.8
```

### Static Value (Frozen) ❌

```javascript
const currentDepth = 0.5;
const mult = new Tone.Multiply(currentDepth);

// Later, even if currentDepth variable changes:
currentDepth = 0.8;  // mult still uses 0.5!

// The Multiply node was created with 0.5 and won't change
```

## Shared vs Isolated Nodes

### Shared Nodes (For Dynamic Control)

Good for:
- **Depth control**: One node, all connections use it
- **LFO**: One LFO for multiple routes

```javascript
// Create once
const depthMultiplier = new Tone.Multiply(0.5);

// All routes use it
route1: lfo → depthMultiplier → scaler1 → target1
route2: lfo → depthMultiplier → scaler2 → target2

// Change depth once, affects both routes!
depthMultiplier.factor.value = 0.8;
```

### Fresh Nodes (For Isolation)

Good for:
- **Scalers**: Different ranges per connection
- **Per-connection state**: Independent cleanup

```javascript
// Each route gets its own scaler
route1: volScale = new Tone.Scale(-20, 20)
route2: panScale = new Tone.Scale(-1, 1)  // Different range!

// Disconnect route1 without affecting route2
volScale.disconnect();
```

## The Baseline Shift Issue (Solved)

Using ±20 dB range instead of -30 to 0 dB prevents:
- Volume offset at depth=0
- Distortion/clipping
- Waveform character change

**Why ±20 dB works**:
- Symmetric around baseline (no DC offset)
- Large enough for musical effect
- Small enough to avoid distortion

## Testing Checklist

With this fix, you should now see:

- [ ] Depth slider responds in real-time ✅ (Should work now!)
- [ ] At depth=0: no modulation at all
- [ ] At depth=0.5: moderate modulation
- [ ] At depth=1.0: full modulation
- [ ] Pan moves sound left/right (doesn't change volume)
- [ ] Volume modulation is clean (no distortion)
- [ ] Sine wave stays sinusoidal

## Implementation for React

```typescript
class ModulationConnectionManager {
    private depthMultiplier: Tone.Multiply;
    private scalers: Map<string, Tone.Scale> = new Map();

    constructor() {
        this.depthMultiplier = new Tone.Multiply(0.5);
    }

    setDepth(depth: number) {
        // Update shared multiplier
        // All active connections automatically affected!
        this.depthMultiplier.factor.value = depth;
    }

    connect(lfo: Tone.LFO, destination: string, target: Tone.Param) {
        // Create fresh scaler for this connection
        const scaler = this.createScaler(destination);

        // Connect chain
        lfo.connect(this.depthMultiplier);
        this.depthMultiplier.connect(scaler);
        scaler.connect(target);

        // Track for cleanup
        this.scalers.set(destination, scaler);
    }

    disconnect(destination: string) {
        const scaler = this.scalers.get(destination);
        if (scaler) {
            scaler.disconnect();
            this.scalers.delete(destination);
        }
    }

    disconnectAll() {
        // Disconnect all scalers
        this.scalers.forEach(scaler => scaler.disconnect());
        this.scalers.clear();

        // Disconnect shared nodes
        this.depthMultiplier.disconnect();
    }

    private createScaler(destination: string): Tone.Scale {
        // Different ranges based on destination
        if (destination.includes('volume')) {
            return new Tone.Scale(-20, 20); // ±20 dB
        } else if (destination.includes('frequency')) {
            return new Tone.Scale(-100, 100); // ±100 cents
        } else if (destination.includes('pan')) {
            // Pan doesn't need scaling, but include for consistency
            return new Tone.Scale(-1, 1);
        }
        return new Tone.Scale(-1, 1);
    }
}
```

## Key Takeaways

1. **AudioParam is your friend**: It's the web audio way to make things reactive
2. **Shared nodes for control**: Use one node for depth, accessible to all routes
3. **Fresh nodes for isolation**: Create new scalers per connection for clean disconnect
4. **Test reactivity**: Move sliders AFTER connecting to verify it works
5. **Symmetric ranges**: Use ±N instead of min-max to avoid baseline shift

This is the **correct architecture** for reactive modulation with clean control! 🎛️

