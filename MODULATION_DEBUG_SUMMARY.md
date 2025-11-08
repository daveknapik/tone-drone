# Modulation Matrix Audio-Rate Range Control - Debug Summary

## Problem Statement

**Goal**: Allow user to change Center/Amount (or Min/Max) values for modulation routes and have those changes immediately affect the audio modulation range.

**Current Behavior**:
- The FIRST change to Center/Amount takes effect (user hears the sound change)
- ALL subsequent changes to Center/Amount do NOT take effect (sound stays the same)
- This affects ALL audio-rate destinations (filter frequency/Q, delay time/feedback, micro time/feedback)
- Control-rate destinations (BitCrusher bits, Chebyshev order) work correctly

## Architecture Overview

### Audio-Rate Modulation (BROKEN)
Uses Tone.js Scale nodes to map LFO output to parameter ranges:
```
LFO Signal → Multiply (depth) → Scale (min/max) → Audio Parameter
```

The Scale node has `min` and `max` properties that should be updated when Center/Amount change.

### Control-Rate Modulation (WORKS)
Uses JavaScript calculations at ~60Hz:
```javascript
// In requestAnimationFrame loop:
const lfoValue = sampleLfo(sourceIndex, lfoType);
const mapped = computeRouteRange(destination, route, defaults);
targetParam.value = mapped;
```

## Key Files

- `/Users/daveknapik/Development/tone-drone/src/components/ModulationMatrix.tsx` - Main component (879 lines)
- `/Users/daveknapik/Development/tone-drone/src/utils/modulationConnectionManager.ts` - Manages LFO connections
- `/Users/daveknapik/Development/tone-drone/src/utils/modulationRange.ts` - Range calculation helpers

## The Core Issue (Confirmed by Logs)

```
[ConnectionManager] connectDelayTime(0-micro-time) Connection stored, total connections: 1
```
Immediately followed by:
```
[ConnectionManager] hasConnection(0-micro-time): false, total connections: 0, all IDs: []
```

**The connection is being stored but then VANISHES immediately.**

This happens because:
1. Connection useEffect creates connection
2. React Strict Mode (development) runs cleanup function
3. Cleanup calls `connectionManager.disconnectAll()`
4. Connections Map is cleared
5. Range update useEffect runs and sees no connection exists
6. Connection useEffect runs again and recreates connection

This cycle repeats on EVERY render when Center/Amount change.

## Solutions Attempted (All Failed)

### Attempt 1: Remove Auto-Capture useEffect
**What**: Removed the useEffect that auto-captured parameter values when destination changed
**Why**: It was modifying `routes` state, triggering Connection useEffect
**Result**: ❌ Still reconnects every time

### Attempt 2: Use routeStructure State
**What**: Created separate state variable `routeStructure` to track only source-destination pairs
**Why**: Prevent Connection useEffect from running when Center/Amount change
**Result**: ❌ Still reconnects - `routeStructure` state update still triggers useEffect

### Attempt 3: Remove `effects` from Dependencies
**What**: Removed `effects` object from Connection useEffect dependencies
**Why**: `effects` object reference changes on every render
**Result**: ❌ Still reconnects

### Attempt 4: Check Actual Connections Instead of Ref
**What**: Instead of checking `hasConnectedRef`, check `connectionManager.hasConnection()`
**Why**: Ref gets reset by cleanup, but connections might still exist
**Result**: ❌ Still shows `allConnected=false` because connections are actually cleared by cleanup

## Root Cause Analysis

### React Strict Mode Behavior
In development, React Strict Mode runs effects twice:
1. Mount → Effect runs → Cleanup runs → Effect runs again
2. On every render with dependency changes: Cleanup runs → Effect runs

### The Problematic Cleanup Function
```typescript
return () => {
  connectionManager.disconnectAll();
  hasConnectedRef.current = false;
};
```

This cleanup runs:
- On component unmount (correct)
- On dependency changes (correct)
- **On EVERY render in Strict Mode** (causes the bug)

### Why Dependencies Keep Changing

The Connection useEffect has these dependencies:
```typescript
}, [routeStructure, signals, oscillators, lfoParams, connectionManager]);
```

When Center/Amount change:
1. `routes` state updates
2. Separate useEffect updates `routeStructure` state
3. `routeStructure` change triggers Connection useEffect
4. Cleanup runs → disconnectAll()
5. Connection recreated
6. Repeat forever

## What Should Happen

### Expected Flow
1. User selects destination → Connection useEffect creates connection ONCE
2. User changes Center/Amount → Range update useEffect updates Scale node min/max
3. Scale node continues modulating with new range (no reconnection needed)

### Current Flow
1. User selects destination → Connection created
2. User changes Center/Amount → `routes` changes → `routeStructure` changes
3. Connection useEffect cleanup runs → `disconnectAll()`
4. Connection useEffect runs again → recreates connection
5. Range update useEffect runs → sees no connection (already cleared)
6. Steps 2-5 repeat on every subsequent change

## Key Insights

### Why BitCrusher/Chebyshev Work
Control-rate destinations don't use the Connection useEffect at all. They:
1. Store update functions in `controlRoutesRef`
2. Call those functions in `requestAnimationFrame` loop
3. Read `route.center`, `route.rangeAmount`, `route.amount` directly from current state
4. No connection creation/destruction involved

### Why First Change Works
The very first connection succeeds temporarily before Strict Mode cleanup runs. User hears the sound change. But immediately after, the cleanup runs and clears it, so subsequent changes don't work.

## Proposed Solutions (Not Yet Implemented)

### Option 1: Don't Clear Connections in Cleanup (Risky)
Only call `disconnectAll()` on actual unmount or when route structure genuinely changes, not on every Strict Mode render.

**Pros**: Simple fix
**Cons**: Risk of memory leaks if connections aren't properly cleaned up

### Option 2: Separate Connection Management from useEffect
Move connection creation out of useEffect entirely. Create/destroy connections in response to specific user actions, not as side effects of state changes.

**Pros**: Cleaner separation of concerns
**Cons**: Major refactor required

### Option 3: Update Scale Nodes Without Reconnecting
Check if connection exists before creating. If it exists, just update the Scale node's min/max properties without recreating the entire connection.

**Pros**: Matches the intended behavior
**Cons**: Requires fixing why `hasConnection()` returns false when it should return true

### Option 4: Use Refs for Everything
Store all route data in refs instead of state. Only trigger useEffect when route structure truly changes (not on every render).

**Pros**: Would eliminate unnecessary rerenders
**Cons**: Loses React's state management benefits, makes preset save/load harder

## Missing Debug Information

**CRITICAL**: We need to log the actual Microlooper Time parameter value to see if modulation is happening at all.

Added logging in latest version:
```typescript
// In requestAnimationFrame loop (~10Hz throttled)
console.log(`[DEBUG] Microlooper Time: ${timeValue}`);
```

This will show us whether:
- Scale node modulation is working but connections keep breaking
- OR Scale node is never modulating in the first place

## Next Steps

1. **Observe the `[DEBUG] Microlooper Time` logs** when changing Center/Amount
2. If values change: Problem is just the reconnection loop, fix the cleanup logic
3. If values DON'T change: Deeper issue with Scale node or connection architecture

## Timeline of Changes

This issue has been investigated across multiple sessions with extensive logging added throughout the codebase. All attempts to fix via dependency management have failed. The fundamental issue is the interaction between React's rendering model (especially Strict Mode) and imperative audio graph management.
