import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, act, waitFor } from "@testing-library/react";
import { useRef, useEffect } from "react";
import * as Tone from "tone";
import AutoFilter from "./AutoFilter";
import { AutoFilterHandle, AutoFilterParams } from "../types/AutoFilterParams";

// Mock Tone.js
vi.mock("tone", () => {
  const mockSet = vi.fn();

  return {
    AutoFilter: vi.fn().mockImplementation(() => ({
      set: mockSet,
      filter: {
        type: "highpass",
        rolloff: -12,
      },
      start: vi.fn().mockReturnThis(),
      dispose: vi.fn(),
    })),
  };
});

describe("AutoFilter", () => {
  let filter: React.RefObject<Tone.AutoFilter>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Create a fresh mocked Tone.AutoFilter for each test
    filter = {
      current: new Tone.AutoFilter().start() as unknown as Tone.AutoFilter,
    };
  });

  describe("useImperativeHandle", () => {
    it("should expose getParams method that returns current parameters", () => {
      let autoFilterHandle: AutoFilterHandle | null = null;

      // Test component that captures the ref
      function TestWrapper() {
        const ref = useRef<AutoFilterHandle>(null);

        // Capture the ref after mount
        useEffect(() => {
          autoFilterHandle = ref.current;
        });

        return <AutoFilter filter={filter} ref={ref} />;
      }

      render(<TestWrapper />);

      // Should have access to the handle
      expect(autoFilterHandle).not.toBeNull();

      // Type assertion after null check - safe because we just verified it's not null
      const handle = autoFilterHandle!;

      expect(handle.getParams).toBeDefined();

      // Should return default parameters
      const params = handle.getParams();
      expect(params).toEqual({
        baseFrequency: 300,
        depth: 1,
        frequency: 4,
        rolloff: -12,
        Q: 1,
        wet: 0,
        type: "highpass",
        oscillatorType: "sine",
      });
    });

    it("should expose setParams method that updates all parameters", async () => {
      let autoFilterHandle: AutoFilterHandle | null = null;

      function TestWrapper() {
        const ref = useRef<AutoFilterHandle>(null);

        useEffect(() => {
          autoFilterHandle = ref.current;
        });

        return <AutoFilter filter={filter} ref={ref} />;
      }

      render(<TestWrapper />);

      expect(autoFilterHandle).not.toBeNull();
      const handle = autoFilterHandle!;

      const newParams: AutoFilterParams = {
        baseFrequency: 500,
        depth: 0.5,
        frequency: 2,
        rolloff: -24,
        Q: 3,
        wet: 0.7,
        type: "lowpass",
        oscillatorType: "square",
      };

      // Set new parameters wrapped in act
      act(() => {
        handle.setParams(newParams);
      });

      // Wait for state to update
      await waitFor(() => {
        const updatedParams = handle.getParams();
        expect(updatedParams).toEqual(newParams);
      });
    });

    it("should allow partial parameter updates", async () => {
      let autoFilterHandle: AutoFilterHandle | null = null;

      function TestWrapper() {
        const ref = useRef<AutoFilterHandle>(null);

        useEffect(() => {
          autoFilterHandle = ref.current;
        });

        return <AutoFilter filter={filter} ref={ref} />;
      }

      render(<TestWrapper />);

      expect(autoFilterHandle).not.toBeNull();
      const handle = autoFilterHandle!;

      const originalParams = handle.getParams();

      // Update only a few parameters
      const partialUpdate: AutoFilterParams = {
        ...originalParams,
        baseFrequency: 1000,
        wet: 0.5,
      };

      act(() => {
        handle.setParams(partialUpdate);
      });

      await waitFor(() => {
        const updatedParams = handle.getParams();
        expect(updatedParams?.baseFrequency).toBe(1000);
        expect(updatedParams?.wet).toBe(0.5);
        // Other params should remain unchanged
        expect(updatedParams?.depth).toBe(1);
        expect(updatedParams?.frequency).toBe(4);
      });
    });

    it("should handle multiple setParams calls", async () => {
      let autoFilterHandle: AutoFilterHandle | null = null;

      function TestWrapper() {
        const ref = useRef<AutoFilterHandle>(null);

        useEffect(() => {
          autoFilterHandle = ref.current;
        });

        return <AutoFilter filter={filter} ref={ref} />;
      }

      render(<TestWrapper />);

      expect(autoFilterHandle).not.toBeNull();
      const handle = autoFilterHandle!;

      // First update
      act(() => {
        handle.setParams({
          baseFrequency: 500,
          depth: 0.5,
          frequency: 2,
          rolloff: -24,
          Q: 3,
          wet: 0.7,
          type: "lowpass",
          oscillatorType: "square",
        });
      });

      // Second update
      act(() => {
        handle.setParams({
          baseFrequency: 800,
          depth: 0.8,
          frequency: 6,
          rolloff: -48,
          Q: 5,
          wet: 0.9,
          type: "bandpass",
          oscillatorType: "triangle",
        });
      });

      await waitFor(() => {
        const finalParams = handle.getParams();
        expect(finalParams?.baseFrequency).toBe(800);
        expect(finalParams?.type).toBe("bandpass");
        expect(finalParams?.oscillatorType).toBe("triangle");
      });
    });
  });
});
