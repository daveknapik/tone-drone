import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useConnectChannelsToBus } from "./useConnectChannelsToBus";
import * as Tone from "tone";

// Mock Tone.js
vi.mock("tone", () => ({
  Channel: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
  })),
  Panner: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
  })),
}));

describe("useConnectChannelsToBus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should connect all channels to the bus", () => {
    const mockChannel1 = new Tone.Channel();
    const mockChannel2 = new Tone.Channel();
    const mockBus = new Tone.Channel();

    const connectSpy1 = vi.spyOn(mockChannel1, "connect");
    const connectSpy2 = vi.spyOn(mockChannel2, "connect");

    renderHook(() =>
      useConnectChannelsToBus([mockChannel1, mockChannel2], mockBus)
    );

    expect(connectSpy1).toHaveBeenCalledWith(mockBus);
    expect(connectSpy2).toHaveBeenCalledWith(mockBus);
  });

  it("should handle empty channel array", () => {
    const mockBus = new Tone.Channel();

    expect(() => {
      renderHook(() => useConnectChannelsToBus([], mockBus));
    }).not.toThrow();
  });

  it("should connect panners to the bus", () => {
    const mockPanner = new Tone.Panner();
    const mockBus = new Tone.Channel();

    const connectSpy = vi.spyOn(mockPanner, "connect");

    renderHook(() => useConnectChannelsToBus([mockPanner], mockBus));

    expect(connectSpy).toHaveBeenCalledWith(mockBus);
  });

  it("should connect mixed channel types to the bus", () => {
    const mockChannel = new Tone.Channel();
    const mockPanner = new Tone.Panner();
    const mockBus = new Tone.Channel();

    const channelConnectSpy = vi.spyOn(mockChannel, "connect");
    const pannerConnectSpy = vi.spyOn(mockPanner, "connect");

    renderHook(() =>
      useConnectChannelsToBus([mockChannel, mockPanner], mockBus)
    );

    expect(channelConnectSpy).toHaveBeenCalledWith(mockBus);
    expect(pannerConnectSpy).toHaveBeenCalledWith(mockBus);
  });
});
