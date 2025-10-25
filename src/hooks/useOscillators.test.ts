import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useOscillators } from "./useOscillators";
import * as Tone from "tone";
import { DEFAULT_OSCILLATOR_PARAMS } from "../utils/presetDefaults";

// Mock Tone.js
vi.mock("tone", () => {
  const mockDispose = vi.fn();
  const mockConnect = vi.fn();

  return {
    Oscillator: vi.fn().mockImplementation((freq: number, type: string) => ({
      frequency: { value: freq },
      type,
      connect: mockConnect,
      dispose: mockDispose,
      start: vi.fn(),
      stop: vi.fn(),
    })),
    FatOscillator: vi.fn().mockImplementation((freq: number, type: string) => ({
      frequency: { value: freq },
      type,
      count: 3,
      spread: 20,
      connect: mockConnect,
      dispose: mockDispose,
      start: vi.fn(),
      stop: vi.fn(),
    })),
    Channel: vi.fn().mockImplementation((volume: number, pan: number) => ({
      volume: { value: volume },
      pan: { value: pan },
      dispose: mockDispose,
      connect: vi.fn(),
    })),
  };
});

describe("useOscillators", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("default behavior", () => {
    it("should create the default number of oscillators (6)", () => {
      const { result } = renderHook(() => useOscillators());
      const [oscillators] = result.current;

      expect(oscillators).toHaveLength(6);
      expect(Tone.Oscillator).toHaveBeenCalledTimes(6);
      expect(Tone.Channel).toHaveBeenCalledTimes(6);
    });

    it("should create custom number of oscillators", () => {
      const { result } = renderHook(() => useOscillators(3));
      const [oscillators] = result.current;

      expect(oscillators).toHaveLength(3);
    });

    it("should initialize oscillators with correct defaults", () => {
      renderHook(() => useOscillators(1));

      expect(Tone.Oscillator).toHaveBeenCalledWith(
        DEFAULT_OSCILLATOR_PARAMS.frequency,
        "sine"
      );
      expect(Tone.Channel).toHaveBeenCalledWith(-5, 0);
    });

    it("should create basic oscillators by default", () => {
      const { result } = renderHook(() => useOscillators(2));
      const [oscillators] = result.current;

      oscillators.forEach((osc) => {
        expect(osc.type).toBe("basic");
      });
    });

    it("should connect oscillators to their channels", () => {
      const { result } = renderHook(() => useOscillators(1));
      const [oscillators] = result.current;

      // The connect method was already called during hook execution
      // Get the mock instance from the constructor and verify
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mockOscillator = vi.mocked(Tone.Oscillator).mock.results[0].value;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(mockOscillator.connect).toHaveBeenCalledWith(
        oscillators[0].channel
      );
    });

    it("should dispose of oscillators on unmount", () => {
      const { unmount } = renderHook(() => useOscillators(2));

      unmount();

      // Each oscillator and channel should be disposed
      const oscillatorMock = vi.mocked(Tone.Oscillator).mock.results[0];
      const channelMock = vi.mocked(Tone.Channel).mock.results[0];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(oscillatorMock.value.dispose).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(channelMock.value.dispose).toHaveBeenCalled();
    });
  });

  describe("oscillator type support", () => {
    it("should create FatOscillators when type array includes 'fat'", () => {
      const { result } = renderHook(() => useOscillators(2, ["fat", "fat"]));
      const [oscillators] = result.current;

      expect(oscillators).toHaveLength(2);
      expect(Tone.FatOscillator).toHaveBeenCalledTimes(2);
      oscillators.forEach((osc) => {
        expect(osc.type).toBe("fat");
      });
    });

    it("should support mixed basic and fat oscillators", () => {
      const { result } = renderHook(() =>
        useOscillators(3, ["basic", "fat", "basic"])
      );
      const [oscillators] = result.current;

      expect(oscillators).toHaveLength(3);
      expect(oscillators[0].type).toBe("basic");
      expect(oscillators[1].type).toBe("fat");
      expect(oscillators[2].type).toBe("basic");

      expect(Tone.Oscillator).toHaveBeenCalledTimes(2);
      expect(Tone.FatOscillator).toHaveBeenCalledTimes(1);
    });

    it("should return a type setter function", () => {
      const { result } = renderHook(() => useOscillators(2));
      const [, , setTypes] = result.current;

      expect(setTypes).toBeInstanceOf(Function);
    });

    it("should recreate oscillators when types are updated", () => {
      const { result, rerender } = renderHook(() =>
        useOscillators(2, ["basic", "basic"])
      );

      // Initial state
      const [initialOscillators] = result.current;
      expect(initialOscillators[0].type).toBe("basic");

      // Change types via setter
      const [, , setTypes] = result.current;
      setTypes(["fat", "basic"]);

      // Trigger re-render
      rerender();

      // Check new state
      const [newOscillators] = result.current;
      expect(newOscillators[0].type).toBe("fat");
      expect(newOscillators[1].type).toBe("basic");
    });
  });
});
