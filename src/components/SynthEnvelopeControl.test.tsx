import { describe, it, expect, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import SynthEnvelopeControl from "./SynthEnvelopeControl";
import { SynthEnvelopeHandle, SynthEnvelopeParams } from "../types/SynthParams";

// Helper to get input element value safely
function getInputValue(element: HTMLElement): string {
  if (!("value" in element)) {
    throw new Error("Element does not have a value property");
  }
  return element.value as string;
}

describe("SynthEnvelopeControl", () => {
  it("renders all four envelope sliders", () => {
    render(<SynthEnvelopeControl />);

    expect(screen.getByLabelText(/attack/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/decay/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sustain/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/release/i)).toBeInTheDocument();
  });

  it("initializes sliders with default values", () => {
    render(<SynthEnvelopeControl />);

    const attackSlider = screen.getByLabelText(/attack/i);
    const decaySlider = screen.getByLabelText(/decay/i);
    const sustainSlider = screen.getByLabelText(/sustain/i);
    const releaseSlider = screen.getByLabelText(/release/i);

    expect(parseFloat(getInputValue(attackSlider))).toBe(0.01);
    expect(parseFloat(getInputValue(decaySlider))).toBe(0.1);
    expect(parseFloat(getInputValue(sustainSlider))).toBe(0.5);
    expect(parseFloat(getInputValue(releaseSlider))).toBe(1.0);
  });

  it("initializes sliders with provided initial params", () => {
    const initialParams: SynthEnvelopeParams = {
      attack: 0.5,
      decay: 0.3,
      sustain: 0.7,
      release: 2.0,
    };

    render(<SynthEnvelopeControl initialParams={initialParams} />);

    const attackSlider = screen.getByLabelText(/attack/i);
    const decaySlider = screen.getByLabelText(/decay/i);
    const sustainSlider = screen.getByLabelText(/sustain/i);
    const releaseSlider = screen.getByLabelText(/release/i);

    expect(parseFloat(getInputValue(attackSlider))).toBe(0.5);
    expect(parseFloat(getInputValue(decaySlider))).toBe(0.3);
    expect(parseFloat(getInputValue(sustainSlider))).toBe(0.7);
    expect(parseFloat(getInputValue(releaseSlider))).toBe(2.0);
  });

  it("calls onChange callback when slider values change", () => {
    const handleChange = vi.fn();

    render(<SynthEnvelopeControl onChange={handleChange} />);

    const attackSlider = screen.getByLabelText(/attack/i);

    // Use fireEvent for range input change
    fireEvent.change(attackSlider, { target: { value: "0.8" } });

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        attack: 0.8,
      })
    );
  });

  it("calls onParameterChange callback when slider values change", () => {
    const handleParameterChange = vi.fn();

    render(<SynthEnvelopeControl onParameterChange={handleParameterChange} />);

    const releaseSlider = screen.getByLabelText(
      /release/i
    );

    // Use fireEvent for range input change
    fireEvent.change(releaseSlider, { target: { value: "3" } });

    expect(handleParameterChange).toHaveBeenCalled();
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

    const attackSlider = screen.getByLabelText(/attack/i);
    const decaySlider = screen.getByLabelText(/decay/i);
    const sustainSlider = screen.getByLabelText(/sustain/i);
    const releaseSlider = screen.getByLabelText(/release/i);

    expect(parseFloat(getInputValue(attackSlider))).toBe(1.0);
    expect(parseFloat(getInputValue(decaySlider))).toBe(0.8);
    expect(parseFloat(getInputValue(sustainSlider))).toBe(0.4);
    expect(parseFloat(getInputValue(releaseSlider))).toBe(4.0);
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
    expect(retrievedParams).toEqual(newParams);
  });

  it("has correct slider ranges", () => {
    render(<SynthEnvelopeControl />);

    const attackSlider = screen.getByLabelText(/attack/i);
    const decaySlider = screen.getByLabelText(/decay/i);
    const sustainSlider = screen.getByLabelText(/sustain/i);
    const releaseSlider = screen.getByLabelText(/release/i);

    // Attack: 0-2s
    expect(attackSlider.min).toBe("0");
    expect(attackSlider.max).toBe("2");
    expect(attackSlider.step).toBe("0.01");

    // Decay: 0-2s
    expect(decaySlider.min).toBe("0");
    expect(decaySlider.max).toBe("2");
    expect(decaySlider.step).toBe("0.01");

    // Sustain: 0-1
    expect(sustainSlider.min).toBe("0");
    expect(sustainSlider.max).toBe("1");
    expect(sustainSlider.step).toBe("0.01");

    // Release: 0-5s
    expect(releaseSlider.min).toBe("0");
    expect(releaseSlider.max).toBe("5");
    expect(releaseSlider.step).toBe("0.01");
  });
});
