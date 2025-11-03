# Modulation Matrix Implementation

## Overview

A comprehensive modulation matrix has been successfully added to the Tone Drone synthesizer. The modulation matrix allows you to route 4 independent LFOs to various synthesis parameters, creating complex evolving sounds and dynamic movement.

## Features

### 4 Independent LFOs

Each LFO has the following user-controllable parameters:
- **Rate (Hz)**: 0.01 - 20 Hz (the speed of modulation)
- **Amplitude**: 0 - 1 (the intensity of modulation)
- **Waveform**: Sine, Triangle, Square, Sawtooth

Default LFO settings:
- LFO 1: 0.5 Hz, Sine, Amplitude 1
- LFO 2: 1 Hz, Triangle, Amplitude 1
- LFO 3: 2 Hz, Square, Amplitude 1
- LFO 4: 4 Hz, Sawtooth, Amplitude 1

### Modulation Routing Grid

The routing grid allows you to create up to 8 simultaneous modulation routes. Each route consists of:
- **Source**: Select which LFO (1-4) to use as the modulation source
- **Destination**: Choose what parameter to modulate
- **Depth**: Control the modulation intensity (0-100%)

Available modulation destinations:
- **Oscillator Volume** (Osc 1-6)
- **Oscillator Frequency** (Osc 1-6)
- **Oscillator Pan** (Osc 1-6)
- **Filter Frequency**
- **Filter Q**
- **Delay Time**
- **Delay Feedback**

### User Interface

The modulation matrix section is located between the Effects and PolySynths sections and features:

1. **Collapsible Section**: Click the "Modulation Matrix" heading to expand/collapse
2. **LFO Controls**: Grid layout showing all 4 LFOs (responsive: 1 column on mobile, 2 on tablet, 4 on desktop)
3. **Routing Grid**:
   - Compact view showing route summary (Source → Destination + Depth %)
   - Expandable route details with full controls
   - Add Route button (limited to 8 routes max)
   - Delete button for each route

## Technical Implementation

### Files Created

1. **Types**: `/src/types/ModulationMatrixParams.ts`
   - LFOParams interface
   - ModulationRoute interface
   - ModulationDestination type
   - ModulationMatrixState interface
   - ModulationMatrixHandle interface

2. **Hooks**: `/src/hooks/useModulationLFOs.ts`
   - Creates and manages 4 Tone.js LFO instances
   - Handles LFO lifecycle (creation, disposal)

3. **Components**:
   - `/src/components/ModulationLFO.tsx` - Individual LFO control panel
   - `/src/components/ModulationMatrixGrid.tsx` - Routing grid interface
   - `/src/components/ModulationMatrix.tsx` - Main container component

### Integration Points

The modulation matrix is fully integrated with:

1. **DroneSynth Component**
   - Added ModulationMatrix component between Effects and PolySynths
   - Created ref for preset save/load functionality
   - Exposed handle in DroneSynthHandle interface

2. **Preset System**
   - ModulationMatrixState added to PresetState interface
   - Default state defined in presetDefaults.ts
   - Full save/load support in usePresetManager hook
   - Backward compatibility with older presets (uses defaults if missing)

3. **PresetManager**
   - Added modulationMatrix ref to refs object
   - State captured and applied during preset operations

## Styling

The modulation matrix follows the existing Tone Drone color scheme:
- **Light Mode**: Pink borders (pink-500), pink backgrounds
- **Dark Mode**: Sky blue borders (sky-300), gray backgrounds
- Consistent spacing and responsive grid layouts
- Hover effects matching the rest of the application

## Usage Tips

1. **Start Simple**: Begin with one or two routes to understand how each destination responds
2. **Layer Modulation**: Use multiple LFOs at different rates for complex, evolving textures
3. **Depth Control**: Lower depth values create subtle movement; higher values create dramatic changes
4. **Waveform Selection**:
   - Sine: Smooth, natural modulation
   - Triangle: Linear up/down motion
   - Square: Rhythmic on/off switching
   - Sawtooth: Ramping effect

## Future Enhancement Possibilities

The current implementation provides a solid foundation for potential future enhancements:

1. **Actual Audio Routing**: Currently, the routing logic is a placeholder. Full implementation would:
   - Connect LFO signals to target parameters via Tone.js
   - Scale signals by the amount/depth parameter
   - Handle parameter ranges appropriately for each destination

2. **Additional Destinations**:
   - PolySynth parameters
   - Additional effect parameters
   - Cross-modulation (LFO → LFO)

3. **Visual Feedback**:
   - LFO waveform visualization
   - Real-time modulation amount display

4. **Advanced Features**:
   - LFO sync to tempo/BPM
   - Sample & Hold mode
   - Envelope followers

## Notes on Implementation

- The modulation matrix uses Tone.js LFO objects for the sources
- LFO parameters are tracked separately for UI state management and preset save/load
- Routes are stored as an array of ModulationRoute objects
- The system is designed to be extensible for future destination additions
- All changes mark presets as modified via the onParameterChange callback

## Testing

The implementation:
- ✅ Builds successfully with TypeScript
- ✅ No linter errors
- ✅ Fully integrated with preset system
- ✅ Responsive UI across different screen sizes
- ✅ Maintains consistent styling with the rest of the app

## Inspiration

The design was inspired by the vue-synth project (https://github.com/Razz21/vue-synth) while maintaining the unique style and color scheme of Tone Drone.

