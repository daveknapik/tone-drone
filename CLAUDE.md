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
- **Audio Effects**: Each effect (AutoFilter, BitCrusher, Chebyshev, Delay, etc.) has its own custom hook in `src/hooks/`
- **Oscillators**: Created with Tone.Oscillator or Tone.FatOscillator, each paired with a Tone.Channel for individual volume/pan control. Users can toggle between basic and fat oscillator types for thicker, chorus-like sounds
- **Synths**: Monophonic synthesizers for step sequencer note triggering, managed via `useSynths` hook
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
- `Sequence`: Defines step pattern with frequency and boolean steps array
- `AudioEffect`: Base interface for audio effects
- `Step`: Represents individual sequencer steps
- `OscillatorsState`: Contains minFreq, maxFreq, array of OscillatorParams, array of Sequences, and optional mutedSequences boolean array
- `OscillatorsHandle`: Imperative handle interface with getState() and setState() methods for reading/writing all oscillator state

Located in `src/utils/musicTheory.ts`:

- `ScaleType`: Union type of all available scale names (38 scales total)
- `ScaleCategory`: Union type of the 8 scale categories (e.g., "Western Classical", "Jazz & Advanced Harmony")
- `RandomizeToScaleResult`: Result interface containing frequencies array, scaleName string, rootNote string, and scaleType

### Key Hooks

- `useOscillators`: Creates and manages Tone.Oscillator or Tone.FatOscillator instances for continuous drone sounds. Fixed at 6 oscillators. Returns oscillators array, setOscillators setter, and setTypes setter for switching between basic and fat modes. Accepts optional oscillatorTypes array to initialize with specific types
- `useSequences`: Manages step sequencer patterns and frequencies for 6 sequences
- `useSynths`: Creates 6 monophonic Tone.Synth instances for step sequencer note triggering
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
): RandomizeToScaleResult

// Helper conversions for working with scales
export function midiToFrequency(midiNote: number): number
export function frequencyToMidi(frequency: number): number
export function midiToNoteName(midiNote: number): string
```

### Sequencer Pattern Randomization

Located in `src/utils/patternUtils.ts`, the pattern randomization system provides flexible control over 16-step sequencer patterns:

**Global Controls** (in Oscillators top bar):

- **Pattern Density Slider** (0-100%): Controls the probability that any given step is active during randomization. 50% density means approximately half the steps will be active. This is UI state only (not saved in presets, defaults to 50%)
- **"Randomize All Patterns" Button**: Randomizes all 6 oscillator patterns simultaneously using the current density setting

**Per-Oscillator Controls** (below each sequencer):

- **"Mute Seq" Button**: Mutes only the sequence playback for that oscillator (synth notes stop triggering). The oscillator drone continues playing unaffected
- **"Clear" Button**: Deactivates all 16 steps in the pattern (sets all to false)
- **"Randomize" Button**: Randomizes that oscillator's pattern using the global density setting

**Key Functions**:

```typescript
// Generate random pattern based on density (0-100%)
export function randomizePattern(
  stepCount: number,
  density: number
): boolean[]

// Clear all steps in a pattern
export function clearPattern(stepCount: number): boolean[]
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
- All audio effect parameters
- Effects bus send level
- PolySynth settings (2 polysynths with independent parameters)
- Min/max frequency range
