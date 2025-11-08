## Modulation Matrix - Handover Notes

### Purpose

- Eliminate clicks/pops when modulating volume and pan.
- Expose synth/effect parameters as modulation destinations.
- Provide per-route ranges with two modes:
  - Center ± Amount
  - Min..Max
- Add “Anchor to Current” to seed route ranges from the current parameter value.

### Current Signal Flow (per-oscillator)

- Oscillator → Channel → Tremolo → AutoPanner → Effects Bus → Destination
- Decisions:
  - Tremolo for volume modulation (click-free AM); `spread=0`, `wet=1`.
  - AutoPanner for pan modulation (click-free). Type synced with LFO.

### Modulation Sources

- 4 LFOs created in `useModulationLFOs`.
  - Each LFO outputs a `Tone.Signal` post-polarity processing.
  - UI in `ModulationLFO.tsx` controls frequency, type, amplitude, polarity.

### Destinations

- Oscillators:
  - `oscN-frequency` (via detune), `oscN-volume` (Tremolo), `oscN-pan` (AutoPanner)
- Effects (audio-rate via Tone.Scale):
  - `filter-q` (0..9), `filter-frequency` (30..7000 Hz)
  - `delay-time` (0..1s), `delay-feedback` (0..0.95)
  - `micro-time` (0..1s), `micro-feedback` (0..0.95)
- Effects (control-rate via requestAnimationFrame):
  - `bitcrusher-bits` (1..16, integer)
  - `chebyshev-order` (1..100, integer)

### Routing and Connection Manager

- `ModulationConnectionManager` encapsulates all wiring.
  - Frequency: LFO → Multiply(depth) → Scale(±100 cents) → Osc.detune
  - Volume: uses pre-inserted Tremolo (maps LFO UI params onto Tremolo)
  - Pan: uses pre-inserted AutoPanner (maps LFO UI params)
  - Effect AudioParams: LFO → Multiply(depth) → Scale(dest range) → Param
  - Control-rate params: sampled in JS ~60Hz; values set directly with clamping
  - Tracks per-connection `Tone.Scale` nodes to allow live min/max edits:
    - `updateScaleRange(connectionId, min, max)` updates Scale.min/max in place.

### Range Model

- Implemented in `src/utils/modulationRange.ts`
  - `defaultsForDestination(dest)` returns default bounds.
  - `computeRouteRange(dest, route, defaults)` returns `[min, max]` for the route:
    - Center ± Amount: clamps to defaults.
    - Min..Max: clamps and fixes inverted ranges.
  - `clamp` helper.
  - `coerceParamToNumber(value, kind)` converts Tone units/Params to numbers:
    - Handles primitives, Time/Frequency wrappers, objects with `.value`,
      Param-like objects with `getValueAtTime`, and falls back to Tone converters.

### Applying Ranges Live

- In `ModulationMatrix.tsx`, a `useEffect` iterates routes and for audio-rate destinations:
  - Uses `computeRouteRange` to compute `[min, max]`.
  - Calls `connectionManager.updateScaleRange(connectionId, min, max)`.
  - No reconnect required (avoids pops).

### Anchor to Current

- Goal: When the user clicks Anchor on a route, read the current parameter value and set:
  - Center (Center ± Amount mode), or
  - Min/Max around current (Min..Max mode).
- Implementation:
  - For each destination, we read the active object:
    - Filter: `filter.get()?.frequency ?? filter.frequency`
    - Delay: `delay.get()?.delayTime ?? delay.delayTime`
    - Feedback: `delay.get()?.feedback ?? delay.feedback`
    - Microlooper: `micro.get()?.delayTime/feedback ?? micro.delayTime/feedback`
    - Q: `filter.get()?.Q ?? filter.Q`
    - Bits/Order: read plain values (`bitCrusher.bits.value`, `chebyshev.order`)
  - Value is coerced with `coerceParamToNumber` into a number and clamped to destination defaults.
  - Routes are updated in React state with the new center or min/max.

