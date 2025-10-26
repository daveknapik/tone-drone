import { describe, it, expect } from "vitest";
import { randomizePattern, clearPattern } from "./patternUtils";

describe("patternUtils", () => {
  describe("clearPattern", () => {
    it("should return array of false values with correct length", () => {
      const result = clearPattern(16);
      expect(result).toHaveLength(16);
      expect(result.every((step) => step === false)).toBe(true);
    });

    it("should handle different step counts", () => {
      const result8 = clearPattern(8);
      expect(result8).toHaveLength(8);
      expect(result8.every((step) => step === false)).toBe(true);

      const result32 = clearPattern(32);
      expect(result32).toHaveLength(32);
      expect(result32.every((step) => step === false)).toBe(true);
    });

    it("should handle edge case of 0 steps", () => {
      const result = clearPattern(0);
      expect(result).toHaveLength(0);
    });
  });

  describe("randomizePattern", () => {
    it("should return array with correct length", () => {
      const result = randomizePattern(16, 50);
      expect(result).toHaveLength(16);
    });

    it("should return all booleans", () => {
      const result = randomizePattern(16, 50);
      result.forEach((step) => {
        expect(typeof step).toBe("boolean");
      });
    });

    it("should return all false for 0% density", () => {
      const result = randomizePattern(16, 0);
      expect(result.every((step) => step === false)).toBe(true);
    });

    it("should return all true for 100% density", () => {
      const result = randomizePattern(16, 100);
      expect(result.every((step) => step === true)).toBe(true);
    });

    it("should handle density values below 0 (clamp to 0)", () => {
      const result = randomizePattern(16, -10);
      expect(result.every((step) => step === false)).toBe(true);
    });

    it("should handle density values above 100 (clamp to 100)", () => {
      const result = randomizePattern(16, 150);
      expect(result.every((step) => step === true)).toBe(true);
    });

    it("should produce roughly correct distribution for 50% density", () => {
      // Run multiple times to get statistical average
      const iterations = 100;
      const stepCount = 16;
      let totalActiveSteps = 0;

      for (let i = 0; i < iterations; i++) {
        const result = randomizePattern(stepCount, 50);
        totalActiveSteps += result.filter((step) => step).length;
      }

      const averageActiveSteps = totalActiveSteps / iterations;
      // With 50% density, we expect ~8 active steps on average
      // Allow for statistical variance (between 6 and 10)
      expect(averageActiveSteps).toBeGreaterThan(6);
      expect(averageActiveSteps).toBeLessThan(10);
    });

    it("should produce roughly correct distribution for 25% density", () => {
      const iterations = 100;
      const stepCount = 16;
      let totalActiveSteps = 0;

      for (let i = 0; i < iterations; i++) {
        const result = randomizePattern(stepCount, 25);
        totalActiveSteps += result.filter((step) => step).length;
      }

      const averageActiveSteps = totalActiveSteps / iterations;
      // With 25% density, we expect ~4 active steps on average
      // Allow for statistical variance (between 2 and 6)
      expect(averageActiveSteps).toBeGreaterThan(2);
      expect(averageActiveSteps).toBeLessThan(6);
    });

    it("should produce roughly correct distribution for 75% density", () => {
      const iterations = 100;
      const stepCount = 16;
      let totalActiveSteps = 0;

      for (let i = 0; i < iterations; i++) {
        const result = randomizePattern(stepCount, 75);
        totalActiveSteps += result.filter((step) => step).length;
      }

      const averageActiveSteps = totalActiveSteps / iterations;
      // With 75% density, we expect ~12 active steps on average
      // Allow for statistical variance (between 10 and 14)
      expect(averageActiveSteps).toBeGreaterThan(10);
      expect(averageActiveSteps).toBeLessThan(14);
    });

    it("should generate different patterns on multiple calls", () => {
      const result1 = randomizePattern(16, 50);
      const result2 = randomizePattern(16, 50);

      // Extremely unlikely to be identical
      const identical = JSON.stringify(result1) === JSON.stringify(result2);

      // This test might occasionally fail due to randomness, but it's very unlikely
      expect(identical).toBe(false);
    });

    it("should handle different step counts", () => {
      const result8 = randomizePattern(8, 50);
      expect(result8).toHaveLength(8);

      const result32 = randomizePattern(32, 50);
      expect(result32).toHaveLength(32);
    });

    it("should handle edge case of 1 step", () => {
      // With 1 step at 50% density, should be randomly true or false
      const results = [];
      for (let i = 0; i < 20; i++) {
        results.push(randomizePattern(1, 50)[0]);
      }

      // Should have at least one true and one false (with 20 iterations, extremely likely)
      const hasTrue = results.some((r) => r === true);
      const hasFalse = results.some((r) => r === false);

      expect(hasTrue).toBe(true);
      expect(hasFalse).toBe(true);
    });

    it("should handle edge case of 0 steps", () => {
      const result = randomizePattern(0, 50);
      expect(result).toHaveLength(0);
    });

    it("should handle decimal density values", () => {
      const result = randomizePattern(16, 33.3);
      expect(result).toHaveLength(16);
      result.forEach((step) => {
        expect(typeof step).toBe("boolean");
      });
    });
  });
});
