import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, act, waitFor } from "@testing-library/react";
import { useRef, useEffect } from "react";
import * as Tone from "tone";
import Filter from "./Filter";
import { FilterHandle, FilterParams } from "../types/FilterParams";

// Mock Tone.js
vi.mock("tone", () => {
  const mockSet = vi.fn();

  return {
    Filter: vi.fn().mockImplementation(() => ({
      set: mockSet,
      rolloff: -12,
      dispose: vi.fn(),
    })),
  };
});

describe("Filter", () => {
  let filter: React.RefObject<Tone.Filter>;

  beforeEach(() => {
    vi.clearAllMocks();
    filter = {
      current: new Tone.Filter() as unknown as Tone.Filter,
    };
  });

  describe("useImperativeHandle", () => {
    it("should expose getParams method that returns current parameters", () => {
      let filterHandle: FilterHandle | null = null;

      function TestWrapper() {
        const ref = useRef<FilterHandle>(null);

        useEffect(() => {
          filterHandle = ref.current;
        });

        return <Filter filter={filter} ref={ref} />;
      }

      render(<TestWrapper />);

      expect(filterHandle).not.toBeNull();
      const handle = filterHandle!;

      expect(handle.getParams).toBeDefined();

      const params = handle.getParams();
      expect(params).toEqual({
        frequency: 300,
        rolloff: -12,
        Q: 1,
        type: "highpass",
      });
    });

    it("should expose setParams method that updates all parameters", async () => {
      let filterHandle: FilterHandle | null = null;

      function TestWrapper() {
        const ref = useRef<FilterHandle>(null);

        useEffect(() => {
          filterHandle = ref.current;
        });

        return <Filter filter={filter} ref={ref} />;
      }

      render(<TestWrapper />);

      expect(filterHandle).not.toBeNull();
      const handle = filterHandle!;

      const newParams: FilterParams = {
        frequency: 1000,
        rolloff: -24,
        Q: 5,
        type: "lowpass",
      };

      act(() => {
        handle.setParams(newParams);
      });

      await waitFor(() => {
        const updatedParams = handle.getParams();
        expect(updatedParams).toEqual(newParams);
      });
    });

    it("should allow partial parameter updates", async () => {
      let filterHandle: FilterHandle | null = null;

      function TestWrapper() {
        const ref = useRef<FilterHandle>(null);

        useEffect(() => {
          filterHandle = ref.current;
        });

        return <Filter filter={filter} ref={ref} />;
      }

      render(<TestWrapper />);

      expect(filterHandle).not.toBeNull();
      const handle = filterHandle!;

      const originalParams = handle.getParams();

      const partialUpdate: FilterParams = {
        ...originalParams,
        frequency: 5000,
        type: "bandpass",
      };

      act(() => {
        handle.setParams(partialUpdate);
      });

      await waitFor(() => {
        const updatedParams = handle.getParams();
        expect(updatedParams?.frequency).toBe(5000);
        expect(updatedParams?.type).toBe("bandpass");
        expect(updatedParams?.rolloff).toBe(-12);
        expect(updatedParams?.Q).toBe(1);
      });
    });

    it("should handle multiple setParams calls", async () => {
      let filterHandle: FilterHandle | null = null;

      function TestWrapper() {
        const ref = useRef<FilterHandle>(null);

        useEffect(() => {
          filterHandle = ref.current;
        });

        return <Filter filter={filter} ref={ref} />;
      }

      render(<TestWrapper />);

      expect(filterHandle).not.toBeNull();
      const handle = filterHandle!;

      act(() => {
        handle.setParams({
          frequency: 500,
          rolloff: -48,
          Q: 3,
          type: "lowpass",
        });
      });

      act(() => {
        handle.setParams({
          frequency: 2000,
          rolloff: -96,
          Q: 7,
          type: "notch",
        });
      });

      await waitFor(() => {
        const finalParams = handle.getParams();
        expect(finalParams?.frequency).toBe(2000);
        expect(finalParams?.rolloff).toBe(-96);
        expect(finalParams?.Q).toBe(7);
        expect(finalParams?.type).toBe("notch");
      });
    });
  });
});
