import { describe, it, expect, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import SynthEnvelopeControl from "./SynthEnvelopeControl";
import { SynthEnvelopeHandle, SynthEnvelopeParams } from "../types/SynthParams";

describe("SynthEnvelopeControl", () => {
  it("renders all four envelope sliders", () => {
    render(<SynthEnvelopeControl />);

    expect(screen.getByLabelText(/attack/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/decay/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sustain/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/release/i)).toBeInTheDocument();
  });

  it("initializes sliders with default values", () => {
    const ref = createRef<SynthEnvelopeHandle>();
    render(<SynthEnvelopeControl ref={ref} />);

    // With logarithmic sliders, we should check actual parameter values via ref
    const params = ref.current?.getParams();
    expect(params?.attack).toBe(0.01);
    expect(params?.decay).toBe(0.1);
    expect(params?.sustain).toBe(0.25);
    expect(params?.release).toBe(0.5);
  });

  it("initializes sliders with provided initial params", () => {
    const initialParams: SynthEnvelopeParams = {
      attack: 0.5,
      decay: 0.3,
      sustain: 0.7,
      release: 2.0,
    };

    const ref = createRef<SynthEnvelopeHandle>();
    render(<SynthEnvelopeControl initialParams={initialParams} ref={ref} />);

    // With logarithmic sliders, check actual parameter values via ref
    const params = ref.current?.getParams();
    expect(params?.attack).toBe(0.5);
    expect(params?.decay).toBe(0.3);
    expect(params?.sustain).toBe(0.7);
    expect(params?.release).toBe(2.0);
  });

  it("calls onChange callback when slider values change", () => {
    vi.useFakeTimers();
    const handleChange = vi.fn();

    render(<SynthEnvelopeControl onChange={handleChange} />);

    const attackSlider = screen.getByLabelText(/attack/i);

    // With logarithmic scaling, slider value "0.8" gets converted via toLinear()
    // which is exp(0.8) - 1 ≈ 1.23, not 0.8
    fireEvent.change(attackSlider, { target: { value: "0.8" } });

    // Wait for debounced callback (50ms)
    vi.advanceTimersByTime(50);

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        attack: 0.8,
      })
    );

    vi.useRealTimers();
  });

  it("calls onParameterChange callback when slider values change", () => {
    vi.useFakeTimers();
    const handleParameterChange = vi.fn();

    render(<SynthEnvelopeControl onParameterChange={handleParameterChange} />);

    const releaseSlider = screen.getByLabelText(/release/i);

    // Use fireEvent for range input change
    fireEvent.change(releaseSlider, { target: { value: "3" } });

    // Wait for debounced callback (500ms)
    vi.advanceTimersByTime(500);

    expect(handleParameterChange).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("exposes getParams method via ref", () => {
    const ref = createRef<SynthEnvelopeHandle>();
    const initialParams: SynthEnvelopeParams = {
      attack: 0.2,
      decay: 0.4,
      sustain: 0.6,
      release: 1.5,
    };

    render(<SynthEnvelopeControl initialParams={initialParams} ref={ref} />);

    const params = ref.current?.getParams();
    expect(params).toEqual(initialParams);
  });

  it("exposes setParams method via ref", () => {
    const ref = createRef<SynthEnvelopeHandle>();

    render(<SynthEnvelopeControl ref={ref} />);

    const newParams: SynthEnvelopeParams = {
      attack: 1.0,
      decay: 0.8,
      sustain: 0.4,
      release: 4.0,
    };

    act(() => {
      ref.current?.setParams(newParams);
    });

    // With logarithmic sliders, check actual params via ref, not slider HTML values
    const retrievedParams = ref.current?.getParams();
    expect(retrievedParams?.attack).toBe(1.0);
    expect(retrievedParams?.decay).toBe(0.8);
    expect(retrievedParams?.sustain).toBe(0.4);
    // Release is clamped to max of 2.0
    expect(retrievedParams?.release).toBe(2.0);
  });

  it("updates getParams return value after setParams is called", () => {
    const ref = createRef<SynthEnvelopeHandle>();

    render(<SynthEnvelopeControl ref={ref} />);

    const newParams: SynthEnvelopeParams = {
      attack: 0.15,
      decay: 0.25,
      sustain: 0.85,
      release: 2.5,
    };

    act(() => {
      ref.current?.setParams(newParams);
    });

    const retrievedParams = ref.current?.getParams();
    // Release is clamped to max of 2.0
    expect(retrievedParams).toEqual({
      attack: 0.15,
      decay: 0.25,
      sustain: 0.85,
      release: 2.0,
    });
  });

  it("has correct slider ranges", () => {
    render(<SynthEnvelopeControl />);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const attackSlider = screen.getByLabelText(/attack/i) as HTMLInputElement;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const decaySlider = screen.getByLabelText(/decay/i) as HTMLInputElement;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const sustainSlider = screen.getByLabelText(/sustain/i) as HTMLInputElement;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const releaseSlider = screen.getByLabelText(/release/i) as HTMLInputElement;

    // Attack: 0-2s
    expect(attackSlider.min).toBe("0");
    expect(attackSlider.max).toBe("2");
    expect(attackSlider.step).toBe("0.01");

    // Decay: 0-1s (limited to prevent voice accumulation)
    expect(decaySlider.min).toBe("0");
    expect(decaySlider.max).toBe("1");
    expect(decaySlider.step).toBe("0.01");

    // Sustain: 0-1
    expect(sustainSlider.min).toBe("0");
    expect(sustainSlider.max).toBe("1");
    expect(sustainSlider.step).toBe("0.01");

    // Release: 0-2s (limited to prevent voice accumulation)
    expect(releaseSlider.min).toBe("0");
    expect(releaseSlider.max).toBe("2");
    expect(releaseSlider.step).toBe("0.01");
  });
});
