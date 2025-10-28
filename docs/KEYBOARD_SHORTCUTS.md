# Keyboard Shortcuts Reference

Complete guide to keyboard shortcuts available in Tone Drone.

## Global Controls

### Spacebar - Play/Pause Sequencer

- **Key**: `Space`
- **Action**: Toggles the step sequencer playback
- **Details**:
  - Starts the Tone.js Transport if not already started
  - Works from anywhere in the application
  - Visual feedback shown on the Play/Pause button

**Usage Tip**: This is the quickest way to start and stop your sequences without reaching for the mouse.

### o - Play PolySynth 1 Note

- **Key**: `o`
- **Action**: Triggers a note on PolySynth 1 (left/top)
- **Details**:
  - Plays a single note using PolySynth 1 settings
  - Default frequency: 666 Hz
  - Uses the configured waveform and ADSR envelope parameters
  - Works from anywhere in the application (PolySynths don't need to be expanded)

**Usage Tip**: Use this to add melodic accents or bass notes to your drone soundscapes.

### p - Play PolySynth 2 Note

- **Key**: `p`
- **Action**: Triggers a note on PolySynth 2 (right/bottom)
- **Details**:
  - Plays a single note using PolySynth 2 settings
  - Default frequency: 999 Hz (perfect fifth up from 666 Hz)
  - Uses the configured waveform and ADSR envelope parameters
  - Works from anywhere in the application (PolySynths don't need to be expanded)

**Usage Tip**: Use this to add harmonic countermelody or higher-pitched accents to your soundscapes.

## Oscillator Drone Toggle Keys

Each oscillator's continuous drone sound can be toggled on/off using dedicated keyboard shortcuts. When an oscillator is toggled off, its volume is set to -Infinity (muted).

### q - Toggle Oscillator 1 Drone

- **Key**: `q`
- **Oscillator**: 1 (top-left)
- **Action**: Starts/stops oscillator 1 drone

### w - Toggle Oscillator 2 Drone

- **Key**: `w`
- **Oscillator**: 2
- **Action**: Starts/stops oscillator 2 drone

### a - Toggle Oscillator 3 Drone

- **Key**: `a`
- **Oscillator**: 3
- **Action**: Starts/stops oscillator 3 drone

### s - Toggle Oscillator 4 Drone

- **Key**: `s`
- **Oscillator**: 4
- **Action**: Starts/stops oscillator 4 drone

### z - Toggle Oscillator 5 Drone

- **Key**: `z`
- **Oscillator**: 5
- **Action**: Starts/stops oscillator 5 drone

### x - Toggle Oscillator 6 Drone

- **Key**: `x`
- **Oscillator**: 6 (bottom-right)
- **Action**: Starts/stops oscillator 6 drone

## Sequence Mute Toggle Keys

Each oscillator's step sequencer can be muted/unmuted independently of the drone. When a sequence is muted, the synth notes stop triggering, but the oscillator drone continues playing.

### e - Toggle Sequence 1 Mute

- **Key**: `e`
- **Oscillator**: 1 (top-left)
- **Action**: Mutes/unmutes the step sequencer for oscillator 1

### r - Toggle Sequence 2 Mute

- **Key**: `r`
- **Oscillator**: 2
- **Action**: Mutes/unmutes the step sequencer for oscillator 2

### d - Toggle Sequence 3 Mute

- **Key**: `d`
- **Oscillator**: 3
- **Action**: Mutes/unmutes the step sequencer for oscillator 3

### f - Toggle Sequence 4 Mute

- **Key**: `f`
- **Oscillator**: 4
- **Action**: Mutes/unmutes the step sequencer for oscillator 4

### c - Toggle Sequence 5 Mute

- **Key**: `c`
- **Oscillator**: 5
- **Action**: Mutes/unmutes the step sequencer for oscillator 5

### v - Toggle Sequence 6 Mute

- **Key**: `v`
- **Oscillator**: 6 (bottom-right)
- **Action**: Mutes/unmutes the step sequencer for oscillator 6

## Keyboard Layout

The oscillator and sequence keys are arranged in two rows, mirroring a typical QWERTY keyboard layout:

```
Row 1:  q  w  e  r  (t  y)
Row 2:  a  s  d  f  (g  h)
Row 3:  z  x  c  v  (b  n)
```

Active keys for oscillators 1-6:

**Drone Toggle (qwaszx):**
```
q  w     → Oscillator Drone 1, 2
a  s     → Oscillator Drone 3, 4
z  x     → Oscillator Drone 5, 6
```

**Sequence Mute Toggle (erdfcv):**
```
e  r     → Sequence Mute 1, 2
d  f     → Sequence Mute 3, 4
c  v     → Sequence Mute 5, 6
```

**Design Note**: This left-hand layout allows you to control oscillators and sequences with your left hand while using your right hand for mouse/trackpad to adjust parameters. The sequence mute keys (erdfcv) are positioned directly above the drone toggle keys (qwaszx), making them easy to reach with the same finger positions.

## Visual Feedback

All keyboard shortcuts provide visual feedback:

- **Play/Pause**: Button state changes
- **Oscillator Drone Toggle**: "Drone On" / "Drone Off" button state changes
- **Sequence Mute Toggle**: "Mute Seq" button state changes

## Usage Tips

### Performance Mode

1. Start the sequencer with `Space`
2. Use **qwaszx** to toggle oscillator drones on/off in real-time
3. Use **erdfcv** to mute/unmute sequences independently
4. Create dynamic arrangements by bringing oscillators and sequences in and out

### Live Mixing

**Drone Control (qwaszx):**
- Toggle multiple oscillators rapidly for stuttering effects
- Gradually add oscillators for build-ups
- Remove oscillators for breakdowns

**Sequence Control (erdfcv):**
- Mute sequences while keeping drones active for texture changes
- Create call-and-response patterns by alternating sequence mutes
- Build rhythmic variation by selectively muting/unmuting sequences

### Practice Patterns

Try these patterns to get comfortable:

**Drone Toggle Patterns:**
- **All On**: Press q, w, a, s, z, x in sequence
- **Alternating**: Toggle q and s together, then w and z
- **Build Up**: q → w → a → s → z → x (add one at a time)
- **Break Down**: x → z → s → a → w → q (remove one at a time)

**Sequence Mute Patterns:**
- **Isolate Drone**: Press e to mute sequence 1, keeping only the drone
- **Rhythmic Contrast**: Mute sequences 1, 3, 5 (e, d, c) for sparse rhythm
- **Complementary**: Toggle e+r together for paired sequence control

## Limitations

### No Modifier Keys

Currently, keyboard shortcuts do not support modifier keys (Shift, Ctrl, Alt/Option, Cmd). They are simple single-key bindings.

### Input Focus

Keyboard shortcuts work regardless of which element has focus, except:

- When typing in text input fields (frequency range controls)
- When interacting with sliders using arrow keys

### Browser Conflicts

Some browsers may intercept certain keyboard shortcuts:

- **Space**: May scroll the page if the page has focus
  - **Solution**: Click anywhere on the synth interface first
- **Cmd/Ctrl + W**: May close the browser tab
  - **Solution**: This won't happen since we only use 'w' without modifiers

## Future Enhancements

Potential keyboard shortcuts being considered:

- Number keys (1-6) to solo oscillators
- Arrow keys for BPM adjustment
- Shift + keys for alternative functions
- Record/stop recording shortcuts
- Effect bypass shortcuts
- Preset loading shortcuts

## Accessibility

### Screen Readers

Keyboard shortcuts are implemented using standard browser keyboard events and should be announced by screen readers when focus indicators are visible.

### Key Press Feedback

Visual feedback is provided for all shortcuts.

## Technical Details

### Implementation

Keyboard shortcuts are implemented using:

- The `useKeyDown` custom hook
- Browser `keydown` events
- No third-party keyboard libraries

### Event Handling

- Shortcuts use `key` property (not `keyCode`)
- Case-sensitive (lowercase keys only: q, w, a, s, z, x, e, r, d, f, c, v, o, p)
- Prevents default browser behavior where appropriate

### Code Reference

- Keyboard handling: `src/hooks/useKeyDown.ts`
- Oscillator toggle logic: `src/components/Oscillator.tsx`
- Play/pause handling: `src/components/PlayPauseSequencerButton.tsx`

## Customization

Currently, keyboard shortcuts are not customizable. All users have the same default bindings. Custom key mapping may be added in a future version.

## Platform Differences

Keyboard shortcuts work consistently across platforms:

- **macOS**: All shortcuts work as documented
- **Windows**: All shortcuts work as documented
- **Linux**: All shortcuts work as documented
- **Mobile**: Keyboard shortcuts are not available on mobile devices (touch-only)

## Quick Reference Card

Print or save this quick reference:

```
┌─────────────────────────────────────────┐
│      TONE DRONE KEYBOARD SHORTCUTS      │
├─────────────────────────────────────────┤
│  Space  │  Play/Pause Sequencer         │
│    o    │  Play PolySynth 1 (666 Hz)    │
│    p    │  Play PolySynth 2 (999 Hz)    │
├─────────┼───────────────────────────────┤
│ OSCILLATOR DRONE TOGGLE (qwaszx)        │
├─────────┼───────────────────────────────┤
│    q    │  Toggle Oscillator 1 Drone    │
│    w    │  Toggle Oscillator 2 Drone    │
│    a    │  Toggle Oscillator 3 Drone    │
│    s    │  Toggle Oscillator 4 Drone    │
│    z    │  Toggle Oscillator 5 Drone    │
│    x    │  Toggle Oscillator 6 Drone    │
├─────────┼───────────────────────────────┤
│ SEQUENCE MUTE TOGGLE (erdfcv)           │
├─────────┼───────────────────────────────┤
│    e    │  Toggle Sequence 1 Mute       │
│    r    │  Toggle Sequence 2 Mute       │
│    d    │  Toggle Sequence 3 Mute       │
│    f    │  Toggle Sequence 4 Mute       │
│    c    │  Toggle Sequence 5 Mute       │
│    v    │  Toggle Sequence 6 Mute       │
└─────────┴───────────────────────────────┘
```
