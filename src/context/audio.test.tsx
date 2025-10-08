import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AudioContextProvider } from "./audio";
import AudioContext from "./audio";
import * as Tone from "tone";
import { useContext } from "react";

// Mock Tone.js
vi.mock("tone", () => ({
  start: vi.fn().mockResolvedValue(undefined),
  getTransport: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
  })),
}));

describe("AudioContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with audio disabled and transport stopped", () => {
    const { result } = renderHook(
      () => useContext(AudioContext),
      { wrapper: AudioContextProvider }
    );

    expect(result.current?.isTransportRunning).toBe(false);
  });

  it("should enable browser audio when handleBrowserAudioStart is called", async () => {
    const { result } = renderHook(
      () => useContext(AudioContext),
      { wrapper: AudioContextProvider }
    );

    await act(async () => {
      await result.current?.handleBrowserAudioStart();
    });

    await waitFor(() => {
      expect(Tone.start).toHaveBeenCalledTimes(1);
    });
  });

  it("should toggle transport on and off", () => {
    const mockTransport = {
      start: vi.fn(),
      stop: vi.fn(),
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    vi.mocked(Tone.getTransport).mockReturnValue(mockTransport as any);

    const { result } = renderHook(
      () => useContext(AudioContext),
      { wrapper: AudioContextProvider }
    );

    // Start transport
    act(() => {
      result.current?.toggleTransport();
    });

    expect(result.current?.isTransportRunning).toBe(true);
    expect(mockTransport.start).toHaveBeenCalledTimes(1);

    // Stop transport
    act(() => {
      result.current?.toggleTransport();
    });

    expect(result.current?.isTransportRunning).toBe(false);
    expect(mockTransport.stop).toHaveBeenCalledTimes(1);
  });
});
