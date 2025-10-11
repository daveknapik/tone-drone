import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, act, waitFor } from "@testing-library/react";
import { useRef, useEffect } from "react";
import * as Tone from "tone";
import Chebyshev from "./Chebyshev";
import { ChebyshevHandle, ChebyshevParams } from "../types/ChebyshevParams";

// Mock Tone.js
vi.mock("tone", () => {
  const mockSet = vi.fn();

  return {
    Chebyshev: vi.fn().mockImplementation(() => ({
      set: mockSet,
      dispose: vi.fn(),
    })),
  };
});

describe("Chebyshev", () => {
  let chebyshev: React.RefObject<Tone.Chebyshev>;

  beforeEach(() => {
    vi.clearAllMocks();
    chebyshev = {
      current: new Tone.Chebyshev() as unknown as Tone.Chebyshev,
    };
  });

  describe("useImperativeHandle", () => {
    it("should expose getParams method that returns current parameters", () => {
      let chebyshevHandle: ChebyshevHandle | null = null;

      function TestWrapper() {
        const ref = useRef<ChebyshevHandle>(null);

        useEffect(() => {
          chebyshevHandle = ref.current;
        });

        return <Chebyshev chebyshev={chebyshev} ref={ref} />;
      }

      render(<TestWrapper />);

      expect(chebyshevHandle).not.toBeNull();
      const handle = chebyshevHandle!;

      expect(handle.getParams).toBeDefined();

      const params = handle.getParams();
      expect(params).toEqual({
        order: 1,
        wet: 0,
      });
    });

    it("should expose setParams method that updates all parameters", async () => {
      let chebyshevHandle: ChebyshevHandle | null = null;

      function TestWrapper() {
        const ref = useRef<ChebyshevHandle>(null);

        useEffect(() => {
          chebyshevHandle = ref.current;
        });

        return <Chebyshev chebyshev={chebyshev} ref={ref} />;
      }

      render(<TestWrapper />);

      expect(chebyshevHandle).not.toBeNull();
      const handle = chebyshevHandle!;

      const newParams: ChebyshevParams = {
        order: 50,
        wet: 0.8,
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
      let chebyshevHandle: ChebyshevHandle | null = null;

      function TestWrapper() {
        const ref = useRef<ChebyshevHandle>(null);

        useEffect(() => {
          chebyshevHandle = ref.current;
        });

        return <Chebyshev chebyshev={chebyshev} ref={ref} />;
      }

      render(<TestWrapper />);

      expect(chebyshevHandle).not.toBeNull();
      const handle = chebyshevHandle!;

      const originalParams = handle.getParams();

      const partialUpdate: ChebyshevParams = {
        ...originalParams,
        order: 75,
      };

      act(() => {
        handle.setParams(partialUpdate);
      });

      await waitFor(() => {
        const updatedParams = handle.getParams();
        expect(updatedParams?.order).toBe(75);
        expect(updatedParams?.wet).toBe(0);
      });
    });

    it("should handle multiple setParams calls", async () => {
      let chebyshevHandle: ChebyshevHandle | null = null;

      function TestWrapper() {
        const ref = useRef<ChebyshevHandle>(null);

        useEffect(() => {
          chebyshevHandle = ref.current;
        });

        return <Chebyshev chebyshev={chebyshev} ref={ref} />;
      }

      render(<TestWrapper />);

      expect(chebyshevHandle).not.toBeNull();
      const handle = chebyshevHandle!;

      act(() => {
        handle.setParams({
          order: 25,
          wet: 0.5,
        });
      });

      act(() => {
        handle.setParams({
          order: 90,
          wet: 1.0,
        });
      });

      await waitFor(() => {
        const finalParams = handle.getParams();
        expect(finalParams?.order).toBe(90);
        expect(finalParams?.wet).toBe(1.0);
      });
    });
  });
});
