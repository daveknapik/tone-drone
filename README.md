# Tone Drone

A browser-based drone synthesizer built with Tone.js, React, TypeScript, and Tailwind CSS.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://daveknapik.github.io/tone-drone/)

## Features

- **Oscillators**: Start with six, add as many as your browser can handle
- **Step Sequencers**: 16 steps for each oscillator, speed up to 999 BPM
- **Audio Effects Chain**:
  - Auto Filter with depth and frequency controls
  - Bit Crusher for lo-fi digital distortion
  - Chebyshev waveshaping distortion
  - Microlooper for texture
  - Lowpass/Highpass Filter with resonance
  - Delay with feedback and wet/dry mix
  - Dynamic compression
- **Polyphonic Synthesizers**: A separate synth with an ADSR envelope for triggering notes with panning control
- **Adjustable Frequency Ranges**: Set custom min/max frequency boundaries for oscillators
- **Audio Recording**: Built-in recording functionality to capture your sessions
- **Dark/Light Theme**: Toggle between themes with persistent local preference
- **Keyboard Shortcuts**: Quick access keys (Q/W/A/S/Z/X) for oscillator start/stop control
- **Responsive Design**: Works on desktop and mobile devices

## Live Demo

Try it out: [https://daveknapik.github.io/tone-drone/](https://daveknapik.github.io/tone-drone/)

## Quick Start

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/daveknapik/tone-drone.git
cd tone-drone

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173` (or another port if 5173 is in use).

## Usage

### Getting Started

1. **Start Audio**: Click anywhere on the page to initialize the audio context (browser requirement)
2. **Play/Pause**: Click the play button or press Space to start/stop the sequencer
3. **Program Steps**: Click on the step boxes to activate/deactivate notes in the sequence
4. **Adjust Frequency**: Use the frequency slider on each oscillator to change its pitch
5. **Set Range**: Configure min/max frequency boundaries in the Oscillators section
6. **Add Effects**: Expand the Effects section and adjust effect parameters
7. **Record Audio**: Use the recording controls to capture your session

### Keyboard Shortcuts

- **Space**: Play/Pause sequencer
- **Q/W/A/S/Z/X**: Toggle oscillators 1-6 on/off

### Oscillator Controls

- **Frequency Slider**: Adjust the pitch of each oscillator (constrained by min/max range)
- **Volume Slider**: Control individual oscillator volume
- **Waveform Selector**: Choose sine, square, triangle or sawtooth
- **Pan Slider**: Position oscillator in the stereo field
- **Step Grid**: Click boxes to program which steps trigger notes
- **Start Button**: Controls drone on/off. Works independently of the step sequencers.

### Effects Bus

All oscillators and synths route through a shared effects bus. Use the "Effects Bus Send" slider to control how much signal goes through the effects chain versus the dry signal.

### Recording

1. Click the record button to start recording
2. The timer shows the current recording length
3. Click stop to finish
4. You can download the recording, but note that only one recording stays in memory at a time: if you start a new recording, the old one disappears, so be sure to download it first.

## Tech Stack

- **[React](https://react.dev/)** (v19.2.0) - UI framework
- **[Tone.js](https://tonejs.github.io/)** (v15.0.4) - Web Audio framework for synthesis and effects
- **[TypeScript](https://www.typescriptlang.org/)** (v5.5.4) - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** (v4.1.14) - Styling
- **[Vite](https://vitejs.dev/)** (v7.1.9) - Build tool and dev server
- **[Vitest](https://vitest.dev/)** (v3.2.4) - Unit testing

## Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Run linter and TypeScript checks
npm run lint

# Preview production build locally
npm run preview

# Deploy to GitHub Pages
npm run deploy

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run
```

### Project Structure

```
tone-drone/
├── src/
│   ├── components/     # React components (UI + audio)
│   ├── context/        # Audio context provider
│   ├── hooks/          # Custom hooks for audio objects
│   ├── types/          # TypeScript type definitions
│   └── test/           # Test utilities and setup
├── docs/               # Additional documentation
├── CLAUDE.md           # AI assistant project guidance
└── README.md           # This file
```

### CI/CD Pipeline

This project uses GitHub Actions for automated testing and deployment:

#### Node Version Management

The project uses Node.js v24.7.0 (specified in `.nvmrc`). The CI/CD pipeline automatically uses this version to ensure consistency between local development and CI environments.

#### Workflows

**Pull Request Testing** (`.github/workflows/test.yml`)

- Runs on all pull requests to `main`
- Executes linter, unit tests, and e2e tests
- Must pass before merging

**Build and Deploy** (`.github/workflows/deploy.yml`)

- Runs on every push to `main`
- Executes full test suite (linter, unit tests, e2e tests)
- Builds the project
- Deploys to GitHub Pages using official GitHub Actions if tests pass
- Uses `actions/upload-pages-artifact` and `actions/deploy-pages`

#### Local Deployment (Manual)

While CI/CD handles automatic deployment, you can still deploy manually:

```bash
npm run deploy
```

Note: The `npm run deploy` script uses the `gh-pages` npm package for manual local deployments. The recommended approach is to use the automated GitHub Actions workflow.

## Documentation

- [Architecture Guide](docs/ARCHITECTURE.md) - Technical deep dive into audio architecture
- [Effects Reference](docs/EFFECTS.md) - Detailed documentation of all audio effects
- [Keyboard Shortcuts](docs/KEYBOARD_SHORTCUTS.md) - Complete keyboard reference
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions
- [Contributing Guide](CONTRIBUTING.md) - Development guidelines

## Browser Compatibility

Tone Drone requires a modern browser with Web Audio API support:

- Chrome/Edge 89+
- Firefox 88+
- Safari 14.1+

**Note**: Audio must be initiated by a user gesture (click/tap) due to browser autoplay policies.

**Mobile users**: Please note that you need to take your phone off silent mode for this to work.

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details

## Acknowledgments

- Built with [Tone.js](https://tonejs.github.io/)
- Inspired by hardware drone synthesizers and my pedal board
