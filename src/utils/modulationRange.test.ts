import { describe, it, expect, vi } from "vitest";
// Mock Tone to avoid real AudioContext construction in tests
vi.mock("tone", () => {
  class Time {
    private v: unknown;
    constructor(v: unknown) {
      this.v = v;
    }
    toSeconds(): number {
      const n = Number(this.v);
      return Number.isFinite(n) ? n : 0;
    }
  }
  class Frequency {
    private v: unknown;
    constructor(v: unknown) {
      this.v = v;
    }
    toFrequency(): number {
      const n = Number(this.v);
      return Number.isFinite(n) ? n : 0;
    }
  }
  const getContext = () => ({ currentTime: 0 });
  return { Time, Frequency, getContext };
});
import {
  coerceParamToNumber,
  computeRouteRange,
  defaultsForDestination,
  clamp,
} from "./modulationRange";

describe("coerceParamToNumber", () => {
  it("coerces normal numbers", () => {
    expect(coerceParamToNumber(0.95, "normal")).toBeCloseTo(0.95, 6);
    expect(coerceParamToNumber("0.5", "normal")).toBeCloseTo(0.5, 6);
  });
  it("coerces time to seconds", () => {
    expect(coerceParamToNumber(1, "time")).toBeCloseTo(1, 6);
  });
  it("coerces frequency to Hz", () => {
    expect(coerceParamToNumber(440, "frequency")).toBeCloseTo(440, 6);
  });
  it("coerces Param-like with .value number", () => {
    const param = { value: 300 };
    expect(coerceParamToNumber(param, "frequency")).toBe(300);
  });
  it("coerces Param-like with .getValueAtTime", () => {
    const param = { getValueAtTime: () => 1 };
    expect(coerceParamToNumber(param, "time")).toBe(1);
  });
  it("coerces Param-like with nested unit objects", () => {
    const freqObj = { toFrequency: () => 555 };
    const timeObj = { toSeconds: () => 0.75 };
    expect(coerceParamToNumber({ value: freqObj }, "frequency")).toBe(555);
    expect(coerceParamToNumber({ value: timeObj }, "time")).toBe(0.75);
  });
  it("coerces Tone.js Param-like object with getValueAtTime (simulates real Filter.frequency)", () => {
    // Simulate Tone.Filter.frequency Param which has getValueAtTime
    const filterFreqParam = {
      getValueAtTime: () => 300,
      value: 300,
    };
    expect(coerceParamToNumber(filterFreqParam, "frequency")).toBe(300);
  });
  it("coerces Tone.js Param-like object with getValueAtTime (simulates real Delay.delayTime)", () => {
    // Simulate Tone.FeedbackDelay.delayTime Param
    const delayTimeParam = {
      getValueAtTime: () => 0.5,
      value: 0.5,
    };
    expect(coerceParamToNumber(delayTimeParam, "time")).toBe(0.5);
  });
  it("handles Param objects where getValueAtTime is preferred over .value", () => {
    // This tests that getValueAtTime takes precedence (which is more reliable)
    const param = {
      getValueAtTime: () => 123,
      value: 456, // Different value to verify getValueAtTime is used
    };
    expect(coerceParamToNumber(param, "normal")).toBe(123);
  });
});

describe("computeRouteRange", () => {
  it("center±amount clamps within defaults", () => {
    const d = { min: 0, max: 9 };
    const [min, max] = computeRouteRange(
      "filter-q",
      { sourceIndex: 0, destination: "filter-q", amount: 1, rangeMode: "center", center: 2.5, rangeAmount: 10 },
      d
    );
    expect(min).toBe(0);
    expect(max).toBe(9);
  });
  it("min..max respects order and clamps", () => {
    const d = { min: 1, max: 16 };
    const [min, max] = computeRouteRange(
      "bitcrusher-bits",
      { sourceIndex: 0, destination: "bitcrusher-bits", amount: 1, rangeMode: "minmax", min: -5, max: 20 },
      d
    );
    expect(min).toBe(1);
    expect(max).toBe(16);
  });
  it("applies depth to center±amount when applyDepth=true", () => {
    const d = { min: 0, max: 1 };
    // Center=0.5, Amount=0.3, Depth=0.5 should give range [0.35, 0.65]
    const [min, max] = computeRouteRange(
      "delay-time",
      { sourceIndex: 0, destination: "delay-time", amount: 0.5, rangeMode: "center", center: 0.5, rangeAmount: 0.3 },
      d,
      true // applyDepth
    );
    expect(min).toBeCloseTo(0.35, 6); // 0.5 - (0.3 * 0.5)
    expect(max).toBeCloseTo(0.65, 6); // 0.5 + (0.3 * 0.5)
  });
  it("applies depth to min/max mode when applyDepth=true", () => {
    const d = { min: 30, max: 7000 };
    // Min=300, Max=700, Depth=0.5 should narrow around center (500)
    const [min, max] = computeRouteRange(
      "filter-frequency",
      { sourceIndex: 0, destination: "filter-frequency", amount: 0.5, rangeMode: "minmax", min: 300, max: 700 },
      d,
      true // applyDepth
    );
    expect(min).toBeCloseTo(400, 6); // 500 - (200 * 0.5)
    expect(max).toBeCloseTo(600, 6); // 500 + (200 * 0.5)
  });
  it("does not apply depth when applyDepth=false (default)", () => {
    const d = { min: 0, max: 1 };
    const [min, max] = computeRouteRange(
      "delay-time",
      { sourceIndex: 0, destination: "delay-time", amount: 0.5, rangeMode: "center", center: 0.5, rangeAmount: 0.3 },
      d,
      false // applyDepth=false
    );
    expect(min).toBeCloseTo(0.2, 6); // 0.5 - 0.3 (full amount, no depth applied)
    expect(max).toBeCloseTo(0.8, 6); // 0.5 + 0.3
  });
});

describe("defaultsForDestination", () => {
  it("returns defaults for known destinations", () => {
    expect(defaultsForDestination("filter-q")).toEqual({ min: 0, max: 9 });
    expect(defaultsForDestination("bitcrusher-bits")).toEqual({ min: 1, max: 16 });
  });
});

describe("clamp", () => {
  it("clamps values", () => {
    expect(clamp(2, 0, 1)).toBe(1);
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });
});


