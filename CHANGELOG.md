# Changelog

All notable changes to Tone Drone will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive documentation suite
  - Expanded README with features, usage instructions, and tech stack
  - CONTRIBUTING.md with development guidelines
  - docs/ARCHITECTURE.md with technical deep dive
  - docs/EFFECTS.md with detailed effect documentation
  - docs/KEYBOARD_SHORTCUTS.md with complete keyboard reference
  - docs/TROUBLESHOOTING.md for common issues and solutions
  - CHANGELOG.md for version tracking

### Changed

- Updated .gitignore to exclude .playwright-mcp directory

## [0.2.0] - 2025-01 (Recent Major Updates)

### Added

- Testing infrastructure with Vitest and Testing Library
- Unit tests for core hooks and components
- Testing UI with `npm run test:ui` command
- CLAUDE.md project guidance file for AI assistants
- Playwright MCP integration for browser automation testing

### Changed

- **BREAKING**: Upgraded to React 19 with breaking TypeScript changes
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

### Fixed

- Dark mode toggle now works correctly with Tailwind CSS 4
- Input field backgrounds visible in both light and dark themes
- React 19 TypeScript compatibility warnings resolved
- npm audit security warnings addressed
- Sequencer slowdown bug when changing steps
  - Moved Tone.Loop and callback to refs for better performance
  - Prevents loop recreation on state changes

### Technical Improvements

- Nullish coalescing assignment operator (??) usage in Oscillator and Slider components
- Simplified step data structure (now booleans instead of objects)
- Refactored handleStepClick with setSequences callback and useCallback wrapper
- Transport now only starts via explicit sequencer start action

## [0.1.0] - 2024 (Initial Release)

### Added

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
- Keyboard shortcuts (Q/W/A/S/Z/X for oscillators, Space for play/pause)
- Audio recording functionality with WAV export
- Dark/light theme toggle with localStorage persistence
- Adjustable frequency ranges for oscillators
- Visual beat indicator for step sequencer
- Responsive design for desktop and mobile
- Individual oscillator controls:
  - Frequency slider (within defined range)
  - Volume slider
  - Pan slider
  - On/off toggle
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

## Version History Notes

### Breaking Changes Summary

The recent 0.2.0 update cycle included several major version upgrades:

1. **React 18 → 19**: Required TypeScript type updates for refs
2. **Tailwind CSS 3 → 4**: New PostCSS plugin and dark mode API changes
3. **ESLint 8 → 9**: Flat config format migration
4. **Vite 6 → 7**: Build system improvements

These upgrades modernize the codebase and provide better performance, but require updating development environments to the latest Node.js LTS (v18+).

### Upgrade Path

If upgrading from an older version:

1. Update Node.js to v18 or higher
2. Delete `node_modules` and `package-lock.json`
3. Run `npm install`
4. Run `npm run lint` to check for issues
5. Run `npm test` to ensure tests pass
6. Run `npm run dev` to test locally

## Planned Features

### v0.3.0 (Future)

- [ ] Preset system for saving/loading complete synth states
- [ ] Waveform visualization
- [ ] Pattern randomization and generation

### v0.4.0 (Future)

- [ ] Advanced routing options
- [ ] Modulation matrix
- [ ] LFO routing to any parameter
- [ ] Send/return buses for parallel effects
- [ ] Per-oscillator effects
- [ ] Audio file import

### v1.0.0 (Future)

- [ ] Stable API for presets
- [ ] Comprehensive test coverage
- [ ] Performance optimizations with AudioWorklet

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and how to propose changes.

## Links

- [GitHub Repository](https://github.com/daveknapik/tone-drone)
- [Live Demo](https://daveknapik.github.io/tone-drone/)
- [Issue Tracker](https://github.com/daveknapik/tone-drone/issues)
