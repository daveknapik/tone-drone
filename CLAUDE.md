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

# Deploy to GitHub Pages
npm run deploy
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
- **Data Attributes**: Components use `data-testid` attributes for stable, maintainable selectors
- **Test Isolation**: Each test starts with clean localStorage and initialized audio context

Key page objects:

- `BasePage`: Common functionality for all pages
- `PresetPage`: Preset management interactions
- `ThemePage`: Theme toggle interactions
- `TransportPage`: Play/pause and BPM controls
- `RecorderPage`: Recording functionality

#### Adding New E2E Tests

1. Add `data-testid` attributes to new UI elements
2. Create or extend page objects in `e2e/pages/`
3. Write tests in `e2e/tests/` using the page objects
4. Follow the AAA pattern (Arrange, Act, Assert)
5. Avoid page.waitForTimeout where possible and favor use of getBy(Role|Text|Label) instead

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
- **Oscillators**: Created with Tone.Oscillator, each paired with a Tone.Channel for individual volume/pan control
- **Polysynths**: Separate polyphonic synthesizers for triggered notes, managed via `usePolysynths` hook

### Component Structure

- **DroneSynthLite**: Main synthesizer component that orchestrates all audio components
- **Oscillators**: Contains the step sequencer with 6 oscillators, each with 16 steps
- **Effects**: Collapsible section containing all audio effect controls
- **Individual Effect Components**: BitCrusher, Chebyshev, Delay, etc. - each controls its respective Tone.js effect

### State Management Patterns

- **Custom Hooks**: Each audio component (oscillators, effects, synths) has a dedicated hook that manages Tone.js objects and React state
- **Audio Object Lifecycle**: All Tone.js objects are properly disposed of in useEffect cleanup functions
- **Frequency Management**: Oscillator frequencies are constrained within user-defined min/max ranges
- **Sequencer Logic**: Step patterns stored as boolean arrays, with beat tracking via useRef to avoid re-renders

### Key Technical Details

- **Tone.js Integration**: All audio synthesis handled through Tone.js library
- **Step Sequencer**: 16-step sequencer with visual beat indication and real-time step editing
- **Effects Chain**: Linear effects chain with send control for the main effects bus
- **Recording**: Built-in recording functionality via `useRecorder` hook
- **Theme Support**: Dark/light theme toggle using `useDarkMode` hook

### Type Definitions

Located in `src/types/`:

- `OscillatorWithChannel`: Pairs Tone.Oscillator with Tone.Channel
- `SynthWithPanner`: Pairs Tone.Synth with Tone.Panner
- `Sequence`: Defines step pattern with frequency and boolean steps array
- `AudioEffect`: Base interface for audio effects
- `Step`: Represents individual sequencer steps

### Key Hooks

- `useOscillators`: Creates and manages Tone.Oscillator instances
- `useSequences`: Manages step sequencer patterns and frequencies
- `useSynths`: Creates polyphonic synthesizers for the sequencer
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

## Preset System

The app includes a comprehensive preset management system:

- **Factory Presets**: Read-only presets shipped with the app
- **User Presets**: Custom presets created by users, stored in localStorage
- **Preset Operations**: New, Save, Save As, Load, Delete, Share
- **Import/Export**: Presets can be shared via URL or JSON file
- **State Tracking**: Modified indicator shows unsaved changes

Preset state includes:

- Oscillator settings (frequency, waveform, volume, pan)
- Sequencer patterns (16 steps per oscillator)
- All audio effect parameters
- Effects bus send level
- Polysynth settings