### Known Issue (to fix next)

- “Anchor to Current” for `filter-frequency` and `micro-time` still falls back to the default min
  (observed Center=30 or 0), even when set to higher values (e.g., 300 Hz and 1s).
  - Current state:
    - We read Param-like objects and call `coerceParamToNumber`, which tries:
      - `.value` if present
      - `.toSeconds()` / `.toFrequency()` if present
      - `.getValueAtTime(context.currentTime)` if present
      - Tone.Time/Tone.Frequency wrappers as a fallback
    - We also try `node.get()` where available (Tone v15) before coercion.
  - Hypotheses for failure:
    - The specific Tone.Param objects here may not expose the expected accessors (or return wrapped units that stringify unexpectedly).
    - Reading `.get()` may be returning an object whose shape differs (e.g. nested `Signal` / `Param`), producing 0 on coercion.
    - Value may be stored in a unit wrapper requiring different extraction (e.g., `.value` is itself a wrapper).
  - Temporary console debug lines are added in `ModulationMatrix.tsx` `[Anchor] ... raw:` to inspect the exact object passed to coercion.

### Testing

- Unit tests in `src/utils/__tests__/modulationRange.test.ts` cover:
  - Coercion of number/string/time/frequency, Param-like `.value`, `getValueAtTime`,
    and nested unit objects (`{ value: { toSeconds() } }` / `{ value: { toFrequency() } }`).
  - Range computation for both modes with clamping.
- Recommended next tests (TDD):
  - A focused unit test that simulates the Filter’s `frequency` and Delay’s `delayTime` Param shape seen at runtime, asserting `coerceParamToNumber` returns the real numeric values (e.g., 300, 1).
  - An e2e test that:
    1. sets Filter Frequency to 300 and Microlooper Time to 1 via the UI,
    2. adds routes for `filter-frequency` and `micro-time`,
    3. clicks “Anchor To Current”,
    4. asserts the route’s `center` equals 300 and 1 respectively.

### Recent Changes (high-level)

- Moved volume/pan modulation to Tremolo/AutoPanner in `useOscillators` for click-free modulation.
- Centralized range logic and coercion in `modulationRange.ts`; added unit tests.
- Connection manager now tracks `Tone.Scale` per connection to enable range changes without reconnecting audio nodes.
- Control-rate modulation for `bitcrusher-bits` and `chebyshev-order` using a sampled LFO in JS with clamping.
- Implemented range UI (Center ± Amount / Min..Max) and “Anchor to Current” per route.
- Attempted multiple anchoring fixes to read Param values reliably (direct Param, value, get(), getValueAtTime).

### Handover: Where to Look

- UI and state:
  - `src/components/ModulationMatrix.tsx` and `ModulationMatrixGrid.tsx`
- Connection logic:
  - `src/utils/modulationConnectionManager.ts`
  - `src/hooks/useOscillators.ts` (inserting Tremolo/AutoPanner per oscillator)
- Helpers and tests:
  - `src/utils/modulationRange.ts`
  - `src/utils/__tests__/modulationRange.test.ts`

### Next Steps for New Agent

1. Fix “Anchor to Current” for `filter-frequency` and `micro-time`:
   - Inspect the console debug logs to capture the exact `raw` object shape.
   - Extend `coerceParamToNumber` to handle that shape explicitly.
   - Prefer `Param.getValueAtTime(Tone.getContext().currentTime)` if available on the object chain; otherwise unwrap until you reach a primitive.
2. Add unit tests for the exact observed Param shapes (TDD) and ensure anchor works in e2e.
3. Remove the temporary console debug lines in `ModulationMatrix.tsx` once resolved.

### Notes

- Keep audio-rate changes click-free by avoiding graph reconnects; use `Scale.min/max` updates instead.
- For perceptual loudness, Tremolo depth is mapped with a small floor and scaling.
- Range defaults are intentionally conservative (`delay-feedback` max 0.95, frequency max 7000 Hz). Adjust if needed.
