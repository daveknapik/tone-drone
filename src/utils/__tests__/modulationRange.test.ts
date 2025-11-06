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
  return { Time, Frequency };
});
import {
  coerceParamToNumber,
  computeRouteRange,
  defaultsForDestination,
  clamp,
} from "../../utils/modulationRange";

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


