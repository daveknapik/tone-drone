import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, act, waitFor } from "@testing-library/react";
import { useRef, useEffect } from "react";
import * as Tone from "tone";
import Delay from "./Delay";
import { DelayHandle, DelayParams } from "../types/DelayParams";

// Mock Tone.js
vi.mock("tone", () => {
  const mockSet = vi.fn();

  return {
    FeedbackDelay: vi.fn().mockImplementation(() => ({
      set: mockSet,
      dispose: vi.fn(),
    })),
  };
});

describe("Delay", () => {
  let delay: React.RefObject<Tone.FeedbackDelay>;

  beforeEach(() => {
    vi.clearAllMocks();
    delay = {
      current: new Tone.FeedbackDelay() as unknown as Tone.FeedbackDelay,
    };
  });

  describe("useImperativeHandle", () => {
    it("should expose getParams method that returns current parameters", () => {
      let delayHandle: DelayHandle | null = null;

      function TestWrapper() {
        const ref = useRef<DelayHandle>(null);

        useEffect(() => {
          delayHandle = ref.current;
        });

        return <Delay delay={delay} ref={ref} />;
      }

      render(<TestWrapper />);

      expect(delayHandle).not.toBeNull();
      const handle = delayHandle!;

      expect(handle.getParams).toBeDefined();

      const params = handle.getParams();
      expect(params).toEqual({
        time: 1,
        feedback: 0.95,
        wet: 0,
      });
    });

    it("should expose setParams method that updates all parameters", async () => {
      let delayHandle: DelayHandle | null = null;

      function TestWrapper() {
        const ref = useRef<DelayHandle>(null);

        useEffect(() => {
          delayHandle = ref.current;
        });

        return <Delay delay={delay} ref={ref} />;
      }

      render(<TestWrapper />);

      expect(delayHandle).not.toBeNull();
      const handle = delayHandle!;

      const newParams: DelayParams = {
        time: 5.5,
        feedback: 0.7,
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
      let delayHandle: DelayHandle | null = null;

      function TestWrapper() {
        const ref = useRef<DelayHandle>(null);

        useEffect(() => {
          delayHandle = ref.current;
        });

        return <Delay delay={delay} ref={ref} />;
      }

      render(<TestWrapper />);

      expect(delayHandle).not.toBeNull();
      const handle = delayHandle!;

      const originalParams = handle.getParams();

      const partialUpdate: DelayParams = {
        ...originalParams,
        time: 3.2,
      };

      act(() => {
        handle.setParams(partialUpdate);
      });

      await waitFor(() => {
        const updatedParams = handle.getParams();
        expect(updatedParams?.time).toBe(3.2);
        expect(updatedParams?.feedback).toBe(0.95);
        expect(updatedParams?.wet).toBe(0);
      });
    });

    it("should handle multiple setParams calls", async () => {
      let delayHandle: DelayHandle | null = null;

      function TestWrapper() {
        const ref = useRef<DelayHandle>(null);

        useEffect(() => {
          delayHandle = ref.current;
        });

        return <Delay delay={delay} ref={ref} />;
      }

      render(<TestWrapper />);

      expect(delayHandle).not.toBeNull();
      const handle = delayHandle!;

      act(() => {
        handle.setParams({
          time: 2.5,
          feedback: 0.6,
          wet: 0.4,
        });
      });

      act(() => {
        handle.setParams({
          time: 7.8,
          feedback: 0.85,
          wet: 0.9,
        });
      });

      await waitFor(() => {
        const finalParams = handle.getParams();
        expect(finalParams?.time).toBe(7.8);
        expect(finalParams?.feedback).toBe(0.85);
        expect(finalParams?.wet).toBe(0.9);
      });
    });
  });
});
