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

## Oscillator Toggle Keys

Each oscillator can be toggled on/off using dedicated keyboard shortcuts. When an oscillator is toggled off, its volume is set to -Infinity (muted).

### Q - Toggle Oscillator 1

- **Key**: `Q`
- **Oscillator**: 1 (top-left)
- **Action**: Starts/stops oscillator 1 drone

### W - Toggle Oscillator 2

- **Key**: `W`
- **Oscillator**: 2
- **Action**: Starts/stops oscillator 2 drone

### A - Toggle Oscillator 3

- **Key**: `A`
- **Oscillator**: 3
- **Action**: Starts/stops oscillator 3 drone

### S - Toggle Oscillator 4

- **Key**: `S`
- **Oscillator**: 4
- **Action**: Starts/stops oscillator 4 drone

### Z - Toggle Oscillator 5

- **Key**: `Z`
- **Oscillator**: 5
- **Action**: Starts/stops oscillator 5 drone

### X - Toggle Oscillator 6

- **Key**: `X`
- **Oscillator**: 6 (bottom-right)
- **Action**: Starts/stops oscillator 6 drone

## Keyboard Layout

The oscillator keys are arranged in two rows, mirroring a typical QWERTY keyboard layout:

```
Row 1:  Q  W  (E  R  T  Y)
Row 2:  A  S  (D  F  G  H)
Row 3:  Z  X  (C  V  B  N)
```

Active keys for oscillators 1-6:

```
Q  W     → Oscillators 1, 2
A  S     → Oscillators 3, 4
Z  X     → Oscillators 5, 6
```

**Design Note**: This left-hand layout allows you to control oscillators with your left hand while using your right hand for mouse/trackpad to adjust parameters.

## Visual Feedback

All keyboard shortcuts provide visual feedback:

- **Play/Pause**: Button state changes
- **Oscillator Toggle**: Key letter on oscillator UI updates to show muted state

## Usage Tips

### Performance Mode

1. Start the sequencer with `Space`
2. Use Q/W/A/S/Z/X to mute/unmute oscillators in real-time
3. Create dynamic arrangements by bringing oscillators in and out

### Live Mixing

- Toggle multiple oscillators rapidly for stuttering effects
- Gradually add oscillators for build-ups
- Remove oscillators for breakdowns

### Practice Patterns

Try these patterns to get comfortable:

- **All On**: Press Q, W, A, S, Z, X in sequence
- **Alternating**: Toggle Q and S together, then W and Z
- **Build Up**: Q → W → A → S → Z → X (add one at a time)
- **Break Down**: X → Z → S → A → W → Q (remove one at a time)

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
  - **Solution**: This won't happen since we only use 'W' without modifiers

## Future Enhancements

Potential keyboard shortcuts being considered:

- Number keys (1-6) to solo oscillators
- Arrow keys for BPM adjustment
- Shift + keys for alternative functions
- Record/stop recording shortcuts
- Effect bypass shortcuts
- Preset loading shortcuts (0-9)

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
- Case-insensitive (Q and q both work)
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
┌─────────────────────────────────────┐
│     TONE DRONE KEYBOARD SHORTCUTS   │
├─────────────────────────────────────┤
│  Space  │  Play/Pause Sequencer     │
├─────────┼───────────────────────────┤
│    Q    │  Toggle Oscillator 1      │
│    W    │  Toggle Oscillator 2      │
│    A    │  Toggle Oscillator 3      │
│    S    │  Toggle Oscillator 4      │
│    Z    │  Toggle Oscillator 5      │
│    X    │  Toggle Oscillator 6      │
└─────────┴───────────────────────────┘
```
