import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, act, waitFor } from "@testing-library/react";
import { useRef, useEffect } from "react";
import * as Tone from "tone";
import BitCrusher from "./BitCrusher";
import { BitCrusherHandle, BitCrusherParams } from "../types/BitCrusherParams";

// Mock Tone.js
vi.mock("tone", () => {
  const mockSet = vi.fn();

  return {
    BitCrusher: vi.fn().mockImplementation(() => ({
      set: mockSet,
      dispose: vi.fn(),
    })),
  };
});

describe("BitCrusher", () => {
  let bitCrusher: React.RefObject<Tone.BitCrusher>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Create a fresh mocked Tone.BitCrusher for each test
    bitCrusher = {
      current: new Tone.BitCrusher() as unknown as Tone.BitCrusher,
    };
  });

  describe("useImperativeHandle", () => {
    it("should expose getParams method that returns current parameters", () => {
      let bitCrusherHandle: BitCrusherHandle | null = null;

      // Test component that captures the ref
      function TestWrapper() {
        const ref = useRef<BitCrusherHandle>(null);

        // Capture the ref after mount
        useEffect(() => {
          bitCrusherHandle = ref.current;
        });

        return <BitCrusher bitCrusher={bitCrusher} ref={ref} />;
      }

      render(<TestWrapper />);

      // Should have access to the handle
      expect(bitCrusherHandle).not.toBeNull();

      // Type assertion after null check - safe because we just verified it's not null
      const handle = bitCrusherHandle!;

      expect(handle.getParams).toBeDefined();

      // Should return default parameters
      const params = handle.getParams();
      expect(params).toEqual({
        bits: 5,
        wet: 0,
      });
    });

    it("should expose setParams method that updates all parameters", async () => {
      let bitCrusherHandle: BitCrusherHandle | null = null;

      function TestWrapper() {
        const ref = useRef<BitCrusherHandle>(null);

        useEffect(() => {
          bitCrusherHandle = ref.current;
        });

        return <BitCrusher bitCrusher={bitCrusher} ref={ref} />;
      }

      render(<TestWrapper />);

      expect(bitCrusherHandle).not.toBeNull();
      const handle = bitCrusherHandle!;

      const newParams: BitCrusherParams = {
        bits: 8,
        wet: 0.75,
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
      let bitCrusherHandle: BitCrusherHandle | null = null;

      function TestWrapper() {
        const ref = useRef<BitCrusherHandle>(null);

        useEffect(() => {
          bitCrusherHandle = ref.current;
        });

        return <BitCrusher bitCrusher={bitCrusher} ref={ref} />;
      }

      render(<TestWrapper />);

      expect(bitCrusherHandle).not.toBeNull();
      const handle = bitCrusherHandle!;

      const originalParams = handle.getParams();

      // Update only bits
      const partialUpdate: BitCrusherParams = {
        ...originalParams,
        bits: 3,
      };

      act(() => {
        handle.setParams(partialUpdate);
      });

      await waitFor(() => {
        const updatedParams = handle.getParams();
        expect(updatedParams?.bits).toBe(3);
        // wet should remain unchanged
        expect(updatedParams?.wet).toBe(0);
      });
    });

    it("should handle multiple setParams calls", async () => {
      let bitCrusherHandle: BitCrusherHandle | null = null;

      function TestWrapper() {
        const ref = useRef<BitCrusherHandle>(null);

        useEffect(() => {
          bitCrusherHandle = ref.current;
        });

        return <BitCrusher bitCrusher={bitCrusher} ref={ref} />;
      }

      render(<TestWrapper />);

      expect(bitCrusherHandle).not.toBeNull();
      const handle = bitCrusherHandle!;

      // First update
      act(() => {
        handle.setParams({
          bits: 4,
          wet: 0.5,
        });
      });

      // Second update
      act(() => {
        handle.setParams({
          bits: 7,
          wet: 0.9,
        });
      });

      await waitFor(() => {
        const finalParams = handle.getParams();
        expect(finalParams?.bits).toBe(7);
        expect(finalParams?.wet).toBe(0.9);
      });
    });
  });
});
