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
- Tailwind CSS for styling with custom pink/sky color scheme
- Base path set to `/tone-drone/` for GitHub Pages deployment