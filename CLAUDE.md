# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tone Drone is a React-based drone synthesizer built with Tone.js for audio synthesis, TypeScript for type safety, and Tailwind CSS for styling. The app provides an interactive interface for creating ambient soundscapes with oscillators, effects, and a step sequencer.

## Development Commands

```bash
# Start development server
npm run dev

# Build the project
npm run build

# Run linter (includes TypeScript checks)
npm run lint

# Preview production build
npm run preview
```

## Development Workflow

When making changes, always follow this checklist before declaring work complete:

1. **Run the linter**: `npm run lint` - Ensure no TypeScript or ESLint errors
2. **Run unit tests**: `npm run test:run` - Verify all tests pass
3. **Check browser console**: Use Chrome DevTools MCP to check for runtime errors
   - Even if code compiles, runtime errors may occur
   - Look for uncaught errors, warnings, and network issues
4. **Test in the browser**: Manually verify the feature works as expected
5. **Run E2E tests** (if applicable): Ensure user workflows aren't broken

## Testing

The project has two types of tests:

### Unit Tests (Vitest + React Testing Library)

```bash
# Run unit tests in watch mode
npm run test

# Run unit tests once
npm run test:run

# Run unit tests with UI
npm run test:ui
```

Unit tests are located alongside components (`*.test.ts` or `*.test.tsx` files) and cover:

- Individual component rendering and behavior
- Utility functions (preset serialization, storage, URL handling)
- Hook logic

### E2E Tests (Playwright)

```bash
# Run e2e tests in headless mode
npm run test:e2e

# Run e2e tests with Playwright UI (interactive)
npm run test:e2e:ui

# Run e2e tests in debug mode
npm run test:e2e:debug

# Run e2e tests in headed mode (see browser)
npm run test:e2e:headed

# Run e2e tests in Chromium only
npm run test:e2e:chromium

# View test report
npm run test:e2e:report
```

E2E tests are located in `e2e/tests/` and cover:

- **Preset Management** (`preset.spec.ts`): Save/load/delete presets, factory preset protection, sharing
- **Theme Toggle** (`theme.spec.ts`): Dark/light mode switching, persistence
- **Transport Controls** (`transport.spec.ts`): Play/pause, BPM control, keyboard shortcuts
- **Recording** (`recording.spec.ts`): Start/stop recording, download functionality
- **Synth Envelope** (`synth-envelope.spec.ts`): ADSR envelope controls, preset integration, edge cases

#### E2E Test Architecture

Tests follow Playwright best practices:

- **Page Object Model (POM)**: Page objects in `e2e/pages/` encapsulate UI interactions
- **Test Fixtures**: Custom fixtures in `e2e/fixtures/` provide test setup (localStorage clearing, audio context initialization)
- **Locator Strategy**: Follows Playwright's recommended hierarchy (see below)
- **Test Isolation**: Each test starts with clean localStorage and initialized audio context

Key page objects:

- `BasePage`: Common functionality for all pages
- `PresetPage`: Preset management interactions
- `ThemePage`: Theme toggle interactions
- `TransportPage`: Play/pause and BPM controls
- `RecorderPage`: Recording functionality
- `SynthEnvelopePage`: Synth envelope ADSR controls

#### Playwright Locator Strategy

