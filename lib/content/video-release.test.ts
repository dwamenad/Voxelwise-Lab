import { describe, expect, it } from "vitest";
import releaseLedger from "@/production/metadata/video-release.json";
import { getLesson } from "@/lib/content/catalog";

describe("video release ledger", () => {
  it("maps all 32 production videos to real lessons and video blocks", () => {
    expect(releaseLedger.videos).toHaveLength(32);

    for (const video of releaseLedger.videos) {
      const result = getLesson(video.courseSlug, video.lessonSlug);
      expect(result, `${video.id} lesson mapping`).toBeDefined();
      const videoBlocks = result?.lesson.blocks.filter((block) => block.type === "video") ?? [];

      if (video.slug === "reviewing-complete-feat-report") {
        expect(videoBlocks.some((block) => block.title === "Reviewing a complete FEAT report")).toBe(true);
      } else {
        expect(videoBlocks[0], `${video.id} primary video block`).toBeDefined();
      }
    }
  });

  it("has unique production ids and exactly 19 concepts plus 13 walkthroughs", () => {
    expect(new Set(releaseLedger.videos.map((video) => video.id)).size).toBe(32);
    expect(releaseLedger.videos.filter((video) => video.kind === "concept")).toHaveLength(19);
    expect(releaseLedger.videos.filter((video) => video.kind === "walkthrough")).toHaveLength(13);
  });

  it("keeps lesson production labels synchronized with the release state", () => {
    for (const video of releaseLedger.videos) {
      const result = getLesson(video.courseSlug, video.lessonSlug);
      const blocks = result?.lesson.blocks.filter((block) => block.type === "video") ?? [];
      const block = video.slug === "reviewing-complete-feat-report"
        ? blocks.find((item) => item.title === "Reviewing a complete FEAT report")
        : blocks[0];
      const expected = video.state === "planned"
        ? "planned"
        : video.state === "published"
          ? "published"
          : "recorded";
      expect(block?.status, video.id).toBe(expected);
      if (video.state !== "published") expect(block?.provider, video.id).toBe("external");
    }
  });
});
