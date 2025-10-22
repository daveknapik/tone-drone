# Troubleshooting Guide

Common issues and solutions for Tone Drone users.

## Table of Contents

- [Audio Issues](#audio-issues)
- [Performance Issues](#performance-issues)
- [Browser Compatibility](#browser-compatibility)
- [UI Issues](#ui-issues)
- [Recording Issues](#recording-issues)
- [Development Issues](#development-issues)

## Audio Issues

### No Sound / Audio Not Playing

**Symptoms**: The sequencer appears to be running (you see the beat indicator moving), but no sound is produced.

**Causes & Solutions**:

1. **Audio Context Not Started**

   - **Cause**: Browsers require user interaction before audio can play
   - **Solution**: Click anywhere on the page to initialize audio
   - **Check**: Look for any "Click to Start Audio" messages

2. **System Volume/Mute**

   - **Cause**: System or browser audio is muted
   - **Solution**:
     - Check system volume settings
     - Check browser tab is not muted (look for mute icon on the tab)
     - Check that your audio output device is working

3. **All Oscillators Muted**

   - **Cause**: All oscillators have been toggled off or have volume at minimum
   - **Solution**:
     - Press Q, W, A, S, Z, X to unmute oscillators
     - Check individual oscillator volume sliders
     - Expand the Oscillators section to see their states

4. **Effects Bus Send Too Low**

   - **Cause**: Effects bus send is set to -80 dB or very low, routing minimal/no audio to output
   - **Solution**: Check Effects Bus Send slider is set to at least -40 dB (default is -15 dB)

5. **No Active Steps**
   - **Cause**: No steps are activated in the sequencer
   - **Solution**: Click on step boxes to activate notes in the pattern

### Audio Crackling or Distortion

**Symptoms**: Audio plays but has pops, clicks, or digital distortion.

**Causes & Solutions**:

1. **CPU Overload**

   - **Cause**: Too much processing for your device
   - **Solution**:
     - Close other applications
     - Reduce number of active oscillators
     - Disable some effects
     - Lower browser zoom level

2. **Excessive Gain**

   - **Cause**: Multiple oscillators at full volume with high feedback effects
   - **Solution**:
     - Lower individual oscillator volumes (-5 dB is default)
     - Reduce delay/microlooper feedback
     - Lower effects wet/dry mix

3. **Sample Rate Mismatch**
   - **Cause**: Browser audio context sample rate mismatch
   - **Solution**:
     - Check system audio settings
     - Try 44.1kHz or 48kHz sample rate
     - Restart browser

### Audio Latency / Delayed Response

**Symptoms**: Clicks and keyboard presses have noticeable delay before audio responds.

**Causes & Solutions**:

1. **Browser Audio Latency**

   - **Cause**: Browser's default audio buffer size
   - **Solution**:
     - Use Chrome or Edge (generally lower latency)
     - Close other audio applications
     - Reduce CPU load

2. **System Bluetooth Audio**
   - **Cause**: Bluetooth headphones add significant latency
   - **Solution**: Use wired headphones or speakers for best results

### Audio Cuts Out or Stops

**Symptoms**: Audio plays for a while then suddenly stops.

**Causes & Solutions**:

1. **Browser Tab Throttling**

   - **Cause**: Browser throttles inactive tabs to save CPU
   - **Solution**: Keep the Tone Drone tab active and visible

2. **Power Saving Mode**

   - **Cause**: Device enters power saving mode
   - **Solution**:
     - Plug in your device
     - Disable power saving mode
     - Keep screen active

3. **Memory Issues**
   - **Cause**: Browser running out of memory
   - **Solution**:
     - Refresh the page
     - Close other browser tabs
     - Restart browser

## Performance Issues

### Slow UI / Laggy Interface

**Symptoms**: Controls feel sluggish, sliders don't respond smoothly.

**Causes & Solutions**:

1. **High CPU Usage**

   - **Check**: Open browser dev tools (F12) → Performance tab
   - **Solution**:
     - Reduce active oscillators
     - Disable effects
     - Close other applications

2. **Browser Extensions**

   - **Cause**: Extensions interfering with performance
   - **Solution**: Try in incognito/private mode

3. **Hardware Acceleration Disabled**
   - **Cause**: Browser not using GPU
   - **Solution**: Enable hardware acceleration in browser settings

### High CPU Usage

**Symptoms**: Device fans spin up, battery drains quickly, system feels slow.

**Causes & Solutions**:

1. **Too Many Audio Processes**

   - **Solution**:
     - Reduce number of oscillators
     - Use fewer effects
     - Lower effects wet/dry mix

2. **Complex Effects Chain**
   - **Solution**:
     - Disable unused effects (set wet to 0)
     - Reduce auto filter speed
     - Lower bit crusher bits (paradoxically, lower bits = less CPU)

## Browser Compatibility

### Safari Issues

**Issue**: Audio context doesn't start

- **Solution**: Make sure to click on the page before starting audio
- **Note**: Safari has stricter autoplay policies than Chrome

**Issue**: Sliders feel laggy

- **Solution**: This is a known Safari issue with range inputs
- **Workaround**: Use Chrome or Firefox for better performance

**Issue**: Recording doesn't work

- **Solution**: Ensure Safari has microphone permissions (even though we're not using the mic)
- **Check**: Safari → Settings → Websites → Microphone

### Firefox Issues

**Issue**: Dark mode toggle doesn't persist

- **Solution**: Check that Firefox is not blocking localStorage
- **Check**: Firefox → Settings → Privacy & Security → Cookies and Site Data

**Issue**: Audio sounds different than in Chrome

- **Note**: Firefox uses different Web Audio API implementations
- **Solution**: This is expected; slight differences are normal

### Mobile Browser Issues

**Issue**: Touch controls don't work well

- **Solution**:
  - Use landscape orientation
  - Zoom in on controls if needed
  - Use larger slider movements

**Issue**: Audio stutters on mobile

- **Solution**:
  - Close other apps
  - Use fewer oscillators
  - Disable effects
  - Connect to power

**Issue**: Recording doesn't work on iOS

- **Cause**: iOS Safari has limitations with audio recording
- **Solution**: Use a desktop browser for recording

## UI Issues

### Dark Mode Not Working

**Symptoms**: Theme toggle doesn't change appearance.

**Causes & Solutions**:

1. **localStorage Blocked**

   - **Cause**: Browser privacy settings blocking localStorage
   - **Solution**: Allow localStorage for this site

2. **CSS Not Loading**
   - **Cause**: Tailwind CSS not loaded properly
   - **Solution**: Hard refresh (Cmd/Ctrl + Shift + R)

### Controls Not Visible / Layout Broken

**Symptoms**: UI elements overlap or are cut off.

**Causes & Solutions**:

1. **Browser Zoom**

   - **Cause**: Browser zoom set too high or low
   - **Solution**: Reset zoom to 100% (Cmd/Ctrl + 0)

2. **Window Too Small**

   - **Cause**: Browser window is too narrow
   - **Solution**: Expand window or switch to mobile layout

3. **CSS Not Loaded**
   - **Cause**: Build issue or network problem
   - **Solution**: Hard refresh the page

### Step Grid Not Updating

**Symptoms**: Clicking steps doesn't activate/deactivate them.

**Causes & Solutions**:

1. **React State Issue**

   - **Solution**: Refresh the page
   - **Prevention**: Report this bug if it persists

2. **Event Handler Blocked**
   - **Cause**: Browser extension blocking clicks
   - **Solution**: Disable extensions or use incognito mode

## Recording Issues

### Recording Doesn't Start

**Symptoms**: Clicking record button does nothing.

**Causes & Solutions**:

1. **Audio Context Not Started**

   - **Solution**: Ensure audio is playing before recording

2. **Browser Permissions**

   - **Solution**: Grant audio recording permission when prompted

3. **Unsupported Browser**
   - **Cause**: Some browsers don't support MediaRecorder API
   - **Solution**: Use Chrome, Firefox, or Edge

### Recording Quality Issues

**Symptoms**: Recording sounds different than live audio or has lower quality.

**Causes & Solutions**:

1. **Recording Format**

   - **Note**: Recordings are exported as WAV (uncompressed)
   - **Expected**: Large file sizes for long recordings

2. **Clipping in Recording**
   - **Cause**: Input level too high
   - **Solution**: Lower oscillator volumes before recording

### Recording Download Fails

**Symptoms**: Recording stops but file doesn't download.

**Causes & Solutions**:

1. **Browser Download Settings**

   - **Solution**: Check browser download permissions
   - **Check**: Downloads folder for existing file

2. **File Size Too Large**
   - **Cause**: Very long recording
   - **Solution**: Record shorter sessions (under 5 minutes recommended)

## Development Issues

### npm install Fails

**Causes & Solutions**:

1. **Node Version**

   - **Check**: `node --version` (should be v18+)
   - **Solution**: Update Node.js

2. **Network Issues**
   - **Solution**: Check internet connection
   - **Alternative**: Try `npm install --verbose` to see details

### npm run dev Doesn't Start

**Causes & Solutions**:

1. **Port Already in Use**

   - **Symptom**: Error about port 5173 being in use
   - **Solution**: Kill the process using that port or change the port in vite.config.ts

2. **Missing Dependencies**
   - **Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install`

### Build Fails

**Causes & Solutions**:

1. **TypeScript Errors**

   - **Solution**: Run `npm run lint` to see all errors
   - **Fix**: Address type errors before building

2. **Memory Issues**
   - **Solution**: Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run build`

### Tests Fail

**Causes & Solutions**:

1. **Missing Test Setup**

   - **Solution**: Ensure `src/test/setup.ts` exists

2. **Tone.js Mock Issues**
   - **Solution**: Check that Tone.js is properly mocked in tests

## Getting Help

If your issue isn't listed here:

1. **Check the Browser Console**

   - Open DevTools (F12)
   - Look for error messages in the Console tab
   - Note the error message and stack trace

2. **Try Basic Troubleshooting**

   - Hard refresh the page (Cmd/Ctrl + Shift + R)
   - Clear browser cache
   - Try a different browser
   - Try incognito/private mode

3. **Report the Issue**

   - Open an issue on GitHub
   - Include:
     - Browser and version
     - Operating system
     - Steps to reproduce
     - Error messages from console
     - Screenshot if relevant

4. **Debug Information to Collect**
   - Browser: Chrome 120.0.6099.109
   - OS: macOS 14.1
   - Tone.js version: (check package.json)
   - Audio context state: (check console)
   - Console errors: (screenshot or copy/paste)

## Known Issues

### Current Limitations

1. **No MIDI Support**: MIDI controllers don't work (planned feature)
2. **No Preset System**: Can't save/load settings (planned feature)
3. **Mobile Recording**: Limited on iOS Safari
4. **Undo/Redo**: Not implemented yet for sequencer patterns

### Browser-Specific Quirks

1. **Safari**: Requires explicit user interaction before audio
2. **Firefox**: Slightly different audio characteristics
3. **Mobile**: Touch interactions less precise than mouse
4. **iOS**: Background audio not supported

## Reporting Bugs

When reporting bugs, include:

1. **Description**: What happened vs. what you expected
2. **Steps to Reproduce**: Detailed steps
3. **Environment**: Browser, OS, device
4. **Console Output**: Any error messages
5. **Screenshots**: If relevant

Example bug report:

```
Bug: No sound when clicking play

Steps to Reproduce:
1. Open Tone Drone in Chrome
2. Click on the page to start audio
3. Click Play button
4. No sound plays

Environment:
- Chrome 120.0.6099.109
- macOS 14.1
- MacBook Pro M1

Console Output:
AudioContext state: running
No errors in console

Screenshot:
[attached]
```

## Additional Resources

- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Tone.js Documentation](https://tonejs.github.io/docs/)
- [Browser Compatibility Data](https://caniuse.com/audio-api)
