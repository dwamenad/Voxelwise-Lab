// @vitest-environment node
import { expect, it } from "vitest";
import { splitCaptionCues } from "./narration-utils.mjs";

it("keeps decimal BET thresholds intact across sentence captions", () => {
  expect(splitCaptionCues("Start with fractional intensity 0.5. Try 0.3 if needed."))
    .toEqual(["Start with fractional intensity 0.5.", "Try 0.3 if needed."]);
});

it("preserves punctuation and bounds long narration cues", () => {
  const text = "Compare -f 0.3, -f 0.5, and -f 0.7 carefully before accepting your brain mask. Inspect all three planes!";
  const cues = splitCaptionCues(text);
  expect(cues.join(" ").replaceAll("\n", " ")).toBe(text);
  for (const cue of cues) {
    expect(cue.split("\n").length).toBeLessThanOrEqual(2);
    for (const line of cue.split("\n")) expect(line.length).toBeLessThanOrEqual(42);
  }
});
