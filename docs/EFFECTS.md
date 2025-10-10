# Effects Reference

This document provides detailed information about all audio effects available in Tone Drone, including their parameters, use cases, and tips for getting the best sounds.

## Table of Contents

- [Auto Filter](#auto-filter)
- [Bit Crusher](#bit-crusher)
- [Chebyshev](#chebyshev)
- [Microlooper](#microlooper)
- [Filter](#filter)
- [Delay](#delay)
- [Compressor](#compressor)
- [Effects Bus Send](#effects-bus-send)

## Effects Chain Order

All effects are chained in series through the effects bus in this order:

```
Auto Filter → Bit Crusher → Chebyshev → Microlooper → Filter → Delay → Compressor
```

This ordering is intentional:

1. **Modulation first** (Auto Filter) to create movement
2. **Distortion/degradation** (Bit Crusher, Chebyshev) to shape timbre
3. **Texture** (Microlooper) for subtle spatial effects
4. **Tone shaping** (Filter) to control frequency content
5. **Time-based effects** (Delay) for space and depth
6. **Dynamics control** (Compressor) to manage overall level

## Auto Filter

An automated filter that modulates its cutoff frequency over time using an LFO (Low Frequency Oscillator).

### Parameters

#### Base Frequency (30 - 7000 Hz)

- The center frequency around which the filter modulates
- Lower values create darker, warmer tones
- Higher values create brighter, airier sounds
- **Tip**: Start around 300-500 Hz for subtle movement

#### Speed (0 - 10 Hz)

- The rate at which the filter frequency modulates
- Lower values create slow, sweeping movements
- Higher values create rapid tremolo-like effects
- **Tip**: Try 0.1-0.5 Hz for slow, evolving textures

#### Q (0 - 9)

- Filter resonance or "sharpness"
- Low values: gentle, musical filtering
- High values: pronounced peaks, more dramatic effect
- **Tip**: Use 1-3 for subtle filtering, 5+ for more dramatic resonance

#### Depth (0 - 1)

- The amount of modulation applied to the filter frequency
- 0 = no modulation (static filter)
- 1 = maximum modulation range
- **Tip**: Start with 0.5 and adjust to taste

#### Dry/Wet (0 - 1)

- Mix between unprocessed (dry) and filtered (wet) signal
- 0 = completely dry (effect bypassed)
- 1 = completely wet (fully filtered)
- **Tip**: 0.3-0.7 often works best for subtle filtering

#### Filter Type

- **Highpass**: Removes low frequencies, adds brightness
- **Lowpass**: Removes high frequencies, adds warmth
- **Bandpass**: Only allows a band of frequencies through
- **Notch**: Removes a band of frequencies

#### Rolloff (-12, -24, -48, -96 dB/octave)

- How steeply the filter attenuates frequencies
- Lower values: gentle, musical slope
- Higher values: steep, surgical filtering
- **Tip**: -24 or -48 dB/octave is usually most musical

#### Oscillator Type

- The LFO waveform shape that modulates the filter

### Use Cases

- Create slow, evolving pad textures
- Add rhythmic movement to sustained drones
- Simulate analog synth filter sweeps
- Generate dubstep-style wobble bass (fast square wave, high resonance)

## Bit Crusher

A digital degradation effect that reduces the bit depth of the audio signal, creating lo-fi, retro digital distortion.

### Parameters

#### Bits (2 - 8)

- The bit depth of the crushed signal
- Lower values = more extreme degradation
- 2 bits: heavily distorted, almost unrecognizable
- 8 bits: subtle digital character, like old samplers
- **Tip**: 4-6 bits gives a nice "digital warmth"

#### Dry/Wet (0 - 1)

- Mix between unprocessed and crushed signal
- **Tip**: Keep wet below 0.5 for subtle texture, or go full wet for extreme lo-fi

### Use Cases

- Add digital grit and character
- Create lo-fi, nostalgic textures
- Degrade smooth tones into harsh, metallic sounds
- Emulate vintage digital synthesizers and samplers

## Chebyshev

A waveshaping distortion effect that adds harmonic content by applying Chebyshev polynomials to the signal.

### Parameters

#### Order (1 - 100)

- The polynomial order, which determines harmonic content
- Lower values: subtle harmonics
- Higher values: harsh, complex distortion
- **Tip**: 1-10 for musical distortion, 20+ for extreme effects

#### Dry/Wet (0 - 1)

- Mix between clean and distorted signal
- **Tip**: Blend dry and wet for controlled harmonic enhancement

### Use Cases

- Add harmonic richness to simple waveforms
- Create tube-like saturation (low order, low wet)
- Generate harsh, aggressive tones (high order, high wet)
- Enhance thin sounds with additional harmonics

### Technical Details

Unlike typical clipping distortion, Chebyshev waveshaping adds specific harmonic content based on the polynomial order. Each order adds different overtones, making it more predictable and musical than standard distortion.

## Microlooper

A short feedback delay (up to 1 second) designed to create textural layers and subtle rhythmic patterns.

### Parameters

#### Time (0 - 1 seconds)

- The delay time
- Very short times (0.01-0.1s): comb filtering, metallic tones
- Short times (0.1-0.5s): slapback echo, doubling
- Longer times (0.5-1s): rhythmic patterns
- **Tip**: Try 0.05-0.2s for subtle texture

#### Feedback (0.6 - 1)

- Amount of delayed signal fed back into the delay
- Note: Minimum is 0.6 to encourage sustained looping
- 0.6-0.8: decaying echoes
- 0.9+: sustained, evolving loops
- 1.0: infinite feedback (warning: can get loud!)
- **Tip**: Use 0.95-0.99 for long, evolving loops

#### Dry/Wet (0 - 1)

- Mix between direct and delayed signal
- **Tip**: Keep wet low (0.1-0.3) for subtle doubling

### Use Cases

- Create dense, layered textures
- Add rhythmic interest to static drones
- Generate evolving soundscapes that build over time
- Produce comb filtering and metallic resonances

### Warning

At high feedback values (0.95+), the microlooper can create infinitely sustaining loops that may become very loud. Use with caution and monitor your levels.

## Filter

A static (non-modulated) filter for tone shaping and frequency control.

### Parameters

#### Frequency (30 - 7000 Hz)

- The cutoff frequency of the filter
- Below this frequency (lowpass) or above it (highpass)
- **Tip**: Sweep slowly while listening to find sweet spots

#### Q (0 - 9)

- Filter resonance
- Lower values: gentle slope, natural sound
- Higher values: peaked response, emphasized cutoff
- **Tip**: Use high Q (5+) for resonant sweeps

#### Filter Type

- **Highpass**: Removes low frequencies
- **Lowpass**: Removes high frequencies
- **Bandpass**: Only allows a specific frequency range
- **Notch**: Removes a specific frequency range

#### Rolloff (-12, -24, -48, -96 dB/octave)

- How steeply the filter cuts
- **Tip**: -24 dB is standard, -48 dB for more aggressive filtering

### Use Cases

- Remove unwanted low end rumble (highpass)
- Tame harsh high frequencies (lowpass)
- Isolate specific frequency ranges (bandpass)
- Remove specific resonances (notch)

## Delay

A classic feedback delay for creating echoes and spatial depth.

### Parameters

#### Time (0 - 10 seconds)

- The delay time before each repeat
- Short times (0.1-0.5s): slapback, doubling
- Medium times (0.5-1s): rhythmic patterns
- Long times (1-10s): sparse, atmospheric echoes
- **Tip**: Sync delay time to musical phrases

#### Feedback (0 - 1)

- Amount of delayed signal fed back
- 0: single echo
- 0.5: several repeats that decay
- 0.9+: many repeats, sustained trails
- 1.0: infinite feedback (warning!)
- **Tip**: 0.3-0.6 for musical echo trails

#### Dry/Wet (0 - 1)

- Mix between direct and delayed signal
- **Tip**: 0.2-0.4 adds depth without overwhelming

### Use Cases

- Add spatial depth and dimension
- Create rhythmic echoes synchronized to tempo
- Generate ambient trails and atmospheres
- Build complex polyrhythmic patterns

### Rhythmic Delay Times

For musical delay synchronized to BPM:

- Quarter note = 60 / BPM seconds
- Eighth note = 30 / BPM seconds
- Dotted eighth = 45 / BPM seconds

Example at 120 BPM:

- Quarter = 0.5s
- Eighth = 0.25s
- Dotted eighth = 0.375s

## Compressor

A dynamic range compressor that automatically controls the overall volume, preventing clipping and glue-ing the mix together. This effect is always active and not user-controllable in the current version.

### Fixed Settings

- **Threshold**: -30 dB
- **Ratio**: 3:1

### What It Does

- Reduces volume when signal exceeds -30 dB
- Prevents distortion from excessive levels
- Makes the overall mix more consistent
- Provides subtle "glue" to the sound

### Benefits

- Prevents clipping and distortion
- Allows you to push effects harder without overloading
- Creates a more cohesive, professional sound
- Maintains dynamic range while controlling peaks

## Effects Bus Send

Controls how much signal is routed through the entire effects chain versus going directly to the output.

### Parameter

#### Send Level (0 - 1)

- 0: Completely dry (no effects)
- 0.5: Equal mix of dry and effects
- 1: Completely wet (all effects)

### Use Cases

- Quickly A/B compare dry vs. effected sound
- Blend processed and unprocessed signals
- Create subtle texture without overwhelming the source
- Master bypass for all effects at once

### Tip

Start with the send at 0 and gradually increase while adjusting individual effect wet/dry controls for optimal balance.

## Effect Combination Tips

### Ambient Pads

- Auto Filter: Low base freq, slow speed, high depth, lowpass
- Microlooper: 0.1s time, 0.95 feedback, low wet
- Delay: 2-4s time, 0.4 feedback, 0.3 wet
- Effects Bus Send: 0.6-0.8

### Lo-Fi Textures

- Bit Crusher: 4-5 bits, 0.5 wet
- Chebyshev: Order 5-10, 0.3 wet
- Filter: Lowpass, 2000 Hz, low Q
- Effects Bus Send: 0.5

### Rhythmic Movement

- Auto Filter: High speed (2-6 Hz), square wave, bandpass
- Delay: Sync to tempo, 0.5 feedback
- Effects Bus Send: 0.7

### Dark Drones

- Filter: Lowpass, 300-500 Hz, -48 dB rolloff
- Auto Filter: Very slow speed (0.05 Hz), sine wave, lowpass
- Delay: Long time (4-8s), low feedback
- Effects Bus Send: 0.4

### Harsh Industrial

- Bit Crusher: 2-3 bits, 0.8 wet
- Chebyshev: High order (50+), 0.6 wet
- Filter: Bandpass, 1000-2000 Hz, high Q
- Delay: Short time, high feedback
- Effects Bus Send: 0.9

## Performance Tips

1. **Start Subtle**: Begin with low wet values and increase gradually
2. **Layer Effects**: Small amounts of multiple effects often sound better than one extreme effect
3. **Automate Movement**: Use the Auto Filter's LFO to add life to static sounds
4. **Watch Your Levels**: High feedback delays and high gain settings can get loud quickly
5. **Experiment**: These effects can create unexpected results when pushed to extremes
