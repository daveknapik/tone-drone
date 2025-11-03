# Test Page Usage Guide

## Opening the Test Page

Open `modulation-test.html` in your browser (works best in Firefox or Chrome).

## Test Sequence

### 1. Initialize Audio

1. Click **"Start Audio Context"**
2. Wait for "✅ Audio Context Started" message

### 2. Test Drone (Continuous Oscillator)

1. Click **"Start Drone"**
2. You should hear a continuous 220 Hz sine wave
3. Try the **Drone Frequency** slider - pitch should change smoothly
4. Click **"Stop Drone"** when done

### 3. Test Sequencer (PolySynth)

1. Click **"Trigger Note (C4)"**
2. You should hear a short note
3. Try multiple clicks - polyphonic notes should work
4. Notes should be clean, no clicks or pops

### 4. Test LFO

1. Click **"Start LFO"**
2. Adjust **LFO Rate** (try 2 Hz)
3. Adjust **LFO Amplitude** (try 1.0)
4. Try different **LFO Waveform** options

**At this point**: LFO is running but not connected - you shouldn't hear any change.

## Volume Modulation Tests

### Test 1: Depth = 0 (No Modulation Expected)

**Setup**:
1. Start Drone
2. Start LFO (2 Hz, Sine, Amplitude 1.0)
3. Set **Modulation Depth** to **0**
4. Select **"Both Sources - Volume"**
5. Click **"Connect"**

**Expected Result**:
- ✅ Volume should be **EXACTLY THE SAME** as with no LFO connected
- ✅ Waveform should still sound like a pure sine wave
- ✅ No "brightness" or distortion

**If it fails** (volume changes or sounds brighter):
- The baseline shift bug still exists
- Check the console for errors

### Test 2: Depth = 0.5 (Moderate Modulation)

1. Set **Modulation Depth** to **0.5**
2. Keep LFO at 2 Hz

**Expected Result**:
- ✅ Volume should pulse/wobble smoothly
- ✅ Rate: 2 pulses per second
- ✅ Still sounds like a sine wave (not distorted)
- ✅ No harsh/bright overtones

### Test 3: Depth = 1.0 (Maximum Modulation)

1. Set **Modulation Depth** to **1.0**

**Expected Result**:
- ✅ Strong volume modulation
- ✅ Goes from quieter to louder smoothly
- ✅ No clipping or distortion
- ✅ Sine wave character preserved

### Test 4: Different LFO Waveforms

Try each waveform with Depth = 0.5:

- **Sine**: Smooth, gradual modulation
- **Triangle**: Linear up/down motion
- **Square**: On/off switching effect
- **Sawtooth**: Ramping effect

## Pan Modulation Tests

### Test 5: Pan Modulation

1. Disconnect previous route
2. Select **"Both Sources - Pan"**
3. Start Drone
4. Click **"Connect"**
5. Set Depth = 0.5

**Expected Result**:
- ✅ Sound should move left/right smoothly
- ✅ Volume should remain constant
- ✅ No volume change, just position change

### Test 6: Pan at Different Speeds

1. Set LFO Rate to 0.5 Hz (slow)
2. Then try 5 Hz (fast)
3. Then try 10 Hz (very fast)

**Expected Result**:
- Slow: Clear left-right movement
- Fast: Tremolo-like stereo widening
- Very fast: Chorus-like effect

## Frequency Modulation Tests

### Test 7: Drone Frequency (Audio-Rate)

1. Disconnect previous route
2. Select **"Drone Only - Frequency"**
3. Start Drone
4. Start LFO (2 Hz, Sine, Amp 1.0)
5. Click **"Connect"**
6. Set Depth = 0.5

**Expected Result**:
- ✅ Pitch should wobble smoothly
- ✅ Very smooth, no steps/clicks
- ✅ This is audio-rate modulation (smooth!)

### Test 8: Synth Frequency (Control-Rate)

1. Disconnect
2. Select **"Synth Only - Frequency"**
3. Click **"Connect"**
4. Trigger notes repeatedly

**Expected Result**:
- ✅ Notes should have pitch modulation
- ⚠️ Might hear slight "steps" (20Hz polling)
- ⚠️ Not as smooth as drone (this is control-rate)

### Test 9: Both Sources Frequency

1. Disconnect
2. Select **"Both Sources - Frequency"**
3. Start Drone
4. Click **"Connect"**
5. Trigger notes while drone is playing

**Expected Result**:
- ✅ Drone: smooth pitch modulation
- ⚠️ Notes: slightly stepped pitch modulation
- Both are modulated simultaneously

## Advanced Tests

### Test 10: Different LFO Rates

Try these rates with volume modulation:

- **0.1 Hz**: Very slow, barely perceptible
- **0.5 Hz**: Slow breathing effect  
- **2 Hz**: Moderate pulse
- **5 Hz**: Fast tremolo
- **10 Hz**: Very fast, almost a tone

### Test 11: Extreme Depth Values

1. Try Depth = 0.1 (subtle)
2. Try Depth = 1.0 (maximum)
3. Listen for any artifacts or distortion

## What to Look For

### ✅ Good Signs

- Modulation is smooth and musical
- No unwanted volume changes at depth = 0
- Waveform character preserved
- No harsh/bright overtones
- Clean disconnect (modulation stops)

### ❌ Bad Signs

- Volume changes when depth = 0
- Sine wave sounds "bright" or "harsh"
- Clicking or popping sounds
- Modulation continues after disconnect
- Distortion at high depth values

## Logging

The test page logs all actions to the "Test Results" section:
- Connection events
- Modulation routing details
- Warnings about limitations
- Error messages

**Check the logs** if something doesn't work as expected!

## Known Limitations

1. **PolySynth frequency**: Uses control-rate (20Hz) instead of audio-rate
   - Slight stepping possible with very fast LFOs
   - Not noticeable with typical musical LFO rates (0.1-5 Hz)

2. **Shared globals**: Only one route at a time in test page
   - Production will support 8 simultaneous routes

## Common Issues

### No Sound
- Check: Audio Context started?
- Check: Drone or notes triggered?
- Check: Browser audio not muted?

### Distortion
- Reduce Modulation Depth
- Check LFO Amplitude (should be 1.0 typically)
- Verify using ±20 dB range (not -30 to 0)

### Steps in Frequency Modulation
- Normal for PolySynth (control-rate polling)
- Should be smooth for drone (audio-rate)

## Success Criteria

Before moving to React implementation, verify:

- [ ] Volume modulation at depth=0 produces no change
- [ ] Volume modulation is clean (no distortion)
- [ ] Pan modulation works without affecting volume
- [ ] Drone frequency modulation is perfectly smooth
- [ ] PolySynth frequency modulation works (even if slightly stepped)
- [ ] Disconnect removes all modulation
- [ ] Multiple LFO waveforms work correctly

Once all tests pass, we're ready to implement in React! 🎉

