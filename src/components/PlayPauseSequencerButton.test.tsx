import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "../test/testUtils";
import userEvent from "@testing-library/user-event";
import PlayPauseSequencerButton from "./PlayPauseSequencerButton";
import * as Tone from "tone";

// Mock Tone.js
vi.mock("tone", () => ({
  start: vi.fn().mockResolvedValue(undefined),
  getTransport: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
  })),
}));

describe("PlayPauseSequencerButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with 'Play Sequences' text initially", () => {
    render(<PlayPauseSequencerButton />);
    expect(screen.getByText("Play Sequences")).toBeInTheDocument();
  });

  it("should toggle to 'Pause Sequences' when clicked", async () => {
    const user = userEvent.setup();
    render(<PlayPauseSequencerButton />);

    const button = screen.getByText("Play Sequences");
    await user.click(button);

    expect(screen.getByText("Pause Sequences")).toBeInTheDocument();
  });

  it("should start transport when clicked", async () => {
    const mockTransport = {
      start: vi.fn(),
      stop: vi.fn(),
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    vi.mocked(Tone.getTransport).mockReturnValue(mockTransport as any);

    const user = userEvent.setup();
    render(<PlayPauseSequencerButton />);

    const button = screen.getByText("Play Sequences");
    await user.click(button);

    expect(mockTransport.start).toHaveBeenCalledTimes(1);
    expect(Tone.start).toHaveBeenCalled();
  });

  it("should stop transport when clicked twice", async () => {
    const mockTransport = {
      start: vi.fn(),
      stop: vi.fn(),
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    vi.mocked(Tone.getTransport).mockReturnValue(mockTransport as any);

    const user = userEvent.setup();
    render(<PlayPauseSequencerButton />);

    const playButton = screen.getByText("Play Sequences");
    await user.click(playButton);

    const pauseButton = screen.getByText("Pause Sequences");
    await user.click(pauseButton);

    expect(mockTransport.stop).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Play Sequences")).toBeInTheDocument();
  });
});
