# LFO Polarity (Unipolar/Bipolar) Implementation Plan

## Overview
Add the ability for each LFO to switch between **bipolar** and **unipolar** output modes.

## Signal Ranges

### Bipolar Mode (Current Default)
- Range: **-1 to +1**
- Center: **0**
- Best for: Frequency modulation (vibrato), pan modulation, pitch
- Example: A sine wave oscillates from -1 (down) through 0 (center) to +1 (up)

### Unipolar Mode (New Feature)
- Range: **0 to +1**
- Center: **0.5**
- Best for: Volume modulation (tremolo), filter cutoff, effect mix
- Example: A sine wave oscillates from 0 (min) through 0.5 (center) to 1 (max)

## Architecture Design

### Signal Flow
```
LFO (always -1 to +1)
  ↓
Polarity Processor (conditionally inserted)
  ↓
Output Signal
  ↓
Modulation Routing
```

### Key Decisions
1. **Keep base LFO bipolar**: Always generate -1 to +1 internally
2. **Transform on output**: Insert signal processing when unipolar mode is active
3. **Seamless switching**: Use smooth transitions to prevent audio clicks/pops
4. **Per-LFO setting**: Each of the 4 LFOs has its own polarity mode

### Transformation Formula
```
unipolar = (bipolar + 1) / 2
```
Maps: -1 → 0, 0 → 0.5, +1 → 1

### Implementation Using Tone.js Nodes
```typescript
// Create a processing chain for unipolar conversion
const unipolarAdd = new Tone.Add(1);      // Shift from [-1,1] to [0,2]
const unipolarMultiply = new Tone.Multiply(0.5);  // Scale to [0,1]

// Or use Tone.Scale directly:
const unipolarScaler = new Tone.Scale(-1, 1, 0, 1);  // Map input [-1,1] to output [0,1]
```

## Files to Modify

### 1. `src/hooks/useModulationLFOs.ts`
**Changes:**
- Add `polarityMode` state for each LFO
- Create signal processing nodes for unipolar transformation
- Manage signal routing based on polarity mode
- Provide methods to switch polarity seamlessly

**New structure:**
```typescript
interface LFOState {
  lfo: Tone.LFO;
  polarityMode: 'bipolar' | 'unipolar';
  unipolarScaler: Tone.Scale;  // For transformation
  outputSignal: Tone.Signal;   // Final output after polarity processing
}
```

### 2. `src/components/ModulationLFO.tsx`
**Changes:**
- Add UI control (button or toggle) for polarity mode
- Add visual indicator showing current mode
- Handle polarity change events
- Update preset save/load to include polarity

**UI Options:**
- Option A: Toggle switch labeled "Bipolar/Unipolar"
- Option B: Button that shows current mode and switches on click
- Option C: Radio buttons for explicit selection

### 3. `src/types/ModulationMatrixParams.ts`
**Changes:**
- Add `polarityMode` to `LFOParams` interface
- Update default parameters to include bipolar mode

### 4. `src/components/ModulationMatrix.tsx`
**Changes:**
- Pass polarity mode to ModulationLFO component
- Handle polarity change callbacks
- Update state management for LFO parameters

## Implementation Steps

### Phase 1: Core Infrastructure
1. ✅ Document the plan (this file)
2. Update LFOParams type to include polarityMode
3. Modify useModulationLFOs to support dual-mode output
4. Add polarity transformation signal chains

### Phase 2: UI Integration
5. Add polarity control to ModulationLFO component
6. Wire up state management in ModulationMatrix
7. Add visual feedback for current polarity mode

### Phase 3: Testing & Polish
8. Test bipolar mode (existing behavior)
9. Test unipolar mode with various waveforms
10. Test seamless switching between modes
11. Verify no audio artifacts (clicks/pops) on mode change
12. Update preset system to save/load polarity settings

### Phase 4: Documentation
13. Add user-facing documentation
14. Update MODULATION_IMPLEMENTATION_GUIDE.md with polarity examples
15. Add code comments explaining the transformation

## Technical Considerations

### Smooth Transitions
When switching polarity mode:
- Use `setTargetAtTime()` with ~15ms time constant
- Fade out old signal, reconfigure, fade in new signal
- Prevent audio discontinuities

### Performance
- Minimal overhead: One Scale node per LFO when in unipolar mode
- No performance impact in bipolar mode (direct connection)

### Preset Compatibility
- Old presets without polarityMode: Default to 'bipolar' (backward compatible)
- New presets: Save polarityMode for each LFO

## Usage Examples

### Use Case 1: Tremolo (Unipolar Volume Modulation)
```
LFO 1: Sine wave, 4Hz, Unipolar
Route to: Oscillator 1 Volume
Depth: 0.8
Result: Volume pulses from 20% to 100% (doesn't go negative/silent)
```

### Use Case 2: Vibrato (Bipolar Frequency Modulation)
```
LFO 2: Sine wave, 5Hz, Bipolar
Route to: Oscillator 1 Frequency
Depth: 0.3
Result: Pitch oscillates ±30 cents around center frequency
```

### Use Case 3: Filter Sweep (Unipolar)
```
LFO 3: Triangle, 0.25Hz, Unipolar
Route to: Filter Cutoff
Depth: 1.0
Result: Filter sweeps from minimum to maximum cutoff
```

## Benefits

1. **More Musical Control**: Some parameters sound better with unipolar modulation
2. **Expanded Sound Design**: Opens up new creative possibilities
3. **Industry Standard**: Most hardware/software synths offer this feature
4. **Better UX**: Users can choose the right mode for each use case

## Visual Design Suggestions

### Compact Toggle (Recommended)
```
[LFO 1]
Rate: [slider]
Amplitude: [slider]
Wave: [sine ▼]
Mode: [Bipolar ⟺ Unipolar]  ← Toggle button
```

### Visual Indicator
- Bipolar: Show waveform centered at 0 (∿)
- Unipolar: Show waveform from bottom (⌢)
- Color coding: Different colors for each mode?

## Next Steps

After approval of this plan:
1. Implement Phase 1 (core infrastructure)
2. Test signal transformation accuracy
3. Add UI controls
4. Full integration testing
5. Update reference HTML page with polarity example

