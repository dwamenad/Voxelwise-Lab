import { describe, expect, it } from "vitest";
import { analyzeDesign, isContrastEstimable } from "./design-matrix";

describe("contrast estimability", () => {
  it("rejects a contrast that needs an absent task EV", () => {
    const design = analyzeDesign([[0, 0, 0], [0, 1, 2]]);
    expect(design.rank).toBe(1);
    expect(isContrastEstimable([1, -1], design)).toBe(false);
    expect(isContrastEstimable([0, 1], design)).toBe(true);
  });
  it("allows a sum but rejects a difference of identical columns", () => {
    const design = analyzeDesign([[1, 2, 3], [1, 2, 3]]);
    expect(design.rank).toBe(1);
    expect(isContrastEstimable([1, 1], design)).toBe(true);
    expect(isContrastEstimable([1, -1], design)).toBe(false);
  });
  it("handles proportional EVs with different amplitudes", () => {
    const design = analyzeDesign([[1, 2, 3], [2, 4, 6]]);
    expect(isContrastEstimable([1, 2], design)).toBe(true);
    expect(isContrastEstimable([1, 1], design)).toBe(false);
  });
  it("accepts independent EV contrasts and rejects zero or invalid weights", () => {
    const design = analyzeDesign([[1, 0, 1], [0, 1, 1]]);
    expect(design.rank).toBe(2);
    expect(isContrastEstimable([1, -1], design)).toBe(true);
    expect(isContrastEstimable([0, 0], design)).toBe(false);
    expect(isContrastEstimable([NaN, 1], design)).toBe(false);
  });
});
