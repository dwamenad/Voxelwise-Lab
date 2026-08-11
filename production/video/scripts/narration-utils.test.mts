import { describe, expect, it } from "vitest";
import { splitCaptionCues } from "./narration-utils.mjs";

describe("splitCaptionCues", () => {
  it("limits every caption cue to two 42-character lines", () => {
    const cues = splitCaptionCues(
      "A valid caption sentence should remain readable while being divided into bounded subtitle cues.",
    );

    for (const cue of cues) {
      const lines = cue.split("\n");
      expect(lines.length).toBeLessThanOrEqual(2);
      expect(lines.every((line) => line.length <= 42)).toBe(true);
    }
  });

  it("splits long paths without exceeding the caption limit", () => {
    const path = "`/home/jovyan/Voxelwise-Walkthroughs/outputs/sub-10015_sharedreward_mb3me1_L1`.";
    const cues = splitCaptionCues(`Set the output path to ${path}`);

    expect(cues.length).toBeGreaterThan(1);
    expect(cues.flatMap((cue) => cue.split("\n")).every((line) => line.length <= 42)).toBe(true);
    expect(cues.join("\n").replace(/\n/g, "").replace("Set the output path to", "").trim()).toBe(path);
  });

  it("keeps decimal values and dotted filenames intact", () => {
    const cues = splitCaptionCues(
      "The repetition time is 1.7 seconds. Select sub-10015_task-sharedreward_bold.nii.gz.",
    );

    expect(cues.join(" ").replaceAll("\n", " ")).toContain("1.7 seconds.");
    expect(cues.join(" ").replaceAll("\n", " ")).toContain(
      "sub-10015_task-sharedreward_bold.nii.gz.",
    );
  });
});
