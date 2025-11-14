# Changelog

All notable changes to Tone Drone will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-11-14

### Fixed

#### 🔇 Audio Click Prevention

- **Smooth Parameter Ramping**: Eliminated audio clicks and pops when changing parameters
  - Created `useRampedParameter` hook for click-free parameter updates across all effects
  - Applied smooth ramping (0.05s) when loading presets or adjusting controls
  - Used exponential ramping for oscillator frequency changes (prevents pitch jumps)
- **Proper Parameter Initialization**: Fixed issue where effects sounded active on load even when UI showed them at 0
  - All effect parameters now properly initialize to their target values on mount
  - Added runtime checks for `rampTo` method availability for safer parameter updates
- **Envelope Update Optimization**: Debounced synth envelope updates to reduce update frequency and prevent audio artifacts during slider interaction
- **Affected Components**: AutoFilter, BitCrusher, Chebyshev, Delay, Filter, Polysynth, Oscillator, SynthEnvelopeControl

### Technical Improvements

- New `useRampedParameter` hook provides centralized, type-safe parameter ramping
- Updated test suite to handle debounced callbacks
- Enhanced development workflow documentation in CLAUDE.md

---

## [1.0.0] - 2025-11-11

### 🎉 Major Release - Modulation Matrix

This release introduces the **Modulation Matrix**. The synthesizer now offers LFO-based parameter modulation with a hybrid audio/control-rate architecture.

### Added

#### 🎛️ Modulation Matrix

- **4 Independent LFOs** with configurable parameters:
  - Rate: 0.01-20 Hz
  - Amplitude: 0-1 (modulation depth)
  - Waveform: Sine, Triangle, Square, Sawtooth
  - Polarity modes: Bipolar (-1 to +1) or Unipolar (0 to +1)
- **26 Modulation Destinations**:
  - 18 oscillator destinations (6 oscillators × frequency/volume/pan)
  - 8 effect destinations (filter frequency/Q, delay time/feedback, microlooper time/feedback, BitCrusher bits, Chebyshev order)
- **Per-Route Range Controls**:
  - Two range modes: Center ± Amount or Min...Max
  - "Anchor To Current" feature for quick parameter capture
  - Live range updates without audio reconnection
- **Hybrid Modulation Architecture**:
  - Audio-rate modulation (via Tone.Scale) for oscillator frequency/detune and delay parameters
  - Pre-inserted effects (Tremolo/AutoPanner) for click-free volume and pan modulation
  - Control-rate modulation (~60Hz RAF) for filter frequency/Q, BitCrusher bits, and Chebyshev order
- **Click-Free Operation**: Extensive debugging and architecture iterations to eliminate audio artifacts
- **Full Preset Integration**: All modulation routes and LFO settings saved with presets
- **Unit Tests**: Comprehensive test coverage for parameter coercion and range computation
- **E2E Tests**: Modulation matrix UI and functionality testing

### Technical Improvements

- **ModulationConnectionManager** class for centralized audio graph management
- Connection reconciliation (only disconnect/reconnect what changed)
- Type-safe parameter coercion utilities (handles Tone.Time, Tone.Frequency, plain numbers)
- TypeScript declaration merging for Tone.js types (eliminates type casts)
- Refactored into focused hooks: `useModulationLFOs`, `useModulationRouting`, `useControlRateModulation`, `useModulationDepth`
- Extracted utilities: `modulationRange.ts`, `modulationConnectionManager.ts`

### Documentation

- Comprehensive modulation architecture documentation in CLAUDE.md
- POLYSYNTH_TESTING_RESULTS.md documenting modulation testing methodology
- Updated docs/ARCHITECTURE.md with modulation signal flow diagrams

---

## [0.6.0] - 2025-10-31

### Added

#### 🔊 Synth Envelope Controls

- **ADSR Envelope for Step Sequencer**:
  - Global envelope controls for all 6 step sequencer synths
  - Attack: 0-2s (default 0.01s - quick attack)
  - Decay: 0-2s (default 0.1s)
  - Sustain: 0-1 (default 0.5)
  - Release: 0-5s (default 1.0s - natural decay)
  - Real-time updates to all active synths
  - Debounced slider interaction to prevent audio artifacts
  - Saved in preset system
- **Polyphony Improvements**:
  - Switched to PolySynth for sequencer notes to prevent clicks from overlapping notes
  - Increased maxPolyphony to 40 voices
  - Fixed audio pops from note overlap

#### 📱 Mobile Layout Improvements

- Synth envelope controls stack vertically on small screens
- Improved responsive layout for envelope section
- Better dropdown and effect title centering on small screens

