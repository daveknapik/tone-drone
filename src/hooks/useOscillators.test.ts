import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useOscillators } from "./useOscillators";
import * as Tone from "tone";

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

    expect(Tone.Oscillator).toHaveBeenCalledWith(440, "sine");
    expect(Tone.Channel).toHaveBeenCalledWith(-5, 0);
  });

  it("should connect oscillators to their channels", () => {
    const { result } = renderHook(() => useOscillators(1));
    const [oscillators] = result.current;

    // The connect method was already called during hook execution
    // Get the mock instance from the constructor and verify
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mockOscillator = vi.mocked(Tone.Oscillator).mock.results[0].value;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(mockOscillator.connect).toHaveBeenCalledWith(oscillators[0].channel);
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