Follow this hierarchy when writing tests (Playwright's official recommendation):

**1. User-facing locators (PREFERRED)**
These mirror how users and screen readers interact with your app:

```typescript
// ✅ Best: Accessible to everyone, including screen readers
page.getByRole("button", { name: "Save" });
page.getByRole("slider", { name: /bpm/i });

// ✅ Good: Form inputs with labels
page.getByLabel("Email address");
page.getByPlaceholder("Enter your name");

// ✅ Good: Visible text content
page.getByText("Welcome back");
```

**2. Test IDs (STABLE FALLBACK)**
Use when semantic locators aren't reliable or unique:

```typescript
// ✅ Appropriate use cases:
// - Dynamic lists with duplicate names
page.getByTestId(`preset-user-${id}`);
// - Multiple similar elements that need unique identification
page.getByTestId(`oscillator-step-${oscId}-${stepId}`);
// - i18n/localized text that changes by locale
page.getByTestId("welcome-message");
```

**3. CSS/XPath (LAST RESORT)**
Only when nothing else works:

```typescript
// ⚠️ Fragile: Breaks when implementation changes
page.locator(".some-class > div:nth-child(2)");
page.locator("//div[@class='specific']");
```

#### When to Use data-testid

**DO use `data-testid` for:**

- **Dynamic lists** where items may have duplicate visible text (e.g., presets, oscillator steps)
- **i18n/localized content** where text changes by locale or is highly dynamic
- **Non-interactive elements** that lack semantic meaning (e.g., status indicators)

**DON'T use `data-testid` for:**

- **Interactive elements** with clear labels (buttons, links, form inputs)
- **Elements with unique text** that won't change frequently
- **Standard semantic HTML** (headings, navigation, forms)
- **State assertions** - use `aria-*` attributes instead (see below)
- **When a semantic locator works** - always prefer accessibility-first approaches

#### Test ID Best Practices

**Naming Convention**: Use stable, semantic, kebab-case names:

```typescript
// ✅ GOOD: Stable, semantic, kebab-case
data-testid="preset-user-123"
data-testid="step-5"
data-testid="share-modal"

// ❌ BAD: Includes visible text (brittle when text changes)
data-testid="save-button-text"
data-testid="preset-the-ending-world"

// ❌ BAD: Includes styling intent (couples tests to CSS)
data-testid="blue-button"
data-testid="effects-panel-collapsed"  // Don't encode state in test ID

// ❌ BAD: Generic/unclear purpose
data-testid="button-1"
data-testid="div-wrapper"
```

**Scoping**: Prefer scoping test IDs within semantic containers to avoid needing globally unique IDs:

```typescript
// ✅ GOOD: Scope within a semantic region
const oscPanel = page.getByRole("region", { name: /oscillator/i });
await oscPanel.getByTestId("step-3").click();

// Instead of requiring globally unique test IDs
await page.getByTestId("oscillator-0-step-3").click();
```

**State Assertions**: Prefer accessibility assertions over test IDs for state checking:

```typescript
// ✅ GOOD: Assert accessible state
await expect(button).toHaveAccessibleName(/play/i);
await expect(panel).toHaveAttribute("aria-expanded", "true");
await expect(toggle).toHaveAttribute("aria-label", "Stop Recording");

// ❌ BAD: Encode state in test IDs
await expect(page.getByTestId("panel-expanded")).toBeVisible();
```

**Important Constraints**:

- **Never use `[data-testid=...]` in CSS** - test IDs are for tests only, not styling
- **Configuration**: Playwright defaults to `data-testid`. If you change it, update `playwright.config.ts` with `test.use({ testIdAttribute: 'your-attribute' })`

#### Adding New E2E Tests

1. **Choose the right locator** using the hierarchy above
2. Add `data-testid` attributes **only when needed** (see guidelines)
3. Create or extend page objects in `e2e/pages/`
4. Write tests in `e2e/tests/` using the page objects
5. Follow the AAA pattern (Arrange, Act, Assert)
6. Avoid `page.waitForTimeout` - use `getByRole/Text/Label` with built-in waiting

Example:

```typescript
test("should do something", async ({ page }) => {
  // Arrange
  const presetPage = new PresetPage(page);

  // Act
  await presetPage.loadFactoryPreset("factory-init");

  // Assert
  await presetPage.expectPresetButtonText("Init");
});
```

## Architecture Overview

### Core Audio Architecture

- **Audio Context**: Managed via `src/context/audio.tsx` - handles browser audio initialization and Tone.js transport control
- **Effects Bus**: Central audio routing through `useAudioEffectsBus` hook - connects all audio sources through a chain of effects
- **Audio Effects**: Each effect (AutoFilter, BitCrusher, Chebyshev, Delay, Reverb, etc.) has its own custom hook in `src/hooks/`
- **Dual Reverb Design**: Two independent reverb instances serve different creative purposes:
  - **Reverb 1** (early in chain): Positioned after AutoFilter, before distortion effects. Creates interesting artifacts when processed by BitCrusher/Chebyshev
  - **Reverb 2** (end of chain): Positioned before compressor. Adds clean, standard ambience without being colored by other effects
  - Both reverbs use Tone.Reverb with configurable decay (0.1-10s), preDelay (0-0.1s), and wet (0-1) parameters
- **Oscillators**: Created with Tone.Oscillator or Tone.FatOscillator, each paired with a Tone.Channel for individual volume/pan control. Users can toggle between basic and fat oscillator types for thicker, chorus-like sounds
- **Synths**: Monophonic synthesizers for step sequencer note triggering, managed via `useSynths` hook. Each synth has a configurable ADSR envelope for shaping the amplitude of triggered notes
- **PolySynths**: Two polyphonic synthesizers for melodic elements, managed via `usePolysynths` hook

### Component Structure

- **DroneSynth**: Main synthesizer component that orchestrates all audio components
- **Oscillators**: Contains the step sequencer with 6 oscillators, each with 16 steps. Each oscillator supports both basic and fat modes
- **Oscillator Controls**: Each oscillator has frequency, waveform, volume, and pan controls. In fat mode, includes voices slider (2-10) and detune spread slider (0-100 cents)
- **Effects**: Collapsible section containing all audio effect controls
- **Individual Effect Components**: BitCrusher, Chebyshev, Delay, etc. - each controls its respective Tone.js effect

### State Management Patterns

- **Custom Hooks**: Each audio component (oscillators, effects, synths) has a dedicated hook that manages Tone.js objects and React state
- **Audio Object Lifecycle**: All Tone.js objects are properly disposed of in useEffect cleanup functions
- **Frequency Management**: Oscillator frequencies are constrained within user-defined min/max ranges
- **Sequencer Logic**: Step patterns stored as boolean arrays, with beat tracking via useRef to avoid re-renders

### Key Technical Details

- **Tone.js Integration**: All audio synthesis handled through Tone.js library
- **Oscillator Types**: Supports both Tone.Oscillator (basic, single voice) and Tone.FatOscillator (fat mode with multiple detuned voices). Type switching properly disposes and recreates oscillator instances while preserving playing state
- **Fat Oscillator Parameters**: Auto-switches between basic (voices=1) and fat (voices>1) modes. When switching to fat mode, detune is automatically set to minimum of 1 cent to prevent silence. Voices slider is always visible (1-10 range). Detune slider is always visible but disabled when voices=1
- **Step Sequencer**: 16-step sequencer with visual beat indication and real-time step editing. Supports per-oscillator pattern manipulation with mute, clear, and randomize controls
- **Synth Envelope Controls**: Global ADSR envelope controls for all step sequencer synths. Controls attack (0-2s), decay (0-1s), sustain (0-1), and release (0-2s) parameters. Default values (A=0.01s, D=0.1s, S=0.25, R=0.5s) provide quick attack with natural decay, optimized to prevent voice accumulation issues
- **Effects Chain**: Linear effects chain with send control for the main effects bus
- **Recording**: Built-in recording functionality via `useRecorder` hook
- **Theme Support**: Dark/light theme toggle using `useDarkMode` hook
- **Musical Frequency Randomization**: Oscillator frequencies can be randomized to conform to musical scales from a library of 38 scales organized in 8 categories
- **Sequencer Pattern Randomization**: Sequencer patterns can be randomized based on a global density control, with per-oscillator pattern manipulation

### Type Definitions

Located in `src/types/`:

- `OscillatorType`: Union type `"basic" | "fat"` that specifies the oscillator implementation
- `OscillatorParams`: Interface for persistent oscillator state including frequency, waveform, volume, pan, oscillatorType, fatCount, and fatSpread
- `OscillatorWithChannel`: Pairs Tone.Oscillator or Tone.FatOscillator with Tone.Channel and tracks the oscillator type
- `SynthWithPanner`: Pairs Tone.Synth with Tone.Panner
- `SynthEnvelopeParams`: Interface for ADSR envelope parameters (attack, decay, sustain, release)
- `SynthEnvelopeHandle`: Imperative handle interface for synth envelope controls with getParams() and setParams() methods
- `Sequence`: Defines step pattern with frequency and boolean steps array
- `AudioEffect`: Base interface for audio effects
- `Step`: Represents individual sequencer steps
- `OscillatorsState`: Contains minFreq, maxFreq, array of OscillatorParams, array of Sequences, optional mutedSequences boolean array, and synthEnvelope parameters
- `OscillatorsHandle`: Imperative handle interface with getState() and setState() methods for reading/writing all oscillator state

Located in `src/utils/musicTheory.ts`:

- `ScaleType`: Union type of all available scale names (38 scales total)
- `ScaleCategory`: Union type of the 8 scale categories (e.g., "Western Classical", "Jazz & Advanced Harmony")
- `RandomizeToScaleResult`: Result interface containing frequencies array, scaleName string, rootNote string, and scaleType

### Key Hooks

- `useOscillators`: Creates and manages Tone.Oscillator or Tone.FatOscillator instances for continuous drone sounds. Fixed at 6 oscillators. Returns oscillators array, setOscillators setter, and setTypes setter for switching between basic and fat modes. Accepts optional oscillatorTypes array to initialize with specific types
- `useSequences`: Manages step sequencer patterns and frequencies for 6 sequences
- `useSynths`: Creates 6 monophonic Tone.Synth instances for step sequencer note triggering. Accepts optional bus and initialEnvelope parameters. Returns [synths, setSynths, updateEnvelope] tuple. The updateEnvelope function allows real-time updates to the ADSR envelope on all synths
- `usePolysynths`: Creates polyphonic synthesizers (currently 2 instances for melodic elements)
- `useConnectChannelsToBus`: Automatically connects audio channels to the effects bus
- `useRecorder`: Handles audio recording functionality
- Effect-specific hooks: `useDelay`, `useFilter`, `useBitCrusher`, etc.

## Development Notes

- The project uses Vite for fast development and building
- TypeScript strict mode is enabled with unused variable checking
- ESLint configured for React + TypeScript with comprehensive rules
- Do not use forwardRef, it was deprecated in React 19. https://react.dev/blog/2024/12/05/react-19#ref-as-a-prop
- Tailwind CSS for styling with custom pink/sky color scheme
- Base path set to `/tone-drone/` for GitHub Pages deployment

### Linting Configuration

The project has separate linting configurations:

- **Source code** (`src/`): Full React + TypeScript rules via `tsconfig.json`
- **E2E tests** (`e2e/`, `playwright.config.ts`): Separate config via `tsconfig.e2e.json` with relaxed rules for test code

E2E tests are fully linted but with adjusted rules to accommodate Playwright patterns:

- Playwright's `expect` is dynamically typed
- `process.env` access is common in config files
- Async functions without await are common in test utilities

Run `npm run lint` to lint both source code and e2e tests.

## Randomization Features

The synthesizer includes two independent randomization systems for creating varied and musical sequences:

### Musical Frequency Randomization

Located in `src/utils/musicTheory.ts`, the frequency randomization system provides a library of 38 musical scales organized into 8 categories:

**Scale Library (38 scales)**:

- **Western Classical** (5 scales): Major, Natural Minor, Harmonic Minor, Melodic Minor, Harmonic Major
- **Western Pentatonic** (3 scales): Pentatonic Major, Pentatonic Minor, Blues
- **Church Modes** (5 scales): Dorian, Phrygian, Lydian, Mixolydian, Locrian
- **Melodic Minor Modes** (3 scales): Lydian Dominant, Lydian Augmented, Dorian ♯4
- **Jazz & Advanced Harmony** (4 scales): Altered Scale, Diminished (W-H), Diminished (H-W), Augmented
- **Exotic/World** (5 scales): Phrygian Dominant, Hungarian Minor, Double Harmonic, Enigmatic, Spanish 8-Tone
- **Japanese Pentatonic** (5 scales): Hirajoshi, In Sen, Iwato, Kumoi, Yo
- **Other World** (2 scales): Balinese, Egyptian
- **Symmetric** (2 scales): Whole Tone, Chromatic

**How It Works**:

1. User clicks "Randomize" button (dice icon) in Oscillators top bar
2. `randomizeToScale()` function:
   - Selects a random scale from the 38 available scales
   - Selects a random root note (C through B)
   - Generates all notes from that scale within the current min/max frequency range
   - Randomly selects 6 frequencies from the available scale notes (allowing duplicates)
3. Returns metadata including scale name, root note, and scale type for display
4. Respects the user's frequency range constraints (default 30-1000 Hz)

**Key Functions**:

```typescript
// Main randomization function
export function randomizeToScale(
  minFreq: number,
  maxFreq: number,
  count = 6
): RandomizeToScaleResult;

// Helper conversions for working with scales
export function midiToFrequency(midiNote: number): number;
export function frequencyToMidi(frequency: number): number;
export function midiToNoteName(midiNote: number): string;
```

### Sequencer Pattern Randomization

Located in `src/utils/patternUtils.ts`, the pattern randomization system provides flexible control over 16-step sequencer patterns:

**Global Controls** (in Oscillators top bar):

- **Pattern Density Slider** (0-100%): Controls the probability that any given step is active during randomization. 30% density means approximately 30% of the steps will be active. This is UI state only (not saved in presets, defaults to 30%)
- **"Randomize All Patterns" Button**: Randomizes all 6 oscillator patterns simultaneously using the current density setting

**Per-Oscillator Controls** (below each sequencer):

- **"Mute Seq" Button**: Mutes only the sequence playback for that oscillator (synth notes stop triggering). The oscillator drone continues playing unaffected
- **"Clear" Button**: Deactivates all 16 steps in the pattern (sets all to false)
- **"Randomize" Button**: Randomizes that oscillator's pattern using the global density setting

**Key Functions**:

```typescript
// Generate random pattern based on density (0-100%)
export function randomizePattern(stepCount: number, density: number): boolean[];

// Clear all steps in a pattern
export function clearPattern(stepCount: number): boolean[];
```

**How Mute Works**:

- Mute state is saved in presets via the `mutedSequences` boolean array
- When a sequence is muted, `getActiveSteps()` filters out that synth
- Oscillators continue their drone sound regardless of mute state
- Mute is independent from clearing the pattern (muted patterns can be re-enabled)

**Implementation Details**:

- Pattern density is stored in component state (`patternDensity`), not in preset state
- `randomizePattern()` clamps density to 0-100 and uses Math.random() to decide step activation
- All pattern operations maintain the boolean array structure of sequences
- Pattern randomization respects the current pattern density at the time of randomization

### Preset Compatibility

Both randomization features integrate seamlessly with the preset system:

- Oscillator frequencies set by frequency randomization are saved normally
- Sequencer patterns set by pattern randomization are saved normally
- Muted sequence state is saved in presets (backwards compatible - missing mutedSequences defaults to all unmuted)
- Pattern density is UI-only and intentionally NOT saved (users set it when they randomize)

## Modulation Matrix

The modulation matrix provides 4 LFOs that can modulate various synthesis parameters in real-time, creating evolving, dynamic sounds.

### Architecture Overview

The modulation system uses a **hybrid approach** with three different modulation techniques depending on the destination parameter:

1. **Audio-rate modulation** (via Tone.Scale nodes) - Used for oscillator frequency/detune, delay time/feedback
2. **Pre-inserted effects** (Tremolo/AutoPanner) - Used for volume and pan to avoid clicks
3. **Control-rate modulation** (RAF polling at ~60Hz) - Used for filter frequency/Q, BitCrusher bits, Chebyshev order

This hybrid architecture was developed through extensive testing to solve specific technical challenges with each parameter type.

### Key Components

**Location:** `src/components/ModulationMatrix.tsx` (main container)

**Related files:**
- `src/components/ModulationLFO.tsx` - Individual LFO controls (rate, amplitude, waveform, polarity mode)
- `src/components/ModulationMatrixGrid.tsx` - Routing grid UI component
- `src/hooks/useModulationLFOs.ts` - LFO creation and polarity mode switching
- `src/audio/SampleAndHoldLFO.ts` - Custom sample-and-hold LFO implementation
- `src/utils/modulationConnectionManager.ts` - Audio graph connection management
- `src/utils/modulationRange.ts` - Parameter coercion and range computation helpers
- `src/types/tone.d.ts` - TypeScript declaration merging for Tone.js types
- `src/types/OscillatorParams.ts` - WaveformType definition (sine, triangle, square, sawtooth, sampleandhold)

### Modulation Destinations

**18 Oscillator Destinations:**
- 6 oscillators × 3 parameters each (frequency, volume, pan)

**8 Effect Destinations:**
- Filter: frequency, Q
- Delay: time, feedback
- Microlooper: time, feedback
- BitCrusher: bits
- Chebyshev: order

**Total: 26 modulation destinations**

### LFO Features

Each of the 4 LFOs has:
- **Rate:** 0.01-20 Hz
- **Amplitude:** 0-1 (modulation depth at LFO level)
- **Waveform:** Sine, Triangle, Square, Sawtooth, Sample-and-Hold
- **Polarity Mode:** Bipolar (-1 to +1) or Unipolar (0 to +1)

**Waveform Types:**
- **Sine, Triangle, Square, Sawtooth:** Standard periodic waveforms (via Tone.LFO)
- **Sample-and-Hold (S&H):** Random stepped values updated at the LFO rate (custom implementation)

**Polarity Modes:**
- **Bipolar** (-1 to +1): Best for frequency (vibrato), pan. Oscillates equally above/below center value.
- **Unipolar** (0 to +1): Best for volume (tremolo), filter cutoff. Starts from zero, prevents negative values.

Polarity switching uses smooth fade transitions to prevent audio clicks.

#### Sample-and-Hold Waveform

The modulation matrix includes a custom sample-and-hold (S&H) waveform type for creating random stepped modulation:

**Implementation:**
- Custom `SampleAndHoldLFO` class in `src/audio/SampleAndHoldLFO.ts`
- Uses `Tone.Loop` to schedule random value updates at LFO frequency
- Generates bipolar random values [-1, 1] with instant stepped changes (no ramping)
- Integrates with polarity mode system (unipolar converts to [0, 1])
- Compatible with all modulation routing architecture (audio-rate, pre-inserted effects, control-rate)

**Limitations:**
- Volume/pan modulation uses Tremolo/AutoPanner effects which don't support S&H
- When S&H is selected, volume/pan modulation continues using the previous waveform
- Uses Math.random() (not seedable/reproducible between sessions)

**Usage:**
- Select "sampleandhold" from waveform dropdown in ModulationLFO component
- Works best with: frequency (random pitch variation), filter cutoff (random brightness), delay time (rhythmic variation)
- Use unipolar mode for parameters that shouldn't go negative (cutoff, bits, order)
- Use bipolar mode for parameters that can be positive/negative (frequency, pan, feedback)

### Per-Route Range Controls

Each modulation route has configurable range settings:

**Two Range Modes:**
1. **Center ± Amount**: Defines a center point and deviation amount (e.g., center=500Hz, amount=200Hz → modulates 300-700Hz)
2. **Min...Max**: Explicit minimum and maximum bounds (e.g., min=100Hz, max=1000Hz)

**"Anchor To Current" feature**: Quickly set the range center/min/max to the current parameter value with one click.

### Technical Implementation Notes

#### Why Three Different Modulation Approaches?

**Audio-rate (via Tone.Scale):**
- Sample-accurate, smooth modulation
- Used for: oscillator detune, delay parameters
- Works because these are proper AudioParams that support audio-rate signals

**Pre-inserted Effects (Tremolo/AutoPanner):**
- Avoids clicks when changing LFO parameters during active modulation
- Used for: volume and pan
- Tremolo/AutoPanner are inserted into the signal chain at oscillator creation time
- LFO parameters (rate, type, amplitude) are mapped to the effect, not connected via audio graph

**Control-rate (RAF at ~60Hz):**
- For parameters that don't support audio-rate modulation or cause instability
- Used for: filter frequency/Q (caused stuck values with audio-rate), BitCrusher bits, Chebyshev order (not AudioParams)
- Implemented via `requestAnimationFrame` polling
- Safe but lower resolution than audio-rate

#### Connection Management

`ModulationConnectionManager` class handles all audio graph connections:
- Reconciles connections (only disconnects/reconnects what changed)
- Tracks Tone.Scale nodes for dynamic range updates
- Provides type-specific connection methods
- Safe cleanup on route removal

#### Parameter Coercion

`modulationRange.ts` provides helpers for reading Tone.js parameter values:
- `coerceParamToNumber()` - Handles Tone.Param objects, Tone.Time, Tone.Frequency, plain numbers
- `defaultsForDestination()` - Provides sensible default ranges for each destination type
- `computeRouteRange()` - Calculates min/max from route settings, with optional depth scaling

#### Type Safety

`src/types/tone.d.ts` uses TypeScript declaration merging to augment Tone.js types:
- Eliminates need for type casts throughout codebase
- Provides proper types for Tone.Filter, Tone.LFO, Tone.FeedbackDelay, etc.
- Defines `ToneParam` interface with `value`, `cancelScheduledValues()`, `rampTo()`, etc.

### Preset Integration

Modulation matrix state is fully integrated with the preset system:
- LFO parameters (rate, type, amplitude, polarity mode)
- All modulation routes (source, destination, depth, range settings)
- Saved in `modulationMatrix` field of preset state

### Critical Lessons Learned

**Volume Modulation Architecture:**
- Web Audio parameters use **additive** modulation (signals ADD to parameter values, not multiply)
- Direct LFO → Tone.Channel.volume causes baseline shift + distortion
- Solution: Use Tone.Gain nodes with unity signal (1.0) + LFO modulation
- Limitation: Modulates in linear gain space, not dB space (asymmetric perceived loudness)

**Filter Modulation:**
- Audio-rate modulation of filter frequency/Q caused stuck/glitchy values
- Solution: Moved to control-rate updates via RAF
- Must restore parameters and cancel scheduled values on disconnect
- "Nudge" filter type/rolloff to refresh internal biquad state

**Polarity Mode Switching:**
- Create unipolar scaler (Tone.Scale -1→1 to 0→1) at LFO initialization
- Route signal through scaler when in unipolar mode, bypass when bipolar
- Use smooth fade-out/in transitions to prevent clicks during mode changes

## Preset System

The app includes a comprehensive preset management system:

- **Factory Presets**: Read-only presets shipped with the app
- **User Presets**: Custom presets created by users, stored in localStorage
- **Preset Operations**: New, Save, Save As, Load, Delete, Share
- **Import/Export**: Presets can be shared via URL or JSON file
- **State Tracking**: Modified indicator shows unsaved changes

Preset state includes:

- Oscillator settings (frequency, waveform, volume, pan, oscillator type, fat count, fat spread)
- Sequencer patterns (16 steps per oscillator)
- Sequence mute state (boolean array indicating which sequences are muted)
- Synth envelope parameters (attack, decay, sustain, release for step sequencer notes)
- All audio effect parameters (AutoFilter, BitCrusher, Chebyshev, Microlooper, Filter, Delay)
- Reverb settings (two independent reverb instances: reverb1 and reverb2, with backward compatibility for old presets)
- Effects bus send level
- PolySynth settings (2 polysynths with independent parameters)
- Min/max frequency range
- Modulation matrix state (LFO parameters and routing configuration)

## Release Management

### Changelog Formatting Guidelines

The project uses automated GitHub Releases that extract release notes from CHANGELOG.md. **When updating CHANGELOG.md, follow this exact format** to ensure the extraction script works correctly:

#### Required Format

```markdown
## [VERSION] - YYYY-MM-DD

### Section Header (optional)

- Bullet point content
- More content
- Can include **markdown formatting**

### Another Section

- More bullets
- Sub-bullets are fine
  - Like this

---
```

#### Critical Rules

1. **Version Header**: Must be exactly `## [X.Y.Z] - YYYY-MM-DD`
   - Two `##` marks, space, version in brackets, space, dash, space, date
   - ✅ CORRECT: `## [1.0.0] - 2025-11-11`
   - ❌ WRONG: `## v1.0.0 - 2025-11-11` (no brackets)
   - ❌ WRONG: `## [1.0.0]` (missing date)
   - ❌ WRONG: `### [1.0.0] - 2025-11-11` (three `###`)

2. **Separator**: End each version section with `---` on its own line
   - This marks the boundary between versions
   - The extraction script stops at `---` or the next `## [`

3. **Content**: Everything between the version header and `---` will be extracted
   - Use any markdown formatting (bold, italic, code, links, etc.)
   - Use `###` for subsections (like "Added", "Changed", "Fixed")
   - Use bullet points, numbered lists, code blocks as needed
   - Avoid starting lines with `## [` except for version headers

4. **Consistency**: Follow [Keep a Changelog](https://keepachangelog.com/) format
   - Use sections: Added, Changed, Deprecated, Removed, Fixed, Security
   - Write from user perspective (what changed, not how)
   - Include emoji headers if they fit the project style (e.g., `### 🎉 Major Release`)

#### Extraction Logic

The `.github/workflows/release.yml` workflow uses this awk script:

```bash
awk -v ver="VERSION" '
  /^## \[/ {
    if (found) exit
    if ($0 ~ "\\[" ver "\\]") {
      found = 1
      next
    }
  }
  found {
    if (/^## \[/ || /^---$/) exit
    print
  }
' CHANGELOG.md
```

This script:
- Finds the line matching `## [VERSION]`
- Captures all following lines
- Stops when it hits the next `## [` or `---`

#### Example Changelog Entry

```markdown
## [1.2.0] - 2025-12-15

### Added

- New feature X with Y capability
- Another feature Z

### Fixed

- Bug in component A that caused B
- Issue with C when D happens

---

## [1.1.0] - 2025-11-20
```

When you push tag `v1.2.0`, the GitHub Release will contain:

```markdown
### Added

- New feature X with Y capability
- Another feature Z

### Fixed

- Bug in component A that caused B
- Issue with C when D happens
```

#### Workflow

When working on releases:

1. **Update CHANGELOG.md** using the format above
2. **Bump version** in package.json: `npm version X.Y.Z --no-git-tag-version`
3. **Commit**: `git commit -am "chore: release vX.Y.Z"`
4. **Tag**: `git tag vX.Y.Z`
5. **Push**: `git push && git push --tags`
6. **Automated**: GitHub Actions creates the release with extracted notes

See `docs/RELEASING.md` for the complete release process documentation.