---

## [0.5.0] - 2025-10-26

### Added

#### 🎵 Musical Features & Randomization

- **Musical Scale Randomization**:
  - Expanded scale library from 14 to 38 scales
  - 8 scale categories: Western Classical, Western Pentatonic, Church Modes, Melodic Minor Modes, Jazz & Advanced Harmony, Exotic/World, Japanese Pentatonic, Other World, Symmetric
  - Random root note selection (C through B)
  - Respects min/max frequency constraints
  - Display scale name, root note, and category after randomization
  - Dice button in oscillators section triggers randomization
- **Sequencer Pattern Randomization**:
  - Global pattern density slider (0-100%)
  - "Randomize All Patterns" button for simultaneous randomization of all 6 oscillators
  - Per-oscillator randomization, mute, and clear controls
  - Pattern density state (UI-only, not saved in presets)
- **Sequence Mute Feature**:
  - Per-oscillator sequence muting (stops synth notes, drone continues)
  - Keyboard shortcuts for mute/unmute (E, R, D, F, C, V keys)
  - Mute state saved in presets (backward compatible)
- **Expanded Frequency Range**: Oscillators can now range from 30 Hz to 1000 Hz

### Changed

- **Oscillator Count**: Locked to 6 oscillators (removed dynamic oscillator count)
- **Randomization UI**: Improved clarity and layout for randomization controls
- **Text Labels**: "Start/Stop" → "Drone On/Drone Off" for clarity

### Fixed

- Fixed keyboard shortcuts to respect modifier keys (prevents firing when Cmd/Ctrl pressed)
- Improved button and slider layouts for mobile devices
- Fixed section borders on mobile layouts

---

## [0.4.0] - 2025-10-24

### Added

#### 🎚️ Fat Oscillator Mode

- **Fat Oscillator Implementation**:
  - Toggle between Basic (single oscillator) and Fat (multiple detuned oscillators) modes
  - Voice count: 1-10 voices (default: 3 for fat mode)
  - Detune spread: 0-100 cents (controls detuning between voices)
  - Auto-switching: Voices slider at 1 = Basic mode, >1 = Fat mode
  - Detune slider disabled when voices=1 (prevents silence)
  - Proper lifecycle management (disposes and recreates oscillators on type change)
  - Playing state preserved during oscillator type switching
  - Saved in preset system

### Changed

- Consolidated button components for consistency
- Improved slider layout across the app

### Fixed

- **Fat Oscillator Fixes**:
  - Prevented silence when detune=0 (auto-set minimum 1 cent in fat mode)
  - Fixed lifecycle issues when switching oscillator types
  - Prevented unintended oscillator additions when changing voice count
- **Audio Routing**:
  - Stabilized effects bus routing to eliminate reconnection churn
  - Fixed audio routing and timing issues
  - Prevented frequency automation artifacts in Safari

---

## [0.3.0] - 2025-10-20

### Added

#### 💾 Complete Preset System

- **Preset Management**:
  - Save, load, and delete custom presets
  - Factory presets shipped with the app (protected from deletion)
  - Recent presets list with timestamps
  - Modified state indicator
  - "New" preset functionality to reset to clean state
- **Preset Sharing**:
  - Shareable URLs with full state encoding
  - JSON export/import functionality
  - URL parameter parsing for preset loading
  - Copy-to-clipboard in share modal
- **Preset Storage**:
  - localStorage-based persistence
  - Automatic migration system for backward compatibility
  - Comprehensive state capture (oscillators, sequences, effects, BPM, etc.)
- **Factory Presets**:
  - Init (clean slate)
  - The Ending World
  - Melodic Memory
  - Rhythmic Pulsar
- **UI Features**:
  - Dropdown menu with visual indicators (📋 current, 🗑️ delete)
  - Share modal with scrollable content
  - Recent presets truncation with tooltip
  - PresetButton styling matches ThemeControls
  - Visual disabled state for actions

#### 🧪 Testing & CI/CD

- **Comprehensive E2E Test Suite**:
  - Playwright tests with 100% pass rate across Chromium, Firefox, and WebKit
  - Page Object Model (POM) architecture for maintainability
  - Test fixtures for localStorage clearing and audio context initialization
  - Semantic locator strategy (prioritizes accessibility over test IDs)
  - Test coverage for presets, theme, transport, recording
- **CI/CD Pipeline**:
  - GitHub Actions for automated testing (test.yml)
  - GitHub Actions for deployment (deploy.yml)
  - Lint, unit test, and E2E test gates before deployment
  - .nvmrc file for Node version consistency
- **Unit Tests**:
  - Comprehensive tests for Delay and Filter components
  - Added imperative handles to effect components for testing

#### 🛠️ Development Tools

- **Prettier Integration**: Automatic code formatting
- **react-grab**: Easy UI → AI chat integration for development
- **Claude Code Configuration**: Six specialized subagents

### Changed

- All deployments now go through GitHub Actions (removed manual deployment)
- Removed emojis from menu (except shareable URL and indicators)
- Renamed factory presets for better descriptions
- Component naming: DroneSynthLite → DroneSynth

### Fixed

- **Keyboard Shortcuts**:
  - Fixed shortcuts firing when typing in input fields
  - Refined blocking to only affect text inputs
  - Case-insensitive handling
- **E2E Tests**:
  - Fixed WebKit/Firefox preset BPM test failures
  - Increased timeout for Safari/WebKit compatibility
  - Removed problematic clipboard copy test
  - Refactored to use semantic locators over data-testid
- **UI Fixes**:
  - Fixed PresetButton height to match ThemeControls
  - Fixed dropdown width on small screens
  - Applied gentler color formatting to modal text boxes
  - Fixed styles in top button bar
- **Audio**:
  - Added BPM persistence to preset system
  - Added no-op guard to avoid redundant state updates in EffectsBusSendControl

---

## [0.2.0] - 2025-10-08

### Major Framework Upgrades

- **BREAKING**: Upgraded to React 19
  - Fixed MutableRefObject deprecation warnings
  - Updated ref typing for React 19 compatibility
- **BREAKING**: Upgraded to Tailwind CSS 4
  - Migrated to new @tailwindcss/postcss plugin
  - Fixed dark mode implementation for v4
  - Fixed input background colors in dark mode
- **BREAKING**: Upgraded to ESLint 9
  - Migrated to flat config format (eslint.config.js)
  - Updated all ESLint plugins for v9 compatibility
- **BREAKING**: Upgraded to Vite 7
  - Updated build tooling and dependencies
  - Improved development server performance

### Added

- Testing infrastructure with Vitest and Testing Library
- Unit tests for core hooks and components
- Testing UI with `npm run test:ui` command
- CLAUDE.md project guidance file
- Playwright MCP integration
- Comprehensive documentation suite (README, CONTRIBUTING, ARCHITECTURE, EFFECTS, KEYBOARD_SHORTCUTS, TROUBLESHOOTING)

### Fixed

- Dark mode toggle now works correctly with Tailwind CSS 4
- Input field backgrounds visible in both light and dark themes
- React 19 TypeScript compatibility warnings resolved
- npm audit security warnings addressed
- Sequencer slowdown bug when changing steps
  - Moved Tone.Loop and callback to refs for better performance
  - Prevents loop recreation on state changes

### Technical Improvements

- Nullish coalescing assignment operator (??) usage
- Simplified step data structure (booleans instead of objects)
- Refactored handleStepClick with setSequences callback and useCallback wrapper
- Transport now only starts via explicit sequencer start action

---

## [0.1.0] - 2024

### Initial Release

- Six oscillator drone synthesizer with individual controls
- 16-step sequencer for each oscillator
- Real-time audio effects chain:
  - Auto Filter with LFO modulation
  - Bit Crusher for lo-fi digital distortion
  - Chebyshev waveshaping distortion
  - Microlooper (short delay) for texture
  - Lowpass/Highpass/Bandpass/Notch Filter
  - Feedback Delay with time and feedback controls
  - Compressor for dynamics control
- Polyphonic synthesizers for triggered notes
- Effects bus with send/return architecture
- Keyboard shortcuts (Q/W/A/S/Z/X for oscillators, Space for play/pause, P/O for polysynths)
- Audio recording functionality with WAV export
- Dark/light theme toggle with localStorage persistence
- Adjustable frequency ranges for oscillators
- Visual beat indicator for step sequencer
- Responsive design for desktop and mobile
- Individual oscillator controls (frequency, volume, pan, on/off)
- Collapsible UI sections for Effects and Oscillators
- GitHub Pages deployment configuration

### Technical Features

- Built with React, TypeScript, and Tone.js
- Vite for fast development and optimized builds
- Tailwind CSS for styling
- Custom hooks for audio object management
- Proper Tone.js object lifecycle management
- Effects bus routing system
- Local storage for preferences
- Audio context initialization handling

---

## Links

- [GitHub Repository](https://github.com/daveknapik/tone-drone)
- [Live Demo](https://daveknapik.github.io/tone-drone/)
- [Issue Tracker](https://github.com/daveknapik/tone-drone/issues)
